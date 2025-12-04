import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './ViewStudents.css';

export default function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterFaculty, setFilterFaculty] = useState('');

  // Mock data for demonstration
  useEffect(() => {
    const mockStudents = [
      {
        id: 1,
        fullName: 'Ahmed Mohammed',
        nationalNumber: '29901011234567',
        birthdate: '1999-01-01',
        motherName: 'Fatima Ahmed',
        faculty: 'Computer Science',
        department: 'Software Engineering',
        academicYear: '2024',
        registrationDate: '2024-01-15',
        studentID: 'CS2024001'
      },
      {
        id: 2,
        fullName: 'Sarah Johnson',
        nationalNumber: '29902021234568',
        birthdate: '1999-02-02',
        motherName: 'Emily Johnson',
        faculty: 'Engineering',
        department: 'Electrical Engineering',
        academicYear: '2024',
        registrationDate: '2024-01-20',
        studentID: 'ENG2024001'
      },
      {
        id: 3,
        fullName: 'Mohammed Ali',
        nationalNumber: '29903031234569',
        birthdate: '1999-03-03',
        motherName: 'Aisha Mohammed',
        faculty: 'Medicine',
        department: 'General Medicine',
        academicYear: '2024',
        registrationDate: '2024-02-01',
        studentID: 'MED2024001'
      }
    ];
    setStudents(mockStudents);
  }, []);

  const deleteStudent = (id) => {
    if (window.confirm('Are you sure you want to delete this student record?')) {
      setStudents(prev => prev.filter(student => student.id !== id));
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.nationalNumber.includes(searchTerm) ||
                         student.studentID?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFaculty = !filterFaculty || student.faculty === filterFaculty;
    return matchesSearch && matchesFaculty;
  });

  const faculties = ['Computer Science', 'Software Engineering', 'Network Engineering', 'Artificial Intelligence', 'Robotics'];

  return (
    <div className="students-page">
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-users"></i>
            View Students
          </h1>
          <p className="page-subtitle">Manage and view all registered students</p>
        </div>
        <div className="user-info">
          <span>Secretary Name</span>
        </div>
      </div>

      <div className="main-content">
        <div className="view-container">
          <div className="view-header">
            <h2 className="view-title">
              Registered Students ({students.length})
            </h2>
            <div className="view-controls">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by name, national number, or student ID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={filterFaculty}
                onChange={(e) => setFilterFaculty(e.target.value)}
                className="filter-select"
              >
                <option value="">All Departments</option>
                {faculties.map(faculty => (
                  <option key={faculty} value={faculty}>{faculty}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="students-table-container">
            {filteredStudents.length === 0 ? (
              <div className="no-data">
                <i className="fas fa-user-slash"></i>
                <h3>No students found</h3>
                <p>No students match your search criteria.</p>
                <Link to="/register-students" className="btn btn-primary" style={{marginTop: '1rem'}}>
                  <i className="fas fa-user-plus"></i>
                  Register First Student
                </Link>
              </div>
            ) : (
              <table className="students-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>National Number</th>
                    <th>Faculty</th>
                    <th>Department</th>
                    <th>Academic Year</th>
                    <th>Registration Date</th>
                    <th>Student ID</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map(student => (
                    <tr key={student.id}>
                      <td>
                        <div className="student-info">
                          <div>
                            <div className="student-name">{student.fullName}</div>
                            <div className="student-dob">{student.birthdate}</div>
                          </div>
                        </div>
                      </td>
                      <td>{student.nationalNumber}</td>
                      <td>{student.faculty}</td>
                      <td>{student.department}</td>
                      <td>{student.academicYear}</td>
                      <td>{student.registrationDate}</td>
                      <td>{student.studentID}</td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-action btn-view" title="View Details">
                            <i className="fas fa-eye"></i>
                          </button>
                          <button className="btn-action btn-edit" title="Edit">
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn-action btn-delete" 
                            title="Delete"
                            onClick={() => deleteStudent(student.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className="table-footer">
            <div className="table-info">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}