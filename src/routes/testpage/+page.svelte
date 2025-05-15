<script lang="ts">
  import {
    ArrowUpRight,
    CreditCard,
    DollarSign,
    Users,
    Search,
    LogOut,
    Download,
    CirclePlus,
    File,
  } from "lucide-svelte";

  import { Badge } from "$lib/components/ui/badge/index.js";
  import { Button } from "$lib/components/ui/button/index.js";
  import * as Card from "$lib/components/ui/card/index.js";
  import { Input } from "$lib/components/ui/input/index.js";
  import * as Table from "$lib/components/ui/table/index.js";
</script>

<div class="flex min-h-screen w-full flex-col">
  <header
    class="bg-background sticky top-0 flex h-16 items-center gap-4 border-b px-4 md:px-6"
  >
    <div class="flex w-full items-center gap-4 md:ml-auto md:gap-2 lg:gap-4">
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
            <Button size="sm" class="h-8 gap-1">
              <CirclePlus class="h-3.5 w-3.5" />
              Add
            </Button>
            <Button href="##" size="sm" class="ml-auto gap-1">
              View
              <ArrowUpRight class="h-4 w-4" />
            </Button>
            <Button href="##" size="sm" class="ml-auto gap-1">
              <Download class="h-3.5 w-3.5" />
              Export
            </Button>
            <Button size="sm" variant="outline" class="h-8">
              <LogOut class="h-3.5 w-3.5" />
              Logout
            </Button>
          </div>
        </Card.Header>
        <Card.Content>
          <Table.Root class="w-full">
            <Table.Header>
              <Table.Row>
                <Table.Head>NAME</Table.Head>
                <Table.Head class="hidden md:table-cell">CONTACT</Table.Head>
                <Table.Head class="hidden md:table-cell">AGE RANGE</Table.Head>
                <Table.Head class="hidden md:table-cell">DATE</Table.Head>
                <Table.Head class="text-right">PRESENT</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              <Table.Row>
                <Table.Cell>
                  <div class="font-medium">Liam Johnson</div>
                  <div class="text-muted-foreground hidden text-sm md:inline">
                    liam@example.com
                  </div>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">Sale</Table.Cell>
                <Table.Cell class="hidden md:table-cell">
                  <Badge class="text-xs" variant="outline">Approved</Badge>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">2023-06-23</Table.Cell>
                <Table.Cell class="text-right">$250.00</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <div class="font-medium">Olivia Smith</div>
                  <div class="text-muted-foreground hidden text-sm md:inline">
                    olivia@example.com
                  </div>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">Refund</Table.Cell>
                <Table.Cell class="hidden md:table-cell">
                  <Badge class="text-xs" variant="outline">Declined</Badge>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">2023-06-24</Table.Cell>
                <Table.Cell class="text-right">$150.00</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <div class="font-medium">Noah Williams</div>
                  <div class="text-muted-foreground hidden text-sm md:inline">
                    noah@example.com
                  </div>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">
                  Subscription
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">
                  <Badge class="text-xs" variant="outline">Approved</Badge>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">2023-06-25</Table.Cell>
                <Table.Cell class="text-right">$350.00</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <div class="font-medium">Emma Brown</div>
                  <div class="text-muted-foreground hidden text-sm md:inline">
                    emma@example.com
                  </div>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">Sale</Table.Cell>
                <Table.Cell class="hidden md:table-cell">
                  <Badge class="text-xs" variant="outline">Approved</Badge>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">2023-06-26</Table.Cell>
                <Table.Cell class="text-right">$450.00</Table.Cell>
              </Table.Row>
              <Table.Row>
                <Table.Cell>
                  <div class="font-medium">Liam Johnson</div>
                  <div class="text-muted-foreground hidden text-sm md:inline">
                    liam@example.com
                  </div>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">Sale</Table.Cell>
                <Table.Cell class="hidden md:table-cell">
                  <Badge class="text-xs" variant="outline">Approved</Badge>
                </Table.Cell>
                <Table.Cell class="hidden md:table-cell">2023-06-27</Table.Cell>
                <Table.Cell class="text-right">$550.00</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Card.Content>
      </Card.Root>
    </div>

     <div class="text-center mt-2">
          <Card.Title>Analytics</Card.Title>
          <Card.Description
            >View the attendance statistics.</Card.Description
          >
        </div>
    <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
     
      <Card.Root class="w-full">
        <Card.Header
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <Card.Title class="text-sm font-medium">Total Poeple</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">1211</div>
        </Card.Content>
      </Card.Root>
      <Card.Root class="w-full">
        <Card.Header
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <Card.Title class="text-sm font-medium">Poeple Present</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">210</div>
        </Card.Content>
      </Card.Root>
      <Card.Root class="w-full">
        <Card.Header
          class="flex flex-row items-center justify-between space-y-0 pb-2"
        >
          <Card.Title class="text-sm font-medium">New poeple</Card.Title>
        </Card.Header>
        <Card.Content>
          <div class="text-2xl font-bold">24</div>
        </Card.Content>
      </Card.Root>
    </div>
  </main>
</div>
