<script lang="ts">
	import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../lib/index.js';
	import { Badge } from '../../lib/index.js';
	import { Info, Code, Layers, ShieldCheck, Sparkles } from '@lucide/svelte';
</script>

<svelte:head>
	<title>О проекте — SvelteKit App</title>
	<meta name="description" content="Страница о проекте" />
</svelte:head>

<section class="py-12 md:py-20">
	<div class="container mx-auto px-4 max-w-4xl">
		<div class="text-center mb-10">
			<Badge variant="secondary" class="mb-3 px-3 py-1">
				<Info class="h-3.5 w-3.5 mr-1" />
				Информация
			</Badge>
			<h1 class="text-3xl md:text-5xl font-extrabold tracking-tight mb-4">Страница о проекте</h1>
			<p class="text-lg text-muted-foreground max-w-2xl mx-auto">
				Проект создан с целью практики работы с SvelteKit, Svelte 5 runes и стилизацией Shadcn UI.
			</p>
		</div>

		<div class="grid grid-cols-1 md:grid-cols-2 gap-6">
			<Card class="shadow-sm">
				<CardHeader>
					<div
						class="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2"
					>
						<Code class="h-5 w-5" />
					</div>
					<CardTitle>Современный стек</CardTitle>
					<CardDescription>Svelte 5 & Vite 8</CardDescription>
				</CardHeader>
				<CardContent class="text-sm text-muted-foreground space-y-2">
					<p>
						Использование реактивных рун Svelte 5 (`$state`, `$derived`, `$props`) для создания
						предсказуемого и высокопроизводительного интерфейса.
					</p>
				</CardContent>
			</Card>

			<Card class="shadow-sm">
				<CardHeader>
					<div
						class="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2"
					>
						<Layers class="h-5 w-5" />
					</div>
					<CardTitle>Shadcn UI & Tailwind CSS</CardTitle>
					<CardDescription>Кастомизируемая система компонентов</CardDescription>
				</CardHeader>
				<CardContent class="text-sm text-muted-foreground space-y-2">
					<p>
						Красивые accessible компоненты без привязки к громоздким UI библиотекам. Полный контроль
						над стилями через Tailwind CSS v4.
					</p>
				</CardContent>
			</Card>

			<Card class="shadow-sm">
				<CardHeader>
					<div
						class="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2"
					>
						<Sparkles class="h-5 w-5" />
					</div>
					<CardTitle>cnblocks Инспирация</CardTitle>
					<CardDescription>Готовые блоки интерфейсов</CardDescription>
				</CardHeader>
				<CardContent class="text-sm text-muted-foreground space-y-2">
					<p>
						Интеграция концептов и дизайнов Mist Hero из коллекции cnblocks для создания визуально
						привлекательных стартовых секций.
					</p>
				</CardContent>
			</Card>

			<Card class="shadow-sm">
				<CardHeader>
					<div
						class="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center mb-2"
					>
						<ShieldCheck class="h-5 w-5" />
					</div>
					<CardTitle>SvelteKit 3</CardTitle>
					<CardDescription>Адаптер для Node.js</CardDescription>
				</CardHeader>
				<CardContent class="text-sm text-muted-foreground space-y-2">
					<p>
						Серверный рендеринг, эффективная маршрутизация и использование SvelteKit Form Actions
						для работы с данными.
					</p>
				</CardContent>
			</Card>
		</div>
	</div>
</section>
