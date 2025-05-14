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

    async function addAttendee(attendeeData) {
        // name (required), group (optional), present (default false)
        if (!attendeeData.name) throw new Error("Name is required");
        await addDoc(attendeesCollection, {
            ...attendeeData,
            present: attendeeData.present || false,
            lastUpdated: Timestamp.now()
        });
    }

    async function updateAttendee(id, updatedData) {
        const attendeeRef = doc(db, 'attendees', id);
        await updateDoc(attendeeRef, {
            ...updatedData,
            lastUpdated: Timestamp.now()
        });
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

    return {
        subscribe,
        addAttendee,
        updateAttendee,
        deleteAttendee,
        togglePresent,
        unsubscribe // Call this when component unmounts if needed, though for app-wide store it's often not
    };
}

export const attendees = createAttendeesStore();