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
    const [stats, setStats] = useState({
        totalCourses: 0,
        totalTheorySections: 0,
        totalPracticalSections: 0,
        totalAcademicHours: 0
    });
    const [professorsMap, setProfessorsMap] = useState({});
    const [attendanceLogs, setAttendanceLogs] = useState([]);
    const [attendanceStats, setAttendanceStats] = useState({
        totalStudents: 0,
        present: 0,
        absent: 0,
        late: 0
    });
    const [selectedCourse, setSelectedCourse] = useState('all');
    const [dateRange, setDateRange] = useState('today');

    // Generate fake attendance data
    const generateFakeAttendanceData = () => {
        const fakeLogs = [];
        const statuses = ['Present', 'Absent', 'Late'];
        const courses = ['CS 101', 'Math 201', 'Physics 150', 'CS 102', 'Chemistry 101'];
        const studentNames = [
            'Ahmed Mohamed', 'Fatima Ali', 'Omar Hassan', 'Nour Ahmed', 'Youssef Mahmoud',
            'Mariam Samir', 'Khaled Ibrahim', 'Laila Abdelrahman', 'Mostafa Ahmed', 'Salma Omar'
        ];
        
        // Generate 20 fake attendance records
        for (let i = 0; i < 20; i++) {
            const randomDate = new Date();
            randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 7));
            
            const randomTime = `${Math.floor(Math.random() * 12) + 1}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')} ${Math.random() > 0.5 ? 'AM' : 'PM'}`;
            const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
            const randomCourse = courses[Math.floor(Math.random() * courses.length)];
            const randomStudent = studentNames[Math.floor(Math.random() * studentNames.length)];
            
            fakeLogs.push({
                id: `log_${i}`,
                studentName: randomStudent,
                studentId: `S${2024000 + i}`,
                courseCode: randomCourse,
                courseName: `${randomCourse} Introduction`,
                date: randomDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
                time: randomTime,
                status: randomStatus,
                timestamp: randomDate,
                section: `Section ${Math.floor(Math.random() * 3) + 1}`,
                notes: randomStatus === 'Late' ? 'Arrived 15 minutes late' : randomStatus === 'Absent' ? 'No excuse provided' : ''
            });
        }
        
        // Sort by most recent
        return fakeLogs.sort((a, b) => b.timestamp - a.timestamp);
    };

    // Calculate attendance statistics
    useEffect(() => {
        const logs = generateFakeAttendanceData();
        setAttendanceLogs(logs);
        
        const total = logs.length;
        const present = logs.filter(log => log.status === 'Present').length;
        const absent = logs.filter(log => log.status === 'Absent').length;
        const late = logs.filter(log => log.status === 'Late').length;
        
        setAttendanceStats({
            totalStudents: total,
            present,
            absent,
            late
        });
    }, []);

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
    }, [user, getLecturerId()]);

    // Get professor name by LecturerID
    const getProfessorName = (lecturerId) => {
        if (!lecturerId) return 'Unknown';
        const prof = professorsMap[lecturerId];
        return prof ? prof.name : `ID: ${lecturerId}`;
    };

    // Filter attendance logs
    const filteredAttendanceLogs = attendanceLogs.filter(log => {
        if (selectedCourse !== 'all' && log.courseCode !== selectedCourse) return false;
        if (dateRange === 'today') {
            const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
            return log.date === today;
        }
        return true;
    });

    const handleStatusUpdate = (logId, newStatus) => {
        setAttendanceLogs(prev => prev.map(log => 
            log.id === logId ? { ...log, status: newStatus } : log
        ));
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
            {/* Page Header */}
            <div className="page-header">
                <div className="header-content">
                    <div className="page-title">
                        <i className="fas fa-book"></i>
                        My Assigned Courses & Attendance Logs
                    </div>
                    <div className="page-subtitle">
                        {user?.name} | {user?.specialization} | Lecturer ID: {user?.LecturerID || user?.lecturerId}
                    </div>
                    
                    {/* Statistics Grid */}
                    <div className="stats-grid">
                        <div className="stat-card">
                            <div className="stat-icon total">
                                <i className="fas fa-book-open"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.totalCourses}</span>
                                <span className="stat-label">Total Courses</span>
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-icon present">
                                <i className="fas fa-chalkboard-teacher"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.totalTheorySections + stats.totalPracticalSections}</span>
                                <span className="stat-label">Total Sections</span>
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-icon absent">
                                <i className="fas fa-clock"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{stats.totalAcademicHours}</span>
                                <span className="stat-label">Weekly Hours</span>
                            </div>
                        </div>
                        
                        <div className="stat-card">
                            <div className="stat-icon late">
                                <i className="fas fa-users"></i>
                            </div>
                            <div className="stat-info">
                                <span className="stat-number">{attendanceStats.totalStudents}</span>
                                <span className="stat-label">Attendance Records</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className="main-content">
                {/* Left Column: Courses Table */}
                <div className="courses-section">
                    <div className="section-header">
                        <h2>
                            <i className="fas fa-list-alt"></i>
                            Assigned Courses
                        </h2>
                        <p className="section-subtitle">Courses you are currently teaching</p>
                    </div>
                    
                    <div className="courses-table-container">
                        {assignedCourses.length === 0 ? (
                            <div className="empty-state">
                                <i className="fas fa-book"></i>
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
                                            <th>Total Sections</th>
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
                                                        <i className="fas fa-clock"></i>
                                                        {course.academicHours} hour{course.academicHours !== 1 ? 's' : ''}/week
                                                    </div>
                                                </td>
                                                <td>
                                                    <div className="total-sections">
                                                        <div>
                                                            <i className="fas fa-chalkboard-teacher"></i>
                                                            Theory: {course.theorySections || 0}
                                                        </div>
                                                        <div>
                                                            <i className="fas fa-flask"></i>
                                                            Practical: {course.practicalSections || 0}
                                                        </div>
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
                
                {/* Right Column: Attendance Logs */}
                <div className="attendance-section">
                    <div className="section-header">
                        <h2>
                            <i className="fas fa-clipboard-check"></i>
                            Recent Attendance Logs
                        </h2>
                        <p className="section-subtitle">Latest student attendance records</p>
                    </div>
                    
                    {/* Attendance Filters */}
                    <div className="attendance-filters">
                        <div className="filter-group">
                            <label>
                                <i className="fas fa-filter"></i>
                                Filter by Course
                            </label>
                            <select 
                                className="filter-select"
                                value={selectedCourse}
                                onChange={(e) => setSelectedCourse(e.target.value)}
                            >
                                <option value="all">All Courses</option>
                                <option value="CS 101">CS 101</option>
                                <option value="Math 201">Math 201</option>
                                <option value="Physics 150">Physics 150</option>
                            </select>
                        </div>
                        
                        <div className="filter-group">
                            <label>
                                <i className="fas fa-calendar"></i>
                                Date Range
                            </label>
                            <select 
                                className="filter-select"
                                value={dateRange}
                                onChange={(e) => setDateRange(e.target.value)}
                            >
                                <option value="today">Today</option>
                                <option value="week">This Week</option>
                                <option value="all">All Time</option>
                            </select>
                        </div>
                        
                        <div className="attendance-stats">
                            <div className="stat-chip present">
                                <span className="stat-number">{attendanceStats.present}</span>
                                <span className="stat-label">Present</span>
                            </div>
                            <div className="stat-chip absent">
                                <span className="stat-number">{attendanceStats.absent}</span>
                                <span className="stat-label">Absent</span>
                            </div>
                            <div className="stat-chip late">
                                <span className="stat-number">{attendanceStats.late}</span>
                                <span className="stat-label">Late</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Attendance Logs Grid */}
                    <div className="attendance-logs-grid">
                        {filteredAttendanceLogs.length === 0 ? (
                            <div className="empty-state">
                                <i className="fas fa-clipboard-list"></i>
                                <h3>No Attendance Records</h3>
                                <p>No attendance records found for the selected filters.</p>
                            </div>
                        ) : (
                            filteredAttendanceLogs.map(log => (
                                <div key={log.id} className="attendance-log-card">
                                    <div className="log-header">
                                        <div className="student-avatar">
                                            {log.studentName.charAt(0)}
                                        </div>
                                        <div className="student-info">
                                            <h4 className="student-name">{log.studentName}</h4>
                                            <div className="student-details">
                                                <span className="student-id">
                                                    <i className="fas fa-id-card"></i>
                                                    {log.studentId}
                                                </span>
                                                <span className="student-course">
                                                    <i className="fas fa-book"></i>
                                                    {log.courseCode}
                                                </span>
                                            </div>
                                        </div>
                                        <div className={`status-badge ${log.status.toLowerCase()}`}>
                                            {log.status}
                                        </div>
                                    </div>
                                    
                                    <div className="log-details">
                                        <div className="detail-row">
                                            <div className="detail-item">
                                                <i className="fas fa-calendar"></i>
                                                <div>
                                                    <div className="detail-label">Date</div>
                                                    <div className="detail-value">{log.date}</div>
                                                </div>
                                            </div>
                                            <div className="detail-item">
                                                <i className="fas fa-clock"></i>
                                                <div>
                                                    <div className="detail-label">Time</div>
                                                    <div className="detail-value">{log.time}</div>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="detail-row">
                                            <div className="detail-item">
                                                <i className="fas fa-users"></i>
                                                <div>
                                                    <div className="detail-label">Section</div>
                                                    <div className="detail-value">{log.section}</div>
                                                </div>
                                            </div>
                                            <div className="detail-item">
                                                <i className="fas fa-sticky-note"></i>
                                                <div>
                                                    <div className="detail-label">Notes</div>
                                                    <div className="detail-value">{log.notes || 'No notes'}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="log-actions">
                                        <button 
                                            className={`action-btn ${log.status === 'Present' ? 'active' : ''}`}
                                            onClick={() => handleStatusUpdate(log.id, 'Present')}
                                        >
                                            <i className="fas fa-check"></i>
                                            Present
                                        </button>
                                        <button 
                                            className={`action-btn ${log.status === 'Absent' ? 'active' : ''}`}
                                            onClick={() => handleStatusUpdate(log.id, 'Absent')}
                                        >
                                            <i className="fas fa-times"></i>
                                            Absent
                                        </button>
                                        <button 
                                            className={`action-btn ${log.status === 'Late' ? 'active' : ''}`}
                                            onClick={() => handleStatusUpdate(log.id, 'Late')}
                                        >
                                            <i className="fas fa-clock"></i>
                                            Late
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    
                    {/* Attendance Summary */}
                    <div className="attendance-summary">
                        <h3>
                            <i className="fas fa-chart-pie"></i>
                            Attendance Overview
                        </h3>
                        <div className="summary-stats">
                            <div className="summary-stat">
                                <div className="stat-label">Overall Attendance Rate</div>
                                <div className="stat-value">
                                    {attendanceStats.totalStudents > 0 
                                        ? Math.round((attendanceStats.present / attendanceStats.totalStudents) * 100)
                                        : 0}%
                                </div>
                                <div className="stat-progress">
                                    <div 
                                        className="progress-bar" 
                                        style={{ 
                                            width: attendanceStats.totalStudents > 0 
                                                ? `${(attendanceStats.present / attendanceStats.totalStudents) * 100}%` 
                                                : '0%' 
                                        }}
                                    ></div>
                                </div>
                            </div>
                            
                            <div className="summary-stat">
                                <div className="stat-label">Average Class Size</div>
                                <div className="stat-value">
                                    {attendanceStats.totalStudents > 0 
                                        ? Math.round(attendanceStats.totalStudents / 3)
                                        : 0} students
                                </div>
                                <div className="stat-note">Based on last 3 sessions</div>
                            </div>
                            
                            <div className="summary-stat">
                                <div className="stat-label">Most Frequent Status</div>
                                <div className="stat-value">
                                    {['Present', 'Absent', 'Late'].reduce((a, b) => 
                                        attendanceStats[a.toLowerCase()] > attendanceStats[b.toLowerCase()] ? a : b
                                    )}
                                </div>
                                <div className="stat-note">Common trend in recent classes</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ViewTermCourses;