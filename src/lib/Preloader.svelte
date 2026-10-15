<script lang="ts">
	import { navigating } from '$app/state';

	interface Props {
		/** Overall size of the 5x5 matrix in pixels */
		size?: number;
		/** Size of each individual dot in pixels */
		dotSize?: number;
		/** Speed multiplier (1 = normal, >1 = faster) */
		speed?: number;
		/** Whether to enable bloom glow effect */
		bloom?: boolean;
		/** Primary accent color for active dots */
		color?: string;
		/** Optional loading text displayed below or next to the loader */
		text?: string;
		/** Full screen overlay mode or inline mode */
		fullscreen?: boolean;
		/** Force show (useful for manual control/testing) */
		show?: boolean;
	}

	let {
		size = 36,
		dotSize = 5,
		speed = 1.25,
		bloom = true,
		color = 'currentColor',
		text = '',
		fullscreen = true,
		show = false
	}: Props = $props();

	function getManhattanDistance(row: number, col: number): number {
		return Math.abs(row - 2) + Math.abs(col - 2);
	}

	const gridDots = Array.from({ length: 25 }, (_, i) => {
		const row = Math.floor(i / 5);
		const col = i % 5;
		const manhattan = getManhattanDistance(row, col);
		const ring = Math.max(0, Math.min(4, manhattan));
		return {
			index: i,
			row,
			col,
			ring,
			parity: ring % 2
		};
	});

	const isVisible = $derived(show || Boolean(navigating.to));
</script>

{#if isVisible}
	<div
		class="dmx-preloader-container text-primary"
		class:dmx-fullscreen={fullscreen}
		style:--dmx-color={color}
		style:--dmx-size="{size}px"
		style:--dmx-dot-size="{dotSize}px"
		style:--dmx-speed={speed}
		role="status"
		aria-live="polite"
		aria-label={text || 'Loading page'}
	>
		<div class="dmx-root" class:dmx-bloom={bloom}>
			<div class="dmx-grid">
				{#each gridDots as dot (dot.index)}
					<span
						class="dmx-dot dmx-ripple-echo"
						style:--dmx-ripple-ring={dot.ring}
						style:--dmx-ripple-parity={dot.parity}
						style:width="{dotSize}px"
						style:height="{dotSize}px"
					></span>
				{/each}
			</div>
		</div>
		{#if text}
			<span class="dmx-text">{text}</span>
		{/if}
	</div>
{/if}

<style>
	.dmx-preloader-container {
		display: inline-flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 12px;
		--dmx-cycle: 1.5s;
		--dmx-opacity-base: 0.16;
		--dmx-opacity-mid: 0.32;
		--dmx-opacity-peak: 1;
	}

	.dmx-fullscreen {
		position: fixed;
		top: 0;
		left: 0;
		width: 100vw;
		height: 100vh;
		background: hsl(var(--background) / 0.85);
		backdrop-filter: blur(4px);
		z-index: 9999;
	}

	.dmx-root {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		vertical-align: middle;
	}

	.dmx-grid {
		display: grid;
		grid-template-rows: repeat(5, minmax(0, 1fr));
		grid-template-columns: repeat(5, minmax(0, 1fr));
		gap: calc((var(--dmx-size) - (var(--dmx-dot-size) * 5)) / 4);
		width: var(--dmx-size);
		height: var(--dmx-size);
	}

	.dmx-dot {
		display: block;
		background: currentColor;
		border-radius: 999px;
		transform-origin: 50%;
		will-change: opacity, filter;
		opacity: calc(0.5 * (var(--dmx-opacity-base) + var(--dmx-opacity-mid)));
		--dmx-bloom-level: 0;
	}

	.dmx-bloom .dmx-dot {
		filter: drop-shadow(
				0 0 calc(var(--dmx-dot-size) * 0.75 * var(--dmx-bloom-level, 0)) currentColor
			)
			drop-shadow(0 0 calc(var(--dmx-dot-size) * 1.35 * var(--dmx-bloom-level, 0)) currentColor);
	}

	.dmx-ripple-echo {
		animation: dmx-ripple-echo calc(var(--dmx-cycle) / var(--dmx-speed, 1.25)) ease-in-out infinite;
		animation-delay: calc(
			(var(--dmx-ripple-ring, 0) * 0.14 + var(--dmx-ripple-parity, 0) * 0.03) * var(--dmx-cycle) /
				var(--dmx-speed, 1.25)
		);
	}

	.dmx-text {
		font-family: var(--font-mono, monospace);
		font-size: 0.875rem;
		color: hsl(var(--foreground));
		letter-spacing: 0.05em;
	}

	@keyframes dmx-ripple-echo {
		0%,
		100% {
			opacity: calc(0.625 * var(--dmx-opacity-base));
			--dmx-bloom-level: 0;
		}
		28% {
			opacity: calc(0.98 * var(--dmx-opacity-peak));
			--dmx-bloom-level: 0.9;
		}
		56% {
			opacity: var(--dmx-opacity-mid);
			--dmx-bloom-level: 0;
		}
		78% {
			opacity: calc(0.68 * var(--dmx-opacity-peak) + 0.32 * var(--dmx-opacity-mid));
			--dmx-bloom-level: 0;
		}
	}
</style>
