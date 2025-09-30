import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FiHome, 
  FiUsers, 
  FiUser, 
  FiFolder,
  FiLogOut,
  FiCheckCircle,
  FiServer,
  FiCode,
  FiEdit3
} from 'react-icons/fi';
import styles from './Sidebar.module.css';

const Sidebar = ({ isVisible = true, onClose }) => {
  const location = useLocation();
  const { isAdmin, isIntern, logout } = useAuth();

  // Define navigation items with icons based on user role
  const adminNavItems = [
    { path: '/', label: 'Home', icon: FiHome },
    { path: '/interns', label: 'Interns', icon: FiUser },
    { path: '/devops', label: 'DevOps Interns', icon: FiServer },
    { path: '/developers', label: 'Developer Interns', icon: FiCode },
    { path: '/qa', label: 'QA Interns', icon: FiCheckCircle },
    { path: '/teams', label: 'Teams', icon: FiUsers },
    { path: '/projects', label: 'Projects', icon: FiFolder },
    { path: '/intern-update-requests', label: 'Update Requests', icon: FiEdit3 }
  ];

  const internNavItems = [
    { path: '/profile', label: 'Profile', icon: FiUser },
    { path: '/teams', label: 'Teams', icon: FiUsers },
    { path: '/projects', label: 'Projects', icon: FiFolder }
  ];

  const navItems = isAdmin ? adminNavItems : internNavItems;

  const handleLogout = () => {
    logout();
    if (onClose) onClose(); // Close mobile sidebar after logout
  };

  const handleLinkClick = () => {
    if (onClose) onClose(); // Close mobile sidebar when navigating
  };

  return (
    <>
      {/* Mobile backdrop */}
      <div 
        className={`${styles.backdrop} ${isVisible ? styles.visible : ''}`}
        onClick={onClose}
      />
      
      <aside 
        className={`${styles.sidebar} ${isVisible ? styles.visible : ''}`}
      >
        <nav className={styles.navigation}>
          <ul className={styles.navList}>
            {navItems.map((item) => {
              const IconComponent = item.icon;
              const isActive = location.pathname === item.path;
              
              return (
                <li key={item.path} className={styles.navItem}>
                  <Link 
                    to={item.path} 
                    className={`${styles.navLink} ${isActive ? styles.active : ''}`}
                    title={item.label}
                    onClick={handleLinkClick}
                  >
                    <div className={styles.iconContainer}>
                      <IconComponent className={styles.icon} />
                    </div>
                    <span className={styles.label}>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
          
          {/* Logout button at bottom */}
          <div className={styles.logoutSection}>
            <button 
              onClick={handleLogout}
              className={styles.logoutButton}
              title="Logout"
            >
              <div className={styles.iconContainer}>
                <FiLogOut className={styles.icon} />
              </div>
              <span className={styles.label}>Logout</span>
            </button>
          </div>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
