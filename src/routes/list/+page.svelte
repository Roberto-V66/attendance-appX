<!-- src/routes/list/+page.svelte -->
<script lang="ts">
  import { attendees as attendeesStore } from '$lib/stores/attendeeStore.js';
  import * as Table from '$lib/components/ui/table';
  import { Button } from '$lib/components/ui/button';
  import { Badge } from '$lib/components/ui/badge/index.js';
  import { ArrowDownToLine, Loader2, AlertTriangle, Check, AlertCircle, X } from 'lucide-svelte';
  import { onMount } from 'svelte';

  let attendeeList: any[] = [];
  let isLoading = true;
  let storeError: string | null = null;
  let storeInitialized = false;
  let statusMessage: { type: 'success' | 'error' | 'info', text: string } | null = null;

  attendeesStore.subscribe(value => {
    attendeeList = value.data.filter(a => a.name && String(a.name).trim() !== '');
    isLoading = value.loading;
    storeError = value.error;
    storeInitialized = value.initialized;
  });

  function showStatus(type: 'success' | 'error' | 'info', text: string) {
    statusMessage = { type, text };
    setTimeout(() => statusMessage = null, 5000);
  }

  async function handleServerExport() {
    try {
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = '/export';
      document.body.appendChild(form);
      form.submit();
      document.body.removeChild(form);
      showStatus('info', "Export initiated. Your download will begin shortly.");
    } catch (error) {
      console.error("Error exporting data:", error);
      showStatus('error', "Failed to export data. Please try again.");
    }
  }
</script>

<div class="container mx-auto p-4 md:p-8">
  <!-- Status Message Banner -->
  {#if statusMessage}
    <div class={`mb-6 p-4 rounded-lg ${
      statusMessage.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' :
      statusMessage.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
      'bg-blue-100 text-blue-800 border border-blue-200'
    }`}>
      <div class="flex items-center gap-2">
        {#if statusMessage.type === 'success'}
          <Check class="h-5 w-5" />
        {:else if statusMessage.type === 'error'}
          <AlertCircle class="h-5 w-5" />
        {/if}
        <span>{statusMessage.text}</span>
        <button on:click={() => statusMessage = null} class="ml-auto">
          <X class="h-5 w-5" />
        </button>
      </div>
    </div>
  {/if}

  <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
    <h1 class="text-3xl font-bold">All Attendees</h1>
    <Button on:click={handleServerExport} variant="outline">
      <ArrowDownToLine class="mr-2 h-4 w-4" /> Export All to XLSX
    </Button>
  </div>

  {#if isLoading && !storeInitialized}
    <div class="flex flex-col items-center justify-center h-64 text-center">
      <Loader2 class="h-12 w-12 animate-spin text-primary mb-4" />
      <p class="text-lg text-muted-foreground">Loading attendees...</p>
      <p class="text-sm text-muted-foreground">Please wait a moment.</p>
    </div>
  {:else if storeError}
    <div class="text-center py-10 p-6 bg-destructive/10 border border-destructive rounded-lg">
      <AlertTriangle class="h-12 w-12 text-destructive mx-auto mb-4" />
      <h2 class="text-xl font-semibold text-destructive mb-2">Error Loading Attendees</h2>
      <p class="text-destructive/80 mb-4">{storeError}</p>
      <Button on:click={() => attendeesStore.refreshData()} variant="destructive">
        Try Again
      </Button>
    </div>
  {:else if attendeeList.length === 0 && storeInitialized}
    <div class="text-center py-10 p-6 bg-muted/50 border border-border rounded-lg">
      <p class="text-xl text-muted-foreground mb-2">No attendees found.</p>
      <p class="text-sm text-muted-foreground">
        You can add attendees on the main page or import an XLSX file.
      </p>
      <Button href="/" variant="link" class="mt-2">Go to Main Page</Button>
    </div>
  {:else}
    <div class="border rounded-lg overflow-hidden">
      <Table.Root>
        <Table.Caption class="mt-4 mb-2 text-sm text-muted-foreground">
          List of all registered attendees. Current count: {attendeeList.length}.
        </Table.Caption>
        <Table.Header>
          <Table.Row>
            <Table.Head class="w-[200px] sm:w-[250px]">Name</Table.Head>
            <Table.Head>Phone</Table.Head>
            <Table.Head class="hidden md:table-cell">Location</Table.Head>
            <Table.Head class="hidden lg:table-cell">Age Group</Table.Head>
            <Table.Head class="text-center">New?</Table.Head>
            <Table.Head class="text-center">Mentor?</Table.Head>
            <Table.Head class="text-center">Status</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {#each attendeeList as attendee (attendee.id)}
            <Table.Row class="hover:bg-muted/50">
              <Table.Cell class="font-medium truncate" title={attendee.name}>{attendee.name}</Table.Cell>
              <Table.Cell>{attendee.phone || '-'}</Table.Cell>
              <Table.Cell class="hidden md:table-cell">{attendee.location || '-'}</Table.Cell>
              <Table.Cell class="hidden lg:table-cell">{attendee.ageGroup || '-'}</Table.Cell>
              <Table.Cell class="text-center">
                <Badge variant={attendee.isNew ? 'default' : 'outline'} class={attendee.isNew ? 'bg-blue-500 text-white hover:bg-blue-600' : ''}>
                  {attendee.isNew ? 'Yes' : 'No'}
                </Badge>
              </Table.Cell>
              <Table.Cell class="text-center">
                <Badge variant={attendee.hasMentor ? 'default' : 'outline'} class={attendee.hasMentor ? 'bg-purple-500 text-white hover:bg-purple-600' : ''}>
                  {attendee.hasMentor ? 'Yes' : 'No'}
                </Badge>
              </Table.Cell>
              <Table.Cell class="text-center">
                {#if attendee.present}
                  <Badge variant="default" class="bg-green-500 hover:bg-green-600 text-white">Present</Badge>
                {:else}
                  <Badge variant="secondary">Absent</Badge>
                {/if}
              </Table.Cell>
            </Table.Row>
          {/each}
        </Table.Body>
      </Table.Root>
    </div>
  {/if}
</div>