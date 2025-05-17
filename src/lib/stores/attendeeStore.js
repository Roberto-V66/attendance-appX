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
    orderBy
} from 'firebase/firestore';

const attendeesCollection = collection(db, 'attendees');

function createAttendeesStore() {
    const { subscribe, set, update } = writable([]);

    // Subscribe to real-time updates
    const q = query(attendeesCollection, orderBy('name')); // Order by name
    const unsubscribe = onSnapshot(q, (snapshot) => {
        const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
        set(data);
    });

    // Validate and clean attendee data
    function validateAttendeeData(data) {
        if (!data.name || data.name.trim() === '') {
            throw new Error("Name is required");
        }
        return {
            name: data.name.trim(),
            phone: data.phone ? data.phone.trim() : '',
            location: data.location ? data.location.trim() : '',
            ageGroup: data.ageGroup ? data.ageGroup.trim() : '',
            isNew: typeof data.isNew === 'boolean' ? data.isNew : (data['Are you new?'] === true || data['Are you new?'] === 'Yes' || data['Are you new?'] === 'TRUE' || data['Are you new?'] === 'true'),
            hasMentor: typeof data.hasMentor === 'boolean' ? data.hasMentor : (data['Do you have a mentor?'] === true || data['Do you have a mentor?'] === 'Yes' || data['Do you have a mentor?'] === 'TRUE' || data['Do you have a mentor?'] === 'true'),
            present: Boolean(data.present),
            lastUpdated: Timestamp.now()
        };
    }

    async function addAttendee(attendeeData) {
        const validatedData = validateAttendeeData(attendeeData);
        await addDoc(attendeesCollection, validatedData);
    }

    async function updateAttendee(id, updatedData) {
        const validatedData = validateAttendeeData(updatedData);
        const attendeeRef = doc(db, 'attendees', id);
        await updateDoc(attendeeRef, validatedData);
    }

    async function deleteAttendee(id) {
        const attendeeRef = doc(db, 'attendees', id);
        await deleteDoc(attendeeRef);
    }

    async function togglePresent(id, currentStatus) {
        const attendeeRef = doc(db, 'attendees', id);
        await updateDoc(attendeeRef, {
            present: !currentStatus,
            lastUpdated: Timestamp.now()
        });
    }

    // Bulk import from Excel with validation
    async function importFromExcel(data) {
        let successCount = 0;
        let errorCount = 0;
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
                await addDoc(attendeesCollection, validatedData);
                successCount++;
            } catch (error) {
                errorCount++;
            }
        }
        return {
            success: true,
            message: `Import completed: ${successCount} records imported successfully, ${errorCount} records skipped due to validation errors`
        };
    }

    return {
        subscribe,
        addAttendee,
        updateAttendee,
        deleteAttendee,
        togglePresent,
        importFromExcel,
        unsubscribe // Call this when component unmounts if needed, though for app-wide store it's often not
    };
}

export const attendees = createAttendeesStore();