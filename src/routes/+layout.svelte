<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/state';
	import { afterNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import Preloader from '../lib/Preloader.svelte';
	import 'purecss/build/pure-min.css';
	import 'purecss/build/grids-responsive-min.css';
	import './styles.css';

	let { children } = $props();

	let menu = $state<HTMLDivElement>();
	let toggle = $state<HTMLButtonElement>();
	let rollBack: ReturnType<typeof setTimeout> | undefined;

	// Pure ships no JavaScript, so this is the responsive menu from the official
	// "Responsive Horizontal-to-Vertical Menu" layout, moved into Svelte's lifecycle:
	// https://purecss.io/layouts/tucked-menu-vertical/
	function toggleHorizontal() {
		if (!menu) return;

		menu.classList.remove('closing');

		for (const el of menu.querySelectorAll('.custom-can-transform')) {
			el.classList.toggle('pure-menu-horizontal');
		}
	}

	function toggleMenu() {
		if (!menu || !toggle) return;

		// the panel has to roll up before the menu switches states
		if (menu.classList.contains('open')) {
			menu.classList.add('closing');
			rollBack = setTimeout(toggleHorizontal, 500);
		} else if (menu.classList.contains('closing')) {
			clearTimeout(rollBack);
		} else {
			toggleHorizontal();
		}

		const open = menu.classList.toggle('open');

		toggle.classList.toggle('x', open);
		toggle.setAttribute('aria-expanded', String(open));
	}

	function closeMenu() {
		if (menu?.classList.contains('open')) {
			toggleMenu();
		}
	}

	onMount(() => {
		const changeEvent = 'onorientationchange' in window ? 'orientationchange' : 'resize';

		window.addEventListener(changeEvent, closeMenu);

		return () => {
			window.removeEventListener(changeEvent, closeMenu);
			clearTimeout(rollBack);
		};
	});

	afterNavigate(({ shallow }) => {
		if (shallow) return;

		closeMenu();
	});
</script>

<Preloader text="Загрузка..." />

<div class="custom-wrapper pure-g" id="menu" bind:this={menu}>
	<div class="pure-u-1 pure-u-md-1-3">
		<div class="pure-menu">
			<a class="pure-menu-heading custom-brand" href={resolve('/')}>SvelteKit App</a>
			<button
				class="custom-toggle"
				id="toggle"
				type="button"
				bind:this={toggle}
				aria-label="Меню"
				aria-controls="menu"
				aria-expanded="false"
				onclick={toggleMenu}
			>
				<span class="bar"></span>
				<span class="bar"></span>
			</button>
		</div>
	</div>
	<div class="pure-u-1 pure-u-md-2-3">
		<div class="pure-menu pure-menu-horizontal custom-menu-right custom-can-transform">
			<ul class="pure-menu-list">
				<li class="pure-menu-item" class:pure-menu-selected={page.route.id === '/'}>
					<a class="pure-menu-link" href={resolve('/')}>Home</a>
				</li>
				<li class="pure-menu-item" class:pure-menu-selected={page.route.id === '/about'}>
					<a class="pure-menu-link" href={resolve('about')}>About</a>
				</li>
				<li class="pure-menu-item" class:pure-menu-selected={page.route.id === '/forms'}>
					<a class="pure-menu-link" href={resolve('forms')}>Forms</a>
				</li>
				<li class="pure-menu-item" class:pure-menu-selected={page.route.id === '/typer'}>
					<a class="pure-menu-link" href={resolve('typer')}>Typer</a>
				</li>
			</ul>
		</div>
	</div>
</div>

<main class="custom-main">
	{@render children?.()}
</main>
