export interface MapConfig {
  readonly center: readonly [number, number];
  readonly markers?: readonly MapMarker[];
  readonly shapes?: readonly MapShape[];
  readonly zoom: number;
}

export interface MapMarker {
  readonly description?: string;
  readonly icon?: string;
  readonly lat: number;
  readonly lng: number;
  readonly title: string;
}

export type MapShape =
  | Readonly<{
      center: readonly [number, number];
      color?: string;
      radius: number;
      type: "circle";
    }>
  | Readonly<{
      color?: string;
      coordinates: readonly (readonly [number, number])[];
      type: "polygon";
    }>;
