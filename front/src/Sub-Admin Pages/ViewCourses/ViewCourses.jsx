import React, { useEffect, useState } from 'react';
import './ViewCourses.css';
import { db } from "../../firebase";
import { collection, getDocs, onSnapshot } from "firebase/firestore";
import { doc, deleteDoc } from "firebase/firestore";
import { updateDoc } from "firebase/firestore";

function ViewCourses() {
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [professors, setProfessors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourse, setExpandedCourse] = useState(null);
    const [expandedCourseId, setExpandedCourseId] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [editData, setEditData] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Load courses from Firestore
                const snapshot = await getDocs(collection(db, "courses"));
                const coursesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCourses(coursesData);
                setFilteredCourses(coursesData);

                // Load professors (من API أو localStorage كما هو)
                fetchProfessors();
            } catch (err) {
                console.error("Error loading courses:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    useEffect(() => {
        const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
            const profs = snapshot.docs
                .map((doc) => ({ id: doc.id, ...doc.data() }))
                .filter((u) => u.role === "professor");

            setProfessors(profs);
        });

        return () => unsubscribe();
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
            (course.type && course.type.toLowerCase().includes(term)) ||
            (course.academicHours && course.academicHours.toString().includes(term))
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
    const deleteCourse = async (courseId) => {
        if (!window.confirm("Are you sure you want to delete this course?")) return;

        try {
            // حذف من Firestore
            await deleteDoc(doc(db, "courses", courseId));

            // حذف من الواجهة
            const updatedCourses = courses.filter(course => course.id !== courseId);
            setCourses(updatedCourses);
            setFilteredCourses(updatedCourses);
            setExpandedCourse(null);

            console.log("Course deleted from Firestore successfully");
        } catch (err) {
            console.error("Error deleting course:", err);
            alert("Failed to delete course from Firestore");
        }
    };

    const saveEdit = async () => {
        if (!editData) return;

        try {
            const { id, ...data } = editData;

            await updateDoc(doc(db, "courses", id), data);

            // إغلاق وضع التعديل
            setEditMode(false);
            setEditData(null);
            setExpandedCourseId(null);

        } catch (error) {
            console.error("Error updating course:", error);
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
        switch (type) {
            case 'theory-only': return 'Theory Only';
            case 'practical-only': return 'Practical Only';
            case 'theory-practical': return 'Theory + Practical';
            default: return type;
        }
    };

    // Get course type icon
    const getCourseTypeIcon = (type) => {
        switch (type) {
            case 'theory-only': return 'fa-chalkboard-teacher';
            case 'practical-only': return 'fa-flask';
            case 'theory-practical': return 'fa-graduation-cap';
            default: return 'fa-book';
        }
    };

    // Format academic hours
    const formatAcademicHours = (hours) => {
        if (!hours) return 'Not specified';
        return `${hours} hour${hours !== 1 ? 's' : ''}`;
    };

    // Get academic hours color based on value
    const getAcademicHoursColor = (hours) => {
        switch (hours) {
            case 1: return '#4ECDC4'; // Teal for 1 hour
            case 2: return '#45B7D1'; // Blue for 2 hours
            case 3: return '#96CEB4'; // Green for 3 hours
            case 4: return '#FFA69E'; // Coral for 4 hours
            default: return '#8DA9C4'; // Default
        }
    };

    return (
        <div className="view-courses-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-book-open"></i>
                        View Courses
                    </h1>
                    <p className="page-subtitle">View and manage all registered courses</p>
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
                                    placeholder="Search by course name, code, type, or academic hours..."
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
                            <select
                                className="filter-select"
                                onChange={(e) => {
                                    const hours = e.target.value;
                                    if (hours === 'all') {
                                        setFilteredCourses(courses);
                                    } else {
                                        setFilteredCourses(courses.filter(course => course.academicHours === parseInt(hours)));
                                    }
                                }}
                            >
                                <option value="all">All Academic Hours</option>
                                <option value="1">1 Hour</option>
                                <option value="2">2 Hours</option>
                                <option value="3">3 Hours</option>
                                <option value="4">4 Hours</option>
                            </select>
                        </div>
                    </div>

                    {loading ? (
                        <div className="no-data">
                            <i className="fas fa-spinner fa-spin"></i>
                            <h3>Loading data...</h3>
                        </div>
                    ) : filteredCourses.length === 0 ? (
                        <div className="no-data">
                            <i className="fas fa-book"></i>
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
                                    >
                                        <div className="course-main-info">
                                            <div className="course-code-type">
                                                <strong>
                                                    {course.code}
                                                </strong>
                                                <span className={`course-type-badge ${course.type}`}>
                                                    <i className={`fas ${getCourseTypeIcon(course.type)}`}></i>
                                                    {getCourseTypeDisplay(course.type)}
                                                </span>
                                                <span className="academic-hours-badge">
                                                    <i className="fas fa-clock"></i>
                                                    {formatAcademicHours(course.academicHours || 2)}
                                                </span>
                                            </div>
                                            <h3>{course.name}</h3>
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
                                                    setExpandedCourseId(course.id);
                                                    setEditMode(true);
                                                    setEditData(course);
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

                                    {/* Edit Mode Box */}
                                    {expandedCourseId === course.id && editMode && (
                                        <div className="details-box">
                                            <h3>Edit Course</h3>

                                            <div className="form-group-inline">
                                                <div className="form-group">
                                                    <label>
                                                        <i className="fas fa-book"></i>
                                                        Course Name
                                                    </label>
                                                    <input
                                                        value={editData.name}
                                                        onChange={(e) =>
                                                            setEditData({ ...editData, name: e.target.value })
                                                        }
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>
                                                        <i className="fas fa-hashtag"></i>
                                                        Course Code
                                                    </label>
                                                    <input
                                                        value={editData.code}
                                                        onChange={(e) =>
                                                            setEditData({ ...editData, code: e.target.value })
                                                        }
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>
                                                        <i className="fas fa-clock"></i>
                                                        Academic Hours
                                                    </label>
                                                    <input
                                                        value={editData.academicHours}
                                                        onChange={(e) =>
                                                            setEditData({ ...editData, academicHours: e.target.value })
                                                        }
                                                    />
                                                </div>

                                                <div className="form-group">
                                                    <label>
                                                        <i className="fas fa-graduation-cap"></i>
                                                        Course Type
                                                    </label>
                                                    <select
                                                        value={editData.type}
                                                        onChange={(e) =>
                                                            setEditData({ ...editData, type: e.target.value })
                                                        }
                                                    >
                                                        <option value="theory-only">Theory Only</option>
                                                        <option value="practical-only">Practical Only</option>
                                                        <option value="theory-practical">Theory + Practical</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <div className="edit-actions">
                                                <button className="btn btn-primary" onClick={saveEdit}>
                                                    <i className="fas fa-save"></i>
                                                    Save Changes
                                                </button>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => {
                                                        setEditMode(false);
                                                        setEditData(null);
                                                    }}
                                                >
                                                    <i className="fas fa-times"></i>
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {/* Course Details */}
                                    {expandedCourse === course.id && !editMode && (
                                        <div className="course-details">
                                            <div className="details-grid">
                                                {/* Course Information */}
                                                <div className="info-section">
                                                    <h4>
                                                        <i className="fas fa-info-circle"></i>
                                                        Course Information
                                                    </h4>
                                                    <div className="info-list">
                                                        <div className="info-item">
                                                            <strong>Course Code:</strong>
                                                            <span>{course.code}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <strong>Course Name:</strong>
                                                            <span>{course.name}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <strong>Academic Hours:</strong>
                                                            <span>
                                                                {formatAcademicHours(course.academicHours || 2)} per week
                                                            </span>
                                                        </div>
                                                        <div className="info-item">
                                                            <strong>Course Type:</strong>
                                                            <span>{getCourseTypeDisplay(course.type)}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <strong>Semester Duration:</strong>
                                                            <span>{course.weeks} weeks</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Sections Information */}
                                                <div className="info-section">
                                                    <h4>
                                                        <i className="fas fa-layer-group"></i>
                                                        Sections Information
                                                    </h4>
                                                    <div className="info-list">
                                                        <div className="info-item">
                                                            <strong>Theory Sections:</strong>
                                                            <span>{course.theorySections || 0}</span>
                                                        </div>
                                                        <div className="info-item">
                                                            <strong>Practical Sections:</strong>
                                                            <span>{course.practicalSections || 0}</span>
                                                        </div>
                                                        {course.type === 'theory-practical' && (
                                                            <div className="info-item">
                                                                <small>
                                                                    (Practical sections = Theory sections × 2)
                                                                </small>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Theory Professors Section */}
                                                {(course.type === 'theory-only' || course.type === 'theory-practical') && (
                                                    <div className="info-section">
                                                        <h4>
                                                            <i className="fas fa-user-tie"></i>
                                                            Theory Professors
                                                            <span className="professor-count">
                                                                {course.theoryProfessors ? course.theoryProfessors.filter(p => p).length : 0} assigned
                                                            </span>
                                                        </h4>
                                                        {course.theoryProfessors && course.theoryProfessors.length > 0 ? (
                                                            <div className="professors-list">
                                                                {course.theoryProfessors.map((profId, index) => (
                                                                    <div key={index} className={`professor-item ${profId ? 'assigned' : 'unassigned'}`}>
                                                                        <div>
                                                                            <strong>Theory Professor {index + 1}</strong>
                                                                            <div className="professor-name">
                                                                                {profId ? (
                                                                                    <>
                                                                                        <div>{getProfessorName(profId)}</div>
                                                                                        <small>{getProfessorType(profId)}</small>
                                                                                    </>
                                                                                ) : 'Not assigned'}
                                                                            </div>
                                                                        </div>
                                                                        <div></div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="no-professors">
                                                                No theory professors assigned
                                                            </div>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Practical Professors Section */}
                                                {(course.type === 'practical-only' || course.type === 'theory-practical') && (
                                                    <div className="info-section">
                                                        <h4>
                                                            <i className="fas fa-user-graduate"></i>
                                                            Practical Professors
                                                            <span className="professor-count">
                                                                {course.practicalProfessors ? course.practicalProfessors.filter(p => p).length : 0} assigned
                                                            </span>
                                                        </h4>
                                                        {course.practicalProfessors && course.practicalProfessors.length > 0 ? (
                                                            <div className="professors-list">
                                                                {course.practicalProfessors.map((profId, index) => (
                                                                    <div key={index} className={`professor-item ${profId ? 'assigned' : 'unassigned'}`}>
                                                                        <div>
                                                                            <strong>Practical Professor {index + 1}</strong>
                                                                            <div className="professor-name">
                                                                                {profId ? (
                                                                                    <>
                                                                                        <div>{getProfessorName(profId)}</div>
                                                                                        <small>{getProfessorType(profId)}</small>
                                                                                    </>
                                                                                ) : 'Not assigned'}
                                                                            </div>
                                                                        </div>
                                                                        <div></div>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        ) : (
                                                            <div className="no-professors">
                                                                No practical professors assigned
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
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
                                {courses.length > 0 && (
                                    <span className="total-hours">
                                        Total Academic Hours: {courses.reduce((total, course) =>
                                            total + ((course.academicHours || 2) * (course.weeks || 15)), 0
                                        )} hours across all courses
                                    </span>
                                )}
                            </div>
                            <div className="pagination">
                                <button className="btn-secondary">
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