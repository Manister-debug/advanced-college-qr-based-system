import React, { useEffect, useState } from 'react';
import './ViewTermCourses.css';
import { db } from "../../firebase";
import {
    collection,
    query,
    where,
    getDocs,
    onSnapshot
} from "firebase/firestore";
import { useAuth } from "../../context/AuthContext.jsx";

function ViewTermCourses() {
    const { user, getLecturerId } = useAuth();
    const [assignedCourses, setAssignedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedTerm, setSelectedTerm] = useState('fall2024');
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalTheorySections: 0,
        totalPracticalSections: 0,
        totalAcademicHours: 0
    });
    const [professorsMap, setProfessorsMap] = useState({});

    // Fetch all professors for lookup
    useEffect(() => {
        const fetchProfessors = async () => {
            try {
                const professorsRef = collection(db, "professors");
                const snapshot = await getDocs(professorsRef);
                const professorsData = {};
                snapshot.forEach(doc => {
                    const prof = doc.data();
                    professorsData[prof.LecturerID || doc.id] = prof;
                });
                setProfessorsMap(professorsData);
            } catch (error) {
                console.error("Error fetching professors:", error);
            }
        };

        fetchProfessors();
    }, []);

    // Fetch courses assigned to the current professor using LecturerID
    useEffect(() => {
        if (!user || !getLecturerId()) return;

        const lecturerId = getLecturerId();
        console.log("Looking for courses assigned to lecturer ID:", lecturerId);

        const fetchAssignedCourses = async () => {
            try {
                setLoading(true);

                // Query all courses
                const coursesRef = collection(db, "courses");
                const snapshot = await getDocs(coursesRef);
                const allCourses = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                console.log("Total courses in system:", allCourses.length);

                // Filter courses where professor's LecturerID is in theoryProfessors or practicalProfessors
                const professorCourses = allCourses.filter(course => {
                    const theoryProfessors = Array.isArray(course.theoryProfessors) ? course.theoryProfessors : [];
                    const practicalProfessors = Array.isArray(course.practicalProfessors) ? course.practicalProfessors : [];

                    const isTheoryProfessor = theoryProfessors.includes(lecturerId);
                    const isPracticalProfessor = practicalProfessors.includes(lecturerId);

                    return isTheoryProfessor || isPracticalProfessor;
                });

                console.log("Courses assigned to professor:", professorCourses.length);

                // Enrich course data with professor role and section details
                const enrichedCourses = professorCourses.map(course => {
                    const theoryProfessors = Array.isArray(course.theoryProfessors) ? course.theoryProfessors : [];
                    const practicalProfessors = Array.isArray(course.practicalProfessors) ? course.practicalProfessors : [];

                    const isTheoryProf = theoryProfessors.includes(lecturerId);
                    const isPracticalProf = practicalProfessors.includes(lecturerId);

                    // Find specific sections assigned to this professor
                    let assignedTheorySections = [];
                    let assignedPracticalSections = [];

                    if (isTheoryProf) {
                        theoryProfessors.forEach((profId, index) => {
                            if (profId === lecturerId) {
                                assignedTheorySections.push(index + 1); // Section numbers start from 1
                            }
                        });
                    }

                    if (isPracticalProf) {
                        practicalProfessors.forEach((profId, index) => {
                            if (profId === lecturerId) {
                                assignedPracticalSections.push(index + 1);
                            }
                        });
                    }

                    // Determine professor role for this course
                    let professorRole = '';
                    if (isTheoryProf && isPracticalProf) {
                        professorRole = 'Both';
                    } else if (isTheoryProf) {
                        professorRole = 'Theory';
                    } else if (isPracticalProf) {
                        professorRole = 'Practical';
                    }

                    return {
                        ...course,
                        professorRole,
                        assignedTheorySections,
                        assignedPracticalSections,
                        assignedTheoryCount: assignedTheorySections.length,
                        assignedPracticalCount: assignedPracticalSections.length,
                        isTheoryProf,
                        isPracticalProf
                    };
                });

                setAssignedCourses(enrichedCourses);

                // Calculate statistics
                const totalCourses = enrichedCourses.length;
                const totalTheorySections = enrichedCourses.reduce((sum, course) =>
                    sum + course.assignedTheoryCount, 0);
                const totalPracticalSections = enrichedCourses.reduce((sum, course) =>
                    sum + course.assignedPracticalCount, 0);
                const totalAcademicHours = enrichedCourses.reduce((sum, course) =>
                    sum + (course.academicHours * (course.assignedTheoryCount + course.assignedPracticalCount)), 0);

                setStats({
                    totalCourses,
                    totalTheorySections,
                    totalPracticalSections,
                    totalAcademicHours
                });

            } catch (error) {
                console.error("Error fetching assigned courses:", error);
            } finally {
                setLoading(false);
            }
        };

        // Real-time listener for course updates
        const unsubscribe = onSnapshot(collection(db, "courses"), () => {
            fetchAssignedCourses();
        });

        fetchAssignedCourses();

        return () => unsubscribe();
    }, [user, getLecturerId]);

    // Get professor name by LecturerID
    const getProfessorName = (lecturerId) => {
        if (!lecturerId) return 'Unknown';
        const prof = professorsMap[lecturerId];
        return prof ? prof.name : `ID: ${lecturerId}`;
    };

    if (loading) {
        return (
            <div className="view-term-courses-page">
                <div className="page-header">
                    <div className="header-content">
                        <h1>
                            <i className="fas fa-book"></i>
                            My Assigned Courses
                        </h1>
                    </div>
                </div>
                <div className="loading-container">
                    <div className="spinner"></div>
                    <p>Loading your courses...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="view-term-courses-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-book"></i>
                        My Assigned Courses
                    </h1>
                    <p className="page-subtitle">
                        {user?.name} | {user?.specialization} | Lecturer ID: {user?.LecturerID || user?.lecturerId} | Academic Term: {selectedTerm.toUpperCase()}
                    </p>
                </div>
                <div className="user-info">
                    <span>Professor Portal</span>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="stats-container">
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(78, 205, 196, 0.1)' }}>
                            <i className="fas fa-book-open" style={{ color: '#4ecdc4' }}></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalCourses}</h3>
                            <p>Total Courses</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(255, 107, 107, 0.1)' }}>
                            <i className="fas fa-chalkboard-teacher" style={{ color: '#ff6b6b' }}></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalTheorySections}</h3>
                            <p>Theory Sections</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(77, 171, 247, 0.1)' }}>
                            <i className="fas fa-flask" style={{ color: '#4dabf7' }}></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalPracticalSections}</h3>
                            <p>Practical Sections</p>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon" style={{ background: 'rgba(255, 193, 7, 0.1)' }}>
                            <i className="fas fa-clock" style={{ color: '#ffc107' }}></i>
                        </div>
                        <div className="stat-content">
                            <h3>{stats.totalAcademicHours}</h3>
                            <p>Total Hours/Week</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="main-content">
                {/* Term Selection */}
                <div className="term-selector">
                    <div className="form-group" style={{ maxWidth: '300px' }}>
                        <label className="form-label">
                            <i className="fas fa-calendar-alt"></i>
                            Select Academic Term
                        </label>
                        <select
                            className="form-input"
                            value={selectedTerm}
                            onChange={(e) => setSelectedTerm(e.target.value)}
                        >
                            <option value="fall2024">Fall 2024</option>
                            <option value="spring2025">Spring 2025</option>
                            <option value="summer2025">Summer 2025</option>
                        </select>
                    </div>
                </div>

                {/* Courses Table */}
                <div className="courses-table-container">
                    {assignedCourses.length === 0 ? (
                        <div className="empty-state">
                            <i className="fas fa-book" style={{ fontSize: '4rem', color: 'var(--primary-light)', marginBottom: '1rem' }}></i>
                            <h3>No Courses Assigned</h3>
                            <p>You haven't been assigned to any courses yet.</p>
                            <p>Contact the administration for course assignments.</p>
                        </div>
                    ) : (
                        <div className="table-responsive">
                            <table className="courses-table">
                                <thead>
                                    <tr>
                                        <th>Course Code</th>
                                        <th>Course Name</th>
                                        <th>Type</th>
                                        <th>Your Role</th>
                                        <th>Assigned Sections</th>
                                        <th>Academic Hours</th>
                                        <th>Semester Weeks</th>
                                        <th>Total Sections</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {assignedCourses.map((course) => (
                                        <tr key={course.id}>
                                            <td>
                                                <strong className="course-code">{course.code}</strong>
                                            </td>
                                            <td>
                                                <div className="course-name">{course.name}</div>
                                                <small className="course-meta">ID: {course.id}</small>
                                            </td>
                                            <td>
                                                <span className={`course-type-badge ${course.type}`}>
                                                    {course.type === 'theory-only' && 'Theory Only'}
                                                    {course.type === 'practical-only' && 'Practical Only'}
                                                    {course.type === 'theory-practical' && 'Theory + Practical'}
                                                </span>
                                            </td>
                                            <td>
                                                <span className={`role-badge ${course.professorRole.toLowerCase()}`}>
                                                    {course.professorRole}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="assigned-sections">
                                                    {course.assignedTheorySections.length > 0 && (
                                                        <div className="section-group">
                                                            <span className="section-label">Theory:</span>
                                                            <div className="section-numbers">
                                                                {course.assignedTheorySections.map(section => (
                                                                    <span key={`theory-${section}`} className="section-number">
                                                                        Sec {section}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                    {course.assignedPracticalSections.length > 0 && (
                                                        <div className="section-group">
                                                            <span className="section-label">Practical:</span>
                                                            <div className="section-numbers">
                                                                {course.assignedPracticalSections.map(section => (
                                                                    <span key={`practical-${section}`} className="section-number">
                                                                        Sec {section}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </td>
                                            <td>
                                                <div className="academic-hours">
                                                    <i className="fas fa-clock" style={{ marginRight: '5px' }}></i>
                                                    {course.academicHours} hour{course.academicHours !== 1 ? 's' : ''}/week
                                                </div>
                                            </td>
                                            <td>
                                                <div className="weeks-info">
                                                    {course.weeks} weeks
                                                </div>
                                            </td>
                                            <td>
                                                <div className="total-sections">
                                                    <div>
                                                        <i className="fas fa-chalkboard-teacher" style={{ marginRight: '5px' }}></i>
                                                        Theory: {course.theorySections || 0}
                                                    </div>
                                                    <div>
                                                        <i className="fas fa-flask" style={{ marginRight: '5px' }}></i>
                                                        Practical: {course.practicalSections || 0}
                                                    </div>
                                                </div>
                                            </td>
                                            <td>
                                                <div className="course-actions">
                                                    <button className="action-btn view-btn" title="View Details">
                                                        <i className="fas fa-eye"></i>
                                                    </button>
                                                    <button className="action-btn schedule-btn" title="View Schedule">
                                                        <i className="fas fa-calendar"></i>
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Course Summary */}
                {assignedCourses.length > 0 && (
                    <div className="summary-card">
                        <h3>
                            <i className="fas fa-chart-bar"></i>
                            Course Summary
                        </h3>
                        <div className="summary-grid">
                            <div className="summary-item">
                                <div className="summary-label">Weekly Teaching Hours</div>
                                <div className="summary-value">{stats.totalAcademicHours} hours</div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Total Sections Assigned</div>
                                <div className="summary-value">
                                    {stats.totalTheorySections + stats.totalPracticalSections} sections
                                </div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Course Types</div>
                                <div className="summary-value">
                                    {assignedCourses.filter(c => c.type === 'theory-only').length} Theory Only,
                                    {assignedCourses.filter(c => c.type === 'practical-only').length} Practical Only,
                                    {assignedCourses.filter(c => c.type === 'theory-practical').length} Combined
                                </div>
                            </div>
                            <div className="summary-item">
                                <div className="summary-label">Your Roles</div>
                                <div className="summary-value">
                                    {assignedCourses.filter(c => c.professorRole === 'Theory').length} Theory,
                                    {assignedCourses.filter(c => c.professorRole === 'Practical').length} Practical,
                                    {assignedCourses.filter(c => c.professorRole === 'Both').length} Both
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default ViewTermCourses;