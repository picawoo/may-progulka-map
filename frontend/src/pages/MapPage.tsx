import { GoogleMap, Polyline, useJsApiLoader } from "@react-google-maps/api";
import {
  Map as YMap,
  Polyline as YPolyline,
  YMaps,
} from "@mr-igorinni/react-yandex-maps-fork";
import { useMemo, useState, useEffect, useRef, useCallback } from "react";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";

import type { RouteItem, WalkType } from "../data/mockRoutes";
import { routesApi } from "../api/routes";

type EnvSource = { env?: Record<string, string | undefined> };

declare const process: EnvSource | undefined;

function MapPage() {
  const getEnvVar = (keys: string[]) => {
    const viteEnv =
      typeof import.meta !== "undefined"
        ? (import.meta as unknown as EnvSource).env
        : undefined;
    const nodeEnv =
      typeof process !== "undefined" && process?.env ? process.env : undefined;
    for (const key of keys) {
      if (viteEnv?.[key]) return viteEnv[key] as string;
      if (nodeEnv?.[key]) return nodeEnv[key] as string;
    }
    return "";
  };

  const googleApiKey = getEnvVar([
    "VITE_GOOGLE_MAPS_API_KEY",
    "REACT_APP_GOOGLE_MAPS_API_KEY",
  ]);
  const yandexApiKey = getEnvVar([
    "VITE_YANDEX_MAPS_API_KEY",
    "REACT_APP_YANDEX_MAPS_API_KEY",
  ]);

  const { isLoaded: isGoogleLoaded } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: googleApiKey,
  });

  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await routesApi.getAll();
        setRoutes(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Ошибка загрузки маршрутов. Попробуйте обновить страницу."
        );
        console.error("Failed to load routes:", err);
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, []);

  const years = useMemo(
    () =>
      Array.from(new Set(routes.map((r) => new Date(r.date).getFullYear()))),
    [routes]
  );

  const startPlaces = useMemo(
    () =>
      Array.from(
        new Set(
          routes.map(
            (r) =>
              `${r.startLocation.name}${
                r.startLocation.address ? ` (${r.startLocation.address})` : ""
              }`
          )
        )
      ),
    [routes]
  );

  const [mapProvider, setMapProvider] = useState<"google" | "yandex">("yandex");
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedStarts, setSelectedStarts] = useState<string[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<WalkType[]>([
    "walk",
    "bike",
  ]);
  const [distance, setDistance] = useState<[number, number]>([10, 80]);
  const [appliedFilters, setAppliedFilters] = useState({
    years: [] as string[],
    starts: [] as string[],
    types: ["walk", "bike"] as WalkType[],
    distanceMin: 10,
    distanceMax: 80,
  });
  const [isFiltersCollapsed, setIsFiltersCollapsed] = useState(false);
  const [isRoutesCollapsed, setIsRoutesCollapsed] = useState(false);

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const year = String(new Date(route.date).getFullYear());
      const start = `${route.startLocation.name}${
        route.startLocation.address ? ` (${route.startLocation.address})` : ""
      }`;
      const byYear =
        appliedFilters.years.length === 0 ||
        appliedFilters.years.includes(year);
      const byStart =
        appliedFilters.starts.length === 0 ||
        appliedFilters.starts.includes(start);
      const byType =
        appliedFilters.types.length === 0 ||
        appliedFilters.types.includes(route.walkType);
      const byDistance =
        route.distanceKm >= appliedFilters.distanceMin &&
        route.distanceKm <= appliedFilters.distanceMax;
      return byYear && byStart && byType && byDistance;
    });
  }, [appliedFilters, routes]);

  // Вычисляем границы всех отфильтрованных маршрутов
  const bounds = useMemo(() => {
    if (filteredRoutes.length === 0) {
      return null;
    }

    let minLat = Infinity;
    let maxLat = -Infinity;
    let minLng = Infinity;
    let maxLng = -Infinity;
    let hasValidPoints = false;

    filteredRoutes.forEach((route) => {
      // Проверяем, что track существует и не пустой
      if (route.track && Array.isArray(route.track) && route.track.length > 0) {
        route.track.forEach((point) => {
          if (
            point &&
            typeof point.lat === "number" &&
            typeof point.lng === "number"
          ) {
            minLat = Math.min(minLat, point.lat);
            maxLat = Math.max(maxLat, point.lat);
            minLng = Math.min(minLng, point.lng);
            maxLng = Math.max(maxLng, point.lng);
            hasValidPoints = true;
          }
        });
      }
    });

    // Если нет валидных точек, возвращаем null
    if (!hasValidPoints || minLat === Infinity) {
      return null;
    }

    // Добавляем небольшой отступ
    const latPadding = (maxLat - minLat) * 0.1 || 0.01;
    const lngPadding = (maxLng - minLng) * 0.1 || 0.01;

    return {
      minLat: minLat - latPadding,
      maxLat: maxLat + latPadding,
      minLng: minLng - lngPadding,
      maxLng: maxLng + lngPadding,
    };
  }, [filteredRoutes]);

  const firstCenter = useMemo(() => {
    if (bounds) {
      return {
        lat: (bounds.minLat + bounds.maxLat) / 2,
        lng: (bounds.minLng + bounds.maxLng) / 2,
      };
    }
    const base = routes[0]?.startLocation.coord;
    return base || { lat: 56.8389, lng: 60.6057 };
  }, [bounds, routes]);

  // Refs для карт
  const googleMapRef = useRef<google.maps.Map | null>(null);
  const yandexMapRef = useRef<{
    setBounds: (bounds: number[][], options?: { duration?: number }) => void;
  } | null>(null);

  // Функция для установки границ на Google Maps
  const fitGoogleMapBounds = useCallback(() => {
    if (!googleMapRef.current || !bounds) return;

    try {
      const googleBounds = new google.maps.LatLngBounds();
      googleBounds.extend(new google.maps.LatLng(bounds.minLat, bounds.minLng));
      googleBounds.extend(new google.maps.LatLng(bounds.maxLat, bounds.maxLng));

      googleMapRef.current.fitBounds(googleBounds);
    } catch (error) {
      console.error("Error fitting Google map bounds:", error);
    }
  }, [bounds]);

  // Функция для установки границ на Yandex Maps
  const fitYandexMapBounds = useCallback(() => {
    if (!yandexMapRef.current || !bounds) return;

    try {
      yandexMapRef.current.setBounds(
        [
          [bounds.minLat, bounds.minLng],
          [bounds.maxLat, bounds.maxLng],
        ],
        {
          duration: 300,
        }
      );
    } catch (error) {
      console.error("Error setting Yandex map bounds:", error);
    }
  }, [bounds]);

  // Автоматически подстраиваем карту при изменении отфильтрованных маршрутов
  useEffect(() => {
    if (filteredRoutes.length === 0 || !bounds || isLoading) return;

    // Небольшая задержка для инициализации карты
    const timer = setTimeout(() => {
      if (mapProvider === "google" && googleMapRef.current && bounds) {
        try {
          fitGoogleMapBounds();
        } catch (error) {
          console.error("Error fitting Google map bounds:", error);
        }
      } else if (mapProvider === "yandex" && yandexMapRef.current && bounds) {
        try {
          fitYandexMapBounds();
        } catch (error) {
          console.error("Error fitting Yandex map bounds:", error);
        }
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [
    filteredRoutes,
    mapProvider,
    bounds,
    isLoading,
    fitGoogleMapBounds,
    fitYandexMapBounds,
  ]);

  const applyFilters = () => {
    setAppliedFilters({
      years: selectedYears,
      starts: selectedStarts,
      types: selectedTypes,
      distanceMin: distance[0],
      distanceMax: distance[1],
    });
  };

  const toggleSelection = (
    value: string,
    list: string[],
    setter: (next: string[]) => void
  ) => {
    if (list.includes(value)) {
      setter(list.filter((v) => v !== value));
    } else {
      setter([...list, value]);
    }
  };

  const toggleType = (value: WalkType) => {
    if (selectedTypes.includes(value)) {
      setSelectedTypes(selectedTypes.filter((t) => t !== value));
    } else {
      setSelectedTypes([...selectedTypes, value]);
    }
  };

  const onGoogleMapLoad = useCallback((map: google.maps.Map) => {
    googleMapRef.current = map;
  }, []);

  const renderGoogleMap = () => (
    <GoogleMap
      mapContainerClassName="map-canvas"
      center={firstCenter}
      zoom={13}
      onLoad={onGoogleMapLoad}
      options={{
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: false,
      }}
    >
      {filteredRoutes
        .filter((route) => route.track && route.track.length > 0)
        .map((route) => (
          <Polyline
            key={route.id}
            path={route.track}
            options={{
              strokeColor: route.color,
              strokeOpacity: 0.9,
              strokeWeight: 5,
            }}
          />
        ))}
      {/*
      Маркеры точек траекторий 
      {filteredRoutes.map((route) => (
        <MarkerF
          key={`${route.id}-start`}
          position={route.startLocation.coord}
          label="Старт"
        />
      ))}
      {filteredRoutes.flatMap((route) =>
        route.controlPoints.map((cp) => (
          <MarkerF
            key={`${route.id}-${cp.label}`}
            position={cp.coord}
            label={cp.label}
          />
        ))
      )}
      */}
    </GoogleMap>
  );

  const renderYandexMap = () => (
    <YMaps query={yandexApiKey ? { apikey: yandexApiKey } : undefined}>
      <YMap
        className="map-canvas"
        defaultState={{
          center: [firstCenter.lat, firstCenter.lng],
          zoom: 13,
          controls: [],
        }}
        instanceRef={(ref: unknown) => {
          if (ref && typeof ref === "object" && "setBounds" in ref) {
            yandexMapRef.current = ref as {
              setBounds: (
                bounds: number[][],
                options?: { duration?: number }
              ) => void;
            };
          }
        }}
      >
        {filteredRoutes
          .filter((route) => route.track && route.track.length > 0)
          .map((route) => (
            <YPolyline
              key={route.id}
              geometry={route.track.map((p) => [p.lat, p.lng])}
              options={{
                strokeColor: route.color,
                strokeOpacity: 0.9,
                strokeWidth: 5,
              }}
            />
          ))}
        {/*
        Маркеры точек траекторий
        {filteredRoutes.map((route) => (
          <Placemark
            key={`${route.id}-start`}
            geometry={[
              route.startLocation.coord.lat,
              route.startLocation.coord.lng,
            ]}
            properties={{ balloonContent: "Старт" }}
          />
        ))}
        {filteredRoutes.flatMap((route) =>
          route.controlPoints.map((cp) => (
            <Placemark
              key={`${route.id}-${cp.label}`}
              geometry={[cp.coord.lat, cp.coord.lng]}
              properties={{ balloonContent: cp.label }}
            />
          ))
        )}
        */}
      </YMap>
    </YMaps>
  );

  return (
    <>
      <div className="bodywrapper">
        <h1 className="map-page-title">Карта маршрутов майской прогулки</h1>
      </div>

      <div className="map-section">
        <div className="map-wrapper">
          {isLoading ? (
            <div className="map-placeholder">Загрузка маршрутов...</div>
          ) : error ? (
            <div className="map-placeholder">
              <div style={{ color: "#d32f2f", marginBottom: "1rem" }}>
                {error}
              </div>
              <button
                className="btn-primary"
                onClick={() => window.location.reload()}
              >
                Обновить страницу
              </button>
            </div>
          ) : mapProvider === "google" ? (
            isGoogleLoaded ? (
              renderGoogleMap()
            ) : (
              <div className="map-placeholder">
                Загрузка карты Google...
                {!googleApiKey && (
                  <div className="map-placeholder-sub">
                    Добавьте ключ VITE_GOOGLE_MAPS_API_KEY для отображения.
                  </div>
                )}
              </div>
            )
          ) : (
            renderYandexMap()
          )}

          <div className="map-overlay map-overlay-top hidden">
            <div className="map-card map-card-small">
              <span>Карта:</span>
              <div className="select map-provider-select">
                <select
                  value={mapProvider}
                  onChange={(e) =>
                    setMapProvider(e.target.value as "google" | "yandex")
                  }
                >
                  <option value="yandex">Яндекс</option>
                  <option value="google">Google</option>
                </select>
              </div>
            </div>
          </div>

          {isFiltersCollapsed ? (
            <button
              className="panel-tab panel-tab-left"
              onClick={() => setIsFiltersCollapsed(false)}
              aria-label="Развернуть фильтры"
            >
              Фильтры
            </button>
          ) : (
            <div className="map-overlay map-overlay-left">
              <div className="map-card filters-card">
                <div className="panel-header">
                  <h3>Фильтры</h3>
                  <button
                    className="panel-toggle"
                    onClick={() => setIsFiltersCollapsed(true)}
                    aria-label="Свернуть фильтры"
                  >
                    <img src="/images/minimize-arrow.svg" alt="" />
                  </button>
                </div>

                <div className="form-group">
                  <label>Год</label>
                  <details className="dropdown">
                    <summary>Выбрать...</summary>
                    <div className="dropdown-list">
                      <div className="dropdown-actions">
                        <button
                          className="dropdown-action"
                          type="button"
                          onClick={() => setSelectedYears(years.map(String))}
                        >
                          Выбрать все
                        </button>
                        <button
                          className="dropdown-action"
                          type="button"
                          onClick={() => setSelectedYears([])}
                        >
                          Очистить
                        </button>
                      </div>
                      {years.map((year) => (
                        <label className="checkbox-line" key={year}>
                          <input
                            type="checkbox"
                            checked={selectedYears.includes(String(year))}
                            onChange={() =>
                              toggleSelection(
                                String(year),
                                selectedYears,
                                setSelectedYears
                              )
                            }
                          />
                          <span>{year}</span>
                        </label>
                      ))}
                    </div>
                  </details>
                </div>

                <div className="form-group">
                  <label>Старт</label>
                  <details className="dropdown">
                    <summary>Выбрать...</summary>
                    <div className="dropdown-list">
                      <div className="dropdown-actions">
                        <button
                          className="dropdown-action"
                          type="button"
                          onClick={() => setSelectedStarts(startPlaces)}
                        >
                          Выбрать все
                        </button>
                        <button
                          className="dropdown-action"
                          type="button"
                          onClick={() => setSelectedStarts([])}
                        >
                          Очистить
                        </button>
                      </div>
                      {startPlaces.map((place) => (
                        <label className="checkbox-line" key={place}>
                          <input
                            type="checkbox"
                            checked={selectedStarts.includes(place)}
                            onChange={() =>
                              toggleSelection(
                                place,
                                selectedStarts,
                                setSelectedStarts
                              )
                            }
                          />
                          <span>{place}</span>
                        </label>
                      ))}
                    </div>
                  </details>
                </div>

                <div className="form-group">
                  <label>Тип прогулки</label>
                  <div className="checkbox-block">
                    <label className="checkbox-line inline">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes("walk")}
                        onChange={() => toggleType("walk")}
                      />
                      <span>Пешая</span>
                    </label>
                    <label className="checkbox-line inline">
                      <input
                        type="checkbox"
                        checked={selectedTypes.includes("bike")}
                        onChange={() => toggleType("bike")}
                      />
                      <span>Велосипедная</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>
                    Протяженность <br />
                    <span className="muted">
                      (от {distance[0]} до {distance[1]} км)
                    </span>
                  </label>
                  <div className="range-slider-wrapper">
                    <Slider
                      range
                      min={10}
                      max={80}
                      step={1}
                      value={distance}
                      onChange={(value) =>
                        setDistance(value as [number, number])
                      }
                    />
                  </div>
                  <div className="range-scale">
                    <span>10</span>
                    <span>30</span>
                    <span>50</span>
                    <span>70</span>
                    <span>80</span>
                  </div>
                </div>

                <button className="btn-primary" onClick={applyFilters}>
                  Применить
                </button>
              </div>
            </div>
          )}

          {isRoutesCollapsed ? (
            <button
              className="panel-tab panel-tab-right"
              onClick={() => setIsRoutesCollapsed(false)}
              aria-label="Развернуть маршруты"
            >
              Маршруты
            </button>
          ) : (
            <div className="map-overlay map-overlay-right">
              <div className="map-card routes-card">
                <div className="panel-header">
                  <button
                    className="panel-toggle panel-toggle-left"
                    onClick={() => setIsRoutesCollapsed(true)}
                    aria-label="Свернуть маршруты"
                  >
                    <img src="/images/minimize-arrow.svg" alt="" />
                  </button>
                  <h3>Маршруты</h3>
                </div>

                <div className="routes-list">
                  {filteredRoutes.length === 0 && (
                    <div className="empty">
                      Нет маршрутов по выбранным фильтрам
                    </div>
                  )}
                  {filteredRoutes.map((route) => (
                    <div className="route-item" key={route.id}>
                      <div className="route-card">
                        <div className="route-date">
                          {new Date(route.date).toLocaleDateString("ru-RU", {
                            day: "2-digit",
                            month: "long",
                            year: "numeric",
                          })}
                        </div>
                        <div className="route-title">{route.title}</div>
                        <div className="route-meta">
                          <span>{route.distanceKm} км</span>
                          <span>
                            {route.walkType === "walk"
                              ? "Пешая"
                              : "Велосипедная"}
                          </span>
                        </div>
                        <div className="route-meta">
                          <span>Старт: {route.startTime}</span>
                          <span>Финиш: {route.finishTime}</span>
                        </div>
                        <div className="route-meta">
                          <span>{route.startLocation.name}</span>
                          <span>{route.finishLocation.name}</span>
                        </div>
                      </div>
                      <div className="route-buttons">
                        <details className="dropdown small">
                          <summary>Скачать</summary>
                          <div className="dropdown-list">
                            <button
                              onClick={() =>
                                routesApi.getGpxById(parseInt(route.id))
                              }
                            >
                              GPX
                            </button>
                          </div>
                        </details>
                        <a className="btn-secondary" href="#more">
                          Подробнее
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

export default MapPage;
