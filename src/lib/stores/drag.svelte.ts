import type { PieceDefinition, PlacedPiece, Vec2 } from '$lib/types';
import { disconnectPiece } from '$lib/utils/connections';

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

	// Move-drag state (non-null when moving an existing piece)
	sourcePieceId = $state<string | null>(null);
	originalPosition = $state<Vec2 | null>(null);
	originalRotation = $state<number>(0);
	originalConnections = $state<Map<string, string> | null>(null);

	get isMoveDrag(): boolean {
		return this.sourcePieceId !== null;
	}

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
		// Clear move-drag state
		this.sourcePieceId = null;
		this.originalPosition = null;
		this.originalRotation = 0;
		this.originalConnections = null;
	}

	startMoveDrag(piece: PlacedPiece, allPieces: PlacedPiece[]): void {
		// Save original state for potential restore
		this.sourcePieceId = piece.id;
		this.originalPosition = { ...piece.position };
		this.originalRotation = piece.rotation;
		// Deep copy connections
		this.originalConnections = new Map(piece.connections);

		// Disconnect piece from all neighbors
		disconnectPiece(piece, allPieces);

		// Set up drag state
		this.isActive = true;
		this.activePieceDefinition = piece.definition;
		this.preRotation = piece.rotation;
		this.selectedPortIndex = 0;
		this.snapTarget = null;
		this.snappedPosition = null;
		this.snappedRotation = 0;
		this.snappedPortId = null;
	}

	cancelDrag(): {
		id: string;
		position: Vec2;
		rotation: number;
		connections: Map<string, string>;
	} | null {
		if (this.sourcePieceId && this.originalPosition && this.originalConnections) {
			const original = {
				id: this.sourcePieceId,
				position: this.originalPosition,
				rotation: this.originalRotation,
				connections: this.originalConnections
			};
			this.endDrag();
			return original;
		}
		this.endDrag();
		return null;
	}
}

export const dragStore = new DragStore();
