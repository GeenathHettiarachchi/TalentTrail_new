import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Cookies from 'js-cookie';
import styles from './ModuleBulkImport.module.css';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const ModuleBulkImport = ({ projectId, isOpen, onClose, onSuccess }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResults, setImportResults] = useState(null);
  const [isImporting, setIsImporting] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const { isAdmin, isProjectManager } = useAuth();

  // Check if user has permission to import/export
  const hasPermission = isAdmin || isProjectManager;

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = ['.csv', '.xlsx', '.xls'];
      const fileName = file.name.toLowerCase();
      const isValidType = validTypes.some(type => fileName.endsWith(type));
      
      if (isValidType) {
        setSelectedFile(file);
        setImportResults(null);
        setShowResults(false);
      } else {
        alert('Please select a valid CSV or Excel file (.csv, .xlsx, .xls)');
        event.target.value = '';
      }
    }
  };

  const handleImport = async () => {
    if (!selectedFile || !hasPermission) return;

    setIsImporting(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = Cookies.get('authToken');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/modules/import/${projectId}`, {
        method: 'POST',
        headers: headers,
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Import failed: ${errorText || response.statusText}`);
      }

      const result = await response.json();
      setImportResults(result);
      setShowResults(true);
      
      if (result.successCount > 0) {
        onSuccess?.();
      }
    } catch (error) {
      console.error('Import error:', error);
      setImportResults({
        successCount: 0,
        failedCount: 1,
        totalCount: 1,
        errors: [error.message]
      });
      setShowResults(true);
    } finally {
      setIsImporting(false);
    }
  };

  const handleExportCsv = async () => {
    if (!hasPermission) return;

    setIsExporting(true);
    try {
      const token = Cookies.get('authToken');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/modules/export/csv/${projectId}`, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `modules_functions_project_${projectId}_${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('CSV export error:', error);
      alert('Failed to export CSV file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportExcel = async () => {
    if (!hasPermission) return;

    setIsExporting(true);
    try {
      const token = Cookies.get('authToken');
      const headers = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`${API_BASE_URL}/modules/export/excel/${projectId}`, {
        headers: headers
      });
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `modules_functions_project_${projectId}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Excel export error:', error);
      alert('Failed to export Excel file');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownloadTemplate = (format) => {
    if (format === 'csv') {
      // Download the existing CSV template from public folder
      const a = document.createElement('a');
      a.href = '/module_template.csv';
      a.download = 'module_template.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    } else if (format === 'xlsx') {
      // Download the existing Excel template from public folder
      const a = document.createElement('a');
      a.href = '/module_template.xlsx';
      a.download = 'module_template.xlsx';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    setImportResults(null);
    setShowResults(false);
    onClose();
  };

  if (!isOpen) return null;

  if (!hasPermission) {
    return (
      <div className={styles.overlay}>
        <div className={styles.modal}>
          <div className={styles.header}>
            <h2 className={styles.title}>Access Denied</h2>
            <button className={styles.closeBtn} onClick={handleClose}>×</button>
          </div>
          <div className={styles.content}>
            <p>Only Administrators and Project Managers can import/export module data.</p>
            <div className={styles.actions}>
              <button className={styles.cancelBtn} onClick={handleClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.header}>
          <h2 className={styles.title}>Import/Export Modules & Functions</h2>
          <button className={styles.closeBtn} onClick={handleClose}>×</button>
        </div>

        <div className={styles.content}>
          {!showResults ? (
            <>
              {/* Template Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>📋 Download Templates</h3>
                <p className={styles.sectionDescription}>
                  Download a template file to see the required format for importing modules and functions.
                </p>
                <div className={styles.templateActions}>
                  <button 
                    className={styles.templateBtn}
                    onClick={() => handleDownloadTemplate('csv')}
                  >
                    📄 Download CSV Template
                  </button>
                  <button 
                    className={styles.templateBtn}
                    onClick={() => handleDownloadTemplate('xlsx')}
                  >
                    📊 Download Excel Template
                  </button>
                </div>
              </div>

              {/* Required Columns Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>📝 Required Columns</h3>
                <div className={styles.columnsGrid}>
                  <div className={styles.columnGroup}>
                    <h4>Module Information</h4>
                    <ul>
                      <li><strong>module_name</strong> - Name of the module</li>
                      <li><strong>module_description</strong> - Description of the module</li>
                      <li><strong>module_owner_intern_code</strong> - Intern code of module owner</li>
                      <li><strong>module_status</strong> - NOT_STARTED, IN_PROGRESS, or COMPLETED</li>
                    </ul>
                  </div>
                  <div className={styles.columnGroup}>
                    <h4>Function Information</h4>
                    <ul>
                      <li><strong>function_name</strong> - Name of the function</li>
                      <li><strong>function_description</strong> - Description of the function</li>
                      <li><strong>function_developer_intern_code</strong> - Intern code of function developer</li>
                      <li><strong>function_status</strong> - PENDING, IN_DEVELOPMENT, or COMPLETED</li>
                    </ul>
                  </div>
                </div>
                <div className={styles.importantNote}>
                  <strong>⚠️ Important:</strong> Only interns who are part of teams assigned to this project can be assigned as module owners or function developers.
                </div>
              </div>

              {/* Import Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>📤 Import Data</h3>
                <p className={styles.sectionDescription}>
                  Upload a CSV or Excel file containing modules and functions data.
                </p>
                <div className={styles.fileUpload}>
                  <input
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    className={styles.fileInput}
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className={styles.fileLabel}>
                    {selectedFile ? selectedFile.name : 'Choose file...'}
                  </label>
                </div>
                
                {selectedFile && (
                  <div className={styles.selectedFile}>
                    <span className={styles.fileName}>📁 {selectedFile.name}</span>
                    <span className={styles.fileSize}>
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                )}
              </div>

              {/* Export Section */}
              <div className={styles.section}>
                <h3 className={styles.sectionTitle}>📥 Export Current Data</h3>
                <p className={styles.sectionDescription}>
                  Export existing modules and functions for this project.
                </p>
                <div className={styles.exportActions}>
                  <button 
                    className={styles.exportBtn}
                    onClick={handleExportCsv}
                    disabled={isExporting}
                  >
                    {isExporting ? '⏳ Exporting...' : '📄 Export as CSV'}
                  </button>
                  <button 
                    className={styles.exportBtn}
                    onClick={handleExportExcel}
                    disabled={isExporting}
                  >
                    {isExporting ? '⏳ Exporting...' : '📊 Export as Excel'}
                  </button>
                </div>
              </div>

              <div className={styles.actions}>
                <button 
                  className={styles.importBtn}
                  onClick={handleImport}
                  disabled={!selectedFile || isImporting}
                >
                  {isImporting ? '⏳ Importing...' : '📤 Import Data'}
                </button>
                <button className={styles.cancelBtn} onClick={handleClose}>
                  Cancel
                </button>
              </div>
            </>
          ) : (
            /* Results Section */
            <div className={styles.resultsSection}>
              <h3 className={styles.sectionTitle}>
                {importResults.successCount > 0 ? '✅ Import Completed' : '❌ Import Failed'}
              </h3>
              
              <div className={styles.resultsSummary}>
                <div className={styles.resultsGrid}>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Total Processed:</span>
                    <span className={styles.resultValue}>{importResults.totalCount}</span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Successful:</span>
                    <span className={`${styles.resultValue} ${styles.success}`}>
                      {importResults.successCount}
                    </span>
                  </div>
                  <div className={styles.resultItem}>
                    <span className={styles.resultLabel}>Failed:</span>
                    <span className={`${styles.resultValue} ${styles.error}`}>
                      {importResults.failedCount}
                    </span>
                  </div>
                </div>
              </div>

              {importResults.errors && importResults.errors.length > 0 && (
                <div className={styles.errorsSection}>
                  <h4 className={styles.errorsTitle}>❌ Errors:</h4>
                  <div className={styles.errorsList}>
                    {importResults.errors.map((error, index) => (
                      <div key={index} className={styles.errorItem}>
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className={styles.actions}>
                <button className={styles.doneBtn} onClick={handleClose}>
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModuleBulkImport;
