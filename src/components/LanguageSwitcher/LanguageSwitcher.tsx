import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'ru' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <button 
      className="language-switcher" 
      onClick={toggleLanguage}
      title={i18n.language === 'en' ? 'Switch to Russian' : 'Переключить на английский'}
    >
      <span className="lang-flag">{i18n.language === 'en' ? '🇷🇺' : '🇬🇧'}</span>
      <span className="lang-code">{i18n.language === 'en' ? 'RU' : 'EN'}</span>
    </button>
  );
}

export default LanguageSwitcher;
