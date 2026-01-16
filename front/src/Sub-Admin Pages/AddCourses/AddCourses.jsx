import React, { useEffect, useState } from 'react';
import './AddCourses.css';
import { db } from "../../firebase";
import { collection, setDoc, doc, getDocs, onSnapshot } from "firebase/firestore";

function AddCourse() {
    const [courses, setCourses] = useState([]);
    const [professors, setProfessors] = useState([]);

    // New course fields
    const [courseType, setCourseType] = useState('theory-practical');
    const [courseName, setCourseName] = useState('');
    const [courseCode, setCourseCode] = useState('');
    const [academicHours, setAcademicHours] = useState(2);
    const [weeks, setWeeks] = useState(15);
    const [theorySections, setTheorySections] = useState(1);
    const [practicalSections, setPracticalSections] = useState(2);
    const [numTheoryProfessors, setNumTheoryProfessors] = useState(1);
    const [numPracticalProfessors, setNumPracticalProfessors] = useState(2);

    // Professor assignment arrays - STORE LECTURER IDs
    const [assignedTheoryProfessors, setAssignedTheoryProfessors] = useState([null]);
    const [assignedPracticalProfessors, setAssignedPracticalProfessors] = useState([null, null]);

    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', text: '' });

    // Fetch professors from Firestore in real-time
    useEffect(() => {
        const fetchProfessors = () => {
            const unsubscribe = onSnapshot(collection(db, "professors"), (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setProfessors(data);
                console.log("Professors loaded from Firestore:", data.length);
            }, (error) => {
                console.error("Error fetching professors from Firestore:", error);
            });

            return unsubscribe;
        };

        const unsubscribe = fetchProfessors();
        return () => unsubscribe();
    }, []);

    // Fetch courses from Firestore
    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const snapshot = await getDocs(collection(db, "courses"));
                const coursesData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setCourses(coursesData);
            } catch (err) {
                console.error("Error loading courses from Firestore:", err);
            }
        };

        fetchCourses();
    }, []);

    // Filter professors by type
    const theoryProfessors = professors.filter(p =>
        p.type === 'Theory' || p.type === 'theory' || p.type === 'both'
    );

    const practicalProfessors = professors.filter(p =>
        p.type === 'Practical' || p.type === 'practical' || p.type === 'both'
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

    // Assign a professor to a slot - STORE LECTURER ID
    const assignTheoryProfessor = (lecturerId, slotIndex) => {
        setAssignedTheoryProfessors(prev => {
            const newArray = [...prev];
            newArray[slotIndex] = lecturerId;
            return newArray;
        });
    };

    const assignPracticalProfessor = (lecturerId, slotIndex) => {
        setAssignedPracticalProfessors(prev => {
            const newArray = [...prev];
            newArray[slotIndex] = lecturerId;
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

    // Get professor details by LecturerID
    const getProfessorDetails = (lecturerId) => {
        const prof = professors.find(p => p.LecturerID === lecturerId || p.id === lecturerId);
        return prof || null;
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

        try {
            const courseRef = doc(db, "courses", courseCode.trim());
            await setDoc(courseRef, {
                name: courseName.trim(),
                code: courseCode.trim(),
                academicHours: Number(academicHours),
                type: courseType,
                weeks: Number(weeks),
                theorySections: courseType === 'practical-only' ? 0 : Number(theorySections),
                practicalSections: courseType === 'theory-only' ? 0 : Number(practicalSections),
                theoryProfessors: courseType === 'practical-only' ? [] : assignedTheoryProfessors,
                practicalProfessors: courseType === 'theory-only' ? [] : assignedPracticalProfessors,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });

            console.log("Course saved to Firestore successfully");

            // Add to local state
            const newCourse = {
                id: courseCode.trim(),
                name: courseName.trim(),
                code: courseCode.trim(),
                academicHours: Number(academicHours),
                type: courseType,
                weeks: Number(weeks),
                theorySections: courseType === 'practical-only' ? 0 : Number(theorySections),
                practicalSections: courseType === 'theory-only' ? 0 : Number(practicalSections),
                theoryProfessors: courseType === 'practical-only' ? [] : assignedTheoryProfessors,
                practicalProfessors: courseType === 'theory-only' ? [] : assignedPracticalProfessors,
                createdAt: new Date().toISOString(),
            };

            setCourses(prev => [...prev, newCourse]);

            // Reset fields
            setCourseName('');
            setCourseCode('');
            setAcademicHours(2);
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

        } catch (err) {
            console.error("Firestore error:", err);
            setMessage({ type: "error", text: "Error saving course to Firestore" });
        } finally {
            setLoading(false);
        }

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
        <div className="add-courses-page">
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-book"></i>
                        Add New Course
                    </h1>
                    <p className="page-subtitle">Add new courses to the academic system</p>
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

                            {/* Subject Academic Hours */}
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
                                <small className="form-hint">
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
                                <small className="form-hint">
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
                                <small className="form-hint">
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
                                        <small className="form-hint">
                                            (Auto) = Theory Sections × 2
                                        </small>
                                    )}
                                </div>
                            )}

                            {/* Number of Theory Professors */}
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
                                    <small className="form-hint">
                                        How many professors will teach theory sections?
                                    </small>
                                </div>
                            )}

                            {/* Number of Practical Professors */}
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
                                    <small className="form-hint">
                                        How many professors will teach practical sections?
                                    </small>
                                </div>
                            )}
                        </div>

                        {/* Theory Professor Assignment Section */}
                        {(courseType === 'theory-only' || courseType === 'theory-practical') && (
                            <div className="professor-assignment-section">
                                <h3 className="section-title">
                                    <i className="fas fa-user-tie"></i>
                                    Theory Professors Assignment
                                    <span className="professor-count">
                                        {theoryProfessors.length} professors available
                                    </span>
                                </h3>

                                <div className="professor-assignment-container">
                                    {/* Available Theory Professors */}
                                    <div className="professor-list-container">
                                        <h4 className="list-title">Available Theory Professors</h4>
                                        <div className="professor-list">
                                            {theoryProfessors.length === 0 ? (
                                                <div className="no-professors">
                                                    No theory professors available in database
                                                </div>
                                            ) : (
                                                theoryProfessors.map((professor) => (
                                                    <div key={professor.LecturerID || professor.id} className="available-professor-item">
                                                        <div className="professor-info">
                                                            <div className="professor-name">{professor.name}</div>
                                                            <div className="professor-details">
                                                                <span className="professor-id">
                                                                    <i className="fas fa-id-card"></i>
                                                                    ID: {professor.LecturerID}
                                                                </span>
                                                                {professor.faculty && (
                                                                    <span className="professor-faculty">
                                                                        <i className="fas fa-university"></i>
                                                                        {professor.faculty}
                                                                    </span>
                                                                )}
                                                                {professor.specialization && (
                                                                    <span className="professor-specialization">
                                                                        <i className="fas fa-graduation-cap"></i>
                                                                        {professor.specialization}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const emptySlotIndex = assignedTheoryProfessors.findIndex(p => p === null);
                                                                if (emptySlotIndex !== -1) {
                                                                    assignTheoryProfessor(professor.LecturerID || professor.id, emptySlotIndex);
                                                                }
                                                            }}
                                                            disabled={assignedTheoryProfessors.includes(professor.LecturerID || professor.id)}
                                                            className="assign-arrow-button"
                                                            title={assignedTheoryProfessors.includes(professor.LecturerID || professor.id) ? 'Already assigned' : 'Assign to next available slot'}
                                                        >
                                                            →
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Assigned Theory Professors */}
                                    <div className="professor-list-container">
                                        <h4 className="list-title">
                                            Assigned Theory Professors ({assignedTheoryProfessors.filter(p => p !== null).length}/{numTheoryProfessors})
                                        </h4>
                                        <div className="professor-list">
                                            {assignedTheoryProfessors.map((lecturerId, index) => {
                                                const professor = getProfessorDetails(lecturerId);
                                                return (
                                                    <div key={index} className={`assigned-professor-item ${!lecturerId ? 'unassigned' : ''}`}>
                                                        <div className="professor-slot-info">
                                                            <div className="professor-slot-title">Theory Professor {index + 1}</div>
                                                            <div className="professor-assignment-details">
                                                                {professor ? (
                                                                    <>
                                                                        <div className="professor-name">{professor.name}</div>
                                                                        <div className="professor-details">
                                                                            <span className="professor-id">
                                                                                <i className="fas fa-id-card"></i>
                                                                                ID: {professor.LecturerID}
                                                                            </span>
                                                                            {professor.faculty && (
                                                                                <span className="professor-faculty">
                                                                                    <i className="fas fa-university"></i>
                                                                                    {professor.faculty}
                                                                                </span>
                                                                            )}
                                                                            {professor.specialization && (
                                                                                <span className="professor-specialization">
                                                                                    <i className="fas fa-graduation-cap"></i>
                                                                                    {professor.specialization}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <span className="unassigned-text">Not assigned</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {lecturerId && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removeTheoryProfessor(index)}
                                                                className="remove-button"
                                                                title="Remove professor"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Practical Professor Assignment Section */}
                        {(courseType === 'practical-only' || courseType === 'theory-practical') && (
                            <div className="professor-assignment-section">
                                <h3 className="section-title">
                                    <i className="fas fa-user-graduate"></i>
                                    Practical Professors Assignment
                                    <span className="professor-count">
                                        {practicalProfessors.length} professors available
                                    </span>
                                </h3>

                                <div className="professor-assignment-container">
                                    {/* Available Practical Professors */}
                                    <div className="professor-list-container">
                                        <h4 className="list-title">Available Practical Professors</h4>
                                        <div className="professor-list">
                                            {practicalProfessors.length === 0 ? (
                                                <div className="no-professors">
                                                    No practical professors available in database
                                                </div>
                                            ) : (
                                                practicalProfessors.map((professor) => (
                                                    <div key={professor.LecturerID || professor.id} className="available-professor-item">
                                                        <div className="professor-info">
                                                            <div className="professor-name">{professor.name}</div>
                                                            <div className="professor-details">
                                                                <span className="professor-id">
                                                                    <i className="fas fa-id-card"></i>
                                                                    ID: {professor.LecturerID}
                                                                </span>
                                                                {professor.faculty && (
                                                                    <span className="professor-faculty">
                                                                        <i className="fas fa-university"></i>
                                                                        {professor.faculty}
                                                                    </span>
                                                                )}
                                                                {professor.specialization && (
                                                                    <span className="professor-specialization">
                                                                        <i className="fas fa-graduation-cap"></i>
                                                                        {professor.specialization}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const emptySlotIndex = assignedPracticalProfessors.findIndex(p => p === null);
                                                                if (emptySlotIndex !== -1) {
                                                                    assignPracticalProfessor(professor.LecturerID || professor.id, emptySlotIndex);
                                                                }
                                                            }}
                                                            disabled={assignedPracticalProfessors.includes(professor.LecturerID || professor.id)}
                                                            className="assign-arrow-button"
                                                            title={assignedPracticalProfessors.includes(professor.LecturerID || professor.id) ? 'Already assigned' : 'Assign to next available slot'}
                                                        >
                                                            →
                                                        </button>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>

                                    {/* Assigned Practical Professors */}
                                    <div className="professor-list-container">
                                        <h4 className="list-title">
                                            Assigned Practical Professors ({assignedPracticalProfessors.filter(p => p !== null).length}/{numPracticalProfessors})
                                        </h4>
                                        <div className="professor-list practical-assigned-list">
                                            {assignedPracticalProfessors.map((lecturerId, index) => {
                                                const professor = getProfessorDetails(lecturerId);
                                                return (
                                                    <div key={index} className={`assigned-professor-item ${!lecturerId ? 'unassigned' : ''}`}>
                                                        <div className="professor-slot-info">
                                                            <div className="professor-slot-title">Practical Professor {index + 1}</div>
                                                            <div className="professor-assignment-details">
                                                                {professor ? (
                                                                    <>
                                                                        <div className="professor-name">{professor.name}</div>
                                                                        <div className="professor-details">
                                                                            <span className="professor-id">
                                                                                <i className="fas fa-id-card"></i>
                                                                                ID: {professor.LecturerID}
                                                                            </span>
                                                                            {professor.faculty && (
                                                                                <span className="professor-faculty">
                                                                                    <i className="fas fa-university"></i>
                                                                                    {professor.faculty}
                                                                                </span>
                                                                            )}
                                                                            {professor.specialization && (
                                                                                <span className="professor-specialization">
                                                                                    <i className="fas fa-graduation-cap"></i>
                                                                                    {professor.specialization}
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </>
                                                                ) : (
                                                                    <span className="unassigned-text">Not assigned</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {lecturerId && (
                                                            <button
                                                                type="button"
                                                                onClick={() => removePracticalProfessor(index)}
                                                                className="remove-button"
                                                                title="Remove professor"
                                                            >
                                                                Remove
                                                            </button>
                                                        )}
                                                    </div>
                                                );
                                            })}
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
                                setAcademicHours(2);
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
            </div>
        </div>
    );
}

export default AddCourse;