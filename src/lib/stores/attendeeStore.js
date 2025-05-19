// src/lib/stores/attendeeStore.js
import { writable } from 'svelte/store';
import { db } from '$lib/firebase/firebase.js'; // Ensure this path is correct
import {
    collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc,
    Timestamp, query, orderBy, getDocs, writeBatch, getDoc
} from 'firebase/firestore';
// Removed toast import from here, let components handle UI feedback based on store state/method results

const attendeesCollection = collection(db, 'attendees');

function createAttendeesStore() {
    const store = writable({
        data: [],
        loading: true,
        error: null,
        initialized: false // Tracks if the first load attempt (success or fail) has completed
    });

    let unsubscribeSnapshotListener = null;
    let retryCount = 0;
    const MAX_RETRIES = 3;
    const RETRY_DELAY_MS = 2000;

    async function initializeStore(isRetry = false) {
        if (!isRetry) {
            store.update(s => ({ ...s, loading: true, error: null }));
        }

        try {
            const q = query(attendeesCollection, orderBy('name'));
            
            if (unsubscribeSnapshotListener) {
                unsubscribeSnapshotListener();
            }
            
            unsubscribeSnapshotListener = onSnapshot(q, (snapshot) => {
                const attendeesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
                store.set({ data: attendeesData, loading: false, error: null, initialized: true });
                retryCount = 0;
                console.log(`Firestore snapshot: Successfully loaded/updated ${attendeesData.length} attendees.`);
            }, (err) => {
                console.error("Error in Firestore real-time listener:", err);
                if (retryCount < MAX_RETRIES) {
                    retryCount++;
                    console.log(`Retrying connection (${retryCount}/${MAX_RETRIES}) in ${RETRY_DELAY_MS * retryCount / 1000}s...`);
                    setTimeout(() => initializeStore(true), RETRY_DELAY_MS * retryCount); // Exponential backoff
                } else {
                    console.error("Real-time connection failed after retries. Falling back to one-time fetch.");
                    store.update(s => ({ ...s, error: `Real-time updates failed: ${err.message}. Attempting one-time load.`}));
                    fallbackFetch(); // Fallback if listener repeatedly fails
                }
            });
        } catch (err) {
            console.error("Failed to set up Firestore real-time listener:", err);
            store.update(s => ({ ...s, loading: false, error: `Listener setup failed: ${err.message}. Attempting one-time load.`, initialized: true }));
            fallbackFetch(); // Attempt fallback if listener setup itself fails
        }
    }
    
    async function fallbackFetch() {
        store.update(s => ({ ...s, loading: true })); // Keep existing error message if any, or set new one.
        try {
            const q = query(attendeesCollection, orderBy('name'));
            const snapshot = await getDocs(q);
            const attendeesData = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
            store.update(s => ({ ...s, data: attendeesData, loading: false, error: s.error, initialized: true })); // Keep original error if fallback was due to listener error
            console.log(`Fallback fetch successful: loaded ${attendeesData.length} attendees.`);
        } catch (err) {
            console.error("Fallback fetch also failed:", err);
            store.set({ data: [], loading: false, error: `Data loading failed completely: ${err.message}`, initialized: true });
        }
    }
    
    initializeStore(); // Initialize on store creation

    function validateAttendeeData(data, isUpdate = false) {
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            throw new Error("Attendee name is required and cannot be empty.");
        }
        
        const validated = {
            name: data.name.trim(),
            phone: data.phone ? String(data.phone).trim() : '',
            location: data.location ? String(data.location).trim() : '',
            ageGroup: data.ageGroup ? String(data.ageGroup).trim() : '',
            isNew: typeof data.isNew === 'boolean' ? data.isNew : (
                String(data['Are you new?']).toLowerCase() === 'yes' || String(data['Are you new?']).toLowerCase() === 'true'
            ),
            hasMentor: typeof data.hasMentor === 'boolean' ? data.hasMentor : (
                String(data['Do you have a mentor?']).toLowerCase() === 'yes' || String(data['Do you have a mentor?']).toLowerCase() === 'true'
            ),
            present: typeof data.present === 'boolean' ? data.present : false,
            lastUpdated: Timestamp.now()
        };

        if (isUpdate) {
            // For updates, we don't want to overwrite existing fields with empty values if they are not provided in `data`
            // This logic might need to be more granular depending on how `updatedData` is structured for `updateAttendee`
            // For now, this simple validation assumes all relevant fields are passed or are fine to be overwritten.
        } else {
            // For new attendees, ensure `present` defaults to false if not specified
            if (typeof data.present === 'undefined') {
                validated.present = false;
            }
        }
        return validated;
    }

    async function addAttendee(attendeeData) {
        try {
            const validatedData = validateAttendeeData(attendeeData);
            const docRef = await addDoc(attendeesCollection, validatedData);
            // Store automatically updates via onSnapshot listener
            return { success: true, id: docRef.id };
        } catch (error) {
            console.error("Error adding attendee to store:", error);
            throw error; // Re-throw for component to handle
        }
    }

    async function updateAttendee(id, updatedData) {
        try {
            if (!id) throw new Error("Invalid attendee ID for update.");
            
            // Prepare data for update, ensuring we don't blank out fields unintentionally
            // Only include fields that are actually being changed or are part of the core model.
            // `validateAttendeeData` helps standardize and add `lastUpdated`.
            const dataToUpdate = validateAttendeeData({ ...updatedData }, true); // Pass true for isUpdate if special logic is needed
            delete dataToUpdate.id; // Don't try to write the ID field itself

            const attendeeRef = doc(db, 'attendees', id);
            await updateDoc(attendeeRef, dataToUpdate);
            // Store automatically updates via onSnapshot listener
            return { success: true };
        } catch (error) {
            console.error("Error updating attendee in store:", error);
            throw error;
        }
    }

    async function deleteAttendee(id) {
        try {
            if (!id) throw new Error("Invalid attendee ID for deletion.");
            const attendeeRef = doc(db, 'attendees', id);
            await deleteDoc(attendeeRef);
            // Store automatically updates via onSnapshot listener
            return { success: true };
        } catch (error) {
            console.error("Error deleting attendee from store:", error);
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
            // Store automatically updates via onSnapshot listener
            return { success: true, newStatus: !currentStatus };
        } catch (error) {
            console.error("Error toggling attendance in store:", error);
            throw error;
        }
    }

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
                const snapshot = await getDocs(query(attendeesCollection));
                const totalDocsToDelete = snapshot.docs.length;
                let deletedCount = 0;

                if (totalDocsToDelete > 0) {
                    const MAX_BATCH_DELETE_SIZE = 500; // Firestore batch limit
                    let batch = writeBatch(db);
                    let currentBatchSize = 0;

                    for (let i = 0; i < snapshot.docs.length; i++) {
                        batch.delete(snapshot.docs[i].ref);
                        currentBatchSize++;
                        deletedCount++;
                        if (currentBatchSize === MAX_BATCH_DELETE_SIZE || i === snapshot.docs.length - 1) {
                            await batch.commit();
                            notifyProgress('deleting', `Deleting existing data... (${deletedCount}/${totalDocsToDelete})`, deletedCount, totalDocsToDelete);
                            if (i < snapshot.docs.length - 1) { // Don't create new batch if it's the last one
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

            const MAX_BATCH_IMPORT_SIZE = 500;
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
                        'Are you new?': item['Are you new?'], // Let validator handle conversion
                        'Do you have a mentor?': item['Do you have a mentor?'], // Let validator handle conversion
                        present: false, // Default to not present for imported records
                    });
                    
                    const newDocRef = doc(attendeesCollection); // Auto-generate ID
                    importBatch.set(newDocRef, validatedData);
                    currentImportBatchSize++;
                    successCount++;
                    
                    if (currentImportBatchSize === MAX_BATCH_IMPORT_SIZE || i === data.length - 1) {
                        await importBatch.commit();
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
                if (errors.length > 0) console.warn("Import errors:", errors.slice(0,10).join("\n") + (errors.length > 10 ? "\n...and more." : "")); // Log first few errors
            }
            return { success: true, message, errors };

        } catch (error) {
            console.error("Error during Excel import process:", error);
            notifyProgress('error', `Import failed: ${error.message}`, 1, 1);
            return { success: false, message: `Import failed: ${error.message || "Unknown error during import."}` };
        }
    }

    async function refreshData() {
        console.log("Manual data refresh triggered.");
        retryCount = 0; // Reset retries for a manual refresh
        store.update(s => ({ ...s, error: null })); // Clear previous errors before attempting refresh
        await initializeStore(); // This will set loading to true
    }

    return {
        subscribe: store.subscribe,
        addAttendee,
        updateAttendee,
        deleteAttendee, // Expose deleteAttendee
        togglePresent,
        importFromExcel,
        refreshData,
        destroy: () => { // Cleanup listener on component unmount if store is component-specific
            if (unsubscribeSnapshotListener) {
                unsubscribeSnapshotListener();
                unsubscribeSnapshotListener = null;
                console.log("Attendee store snapshot listener destroyed.");
            }
        }
    };
}

export const attendees = createAttendeesStore();