import React, { useState } from 'react';
import { functionService } from '../../services/api';
import FunctionTable from '../FunctionTable/FunctionTable';
import FunctionForm from '../FunctionForm/FunctionForm';
import styles from './ModuleTable.module.css';

const ModuleTable = ({ 
  modules, 
  onEdit, 
  onDelete, 
  onCreateModule,
  teamMembers = [],
  assignedTeam = null,
  loading = false 
}) => {
  const [expandedModules, setExpandedModules] = useState(new Set());
  const [moduleFunctions, setModuleFunctions] = useState({});
  const [loadingFunctions, setLoadingFunctions] = useState({});
  const [showFunctionForm, setShowFunctionForm] = useState(false);
  const [editingFunction, setEditingFunction] = useState(null);
  const [currentModuleId, setCurrentModuleId] = useState(null);

  const toggleModule = async (moduleId) => {
    const newExpanded = new Set(expandedModules);
    
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId);
    } else {
      newExpanded.add(moduleId);
      // Load functions if not already loaded
      if (!moduleFunctions[moduleId]) {
        await loadFunctions(moduleId);
      }
    }
    
    setExpandedModules(newExpanded);
  };

  const loadFunctions = async (moduleId) => {
    try {
      setLoadingFunctions(prev => ({ ...prev, [moduleId]: true }));
      const response = await functionService.getFunctionsByModuleId(moduleId);
      setModuleFunctions(prev => ({ ...prev, [moduleId]: response.data }));
    } catch (error) {
      console.error('Error loading functions:', error);
    } finally {
      setLoadingFunctions(prev => ({ ...prev, [moduleId]: false }));
    }
  };

  const handleCreateFunction = (moduleId) => {
    setCurrentModuleId(moduleId);
    setEditingFunction(null);
    setShowFunctionForm(true);
  };

  const handleEditFunction = (func) => {
    setCurrentModuleId(func.moduleId);
    setEditingFunction(func);
    setShowFunctionForm(true);
  };

  const handleFunctionSubmit = async (functionData) => {
    try {
      if (editingFunction) {
        // Update existing function
        const response = await functionService.updateFunction(editingFunction.functionId, functionData);
        setModuleFunctions(prev => ({
          ...prev,
          [currentModuleId]: prev[currentModuleId].map(f => 
            f.functionId === editingFunction.functionId ? response.data : f
          )
        }));
      } else {
        // Create new function
        const response = await functionService.createFunction(functionData);
        setModuleFunctions(prev => ({
          ...prev,
          [currentModuleId]: [...(prev[currentModuleId] || []), response.data]
        }));
      }
      setShowFunctionForm(false);
      setEditingFunction(null);
      setCurrentModuleId(null);
    } catch (error) {
      console.error('Error saving function:', error);
      throw error; // Let the form handle the error
    }
  };

  const handleDeleteFunction = async (functionId, moduleId) => {
    try {
      await functionService.deleteFunction(functionId);
      // Refresh functions for this module
      await loadFunctions(moduleId);
    } catch (error) {
      console.error('Error deleting function:', error);
      alert('Failed to delete function. Please try again.');
    }
  };

  const getStatusBadge = (status) => {
    const statusClasses = {
      NOT_STARTED: styles.statusNotStarted,
      IN_PROGRESS: styles.statusInProgress,
      COMPLETED: styles.statusCompleted
    };

    const statusLabels = {
      NOT_STARTED: 'Not Started',
      IN_PROGRESS: 'In Progress',
      COMPLETED: 'Completed'
    };

    return (
      <span className={`${styles.statusBadge} ${statusClasses[status] || ''}`}>
        {statusLabels[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading modules...</p>
      </div>
    );
  }

  if (!modules || modules.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>📦</div>
        <h4 className={styles.emptyTitle}>No Modules Found</h4>
        <p className={styles.emptyText}>
          Create your first module to break down this project into manageable components.
        </p>
        <button 
          className={styles.createBtn}
          onClick={onCreateModule}
        >
          + Create Module
        </button>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button 
          className={styles.createBtn}
          onClick={onCreateModule}
        >
          + Create Module
        </button>
      </div>
      
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th width="50"></th>
              <th>Module Name</th>
              <th>Description</th>
              <th>Owner</th>
              <th>Status</th>
              <th width="100">Actions</th>
            </tr>
          </thead>
          <tbody>
            {modules.map(module => (
              <React.Fragment key={module.moduleId}>
                <tr className={styles.moduleRow}>
                  <td>
                    <div className={styles.controls}>
                      <button
                        className={styles.addBtn}
                        onClick={() => handleCreateFunction(module.moduleId)}
                        title="Add function"
                      >
                        +
                      </button>
                      <button
                        className={`${styles.expandBtn} ${expandedModules.has(module.moduleId) ? styles.expanded : ''}`}
                        onClick={() => toggleModule(module.moduleId)}
                        title={expandedModules.has(module.moduleId) ? 'Collapse' : 'Expand'}
                      >
                        ▶
                      </button>
                    </div>
                  </td>
                  <td>
                    <div className={styles.moduleName}>{module.moduleName}</div>
                  </td>
                  <td>
                    <div className={styles.description}>
                      {module.description || 'No description'}
                    </div>
                  </td>
                  <td>
                    <span className={styles.owner}>
                      {module.ownerInternName || 'Not assigned'}
                    </span>
                  </td>
                  <td>
                    {getStatusBadge(module.status)}
                  </td>
                  <td>
                    <div className={styles.actions}>
                      <button
                        className={styles.editBtn}
                        onClick={() => onEdit(module)}
                        title="Edit module"
                      >
                        ✏️
                      </button>
                      <button
                        className={styles.deleteBtn}
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete module "${module.moduleName}"?`)) {
                            onDelete(module.moduleId);
                          }
                        }}
                        title="Delete module"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
                
                {expandedModules.has(module.moduleId) && (
                  <tr className={styles.nestedRow}>
                    <td colSpan="6" className={styles.nestedContent}>
                      {loadingFunctions[module.moduleId] ? (
                        <div className={styles.nestedLoading}>
                          <div className={styles.spinner}></div>
                          <span>Loading functions...</span>
                        </div>
                      ) : (
                        <FunctionTable
                          functions={moduleFunctions[module.moduleId] || []}
                          onEdit={handleEditFunction}
                          onDelete={(functionId) => handleDeleteFunction(functionId, module.moduleId)}
                          onCreateFunction={() => handleCreateFunction(module.moduleId)}
                          moduleId={module.moduleId}
                          teamMembers={teamMembers}
                          assignedTeam={assignedTeam}
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

      <FunctionForm
        func={editingFunction}
        moduleId={currentModuleId}
        teamMembers={teamMembers}
        assignedTeam={assignedTeam}
        onSubmit={handleFunctionSubmit}
        onCancel={() => {
          setShowFunctionForm(false);
          setEditingFunction(null);
          setCurrentModuleId(null);
        }}
        isOpen={showFunctionForm}
      />
    </div>
  );
};

export default ModuleTable;
