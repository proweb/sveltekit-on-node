<script lang="ts">
	import { enhance } from '$app/forms';
	import { KeyRound, ExternalLink, Eye, EyeOff, Loader2, FileCode2 } from '@lucide/svelte';
	import Button from '../ui/button/button.svelte';
	import Input from '../ui/input/input.svelte';
	import Card from '../ui/card/card.svelte';
	import CardHeader from '../ui/card/card-header.svelte';
	import CardTitle from '../ui/card/card-title.svelte';
	import CardDescription from '../ui/card/card-description.svelte';
	import CardContent from '../ui/card/card-content.svelte';

	let { errorMessage = '' }: { errorMessage?: string } = $props();

	let token = $state('');
	let showToken = $state(false);
	let loading = $state(false);
	let localError = $state('');

	$effect(() => {
		if (errorMessage) {
			localError = errorMessage;
		}
	});
</script>

<div class="min-h-[80vh] flex items-center justify-center p-4">
	<div class="w-full max-w-md space-y-6">
		<div class="text-center space-y-2">
			<div
				class="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary mb-2 shadow-sm"
			>
				<FileCode2 class="h-6 w-6" />
			</div>
			<h1 class="text-2xl font-bold tracking-tight">Gist Manager</h1>
			<p class="text-sm text-muted-foreground">
				Управление вашими GitHub Gists в одном удобном интерфейсе
			</p>
		</div>

		<Card class="border-border/60 shadow-lg backdrop-blur-sm">
			<CardHeader class="space-y-1">
				<CardTitle class="text-xl">Подключение к GitHub</CardTitle>
				<CardDescription>
					Введите Personal Access Token для доступа к вашим гистам. Токен сохранится на сервере.
				</CardDescription>
			</CardHeader>

			<CardContent>
				<form
					method="POST"
					action="?/login"
					use:enhance={() => {
						loading = true;
						localError = '';
						return async ({ result, update }) => {
							loading = false;
							if (result.type === 'failure' && result.data?.error) {
								localError = String(result.data.error);
							} else {
								await update();
							}
						};
					}}
					class="space-y-4"
				>
					<div class="space-y-2">
						<label
							for="token-input"
							class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
						>
							Personal Access Token
						</label>
						<div class="relative">
							<div
								class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-muted-foreground"
							>
								<KeyRound class="h-4 w-4" />
							</div>
							<Input
								id="token-input"
								name="token"
								type={showToken ? 'text' : 'password'}
								placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
								bind:value={token}
								required
								class="pl-9 pr-10"
							/>
							<button
								type="button"
								onclick={() => (showToken = !showToken)}
								class="absolute inset-y-0 right-0 pr-3 flex items-center text-muted-foreground hover:text-foreground transition-colors"
								aria-label={showToken ? 'Скрыть токен' : 'Показать токен'}
							>
								{#if showToken}
									<EyeOff class="h-4 w-4" />
								{:else}
									<Eye class="h-4 w-4" />
								{/if}
							</button>
						</div>
					</div>

					{#if localError}
						<div
							class="p-3 text-xs rounded-lg bg-destructive/10 text-destructive border border-destructive/20 font-medium"
						>
							{localError}
						</div>
					{/if}

					<Button type="submit" disabled={loading || !token.trim()} class="w-full gap-2">
						{#if loading}
							<Loader2 class="h-4 w-4 animate-spin" />
							<span>Проверка токена...</span>
						{:else}
							<span>Подключиться</span>
						{/if}
					</Button>
				</form>

				<div class="mt-6 pt-4 border-t text-xs text-muted-foreground space-y-2">
					<p class="font-medium text-foreground">Требуемые области (scopes):</p>
					<ul class="list-disc list-inside space-y-1 pl-1">
						<li>
							<code class="px-1 py-0.5 rounded bg-muted font-mono">gist</code> — полные права на Gist
						</li>
					</ul>
					<a
						href="https://github.com/settings/tokens/new?scopes=gist&description=Gist%20Manager%20SvelteKit"
						target="_blank"
						rel="noopener noreferrer"
						class="inline-flex items-center gap-1 text-primary hover:underline font-medium pt-1"
					>
						<span>Создать токен на GitHub</span>
						<ExternalLink class="h-3 w-3" />
					</a>
				</div>
			</CardContent>
		</Card>
	</div>
</div>
