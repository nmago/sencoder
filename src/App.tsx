import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { EncoderService } from './lib/encoder/EncoderService';
import { UrlWordsProvider, ArrayWordsProvider } from './lib/providers';
import { getBuiltInDictionary, getDefaultBuiltInDictionary } from './lib/encoder/builtInDictionaries';
import { validateDictionarySize } from './lib/utils';
import { GzipCompressor, DeflateCompressor } from './lib/compression';
import { AESCryptor } from './lib/crypto';
import { SecureEncoder } from './lib/secure';
import Settings from './components/Settings/Settings';
import HowItWorks from './components/HowItWorks/HowItWorks';
import PasswordRequiredModal from './components/PasswordRequiredModal/PasswordRequiredModal';
import LanguageSwitcher from './components/LanguageSwitcher/LanguageSwitcher';
import Footer from './components/Footer/Footer';
import { useToast } from './hooks/useToast';
import type { ConversionMode, AppSettings } from './types';
import './App.css';

function App() {
  const { t } = useTranslation();
  const { showToast, ToastContainer } = useToast();
  const [currentMode, setCurrentMode] = useState<ConversionMode>('encode');
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [showHowItWorks, setShowHowItWorks] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [settings, setSettings] = useState<AppSettings>({
    sourceType: 'built-in',
    builtInDictionaryId: getDefaultBuiltInDictionary().id,
    password: '',
    compressionAlgorithm: 'deflate',
    encryptionAlgorithm: 'AES-256-CBC'
  });
  const [encoder, setEncoder] = useState<EncoderService | null>(null);
  const [secureEncoder, setSecureEncoder] = useState<SecureEncoder | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize encoder based on settings
  const initializeEncoder = useCallback(async (newSettings: AppSettings) => {
    setIsLoading(true);
    try {
      let provider;
      
      if (newSettings.sourceType === 'built-in') {
        // Load built-in dictionary from URL
        const dict = getBuiltInDictionary(newSettings.builtInDictionaryId!);
        if (!dict) {
          throw new Error('Built-in dictionary not found');
        }
        provider = new UrlWordsProvider(dict.url, dict.size, dict.title);
      } else {
        // Custom dictionary from user input
        if (!newSettings.customWords) {
          throw new Error('No custom words provided');
        }
        
        const words = newSettings.customWords
          .split(/[,\n]+/)
          .map(w => w.trim())
          .filter(w => w.length > 0);
        
        const uniqueWords = Array.from(new Set(words));
        
        const validation = validateDictionarySize(uniqueWords.length);
        if (!validation.valid) {
          throw new Error(validation.message || 'Invalid dictionary size');
        }
        
        provider = new ArrayWordsProvider(uniqueWords, 'Custom Dictionary');
      }

      const newEncoder = new EncoderService(provider);
      await newEncoder.initialize();
      
      // Create secure encoder with optional compression and encryption
      let compressor = null;
      if (newSettings.compressionAlgorithm === 'gzip') {
        compressor = new GzipCompressor();
      } else if (newSettings.compressionAlgorithm === 'deflate') {
        compressor = new DeflateCompressor();
      }
      
      const cryptor = new AESCryptor();
      const newSecureEncoder = new SecureEncoder(newEncoder, compressor, cryptor);
      
      setEncoder(newEncoder);
      setSecureEncoder(newSecureEncoder);
      
      const info = newEncoder.getDictionaryInfo();
      console.log('Dictionary loaded:', info);
      console.log(`Using ${info.size} words, ${info.bitsPerWord} bits per word`);
      console.log(`Provider: ${newEncoder.getProviderName()}`);
      console.log('Secure encoding enabled with AES-256 encryption');
      
      showToast('success', t('notifications.dictionaryLoaded', { size: info.size }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast('error', t('notifications.dictionaryLoadFailed', { error: errorMessage }));
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  // Initialize on mount
  useEffect(() => {
    initializeEncoder(settings);
  }, []);

  const handleConvert = async () => {
    if (!secureEncoder) {
      showToast('error', 'Encoder not initialized');
      return;
    }

    if (!leftText) {
      showToast('error', 'Please enter some text to convert');
      return;
    }

    if (!settings.password) {
      setShowPasswordModal(true);
      return;
    }

    try {
      if (currentMode === 'encode') {
        const encoded = await secureEncoder.encodeSecure(leftText, settings.password);
        setRightText(encoded);
        showToast('success', t('notifications.encryptSuccess'));
      } else {
        const decoded = await secureEncoder.decodeSecure(leftText, settings.password);
        setRightText(decoded);
        showToast('success', t('notifications.decryptSuccess'));
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      showToast('error', `Error: ${errorMessage}`);
      console.error(error);
    }
  };

  const handleSettingsSave = async (newSettings: AppSettings) => {
    setSettings(newSettings);
    await initializeEncoder(newSettings);
    // Clear text fields when changing dictionary
    if (currentMode === 'encode') {
      setRightText('');
    } else {
      setLeftText('');
    }
  };

  const handleSwitchMode = () => {
    // Swap content
    const temp = leftText;
    setLeftText(rightText);
    setRightText(temp);
    
    // Toggle mode
    setCurrentMode(currentMode === 'encode' ? 'decode' : 'encode');
  };

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      showToast('success', t('notifications.copied', { label }));
    } catch (error) {
      showToast('error', 'Failed to copy to clipboard');
    }
  };

  const calculateBits = (text: string): number => {
    if (!text || !encoder) return 0;
    const bytes = new TextEncoder().encode(text).length;
    return bytes * 8;
  };

  const leftLabel = currentMode === 'encode' ? t('labels.plainText') : t('labels.encryptedWords');
  const rightLabel = currentMode === 'encode' ? t('labels.encryptedWords') : t('labels.plainText');
  
  const leftCharCount = leftText.length;
  const rightCharCount = rightText.length;
  const leftBits = calculateBits(leftText);
  const rightBits = calculateBits(rightText);

  return (
    <>
      <div className="top-actions">
        <LanguageSwitcher />
        <button 
          className="btn-icon" 
          onClick={() => setShowHowItWorks(true)}
          title={t('buttons.howItWorks')}
        >
          <span className="icon">❓</span>
        </button>
        <button 
          className="btn-icon" 
          onClick={() => setShowSettings(true)}
          title={t('buttons.settings')}
          disabled={isLoading}
        >
          <span className="icon">⚙️</span>
        </button>
      </div>

      <div className="container">
        <div className="header-bar">
          <h1>🔐 {t('app.title')}</h1>
          <p className="subtitle">{t('app.subtitle')}</p>
        </div>

      <div className="translator-container">
        <div className="text-panel">
          <div className="panel-header">
            <label htmlFor="leftText">{leftLabel}</label>
            <div className="panel-actions">
              <button 
                className="btn-copy-small" 
                onClick={() => handleCopy(leftText, leftLabel)}
                disabled={!leftText}
                title={t('buttons.copy')}
              >
                <span className="btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </span>
                <span className="btn-text">{t('buttons.copy')}</span>
              </button>
              <button className="btn-clear-small" onClick={() => setLeftText('')} title={t('buttons.clear')}>
                <span className="btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>
                <span className="btn-text">{t('buttons.clear')}</span>
              </button>
            </div>
          </div>
          <textarea
            id="leftText"
            value={leftText}
            onChange={(e) => setLeftText(e.target.value)}
            placeholder={t('placeholders.enterText')}
          />
          <div className="text-stats">
            <span>{leftCharCount} {t('labels.characters')}</span>
            <span>{leftBits} {t('labels.bits')}</span>
          </div>
        </div>

        {/* Switch button - shows between text areas on mobile */}
        <div className="switch-button-mobile">
          <button 
            className="mode-switch mode-switch-mobile" 
            onClick={handleSwitchMode} 
            title={t('modes.switchTo', { mode: currentMode === 'encode' ? t('modes.encode') : t('modes.decode') })}
            disabled={isLoading}
          >
            <span className="switch-icon">⇄</span>
            <span className="switch-label">{t('modes.switchTo', { mode: currentMode === 'encode' ? t('modes.encode') : t('modes.decode') })}</span>
          </button>
        </div>

        <div className="text-panel">
          <div className="panel-header">
            <label htmlFor="rightText">{rightLabel}</label>
            <div className="panel-actions">
              <button 
                className="btn-copy-small" 
                onClick={() => handleCopy(rightText, rightLabel)}
                disabled={!rightText}
                title={t('buttons.copy')}
              >
                <span className="btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                </span>
                <span className="btn-text">{t('buttons.copy')}</span>
              </button>
              <button className="btn-clear-small" onClick={() => setRightText('')} title={t('buttons.clear')}>
                <span className="btn-icon">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </span>
                <span className="btn-text">{t('buttons.clear')}</span>
              </button>
            </div>
          </div>
          <textarea
            id="rightText"
            value={rightText}
            onChange={(e) => setRightText(e.target.value)}
            placeholder={t('placeholders.resultWillAppear')}
          />
          <div className="text-stats">
            <span>{rightCharCount} {t('labels.characters')}</span>
            <span>{rightBits} {t('labels.bits')}</span>
          </div>
        </div>
      </div>

      {/* Control buttons - below text areas on desktop */}
      <div className="control-bar">
        <button 
          className="mode-switch mode-switch-desktop" 
          onClick={handleSwitchMode} 
          title={t('modes.switchTo', { mode: currentMode === 'encode' ? t('modes.decode') : t('modes.encode') })}
          disabled={isLoading}
        >
          <span className="switch-icon">⇄</span>
        </button>
        <button 
          className="btn-convert" 
          onClick={handleConvert} 
          title={t('buttons.convert')} 
          disabled={isLoading || !secureEncoder}
        >
          <span className="icon">⚡</span>
          <span className="label">{isLoading ? t('buttons.loading') : t('buttons.convert')}</span>
        </button>
      </div>

      </div>

      <ToastContainer />

      {showSettings && (
        <Settings
          currentSettings={settings}
          onSave={handleSettingsSave}
          onClose={() => setShowSettings(false)}
        />
      )}

      {showHowItWorks && (
        <HowItWorks
          onClose={() => setShowHowItWorks(false)}
          dictionarySize={encoder?.getDictionaryInfo().size}
          bitsPerWord={encoder?.getDictionaryInfo().bitsPerWord}
        />
      )}

      {showPasswordModal && (
        <PasswordRequiredModal 
          onClose={() => setShowPasswordModal(false)} 
          onGoToSettings={() => {
            setShowPasswordModal(false);
            setShowSettings(true);
          }}
        />
      )}

      <Footer />
    </>
  );
}

export default App;
