import React, { useState } from 'react';
import { testCaseService } from '../../services/api';
import TestCaseTable from '../TestCaseTable/TestCaseTable';
import TestCaseForm from '../TestCaseForm/TestCaseForm';
import styles from './FunctionTable.module.css';

const FunctionTable = ({ 
  functions, 
  onEdit, 
  onDelete, 
  onCreateFunction,
  moduleId,
  teamMembers = [],
  assignedTeam = null
}) => {
  const [expandedFunctions, setExpandedFunctions] = useState(new Set());
  const [functionTestCases, setFunctionTestCases] = useState({});
  const [loadingTestCases, setLoadingTestCases] = useState({});
  const [showTestCaseForm, setShowTestCaseForm] = useState(false);
  const [editingTestCase, setEditingTestCase] = useState(null);
  const [currentFunctionId, setCurrentFunctionId] = useState(null);

  const toggleFunction = async (functionId) => {
    const newExpanded = new Set(expandedFunctions);
    
    if (newExpanded.has(functionId)) {
      newExpanded.delete(functionId);
    } else {
      newExpanded.add(functionId);
      // Load test cases if not already loaded
      if (!functionTestCases[functionId]) {
        await loadTestCases(functionId);
      }
    }
    
    setExpandedFunctions(newExpanded);
  };

  const loadTestCases = async (functionId) => {
    try {
      setLoadingTestCases(prev => ({ ...prev, [functionId]: true }));
      const response = await testCaseService.getTestCasesByFunctionId(functionId);
      setFunctionTestCases(prev => ({ ...prev, [functionId]: response.data }));
    } catch (error) {
      console.error('Error loading test cases:', error);
    } finally {
      setLoadingTestCases(prev => ({ ...prev, [functionId]: false }));
    }
  };

  const handleCreateTestCase = (functionId) => {
    setCurrentFunctionId(functionId);
    setEditingTestCase(null);
    setShowTestCaseForm(true);
  };

  const handleEditTestCase = (testCase) => {
    setCurrentFunctionId(testCase.functionId);
    setEditingTestCase(testCase);
    setShowTestCaseForm(true);
  };

  const handleTestCaseSubmit = async (testCaseData) => {
    try {
      if (editingTestCase) {
        // Update existing test case
        const response = await testCaseService.updateTestCase(editingTestCase.testCaseId, testCaseData);
        setFunctionTestCases(prev => ({
          ...prev,
          [currentFunctionId]: prev[currentFunctionId].map(tc => 
            tc.testCaseId === editingTestCase.testCaseId ? response.data : tc
          )
        }));
      } else {
        // Create new test case
        const response = await testCaseService.createTestCase(testCaseData);
        setFunctionTestCases(prev => ({
          ...prev,
          [currentFunctionId]: [...(prev[currentFunctionId] || []), response.data]
        }));
      }
      setShowTestCaseForm(false);
      setEditingTestCase(null);
      setCurrentFunctionId(null);
    } catch (error) {
      console.error('Error saving test case:', error);
      throw error; // Let the form handle the error
    }
  };

  const handleDeleteTestCase = async (testCaseId, functionId) => {
    try {
      await testCaseService.deleteTestCase(testCaseId);
      // Refresh test cases for this function
      await loadTestCases(functionId);
    } catch (error) {
      console.error('Error deleting test case:', error);
      alert('Failed to delete test case. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      PENDING: styles.statusPending,
      IN_DEVELOPMENT: styles.statusInDevelopment,
      COMPLETED: styles.statusCompleted
    };

    const statusLabels = {
      PENDING: 'Pending',
      IN_DEVELOPMENT: 'In Development',
      COMPLETED: 'Completed'
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  if (!functions || functions.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>⚙️</div>
        <p className={styles.emptyText}>No functions found for this module.</p>
        <button 
          className={styles.createBtn}
          onClick={onCreateFunction}
        >
          + Create Function
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h5 className={styles.title}>Functions ({functions.length})</h5>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th width="50"></th>
              <th>Function Name</th>
              <th>Description</th>
              <th>Developer</th>
              <th>Status</th>
              <th width="100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {functions.map(func => (
              <React.Fragment key={func.functionId}>
                <tr className={styles.functionRow}>
                  <td>
                    <div className={styles.controls}>
                      <button
                        className={styles.addBtn}
                        onClick={() => handleCreateTestCase(func.functionId)}
                        title="Add test case"
                      >
                        +
                      </button>
                      <button
                        className={`${styles.expandBtn} ${expandedFunctions.has(func.functionId) ? styles.expanded : ''}`}
                        onClick={() => toggleFunction(func.functionId)}
                        title={expandedFunctions.has(func.functionId) ? 'Collapse' : 'Expand'}
                      >
                        ▶
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className={styles.functionName}>{func.functionName}</div>
                  </td>
                  <td>
                    <div className={styles.description}>
                      {func.description || 'No description'}
                    </div>
                  </td>
                  <td>
                    <span className={styles.developer}>
                      {func.developerInternName || 'Not assigned'}
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(func.status)}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => onEdit(func)}
                        title="Edit function"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete function "${func.functionName}"?`)) {
                            onDelete(func.functionId);
                          }
                        }}
                        title="Delete function"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                
                {expandedFunctions.has(func.functionId) && (
                  <tr className={styles.nestedRow}>
                    <td colSpan="6" className={styles.nestedContent}>
                      {loadingTestCases[func.functionId] ? (
                        <div className={styles.nestedLoading}>
                          <div className={styles.spinner}></div>
                          <span>Loading test cases...</span>
                        </div>
                      ) : (
                        <TestCaseTable
                          testCases={functionTestCases[func.functionId] || []}
                          onEdit={handleEditTestCase}
                          onDelete={(testCaseId) => handleDeleteTestCase(testCaseId, func.functionId)}
                          onCreateTestCase={() => handleCreateTestCase(func.functionId)}
                          functionId={func.functionId}
                          teamMembers={teamMembers}
                        />
                      )}
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>

      <TestCaseForm
        testCase={editingTestCase}
        functionId={currentFunctionId}
        teamMembers={teamMembers}
        assignedTeam={assignedTeam}
        onSubmit={handleTestCaseSubmit}
        onCancel={() => {
          setShowTestCaseForm(false);
          setEditingTestCase(null);
          setCurrentFunctionId(null);
        }}
        isOpen={showTestCaseForm}
      />
    </div>
  );
};

export default FunctionTable;
