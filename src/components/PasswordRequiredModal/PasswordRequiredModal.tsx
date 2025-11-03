import { useTranslation } from 'react-i18next';
import Modal from '../Modal/Modal';
import styles from './PasswordRequiredModal.module.css';

interface PasswordRequiredModalProps {
  onClose: () => void;
  onGoToSettings: () => void;
}

function PasswordRequiredModal({ onClose, onGoToSettings }: PasswordRequiredModalProps) {
  const { t } = useTranslation();

  const footer = (
    <button className={styles.goToSettingsButton} onClick={onGoToSettings}>
      {t('buttons.goToSettings')}
    </button>
  );

  return (
    <Modal 
      title={t('notifications.passwordRequired')}
      onClose={onClose} 
      footer={footer}
      maxWidth="500px"
    >
      <div className={styles.content}>
        <p>{t('notifications.setPassword')}</p>
      </div>
    </Modal>
  );
}

export default PasswordRequiredModal;