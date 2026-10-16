<script lang="ts">
	import { AlertTriangle, X } from '@lucide/svelte';
	import type { ConfirmAction } from '../../../lib/types/gist.js';
	import Button from '../ui/button/button.svelte';

	let {
		action,
		onClose
	}: {
		action: ConfirmAction | null;
		onClose: () => void;
	} = $props();

	let loading = $state(false);

	async function handleConfirm() {
		if (!action) return;
		loading = true;
		try {
			await action.onConfirm();
		} finally {
			loading = false;
			onClose();
		}
	}
</script>

{#if action}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200"
	>
		<div
			class="relative w-full max-w-md p-6 rounded-xl border bg-card text-card-foreground shadow-2xl space-y-4 border-border/80"
		>
			<button
				type="button"
				onclick={onClose}
				class="absolute right-4 top-4 text-muted-foreground hover:text-foreground transition-colors"
			>
				<X class="h-4 w-4" />
			</button>

			<div class="flex items-start gap-4">
				<div
					class={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
						action.danger ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
					}`}
				>
					<AlertTriangle class="h-5 w-5" />
				</div>

				<div class="space-y-1">
					<h3 class="font-semibold text-lg leading-none">{action.title}</h3>
					<p class="text-sm text-muted-foreground pt-1 leading-relaxed">{action.message}</p>
				</div>
			</div>

			<div class="flex items-center justify-end gap-3 pt-2">
				<Button variant="outline" size="sm" onclick={onClose} disabled={loading}>Отмена</Button>
				<Button
					variant={action.danger ? 'destructive' : 'default'}
					size="sm"
					onclick={handleConfirm}
					disabled={loading}
				>
					{action.confirmLabel}
				</Button>
			</div>
		</div>
	</div>
{/if}
