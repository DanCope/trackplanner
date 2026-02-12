/**
 * PLARAIL CONFIGURATION
 *
 * These dimensions define the geometry of track pieces.
 * Adjust based on actual measurements of your Plarail set.
 *
 * Units: All measurements in millimeters (mm)
 * SVG: converted to pixels on render (mmToPixels scale)
 *
 * Plarail standard dimensions (in millimeters)
 * Adjust these after measuring real pieces
 */

export const PLARAIL_CONFIG = {
	// Short straight piece dimension
	straightLength: 54, // mm

	// 45° curve piece
	curveAngle: 45, // degrees
	curveRadius: 143, // mm (center to center of rails)

	// SVG pixel scale (mm → px)
	mmToPixels: 1, // 1 mm = 1 pixel in SVG rendering (halved for more canvas space)

	// Snap tolerance for detecting close ports
	snapRadius: 10 // mm (distance threshold to snap)
};

export type PlarailConfig = typeof PLARAIL_CONFIG;
