import { useState, useEffect } from "react";
import type { RouteItem, WalkType } from "../data/mockRoutes";
import { routesApi } from "../api/routes";

type RouteFormProps = {
  route?: RouteItem;
  onSubmit: (data: Partial<RouteItem>) => void;
  onCancel?: () => void;
  onDelete?: (routeId: string) => void;
  submitButtonText?: string;
};

function RouteForm({
  route,
  onSubmit,
  onCancel,
  onDelete,
  submitButtonText = "Загрузить маршрут",
}: RouteFormProps) {
  const [formData, setFormData] = useState({
    name: route?.title || "",
    distanceKm: route?.distanceKm || "",
    walkType: (route?.walkType || "walk") as WalkType,
    startLocation: route?.startLocation.name || "",
    finishLocation: route?.finishLocation.name || "",
    startTimeFrom: route?.startTime || "11:00",
    startTimeTo: route?.startTime || "13:00",
    finishTimeFrom: route?.finishTime || "12:00",
    finishTimeTo: route?.finishTime || "21:00",
    date: route?.date || "",
    description: route?.description || "",
    tropinkiLink: "",
    etomestoLink: "",
    controlPoints: route?.controlPoints || [],
    track: route?.track || [],
  });

  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [isParsingGpx, setIsParsingGpx] = useState(false);
  const [parseError, setParseError] = useState<string | null>(null);

  useEffect(() => {
    if (route) {
      setFormData({
        name: route.title || "",
        distanceKm: route.distanceKm || "",
        walkType: route.walkType || "walk",
        startLocation: route.startLocation.name || "",
        finishLocation: route.finishLocation.name || "",
        startTimeFrom: route.startTime || "11:00",
        startTimeTo: route.startTime || "13:00",
        finishTimeFrom: route.finishTime || "12:00",
        finishTimeTo: route.finishTime || "21:00",
        date: route.date || "",
        description: route.description || "",
        tropinkiLink: "",
        etomestoLink: "",
        controlPoints: route.controlPoints || [],
        track: route.track || [],
      });
    }
  }, [route]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleWalkTypeChange = (type: WalkType) => {
    setFormData((prev) => ({ ...prev, walkType: type }));
  };

  const handleAddControlPoint = () => {
    setFormData((prev) => ({
      ...prev,
      controlPoints: [
        ...prev.controlPoints,
        {
          label: `КП${prev.controlPoints.length + 1}`,
          description: "",
          coord: { lat: 0, lng: 0 },
        },
      ],
    }));
  };

  const handleRemoveControlPoint = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      controlPoints: prev.controlPoints.filter((_, i) => i !== index),
    }));
  };

  const handleControlPointChange = (
    index: number,
    field: "label" | "description",
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      controlPoints: prev.controlPoints.map((cp, i) =>
        i === index ? { ...cp, [field]: value } : cp
      ),
    }));
  };

  const handleGpxFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setGpxFile(file);
    setParseError(null);
    setIsParsingGpx(true);

    try {
      const parsed = await routesApi.parseGpx(file);
      // Заполняем форму данными из парсинга
      setFormData((prev) => ({
        ...prev,
        distanceKm: parsed.distanceKm,
        track: parsed.points,
        name: parsed.name,
      }));
      // Если название не задано, используем название из файла
      if (!route) {
        // Можно добавить поле title в форму, если нужно
      }
    } catch (err) {
      setParseError(
        err instanceof Error ? err.message : "Ошибка при парсинге GPX файла."
      );
      console.error("Failed to parse GPX:", err);
    } finally {
      setIsParsingGpx(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Определяем координаты старта из трека или существующего маршрута
    const startCoord =
      formData.track.length > 0
        ? formData.track[0]
        : route?.startLocation.coord || { lat: 0, lng: 0 };

    const startLocationObj = {
      name: formData.startLocation || route?.startLocation.name || "",
      address: route?.startLocation.address || "",
      coord: startCoord,
    };

    const finishLocationObj = {
      name: formData.finishLocation || route?.finishLocation.name || "",
      address: route?.finishLocation.address || "",
      coord: startCoord,
    };

    // Формируем дату из года
    const date = formData.date
      ? `${formData.date}`
      : route?.date || new Date().toISOString().split("T")[0];

    onSubmit({
      title: formData.name || route?.title || `Маршрут ${date}`,
      date,
      distanceKm: Number(formData.distanceKm) || 0,
      walkType: formData.walkType,
      startTime: formData.startTimeFrom || "",
      finishTime: formData.finishTimeFrom || "",
      startLocation: startLocationObj,
      finishLocation: finishLocationObj,
      description: formData.description || "",
      controlPoints: formData.controlPoints,
      track: formData.track,
    });
  };

  return (
    <form className="route-form" onSubmit={handleSubmit}>
      <div className="route-form-grid">
        <div className="route-form-column">
          <div className="form-group">
            <label>Перетащите GPX файл сюда</label>
            <div className="file-upload-area">
              <input
                type="file"
                id="gpx-file"
                accept=".gpx"
                onChange={handleGpxFileChange}
                disabled={isParsingGpx}
                style={{ display: "none" }}
              />
              <label htmlFor="gpx-file" className="file-upload-label">
                <img src="/images/upload-button.svg" alt="" />
                <span>
                  {isParsingGpx
                    ? "Парсинг файла..."
                    : gpxFile
                    ? gpxFile.name
                    : "Выбрать файл"}
                </span>
              </label>
            </div>
            {parseError && (
              <div
                style={{
                  marginTop: "0.5rem",
                  color: "#d32f2f",
                  fontSize: "0.875rem",
                }}
              >
                {parseError}
              </div>
            )}
          </div>

          <div className="form-group hidden">
            <label>Маршрут на Тропинки.РУ</label>
            <div className="link-input-wrapper">
              <input
                type="text"
                name="tropinkiLink"
                value={formData.tropinkiLink}
                onChange={handleInputChange}
                placeholder="Добавить ссылку"
                className="link-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Протяженность</label>
            <div className="distance-input-wrapper">
              <input
                type="text"
                name="distanceKm"
                value={formData.distanceKm}
                onChange={handleInputChange}
                className="distance-input"
                placeholder="Введите..."
              />
              <span className="distance-unit">Км</span>
            </div>
          </div>

          <div className="form-group">
            <label>Тип прогулки</label>
            <div className="radio-group">
              <label className="radio-line">
                <input
                  type="radio"
                  name="walkType"
                  checked={formData.walkType === "walk"}
                  onChange={() => handleWalkTypeChange("walk")}
                />
                <span>Пешая</span>
              </label>
              <label className="radio-line">
                <input
                  type="radio"
                  name="walkType"
                  checked={formData.walkType === "bike"}
                  onChange={() => handleWalkTypeChange("bike")}
                />
                <span>Велосипедная</span>
              </label>
            </div>
          </div>

          <div className="form-group hidden">
            <label>Добавить контрольные пункты</label>
            <div className="control-points-list">
              {formData.controlPoints.map((cp, index) => (
                <div key={index} className="control-point-item">
                  <input
                    type="text"
                    value={cp.label}
                    onChange={(e) =>
                      handleControlPointChange(index, "label", e.target.value)
                    }
                    placeholder="КП"
                    className="control-point-label"
                  />
                  <input
                    type="text"
                    value={cp.description}
                    onChange={(e) =>
                      handleControlPointChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Описание"
                    className="control-point-description"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveControlPoint(index)}
                    className="control-point-remove"
                    aria-label="Удалить контрольный пункт"
                  >
                    <img src="/images/remove-button.svg" alt="" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddControlPoint}
                className="control-point-add"
              >
                <img src="/images/add-button.svg" alt="" />
              </button>
            </div>
          </div>
        </div>

        <div className="route-form-column">
          <div className="form-group hidden">
            <label>Маршрут на ЭтоМесто.РУ</label>
            <div className="link-input-wrapper">
              <input
                type="text"
                name="etomestoLink"
                value={formData.etomestoLink}
                onChange={handleInputChange}
                placeholder="Добавить ссылку"
                className="link-input"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="location-input"
              placeholder="Введите..."
            />
          </div>

          <div className="form-group">
            <label>Место старта</label>
            <input
              type="text"
              name="startLocation"
              value={formData.startLocation}
              onChange={handleInputChange}
              className="location-input"
              placeholder="Введите..."
            />
          </div>

          <div className="form-group">
            <label>Место финиша</label>
            <input
              type="text"
              name="finishLocation"
              value={formData.finishLocation}
              onChange={handleInputChange}
              className="location-input"
              placeholder="Введите..."
            />
          </div>

          <div className="form-group">
            <label>Дата проведения</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="year-input"
              placeholder="Введите..."
            />
          </div>
        </div>

        <div className="route-form-column">
          <div className="form-group">
            <label>Описание</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="description-textarea"
              placeholder="Выбрать..."
            />
          </div>

          <div className="form-group hidden">
            <label>Время старта</label>
            <div className="time-input-wrapper">
              <span className="time-label">С</span>
              <input
                type="time"
                name="startTimeFrom"
                value={formData.startTimeFrom}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    startTimeFrom: e.target.value,
                  }));
                }}
                className="time-input"
              />
              <span className="time-label">До</span>
              <input
                type="time"
                name="startTimeTo"
                value={formData.startTimeTo}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    startTimeTo: e.target.value,
                  }));
                }}
                className="time-input"
              />
            </div>
          </div>

          <div className="form-group hidden">
            <label>Время финиша</label>
            <div className="time-input-wrapper">
              <span className="time-label">С</span>
              <input
                type="time"
                name="finishTimeFrom"
                value={formData.finishTimeFrom}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    finishTimeFrom: e.target.value,
                  }));
                }}
                className="time-input"
              />
              <span className="time-label">До</span>
              <input
                type="time"
                name="finishTimeTo"
                value={formData.finishTimeTo}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    finishTimeTo: e.target.value,
                  }));
                }}
                className="time-input"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="route-form-actions">
        {onCancel && (
          <button type="button" onClick={onCancel} className="btn-cancel">
            Отмена
          </button>
        )}
        {route?.id && onDelete && (
          <button
            type="button"
            onClick={() => onDelete(route.id)}
            className="btn-cancel"
            style={{ backgroundColor: "#d32f2f", color: "white" }}
          >
            Удалить маршрут
          </button>
        )}
        <button type="submit" className="btn-submit">
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}

export default RouteForm;
