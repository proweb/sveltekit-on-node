<script lang="ts">
	import { CheckCircle2, AlertCircle, Info, X } from '@lucide/svelte';
	import type { ToastMessage } from '../../../lib/types/gist.js';

	let {
		toasts = [],
		onDismiss
	}: {
		toasts: ToastMessage[];
		onDismiss: (id: string) => void;
	} = $props();
</script>

<div class="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
	{#each toasts as t (t.id)}
		<div
			class={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 ${
				t.type === 'success'
					? 'bg-card border-emerald-500/30 text-card-foreground'
					: t.type === 'error'
						? 'bg-card border-destructive/30 text-card-foreground'
						: 'bg-card border-border text-card-foreground'
			}`}
		>
			<div class="mt-0.5 shrink-0">
				{#if t.type === 'success'}
					<CheckCircle2 class="h-5 w-5 text-emerald-500" />
				{:else if t.type === 'error'}
					<AlertCircle class="h-5 w-5 text-destructive" />
				{:else}
					<Info class="h-5 w-5 text-primary" />
				{/if}
			</div>

			<div class="flex-1 text-xs font-medium leading-relaxed">
				{t.message}
			</div>

			<button
				type="button"
				onclick={() => onDismiss(t.id)}
				class="text-muted-foreground hover:text-foreground transition-colors shrink-0"
			>
				<X class="h-4 w-4" />
			</button>
		</div>
	{/each}
</div>
