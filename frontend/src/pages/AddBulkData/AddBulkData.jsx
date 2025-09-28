import React, { useState } from 'react';
import { bulkImportService } from '../../services/api';
import styles from './AddBulkData.module.css';

const AddBulkData = () => {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && (
        selectedFile.type === 'text/csv' || 
        selectedFile.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
        selectedFile.name.toLowerCase().endsWith('.csv') ||
        selectedFile.name.toLowerCase().endsWith('.xlsx')
    )) {
      setFile(selectedFile);
      setError('');
    } else {
      setError('Please select a valid CSV or Excel (.xlsx) file');
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    try {
      setUploading(true);
      setError('');
      
      const response = await bulkImportService.uploadBulkData(file);
      setResults({
        success: response.data.successCount,
        failed: response.data.failedCount,
        total: response.data.totalCount,
        errors: response.data.errors
      });
    } catch (err) {
      console.error('Upload error:', err);
      setError(
        err.response?.data?.message || 
        'Upload failed. Please check your file format and try again.'
      );
    } finally {
      setUploading(false);
    }
  };

  const downloadTemplate = () => {
    try {
      // Create a direct link to the template file in the public folder
      const link = document.createElement('a');
      link.href = '/data_template.csv';
      link.download = 'data_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download template. Please try again.');
    }
  };

  const downloadExcelTemplate = () => {
    try {
      // Create a direct link to the Excel template file in the public folder
      const link = document.createElement('a');
      link.href = '/data_template.xlsx';
      link.download = 'data_template.xlsx';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Download error:', err);
      setError('Failed to download Excel template. Please try again.');
    }
  };

  const columnDefinitions = [
    'intern_code - Unique identifier for each intern',
    'name - Full name of the intern',
    'email - Email address',
    'institute - Educational institution',
    'training_start_date - DD-MM-YYYY',
    'training_end_date - DD-MM-YYYY',
    'team_name - Name of the team',
    'team_leader_intern_code - Intern code of team leader',
    'project_name - Name of the project',
    'project_description - Project description',
    'project_status - Status (PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD)',
    'project_start_date - DD-MM-YYYY',
    'project_target_date - DD-MM-YYYY'
  ];

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Add Bulk Data</h1>
        <p className={styles.subtitle}>
          Upload a master CSV file to import interns, teams, and projects all at once
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

        <div className={styles.section}>
          <h3 className={styles.sectionTitle}>
            Upload Master Data File
          </h3>
          
          <div className={styles.templateSection}>
            <p className={styles.templateText}>
              Download a template file to ensure your data has the correct format:
            </p>
            <div className={styles.templateButtons}>
              <button 
                className={styles.templateBtn}
                onClick={downloadTemplate}
              >
                📥 Download CSV Template
              </button>
              <button 
                className={styles.templateBtn}
                onClick={downloadExcelTemplate}
              >
                📊 Download Excel Template
              </button>
            </div>
          </div>

          <div className={styles.formatInfo}>
            <h4>File Column Definitions:</h4>
            <div className={styles.columnList}>
              {columnDefinitions.map((column, index) => (
                <div key={index} className={styles.columnItem}>
                  {column}
                </div>
              ))}
            </div>
          </div>

          <div className={styles.uploadSection}>
            <div className={styles.fileInput}>
              <input
                type="file"
                accept=".csv,.xlsx"
                onChange={handleFileChange}
                className={styles.hiddenInput}
                id="dataFile"
              />
              <label htmlFor="dataFile" className={styles.fileLabel}>
                {file ? file.name : 'Choose CSV or Excel file...'}
              </label>
            </div>

            <button
              className={styles.uploadBtn}
              onClick={handleUpload}
              disabled={!file || uploading}
            >
              {uploading ? 'Uploading...' : 'Upload File'}
            </button>
          </div>

          {results && (
            <div className={styles.results}>
              <h4>Upload Results:</h4>
              <div className={styles.resultStats}>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{results.success}</span>
                  <span className={styles.statLabel}>Successful</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{results.failed}</span>
                  <span className={styles.statLabel}>Failed</span>
                </div>
                <div className={styles.stat}>
                  <span className={styles.statNumber}>{results.total}</span>
                  <span className={styles.statLabel}>Total</span>
                </div>
              </div>
              
              {results.errors && results.errors.length > 0 && (
                <div className={styles.errorsList}>
                  <h5>Errors:</h5>
                  <ul>
                    {results.errors.map((error, index) => (
                      <li key={index} className={styles.errorItem}>
                        {error}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        <div className={styles.instructions}>
          <h4>Instructions:</h4>
          <ol className={styles.instructionList}>
            <li>Download either the CSV or Excel template file using the buttons above</li>
            <li>Fill in your data following the exact column format</li>
            <li>For interns assigned to multiple teams/projects, add multiple rows with the same intern_code</li>
            <li>Save your file in CSV or Excel format</li>
            <li>Upload the file using the form above</li>
            <li>Review the results and fix any errors if needed</li>
          </ol>

          <div className={styles.note}>
            <strong>Important Notes:</strong>
            <ul>
              <li>Both CSV and Excel (.xlsx) files are supported</li>
              <li>If an intern, team, or project already exists, only new information will be added</li>
              <li>Interns can be assigned to multiple teams by having multiple rows with the same intern_code</li>
              <li>Team leaders must be defined as interns first (either in earlier rows or existing data)</li>
              <li>All date fields should be in YYYY-MM-DD format</li>
              <li>Project status must be one of: PLANNED, IN_PROGRESS, COMPLETED, ON_HOLD</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddBulkData;
