import footerEmail from "../assets/footer_email.png";
import footerLogo from "../assets/footer_logo.png";
import footerPhone from "../assets/footer_phone.png";
import footerTelegram from "../assets/footer_telegram.png";
import footerVk from "../assets/footer_vk.png";

function Footer() {
  return (
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
  );
}

export default Footer;

