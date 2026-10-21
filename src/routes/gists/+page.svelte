<script lang="ts">
	import { enhance } from '$app/forms';
	import { SvelteSet } from 'svelte/reactivity';
	import AuthScreen from '../../lib/components/gists/AuthScreen.svelte';
	import Sidebar from '../../lib/components/gists/Sidebar.svelte';
	import GistCard from '../../lib/components/gists/GistCard.svelte';
	import GistDetail from '../../lib/components/gists/GistDetail.svelte';
	import GistEditor from '../../lib/components/gists/GistEditor.svelte';
	import ToastContainer from '../../lib/components/gists/ToastContainer.svelte';
	import ConfirmDialog from '../../lib/components/gists/ConfirmDialog.svelte';
	import Button from '../../lib/components/ui/button/button.svelte';
	import { filterGists, searchGists, sortGists } from '../../lib/gist-utils.js';
	import type {
		Gist,
		GistFilter,
		ViewMode,
		ToastMessage,
		ConfirmAction,
		GistFileInput
	} from '../../lib/types/gist.js';

	let { data } = $props();

	// Reactive state
	let gists = $state<Gist[]>([]);
	let starredIds = new SvelteSet<string>();
	let ownedIds = new SvelteSet<string>();

	let filter = $state<GistFilter>('all');
	let search = $state('');
	let sortBy = $state<'updated' | 'created' | 'name'>('updated');
	let view = $state<ViewMode>('list');
	let selectedGist = $state<Gist | null>(null);
	let contentLoading = $state(false);

	let toasts = $state<ToastMessage[]>([]);
	let confirmAction = $state<ConfirmAction | null>(null);

	let saving = $state(false);
	let editorError = $state('');

	// Update reactivity when server data changes
	$effect(() => {
		if (data.authenticated && data.gists) {
			gists = data.gists;
			starredIds.clear();
			for (const id of data.starredGistIds || []) starredIds.add(id);
			ownedIds.clear();
			for (const g of data.gists) ownedIds.add(g.id);
		}
	});

	function addToast(type: 'success' | 'error' | 'info', message: string) {
		const id = Math.random().toString(36).slice(2, 9);
		toasts = [...toasts, { id, type, message }];
		setTimeout(() => {
			toasts = toasts.filter((t) => t.id !== id);
		}, 4000);
	}

	function dismissToast(id: string) {
		toasts = toasts.filter((t) => t.id !== id);
	}

	async function openGist(gist: Gist) {
		// The gist list omits file content, so the detail and edit views need the full gist.
		selectedGist = gist;
		view = 'detail';

		contentLoading = true;
		try {
			const res = await fetch(`/gists/${gist.id}`);
			if (!res.ok) throw new Error(`Не удалось загрузить Gist (HTTP ${res.status})`);
			const full = (await res.json()) as Gist;
			if (selectedGist?.id === gist.id) selectedGist = full;
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Не удалось загрузить Gist');
		} finally {
			contentLoading = false;
		}
	}

	// Filtered & Sorted Gists
	let displayedGists = $derived.by(() => {
		const filtered = filterGists(gists, filter, starredIds, ownedIds);
		const searched = searchGists(filtered, search);
		return sortGists(searched, sortBy);
	});

	let counts = $derived({
		all: ownedIds.size,
		public: gists.filter((g) => g.public).length,
		secret: gists.filter((g) => !g.public).length,
		starred: starredIds.size
	});

	let sidebarCollapsed = $derived(view === 'create' || view === 'edit');

	// Star Toggle Form submission
	let starFormElement: HTMLFormElement | undefined = $state();
	let starGistId = $state('');
	let starIsStarred = $state('false');

	function triggerStarToggle(gist: Gist) {
		const isStarred = starredIds.has(gist.id);
		starGistId = gist.id;
		starIsStarred = String(isStarred);

		// Optimistic UI update
		if (isStarred) {
			starredIds.delete(gist.id);
		} else {
			starredIds.add(gist.id);
		}

		setTimeout(() => {
			if (starFormElement) {
				starFormElement.requestSubmit();
			}
		}, 0);
	}

	// Action Delete Form
	let deleteFormElement: HTMLFormElement | undefined = $state();
	let deleteGistId = $state('');

	function promptDelete(gist: Gist) {
		confirmAction = {
			title: 'Удаление Gist',
			message: `Вы уверены, что хотите удалить гист "${gist.description || Object.keys(gist.files)[0]}"? Это действие нельзя отменить.`,
			confirmLabel: 'Удалить',
			danger: true,
			onConfirm: async () => {
				deleteGistId = gist.id;
				setTimeout(() => {
					if (deleteFormElement) {
						deleteFormElement.requestSubmit();
					}
				}, 0);
			}
		};
	}

	// Editor submit handlers
	let createFormElement: HTMLFormElement | undefined = $state();
	let createDesc = $state('');
	let createPublic = $state('true');
	let createFilesRaw = $state('');

	let updateFormElement: HTMLFormElement | undefined = $state();
	let updateGistId = $state('');
	let updateDesc = $state('');
	let updateFilesRaw = $state('');
	let updateOrigNamesRaw = $state('');

	function handleSaveGist(
		description: string,
		isPublic: boolean,
		files: GistFileInput[],
		originalFilenames: string[]
	) {
		editorError = '';
		saving = true;

		if (view === 'create') {
			createDesc = description;
			createPublic = String(isPublic);
			createFilesRaw = JSON.stringify(files);
			setTimeout(() => {
				if (createFormElement) createFormElement.requestSubmit();
			}, 0);
		} else if (view === 'edit' && selectedGist) {
			updateGistId = selectedGist.id;
			updateDesc = description;
			updateFilesRaw = JSON.stringify(files);
			updateOrigNamesRaw = JSON.stringify(originalFilenames);
			setTimeout(() => {
				if (updateFormElement) updateFormElement.requestSubmit();
			}, 0);
		}
	}
</script>

<svelte:head>
	<title>Gist Manager — SvelteKit App</title>
</svelte:head>

{#if !data.authenticated}
	<AuthScreen errorMessage={data.error} />
{:else}
	<!-- Hidden forms for server action execution -->
	<form
		bind:this={starFormElement}
		method="POST"
		action="?/starToggle"
		use:enhance={() => {
			return async ({ result }) => {
				if (result.type === 'failure') {
					addToast('error', 'Не удалось изменить статус избранного');
				}
			};
		}}
		class="hidden"
	>
		<input type="hidden" name="gistId" value={starGistId} />
		<input type="hidden" name="isStarred" value={starIsStarred} />
	</form>

	<form
		bind:this={deleteFormElement}
		method="POST"
		action="?/deleteGist"
		use:enhance={() => {
			return async ({ result, update }) => {
				if (result.type === 'success' && result.data) {
					const deletedId = String(result.data.gistId);
					gists = gists.filter((g) => g.id !== deletedId);
					ownedIds.delete(deletedId);
					starredIds.delete(deletedId);
					addToast('success', 'Gist успешно удален');
					view = 'list';
					selectedGist = null;
				} else {
					addToast('error', 'Не удалось удалить Gist');
				}
				await update();
			};
		}}
		class="hidden"
	>
		<input type="hidden" name="gistId" value={deleteGistId} />
	</form>

	<form
		bind:this={createFormElement}
		method="POST"
		action="?/createGist"
		use:enhance={() => {
			return async ({ result, update }) => {
				saving = false;
				if (result.type === 'success' && result.data?.gist) {
					const newGist = result.data.gist as Gist;
					gists = [newGist, ...gists];
					ownedIds.add(newGist.id);
					addToast('success', 'Gist успешно создан');
					view = 'list';
				} else if (result.type === 'failure' && result.data?.error) {
					editorError = String(result.data.error);
				}
				await update();
			};
		}}
		class="hidden"
	>
		<input type="hidden" name="description" value={createDesc} />
		<input type="hidden" name="isPublic" value={createPublic} />
		<input type="hidden" name="files" value={createFilesRaw} />
	</form>

	<form
		bind:this={updateFormElement}
		method="POST"
		action="?/updateGist"
		use:enhance={() => {
			return async ({ result, update }) => {
				saving = false;
				if (result.type === 'success' && result.data?.gist) {
					const updatedGist = result.data.gist as Gist;
					gists = gists.map((g) => (g.id === updatedGist.id ? updatedGist : g));
					selectedGist = updatedGist;
					addToast('success', 'Gist успешно обновлен');
					view = 'detail';
				} else if (result.type === 'failure' && result.data?.error) {
					editorError = String(result.data.error);
				}
				await update();
			};
		}}
		class="hidden"
	>
		<input type="hidden" name="gistId" value={updateGistId} />
		<input type="hidden" name="description" value={updateDesc} />
		<input type="hidden" name="files" value={updateFilesRaw} />
		<input type="hidden" name="originalFilenames" value={updateOrigNamesRaw} />
	</form>

	<!-- Main Layout -->
	<div class="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
		<!-- Sidebar -->
		<Sidebar
			user={data.user!}
			{filter}
			{counts}
			{search}
			collapsed={sidebarCollapsed}
			onFilterChange={(f: GistFilter) => {
				filter = f;
				if (view !== 'list') view = 'list';
			}}
			onSearchChange={(s: string) => (search = s)}
			onNewGist={() => {
				selectedGist = null;
				view = 'create';
			}}
		/>

		<!-- Content Area -->
		<main class="flex-1 overflow-y-auto p-6">
			{#if view === 'list'}
				<div class="max-w-4xl mx-auto space-y-6">
					<!-- Header controls -->
					<div class="flex items-center justify-between gap-4">
						<div>
							<h1 class="text-2xl font-bold tracking-tight capitalize">
								{filter === 'all'
									? 'Все гисты'
									: filter === 'public'
										? 'Публичные гисты'
										: filter === 'secret'
											? 'Секретные гисты'
											: 'Избранные гисты'}
							</h1>
							<p class="text-xs text-muted-foreground mt-0.5">
								{displayedGists.length}
								{displayedGists.length === 1 ? 'гист' : 'гистов'}
								{#if search}
									найдено по запросу "{search}"
								{/if}
							</p>
						</div>

						<div class="flex items-center gap-2">
							<select
								value={sortBy}
								onchange={(e) =>
									(sortBy = (e.target as HTMLSelectElement).value as
										'updated' | 'created' | 'name')}
								class="h-9 rounded-lg border bg-card px-3 text-xs font-medium text-foreground border-border"
							>
								<option value="updated">Недавно обновленные</option>
								<option value="created">Недавно созданные</option>
								<option value="name">По названию (A-Z)</option>
							</select>
						</div>
					</div>

					<!-- Gists Cards List -->
					{#if displayedGists.length === 0}
						<div class="p-12 text-center border rounded-xl bg-card space-y-3">
							<p class="text-sm text-muted-foreground font-medium">Гисты не найдены</p>
							<Button
								variant="outline"
								size="sm"
								onclick={() => {
									selectedGist = null;
									view = 'create';
								}}
							>
								Создать первый Gist
							</Button>
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-3">
							{#each displayedGists as gist (gist.id)}
								<GistCard
									{gist}
									isStarred={starredIds.has(gist.id)}
									onClick={() => openGist(gist)}
									onStarToggle={() => triggerStarToggle(gist)}
								/>
							{/each}
						</div>
					{/if}
				</div>
			{:else if view === 'detail' && selectedGist}
				<div class="max-w-4xl mx-auto">
					<GistDetail
						gist={selectedGist}
						isStarred={starredIds.has(selectedGist.id)}
						loading={contentLoading}
						onBack={() => (view = 'list')}
						onEdit={() => (view = 'edit')}
						onDelete={() => promptDelete(selectedGist!)}
						onStarToggle={() => triggerStarToggle(selectedGist!)}
					/>
				</div>
			{:else if view === 'create'}
				<GistEditor
					gist={null}
					{saving}
					error={editorError}
					onSave={handleSaveGist}
					onCancel={() => (view = 'list')}
				/>
			{:else if view === 'edit' && selectedGist}
				<GistEditor
					gist={selectedGist}
					{saving}
					error={editorError}
					onSave={handleSaveGist}
					onCancel={() => (view = 'detail')}
				/>
			{/if}
		</main>
	</div>

	<!-- Toasts & Confirm Modal -->
	<ToastContainer {toasts} onDismiss={dismissToast} />
	<ConfirmDialog action={confirmAction} onClose={() => (confirmAction = null)} />
{/if}
