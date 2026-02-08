import { curve45, shortStraight } from '$lib/pieces';
import { beforeEach, describe, expect, test } from 'vitest';
import { DragStore } from './drag.svelte';

describe('DragStore rotation', () => {
	let store: DragStore;

	beforeEach(() => {
		store = new DragStore();
	});

	test('initializes preRotation to 0', () => {
		expect(store.preRotation).toBe(0);
	});

	test('rotatePreview increments by 45°', () => {
		store.startDrag(shortStraight);
		store.rotatePreview(1);
		expect(store.preRotation).toBe(45);
		store.rotatePreview(1);
		expect(store.preRotation).toBe(90);
		store.rotatePreview(1);
		expect(store.preRotation).toBe(135);
	});

	test('rotation wraps at 360°', () => {
		store.startDrag(shortStraight);
		// Rotate 8 times (8 * 45° = 360°)
		for (let i = 0; i < 8; i++) {
			store.rotatePreview(1);
		}
		expect(store.preRotation).toBe(0);
	});

	test('rotation wraps correctly after 7 steps', () => {
		store.startDrag(shortStraight);
		// Rotate 7 times -> 315°
		for (let i = 0; i < 7; i++) {
			store.rotatePreview(1);
		}
		expect(store.preRotation).toBe(315);
		// One more should wrap to 0
		store.rotatePreview(1);
		expect(store.preRotation).toBe(0);
	});

	test('handles negative rotation steps', () => {
		store.startDrag(shortStraight);
		store.rotatePreview(-1); // Should be 315° (360 - 45)
		expect(store.preRotation).toBe(315);
		store.rotatePreview(-1); // Should be 270°
		expect(store.preRotation).toBe(270);
	});

	test('rotatePreview works with curves', () => {
		store.startDrag(curve45);
		store.rotatePreview(2); // +90°
		expect(store.preRotation).toBe(90);
	});

	test('preRotation resets on startDrag', () => {
		store.startDrag(shortStraight);
		store.rotatePreview(3); // 135°
		expect(store.preRotation).toBe(135);

		// Start new drag - should reset
		store.startDrag(curve45);
		expect(store.preRotation).toBe(0);
	});

	test('preRotation resets on endDrag', () => {
		store.startDrag(shortStraight);
		store.rotatePreview(2); // 90°
		store.endDrag();
		expect(store.preRotation).toBe(0);
	});

	test('all 8 rotation states (0°, 45°, 90°, 135°, 180°, 225°, 270°, 315°)', () => {
		store.startDrag(shortStraight);
		const expectedRotations = [0, 45, 90, 135, 180, 225, 270, 315];

		expect(store.preRotation).toBe(0);

		for (let i = 1; i < 8; i++) {
			store.rotatePreview(1);
			expect(store.preRotation).toBe(expectedRotations[i]);
		}

		// One more wraps back to 0
		store.rotatePreview(1);
		expect(store.preRotation).toBe(0);
	});
});
