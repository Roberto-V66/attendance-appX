// src/lib/services/attendees.js
import { db, collection, addDoc, getDocs, doc, deleteDoc } from '$lib/firebase';

export const attendeesService = {
  // Add single attendee
  async addAttendee(attendee) {
    try {
      const docRef = await addDoc(collection(db, "attendees"), attendee);
      return { id: docRef.id, ...attendee };
    } catch (e) {
      console.error("Error adding attendee: ", e);
      throw e;
    }
  },

  // Get all attendees
  async getAllAttendees() {
    try {
      const querySnapshot = await getDocs(collection(db, "attendees"));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
      console.error("Error getting attendees: ", e);
      throw e;
    }
  },

  // Delete attendee
  async deleteAttendee(id) {
    try {
      await deleteDoc(doc(db, "attendees", id));
    } catch (e) {
      console.error("Error deleting attendee: ", e);
      throw e;
    }
  }
};