// src/utils/geospatial.ts
// Utility functions for geospatial calculations
export class Geospatial {
	// Calculate distance between two points in meters
	static calculateDistance(
		lat1: number,
		lon1: number,
		lat2: number,
		lon2: number,
	): number {
		const R = 6371e3; // Earth's radius in meters
		const φ1 = (lat1 * Math.PI) / 180;
		const φ2 = (lat2 * Math.PI) / 180;
		const Δφ = ((lat2 - lat1) * Math.PI) / 180;
		const Δλ = ((lon2 - lon1) * Math.PI) / 180;

		const a =
			Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
			Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);

		const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

		return R * c;
	}

	// Create a geospatial point
	static createPoint(
		longitude: number,
		latitude: number,
	): { type: "Point"; coordinates: [number, number] } {
		return {
			type: "Point",
			coordinates: [longitude, latitude],
		};
	}

	// Calculate bounding box for a point and radius
	static calculateBoundingBox(
		latitude: number,
		longitude: number,
		radiusInMeters: number,
	): {
		minLat: number;
		maxLat: number;
		minLon: number;
		maxLon: number;
	} {
		const R = 6371e3; // Earth's radius in meters

		// Angular radius
		const r = radiusInMeters / R;

		const maxLat = latitude + (r * 180) / Math.PI;
		const minLat = latitude - (r * 180) / Math.PI;

		// Calculate longitude bounds
		const maxLon =
			longitude +
			(Math.asin(Math.sin(r) / Math.cos((latitude * Math.PI) / 180)) * 180) /
				Math.PI;
		const minLon = longitude - maxLon;

		return { minLat, maxLat, minLon, maxLon };
	}

	// Check if a point is within a radius of another point
	static isPointWithinRadius(
		point: { latitude: number; longitude: number },
		center: { latitude: number; longitude: number },
		radiusInMeters: number,
	): boolean {
		const distance = this.calculateDistance(
			point.latitude,
			point.longitude,
			center.latitude,
			center.longitude,
		);

		return distance <= radiusInMeters;
	}
}
