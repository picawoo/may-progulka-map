import { useState, useMemo, useEffect } from "react";
import type { RouteItem } from "../data/mockRoutes";
import RouteForm from "../components/RouteForm";
import { routesApi } from "../api/routes";

function AdminPage() {
  const [activeTab, setActiveTab] = useState<"routes" | "upload">("routes");
  const [selectedRoute, setSelectedRoute] = useState<RouteItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isBulkImporting, setIsBulkImporting] = useState(false);
  const [bulkImportResult, setBulkImportResult] = useState<{
    created: number;
    skipped: number;
    errors: number;
  } | null>(null);

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

  useEffect(() => {
    loadRoutes();
  }, []);

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

  const handleBulkImport = async () => {
    try {
      setIsBulkImporting(true);
      setError(null);
      const result = await routesApi.bulkImport();
      setBulkImportResult(result);
      // Перезагружаем список маршрутов после импорта
      await loadRoutes();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка при импорте маршрутов с сервера."
      );
      console.error("Failed to bulk import routes:", err);
    } finally {
      setIsBulkImporting(false);
    }
  };

  // Для обработки дат формата 18 мая 2025 и его вариаций
  const routesWithRussianDates = useMemo(
    () =>
      routes.map((route) => ({
        ...route,
        russianDate: getRussianDate(route.date).toLowerCase(),
      })),
    [routes, getRussianDate]
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

  const handleFormSubmit = async (data: Partial<RouteItem>) => {
    try {
      setError(null);
      if (selectedRoute && selectedRoute.id) {
        // Обновление существующего маршрута
        const routeId = parseInt(selectedRoute.id);
        if (!isNaN(routeId)) {
          await routesApi.update(routeId, data);
          await loadRoutes();
          setSelectedRoute(null);
        }
      } else {
        // Создание нового маршрута
        await routesApi.create(data);
        await loadRoutes();
        setSelectedRoute(null);
        setActiveTab("routes");
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка при сохранении маршрута."
      );
      console.error("Failed to save route:", err);
    }
  };

  const handleFormCancel = () => {
    setSelectedRoute(null);
  };

  const handleDeleteRoute = async (routeId: string) => {
    if (!confirm("Вы уверены, что хотите удалить этот маршрут?")) {
      return;
    }

    try {
      setError(null);
      const id = parseInt(routeId);
      if (!isNaN(id)) {
        await routesApi.delete(id);
        await loadRoutes();
        if (selectedRoute?.id === routeId) {
          setSelectedRoute(null);
        }
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Ошибка при удалении маршрута."
      );
      console.error("Failed to delete route:", err);
    }
  };

  return (
    <>
      <div className="admin-section">
        <div className="admin-wrapper">
          <h1 className="admin-title">Администрирование маршрутов</h1>

          {error && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#ffebee",
                color: "#d32f2f",
                borderRadius: "4px",
              }}
            >
              {error}
            </div>
          )}

          {bulkImportResult && (
            <div
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                backgroundColor: "#e8f5e9",
                color: "#2e7d32",
                borderRadius: "4px",
              }}
            >
              Импорт завершен: создано {bulkImportResult.created}, пропущено{" "}
              {bulkImportResult.skipped}, ошибок {bulkImportResult.errors}
            </div>
          )}

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
                  <button
                    className="btn-primary"
                    onClick={handleBulkImport}
                    disabled={isBulkImporting}
                    style={{ marginBottom: "1rem", width: "100%" }}
                  >
                    {isBulkImporting
                      ? "Импорт..."
                      : "Получить данные с сервера"}
                  </button>
                  <div className="admin-search">
                    <img
                      src="/images/search.svg"
                      alt=""
                      className="search-icon"
                    />
                    <input
                      type="text"
                      placeholder="Поиск"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="search-input"
                    />
                  </div>
                  <div className="routes-list-admin">
                    {isLoading ? (
                      <div style={{ padding: "2rem", textAlign: "center" }}>
                        Загрузка маршрутов...
                      </div>
                    ) : filteredRoutes.length === 0 ? (
                      <div style={{ padding: "2rem", textAlign: "center" }}>
                        {searchQuery
                          ? "Маршруты не найдены"
                          : "Нет маршрутов"}
                      </div>
                    ) : (
                      filteredRoutes.map((route) => (
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
                      ))
                    )}
                  </div>
                </div>
                <div className="admin-form-area">
                  {selectedRoute ? (
                    <RouteForm
                      route={selectedRoute}
                      onSubmit={handleFormSubmit}
                      onCancel={handleFormCancel}
                      onDelete={handleDeleteRoute}
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
