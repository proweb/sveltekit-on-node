import { describe, expect, it } from 'vitest';
import Preloader from './Preloader.svelte';
import { render } from 'svelte/server';

describe('Preloader', () => {
	it('renders HTML when show prop is true', () => {
		const result = render(Preloader, { props: { show: true, text: 'Загрузка...' } });

		expect(result.body).toContain('dmx-preloader-container');
		expect(result.body).toContain('Загрузка...');
		expect(result.body).toContain('dmx-ripple-echo');

		// 25 dot elements in the 5x5 matrix
		const matches = result.body.match(/<span class="dmx-dot/g);
		expect(matches?.length).toBe(25);
	});

	it('does not render body content when show prop is false and navigating is null', () => {
		const result = render(Preloader, { props: { show: false } });

		expect(result.body).not.toContain('dmx-preloader-container');
	});

	it('applies dmx-bloom class when bloom is true', () => {
		const result = render(Preloader, { props: { show: true, bloom: true } });

		expect(result.body).toContain('dmx-bloom');
	});

	it('omits dmx-bloom class when bloom is false', () => {
		const result = render(Preloader, { props: { show: true, bloom: false } });

		expect(result.body).not.toContain('dmx-bloom');
	});
});
