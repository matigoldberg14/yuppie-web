// src/types/google-maps.d.ts
// Definiciones de tipos para Google Maps API

declare global {
  interface Window {
    google: typeof google;
  }
}

declare namespace google.maps {
  class Map {
    constructor(mapDiv: Element, opts?: MapOptions);
    fitBounds(bounds: LatLngBounds): void;
    getBounds(): LatLngBounds;
    getCenter(): LatLng;
    getDiv(): Element;
    getZoom(): number;
    panBy(x: number, y: number): void;
    panTo(latLng: LatLng | LatLngLiteral): void;
    panToBounds(latLngBounds: LatLngBounds | LatLngBoundsLiteral): void;
    setCenter(latlng: LatLng | LatLngLiteral): void;
    setOptions(options: MapOptions): void;
    setZoom(zoom: number): void;
  }

  interface MapOptions {
    center?: LatLng | LatLngLiteral;
    clickableIcons?: boolean;
    disableDefaultUI?: boolean;
    disableDoubleClickZoom?: boolean;
    draggable?: boolean;
    draggableCursor?: string;
    draggingCursor?: string;
    fullscreenControl?: boolean;
    gestureHandling?: string;
    heading?: number;
    keyboardShortcuts?: boolean;
    mapTypeControl?: boolean;
    mapTypeId?: string;
    maxZoom?: number;
    minZoom?: number;
    noClear?: boolean;
    rotateControl?: boolean;
    scaleControl?: boolean;
    scrollwheel?: boolean;
    streetViewControl?: boolean;
    styles?: Array<MapTypeStyle>;
    tilt?: number;
    zoom?: number;
    zoomControl?: boolean;
  }

  interface MapTypeStyle {
    elementType?: string;
    featureType?: string;
    stylers: Array<{ [key: string]: string | number }>;
  }

  class Marker {
    constructor(opts?: MarkerOptions);
    addListener(eventName: string, handler: Function): MapsEventListener;
    getAnimation(): Animation;
    getClickable(): boolean;
    getCursor(): string;
    getDraggable(): boolean;
    getIcon(): string | Icon | Symbol;
    getLabel(): MarkerLabel;
    getMap(): Map;
    getOpacity(): number;
    getPosition(): LatLng;
    getShape(): MarkerShape;
    getTitle(): string;
    getVisible(): boolean;
    getZIndex(): number;
    setAnimation(animation: Animation): void;
    setClickable(flag: boolean): void;
    setCursor(cursor: string): void;
    setDraggable(flag: boolean): void;
    setIcon(icon: string | Icon | Symbol): void;
    setLabel(label: string | MarkerLabel): void;
    setMap(map: Map | null): void;
    setOpacity(opacity: number): void;
    setOptions(options: MarkerOptions): void;
    setPosition(latlng: LatLng | LatLngLiteral): void;
    setShape(shape: MarkerShape): void;
    setTitle(title: string): void;
    setVisible(visible: boolean): void;
    setZIndex(zIndex: number): void;
  }

  interface MarkerOptions {
    anchorPoint?: Point;
    animation?: Animation;
    clickable?: boolean;
    cursor?: string;
    draggable?: boolean;
    icon?: string | Icon | Symbol;
    label?: string | MarkerLabel;
    map?: Map;
    opacity?: number;
    optimized?: boolean;
    position: LatLng | LatLngLiteral;
    shape?: MarkerShape;
    title?: string;
    visible?: boolean;
    zIndex?: number;
  }

  enum Animation {
    BOUNCE = 1,
    DROP = 2,
  }

  interface MarkerLabel {
    color: string;
    fontFamily: string;
    fontSize: string;
    fontWeight: string;
    text: string;
  }

  interface MarkerShape {
    coords: number[];
    type: string;
  }

  interface Icon {
    anchor?: Point;
    labelOrigin?: Point;
    origin?: Point;
    scaledSize?: Size;
    size?: Size;
    url: string;
  }

  interface Symbol {
    anchor?: Point;
    fillColor?: string;
    fillOpacity?: number;
    path: string | SymbolPath;
    rotation?: number;
    scale?: number;
    strokeColor?: string;
    strokeOpacity?: number;
    strokeWeight?: number;
  }

  enum SymbolPath {
    BACKWARD_CLOSED_ARROW = 3,
    BACKWARD_OPEN_ARROW = 4,
    CIRCLE = 0,
    FORWARD_CLOSED_ARROW = 1,
    FORWARD_OPEN_ARROW = 2,
  }

  class LatLng {
    constructor(lat: number, lng: number, noWrap?: boolean);
    equals(other: LatLng): boolean;
    lat(): number;
    lng(): number;
    toString(): string;
    toUrlValue(precision?: number): string;
  }

  interface LatLngLiteral {
    lat: number;
    lng: number;
  }

  class LatLngBounds {
    constructor(sw?: LatLng, ne?: LatLng);
    contains(latLng: LatLng): boolean;
    equals(other: LatLngBounds): boolean;
    extend(point: LatLng): LatLngBounds;
    getCenter(): LatLng;
    getNorthEast(): LatLng;
    getSouthWest(): LatLng;
    intersects(other: LatLngBounds): boolean;
    isEmpty(): boolean;
    toSpan(): LatLng;
    toString(): string;
    toUrlValue(precision?: number): string;
    union(other: LatLngBounds): LatLngBounds;
  }

  interface LatLngBoundsLiteral {
    east: number;
    north: number;
    south: number;
    west: number;
  }

  class Point {
    constructor(x: number, y: number);
    equals(other: Point): boolean;
    toString(): string;
    x: number;
    y: number;
  }

  class Size {
    constructor(
      width: number,
      height: number,
      widthUnit?: string,
      heightUnit?: string
    );
    equals(other: Size): boolean;
    toString(): string;
    height: number;
    width: number;
  }

  class InfoWindow {
    constructor(opts?: InfoWindowOptions);
    close(): void;
    getContent(): string | Element;
    getPosition(): LatLng;
    getZIndex(): number;
    open(
      opts?:
        | InfoWindowOpenOptions
        | { map: Map; anchor: LatLng | LatLngLiteral }
    ): void;
    setContent(content: string | Element): void;
    setOptions(options: InfoWindowOptions): void;
    setPosition(position: LatLng | LatLngLiteral): void;
    setZIndex(zIndex: number): void;
  }

  interface InfoWindowOptions {
    ariaLabel?: string;
    content?: string | Element;
    disableAutoPan?: boolean;
    maxWidth?: number;
    pixelOffset?: Size;
    position?: LatLng | LatLngLiteral;
    zIndex?: number;
  }

  interface InfoWindowOpenOptions {
    anchor?: Marker;
    map?: Map;
  }

  interface MapsEventListener {
    remove(): void;
  }

  const event: {
    clearInstanceListeners(instance: Object): void;
    trigger(instance: any, eventName: string, ...args: any[]): void;
  };
}
