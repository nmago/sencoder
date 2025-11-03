import { useTranslation } from 'react-i18next';
import Modal from '../Modal/Modal';
import { IconInput } from './icons/IconInput';
import { IconCompress } from './icons/IconCompress';
import { IconEncrypt } from './icons/IconEncrypt';
import { IconEncode } from './icons/IconEncode';
import { IconOutput } from './icons/IconOutput';
import './HowItWorks.css';

interface HowItWorksProps {
  onClose: () => void;
  dictionarySize?: number;
  bitsPerWord?: number;
}

const Arrow = () => (
  <div className="arrow">
    <svg viewBox="0 0 100 24" preserveAspectRatio="none">
      <path d="M0 12h95l-10-7v14l10-7" stroke="currentColor" strokeWidth="3" fill="none" />
    </svg>
  </div>
);

function HowItWorks({ onClose, dictionarySize, bitsPerWord }: HowItWorksProps) {
  const { t } = useTranslation();

  const footer = (
    <button className="btn-got-it" onClick={onClose}>
      {t('buttons.gotIt')}
    </button>
  );

  return (
    <Modal title={`ℹ️ ${t('howItWorks.title')}`} onClose={onClose} footer={footer} maxWidth="800px">
      <div className="how-it-works-content">
        <div className="process-diagram">
          <div className="step">
            <div className="icon-wrapper"><IconInput /></div>
            <h4>{t('howItWorks.processSteps.input.title')}</h4>
            <p>{t('howItWorks.processSteps.input.description')}</p>
          </div>
          <Arrow />
          <div className="step">
            <div className="icon-wrapper"><IconCompress /></div>
            <h4>{t('howItWorks.processSteps.compress.title')}</h4>
            <p>{t('howItWorks.processSteps.compress.description')}</p>
          </div>
          <Arrow />
          <div className="step">
            <div className="icon-wrapper"><IconEncrypt /></div>
            <h4>{t('howItWorks.processSteps.encrypt.title')}</h4>
            <p>{t('howItWorks.processSteps.encrypt.description')}</p>
          </div>
          <Arrow />
          <div className="step">
            <div className="icon-wrapper"><IconEncode /></div>
            <h4>{t('howItWorks.processSteps.encode.title')}</h4>
            <p>{t('howItWorks.processSteps.encode.description')}</p>
          </div>
          <Arrow />
          <div className="step">
            <div className="icon-wrapper"><IconOutput /></div>
            <h4>{t('howItWorks.processSteps.output.title')}</h4>
            <p>{t('howItWorks.processSteps.output.description')}</p>
          </div>
        </div>

        <div className="details-section">
          <h3>{t('howItWorks.detailsTitle')}</h3>
          <div className="details-grid">
            <div className="detail-item">
              <h5>{t('howItWorks.details.whatIs.title')}</h5>
              <p>{t('howItWorks.details.whatIs.description')}</p>
            </div>
            <div className="detail-item">
              <h5>{t('howItWorks.details.compression.title')}</h5>
              <p>{t('howItWorks.details.compression.description')}</p>
            </div>
            <div className="detail-item">
              <h5>{t('howItWorks.details.encryption.title')}</h5>
              <p>{t('howItWorks.details.encryption.description')}</p>
            </div>
            <div className="detail-item">
              <h5>{t('howItWorks.details.wordMapping.title')}</h5>
              <p>{t('howItWorks.details.wordMapping.description', { size: dictionarySize || 'N', bits: bitsPerWord || 'N' })}</p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default HowItWorks;
