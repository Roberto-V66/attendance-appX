// src/lib/stores/authStore.js
import { writable } from 'svelte/store';

export const isAuthenticated = writable(false); // Will be set based on session