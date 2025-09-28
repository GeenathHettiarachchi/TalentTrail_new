import React from 'react';
import styles from './TestCaseTable.module.css';

const TestCaseTable = ({ 
  testCases, 
  onEdit, 
  onDelete, 
  onCreateTestCase,
  functionId,
  teamMembers = []
}) => {

  const getStatusBadge = (status) => {
    const statusClasses = {
      NOT_RUN: styles.statusNotRun,
      PASS: styles.statusPass,
      FAIL: styles.statusFail
    };

    const statusLabels = {
      NOT_RUN: 'Not Run',
      PASS: 'Pass',
      FAIL: 'Fail'
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!testCases || testCases.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🧪</div>
        <p className={styles.emptyText}>No test cases found for this function.</p>
        <button 
          className={styles.createBtn}
          onClick={onCreateTestCase}
        >
          + Create Test Case
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h6 className={styles.title}>Test Cases ({testCases.length})</h6>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Test Case Name</th>
              <th>Description</th>
              <th>Status</th>
              <th>Created By</th>
              <th>Executed By</th>
              <th>Execution Date</th>
              <th>Automated</th>
              <th width="100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {testCases.map(testCase => (
              <tr key={testCase.testCaseId} className={styles.testCaseRow}>
                <td>
                  <div className={styles.testCaseName}>{testCase.testCaseName}</div>
                </td>
                <td>
                  <div className={styles.description}>
                    {testCase.description || 'No description'}
                  </div>
                </td>
                <td>
                  {getStatusBadge(testCase.status)}
                </td>
                <td>
                  <span className={styles.person}>
                    {testCase.createdByInternName || 'Not set'}
                  </span>
                </td>
                <td>
                  <span className={styles.person}>
                    {testCase.executedByInternName || 'Not executed'}
                  </span>
                </td>
                <td>
                  <span className={styles.date}>
                    {formatDate(testCase.executionDate)}
                  </span>
                </td>
                <td>
                  <span className={`${styles.automatedBadge} ${testCase.isAutomated ? styles.automated : styles.manual}`}>
                    {testCase.isAutomated ? 'Auto' : 'Manual'}
                  </span>
                </td>
                <td>
                  <div className={styles.actions}>
                    <button
                      className={styles.editBtn}
                      onClick={() => onEdit(testCase)}
                      title="Edit test case"
                    >
                      ✏️
                    </button>
                    <button
                      className={styles.deleteBtn}
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete test case "${testCase.testCaseName}"?`)) {
                          onDelete(testCase.testCaseId);
                        }
                      }}
                      title="Delete test case"
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TestCaseTable;
