import type { PlacedPiece } from '$lib/types';

export class LayoutStore {
	pieces = $state<PlacedPiece[]>([]);

	addPiece(piece: PlacedPiece): void {
		this.pieces = [...this.pieces, piece];
	}

	removePiece(id: string): void {
		this.pieces = this.pieces.filter((piece: PlacedPiece) => piece.id !== id);

		for (const piece of this.pieces) {
			const portsToRemove: string[] = [];
			piece.connections.forEach((targetId: string, portId: string) => {
				if (targetId.startsWith(`${id}:`)) {
					portsToRemove.push(portId);
				}
			});

			portsToRemove.forEach((portId: string) => piece.connections.delete(portId));
		}
	}

	updatePiece(id: string, updates: Partial<PlacedPiece>): void {
		const piece = this.pieces.find((p: PlacedPiece) => p.id === id);
		if (!piece) {
			return;
		}

		Object.assign(piece, updates);
	}

	getPiece(id: string): PlacedPiece | undefined {
		return this.pieces.find((piece: PlacedPiece) => piece.id === id);
	}
}

export const layoutStore = new LayoutStore();
