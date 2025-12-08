import React, { useState, useEffect } from 'react';
import './ManageTermTable.css';

export default function ManageTermTable() {
  // State for courses and scheduling
  const [courses, setCourses] = useState([]);
  const [scheduledSections, setScheduledSections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draggingSection, setDraggingSection] = useState(null);
  const [resizingSection, setResizingSection] = useState(null);
  const [activeDay, setActiveDay] = useState('Monday');
  const [weekNumber, setWeekNumber] = useState(1);
  
  // Mock professors data
  const [professors] = useState([
    { id: 'p1', fullName: 'Dr. Mohamad Ahmad' },
    { id: 'p2', fullName: 'Dr. Ali Battour' },
    { id: 'p3', fullName: 'Dr. Salah Dawaji' },
    { id: 'p4', fullName: 'Dr. Mahmoud Haidar' },
    { id: 'p5', fullName: 'Eng. Omar Kassem' },
  ]);

  // Time configuration
  const timeSlots = [];
  for (let hour = 8; hour <= 16; hour++) {
    for (let minute of [0, 30]) {
      if (hour === 16 && minute === 30) continue; // Stop at 4:00 PM
      const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      timeSlots.push(time);
    }
  }

  // Days of the week
  const days = ['Saturday', 'Sunday', 'Monday', 'Tuesday', 'Wednesday'];

  // Load courses from localStorage
  useEffect(() => {
    const loadCourses = () => {
      setLoading(true);
      try {
        const savedCourses = localStorage.getItem('cs_courses');
        const savedSchedule = localStorage.getItem('term_table_schedule');
        
        if (savedCourses) {
          const parsedCourses = JSON.parse(savedCourses);
          
          // Add unique IDs to sections if they don't exist
          const coursesWithSections = parsedCourses.map(course => {
            const sections = [];
            
            // Theory sections
            if (course.theorySections > 0 && course.theoryProfessors) {
              for (let i = 0; i < course.theorySections; i++) {
                sections.push({
                  id: `${course.id}-theory-${i + 1}`,
                  courseId: course.id,
                  type: 'Theory',
                  sectionNumber: i + 1,
                  professorId: course.theoryProfessors[i] || null,
                  courseCode: course.code,
                  courseName: course.name,
                  academicHours: course.academicHours,
                  duration: course.academicHours * 60, // Default duration in minutes
                  originalType: 'theory',
                });
              }
            }
            
            // Practical sections
            if (course.practicalSections > 0 && course.practicalProfessors) {
              for (let i = 0; i < course.practicalSections; i++) {
                sections.push({
                  id: `${course.id}-practical-${i + 1}`,
                  courseId: course.id,
                  type: 'Practical',
                  sectionNumber: i + 1,
                  professorId: course.practicalProfessors[i] || null,
                  courseCode: course.code,
                  courseName: course.name,
                  academicHours: 2, // Practical sessions are usually 2 hours
                  duration: 120, // Default 2 hours in minutes
                  originalType: 'practical',
                });
              }
            }
            
            return {
              ...course,
              sections: sections
            };
          });
          
          setCourses(coursesWithSections);
          
          // Load saved schedule if exists
          if (savedSchedule) {
            setScheduledSections(JSON.parse(savedSchedule));
          }
        }
      } catch (error) {
        console.error('Error loading courses:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCourses();
  }, []);

  // Save schedule to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('term_table_schedule', JSON.stringify(scheduledSections));
  }, [scheduledSections]);

  // Get professor name by ID
  const getProfessorName = (professorId) => {
    const professor = professors.find(p => p.id === professorId);
    return professor ? professor.fullName : 'Not Assigned';
  };

  // Handle drag start
  const handleDragStart = (e, section) => {
    e.dataTransfer.setData('text/plain', JSON.stringify(section));
    setDraggingSection(section);
    e.currentTarget.style.opacity = '0.4';
  };

  // Handle drag end
  const handleDragEnd = (e) => {
    e.currentTarget.style.opacity = '1';
    setDraggingSection(null);
  };

  // Handle drop on time slot
  const handleDrop = (e, day, timeSlotIndex) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    
    try {
      const sectionData = JSON.parse(e.dataTransfer.getData('text/plain'));
      
      // Calculate start time in minutes from 8:00 AM (480 minutes)
      const startMinutes = 480 + (timeSlotIndex * 30); // Each time slot is 30 minutes
      
      // Create a new scheduled section
      const newScheduledSection = {
        ...sectionData,
        scheduleId: `${sectionData.id}-${Date.now()}`,
        day: day,
        startTime: timeSlotIndex, // Store as index for easier calculations
        startMinutes: startMinutes,
        endMinutes: startMinutes + sectionData.duration,
        week: weekNumber,
        color: getSectionColor(sectionData.type, sectionData.courseId),
      };

      // Check for conflicts
      const hasConflict = checkTimeConflict(newScheduledSection);
      if (hasConflict) {
        alert('Time conflict! This time slot is already occupied.');
        return;
      }

      setScheduledSections(prev => [...prev, newScheduledSection]);
    } catch (error) {
      console.error('Error processing drop:', error);
    }
  };

  // Check for time conflicts
  const checkTimeConflict = (newSection) => {
    return scheduledSections.some(section => 
      section.day === newSection.day &&
      section.week === newSection.week &&
      ((newSection.startMinutes >= section.startMinutes && 
        newSection.startMinutes < section.endMinutes) ||
       (newSection.endMinutes > section.startMinutes && 
        newSection.endMinutes <= section.endMinutes) ||
       (newSection.startMinutes <= section.startMinutes && 
        newSection.endMinutes >= section.endMinutes))
    );
  };

  // Handle drag over
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  // Handle drag leave
  const handleDragLeave = (e) => {
    e.currentTarget.classList.remove('drag-over');
  };

  // Remove a scheduled section
  const removeScheduledSection = (scheduleId) => {
    setScheduledSections(prev => prev.filter(section => section.scheduleId !== scheduleId));
  };

  // Update section duration
  const updateSectionDuration = (scheduleId, newDurationMinutes) => {
    setScheduledSections(prev => prev.map(section => {
      if (section.scheduleId === scheduleId) {
        return {
          ...section,
          duration: newDurationMinutes,
          endMinutes: section.startMinutes + newDurationMinutes,
        };
      }
      return section;
    }));
  };

  // Update section time (drag to different time slot)
  const updateSectionTime = (scheduleId, newStartTimeIndex) => {
    setScheduledSections(prev => prev.map(section => {
      if (section.scheduleId === scheduleId) {
        const startMinutes = 480 + (newStartTimeIndex * 30);
        return {
          ...section,
          startTime: newStartTimeIndex,
          startMinutes: startMinutes,
          endMinutes: startMinutes + section.duration,
        };
      }
      return section;
    }));
  };

  // Get section color based on type and course
  const getSectionColor = (type, courseId) => {
    const colors = {
      'Theory': {
        background: 'rgba(141, 169, 196, 0.8)',
        border: 'rgba(141, 169, 196, 1)',
      },
      'Practical': {
        background: 'rgba(78, 205, 196, 0.8)',
        border: 'rgba(78, 205, 196, 1)',
      },
    };
    
    // Use hash of courseId to get consistent color
    const hash = courseId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const hue = hash % 360;
    
    return type === 'Theory' 
      ? colors.Theory 
      : colors.Practical;
  };

  // Get sections for a specific day and time
  const getSectionsForDayAndTime = (day, timeSlotIndex) => {
    return scheduledSections.filter(section => 
      section.day === day && 
      section.week === weekNumber &&
      section.startTime === timeSlotIndex
    );
  };

  // Get sections spanning multiple time slots
  const getSectionAtPosition = (day, timeSlotIndex) => {
    return scheduledSections.find(section => 
      section.day === day && 
      section.week === weekNumber &&
      timeSlotIndex >= section.startTime && 
      timeSlotIndex < section.startTime + (section.duration / 30)
    );
  };

  // Format time display
  const formatTime = (timeSlotIndex) => {
    const totalMinutes = 480 + (timeSlotIndex * 30);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours > 12 ? hours - 12 : hours;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  // Calculate section height based on duration
  const getSectionHeight = (durationMinutes) => {
    return (durationMinutes / 30) * 40; // 40px per 30-minute slot
  };

  // Handle section resize start
  const handleResizeStart = (e, section) => {
    e.stopPropagation();
    setResizingSection(section);
    document.addEventListener('mousemove', handleResizeMove);
    document.addEventListener('mouseup', handleResizeEnd);
  };

  // Handle resize move
  const handleResizeMove = (e) => {
    if (!resizingSection) return;
    
    // Calculate new duration based on mouse position
    // This is a simplified version - in production you'd calculate based on grid
    const newDuration = Math.max(30, resizingSection.duration + 30); // Increase by 30 minutes
    
    // Update the section
    updateSectionDuration(resizingSection.scheduleId, newDuration);
  };

  // Handle resize end
  const handleResizeEnd = () => {
    setResizingSection(null);
    document.removeEventListener('mousemove', handleResizeMove);
    document.removeEventListener('mouseup', handleResizeEnd);
  };

  // Clear all scheduled sections
  const clearSchedule = () => {
    if (window.confirm('Are you sure you want to clear the entire schedule? This action cannot be undone.')) {
      setScheduledSections([]);
    }
  };

  // Export schedule
  const exportSchedule = () => {
    const scheduleData = {
      courses: courses,
      scheduledSections: scheduledSections,
      generatedAt: new Date().toISOString(),
      weekNumber: weekNumber,
    };
    
    const blob = new Blob([JSON.stringify(scheduleData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `term-table-week-${weekNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Get all sections for a course
  const getAllSections = () => {
    return courses.flatMap(course => course.sections || []);
  };

  // Filter sections by active day
  const getSectionsForActiveDay = () => {
    return scheduledSections.filter(section => 
      section.day === activeDay && section.week === weekNumber
    );
  };

  return (
    <div className="manage-term-table-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-calendar-alt"></i>
            Manage Term Table
          </h1>
          <p className="page-subtitle">Drag and drop courses to create the weekly schedule</p>
        </div>
        <div className="user-info">
          <div className="week-selector">
            <i className="fas fa-calendar-week"></i>
            Week: 
            <select 
              value={weekNumber} 
              onChange={(e) => setWeekNumber(parseInt(e.target.value))}
              className="week-select"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15].map(week => (
                <option key={week} value={week}>Week {week}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="main-content">
        <div className="term-table-container">
          <div className="term-table-header">
            <h2 className="view-title">
              <i className="fas fa-table"></i>
              Weekly Schedule - Week {weekNumber}
            </h2>
            <div className="view-controls">
              <button className="btn btn-primary" onClick={exportSchedule}>
                <i className="fas fa-download"></i>
                Export Schedule
              </button>
              <button className="btn btn-secondary" onClick={clearSchedule}>
                <i className="fas fa-trash"></i>
                Clear All
              </button>
            </div>
          </div>

          <div className="term-table-layout">
            {/* Left Sidebar - Course List */}
            <div className="courses-sidebar">
              <div className="courses-card">
                <h3 className="courses-title">
                  <i className="fas fa-book"></i>
                  Available Courses & Sections
                </h3>
                
                <div className="filter-group">
                  <h4 className="filter-label">
                    <i className="fas fa-filter"></i>
                    Filter
                  </h4>
                  <select className="filter-select">
                    <option value="all">All Courses</option>
                    <option value="theory">Theory Only</option>
                    <option value="practical">Practical Only</option>
                  </select>
                </div>

                <div className="courses-list">
                  {loading ? (
                    <div className="loading-small">
                      <i className="fas fa-spinner fa-spin"></i>
                      Loading courses...
                    </div>
                  ) : getAllSections().length === 0 ? (
                    <div className="no-courses">
                      <i className="fas fa-book"></i>
                      <p>No courses found. Add courses first.</p>
                    </div>
                  ) : (
                    getAllSections().map(section => (
                      <div 
                        key={section.id}
                        className="course-section-item"
                        draggable="true"
                        onDragStart={(e) => handleDragStart(e, section)}
                        onDragEnd={handleDragEnd}
                      >
                        <div className="section-header">
                          <div className="section-type-badge" style={{
                            backgroundColor: section.type === 'Theory' 
                              ? 'rgba(141, 169, 196, 0.2)' 
                              : 'rgba(78, 205, 196, 0.2)',
                            color: section.type === 'Theory' ? '#8da9c4' : '#4ecdc4'
                          }}>
                            <i className={`fas ${section.type === 'Theory' ? 'fa-chalkboard-teacher' : 'fa-flask'}`}></i>
                            {section.type}
                          </div>
                          <div className="section-number">Sec {section.sectionNumber}</div>
                        </div>
                        
                        <div className="section-details">
                          <div className="course-code">{section.courseCode}</div>
                          <div className="course-name">{section.courseName}</div>
                          <div className="section-meta">
                            <span className="duration">
                              <i className="fas fa-clock"></i>
                              {section.academicHours} hour{section.academicHours !== 1 ? 's' : ''}
                            </span>
                            <span className="professor">
                              <i className="fas fa-user-tie"></i>
                              {getProfessorName(section.professorId)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="section-actions">
                          <span className="drag-hint">
                            <i className="fas fa-arrows-alt"></i>
                            Drag to schedule
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="courses-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Courses:</span>
                    <span className="stat-value">{courses.length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Sections:</span>
                    <span className="stat-value">{getAllSections().length}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Scheduled:</span>
                    <span className="stat-value">
                      {scheduledSections.filter(s => s.week === weekNumber).length}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Main Grid - Schedule */}
            <div className="schedule-grid">
              {/* Day Tabs */}
              <div className="day-tabs">
                {days.map(day => (
                  <button
                    key={day}
                    className={`day-tab ${activeDay === day ? 'active' : ''}`}
                    onClick={() => setActiveDay(day)}
                  >
                    <i className="fas fa-calendar-day"></i>
                    {day}
                  </button>
                ))}
              </div>

              {/* Schedule Grid */}
              <div className="time-grid-container">
                {/* Time Labels */}
                <div className="time-labels">
                  <div className="time-label-header">
                    <i className="fas fa-clock"></i>
                    Time
                  </div>
                  {timeSlots.map((time, index) => (
                    <div key={time} className="time-label">
                      {time}
                    </div>
                  ))}
                </div>

                {/* Day Columns */}
                <div className="day-columns">
                  {days.map(day => (
                    <div 
                      key={day} 
                      className={`day-column ${activeDay === day ? 'active' : ''}`}
                    >
                      <div className="day-header">
                        <h4>
                          <i className="fas fa-calendar-day"></i>
                          {day}
                        </h4>
                        <span className="section-count">
                          {scheduledSections.filter(s => s.day === day && s.week === weekNumber).length} sections
                        </span>
                      </div>
                      
                      {/* Time Slots for this day */}
                      <div className="time-slots">
                        {timeSlots.map((time, timeSlotIndex) => {
                          const section = getSectionAtPosition(day, timeSlotIndex);
                          const isStartOfSection = section && section.startTime === timeSlotIndex;
                          
                          return (
                            <div
                              key={`${day}-${time}`}
                              className={`time-slot ${section ? 'occupied' : ''} ${isStartOfSection ? 'section-start' : ''}`}
                              onDragOver={handleDragOver}
                              onDragLeave={handleDragLeave}
                              onDrop={(e) => handleDrop(e, day, timeSlotIndex)}
                              data-day={day}
                              data-time={time}
                              data-index={timeSlotIndex}
                            >
                              {isStartOfSection && (
                                <div 
                                  className="scheduled-section"
                                  style={{
                                    height: `${getSectionHeight(section.duration)}px`,
                                    backgroundColor: section.color.background,
                                    border: `2px solid ${section.color.border}`,
                                  }}
                                  draggable="true"
                                  onDragStart={(e) => handleDragStart(e, section)}
                                  onDragEnd={handleDragEnd}
                                >
                                  <div className="section-info">
                                    <div className="section-code-type">
                                      <strong>{section.courseCode}</strong>
                                      <span className="section-type-tag">
                                        {section.type} Sec {section.sectionNumber}
                                      </span>
                                    </div>
                                    <div className="section-time">
                                      {formatTime(section.startTime)} - {formatTime(section.startTime + (section.duration / 30))}
                                    </div>
                                    <div className="section-professor">
                                      <i className="fas fa-user-tie"></i>
                                      {getProfessorName(section.professorId)}
                                    </div>
                                    <div className="section-duration">
                                      <i className="fas fa-clock"></i>
                                      {section.duration / 60} hour{section.duration / 60 !== 1 ? 's' : ''}
                                    </div>
                                  </div>
                                  
                                  <div className="section-actions">
                                    <button 
                                      className="section-action-btn edit"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        // Edit functionality
                                        const newDuration = parseInt(prompt('Enter new duration in hours:', section.duration / 60));
                                        if (newDuration && newDuration > 0) {
                                          updateSectionDuration(section.scheduleId, newDuration * 60);
                                        }
                                      }}
                                    >
                                      <i className="fas fa-edit"></i>
                                    </button>
                                    <button 
                                      className="section-action-btn delete"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeScheduledSection(section.scheduleId);
                                      }}
                                    >
                                      <i className="fas fa-trash"></i>
                                    </button>
                                    <div 
                                      className="resize-handle"
                                      onMouseDown={(e) => handleResizeStart(e, section)}
                                    >
                                      <i className="fas fa-arrows-alt-v"></i>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Drop hint */}
                              {!section && (
                                <div className="drop-hint">
                                  <i className="fas fa-plus"></i>
                                  Drop course here
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="schedule-legend">
                <div className="legend-title">
                  <i className="fas fa-key"></i>
                  Legend
                </div>
                <div className="legend-items">
                  <div className="legend-item">
                    <div className="legend-color theory"></div>
                    <span>Theory Sections</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color practical"></div>
                    <span>Practical Sections</span>
                  </div>
                  <div className="legend-item">
                    <div className="legend-color conflict"></div>
                    <span>Time Conflict (Not Allowed)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Current Schedule Summary */}
          <div className="schedule-summary">
            <h3>
              <i className="fas fa-clipboard-list"></i>
              Schedule Summary - Week {weekNumber}
            </h3>
            
            <div className="summary-grid">
              {days.map(day => {
                const daySections = scheduledSections.filter(
                  s => s.day === day && s.week === weekNumber
                );
                
                return (
                  <div key={day} className="day-summary">
                    <h4 className="day-summary-title">
                      <i className="fas fa-calendar-day"></i>
                      {day} ({daySections.length} sections)
                    </h4>
                    {daySections.length === 0 ? (
                      <div className="no-sections">No sections scheduled</div>
                    ) : (
                      <div className="day-sections-list">
                        {daySections.map(section => (
                          <div key={section.scheduleId} className="summary-section">
                            <div className="summary-section-header">
                              <span className="section-time">
                                {formatTime(section.startTime)} - {formatTime(section.startTime + (section.duration / 30))}
                              </span>
                              <button 
                                className="summary-remove-btn"
                                onClick={() => removeScheduledSection(section.scheduleId)}
                              >
                                <i className="fas fa-times"></i>
                              </button>
                            </div>
                            <div className="summary-section-details">
                              <strong>{section.courseCode}</strong> - {section.type} Sec {section.sectionNumber}
                              <div className="summary-section-meta">
                                <span>{getProfessorName(section.professorId)}</span>
                                <span>{section.duration / 60} hours</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Instructions */}
          <div className="instructions-card">
            <h3>
              <i className="fas fa-info-circle"></i>
              How to Use the Term Table
            </h3>
            <div className="instructions-content">
              <div className="instruction-step">
                <div className="step-number">1</div>
                <div className="step-content">
                  <strong>Drag Course Sections</strong>
                  <p>Drag sections from the left panel and drop them onto the desired time slot and day.</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-number">2</div>
                <div className="step-content">
                  <strong>Adjust Duration</strong>
                  <p>Click the duration button on a scheduled section to adjust its length (in hours).</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-number">3</div>
                <div className="step-content">
                  <strong>Resize Sections</strong>
                  <p>Drag the bottom resize handle (vertical arrows) to extend or shorten the section duration.</p>
                </div>
              </div>
              <div className="instruction-step">
                <div className="step-number">4</div>
                <div className="step-content">
                  <strong>Move Sections</strong>
                  <p>Drag scheduled sections to different time slots or days to rearrange the schedule.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}