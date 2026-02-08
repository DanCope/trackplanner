import type { PieceDefinition, PlacedPiece, Vec2 } from '$lib/types';
import { directionToAngle, oppositeDirection, rotateDirection, rotateVec2 } from './geometry';

export interface SnapResult {
	position: Vec2;
	rotation: number;
}

/**
 * Compute the position and rotation needed to snap draggedPiece's port
 * to a target port on a placed piece
 */
export function computeSnapTransform(
	draggedDefinition: PieceDefinition,
	draggedPortId: string,
	targetPiece: PlacedPiece,
	targetPortId: string,
	preRotation: number
): SnapResult {
	// Get port definitions
	const draggedPort = draggedDefinition.ports.find((p) => p.id === draggedPortId);
	const targetPort = targetPiece.definition.ports.find((p) => p.id === targetPortId);

	if (!draggedPort || !targetPort) {
		throw new Error('Port not found');
	}

	// Compute target port world position
	const targetAngleRad = (targetPiece.rotation * Math.PI) / 180;
	const cos = Math.cos(targetAngleRad);
	const sin = Math.sin(targetAngleRad);
	const relX = targetPort.position.x * cos - targetPort.position.y * sin;
	const relY = targetPort.position.x * sin + targetPort.position.y * cos;
	const targetWorldPos = {
		x: targetPiece.position.x + relX,
		y: targetPiece.position.y + relY
	};

	// Determine rotation to connect ports
	// Target's port faces outward in its direction (after piece rotation)
	// Dragged piece's port must face opposite direction to align
	const targetWorldDirection = rotateDirection(targetPort.direction, targetPiece.rotation / 45);
	const requiredDirection = oppositeDirection(targetWorldDirection);
	const currentDragDirection = rotateDirection(draggedPort.direction, preRotation / 45);
	const directionDiff =
		directionToAngle(requiredDirection) - directionToAngle(currentDragDirection);
	const snapRotation = (Math.round(directionDiff / 45) * 45 + 360) % 360;
	const finalRotation = (preRotation + snapRotation) % 360;

	// Compute position: dragged piece should be positioned so its port aligns with target
	// Rotate dragged port position by final rotation to get absolute displacement
	const rotatedDragPort = rotateVec2(draggedPort.position, { x: 0, y: 0 }, finalRotation);

	// Position of dragged piece origin = target port position - rotated dragged port position
	const snappedPos = {
		x: targetWorldPos.x - rotatedDragPort.x,
		y: targetWorldPos.y - rotatedDragPort.y
	};

	return {
		position: snappedPos,
		rotation: finalRotation
	};
}
