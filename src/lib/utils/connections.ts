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
