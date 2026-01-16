import React, { useState, useEffect } from 'react';
import './AttendanceLog.css';

export default function AttendanceLog() {
  const [activeFilter, setActiveFilter] = useState('student');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekFilter, setWeekFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedCard, setExpandedCard] = useState(null);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [searchTerm, setSearchTerm] = useState('');

  // Mock data for professors
  const [professors] = useState([
    { id: 'p1', fullName: 'Dr. Mohamad Ahmad' },
    { id: 'p2', fullName: 'Dr. Ali Battour' },
    { id: 'p3', fullName: 'Dr. Salah Dawaji' },
    { id: 'p4', fullName: 'Dr. Mahmoud Haidar' },
    { id: 'p5', fullName: 'Eng. Omar Kassem' },
  ]);

  // Mock data for students
  const [students] = useState([
    { id: 's1', name: 'Ahmad Hassan', studentId: '20210001' },
    { id: 's2', name: 'Fatima Al-Masri', studentId: '20210002' },
    { id: 's3', name: 'Omar Khalil', studentId: '20210003' },
    { id: 's4', name: 'Layla Taha', studentId: '20210004' },
    { id: 's5', name: 'Youssef Abbas', studentId: '20210005' },
    { id: 's6', name: 'Nour Mansour', studentId: '20210006' },
    { id: 's7', name: 'Kareem Zidan', studentId: '20210007' },
    { id: 's8', name: 'Sara Ibrahim', studentId: '20210008' },
    { id: 's9', name: 'Mohamad Saad', studentId: '20210009' },
    { id: 's10', name: 'Hanaa Farouk', studentId: '20210010' },
  ]);

  // Generate fake attendance records
  const generateFakeAttendanceRecords = () => {
    const coursesData = [
      { id: 'cs101', code: 'CS101', name: 'Introduction to Programming', type: 'theory-practical' },
      { id: 'cs201', code: 'CS201', name: 'Data Structures', type: 'theory-practical' },
      { id: 'cs301', code: 'CS301', name: 'Database Systems', type: 'theory-only' },
      { id: 'cs401', code: 'CS401', name: 'Software Engineering', type: 'theory-practical' },
      { id: 'cs202', code: 'CS202', name: 'Algorithms', type: 'theory-only' },
    ];

    const attendanceRecords = [];
    const statuses = ['present', 'absent', 'late', 'excused'];
    const startTimes = ['08:00', '09:30', '11:00', '13:00', '14:30'];
    const endTimes = ['09:15', '10:45', '12:15', '14:15', '15:45'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const rooms = ['Room 101', 'Lab A', 'Room 201', 'Lab B', 'Room 301'];

    // Generate records for each student
    students.forEach(student => {
      // Each student has 5-8 attendance records
      const recordCount = Math.floor(Math.random() * 4) + 5;
      
      for (let i = 0; i < recordCount; i++) {
        const course = coursesData[Math.floor(Math.random() * coursesData.length)];
        const professor = professors[Math.floor(Math.random() * professors.length)];
        const day = days[Math.floor(Math.random() * days.length)];
        const timeIndex = Math.floor(Math.random() * startTimes.length);
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const room = rooms[Math.floor(Math.random() * rooms.length)];
        const week = Math.floor(Math.random() * 15) + 1;
        
        // Generate date within the semester (last 3 months)
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 90));
        const formattedDate = date.toLocaleDateString('en-US', {
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });

        attendanceRecords.push({
          id: `att-${student.id}-${i}`,
          studentId: student.id,
          studentName: student.name,
          studentNumber: student.studentId,
          courseId: course.id,
          courseCode: course.code,
          courseName: course.name,
          professorId: professor.id,
          professorName: professor.fullName,
          date: formattedDate,
          day: day,
          startTime: startTimes[timeIndex],
          endTime: endTimes[timeIndex],
          status: status,
          week: week,
          room: room,
          timestamp: date.toISOString(),
          notes: Math.random() > 0.7 ? 'Late submission allowed' : '',
        });
      }
    });

    return { courses: coursesData, attendanceRecords };
  };

  // Load attendance data
  useEffect(() => {
    const loadData = () => {
      setLoading(true);
      try {
        const { courses: coursesData, attendanceRecords } = generateFakeAttendanceRecords();
        setCourses(coursesData);
        setAttendanceRecords(attendanceRecords);
      } catch (error) {
        console.error('Error loading attendance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const [attendanceRecords, setAttendanceRecords] = useState([]);

  // Get unique weeks from attendance records
  const getUniqueWeeks = () => {
    const weeks = new Set();
    attendanceRecords.forEach(record => {
      if (record.week) weeks.add(record.week);
    });
    return Array.from(weeks).sort((a, b) => a - b);
  };

  // Filter attendance records based on active filter
  const getFilteredRecords = () => {
    let records = [...attendanceRecords];

    // Apply search filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      records = records.filter(record =>
        record.studentName.toLowerCase().includes(term) ||
        record.courseCode.toLowerCase().includes(term) ||
        record.courseName.toLowerCase().includes(term) ||
        record.professorName.toLowerCase().includes(term)
      );
    }

    // Apply course filter
    if (selectedCourse) {
      records = records.filter(record => record.courseId === selectedCourse.id);
    }

    // Apply week filter if not 'all'
    if (weekFilter !== 'all') {
      records = records.filter(record => {
        if (weekFilter.includes('week')) {
          return parseInt(weekFilter.replace('week', '')) === record.week;
        }
        return record.week === parseInt(weekFilter);
      });
    }

    // Apply date filter if set
    if (dateFilter) {
      records = records.filter(record =>
        record.date.toLowerCase().includes(dateFilter.toLowerCase())
      );
    }

    return records;
  };

  // Get status badge style
  const getStatusStyle = (status) => {
    switch (status) {
      case 'present':
        return { backgroundColor: 'rgba(42, 157, 143, 0.2)', color: '#2a9d8f' };
      case 'absent':
        return { backgroundColor: 'rgba(230, 57, 70, 0.2)', color: '#e63946' };
      case 'late':
        return { backgroundColor: 'rgba(255, 179, 0, 0.2)', color: '#ffb300' };
      case 'excused':
        return { backgroundColor: 'rgba(42, 90, 156, 0.2)', color: '#2a5a9c' };
      default:
        return { backgroundColor: 'rgba(42, 90, 156, 0.2)', color: '#2a5a9c' };
    }
  };

  // Get status text
  const getStatusText = (status) => {
    switch (status) {
      case 'present': return 'Present';
      case 'absent': return 'Absent';
      case 'late': return 'Late';
      case 'excused': return 'Excused';
      default: return status;
    }
  };

  // Handle attendance status change
  const updateAttendanceStatus = (recordId, newStatus) => {
    setAttendanceRecords(prev => prev.map(record => {
      if (record.id === recordId) {
        return { ...record, status: newStatus };
      }
      return record;
    }));
  };

  // Toggle card expansion
  const toggleCardExpansion = (cardId) => {
    setExpandedCard(expandedCard === cardId ? null : cardId);
  };

  // Handle view mode change
  const toggleViewMode = () => {
    setViewMode(viewMode === 'grid' ? 'list' : 'grid');
  };

  return (
    <div className="attendance-log-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-clipboard-check"></i>
            Attendance Log
          </h1>
          <p className="page-subtitle">Track student attendance records</p>
        </div>
      </div>

      <div className="main-content">
        {/* Left Sidebar - Filters */}
        <div className="filters-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <i className="fas fa-filter"></i>
              Filter Options
            </h3>
            <div className="search-box">
              <i className="fas fa-search"></i>
              <input
                type="text"
                placeholder="Search records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <i className="fas fa-calendar-alt"></i>
              Date & Time
            </h3>
            <div className="search-box">
              <i className="fas fa-calendar"></i>
              <input
                type="text"
                placeholder="Filter by date..."
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-title">
              <i className="fas fa-filter"></i>
              Filter By
            </h3>
            <div className="filter-options">
              <button
                className={`filter-option ${activeFilter === 'student' ? 'active' : ''}`}
                onClick={() => setActiveFilter('student')}
              >
                <i className="fas fa-user-graduate"></i>
                Filter by Student
              </button>
              <button
                className={`filter-option ${activeFilter === 'course' ? 'active' : ''}`}
                onClick={() => setActiveFilter('course')}
              >
                <i className="fas fa-book"></i>
                Filter by Course
              </button>
              <button
                className={`filter-option ${activeFilter === 'professor' ? 'active' : ''}`}
                onClick={() => setActiveFilter('professor')}
              >
                <i className="fas fa-chalkboard-teacher"></i>
                Filter by Professor
              </button>
              <button
                className={`filter-option ${activeFilter === 'week' ? 'active' : ''}`}
                onClick={() => setActiveFilter('week')}
              >
                <i className="fas fa-calendar-week"></i>
                Filter by Week
              </button>
            </div>
          </div>

          {activeFilter === 'week' && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <i className="fas fa-calendar-week"></i>
                Select Week
              </h3>
              <select
                className="filter-select"
                value={weekFilter}
                onChange={(e) => setWeekFilter(e.target.value)}
              >
                <option value="all">All Weeks</option>
                {getUniqueWeeks().map(week => (
                  <option key={week} value={`week${week}`}>Week {week}</option>
                ))}
              </select>
            </div>
          )}

          {activeFilter === 'course' && (
            <div className="sidebar-section">
              <h3 className="sidebar-title">
                <i className="fas fa-book"></i>
                Select Course
              </h3>
              <div className="filter-options vertical">
                <button
                  className={`filter-option ${!selectedCourse ? 'active' : ''}`}
                  onClick={() => setSelectedCourse(null)}
                >
                  <i className="fas fa-list"></i>
                  All Courses
                </button>
                {courses.map(course => (
                  <button
                    key={course.id}
                    className={`filter-option ${selectedCourse?.id === course.id ? 'active' : ''}`}
                    onClick={() => setSelectedCourse(course)}
                  >
                    <i className="fas fa-book"></i>
                    {course.code} - {course.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="sidebar-actions">
            <button
              className="reset-btn"
              onClick={() => {
                setActiveFilter('student');
                setSelectedCourse(null);
                setWeekFilter('all');
                setDateFilter('');
                setSearchTerm('');
                setExpandedCard(null);
              }}
            >
              <i className="fas fa-redo"></i>
              Reset All Filters
            </button>
          </div>
        </div>

        {/* Right Content - Attendance Records */}
        <div className="attendance-content">
          <div className="content-header">
            <div className="results-info">
              <span className="results-count">
                Showing {getFilteredRecords().length} attendance records
                {selectedCourse && ` for ${selectedCourse.code}`}
                {weekFilter !== 'all' && ` in Week ${weekFilter.replace('week', '')}`}
              </span>
              <div className="view-controls">
                <button 
                  className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
                  onClick={() => setViewMode('grid')}
                  title="Grid View"
                >
                  <i className="fas fa-th-large"></i>
                </button>
                <button 
                  className={`view-toggle-btn ${viewMode === 'list' ? 'active' : ''}`}
                  onClick={() => setViewMode('list')}
                  title="List View"
                >
                  <i className="fas fa-list"></i>
                </button>
              </div>
            </div>
            <div className="last-update">
              Last updated: {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>

          {loading ? (
            <div className="loading-container">
              <i className="fas fa-spinner fa-spin spinner"></i>
              <p>Loading attendance records...</p>
            </div>
          ) : getFilteredRecords().length === 0 ? (
            <div className="no-results">
              <div className="no-results-icon">
                <i className="fas fa-calendar-times"></i>
              </div>
              <h3>No attendance records found</h3>
              <p>No records match your current filter criteria.</p>
              <button
                className="btn btn-primary"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCourse(null);
                  setWeekFilter('all');
                  setDateFilter('');
                }}
              >
                <i className="fas fa-eye"></i>
                Show All Records
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="attendance-grid compact">
              {getFilteredRecords().map(record => {
                const isExpanded = expandedCard === record.id;
                
                return (
                  <div 
                    key={record.id} 
                    className={`attendance-card compact ${isExpanded ? 'expanded' : ''}`}
                    onClick={() => toggleCardExpansion(record.id)}
                  >
                    <div className="attendance-card-header">
                      <div className="student-avatar">
                        {record.studentName.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="student-main-info">
                        <div className="student-name">{record.studentName}</div>
                        <div className="student-details">
                          <div className="student-id">
                            <i className="fas fa-id-card"></i>
                            {record.studentNumber}
                          </div>
                          <div className="status-badge" style={getStatusStyle(record.status)}>
                            {getStatusText(record.status)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="attendance-card-details compact">
                      <div className="detail-row">
                        <div className="detail-item">
                          <i className="fas fa-book"></i>
                          <div className="detail-info">
                            <div className="detail-label">Course</div>
                            <div className="detail-value">
                              {record.courseCode} - {record.courseName}
                            </div>
                          </div>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-chalkboard-teacher"></i>
                          <div className="detail-info">
                            <div className="detail-label">Professor</div>
                            <div className="detail-value">{record.professorName}</div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="detail-row">
                        <div className="detail-item">
                          <i className="fas fa-calendar-day"></i>
                          <div className="detail-info">
                            <div className="detail-label">Date & Time</div>
                            <div className="detail-value">
                              {record.day}, {record.startTime} - {record.endTime}
                            </div>
                          </div>
                        </div>
                        <div className="detail-item">
                          <i className="fas fa-door-open"></i>
                          <div className="detail-info">
                            <div className="detail-label">Room</div>
                            <div className="detail-value">{record.room}</div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="attendance-card-actions compact">
                      <button
                        className="action-btn status-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateAttendanceStatus(record.id, 'present');
                        }}
                        title="Mark as Present"
                      >
                        <i className="fas fa-check-circle"></i>
                        Present
                      </button>
                      <button
                        className="action-btn status-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateAttendanceStatus(record.id, 'absent');
                        }}
                        title="Mark as Absent"
                      >
                        <i className="fas fa-times-circle"></i>
                        Absent
                      </button>
                      <button
                        className="action-btn status-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          updateAttendanceStatus(record.id, 'late');
                        }}
                        title="Mark as Late"
                      >
                        <i className="fas fa-clock"></i>
                        Late
                      </button>
                    </div>

                    {isExpanded && (
                      <div className="expanded-details">
                        <div className="detail-section">
                          <div className="detail-grid">
                            <div className="detail-item">
                              <div className="detail-label">Full Date</div>
                              <div className="detail-value">{record.date}</div>
                            </div>
                            <div className="detail-item">
                              <div className="detail-label">Week</div>
                              <div className="detail-value">Week {record.week}</div>
                            </div>
                            <div className="detail-item">
                              <div className="detail-label">Student ID</div>
                              <div className="detail-value">{record.studentNumber}</div>
                            </div>
                            <div className="detail-item">
                              <div className="detail-label">Course Code</div>
                              <div className="detail-value">{record.courseCode}</div>
                            </div>
                          </div>
                        </div>
                        
                        {record.notes && (
                          <div className="detail-section">
                            <h4>
                              <i className="fas fa-sticky-note"></i>
                              Notes
                            </h4>
                            <div className="notes-content">
                              {record.notes}
                            </div>
                          </div>
                        )}
                        
                        <div className="detail-section">
                          <h4>
                            <i className="fas fa-cog"></i>
                            Quick Actions
                          </h4>
                          <div className="expanded-actions">
                            <button
                              className="btn btn-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                updateAttendanceStatus(record.id, 'excused');
                              }}
                            >
                              <i className="fas fa-file-medical"></i>
                              Mark as Excused
                            </button>
                            <button
                              className="btn btn-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                // Add note functionality
                              }}
                            >
                              <i className="fas fa-sticky-note"></i>
                              Add Note
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="attendance-table-container">
              <table className="attendance-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Course</th>
                    <th>Professor</th>
                    <th>Date & Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {getFilteredRecords().map(record => (
                    <tr key={record.id}>
                      <td>
                        <div className="student-cell">
                          <div className="student-avatar small">
                            {record.studentName.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="student-info">
                            <div className="student-name">{record.studentName}</div>
                            <div className="student-id">{record.studentNumber}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="course-cell">
                          <div className="course-code">{record.courseCode}</div>
                          <div className="course-name">{record.courseName}</div>
                        </div>
                      </td>
                      <td>
                        <div className="professor-cell">
                          <i className="fas fa-chalkboard-teacher"></i>
                          {record.professorName}
                        </div>
                      </td>
                      <td>
                        <div className="datetime-cell">
                          <div className="date">{record.date}</div>
                          <div className="time">{record.startTime} - {record.endTime}</div>
                        </div>
                      </td>
                      <td>
                        <div className="status-cell">
                          <span className="status-badge" style={getStatusStyle(record.status)}>
                            {getStatusText(record.status)}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}