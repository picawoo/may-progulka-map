export type WalkType = "walk" | "bike";

type RoutePoint = {
  lat: number;
  lng: number;
};

type ControlPoint = {
  label: string;
  description: string;
  coord: RoutePoint;
};

export type RouteItem = {
  id: string;
  title: string;
  date: string;
  distanceKm: number;
  walkType: WalkType;
  startTime: string;
  finishTime: string;
  startLocation: {
    name: string;
    address: string;
    coord: RoutePoint;
  };
  finishLocation: {
    name: string;
    address: string;
    coord: RoutePoint;
  };
  description: string;
  checkpoints: string;
  controlPoints: ControlPoint[];
  track: RoutePoint[];
  color: string;
};

export interface Location {
  name: string;
  address?: string;
  coord?: { lat: number; lng: number };
}
