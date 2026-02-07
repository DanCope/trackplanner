export interface Vec2 {
	x: number;
	y: number;
}

export type Direction = 'N' | 'NE' | 'E' | 'SE' | 'S' | 'SW' | 'W' | 'NW';

export const DIRECTIONS: Direction[] = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

export interface RotationTransform {
	angle: number; // degrees, 0-360
	originX: number;
	originY: number;
}
