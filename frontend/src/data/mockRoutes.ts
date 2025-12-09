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
  date: string; // ISO
  distanceKm: number;
  walkType: WalkType;
  startTime: string;
  finishTime: string;
  startLocation: {
    name: string;
    address: string;
    coord: RoutePoint;
  };
  description: string;
  checkpoints: string;
  controlPoints: ControlPoint[];
  track: RoutePoint[];
  files: {
    gpx: string;
    kml: string;
  };
};

export const mockRoutes: RouteItem[] = [
  {
    id: "2025-walk-14",
    title: "Стадион УрФУ",
    date: "2025-05-18",
    distanceKm: 14,
    walkType: "walk",
    startTime: "11:00",
    finishTime: "18:00",
    startLocation: {
      name: "Стадион УрФУ",
      address: "ул. Коминтерна, 18",
      coord: { lat: 56.8407, lng: 60.6163 },
    },
    description:
      "Городской маршрут через центр и набережную, подходит для пешей прогулки.",
    checkpoints: "C – КП4 – КП5 – КП6 – КП8 – Ф",
    controlPoints: [
      {
        label: "КП4",
        description: "Набережная Городского пруда",
        coord: { lat: 56.8472, lng: 60.595 },
      },
      {
        label: "КП5",
        description: "Плотинка",
        coord: { lat: 56.8377, lng: 60.5979 },
      },
      {
        label: "КП6",
        description: "Около Ельцин-центра",
        coord: { lat: 56.8388, lng: 60.6056 },
      },
      {
        label: "КП8",
        description: "Стадион УрФУ",
        coord: { lat: 56.8407, lng: 60.6163 },
      },
    ],
    track: [
      { lat: 56.8407, lng: 60.6163 },
      { lat: 56.844, lng: 60.611 },
      { lat: 56.8472, lng: 60.595 },
      { lat: 56.8445, lng: 60.5885 },
      { lat: 56.8377, lng: 60.5979 },
      { lat: 56.8388, lng: 60.6056 },
      { lat: 56.8407, lng: 60.6163 },
    ],
    files: {
      gpx: "#gpx-2025-walk-14",
      kml: "#kml-2025-walk-14",
    },
  },
  {
    id: "2024-bike-10",
    title: "Корпус УрФУ",
    date: "2024-05-19",
    distanceKm: 10,
    walkType: "bike",
    startTime: "12:00",
    finishTime: "17:00",
    startLocation: {
      name: "Корпус УрФУ",
      address: "пр. Ленина, 51",
      coord: { lat: 56.8402, lng: 60.6134 },
    },
    description: "Кольцевой веломаршрут по центральным улицам и набережной.",
    checkpoints: "C – КП2 – КП3 – КП6 – Ф",
    controlPoints: [
      {
        label: "КП2",
        description: "Плотинка",
        coord: { lat: 56.8377, lng: 60.5979 },
      },
      {
        label: "КП3",
        description: "Храм-на-Крови",
        coord: { lat: 56.8395, lng: 60.6035 },
      },
      {
        label: "КП6",
        description: "Ельцин-центр",
        coord: { lat: 56.8388, lng: 60.6056 },
      },
    ],
    track: [
      { lat: 56.8402, lng: 60.6134 },
      { lat: 56.8395, lng: 60.6035 },
      { lat: 56.8377, lng: 60.5979 },
      { lat: 56.8388, lng: 60.6056 },
      { lat: 56.8402, lng: 60.6134 },
    ],
    files: {
      gpx: "#gpx-2024-bike-10",
      kml: "#kml-2024-bike-10",
    },
  },
];
