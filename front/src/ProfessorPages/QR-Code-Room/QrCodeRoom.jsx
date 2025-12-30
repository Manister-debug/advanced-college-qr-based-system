import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, where, onSnapshot, updateDoc, doc, getDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase.js';
import { useAuth } from '../../context/AuthContext'; // أضف هذا السطر
import './QrCodeRoom.css';
import ProfessorNavbar from '../../components/ProfessorNavbar/ProfessorNavbar'; // استبدل NavbarLogin

const QrCodeRoom = () => {
    const navigate = useNavigate();
    const { user } = useAuth(); // أضف هذا
    
    // State variables
    const [qrCode, setQrCode] = useState(null);
    const [countdown, setCountdown] = useState(30);
    const [isCountdownActive, setIsCountdownActive] = useState(false);
    const [isQrRedacted, setIsQrRedacted] = useState(false);
    const [attendanceList, setAttendanceList] = useState([]);
    const [manualCollegeId, setManualCollegeId] = useState('');
    const [isLectureEnded, setIsLectureEnded] = useState(false);
    
    // استخدم بيانات المستخدم الفعلية
    const [roomInfo, setRoomInfo] = useState({
        roomNumber: '101',
        courseName: 'Introduction to Computer Science',
        courseCode: 'CS101',
        lecturerName: user?.name || 'Professor', // استخدم اسم المستخدم
        section: 'Section A'
    });

    // تحديث اسم المحاضر عندما يتوفر المستخدم
    useEffect(() => {
        if (user?.name) {
            setRoomInfo(prev => ({
                ...prev,
                lecturerName: user.name
            }));
        }
    }, [user]);

    // Mock data - replace with actual Firestore queries
    const mockAttendanceData = [
        {
            id: '1',
            studentName: 'John Smith',
            collegeId: '20210001',
            scanTime: '10:05:23 AM',
            timestamp: new Date(),
            status: 'Present'
        },
        {
            id: '2',
            studentName: 'Emma Wilson',
            collegeId: '20210002',
            scanTime: '10:07:45 AM',
            timestamp: new Date(),
            status: 'Present'
        }
    ];

    // Fetch QR code from Firestore (replace with actual implementation)
    useEffect(() => {
        const fetchQrCode = async () => {
            try {
                // Replace with actual Firestore query
                // const qrQuery = query(collection(db, 'qrcodes'), where('roomId', '==', 'roomId'));
                // const qrSnapshot = await getDocs(qrQuery);
                // if (!qrSnapshot.empty) {
                //   setQrCode(qrSnapshot.docs[0].data().qrCodeUrl);
                // }

                // Mock QR code data
                setQrCode('https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=Room-101-CS101-Session-2024');
            } catch (error) {
                console.error('Error fetching QR code:', error);
            }
        };

        fetchQrCode();
    }, []);

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

    // Fetch attendance data (replace with actual Firestore listener)
    useEffect(() => {
        // Mock data - replace with actual Firestore query
        // const attendanceQuery = query(
        //   collection(db, 'attendance'),
        //   where('roomId', '==', 'roomId'),
        //   where('date', '==', new Date().toISOString().split('T')[0]),
        //   orderBy('timestamp', 'desc')
        // );

        // const unsubscribe = onSnapshot(attendanceQuery, (snapshot) => {
        //   const attendanceData = snapshot.docs.map(doc => ({
        //     id: doc.id,
        //     ...doc.data()
        //   }));
        //   setAttendanceList(attendanceData);
        // });

        // return () => unsubscribe();

        setAttendanceList(mockAttendanceData);
    }, []);

    const startCountdown = () => {
        setIsCountdownActive(true);
        setCountdown(30);
        setIsQrRedacted(false);
    };

    const redactQrCode = async () => {
        setIsQrRedacted(true);
        setIsCountdownActive(false);

        // Update QR code status in Firestore
        try {
            // Replace with actual Firestore update
            // const qrDocRef = doc(db, 'qrcodes', 'qrId');
            // await updateDoc(qrDocRef, { isActive: false });
            console.log('QR code redacted');
        } catch (error) {
            console.error('Error redacting QR code:', error);
        }
    };

    const handleReportProblem = async () => {
        try {
            // Add report to Firestore
            // await addDoc(collection(db, 'reports'), {
            //   type: 'problem',
            //   roomId: roomInfo.roomNumber,
            //   course: roomInfo.courseCode,
            //   timestamp: new Date(),
            //   status: 'pending'
            // });

            alert('Problem reported successfully!');
        } catch (error) {
            console.error('Error reporting problem:', error);
            alert('Failed to report problem. Please try again.');
        }
    };

    const handleManualAttendance = () => {
        if (!manualCollegeId.trim()) {
            alert('Please enter a College ID');
            return;
        }

        // In a real app, you would check if the student exists in the database
        const newAttendance = {
            id: Date.now().toString(),
            studentName: 'Manually Added Student',
            collegeId: manualCollegeId,
            scanTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
            timestamp: new Date(),
            status: 'Present-M'
        };

        setAttendanceList(prev => [newAttendance, ...prev]);
        setManualCollegeId('');
        
        alert(`Student with ID ${manualCollegeId} marked as Present-M`);
    };

    const handleEndLecture = () => {
        if (window.confirm('Are you sure you want to end the lecture? This will redirect you to the login page.')) {
            setIsLectureEnded(true);
            
            // Redirect to login after 3 seconds
            setTimeout(() => {
                navigate('/login');
            }, 3000);
        }
    };

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
            {/* تمت إزالة NavbarLogin لأن App.jsx يقوم بإضافته */}
            <div className="page-header">
                <div className="header-content">
                    <h1>
                        <i className="fas fa-qrcode"></i>
                        QR Code Attendance System
                    </h1>
                    <p className="page-subtitle">Room {roomInfo.roomNumber} - {roomInfo.courseCode}</p>
                </div>
                <div className="user-info">
                    <i className="fas fa-user-circle"></i>
                    <span>{roomInfo.lecturerName}</span>
                </div>
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
                                        <p>Loading QR Code...</p>
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
                                    disabled={isCountdownActive}
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
                                >
                                    <i className="fas fa-sign-out-alt"></i>
                                    End Lecture
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
                            <div className="lecturer-badge">
                                <i className="fas fa-user-tie"></i>
                                {roomInfo.lecturerName}
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
                                    />
                                </div>
                                <button
                                    className="btn-manual-attendance"
                                    onClick={handleManualAttendance}
                                >
                                    <i className="fas fa-check"></i>
                                    Mark as Present-M
                                </button>
                            </div>
                            <p className="manual-note">
                                <i className="fas fa-info-circle"></i>
                                Use this for students who couldn't scan the QR code
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
                                                    {student.scanTime}
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
                                                No attendance records yet
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
                                <p className="manual-count">{attendanceList.filter(s => s.status === 'Present-M').length}</p>
                            </div>
                            <div className="summary-card">
                                <h4>Room Capacity</h4>
                                <p className="capacity">40 Students</p>
                            </div>
                            <div className="summary-card">
                                <h4>Attendance Rate</h4>
                                <p className="rate">{(attendanceList.length / 40 * 100).toFixed(1)}%</p>
                            </div>
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
};

export default QrCodeRoom;