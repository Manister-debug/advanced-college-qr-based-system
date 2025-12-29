import React, { useState, useEffect } from 'react';
import './ViewProfessors.css';

// Firestore imports
import { db } from "../../firebase";
import { 
  collection, 
  getDocs, 
  doc, 
  deleteDoc, 
  updateDoc,
  onSnapshot,
  query,
  where,
  orderBy 
} from "firebase/firestore";

export default function ViewProfessors() {
  const [professors, setProfessors] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    faculty: 'all',
    specialization: 'all',
    status: 'all'
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    theory: 0,
    practical: 0,
    active: 0
  });
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    faculty: '',
    specialization: '',
    email: '',
    phone: '',
    type: 'theory',
    status: 'active'
  });
  const [saving, setSaving] = useState(false);

  const faculties = [
    'Computer Science',
    'Software Engineering',
    'Information Technology',
    'Computer Engineering',
    'Data Science',
    'Cybersecurity',
    'Artificial Intelligence',
    'Networking',
    'Information Systems'
  ];

  const specializations = [
    'Artificial Intelligence (AI)',
    'Software Engineering',
    'Robotics',
    'Data Science',
    'Machine Learning',
    'Computer Networks',
    'Cybersecurity',
    'Computer Vision',
    'Natural Language Processing',
    'Database Systems',
    'Web Development',
    'Mobile App Development',
    'Cloud Computing',
    'Internet of Things (IoT)',
    'Operating Systems',
    'Computer Architecture',
    'Embedded Systems',
    'Human-Computer Interaction',
    'Game Development',
    'Bioinformatics'
  ];

  // ⭐ Fetch real-time data from Firestore
  useEffect(() => {
    const professorsRef = collection(db, "professors");
    const q = query(professorsRef, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      setProfessors(data);
      setFilteredProfessors(data);
      
      // Calculate statistics
      const theoryCount = data.filter(p => p.type === 'theory').length;
      const practicalCount = data.filter(p => p.type === 'practical').length;
      const activeCount = data.filter(p => p.status === 'active').length;
      
      setStats({
        total: data.length,
        theory: theoryCount,
        practical: practicalCount,
        active: activeCount
      });
      
      setLoading(false);
    }, (error) => {
      console.error("Error loading professors:", error);
      setLoading(false);
    });

    // Cleanup on unmount
    return () => unsubscribe();
  }, []);

  // ⭐ Filter and sort professors
  useEffect(() => {
    let result = [...professors];

    // Apply filters
    if (filters.type !== 'all') {
      result = result.filter(prof => prof.type === filters.type);
    }

    if (filters.faculty !== 'all') {
      result = result.filter(prof => prof.faculty === filters.faculty);
    }

    if (filters.specialization !== 'all') {
      result = result.filter(prof => prof.specialization === filters.specialization);
    }

    if (filters.status !== 'all') {
      result = result.filter(prof => prof.status === filters.status);
    }

    // Apply search
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(prof =>
        prof.name?.toLowerCase().includes(term) ||
        prof.faculty?.toLowerCase().includes(term) ||
        prof.specialization?.toLowerCase().includes(term) ||
        prof.email?.toLowerCase().includes(term) ||
        prof.phone?.includes(term)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      let aValue = a[sortConfig.key];
      let bValue = b[sortConfig.key];

      if (sortConfig.key === 'createdAt') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1;
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1;
      }
      return 0;
    });

    setFilteredProfessors(result);
  }, [professors, filters, searchTerm, sortConfig]);

  // ⭐ Open professor details
  const handleProfessorSelect = (professor) => {
    setSelectedProfessor(professor);
    setEditing(false);
  };

  // ⭐ Close modal
  const closeModal = () => {
    setSelectedProfessor(null);
    setEditing(false);
    setEditFormData({
      name: '',
      faculty: '',
      specialization: '',
      email: '',
      phone: '',
      type: 'theory',
      status: 'active'
    });
  };

  // ⭐ Start editing
  const startEditing = (professor) => {
    setEditing(true);
    setEditFormData({
      name: professor.name || '',
      faculty: professor.faculty || '',
      specialization: professor.specialization || '',
      email: professor.email || '',
      phone: professor.phone || '',
      type: professor.type || 'theory',
      status: professor.status || 'active'
    });
  };

  // ⭐ Cancel editing
  const cancelEditing = () => {
    setEditing(false);
    setEditFormData({
      name: '',
      faculty: '',
      specialization: '',
      email: '',
      phone: '',
      type: 'theory',
      status: 'active'
    });
  };

  // ⭐ Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // ⭐ Update professor
  const updateProfessor = async () => {
    if (!selectedProfessor) return;

    // Validate required fields
    if (!editFormData.name.trim() || !editFormData.email.trim() || !editFormData.phone.trim()) {
      alert('Please fill all required fields');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(editFormData.email)) {
      alert('Please enter a valid email address');
      return;
    }

    setSaving(true);
    try {
      const professorRef = doc(db, "professors", selectedProfessor.id);
      await updateDoc(professorRef, {
        name: editFormData.name.trim(),
        faculty: editFormData.faculty,
        specialization: editFormData.specialization,
        email: editFormData.email.toLowerCase().trim(),
        phone: editFormData.phone.trim(),
        type: editFormData.type,
        status: editFormData.status,
        updatedAt: new Date().toISOString()
      });

      // Update local state
      setProfessors(prev => prev.map(p => 
        p.id === selectedProfessor.id 
          ? { ...p, ...editFormData, updatedAt: new Date().toISOString() }
          : p
      ));

      // Update selected professor
      setSelectedProfessor(prev => ({ 
        ...prev, 
        ...editFormData,
        updatedAt: new Date().toISOString() 
      }));

      setEditing(false);
      alert('Professor details updated successfully!');
    } catch (error) {
      console.error("Error updating professor:", error);
      alert('An error occurred while updating professor details');
    } finally {
      setSaving(false);
    }
  };

  // ⭐ Delete professor
  const deleteProfessor = async (professorId, professorName) => {
    if (window.confirm(`Are you sure you want to delete professor "${professorName}"?\nThis action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "professors", professorId));
        
        // Close modal if open
        if (selectedProfessor && selectedProfessor.id === professorId) {
          closeModal();
        }
        
        // Success notification
        alert(`Professor "${professorName}" has been successfully deleted`);
        
      } catch (error) {
        console.error("Error deleting professor:", error);
        alert("An error occurred while deleting the professor. Please try again.");
      }
    }
  };

  // ⭐ Search handler
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // ⭐ Reset filters
  const resetFilters = () => {
    setFilters({
      type: 'all',
      faculty: 'all',
      specialization: 'all',
      status: 'all'
    });
    setSearchTerm('');
  };

  // ⭐ Available faculties
  const availableFaculties = [...new Set(professors.map(p => p.faculty).filter(Boolean))].sort();

  // ⭐ Available specializations
  const availableSpecializations = [...new Set(professors.map(p => p.specialization).filter(Boolean))].sort();

  // ⭐ Sort handler
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // ⭐ Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="view-professors-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-users"></i>
            View Professors & Staff
          </h1>
          <p className="page-subtitle">Manage and view academic and administrative staff</p>
        </div>
        <div className="header-stats">
          <div className="stat-card">
            <div className="stat-icon total">
              <i className="fas fa-users"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.total}</span>
              <span className="stat-label">Total Staff</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon theory">
              <i className="fas fa-chalkboard-teacher"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.theory}</span>
              <span className="stat-label">Theory Professors</span>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon practical">
              <i className="fas fa-cogs"></i>
            </div>
            <div className="stat-info">
              <span className="stat-number">{stats.practical}</span>
              <span className="stat-label">Practical Engineers</span>
            </div>
          </div>
        </div>
      </div>

      <div className="main-content">
        {/* Search and Filters Bar */}
        <div className="controls-section">
          <div className="search-container">
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, faculty, specialization, email..."
                value={searchTerm}
                onChange={handleSearch}
                className="search-input"
              />
              {searchTerm && (
                <button 
                  className="clear-search"
                  onClick={() => setSearchTerm('')}
                >
                  <i className="fas fa-times"></i>
                </button>
              )}
            </div>
            
            <div className="sort-controls">
              <span className="sort-label">Sort by:</span>
              <button 
                className={`sort-button ${sortConfig.key === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
              >
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`sort-button ${sortConfig.key === 'createdAt' ? 'active' : ''}`}
                onClick={() => handleSort('createdAt')}
              >
                Date {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          <div className="filters-container">
            <div className="filter-group">
              <label className="filter-label">
                <i className="fas fa-filter"></i>
                Type:
              </label>
              <select
                className="filter-select"
                value={filters.type}
                onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
              >
                <option value="all">All Types</option>
                <option value="theory">Theory</option>
                <option value="practical">Practical</option>
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <i className="fas fa-university"></i>
                Faculty:
              </label>
              <select
                className="filter-select"
                value={filters.faculty}
                onChange={(e) => setFilters(prev => ({ ...prev, faculty: e.target.value }))}
              >
                <option value="all">All Faculties</option>
                {availableFaculties.map(faculty => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <i className="fas fa-graduation-cap"></i>
                Specialization:
              </label>
              <select
                className="filter-select"
                value={filters.specialization}
                onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
              >
                <option value="all">All Specializations</option>
                {availableSpecializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label className="filter-label">
                <i className="fas fa-circle"></i>
                Status:
              </label>
              <select
                className="filter-select"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            <button
              className="btn btn-secondary"
              onClick={resetFilters}
            >
              <i className="fas fa-redo"></i>
              Reset Filters
            </button>
          </div>
        </div>

        {/* Professors Display */}
        <div className="professors-container">
          {loading ? (
            <div className="loading-container">
              <div className="spinner">
                <i className="fas fa-spinner fa-spin"></i>
              </div>
              <p>Loading professors data...</p>
            </div>
          ) : filteredProfessors.length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">
                <i className="fas fa-user-slash"></i>
              </div>
              <h3>No Results Found</h3>
              <p>No professors match your search or filter criteria.</p>
              <button 
                className="btn btn-primary"
                onClick={resetFilters}
              >
                <i className="fas fa-eye"></i>
                View All Professors
              </button>
            </div>
          ) : (
            <>
              <div className="results-info">
                <span className="results-count">
                  Showing {filteredProfessors.length} of {professors.length} professors
                </span>
                <span className="last-update">
                  Last updated: {new Date().toLocaleTimeString()}
                </span>
              </div>

              <div className="professors-grid">
                {filteredProfessors.map(professor => (
                  <div
                    key={professor.id}
                    className="professor-card"
                    onClick={() => handleProfessorSelect(professor)}
                  >
                    <div className="professor-card-header">
                      <div className="professor-avatar">
                        {professor.name?.charAt(0) || '?'}
                        <span className={`status-indicator ${professor.status || 'active'}`}></span>
                      </div>
                      <div className="professor-main-info">
                        <h3 className="professor-name">{professor.name}</h3>
                        <div className="professor-type">
                          <span className={`type-badge ${professor.type}`}>
                            {professor.type === 'theory' ? 'Theory' : 'Practical'}
                          </span>
                          <span className={`status-badge ${professor.status || 'active'}`}>
                            {professor.status === 'active' ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="professor-date">
                        <i className="fas fa-calendar"></i>
                        {formatDate(professor.createdAt)}
                      </div>
                    </div>

                    <div className="professor-card-details">
                      <div className="detail-item">
                        <i className="fas fa-university"></i>
                        <div className="detail-content">
                          <span className="detail-label">Faculty:</span>
                          <span className="detail-value">{professor.faculty || 'Not specified'}</span>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <i className="fas fa-graduation-cap"></i>
                        <div className="detail-content">
                          <span className="detail-label">Specialization:</span>
                          <span className="detail-value">{professor.specialization}</span>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <i className="fas fa-envelope"></i>
                        <div className="detail-content">
                          <span className="detail-label">Email:</span>
                          <span className="detail-value email">{professor.email}</span>
                        </div>
                      </div>
                      
                      <div className="detail-item">
                        <i className="fas fa-phone"></i>
                        <div className="detail-content">
                          <span className="detail-label">Phone:</span>
                          <span className="detail-value">{professor.phone}</span>
                        </div>
                      </div>
                    </div>

                    <div className="professor-card-actions">
                      <button
                        className="action-btn view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfessorSelect(professor);
                        }}
                      >
                        <i className="fas fa-eye"></i>
                        View Details
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteProfessor(professor.id, professor.name);
                        }}
                      >
                        <i className="fas fa-trash"></i>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Details/Edit Modal */}
      {selectedProfessor && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>
                  <i className="fas fa-user-graduate"></i>
                  {editing ? 'Edit Professor Details' : selectedProfessor.name}
                </h2>
                {!editing && (
                  <div className="modal-subtitle">
                    <span className={`type-badge ${selectedProfessor.type}`}>
                      {selectedProfessor.type === 'theory' ? 'Theory Professor' : 'Practical Engineer'}
                    </span>
                    <span className={`status-badge ${selectedProfessor.status || 'active'}`}>
                      {selectedProfessor.status === 'active' ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                )}
              </div>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              {editing ? (
                // Edit Form
                <div className="edit-form">
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-user"></i>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={editFormData.name}
                        onChange={handleEditChange}
                        className="form-input"
                        placeholder="Enter full name"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-university"></i>
                        Faculty
                      </label>
                      <select
                        name="faculty"
                        value={editFormData.faculty}
                        onChange={handleEditChange}
                        className="form-input"
                      >
                        <option value="">Select Faculty</option>
                        {faculties.map((faculty, index) => (
                          <option key={index} value={faculty}>
                            {faculty}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-graduation-cap"></i>
                        Specialization
                      </label>
                      <select
                        name="specialization"
                        value={editFormData.specialization}
                        onChange={handleEditChange}
                        className="form-input"
                      >
                        <option value="">Select Specialization</option>
                        {specializations.map((spec, index) => (
                          <option key={index} value={spec}>
                            {spec}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-envelope"></i>
                        Email Address *
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={editFormData.email}
                        onChange={handleEditChange}
                        className="form-input"
                        placeholder="Enter email address"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-phone"></i>
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={editFormData.phone}
                        onChange={handleEditChange}
                        className="form-input"
                        placeholder="Enter phone number"
                        required
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-chalkboard-teacher"></i>
                        Type
                      </label>
                      <select
                        name="type"
                        value={editFormData.type}
                        onChange={handleEditChange}
                        className="form-input"
                      >
                        <option value="theory">Theory Professor</option>
                        <option value="practical">Practical Engineer</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-circle"></i>
                        Status
                      </label>
                      <select
                        name="status"
                        value={editFormData.status}
                        onChange={handleEditChange}
                        className="form-input"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>
              ) : (
                // View Mode
                <>
                  <div className="detail-section">
                    <h3>
                      <i className="fas fa-info-circle"></i>
                      Basic Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Full Name:</span>
                        <span className="detail-value">{selectedProfessor.name}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Faculty:</span>
                        <span className="detail-value">{selectedProfessor.faculty || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Specialization:</span>
                        <span className="detail-value">{selectedProfessor.specialization}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{selectedProfessor.type === 'theory' ? 'Theory' : 'Practical'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value">{selectedProfessor.status === 'active' ? 'Active' : 'Inactive'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>
                      <i className="fas fa-address-card"></i>
                      Contact Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Email Address:</span>
                        <span className="detail-value email">{selectedProfessor.email}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Phone Number:</span>
                        <span className="detail-value phone">{selectedProfessor.phone}</span>
                      </div>
                    </div>
                  </div>

                  <div className="detail-section">
                    <h3>
                      <i className="fas fa-calendar-alt"></i>
                      System Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Date Added:</span>
                        <span className="detail-value">{formatDate(selectedProfessor.createdAt)}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Last Updated:</span>
                        <span className="detail-value">
                          {selectedProfessor.updatedAt ? formatDate(selectedProfessor.updatedAt) : 'Not specified'}
                        </span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Record ID:</span>
                        <span className="detail-value id">{selectedProfessor.id}</span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="modal-actions">
              {editing ? (
                <>
                  <button 
                    className="btn btn-secondary" 
                    onClick={cancelEditing}
                    disabled={saving}
                  >
                    <i className="fas fa-times"></i>
                    Cancel
                  </button>
                  <button 
                    className="btn btn-primary" 
                    onClick={updateProfessor}
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <i className="fas fa-spinner fa-spin"></i>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="fas fa-save"></i>
                        Save Changes
                      </>
                    )}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={closeModal}>
                    <i className="fas fa-times"></i>
                    Close
                  </button>
                  <button 
                    className="btn btn-danger"
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete ${selectedProfessor.name}?`)) {
                        deleteProfessor(selectedProfessor.id, selectedProfessor.name);
                        closeModal();
                      }
                    }}
                  >
                    <i className="fas fa-trash"></i>
                    Delete Professor
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={() => startEditing(selectedProfessor)}
                  >
                    <i className="fas fa-edit"></i>
                    Edit Data
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}