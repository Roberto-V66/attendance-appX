// src/lib/stores/attendeeStore.js
import { writable } from 'svelte/store';
import { db } from  '$lib/firebase/firebase.js'; // Adjusted path based on common structure
import {
    collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
    Timestamp, query, orderBy, writeBatch, getDocs // getDocs still needed for replaceAll in import
} from 'firebase/firestore';

const attendeesCollection = collection(db, 'attendees');

function createAttendeesStore() {
    const store = writable({
        data: [],
        loading: true, // Start in loading state
        error: null,
        initialized: false // Tracks if the first data load attempt has completed
    });

    let unsubscribeSnapshotListener = null;

    function initializeStore() {
        store.update(s => ({ ...s, loading: true, error: null }));

        const q = query(attendeesCollection, orderBy('name'));
        
        if (unsubscribeSnapshotListener) {
            unsubscribeSnapshotListener(); // Unsubscribe from previous listener if any
        }
        
        unsubscribeSnapshotListener = onSnapshot(q, (snapshot) => {
            const attendeesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            store.set({ data: attendeesData, loading: false, error: null, initialized: true });
            console.log(`Firestore snapshot: Successfully loaded/updated ${attendeesData.length} attendees (from cache or server).`);
        }, (err) => {
            console.error("Error in Firestore real-time listener:", err);
            // Firebase SDK will attempt to reconnect and resync automatically.
            // We just update the store's error state for UI feedback.
            store.update(s => ({ ...s, loading: false, error: `Error loading attendees: ${err.message}`, initialized: true }));
        });
    }
    
    initializeStore(); // Initialize on store creation

    // --- Validation Function (remains the same) ---
    function validateAttendeeData(data, _isUpdate = false) { // isUpdate not really used here now
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            throw new Error("Attendee name is required and cannot be empty.");
        }
        
        const isNewValue = data['Are you new?']; // Handle potential string 'Are you new?' key
        const hasMentorValue = data['Do you have a mentor?'];

        const validated = {
            name: data.name.trim(),
            phone: data.phone ? String(data.phone).trim() : '',
            location: data.location ? String(data.location).trim() : '',
            ageGroup: data.ageGroup ? String(data.ageGroup).trim() : '',
            isNew: typeof data.isNew === 'boolean' ? data.isNew : (
                typeof isNewValue !== 'undefined' ? (String(isNewValue).toLowerCase() === 'yes' || String(isNewValue).toLowerCase() === 'true') : false
            ),
            hasMentor: typeof data.hasMentor === 'boolean' ? data.hasMentor : (
                typeof hasMentorValue !== 'undefined' ? (String(hasMentorValue).toLowerCase() === 'yes' || String(hasMentorValue).toLowerCase() === 'true') : false
            ),
            present: typeof data.present === 'boolean' ? data.present : false,
            lastUpdated: Timestamp.now()
        };
        
        // For new attendees, ensure `present` defaults to false if not specified explicitly
        if (typeof data.present === 'undefined' && !_isUpdate) {
            validated.present = false;
        }
        return validated;
    }

    // --- CRUD Operations (remain largely the same, Firebase handles offline queueing) ---
    async function addAttendee(attendeeData) {
        try {
            const validatedData = validateAttendeeData(attendeeData);
            const docRef = await addDoc(attendeesCollection, validatedData);
            // Store automatically updates via onSnapshot listener
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error adding attendee:", error);
            throw error; 
        }
    }

    async function updateAttendee(id, updatedData) {
        try {
            if (!id) throw new Error("Invalid attendee ID for update.");
            
            const dataToUpdate = validateAttendeeData({ ...updatedData }, true); 
            // delete dataToUpdate.id; // Not strictly necessary if not in validatedData, but good practice

            const attendeeRef = doc(db, 'attendees', id);
            await updateDoc(attendeeRef, dataToUpdate);
            return { success: true };
        } catch (error) {
            console.error("Error updating attendee:", error);
            throw error;
        }
    }

    async function deleteAttendee(id) {
        try {
            if (!id) throw new Error("Invalid attendee ID for deletion.");
            const attendeeRef = doc(db, 'attendees', id);
            await deleteDoc(attendeeRef);
            return { success: true };
        } catch (error) {
            console.error("Error deleting attendee:", error);
            throw error;
        }
    }

    async function togglePresent(id, currentStatus) {
        try {
            if (!id) throw new Error("Invalid attendee ID for toggle.");
            const attendeeRef = doc(db, 'attendees', id);
            await updateDoc(attendeeRef, {
                present: !currentStatus,
                lastUpdated: Timestamp.now()
            });
            return { success: true, newStatus: !currentStatus };
        } catch (error) {
            console.error("Error toggling attendance:", error);
            throw error;
        }
    }

    // --- Import from Excel (remains largely the same) ---
    async function importFromExcel(data, replaceAll = false, progressCallback = null) {
        if (!Array.isArray(data) || data.length === 0) {
            return { success: false, message: "No valid data found in Excel file." };
        }

        const notifyProgress = (phase, message, current, total) => {
            if (progressCallback) {
                progressCallback({ phase, message, progress: total > 0 ? current / total : 0 });
            }
        };

        try {
            if (replaceAll) {
                notifyProgress('deleting', 'Preparing to delete existing data...', 0, 1);
                // Fetch all documents to delete. This still needs getDocs.
                const snapshot = await getDocs(query(attendeesCollection)); 
                const totalDocsToDelete = snapshot.docs.length;
                let deletedCount = 0;

                if (totalDocsToDelete > 0) {
                    const MAX_BATCH_SIZE = 500; 
                    let batch = writeBatch(db);
                    let currentBatchSize = 0;

                    for (let i = 0; i < snapshot.docs.length; i++) {
                        batch.delete(snapshot.docs[i].ref);
                        currentBatchSize++;
                        deletedCount++;
                        if (currentBatchSize === MAX_BATCH_SIZE || i === snapshot.docs.length - 1) {
                            await batch.commit(); // These commits will be queued offline if needed
                            notifyProgress('deleting', `Deleting existing data... (${deletedCount}/${totalDocsToDelete})`, deletedCount, totalDocsToDelete);
                            if (i < snapshot.docs.length - 1) {
                                batch = writeBatch(db);
                                currentBatchSize = 0;
                            }
                        }
                    }
                }
                notifyProgress('deleting', 'All existing data deleted.', 1, 1);
            }
            
            notifyProgress('importing', 'Starting import process...', 0, data.length);
            let successCount = 0;
            let errorCount = 0;
            const errors = [];

            const MAX_BATCH_SIZE = 500;
            let importBatch = writeBatch(db);
            let currentImportBatchSize = 0;

            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                if (!item || !item.Name || String(item.Name).trim() === '') {
                    errorCount++;
                    errors.push(`Row ${i+2}: Skipped due to missing Name.`);
                    continue;
                }
                
                try {
                    const validatedData = validateAttendeeData({
                        name: item['Name'],
                        phone: item['Phone'],
                        location: item['Location'],
                        ageGroup: item['Age Group'],
                        'Are you new?': item['Are you new?'],
                        'Do you have a mentor?': item['Do you have a mentor?'],
                        present: false, 
                    });
                    
                    const newDocRef = doc(attendeesCollection); 
                    importBatch.set(newDocRef, validatedData);
                    currentImportBatchSize++;
                    successCount++;
                    
                    if (currentImportBatchSize === MAX_BATCH_SIZE || i === data.length - 1) {
                        await importBatch.commit(); // These commits will be queued offline
                        notifyProgress('importing', `Importing data... (${successCount}/${data.length})`, successCount, data.length);
                        if (i < data.length - 1) {
                            importBatch = writeBatch(db);
                            currentImportBatchSize = 0;
                        }
                    }
                } catch (validationError) {
                    console.error(`Validation error for row ${i+2}:`, validationError, item);
                    errorCount++;
                    errors.push(`Row ${i+2} (${item.Name || 'N/A'}): ${validationError.message}`);
                }
            }
            
            let message = `Import completed: ${successCount} records imported successfully.`;
            if (errorCount > 0) {
                message += ` ${errorCount} records failed or were skipped.`;
                 if (errors.length > 0) console.warn("Import errors:", errors.slice(0,10).join("\n") + (errors.length > 10 ? "\n...and more." : ""));
            }
            return { success: true, message, errors };

        } catch (error) {
            console.error("Error during Excel import process:", error);
            notifyProgress('error', `Import failed: ${error.message}`, 1, 1);
            return { success: false, message: `Import failed: ${error.message || "Unknown error during import."}` };
        }
    }

    async function refreshData() {
        // This function might not be strictly necessary if the listener is robust.
        // However, it can be used to manually re-trigger the listener setup if needed,
        // or to clear a persistent error state in the UI.
        console.log("Manual data refresh triggered.");
        // The listener will automatically try to get data. 
        // If there was an error, this ensures `loading` is true again and `error` is cleared.
        initializeStore(); 
    }

    return {
        subscribe: store.subscribe,
        addAttendee,
        updateAttendee,
        deleteAttendee,
        togglePresent,
        importFromExcel,
        refreshData,
        destroy: () => { 
            if (unsubscribeSnapshotListener) {
                unsubscribeSnapshotListener();
                unsubscribeSnapshotListener = null;
                console.log("Attendee store snapshot listener destroyed.");
            }
        }
    };
}

export const attendees = createAttendeesStore();