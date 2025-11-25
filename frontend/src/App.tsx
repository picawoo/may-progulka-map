import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, Polyline, useJsApiLoader } from "@react-google-maps/api";
import "./App.css";

import bannerImage from "./assets/mayp2025_3.png";
import footerEmail from "./assets/footer_email.png";
import footerLogo from "./assets/footer_logo.png";
import footerPhone from "./assets/footer_phone.png";
import footerTelegram from "./assets/footer_telegram.png";
import footerVk from "./assets/footer_vk.png";

type NavItem = {
  label: string;
  href: string;
  variant?: "main";
  submenu?: { label: string; href: string }[];
};

type RouteType = "walking" | "cycling";

type RoutePathPoint = {
  lat: number;
  lng: number;
};

type Route = {
  id: string;
  title: string;
  date: string;
  start: string;
  distanceKm: number;
  types: RouteType[];
  downloadUrl: string;
  detailsUrl: string;
  path: RoutePathPoint[];
};

type MapProvider = "google";

const navItems: NavItem[] = [
  { label: "Главная", href: "https://mayprogulka.ru/", variant: "main" },
  {
    label: "О прогулке",
    href: "https://mayprogulka.ru/about/uchast/",
    submenu: [
      { label: "Участникам", href: "https://mayprogulka.ru/about/uchast/" },
      { label: "Место старта", href: "https://mayprogulka.ru/about/start/" },
      {
        label: "Описание маршрутов",
        href: "https://mayprogulka.ru/about/distance/",
      },
      {
        label: "Выдача карт",
        href: "https://mayprogulka.ru/about/mapstopeople/",
      },
      {
        label: "Пожарная безопасность",
        href: "https://mayprogulka.ru/pravila",
      },
      { label: "Частые вопросы", href: "https://mayprogulka.ru/faq" },
      {
        label: "Советы в дорогу",
        href: "https://mayprogulka.ru/about/sovets/",
      },
      { label: "Организаторы", href: "https://mayprogulka.ru/org/org" },
    ],
  },
  {
    label: "Архив",
    href: "https://mayprogulka.ru/archive/routes_archive/",
    submenu: [
      {
        label: "Маршруты",
        href: "https://mayprogulka.ru/archive/routes_archive/",
      },
      { label: "Статистика", href: "https://mayprogulka.ru/archive/stat1/" },
      { label: "Места", href: "https://mayprogulka.ru/places/" },
      { label: "Фалеристика", href: "https://mayprogulka.ru/archive/znaki/" },
      { label: "Отзывы", href: "https://mayprogulka.ru/archive/otzyvy/" },
    ],
  },
  { label: "Вход", href: "https://mayprogulka.ru/my/", variant: "main" },
];

const routeTypeLabels: Record<RouteType, string> = {
  walking: "Пешая",
  cycling: "Велосипедная",
};

const mapProviderLabels: Record<MapProvider, string> = {
  google: "Google",
};

const routeColorByType: Record<RouteType, string> = {
  walking: "#8c5bff",
  cycling: "#ff5db1",
};

const defaultMapCenter: google.maps.LatLngLiteral = {
  lat: 56.8389261,
  lng: 60.6057028,
};

const googleMapOptions: google.maps.MapOptions = {
  disableDefaultUI: true,
  styles: [
    {
      featureType: "administrative",
      elementType: "geometry",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "road",
      elementType: "geometry.stroke",
      stylers: [{ color: "#f9c4b0" }],
    },
    {
      featureType: "water",
      stylers: [{ color: "#bfe3ff" }],
    },
    {
      featureType: "landscape",
      stylers: [{ color: "#fdf2eb" }],
    },
  ],
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const getRouteColor = (types: RouteType[]) => {
  if (types.length === 1) {
    return routeColorByType[types[0]];
  }
  return routeColorByType[types[0]];
};

type RoutesMapProps = {
  provider: MapProvider;
  routes: Route[];
  isLoading: boolean;
};

const RoutesMap = ({ provider, routes, isLoading }: RoutesMapProps) => {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader(
    provider === "google" && googleMapsApiKey
      ? {
          id: "may-walk-google-map",
          googleMapsApiKey,
        }
      : {
          id: "may-walk-google-map",
          googleMapsApiKey: "",
        }
  );

  const handleLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !window.google ||
      !mapRef.current ||
      !routes.length
    ) {
      return;
    }
    const bounds = new window.google.maps.LatLngBounds();
    routes.forEach((route) => {
      route.path.forEach((point) => bounds.extend(point));
    });
    mapRef.current.fitBounds(bounds, 40);
  }, [routes]);

  if (provider !== "google") {
    return (
      <div className="routes-map-placeholder">
        Выберите доступный слой карты
      </div>
    );
  }

  if (!googleMapsApiKey) {
    return (
      <div className="routes-map-placeholder">
        Добавьте переменную <code>VITE_GOOGLE_MAPS_API_KEY</code> для
        отображения карты Google.
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="routes-map-placeholder">
        Не удалось загрузить карту Google
      </div>
    );
  }

  if (!isLoaded) {
    return <div className="routes-map-placeholder">Загружаем карту...</div>;
  }

  if (!routes.length && !isLoading) {
    return (
      <div className="routes-map-placeholder">
        Нажмите «Применить», чтобы показать маршруты на карте
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerStyle={mapContainerStyle}
      onLoad={handleLoad}
      onUnmount={handleUnmount}
      options={googleMapOptions}
      center={defaultMapCenter}
      zoom={12}
    >
      {routes.map((route) => (
        <Polyline
          key={route.id}
          path={route.path}
          options={{
            strokeColor: getRouteColor(route.types),
            strokeOpacity: 0.95,
            strokeWeight: 5,
          }}
        />
      ))}
    </GoogleMap>
  );
};

function App() {
  const [mapProvider, setMapProvider] = useState<MapProvider>("google");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [displayedRoutes, setDisplayedRoutes] = useState<Route[]>([]);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(true);
  const [routesError, setRoutesError] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<string>("");
  const [selectedStart, setSelectedStart] = useState<string>("");
  const [selectedTypes, setSelectedTypes] = useState<
    Record<RouteType, boolean>
  >({
    walking: true,
    cycling: true,
  });
  const [maxDistance, setMaxDistance] = useState<number>(70);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        const response = await fetch("/routes.json");
        if (!response.ok) {
          throw new Error("Не удалось загрузить маршруты");
        }
        const data: Route[] = await response.json();
        setRoutes(data);
        setDisplayedRoutes(data);
      } catch (error) {
        setRoutesError(
          error instanceof Error
            ? error.message
            : "Произошла ошибка загрузки маршрутов"
        );
      } finally {
        setIsLoadingRoutes(false);
      }
    };

    void loadRoutes();
  }, []);

  const years = useMemo(
    () =>
      Array.from(
        new Set(routes.map((route) => new Date(route.date).getFullYear()))
      ).sort(),
    [routes]
  );

  const starts = useMemo(
    () => Array.from(new Set(routes.map((route) => route.start))).sort(),
    [routes]
  );

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      const routeYear = new Date(route.date).getFullYear().toString();
      const matchYear = selectedYear ? routeYear === selectedYear : true;
      const matchStart = selectedStart ? route.start === selectedStart : true;
      const matchType =
        selectedTypes.walking !== selectedTypes.cycling
          ? route.types.some((type) => selectedTypes[type])
          : true;
      const matchDistance = route.distanceKm <= maxDistance;

      return matchYear && matchStart && matchType && matchDistance;
    });
  }, [routes, selectedYear, selectedStart, selectedTypes, maxDistance]);

  const formatRouteDate = (isoDate: string) =>
    new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(isoDate));

  return (
    <>
      <div className="bodywrapper">
        <header>
          <nav className="header-nav">
            {navItems.map((item) => (
              <div className="header-nav-item" key={item.label}>
                <a
                  className={
                    item.variant === "main"
                      ? "header-nav-mainlink"
                      : "header-nav-link"
                  }
                  href={item.href}
                  target="_blank"
                  rel="noreferrer"
                >
                  {item.label}
                </a>
                {item.submenu && (
                  <div className="header-nav-menu">
                    <ul className="header-nav-menu-list">
                      {item.submenu.map((submenuItem) => (
                        <li
                          className="header-nav-menu-item"
                          key={submenuItem.href}
                        >
                          <a
                            className="header-nav-menu-item-link"
                            href={submenuItem.href}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {submenuItem.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </nav>
        </header>

        <div className="banner">
          <img
            className="banner-img"
            src={bannerImage}
            alt="Маршруты Майской прогулки 2025"
          />
        </div>
      </div>

      <section className="routes-section">
        <div className="routes-shell">
          <aside className="routes-panel routes-panel-filters">
            <h2 className="routes-panel-title">Фильтры</h2>

            <form
              className="routes-filters-form"
              onSubmit={(event) => {
                event.preventDefault();
                setDisplayedRoutes(filteredRoutes);
              }}
            >
              <label className="routes-field">
                <span className="routes-field-label">Год</span>
                <select
                  value={selectedYear}
                  onChange={(event) => setSelectedYear(event.target.value)}
                >
                  <option value="">Выбрать...</option>
                  {years.map((yearOption) => (
                    <option key={yearOption} value={yearOption}>
                      {yearOption}
                    </option>
                  ))}
                </select>
              </label>

              <label className="routes-field">
                <span className="routes-field-label">Старт</span>
                <select
                  value={selectedStart}
                  onChange={(event) => setSelectedStart(event.target.value)}
                >
                  <option value="">Выбрать...</option>
                  {starts.map((startOption) => (
                    <option key={startOption} value={startOption}>
                      {startOption}
                    </option>
                  ))}
                </select>
              </label>

              <fieldset className="routes-field routes-fieldset">
                <legend className="routes-field-label">Тип прогулки</legend>
                <label className="routes-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTypes.walking}
                    onChange={(event) =>
                      setSelectedTypes((prev) => ({
                        ...prev,
                        walking: event.target.checked,
                      }))
                    }
                  />
                  Пешая
                </label>
                <label className="routes-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedTypes.cycling}
                    onChange={(event) =>
                      setSelectedTypes((prev) => ({
                        ...prev,
                        cycling: event.target.checked,
                      }))
                    }
                  />
                  Велосипедная
                </label>
              </fieldset>

              <label className="routes-field">
                <span className="routes-field-label">
                  Протяженность: до {maxDistance} км
                </span>
                <input
                  type="range"
                  min={10}
                  max={70}
                  step={5}
                  value={maxDistance}
                  onChange={(event) =>
                    setMaxDistance(Number(event.target.value))
                  }
                />
                <div className="routes-range-scale">
                  {[10, 20, 30, 40, 50, 60, 70].map((mark) => (
                    <span key={mark}>{mark}</span>
                  ))}
                </div>
              </label>

              <button type="submit" className="routes-apply-btn">
                Применить
              </button>
            </form>
          </aside>

          <div className="routes-map-card">
            <div className="routes-map-header">
              <h2>Карта</h2>
              <label className="routes-field routes-map-select">
                <span className="routes-field-label">Слой</span>
                <select
                  value={mapProvider}
                  onChange={(event) =>
                    setMapProvider(event.target.value as MapProvider)
                  }
                >
                  {Object.entries(mapProviderLabels).map(([value, label]) => (
                    <option value={value} key={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <div className="routes-map-frame">
              <RoutesMap
                provider={mapProvider}
                routes={displayedRoutes}
                isLoading={isLoadingRoutes}
              />
            </div>
          </div>

          <aside className="routes-panel routes-panel-list">
            <h2 className="routes-panel-title">Маршруты</h2>
            <div className="routes-list">
              {isLoadingRoutes && (
                <p className="routes-note">Загружаем маршруты...</p>
              )}
              {routesError && !isLoadingRoutes && (
                <p className="routes-error">{routesError}</p>
              )}
              {!isLoadingRoutes &&
                !routesError &&
                filteredRoutes.length === 0 && (
                  <p className="routes-note">
                    Не найдено маршрутов по выбранным фильтрам
                  </p>
                )}
              {!isLoadingRoutes &&
                !routesError &&
                filteredRoutes.map((route) => (
                  <article className="route-card" key={route.id}>
                    <div>
                      <div className="route-date">
                        {formatRouteDate(route.date)}
                      </div>
                      <div className="route-title">{route.title}</div>
                      <div className="route-meta">
                        {route.start} · {route.distanceKm} км ·{" "}
                        {route.types
                          .map((type) => routeTypeLabels[type])
                          .join(", ")}
                      </div>
                    </div>
                    <div className="route-actions">
                      <a
                        className="route-btn route-btn-light"
                        href={route.downloadUrl}
                      >
                        Скачать
                      </a>
                      <a
                        className="route-btn route-btn-primary"
                        href={route.detailsUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Подробнее
                      </a>
                    </div>
                  </article>
                ))}
            </div>
          </aside>
        </div>
      </section>

      <footer>
        <div className="footer-wrapper">
          <div className="footer-logo">
            <img src={footerLogo} alt="Майская прогулка" />
          </div>
          <div className="footer-copyright">© 2015–2024</div>

          <div className="footer-links footer-links-social">
            <div className="footer-links-title">Следите за нами в соцсетях</div>
            <a
              className="footer-links-link"
              href="https://vk.com/mayprogulka"
              target="_blank"
              rel="noreferrer"
            >
              <img src={footerVk} alt="ВКонтакте" />
              <span className="sr-only">ВКонтакте</span>
            </a>
            <a
              className="footer-links-link"
              href="https://t.me/mayprogulka"
              target="_blank"
              rel="noreferrer"
            >
              <img src={footerTelegram} alt="Telegram" />
              <span className="sr-only">Telegram</span>
            </a>
          </div>

          <div className="footer-links footer-links-contacts">
            <div className="footer-links-title">Свяжитесь с нами</div>
            <a className="footer-links-link" href="tel:+73432906017">
              <img src={footerPhone} alt="Телефон" />
              <span className="sr-only">+7 (343) 290-60-17</span>
            </a>
            <a
              className="footer-links-link"
              href="mailto:mayprogulka@yandex.ru"
            >
              <img src={footerEmail} alt="Email" />
              <span className="sr-only">mayprogulka@yandex.ru</span>
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}

export default App;
