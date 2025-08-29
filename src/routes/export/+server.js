// src/routes/export/+server.js

import { createClient } from '@supabase/supabase-js';
import { env } from '$env/dynamic/private'; // 
import { SUPABASE_SERVICE_ROLE_KEY } from '$env/static/private';
import * as XLSX from 'xlsx';

// The private env object contains PUBLIC variables as well when on the server.
const supabaseAdmin = createClient(env.VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function POST({ cookies }) {
    const sessionToken = cookies.get('session_token');
    if (!sessionToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const { data, error } = await supabaseAdmin
            .from('attendees')
            .select('*')
            .order('Name', { ascending: true });

        if (error) throw error;

        if (!data || data.length === 0) {
            return new Response("No data to export", { status: 404 });
        }

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
                'Content-Disposition': `attachment; filename="attendees_export_${new Date().toISOString().slice(0, 10)}.xlsx"`
            }
        });

    } catch (error) {
        console.error("Export error:", error);
        return new Response("Error generating export", { status: 500 });
    }
}