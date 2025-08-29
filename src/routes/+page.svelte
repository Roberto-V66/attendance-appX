<script lang="ts">
  import {
    Search,
    BookType,
    LogOut,
    Download,
    CirclePlus,
    File as FileIcon,
    Loader2,
    AlertCircle,
    X,
    Check,
    AlertTriangle,
    Trash2,
    BarChart2,
  } from "lucide-svelte";

  import * as AlertDialog from "$lib/components/ui/alert-dialog";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import { Label } from "$lib/components/ui/label/index.js";
  import { Checkbox } from "$lib/components/ui/checkbox/index.js";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { attendees as attendeesStore } from "$lib/stores/attendeeStore.js";
  import * as XLSX from "xlsx";
  import { onMount, onDestroy } from "svelte";

  // Modal state
  let isAddModalOpen = false;
  let isEditModalOpen = false;
  let isImportModalOpen = false;
  let editingPerson: any = null;

  // Status messages and loading states
  let statusMessage: {
    type: "success" | "error" | "info";
    text: string;
  } | null = null;
  let formErrors: Record<string, string> = {};
  let isExporting = false; // <-- New state for export button

  // Import-specific state
  let importLoading = false;
  let importFile: File | undefined;
  let confirmReplaceData = false;
  let importProgress = { phase: "", message: "", progress: 0 };

  // Form data
  let newPerson = {
    name: "",
    phone: "",
    location: "",
    ageGroup: "",
    isNew: false,
    hasMentor: false,
    present: false,
  };

  // Store subscription
  let people: any[] = [];
  let isLoadingAttendees = true;
  let attendeesError: string | null = null;
  let storeInitialized = false;

  attendeesStore.subscribe((value) => {
    people = value.data;
    isLoadingAttendees = value.loading;
    attendeesError = value.error;
    storeInitialized = value.initialized;
  });

  // --- DEBOUNCED SEARCH ---
  let search = "";
  let debouncedSearchTerm = "";
  let searchDebounceTimer: ReturnType<typeof setTimeout> | undefined =
    undefined;
  const DEBOUNCE_DELAY = 300;

  $: {
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(() => {
      debouncedSearchTerm = search.trim();
    }, DEBOUNCE_DELAY);
  }

  $: filteredPeople =
    debouncedSearchTerm.length > 0 && !isLoadingAttendees && storeInitialized
      ? people.filter((p) => {
          const lowerSearch = debouncedSearchTerm.toLowerCase();
          return (
            (p.name && p.name.toLowerCase().includes(lowerSearch)) ||
            (p.phone && p.phone.toLowerCase().includes(lowerSearch))
          );
        })
      : [];

  onDestroy(() => {
    clearTimeout(searchDebounceTimer);
  });
  // --- END DEBOUNCED SEARCH ---

  function showStatus(type: "success" | "error" | "info", text: string) {
    statusMessage = { type, text };
    setTimeout(() => (statusMessage = null), 5000);
  }

  async function togglePresence(personId: string, currentStatus: boolean) {
    try {
      const result = await attendeesStore.togglePresent(
        personId,
        currentStatus,
      );
      if (result.success) {
        showStatus(
          "success",
          `Marked as ${result.newStatus ? "Present" : "Absent"}`,
        );
      }
    } catch (error: any) {
      console.error("Error toggling presence:", error);
      showStatus("error", error.message || "Failed to update attendance.");
    }
  }

  function openAddModal() {
    isAddModalOpen = true;
    newPerson = {
      name: "",
      phone: "",
      location: "",
      ageGroup: "",
      isNew: false,
      hasMentor: false,
      present: false,
    };
    formErrors = {};
  }

  function openEditModal(person: any) {
    editingPerson = { ...person };
    isEditModalOpen = true;
    formErrors = {};
  }

  function openImportModal() {
    isImportModalOpen = true;
    importFile = undefined;
    confirmReplaceData = false;
    importProgress = { phase: "", message: "", progress: 0 };
    importLoading = false;
    formErrors = {};
  }

  function closeModal() {
    isAddModalOpen = false;
    isEditModalOpen = false;
    isImportModalOpen = false;
    editingPerson = null;
    formErrors = {};
  }

  async function handleAddPerson() {
    formErrors = {};
    if (!newPerson.name.trim()) {
      formErrors.name = "Name is required.";
      return;
    }
    const personDataToAdd = { ...newPerson };
    closeModal();
    showStatus("info", `Adding ${personDataToAdd.name}...`);
    try {
      await attendeesStore.addAttendee(personDataToAdd);
      showStatus("success", `${personDataToAdd.name} added successfully!`);
    } catch (e: any) {
      console.error("Error adding person:", e);
      showStatus("error", e.message || "Failed to add person.");
    }
  }

  async function handleEditPerson() {
    formErrors = {};
    if (!editingPerson || !editingPerson.id) {
      formErrors.general = "Invalid person data for editing.";
      return;
    }
    if (!editingPerson.name.trim()) {
      formErrors.name = "Name is required.";
      return;
    }
    try {
      await attendeesStore.updateAttendee(editingPerson.id, editingPerson);
      showStatus("success", "Attendee updated successfully!");
      closeModal();
    } catch (error: any) {
      console.error("Error updating person:", error);
      showStatus("error", error.message || "Failed to update person.");
    }
  }

  // --- NEW EXPORT FUNCTION ---
  async function handleExport() {
    isExporting = true;
    showStatus("info", "Generating export file...");

    try {
      const response = await fetch("/export", {
        method: "POST",
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || "Failed to generate export file.");
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const disposition = response.headers.get("content-disposition");
      let filename = `attendees_export_${new Date().toISOString().slice(0, 10)}.xlsx`;
      if (disposition && disposition.indexOf("attachment") !== -1) {
        const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
        const matches = filenameRegex.exec(disposition);
        if (matches != null && matches[1]) {
          filename = matches[1].replace(/['"]/g, "");
        }
      }
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      showStatus("success", "Export downloaded successfully!");
    } catch (error: any) {
      console.error("Error exporting data:", error);
      showStatus(
        "error",
        error.message || "Failed to export data. Please try again.",
      );
    } finally {
      isExporting = false;
    }
  }

  async function handleImport() {
    formErrors = {};
    if (!importFile) {
      formErrors.file = "Please select a file.";
      return;
    }
    if (!confirmReplaceData) {
      formErrors.confirm = "Please confirm you want to replace existing data.";
      return;
    }

    importLoading = true;
    importProgress = {
      phase: "starting",
      message: "Initiating import...",
      progress: 0,
    };
    try {
      const data = await readExcelFile(importFile);
      const result = await attendeesStore.importFromExcel(
        data,
        true,
        (progress) => {
          importProgress = progress;
        },
      );
      if (result.success) {
        showStatus("success", result.message);
        closeModal();
      } else {
        showStatus("error", result.message);
      }
    } catch (err: any) {
      formErrors.import = err.message || "Failed to import file.";
    } finally {
      importLoading = false;
    }
  }

  function readExcelFile(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          if (e.target?.result instanceof ArrayBuffer) {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array" });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];
            resolve(XLSX.utils.sheet_to_json(worksheet));
          } else {
            reject(new Error("File could not be read"));
          }
        } catch (err) {
          reject(new Error("Failed to parse Excel file."));
        }
      };
      reader.onerror = () => reject(new Error("Failed to read file"));
      reader.readAsArrayBuffer(file);
    });
  }

  let showDeleteDialog = false;
  let attendeeToDelete: { id: string; name: string } | null = null;

  function confirmDelete(attendee: { id: string; name: string }) {
    attendeeToDelete = attendee;
    showDeleteDialog = true;
  }

  async function handleDelete() {
    if (!attendeeToDelete) return;
    try {
      await attendeesStore.deleteAttendee(attendeeToDelete.id);
      showStatus("success", `${attendeeToDelete.name} has been deleted.`);
    } catch (error: any) {
      showStatus("error", error.message || "Failed to delete attendee.");
    } finally {
      showDeleteDialog = false;
      attendeeToDelete = null;
    }
  }
</script>

<div class="flex min-h-screen w-full flex-col bg-muted/40">
  <!-- Status Message Banner -->
  {#if statusMessage}
    <div
      class={`fixed top-16 left-0 right-0 z-40 p-4 text-center ${
        statusMessage.type === "success"
          ? "bg-green-100 text-green-800"
          : statusMessage.type === "error"
            ? "bg-red-100 text-red-800"
            : "bg-blue-100 text-blue-800"
      }`}
    >
      <div class="container mx-auto flex items-center justify-center gap-2">
        {#if statusMessage.type === "success"}
          <Check class="h-5 w-5" />
        {:else if statusMessage.type === "error"}
          <AlertCircle class="h-5 w-5" />
        {:else}
          <AlertTriangle class="h-5 w-5" />
        {/if}
        <span>{statusMessage.text}</span>
        <button on:click={() => (statusMessage = null)} class="ml-4">
          <X class="h-5 w-5" />
        </button>
      </div>
    </div>
  {/if}

  <header
    class="bg-background sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b px-4 sm:px-6"
  >
    <div class="flex items-center gap-2">
      <a href="/">
        <BookType />
      </a>
    </div>
    <div class="flex-1 max-w-xl">
      <form class="w-full" on:submit|preventDefault>
        <div class="relative">
          <Search
            class="text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4"
          />
          <Input
            type="search"
            placeholder="Search attendees by name or phone..."
            class="pl-8 w-full sm:w-[300px] md:w-[400px] lg:w-[500px]"
            bind:value={search}
          />
        </div>
      </form>
    </div>
    <div class="flex items-center gap-3">
      <form action="/logout" method="POST">
        <Button type="submit" variant="outline" size="icon" aria-label="Logout">
          <LogOut class="h-5 w-5" />
        </Button>
      </form>
    </div>
  </header>

  <main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
    <div class="grid gap-4 md:gap-8">
      <Card.Root class="w-full">
        <Card.Header
          class="flex flex-col sm:flex-row items-start sm:items-center sm:justify-between gap-4"
        >
          <div>
            <Card.Title class="text-2xl">Attendance Tracker</Card.Title>
            <Card.Description
              >Manage your attendees and view their status.</Card.Description
            >
          </div>
          <div class="flex items-center gap-2 mt-2 sm:mt-0 flex-wrap">
            <Button size="sm" class="h-8 gap-1" on:click={openAddModal}>
              <CirclePlus class="h-3.5 w-3.5" /> Add
            </Button>
            <Button
              size="sm"
              class="h-8 gap-1"
              variant="outline"
              on:click={openImportModal}
            >
              <FileIcon class="h-3.5 w-3.5" /> Import
            </Button>
            <Button href="/stats" size="sm" variant="outline" class="h-8 gap-1">
              <BarChart2 class="h-3.5 w-3.5" /> View Stats
            </Button>
            <Button
              on:click={handleExport}
              disabled={isExporting}
              size="sm"
              variant="outline"
              class="h-8 gap-1"
            >
              {#if isExporting}
                <Loader2 class="h-3.5 w-3.5 animate-spin" /> Exporting...
              {:else}
                <Download class="h-3.5 w-3.5" /> Export
              {/if}
            </Button>
          </div>
        </Card.Header>

        <Card.Content class="min-h-[200px]">
          {#if isLoadingAttendees && !storeInitialized}
            <!-- State 1: Initial data load for the entire list, store not ready -->
            <div class="text-center py-8">
              <Loader2 class="h-6 w-6 animate-spin mx-auto text-primary" />
              <p class="mt-2 text-muted-foreground">Loading attendees...</p>
            </div>
          {:else if attendeesError}
            <!-- State 2: Error loading attendees -->
            <div class="text-center py-8 text-red-600">
              <AlertCircle class="h-6 w-6 mx-auto mb-2" />
              <p>Error: {attendeesError}</p>
              <p class="text-sm text-muted-foreground">
                Could not load attendee data. Please try refreshing the page or
                check your connection.
              </p>
            </div>
          {:else if !storeInitialized}
            <!-- State 3: Store is still not initialized (should be brief) -->
            <div class="text-center py-8 text-muted-foreground">
              Initializing data...
            </div>
          {:else if search.trim().length === 0}
            <!-- State 4: Store initialized, no search term entered -->
            <div
              class="mb-4 text-center text-sm sm:text-base text-muted-foreground"
            >
              Search by name or phone to display attendee cards.
            </div>
          {:else if debouncedSearchTerm.length > 0}
            <!-- State 5: Store initialized, debounced search term is active -->
            {#if filteredPeople.length > 0}
              <!-- Sub-state 5a: Results found -->
              <div
                class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
              >
                {#each filteredPeople as person (person.id)}
                  <Card.Root
                    class="hover:shadow-lg transition-shadow duration-200 flex flex-col"
                  >
                    <Card.Header>
                      <Card.Title class="truncate">{person.name}</Card.Title>
                      <div class="flex gap-1 mt-1">
                        {#if person.isNew}<Badge variant="secondary">New</Badge
                          >{/if}
                        {#if person.hasMentor}<Badge
                            variant="outline"
                            class="border-purple-500 text-purple-600"
                            >Mentor</Badge
                          >{/if}
                      </div>
                    </Card.Header>
                    <Card.Content
                      class="space-y-1 text-sm text-muted-foreground flex-grow"
                    >
                      <p class="truncate">Phone: {person.phone || "-"}</p>
                      <p class="truncate">Location: {person.location || "-"}</p>
                      <p class="truncate">Age: {person.ageGroup || "-"}</p>
                    </Card.Content>
                    <Card.Footer class="flex justify-between pt-4 items-center">
                      <Button
                        size="sm"
                        variant={person.present ? "outline" : "default"}
                        class={`${person.present ? "border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600" : "bg-green-500 hover:bg-green-600 text-white"} w-[110px]`}
                        on:click={() =>
                          togglePresence(person.id, person.present)}
                      >
                        {person.present ? "Set Absent" : "Set Present"}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        class="text-muted-foreground hover:bg-muted/10"
                        on:click={() => openEditModal(person)}
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        class="text-destructive hover:bg-destructive/10 hover:text-destructive"
                        on:click={() =>
                          confirmDelete({ id: person.id, name: person.name })}
                        title="Delete Attendee"
                      >
                        <Trash2 class="h-4 w-4" />
                      </Button>
                    </Card.Footer>
                  </Card.Root>
                {/each}
              </div>
            {:else}
              <!-- Sub-state 5b: No results found for debounced term -->
              <div class="text-center py-8 text-muted-foreground">
                No attendees found for "{debouncedSearchTerm}". Try a different
                search.
              </div>
            {/if}
          {:else if search.trim().length > 0 && debouncedSearchTerm.length === 0}
            <!-- State 6: Store initialized, user is typing, debounce not elapsed -->
            <div class="text-center py-8 text-muted-foreground">
              <Loader2 class="h-5 w-5 animate-spin inline-block mr-2" />
              Searching...
            </div>
          {:else}
            <!-- Fallback: Should ideally not be hit if logic above is correct -->
            <div
              class="mb-4 text-center text-sm sm:text-base text-muted-foreground"
            >
              Use the search bar to find attendees.
            </div>
          {/if}
        </Card.Content>
      </Card.Root>
    </div>
  </main>

  <!-- Add Person Modal -->
  {#if isAddModalOpen}
    <div
      class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div class="bg-background rounded-lg p-6 max-w-md w-full shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Add New Attendee</h3>
          <Button
            variant="ghost"
            size="icon"
            on:click={closeModal}
            aria-label="Close modal"
          >
            <X class="h-5 w-5" />
          </Button>
        </div>
        {#if formErrors.general}
          <div class="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {formErrors.general}
          </div>
        {/if}
        <p class="mb-4 text-sm text-muted-foreground">
          Fill in the details for the new attendee.
        </p>
        <div class="grid gap-4 mb-6">
          <div class="grid gap-2">
            <Label for="name"
              >Name <span class="text-destructive">*</span></Label
            >
            <Input
              id="name"
              bind:value={newPerson.name}
              placeholder="John Doe"
            />
            {#if formErrors.name}
              <p class="text-sm text-destructive">{formErrors.name}</p>
            {/if}
          </div>
          <div class="grid gap-2">
            <Label for="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              bind:value={newPerson.phone}
              placeholder="691 234 567"
            />
          </div>
          <div class="grid gap-2">
            <Label for="location">Location</Label>
            <Input
              id="location"
              bind:value={newPerson.location}
              placeholder="Quarter"
            />
          </div>
          <div class="grid gap-2">
            <Label for="ageGroup">Age Group</Label>
            <Input
              id="ageGroup"
              bind:value={newPerson.ageGroup}
              placeholder="e.g., JA"
            />
          </div>
          <div class="flex items-center gap-2 pt-2">
            <Checkbox id="isNew" bind:checked={newPerson.isNew} />
            <Label for="isNew" class="text-sm font-normal"
              >Is this a new attendee?</Label
            >
          </div>
          <div class="flex items-center gap-2">
            <Checkbox id="hasMentor" bind:checked={newPerson.hasMentor} />
            <Label for="hasMentor" class="text-sm font-normal"
              >Does this attendee have a mentor?</Label
            >
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" on:click={closeModal}>Cancel</Button>
          <Button on:click={handleAddPerson}>Add Attendee</Button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Edit Person Modal -->
  {#if isEditModalOpen && editingPerson}
    <div
      class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div class="bg-background rounded-lg p-6 max-w-md w-full shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Edit Attendee</h3>
          <Button
            variant="ghost"
            size="icon"
            on:click={closeModal}
            aria-label="Close modal"
          >
            <X class="h-5 w-5" />
          </Button>
        </div>
        {#if formErrors.general}
          <div class="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {formErrors.general}
          </div>
        {/if}
        <p class="mb-4 text-sm text-muted-foreground">
          Make changes to the attendee's details.
        </p>
        <div class="grid gap-4 mb-6">
          <div class="grid gap-2">
            <Label for="edit-name"
              >Name <span class="text-destructive">*</span></Label
            >
            <Input id="edit-name" bind:value={editingPerson.name} />
            {#if formErrors.name}
              <p class="text-sm text-destructive">{formErrors.name}</p>
            {/if}
          </div>
          <div class="grid gap-2">
            <Label for="edit-phone">Phone</Label>
            <Input
              id="edit-phone"
              type="tel"
              bind:value={editingPerson.phone}
            />
          </div>
          <div class="grid gap-2">
            <Label for="edit-location">Location</Label>
            <Input id="edit-location" bind:value={editingPerson.location} />
          </div>
          <div class="grid gap-2">
            <Label for="edit-ageGroup">Age Group</Label>
            <Input id="edit-ageGroup" bind:value={editingPerson.ageGroup} />
          </div>
          <div class="flex items-center gap-2 pt-2">
            <Checkbox id="edit-isNew" bind:checked={editingPerson.isNew} />
            <Label for="edit-isNew" class="text-sm font-normal"
              >Is this a new attendee?</Label
            >
          </div>
          <div class="flex items-center gap-2">
            <Checkbox
              id="edit-hasMentor"
              bind:checked={editingPerson.hasMentor}
            />
            <Label for="edit-hasMentor" class="text-sm font-normal"
              >Does this attendee have a mentor?</Label
            >
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <Button variant="outline" on:click={closeModal}>Cancel</Button>
          <Button on:click={handleEditPerson}>Save Changes</Button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Import Modal -->
  {#if isImportModalOpen}
    <div
      class="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
    >
      <div class="bg-background rounded-lg p-6 max-w-md w-full shadow-xl">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-semibold">Import Attendees</h3>
          <Button
            variant="ghost"
            size="icon"
            on:click={closeModal}
            aria-label="Close modal"
          >
            <X class="h-5 w-5" />
          </Button>
        </div>
        {#if formErrors.import}
          <div class="mb-4 p-2 bg-red-100 text-red-700 rounded-md text-sm">
            {formErrors.import}
          </div>
        {/if}
        <div class="mb-4 text-sm text-muted-foreground">
          <p class="mb-2">
            Import an XLSX file. Ensure it has these exact headers
            (case-sensitive):
          </p>
          <p class="font-mono text-xs bg-muted p-2 rounded">
            Name, Phone, Location, Age Group, Are you new?, Do you have a
            mentor?
          </p>
        </div>
        <div class="grid gap-2 mb-4">
          <Label for="import-file">XLSX File</Label>
          <Input
            id="import-file"
            type="file"
            accept=".xlsx"
            on:change={(e: Event) => {
              const target = e.target as HTMLInputElement;
              importFile = target.files?.[0];
              formErrors.file = "";
            }}
          />
          {#if formErrors.file}
            <p class="text-sm text-destructive">{formErrors.file}</p>
          {/if}
        </div>
        <div class="flex items-center gap-2 mb-4">
          <Checkbox id="confirm-replace" bind:checked={confirmReplaceData} />
          <Label
            for="confirm-replace"
            class="text-sm font-medium text-destructive"
          >
            I confirm this will <span class="font-bold">replace all</span> existing
            attendee data.
          </Label>
          {#if formErrors.confirm}
            <p class="text-sm text-destructive">{formErrors.confirm}</p>
          {/if}
        </div>

        <!-- Progress bar for import -->
        {#if importLoading && importProgress.message}
          <div class="mb-3">
            <div class="text-blue-600 text-sm p-1 flex items-center gap-2">
              <Loader2 class="h-4 w-4 animate-spin shrink-0" />
              <span>
                {importProgress.message}
                {#if importProgress.phase === "deleting" || importProgress.phase === "importing"}
                  ({Math.round(importProgress.progress * 100)}%)
                {/if}
              </span>
            </div>
            {#if (importProgress.phase === "deleting" || importProgress.phase === "importing") && importProgress.progress > 0}
              <div class="w-full bg-muted rounded-full h-1.5 mt-1">
                <div
                  class="bg-primary h-1.5 rounded-full"
                  style="width: {importProgress.progress * 100}%"
                ></div>
              </div>
            {/if}
          </div>
        {/if}

        <div class="flex justify-end gap-2">
          <Button
            variant="outline"
            on:click={closeModal}
            disabled={importLoading}>Cancel</Button
          >
          <Button
            on:click={handleImport}
            disabled={importLoading || !confirmReplaceData || !importFile}
          >
            {#if importLoading}
              <Loader2 class="mr-2 h-4 w-4 animate-spin" />
              {importProgress.phase === "deleting"
                ? "Deleting..."
                : "Importing..."}
            {:else}
              Import Data
            {/if}
          </Button>
        </div>
      </div>
    </div>
  {/if}

  <!-- Delete Confirmation Dialog -->
  <AlertDialog.Root bind:open={showDeleteDialog}>
    <AlertDialog.Portal>
      <AlertDialog.Overlay
        class="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
      />
      <AlertDialog.Content
        class="fixed left-[50%] top-[50%] z-50 w-full max-w-md translate-x-[-50%] translate-y-[-50%] border bg-background p-6 shadow-lg duration-200 sm:rounded-lg"
      >
        <AlertDialog.Header>
          <AlertDialog.Title>Confirm Deletion</AlertDialog.Title>
          <AlertDialog.Description>
            Are you sure you want to delete <span class="font-semibold"
              >{attendeeToDelete?.name}</span
            >? This action cannot be undone.
          </AlertDialog.Description>
        </AlertDialog.Header>
        <AlertDialog.Footer class="mt-4 flex justify-end gap-2">
          <AlertDialog.Cancel asChild>
            <Button
              variant="outline"
              on:click={() => (showDeleteDialog = false)}
            >
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action asChild>
            <Button variant="destructive" on:click={handleDelete}>
              Delete
            </Button>
          </AlertDialog.Action>
        </AlertDialog.Footer>
      </AlertDialog.Content>
    </AlertDialog.Portal>
  </AlertDialog.Root>
</div>
