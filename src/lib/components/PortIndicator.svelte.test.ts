import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';
import PortIndicator from './PortIndicator.svelte';

describe('PortIndicator', () => {
	it('renders at specified position', async () => {
		const { container } = render(PortIndicator, { props: { position: { x: 10, y: 20 } } });
		const circle = container.querySelector('circle');
		expect(circle?.getAttribute('cx')).toBe('10');
		expect(circle?.getAttribute('cy')).toBe('20');
	});

	it('shows green when connected', async () => {
		const { container } = render(PortIndicator, {
			props: { position: { x: 0, y: 0 }, isConnected: true }
		});
		const circle = container.querySelector('circle');
		expect(circle?.getAttribute('fill')).toBe('#22c55e');
	});

	it('shows amber when available', async () => {
		const { container } = render(PortIndicator, {
			props: { position: { x: 0, y: 0 }, isAvailable: true }
		});
		const circle = container.querySelector('circle');
		expect(circle?.getAttribute('fill')).toBe('#fbbf24');
	});

	it('shows default amber when not connected or available', async () => {
		const { container } = render(PortIndicator, { props: { position: { x: 0, y: 0 } } });
		const circle = container.querySelector('circle');
		expect(circle?.getAttribute('fill')).toBe('#d97706');
	});

	it('shows outline when available', async () => {
		const { container } = render(PortIndicator, {
			props: { position: { x: 0, y: 0 }, isAvailable: true }
		});
		const outlineCircle = container.querySelectorAll('circle')[1];
		expect(outlineCircle).toBeTruthy();
		expect(outlineCircle?.getAttribute('stroke')).toBe('#fbbf24');
	});
});
