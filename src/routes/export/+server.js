// src/routes/export/+server.js

import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private'; // <-- We will ONLY use this for env variables
import * as XLSX from 'xlsx';

// --- MODIFIED THIS LINE ---
// We get BOTH variables from the single 'env' object. This is more reliable.
const supabaseAdmin = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

export async function POST({ cookies }) {
    // We still check for the session cookie as a basic authorization check
    const sessionToken = cookies.get('session_token');
    if (!sessionToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        // Fetch ALL attendees from Supabase using the admin client
        const { data, error } = await supabaseAdmin
            .from('attendees')
            .select('*')
            .order('Name', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            return new Response("No data to export", { status: 404 });
        }

        // Map the Supabase data to a user-friendly Excel format
        const attendeesForExport = data.map(attendee => ({
            'Name': attendee.Name || '',
            'Phone': attendee.Phone || '',
            'Location': attendee.Location || '',
            'Age Group': attendee.AgeGroup || '',
            'Is New?': attendee.New ? 'Yes' : 'No',
            'Has Mentor?': attendee.Mentor ? 'Yes' : 'No',
            'Status': attendee.present ? 'Present' : 'Absent',
        }));

        const worksheet = XLSX.utils.json_to_sheet(attendeesForExport);
        
        // Set column widths for a nice-looking export
        worksheet['!cols'] = [
            { wch: 25 }, { wch: 15 }, { wch: 20 }, { wch: 12 },
            { wch: 10 }, { wch: 12 }, { wch: 12 } 
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');

        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new Response(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="attendees_export_${new Date().toISOString().slice(0,10)}.xlsx"`
            }
        });

    } catch (error) {
        console.error("Export error:", error);
        return new Response("Error generating export", { status: 500 });
    }
}