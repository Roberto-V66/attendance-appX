<!-- src/routes/+layout.svelte -->
<script>
    import '../app.css'; // Import global styles
    import { isAuthenticated } from '$lib/stores/authStore.js';
    import { page } from '$app/stores';
    import { SvelteToast } from '@zerodevx/svelte-toast'; 
    $: isAuthenticated.set($page.data.isAuthenticated); // Sync with server-set locals
</script>

<SvelteToast /> <!-- Optional: for notifications -->

{#if $isAuthenticated || $page.url.pathname === '/login'}
    <slot />
{:else if $page.url.pathname !== '/login'}
    <!-- This part handles initial load before hooks redirect -->
    <p>Loading...</p>
{/if}