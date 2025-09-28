import React from 'react';
import styles from './Footer.module.css';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={styles.footer}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.footerLogo}>
            <img src="/logo.png" alt="Intern Management System" className={styles.logoImg} />
            <div className={styles.logoText}>- Intern Management System</div>
          </div>
          
          <div className={styles.footerInfo}>
            <p className={styles.footerText}>
              Streamlining intern management and team collaboration
            </p>
            <p className={styles.copyright}>
              © {currentYear} TalentTrail - All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
