<script lang="ts">
	import { Star, Lock, Globe, FileCode2, Clock, ChevronRight } from '@lucide/svelte';
	import {
		getPrimaryFilename,
		getFileCount,
		formatDate,
		formatSize,
		getTotalSize,
		getLanguageLabel,
		getLanguageColor
	} from '../../../lib/gist-utils.js';
	import type { Gist } from '../../../lib/types/gist.js';

	let {
		gist,
		isStarred = false,
		onClick,
		onStarToggle
	}: {
		gist: Gist;
		isStarred?: boolean;
		onClick: () => void;
		onStarToggle: (e: MouseEvent) => void;
	} = $props();

	let filename = $derived(getPrimaryFilename(gist));
	let fileCount = $derived(getFileCount(gist));
	let totalSize = $derived(getTotalSize(gist));
	let language = $derived(gist.files[filename]?.language || null);
	let langLabel = $derived(getLanguageLabel(language, filename));
	let langColor = $derived(getLanguageColor(langLabel));
</script>

<div
	role="button"
	tabindex="0"
	onclick={onClick}
	onkeydown={(e) => {
		if (e.key === 'Enter' || e.key === ' ') {
			e.preventDefault();
			onClick();
		}
	}}
	class="group relative flex flex-col justify-between p-4 rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-md hover:border-primary/40 transition-all cursor-pointer select-none space-y-3"
>
	<!-- Header row -->
	<div class="flex items-start justify-between gap-3">
		<div class="flex items-center gap-2.5 min-w-0">
			<div
				class="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0"
			>
				<FileCode2 class="h-4 w-4" />
			</div>
			<div class="min-w-0">
				<h3
					class="font-mono text-sm font-semibold truncate group-hover:text-primary transition-colors"
				>
					{filename}
				</h3>
				<p class="text-xs text-muted-foreground truncate max-w-md">
					{gist.description || 'No description provided'}
				</p>
			</div>
		</div>

		<div class="flex items-center gap-1 shrink-0">
			<!-- Visibility Icon -->
			<span
				class="p-1 rounded text-muted-foreground"
				title={gist.public ? 'Public Gist' : 'Secret Gist'}
			>
				{#if gist.public}
					<Globe class="h-3.5 w-3.5" />
				{:else}
					<Lock class="h-3.5 w-3.5 text-amber-500" />
				{/if}
			</span>

			<!-- Star Button -->
			<button
				type="button"
				onclick={(e) => {
					e.stopPropagation();
					onStarToggle(e);
				}}
				class={`p-1.5 rounded-lg transition-colors ${
					isStarred
						? 'text-amber-500 hover:bg-amber-500/10'
						: 'text-muted-foreground hover:text-foreground hover:bg-muted'
				}`}
				title={isStarred ? 'Unstar Gist' : 'Star Gist'}
			>
				<Star class={`h-4 w-4 ${isStarred ? 'fill-amber-500' : ''}`} />
			</button>
		</div>
	</div>

	<!-- Footer Row -->
	<div
		class="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t border-border/40"
	>
		<div class="flex items-center gap-3">
			<span class="flex items-center gap-1.5 font-medium">
				<span class="h-2 w-2 rounded-full inline-block" style={`background-color: ${langColor}`}
				></span>
				<span>{langLabel}</span>
			</span>

			<span>{fileCount} {fileCount === 1 ? 'file' : 'files'}</span>
			<span>{formatSize(totalSize)}</span>
		</div>

		<div class="flex items-center gap-1">
			<Clock class="h-3 w-3" />
			<span>{formatDate(gist.updated_at)}</span>
			<ChevronRight class="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity ml-1" />
		</div>
	</div>
</div>
