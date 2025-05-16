<script lang="ts">
  export let isOpen: boolean = false;
  export let onClose: () => void;
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
    <div class="bg-background rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-semibold">
          <slot name="title">Modal Title</slot>
        </h3>
        <button on:click={onClose} class="text-muted-foreground hover:text-foreground">
          &times;
        </button>
      </div>
      <div class="mb-4">
        <slot name="description" />
      </div>
      <div class="mb-6">
        <slot />
      </div>
      <div class="flex justify-end gap-2">
        <slot name="footer" />
      </div>
    </div>
  </div>
{/if}