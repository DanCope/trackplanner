import { PLARAIL_CONFIG } from '$lib/config';
import type { Direction, PlacedPiece, Port, Vec2 } from '$lib/types';
import {
	addVec2,
	distanceVec2,
	oppositeDirection,
	rotateDirection,
	rotateVec2Simple
} from './geometry';

interface DraggedPort {
	worldPosition: Vec2;
	direction: Direction;
}

export function findSnapTarget(
	draggedPort: DraggedPort,
	allPieces: PlacedPiece[],
	draggedPieceId: string,
	snapRadius: number = PLARAIL_CONFIG.snapRadius
): { pieceId: string; port: Port; distance: number } | null {
	let closest: { pieceId: string; port: Port; distance: number } | null = null;

	for (const piece of allPieces) {
		if (piece.id === draggedPieceId) continue;

		const rotationSteps = Math.round(piece.rotation / 45);

		for (const port of piece.definition.ports) {
			if (piece.connections.has(port.id)) continue;

			const worldDirection = rotateDirection(port.direction, rotationSteps);
			if (worldDirection !== oppositeDirection(draggedPort.direction)) continue;

			const worldPosition = addVec2(
				piece.position,
				rotateVec2Simple(port.position, piece.rotation)
			);
			const distance = distanceVec2(draggedPort.worldPosition, worldPosition);

			if (distance <= snapRadius && (!closest || distance < closest.distance)) {
				closest = { pieceId: piece.id, port, distance };
			}
		}
	}

	return closest;
}

export function connectPorts(
	pieceA: PlacedPiece,
	portAId: string,
	pieceB: PlacedPiece,
	portBId: string
): void {
	pieceA.connections.set(portAId, `${pieceB.id}:${portBId}`);
	pieceB.connections.set(portBId, `${pieceA.id}:${portAId}`);
}

export function disconnectPort(piece: PlacedPiece, portId: string, allPieces: PlacedPiece[]): void {
	const connectedId = piece.connections.get(portId);
	if (!connectedId) return;

	const [connectedPieceId, connectedPortId] = connectedId.split(':');
	const connectedPiece = allPieces.find((p) => p.id === connectedPieceId);

	piece.connections.delete(portId);
	if (connectedPiece) {
		connectedPiece.connections.delete(connectedPortId);
	}
}

export function disconnectPiece(piece: PlacedPiece, allPieces: PlacedPiece[]): void {
	const portIds = Array.from(piece.connections.keys());
	portIds.forEach((portId) => disconnectPort(piece, portId, allPieces));
}

export interface CoincidentConnection {
	newPiecePortId: string;
	existingPieceId: string;
	existingPortId: string;
}

/**
 * Find all unconnected ports on the newly placed piece that coincide
 * with unconnected ports on existing pieces (for loop closure)
 * @param newPiece The newly placed piece
 * @param allPieces All pieces in the layout (including newPiece)
 * @param tolerance Distance tolerance for coincidence (mm)
 * @returns Array of coincident port pairs
 */
export function findCoincidentConnections(
	newPiece: PlacedPiece,
	allPieces: PlacedPiece[],
	tolerance: number = 0.5
): CoincidentConnection[] {
	const matches: CoincidentConnection[] = [];
	const rotationStepsNew = Math.round(newPiece.rotation / 45);

	// For each unconnected port on the new piece
	for (const newPort of newPiece.definition.ports) {
		if (newPiece.connections.has(newPort.id)) continue;

		const newWorldDirection = rotateDirection(newPort.direction, rotationStepsNew);
		const newWorldPosition = addVec2(
			newPiece.position,
			rotateVec2Simple(newPort.position, newPiece.rotation)
		);

		// Check against all other pieces
		for (const existingPiece of allPieces) {
			if (existingPiece.id === newPiece.id) continue;

			const rotationStepsExisting = Math.round(existingPiece.rotation / 45);

			for (const existingPort of existingPiece.definition.ports) {
				if (existingPiece.connections.has(existingPort.id)) continue;

				const existingWorldDirection = rotateDirection(
					existingPort.direction,
					rotationStepsExisting
				);
				const existingWorldPosition = addVec2(
					existingPiece.position,
					rotateVec2Simple(existingPort.position, existingPiece.rotation)
				);

				// Check if ports coincide: close enough AND opposite directions
				const distance = distanceVec2(newWorldPosition, existingWorldPosition);
				if (
					distance <= tolerance &&
					existingWorldDirection === oppositeDirection(newWorldDirection)
				) {
					matches.push({
						newPiecePortId: newPort.id,
						existingPieceId: existingPiece.id,
						existingPortId: existingPort.id
					});
				}
			}
		}
	}

	return matches;
}
