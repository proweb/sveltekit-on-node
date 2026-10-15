<script lang="ts">
	import { ModeWatcher } from 'mode-watcher';
	import Navbar from '../lib/components/ui/navbar/navbar.svelte';
	import Preloader from '../lib/Preloader.svelte';
	import './styles.css';

	let { children } = $props();
</script>

<ModeWatcher />
<Preloader text="Загрузка..." />

<div class="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
	<Navbar />
	<main class="flex-1">
		{@render children?.()}
	</main>
	<footer class="border-t py-6 md:py-0">
		<div class="container mx-auto flex flex-col items-center justify-between gap-4 px-4 md:h-16 md:flex-row text-sm text-muted-foreground">
			<p>© 2026 SvelteKit App. All rights reserved.</p>
			<p class="text-xs">
				Построено на Svelte 5, SvelteKit и Shadcn UI
			</p>
		</div>
	</footer>
</div>
