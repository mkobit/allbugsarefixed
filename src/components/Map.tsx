import { Map as PigeonMap, Marker, Overlay } from "pigeon-maps";
import type { MapConfig, MapMarker, MapShape } from "../lib/map";
import { cn } from "../lib/ui";

type MapProps = Readonly<{
  className?: string;
  config: MapConfig;
}>;

export default function Map({ className, config }: MapProps) {
  return (
    <div className={cn("h-[400px] w-full overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800", className)}>
      <PigeonMap
        center={config.center as [number, number]}
        defaultCenter={config.center as [number, number]}
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
  );
}

function MapMarkerItem({ marker }: Readonly<{ marker: MapMarker }>) {
  if (marker.icon) {
    const Icon = marker.icon;
    return (
      <Overlay anchor={[marker.lat, marker.lng]} offset={[12, 24]}>
        <div className="group relative -translate-x-1/2 -translate-y-full cursor-pointer">
          <Icon className="h-6 w-6 text-violet-600 drop-shadow-md transition-transform group-hover:scale-110 dark:text-violet-400" />
          {(marker.title || marker.description) && (
             <div className="absolute bottom-full left-1/2 mb-2 hidden -translate-x-1/2 whitespace-nowrap rounded bg-slate-900 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:block group-hover:opacity-100 dark:bg-slate-100 dark:text-slate-900">
              {marker.title && <div className="font-bold">{marker.title}</div>}
              {marker.description && <div>{marker.description}</div>}
              <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900 dark:border-t-slate-100" />
            </div>
          )}
        </div>
      </Overlay>
    );
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
  );
}

// Helper component that receives map state via props injected by PigeonMap
function MapShapeItem({
  shape,
  latLngToPixel
}: Readonly<{
  shape: MapShape;
  latLngToPixel?: (latLng: [number, number]) => [number, number]
}>) {
  // Pigeon Maps injects latLngToPixel into children
  if (!latLngToPixel) return null;

  if (shape.type === "circle") {
    const center = latLngToPixel(shape.center as [number, number]);
    // Rough approximation of meters to pixels at zoom level.
    // For a real app we might want more precise calculation based on zoom level and latitude.
    // For simplicity, we interpret radius as pixels here if we can't easily get meters/pixel.
    // However, usually radius is in meters.
    // Pigeon Maps doesn't provide metersPerPixel easily in the child props without extra logic.
    // We will assume radius is in pixels for this visual demo or use a fixed scaling factor.
    // Alternatively, calculate a point at distance radius and measure pixel distance.

    // Let's just interpret radius as pixels for now to keep it simple and working
    const radiusInPixels = shape.radius;

    return (
      <svg className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible">
        <circle
          cx={center[0]}
          cy={center[1]}
          r={radiusInPixels}
          fill={shape.color ?? "rgba(124, 58, 237, 0.2)"}
          stroke={shape.color ?? "#7c3aed"}
          strokeWidth={2}
        />
      </svg>
    );
  }

  if (shape.type === "polygon") {
    const points = shape.coordinates.map((coord) => {
      const pixel = latLngToPixel(coord as [number, number]);
      return `${pixel[0]},${pixel[1]}`;
    }).join(" ");

    return (
      <svg className="pointer-events-none absolute left-0 top-0 h-full w-full overflow-visible">
        <polygon
          points={points}
          fill={shape.color ?? "rgba(124, 58, 237, 0.2)"}
          stroke={shape.color ?? "#7c3aed"}
          strokeWidth={2}
        />
      </svg>
    );
  }

  return null;
}
