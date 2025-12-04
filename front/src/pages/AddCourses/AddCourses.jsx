import React, { useEffect, useState } from 'react';
import './AddCourses.css';

const API_BASE = import.meta.env.VITE_API_BASE || '/api';

function AddCourse() {
    const [courses, setCourses] = useState([]);
    const [professors, setProfessors] = useState([]);
    
    // New course fields
    const [courseType, setCourseType] = useState('theory-practical');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [academicHours, setAcademicHours] = useState(2); // New field: Academic hours
    const [weeks, setWeeks] = useState(15);
    const [theorySections, setTheorySections] = useState(1);
    const [practicalSections, setPracticalSections] = useState(2);
    const [numTheoryProfessors, setNumTheoryProfessors] = useState(1);
    const [numPracticalProfessors, setNumPracticalProfessors] = useState(2);
    
    // Professor assignment arrays
    const [assignedTheoryProfessors, setAssignedTheoryProfessors] = useState([null]);
    const [assignedPracticalProfessors, setAssignedPracticalProfessors] = useState([null, null]);
    
    const [loading, setLoading] = useState(false);
    const [profLoading, setProfLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        // Load saved courses
        const savedCourses = localStorage.getItem('cs_courses');
        if (savedCourses) setCourses(JSON.parse(savedCourses));
        
        // Load professors
        fetchProfessors();
    }, []);

    useEffect(() => {
        localStorage.setItem('cs_courses', JSON.stringify(courses));
    }, [courses]);

    // Load professors from database
    const fetchProfessors = async () => {
        setProfLoading(true);
        const token = localStorage.getItem('token');
        
        try {
            const res = await fetch(`${API_BASE}/professors/`, {
                headers: token ? { Authorization: `Bearer ${token}` } : {},
            });
            
            if (res.ok) {
                const data = await res.json();
                if (Array.isArray(data)) {
                    setProfessors(data);
                }
            }
        } catch (err) {
            console.warn('Could not fetch professors:', err.message);
            // Use default professor data
            setProfessors([
                { id: 'p1', name: 'Dr. Mohamad Ahmad', type: 'theory' },
                { id: 'p2', name: 'Dr. Ali Battour', type: 'practical' },
                { id: 'p3', name: 'Dr. Salah Dawaji', type: 'theory' },
                { id: 'p4', name: 'Dr. Mahmoud Haidar', type: 'practical' },
                { id: 'p5', name: 'Dr. Omar Kassem', type: 'both' },
                { id: 'p6', name: 'Dr. Nour Zaydan', type: 'theory' },
                { id: 'p7', name: 'Dr. Hassan Rami', type: 'practical' },
                { id: 'p8', name: 'Dr. Fatima Saleh', type: 'both' },
            ]);
        } finally {
            setProfLoading(false);
        }
    };

    // Filter professors by type
    const theoryProfessors = professors.filter(p => 
        p.type === 'theory' || p.type === 'both'
    );
    
    const practicalProfessors = professors.filter(p => 
        p.type === 'practical' || p.type === 'both'
    );

    // Auto-calculate practical sections based on course type
    useEffect(() => {
        if (courseType === 'theory-only') {
            setPracticalSections(0);
            setNumPracticalProfessors(0);
            setAssignedPracticalProfessors([]);
        } else if (courseType === 'practical-only') {
            setTheorySections(0);
            setNumTheoryProfessors(0);
            setAssignedTheoryProfessors([]);
            setPracticalSections(1);
            setNumPracticalProfessors(1);
            setAssignedPracticalProfessors([null]);
        } else if (courseType === 'theory-practical') {
            setPracticalSections(theorySections * 2);
            setNumPracticalProfessors(theorySections * 2);
            setAssignedPracticalProfessors(Array(theorySections * 2).fill(null));
        }
    }, [courseType, theorySections]);

    // Update assigned professors arrays when number changes
    useEffect(() => {
        if (courseType === 'theory-only' || courseType === 'theory-practical') {
            setAssignedTheoryProfessors(prev => {
                const newArray = Array(numTheoryProfessors).fill(null);
                // Preserve existing assignments if any
                for (let i = 0; i < Math.min(prev.length, numTheoryProfessors); i++) {
                    newArray[i] = prev[i];
                }
                return newArray;
            });
        }
    }, [numTheoryProfessors, courseType]);

    useEffect(() => {
        if (courseType === 'practical-only' || courseType === 'theory-practical') {
            setAssignedPracticalProfessors(prev => {
                const newArray = Array(numPracticalProfessors).fill(null);
                // Preserve existing assignments if any
                for (let i = 0; i < Math.min(prev.length, numPracticalProfessors); i++) {
                    newArray[i] = prev[i];
                }
                return newArray;
            });
        }
    }, [numPracticalProfessors, courseType]);

    // Assign a professor to a slot
    const assignTheoryProfessor = (professorId, slotIndex) => {
        setAssignedTheoryProfessors(prev => {
            const newArray = [...prev];
            newArray[slotIndex] = professorId;
            return newArray;
        });
    };

    const assignPracticalProfessor = (professorId, slotIndex) => {
        setAssignedPracticalProfessors(prev => {
            const newArray = [...prev];
            newArray[slotIndex] = professorId;
            return newArray;
        });
    };

    // Remove a professor from a slot
    const removeTheoryProfessor = (slotIndex) => {
        setAssignedTheoryProfessors(prev => {
            const newArray = [...prev];
            newArray[slotIndex] = null;
            return newArray;
        });
    };

    const removePracticalProfessor = (slotIndex) => {
        setAssignedPracticalProfessors(prev => {
            const newArray = [...prev];
            newArray[slotIndex] = null;
            return newArray;
        });
    };

    // Get professor name by ID
    const getProfessorName = (profId) => {
        const prof = professors.find(p => p.id === profId);
        return prof ? prof.name : null;
    };

    // Add new course
    const addCourse = async (e) => {
        e.preventDefault();
        
        // Validate required fields
        if (!courseName.trim() || !courseCode.trim()) {
            setMessage({ type: 'error', text: 'Please enter course name and code' });
            return;
        }
        
        // Validate professor assignments based on course type
        if (courseType === 'theory-only' && assignedTheoryProfessors.some(p => p === null)) {
            setMessage({ type: 'error', text: 'Please assign all theory professors' });
            return;
        }
        
        if (courseType === 'practical-only' && assignedPracticalProfessors.some(p => p === null)) {
            setMessage({ type: 'error', text: 'Please assign all practical professors' });
            return;
        }
        
        if (courseType === 'theory-practical' && 
            (assignedTheoryProfessors.some(p => p === null) || assignedPracticalProfessors.some(p => p === null))) {
            setMessage({ type: 'error', text: 'Please assign all theory and practical professors' });
            return;
        }
        
        setLoading(true);
        
        const newCourse = {
            id: Date.now().toString(),
            name: courseName.trim(),
            code: courseCode.trim(),
            academicHours: Number(academicHours), // Added academic hours
            type: courseType,
            weeks: Number(weeks),
            theorySections: courseType === 'practical-only' ? 0 : Number(theorySections),
            practicalSections: courseType === 'theory-only' ? 0 : Number(practicalSections),
            theoryProfessors: courseType === 'practical-only' ? [] : assignedTheoryProfessors,
            practicalProfessors: courseType === 'theory-only' ? [] : assignedPracticalProfessors,
            createdAt: new Date().toISOString(),
        };
        
        // Try to save to server first
        const token = localStorage.getItem('token');
        const payload = {
            ...newCourse,
            theoryProfessorNames: assignedTheoryProfessors.map(id => getProfessorName(id) || ''),
            practicalProfessorNames: assignedPracticalProfessors.map(id => getProfessorName(id) || ''),
        };
        
        try {
            const res = await fetch(`${API_BASE}/courses/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { Authorization: `Bearer ${token}` } : {}),
                },
                body: JSON.stringify(payload),
            });
            
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            
            const serverCourse = await res.json();
            newCourse.id = serverCourse.id?.toString() || newCourse.id;
        } catch (err) {
            console.warn('Using local storage:', err.message);
        }
        
        // Save locally
        setCourses(prev => [...prev, newCourse]);
        
        // Reset fields
        setCourseName('');
        setCourseCode('');
        setAcademicHours(2); // Reset to default value
        setCourseType('theory-practical');
        setWeeks(15);
        setTheorySections(1);
        setPracticalSections(2);
        setNumTheoryProfessors(1);
        setNumPracticalProfessors(2);
        setAssignedTheoryProfessors([null]);
        setAssignedPracticalProfessors([null, null]);
        
        setMessage({ 
            type: 'success', 
            text: 'Course added successfully!' 
        });
        
        setLoading(false);
        
        // Hide message after 3 seconds
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    };

    // Reset form when course type changes
    const handleCourseTypeChange = (type) => {
        setCourseType(type);
        if (type === 'theory-only') {
            setPracticalSections(0);
            setNumPracticalProfessors(0);
            setAssignedPracticalProfessors([]);
        } else if (type === 'practical-only') {
            setTheorySections(0);
            setNumTheoryProfessors(0);
            setAssignedTheoryProfessors([]);
            setPracticalSections(1);
            setNumPracticalProfessors(1);
            setAssignedPracticalProfessors([null]);
        } else if (type === 'theory-practical') {
            setTheorySections(1);
            setPracticalSections(2);
            setNumTheoryProfessors(1);
            setNumPracticalProfessors(2);
            setAssignedTheoryProfessors([null]);
            setAssignedPracticalProfessors([null, null]);
        }
    };

    return (
        <div className="courses-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-book"></i>
                        Add New Course
                    </h1>
                    <p className="page-subtitle">Add new courses to the academic system</p>
                </div>
                <div className="user-info">
                    <span>College System</span>
                </div>
            </div>

            <div className="main-content">
                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        <i className={`fas ${message.type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle'}`}></i>
                        {message.text}
                    </div>
                )}

                <div className="form-container">
                    <h2 className="form-title">
                        <i className="fas fa-plus-circle"></i>
                        New Course Details
                    </h2>

                    <form onSubmit={addCourse} className="form">
                        <div className="form-grid">
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fas fa-book"></i>
                                    Course Name
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., Data Structures"
                                    value={courseName}
                                    onChange={(e) => setCourseName(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fas fa-hashtag"></i>
                                    Course Code
                                </label>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="e.g., CS201"
                                    value={courseCode}
                                    onChange={(e) => setCourseCode(e.target.value)}
                                    required
                                    disabled={loading}
                                />
                            </div>

                            {/* New: Subject Academic Hours */}
                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fas fa-clock"></i>
                                    Subject Academic Hours
                                </label>
                                <select
                                    className="form-input"
                                    value={academicHours}
                                    onChange={(e) => setAcademicHours(Number(e.target.value))}
                                    disabled={loading}
                                >
                                    <option value="1">1 hour</option>
                                    <option value="2">2 hours</option>
                                    <option value="3">3 hours</option>
                                    <option value="4">4 hours</option>
                                </select>
                                <small style={{ color: 'var(--primary-light)', display: 'block', marginTop: '5px' }}>
                                    Weekly academic hours for this subject
                                </small>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fas fa-graduation-cap"></i>
                                    Course Type
                                </label>
                                <select
                                    className="form-input"
                                    value={courseType}
                                    onChange={(e) => handleCourseTypeChange(e.target.value)}
                                    disabled={loading}
                                >
                                    <option value="theory-only">Theory Only</option>
                                    <option value="practical-only">Practical Only</option>
                                    <option value="theory-practical">Theory + Practical</option>
                                </select>
                                <small style={{ color: 'var(--primary-light)', display: 'block', marginTop: '5px' }}>
                                    {courseType === 'theory-only' && 'Theory lectures only, no practical sessions'}
                                    {courseType === 'practical-only' && 'Practical sessions only, no theory lectures'}
                                    {courseType === 'theory-practical' && 'Both theory lectures and practical sessions'}
                                </small>
                            </div>

                            <div className="form-group">
                                <label className="form-label">
                                    <i className="fas fa-calendar-alt"></i>
                                    Semester Weeks
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="15"
                                    className="form-input"
                                    value={weeks}
                                    onChange={(e) => {
                                        const value = Math.min(15, Math.max(1, Number(e.target.value) || 1));
                                        setWeeks(value);
                                    }}
                                    disabled={loading}
                                />
                                <small style={{ color: 'var(--primary-light)', display: 'block', marginTop: '5px' }}>
                                    Maximum: 15 weeks
                                </small>
                            </div>

                            {/* Theory Sections - Only show for theory-only and theory-practical */}
                            {(courseType === 'theory-only' || courseType === 'theory-practical') && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="fas fa-chalkboard-teacher"></i>
                                        Theory Sections
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        className="form-input"
                                        value={theorySections}
                                        onChange={(e) => {
                                            const value = Number(e.target.value) || 1;
                                            setTheorySections(value);
                                            if (courseType === 'theory-practical') {
                                                setNumPracticalProfessors(value * 2);
                                            }
                                        }}
                                        disabled={loading || courseType === 'practical-only'}
                                    />
                                </div>
                            )}

                            {/* Practical Sections - Only show for practical-only and theory-practical */}
                            {(courseType === 'practical-only' || courseType === 'theory-practical') && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="fas fa-flask"></i>
                                        Practical Sections
                                    </label>
                                    <input
                                        type="number"
                                        className="form-input"
                                        value={practicalSections}
                                        readOnly={courseType === 'theory-practical'}
                                        onChange={courseType === 'practical-only' ? (e) => setPracticalSections(Number(e.target.value) || 1) : undefined}
                                        style={{ backgroundColor: courseType === 'theory-practical' ? 'rgba(141, 169, 196, 0.2)' : '' }}
                                        disabled={loading}
                                    />
                                    {courseType === 'theory-practical' && (
                                        <small style={{ color: 'var(--primary-light)', display: 'block', marginTop: '5px' }}>
                                            (Auto) = Theory Sections × 2
                                        </small>
                                    )}
                                </div>
                            )}

                            {/* Number of Theory Professors - Only show for theory-only and theory-practical */}
                            {(courseType === 'theory-only' || courseType === 'theory-practical') && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="fas fa-user-tie"></i>
                                        Number of Theory Professors
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        className="form-input"
                                        value={numTheoryProfessors}
                                        onChange={(e) => setNumTheoryProfessors(Number(e.target.value) || 1)}
                                        disabled={loading}
                                    />
                                    <small style={{ color: 'var(--primary-light)', display: 'block', marginTop: '5px' }}>
                                        How many professors will teach theory sections?
                                    </small>
                                </div>
                            )}

                            {/* Number of Practical Professors - Only show for practical-only and theory-practical */}
                            {(courseType === 'practical-only' || courseType === 'theory-practical') && (
                                <div className="form-group">
                                    <label className="form-label">
                                        <i className="fas fa-user-graduate"></i>
                                        Number of Practical Professors
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        max="10"
                                        className="form-input"
                                        value={numPracticalProfessors}
                                        onChange={(e) => setNumPracticalProfessors(Number(e.target.value) || 1)}
                                        disabled={loading}
                                    />
                                    <small style={{ color: 'var(--primary-light)', display: 'block', marginTop: '5px' }}>
                                        How many professors will teach practical sections?
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* Professor Assignment Sections */}
                        {(courseType === 'theory-only' || courseType === 'theory-practical') && (
                            <div className="professor-assignment-section" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                                <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fas fa-user-tie"></i>
                                    Theory Professors Assignment
                                </h3>
                                
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '2rem',
                                    backgroundColor: 'rgba(11, 37, 69, 0.5)',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(141, 169, 196, 0.3)'
                                }}>
                                    {/* Left List - All Available Theory Professors */}
                                    <div>
                                        <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                            Available Theory Professors
                                        </h4>
                                        <div style={{ 
                                            maxHeight: '300px', 
                                            overflowY: 'auto',
                                            backgroundColor: 'rgba(19, 49, 92, 0.3)',
                                            borderRadius: '6px',
                                            padding: '1rem'
                                        }}>
                                            {theoryProfessors.length === 0 ? (
                                                <div style={{ color: 'var(--primary-light)', textAlign: 'center', padding: '1rem' }}>
                                                    No theory professors available
                                                </div>
                                            ) : (
                                                theoryProfessors.map((professor) => (
                                                    <div 
                                                        key={professor.id}
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '0.75rem',
                                                            marginBottom: '0.5rem',
                                                            backgroundColor: 'rgba(141, 169, 196, 0.1)',
                                                            borderRadius: '6px',
                                                            border: '1px solid rgba(141, 169, 196, 0.2)'
                                                        }}
                                                    >
                                                        <span style={{ color: 'var(--accent)' }}>{professor.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                // Find first empty slot
                                                                const emptySlotIndex = assignedTheoryProfessors.findIndex(p => p === null);
                                                                if (emptySlotIndex !== -1) {
                                                                    assignTheoryProfessor(professor.id, emptySlotIndex);
                                                                }
                                                            }}
                                                            disabled={assignedTheoryProfessors.includes(professor.id)}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: assignedTheoryProfessors.includes(professor.id) ? 'var(--primary-light)' : 'var(--accent)',
                                                                cursor: assignedTheoryProfessors.includes(professor.id) ? 'not-allowed' : 'pointer',
                                                                fontSize: '1.2rem',
                                                                padding: '5px 10px',
                                                                borderRadius: '4px'
                                                            }}
                                                            title={assignedTheoryProfessors.includes(professor.id) ? 'Already assigned' : 'Assign to next available slot'}
                                                        >
                                                            →
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Right List - Assigned Theory Professors */}
                                    <div>
                                        <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                            Assigned Theory Professors ({assignedTheoryProfessors.filter(p => p !== null).length}/{numTheoryProfessors})
                                        </h4>
                                        <div style={{ 
                                            maxHeight: '300px', 
                                            overflowY: 'auto',
                                            backgroundColor: 'rgba(19, 49, 92, 0.3)',
                                            borderRadius: '6px',
                                            padding: '1rem'
                                        }}>
                                            {assignedTheoryProfessors.map((profId, index) => (
                                                <div 
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '0.75rem',
                                                        marginBottom: '0.5rem',
                                                        backgroundColor: profId ? 'rgba(78, 205, 196, 0.1)' : 'rgba(141, 169, 196, 0.05)',
                                                        borderRadius: '6px',
                                                        border: `1px solid ${profId ? 'var(--success)' : 'rgba(141, 169, 196, 0.2)'}`
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--accent)' }}>
                                                            Theory Professor {index + 1}
                                                        </div>
                                                        <div style={{ color: profId ? 'var(--accent)' : 'var(--primary-light)' }}>
                                                            {profId ? getProfessorName(profId) : 'Not assigned'}
                                                        </div>
                                                    </div>
                                                    {profId && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removeTheoryProfessor(index)}
                                                            style={{
                                                                background: 'rgba(255, 107, 107, 0.2)',
                                                                border: '1px solid var(--error)',
                                                                color: 'var(--error)',
                                                                cursor: 'pointer',
                                                                padding: '5px 10px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.9rem'
                                                            }}
                                                            title="Remove professor"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {(courseType === 'practical-only' || courseType === 'theory-practical') && (
                            <div className="professor-assignment-section" style={{ marginTop: '2rem', marginBottom: '2rem' }}>
                                <h3 style={{ color: 'var(--accent)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <i className="fas fa-user-graduate"></i>
                                    Practical Professors Assignment
                                </h3>
                                
                                <div style={{ 
                                    display: 'grid', 
                                    gridTemplateColumns: '1fr 1fr', 
                                    gap: '2rem',
                                    backgroundColor: 'rgba(11, 37, 69, 0.5)',
                                    padding: '1.5rem',
                                    borderRadius: '8px',
                                    border: '1px solid rgba(141, 169, 196, 0.3)'
                                }}>
                                    {/* Left List - All Available Practical Professors */}
                                    <div>
                                        <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                            Available Practical Professors
                                        </h4>
                                        <div style={{ 
                                            maxHeight: '300px', 
                                            overflowY: 'auto',
                                            backgroundColor: 'rgba(19, 49, 92, 0.3)',
                                            borderRadius: '6px',
                                            padding: '1rem'
                                        }}>
                                            {practicalProfessors.length === 0 ? (
                                                <div style={{ color: 'var(--primary-light)', textAlign: 'center', padding: '1rem' }}>
                                                    No practical professors available
                                                </div>
                                            ) : (
                                                practicalProfessors.map((professor) => (
                                                    <div 
                                                        key={professor.id}
                                                        style={{
                                                            display: 'flex',
                                                            justifyContent: 'space-between',
                                                            alignItems: 'center',
                                                            padding: '0.75rem',
                                                            marginBottom: '0.5rem',
                                                            backgroundColor: 'rgba(141, 169, 196, 0.1)',
                                                            borderRadius: '6px',
                                                            border: '1px solid rgba(141, 169, 196, 0.2)'
                                                        }}
                                                    >
                                                        <span style={{ color: 'var(--accent)' }}>{professor.name}</span>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                // Find first empty slot
                                                                const emptySlotIndex = assignedPracticalProfessors.findIndex(p => p === null);
                                                                if (emptySlotIndex !== -1) {
                                                                    assignPracticalProfessor(professor.id, emptySlotIndex);
                                                                }
                                                            }}
                                                            disabled={assignedPracticalProfessors.includes(professor.id)}
                                                            style={{
                                                                background: 'transparent',
                                                                border: 'none',
                                                                color: assignedPracticalProfessors.includes(professor.id) ? 'var(--primary-light)' : 'var(--accent)',
                                                                cursor: assignedPracticalProfessors.includes(professor.id) ? 'not-allowed' : 'pointer',
                                                                fontSize: '1.2rem',
                                                                padding: '5px 10px',
                                                                borderRadius: '4px'
                                                            }}
                                                            title={assignedPracticalProfessors.includes(professor.id) ? 'Already assigned' : 'Assign to next available slot'}
                                                        >
                                                            →
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Right List - Assigned Practical Professors */}
                                    <div>
                                        <h4 style={{ color: 'var(--accent)', marginBottom: '1rem', fontSize: '1.1rem' }}>
                                            Assigned Practical Professors ({assignedPracticalProfessors.filter(p => p !== null).length}/{numPracticalProfessors})
                                        </h4>
                                        <div style={{ 
                                            maxHeight: '300px', 
                                            overflowY: 'auto',
                                            backgroundColor: 'rgba(19, 49, 92, 0.3)',
                                            borderRadius: '6px',
                                            padding: '1rem'
                                        }}>
                                            {assignedPracticalProfessors.map((profId, index) => (
                                                <div 
                                                    key={index}
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'space-between',
                                                        alignItems: 'center',
                                                        padding: '0.75rem',
                                                        marginBottom: '0.5rem',
                                                        backgroundColor: profId ? 'rgba(78, 205, 196, 0.1)' : 'rgba(141, 169, 196, 0.05)',
                                                        borderRadius: '6px',
                                                        border: `1px solid ${profId ? 'var(--success)' : 'rgba(141, 169, 196, 0.2)'}`
                                                    }}
                                                >
                                                    <div>
                                                        <div style={{ fontWeight: '600', color: 'var(--accent)' }}>
                                                            Practical Professor {index + 1}
                                                        </div>
                                                        <div style={{ color: profId ? 'var(--accent)' : 'var(--primary-light)' }}>
                                                            {profId ? getProfessorName(profId) : 'Not assigned'}
                                                        </div>
                                                    </div>
                                                    {profId && (
                                                        <button
                                                            type="button"
                                                            onClick={() => removePracticalProfessor(index)}
                                                            style={{
                                                                background: 'rgba(255, 107, 107, 0.2)',
                                                                border: '1px solid var(--error)',
                                                                color: 'var(--error)',
                                                                cursor: 'pointer',
                                                                padding: '5px 10px',
                                                                borderRadius: '4px',
                                                                fontSize: '0.9rem'
                                                            }}
                                                            title="Remove professor"
                                                        >
                                                            Remove
                                                        </button>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className="form-actions">
                            <button type="submit" className="btn btn-primary" disabled={loading}>
                                {loading ? (
                                    <>
                                        <i className="fas fa-spinner fa-spin"></i>
                                        Adding...
                                    </>
                                ) : (
                                    <>
                                        <i className="fas fa-plus"></i>
                                        Add Course
                                    </>
                                )}
                            </button>
                            <button type="button" className="btn btn-secondary" onClick={() => {
                                setCourseName('');
                                setCourseCode('');
                                setAcademicHours(2); // Reset academic hours
                                setCourseType('theory-practical');
                                setWeeks(15);
                                setTheorySections(1);
                                setPracticalSections(2);
                                setNumTheoryProfessors(1);
                                setNumPracticalProfessors(2);
                                setAssignedTheoryProfessors([null]);
                                setAssignedPracticalProfessors([null, null]);
                            }} disabled={loading}>
                                <i className="fas fa-redo"></i>
                                Clear Fields
                            </button>
                        </div>
                    </form>
                </div>

                {/* Show recently added courses */}
                {courses.length > 0 && (
                    <div className="info-card" style={{ marginTop: '2rem' }}>
                        <h3>
                            <i className="fas fa-list"></i>
                            Recently Added Courses ({courses.length})
                        </h3>
                        <div style={{ overflowX: 'auto' }}>
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid rgba(141, 169, 196, 0.3)' }}>Code</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid rgba(141, 169, 196, 0.3)' }}>Course Name</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid rgba(141, 169, 196, 0.3)' }}>Academic Hours</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid rgba(141, 169, 196, 0.3)' }}>Type</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid rgba(141, 169, 196, 0.3)' }}>Sections</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid rgba(141, 169, 196, 0.3)' }}>Professors</th>
                                        <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid rgba(141, 169, 196, 0.3)' }}>Weeks</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {courses.slice(-5).reverse().map((course) => (
                                        <tr key={course.id} style={{ borderBottom: '1px solid rgba(141, 169, 196, 0.1)' }}>
                                            <td style={{ padding: '12px', textAlign: 'left' }}>
                                                <strong>{course.code}</strong>
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'left' }}>{course.name}</td>
                                            <td style={{ padding: '12px', textAlign: 'left' }}>
                                                {course.academicHours} hour{course.academicHours !== 1 ? 's' : ''}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'left' }}>
                                                {course.type === 'theory-only' && 'Theory Only'}
                                                {course.type === 'practical-only' && 'Practical Only'}
                                                {course.type === 'theory-practical' && 'Theory + Practical'}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'left' }}>
                                                {course.type === 'theory-only' && `Theory: ${course.theorySections}`}
                                                {course.type === 'practical-only' && `Practical: ${course.practicalSections}`}
                                                {course.type === 'theory-practical' && `Theory: ${course.theorySections} | Practical: ${course.practicalSections}`}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'left', fontSize: '0.9rem' }}>
                                                {course.theoryProfessors && course.theoryProfessors.length > 0 && (
                                                    <div>
                                                        <strong>Theory:</strong> {course.theoryProfessors.map(id => getProfessorName(id)).filter(name => name).join(', ')}
                                                    </div>
                                                )}
                                                {course.practicalProfessors && course.practicalProfessors.length > 0 && (
                                                    <div>
                                                        <strong>Practical:</strong> {course.practicalProfessors.map(id => getProfessorName(id)).filter(name => name).join(', ')}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '12px', textAlign: 'left' }}>{course.weeks} weeks</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default AddCourse;