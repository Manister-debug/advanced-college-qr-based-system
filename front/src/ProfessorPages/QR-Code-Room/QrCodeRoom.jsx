import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    getDoc,
    addDoc,
    getDocs
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useAuth } from '../../context/AuthContext';
import './QrCodeRoom.css';
import ProfessorNavbar from '../../components/ProfessorNavbar/ProfessorNavbar';

const QrCodeRoom = () => {
    const navigate = useNavigate();
    const { user, getLecturerId } = useAuth();

    // State variables
    const [qrCode, setQrCode] = useState(null);
    const [countdown, setCountdown] = useState(30);
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [isQrRedacted, setIsQrRedacted] = useState(false);
    const [attendanceList, setAttendanceList] = useState([]);
    const [manualCollegeId, setManualCollegeId] = useState('');
    const [isLectureEnded, setIsLectureEnded] = useState(false);

    // New states for week and course selection
    const [selectedWeek, setSelectedWeek] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [weeks, setWeeks] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [endedWeeks, setEndedWeeks] = useState([]); // Track ended weeks

    // استخدم بيانات المستخدم الفعلية
    const [roomInfo, setRoomInfo] = useState({
        roomNumber: '101',
        courseName: 'Select Course',
        courseCode: '',
        lecturerName: user?.name || 'Professor',
        section: 'Section A'
    });

    // Fetch courses assigned to the professor
    useEffect(() => {
        const fetchProfessorCourses = async () => {
            if (!user || !getLecturerId()) return;

            try {
                const lecturerId = getLecturerId();

                // Query all courses
                const coursesRef = collection(db, "courses");
                const snapshot = await getDocs(coursesRef);
                const allCourses = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));

                // Filter courses where professor's LecturerID is in theoryProfessors or practicalProfessors
                const professorCourses = allCourses.filter(course => {
                    const theoryProfessors = Array.isArray(course.theoryProfessors) ? course.theoryProfessors : [];
                    const practicalProfessors = Array.isArray(course.practicalProfessors) ? course.practicalProfessors : [];

                    const isTheoryProfessor = theoryProfessors.includes(lecturerId);
                    const isPracticalProfessor = practicalProfessors.includes(lecturerId);

                    return isTheoryProfessor || isPracticalProfessor;
                });

                // Enrich course data with professor role
                const enrichedCourses = professorCourses.map(course => {
                    const theoryProfessors = Array.isArray(course.theoryProfessors) ? course.theoryProfessors : [];
                    const practicalProfessors = Array.isArray(course.practicalProfessors) ? course.practicalProfessors : [];

                    const isTheoryProf = theoryProfessors.includes(lecturerId);
                    const isPracticalProf = practicalProfessors.includes(lecturerId);

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
                        professorRole
                    };
                });

                setCourses(enrichedCourses);

                // Set default course if available
                if (enrichedCourses.length > 0) {
                    setSelectedCourse(enrichedCourses[0].id);
                    // Update room info with first course
                    const firstCourse = enrichedCourses[0];
                    setRoomInfo(prev => ({
                        ...prev,
                        courseName: firstCourse.name,
                        courseCode: firstCourse.code,
                        section: firstCourse.section || 'Section A'
                    }));
                }
            } catch (error) {
                console.error('Error fetching professor courses:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchProfessorCourses();
    }, [user, getLecturerId]);

    // Generate weeks based on selected course
    useEffect(() => {
        if (selectedCourse && courses.length > 0) {
            const selectedCourseData = courses.find(course => course.id === selectedCourse);
            if (selectedCourseData) {
                // Get number of weeks from course data
                const courseWeeks = selectedCourseData.weeks || 16; // Default 16 weeks if not specified

                // Generate weeks array
                const generatedWeeks = Array.from({ length: courseWeeks }, (_, i) => ({
                    id: `week${i + 1}`,
                    weekNumber: i + 1,
                    name: `Week ${i + 1}`,
                    isCurrent: i === 0 // First week is current by default
                }));

                setWeeks(generatedWeeks);

                // Set default week
                if (generatedWeeks.length > 0) {
                    const currentWeek = generatedWeeks.find(week => week.isCurrent === true) || generatedWeeks[0];
                    setSelectedWeek(currentWeek.id);
                }
            }
        } else {
            // Reset weeks when no course is selected
            setWeeks([]);
            setSelectedWeek('');
        }
    }, [selectedCourse, courses]);

    // Fetch ended weeks for this course
    useEffect(() => {
        if (!selectedCourse || !getLecturerId()) return;

        const fetchEndedWeeks = async () => {
            try {
                // Query attendance sessions that are ended for this course and lecturer
                const sessionsQuery = query(
                    collection(db, 'attendance_sessions'),
                    where('courseId', '==', selectedCourse),
                    where('lecturerId', '==', getLecturerId()),
                    where('isActive', '==', false)
                );

                const snapshot = await getDocs(sessionsQuery);
                const endedWeeksList = snapshot.docs.map(doc => doc.data().weekId);
                setEndedWeeks(endedWeeksList);
            } catch (error) {
                console.error('Error fetching ended weeks:', error);
            }
        };

        fetchEndedWeeks();
    }, [selectedCourse, getLecturerId]);

    // Update room info when course changes
    useEffect(() => {
        if (selectedCourse && courses.length > 0) {
            const selectedCourseData = courses.find(course => course.id === selectedCourse);
            if (selectedCourseData) {
                setRoomInfo(prev => ({
                    ...prev,
                    courseName: selectedCourseData.name,
                    courseCode: selectedCourseData.code,
                    section: selectedCourseData.section || 'Section A'
                }));

                // Generate new QR code with updated course and week info
                updateQrCode(selectedCourseData);
            }
        }
    }, [selectedCourse, selectedWeek, courses]);

    // Update QR code when week or course changes
    const updateQrCode = (courseData) => {
        if (!selectedWeek || !courseData) return;

        const weekData = weeks.find(week => week.id === selectedWeek);
        const weekNumber = weekData ? weekData.weekNumber : '1';

        // Generate QR code data with course and week info
        const qrData = `Course:${courseData.code}|Week:${weekNumber}|Room:${roomInfo.roomNumber}|Lecturer:${user?.name}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
        setQrCode(qrCodeUrl);
    };

    // Fetch attendance data based on selected course and week
    useEffect(() => {
        if (!selectedCourse || !selectedWeek) return;

        const fetchAttendanceData = async () => {
            try {
                const weekData = weeks.find(week => week.id === selectedWeek);
                const courseData = courses.find(course => course.id === selectedCourse);

                if (!weekData || !courseData) return;

                // Query attendance for this course and week
                const attendanceQuery = query(
                    collection(db, 'attendance'),
                    where('courseId', '==', selectedCourse),
                    where('weekId', '==', selectedWeek),
                    where('lecturerId', '==', getLecturerId())
                );

                const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
                    const attendanceData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Sort by timestamp
                    attendanceData.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
                    setAttendanceList(attendanceData);
                });

                return unsubscribe;
            } catch (error) {
                console.error('Error fetching attendance data:', error);
            }
        };

        fetchAttendanceData();
    }, [selectedCourse, selectedWeek, weeks, courses, getLecturerId]);

    // Countdown timer effect
    useEffect(() => {
        let timer;
        if (isCountdownActive && countdown > 0) {
            timer = setInterval(() => {
                setCountdown(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        redactQrCode();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (timer) clearInterval(timer);
        };
    }, [isCountdownActive, countdown]);

    const startCountdown = async () => {
        if (!selectedCourse || !selectedWeek) {
            alert('Please select both course and week before starting attendance');
            return;
        }

        // Check if this week is already ended
        if (endedWeeks.includes(selectedWeek)) {
            alert('This week has already been ended. Please select another week.');
            return;
        }

        // Check if there's already an active session for this week
        try {
            const activeSessionQuery = query(
                collection(db, 'attendance_sessions'),
                where('courseId', '==', selectedCourse),
                where('weekId', '==', selectedWeek),
                where('lecturerId', '==', getLecturerId()),
                where('isActive', '==', true)
            );

            const snapshot = await getDocs(activeSessionQuery);
            if (!snapshot.empty) {
                alert('There is already an active attendance session for this week.');
                return;
            }
        } catch (error) {
            console.error('Error checking active sessions:', error);
        }

        setIsCountdownActive(true);
        setCountdown(30);
        setIsQrRedacted(false);

        // Create attendance session in Firestore
        try {
            const attendanceSession = {
                courseId: selectedCourse,
                weekId: selectedWeek,
                lecturerId: getLecturerId(),
                roomNumber: roomInfo.roomNumber,
                qrCode: qrCode,
                isActive: true,
                startTime: new Date(),
                endTime: null,
                createdAt: new Date()
            };

            await addDoc(collection(db, 'attendance_sessions'), attendanceSession);
            console.log('Attendance session started');
        } catch (error) {
            console.error('Error creating attendance session:', error);
        }
    };

    const redactQrCode = async () => {
        setIsQrRedacted(true);
        setIsCountdownActive(false);

        // Update attendance session in Firestore
        try {
            // Find the active session for this course and week
            const sessionsQuery = query(
                collection(db, 'attendance_sessions'),
                where('courseId', '==', selectedCourse),
                where('weekId', '==', selectedWeek),
                where('lecturerId', '==', getLecturerId()),
                where('isActive', '==', true)
            );

            const snapshot = await getDocs(sessionsQuery);
            if (!snapshot.empty) {
                const sessionDoc = snapshot.docs[0];
                await updateDoc(doc(db, 'attendance_sessions', sessionDoc.id), {
                    isActive: false,
                    endTime: new Date()
                });

                // Update ended weeks list
                setEndedWeeks(prev => [...prev, selectedWeek]);
            }

            console.log('QR code redacted and session ended');
        } catch (error) {
            console.error('Error redacting QR code:', error);
        }
    };

    const checkIfStudentAlreadyAttended = async (studentId) => {
        if (!selectedCourse || !selectedWeek) return false;

        try {
            // Query to check if student already attended this course and week
            const attendanceQuery = query(
                collection(db, 'attendance'),
                where('studentId', '==', studentId),
                where('courseId', '==', selectedCourse),
                where('weekId', '==', selectedWeek),
                where('lecturerId', '==', getLecturerId())
            );

            const snapshot = await getDocs(attendanceQuery);
            return !snapshot.empty; // Returns true if student already attended
        } catch (error) {
            console.error('Error checking student attendance:', error);
            return false;
        }
    };

    const handleManualAttendance = async () => {
        if (!manualCollegeId.trim()) {
            alert('Please enter a College ID');
            return;
        }

        if (!selectedCourse || !selectedWeek) {
            alert('Please select course and week first');
            return;
        }

        // Check if this week is already ended
        if (endedWeeks.includes(selectedWeek)) {
            alert('This week has already been ended. Cannot add manual attendance.');
            return;
        }

        // Check if student already attended this week
        const alreadyAttended = await checkIfStudentAlreadyAttended(manualCollegeId);
        if (alreadyAttended) {
            alert(`Student with ID ${manualCollegeId} has already attended this week.`);
            return;
        }

        try {
            // Check if student exists
            const studentQuery = query(
                collection(db, 'users'),
                where('collegeId', '==', manualCollegeId),
                where('role', '==', 'student')
            );

            const snapshot = await getDocs(studentQuery);
            let studentName = 'Unknown Student';

            if (!snapshot.empty) {
                const studentData = snapshot.docs[0].data();
                studentName = studentData.name || studentData.username || 'Unknown Student';
            }

            // Create manual attendance record
            const newAttendance = {
                studentId: manualCollegeId,
                studentName: studentName,
                collegeId: manualCollegeId,
                courseId: selectedCourse,
                weekId: selectedWeek,
                lecturerId: getLecturerId(),
                roomNumber: roomInfo.roomNumber,
                status: 'Present-M',
                timestamp: new Date(),
                isManual: true,
                scanTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
                createdAt: new Date()
            };

            await addDoc(collection(db, 'attendance'), newAttendance);

            // Update local state
            setAttendanceList(prev => [newAttendance, ...prev]);
            setManualCollegeId('');

            alert(`Student ${studentName} (${manualCollegeId}) marked as Present-M`);
        } catch (error) {
            console.error('Error adding manual attendance:', error);
            alert('Failed to add manual attendance. Please try again.');
        }
    };

    const handleReportProblem = async () => {
        try {
            const reportData = {
                type: 'problem',
                roomId: roomInfo.roomNumber,
                course: selectedCourse,
                week: selectedWeek,
                lecturerId: getLecturerId(),
                timestamp: new Date(),
                status: 'pending',
                description: 'Reported via QR Code Attendance System',
                createdAt: new Date()
            };

            await addDoc(collection(db, 'reports'), reportData);
            alert('Problem reported successfully!');
        } catch (error) {
            console.error('Error reporting problem:', error);
            alert('Failed to report problem. Please try again.');
        }
    };

    const handleEndLecture = async () => {
        if (!selectedCourse || !selectedWeek) {
            alert('Please select course and week first');
            return;
        }

        if (window.confirm('Are you sure you want to end the lecture for this week? This will prevent any further attendance for this week.')) {
            try {
                // Mark the week as ended
                const weekEndData = {
                    courseId: selectedCourse,
                    weekId: selectedWeek,
                    lecturerId: getLecturerId(),
                    endedAt: new Date(),
                    endedBy: user?.name || 'Professor',
                    roomNumber: roomInfo.roomNumber
                };

                await addDoc(collection(db, 'ended_weeks'), weekEndData);
                
                // Also ensure any active session is ended
                const sessionsQuery = query(
                    collection(db, 'attendance_sessions'),
                    where('courseId', '==', selectedCourse),
                    where('weekId', '==', selectedWeek),
                    where('lecturerId', '==', getLecturerId()),
                    where('isActive', '==', true)
                );

                const snapshot = await getDocs(sessionsQuery);
                if (!snapshot.empty) {
                    const sessionDoc = snapshot.docs[0];
                    await updateDoc(doc(db, 'attendance_sessions', sessionDoc.id), {
                        isActive: false,
                        endTime: new Date()
                    });
                }

                // Update ended weeks list
                setEndedWeeks(prev => [...prev, selectedWeek]);
                
                alert(`Week ${selectedWeek} has been ended successfully. No further attendance can be taken for this week.`);
                
                // Reset UI
                setIsQrRedacted(true);
                setIsCountdownActive(false);
                
            } catch (error) {
                console.error('Error ending lecture:', error);
                alert('Failed to end lecture. Please try again.');
            }
        }
    };

    // Check if current week is ended
    const isWeekEnded = endedWeeks.includes(selectedWeek);

    if (loading) {
        return (
            <div className="loading-container-full">
                <div className="spinner"></div>
                <p>Loading courses and weeks...</p>
            </div>
        );
    }

    // If lecture is ended, show the end message
    if (isLectureEnded) {
        return (
            <div className="lecture-ended-container">
                <div className="lecture-ended-message">
                    <i className="fas fa-check-circle"></i>
                    <h1>The Lecture {roomInfo.courseName} ({roomInfo.section}) in Room {roomInfo.roomNumber} has ended</h1>
                    <p>Redirecting to login page...</p>
                    <div className="redirecting-spinner">
                        <i className="fas fa-spinner fa-spin"></i>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="qr-code-room-page">
            <div className="page-header">
            </div>

            <div className="content-container">
                {/* Left Section - QR Code */}
                <section className="qr-section">
                    <div className="qr-container">
                        <div className="qr-header">
                            <h2>
                                <i className="fas fa-door-open"></i>
                                Room {roomInfo.roomNumber}
                            </h2>
                            <div className="course-info">
                                <h3>{roomInfo.courseName}</h3>
                                <div className="course-details">
                                    <span className="course-code">
                                        <i className="fas fa-book"></i>
                                        {roomInfo.courseCode}
                                    </span>
                                    <span className="lecturer-name">
                                        <i className="fas fa-chalkboard-teacher"></i>
                                        {roomInfo.lecturerName}
                                    </span>
                                    {selectedCourse && (
                                        <span className="course-weeks">
                                            <i className="fas fa-calendar-week"></i>
                                            {weeks.length} Weeks
                                        </span>
                                    )}
                                    {isWeekEnded && (
                                        <span className="week-ended-badge">
                                            <i className="fas fa-ban"></i>
                                            Week Ended
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="qr-display-container">
                            <div className={`qr-display ${isQrRedacted ? 'redacted' : ''}`}>
                                {isQrRedacted ? (
                                    <div className="qr-redacted">
                                        <i className="fas fa-ban"></i>
                                        <p>QR Code Expired</p>
                                    </div>
                                ) : qrCode ? (
                                    <img src={qrCode} alt="QR Code" className="qr-image" />
                                ) : (
                                    <div className="qr-placeholder">
                                        <i className="fas fa-qrcode"></i>
                                        <p>Select a course and week to generate QR Code</p>
                                    </div>
                                )}

                                {isCountdownActive && (
                                    <div className="countdown-overlay">
                                        <div className="countdown-circle">
                                            <span className="countdown-number">{countdown}</span>
                                        </div>
                                        <p className="countdown-text">Seconds remaining</p>
                                    </div>
                                )}
                            </div>

                            <div className="qr-instructions">
                                <div className="instructions-list">
                                    <p>
                                        <i className="fas fa-mobile-alt"></i>
                                        Please scan the QR code with your own mobile phone that has UniScan installed.
                                    </p>
                                    <p>
                                        <i className="fas fa-exclamation-triangle"></i>
                                        Report a problem (software, room related, emergencies) by pressing the red button below
                                    </p>
                                </div>

                                <button
                                    className="btn-report"
                                    onClick={handleReportProblem}
                                    disabled={isWeekEnded}
                                >
                                    <i className="fas fa-flag"></i>
                                    Report
                                </button>
                            </div>
                        </div>

                        <div className="qr-controls">
                            <div className="qr-controls-left">
                                <button
                                    className={`btn-start-countdown ${isCountdownActive ? 'active' : ''}`}
                                    onClick={startCountdown}
                                    disabled={isCountdownActive || !selectedCourse || !selectedWeek || isWeekEnded}
                                >
                                    <i className="fas fa-play-circle"></i>
                                    {isCountdownActive ? 'Countdown Active' : 'Start 30-Second Countdown'}
                                    {isCountdownActive && <span className="countdown-badge">{countdown}s</span>}
                                </button>

                                <div className="qr-status">
                                    <span className={`status-indicator ${isQrRedacted ? 'inactive' : 'active'}`}>
                                        <i className={`fas fa-${isQrRedacted ? 'times-circle' : 'check-circle'}`}></i>
                                        {isQrRedacted ? 'QR Code Inactive' : 'QR Code Active'}
                                    </span>
                                </div>
                            </div>

                            <div className="qr-controls-right">
                                <button
                                    className="btn-end-lecture"
                                    onClick={handleEndLecture}
                                    disabled={!selectedCourse || !selectedWeek || isWeekEnded}
                                >
                                    <i className="fas fa-sign-out-alt"></i>
                                    End Week
                                </button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Right Section - Attendance Log */}
                <section className="attendance-section">
                    <div className="attendance-container">
                        <div className="attendance-header">
                            <div className="attendance-title">
                                <h2>
                                    <i className="fas fa-clipboard-list"></i>
                                    Attendance Log
                                </h2>
                                <p className="attendance-subtitle">
                                    Room {roomInfo.roomNumber} - {roomInfo.courseCode} - {roomInfo.section}
                                </p>
                            </div>

                            {/* Week and Course Selection */}
                            <div className="selection-filters">
                                <div className="filter-group">
                                    <label className="filter-label">
                                        <i className="fas fa-calendar-week"></i>
                                        Select Week
                                    </label>
                                    <select
                                        className="filter-select"
                                        value={selectedWeek}
                                        onChange={(e) => setSelectedWeek(e.target.value)}
                                        disabled={!selectedCourse}
                                    >
                                        <option value="">Select Week</option>
                                        {weeks.map(week => {
                                            const isEnded = endedWeeks.includes(week.id);
                                            return (
                                                <option 
                                                    key={week.id} 
                                                    value={week.id}
                                                    style={isEnded ? { color: '#dc2626', fontStyle: 'italic' } : {}}
                                                >
                                                    {week.name}
                                                    {week.isCurrent && ' (Current)'}
                                                    {isEnded && ' - ENDED'}
                                                </option>
                                            );
                                        })}
                                    </select>
                                    {selectedCourse && weeks.length === 0 && (
                                        <p className="filter-note">No weeks available for this course</p>
                                    )}
                                </div>

                                <div className="filter-group">
                                    <label className="filter-label">
                                        <i className="fas fa-book"></i>
                                        Select Course
                                    </label>
                                    <select
                                        className="filter-select"
                                        value={selectedCourse}
                                        onChange={(e) => setSelectedCourse(e.target.value)}
                                    >
                                        <option value="">Select Course</option>
                                        {courses.map(course => (
                                            <option key={course.id} value={course.id}>
                                                {course.code} - {course.name} ({course.weeks || 16} weeks)
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Manual Attendance Input */}
                        <div className="manual-attendance">
                            <h3>
                                <i className="fas fa-user-plus"></i>
                                Manual Attendance Entry
                            </h3>
                            <div className="manual-input-group">
                                <div className="input-wrapper">
                                    <i className="fas fa-id-card"></i>
                                    <input
                                        type="text"
                                        placeholder="Enter College ID"
                                        value={manualCollegeId}
                                        onChange={(e) => setManualCollegeId(e.target.value)}
                                        onKeyPress={(e) => e.key === 'Enter' && handleManualAttendance()}
                                        disabled={!selectedCourse || !selectedWeek || isWeekEnded}
                                    />
                                </div>
                                <button
                                    className="btn-manual-attendance"
                                    onClick={handleManualAttendance}
                                    disabled={!selectedCourse || !selectedWeek || isWeekEnded}
                                >
                                    <i className="fas fa-check"></i>
                                    Mark as Present-M
                                </button>
                            </div>
                            <p className="manual-note">
                                <i className="fas fa-info-circle"></i>
                                {isWeekEnded ? 'This week has been ended. No further attendance can be added.' : 'Use this for students who couldn\'t scan the QR code'}
                            </p>
                        </div>

                        <div className="attendance-table-container">
                            <table className="attendance-table">
                                <thead>
                                    <tr>
                                        <th>
                                            <i className="fas fa-hashtag"></i>
                                            No.
                                        </th>
                                        <th>
                                            <i className="fas fa-user"></i>
                                            Student Name
                                        </th>
                                        <th>
                                            <i className="fas fa-id-card"></i>
                                            College ID
                                        </th>
                                        <th>
                                            <i className="fas fa-clock"></i>
                                            Scan Time
                                        </th>
                                        <th>
                                            <i className="fas fa-check-circle"></i>
                                            Status
                                        </th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {attendanceList.length > 0 ? (
                                        attendanceList.map((student, index) => (
                                            <tr key={student.id}>
                                                <td className="row-number">{index + 1}</td>
                                                <td className="student-name">
                                                    <i className="fas fa-user-graduate"></i>
                                                    {student.studentName}
                                                </td>
                                                <td className="student-id">{student.collegeId}</td>
                                                <td className="scan-time">
                                                    <i className="fas fa-clock"></i>
                                                    {student.scanTime || student.timestamp?.toDate().toLocaleTimeString()}
                                                </td>
                                                <td>
                                                    <span className={`status-badge ${student.status === 'Present-M' ? 'present-manual' : 'present'}`}>
                                                        <i className="fas fa-check"></i>
                                                        {student.status}
                                                    </span>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan="5" className="no-attendance">
                                                <i className="fas fa-user-slash"></i>
                                                {selectedCourse && selectedWeek ? 
                                                    (isWeekEnded ? 'Week has been ended' : 'No attendance records for this week') 
                                                    : 'Select course and week to view attendance'}
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>

                        <div className="attendance-summary">
                            <div className="summary-card">
                                <h4>Total Present</h4>
                                <p className="total-count">{attendanceList.length}</p>
                            </div>
                            <div className="summary-card">
                                <h4>Manual Entries</h4>
                                <p className="manual-count">
                                    {attendanceList.filter(s => s.status === 'Present-M').length}
                                </p>
                            </div>
                            <div className="summary-card">
                                <h4>Week</h4>
                                <p className="capacity">
                                    {selectedWeek ? weeks.find(w => w.id === selectedWeek)?.name || 'N/A' : 'Not Selected'}
                                </p>
                            </div>
                            <div className="summary-card">
                                <h4>Week Status</h4>
                                <p className="rate" style={{ color: isWeekEnded ? '#dc2626' : '#059669' }}>
                                    {isWeekEnded ? 'Ended' : 'Active'}
                                </p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default QrCodeRoom;