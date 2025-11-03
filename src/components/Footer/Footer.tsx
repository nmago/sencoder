import { useState, useEffect } from 'react';
import styles from './Footer.module.css';

function Footer() {
  const [visibleLength, setVisibleLength] = useState(0);
  const fullText = 'Crafted with ♥ by dnmago & AI';

  useEffect(() => {
    setVisibleLength(0);
    const intervalId = setInterval(() => {
      setVisibleLength((len) => {
        if (len < fullText.length) {
          return len + 1;
        }
        clearInterval(intervalId);
        return len;
      });
    }, 120);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <footer className={styles.footer}>
      <p className={styles.typewriter}>
        {fullText.substring(0, visibleLength)}
      </p>
    </footer>
  );
}

export default Footer;