/* Minimal ambient typing for topojson-client (no bundled types, no @types package
   installed). Only the `feature` API used by components/app/RegionMap.tsx. */

declare module "topojson-client" {
  import type { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

  export function feature(
    topology: unknown,
    object: unknown
  ): FeatureCollection<Geometry, GeoJsonProperties>;
}
