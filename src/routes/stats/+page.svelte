<script lang="ts">
  import {
    BookType,
    LogOut,
    ArrowLeft,
    Users,
    CheckCircle,
    Sparkles,
    BarChart2,
    Loader2,
    AlertCircle,
    RefreshCw,
    X
  } from "lucide-svelte";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { attendees as attendeesStore } from "$lib/stores/attendeeStore.js";
  import { onMount } from "svelte";

  // Store subscription
  let people: any[] = [];
  let isLoadingAttendees = true;
  let attendeesError: string | null = null;
  let storeInitialized = false;
  let statsLoaded = false;

  // Analytics
  let total = 0;
  let present = 0;
  let newCount = 0;

  // Status messages
  let statusMessage: {
    type: "success" | "error" | "info";
    text: string;
  } | null = null;

  function showStatus(type: "success" | "error" | "info", text: string) {
    statusMessage = { type, text };
    setTimeout(() => (statusMessage = null), 5000);
  }

  function calculateStats() {
    total = people.length;
    present = people.filter((p) => p.present).length;
    newCount = people.filter((p) => p.isNew).length;
    statsLoaded = true;

  }

  async function loadStats() {
    try {
      statsLoaded = false;
      isLoadingAttendees = true;
      await attendeesStore.refreshData();
      // Stats will be calculated in the subscription callback
      showStatus('success', 'Data refreshed successfully');
    } catch (error: any) {
      showStatus("error", error.message || "Failed to load statistics.");
    } finally {
      isLoadingAttendees = false;
    }
  }

  // Initial load
  onMount(() => {
    const unsubscribe = attendeesStore.subscribe((value) => {
      people = value.data;
      isLoadingAttendees = value.loading;
      attendeesError = value.error;
      storeInitialized = value.initialized;
      
      // Calculate stats whenever data changes
      if (value.initialized && !value.loading) {
        calculateStats();
      }
    });

    return () => unsubscribe();
  });
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
          <CheckCircle class="h-5 w-5" />
        {:else if statusMessage.type === "error"}
          <AlertCircle class="h-5 w-5" />
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
      <a href="/" class="flex items-center gap-2">
        <ArrowLeft class="h-5 w-5" />
        <BookType class="h-6 w-6" />
      </a>
    </div>
    <div class="flex items-center gap-3">
      <Button
        variant="outline"
        size="sm"
        on:click={loadStats}
        disabled={isLoadingAttendees}
      >
        {#if isLoadingAttendees}
          <Loader2 class="mr-2 h-4 w-4 animate-spin" />
          Loading...
        {:else}
          <RefreshCw class="mr-2 h-4 w-4" />
          Refresh
        {/if}
      </Button>
      <form action="/logout" method="POST">
        <Button type="submit" variant="outline" size="icon" aria-label="Logout">
          <LogOut class="h-5 w-5" />
        </Button>
      </form>
    </div>
  </header>

  <main class="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
    <div class="mt-6 mx-auto w-full max-w-6xl">
      <h2 class="text-lg sm:text-2xl font-semibold mb-4 text-center text-primary-dark">
        Attendance Analytics
      </h2>
      <p class="mb-6 text-center text-sm sm:text-base text-muted-foreground">
        Overview of attendance statistics.
      </p>
      
      {#if attendeesError && storeInitialized}
        <div class="text-center p-4 bg-red-100 border border-red-400 text-red-700 rounded-md">
          <AlertCircle class="inline-block mr-2 h-5 w-5" />
          Could not load analytics: {attendeesError}.
          <Button 
            size="sm" 
            variant="link" 
            on:click={loadStats} 
            class="text-red-700"
            disabled={isLoadingAttendees}
          >
            Try again
          </Button>
        </div>
      {:else if !storeInitialized || isLoadingAttendees}
        <div class="text-center py-8">
          <div class="flex flex-col items-center justify-center gap-4">
            <Loader2 class="h-12 w-12 animate-spin text-primary/70" />
            <p class="text-muted-foreground">
              Loading attendance data...
            </p>
          </div>
        </div>
      {:else}
        <!-- Only the 3 core stats cards -->
        <div class="grid gap-4 md:grid-cols-3">
          {#each [
            { title: "Total Attendees", value: total, icon: Users },
            { title: "Currently Present", value: present, icon: CheckCircle },
            { title: "New Attendees", value: newCount, icon: Sparkles }
          ] as item (item.title)}
            <Card.Root class="hover:shadow-md transition-shadow border border-primary/10 bg-white">
              <Card.Header class="flex flex-row items-center justify-between p-4">
                <Card.Title class="text-base sm:text-lg font-medium text-primary-dark">
                  {item.title}
                </Card.Title>
                <item.icon class="h-5 w-5 text-primary/70" />
              </Card.Header>
              <Card.Content class="p-4 pt-0">
                <div class="text-2xl sm:text-3xl font-bold text-center py-2 text-primary-dark">
                  {item.value}
                </div>
              </Card.Content>
            </Card.Root>
          {/each}
        </div>
      {/if}
    </div>
  </main>
</div>