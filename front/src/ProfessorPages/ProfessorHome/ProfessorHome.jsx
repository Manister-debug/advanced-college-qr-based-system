import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import './ProfessorHome.css';

function ProfessorHome() {
    const navigate = useNavigate();
    const { user } = useAuth();

    const quickActions = [
        {
            title: 'View Courses',
            description: 'Check your assigned courses and sections',
            icon: 'fas fa-book',
            color: '#4ecdc4',
            action: () => navigate('/professor/courses')
        },
        {
            title: 'View Schedule',
            description: 'Check your teaching schedule',
            icon: 'fas fa-calendar-alt',
            color: '#ff6b6b',
            action: () => navigate('/professor/schedule')
        },
        {
            title: 'Attendance',
            description: 'Take student attendance',
            icon: 'fas fa-clipboard-check',
            color: '#4dabf7',
            action: () => navigate('/professor/attendance')
        },
        {
            title: 'Upload Materials',
            description: 'Share course materials with students',
            icon: 'fas fa-file-upload',
            color: '#ffc107',
            action: () => navigate('/professor/materials')
        },
        {
            title: 'Grade Assignments',
            description: 'Review and grade student submissions',
            icon: 'fas fa-edit',
            color: '#9c88ff',
            action: () => navigate('/professor/grades')
        },
        {
            title: 'Student Analytics',
            description: 'View student performance insights',
            icon: 'fas fa-chart-line',
            color: '#00b894',
            action: () => navigate('/professor/analytics')
        }
    ];

    const upcomingClasses = [
        { course: 'CS 101', time: '10:00 AM - 11:30 AM', room: 'Room 301', status: 'Upcoming' },
        { course: 'Math 201', time: '2:00 PM - 3:30 PM', room: 'Room 205', status: 'Upcoming' },
        { course: 'Physics 150', time: '4:00 PM - 5:30 PM', room: 'Lab 102', status: 'Upcoming' }
    ];

    const recentActivities = [
        { action: 'Uploaded Lecture Notes', course: 'CS 101', time: '2 hours ago' },
        { action: 'Updated Attendance', course: 'Math 201', time: '1 day ago' },
        { action: 'Posted Assignment', course: 'Physics 150', time: '2 days ago' },
        { action: 'Graded Midterms', course: 'CS 101', time: '3 days ago' }
    ];

    return (
        <div className="professor-home">
            {/* Welcome Section */}
            <div className="welcome-section">
                <div className="welcome-content">
                    <h1>
                        Welcome back, <span className="highlight">{user?.name || 'Professor'}</span>!
                    </h1>
                    <p className="subtitle">
                        Here's an overview of your academic activities and upcoming schedules.
                    </p>
                </div>
                <div className="welcome-stats">
                    <div className="stat-card-compact">
                        <div className="stat-icon">
                            <i className="fas fa-book-open"></i>
                        </div>
                        <div className="stat-content">
                            <h3>3</h3>
                            <p>Active Courses</p>
                        </div>
                    </div>
                    <div className="stat-card-compact">
                        <div className="stat-icon">
                            <i className="fas fa-users"></i>
                        </div>
                        <div className="stat-content">
                            <h3>85</h3>
                            <p>Total Students</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Left Column: Quick Actions & User Info */}
                <div className="dashboard-column left-column">
                    {/* Quick Actions */}
                    <div className="quick-actions-section">
                        <div className="section-header">
                            <h2>
                                <i className="fas fa-bolt"></i>
                                Quick Actions
                            </h2>
                            <p className="section-subtitle">Access frequently used features</p>
                        </div>
                        <div className="actions-grid">
                            {quickActions.map((action, index) => (
                                <div
                                    key={index}
                                    className="action-card"
                                    onClick={action.action}
                                    style={{ '--action-color': action.color }}
                                >
                                    <div className="action-icon">
                                        <i className={action.icon}></i>
                                    </div>
                                    <div className="action-content">
                                        <h3>{action.title}</h3>
                                        <p>{action.description}</p>
                                    </div>
                                    <div className="action-arrow">
                                        <i className="fas fa-chevron-right"></i>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* User Info Card */}
                    <div className="user-info-section">
                        <div className="section-header">
                            <h2>
                                <i className="fas fa-user-circle"></i>
                                Profile Information
                            </h2>
                        </div>
                        <div className="user-info-card-expanded">
                            <div className="user-profile-header">
                                <div className="profile-avatar">
                                    <i className="fas fa-user-tie"></i>
                                </div>
                                <div className="profile-info">
                                    <h3>{user?.name || 'Professor Name'}</h3>
                                    <p className="profile-role">Senior Professor</p>
                                </div>
                            </div>
                            <div className="user-details">
                                <div className="detail-item">
                                    <i className="fas fa-graduation-cap"></i>
                                    <div>
                                        <label>Specialization</label>
                                        <p>{user?.specialization || 'Computer Science'}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <i className="fas fa-envelope"></i>
                                    <div>
                                        <label>Email</label>
                                        <p>{user?.email || 'professor@university.edu'}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <i className="fas fa-phone"></i>
                                    <div>
                                        <label>Phone</label>
                                        <p>{user?.phone || '+1 (555) 123-4567'}</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <i className="fas fa-building"></i>
                                    <div>
                                        <label>Department</label>
                                        <p>Computer Science & Engineering</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <i className="fas fa-door-open"></i>
                                    <div>
                                        <label>Office</label>
                                        <p>Science Building, Room 402</p>
                                    </div>
                                </div>
                                <div className="detail-item">
                                    <i className="fas fa-clock"></i>
                                    <div>
                                        <label>Office Hours</label>
                                        <p>Mon & Wed, 2:00 PM - 4:00 PM</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Upcoming Schedule & Stats */}
                <div className="dashboard-column right-column">
                    {/* Upcoming Schedule */}
                    <div className="upcoming-section-expanded">
                        <div className="section-header">
                            <h2>
                                <i className="fas fa-calendar-check"></i>
                                Today's Schedule
                            </h2>
                            <p className="section-subtitle">Your classes for today</p>
                        </div>
                        <div className="schedule-timeline">
                            {upcomingClasses.map((cls, index) => (
                                <div key={index} className="schedule-item">
                                    <div className="schedule-time">
                                        <i className="fas fa-clock"></i>
                                        <span>{cls.time}</span>
                                    </div>
                                    <div className="schedule-details">
                                        <h4>{cls.course}</h4>
                                        <p><i className="fas fa-map-marker-alt"></i> {cls.room}</p>
                                    </div>
                                    <div className="schedule-status">
                                        <span className="status-badge">{cls.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="schedule-footer">
                            <button className="view-full-schedule" onClick={() => navigate('/professor/schedule')}>
                                <i className="fas fa-calendar-alt"></i>
                                View Full Schedule
                            </button>
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="recent-activity-section">
                        <div className="section-header">
                            <h2>
                                <i className="fas fa-history"></i>
                                Recent Activity
                            </h2>
                            <p className="section-subtitle">Your latest actions</p>
                        </div>
                        <div className="activity-list">
                            {recentActivities.map((activity, index) => (
                                <div key={index} className="activity-item">
                                    <div className="activity-icon">
                                        <i className="fas fa-circle"></i>
                                    </div>
                                    <div className="activity-content">
                                        <h4>{activity.action}</h4>
                                        <p>{activity.course} • {activity.time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="stats-grid">
                        <div className="stat-card-large">
                            <div className="stat-icon-large">
                                <i className="fas fa-chalkboard-teacher"></i>
                            </div>
                            <div className="stat-content-large">
                                <h3>12</h3>
                                <p>Teaching Hours This Week</p>
                                <div className="stat-progress">
                                    <div className="progress-bar" style={{ width: '75%' }}></div>
                                </div>
                            </div>
                        </div>
                        <div className="stat-card-large">
                            <div className="stat-icon-large">
                                <i className="fas fa-tasks"></i>
                            </div>
                            <div className="stat-content-large">
                                <h3>3</h3>
                                <p>Pending Assignments to Grade</p>
                                <div className="stat-footer">
                                    <span className="stat-cta" onClick={() => navigate('/professor/grades')}>
                                        Review Now <i className="fas fa-arrow-right"></i>
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfessorHome;