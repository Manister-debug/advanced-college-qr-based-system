import React, { useState, useEffect } from 'react';
import './ViewProfessors.css';

// Firestore
import { db } from "../../firebase";
import { collection, getDocs } from "firebase/firestore";
import { doc, deleteDoc } from "firebase/firestore";

export default function ViewProfessors() {
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    specialization: 'all'
  });
  const [loading, setLoading] = useState(true);

  // ⭐ جلب الأساتذة من Firestore
  useEffect(() => {
    const fetchProfessors = async () => {
      try {
        const snapshot = await getDocs(collection(db, "professors"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        setProfessors(data);
        setFilteredProfessors(data);
      } catch (err) {
        console.error("Error loading professors:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchProfessors();
  }, []);

  // ⭐ فلترة الأساتذة
  useEffect(() => {
    let result = professors;

    if (filters.type !== 'all') {
      result = result.filter(prof => prof.type === filters.type);
    }

    if (filters.specialization !== 'all') {
      result = result.filter(prof => prof.specialization === filters.specialization);
    }

    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(prof =>
        prof.name.toLowerCase().includes(term) ||
        prof.specialization.toLowerCase().includes(term) ||
        prof.email.toLowerCase().includes(term) ||
        prof.phone.includes(term)
      );
    }

    setFilteredProfessors(result);
  }, [professors, filters, searchTerm]);

  // ⭐ فتح تفاصيل الأستاذ
  const handleProfessorSelect = (professor) => {
    setSelectedProfessor(professor);
  };

  // ⭐ إغلاق المودال
  const closeModal = () => {
    setSelectedProfessor(null);
  };

  // ⭐ حذف أستاذ (من الواجهة فقط)
  const deleteProfessor = async (professorId) => {
  if (window.confirm("Are you sure you want to delete this professor?")) {
    try {
      // 🔥 حذف الأستاذ من Firestore
      await deleteDoc(doc(db, "professors", professorId));

      // 🔥 حذف من الواجهة
      const updated = professors.filter(p => p.id !== professorId);
      setProfessors(updated);
      setFilteredProfessors(updated);

      // إغلاق المودال إذا كان مفتوح
      if (selectedProfessor && selectedProfessor.id === professorId) {
        closeModal();
      }

    } catch (error) {
      console.error("Error deleting professor:", error);
      alert("حدث خطأ أثناء حذف الأستاذ من Firestore");
    }
  }
};


  // ⭐ التخصصات المتاحة
  const specializations = [...new Set(professors.map(p => p.specialization))];

  return (
    <div className="view-professors-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-chalkboard-teacher"></i>
            View Professors
          </h1>
          <p className="page-subtitle">Manage and view all academic staff members</p>
        </div>
        <div className="user-info">
          <span>Total: {professors.length}</span>
        </div>
      </div>

      <div className="main-content">
        <div className="view-container">
          <div className="view-header">
            <h2 className="view-title">
              <i className="fas fa-list-ul"></i>
              Academic Staff Directory
            </h2>

            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, specialization, or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="professors-layout">
            {/* Filters */}
            <div className="filters-sidebar">
              <div className="filters-card">
                <h3 className="filters-title">
                  <i className="fas fa-filter"></i>
                  Filters
                </h3>

                <div className="filter-group">
                  <h4 className="filter-label">Type</h4>
                  <div className="filter-options">
                    <button
                      className={`filter-option ${filters.type === 'all' ? 'active' : ''}`}
                      onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
                    >
                      All
                    </button>
                    <button
                      className={`filter-option ${filters.type === 'theory' ? 'active' : ''}`}
                      onClick={() => setFilters(prev => ({ ...prev, type: 'theory' }))}
                    >
                      Theory
                    </button>
                    <button
                      className={`filter-option ${filters.type === 'practical' ? 'active' : ''}`}
                      onClick={() => setFilters(prev => ({ ...prev, type: 'practical' }))}
                    >
                      Practical
                    </button>
                  </div>
                </div>

                <div className="filter-group">
                  <h4 className="filter-label">Specialization</h4>
                  <select
                    className="filter-select"
                    value={filters.specialization}
                    onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                  >
                    <option value="all">All Specializations</option>
                    {specializations.map(spec => (
                      <option key={spec} value={spec}>{spec}</option>
                    ))}
                  </select>
                </div>

                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    setFilters({ type: 'all', specialization: 'all' });
                    setSearchTerm('');
                  }}
                >
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Professors List */}
            <div className="professors-main">
              {loading ? (
                <div className="loading-container">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading...</p>
                </div>
              ) : filteredProfessors.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-user-slash"></i>
                  <h3>No professors found</h3>
                </div>
              ) : (
                <div className="professors-grid">
                  {filteredProfessors.map(professor => (
                    <div
                      key={professor.id}
                      className="professor-card"
                      onClick={() => handleProfessorSelect(professor)}
                    >
                      <div className="professor-card-header">
                        <div className="professor-avatar">
                          {professor.name.charAt(0)}
                        </div>
                        <div className="professor-basic-info">
                          <h3 className="professor-name">{professor.name}</h3>
                          <div className="professor-type">
                            {professor.type}
                          </div>
                        </div>
                      </div>

                      <div className="professor-card-details">
                        <div className="detail-item">
                          <i className="fas fa-graduation-cap"></i>
                          <span>{professor.specialization}</span>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-envelope"></i>
                          <span>{professor.email}</span>
                        </div>
                      </div>

                      <div className="professor-card-actions">
                        <button
                          className="action-icon delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteProfessor(professor.id);
                          }}
                        >
                          <i className="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedProfessor && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{selectedProfessor.name}</h2>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <p><strong>Email:</strong> {selectedProfessor.email}</p>
              <p><strong>Phone:</strong> {selectedProfessor.phone}</p>
              <p><strong>Specialization:</strong> {selectedProfessor.specialization}</p>
              <p><strong>Type:</strong> {selectedProfessor.type}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}