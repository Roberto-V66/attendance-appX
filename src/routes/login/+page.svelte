<!-- src/routes/login/+page.svelte -->
<script>
    import { enhance } from '$app/forms';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    export let form;
</script>

<div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <h1 class="text-2xl font-bold mb-6 text-center text-gray-700">Login</h1>
        <form method="POST" use:enhance>
            {#if form?.error}
                <p class="text-red-500 text-sm mb-4" transition:fly={{ y: -10, duration: 300, easing: quintOut }}>
                    {form.error}
                </p>
            {/if}
            {#if form?.lockedOut}
                 <p class="text-orange-500 text-sm mb-4" transition:fly={{ y: -10, duration: 300, easing: quintOut }}>
                    Too many attempts. Try again in {Math.ceil(form.lockoutTime / 60000)} minutes.
                </p>
            {/if}

            <div class="mb-4">
                <label for="password" class="block text-sm font-medium text-gray-600 mb-1">Password</label>
                <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
            </div>
            <button
                type="submit"
                class="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
                Enter
            </button>
        </form>
    </div>
</div>

<style>
    /* Basic Tailwind utility classes assumed or add a global.css */
    /* You can add <svelte:head><link href="/path/to/tailwind.css" rel="stylesheet"></svelte:head> or setup Tailwind properly */
</style>