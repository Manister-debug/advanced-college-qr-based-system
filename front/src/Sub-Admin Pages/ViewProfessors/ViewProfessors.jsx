import React, { useState, useEffect } from 'react';
import './ViewProfessors.css';

export default function ViewProfessors() {
  const [professors, setProfessors] = useState([]);
  const [courses, setCourses] = useState([]);
  const [filteredProfessors, setFilteredProfessors] = useState([]);
  const [selectedProfessor, setSelectedProfessor] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all', // 'all', 'professor', 'engineer'
    specialization: 'all'
  });
  const [loading, setLoading] = useState(true);

  // Mock data - in real app, this would come from API/localStorage
  useEffect(() => {
    // Load professors data
    const savedProfessors = localStorage.getItem('cs_professors');
    const savedCourses = localStorage.getItem('cs_courses');
    
    const mockProfessors = savedProfessors ? JSON.parse(savedProfessors) : [
      {
        id: 'p1',
        fullName: 'Dr. Mohamad Ahmad',
        specialization: 'Artificial Intelligence (AI)',
        phone: '+961 71 234 567',
        email: 'm.ahmad@university.edu',
        type: 'professor',
        userType: 'professor'
      },
      {
        id: 'p2',
        fullName: 'Dr. Ali Battour',
        specialization: 'Software Engineering',
        phone: '+961 70 987 654',
        email: 'a.battour@university.edu',
        type: 'professor',
        userType: 'professor'
      },
      {
        id: 'p3',
        fullName: 'Dr. Salah Dawaji',
        specialization: 'Computer Networks',
        phone: '+961 76 543 210',
        email: 's.dawaji@university.edu',
        type: 'engineer',
        userType: 'engineer'
      },
      {
        id: 'p4',
        fullName: 'Dr. Mahmoud Haidar',
        specialization: 'Cybersecurity',
        phone: '+961 78 123 456',
        email: 'm.haidar@university.edu',
        type: 'professor',
        userType: 'professor'
      },
      {
        id: 'p5',
        fullName: 'Eng. Omar Kassem',
        specialization: 'Cloud Computing',
        phone: '+961 79 654 321',
        email: 'o.kassem@university.edu',
        type: 'engineer',
        userType: 'engineer'
      }
    ];
    
    const mockCourses = savedCourses ? JSON.parse(savedCourses) : [
      {
        id: 'c1',
        name: 'Data Structures',
        code: 'CS201',
        type: 'theory-practical',
        academicHours: 3,
        theoryProfessors: ['p1'],
        practicalProfessors: ['p3']
      },
      {
        id: 'c2',
        name: 'Artificial Intelligence',
        code: 'CS301',
        type: 'theory-only',
        academicHours: 4,
        theoryProfessors: ['p1', 'p2'],
        practicalProfessors: []
      },
      {
        id: 'c3',
        name: 'Network Security',
        code: 'CS401',
        type: 'theory-practical',
        academicHours: 3,
        theoryProfessors: ['p4'],
        practicalProfessors: ['p3']
      },
      {
        id: 'c4',
        name: 'Cloud Architecture',
        code: 'CS402',
        type: 'practical-only',
        academicHours: 2,
        theoryProfessors: [],
        practicalProfessors: ['p5']
      }
    ];
    
    setProfessors(mockProfessors);
    setCourses(mockCourses);
    setFilteredProfessors(mockProfessors);
    setLoading(false);
  }, []);

  // Filter professors based on search and filters
  useEffect(() => {
    let result = professors;
    
    // Apply type filter
    if (filters.type !== 'all') {
      result = result.filter(prof => prof.type === filters.type);
    }
    
    // Apply specialization filter
    if (filters.specialization !== 'all') {
      result = result.filter(prof => prof.specialization === filters.specialization);
    }
    
    // Apply search term
    if (searchTerm.trim()) {
      const term = searchTerm.toLowerCase();
      result = result.filter(prof =>
        prof.fullName.toLowerCase().includes(term) ||
        prof.specialization.toLowerCase().includes(term) ||
        prof.email.toLowerCase().includes(term) ||
        prof.phone.includes(term)
      );
    }
    
    setFilteredProfessors(result);
  }, [professors, filters, searchTerm]);


  const getCoursesForProfessor = (professorId) => {
    const teachingCourses = [];
    
    courses.forEach(course => {
      // Check if professor teaches theory in this course
      if (course.theoryProfessors && course.theoryProfessors.includes(professorId)) {
        teachingCourses.push({
          ...course,
          teachingType: 'Theory',
          role: 'Theory Professor'
        });
      }
      
      // Check if professor teaches practical in this course
      if (course.practicalProfessors && course.practicalProfessors.includes(professorId)) {
        teachingCourses.push({
          ...course,
          teachingType: 'Practical',
          role: 'Practical Professor'
        });
      }
    });
    
    return teachingCourses;
  };

  // Handle professor selection
  const handleProfessorSelect = (professor) => {
    const professorCourses = getCoursesForProfessor(professor.id);
    setSelectedProfessor({
      ...professor,
      courses: professorCourses
    });
  };

  // Close modal
  const closeModal = () => {
    setSelectedProfessor(null);
  };

  // Get unique specializations for filter dropdown
  const specializations = [...new Set(professors.map(prof => prof.specialization))];

  // Get professor type display
  const getProfessorTypeDisplay = (type) => {
    return type === 'professor' ? 'Professor' : 'Engineer';
  };

  // Get professor type color
  const getProfessorTypeColor = (type) => {
    return type === 'professor' ? '#8da9c4' : '#4ecdc4';
  };

  // Get professor type background color
  const getProfessorTypeBackground = (type) => {
    return type === 'professor' ? 'rgba(141, 169, 196, 0.2)' : 'rgba(78, 205, 196, 0.2)';
  };

  // Get academic hours color
  const getAcademicHoursColor = (hours) => {
    switch(hours) {
      case 1: return '#4ECDC4';
      case 2: return '#45B7D1';
      case 3: return '#96CEB4';
      case 4: return '#FFA69E';
      default: return '#8da9c4';
    }
  };

  // Delete professor
  const deleteProfessor = (professorId) => {
    if (window.confirm('Are you sure you want to delete this professor? This action cannot be undone.')) {
      const updatedProfessors = professors.filter(prof => prof.id !== professorId);
      setProfessors(updatedProfessors);
      
      // Also remove from courses
      const updatedCourses = courses.map(course => ({
        ...course,
        theoryProfessors: course.theoryProfessors?.filter(id => id !== professorId) || [],
        practicalProfessors: course.practicalProfessors?.filter(id => id !== professorId) || []
      }));
      setCourses(updatedCourses);
      
      // Update localStorage
      localStorage.setItem('cs_professors', JSON.stringify(updatedProfessors));
      localStorage.setItem('cs_courses', JSON.stringify(updatedCourses));
      
      // Close modal if open
      if (selectedProfessor && selectedProfessor.id === professorId) {
        closeModal();
      }
    }
  };

  // Edit professor
  const editProfessor = (professor) => {
    alert(`Edit professor: ${professor.fullName}\n\nEditing functionality coming soon!`);
  };

  return (
    <div className="view-professors-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-chalkboard-teacher"></i>
            View Professors & Engineers
          </h1>
          <p className="page-subtitle">Manage and view all academic staff members</p>
        </div>
        <div className="user-info">
          <span>Total: {professors.length} ({professors.filter(p => p.type === 'professor').length} Professors, {professors.filter(p => p.type === 'engineer').length} Engineers)</span>
        </div>
      </div>

      <div className="main-content">
        <div className="view-container">
          <div className="view-header">
            <h2 className="view-title">
              <i className="fas fa-list-ul"></i>
              Academic Staff Directory
            </h2>
            <div className="view-controls">
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
                      <i className="fas fa-users"></i>
                      All Staff
                    </button>
                    <button
                      className={`filter-option ${filters.type === 'professor' ? 'active' : ''}`}
                      onClick={() => setFilters(prev => ({ ...prev, type: 'professor' }))}
                    >
                      <i className="fas fa-chalkboard-teacher"></i>
                      Professors
                    </button>
                    <button
                      className={`filter-option ${filters.type === 'engineer' ? 'active' : ''}`}
                      onClick={() => setFilters(prev => ({ ...prev, type: 'engineer' }))}
                    >
                      <i className="fas fa-cogs"></i>
                      Engineers
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

                <div className="filter-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Staff:</span>
                    <span className="stat-value">{filteredProfessors.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Professors:</span>
                    <span className="stat-value">
                      {filteredProfessors.filter(p => p.type === 'professor').length}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Engineers:</span>
                    <span className="stat-value">
                      {filteredProfessors.filter(p => p.type === 'engineer').length}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    setFilters({ type: 'all', specialization: 'all' });
                    setSearchTerm('');
                  }}
                >
                  <i className="fas fa-redo"></i>
                  Reset Filters
                </button>
              </div>
            </div>

            {/* Professors List */}
            <div className="professors-main">
              {loading ? (
                <div className="loading-container">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading academic staff data...</p>
                </div>
              ) : filteredProfessors.length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-user-slash"></i>
                  <h3>No academic staff found</h3>
                  <p>No staff members match your search criteria.</p>
                </div>
              ) : (
                <div className="professors-grid">
                  {filteredProfessors.map(professor => {
                    const coursesCount = getCoursesForProfessor(professor.id).length;
                    
                    return (
                      <div
                        key={professor.id}
                        className="professor-card"
                        onClick={() => handleProfessorSelect(professor)}
                      >
                        <div className="professor-card-header">
                          <div className="professor-avatar">
                            {professor.fullName.charAt(0)}
                          </div>
                          <div className="professor-basic-info">
                            <h3 className="professor-name">{professor.fullName}</h3>
                            <div className="professor-type" style={{
                              backgroundColor: getProfessorTypeBackground(professor.type),
                              color: getProfessorTypeColor(professor.type)
                            }}>
                              <i className={`fas ${professor.type === 'professor' ? 'fa-chalkboard-teacher' : 'fa-cogs'}`}></i>
                              {getProfessorTypeDisplay(professor.type)}
                            </div>
                          </div>
                        </div>

                        <div className="professor-card-details">
                          <div className="detail-item">
                            <i className="fas fa-graduation-cap"></i>
                            <span>{professor.specialization}</span>
                          </div>
                          <div className="detail-item">
                            <i className="fas fa-book"></i>
                            <span>Teaching {coursesCount} course{coursesCount !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="detail-item">
                            <i className="fas fa-envelope"></i>
                            <span>{professor.email}</span>
                          </div>
                        </div>

                        <div className="professor-card-actions">
                          <div className="courses-badge">
                            <i className="fas fa-book-open"></i>
                            {coursesCount} Courses
                          </div>
                          <div className="action-icons">
                            <button
                              className="action-icon edit"
                              onClick={(e) => {
                                e.stopPropagation();
                                editProfessor(professor);
                              }}
                              title="Edit"
                            >
                              <i className="fas fa-edit"></i>
                            </button>
                            <button
                              className="action-icon delete"
                              onClick={(e) => {
                                e.stopPropagation();
                                deleteProfessor(professor.id);
                              }}
                              title="Delete"
                            >
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {filteredProfessors.length > 0 && (
                <div className="table-footer">
                  <div className="table-info">
                    Showing {filteredProfessors.length} of {professors.length} staff members
                  </div>
                  <div className="pagination">
                    <button className="btn-secondary">
                      <i className="fas fa-download"></i>
                      Export List
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Professor Details */}
      {selectedProfessor && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-container" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">
                <h2>
                  <i className={`fas ${selectedProfessor.type === 'professor' ? 'fa-chalkboard-teacher' : 'fa-cogs'}`}></i>
                  {selectedProfessor.fullName}
                </h2>
                <span className="modal-subtitle">{getProfessorTypeDisplay(selectedProfessor.type)}</span>
              </div>
              <button className="modal-close" onClick={closeModal}>
                <i className="fas fa-times"></i>
              </button>
            </div>

            <div className="modal-content">
              <div className="modal-grid">
                {/* Personal Information */}
                <div className="modal-section">
                  <h3 className="section-title">
                    <i className="fas fa-user-circle"></i>
                    Personal Information
                  </h3>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Full Name</span>
                      <span className="info-value">{selectedProfessor.fullName}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Specialization</span>
                      <span className="info-value">{selectedProfessor.specialization}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Email</span>
                      <span className="info-value">{selectedProfessor.email}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone</span>
                      <span className="info-value">{selectedProfessor.phone}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Type</span>
                      <span className="info-value" style={{ color: getProfessorTypeColor(selectedProfessor.type) }}>
                        <i className={`fas ${selectedProfessor.type === 'professor' ? 'fa-chalkboard-teacher' : 'fa-cogs'}`}></i>
                        {getProfessorTypeDisplay(selectedProfessor.type)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Teaching */}
                <div className="modal-section">
                  <h3 className="section-title">
                    <i className="fas fa-book"></i>
                    Courses Teaching ({selectedProfessor.courses.length})
                  </h3>
                  {selectedProfessor.courses.length === 0 ? (
                    <div className="no-courses">
                      <i className="fas fa-book"></i>
                      <p>Not assigned to any courses yet</p>
                    </div>
                  ) : (
                    <div className="courses-list">
                      {selectedProfessor.courses.map((course, index) => (
                        <div key={`${course.id}-${index}`} className="course-item">
                          <div className="course-header">
                            <div className="course-code-name">
                              <strong style={{ color: '#8da9c4' }}>{course.code}</strong>
                              <span style={{ color: '#eef4ed' }}>{course.name}</span>
                            </div>
                            <div className="course-type-badge" style={{
                              backgroundColor: course.teachingType === 'Theory' ? 'rgba(141, 169, 196, 0.2)' : 'rgba(78, 205, 196, 0.2)',
                              color: course.teachingType === 'Theory' ? '#8da9c4' : '#4ecdc4'
                            }}>
                              {course.teachingType}
                            </div>
                          </div>
                          <div className="course-details">
                            <div className="course-detail">
                              <i className="fas fa-clock"></i>
                              <span style={{ color: getAcademicHoursColor(course.academicHours) }}>
                                {course.academicHours} hour{course.academicHours !== 1 ? 's' : ''} per week
                              </span>
                            </div>
                            <div className="course-detail">
                              <i className="fas fa-graduation-cap"></i>
                              <span>{course.role}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Additional Information */}
                <div className="modal-section">
                  <h3 className="section-title">
                    <i className="fas fa-chart-bar"></i>
                    Teaching Statistics
                  </h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-icon" style={{ backgroundColor: 'rgba(141, 169, 196, 0.2)' }}>
                        <i className="fas fa-book"></i>
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">{selectedProfessor.courses.length}</span>
                        <span className="stat-label">Total Courses</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon" style={{ backgroundColor: 'rgba(78, 205, 196, 0.2)' }}>
                        <i className="fas fa-chalkboard-teacher"></i>
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">
                          {selectedProfessor.courses.filter(c => c.teachingType === 'Theory').length}
                        </span>
                        <span className="stat-label">Theory Courses</span>
                      </div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-icon" style={{ backgroundColor: 'rgba(255, 209, 102, 0.2)' }}>
                        <i className="fas fa-flask"></i>
                      </div>
                      <div className="stat-info">
                        <span className="stat-value">
                          {selectedProfessor.courses.filter(c => c.teachingType === 'Practical').length}
                        </span>
                        <span className="stat-label">Practical Courses</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={closeModal}>
                <i className="fas fa-times"></i>
                Close
              </button>
              <button className="btn btn-primary" onClick={() => editProfessor(selectedProfessor)}>
                <i className="fas fa-edit"></i>
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}