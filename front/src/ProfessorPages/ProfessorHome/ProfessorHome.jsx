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
        }
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
                    <div className="user-info-card">
                        <div className="info-item">
                            <i className="fas fa-graduation-cap"></i>
                            <div>
                                <label>Specialization</label>
                                <p>{user?.specialization || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-envelope"></i>
                            <div>
                                <label>Email</label>
                                <p>{user?.email || 'Not specified'}</p>
                            </div>
                        </div>
                        <div className="info-item">
                            <i className="fas fa-phone"></i>
                            <div>
                                <label>Phone</label>
                                <p>{user?.phone || 'Not specified'}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="welcome-illustration">
                    <i className="fas fa-chalkboard-teacher"></i>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions-section">
                <h2>
                    <i className="fas fa-bolt"></i>
                    Quick Actions
                </h2>
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

            {/* Upcoming Schedule */}
            <div className="upcoming-section">
                <h2>
                    <i className="fas fa-calendar-check"></i>
                    Upcoming Schedule
                </h2>
                <div className="schedule-card">
                    <div className="schedule-empty">
                        <i className="fas fa-calendar-plus"></i>
                        <h3>No upcoming classes today</h3>
                        <p>Your next class is scheduled for tomorrow</p>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="stats-section">
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-book-open"></i>
                    </div>
                    <div className="stat-content">
                        <h3>0</h3>
                        <p>Active Courses</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-users"></i>
                    </div>
                    <div className="stat-content">
                        <h3>0</h3>
                        <p>Total Students</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-clock"></i>
                    </div>
                    <div className="stat-content">
                        <h3>0</h3>
                        <p>Teaching Hours/Week</p>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon">
                        <i className="fas fa-calendar-day"></i>
                    </div>
                    <div className="stat-content">
                        <h3>0</h3>
                        <p>Upcoming Classes</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ProfessorHome;