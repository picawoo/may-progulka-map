import { useState, useMemo } from "react";
import bannerImage from "../assets/mayp2025_3.png";
import { mockRoutes } from "../data/mockRoutes";
import type { RouteItem } from "../data/mockRoutes";
import RouteForm from "../components/RouteForm";

function AdminPage() {
  const [activeTab, setActiveTab] = useState<"routes" | "upload">("routes");
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const getRussianDate = useMemo(() => {
    const months = [
      "января",
      "февраля",
      "марта",
      "апреля",
      "мая",
      "июня",
      "июля",
      "августа",
      "сентября",
      "октября",
      "ноября",
      "декабря",
    ];

    return (dateString: string): string => {
      const [year, month, day] = dateString.split("-");
      const monthIndex = parseInt(month, 10) - 1;
      return `${parseInt(day, 10)} ${months[monthIndex]} ${year}`;
    };
  }, []);

  // Для обработки дат формата 18 мая 2025 и его вариаций
  const routesWithRussianDates = useMemo(
    () =>
      mockRoutes.map((route) => ({
        ...route,
        russianDate: getRussianDate(route.date).toLowerCase(),
      })),
    [getRussianDate]
  );

  const filteredRoutes = routesWithRussianDates.filter((route) => {
    if (!searchQuery.trim()) return true;

    const query = searchQuery.toLowerCase().trim();

    if (
      route.title.toLowerCase().includes(query) ||
      route.description.toLowerCase().includes(query) ||
      route.startLocation.name.toLowerCase().includes(query)
    ) {
      return true;
    }

    if (route.russianDate === query) {
      return true;
    }
    if (route.russianDate.includes(query)) {
      return true;
    }

    const [day, month, year] = route.russianDate.split(" ");
    const searchWords = query.split(" ").filter((word) => word.length > 0);

    const allWordsMatch = searchWords.every((word) =>
      route.russianDate.includes(word)
    );

    if (allWordsMatch) {
      return true;
    }

    if (searchWords.length === 2) {
      const [first, second] = searchWords;

      if (
        (day === first || day.includes(first)) &&
        (month.includes(second) || month === second)
      ) {
        return true;
      }

      if (
        (month.includes(first) || month === first) &&
        (year === second || year.includes(second))
      ) {
        return true;
      }
    }

    if (route.date.toLowerCase().includes(query)) {
      return true;
    }

    return false;
  });

  const handleRouteSelect = (route: RouteItem) => {
    setSelectedRoute(route);
  };

  const handleFormSubmit = (data: Partial<RouteItem>) => {
    console.log("Form submitted:", data);
  };

  const handleFormCancel = () => {
    setSelectedRoute(null);
  };

  return (
    <>
      <div className="bodywrapper">
        <div className="banner">
          <img
            className="banner-img"
            src={bannerImage}
            alt="Маршруты Майской прогулки 2025"
          />
        </div>
      </div>

      <div className="admin-section">
        <div className="admin-wrapper">
          <h1 className="admin-title">Администрирование маршрутов</h1>

          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === "routes" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("routes");
                setSelectedRoute(null);
              }}
            >
              Маршруты
            </button>
            <button
              className={`admin-tab ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("upload");
                setSelectedRoute(null);
              }}
            >
              Загрузка нового маршрута
            </button>
          </div>

          <div className="admin-content">
            {activeTab === "routes" ? (
              <div className="admin-routes-layout">
                <div className="admin-sidebar">
                  <div className="admin-search">
                    <img src="/search.svg" alt="" className="search-icon" />
                    <input
                      type="text"
                      placeholder="Поиск"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="routes-list-admin">
                    {filteredRoutes.map((route) => (
                      <div
                        key={route.id}
                        className={`route-item-admin ${
                          selectedRoute?.id === route.id ? "selected" : ""
                        }`}
                        onClick={() => handleRouteSelect(route)}
                      >
                        {new Date(route.date).toLocaleDateString("ru-RU", {
                          day: "2-digit",
                          month: "long",
                          year: "numeric",
                        })}{" "}
                        ({route.distanceKm} км)
                      </div>
                    ))}
                  </div>
                </div>
                <div className="admin-form-area">
                  {selectedRoute ? (
                    <RouteForm
                      route={selectedRoute}
                      onSubmit={handleFormSubmit}
                      onCancel={handleFormCancel}
                      submitButtonText="Сохранить изменения"
                    />
                  ) : (
                    <div className="admin-form-placeholder" />
                  )}
                </div>
              </div>
            ) : (
              <div className="admin-form-area">
                <RouteForm
                  onSubmit={handleFormSubmit}
                  onCancel={handleFormCancel}
                  submitButtonText="Загрузить маршрут"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

export default AdminPage;
