<!-- src/routes/+layout.svelte -->
<script>
    import "../app.css";
    import { isAuthenticated } from "$lib/stores/authStore.js";
    import { page } from "$app/stores";
    import { SvelteToast } from "@zerodevx/svelte-toast";
    import { onMount } from "svelte";

    // For optional offline UI banner
    let online = true;
    
    // Keep the reactive statement for auth state
    $: isAuthenticated.set($page.data.isAuthenticated);

    onMount(() => {
        // Online/offline status for UI
        online = navigator.onLine;
        const goOnline = () => (online = true);
        const goOffline = () => (online = false);
        window.addEventListener("online", goOnline);
        window.addEventListener("offline", goOffline);

        return () => {
            window.removeEventListener("online", goOnline);
            window.removeEventListener("offline", goOffline);
        };
    });
</script>

<SvelteToast />

{#if !online}
    <div
        style="background-color: #ffcc00; color: black; text-align: center; padding: 8px; position: fixed; bottom: 0; left: 0; width: 100%; z-index: 5000;"
    >
        You are currently offline. Changes will be synced automatically when you
        reconnect.
    </div>
{/if}

{#if $isAuthenticated || $page.url.pathname === "/login"}
    <slot />
{:else if $page.url.pathname !== "/login"}
    <p>Loading application state...</p>
{/if}