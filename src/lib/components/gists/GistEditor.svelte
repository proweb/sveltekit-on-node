<script lang="ts">
	import { ArrowLeft, Plus, Trash2, FileCode2, Loader2, Globe, Lock } from '@lucide/svelte';
	import type { Gist, GistFileInput, GistFile } from '../../../lib/types/gist.js';
	import Button from '../ui/button/button.svelte';
	import Input from '../ui/input/input.svelte';
	import Textarea from '../ui/textarea/textarea.svelte';
	import Card from '../ui/card/card.svelte';
	import CardHeader from '../ui/card/card-header.svelte';
	import CardTitle from '../ui/card/card-title.svelte';
	import CardContent from '../ui/card/card-content.svelte';

	let {
		gist = null,
		saving = false,
		error = '',
		onSave,
		onCancel
	}: {
		gist?: Gist | null;
		saving?: boolean;
		error?: string;
		onSave: (
			description: string,
			isPublic: boolean,
			files: GistFileInput[],
			originalFilenames: string[]
		) => void;
		onCancel: () => void;
	} = $props();

	let isEditing = $derived(Boolean(gist));
	let description = $state('');
	let isPublic = $state(true);
	let originalFilenames = $derived(gist ? Object.keys(gist.files) : []);
	let files = $state<GistFileInput[]>([]);

	$effect(() => {
		if (gist) {
			description = gist.description || '';
			isPublic = gist.public;
			files = (Object.values(gist.files) as GistFile[]).map((f) => ({
				filename: f.filename,
				content: f.content || ''
			}));
		} else {
			description = '';
			isPublic = true;
			files = [{ filename: '', content: '' }];
		}
	});

	function addFile() {
		files = [...files, { filename: '', content: '' }];
	}

	function removeFile(index: number) {
		if (files.length === 1) return;
		files = files.filter((_, i) => i !== index);
	}

	function handleSubmit(e: SubmitEvent) {
		e.preventDefault();
		onSave(description, isPublic, files, originalFilenames);
	}
</script>

<div class="max-w-4xl mx-auto space-y-6">
	<!-- Top Bar -->
	<div class="flex items-center justify-between">
		<Button variant="outline" size="sm" class="gap-2" onclick={onCancel}>
			<ArrowLeft class="h-4 w-4" />
			<span>Отмена</span>
		</Button>

		<h1 class="text-xl font-bold tracking-tight">
			{isEditing ? 'Редактирование Gist' : 'Создание нового Gist'}
		</h1>
	</div>

	{#if error}
		<div
			class="p-4 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm font-medium"
		>
			{error}
		</div>
	{/if}

	<form onsubmit={handleSubmit} class="space-y-6">
		<Card class="shadow-sm">
			<CardHeader>
				<CardTitle class="text-base">Основная информация</CardTitle>
			</CardHeader>
			<CardContent class="space-y-4">
				<div class="space-y-2">
					<label
						for="gist-desc"
						class="text-xs font-semibold uppercase tracking-wider text-muted-foreground"
					>
						Описание Gist
					</label>
					<Input
						id="gist-desc"
						placeholder="Краткое описание вашей заготовки или кода..."
						bind:value={description}
					/>
				</div>

				<div class="space-y-2">
					<span class="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">
						Тип видимости
					</span>
					<div class="flex items-center gap-4">
						<label
							class={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${
								isPublic ? 'border-primary bg-primary/5 text-primary' : 'border-border opacity-70'
							} ${isEditing ? 'cursor-not-allowed opacity-50' : ''}`}
						>
							<input
								type="radio"
								name="visibility"
								checked={isPublic}
								disabled={isEditing}
								onchange={() => (isPublic = true)}
								class="sr-only"
							/>
							<Globe class="h-4 w-4" />
							<span>Public (Виден всем)</span>
						</label>

						<label
							class={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer text-xs font-medium transition-colors ${
								!isPublic
									? 'border-amber-500 bg-amber-500/10 text-amber-500'
									: 'border-border opacity-70'
							} ${isEditing ? 'cursor-not-allowed opacity-50' : ''}`}
						>
							<input
								type="radio"
								name="visibility"
								checked={!isPublic}
								disabled={isEditing}
								onchange={() => (isPublic = false)}
								class="sr-only"
							/>
							<Lock class="h-4 w-4" />
							<span>Secret (Доступ по ссылке)</span>
						</label>
					</div>
					{#if isEditing}
						<p class="text-[11px] text-muted-foreground">
							* GitHub API не позволяет изменять видимость у существующего гиста.
						</p>
					{/if}
				</div>
			</CardContent>
		</Card>

		<!-- Files list -->
		<div class="space-y-4">
			<div class="flex items-center justify-between">
				<h2 class="text-base font-bold flex items-center gap-2">
					<FileCode2 class="h-4 w-4 text-primary" />
					<span>Файлы ({files.length})</span>
				</h2>

				<Button type="button" variant="outline" size="sm" class="gap-1.5" onclick={addFile}>
					<Plus class="h-4 w-4" />
					<span>Добавить файл</span>
				</Button>
			</div>

			{#each files as file, index (index)}
				<Card class="shadow-sm relative">
					<CardContent class="p-4 space-y-3">
						<div class="flex items-center justify-between gap-3">
							<Input
								placeholder="filename.ext (напр. index.ts, style.css)"
								bind:value={file.filename}
								required
								class="font-mono text-xs max-w-md"
							/>

							{#if files.length > 1}
								<Button
									type="button"
									variant="ghost"
									size="icon"
									class="text-muted-foreground hover:text-destructive h-8 w-8"
									onclick={() => removeFile(index)}
									title="Удалить файл"
								>
									<Trash2 class="h-4 w-4" />
								</Button>
							{/if}
						</div>

						<Textarea
							placeholder="Вставьте ваш код здесь..."
							bind:value={file.content}
							rows={10}
							class="font-mono text-xs leading-relaxed"
							required
						/>
					</CardContent>
				</Card>
			{/each}
		</div>

		<!-- Form Actions -->
		<div class="flex items-center justify-end gap-3 pt-4 border-t">
			<Button type="button" variant="outline" onclick={onCancel}>Отмена</Button>
			<Button type="submit" disabled={saving} class="gap-2">
				{#if saving}
					<Loader2 class="h-4 w-4 animate-spin" />
					<span>Сохранение...</span>
				{:else}
					<span>{isEditing ? 'Сохранить изменения' : 'Создать Gist'}</span>
				{/if}
			</Button>
		</div>
	</form>
</div>
