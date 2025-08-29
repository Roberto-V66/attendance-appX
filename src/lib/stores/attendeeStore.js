// src/lib/stores/attendeeStore.js

import { writable } from 'svelte/store';
import { supabase } from '$lib/supabase/supabase.js';

function createAttendeesStore() {
    const store = writable({
        data: [],
        loading: true,
        error: null,
        initialized: false
    });

    let channel = null;

    async function fetchAttendees() {
        store.update(s => ({ ...s, loading: true, error: null }));
        
        // FIX 1: INCREASE THE ROW LIMIT
        const { data: attendeesData, error } = await supabase
            .from('attendees')
            .select('*') // This automatically includes your new 'id' column
            .order('Name', { ascending: true })
            .limit(2000); 

        if (error) {
            console.error("Error fetching attendees:", error);
            store.update(s => ({ ...s, loading: false, error: `Error loading attendees: ${error.message}`, initialized: true }));
        } else {
            // FIX 2: THIS MAPPING IS CRITICAL FOR SEARCH AND DISPLAY.
            // It translates database columns (e.g., item.Name) to component properties (e.g., name).
            const mappedData = attendeesData.map(item => ({
                id: item.id,
                name: item.Name,
                phone: item.Phone,
                location: item.Location,
                ageGroup: item.AgeGroup,
                isNew: item.New,
                hasMentor: item.Mentor,
                present: item.present,
            }));

            store.set({ data: mappedData, loading: false, error: null, initialized: true });
            console.log(`Supabase: Successfully loaded ${mappedData.length} attendees.`);
        }
    }
    
    function initializeRealtimeListener() {
        if (channel) return;
        channel = supabase.channel('public:attendees')
            .on(
                'postgres_changes', 
                { event: '*', schema: 'public', table: 'attendees' }, 
                () => fetchAttendees() // Refetch data on any change
            )
            .subscribe();
    }
    
    // Initial data load and real-time setup
    fetchAttendees();
    initializeRealtimeListener();

    // This function takes app data (lowercase) and prepares it for the database (uppercase).
    function validateAndPrepareDataForSupabase(data) {
        if (!data.name?.trim()) throw new Error("Attendee name is required.");
        return {
            Name: data.name.trim(),
            Phone: data.phone ? String(data.phone).trim() : null,
            Location: data.location ? String(data.location).trim() : null,
            AgeGroup: data.ageGroup ? String(data.ageGroup).trim() : null,
            New: typeof data.isNew === 'boolean' ? data.isNew : false,
            Mentor: typeof data.hasMentor === 'boolean' ? data.hasMentor : false,
            present: typeof data.present === 'boolean' ? data.present : false,
        };
    }
    
    // --- CRUD OPERATIONS USING THE UNIQUE 'id' ---
    async function addAttendee(attendeeData) {
        const dataForSupabase = validateAndPrepareDataForSupabase(attendeeData);
        const { error } = await supabase.from('attendees').insert([dataForSupabase]);
        if (error) throw error;
        return { success: true };
    }

    async function updateAttendee(id, updatedData) {
        if (!id) throw new Error("Invalid ID for update.");
        const dataToUpdate = validateAndPrepareDataForSupabase({ ...updatedData });
        const { error } = await supabase.from('attendees').update(dataToUpdate).eq('id', id);
        if (error) throw error;
        return { success: true };
    }

    async function deleteAttendee(id) {
        if (!id) throw new Error("Invalid ID for deletion.");
        const { error } = await supabase.from('attendees').delete().eq('id', id);
        if (error) throw error;
        return { success: true };
    }

    async function togglePresent(id, currentStatus) {
        if (!id) throw new Error("Invalid ID for toggle.");
        const { error } = await supabase.from('attendees').update({ present: !currentStatus }).eq('id', id);
        if (error) throw error;
        return { success: true, newStatus: !currentStatus };
    }

    async function importFromExcel(data, replaceAll = false, progressCallback = null) {
        if (!Array.isArray(data) || data.length === 0) {
            return { success: false, message: "No valid data." };
        }
        const notify = (phase, msg, progress) => progressCallback?.({ phase, msg, progress });
        try {
            if (replaceAll) {
                notify('deleting', 'Deleting existing data...', 0.5);
                const { error: deleteError } = await supabase.from('attendees').delete().neq('id', -1);
                if (deleteError) throw deleteError;
            }
            const attendeesToInsert = data.map(item => validateAndPrepareDataForSupabase({
                name: item['Name'],
                phone: item['Phone'],
                location: item['Location'],
                ageGroup: item['Age Group'],
                isNew: item['Are you new?'],
                hasMentor: item['Do you have a mentor?'],
                present: false,
            }));
            const { error: insertError } = await supabase.from('attendees').insert(attendeesToInsert);
            if (insertError) throw insertError;
            return { success: true, message: `Import completed: ${attendeesToInsert.length} records imported.` };
        } catch (error) {
            return { success: false, message: `Import failed: ${error.message}` };
        }
    }

    return {
        subscribe: store.subscribe,
        addAttendee, 
        updateAttendee, 
        deleteAttendee, 
        togglePresent, 
        importFromExcel,
        refreshData: fetchAttendees,
        destroy: () => { 
            if (channel) supabase.removeChannel(channel); 
        }
    };
}

export const attendees = createAttendeesStore();