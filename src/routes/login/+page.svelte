<script lang="ts">
    import { Button } from "$lib/components/ui/button/index.js";
    import * as Card from "$lib/components/ui/card/index.js";
    import { Input } from "$lib/components/ui/input/index.js";
    import { Label } from "$lib/components/ui/label/index.js";
    import { enhance } from '$app/forms';
    import { fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';

    export let form;
</script>

<div
    style="display: flex; justify-content: center; align-items: center; min-height: 100dvh;"
>
    <Card.Root class="w-full max-w-md">
        <Card.Header>
            <Card.Title class="text-2xl">
                <h1
                    class="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl mt-2 mb-4 text-center"
                >
                    Attendance Tracker MVP
                </h1>
                <h3 class="scroll-m-20 text-2xl font-semibold tracking-tight text-center mb-4">
                    One-Password Access • Real-Time Collaboration • Export-Ready
                </h3>
            </Card.Title>
            <Card.Description class="leading-7 [&:not(:first-child)]:mt-4 text-center">
                Enter the password to login to the app.
            </Card.Description>
        </Card.Header>

        <Card.Content class="grid gap-4">
            <form method="POST" use:enhance>
                {#if form?.error}
                    <p 
                        class="text-red-500 text-sm mb-4 text-center" 
                        transition:fly={{ y: -10, duration: 300, easing: quintOut }}
                    >
                        {form.error}
                    </p>
                {/if}
                {#if form?.lockedOut}
                    <p 
                        class="text-orange-500 text-sm mb-4 text-center" 
                        transition:fly={{ y: -10, duration: 300, easing: quintOut }}
                    >
                        Too many attempts. Try again in {Math.ceil(form.lockoutTime / 60000)} minutes.
                    </p>
                {/if}

                <div class="grid gap-2">
                    <Label for="password">Password</Label>
                    <Input 
                        id="password" 
                        name="password" 
                        type="password" 
                        required 
                        class="w-full"
                    />
                </div>
                
                <Card.Footer class="mt-4">
                    <Button type="submit" class="w-full">Sign in</Button>
                </Card.Footer>
            </form>
        </Card.Content>
    </Card.Root>
</div>