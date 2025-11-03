import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import type { AppSettings } from '../../types';
import { BUILT_IN_DICTIONARIES, getDefaultBuiltInDictionary } from '../../lib/encoder/builtInDictionaries';
import { validateDictionarySize } from '../../lib/utils';
import Modal from '../Modal/Modal';
import './Settings.css';

interface SettingsProps {
  currentSettings: AppSettings;
  onSave: (settings: AppSettings) => void;
  onClose: () => void;
}

function Settings({ currentSettings, onSave, onClose }: SettingsProps) {
  const { t } = useTranslation();
  const [sourceType, setSourceType] = useState<'built-in' | 'custom'>(currentSettings.sourceType);
  const [builtInDictionaryId, setBuiltInDictionaryId] = useState<string>(
    currentSettings.builtInDictionaryId || getDefaultBuiltInDictionary().id
  );
  const [customWords, setCustomWords] = useState<string>(currentSettings.customWords || '');
  const [password, setPassword] = useState<string>(currentSettings.password || '');
  const [compressionAlgorithm, setCompressionAlgorithm] = useState<'gzip' | 'deflate' | 'none'>(
    currentSettings.compressionAlgorithm || 'deflate'
  );
  const [customError, setCustomError] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);

  // Validate custom words
  useEffect(() => {
    if (sourceType === 'custom' && customWords) {
      const words = customWords
        .split(/[,\n]+/)
        .map(w => w.trim())
        .filter(w => w.length > 0);
      
      const uniqueWords = new Set(words);
      const size = uniqueWords.size;
      
      if (size === 0) {
        setCustomError('Please enter at least one word');
      } else {
        const validation = validateDictionarySize(size);
        if (!validation.valid) {
          setCustomError(validation.message || 'Invalid dictionary size');
        } else {
          setCustomError('');
        }
      }
    } else {
      setCustomError('');
    }
  }, [sourceType, customWords]);

  const handleSave = () => {
    if (sourceType === 'custom' && customError) {
      return; // Don't save if there's an error
    }

    if (!password) {
      return; // Password is required
    }

    const settings: AppSettings = {
      sourceType,
      builtInDictionaryId: sourceType === 'built-in' ? builtInDictionaryId : undefined,
      customWords: sourceType === 'custom' ? customWords : undefined,
      password,
      compressionAlgorithm,
      encryptionAlgorithm: 'AES-256-CBC'
    };

    onSave(settings);
    onClose();
  };

  const handleCancel = () => {
    onClose();
  };

  const selectedDict = BUILT_IN_DICTIONARIES.find(d => d.id === builtInDictionaryId);
  const customWordsCount = customWords
    .split(/[,\n]+/)
    .map(w => w.trim())
    .filter(w => w.length > 0).length;
  const uniqueCustomWordsCount = new Set(
    customWords.split(/[,\n]+/).map(w => w.trim()).filter(w => w.length > 0)
  ).size;

  const footer = (
    <>
      <button className="btn-cancel" onClick={handleCancel}>
        {t('buttons.cancel')}
      </button>
      <button 
        className="btn-save" 
        onClick={handleSave}
        disabled={!password || (sourceType === 'custom' && (!!customError || !customWords))}
      >
        {t('buttons.saveAndApply')}
      </button>
    </>
  );

  return (
    <Modal title={`⚙️ ${t('settings.title')}`} onClose={onClose} footer={footer}>
      <div className="settings-content">
          {/* SECTION 1: ENCRYPTION */}
          <div className="settings-section">
            <h3 className="section-title">🔐 {t('settings.encryption.title')}</h3>
            
            {/* Password */}
            <div className="setting-group">
              <label htmlFor="password">{t('settings.encryption.password')}</label>
              <p className="setting-description">
                {t('settings.encryption.passwordDescription')}
              </p>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('settings.encryption.passwordPlaceholder')}
                  className="password-input"
                  autoComplete="off"
                />
                <button
                  type="button"
                  className="btn-toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  title={showPassword ? t('settings.encryption.hidePassword') : t('settings.encryption.showPassword')}
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
              {!password && (
                <p className="warning-text">{t('settings.encryption.passwordRequired')}</p>
              )}
            </div>

            {/* Cipher Algorithm */}
            <div className="setting-group">
              <label htmlFor="cipher">{t('settings.encryption.cipher')}</label>
              <p className="setting-description">
                {t('settings.encryption.cipherDescription')}
              </p>
              <div className="cipher-display">
                <span className="cipher-badge">AES-256-CBC</span>
                <span className="cipher-info">{t('settings.encryption.cipherInfo')}</span>
              </div>
            </div>

            {/* Compression Algorithm */}
            <div className="setting-group">
              <label htmlFor="compression">{t('settings.encryption.compression')}</label>
              <p className="setting-description">
                {t('settings.encryption.compressionDescription')}
              </p>
              <select
                id="compression"
                value={compressionAlgorithm}
                onChange={(e) => setCompressionAlgorithm(e.target.value as 'gzip' | 'deflate' | 'none')}
                className="setting-select"
              >
                <option value="deflate">{t('settings.encryption.compressionOptions.deflate')}</option>
                <option value="gzip">{t('settings.encryption.compressionOptions.gzip')}</option>
                <option value="none">{t('settings.encryption.compressionOptions.none')}</option>
              </select>
            </div>
          </div>

          {/* SECTION 2: ENCODER/DECODER */}
          <div className="settings-section">
            <h3 className="section-title">🔤 {t('settings.encoder.title')}</h3>
            
            {/* Dictionary Source */}
            <div className="setting-group">
              <label htmlFor="sourceType">{t('settings.encoder.dictionarySource')}</label>
            <p className="setting-description">
              {t('settings.encoder.dictionarySourceDescription')}
            </p>
            <div className="radio-group">
              <label className="radio-option">
                <input
                  type="radio"
                  name="sourceType"
                  value="built-in"
                  checked={sourceType === 'built-in'}
                  onChange={(e) => setSourceType(e.target.value as 'built-in' | 'custom')}
                />
                <span className="radio-label">
                  <strong>{t('settings.encoder.builtIn')}</strong>
                  <span className="radio-hint">{t('settings.encoder.builtInHint')}</span>
                </span>
              </label>

              <label className="radio-option">
                <input
                  type="radio"
                  name="sourceType"
                  value="custom"
                  checked={sourceType === 'custom'}
                  onChange={(e) => setSourceType(e.target.value as 'built-in' | 'custom')}
                />
                <span className="radio-label">
                  <strong>{t('settings.encoder.custom')}</strong>
                  <span className="radio-hint">{t('settings.encoder.customHint')}</span>
                </span>
              </label>
            </div>
          </div>

          {/* Built-in Dictionary Selection */}
          {sourceType === 'built-in' && (
            <div className="setting-group">
              <label htmlFor="builtInDictionary">{t('settings.encoder.selectDictionary')}</label>
              <p className="setting-description">
                {t('settings.encoder.selectDictionaryDescription')}
              </p>
              <select
                id="builtInDictionary"
                value={builtInDictionaryId}
                onChange={(e) => setBuiltInDictionaryId(e.target.value)}
                className="setting-select"
              >
                {BUILT_IN_DICTIONARIES.map((dict) => (
                  <option key={dict.id} value={dict.id}>
                    {dict.title} — {Math.log2(dict.size)} {t('settings.encoder.bitsPerWord')}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Custom Dictionary Input */}
          {sourceType === 'custom' && (
            <div className="setting-group">
              <label htmlFor="customWords">{t('settings.encoder.customWordList')}</label>
              <p className="setting-description">
                {t('settings.encoder.customWordListDescription')}
              </p>
              <textarea
                id="customWords"
                value={customWords}
                onChange={(e) => setCustomWords(e.target.value)}
                placeholder={t('settings.encoder.customWordListPlaceholder')}
                className="custom-words-textarea"
                rows={8}
              />
              <div className="word-count">
                <span>{t('settings.encoder.totalWords')}: {customWordsCount} {t('settings.encoder.words')}</span>
                <span>{t('settings.encoder.uniqueWords')}: {uniqueCustomWordsCount} {t('settings.encoder.words')}</span>
              </div>
              {customError && (
                <p className="error-text">{customError}</p>
              )}
            </div>
          )}

          {/* Info Box */}
          <div className="info-box">
            <strong>{t('settings.encoder.currentConfiguration')}</strong>
            <ul>
              {sourceType === 'built-in' && selectedDict && (
                <>
                  <li>{t('settings.encoder.dictionary')}: {selectedDict.title}</li>
                  <li>{t('settings.encoder.size')}: {selectedDict.size.toLocaleString()} {t('settings.encoder.words')}</li>
                  <li>{t('settings.encoder.bitsPerWord')}: {Math.log2(selectedDict.size)}</li>
                </>
              )}
              {sourceType === 'custom' && (
                <>
                  <li>{t('settings.encoder.dictionary')}: {t('settings.encoder.custom')}</li>
                  <li>{t('settings.encoder.uniqueWords')}: {uniqueCustomWordsCount}</li>
                  {uniqueCustomWordsCount > 0 && Number.isInteger(Math.log2(uniqueCustomWordsCount)) && (
                    <li>{t('settings.encoder.bitsPerWord')}: {Math.log2(uniqueCustomWordsCount)}</li>
                  )}
                </>
              )}
            </ul>
          </div>
          </div>
        </div>
    </Modal>
  );
}

export default Settings;
