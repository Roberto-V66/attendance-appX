<script>
    import { onMount } from 'svelte';
    import { Package2, CalendarDays, ChartNoAxesCombined, UsersRound, Settings as SettingsIcon } from "lucide-svelte/icons";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";
  
    export let role = ''; // 'admin' or 'secretary'
  
    // Redirect secretary immediately to their events page
    onMount(() => {
      if (role === 'secretary') {
        window.location.href = '/secretary/events';
      }
    });
  </script>
  
  {#if role === 'admin'}
  <aside class="bg-background fixed inset-y-0 left-0 z-10 hidden w-14 flex-col border-r sm:flex">
    <!-- Main Navigation -->
    <nav class="flex flex-col items-center gap-4 px-2 sm:py-5">
      <!-- Brand/Home -->
      <Tooltip.Root>
        <Tooltip.Trigger asChild let:builder>
          <a
            href="/dashboard"
            class="bg-primary text-primary-foreground group flex h-9 w-9 shrink-0 items-center justify-center gap-2 rounded-full text-lg font-semibold md:h-8 md:w-8 md:text-base"
            use:builder.action
            {...builder}
          >
            <Package2 class="h-4 w-4 transition-all group-hover:scale-110" />
            <span class="sr-only">Att Inc</span>
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">Dashboard</Tooltip.Content>
      </Tooltip.Root>
  
      <!-- Admin Navigation Items -->
      {#each [
        { icon: CalendarDays, href: "/admin/events", label: "Events" },
        { icon: ChartNoAxesCombined, href: "/admin/analytics", label: "Statistics" },
        { icon: UsersRound, href: "/admin/members", label: "Members" }
      ] as item}
        <Tooltip.Root>
          <Tooltip.Trigger asChild let:builder>
            <a
              href={item.href}
              class="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8"
              use:builder.action
              {...builder}
            >
              <item.icon class="h-5 w-5" />
              <span class="sr-only">{item.label}</span>
            </a>
          </Tooltip.Trigger>
          <Tooltip.Content side="right">{item.label}</Tooltip.Content>
        </Tooltip.Root>
      {/each}
    </nav>
  
    <!-- Bottom Navigation -->
    <nav class="mt-auto flex flex-col items-center gap-4 px-2 sm:py-5">
      <Tooltip.Root>
        <Tooltip.Trigger asChild let:builder>
          <a
            href="/admin/settings"
            class="text-muted-foreground hover:text-foreground flex h-9 w-9 items-center justify-center rounded-lg transition-colors md:h-8 md:w-8"
            use:builder.action
            {...builder}
          >
            <SettingsIcon class="h-5 w-5" />
            <span class="sr-only">Settings</span>
          </a>
        </Tooltip.Trigger>
        <Tooltip.Content side="right">Settings</Tooltip.Content>
      </Tooltip.Root>
    </nav>
  </aside>
  {/if}