'use client';

import { useEffect, useState } from 'react';
import styles from './digilocker.module.css';

interface Document {
  id: string;
  name: string;
  type: string;
  fileUrl: string;
  size?: number;
  isVerified: boolean;
  expiryDate?: string;
  uploadedAt: string;
}

const documentTypes = [
  'Aadhaar Card',
  'PAN Card',
  'Passport',
  'Driving License',
  'Mark Sheet',
  'Degree Certificate',
  'Birth Certificate',
  'Other'
];

export default function DigiLockerPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Other',
    fileUrl: '',
    size: '',
    expiryDate: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const res = await fetch('/api/student/documents');
      if (res.ok) {
        const data = await res.json();
        setDocuments(data.documents);
      }
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.fileUrl) {
      alert('Please fill in document name and file URL');
      return;
    }

    setSubmitting(true);

    try {
      const payload: any = {
        name: formData.name,
        type: formData.type,
        fileUrl: formData.fileUrl,
      };

      if (formData.size) {
        payload.size = parseInt(formData.size);
      }

      if (formData.expiryDate) {
        payload.expiryDate = new Date(formData.expiryDate).toISOString();
      }

      const url = editingDoc 
        ? `/api/student/documents/${editingDoc.id}`
        : '/api/student/documents';
      
      const method = editingDoc ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        await fetchDocuments();
        setShowModal(false);
        setEditingDoc(null);
        setFormData({
          name: '',
          type: 'Other',
          fileUrl: '',
          size: '',
          expiryDate: ''
        });
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to save document');
      }
    } catch (error) {
      console.error('Error saving document:', error);
      alert('Failed to save document');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
    setFormData({
      name: doc.name,
      type: doc.type,
      fileUrl: doc.fileUrl,
      size: doc.size?.toString() || '',
      expiryDate: doc.expiryDate ? doc.expiryDate.split('T')[0] : ''
    });
    setShowModal(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      const res = await fetch(`/api/student/documents/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        await fetchDocuments();
      } else {
        alert('Failed to delete document');
      }
    } catch (error) {
      console.error('Error deleting document:', error);
      alert('Failed to delete document');
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingDoc(null);
    setFormData({
      name: '',
      type: 'Other',
      fileUrl: '',
      size: '',
      expiryDate: ''
    });
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return 'Unknown';
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const filteredDocuments = filterType === 'all' 
    ? documents 
    : documents.filter(doc => doc.type === filterType);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading documents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div>
          <h1>DigiLocker</h1>
          <p className={styles.subtitle}>
            Securely store and manage your important documents
          </p>
        </div>
        <button onClick={() => setShowModal(true)} className={styles.addBtn}>
          + Upload Document
        </button>
      </div>

      <div className={styles.filters}>
        <button
          onClick={() => setFilterType('all')}
          className={`${styles.filterBtn} ${filterType === 'all' ? styles.active : ''}`}
        >
          All ({documents.length})
        </button>
        {documentTypes.filter(type => documents.some(doc => doc.type === type)).map(type => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`${styles.filterBtn} ${filterType === type ? styles.active : ''}`}
          >
            {type} ({documents.filter(doc => doc.type === type).length})
          </button>
        ))}
      </div>

      {filteredDocuments.length === 0 ? (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}>📄</div>
          <p>No documents found</p>
          <button onClick={() => setShowModal(true)} className={styles.emptyBtn}>
            Upload your first document
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filteredDocuments.map(doc => (
            <div key={doc.id} className={styles.card}>
              <div className={styles.cardHeader}>
                <span className={styles.typeBadge}>{doc.type}</span>
                <div className={styles.statusBadges}>
                  {doc.isVerified && (
                    <span className={styles.verifiedBadge}>✓ Verified</span>
                  )}
                  {isExpired(doc.expiryDate) && (
                    <span className={styles.expiredBadge}>Expired</span>
                  )}
                </div>
              </div>

              <h3 className={styles.docName}>{doc.name}</h3>

              <div className={styles.docInfo}>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Size:</span>
                  <span>{formatFileSize(doc.size)}</span>
                </div>
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Uploaded:</span>
                  <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                </div>
                {doc.expiryDate && (
                  <div className={styles.infoItem}>
                    <span className={styles.infoLabel}>Expires:</span>
                    <span className={isExpired(doc.expiryDate) ? styles.expired : ''}>
                      {new Date(doc.expiryDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              <div className={styles.actions}>
                <a 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={styles.viewBtn}
                >
                  View
                </a>
                <button 
                  onClick={() => handleEdit(doc)}
                  className={styles.editBtn}
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDelete(doc.id)}
                  className={styles.deleteBtn}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className={styles.modalOverlay} onClick={handleModalClose}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>{editingDoc ? 'Edit Document' : 'Upload Document'}</h2>
              <button onClick={handleModalClose} className={styles.closeBtn}>×</button>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.formGroup}>
                <label>Document Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., My Aadhaar Card"
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Document Type *</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  required
                >
                  {documentTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>File URL *</label>
                <input
                  type="url"
                  value={formData.fileUrl}
                  onChange={(e) => setFormData({ ...formData, fileUrl: e.target.value })}
                  placeholder="https://example.com/document.pdf"
                  required
                  disabled={!!editingDoc}
                />
                {editingDoc && (
                  <small className={styles.hint}>File URL cannot be changed</small>
                )}
              </div>

              <div className={styles.formGroup}>
                <label>File Size (bytes)</label>
                <input
                  type="number"
                  value={formData.size}
                  onChange={(e) => setFormData({ ...formData, size: e.target.value })}
                  placeholder="Optional"
                />
              </div>

              <div className={styles.formGroup}>
                <label>Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                />
              </div>

              <div className={styles.modalActions}>
                <button type="button" onClick={handleModalClose} className={styles.cancelBtn}>
                  Cancel
                </button>
                <button type="submit" disabled={submitting} className={styles.submitBtn}>
                  {submitting ? 'Saving...' : editingDoc ? 'Update' : 'Upload'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
