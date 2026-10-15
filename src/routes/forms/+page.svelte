<script lang="ts">
	import { enhance } from '$app/forms';
	import type { ActionData, PageData } from './$types';
	import {
		Button,
		Input,
		Textarea,
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent,
		Table,
		TableHeader,
		TableBody,
		TableRow,
		TableHead,
		TableCell,
		Badge
	} from '../../lib/index.js';
	import { Send, User, Mail, MessageSquare, ListFilter, AlertCircle } from '@lucide/svelte';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let entries = $derived(data.entries || []);
</script>

<svelte:head>
	<title>Формы в SvelteKit — SvelteKit App</title>
	<meta name="description" content="Обработка форм в SvelteKit" />
</svelte:head>

<section class="py-12 md:py-20">
	<div class="container mx-auto px-4 max-w-4xl space-y-10">
		<div class="text-center">
			<Badge variant="secondary" class="mb-3 px-3 py-1">
				<Send class="h-3.5 w-3.5 mr-1" />
				SvelteKit Form Action
			</Badge>
			<h1 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Формы в SvelteKit</h1>
			<p class="text-muted-foreground max-w-xl mx-auto">
				Пример работы с серверными экшенами SvelteKit, валидацией данных и динамическим списком
				записей.
			</p>
		</div>

		<!-- Form Card -->
		<Card class="shadow-sm">
			<CardHeader>
				<CardTitle>Оставить сообщение</CardTitle>
				<CardDescription>Заполните форму ниже для добавления новой записи</CardDescription>
			</CardHeader>
			<CardContent>
				<form method="POST" action="?/addEntry" use:enhance class="space-y-6">
					<!-- Name Field -->
					<div class="space-y-2">
						<label for="name" class="text-sm font-medium leading-none flex items-center gap-1.5">
							<User class="h-4 w-4 text-muted-foreground" />
							<span>Ваше имя:</span>
						</label>
						<Input
							type="text"
							name="name"
							id="name"
							placeholder="Введите имя"
							class={form?.errors?.name ? 'border-destructive focus-visible:ring-destructive' : ''}
							aria-invalid={!!form?.errors?.name}
							required
						/>
						{#if form?.errors?.name}
							<p class="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
								<AlertCircle class="h-4 w-4" />
								<span>{form.errors.name}</span>
							</p>
						{/if}
					</div>

					<!-- Email Field -->
					<div class="space-y-2">
						<label for="email" class="text-sm font-medium leading-none flex items-center gap-1.5">
							<Mail class="h-4 w-4 text-muted-foreground" />
							<span>Email:</span>
						</label>
						<Input
							type="email"
							name="email"
							id="email"
							placeholder="name@example.com"
							class={form?.errors?.email ? 'border-destructive focus-visible:ring-destructive' : ''}
							aria-invalid={!!form?.errors?.email}
							required
						/>
						{#if form?.errors?.email}
							<p class="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
								<AlertCircle class="h-4 w-4" />
								<span>{form.errors.email}</span>
							</p>
						{/if}
					</div>

					<!-- Message Field -->
					<div class="space-y-2">
						<label for="message" class="text-sm font-medium leading-none flex items-center gap-1.5">
							<MessageSquare class="h-4 w-4 text-muted-foreground" />
							<span>Что хотите сказать:</span>
						</label>
						<Textarea
							name="message"
							id="message"
							rows={5}
							placeholder="Напишите ваше сообщение..."
							class={form?.errors?.message
								? 'border-destructive focus-visible:ring-destructive'
								: ''}
							aria-invalid={!!form?.errors?.message}
							required
						></Textarea>
						{#if form?.errors?.message}
							<p class="text-sm font-medium text-destructive flex items-center gap-1 mt-1">
								<AlertCircle class="h-4 w-4" />
								<span>{form.errors.message}</span>
							</p>
						{/if}
					</div>

					<Button type="submit" class="w-full sm:w-auto gap-2">
						<Send class="h-4 w-4" />
						<span>Отправить</span>
					</Button>
				</form>
			</CardContent>
		</Card>

		<!-- Table Card -->
		<Card class="shadow-sm">
			<CardHeader class="flex flex-row items-center justify-between space-y-0 pb-4">
				<div>
					<CardTitle class="text-xl flex items-center gap-2">
						<ListFilter class="h-5 w-5 text-primary" />
						<span>Список записей (Entries)</span>
					</CardTitle>
					<CardDescription>Все отправленные сообщения</CardDescription>
				</div>
				<Badge variant="outline">{entries.length} записей</Badge>
			</CardHeader>
			<CardContent>
				{#if entries.length === 0}
					<div class="py-8 text-center text-muted-foreground text-sm">
						Пока нет ни одной записи. Заполните форму выше!
					</div>
				{:else}
					<Table>
						<TableHeader>
							<TableRow>
								<TableHead>Имя</TableHead>
								<TableHead>Email</TableHead>
								<TableHead>Сообщение</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{#each entries as entry (entry.id)}
								<TableRow>
									<TableCell class="font-medium">{entry.name}</TableCell>
									<TableCell class="text-muted-foreground">{entry.email}</TableCell>
									<TableCell>{entry.message}</TableCell>
								</TableRow>
							{/each}
						</TableBody>
					</Table>
				{/if}
			</CardContent>
		</Card>
	</div>
</section>
