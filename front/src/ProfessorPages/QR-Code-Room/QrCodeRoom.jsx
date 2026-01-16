import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    collection,
    query,
    where,
    onSnapshot,
    updateDoc,
    doc,
    getDocs,
    addDoc
} from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useAuth } from '../../context/AuthContext';
import './QrCodeRoom.css';

const QrCodeRoom = () => {
    const navigate = useNavigate();
    const { user, getLecturerId } = useAuth();

    const [qrCode, setQrCode] = useState(null);
    const [countdown, setCountdown] = useState(30);
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [isQrRedacted, setIsQrRedacted] = useState(false);
    const [attendanceList, setAttendanceList] = useState([]);
    const [manualCollegeId, setManualCollegeId] = useState('');
    const [isLectureEnded, setIsLectureEnded] = useState(false);

    const [selectedWeek, setSelectedWeek] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [weeks, setWeeks] = useState([]);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [endedWeeks, setEndedWeeks] = useState([]);

    const [roomInfo, setRoomInfo] = useState({
        roomNumber: '101',
        courseName: 'Select Course',
        courseCode: '',
        lecturerName: user?.name || 'Professor',
        section: 'Section A'
    });

    // Fetch professor courses
    useEffect(() => {
        const fetchProfessorCourses = async () => {
            if (!user || !getLecturerId()) return;
            try {
                const lecturerId = getLecturerId();
                const coursesRef = collection(db, "courses");
                const snapshot = await getDocs(coursesRef);
                const allCourses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                const professorCourses = allCourses.filter(course => {
                    const theoryProfessors = Array.isArray(course.theoryProfessors) ? course.theoryProfessors : [];
                    const practicalProfessors = Array.isArray(course.practicalProfessors) ? course.practicalProfessors : [];
                    return theoryProfessors.includes(lecturerId) || practicalProfessors.includes(lecturerId);
                });

                const enrichedCourses = professorCourses.map(course => {
                    const theoryProfessors = Array.isArray(course.theoryProfessors) ? course.theoryProfessors : [];
                    const practicalProfessors = Array.isArray(course.practicalProfessors) ? course.practicalProfessors : [];
                    let professorRole = theoryProfessors.includes(lecturerId) && practicalProfessors.includes(lecturerId)
                        ? 'Both'
                        : theoryProfessors.includes(lecturerId) ? 'Theory' : 'Practical';
                    return { ...course, professorRole };
                });

                setCourses(enrichedCourses);

                if (enrichedCourses.length > 0) {
                    setSelectedCourse(enrichedCourses[0].id);
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

    // Generate weeks
    useEffect(() => {
        if (selectedCourse && courses.length > 0) {
            const selectedCourseData = courses.find(course => course.id === selectedCourse);
            if (selectedCourseData) {
                const courseWeeks = selectedCourseData.weeks || 16;
                const generatedWeeks = Array.from({ length: courseWeeks }, (_, i) => ({
                    id: `week${i + 1}`,
                    weekNumber: i + 1,
                    name: `Week ${i + 1}`,
                    isCurrent: i === 0
                }));
                setWeeks(generatedWeeks);
                if (generatedWeeks.length > 0) {
                    const currentWeek = generatedWeeks.find(w => w.isCurrent) || generatedWeeks[0];
                    setSelectedWeek(currentWeek.id);
                }
            }
        } else {
            setWeeks([]);
            setSelectedWeek('');
        }
    }, [selectedCourse, courses]);

    // Fetch ended weeks
    useEffect(() => {
        if (!selectedCourse || !getLecturerId()) return;
        const fetchEndedWeeks = async () => {
            try {
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

    // Update room info & QR code
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
                updateQrCode(selectedCourseData);
            }
        }
    }, [selectedCourse, selectedWeek, courses]);

    const updateQrCode = (courseData) => {
        if (!selectedWeek || !courseData) return;
        const weekData = weeks.find(week => week.id === selectedWeek);
        const weekNumber = weekData ? weekData.weekNumber : '1';
        const qrData = `Course:${courseData.code}|Week:${weekNumber}|Room:${roomInfo.roomNumber}|Lecturer:${user?.name}`;
        const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrData)}`;
        setQrCode(qrCodeUrl);
    };

    // Fetch attendance
    useEffect(() => {
        if (!selectedCourse || !selectedWeek) return;
        const attendanceQuery = query(
            collection(db, 'attendance'),
            where('courseId', '==', selectedCourse),
            where('weekId', '==', selectedWeek),
            where('lecturerId', '==', getLecturerId())
        );

        const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
            const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            data.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
            setAttendanceList(data);
        });

        return () => unsubscribe();
    }, [selectedCourse, selectedWeek, weeks, courses, getLecturerId]);

    // Countdown timer
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
        return () => timer && clearInterval(timer);
    }, [isCountdownActive, countdown]);

    const startCountdown = async () => {
        if (!selectedCourse || !selectedWeek) return alert('Select course & week');
        if (endedWeeks.includes(selectedWeek)) return alert('Week already ended');
        try {
            const activeSessionQuery = query(
                collection(db, 'attendance_sessions'),
                where('courseId', '==', selectedCourse),
                where('weekId', '==', selectedWeek),
                where('lecturerId', '==', getLecturerId()),
                where('isActive', '==', true)
            );
            const snapshot = await getDocs(activeSessionQuery);
            if (!snapshot.empty) return alert('Active session exists');
        } catch (error) {
            console.error('Error checking session:', error);
        }

        setIsCountdownActive(true);
        setCountdown(30);
        setIsQrRedacted(false);

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
        } catch (error) {
            console.error('Error creating session:', error);
        }
    };

    const redactQrCode = async () => {
        setIsQrRedacted(true);
        setIsCountdownActive(false);
        try {
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
                setEndedWeeks(prev => [...prev, selectedWeek]);
            }
        } catch (error) {
            console.error('Error redacting QR code:', error);
        }
    };

    const checkIfStudentAlreadyAttended = async (studentId) => {
        if (!selectedCourse || !selectedWeek) return false;
        try {
            const attendanceQuery = query(
                collection(db, 'attendance'),
                where('studentId', '==', studentId),
                where('courseId', '==', selectedCourse),
                where('weekId', '==', selectedWeek),
                where('lecturerId', '==', getLecturerId())
            );
            const snapshot = await getDocs(attendanceQuery);
            return !snapshot.empty;
        } catch (error) {
            console.error(error);
            return false;
        }
    };

    const handleManualAttendance = async () => {
        if (!manualCollegeId.trim()) return alert('Enter College ID');
        if (!selectedCourse || !selectedWeek) return alert('Select course & week');
        if (endedWeeks.includes(selectedWeek)) return alert('Week already ended');

        const alreadyAttended = await checkIfStudentAlreadyAttended(manualCollegeId);
        if (alreadyAttended) return alert(`Student ${manualCollegeId} already attended`);

        try {
            const studentQuery = query(
                collection(db, 'users'),
                where('collegeId', '==', manualCollegeId),
                where('role', '==', 'student')
            );
            const snapshot = await getDocs(studentQuery);
            let studentName = 'Unknown Student';
            if (!snapshot.empty) studentName = snapshot.docs[0].data().name || 'Unknown Student';

            const newAttendance = {
                studentId: manualCollegeId,
                studentName,
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
            setManualCollegeId('');
            alert(`Student ${studentName} (${manualCollegeId}) marked as Present-M`);
        } catch (error) {
            console.error(error);
            alert('Failed to add manual attendance');
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
            console.error(error);
            alert('Failed to report problem');
        }
    };

    const handleEndLecture = async () => {
        if (!selectedCourse || !selectedWeek) return alert('Select course & week');
        if (!window.confirm('End lecture?')) return;

        try {
            await addDoc(collection(db, 'ended_weeks'), {
                courseId: selectedCourse,
                weekId: selectedWeek,
                lecturerId: getLecturerId(),
                endedAt: new Date(),
                endedBy: user?.name || 'Professor',
                roomNumber: roomInfo.roomNumber
            });

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
            setEndedWeeks(prev => [...prev, selectedWeek]);
            setIsQrRedacted(true);
            setIsCountdownActive(false);
            alert(`Week ${selectedWeek} ended successfully`);
        } catch (error) {
            console.error(error);
            alert('Failed to end lecture');
        }
    };

    const isWeekEnded = endedWeeks.includes(selectedWeek);

    if (loading) {
        return (
            <div className="loading-container-full">
                <div className="spinner"></div>
                <p>Loading courses and weeks...</p>
            </div>
        );
    }

    // Split attendance
    const manualAttendance = attendanceList.filter(a => a.status === 'Present-M');
    const autoAttendance = attendanceList.filter(a => a.status !== 'Present-M');

    return (
        <div className="qr-code-room-page">
            <div className="page-header"></div>
            <div className="content-container">
                {/* QR Section */}
                <section className="qr-section">
                    <div className="qr-container">
                        <div className="qr-header">
                            <div className="room-info-section">
                                <h2><i className="fas fa-door-open"></i> Room {roomInfo.roomNumber}</h2>
                                <div className="course-info">
                                    <h3>{roomInfo.courseName}</h3>
                                    <div className="course-details">
                                        <span className="course-code"><i className="fas fa-book"></i> {roomInfo.courseCode}</span>
                                        <span className="lecturer-name"><i className="fas fa-chalkboard-teacher"></i> {roomInfo.lecturerName}</span>
                                        {selectedCourse && <span className="course-weeks"><i className="fas fa-calendar-week"></i> {weeks.length} Weeks</span>}
                                        {isWeekEnded && <span className="week-ended-badge"><i className="fas fa-ban"></i> Week Ended</span>}
                                    </div>
                                </div>
                            </div>
                            {isCountdownActive && (
                                <div className="countdown-display-small">
                                    <div className="countdown-circle-small">
                                        <span className="countdown-number-small">{countdown}</span>
                                    </div>
                                    <p className="countdown-text-small">Seconds remaining</p>
                                </div>
                            )}
                        </div>

                        <div className="qr-display-container">
                            <div className={`qr-display ${isQrRedacted ? 'redacted' : ''}`}>
                                {isQrRedacted ? (
                                    <div className="qr-redacted"><i className="fas fa-ban"></i><p>QR Code Expired</p></div>
                                ) : qrCode ? (
                                    <img src={qrCode} alt="QR Code" className="qr-image" />
                                ) : (
                                    <div className="qr-placeholder"><i className="fas fa-qrcode"></i><p>Select a course and week to generate QR Code</p></div>
                                )}
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
                            </div>
                            <div className="qr-controls-right">
                                <button
                                    className="btn-end-lecture"
                                    onClick={handleEndLecture}
                                    disabled={!selectedCourse || !selectedWeek || isWeekEnded}
                                >
                                    <i className="fas fa-sign-out-alt"></i> End Session
                                </button>
                            </div>
                        </div>

                        <div className="qr-instructions">
                            <div className="instructions-list">
                                <p><i className="fas fa-mobile-alt"></i> Scan the QR code with UniScan</p>
                                <p><i className="fas fa-exclamation-triangle"></i> Report any problem using the button below</p>
                            </div>
                            <button
                                className="btn-report"
                                onClick={handleReportProblem}
                                disabled={isWeekEnded}
                            >
                                <i className="fas fa-flag"></i> Report
                            </button>
                        </div>
                    </div>
                </section>

                {/* Attendance Section */}
<section className="attendance-section">
    <div className="attendance-container">
        <div className="attendance-header">
            <div className="attendance-title">
                <h2><i className="fas fa-clipboard-list"></i> Attendance Log</h2>
                <p className="attendance-subtitle">Room {roomInfo.roomNumber} - {roomInfo.courseCode} - {roomInfo.section}</p>
            </div>
            <div className="selection-filters">
                <div className="filter-group">
                    <label className="filter-label"><i className="fas fa-calendar-week"></i> Select Week</label>
                    <select className="filter-select" value={selectedWeek} onChange={e => setSelectedWeek(e.target.value)} disabled={!selectedCourse}>
                        <option value="">Select Week</option>
                        {weeks.map(week => {
                            const isEnded = endedWeeks.includes(week.id);
                            return (
                                <option key={week.id} value={week.id} style={isEnded ? { color: '#dc2626', fontStyle: 'italic' } : {}}>
                                    {week.name} {week.isCurrent ? '(Current)' : ''} {isEnded ? '- ENDED' : ''}
                                </option>
                            );
                        })}
                    </select>
                </div>
                <div className="filter-group">
                    <label className="filter-label"><i className="fas fa-book"></i> Select Course</label>
                    <select className="filter-select" value={selectedCourse} onChange={e => setSelectedCourse(e.target.value)}>
                        <option value="">Select Course</option>
                        {courses.map(course => (
                            <option key={course.id} value={course.id}>{course.code} - {course.name} ({course.weeks || 16} weeks)</option>
                        ))}
                    </select>
                </div>
            </div>
        </div>

        {/* Remove the manual-horizontal-section completely and combine all attendance in one table */}

        {/* Manual Input */}
        <div className="manual-attendance">
            <h3><i className="fas fa-user-plus"></i> Manual Attendance Entry</h3>
            <div className="manual-input-group">
                <div className="input-wrapper">
                    <i className="fas fa-id-card"></i>
                    <input
                        type="text"
                        placeholder="Enter College ID"
                        value={manualCollegeId}
                        onChange={e => setManualCollegeId(e.target.value)}
                        onKeyPress={e => e.key === 'Enter' && handleManualAttendance()}
                        disabled={!selectedCourse || !selectedWeek || isWeekEnded}
                    />
                </div>
                <button
                    className="btn-manual-attendance"
                    onClick={handleManualAttendance}
                    disabled={!selectedCourse || !selectedWeek || isWeekEnded}
                >
                    <i className="fas fa-check"></i> Mark as Present-M
                </button>
            </div>
            <p className="manual-note">{isWeekEnded ? 'This week ended. No further attendance.' : 'Use for students who missed QR scan'}</p>
        </div>

        {/* Attendance Table - Now includes ALL attendance */}
        <div className="attendance-table-container">
            <div className="table-responsive">
                <table className="attendance-table">
                    <thead>
                        <tr>
                            <th>No.</th>
                            <th>Student Name</th>
                            <th>College ID</th>
                            <th>Scan Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {attendanceList.length > 0 ? (
                            attendanceList.map((student, index) => (
                                <tr key={student.id}>
                                    <td>{index + 1}</td>
                                    <td>{student.studentName}</td>
                                    <td>{student.collegeId}</td>
                                    <td>{student.scanTime || (student.timestamp?.toDate ? student.timestamp.toDate().toLocaleTimeString() : 'N/A')}</td>
                                    <td>
                                        <span className={`status-badge ${student.status === 'Present-M' ? 'present-manual' : 'present'}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan="5" className="no-attendance">
                                    <i className="fas fa-user-graduate"></i>
                                    No attendance records yet
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
</section>
            </div>
        </div>
    );
};

export default QrCodeRoom;
