<script lang="ts">
	import { Copy, Check, ChevronDown, ChevronUp } from '@lucide/svelte';
	import { getLanguageLabel, formatSize } from '../../../lib/gist-utils.js';
	import type { GistFile } from '../../../lib/types/gist.js';

	let {
		file,
		maxHeight = '500px'
	}: {
		file: GistFile;
		maxHeight?: string;
	} = $props();

	let copied = $state(false);
	let isExpanded = $state(false);

	let content = $derived(file.content || '// Content unavailable or empty');
	let langLabel = $derived(getLanguageLabel(file.language, file.filename));

	async function handleCopy() {
		try {
			await navigator.clipboard.writeText(content);
			copied = true;
			setTimeout(() => {
				copied = false;
			}, 2000);
		} catch {
			// fallback
		}
	}
</script>

<div class="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden my-4">
	<!-- Code header -->
	<div class="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b text-xs font-mono">
		<div class="flex items-center gap-2">
			<span class="font-semibold text-foreground">{file.filename}</span>
			<span class="text-muted-foreground">({langLabel} • {formatSize(file.size)})</span>
		</div>

		<div class="flex items-center gap-2">
			<button
				type="button"
				onclick={handleCopy}
				class="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-background border hover:bg-accent transition-colors text-xs font-sans"
				title="Копировать код"
			>
				{#if copied}
					<Check class="h-3.5 w-3.5 text-emerald-500" />
					<span class="text-emerald-500 font-medium">Copied!</span>
				{:else}
					<Copy class="h-3.5 w-3.5" />
					<span>Copy</span>
				{/if}
			</button>
		</div>
	</div>

	<!-- Code content body -->
	<div class="relative group">
		<pre
			class="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-muted/20"
			style={`max-height: ${isExpanded ? 'none' : maxHeight};`}><code>{content}</code></pre>

		{#if !isExpanded && file.size > 2000}
			<div
				class="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-card to-transparent pointer-events-none flex items-end justify-center pb-2"
			></div>
		{/if}
	</div>

	{#if file.size > 2000}
		<div class="border-t bg-muted/10 px-4 py-1.5 text-center">
			<button
				type="button"
				onclick={() => (isExpanded = !isExpanded)}
				class="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
			>
				{#if isExpanded}
					<ChevronUp class="h-3.5 w-3.5" />
					<span>Show less</span>
				{:else}
					<ChevronDown class="h-3.5 w-3.5" />
					<span>Show full file</span>
				{/if}
			</button>
		</div>
	{/if}
</div>
