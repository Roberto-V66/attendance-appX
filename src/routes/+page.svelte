<script lang="ts">
    import {
        ArrowUpRight,
        Search,
        LogOut,
        Download,
        CirclePlus,
        File,
    } from "lucide-svelte";

    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input/index.js";

    // Modal state
    let isAddModalOpen = false;
    let isEditModalOpen = false;
    let editingPerson = null;

    // Form data
    let newPerson = {
        name: "",
        phone: "",
        location: "",
        ageGroup: "",
        isNew: false,
        hasMentor: false
    };

    // People data
    let people = [
        {
            id: 1,
            name: "John Doe",
            phone: "699456723",
            location: "Yaounde",
            ageGroup: "Young Adult",
            present: false,
        },
        {
            id: 2,
            name: "John Komme",
            phone: "699422223",
            location: "Douala",
            ageGroup: "Adult",
            present: false,
        },
        {
            id: 3,
            name: "Sarah Johnson",
            phone: "677889900",
            location: "Bamenda",
            ageGroup: "Teen",
            present: true,
        },
        {
            id: 4,
            name: "Michael Brown",
            phone: "655443322",
            location: "Buea",
            ageGroup: "Senior",
            present: false,
        },
    ];

    // Toggle presence
    function togglePresence(personId) {
        people = people.map((person) =>
            person.id === personId
                ? { ...person, present: !person.present }
                : person,
        );
    }

    // Open edit modal
    function openEditModal(person) {
        editingPerson = { ...person };
        isEditModalOpen = true;
    }

    // Handle add person
    function handleAddPerson() {
        people = [
            ...people,
            {
                id: Date.now(), // simple ID generation
                ...newPerson,
                present: false,
            },
        ];
        // Reset form
        newPerson = {
            name: "",
            phone: "",
            location: "",
            ageGroup: "",
            isNew: false,
            hasMentor: false
        };
        isAddModalOpen = false;
    }

    // Handle edit person
    function handleEditPerson() {
        people = people.map((person) =>
            person.id === editingPerson.id ? editingPerson : person,
        );
        isEditModalOpen = false;
    }
</script>

<div class="flex min-h-screen w-full flex-col">
    <header
        class="bg-background sticky top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6"
    >
        <div
            class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4"
        >
            <form class="ml-auto flex-1 sm:flex-initial">
                <div class="relative">
                    <Search
                        class="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4"
                    />
                    <Input
                        type="search"
                        placeholder="Search poeple..."
                        class="pl-8 sm:w-[400px] md:w-[800px] lg:w-[700px]"
                    />
                </div>
            </form>
        </div>
    </header>

    <main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div class="grid gap-4 md:gap-8">
            <Card.Root class="w-full">
                <div class="text-center mt-2">
                    <Card.Title>Attendance Tracker</Card.Title>
                    <Card.Description
                        >Manage your attendees and view their status.</Card.Description
                    >
                </div>
                <Card.Header class="flex flex-row items-center">
                    <div class="ml-auto flex items-center gap-2">
                        <!-- Add Button -->
                        <Button
                            size="sm"
                            class="h-8 gap-1"
                            on:click={() => (isAddModalOpen = true)}
                        >
                            <CirclePlus class="h-3.5 w-3.5" />
                            Add
                        </Button>

                        <!-- Your other buttons remain the same -->
                        <Button href="./list" size="sm" class="ml-auto gap-1">
                            View
                            <ArrowUpRight class="h-4 w-4" />
                        </Button>
                        <Button href="##" size="sm" class="ml-auto gap-1">
                            <Download class="h-3.5 w-3.5" />
                            Export
                        </Button>
                        <form action="/logout" method="POST">
                            <Button
                                type="submit"
                                size="sm"
                                variant="outline"
                                class="h-8"
                            >
                                <LogOut class="h-3.5 w-3.5" />
                                Logout
                            </Button>
                        </form>
    </div>
                </Card.Header>

                <Card.Content>
                    <div
                        class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    >
                        {#each people as person (person.id)}
                            <Card.Root
                                class="hover:shadow-lg transition-shadow duration-200"
                            >
                                <Card.Header>
                                    <Card.Title class="truncate"
                                        >{person.name}</Card.Title
                                    >
                                </Card.Header>
                                <Card.Content class="space-y-2">
                                    <p class="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-4 w-4 text-muted-foreground"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                                            />
                                        </svg>
                                        <span class="truncate"
                                            >{person.phone}</span
                                        >
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-4 w-4 text-muted-foreground"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                                            />
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                                            />
                                        </svg>
                                        <span class="truncate"
                                            >{person.location}</span
                                        >
                                    </p>
                                    <p class="flex items-center gap-2">
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            class="h-4 w-4 text-muted-foreground"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                stroke-width="2"
                                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                            />
                                        </svg>
                                        <span class="truncate"
                                            >{person.ageGroup}</span
                                        >
                                    </p>
                                </Card.Content>
                                <Card.Footer class="flex justify-between">
                                    <Button
                                        variant="outline"
                                        on:click={() => openEditModal(person)}
                                    >
                                        Edit
                                    </Button>
                                    <Button
                                        class={person.present
                                            ? "bg-green-500 hover:bg-green-600"
                                            : "bg-red-500 hover:bg-red-600"}
                                        on:click={() =>
                                            togglePresence(person.id)}
                                    >
                                        {person.present ? "Absent" : "Present"}
                                    </Button>
                                </Card.Footer>
                            </Card.Root>
                    {/each}
            </div>
                </Card.Content>
            </Card.Root>
    </div>

        <!-- Your analytics section remains the same -->
        <div class="text-center mt-2">
            <Card.Title>Analytics</Card.Title>
            <Card.Description>View the attendance statistics.</Card.Description>
            </div>
        <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            <Card.Root class="w-full">
                <Card.Header
                    class="flex flex-row items-center justify-between space-y-0 pb-2"
                >
                    <Card.Title class="text-sm font-medium"
                        >Total Poeple</Card.Title
                    >
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">1211</div>
                </Card.Content>
            </Card.Root>
            <Card.Root class="w-full">
                <Card.Header
                    class="flex flex-row items-center justify-between space-y-0 pb-2"
                >
                    <Card.Title class="text-sm font-medium"
                        >Poeple Present</Card.Title
                    >
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">210</div>
                </Card.Content>
            </Card.Root>
            <Card.Root class="w-full">
                <Card.Header
                    class="flex flex-row items-center justify-between space-y-0 pb-2"
                >
                    <Card.Title class="text-sm font-medium"
                        >New poeple</Card.Title
                    >
                </Card.Header>
                <Card.Content>
                    <div class="text-2xl font-bold">24</div>
                </Card.Content>
            </Card.Root>
        </div>
    </main>

<!-- Add Person Modal -->
    {#if isAddModalOpen}
        <div
            class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
            <div class="bg-background rounded-lg p-6 max-w-md w-full">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Add New Person</h3>
                    <button
                        on:click={() => (isAddModalOpen = false)}
                        class="text-muted-foreground hover:text-foreground"
                    >
                        &times;
                    </button>
            </div>
                <p class="mb-4 text-muted-foreground">
                    Fill in the details for the new attendee.
                </p>

                <div class="grid gap-4 mb-6">
                    <div>
                        <label for="name" class="block text-sm font-medium mb-1"
                            >Name</label
                        >
                        <Input
                            id="name"
                            bind:value={newPerson.name}
                            class="w-full"
                        />
                    </div>
                    <div>
                        <label
                            for="phone"
                            class="block text-sm font-medium mb-1">Phone</label
                        >
                        <Input
                            id="phone"
                            bind:value={newPerson.phone}
                            class="w-full"
                        />
                    </div>
                    <div>
                        <label
                            for="location"
                            class="block text-sm font-medium mb-1"
                            >Location</label
                        >
                        <Input
                            id="location"
                            bind:value={newPerson.location}
                            class="w-full"
                        />
                    </div>
                    <div>
                        <label
                            for="ageGroup"
                            class="block text-sm font-medium mb-1"
                            >Age Group</label
                        >
                        <Input
                            id="ageGroup"
                            bind:value={newPerson.ageGroup}
                            class="w-full"
                        />
                    </div>
                    <div class="flex items-center gap-2">
                        <input id="isNew" type="checkbox" bind:checked={newPerson.isNew} />
                        <label for="isNew" class="text-sm">Are you new?</label>
                    </div>
                    <div class="flex items-center gap-2">
                        <input id="hasMentor" type="checkbox" bind:checked={newPerson.hasMentor} />
                        <label for="hasMentor" class="text-sm">Do you have a mentor?</label>
                    </div>
                </div>

                <div class="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        on:click={() => (isAddModalOpen = false)}>Cancel</Button
                    >
                    <Button on:click={handleAddPerson}>Add Person</Button>
                </div>
            </div>
        </div>
    {/if}

    <!-- Edit Person Modal -->
    {#if isEditModalOpen && editingPerson}
        <div
            class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        >
            <div class="bg-background rounded-lg p-6 max-w-md w-full">
                <div class="flex justify-between items-center mb-4">
                    <h3 class="text-lg font-semibold">Edit Person</h3>
                    <button
                        on:click={() => (isEditModalOpen = false)}
                        class="text-muted-foreground hover:text-foreground"
                    >
                        &times;
                    </button>
                </div>
                <p class="mb-4 text-muted-foreground">
                    Make changes to the attendee's details.
                </p>

                <div class="grid gap-4 mb-6">
                    <div>
                        <label
                            for="edit-name"
                            class="block text-sm font-medium mb-1">Name</label
                        >
                        <Input
                            id="edit-name"
                            bind:value={editingPerson.name}
                            class="w-full"
                        />
                    </div>
                    <div>
                        <label
                            for="edit-phone"
                            class="block text-sm font-medium mb-1">Phone</label
                        >
                        <Input
                            id="edit-phone"
                            bind:value={editingPerson.phone}
                            class="w-full"
                        />
                    </div>
                    <div>
                    <label
                            for="edit-location"
                            class="block text-sm font-medium mb-1"
                            >Location</label
                        >
                        <Input
                            id="edit-location"
                            bind:value={editingPerson.location}
                            class="w-full"
                    />
                </div>
                    <div>
                    <label
                            for="edit-ageGroup"
                            class="block text-sm font-medium mb-1"
                            >Age Group</label
                        >
                        <Input
                            id="edit-ageGroup"
                            bind:value={editingPerson.ageGroup}
                            class="w-full"
                        />
                    </div>
                </div>

                <div class="flex justify-end gap-2">
                    <Button
                        variant="outline"
                        on:click={() => (isEditModalOpen = false)}
                        >Cancel</Button
                    >
                    <Button on:click={handleEditPerson}>Save Changes</Button>
                </div>
            </div>
        </div>
    {/if}
    </div>
