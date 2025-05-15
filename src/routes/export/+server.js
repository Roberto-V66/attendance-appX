// src/routes/export/+server.js
import * as XLSX from 'xlsx';
import { db } from '$lib/firebase/firebase.js';
import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';

export async function POST({ url, cookies }) { // Changed to POST to allow form submission
    // Basic check if user is authenticated (align with your hooks.server.js logic)
    const sessionToken = cookies.get('session_token');
    if (!sessionToken) { // This is a basic check, ensure robust auth in hooks
        return new Response("Unauthorized", { status: 401 });
    }

    const attendeesCollectionRef = collection(db, 'attendees');
    let q = query(attendeesCollectionRef, orderBy('name')); // Default: all data

    // Optional: Filter by group if a 'group' query parameter is provided
    const filterGroup = url.searchParams.get('group');
    if (filterGroup) {
        q = query(attendeesCollectionRef, where('group', '==', filterGroup), orderBy('name'));
    }

    try {
        const querySnapshot = await getDocs(q);
        const attendeesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                ID: doc.id,
                Name: data.name,
                Group: data.group || 'N/A',
                Present: data.present ? 'Yes' : 'No',
                LastUpdated: data.lastUpdated ? new Date(data.lastUpdated.seconds * 1000).toLocaleString() : 'N/A'
            };
        });

        if (attendeesData.length === 0) {
            return new Response("No data to export", { status: 404 });
        }

        const worksheet = XLSX.utils.json_to_sheet(attendeesData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');

        // Set headers for file download
        const buf = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

        return new Response(buf, {
            status: 200,
            headers: {
                'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                'Content-Disposition': `attachment; filename="attendees_export_${new Date().toISOString().slice(0,10)}.xlsx"`
            }
        });

    } catch (error) {
        console.error("Error exporting to XLSX:", error);
        return new Response("Error generating export", { status: 500 });
    }
}