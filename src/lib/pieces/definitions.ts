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

const longLength = straightLength * 2; // 108 mm
const longHalfLength = longLength / 2; // 54 mm

export const longStraight: PieceDefinition = {
	type: 'straight',
	ports: [
		{
			id: 'A',
			position: { x: 0, y: -longHalfLength },
			direction: 'S'
		},
		{
			id: 'B',
			position: { x: 0, y: longHalfLength },
			direction: 'N'
		}
	],
	// SVG path: rectangle centered at origin
	// Width = 10 mm, Height = longLength mm (double the short straight)
	svgPath: `M ${-width / 2} ${-longHalfLength} L ${width / 2} ${-longHalfLength} L ${
		width / 2
	} ${longHalfLength} L ${-width / 2} ${longHalfLength} Z`
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

// Turnout (Y-split) geometry:
// - Entry at split point (origin), two exits (straight + branch)
// - Branch matches curve45 geometry so it aligns with standard curves
// - Straight exit is a long straight (108mm) from the split point
const turnoutBranchX = curveRadius - curveRadius * Math.cos(curveAngleRad);
const turnoutBranchY = curveRadius * Math.sin(curveAngleRad);
const straightToArcY = Math.sqrt(outerRadius * outerRadius - (curveRadius - width / 2) ** 2);

export const turnout: PieceDefinition = {
	type: 'turnout',
	ports: [
		{
			id: 'A',
			position: { x: 0, y: 0 }, // Entry at split point
			direction: 'S'
		},
		{
			id: 'B',
			position: { x: 0, y: longLength }, // Straight exit at top
			direction: 'N'
		},
		{
			id: 'C',
			position: { x: turnoutBranchX, y: turnoutBranchY }, // Branch exit
			direction: 'NW' // Exits at 45° angle
		}
	],
	// SVG: single continuous path forming a Y-shape
	svgPath: (() => {
		return `
			M ${outerStartX} ${outerStartY} 
			L ${-width / 2} ${longLength}
			L ${width / 2} ${longLength}
			L ${width / 2} ${straightToArcY}
			A ${innerRadius} ${innerRadius} 0 0 0 ${outerEndX} ${outerEndY}
			L ${innerEndX} ${innerEndY}  
			A ${outerRadius} ${outerRadius} 0 0 1 ${width / 2} ${outerStartY}
			Z`;
	})()
};
