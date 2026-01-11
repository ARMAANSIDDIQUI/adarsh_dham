import { useSelector } from 'react-redux';
import { translations } from '../utils/translations';

/**
 * Custom hook to get the current language translations.
 * @returns {object} The translation object for the current language.
 */
export const useTranslation = () => {
  const { language } = useSelector((state) => state.ui);
  
  // Fallback to English if language or translation is missing
  return translations[language] || translations['en'];
};
