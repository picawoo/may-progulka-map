import apiClient from "./client";
import type { RouteItem } from "../data/mockRoutes";

// Типы для API
export interface ApiRoute {
  id?: number;
  name: string;
  description?: string;
  distanceKm: number;
  walkType: "walk" | "bike";
  date: string; // Формат YYYY-MM-DD
  points?: Array<{ lat: number; lng: number }>;
  startLocation?: {
    name?: string;
    address?: string;
    coord?: { lat: number; lng: number };
  };
}

export interface ParseGpxResponse {
  points: Array<{ lat: number; lng: number }>;
  distanceKm: number;
  name: string;
}

export interface BulkImportResponse {
  created: number;
  skipped: number;
  errors: number;
}

// Маппинг из API формата в RouteItem
const mapApiRouteToRouteItem = (apiRoute: ApiRoute): RouteItem => {
  const id = apiRoute.id?.toString() || `route-${Date.now()}`;
  
  // Безопасная обработка startLocation
  const startLocation = apiRoute.startLocation || {};
  const startLocationName = startLocation.name || "";
  const startLocationCoord = startLocation.coord || { lat: 0, lng: 0 };
  
  return {
    id,
    title: apiRoute.name || "",
    date: apiRoute.date || "",
    distanceKm: apiRoute.distanceKm || 0,
    walkType: apiRoute.walkType || "walk",
    startTime: "", // Пока пустое
    finishTime: "", // Пока пустое
    startLocation: {
      name: startLocationName,
      address: startLocation.address || "", // Пока пустое
      coord: startLocationCoord,
    },
    description: apiRoute.description || "",
    checkpoints: "", // Пока пустое
    controlPoints: [], // Пока пустое
    track: apiRoute.points || [],
    files: {
      gpx: "", // Пока пустое
      kml: "", // Пока пустое
    },
    color: "rgba(255, 128, 0, 0.5)", // Стандартный цвет
  };
};

// Маппинг из RouteItem в API формат
const mapRouteItemToApiRoute = (routeItem: Partial<RouteItem>): Partial<ApiRoute> => {
  return {
    name: routeItem.title || "",
    description: routeItem.description,
    distanceKm: routeItem.distanceKm || 0,
    walkType: routeItem.walkType || "walk",
    date: routeItem.date || "",
    points: routeItem.track || [],
    startLocation: routeItem.startLocation
      ? {
          name: routeItem.startLocation.name,
          coord: routeItem.startLocation.coord,
        }
      : {
          name: "",
          coord: { lat: 0, lng: 0 },
        },
  };
};

export const routesApi = {
  // Получить все маршруты
  getAll: async (): Promise<RouteItem[]> => {
    const response = await apiClient.get<ApiRoute[]>("/routes/");
    return response.data.map(mapApiRouteToRouteItem);
  },

  // Получить маршрут по ID
  getById: async (id: number): Promise<RouteItem> => {
    const response = await apiClient.get<ApiRoute>(`/routes/${id}/`);
    return mapApiRouteToRouteItem(response.data);
  },

  // Создать новый маршрут
  create: async (route: Partial<RouteItem>): Promise<RouteItem> => {
    const apiRoute = mapRouteItemToApiRoute(route);
    const response = await apiClient.post<ApiRoute>("/routes/", apiRoute);
    return mapApiRouteToRouteItem(response.data);
  },

  // Обновить маршрут
  update: async (id: number, route: Partial<RouteItem>): Promise<RouteItem> => {
    const apiRoute = mapRouteItemToApiRoute(route);
    const response = await apiClient.patch<ApiRoute>(`/routes/${id}/`, apiRoute);
    return mapApiRouteToRouteItem(response.data);
  },

  // Удалить маршрут
  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`/routes/${id}/`);
  },

  // Парсинг GPX файла (preview)
  parseGpx: async (file: File): Promise<ParseGpxResponse> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await apiClient.post<ParseGpxResponse>(
      "/routes/parse_gpx/",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  },

  // Массовая загрузка маршрутов
  bulkImport: async (): Promise<BulkImportResponse> => {
    const response = await apiClient.post<BulkImportResponse>(
      "/routes/bulk_import/"
    );
    return response.data;
  },
};
