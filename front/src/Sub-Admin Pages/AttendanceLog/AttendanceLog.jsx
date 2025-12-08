import React, { useState, useEffect } from 'react';
import './AttendanceLog.css';

export default function AttendanceLog() {
  const [activeFilter, setActiveFilter] = useState('course');
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [weekFilter, setWeekFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [expandedSection, setExpandedSection] = useState(null);

  // Mock data for professors
  const [professors] = useState([
    { id: 'p1', fullName: 'Dr. Mohamad Ahmad' },
    { id: 'p2', fullName: 'Dr. Ali Battour' },
    { id: 'p3', fullName: 'Dr. Salah Dawaji' },
    { id: 'p4', fullName: 'Dr. Mahmoud Haidar' },
    { id: 'p5', fullName: 'Eng. Omar Kassem' },
  ]);

  // Generate schedule times for sections
  const generateScheduleTimes = () => {
    const startTimes = ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00'];
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    
    const times = [];
    days.forEach(day => {
      startTimes.forEach(time => {
        times.push({
          day,
          startTime: time,
          endTime: `${parseInt(time.split(':')[0]) + 1}:00`
        });
      });
    });
    
    return times;
  };

  // Generate mock schedule for courses
  const generateCourseSchedule = (course) => {
    const scheduleTimes = generateScheduleTimes();
    const sections = [];
    
    // Generate theory sections
    if (course.theorySections > 0 && course.theoryProfessors?.length > 0) {
      for (let i = 0; i < course.theorySections; i++) {
        const prof = professors.find(p => p.id === course.theoryProfessors[i]);
        const timeSlot = scheduleTimes[Math.floor(Math.random() * 40)];
        
        sections.push({
          id: `theory-${course.id}-${i}`,
          courseId: course.id,
          type: 'Theory',
          sectionNumber: i + 1,
          professorName: prof?.fullName || 'Not Assigned',
          day: timeSlot.day,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          date: generateRandomDate(),
          academicHours: course.academicHours,
          room: `T-${Math.floor(Math.random() * 10) + 101}`,
          week: Math.floor(Math.random() * 15) + 1,
          studentsPresent: 0,
          studentsTotal: Math.floor(Math.random() * 30) + 10,
        });
      }
    }
    
    // Generate practical sections
    if (course.practicalSections > 0 && course.practicalProfessors?.length > 0) {
      for (let i = 0; i < course.practicalSections; i++) {
        const prof = professors.find(p => p.id === course.practicalProfessors[i]);
        const timeSlot = scheduleTimes[Math.floor(Math.random() * 40)];
        
        sections.push({
          id: `practical-${course.id}-${i}`,
          courseId: course.id,
          type: 'Practical',
          sectionNumber: i + 1,
          professorName: prof?.fullName || 'Not Assigned',
          day: timeSlot.day,
          startTime: timeSlot.startTime,
          endTime: timeSlot.endTime,
          date: generateRandomDate(),
          academicHours: 2,
          room: `P-${Math.floor(Math.random() * 5) + 201}`,
          week: Math.floor(Math.random() * 15) + 1,
          studentsPresent: 0,
          studentsTotal: Math.floor(Math.random() * 20) + 5,
        });
      }
    }
    
    return sections;
  };

  // Generate random date within current semester
  const generateRandomDate = () => {
    const today = new Date();
    const startDate = new Date(today.getFullYear(), 0, 1);
    const endDate = new Date(today.getFullYear(), 11, 31);
    
    const randomDate = new Date(startDate.getTime() + Math.random() * (endDate.getTime() - startDate.getTime()));
    
    return randomDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Load courses from localStorage
  useEffect(() => {
    const loadCourses = () => {
      setLoading(true);
      try {
        const savedCourses = localStorage.getItem('cs_courses');
        if (savedCourses) {
          const parsedCourses = JSON.parse(savedCourses);
          
          // Generate schedules for all courses
          const coursesWithSchedules = parsedCourses.map(course => ({
            ...course,
            sections: generateCourseSchedule(course)
          }));
          setCourses(coursesWithSchedules);
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
    
    const interval = setInterval(loadCourses, 60000);
    return () => clearInterval(interval);
  }, []);

  // Get professor name by ID
  const getProfessorName = (profId) => {
    const prof = professors.find(p => p.id === profId);
    return prof ? prof.fullName : 'Not Assigned';
  };

  // Get all sections from all courses
  const getAllSections = () => {
    return courses.flatMap(course => course.sections || []);
  };

  // Filter sections based on active filter
  const getFilteredSections = () => {
    let sections = getAllSections();
    
    if (selectedCourse) {
      sections = sections.filter(section => section.courseId === selectedCourse.id);
    }
    
    // Apply week filter if not 'all'
    if (weekFilter !== 'all') {
      sections = sections.filter(section => {
        const weekMatch = weekFilter.includes('week') 
          ? parseInt(weekFilter.replace('week', '')) === section.week
          : section.week === parseInt(weekFilter);
        return weekMatch;
      });
    }
    
    // Apply date filter if set
    if (dateFilter) {
      sections = sections.filter(section => 
        section.date.toLowerCase().includes(dateFilter.toLowerCase())
      );
    }
    
    return sections;
  };

  // Get unique weeks from sections
  const getUniqueWeeks = () => {
    const weeks = new Set();
    getAllSections().forEach(section => {
      if (section.week) weeks.add(section.week);
    });
    return Array.from(weeks).sort((a, b) => a - b);
  };

  // Get course type badge style
  const getCourseTypeStyle = (type) => {
    switch(type) {
      case 'theory-only':
        return { backgroundColor: 'rgba(141, 169, 196, 0.2)', color: '#8da9c4' };
      case 'practical-only':
        return { backgroundColor: 'rgba(78, 205, 196, 0.2)', color: '#4ecdc4' };
      case 'theory-practical':
        return { backgroundColor: 'rgba(255, 209, 102, 0.2)', color: '#ffd166' };
      default:
        return { backgroundColor: 'rgba(141, 169, 196, 0.2)', color: '#8da9c4' };
    }
  };

  // Get section type badge style
  const getSectionTypeStyle = (type) => {
    return type === 'Theory' 
      ? { backgroundColor: 'rgba(141, 169, 196, 0.2)', color: '#8da9c4' }
      : { backgroundColor: 'rgba(78, 205, 196, 0.2)', color: '#4ecdc4' };
  };

  // Handle course selection
  const handleCourseSelect = (course) => {
    setSelectedCourse(selectedCourse?.id === course.id ? null : course);
  };

  // Handle attendance marking
  const markAttendance = (sectionId, status) => {
    const sections = getFilteredSections();
    const sectionIndex = sections.findIndex(s => s.id === sectionId);
    
    if (sectionIndex !== -1) {
      alert(`Attendance marked as ${status} for section ${sectionId}`);
      // In real app, you would update the attendance record here
    }
  };

  // Toggle section expansion
  const toggleSectionExpansion = (sectionId) => {
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  // Get course by ID
  const getCourseById = (courseId) => {
    return courses.find(c => c.id === courseId);
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
          <p className="page-subtitle">Manage and track class attendance</p>
        </div>
        <div className="user-info">
          <span>{getAllSections().length} total sections | {courses.length} courses</span>
        </div>
      </div>

      <div className="main-content">
        <div className="attendance-container">
          <div className="attendance-header">
            <h2 className="view-title">
              <i className="fas fa-calendar-alt"></i>
              Attendance Management
            </h2>
            <div className="view-controls">
              <div className="date-filter">
                <input
                  type="text"
                  placeholder="Filter by date..."
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="search-input"
                />
                <i className="fas fa-calendar"></i>
              </div>
            </div>
          </div>

          <div className="attendance-layout">
            {/* Left Sidebar - Filters */}
            <div className="filters-sidebar">
              <div className="filters-card">
                <h3 className="filters-title">
                  <i className="fas fa-filter"></i>
                  Filter By
                </h3>
                
                <div className="filter-group">
                  <h4 className="filter-label">Attendance Filters</h4>
                  <div className="filter-options">
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
                      disabled
                    >
                      <i className="fas fa-chalkboard-teacher"></i>
                      Filter by Professor
                      <span className="coming-soon">Soon</span>
                    </button>
                    <button
                      className={`filter-option ${activeFilter === 'student' ? 'active' : ''}`}
                      onClick={() => setActiveFilter('student')}
                      disabled
                    >
                      <i className="fas fa-user-graduate"></i>
                      Filter by Student
                      <span className="coming-soon">Soon</span>
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

                {/* Week Filter Options */}
                {activeFilter === 'week' && (
                  <div className="filter-group">
                    <h4 className="filter-label">Select Week</h4>
                    <select
                      className="filter-select"
                      value={weekFilter}
                      onChange={(e) => setWeekFilter(e.target.value)}
                    >
                      <option value="all">All Weeks</option>
                      <option value="week1">Week 1</option>
                      <option value="week2">Week 2</option>
                      <option value="week3">Week 3</option>
                      <option value="week4">Week 4</option>
                      <option value="week5">Week 5</option>
                      <option value="week6">Week 6</option>
                      <option value="week7">Week 7</option>
                      <option value="week8">Week 8</option>
                      <option value="week9">Week 9</option>
                      <option value="week10">Week 10</option>
                      <option value="week11">Week 11</option>
                      <option value="week12">Week 12</option>
                      <option value="week13">Week 13</option>
                      <option value="week14">Week 14</option>
                    </select>
                  </div>
                )}

                {/* Course List for Course Filter */}
                {activeFilter === 'course' && (
                  <div className="filter-group">
                    <h4 className="filter-label">Select Course</h4>
                    <div className="course-list-filter">
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
                          onClick={() => handleCourseSelect(course)}
                        >
                          <div className="course-filter-item">
                            <div className="course-code">{course.code}</div>
                            <div className="course-name">{course.name}</div>
                            <div className="course-sections-count">
                              {course.sections?.length || 0} sections
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stats Card */}
                <div className="filter-stats">
                  <div className="stat-item">
                    <span className="stat-label">Active Filter:</span>
                    <span className="stat-value">
                      {activeFilter === 'course' ? 'Course' : 
                       activeFilter === 'professor' ? 'Professor' :
                       activeFilter === 'student' ? 'Student' : 'Week'}
                    </span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Showing Sections:</span>
                    <span className="stat-value">{getFilteredSections().length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Today's Date:</span>
                    <span className="stat-value">
                      {new Date().toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                <button
                  className="btn btn-secondary btn-block"
                  onClick={() => {
                    setActiveFilter('course');
                    setSelectedCourse(null);
                    setWeekFilter('all');
                    setDateFilter('');
                    setExpandedSection(null);
                  }}
                >
                  <i className="fas fa-redo"></i>
                  Reset All Filters
                </button>
              </div>
            </div>

            {/* Right Content - Sections List */}
            <div className="sections-main">
              {loading ? (
                <div className="loading-container">
                  <i className="fas fa-spinner fa-spin"></i>
                  <p>Loading attendance data...</p>
                </div>
              ) : getFilteredSections().length === 0 ? (
                <div className="no-data">
                  <i className="fas fa-calendar-times"></i>
                  <h3>No sections found</h3>
                  <p>No sections match your current filter criteria.</p>
                  {selectedCourse && (
                    <button
                      className="btn btn-primary"
                      onClick={() => setSelectedCourse(null)}
                    >
                      <i className="fas fa-eye"></i>
                      Show All Sections
                    </button>
                  )}
                </div>
              ) : (
                <>
                  {/* Selected Course Info */}
                  {selectedCourse && (
                    <div className="selected-course-info">
                      <div className="course-header">
                        <div className="course-title">
                          <h3>
                            <i className="fas fa-book"></i>
                            {selectedCourse.code} - {selectedCourse.name}
                          </h3>
                          <div className="course-meta">
                            <span className="course-type-badge" style={getCourseTypeStyle(selectedCourse.type)}>
                              {selectedCourse.type === 'theory-only' ? 'Theory Only' :
                               selectedCourse.type === 'practical-only' ? 'Practical Only' :
                               'Theory + Practical'}
                            </span>
                            <span className="course-hours">
                              <i className="fas fa-clock"></i>
                              {selectedCourse.academicHours} academic hours
                            </span>
                          </div>
                        </div>
                        <button
                          className="btn btn-secondary"
                          onClick={() => setSelectedCourse(null)}
                        >
                          <i className="fas fa-times"></i>
                          Clear Selection
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Sections Table */}
                  <div className="sections-table-container">
                    <table className="sections-table">
                      <thead>
                        <tr>
                          <th>Section</th>
                          <th>Course</th>
                          <th>Date & Time</th>
                          <th>Professor</th>
                          <th>Room</th>
                          <th>Status</th>
                          <th>Actions</th>
                          <th></th>
                        </tr>
                      </thead>
                      <tbody>
                        {getFilteredSections().map(section => {
                          const course = getCourseById(section.courseId);
                          const isExpanded = expandedSection === section.id;
                          
                          return (
                            <React.Fragment key={section.id}>
                              <tr 
                                className={`section-row ${isExpanded ? 'expanded' : ''}`}
                                onClick={() => toggleSectionExpansion(section.id)}
                              >
                                <td>
                                  <div className="section-type-cell">
                                    <div 
                                      className="section-type-badge"
                                      style={getSectionTypeStyle(section.type)}
                                    >
                                      <i className={`fas ${section.type === 'Theory' ? 'fa-chalkboard-teacher' : 'fa-flask'}`}></i>
                                      {section.type} {section.sectionNumber}
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="course-info-cell">
                                    <div className="course-code">{course?.code || 'N/A'}</div>
                                    <div className="course-name">{course?.name || 'Unknown Course'}</div>
                                  </div>
                                </td>
                                <td>
                                  <div className="datetime-cell">
                                    <div className="date">{section.date}</div>
                                    <div className="time">{section.startTime} - {section.endTime}</div>
                                    <div className="day-week">
                                      <span className="day">{section.day}</span>
                                      <span className="week">Week {section.week}</span>
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="professor-cell">
                                    <i className="fas fa-chalkboard-teacher"></i>
                                    {section.professorName}
                                  </div>
                                </td>
                                <td>
                                  <div className="room-cell">
                                    <i className="fas fa-door-open"></i>
                                    {section.room}
                                  </div>
                                </td>
                                <td>
                                  <div className="status-cell">
                                    <span className="status-badge pending">
                                      <i className="fas fa-clock"></i>
                                      Pending
                                    </span>
                                    <div className="attendance-stats">
                                      {section.studentsPresent}/{section.studentsTotal} students
                                    </div>
                                  </div>
                                </td>
                                <td>
                                  <div className="actions-cell">
                                    <button
                                      className="attendance-btn present"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAttendance(section.id, 'present');
                                      }}
                                      title="Mark Present"
                                    >
                                      <i className="fas fa-check-circle"></i>
                                      Present
                                    </button>
                                    <button
                                      className="attendance-btn absent"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        markAttendance(section.id, 'absent');
                                      }}
                                      title="Mark Absent"
                                    >
                                      <i className="fas fa-times-circle"></i>
                                      Absent
                                    </button>
                                  </div>
                                </td>
                                <td>
                                  <button 
                                    className="expand-btn"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleSectionExpansion(section.id);
                                    }}
                                  >
                                    <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                                  </button>
                                </td>
                              </tr>
                              
                              {/* Expanded Details Row */}
                              {isExpanded && (
                                <tr className="expanded-details-row">
                                  <td colSpan="8">
                                    <div className="expanded-content">
                                      <div className="expanded-section">
                                        <div className="expanded-header">
                                          <h4>
                                            <i className={`fas ${section.type === 'Theory' ? 'fa-chalkboard-teacher' : 'fa-flask'}`}></i>
                                            {section.type} Section {section.sectionNumber} Details
                                          </h4>
                                          <div className="expanded-course-info">
                                            <strong>{course?.code}</strong> - {course?.name}
                                          </div>
                                        </div>
                                        <div className="expanded-grid">
                                          <div className="expanded-item">
                                            <i className="fas fa-calendar-day"></i>
                                            <div>
                                              <div className="label">Date</div>
                                              <div className="value">{section.date}</div>
                                            </div>
                                          </div>
                                          <div className="expanded-item">
                                            <i className="fas fa-clock"></i>
                                            <div>
                                              <div className="label">Time</div>
                                              <div className="value">{section.startTime} - {section.endTime}</div>
                                            </div>
                                          </div>
                                          <div className="expanded-item">
                                            <i className="fas fa-chalkboard-teacher"></i>
                                            <div>
                                              <div className="label">Professor</div>
                                              <div className="value">{section.professorName}</div>
                                            </div>
                                          </div>
                                          <div className="expanded-item">
                                            <i className="fas fa-door-open"></i>
                                            <div>
                                              <div className="label">Room</div>
                                              <div className="value">{section.room}</div>
                                            </div>
                                          </div>
                                          <div className="expanded-item">
                                            <i className="fas fa-users"></i>
                                            <div>
                                              <div className="label">Class Size</div>
                                              <div className="value">{section.studentsTotal} students</div>
                                            </div>
                                          </div>
                                          <div className="expanded-item">
                                            <i className="fas fa-graduation-cap"></i>
                                            <div>
                                              <div className="label">Academic Hours</div>
                                              <div className="value">{section.academicHours} hours</div>
                                            </div>
                                          </div>
                                          <div className="expanded-item full-width">
                                            <i className="fas fa-clipboard-list"></i>
                                            <div>
                                              <div className="label">Attendance Actions</div>
                                              <div className="expanded-actions">
                                                <button
                                                  className="attendance-btn present"
                                                  onClick={() => markAttendance(section.id, 'present')}
                                                >
                                                  <i className="fas fa-check-circle"></i>
                                                  Mark All Present
                                                </button>
                                                <button
                                                  className="attendance-btn absent"
                                                  onClick={() => markAttendance(section.id, 'absent')}
                                                >
                                                  <i className="fas fa-times-circle"></i>
                                                  Mark All Absent
                                                </button>
                                                <button className="attendance-btn partial">
                                                  <i className="fas fa-user-edit"></i>
                                                  Individual Attendance
                                                </button>
                                                <button className="attendance-btn notes">
                                                  <i className="fas fa-sticky-note"></i>
                                                  Add Notes
                                                </button>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </td>
                                </tr>
                              )}
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer */}
                  <div className="table-footer">
                    <div className="table-info">
                      Showing {getFilteredSections().length} section{getFilteredSections().length !== 1 ? 's' : ''}
                      {selectedCourse && ` for ${selectedCourse.code}`}
                      {weekFilter !== 'all' && ` in Week ${weekFilter.replace('week', '')}`}
                    </div>
                    <div className="pagination">
                      <button className="btn btn-secondary">
                        <i className="fas fa-file-export"></i>
                        Export Attendance
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Help Modal */}
      <div className="help-section">
        <div className="help-card">
          <h3>
            <i className="fas fa-info-circle"></i>
            How to Use Attendance Log
          </h3>
          <div className="help-content">
            <div className="help-item">
              <i className="fas fa-filter"></i>
              <div>
                <strong>Filter Sections:</strong> Use the filter sidebar to view sections by course, professor, student, or week.
              </div>
            </div>
            <div className="help-item">
              <i className="fas fa-list"></i>
              <div>
                <strong>View Sections:</strong> Click on any section row to expand and view detailed information.
              </div>
            </div>
            <div className="help-item">
              <i className="fas fa-check-circle"></i>
              <div>
                <strong>Mark Attendance:</strong> Use the action buttons to mark attendance as present or absent.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}