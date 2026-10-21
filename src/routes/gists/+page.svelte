<script lang="ts">
	import { onMount } from 'svelte';
	import { SvelteSet } from 'svelte/reactivity';
	import { Loader2 } from '@lucide/svelte';
	import AuthScreen from '../../lib/components/gists/AuthScreen.svelte';
	import Sidebar from '../../lib/components/gists/Sidebar.svelte';
	import GistCard from '../../lib/components/gists/GistCard.svelte';
	import GistDetail from '../../lib/components/gists/GistDetail.svelte';
	import GistEditor from '../../lib/components/gists/GistEditor.svelte';
	import ToastContainer from '../../lib/components/gists/ToastContainer.svelte';
	import ConfirmDialog from '../../lib/components/gists/ConfirmDialog.svelte';
	import Button from '../../lib/components/ui/button/button.svelte';
	import { filterGists, searchGists, sortGists } from '../../lib/gist-utils.js';
	import { loadToken, saveToken, clearToken } from '../../lib/session.js';
	import {
		fetchAuthenticatedUser,
		fetchUserGists,
		fetchStarredGists,
		fetchGist,
		starGist,
		unstarGist,
		createGist,
		updateGist,
		deleteGist
	} from '../../lib/github.js';
	import type {
		Gist,
		GitHubUser,
		GistFilter,
		ViewMode,
		ToastMessage,
		ConfirmAction,
		GistFileInput
	} from '../../lib/types/gist.js';

	// This page is prerendered with no server load: the token lives in localStorage and every
	// GitHub call goes straight to api.github.com from the browser.
	let initializing = $state(true);
	let authenticated = $state(false);
	let user = $state<GitHubUser | null>(null);
	let authError = $state('');
	let loginLoading = $state(false);

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

	onMount(async () => {
		const token = loadToken();
		if (!token) {
			initializing = false;
			return;
		}

		try {
			const currentUser = await fetchAuthenticatedUser(token);
			await loadWorkspace(token, currentUser);
			authenticated = true;
		} catch (err) {
			clearToken();
			authError = describeAuthError(err);
		} finally {
			initializing = false;
		}
	});

	async function loadWorkspace(token: string, currentUser: GitHubUser) {
		const [userGists, starred] = await Promise.all([
			fetchUserGists(token, currentUser.login),
			fetchStarredGists(token)
		]);

		user = currentUser;
		gists = userGists;
		starredIds.clear();
		for (const g of starred) starredIds.add(g.id);
		ownedIds.clear();
		for (const g of userGists) ownedIds.add(g.id);
	}

	function describeAuthError(err: unknown): string {
		const message = err instanceof Error ? err.message : 'Неизвестная ошибка';
		if (/bad credentials|unauthor|401/i.test(message)) {
			return 'GitHub отклонил токен. Проверьте, что он действителен и имеет scope «gist».';
		}
		return `Не удалось подключиться к GitHub: ${message}`;
	}

	async function handleLogin(token: string) {
		loginLoading = true;
		authError = '';
		try {
			const currentUser = await fetchAuthenticatedUser(token);
			await loadWorkspace(token, currentUser);
			saveToken(token);
			authenticated = true;
		} catch (err) {
			authError = describeAuthError(err);
		} finally {
			loginLoading = false;
		}
	}

	function handleLogout() {
		clearToken();
		authenticated = false;
		user = null;
		gists = [];
		starredIds.clear();
		ownedIds.clear();
		selectedGist = null;
		view = 'list';
		search = '';
		filter = 'all';
	}

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

	async function openGist(gist: Gist) {
		// The gist list endpoint omits file content, so the detail and edit views need the full
		// gist fetched separately.
		selectedGist = gist;
		view = 'detail';

		const token = loadToken();
		if (!token) return;

		contentLoading = true;
		try {
			const full = await fetchGist(token, gist.id);
			if (selectedGist?.id === gist.id) selectedGist = full;
		} catch (err) {
			addToast('error', err instanceof Error ? err.message : 'Не удалось загрузить Gist');
		} finally {
			contentLoading = false;
		}
	}

	async function triggerStarToggle(gist: Gist) {
		const token = loadToken();
		if (!token) return;

		const wasStarred = starredIds.has(gist.id);
		// Optimistic UI: flip first, undo if the request fails.
		if (wasStarred) starredIds.delete(gist.id);
		else starredIds.add(gist.id);

		try {
			if (wasStarred) await unstarGist(token, gist.id);
			else await starGist(token, gist.id);
		} catch (err) {
			if (wasStarred) starredIds.add(gist.id);
			else starredIds.delete(gist.id);
			addToast('error', err instanceof Error ? err.message : 'Не удалось изменить избранное');
		}
	}

	function promptDelete(gist: Gist) {
		confirmAction = {
			title: 'Удаление Gist',
			message: `Вы уверены, что хотите удалить гист "${gist.description || Object.keys(gist.files)[0]}"? Это действие нельзя отменить.`,
			confirmLabel: 'Удалить',
			danger: true,
			onConfirm: async () => {
				const token = loadToken();
				if (!token) return;

				try {
					await deleteGist(token, gist.id);
					gists = gists.filter((g) => g.id !== gist.id);
					ownedIds.delete(gist.id);
					starredIds.delete(gist.id);
					addToast('success', 'Gist успешно удален');
					view = 'list';
					selectedGist = null;
				} catch (err) {
					addToast('error', err instanceof Error ? err.message : 'Не удалось удалить Gist');
				}
			}
		};
	}

	async function handleSaveGist(
		description: string,
		isPublic: boolean,
		files: GistFileInput[],
		originalFilenames: string[]
	) {
		const token = loadToken();
		if (!token) {
			editorError = 'Сессия истекла, подключитесь заново';
			return;
		}

		editorError = '';
		saving = true;

		try {
			if (view === 'create') {
				const fileMap: Record<string, { content: string }> = {};
				for (const f of files) {
					const name = f.filename.trim();
					if (name) fileMap[name] = { content: f.content };
				}
				if (Object.keys(fileMap).length === 0) {
					editorError = 'Укажите хотя бы один файл с именем';
					return;
				}

				const created = await createGist(token, { description, public: isPublic, files: fileMap });
				const full = await fetchGist(token, created.id);
				gists = [full, ...gists];
				ownedIds.add(full.id);
				addToast('success', 'Gist успешно создан');
				view = 'list';
			} else if (view === 'edit' && selectedGist) {
				const filePayload: Record<string, { content?: string; filename?: string } | null> = {};
				for (const f of files) {
					const name = f.filename.trim();
					if (name) filePayload[name] = { content: f.content };
				}
				for (const origName of originalFilenames) {
					if (!files.some((f) => f.filename.trim() === origName)) filePayload[origName] = null;
				}

				const updated = await updateGist(token, selectedGist.id, {
					description,
					files: filePayload
				});
				const full = await fetchGist(token, updated.id);
				gists = gists.map((g) => (g.id === full.id ? full : g));
				selectedGist = full;
				addToast('success', 'Gist успешно обновлен');
				view = 'detail';
			}
		} catch (err) {
			editorError = err instanceof Error ? err.message : 'Не удалось сохранить Gist';
		} finally {
			saving = false;
		}
	}
</script>

<svelte:head>
	<title>Gist Manager — SvelteKit App</title>
</svelte:head>

{#if initializing}
	<div class="min-h-[80vh] flex items-center justify-center">
		<div class="flex items-center gap-2 text-sm text-muted-foreground">
			<Loader2 class="h-4 w-4 animate-spin" />
			<span>Восстановление сессии...</span>
		</div>
	</div>
{:else if !authenticated}
	<AuthScreen onLogin={handleLogin} loading={loginLoading} errorMessage={authError} />
{:else}
	<!-- Main Layout -->
	<div class="flex h-[calc(100vh-4rem)] overflow-hidden bg-background">
		<!-- Sidebar -->
		<Sidebar
			user={user!}
			{filter}
			{counts}
			{search}
			collapsed={sidebarCollapsed}
			onFilterChange={(f: GistFilter) => {
				filter = f;
				if (view !== 'list') view = 'list';
			}}
			onSearchChange={(s: string) => (search = s)}
			onLogout={handleLogout}
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
