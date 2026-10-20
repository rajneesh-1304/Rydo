export interface Coordinates {
    lat: number;
    lng: number;
}

export interface MapLocation extends Coordinates {
    address?: string;
}

export interface RouteInfo {
    distanceKm: number;
    durationMins: number;
    coordinates?: [number, number][];
}

export interface NearbyCab {
    id: number | string;
    lat: number;
    lng: number;
    type: string;
    eta: string;
}

export interface MapProps {
    initialCenter?: Coordinates;
    zoom?: number;
    height?: string | number;
    showSearchOverlay?: boolean;
    showControls?: boolean;
    nearbyCabs?: NearbyCab[];
    onPickupChange?: (coords: Coordinates) => void;
    onDropoffChange?: (coords: Coordinates | null) => void;
    onRouteChange?: (route: RouteInfo | null) => void;
}
