<script>
  import File from "lucide-svelte/icons/file";
  import CirclePlus from "lucide-svelte/icons/circle-plus";

  import { Button } from "$lib/components/ui/button/index.js";
  import * as Tabs from "$lib/components/ui/tabs/index.js";
  import EventTable from "./EventTable.svelte";
  import { goto } from '$app/navigation'; // For navigation

  // This component is likely for admins
  function handleAddEvent() {
    goto('/admin/events/new'); // Navigate to a new event creation page
  }
</script>

<Tabs.Root value="all" class="w-full">
  <div class="flex items-center">
    <div class="ml-auto flex items-center gap-2">
      <Button size="sm" variant="outline" class="h-8 gap-1">
        <File class="h-3.5 w-3.5" />
        <span class="sr-only sm:not-sr-only sm:whitespace-nowrap">Export</span>
      </Button>
      <Button size="sm" class="h-8 gap-1" on:click={handleAddEvent}>
        <CirclePlus class="h-3.5 w-3.5" />
        <span class="sr-only sm:not-sr-only sm:whitespace-nowrap"
          >Add Event</span
        >
      </Button>
    </div>
  </div>
  <Tabs.Content value="all">
    <EventTable />
  </Tabs.Content>
</Tabs.Root>