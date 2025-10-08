import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUsers, FaFlask, FaCogs, FaLaptopCode, FaChevronDown } from 'react-icons/fa';
import styles from './CategoryDropdown.module.css';

const categories = [
  { id: 'all', name: 'All Interns', icon: <FaUsers /> },
  { id: 'qa', name: 'QA Team', icon: <FaFlask /> },
  { id: 'devops', name: 'DevOps Engineers', icon: <FaCogs /> },
  { id: 'developers', name: 'Developers', icon: <FaLaptopCode /> },
];

const CategoryDropdown = ({ current = 'all' }) => {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleSelect = (id) => {
    switch (id) {
      case 'qa':
        navigate('/qa');
        break;
      case 'devops':
        navigate('/devops');
        break;
      case 'developers':
        navigate('/developers');
        break;
      default:
        navigate('/interns');
    }
    setOpen(false);
  };

  const active = categories.find((c) => c.id === current);

  return (
    <div className={styles.customDropdown}>
      <button className={styles.dropdownButton} onClick={() => setOpen(!open)}>
        <span className={styles.icon}>{active.icon}</span>
        <span className={styles.label}>{active.name}</span>
        <FaChevronDown className={`${styles.chevron} ${open ? styles.open : ''}`} />
      </button>

      {open && (
        <ul className={styles.dropdownList}>
          {categories.map((c) => (
            <li key={c.id} className={styles.dropdownItem} onClick={() => handleSelect(c.id)}>
              <span className={styles.icon}>{c.icon}</span>
              {c.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default CategoryDropdown;
