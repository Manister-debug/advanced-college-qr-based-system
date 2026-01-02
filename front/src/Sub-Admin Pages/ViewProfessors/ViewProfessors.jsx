import React, { useState, useEffect } from 'react';
import './ViewProfessors.css';

// Firestore imports
import { db } from "../../firebase";
import { 
  collection, 
  onSnapshot,
  doc, 
  deleteDoc, 
  updateDoc,
  query,
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
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [editing, setEditing] = useState(false);
  const [editFormData, setEditFormData] = useState({
    name: '',
    username: '',
    faculty: '',
    specialization: '',
    email: '',
    phone: '',
    type: 'theory',
    status: 'active',
    password: ''
  });
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showPasswordView, setShowPasswordView] = useState(false);

  // Available filters
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

  // Fetch real-time data from Firestore
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
      setLoading(false);
    }, (error) => {
      console.error("Error loading professors:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter and sort professors
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
        prof.username?.toLowerCase().includes(term) ||
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

  // Get available filter options from current data
  const availableFaculties = [...new Set(professors.map(p => p.faculty).filter(Boolean))].sort();
  const availableSpecializations = [...new Set(professors.map(p => p.specialization).filter(Boolean))].sort();

  // Open professor details modal
  const handleProfessorSelect = (professor) => {
    setSelectedProfessor(professor);
    setEditing(false);
    setShowPasswordView(false);
  };

  // Close modal
  const closeModal = () => {
    setSelectedProfessor(null);
    setEditing(false);
    setEditFormData({
      name: '',
      username: '',
      faculty: '',
      specialization: '',
      email: '',
      phone: '',
      type: 'theory',
      status: 'active',
      password: ''
    });
    setShowPassword(false);
    setShowPasswordView(false);
  };

  // Start editing
  const startEditing = (professor) => {
    setEditing(true);
    setEditFormData({
      name: professor.name || '',
      username: professor.username || '',
      faculty: professor.faculty || '',
      specialization: professor.specialization || '',
      email: professor.email || '',
      phone: professor.phone || '',
      type: professor.type || 'theory',
      status: professor.status || 'active',
      password: ''
    });
  };

  // Cancel editing
  const cancelEditing = () => {
    setEditing(false);
    setEditFormData({
      name: '',
      username: '',
      faculty: '',
      specialization: '',
      email: '',
      phone: '',
      type: 'theory',
      status: 'active',
      password: ''
    });
    setShowPassword(false);
  };

  // Handle edit form input changes
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => setShowPassword(!showPassword);
  const togglePasswordViewVisibility = () => setShowPasswordView(!showPasswordView);

  // Update professor
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
      
      const updateData = {
        name: editFormData.name.trim(),
        username: editFormData.username.trim(),
        faculty: editFormData.faculty,
        specialization: editFormData.specialization,
        email: editFormData.email.toLowerCase().trim(),
        phone: editFormData.phone.trim(),
        type: editFormData.type,
        status: editFormData.status,
        updatedAt: new Date().toISOString()
      };

      if (editFormData.password.trim()) {
        updateData.password = editFormData.password.trim();
      }

      await updateDoc(professorRef, updateData);

      // Update local state
      setProfessors(prev => prev.map(p => 
        p.id === selectedProfessor.id 
          ? { ...p, ...updateData }
          : p
      ));

      setSelectedProfessor(prev => ({ ...prev, ...updateData }));
      setEditing(false);
      alert('Professor details updated successfully!');
    } catch (error) {
      console.error("Error updating professor:", error);
      alert('An error occurred while updating professor details');
    } finally {
      setSaving(false);
    }
  };

  // Delete professor
  const deleteProfessor = async (professorId, professorName) => {
    if (window.confirm(`Are you sure you want to delete professor "${professorName}"?\nThis action cannot be undone.`)) {
      try {
        await deleteDoc(doc(db, "professors", professorId));
        
        if (selectedProfessor && selectedProfessor.id === professorId) {
          closeModal();
        }
        
        alert(`Professor "${professorName}" has been successfully deleted`);
        
      } catch (error) {
        console.error("Error deleting professor:", error);
        alert("An error occurred while deleting the professor. Please try again.");
      }
    }
  };

  // Reset filters
  const resetFilters = () => {
    setFilters({
      type: 'all',
      faculty: 'all',
      specialization: 'all',
      status: 'all'
    });
    setSearchTerm('');
  };

  // Sort handler
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      </div>

      <div className="main-content">
        {/* Left Sidebar - Filters */}
        <div className="filters-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <i className="fas fa-search"></i>
              Search Professors
            </h3>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search by name, username, faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <i className="fas fa-filter"></i>
              Filter by Type
            </h3>
            <div className="filter-options">
              <button 
                className={`filter-option ${filters.type === 'all' ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, type: 'all' }))}
              >
                <i className="fas fa-layer-group"></i>
                All Types
              </button>
              <button 
                className={`filter-option ${filters.type === 'theory' ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, type: 'theory' }))}
              >
                <i className="fas fa-chalkboard-teacher"></i>
                Theory
              </button>
              <button 
                className={`filter-option ${filters.type === 'practical' ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, type: 'practical' }))}
              >
                <i className="fas fa-flask"></i>
                Practical
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <i className="fas fa-university"></i>
              Filter by Faculty
            </h3>
            <div className="filter-scroll">
              <div className="filter-options vertical">
                <button 
                  className={`filter-option ${filters.faculty === 'all' ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, faculty: 'all' }))}
                >
                  <i className="fas fa-th-list"></i>
                  All Faculties
                </button>
                {availableFaculties.map(faculty => (
                  <button 
                    key={faculty}
                    className={`filter-option ${filters.faculty === faculty ? 'active' : ''}`}
                    onClick={() => setFilters(prev => ({ ...prev, faculty }))}
                  >
                    <i className="fas fa-graduation-cap"></i>
                    {faculty}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <i className="fas fa-graduation-cap"></i>
              Filter by Specialization
            </h3>
            <div className="filter-scroll">
              <div className="filter-options vertical">
                <button 
                  className={`filter-option ${filters.specialization === 'all' ? 'active' : ''}`}
                  onClick={() => setFilters(prev => ({ ...prev, specialization: 'all' }))}
                >
                  <i className="fas fa-th-list"></i>
                  All Specializations
                </button>
                {availableSpecializations.map(spec => (
                  <button 
                    key={spec}
                    className={`filter-option ${filters.specialization === spec ? 'active' : ''}`}
                    onClick={() => setFilters(prev => ({ ...prev, specialization: spec }))}
                  >
                    <i className="fas fa-code"></i>
                    {spec}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <i className="fas fa-circle"></i>
              Filter by Status
            </h3>
            <div className="filter-options">
              <button 
                className={`filter-option ${filters.status === 'all' ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, status: 'all' }))}
              >
                <i className="fas fa-layer-group"></i>
                All Status
              </button>
              <button 
                className={`filter-option ${filters.status === 'active' ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, status: 'active' }))}
              >
                <i className="fas fa-check-circle"></i>
                Active
              </button>
              <button 
                className={`filter-option ${filters.status === 'inactive' ? 'active' : ''}`}
                onClick={() => setFilters(prev => ({ ...prev, status: 'inactive' }))}
              >
                <i className="fas fa-times-circle"></i>
                Inactive
              </button>
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <i className="fas fa-sort"></i>
              Sort Options
            </h3>
            <div className="filter-options">
              <button 
                className={`filter-option ${sortConfig.key === 'name' ? 'active' : ''}`}
                onClick={() => handleSort('name')}
              >
                <i className="fas fa-sort-alpha-down"></i>
                Name {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                className={`filter-option ${sortConfig.key === 'createdAt' ? 'active' : ''}`}
                onClick={() => handleSort('createdAt')}
              >
                <i className="fas fa-calendar-alt"></i>
                Date {sortConfig.key === 'createdAt' && (sortConfig.direction === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

          <div className="sidebar-actions">
            <button className="btn btn-secondary reset-btn" onClick={resetFilters}>
              <i className="fas fa-redo"></i>
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Right Content - Professors List */}
        <div className="professors-content">
          <div className="content-header">
            <div className="results-info">
              <span className="results-count">
                Showing {filteredProfessors.length} of {professors.length} professors
              </span>
              <span className="last-update">
                Last updated: {new Date().toLocaleTimeString()}
              </span>
            </div>
          </div>

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
              <div className="professors-grid compact">
                {filteredProfessors.map(professor => (
                  <div
                    key={professor.id}
                    className="professor-card compact"
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
                    </div>

                    <div className="professor-card-details compact">
                      <div className="detail-row">
                        <div className="detail-item">
                          <i className="fas fa-user-tag"></i>
                          <span className="detail-label">Username:</span>
                          <span className="detail-value">{professor.username || 'Not set'}</span>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-university"></i>
                          <span className="detail-label">Faculty:</span>
                          <span className="detail-value">{professor.faculty || 'Not specified'}</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-item">
                          <i className="fas fa-envelope"></i>
                          <span className="detail-label">Email:</span>
                          <span className="detail-value email">{professor.email}</span>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-phone"></i>
                          <span className="detail-label">Phone:</span>
                          <span className="detail-value">{professor.phone}</span>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-item">
                          <i className="fas fa-calendar"></i>
                          <span className="detail-label">Added:</span>
                          <span className="detail-value">{formatDate(professor.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="professor-card-actions compact">
                      <button
                        className="action-btn view-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleProfessorSelect(professor);
                        }}
                      >
                        <i className="fas fa-eye"></i>
                        View
                      </button>
                      <button
                        className="action-btn edit-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          startEditing(professor);
                        }}
                      >
                        <i className="fas fa-edit"></i>
                        Edit
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
            )}
          </div>
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
                        <i className="fas fa-user-tag"></i>
                        Username
                      </label>
                      <input
                        type="text"
                        name="username"
                        value={editFormData.username}
                        onChange={handleEditChange}
                        className="form-input"
                        placeholder="Enter username"
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

                    <div className="form-group">
                      <label className="form-label">
                        <i className="fas fa-lock"></i>
                        New Password
                      </label>
                      <div className="password-field">
                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          value={editFormData.password}
                          onChange={handleEditChange}
                          className="form-input"
                          placeholder="Enter new password (leave blank to keep current)"
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={togglePasswordVisibility}
                        >
                          <i className={`fas fa-${showPassword ? "eye-slash" : "eye"}`}></i>
                        </button>
                      </div>
                      <p className="form-hint">
                        <i className="fas fa-info-circle"></i>
                        Leave password field empty if you don't want to change it
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
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
                        <span className="detail-label">Username:</span>
                        <span className="detail-value username-value">{selectedProfessor.username || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Faculty:</span>
                        <span className="detail-value">{selectedProfessor.faculty || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Specialization:</span>
                        <span className="detail-value">{selectedProfessor.specialization || 'Not specified'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Type:</span>
                        <span className="detail-value">{selectedProfessor.type === 'theory' ? 'Theory Professor' : 'Practical Engineer'}</span>
                      </div>
                      <div className="detail-item">
                        <span className="detail-label">Status:</span>
                        <span className="detail-value status-value">
                          {selectedProfessor.status === 'active' ? 'Active' : 'Inactive'}
                        </span>
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
                      <i className="fas fa-lock"></i>
                      Account Information
                    </h3>
                    <div className="detail-grid">
                      <div className="detail-item">
                        <span className="detail-label">Password:</span>
                        <div className="password-display-field">
                          <span className="detail-value password-value">
                            {showPasswordView ? selectedProfessor.password : '••••••••'}
                          </span>
                          <button
                            type="button"
                            className="password-view-toggle"
                            onClick={togglePasswordViewVisibility}
                          >
                            <i className={`fas fa-${showPasswordView ? "eye-slash" : "eye"}`}></i>
                            {showPasswordView ? ' Hide' : ' Show'}
                          </button>
                        </div>
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