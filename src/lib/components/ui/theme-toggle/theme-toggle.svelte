<script lang="ts">
	import { toggleMode, mode } from 'mode-watcher';
	import { Sun, Moon } from '@lucide/svelte';
	import Button from '../button/button.svelte';

	let currentMode = $derived(mode.current);
</script>

<Button
	variant="ghost"
	size="icon"
	onclick={toggleMode}
	aria-label="Toggle theme"
	title="Переключить тему"
>
	{#if currentMode === 'dark'}
		<Sun class="h-5 w-5 transition-transform duration-200" />
	{:else}
		<Moon class="h-5 w-5 transition-transform duration-200" />
	{/if}
	<span class="sr-only">Toggle theme</span>
</Button>
