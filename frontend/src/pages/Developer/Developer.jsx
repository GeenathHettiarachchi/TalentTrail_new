import React, { useState, useEffect, useMemo } from 'react';
import Cookies from 'js-cookie';
import { DeveloperForm, DeveloperTable } from '../../components';
import DeveloperReport from '../../components/Reports/DeveloperReport';
import styles from './Developer.module.css';
import CategoryDropdown from '../../components/CategoryDropdown/CategoryDropdown';

const API_BASE_URL = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8080/api';
const DEVELOPER_CATEGORY_KEYWORDS = ['web developer', 'developer', 'developers'];

const parseJsonResponse = async (response, contextLabel) => {
  const rawBody = await response.text();

  if (!rawBody) {
    return null;
  }

  try {
    return JSON.parse(rawBody);
  } catch (parseError) {
    const preview = rawBody.length > 160 ? `${rawBody.slice(0, 157)}...` : rawBody;
    console.error(`Invalid JSON while parsing ${contextLabel}:`, preview);
    throw new Error(`Received invalid data from the server while loading ${contextLabel}.`);
  }
};

const toStringArray = (value, extractor) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((item) => {
        if (typeof item === 'string') {
          return item.trim();
        }

        if (typeof item === 'object' && item !== null) {
          const extracted = extractor
            ? extractor(item)
            : item?.name ?? item?.title ?? item?.value ?? item?.label;
          if (typeof extracted === 'string') {
            return extracted.trim();
          }
          if (extracted != null) {
            return String(extracted).trim();
          }
          return '';
        }

        return String(item ?? '').trim();
      })
      .filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    return value
      .split(',')
      .map((part) => part.trim())
      .filter(Boolean);
  }

  return [];
};

const normaliseDeveloperIntern = (intern) => {
  if (!intern || typeof intern !== 'object') {
    return {
      internId: intern?.internId ?? null,
      internCode: intern?.internCode ?? '',
      name: intern?.name ?? '',
      email: intern?.email ?? '',
      mobileNumber:
        intern?.mobileNumber ??
        intern?.mobile ??
        intern?.phoneNumber ??
        intern?.phone ??
        intern?.contactNumber ??
        intern?.contactNo ??
        '',
      trainingEndDate: intern?.trainingEndDate ?? intern?.trainingEnDate ?? '',
      languagesAndFrameworks: [],
      projects: [],
    };
  }

  const mobileNumber =
    intern.mobileNumber ??
    intern.mobile ??
    intern.phoneNumber ??
    intern.phone ??
    intern.contactNumber ??
    intern.contactNo ??
    '';

  return {
    ...intern,
    mobileNumber,
    languagesAndFrameworks: toStringArray(intern.languagesAndFrameworks),
    projects: toStringArray(intern.projects, (item) => item?.name ?? item?.projectName ?? item?.title),
  };
};

const findDeveloperCategory = (categories) => {
  if (!Array.isArray(categories)) {
    return null;
  }

  return (
    categories.find((category) => {
      const name = (category?.categoryName || '').toLowerCase();
      return DEVELOPER_CATEGORY_KEYWORDS.some((keyword) => name.includes(keyword));
    }) ?? null
  );
};

const Developer = () => {
  const [developerInterns, setDeveloperInterns] = useState([]);
  const [filteredInterns, setFilteredInterns] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedIntern, setSelectedIntern] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sortOption, setSortOption] = useState('internCode:asc');

  // 🔹 New state for language filter dropdown
  const [languageFilter, setLanguageFilter] = useState('All');
  const [developerCategoryId, setDeveloperCategoryId] = useState(null);
  const [currentLeadId, setCurrentLeadId] = useState(null);
  const [isCategoryMissing, setIsCategoryMissing] = useState(false);

  // Mock data for Developer interns (retained for reference only)
  /*
  const mockDeveloperData = [
    {
      internId: 1,
      internCode: 'DEV001',
      name: 'John Smith',
      email: 'john.smith@example.com',
      mobileNumber: '0712356172',
      trainingEndDate: '2025-12-15',
      languagesAndFrameworks: ['JavaScript', 'React', 'Node.js', 'Springboot'],
      projects: ['Portfolio Website', 'Inventory System', 'Task Manager']
    },
    {
      internId: 2,
      internCode: 'DEV002',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2025-11-30',
      languagesAndFrameworks: ['Java', 'Spring Boot', 'React'],
      projects: ['E-Commerce Platform']
    },
    {
      internId: 3,
      internCode: 'DEV003',
      name: 'Michael Brown',
      email: 'michael.brown@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2026-01-20',
      languagesAndFrameworks: ['Python', 'Django'],
      projects: ['Analytics Dashboard', 'ML Model API']
    },
    {
      internId: 4,
      internCode: 'DEV004',
      name: 'Emily Davis',
      email: 'emily.davis@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2025-12-10',
      languagesAndFrameworks: ['C#', '.NET'],
      projects: ['Student Management System']
    },
    {
      internId: 5,
      internCode: 'DEV005',
      name: 'David Wilson',
      email: 'david.wilson@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2025-10-22',
      languagesAndFrameworks: ['PHP', 'Laravel'],
      projects: ['Task Tracker', 'CRM System']
    },
    {
      internId: 6,
      internCode: 'DEV006',
      name: 'Lisa Anderson',
      email: 'lisa.anderson@example.com',
      mobileNumber: '0776502837',
      trainingEndDate: '2025-12-28',
      languagesAndFrameworks: ['Flutter', 'Firebase'],
      projects: ['Mobile E-Learning App']
    }
  ];
  */

  // Load developer interns from backend
  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
  setIsLoading(true);
  setError('');
  setIsCategoryMissing(false);

      const token = Cookies.get('authToken');
      if (!token) {
        setError('Authorization failed. Please log in.');
        setIsLoading(false);
        return;
      }

      const authHeader = { Authorization: `Bearer ${token}` };

      try {
        const categoriesResponse = await fetch(`${API_BASE_URL}/categories`, {
          headers: authHeader,
        });

        if (!categoriesResponse.ok) {
          throw new Error('Failed to fetch categories from the server.');
        }

  const categoriesData = (await parseJsonResponse(categoriesResponse, 'categories')) ?? [];
        const developerCategory = findDeveloperCategory(categoriesData);

        if (!developerCategory) {
          if (!isMounted) {
            return;
          }

          setDeveloperCategoryId(null);
          setDeveloperInterns([]);
          setLanguageFilter('All');
          setIsCategoryMissing(true);
          setError(
            'Developer category is missing in the backend. Please create a "Web Developer" category (or similar) to enable this view.'
          );
          return;
        }

        if (!isMounted) {
          return;
        }

        setDeveloperCategoryId(developerCategory.categoryId);

        const internsResponse = await fetch(
          `${API_BASE_URL}/interns/category/${developerCategory.categoryId}`,
          { headers: authHeader }
        );

        if (!internsResponse.ok) {
          throw new Error('Failed to fetch Developer interns from the server.');
        }

  const internsData = (await parseJsonResponse(internsResponse, 'developer interns')) ?? [];

        if (!isMounted) {
          return;
        }

        const normalisedInterns = Array.isArray(internsData)
          ? internsData.map((intern) => normaliseDeveloperIntern(intern))
          : [];

        setDeveloperInterns(normalisedInterns);
        setLanguageFilter('All');

        const categoryDetailResponse = await fetch(
          `${API_BASE_URL}/categories/${developerCategory.categoryId}`,
          { headers: authHeader }
        );

        if (categoryDetailResponse.ok) {
          const categoryDetail = await parseJsonResponse(categoryDetailResponse, 'developer lead details');
          if (isMounted) {
            const leadId =
              categoryDetail?.leadInternId ??
              categoryDetail?.leadIntern?.internId ??
              null;
            setCurrentLeadId(leadId);
          }
        } else {
          console.warn('Could not fetch current lead information.');
        }
      } catch (err) {
        if (!isMounted) {
          return;
        }
        console.error('Error loading Developer interns:', err);
        setDeveloperInterns([]);
        setError(err.message || 'Could not load Developer interns from the server.');
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Helper: normalize values for search/sort
  const asText = (v) => Array.isArray(v) ? v.join(', ') : (v ?? '');

  // Filter interns based on search term & language dropdown
  useEffect(() => {
    const term = searchTerm.toLowerCase().trim();
    let list = !term
      ? [...developerInterns]
      : developerInterns.filter(intern => {
          const name = (intern.name || '').toLowerCase();
          const code = (intern.internCode || '').toLowerCase();
          const langs = asText(intern.languagesAndFrameworks).toLowerCase();
          const proj = asText(intern.projects).toLowerCase();
          const mobile = (intern.mobileNumber || '').toLowerCase();
          return (
            name.includes(term) ||
            code.includes(term) ||
            langs.includes(term) ||
            proj.includes(term) ||
            mobile.includes(term)
          );
        });

    // 🔹 Apply language filter if not "All"
    if (languageFilter !== 'All' ) {
      list = list.filter(intern =>
        toStringArray(intern.languagesAndFrameworks).some(lang =>
          lang.toLowerCase() === languageFilter.toLowerCase()
        )
      );
    }

    // Sorting
    const [sortField, sortOrder] = (sortOption || 'none').split(':');
    if (sortField && sortOrder && sortField !== 'none') {
      list.sort((a, b) => {
        let aVal, bVal;

        switch (sortField) {
          case 'internCode':
            aVal = a.internCode;
            bVal = b.internCode;
            break;
          case 'endDate':
            aVal = a.trainingEndDate;
            bVal = b.trainingEndDate;
            break;
          case 'languagesAndFrameworks':
            aVal = asText(a.languagesAndFrameworks);
            bVal = asText(b.languagesAndFrameworks);
            break;
          case 'projects':
            aVal = asText(a.projects);
            bVal = asText(b.projects);
            break;
          default:
            return 0;
        }

        let cmp = 0;
        if (sortField === 'endDate') {
          const aDate = aVal ? new Date(aVal) : null;
          const bDate = bVal ? new Date(bVal) : null;
          if (!aDate && bDate) cmp = -1;
          else if (aDate && !bDate) cmp = 1;
          else if (aDate && bDate) cmp = aDate - bDate;
        } else {
          cmp = (aVal || '').localeCompare(bVal || '', undefined, {
            numeric: true,
            sensitivity: 'base'
          });
        }

        return sortOrder === 'asc' ? cmp : -cmp;
      });
    }

    setFilteredInterns(list);
  }, [developerInterns, searchTerm, sortOption, languageFilter]);

  const allLanguages = useMemo(() => {
    const unique = new Set();

    developerInterns.forEach((intern) => {
      const languages = Array.isArray(intern.languagesAndFrameworks)
        ? intern.languagesAndFrameworks
        : toStringArray(intern.languagesAndFrameworks);
      languages.forEach((lang) => {
        if (lang) {
          unique.add(lang);
        }
      });
    });

    return ['All', ...Array.from(unique).sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))];
  }, [developerInterns]);

  useEffect(() => {
    if (!allLanguages.includes(languageFilter)) {
      setLanguageFilter('All');
    }
  }, [allLanguages, languageFilter]);

  const handleAddIntern = () => {
    setSelectedIntern(null);
    setIsFormOpen(true);
  };

  const handleEditIntern = (intern) => {
    setSelectedIntern(intern);
    setIsFormOpen(true);
  };

  const handleDeleteIntern = async (internId) => {
    try {
      setError('');
      setDeveloperInterns(prev =>
        prev.filter(intern => intern.internId !== internId)
      );
      if (currentLeadId === internId) {
        setCurrentLeadId(null);
      }
    } catch (err) {
      console.error('Error deleting Developer intern:', err);
      setError('Failed to delete Developer intern. Please try again.');
    }
  };

  const handleFormSubmit = async (payload) => {
    try {
      setIsSubmitting(true);
      setError('');

      if (payload?.internId != null) {
        // Update existing
        setDeveloperInterns(prev =>
          prev.map(intern =>
            intern.internId === payload.internId
              ? { ...intern, ...normaliseDeveloperIntern(payload) }
              : intern
          )
        );
      } else {
        // Add new
        const newIntern = normaliseDeveloperIntern({ ...payload, internId: Date.now() });
        setDeveloperInterns(prev => [...prev, newIntern]);
      }

      setIsFormOpen(false);
      setSelectedIntern(null);
    } catch (err) {
      console.error('Error saving Developer intern:', err);
      setError(`Failed to ${payload?.internId ? 'update' : 'create'} Developer intern. Please try again.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setSelectedIntern(null);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const handleAssignLead = async (internId) => {
    if (!developerCategoryId) {
      setError('Developer category is not loaded yet. Please try again shortly.');
      return;
    }

    const token = Cookies.get('authToken');
    if (!token) {
      setError('Authorization failed. Please log in.');
      return;
    }

    try {
      setError('');
      const response = await fetch(
        `${API_BASE_URL}/categories/${developerCategoryId}/assign-lead/${internId}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Failed to assign lead. The intern ID might be invalid.');
      }

      setCurrentLeadId(internId);
      return true;
    } catch (err) {
      console.error('Error assigning lead:', err);
      setError(err.message || 'Failed to assign Developer lead. Please try again.');
      throw err;
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Developer Interns Management</h1>
        <p className={styles.subtitle}>
          Manage Developer interns, programming stacks, and project assignments
        </p>
      </div>

      <div className={styles.content}>
        {error && (
          <div className={styles.errorAlert}>
            <span className={styles.errorIcon}>⚠️</span>
            <span className={styles.errorText}>{error}</span>
            <button
              className={styles.errorClose}
              onClick={() => setError('')}
            >
              ×
            </button>
          </div>
        )}

        {isCategoryMissing && (
          <div className={styles.infoAlert}>
            <h3>Developer category not found</h3>
            <p>
              We could not locate a developer-focused category in the backend. Please create a
              category named something like <strong>"Web Developer"</strong> and assign the relevant
              interns to it. Once it is available, refresh this page to load the developer roster.
            </p>
          </div>
        )}

        <div className={styles.actionSection}>
          <button
            className={styles.primaryBtn}
            onClick={handleAddIntern}
            disabled={isCategoryMissing}
            title={
              isCategoryMissing
                ? 'Create the Developer category in the backend before adding new interns.'
                : undefined
            }
          >
            + Add New Developer Intern
          </button>

          <div className={styles.filterSection}>
            <CategoryDropdown current="developers" />
            <form onSubmit={handleSearch} className={styles.searchSection}>
              <input
                type="text"
                placeholder="Search by name, code, languages, projects, or mobile..."
                className={styles.searchInput}
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </form>

            {/* 🔹 Added Language Dropdown Filter */}
            <select
              className={styles.filterSelect}
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              title="Filter by Language"
            >
              {allLanguages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang}
                </option>
              ))}
            </select>

            <div className={styles.sortSection}>
              <select
                className={styles.filterSelect}
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
                title="Sort by"
              >
                <option value="none">None</option>
                <option value="internCode:asc">Intern Code (Ascending)</option>
                <option value="internCode:desc">Intern Code (Descending)</option>
                <option value="endDate:asc">End Date (Ascending)</option>
                <option value="endDate:desc">End Date (Descending)</option>
                <option value="languagesAndFrameworks:asc">Languages & Frameworks (Ascending)</option>
                <option value="languagesAndFrameworks:desc">Languages & Frameworks (Descending)</option>
                <option value="projects:asc">Projects (Ascending)</option>
                <option value="projects:desc">Projects (Descending)</option>
              </select>
            </div>
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <DeveloperReport interns={filteredInterns} />
            
          </div>
        </div>

        <div className={styles.tableSection}>
          <div className={styles.tableHeader}>
            <h3 className={styles.tableTitle}>
              All Developer Interns ({filteredInterns.length})
            </h3>
            {searchTerm && (
              <p className={styles.searchInfo}>
                Showing results for "{searchTerm}"
                <button
                  className={styles.clearSearch}
                  onClick={() => setSearchTerm('')}
                >
                  Clear
                </button>
              </p>
            )}
          </div>

          <DeveloperTable
            interns={filteredInterns}
            onEdit={handleEditIntern}
            onDelete={handleDeleteIntern}
            isLoading={isLoading}
            onAssignLead={developerCategoryId ? handleAssignLead : undefined}
            currentLeadId={currentLeadId}
          />
        </div>
      </div>

      <DeveloperForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        editingIntern={selectedIntern}
        isLoading={isSubmitting}
      />
    </div>
  );
};

export default Developer;
