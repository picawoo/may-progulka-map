import { useState, useEffect } from "react";
import type { RouteItem, WalkType } from "../data/mockRoutes";

type RouteFormProps = {
  route?: RouteItem;
  onSubmit: (data: Partial<RouteItem>) => void;
  onCancel?: () => void;
  submitButtonText?: string;
};

function RouteForm({
  route,
  onSubmit,
  onCancel,
  submitButtonText = "Загрузить маршрут",
}: RouteFormProps) {
  const [formData, setFormData] = useState({
    distanceKm: route?.distanceKm || "",
    walkType: (route?.walkType || "walk") as WalkType,
    startLocation: route?.startLocation.name || "",
    finishLocation: route?.startLocation.name || "",
    startTimeFrom: route?.startTime || "11:00",
    startTimeTo: route?.startTime || "13:00",
    finishTimeFrom: route?.finishTime || "12:00",
    finishTimeTo: route?.finishTime || "21:00",
    year: route?.date ? new Date(route.date).getFullYear().toString() : "",
    description: route?.description || "",
    tropinkiLink: "",
    etomestoLink: "",
    controlPoints: route?.controlPoints || [],
  });

  const [gpxFile, setGpxFile] = useState<File | null>(null);
  const [kmlFile, setKmlFile] = useState<File | null>(null);

  useEffect(() => {
    if (route) {
      setFormData({
        distanceKm: route.distanceKm || "",
        walkType: route.walkType || "walk",
        startLocation: route.startLocation.name || "",
        finishLocation: route.startLocation.name || "",
        startTimeFrom: route.startTime || "11:00",
        startTimeTo: route.startTime || "13:00",
        finishTimeFrom: route.finishTime || "12:00",
        finishTimeTo: route.finishTime || "21:00",
        year: route.date
          ? new Date(route.date).getFullYear().toString()
          : "",
        description: route.description || "",
        tropinkiLink: "",
        etomestoLink: "",
        controlPoints: route.controlPoints || [],
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      distanceKm: Number(formData.distanceKm),
      startTime: formData.startTimeFrom,
      finishTime: formData.finishTimeFrom,
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
                onChange={(e) => setGpxFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <label htmlFor="gpx-file" className="file-upload-label">
                <img src="/upload-button.svg" alt="" />
                <span>Выбрать файл</span>
              </label>
            </div>
          </div>

          <div className="form-group">
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
              <select
                name="distanceKm"
                value={formData.distanceKm}
                onChange={handleInputChange}
                className="distance-select"
              >
                <option value="">Выбрать...</option>
                {Array.from({ length: 91 }, (_, i) => i + 10).map((km) => (
                  <option key={km} value={km}>
                    {km}
                  </option>
                ))}
              </select>
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

          <div className="form-group">
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
                    <img src="/remove-button.svg" alt="" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleAddControlPoint}
                className="control-point-add"
              >
                <img src="/add-button.svg" alt="" />
              </button>
            </div>
          </div>
        </div>

        <div className="route-form-column">
          <div className="form-group">
            <label>Перетащите KML файл сюда</label>
            <div className="file-upload-area">
              <input
                type="file"
                id="kml-file"
                accept=".kml"
                onChange={(e) => setKmlFile(e.target.files?.[0] || null)}
                style={{ display: "none" }}
              />
              <label htmlFor="kml-file" className="file-upload-label">
                <img src="/upload-button.svg" alt="" />
                <span>Выбрать файл</span>
              </label>
            </div>
          </div>

          <div className="form-group">
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
            <label>Место старта</label>
            <select
              name="startLocation"
              value={formData.startLocation}
              onChange={handleInputChange}
              className="location-select"
            >
              <option value="">Выбрать...</option>
              <option value="Стадион УрФУ (г.Екатеринбург)">
                Стадион УрФУ (г.Екатеринбург)
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Место финиша</label>
            <select
              name="finishLocation"
              value={formData.finishLocation}
              onChange={handleInputChange}
              className="location-select"
            >
              <option value="">Выбрать...</option>
              <option value="Стадион УрФУ (г.Екатеринбург)">
                Стадион УрФУ (г.Екатеринбург)
              </option>
            </select>
          </div>

          <div className="form-group">
            <label>Год проведения</label>
            <select
              name="year"
              value={formData.year}
              onChange={handleInputChange}
              className="year-select"
            >
              <option value="">Выбрать...</option>
              {Array.from({ length: 15 }, (_, i) => 2010 + i).map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
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

          <div className="form-group">
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

          <div className="form-group">
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
        <button type="submit" className="btn-submit">
          {submitButtonText}
        </button>
      </div>
    </form>
  );
}

export default RouteForm;

