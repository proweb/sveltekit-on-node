<script lang="ts">
	import { onDestroy } from 'svelte';
	import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent, Badge } from '../../lib/index.js';
	import { Play, Type, Terminal } from '@lucide/svelte';

	let displayText = $state('');
	let intervalId: ReturnType<typeof setInterval> | undefined = undefined;

	const TextForTyping = () => {
		const text = `Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.`;
		typer(text);
	};

	const typer = (content: string) => {
		if (intervalId) {
			clearInterval(intervalId);
		}

		displayText = '';
		let index = 0;
		const speed = 30;

		intervalId = setInterval(() => {
			if (index < content.length) {
				displayText += content[index];
				index++;
			} else {
				if (intervalId) clearInterval(intervalId);
				intervalId = undefined;
			}
		}, speed);
	};

	onDestroy(() => {
		if (intervalId) {
			clearInterval(intervalId);
		}
	});
</script>

<svelte:head>
	<title>Typer Effect — SvelteKit App</title>
	<meta name="description" content="Эффект печатной машинки" />
</svelte:head>

<section class="py-12 md:py-20">
	<div class="container mx-auto px-4 max-w-3xl space-y-8">
		<div class="text-center">
			<Badge variant="secondary" class="mb-3 px-3 py-1">
				<Type class="h-3.5 w-3.5 mr-1" />
				Svelte 5 Animation
			</Badge>
			<h1 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Typewriter Effect</h1>
			<p class="text-muted-foreground max-w-xl mx-auto">
				Интерактивная анимация печатной машинки с использованием таймеров и реактивного состояния Svelte 5.
			</p>
		</div>

		<Card class="shadow-sm border-2">
			<CardHeader class="border-b bg-muted/40 py-3 px-4 flex flex-row items-center justify-between">
				<div class="flex items-center gap-2">
					<Terminal class="h-4 w-4 text-primary" />
					<CardTitle class="text-sm font-mono">terminal.txt</CardTitle>
				</div>
				<CardDescription class="text-xs">Нажмите START! для запуска</CardDescription>
			</CardHeader>
			<CardContent class="p-6 font-mono text-sm leading-relaxed bg-muted/20 min-h-[220px] rounded-b-xl flex flex-col justify-between">
				<div class="whitespace-pre-wrap break-words min-h-[160px]">
					{displayText}
					<span class="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-middle"></span>
				</div>

				<div class="pt-6 flex justify-center">
					<Button onclick={TextForTyping} class="gap-2 shadow">
						<Play class="h-4 w-4" />
						<span>START!</span>
					</Button>
				</div>
			</CardContent>
		</Card>
	</div>
</section>
