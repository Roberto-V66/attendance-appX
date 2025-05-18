// src/lib/stores/attendeeStore.js
import { writable } from 'svelte/store';
import { db } from '$lib/firebase/firebase.js';
import {
    collection,
    onSnapshot,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Timestamp,
    query,
    orderBy,
    getDocs,
    writeBatch
} from 'firebase/firestore';

const attendeesCollection = collection(db, 'attendees');

function createAttendeesStore() {
    const { subscribe, set, update } = writable([]);

    // Subscribe to real-time updates
    const q = query(attendeesCollection, orderBy('name')); // Order by name
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        set(data);
    }, (error) => {
        console.error("Error fetching attendees:", error);
        // You might want to handle this error more gracefully in a production app
    });

    // Validate and clean attendee data
    function validateAttendeeData(data) {
        if (!data.name || typeof data.name !== 'string' || data.name.trim() === '') {
            throw new Error("Name is required");
        }
        
        return {
            name: data.name.trim(),
            phone: data.phone ? String(data.phone).trim() : '',
            location: data.location ? String(data.location).trim() : '',
            ageGroup: data.ageGroup ? String(data.ageGroup).trim() : '',
            isNew: typeof data.isNew === 'boolean' ? data.isNew : (
                data['Are you new?'] === true || 
                data['Are you new?'] === 'Yes' || 
                data['Are you new?'] === 'TRUE' || 
                data['Are you new?'] === 'true'
            ),
            hasMentor: typeof data.hasMentor === 'boolean' ? data.hasMentor : (
                data['Do you have a mentor?'] === true || 
                data['Do you have a mentor?'] === 'Yes' || 
                data['Do you have a mentor?'] === 'TRUE' || 
                data['Do you have a mentor?'] === 'true'
            ),
            present: Boolean(data.present),
            lastUpdated: Timestamp.now()
        };
    }

    async function addAttendee(attendeeData) {
        try {
            const validatedData = validateAttendeeData(attendeeData);
            await addDoc(attendeesCollection, validatedData);
            return { success: true };
        } catch (error) {
            console.error("Error adding attendee:", error);
            throw error;
        }
    }

    async function updateAttendee(id, updatedData) {
        try {
            if (!id) throw new Error("Invalid attendee ID");
            
            const validatedData = validateAttendeeData(updatedData);
            const attendeeRef = doc(db, 'attendees', id);
            await updateDoc(attendeeRef, validatedData);
            return { success: true };
        } catch (error) {
            console.error("Error updating attendee:", error);
            throw error;
        }
    }

    async function deleteAttendee(id) {
        try {
            if (!id) throw new Error("Invalid attendee ID");
            
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
            if (!id) throw new Error("Invalid attendee ID");
            
            const attendeeRef = doc(db, 'attendees', id);
            await updateDoc(attendeeRef, {
                present: !currentStatus,
                lastUpdated: Timestamp.now()
            });
            return { success: true };
        } catch (error) {
            console.error("Error toggling attendance:", error);
            throw error;
        }
    }

    // Bulk import from Excel with validation
    // Added replace parameter to handle replacement of existing data
    async function importFromExcel(data, replace = false) {
        if (!Array.isArray(data) || data.length === 0) {
            return {
                success: false,
                message: "No valid data found in file"
            };
        }

        try {
            // If replace is true, delete all existing attendees
            if (replace) {
                const batch = writeBatch(db);
                const snapshot = await getDocs(attendeesCollection);
                
                // Delete all existing documents
                snapshot.docs.forEach((doc) => {
                    batch.delete(doc.ref);
                });
                
                // Commit the batch delete
                await batch.commit();
            }
            
            // Process and add new data
            let successCount = 0;
            let errorCount = 0;
            
            // Use batch writes for better performance and atomicity
            const batchSize = 500; // Firestore batch size limit
            let currentBatch = writeBatch(db);
            let operationCount = 0;
            
            for (let i = 0; i < data.length; i++) {
                const item = data[i];
                // Skip empty rows
                if (!item.Name || item.Name.trim() === '') {
                    errorCount++;
                    continue;
                }
                
                try {
                    const validatedData = validateAttendeeData({
                        name: item['Name'],
                        phone: item['Phone'],
                        location: item['Location'],
                        ageGroup: item['Age Group'],
                        isNew: item['Are you new?'],
                        hasMentor: item['Do you have a mentor?']
                    });
                    
                    // Add to batch
                    const newDocRef = doc(attendeesCollection);
                    currentBatch.set(newDocRef, validatedData);
                    operationCount++;
                    successCount++;
                    
                    // If we've reached batch limit, commit and start a new batch
                    if (operationCount >= batchSize) {
                        await currentBatch.commit();
                        currentBatch = writeBatch(db);
                        operationCount = 0;
                    }
                } catch (error) {
                    console.error(`Error processing row ${i+1}:`, error);
                    errorCount++;
                }
            }
            
            // Commit any remaining operations
            if (operationCount > 0) {
                await currentBatch.commit();
            }
            
            return {
                success: true,
                message: `Import completed: ${successCount} records imported successfully, ${errorCount} records skipped due to validation errors`
            };
        } catch (error) {
            console.error("Error during import:", error);
            return {
                success: false,
                message: `Import failed: ${error.message || "Unknown error"}`
            };
        }
    }

    return {
        subscribe,
        addAttendee,
        updateAttendee,
        deleteAttendee,
        togglePresent,
        importFromExcel,
        unsubscribe
    };
}

export const attendees = createAttendeesStore();