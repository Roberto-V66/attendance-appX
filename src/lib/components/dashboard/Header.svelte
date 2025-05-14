<script lang="ts">
    import PanelLeft from "lucide-svelte/icons/panel-left";
    import Package2 from "lucide-svelte/icons/package-2";
    import CalendarDays from "lucide-svelte/icons/calendar-days";
    import ChartNoAxesCombined from "lucide-svelte/icons/chart-no-axes-combined";
    import UsersRound from "lucide-svelte/icons/users-round";
    import Settings from "lucide-svelte/icons/settings";
    import Search from "lucide-svelte/icons/search";
  
    import * as Breadcrumb from "$lib/components/ui/breadcrumb/index.js";
    import { Button } from "$lib/components/ui/button/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import * as Sheet from "$lib/components/ui/sheet/index.js";
  </script>
  
  <header
    class="bg-background sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4 sm:static sm:h-auto sm:border-0 sm:bg-transparent sm:px-6"
  >
    <Sheet.Root>
      <Sheet.Trigger asChild let:builder>
        <Button
          builders={[builder]}
          size="icon"
          variant="outline"
          class="sm:hidden"
        >
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
            <span class="sr-only">Att Inc</span>
          </a>
          <a
            href="##"
            class="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
          >
            <CalendarDays class="h-5 w-5" />
            Events
          </a>
          <a
            href="##"
            class="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
          >
            <ChartNoAxesCombined class="h-5 w-5" />
            Statistics
          </a>
          <a
            href="##"
            class="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
          >
            <UsersRound class="h-5 w-5" />
            Members
          </a>
          <a
            href="##"
            class="text-muted-foreground hover:text-foreground flex items-center gap-4 px-2.5"
          >
            <Settings class="h-5 w-5" />
            Settings
          </a>
        </nav>
      </Sheet.Content>
    </Sheet.Root>
  
    <Breadcrumb.Root class="hidden md:flex">
      <Breadcrumb.List>
        <Breadcrumb.Item>
          <Breadcrumb.Link href="##">Events</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Link href="##">Event 1</Breadcrumb.Link>
        </Breadcrumb.Item>
        <Breadcrumb.Separator />
        <Breadcrumb.Item>
          <Breadcrumb.Page>Register</Breadcrumb.Page>
        </Breadcrumb.Item>
      </Breadcrumb.List>
    </Breadcrumb.Root>
  
    <div class="relative ml-auto flex-1 md:grow-0">
      <Search
        class="text-muted-foreground absolute left-2.5 top-2.5 h-4 w-4"
      />
      <Input
        type="search"
        placeholder="Search..."
        class="bg-background w-full rounded-lg pl-8 md:w-[200px] lg:w-[336px]"
      />
    </div>
  </header>