<script lang="ts">
	import { page } from '$app/state';
	import { resolve } from '$app/paths';
	import { afterNavigate } from '$app/navigation';
	import ThemeToggle from '../theme-toggle/theme-toggle.svelte';
	import Button from '../button/button.svelte';
	import { Menu, X, Sparkles } from '@lucide/svelte';

	let isOpen = $state(false);

	const navItems = [
		{ href: '/', label: 'Главная', id: '/' },
		{ href: '/about', label: 'О нас', id: '/about' },
		{ href: '/forms', label: 'Формы', id: '/forms' },
		{ href: '/typer', label: 'Печатная машинка', id: '/typer' }
	] as const;

	function toggleMenu() {
		isOpen = !isOpen;
	}

	afterNavigate(() => {
		isOpen = false;
	});
</script>

<header class="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
	<div class="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
		<!-- Brand Logo -->
		<a href={resolve('/')} class="flex items-center gap-2 font-bold text-lg hover:opacity-90 transition-opacity">
			<div class="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
				<Sparkles class="h-4 w-4" />
			</div>
			<span>SvelteKit App</span>
		</a>

		<!-- Desktop Navigation -->
		<nav class="hidden md:flex items-center space-x-1 text-sm font-medium">
			{#each navItems as item (item.id)}
				<a
					href={resolve(item.href)}
					class={`px-3 py-2 rounded-md transition-colors ${
						page.route.id === item.id
							? 'bg-secondary text-secondary-foreground font-semibold'
							: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
					}`}
				>
					{item.label}
				</a>
			{/each}
		</nav>

		<!-- Right Side Actions -->
		<div class="flex items-center gap-2">
			<ThemeToggle />

			<!-- Mobile menu toggle -->
			<Button
				variant="ghost"
				size="icon"
				class="md:hidden"
				onclick={toggleMenu}
				aria-label="Открыть меню"
			>
				{#if isOpen}
					<X class="h-5 w-5" />
				{:else}
					<Menu class="h-5 w-5" />
				{/if}
			</Button>
		</div>
	</div>

	<!-- Mobile Navigation Drawer -->
	{#if isOpen}
		<div class="md:hidden border-b bg-background px-4 pb-4 pt-2 shadow-lg">
			<nav class="flex flex-col space-y-1">
				{#each navItems as item (item.id)}
					<a
						href={resolve(item.href)}
						class={`px-3 py-2 rounded-md text-base transition-colors ${
							page.route.id === item.id
								? 'bg-secondary text-secondary-foreground font-semibold'
								: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
						}`}
					>
						{item.label}
					</a>
				{/each}
			</nav>
		</div>
	{/if}
</header>
