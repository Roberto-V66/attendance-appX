// src/routes/export/+server.js
import * as XLSX from 'xlsx';
import { db } from '$lib/firebase/firebase.js';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';

export async function POST({ cookies }) {
    const sessionToken = cookies.get('session_token');
    if (!sessionToken) {
        return new Response("Unauthorized", { status: 401 });
    }

    try {
        const attendeesCollectionRef = collection(db, 'attendees');
        const q = query(attendeesCollectionRef, orderBy('name'));
        const querySnapshot = await getDocs(q);

        const attendeesData = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                'Name': data.name || '',
                'Phone': data.phone || '',
                'Location': data.location || '',
                'Age Group': data.ageGroup || '',
                'New?': data.isNew ? 'Yes' : 'No',
                'Mentor?': data.hasMentor ? 'Yes' : 'No',
                'Status': data.present ? 'Present' : 'Absent',
                'Last Updated': data.lastUpdated ? 
                    new Date(data.lastUpdated.seconds * 1000).toLocaleString() : 'N/A'
            };
        });

        if (attendeesData.length === 0) {
            return new Response("No data to export", { status: 404 });
        }

        // Create worksheet with custom headers
        const worksheet = XLSX.utils.json_to_sheet(attendeesData);
        
        // Set column widths
        worksheet['!cols'] = [
            { wch: 25 }, // Name
            { wch: 15 }, // Phone
            { wch: 20 }, // Location
            { wch: 12 }, // Age Group
            { wch: 8 },  // New?
            { wch: 10 }, // Mentor?
            { wch: 12 }, // Status
            { wch: 20 }  // Last Updated
        ];

        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendees');

        // Generate buffer
        const buf = XLSX.write(workbook, { 
            type: 'buffer', 
            bookType: 'xlsx',
            cellStyles: true 
        });

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