<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { enhance } from '$app/forms';
    import { fly, fade } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { Lock, Eye, EyeOff } from 'lucide-svelte';
     import {
        AlertCircle,
        AlertTriangle,
        Loader2
  } from "lucide-svelte";

    export let form;
    
    let passwordVisible = false;
    let isSubmitting = false;

    function togglePasswordVisibility() {
        passwordVisible = !passwordVisible;
    }
</script>

<div class="min-h-screen w-full bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
    <Card.Root 
        class="w-full max-w-md shadow-xl border-0 bg-white/90 backdrop-blur-sm"
    >
        <Card.Header class="space-y-4">
            <div class="flex justify-center">
                <div class="bg-blue-100 p-4 rounded-full">
                    <Lock class="h-8 w-8 text-blue-600" />
                </div>
            </div>
            <Card.Title class="text-center space-y-2">
                <h1 class="text-3xl font-bold text-gray-900">
                    Attendance Tracker
                </h1>
                <h3 class="text-lg text-gray-600">
                    Secure Admin Access
                </h3>
            </Card.Title>
            <Card.Description class="text-center text-gray-500">
                Enter the organization password to continue
            </Card.Description>
        </Card.Header>

        <Card.Content class="space-y-4">
            <form 
                method="POST" 
                use:enhance={() => {
                    isSubmitting = true;
                    return async ({ update }) => {
                        await update();
                        isSubmitting = false;
                    };
                }}
            >
                {#if form?.error}
                    <div 
                        class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-md mb-4 flex items-start gap-2"
                        transition:fly={{ y: -10, duration: 300, easing: quintOut }}
                    >
                        <AlertCircle class="h-5 w-5 mt-0.5 flex-shrink-0" />
                        <div>
                            <p class="font-medium">{form.error}</p>
                            {#if form.attemptsLeft}
                                <p class="text-sm mt-1">Attempts left: {form.attemptsLeft}</p>
                            {/if}
                        </div>
                    </div>
                {/if}

                {#if form?.lockedOut}
                    <div 
                        class="bg-orange-50 border border-orange-200 text-orange-600 px-4 py-3 rounded-md mb-4"
                        transition:fly={{ y: -10, duration: 300, easing: quintOut }}
                    >
                        <div class="flex items-start gap-2">
                            <AlertTriangle class="h-5 w-5 mt-0.5 flex-shrink-0" />
                            <div>
                                <p class="font-medium">Too many attempts</p>
                                <p class="text-sm mt-1">
                                    Try again in {Math.ceil(form.lockoutTime / 60000)} minutes
                                </p>
                            </div>
                        </div>
                    </div>
                {/if}

                <div class="space-y-2">
                    <Label for="password" class="text-gray-700">Password</Label>
                    <div class="relative">
                        <Input
                            id="password"
                            name="password"
                            type={passwordVisible ? 'text' : 'password'}
                            required
                            class="w-full pr-10"
                            placeholder="Enter organization password"
                        />
                        <button
                            type="button"
                            class="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            on:click={togglePasswordVisibility}
                            aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                        >
                            {#if passwordVisible}
                                <EyeOff class="h-5 w-5" />
                            {:else}
                                <Eye class="h-5 w-5" />
                            {/if}
                        </button>
                    </div>
                </div>

                <Card.Footer class="pt-6 pb-0 px-0">
                    <Button 
                        type="submit" 
                        class="w-full gap-2"
                        disabled={isSubmitting || form?.lockedOut}
                    >
                        {#if isSubmitting}
                            <Loader2 class="h-4 w-4 animate-spin" />
                            <span>Signing in...</span>
                        {:else}
                            <span>Sign in</span>
                        {/if}
                    </Button>
                </Card.Footer>
            </form>
        </Card.Content>
    </Card.Root>
</div>