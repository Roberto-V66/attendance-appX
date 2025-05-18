<script>
    import { onMount } from 'svelte';
    import { attendees } from '$lib/stores/attendeeStore.js';
    import * as XLSX from 'xlsx';
    import { toast } from '@zerodevx/svelte-toast';
    import * as Table from '$lib/components/ui/table';
    import { Button } from '$lib/components/ui/button';

    let attendeeList = [];

    // Fetch all attendees on mount
    $: attendeeList = $attendees;

    function exportToXLSX() {
        const ws = XLSX.utils.json_to_sheet(attendeeList.map(a => ({
            Name: a.name,
            Phone: a.phone || '',
            Location: a.location || '',
            'Age Group': a.ageGroup || '',
            'Are you new?': a.isNew ? 'Yes' : 'No',
            'Do you have a mentor?': a.hasMentor ? 'Yes' : 'No',
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Attendees");
        XLSX.writeFile(wb, "attendees.xlsx");
        toast.success("Exported to XLSX!");
    }
</script>

<div class="container mx-auto p-4">
    <h1 class="text-2xl font-bold mb-4">All Attendees</h1>
    <Button on:click={exportToXLSX} class="mb-4">
        Export to XLSX
    </Button>
    <Table.Root>
        <Table.Caption>List of all attendees</Table.Caption>
        <Table.Header>
            <Table.Row>
                <Table.Head>Name</Table.Head>
                <Table.Head>Phone</Table.Head>
                <Table.Head>Location</Table.Head>
                <Table.Head>Age Group</Table.Head>
                <Table.Head>Are you new?</Table.Head>
                <Table.Head>Do you have a mentor?</Table.Head>
            </Table.Row>
        </Table.Header>
        <Table.Body>
            {#each attendeeList as attendee}
                <Table.Row>
                    <Table.Cell class="font-medium">{attendee.name}</Table.Cell>
                    <Table.Cell>{attendee.phone || '-'}</Table.Cell>
                    <Table.Cell>{attendee.location || '-'}</Table.Cell>
                    <Table.Cell>{attendee.ageGroup || '-'}</Table.Cell>
                    <Table.Cell>{attendee.isNew ? 'Yes' : 'No'}</Table.Cell>
                    <Table.Cell>{attendee.hasMentor ? 'Yes' : 'No'}</Table.Cell>
                </Table.Row>
            {/each}
        </Table.Body>
    </Table.Root>
</div>