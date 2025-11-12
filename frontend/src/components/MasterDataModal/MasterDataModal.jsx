import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { masterDataService } from '../../services/api';
import { FiX, FiPlus, FiTrash2, FiEdit, FiCheck } from 'react-icons/fi';
import styles from './MasterDataModal.module.css';

const MasterDataModal = ({ isOpen, onClose, category, title }) => {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [editingItemId, setEditingItemId] = useState(null);
  const [editingItemName, setEditingItemName] = useState('');

  // Fetch all items (active and inactive) for this category
  const fetchItems = async () => {
    if (!category) return;
    setIsLoading(true);
    setError('');
    try {
      const response = await masterDataService.getAllItemsByCategory(category);
      setItems(response.data);
    } catch (err) {
      console.error('Failed to fetch master data', err);
      setError('Could not load data. ' + (err.response?.data?.message || ''));
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch data when the modal opens
  useEffect(() => {
    if (isOpen) {
      fetchItems();
    } else {
      // Reset state on close
      setNewItemName('');
      setError('');
      setEditingItemId(null);
    }
  }, [isOpen, category]);

  const handleAddItem = async (e) => {
    e.preventDefault();
    const trimmedName = newItemName.trim();
    if (!trimmedName) return;

    const tempId = Date.now();
    const formattedName = trimmedName.charAt(0).toUpperCase() + trimmedName.slice(1).toLowerCase();
    const newItem = { id: tempId, itemName: formattedName, isActive: true, isOptimistic: true };

    setItems(prev => [newItem, ...prev]);
    setNewItemName('');
    setError('');
    
    try {
      await masterDataService.createItem(category, trimmedName);
      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error('Failed to add item', err);
      setError(err.response?.data?.message || 'Failed to add item.');
      setItems(prev => prev.filter(item => item.id !== tempId));
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Are you sure you want to archive this item? It will be hidden from new interns.')) {
      return;
    }

    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, isActive: false, isOptimistic: true } : item
    ));
    setError('');
    
    try {
      await masterDataService.deleteItem(id);
      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error('Failed to delete item', err);
      setError(err.response?.data?.message || 'Failed to delete item.');
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, isActive: true, isOptimistic: false } : item
      ));
    }
  };

  const handleReactivateItem = async (id) => {
    setError('');
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, active: true, isOptimistic: true } : item
    ));

    try {
      await masterDataService.reactivateItem(id);
      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error('Failed to reactivate item', err);
      setError(err.response?.data?.message || 'Failed to reactivate item.');
      setItems(prev => prev.map(item => 
        item.id === id ? { ...item, active: false, isOptimistic: false } : item
      ));
    }
  };

  const startEdit = (item) => {
    setEditingItemId(item.id);
    setEditingItemName(item.itemName);
    setError('');
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setEditingItemName('');
  };

  const handleUpdateItem = async (id) => {
    const trimmedName = editingItemName.trim();
    if (!trimmedName) return;

    const originalItem = items.find(item => item.id === id);
    
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, itemName: trimmedName, isOptimistic: true } : item
    ));
    cancelEdit();
    setError('');

    try {
      await masterDataService.updateItem(id, trimmedName);
      await fetchItems(); // Refresh the list
    } catch (err) {
      console.error('Failed to update item', err);
      setError(err.response?.data?.message || 'Failed to update item.');
      setItems(prev => prev.map(item => 
        item.id === id ? originalItem : item
      ));
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2 className={styles.title}>{title}</h2>
          <button className={styles.closeButton} onClick={onClose} aria-label="Close">
            <FiX />
          </button>
        </div>

        {error && <div className={styles.errorAlert}>{error}</div>}

        {/* --- Add New Item Form --- */}
        <form className={styles.addForm} onSubmit={handleAddItem}>
          <input
            type="text"
            className={styles.input}
            value={newItemName}
            onChange={(e) => setNewItemName(e.target.value)}
            placeholder="Add new item name..."
          />
          <button type="submit" className={styles.addButton} title="Add New Item">
            <FiPlus />
          </button>
        </form>

        {/* --- List of Items --- */}
        <div className={styles.itemList}>
          {isLoading ? (
            <div className={styles.loadingState}>
              <div className={styles.spinner}></div>
              <span>Loading...</span>
            </div>
          ) : (
            items.map((item) => (
              <div 
                key={item.id} 
                className={`${styles.itemRow} ${!item.active ? styles.itemArchived : ''} ${item.isOptimistic ? styles.itemOptimistic : ''}`}
              >
                {editingItemId === item.id ? (
                  // --- Edit View ---
                  <div className={styles.editForm}>
                    <input
                      type="text"
                      className={styles.editInput}
                      value={editingItemName}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleUpdateItem(item.id);
                        if (e.key === 'Escape') cancelEdit();
                      }}
                      onChange={(e) => setEditingItemName(e.target.value)}
                    />
                    <div className={styles.itemActions}>
                      <button
                        className={`${styles.actionButton} ${styles.saveButton}`}
                        onClick={() => handleUpdateItem(item.id)}
                        title="Save"
                      >
                        <FiCheck />
                      </button>
                      <button
                        className={`${styles.actionButton} ${styles.cancelButton}`}
                        onClick={cancelEdit}
                        title="Cancel"
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                ) : (
                  // --- Default View ---
                  <>
                    <span className={styles.itemName}>{item.itemName}</span>
                    {!item.active && (
                      <span className={styles.archivedBadge}>Archived</span>
                    )}

                    <div className={styles.itemActions}>
                      {item.active ? (
                        // --- Active State: Show Edit/Delete ---
                        <>
                          <button
                            className={`${styles.actionButton} ${styles.editButton}`}
                            onClick={() => startEdit(item)}
                            title="Edit"
                          >
                            <FiEdit />
                          </button>
                          <button
                            className={`${styles.actionButton} ${styles.deleteButton}`}
                            onClick={() => handleDeleteItem(item.id)}
                            title="Delete (Archive)"
                          >
                            <FiTrash2 />
                          </button>
                        </>
                      ) : (
                        // --- Archived State: Show Reactivate ---
                        <button
                          className={`${styles.actionButton} ${styles.reactivateButton}`}
                          onClick={() => handleReactivateItem(item.id)}
                          title="Reactivate Item"
                        >
                          <FiCheck /> {/* Or <FiRefreshCcw /> */}
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            ))
          )}
          {!isLoading && items.length === 0 && <p className={styles.emptyState}>No items found.</p>}
        </div>
      </div>
    </div>,
    document.body
  );
};

export default MasterDataModal;