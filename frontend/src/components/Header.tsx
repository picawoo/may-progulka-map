type NavItem = {
  label: string;
  href: string;
  variant?: "main";
  submenu?: { label: string; href: string }[];
};

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

function Header() {
  return (
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
  );
}

export default Header;

