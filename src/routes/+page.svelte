<!-- src/routes/+page.svelte -->
<script>
    import { attendees } from '$lib/stores/attendeeStore.js';
    import { onMount, onDestroy } from 'svelte';
    import { toast } from '@zerodevx/svelte-toast';
    import { PlusCircle, Edit2, Trash2, LogOut, Download } from 'lucide-svelte'; // Optional icons

    let showAddModal = false;
    let showEditModal = false;
    let currentAttendee = null; // For editing

    let newName = '';
    let newGroup = '';

    async function handleAddAttendee() {
        if (!newName.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        try {
            await attendees.addAttendee({ name: newName, group: newGroup || null });
            toast.success("Attendee added!");
            newName = '';
            newGroup = '';
            showAddModal = false;
        } catch (error) {
            toast.error(`Error adding: ${error.message}`);
        }
    }

    function openEditModal(attendee) {
        currentAttendee = { ...attendee }; // Clone to avoid direct mutation
        showEditModal = true;
    }

    async function handleUpdateAttendee() {
        if (!currentAttendee || !currentAttendee.name.trim()) {
            toast.error("Name cannot be empty");
            return;
        }
        try {
            const { id, ...dataToUpdate } = currentAttendee;
            await attendees.updateAttendee(id, dataToUpdate);
            toast.success("Attendee updated!");
            showEditModal = false;
            currentAttendee = null;
        } catch (error) {
            toast.error(`Error updating: ${error.message}`);
        }
    }

    async function handleDeleteAttendee(id) {
        if (confirm("Are you sure you want to delete this attendee?")) {
            try {
                await attendees.deleteAttendee(id);
                toast.success("Attendee deleted!");
            } catch (error) {
                toast.error(`Error deleting: ${error.message}`);
            }
        }
    }

    async function handleTogglePresent(id, present) {
        try {
            await attendees.togglePresent(id, present);
            // toast.success(`Status updated for ${$attendees.find(a => a.id === id)?.name}`);
        } catch (error) {
            toast.error(`Error updating status: ${error.message}`);
        }
    }

    // Stats (derived store or computed here)
    $: totalAttendees = $attendees.length;
    $: presentAttendees = $attendees.filter(a => a.present).length;
    $: percentagePresent = totalAttendees > 0 ? ((presentAttendees / totalAttendees) * 100).toFixed(1) : 0;
    $: groupBreakdown = $attendees.reduce((acc, attendee) => {
        if (attendee.present) {
            const groupName = attendee.group || 'No Group';
            acc[groupName] = (acc[groupName] || 0) + 1;
        }
        return acc;
    }, {});

    // Preload some data (for testing, do this once via a script or Firebase console)
    /*
    onMount(async () => {
         if ($attendees.length === 0) { // Simple check to avoid re-adding
            await attendees.addAttendee({ name: "John Doe", group: "Choir", present: false });
            await attendees.addAttendee({ name: "Jane Smith", group: "Ushers", present: true });
            await attendees.addAttendee({ name: "Alice Brown", group: "Choir", present: false });
         }
    });
    */

    onDestroy(() => {
        // If the store's unsubscribe is exposed and needed:
        // if (attendees.unsubscribe) attendees.unsubscribe();
    });

    function formatDate(timestamp) {
        if (!timestamp || !timestamp.seconds) return 'N/A';
        return new Date(timestamp.seconds * 1000).toLocaleString();
    }

</script>

<div class="container mx-auto p-4">
    <header class="mb-6 flex justify-between items-center">
        <div>
            <h1 class="text-3xl font-bold text-gray-800">Attendance Tracker</h1>
            <p class="text-gray-600">Manage your attendees and view their status.</p>
        </div>
        <div class="flex items-center space-x-2">
             <form method="POST" action="/export" target="_blank" class="inline">
                <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded shadow flex items-center">
                    <Download class="mr-2 h-5 w-5" /> Export All
                </button>
            </form>
            <button on:click={() => showAddModal = true} class="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded shadow flex items-center">
                <PlusCircle class="mr-2 h-5 w-5" /> Add Attendee
            </button>
            <form method="POST" action="/logout" class="inline">
                <button type="submit" class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded shadow flex items-center">
                    <LogOut class="mr-2 h-5 w-5" /> Logout
                </button>
            </form>
        </div>
    </header>

    <!-- Stats Section -->
    <div class="mb-6 p-4 bg-gray-50 rounded-lg shadow">
        <h2 class="text-xl font-semibold mb-2 text-gray-700">Live Statistics</h2>
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="bg-white p-3 rounded shadow">
                <p class="text-sm text-gray-500">Total Attendees</p>
                <p class="text-2xl font-bold text-indigo-600">{totalAttendees}</p>
            </div>
            <div class="bg-white p-3 rounded shadow">
                <p class="text-sm text-gray-500">Currently Present</p>
                <p class="text-2xl font-bold text-green-600">{presentAttendees}</p>
            </div>
            <div class="bg-white p-3 rounded shadow">
                <p class="text-sm text-gray-500">% Present</p>
                <p class="text-2xl font-bold text-blue-600">{percentagePresent}%</p>
            </div>
        </div>
        {#if Object.keys(groupBreakdown).length > 0}
        <div class="mt-4">
            <h3 class="text-md font-semibold mb-1 text-gray-600">Present by Group:</h3>
            <ul class="list-disc list-inside text-sm">
                {#each Object.entries(groupBreakdown) as [group, count]}
                    <li>{group}: {count}</li>
                {/each}
            </ul>
        </div>
        {/if}
    </div>


    <!-- Attendees Table -->
    <div class="overflow-x-auto bg-white shadow-md rounded-lg">
        <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
                <tr>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Group</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Present</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Updated</th>
                    <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
                {#each $attendees as attendee (attendee.id)}
                    <tr class="hover:bg-gray-50">
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{attendee.name}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{attendee.group || 'N/A'}</td>
                        <td class="px-6 py-4 whitespace-nowrap">
                            <label class="flex items-center cursor-pointer">
                                <input type="checkbox" bind:checked={attendee.present} on:change={() => handleTogglePresent(attendee.id, attendee.present)} class="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"/>
                                <span class="ml-2 text-sm text-gray-700">{attendee.present ? 'Yes' : 'No'}</span>
                            </label>
                        </td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{formatDate(attendee.lastUpdated)}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                            <button on:click={() => openEditModal(attendee)} title="Edit" class="text-indigo-600 hover:text-indigo-900"><Edit2 class="h-5 w-5"/></button>
                            <button on:click={() => handleDeleteAttendee(attendee.id)} title="Delete" class="text-red-600 hover:text-red-900"><Trash2 class="h-5 w-5"/></button>
                        </td>
                    </tr>
                {:else}
                    <tr>
                        <td colspan="5" class="px-6 py-4 text-center text-sm text-gray-500">No attendees found. Add some!</td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>

<!-- Add Attendee Modal -->
{#if showAddModal}
<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50" role="dialog" tabindex="0" on:click|self={() => showAddModal = false} on:keydown={(e) => { if (e.key === 'Escape') showAddModal = false; }}>
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Add New Attendee</h3>
        <form on:submit|preventDefault={handleAddAttendee}>
            <div class="mb-4">
                <label for="add-name" class="block text-sm font-medium text-gray-700">Name*</label>
                <input type="text" id="add-name" bind:value={newName} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="mb-4">
                <label for="add-group" class="block text-sm font-medium text-gray-700">Group (Optional)</label>
                <input type="text" id="add-group" bind:value={newGroup} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" on:click={() => showAddModal = false} class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">Cancel</button>
                <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md shadow-sm">Add Attendee</button>
            </div>
        </form>
    </div>
</div>
{/if}

<!-- Edit Attendee Modal -->
{#if showEditModal && currentAttendee}
<div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50" role="dialog" tabindex="0" on:click|self={() => showEditModal = false} on:keydown={(e) => { if (e.key === 'Escape') showEditModal = false; }}>
    <div class="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 class="text-lg font-medium leading-6 text-gray-900 mb-4">Edit Attendee</h3>
        <form on:submit|preventDefault={handleUpdateAttendee}>
            <div class="mb-4">
                <label for="edit-name" class="block text-sm font-medium text-gray-700">Name*</label>
                <input type="text" id="edit-name" bind:value={currentAttendee.name} required class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
            <div class="mb-4">
                <label for="edit-group" class="block text-sm font-medium text-gray-700">Group (Optional)</label>
                <input type="text" id="edit-group" bind:value={currentAttendee.group} class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm">
            </div>
             <div class="mb-4">
                <label for="edit-present" class="block text-sm font-medium text-gray-700">Present</label>
                <input id="edit-present" type="checkbox" bind:checked={currentAttendee.present} class="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300"/>
            </div>
            <div class="mt-6 flex justify-end space-x-3">
                <button type="button" on:click={() => showEditModal = false} class="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300">Cancel</button>
                <button type="submit" class="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md shadow-sm">Save Changes</button>
            </div>
        </form>
    </div>
</div>
{/if}

<style>
    /* For Tailwind CSS, create app.css or global.css and import it:
       @tailwind base; @tailwind components; @tailwind utilities;
       Then link it in app.html: <link rel="stylesheet" href="%sveltekit.assets%/app.css">
    */
    /* Or basic styles here if not using Tailwind */
    .container { max-width: 1200px; }
    /* Add more specific styles for modals if not using a UI library or Tailwind */
</style>