<script lang="ts">
	import { FileCode2, Globe, Lock, Star, Plus, LogOut, Search, Code } from '@lucide/svelte';
	import type { Component } from 'svelte';
	import type { GitHubUser, GistFilter } from '../../../lib/types/gist.js';
	import Button from '../ui/button/button.svelte';
	import Input from '../ui/input/input.svelte';
	import Badge from '../ui/badge/badge.svelte';
	import { enhance } from '$app/forms';

	let {
		user,
		filter = 'all',
		counts = { all: 0, public: 0, secret: 0, starred: 0 },
		search = '',
		collapsed = false,
		onFilterChange,
		onSearchChange,
		onNewGist
	}: {
		user: GitHubUser;
		filter: GistFilter;
		counts: { all: number; public: number; secret: number; starred: number };
		search: string;
		collapsed?: boolean;
		onFilterChange: (f: GistFilter) => void;
		onSearchChange: (s: string) => void;
		onNewGist: () => void;
	} = $props();

	const filterItems: Array<{
		id: GistFilter;
		label: string;
		icon: Component<{ class?: string }>;
		countKey: keyof typeof counts;
	}> = [
		{ id: 'all', label: 'All Gists', icon: FileCode2, countKey: 'all' },
		{ id: 'public', label: 'Public', icon: Globe, countKey: 'public' },
		{ id: 'secret', label: 'Secret', icon: Lock, countKey: 'secret' },
		{ id: 'starred', label: 'Starred', icon: Star, countKey: 'starred' }
	];
</script>

<aside
	class={`flex flex-col border-r bg-card transition-all duration-300 select-none ${
		collapsed ? 'w-16' : 'w-72'
	}`}
>
	<!-- User Profile Header -->
	<div class="p-4 border-b flex items-center justify-between gap-3">
		<div class="flex items-center gap-3 overflow-hidden">
			<img
				src={user.avatar_url}
				alt={user.login}
				class="h-9 w-9 rounded-full ring-2 ring-primary/20 shrink-0 object-cover"
			/>
			{#if !collapsed}
				<div class="flex flex-col min-w-0">
					<span class="font-semibold text-sm truncate leading-tight">
						{user.name || user.login}
					</span>
					<a
						href={user.html_url}
						target="_blank"
						rel="noopener noreferrer"
						class="text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 truncate"
					>
						<span>@{user.login}</span>
						<Code class="h-3 w-3 shrink-0" />
					</a>
				</div>
			{/if}
		</div>

		{#if !collapsed}
			<form method="POST" action="?/logout" use:enhance>
				<Button
					type="submit"
					variant="ghost"
					size="icon"
					class="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors shrink-0"
					title="Выйти / Сменить токен"
				>
					<LogOut class="h-4 w-4" />
				</Button>
			</form>
		{/if}
	</div>

	<!-- Action: New Gist Button -->
	<div class="p-3">
		{#if collapsed}
			<Button
				variant="default"
				size="icon"
				class="w-full shadow-sm"
				onclick={onNewGist}
				title="New Gist"
			>
				<Plus class="h-5 w-5" />
			</Button>
		{:else}
			<Button variant="default" class="w-full gap-2 shadow-sm font-semibold" onclick={onNewGist}>
				<Plus class="h-4 w-4" />
				<span>New Gist</span>
			</Button>
		{/if}
	</div>

	<!-- Search Input -->
	{#if !collapsed}
		<div class="px-3 pb-3">
			<div class="relative">
				<Search
					class="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none"
				/>
				<Input
					type="text"
					placeholder="Search gists..."
					value={search}
					oninput={(e) => onSearchChange((e.target as HTMLInputElement).value)}
					class="pl-8 text-xs h-9"
				/>
			</div>
		</div>
	{/if}

	<!-- Filter Navigation -->
	<nav class="flex-1 px-2 py-2 space-y-1 overflow-y-auto">
		{#each filterItems as item (item.id)}
			{@const Icon = item.icon}
			{@const active = filter === item.id}
			<button
				type="button"
				onclick={() => onFilterChange(item.id)}
				class={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
					active
						? 'bg-primary/10 text-primary font-semibold'
						: 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
				} ${collapsed ? 'justify-center px-0' : 'justify-between'}`}
				title={item.label}
			>
				<div class="flex items-center gap-2.5 min-w-0">
					<Icon class={`h-4 w-4 shrink-0 ${active ? 'text-primary' : 'text-muted-foreground'}`} />
					{#if !collapsed}
						<span class="truncate">{item.label}</span>
					{/if}
				</div>

				{#if !collapsed}
					<Badge
						variant={active ? 'default' : 'secondary'}
						class="text-[10px] px-1.5 py-0 h-4 font-mono font-normal"
					>
						{counts[item.countKey]}
					</Badge>
				{/if}
			</button>
		{/each}
	</nav>

	<!-- Footer Bio -->
	{#if !collapsed && user.bio}
		<div class="p-3 border-t text-[11px] text-muted-foreground italic line-clamp-2 bg-muted/20">
			"{user.bio}"
		</div>
	{/if}
</aside>
