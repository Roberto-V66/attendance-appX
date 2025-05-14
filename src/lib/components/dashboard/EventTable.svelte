<script>
  import Ellipsis from "lucide-svelte/icons/ellipsis";
  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Kard from "$lib/components/ui/card/index.js"; // Renamed to Kard
  import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
  import { onMount } from "svelte";
  import { userStore } from '$lib/stores/userStore.js'; // Assuming you create this
  // import { db } from '$lib/firebase.js'; // Assuming you create this
  // import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';

  // svelte-ignore export_let_unused
    export let events = []; // Will be populated from Firestore

  // Dummy data for now, replace with Firestore fetching
  let eventItems = [
    {
      id: "evt1",
      name: "Community Meetup",
      status: "Upcoming", // Example statuses: Upcoming, Past, Draft
      date: "2024-08-15",
      attendees: 0, // Placeholder, could be expected or actual count
      createdAt: "2024-07-01 10:00 AM",
    },
    {
      id: "evt2",
      name: "Tech Workshop",
      status: "Past",
      date: "2024-06-20",
      attendees: 45,
      createdAt: "2024-05-10 02:00 PM",
    },
  ];

  // onMount(async () => {
  //   if ($userStore && $userStore.teamId) {
  //     const q = query(collection(db, "events"), where("teamId", "==", $userStore.teamId));
  //     const querySnapshot = await getDocs(q);
  //     let fetchedEvents = [];
  //     querySnapshot.forEach((doc) => {
  //       fetchedEvents.push({ id: doc.id, ...doc.data() });
  //     });
  //     eventItems = fetchedEvents; // Update with fetched data
  //   }
  // });

  function handleEdit(eventId) {
    // goto(`/admin/events/${eventId}/edit`);
    console.log("Edit event:", eventId);
  }

  async function handleDelete(eventId) {
    if (confirm("Are you sure you want to delete this event?")) {
      // await deleteDoc(doc(db, "events", eventId));
      // eventItems = eventItems.filter(event => event.id !== eventId); // Update UI
      console.log("Delete event:", eventId);
    }
  }
</script>

<Kard.Root>
  <Kard.Header>
    <Kard.Title>Events</Kard.Title>
    <Kard.Description>Manage your events and view their status.</Kard.Description>
  </Kard.Header>
  <Kard.Content>
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.Head>Name</Table.Head>
          <Table.Head>Status</Table.Head>
          <Table.Head class="hidden md:table-cell">Date</Table.Head>
          <Table.Head class="hidden md:table-cell">Attendees</Table.Head>
          <Table.Head class="hidden md:table-cell">Created at</Table.Head>
          <Table.Head>
            <span class="sr-only">Actions</span>
          </Table.Head>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {#each eventItems as item}
          <Table.Row>
            <Table.Cell class="font-medium">{item.name}</Table.Cell>
            <Table.Cell>
              <Badge variant={item.status === 'Upcoming' ? 'default' : (item.status === 'Past' ? 'secondary' : 'outline')}>{item.status}</Badge>
            </Table.Cell>
            <Table.Cell class="hidden md:table-cell">{item.date}</Table.Cell>
            <Table.Cell class="hidden md:table-cell">{item.attendees}</Table.Cell>
            <Table.Cell class="hidden md:table-cell">{item.createdAt}</Table.Cell>
            <Table.Cell>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger asChild let:builder>
                  <Button
                    aria-haspopup="true"
                    size="icon"
                    variant="ghost"
                    builders={[builder]}
                  >
                    <Ellipsis class="h-4 w-4" />
                    <span class="sr-only">Toggle menu for {item.name}</span>
                  </Button>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content align="end">
                  <DropdownMenu.Label>Actions</DropdownMenu.Label>
                  <DropdownMenu.Item on:click={() => handleEdit(item.id)}>Edit</DropdownMenu.Item>
                  <DropdownMenu.Item on:click={() => handleDelete(item.id)}>Delete</DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Table.Cell>
          </Table.Row>
        {/each}
      </Table.Body>
    </Table.Root>
  </Kard.Content>
  <Kard.Footer>
    <div class="text-muted-foreground text-xs">
      Showing <strong>1-{eventItems.length > 10 ? 10 : eventItems.length}</strong> of <strong>{eventItems.length}</strong> events
    </div>
  </Kard.Footer>
</Kard.Root>