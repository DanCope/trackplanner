import type { PieceDefinition, Vec2 } from '$lib/types';

export class DragStore {
	isActive = $state(false);
	activePieceDefinition = $state<PieceDefinition | null>(null);
	cursorPosition = $state<Vec2>({ x: 0, y: 0 });
	preRotation = $state(0); // User-applied rotation (45° steps)
	selectedPortIndex = $state<number | null>(null); // User-selected port for snapping
	snapTarget = $state<{ pieceId: string; portId: string } | null>(null);
	snappedPosition = $state<Vec2 | null>(null);
	snappedRotation = $state(0);
	snappedPortId = $state<string | null>(null);

	startDrag(definition: PieceDefinition): void {
		this.isActive = true;
		this.activePieceDefinition = definition;
		this.preRotation = 0;
		this.selectedPortIndex = 0; // Start with first port selected
		this.snapTarget = null;
		this.snappedPosition = null;
		this.snappedRotation = 0;
		this.snappedPortId = null;
	}

	updateCursorPosition(pos: Vec2): void {
		this.cursorPosition = pos;
	}

	rotatePreview(steps: number): void {
		this.preRotation = (this.preRotation + steps * 45 + 360) % 360;
	}

	cyclePort(): void {
		if (!this.activePieceDefinition) return;
		const portCount = this.activePieceDefinition.ports.length;
		if (portCount === 0) return;

		// Cycle to next port (wraps around)
		this.selectedPortIndex = ((this.selectedPortIndex ?? -1) + 1) % portCount;
	}

	setSnapTarget(pieceId: string | null, portId: string | null): void {
		if (pieceId && portId) {
			this.snapTarget = { pieceId, portId };
		} else {
			this.snapTarget = null;
			this.snappedPosition = null;
			this.snappedPortId = null;
		}
	}

	setSnappedTransform(pos: Vec2, rotation: number, draggedPortId: string): void {
		this.snappedPosition = pos;
		this.snappedRotation = rotation;
		this.snappedPortId = draggedPortId;
	}

	endDrag(): void {
		this.isActive = false;
		this.activePieceDefinition = null;
		this.preRotation = 0;
		this.selectedPortIndex = null;
		this.snapTarget = null;
		this.snappedPosition = null;
		this.snappedPortId = null;
	}
}

export const dragStore = new DragStore();
