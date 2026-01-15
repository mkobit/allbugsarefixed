import dynamicIconImports from 'lucide-react/dynamicIconImports'
import { Map as PigeonMap, Marker, Overlay } from 'pigeon-maps'
import { Suspense, lazy } from 'react'
import type { MapConfig, MapMarker, MapShape } from '../lib/map'
import { cn } from '../lib/ui'

type MapProps = Readonly<{
  className?: string
  config: MapConfig
}>

const FallbackIcon = () => <div className="h-6 w-6 animate-pulse rounded-full bg-slate-400 opacity-50" />

export default function Map({ className, config }: MapProps) {
  return (
    <div
      className={cn(
        'relative h-[400px] w-full overflow-hidden rounded-lg border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-900',
        className,
      )}
    >
      <PigeonMap
        center={config.center as unknown as [number, number]}
        defaultCenter={config.center as unknown as [number, number]}
        defaultZoom={config.zoom}
        zoom={config.zoom}
      >
        {config.markers?.map((marker, index) => (
          <MapMarkerItem key={`${marker.lat}-${marker.lng}-${index}`} marker={marker} />
        ))}
        {config.shapes?.map((shape, index) => (
          <MapShapeItem key={`shape-${index}`} shape={shape} />
        ))}
      </PigeonMap>
    </div>
  )
}

function MapMarkerItem({ marker }: Readonly<{ marker: MapMarker }>) {
  if (marker.icon) {
    const iconName = marker.icon as keyof typeof dynamicIconImports
    const IconImport = dynamicIconImports[iconName]

    if (!IconImport) return null

    const Icon = lazy(IconImport)

    return (
      <Overlay anchor={[marker.lat, marker.lng]} offset={[12, 24]}>
        <div className="group relative -translate-x-1/2 -translate-y-full cursor-pointer">
          <Suspense fallback={<FallbackIcon />}>
            <Icon className="h-6 w-6 text-violet-600 drop-shadow-md transition-transform group-hover:scale-110 dark:text-violet-400" />
          </Suspense>
          {(marker.title || marker.description) && (
            <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900">
              {marker.title && <div className="font-bold">{marker.title}</div>}
              {marker.description && <div>{marker.description}</div>}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
            </div>
          )}
        </div>
      </Overlay>
    )
  }

  return (
    <Marker
      anchor={[marker.lat, marker.lng]}
      width={50}
      color="#7c3aed"
      onClick={() => {
        // Optional: handle click
      }}
    />
  )
}

// Helper component that receives map state via props injected by PigeonMap
function MapShapeItem({
  shape,
  latLngToPixel,
}: Readonly<{
  shape: MapShape
  latLngToPixel?: (latLng: [number, number]) => [number, number]
}>) {
  // Pigeon Maps injects latLngToPixel into children
  if (!latLngToPixel) return null

  if (shape.type === 'circle') {
    // We need to cast here too because shape.center is readonly [number, number]
    // and latLngToPixel likely expects [number, number]
    // Let's try removing this cast too just in case
    const center = latLngToPixel(shape.center as [number, number])
    const radiusInPixels = shape.radius

    return (
      <svg className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible">
        <circle
          cx={center[0]}
          cy={center[1]}
          r={radiusInPixels}
          fill={shape.color ?? 'rgba(124, 58, 237, 0.2)'}
          stroke={shape.color ?? '#7c3aed'}
          strokeWidth={2}
        />
      </svg>
    )
  }

  if (shape.type === 'polygon') {
    const points = shape.coordinates
      .map((coord) => {
        // Same here
        const pixel = latLngToPixel(coord as [number, number])
        return `${pixel[0]},${pixel[1]}`
      })
      .join(' ')

    return (
      <svg className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible">
        <polygon
          points={points}
          fill={shape.color ?? 'rgba(124, 58, 237, 0.2)'}
          stroke={shape.color ?? '#7c3aed'}
          strokeWidth={2}
        />
      </svg>
    )
  }

  return null
}
