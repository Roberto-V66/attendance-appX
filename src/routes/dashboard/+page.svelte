'<script lang="ts">
    import File from "lucide-svelte/icons/file";
    import Calendar from "lucide-svelte/icons/calendar-days";
    import ChartLine from "lucide-svelte/icons/chart-line";
    import Ellipsis from "lucide-svelte/icons/ellipsis";
    import Package from "lucide-svelte/icons/package";
    import Package2 from "lucide-svelte/icons/package-2";
    import PanelLeft from "lucide-svelte/icons/panel-left";
    import CirclePlus from "lucide-svelte/icons/circle-plus";
    import Search from "lucide-svelte/icons/search";
    import Stats from "lucide-svelte/icons/chart-no-axes-combined";
 
    import { Badge } from "$lib/components/ui/badge/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import * as DropdownMenu from "$lib/components/ui/dropdown-menu/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
    import * as Table from "$lib/components/ui/table/index.js";
    import * as Tabs from "$lib/components/ui/tabs/index.js";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  </script>
  
  <div class="bg-muted/40 flex min-h-screen w-full flex-col">
    <aside class="bg-background fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r sm:flex">
      <nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
        <a
          href="##"
          class="bg-primary text-primary-foreground group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:h-8 md:w-8 md:text-base"
        >
          <Package2 class="h-4 w-4 taransition-all group-hover:scale-110" />
          <span class="sr-only">Att Inc</span>
        </a>
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <a
              href="##"
              class="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8"
              use:builder.action
              {...builder}
            >
              <Calendar class="h-5 w-5" />
              <span class="sr-only">Events</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">Events</Tooltip.Content>
        </Tooltip.Root>
        
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <a
              href="##"
              class="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8"
              use:builder.action
              {...builder}
            >
              <ChartLine class="h-5 w-5" />
              <span class="sr-only">Analytics</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">Analytics</Tooltip.Content>
        </Tooltip.Root>
      </nav>
    
    </aside>
    <div class="flex flex-col sm:gap-4 sm:py-4 sm:pl-14">
      <header
        class="bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
      >
        <Sheet.Root>
          <Sheet.Trigger asChild let:builder>
            <Button builders={[builder]} size="icon" variant="outline" class="sm:hidden">
              <PanelLeft class="h-5 w-5" />
              <span class="sr-only">Toggle Menu</span>
            </Button>
          </Sheet.Trigger>
          <Sheet.Content side="left" class="sm:max-w-xs">
            <nav class="grid gap-6 text-lg font-medium">
              <a
                href="##"
                class="bg-primary text-primary-foreground group flex h-10 w-10 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:text-base"
              >
                <Package2 class="h-5 w-5 transition-all group-hover:scale-110" />
                <span class="sr-only">Acme Inc</span>
              </a>
              <a
                href="##"
                class="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
              >
                <Calendar class="h-5 w-5" />
                Events
              </a>
              <a
                href="##"
                class="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
              >
                <Stats class="h-5 w-5" />
                Statistics
              </a>
            </nav>
          </Sheet.Content>
        </Sheet.Root>
        
        <div class="relative ml-auto flex-1 md:grow-0">
          <Search class="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4" />
          <Input
            type="search"
            placeholder="Search..."
            class="bg-background w-full rounded-lg pl-8 md:w-[200px] lg:w-[336px]"
          />
        </div>
      </header>
      <main class="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
        <Tabs.Root value="all">
          <div class="flex items-center">
            <div class="ml-auto flex items-center gap-2">
              <Button size="sm" variant="outline" class="h-8 gap-1">
                <File class="h-3.5 w-3.5" />
                <span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Export
                </span>
              </Button>
              <Button size="sm" class="h-8 gap-1">
                <CirclePlus class="h-3.5 w-3.5" />
                <span class="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Add Person
                </span>
              </Button>
            </div>
          </div>
          <Tabs.Content value="all">
            <Card.Root>
              <Card.Header>
                <Card.Title>Poeple</Card.Title>
                <Card.Description>
                  Manage your poeple and view their attendance rate.
                </Card.Description>
              </Card.Header>
              <Card.Content>
                <Table.Root>
                  <Table.Header>
                    <Table.Row>
                      <Table.Head class="hidden w-[100px] sm:table-cell">
                        <span class="sr-only">Image</span>
                      </Table.Head>
                      <Table.Head>Name</Table.Head>
                      <Table.Head>Status</Table.Head>
                      <Table.Head class="hidden md:table-cell">Price</Table.Head>
                      <Table.Head class="hidden md:table-cell">
                        Total Sales
                      </Table.Head>
                      <Table.Head class="hidden md:table-cell">
                        Created at
                      </Table.Head>
                      <Table.Head>
                        <span class="sr-only">Actions</span>
                      </Table.Head>
                    </Table.Row>
                  </Table.Header>
                  <Table.Body>
                    <Table.Row>
                      <Table.Cell class="hidden sm:table-cell">
                        <img
                          alt="Product example"
                          class="aspect-square rounded-md object-cover"
                          height="64"
                          src="/images/placeholder.svg"
                          width="64"
                        />
                      </Table.Cell>
                      <Table.Cell class="font-medium">
                        Laser Lemonade Machine
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="outline">Draft</Badge>
                      </Table.Cell>
                      <Table.Cell class="hidden md:table-cell">
                        $499.99
                      </Table.Cell>
                      <Table.Cell class="hidden md:table-cell">25</Table.Cell>
                      <Table.Cell class="hidden md:table-cell">
                        2023-07-12 10:42 AM
                      </Table.Cell>
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
                              <span class="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end">
                            <DropdownMenu.Label>Actions</DropdownMenu.Label>
                            <DropdownMenu.Item>Edit</DropdownMenu.Item>
                            <DropdownMenu.Item>Delete</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell class="hidden sm:table-cell">
                        <img
                          alt="Product"
                          class="aspect-square rounded-md object-cover"
                          height="64"
                          src="/images/placeholder.svg"
                          width="64"
                        />
                      </Table.Cell>
                      <Table.Cell class="font-medium">
                        Hypernova Headphones
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="outline">Active</Badge>
                      </Table.Cell>
                      <Table.Cell class="hidden md:table-cell">
                        $129.99
                      </Table.Cell>
                      <Table.Cell class="hidden md:table-cell">100</Table.Cell>
                      <Table.Cell class="hidden md:table-cell">
                        2023-10-18 03:21 PM
                      </Table.Cell>
                      <Table.Cell>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild let:builder>
                            <Button
                              builders={[builder]}
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <Ellipsis class="h-4 w-4" />
                              <span class="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end">
                            <DropdownMenu.Label>Actions</DropdownMenu.Label>
                            <DropdownMenu.Item>Edit</DropdownMenu.Item>
                            <DropdownMenu.Item>Delete</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell class="hidden sm:table-cell">
                        <img
                          alt="Product"
                          class="aspect-square rounded-md object-cover"
                          height="64"
                          src="/images/placeholder.svg"
                          width="64"
                        />
                      </Table.Cell>
                      <Table.Cell class="font-medium">
                        AeroGlow Desk Lamp
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="outline">Active</Badge>
                      </Table.Cell>
                      <Table.Cell class="hidden md:table-cell">$39.99</Table.Cell>
                      <Table.Cell class="hidden md:table-cell">50</Table.Cell>
                      <Table.Cell class="hidden md:table-cell">
                        2023-11-29 08:15 AM
                      </Table.Cell>
                      <Table.Cell>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild let:builder>
                            <Button
                              builders={[builder]}
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <Ellipsis class="h-4 w-4" />
                              <span class="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end">
                            <DropdownMenu.Label>Actions</DropdownMenu.Label>
                            <DropdownMenu.Item>Edit</DropdownMenu.Item>
                            <DropdownMenu.Item>Delete</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell class="hidden sm:table-cell">
                        <img
                          alt="Product"
                          class="aspect-square rounded-md object-cover"
                          height="64"
                          src="/images/placeholder.svg"
                          width="64"
                        />
                      </Table.Cell>
                      <Table.Cell class="font-medium">
                        TechTonic Energy Drink
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="secondary">Draft</Badge>
                      </Table.Cell>
                      <Table.Cell class="hidden md:table-cell">$2.99</Table.Cell>
                      <Table.Cell class="hidden md:table-cell">0</Table.Cell>
                      <Table.Cell class="hidden md:table-cell">
                        2023-12-25 11:59 PM
                      </Table.Cell>
                      <Table.Cell>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild let:builder>
                            <Button
                              builders={[builder]}
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <Ellipsis class="h-4 w-4" />
                              <span class="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end">
                            <DropdownMenu.Label>Actions</DropdownMenu.Label>
                            <DropdownMenu.Item>Edit</DropdownMenu.Item>
                            <DropdownMenu.Item>Delete</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell class="hidden sm:table-cell">
                        <img
                          alt="Product"
                          class="aspect-square rounded-md object-cover"
                          height="64"
                          src="/images/placeholder.svg"
                          width="64"
                        />
                      </Table.Cell>
                      <Table.Cell class="font-medium">
                        Gamer Gear Pro Controller
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="outline">Active</Badge>
                      </Table.Cell>
                      <Table.Cell class="hidden md:table-cell">$59.99</Table.Cell>
                      <Table.Cell class="hidden md:table-cell">75</Table.Cell>
                      <Table.Cell class="hidden md:table-cell">
                        2024-01-01 12:00 AM
                      </Table.Cell>
                      <Table.Cell>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild let:builder>
                            <Button
                              builders={[builder]}
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <Ellipsis class="h-4 w-4" />
                              <span class="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end">
                            <DropdownMenu.Label>Actions</DropdownMenu.Label>
                            <DropdownMenu.Item>Edit</DropdownMenu.Item>
                            <DropdownMenu.Item>Delete</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Table.Cell>
                    </Table.Row>
                    <Table.Row>
                      <Table.Cell class="hidden sm:table-cell">
                        <img
                          alt="Product"
                          class="aspect-square rounded-md object-cover"
                          height="64"
                          src="/images/placeholder.svg"
                          width="64"
                        />
                      </Table.Cell>
                      <Table.Cell class="font-medium">
                        Luminous VR Headset
                      </Table.Cell>
                      <Table.Cell>
                        <Badge variant="outline">Active</Badge>
                      </Table.Cell>
                      <Table.Cell class="hidden md:table-cell">
                        $199.99
                      </Table.Cell>
                      <Table.Cell class="hidden md:table-cell">30</Table.Cell>
                      <Table.Cell class="hidden md:table-cell">
                        2024-02-14 02:14 PM
                      </Table.Cell>
                      <Table.Cell>
                        <DropdownMenu.Root>
                          <DropdownMenu.Trigger asChild let:builder>
                            <Button
                              builders={[builder]}
                              aria-haspopup="true"
                              size="icon"
                              variant="ghost"
                            >
                              <Ellipsis class="h-4 w-4" />
                              <span class="sr-only">Toggle menu</span>
                            </Button>
                          </DropdownMenu.Trigger>
                          <DropdownMenu.Content align="end">
                            <DropdownMenu.Label>Actions</DropdownMenu.Label>
                            <DropdownMenu.Item>Edit</DropdownMenu.Item>
                            <DropdownMenu.Item>Delete</DropdownMenu.Item>
                          </DropdownMenu.Content>
                        </DropdownMenu.Root>
                      </Table.Cell>
                    </Table.Row>
                  </Table.Body>
                </Table.Root>
              </Card.Content>
              <Card.Footer>
                <div class="text-muted-foreground text-xs">
                  Showing <strong>1-10</strong> of <strong>32</strong> poeple
                </div>
              </Card.Footer>
            </Card.Root>
          </Tabs.Content>
        </Tabs.Root>
      </main>
    </div>
  </div>
  