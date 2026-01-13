import type { MapConfig } from '../../../lib/map'

export const demoMapData: MapConfig = {
  center: [37.7749, -122.4194],
  markers: [
    {
      description: 'Tech Hub',
      icon: 'map-pin',
      lat: 37.7749,
      lng: -122.4194,
      title: 'San Francisco',
    },
    {
      description: 'Shopping District',
      icon: 'navigation',
      lat: 37.7849,
      lng: -122.4094,
      title: 'Market Street',
    },
  ],
  shapes: [
    {
      center: [37.7749, -122.4194],
      color: 'rgba(59, 130, 246, 0.2)',
      radius: 50, // Pixels
      type: 'circle',
    },
    {
      color: 'rgba(16, 185, 129, 0.2)',
      coordinates: [
        [37.78, -122.42],
        [37.79, -122.41],
        [37.78, -122.4],
      ],
      type: 'polygon',
    },
  ],
  zoom: 13,
}
