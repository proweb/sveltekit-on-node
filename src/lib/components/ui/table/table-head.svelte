<script lang="ts">
	import type { HTMLThAttributes } from 'svelte/elements';
	import type { Snippet } from 'svelte';
	import { cn } from '../../../utils.js';

	type Props = HTMLThAttributes & {
		class?: string;
		children?: Snippet;
	};

	let { class: className, children, ...restProps }: Props = $props();
</script>

<th
	class={cn(
		'h-12 px-4 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
		className
	)}
	{...restProps}
>
	{@render children?.()}
</th>
