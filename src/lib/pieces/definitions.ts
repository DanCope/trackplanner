import { PLARAIL_CONFIG } from '$lib/config';
import type { PieceDefinition } from '$lib/types';
import { rotateDirection } from '$lib/utils/geometry';

const straightLength = PLARAIL_CONFIG.straightLength; // 54 mm
const halfLength = straightLength / 2; // 27 mm
const width = 10; // mm

export const shortStraight: PieceDefinition = {
	type: 'straight',
	ports: [
		{
			id: 'A',
			position: { x: 0, y: -halfLength },
			direction: 'S'
		},
		{
			id: 'B',
			position: { x: 0, y: halfLength },
			direction: 'N'
		}
	],
	// SVG path: rectangle centered at origin
	// Width = 10 mm, Height = straightLength mm
	svgPath: `M ${-width / 2} ${-halfLength} L ${width / 2} ${-halfLength} L ${
		width / 2
	} ${halfLength} L ${-width / 2} ${halfLength} Z`
};

const curveRadius = PLARAIL_CONFIG.curveRadius; // 143 mm
const curveAngle = PLARAIL_CONFIG.curveAngle; // 45 degrees
const curveHalfWidth = width / 2;

// Curve geometry:
// - Entry at origin (0, 0), facing S (into the piece)
// - Arc center is to the right of entry (at +radius, 0)
// - Arc sweeps 45° counterclockwise (in SVG Y-down: visually turns right)
// - Exit port is at arc endpoint, direction is rotated 45°

// Arc endpoints for a ring segment centered on the curve centerline
const curveAngleRad = (curveAngle * Math.PI) / 180;
const innerRadius = curveRadius - curveHalfWidth;
const outerRadius = curveRadius + curveHalfWidth;

const innerStartX = curveHalfWidth;
const innerStartY = 0;
const outerStartX = -curveHalfWidth;
const outerStartY = 0;

const innerEndX = curveRadius - innerRadius * Math.cos(curveAngleRad);
const innerEndY = innerRadius * Math.sin(curveAngleRad);
const outerEndX = curveRadius - outerRadius * Math.cos(curveAngleRad);
const outerEndY = outerRadius * Math.sin(curveAngleRad);

export const curve45: PieceDefinition = {
	type: 'curve',
	ports: [
		{
			id: 'A',
			position: { x: 0, y: 0 },
			direction: 'S'
		},
		{
			id: 'B',
			position: {
				x: curveRadius - curveRadius * Math.cos(curveAngleRad),
				y: curveRadius * Math.sin(curveAngleRad)
			},
			direction: rotateDirection('S', 3) // Exit direction after 45° right-turn in SVG y-down
		}
	],
	// SVG: ring segment path (outer arc -> inner arc)
	// Using SVG arc command: A rx ry x-axis-rotation large-arc-flag sweep-flag x y
	// Flip sweep flags to curve in the opposite direction
	svgPath: `M ${outerStartX} ${outerStartY} A ${outerRadius} ${outerRadius} 0 0 0 ${outerEndX} ${outerEndY} L ${innerEndX} ${innerEndY} A ${innerRadius} ${innerRadius} 0 0 1 ${innerStartX} ${innerStartY} Z`
};
