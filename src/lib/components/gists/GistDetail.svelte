<script lang="ts">
	import {
		ArrowLeft,
		Star,
		Lock,
		Globe,
		Edit3,
		Trash2,
		ExternalLink,
		Clock,
		FileCode2,
		Copy,
		Check,
		Calendar,
		Loader2
	} from '@lucide/svelte';
	import CodeBlock from './CodeBlock.svelte';
	import {
		formatDate,
		formatDateFull,
		getFileCount,
		formatSize,
		getTotalSize
	} from '../../../lib/gist-utils.js';
	import type { Gist, GistFile } from '../../../lib/types/gist.js';
	import Button from '../ui/button/button.svelte';
	import Badge from '../ui/badge/badge.svelte';

	let {
		gist,
		isStarred = false,
		loading = false,
		owned = false,
		onBack,
		onEdit,
		onDelete,
		onStarToggle
	}: {
		gist: Gist;
		isStarred?: boolean;
		loading?: boolean;
		owned?: boolean;
		onBack: () => void;
		onEdit: () => void;
		onDelete: () => void;
		onStarToggle: () => void;
	} = $props();

	let fileList = $derived(Object.values(gist.files) as GistFile[]);
	let fileCount = $derived(getFileCount(gist));
	let totalSize = $derived(getTotalSize(gist));
	let copiedLink = $state(false);

	async function copyLink() {
		try {
			await navigator.clipboard.writeText(gist.html_url);
			copiedLink = true;
			setTimeout(() => (copiedLink = false), 2000);
		} catch {
			// fallback
		}
	}
</script>

<div class="space-y-6">
	<!-- Top Bar Action Row -->
	<div class="flex items-center justify-between gap-4">
		<Button variant="outline" size="sm" class="gap-2" onclick={onBack}>
			<ArrowLeft class="h-4 w-4" />
			<span>Назад к списку</span>
		</Button>

		<div class="flex items-center gap-2">
			<Button
				variant="outline"
				size="sm"
				class={`gap-1.5 ${isStarred ? 'text-amber-500 border-amber-500/30 bg-amber-500/10' : ''}`}
				onclick={onStarToggle}
			>
				<Star class={`h-4 w-4 ${isStarred ? 'fill-amber-500' : ''}`} />
				<span>{isStarred ? 'Starred' : 'Star'}</span>
			</Button>

			<Button variant="outline" size="sm" class="gap-1.5" onclick={copyLink}>
				{#if copiedLink}
					<Check class="h-4 w-4 text-emerald-500" />
					<span class="text-emerald-500">Copied</span>
				{:else}
					<Copy class="h-4 w-4" />
					<span>Share</span>
				{/if}
			</Button>

			<a
				href={gist.html_url}
				target="_blank"
				rel="noopener noreferrer"
				class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border text-xs font-medium bg-background hover:bg-accent transition-colors"
			>
				<span>GitHub</span>
				<ExternalLink class="h-3.5 w-3.5" />
			</a>

			<!-- Editing and deleting only apply to gists this user owns. -->
			{#if owned}
				<Button variant="secondary" size="sm" class="gap-1.5" onclick={onEdit}>
					<Edit3 class="h-4 w-4" />
					<span>Edit</span>
				</Button>

				<Button variant="destructive" size="sm" class="gap-1.5" onclick={onDelete}>
					<Trash2 class="h-4 w-4" />
					<span>Delete</span>
				</Button>
			{/if}
		</div>
	</div>

	<!-- Gist Header Box -->
	<div class="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
		<div class="flex items-start justify-between gap-4">
			<div class="space-y-2">
				<div class="flex items-center gap-2.5">
					<Badge variant={gist.public ? 'secondary' : 'outline'} class="gap-1 px-2.5 py-0.5">
						{#if gist.public}
							<Globe class="h-3 w-3" />
							<span>Public</span>
						{:else}
							<Lock class="h-3 w-3 text-amber-500" />
							<span>Secret</span>
						{/if}
					</Badge>

					<span class="text-xs text-muted-foreground font-mono">ID: {gist.id}</span>
				</div>

				<h1 class="text-xl font-bold tracking-tight">
					{gist.description || 'Без описания'}
				</h1>
			</div>

			<div class="flex items-center gap-3 shrink-0">
				<img
					src={gist.owner?.avatar_url}
					alt={gist.owner?.login}
					class="h-10 w-10 rounded-full ring-2 ring-primary/20"
				/>
				<div class="text-xs">
					<div class="font-semibold">{gist.owner?.login}</div>
					<div class="text-muted-foreground">{fileCount} {fileCount === 1 ? 'file' : 'files'}</div>
				</div>
			</div>
		</div>

		<!-- Meta Details -->
		<div class="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-2 border-t">
			<div class="flex items-center gap-1.5">
				<Calendar class="h-3.5 w-3.5" />
				<span>Created {formatDateFull(gist.created_at)}</span>
			</div>
			<div class="flex items-center gap-1.5">
				<Clock class="h-3.5 w-3.5" />
				<span>Updated {formatDate(gist.updated_at)}</span>
			</div>
			<div class="flex items-center gap-1.5">
				<FileCode2 class="h-3.5 w-3.5" />
				<span>Total size: {formatSize(totalSize)}</span>
			</div>
		</div>
	</div>

	<!-- Code files list -->
	<div class="space-y-6">
		{#if loading}
			<div
				class="p-6 rounded-xl border bg-card text-sm text-muted-foreground flex items-center gap-2"
			>
				<Loader2 class="h-4 w-4 animate-spin" />
				<span>Загрузка содержимого…</span>
			</div>
		{:else}
			{#each fileList as file (file.filename)}
				<CodeBlock {file} />
			{/each}
		{/if}
	</div>
</div>
