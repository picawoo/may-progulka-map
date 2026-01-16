const randomColors = [
  "rgba(255, 99, 132, 0.5)", // Красный
  "rgba(54, 162, 235, 0.5)", // Синий
  "rgba(75, 192, 192, 0.5)", // Бирюзовый
  "rgba(153, 102, 255, 0.5)", // Фиолетовый
  "rgba(201, 203, 207, 0.5)", // Серый
  "rgba(0, 128, 0, 0.5)", // Зеленый
  "rgba(128, 0, 128, 0.5)", // Пурпурный
  "rgba(0, 0, 139, 0.5)", // Темно-синий
  "rgba(139, 69, 19, 0.5)", // Коричневый
  "rgba(255, 20, 147, 0.5)", // Розовый
  "rgba(0, 255, 255, 0.5)", // Голубой
  "rgba(30, 144, 255, 0.5)", // Лазурный
];

// Функция, которая возвращает следующий цвет по кругу
export function createColorCycle(colors: string[] = randomColors) {
  let currentIndex = 0;

  return function getNextColor(): string {
    const color = colors[currentIndex];
    currentIndex = (currentIndex + 1) % colors.length;
    return color;
  };
}
