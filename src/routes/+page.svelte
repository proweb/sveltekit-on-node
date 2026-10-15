<script lang="ts">
	import { resolve } from '$app/paths';
	import {
		Button,
		Badge,
		Card,
		CardHeader,
		CardTitle,
		CardDescription,
		CardContent
	} from '../lib/index.js';
	import { ArrowRight, Sparkles, FormInput, Type, Info, Moon } from '@lucide/svelte';
</script>

<svelte:head>
	<title>Главная — SvelteKit App</title>
	<meta name="description" content="Главная страница SvelteKit приложения с Shadcn UI и cnblocks" />
</svelte:head>

<!-- Mist Hero Section -->
<section class="relative overflow-hidden py-20 md:py-32 bg-gradient-to-b from-background via-muted/30 to-background">
	<!-- Background subtle grid effect -->
	<div class="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>

	<div class="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8 text-center max-w-4xl">
		<!-- Top Badge -->
		<div class="mb-6 inline-flex items-center gap-2">
			<Badge variant="outline" class="px-3 py-1 text-xs sm:text-sm font-medium rounded-full bg-background/80 backdrop-blur border-primary/20 hover:border-primary/40 transition-colors">
				<Sparkles class="h-3.5 w-3.5 text-primary mr-1 animate-pulse" />
				Svelte 5 + Shadcn UI + Tailwind CSS
			</Badge>
		</div>

		<!-- Main Hero Title -->
		<h1 class="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground sm:leading-tight mb-6">
			Современный интерфейс <br class="hidden sm:inline" />
			<span class="bg-gradient-to-r from-primary via-primary/80 to-muted-foreground bg-clip-text text-transparent">
				на базе Shadcn UI & cnblocks
			</span>
		</h1>

		<!-- Hero Subtitle -->
		<p class="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
			Добро пожаловать в обновленное приложение на SvelteKit! Быстрый, адаптивный дизайн с поддержкой темной темы, Svelte 5 Runes и интеграцией современных компонентов.
		</p>

		<!-- Action Buttons -->
		<div class="flex flex-wrap items-center justify-center gap-4">
			<Button href={resolve('/forms')} size="lg" class="gap-2 shadow-lg hover:shadow-xl transition-all">
				<span>Перейти к Формам</span>
				<ArrowRight class="h-4 w-4" />
			</Button>

			<Button href={resolve('/typer')} variant="secondary" size="lg" class="gap-2">
				<Type class="h-4 w-4" />
				<span>Печатная машинка</span>
			</Button>

			<Button href={resolve('/about')} variant="outline" size="lg" class="gap-2">
				<Info class="h-4 w-4" />
				<span>О проекте</span>
			</Button>
		</div>
	</div>
</section>

<!-- Feature Showcase Grid -->
<section class="py-16 bg-background">
	<div class="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
		<div class="text-center mb-12">
			<h2 class="text-2xl sm:text-3xl font-bold tracking-tight mb-3">Возможности приложения</h2>
			<p class="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto">
				Исследуйте ключевые разделы и компоненты, переработанные в Shadcn стиле
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-3 gap-6">
			<Card class="hover:shadow-md transition-shadow">
				<CardHeader>
					<div class="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
						<FormInput class="h-5 w-5" />
					</div>
					<CardTitle>SvelteKit Forms</CardTitle>
					<CardDescription>Формы и серверные экшены</CardDescription>
				</CardHeader>
				<CardContent class="text-sm text-muted-foreground">
					Обработка отправки данных с серверной валидацией, отображением ошибок и динамической таблицей записей.
				</CardContent>
			</Card>

			<Card class="hover:shadow-md transition-shadow">
				<CardHeader>
					<div class="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
						<Type class="h-5 w-5" />
					</div>
					<CardTitle>Печатная машинка</CardTitle>
					<CardDescription>Анимация текста на Svelte 5</CardDescription>
				</CardHeader>
				<CardContent class="text-sm text-muted-foreground">
					Интерактивный эффект построчного ввода текста с использованием реактивных рун `$state` и таймеров.
				</CardContent>
			</Card>

			<Card class="hover:shadow-md transition-shadow">
				<CardHeader>
					<div class="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-3">
						<Moon class="h-5 w-5" />
					</div>
					<CardTitle>Темная тема</CardTitle>
					<CardDescription>Mode Watcher</CardDescription>
				</CardHeader>
				<CardContent class="text-sm text-muted-foreground">
					Мгновенное переключение между светлым и темным режимами оформления с сохранением предпочтений.
				</CardContent>
			</Card>
		</div>
	</div>
</section>
