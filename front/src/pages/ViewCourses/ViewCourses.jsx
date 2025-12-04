import React, { useEffect, useState } from 'react';
import './ViewCourses.css';

function ViewCourses() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [professors, setProfessors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourse, setExpandedCourse] = useState(null);

    useEffect(() => {
        // Load saved data
        const savedCourses = localStorage.getItem('cs_courses');
        const savedProfessors = localStorage.getItem('cs_professors');
        
        if (savedCourses) {
            const parsedCourses = JSON.parse(savedCourses);
            setCourses(parsedCourses);
            setFilteredCourses(parsedCourses);
        }
        
        if (savedProfessors) {
            setProfessors(JSON.parse(savedProfessors));
        }
        
        setLoading(false);
        
        // Load professors from API if possible
        fetchProfessors();
    }, []);

    const fetchProfessors = async () => {
        const token = localStorage.getItem('token');
        const API_BASE = import.meta.env.VITE_API_BASE || '/api';
        
        try {
            const res = await fetch(`${API_BASE}/professors/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setProfessors(data);
                    localStorage.setItem('cs_professors', JSON.stringify(data));
                }
            }
        } catch (err) {
            console.warn('Using local professors data');
        }
    };

    // Search and filter
    useEffect(() => {
        if (!searchTerm.trim()) {
            setFilteredCourses(courses);
            return;
        }
        
        const term = searchTerm.toLowerCase();
        const filtered = courses.filter(course => 
            course.name.toLowerCase().includes(term) ||
            course.code.toLowerCase().includes(term) ||
            (course.type && course.type.toLowerCase().includes(term))
        );
        
        setFilteredCourses(filtered);
    }, [searchTerm, courses]);

    // Get professor name from ID
    const getProfessorName = (profId) => {
        if (!profId) return 'Not assigned';
        const prof = professors.find(p => p.id === profId);
        return prof ? prof.name : 'Unknown professor';
    };

    // Get professor type from ID
    const getProfessorType = (profId) => {
        if (!profId) return '';
        const prof = professors.find(p => p.id === profId);
        if (!prof) return '';
        return prof.type === 'theory' ? 'Theory' : 
               prof.type === 'practical' ? 'Practical' : 
               prof.type === 'both' ? 'Theory & Practical' : '';
    };

    // Delete course
    const deleteCourse = (courseId) => {
        if (window.confirm('Are you sure you want to delete this course?')) {
            const updatedCourses = courses.filter(course => course.id !== courseId);
            setCourses(updatedCourses);
            setFilteredCourses(updatedCourses);
            localStorage.setItem('cs_courses', JSON.stringify(updatedCourses));
            setExpandedCourse(null);
        }
    };

    // Edit course
    const editCourse = (course) => {
        alert(`Edit course: ${course.name}\n\nEditing functionality coming soon!`);
    };

    // View course details
    const toggleCourseDetails = (courseId) => {
        if (expandedCourse === courseId) {
            setExpandedCourse(null);
        } else {
            setExpandedCourse(courseId);
        }
    };

    // Get course type display name
    const getCourseTypeDisplay = (type) => {
        switch(type) {
            case 'theory-only': return 'Theory Only';
            case 'practical-only': return 'Practical Only';
            case 'theory-practical': return 'Theory + Practical';
            default: return type;
        }
    };

    // Get course type icon
    const getCourseTypeIcon = (type) => {
        switch(type) {
            case 'theory-only': return 'fa-chalkboard-teacher';
            case 'practical-only': return 'fa-flask';
            case 'theory-practical': return 'fa-graduation-cap';
            default: return 'fa-book';
        }
    };

    return (
        <div className="courses-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-book-open"></i>
                        View Courses
                    </h1>
                    <p className="page-subtitle">View and manage all registered courses</p>
                </div>
                <div className="user-info">
                    <span>Total Courses: {courses.length}</span>
                </div>
            </div>

            <div className="main-content">
                <div className="view-container">
                    <div className="view-header">
                        <div className="view-title">
                            <i className="fas fa-list-ul"></i>
                            Courses List
                        </div>
                        <div className="view-controls">
                            <div className="search-box">
                                <i className="fas fa-search"></i>
                                <input
                                    type="text"
                                    className="search-input"
                                    placeholder="Search by course name, code, or type..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <select
                                className="filter-select"
                                onChange={(e) => {
                                    const type = e.target.value;
                                    if (type === 'all') {
                                        setFilteredCourses(courses);
                                    } else {
                                        setFilteredCourses(courses.filter(course => course.type === type));
                                    }
                                }}
                            >
                                <option value="all">All Types</option>
                                <option value="theory-only">Theory Only</option>
                                <option value="practical-only">Practical Only</option>
                                <option value="theory-practical">Theory + Practical</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="no-data">
                            <i className="fas fa-spinner fa-spin" style={{ fontSize: '3rem' }}></i>
                            <h3>Loading data...</h3>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="no-data">
                            <i className="fas fa-book" style={{ fontSize: '3rem' }}></i>
                            {searchTerm ? (
                                <>
                                    <h3>No results found</h3>
                                    <p>No courses match "{searchTerm}"</p>
                                </>
                            ) : (
                                <>
                                    <h3>No courses registered</h3>
                                    <p>No courses have been added yet</p>
                                </>
                            )}
                        </div>
                    ) : (
                        <div className="courses-list">
                            {filteredCourses.map((course) => (
                                <div key={course.id} className="course-card">
                                    <div 
                                        className="course-header"
                                        onClick={() => toggleCourseDetails(course.id)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <div className="course-main-info">
                                            <div className="course-code-type">
                                                <strong style={{ fontSize: '1.2rem', color: 'var(--accent)' }}>
                                                    {course.code}
                                                </strong>
                                                <span className="course-type-badge" style={{
                                                    backgroundColor: course.type === 'theory-only' ? 'rgba(141, 169, 196, 0.3)' :
                                                                    course.type === 'practical-only' ? 'rgba(78, 205, 196, 0.3)' :
                                                                    'rgba(255, 209, 102, 0.3)',
                                                    color: course.type === 'theory-only' ? 'var(--primary-light)' :
                                                           course.type === 'practical-only' ? 'var(--accent)' :
                                                           'var(--primary-dark)',
                                                    padding: '4px 12px',
                                                    borderRadius: '20px',
                                                    fontSize: '0.85rem',
                                                    fontWeight: '600',
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: '5px'
                                                }}>
                                                    <i className={`fas ${getCourseTypeIcon(course.type)}`}></i>
                                                    {getCourseTypeDisplay(course.type)}
                                                </span>
                                            </div>
                                            <h3 style={{ margin: '10px 0', color: 'var(--accent)' }}>{course.name}</h3>
                                            <div className="course-stats" style={{ 
                                                display: 'flex', 
                                                gap: '20px',
                                                color: 'var(--primary-light)',
                                                fontSize: '0.9rem'
                                            }}>
                                                <span><i className="fas fa-calendar-alt"></i> {course.weeks} weeks</span>
                                                <span><i className="fas fa-chalkboard-teacher"></i> {course.theorySections || 0} theory sections</span>
                                                <span><i className="fas fa-flask"></i> {course.practicalSections || 0} practical sections</span>
                                            </div>
                                        </div>
                                        <div className="course-actions">
                                            <button 
                                                className="btn-action btn-view"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    toggleCourseDetails(course.id);
                                                }}
                                                title={expandedCourse === course.id ? "Hide Details" : "Show Details"}
                                            >
                                                <i className={`fas fa-${expandedCourse === course.id ? 'chevron-up' : 'chevron-down'}`}></i>
                                            </button>
                                            <button 
                                                className="btn-action btn-edit"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    editCourse(course);
                                                }}
                                                title="Edit"
                                            >
                                                <i className="fas fa-edit"></i>
                                            </button>
                                            <button 
                                                className="btn-action btn-delete"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    deleteCourse(course.id);
                                                }}
                                                title="Delete"
                                            >
                                                <i className="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>

                                    {expandedCourse === course.id && (
                                        <div className="course-details" style={{
                                            padding: '1.5rem',
                                            backgroundColor: 'rgba(11, 37, 69, 0.3)',
                                            borderRadius: '0 0 8px 8px',
                                            borderTop: '1px solid rgba(141, 169, 196, 0.2)'
                                        }}>
                                            <div className="details-grid" style={{
                                                display: 'grid',
                                                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                                                gap: '1.5rem'
                                            }}>
                                                {/* Course Information */}
                                                <div className="info-section">
                                                    <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <i className="fas fa-info-circle"></i>
                                                        Course Information
                                                    </h4>
                                                    <div className="info-list">
                                                        <div className="info-item" style={{ marginBottom: '10px' }}>
                                                            <strong style={{ color: 'var(--primary-light)', display: 'block' }}>Course Code:</strong>
                                                            <span style={{ color: 'var(--accent)' }}>{course.code}</span>
                                                        </div>
                                                        <div className="info-item" style={{ marginBottom: '10px' }}>
                                                            <strong style={{ color: 'var(--primary-light)', display: 'block' }}>Course Name:</strong>
                                                            <span style={{ color: 'var(--accent)' }}>{course.name}</span>
                                                        </div>
                                                        <div className="info-item" style={{ marginBottom: '10px' }}>
                                                            <strong style={{ color: 'var(--primary-light)', display: 'block' }}>Course Type:</strong>
                                                            <span style={{ color: 'var(--accent)' }}>{getCourseTypeDisplay(course.type)}</span>
                                                        </div>
                                                        <div className="info-item" style={{ marginBottom: '10px' }}>
                                                            <strong style={{ color: 'var(--primary-light)', display: 'block' }}>Semester Duration:</strong>
                                                            <span style={{ color: 'var(--accent)' }}>{course.weeks} weeks</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sections Information */}
                                                <div className="info-section">
                                                    <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <i className="fas fa-layer-group"></i>
                                                        Sections Information
                                                    </h4>
                                                    <div className="info-list">
                                                        <div className="info-item" style={{ marginBottom: '10px' }}>
                                                            <strong style={{ color: 'var(--primary-light)', display: 'block' }}>Theory Sections:</strong>
                                                            <span style={{ color: 'var(--accent)' }}>{course.theorySections || 0}</span>
                                                        </div>
                                                        <div className="info-item" style={{ marginBottom: '10px' }}>
                                                            <strong style={{ color: 'var(--primary-light)', display: 'block' }}>Practical Sections:</strong>
                                                            <span style={{ color: 'var(--accent)' }}>{course.practicalSections || 0}</span>
                                                        </div>
                                                        {course.type === 'theory-practical' && (
                                                            <div className="info-item" style={{ marginBottom: '10px' }}>
                                                                <small style={{ color: 'var(--primary-light)' }}>
                                                                    (Practical sections = Theory sections × 2)
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Theory Professors Section */}
                                                {(course.type === 'theory-only' || course.type === 'theory-practical') && (
                                                    <div className="info-section">
                                                        <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <i className="fas fa-user-tie"></i>
                                                            Theory Professors
                                                            <span style={{ 
                                                                backgroundColor: 'rgba(141, 169, 196, 0.3)',
                                                                color: 'var(--accent)',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '0.8rem'
                                                            }}>
                                                                {course.theoryProfessors ? course.theoryProfessors.filter(p => p).length : 0} assigned
                                                            </span>
                                                        </h4>
                                                        {course.theoryProfessors && course.theoryProfessors.length > 0 ? (
                                                            <div className="professors-list">
                                                                {course.theoryProfessors.map((profId, index) => (
                                                                    <div key={index} className="professor-item" style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        padding: '0.75rem',
                                                                        marginBottom: '0.5rem',
                                                                        backgroundColor: profId ? 'rgba(141, 169, 196, 0.1)' : 'rgba(141, 169, 196, 0.05)',
                                                                        borderRadius: '6px',
                                                                        border: `1px solid ${profId ? 'rgba(141, 169, 196, 0.3)' : 'rgba(141, 169, 196, 0.1)'}`
                                                                    }}>
                                                                        <div>
                                                                            <div style={{ fontWeight: '600', color: 'var(--accent)' }}>
                                                                                Theory Professor {index + 1}
                                                                            </div>
                                                                            <div style={{ 
                                                                                color: profId ? 'var(--accent)' : 'var(--primary-light)',
                                                                                fontSize: '0.9rem'
                                                                            }}>
                                                                                {profId ? (
                                                                                    <div>
                                                                                        <div>{getProfessorName(profId)}</div>
                                                                                        <small style={{ color: 'var(--primary-light)' }}>
                                                                                            {getProfessorType(profId)}
                                                                                        </small>
                                                                                    </div>
                                                                                ) : 'Not assigned'}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ 
                                                                            width: '12px', 
                                                                            height: '12px', 
                                                                            borderRadius: '50%',
                                                                            backgroundColor: profId ? 'var(--success)' : 'var(--error)'
                                                                        }}></div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div style={{ color: 'var(--primary-light)', textAlign: 'center', padding: '1rem' }}>
                                                                No theory professors assigned
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Practical Professors Section */}
                                                {(course.type === 'practical-only' || course.type === 'theory-practical') && (
                                                    <div className="info-section">
                                                        <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                            <i className="fas fa-user-graduate"></i>
                                                            Practical Professors
                                                            <span style={{ 
                                                                backgroundColor: 'rgba(78, 205, 196, 0.3)',
                                                                color: 'var(--accent)',
                                                                padding: '2px 8px',
                                                                borderRadius: '12px',
                                                                fontSize: '0.8rem'
                                                            }}>
                                                                {course.practicalProfessors ? course.practicalProfessors.filter(p => p).length : 0} assigned
                                                            </span>
                                                        </h4>
                                                        {course.practicalProfessors && course.practicalProfessors.length > 0 ? (
                                                            <div className="professors-list">
                                                                {course.practicalProfessors.map((profId, index) => (
                                                                    <div key={index} className="professor-item" style={{
                                                                        display: 'flex',
                                                                        justifyContent: 'space-between',
                                                                        alignItems: 'center',
                                                                        padding: '0.75rem',
                                                                        marginBottom: '0.5rem',
                                                                        backgroundColor: profId ? 'rgba(78, 205, 196, 0.1)' : 'rgba(141, 169, 196, 0.05)',
                                                                        borderRadius: '6px',
                                                                        border: `1px solid ${profId ? 'rgba(78, 205, 196, 0.3)' : 'rgba(141, 169, 196, 0.1)'}`
                                                                    }}>
                                                                        <div>
                                                                            <div style={{ fontWeight: '600', color: 'var(--accent)' }}>
                                                                                Practical Professor {index + 1}
                                                                            </div>
                                                                            <div style={{ 
                                                                                color: profId ? 'var(--accent)' : 'var(--primary-light)',
                                                                                fontSize: '0.9rem'
                                                                            }}>
                                                                                {profId ? (
                                                                                    <div>
                                                                                        <div>{getProfessorName(profId)}</div>
                                                                                        <small style={{ color: 'var(--primary-light)' }}>
                                                                                            {getProfessorType(profId)}
                                                                                        </small>
                                                                                    </div>
                                                                                ) : 'Not assigned'}
                                                                            </div>
                                                                        </div>
                                                                        <div style={{ 
                                                                            width: '12px', 
                                                                            height: '12px', 
                                                                            borderRadius: '50%',
                                                                            backgroundColor: profId ? 'var(--success)' : 'var(--error)'
                                                                        }}></div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div style={{ color: 'var(--primary-light)', textAlign: 'center', padding: '1rem' }}>
                                                                No practical professors assigned
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Course Metadata */}
                                                <div className="info-section">
                                                    <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                                        <i className="fas fa-history"></i>
                                                        Course Metadata
                                                    </h4>
                                                    <div className="info-list">
                                                        <div className="info-item" style={{ marginBottom: '10px' }}>
                                                            <strong style={{ color: 'var(--primary-light)', display: 'block' }}>Created:</strong>
                                                            <span style={{ color: 'var(--accent)' }}>
                                                                {course.createdAt ? new Date(course.createdAt).toLocaleDateString() : 'Unknown'}
                                                            </span>
                                                        </div>
                                                        <div className="info-item" style={{ marginBottom: '10px' }}>
                                                            <strong style={{ color: 'var(--primary-light)', display: 'block' }}>Course ID:</strong>
                                                            <span style={{ 
                                                                color: 'var(--primary-light)', 
                                                                fontSize: '0.8rem',
                                                                fontFamily: 'monospace'
                                                            }}>{course.id}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}

                    {filteredCourses.length > 0 && (
                        <div className="table-footer">
                            <div className="table-info">
                                Showing {filteredCourses.length} of {courses.length} courses
                            </div>
                            <div className="pagination">
                                <button className="btn-secondary" style={{ padding: '8px 16px', fontSize: '0.9rem' }}>
                                    <i className="fas fa-download"></i>
                                    Export Data
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default ViewCourses;