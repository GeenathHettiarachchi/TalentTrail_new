import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { FiMenu } from 'react-icons/fi';
import styles from './Navigation.module.css';

const Navigation = ({ onMenuClick }) => {
  const { user } = useAuth();

  return (
    <nav className={styles.navbar}>
      <div className={styles.navContainer}>
        {/* Logo on the left */}
        <Link to="/" className={styles.logo}>
          <img src="/icon.png" alt="Intern Management System" className={styles.logoImg} />
          <span className={styles.logoText2}>TalentTrail</span>
          <span className={styles.logoText}>Intern Management System</span>
        </Link>
        
        {/* Right section with user info and hamburger menu */}
        <div className={styles.rightSection}>
          <div className={styles.userInfo}>
            <span className={styles.userGreeting}>Welcome back,</span>
            <span>
              <span className={styles.userName}>{user?.name} </span>
               
              <span className={styles.userRole}>- {user?.role}</span>
            </span>
          </div>
          
          {/* Hamburger menu for mobile */}
          <button 
            onClick={onMenuClick} 
            className={styles.menuButton}
            aria-label="Toggle navigation menu"
          >
            <FiMenu />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
