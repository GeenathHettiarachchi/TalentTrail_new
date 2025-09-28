import React, { useState, useEffect, useRef } from 'react';
import { projectDocService } from '../../services/api';
import { useAuth } from '../../contexts/AuthContext';
import { FiUpload, FiDownload, FiTrash2, FiFileText, FiFilePlus } from 'react-icons/fi';
import styles from './DocumentationSection.module.css';

const DocumentationSection = ({ projectId }) => {
  const { isAdmin, canEditProject, user } = useAuth();
  const [documents, setDocuments] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState({});
  const [canEdit, setCanEdit] = useState(false);
  const fileInputRefs = useRef({});

  const documentTypes = [
    { key: 'BRD', label: 'Business Requirement Document', shortLabel: 'BRD' },
    { key: 'LLD', label: 'Low Level Diagram', shortLabel: 'LLD' },
    { key: 'HLD', label: 'High Level Diagram', shortLabel: 'HLD' },
    { key: 'DAD', label: 'Deployment Architecture Diagram', shortLabel: 'DAD' }
  ];

  useEffect(() => {
    fetchDocuments();
    checkEditPermissions();
  }, [projectId, user]);

  const checkEditPermissions = async () => {
    if (isAdmin) {
      setCanEdit(true);
      return;
    }
    
    try {
      const hasPermission = await canEditProject(projectId);
      setCanEdit(hasPermission);
    } catch (error) {
      console.error('Error checking edit permissions:', error);
      setCanEdit(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await projectDocService.getProjectDocuments(projectId);
      const docsMap = {};
      response.data.forEach(doc => {
        docsMap[doc.docType] = doc;
      });
      setDocuments(docsMap);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (docType, file) => {
    if (!file) return;
    
    // Validate file type
    const allowedTypes = ['application/pdf', 'image/png', 'image/jpeg', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, PNG, JPG, and JPEG files are allowed.');
      return;
    }
    
    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      alert('File size must be less than 10MB.');
      return;
    }
    
    uploadDocument(docType, file);
  };

  const uploadDocument = async (docType, file) => {
    try {
      setUploading(prev => ({ ...prev, [docType]: true }));
      const response = await projectDocService.uploadDocument(projectId, docType, file);
      setDocuments(prev => ({ ...prev, [docType]: response.data }));
      
      // Reset file input
      if (fileInputRefs.current[docType]) {
        fileInputRefs.current[docType].value = '';
      }
      
      alert(`${docType} document uploaded successfully!`);
    } catch (error) {
      console.error('Error uploading document:', error);
      let errorMessage = 'Failed to upload document. Please try again.';
      
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400) {
        errorMessage = 'Invalid file or request. Please check file type and size.';
      } else if (error.response?.status === 500) {
        errorMessage = 'Server error. Please try with a smaller file or contact support.';
      }
      
      alert(errorMessage);
    } finally {
      setUploading(prev => ({ ...prev, [docType]: false }));
    }
  };

  const downloadDocument = async (docData) => {
    try {
      const response = await projectDocService.downloadDocument(projectId, docData.id);
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = docData.fileName || `${docData.docType}_document`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading document:', error);
      alert('Failed to download document. Please try again.');
    }
  };

  const deleteDocument = async (docType) => {
    if (!window.confirm(`Are you sure you want to delete the ${docType} document?`)) {
      return;
    }
    
    try {
      await projectDocService.deleteDocument(projectId, docType);
      setDocuments(prev => {
        const updated = { ...prev };
        delete updated[docType];
        return updated;
      });
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document. Please try again.');
    }
  };

  const handleUploadClick = (docType) => {
    if (fileInputRefs.current[docType]) {
      fileInputRefs.current[docType].click();
    }
  };

  if (loading) {
    return (
      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>Project Documentation</h3>
        <div className={styles.loading}>Loading documents...</div>
      </div>
    );
  }

  return (
    <div className={styles.section}>
      <h3 className={styles.sectionTitle}>Project Documentation</h3>
      <div className={styles.documentsGrid}>
        {documentTypes.map(({ key, label, shortLabel }) => {
          const document = documents[key];
          const isUploading = uploading[key];
          
          return (
            <div key={key} className={styles.documentSlot}>
              {document ? (
                // Document exists - show download button with delete option
                <div className={styles.documentCard}>
                  {canEdit && (
                    <button
                      className={styles.deleteBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteDocument(key);
                      }}
                      title={`Delete ${label}`}
                    >
                      <FiTrash2 />
                    </button>
                  )}
                  
                  <div className={styles.documentContent}>
                    <div className={styles.documentIcon}>
                      <FiFileText />
                    </div>
                    <div className={styles.documentDetails}>
                      <div className={styles.documentType}>{shortLabel}</div>
                      <div className={styles.documentName}>{document.fileName}</div>
                      <div className={styles.documentSize}>
                        {(document.fileSize / 1024).toFixed(1)} KB
                      </div>
                    </div>
                    
                    <button
                      className={styles.downloadBtn}
                      onClick={() => downloadDocument(document)}
                      title={`Download ${label}`}
                    >
                      <FiDownload />
                      Download {shortLabel}
                    </button>
                  </div>
                </div>
              ) : (
                // No document - show upload slot
                <div className={styles.uploadSlot}>
                  <div className={styles.uploadContent}>
                    <div className={styles.uploadIcon}>
                      <FiFilePlus />
                    </div>
                    <div className={styles.uploadText}>
                      <div className={styles.uploadTitle}>{shortLabel}</div>
                      <div className={styles.uploadSubtitle}>{label}</div>
                      {canEdit ? (
                        <div className={styles.uploadHint}>
                          {/* Click to upload PDF, PNG, JPG, or JPEG */}
                          PDF, PNG, JPG, or JPEG (Max 10MB)
                        </div>
                      ) : (
                        <div className={styles.uploadHint}>No document uploaded</div>
                      )}
                    </div>
                    
                    {canEdit && (
                      <>
                        <input
                          ref={el => fileInputRefs.current[key] = el}
                          type="file"
                          accept=".pdf,.png,.jpg,.jpeg"
                          style={{ display: 'none' }}
                          onChange={(e) => handleFileSelect(key, e.target.files[0])}
                        />
                        <button
                          className={styles.uploadBtn}
                          onClick={() => handleUploadClick(key)}
                          disabled={isUploading}
                        >
                          {isUploading ? (
                            <>Uploading...</>
                          ) : (
                            <>
                              <FiUpload />
                              Upload {shortLabel}
                            </>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentationSection;
