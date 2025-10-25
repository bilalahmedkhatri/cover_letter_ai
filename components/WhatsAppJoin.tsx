import React from 'react';
import WhatsAppIcon from './icons/WhatsAppIcon';
import { useLocale } from '../contexts/LocaleContext';

const WhatsAppJoin: React.FC = () => {
  const { t } = useLocale();
  // IMPORTANT: Replace this with your actual WhatsApp group invite link.
  // The link below is an example of a valid format.
  const whatsAppGroupLink = 'https://chat.whatsapp.com/HWLfCa7ZJHE0hpTJ0wC3RI';

  return (
    <a
      href={whatsAppGroupLink}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-40 bg-[#25D366] text-white rounded-full p-3 shadow-lg hover:bg-[#128C7E] transition-all duration-300 ease-in-out transform hover:scale-110"
      aria-label={t('whatsappJoin')}
      title={t('whatsappJoin')}
    >
      <WhatsAppIcon className="w-8 h-8" />
    </a>
  );
};

export default WhatsAppJoin;