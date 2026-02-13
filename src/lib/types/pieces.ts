import type { Direction, Vec2 } from './geometry';

export interface Port {
	id: string; // Unique ID per piece (e.g., 'portA', 'portB')
	position: Vec2; // Relative to piece origin (mm)
	direction: Direction; // Which way the port faces (N, NE, ..., NW)
}

export interface PieceDefinition {
	type: 'straight' | 'curve' | 'turnout'; // Piece type
	ports: Port[]; // All available ports
	svgPath: string; // SVG path data (relative to origin)
}

export interface PlacedPiece {
	id: string; // Unique instance ID (UUID or similar)
	definition: PieceDefinition; // Reference to piece definition
	position: Vec2; // World position of piece origin (mm)
	rotation: number; // Rotation in degrees, multiple of 45 (0, 45, 90, ...)
	connections: Map<string, string>; // portId → connected piece portId (e.g., 'portA' → 'piece-2:portB')
}
