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
  import { attendees } from "$lib/stores/attendeeStore.js";
  import * as XLSX from "xlsx";
  import { onMount } from "svelte";

  // Modal state
  let isAddModalOpen = false;
  let isEditModalOpen = false;
  let isImportModalOpen = false;
  let editingPerson = null;
  let importError = "";
  let importSuccess = "";
  let importLoading = false;
  let importFile;
  let confirmReplaceData = false;

  // Form data
  let newPerson = {
    name: "",
    phone: "",
    location: "",
    ageGroup: "",
    isNew: false,
    hasMentor: false,
  };

  // Use Firestore data
  let people = [];
  $: people = $attendees;

  // Search
  let search = "";
  $: filteredPeople =
    search.trim().length > 0
      ? people.filter(
          (p) =>
            (p.name && p.name.toLowerCase().includes(search.toLowerCase())) ||
            (p.phone && p.phone.toLowerCase().includes(search.toLowerCase())),
        )
      : [];

  // Analytics
  $: total = people.length;
  $: present = people.filter((p) => p.present).length;
  $: newCount = people.filter((p) => p.isNew).length;
  $: withMentor = people.filter((p) => p.hasMentor).length;

  // Toggle presence
  async function togglePresence(personId, currentStatus) {
    try {
      await attendees.togglePresent(personId, currentStatus);
    } catch (error) {
      console.error("Error toggling presence:", error);
      alert("Failed to update attendance status. Please try again.");
    }
  }

  // Open edit modal
  function openEditModal(person) {
    editingPerson = { ...person };
    isEditModalOpen = true;
  }

  // Add Person
  async function handleAddPerson() {
    try {
      await attendees.addAttendee(newPerson);
      newPerson = {
        name: "",
        phone: "",
        location: "",
        ageGroup: "",
        isNew: false,
        hasMentor: false,
      };
      isAddModalOpen = false;
    } catch (e) {
      console.error("Error adding person:", e);
      alert(e.message || "Failed to add person. Please try again.");
    }
  }

  // Handle edit person - Now connected to Firestore
  async function handleEditPerson() {
    try {
      if (!editingPerson || !editingPerson.id) {
        throw new Error("Invalid person data");
      }
      await attendees.updateAttendee(editingPerson.id, editingPerson);
      isEditModalOpen = false;
    } catch (error) {
      console.error("Error updating person:", error);
      alert(error.message || "Failed to update person. Please try again.");
    }
  }

  // Handle Export - Now using the server endpoint
  async function handleExport() {
    try {
      // Redirect to or fetch from server endpoint
      window.location.href = "/export";
    } catch (error) {
      console.error("Error exporting data:", error);
      alert("Failed to export data. Please try again.");
    }
  }

  // Import XLSX
  async function handleImport() {
    importError = "";
    importSuccess = "";
    if (!importFile) {
      importError = "Please select a file.";
      return;
    }

    if (!confirmReplaceData) {
      importError = "Please confirm you want to replace existing data.";
      return;
    }

    importLoading = true;
    try {
      const data = await readExcelFile(importFile);

      // Validate headers
      const requiredHeaders = [
        "Name",
        "Phone",
        "Location",
        "Age Group",
        "Are you new?",
        "Do you have a mentor?",
      ];
      const fileHeaders = Object.keys(data[0] || {});

      const missingHeaders = requiredHeaders.filter(
        (header) => !fileHeaders.includes(header),
      );

      if (missingHeaders.length > 0) {
        throw new Error(
          `Missing required headers: ${missingHeaders.join(", ")}`,
        );
      }

      // Import with replace option set to true
      const result = await attendees.importFromExcel(data, true);
      if (result.success) {
        importSuccess = result.message;
        isImportModalOpen = false;
      } else {
        importError = result.message;
      }
    } catch (err) {
      importError = err.message || "Failed to import file";
    } finally {
      importLoading = false;
    }
  }

  async function readExcelFile(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (e.target.result instanceof ArrayBuffer) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet);
            resolve(jsonData);
          } else {
            reject(new Error("File could not be read as ArrayBuffer"));
          }
        } catch (err) {
          reject(new Error("Failed to parse Excel file"));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }
</script>

<div class="flex min-h-screen w-full flex-col">
  <header
    class="bg-background sticky top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6"
  >
    <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
      <form class="ml-auto flex-1 sm:flex-initial" on:submit|preventDefault>
        <div class="relative">
          <Search
            class="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4"
          />
          <Input
            type="search"
            placeholder="Search people by name or phone..."
            class="pl-8 sm:w-[400px] md:w-[800px] lg:w-[700px]"
            bind:value={search}
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

            <!-- Import Button -->
            <Button
              size="sm"
              class="h-8 gap-1"
              on:click={() => (isImportModalOpen = true)}
            >
              <File class="h-3.5 w-3.5" />
              Import
            </Button>

            <!-- Your other buttons remain the same -->
            <Button href="/list" size="sm" class="ml-auto gap-1">
              View
              <ArrowUpRight class="h-4 w-4" />
            </Button>
            <Button on:click={handleExport} size="sm" class="ml-auto gap-1">
              <Download class="h-3.5 w-3.5" />
              Export
            </Button>
            <form action="/logout" method="POST">
              <Button type="submit" size="sm" variant="outline" class="h-8">
                <LogOut class="h-3.5 w-3.5" />
                Logout
              </Button>
            </form>
          </div>
        </Card.Header>

        <Card.Content>
          {#if search.trim().length > 0}
            <div
              class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
            >
              {#each filteredPeople as person (person.id)}
                <Card.Root
                  class="hover:shadow-lg transition-shadow duration-200"
                >
                  <Card.Header>
                    <Card.Title class="truncate">{person.name}</Card.Title>
                  </Card.Header>
                  <Card.Content class="space-y-2">
                    <p class="flex items-center gap-2">
                      <span class="truncate">{person.phone}</span>
                    </p>
                    <p class="flex items-center gap-2">
                      <span class="truncate">{person.ageGroup}</span>
                    </p>
                    <div class="flex justify-between mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        on:click={() =>
                          togglePresence(person.id, person.present)}
                      >
                        {person.present ? "Mark Absent" : "Mark Present"}
                      </Button>
                      <Button size="sm" on:click={() => openEditModal(person)}>
                        Edit
                      </Button>
                    </div>
                  </Card.Content>
                </Card.Root>
              {/each}
            </div>
          {:else}
            <div class="text-center text-muted-foreground">
              Search to display attendees.
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </div>

    <!-- Analytics Section -->
    <div class="text-center mt-2">
      <Card.Title>Analytics</Card.Title>
      <Card.Description>View the attendance statistics.</Card.Description>
    </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      <Card.Root class="w-full">
        <Card.Header
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <Card.Title class="text-sm font-medium">Total People</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">{total}</div>
        </Card.Content>
      </Card.Root>
      <Card.Root class="w-full">
        <Card.Header
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <Card.Title class="text-sm font-medium">People Present</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">{present}</div>
        </Card.Content>
      </Card.Root>
      <Card.Root class="w-full">
        <Card.Header
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <Card.Title class="text-sm font-medium">New People</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">{newCount}</div>
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
            <label for="name" class="block text-sm font-medium mb-1">Name</label
            >
            <Input id="name" bind:value={newPerson.name} class="w-full" />
          </div>
          <div>
            <label for="phone" class="block text-sm font-medium mb-1"
              >Phone</label
            >
            <Input id="phone" bind:value={newPerson.phone} class="w-full" />
          </div>
          <div>
            <label for="location" class="block text-sm font-medium mb-1"
              >Location</label
            >
            <Input
              id="location"
              bind:value={newPerson.location}
              class="w-full"
            />
          </div>
          <div>
            <label for="ageGroup" class="block text-sm font-medium mb-1"
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
            <input
              id="hasMentor"
              type="checkbox"
              bind:checked={newPerson.hasMentor}
            />
            <label for="hasMentor" class="text-sm">Do you have a mentor?</label>
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" on:click={() => (isAddModalOpen = false)}
            >Cancel</Button
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
            <label for="edit-name" class="block text-sm font-medium mb-1"
              >Name</label
            >
            <Input
              id="edit-name"
              bind:value={editingPerson.name}
              class="w-full"
            />
          </div>
          <div>
            <label for="edit-phone" class="block text-sm font-medium mb-1"
              >Phone</label
            >
            <Input
              id="edit-phone"
              bind:value={editingPerson.phone}
              class="w-full"
            />
          </div>
          <div>
            <label for="edit-location" class="block text-sm font-medium mb-1"
              >Location</label
            >
            <Input
              id="edit-location"
              bind:value={editingPerson.location}
              class="w-full"
            />
          </div>
          <div>
            <label for="edit-ageGroup" class="block text-sm font-medium mb-1"
              >Age Group</label
            >
            <Input
              id="edit-ageGroup"
              bind:value={editingPerson.ageGroup}
              class="w-full"
            />
          </div>
          <div class="flex items-center gap-2">
            <input
              id="edit-isNew"
              type="checkbox"
              bind:checked={editingPerson.isNew}
            />
            <label for="edit-isNew" class="text-sm">Are you new?</label>
          </div>
          <div class="flex items-center gap-2">
            <input
              id="edit-hasMentor"
              type="checkbox"
              bind:checked={editingPerson.hasMentor}
            />
            <label for="edit-hasMentor" class="text-sm"
              >Do you have a mentor?</label
            >
          </div>
        </div>

        <div class="flex justify-end gap-2">
          <Button variant="outline" on:click={() => (isEditModalOpen = false)}
            >Cancel</Button
          >
          <Button on:click={handleEditPerson}>Save Changes</Button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Import Modal -->
  {#if isImportModalOpen}
    <div
      class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    >
      <div class="bg-background rounded-lg p-6 max-w-md w-full">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Import Attendees</h3>
          <button
            on:click={() => (isImportModalOpen = false)}
            class="text-muted-foreground hover:text-foreground">&times;</button
          >
        </div>
        <div class="mb-4 text-muted-foreground">
          <p class="mb-2">Import an XLSX file with these exact headers:</p>
          <p class="font-mono text-xs bg-gray-100 p-2 rounded">
            Name, Phone, Location, Age Group, Are you new?, Do you have a
            mentor?
          </p>
        </div>
        <input
          type="file"
          accept=".xlsx,.xls"
          on:change={(e: Event) => {
            const target = e.target as HTMLInputElement;
            importFile = target.files?.[0];
          }}
          class="mb-4"
        />

        <div class="flex items-center gap-2 mb-4">
          <input
            id="confirm-replace"
            type="checkbox"
            bind:checked={confirmReplaceData}
          />
          <label for="confirm-replace" class="text-sm font-medium text-red-600"
            >I confirm that this will replace all existing data</label
          >
        </div>

        {#if importError}
          <div class="text-red-600 mb-2">{importError}</div>
        {/if}
        {#if importSuccess}
          <div class="text-green-600 mb-2">{importSuccess}</div>
        {/if}
        <div class="flex justify-end gap-2">
          <Button variant="outline" on:click={() => (isImportModalOpen = false)}
            >Cancel</Button
          >
          <Button on:click={handleImport} disabled={importLoading}
            >{importLoading ? "Importing..." : "Import"}</Button
          >
        </div>
      </div>
    </div>
  {/if}
</div>
