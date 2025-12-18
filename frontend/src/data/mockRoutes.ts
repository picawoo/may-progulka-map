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
  color: string; // HEX код цвета для отображения линии маршрута
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
    color: "#3B82F6", // Синий цвет - городской маршрут
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
    color: "#EF4444", // Красный цвет - веломаршрут
  },

  {
    id: "2025-walk-21",
    title: 'Лесопарк "Калиновские разрезы"',
    date: "2025-06-15",
    distanceKm: 21,
    walkType: "walk",
    startTime: "08:30",
    finishTime: "16:00",
    startLocation: {
      name: "Вход в Калиновский лесопарк",
      address: "ул. Серафимы Дерябиной, 24Г",
      coord: { lat: 56.8194, lng: 60.5947 },
    },
    description:
      "Живописный маршрут по лесопарку с посещением озер и смотровых площадок. Рекомендуется удобная обувь.",
    checkpoints: "C – КП1 – КП3 – КП5 – КП7 – Ф",
    controlPoints: [
      {
        label: "КП1",
        description: "Смотровая площадка 'Орлиное гнездо'",
        coord: { lat: 56.8168, lng: 60.6023 },
      },
      {
        label: "КП3",
        description: "Калиновский разрез №2",
        coord: { lat: 56.8125, lng: 60.6154 },
      },
      {
        label: "КП5",
        description: "Озеро 'Чайка'",
        coord: { lat: 56.8062, lng: 60.6088 },
      },
      {
        label: "КП7",
        description: "Родник 'Калиновский'",
        coord: { lat: 56.8141, lng: 60.5901 },
      },
    ],
    track: [
      { lat: 56.8194, lng: 60.5947 },
      { lat: 56.8182, lng: 60.5991 },
      { lat: 56.8168, lng: 60.6023 },
      { lat: 56.815, lng: 60.61 },
      { lat: 56.8125, lng: 60.6154 },
      { lat: 56.809, lng: 60.613 },
      { lat: 56.8062, lng: 60.6088 },
      { lat: 56.808, lng: 60.602 },
      { lat: 56.811, lng: 60.596 },
      { lat: 56.8141, lng: 60.5901 },
      { lat: 56.817, lng: 60.592 },
      { lat: 56.8194, lng: 60.5947 },
    ],
    files: {
      gpx: "#gpx-2025-walk-21",
      kml: "#kml-2025-walk-21",
    },
    color: "#10B981", // Зеленый цвет - лесной маршрут
  },

  {
    id: "2025-bike-35",
    title: "Шарташ - Исток - Уктус",
    date: "2025-07-22",
    distanceKm: 35,
    walkType: "bike",
    startTime: "09:00",
    finishTime: "15:30",
    startLocation: {
      name: "Шарташский лесопарк (южный вход)",
      address: "ул. Отдыха, 24",
      coord: { lat: 56.8801, lng: 60.6554 },
    },
    description:
      "Экстремальный веломаршрут для подготовленных райдеров. Требуется горный велосипед. Перепады высот до 150 метров.",
    checkpoints: "C – КП4 – КП8 – КП12 – КП15 – Ф",
    controlPoints: [
      {
        label: "КП4",
        description: "Каменные палатки",
        coord: { lat: 56.8743, lng: 60.6372 },
      },
      {
        label: "КП8",
        description: "Исток реки Исеть",
        coord: { lat: 56.858, lng: 60.5847 },
      },
      {
        label: "КП12",
        description: "Уктусские горы (перевал)",
        coord: { lat: 56.8462, lng: 60.5691 },
      },
      {
        label: "КП15",
        description: "Уктусский лесопарк (выход)",
        coord: { lat: 56.8478, lng: 60.5783 },
      },
    ],
    track: [
      { lat: 56.8801, lng: 60.6554 },
      { lat: 56.878, lng: 60.648 },
      { lat: 56.8743, lng: 60.6372 },
      { lat: 56.871, lng: 60.628 },
      { lat: 56.868, lng: 60.615 },
      { lat: 56.865, lng: 60.605 },
      { lat: 56.858, lng: 60.5847 },
      { lat: 56.854, lng: 60.578 },
      { lat: 56.85, lng: 60.572 },
      { lat: 56.8462, lng: 60.5691 },
      { lat: 56.847, lng: 60.575 },
      { lat: 56.8478, lng: 60.5783 },
    ],
    files: {
      gpx: "#gpx-2025-bike-35",
      kml: "#kml-2025-bike-35",
    },
    color: "#8B5CF6", // Фиолетовый цвет - экстремальный маршрут
  },

  {
    id: "2024-walk-12",
    title: "Исторический центр",
    date: "2024-09-10",
    distanceKm: 12,
    walkType: "walk",
    startTime: "10:00",
    finishTime: "14:30",
    startLocation: {
      name: "Площадь 1905 года",
      address: "пл. 1905 года",
      coord: { lat: 56.8369, lng: 60.5975 },
    },
    description:
      "Неспешная прогулка по историческому центру Екатеринбурга с посещением главных достопримечательностей.",
    checkpoints: "C – КП2 – КП4 – КП6 – КП9 – Ф",
    controlPoints: [
      {
        label: "КП2",
        description: "Плотинка, камень 'Россия-Европа'",
        coord: { lat: 56.8377, lng: 60.5979 },
      },
      {
        label: "КП4",
        description: "Литературный квартал",
        coord: { lat: 56.8415, lng: 60.6042 },
      },
      {
        label: "КП6",
        description: "Храм-на-Крови",
        coord: { lat: 56.8395, lng: 60.6035 },
      },
      {
        label: "КП9",
        description: "Дендрарий УрО РАН",
        coord: { lat: 56.8342, lng: 60.6168 },
      },
    ],
    track: [
      { lat: 56.8369, lng: 60.5975 },
      { lat: 56.8377, lng: 60.5979 },
      { lat: 56.8385, lng: 60.599 },
      { lat: 56.8395, lng: 60.6035 },
      { lat: 56.8415, lng: 60.6042 },
      { lat: 56.842, lng: 60.608 },
      { lat: 56.84, lng: 60.612 },
      { lat: 56.838, lng: 60.615 },
      { lat: 56.8342, lng: 60.6168 },
      { lat: 56.835, lng: 60.611 },
      { lat: 56.8369, lng: 60.5975 },
    ],
    files: {
      gpx: "#gpx-2024-walk-12",
      kml: "#kml-2024-walk-12",
    },
    color: "#F59E0B", // Оранжевый цвет - исторический маршрут
  },

  {
    id: "2025-bike-25",
    title: "Верх-Исетский пруд",
    date: "2025-08-05",
    distanceKm: 25,
    walkType: "bike",
    startTime: "11:00",
    finishTime: "16:00",
    startLocation: {
      name: 'Парк "Радуга"',
      address: "ул. Репина, 94",
      coord: { lat: 56.8412, lng: 60.5734 },
    },
    description:
      "Велосипедный маршрут вокруг Верх-Исетского пруда по асфальтированным и грунтовым дорожкам. Подходит для велосипедов любого типа.",
    checkpoints: "C – КП3 – КП6 – КП9 – КП11 – Ф",
    controlPoints: [
      {
        label: "КП3",
        description: "Верх-Исетская плотина",
        coord: { lat: 56.8468, lng: 60.5781 },
      },
      {
        label: "КП6",
        description: "Пляж 'Солнечный'",
        coord: { lat: 56.8532, lng: 60.5694 },
      },
      {
        label: "КП9",
        description: "Западный берег пруда",
        coord: { lat: 56.852, lng: 60.5443 },
      },
      {
        label: "КП11",
        description: "Южный мыс",
        coord: { lat: 56.8375, lng: 60.5518 },
      },
    ],
    track: [
      { lat: 56.8412, lng: 60.5734 },
      { lat: 56.843, lng: 60.575 },
      { lat: 56.8468, lng: 60.5781 },
      { lat: 56.849, lng: 60.575 },
      { lat: 56.8532, lng: 60.5694 },
      { lat: 56.855, lng: 60.562 },
      { lat: 56.856, lng: 60.555 },
      { lat: 56.856, lng: 60.548 },
      { lat: 56.855, lng: 60.541 },
      { lat: 56.852, lng: 60.5443 },
      { lat: 56.849, lng: 60.547 },
      { lat: 56.845, lng: 60.549 },
      { lat: 56.841, lng: 60.551 },
      { lat: 56.8375, lng: 60.5518 },
      { lat: 56.835, lng: 60.558 },
      { lat: 56.836, lng: 60.565 },
      { lat: 56.838, lng: 60.571 },
      { lat: 56.8412, lng: 60.5734 },
    ],
    files: {
      gpx: "#gpx-2025-bike-25",
      kml: "#kml-2025-bike-25",
    },
    color: "#06B6D4", // Голубой цвет - маршрут вокруг воды
  },

  {
    id: "2024-walk-8",
    title: "Парк Зеленая роща",
    date: "2024-06-08",
    distanceKm: 8,
    walkType: "walk",
    startTime: "16:00",
    finishTime: "19:00",
    startLocation: {
      name: "Главный вход в парк",
      address: "ул. Мичурина, 230",
      coord: { lat: 56.8198, lng: 60.6405 },
    },
    description:
      "Короткая вечерняя прогулка по парку. Идеально для семейного отдыха. Маршрут полностью асфальтирован.",
    checkpoints: "C – КП1 – КП3 – КП5 – Ф",
    controlPoints: [
      {
        label: "КП1",
        description: "Детская площадка 'Сказка'",
        coord: { lat: 56.8215, lng: 60.6382 },
      },
      {
        label: "КП3",
        description: "Ротонда на холме",
        coord: { lat: 56.8183, lng: 60.6347 },
      },
      {
        label: "КП5",
        description: "Озеро в центре парка",
        coord: { lat: 56.8162, lng: 60.6374 },
      },
    ],
    track: [
      { lat: 56.8198, lng: 60.6405 },
      { lat: 56.821, lng: 60.639 },
      { lat: 56.8215, lng: 60.6382 },
      { lat: 56.8205, lng: 60.636 },
      { lat: 56.819, lng: 60.635 },
      { lat: 56.8183, lng: 60.6347 },
      { lat: 56.817, lng: 60.635 },
      { lat: 56.8162, lng: 60.6374 },
      { lat: 56.817, lng: 60.639 },
      { lat: 56.8185, lng: 60.641 },
      { lat: 56.8198, lng: 60.6405 },
    ],
    files: {
      gpx: "#gpx-2024-walk-8",
      kml: "#kml-2024-walk-8",
    },
    color: "#EC4899", // Розовый цвет - семейный, легкий маршрут
  },
];
