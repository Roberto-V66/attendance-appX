<script>
    import { onMount } from 'svelte';
    import { attendees } from '$lib/stores/attendeeStore.js';
    import * as XLSX from 'xlsx';
    import { toast } from '@zerodevx/svelte-toast';

    let attendeeList = [];

    // Fetch all attendees on mount
    $: attendeeList = $attendees;

    function exportToXLSX() {
        const ws = XLSX.utils.json_to_sheet(attendeeList.map(a => ({
            Name: a.name,
            Telephone: a.telephone || '',
            Group: a.group || '',
            Present: a.present ? 'Yes' : 'No',
            LastUpdated: a.lastUpdated?.seconds ? new Date(a.lastUpdated.seconds * 1000).toLocaleString() : ''
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendees");
        XLSX.writeFile(wb, "attendees.xlsx");
        toast.success("Exported to XLSX!");
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">All Attendees</h1>
    <button on:click={exportToXLSX} class="mb-4 px-4 py-2 bg-green-600 text-white rounded">Export to XLSX</button>
    <table class="min-w-full divide-y divide-gray-200 bg-white shadow rounded">
        <thead>
            <tr>
                <th class="px-4 py-2">Name</th>
                <th class="px-4 py-2">Telephone</th>
                <th class="px-4 py-2">Group</th>
                <th class="px-4 py-2">Present</th>
                <th class="px-4 py-2">Last Updated</th>
            </tr>
        </thead>
        <tbody>
            {#each attendeeList as attendee}
                <tr>
                    <td class="px-4 py-2">{attendee.name}</td>
                    <td class="px-4 py-2">{attendee.telephone || '-'}</td>
                    <td class="px-4 py-2">{attendee.group || '-'}</td>
                    <td class="px-4 py-2">{attendee.present ? 'Yes' : 'No'}</td>
                    <td class="px-4 py-2">{attendee.lastUpdated?.seconds ? new Date(attendee.lastUpdated.seconds * 1000).toLocaleString() : ''}</td>
                </tr>
            {/each}
        </tbody>
    </table>
</div>