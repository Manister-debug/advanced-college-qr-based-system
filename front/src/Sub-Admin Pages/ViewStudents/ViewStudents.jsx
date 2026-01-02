import { useState, useEffect, Fragment } from "react";
import "./ViewStudents.css";
import {
  collection,
  onSnapshot,
  deleteDoc,
  doc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../../firebase";

export default function ViewStudents() {
  const [students, setStudents] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterFaculty, setFilterFaculty] = useState("");

  const [expandedStudentId, setExpandedStudentId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editData, setEditData] = useState(null);

  const faculties = [
    "Computer Science",
    "Software Engineering",
    "Information Technology",
    "Computer Engineering",
    "Data Science",
    "Cybersecurity",
    "Artificial Intelligence",
    "Networking",
    "Information Systems"
  ];

  const branches = [
    "Software Engineering",
    "Artificial Intelligence",
    "Networking",
    "Robotics",
    "Cyber Security",
    "Data Science",
    "Computer Science",
    "Information Technology",
    "Machine Learning",
    "Computer Vision",
    "Web Development",
    "Mobile App Development",
    "Cloud Computing",
    "Internet of Things",
  ];

  // Fetch students
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const data = snapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter((u) => u.role === "student");

      setStudents(data);
    });

    return () => unsubscribe();
  }, []);

  // Delete student
  const deleteStudent = async (id) => {
    if (window.confirm("Are you sure you want to delete this student?")) {
      await deleteDoc(doc(db, "users", id));
      if (expandedStudentId === id) {
        setExpandedStudentId(null);
        setEditMode(false);
        setEditData(null);
      }
    }
  };

  // Save edit
  const saveEdit = async () => {
    if (!editData) return;
    const { id, ...data } = editData;
    await updateDoc(doc(db, "users", id), data);
    setExpandedStudentId(null);
    setEditMode(false);
    setEditData(null);
  };

  // Close details
  const closeDetails = () => {
    setExpandedStudentId(null);
    setEditMode(false);
    setEditData(null);
  };

  // Filtering
  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.studentId?.includes(searchTerm) ||
      student.username?.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesFaculty =
      !filterFaculty || student.faculty === filterFaculty;

    return matchesSearch && matchesFaculty;
  });

  return (
    <div className="view-students-page">
      {/* Header */}
      <div className="page-header">
        <div className="header-content">
          <h1 className="page-title">
            <i className="fas fa-users"></i> View Students
          </h1>
          <p className="page-subtitle">Manage and view all registered students</p>
        </div>
      </div>

      {/* Main */}
      <div className="main-content">
        <div className="view-container">
          {/* Controls */}
          <div className="view-header">
            <h2 className="view-title">
              Registered Students ({students.length})
            </h2>

            <div className="view-controls">
              <div className="search-box">
                <i className="fas fa-search"></i>
                <input
                  type="text"
                  placeholder="Search by name, student ID, or username"
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
                <option value="">All Faculties</option>
                {faculties.map((faculty) => (
                  <option key={faculty} value={faculty}>
                    {faculty}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="students-table-container">
            <table className="students-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Student ID</th>
                  <th>Faculty</th>
                  <th>Branch</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStudents.map((student) => (
                  <Fragment key={student.id}>
                    {/* Main row */}
                    <tr>
                      <td>{student.name}</td>
                      <td>{student.studentId}</td>
                      <td>{student.faculty}</td>
                      <td>{student.branch}</td>
                      <td>{student.email}</td>
                      <td>{student.phone}</td>
                      <td>
                        <div className="action-buttons">
                          <button
                            className="btn-action btn-view"
                            onClick={() => {
                              if (expandedStudentId === student.id && !editMode) {
                                closeDetails();
                              } else {
                                setExpandedStudentId(student.id);
                                setEditMode(false);
                                setEditData(null);
                              }
                            }}
                          >
                            <i className="fas fa-eye"></i>
                          </button>

                          <button
                            className="btn-action btn-edit"
                            onClick={() => {
                              if (expandedStudentId === student.id && editMode) {
                                closeDetails();
                              } else {
                                setExpandedStudentId(student.id);
                                setEditMode(true);
                                setEditData(student);
                              }
                            }}
                          >
                            <i className="fas fa-edit"></i>
                          </button>

                          <button
                            className="btn-action btn-delete"
                            onClick={() => deleteStudent(student.id)}
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Details / Edit row */}
                    {expandedStudentId === student.id && (
                      <tr className="details-row">
                        <td colSpan={7}>
                          {!editMode ? (
                            <div className="details-box">
                              <h3>Student Details</h3>

                              <ul className="details-list-inline">
                                <li><strong>Username:</strong> {student.username}</li>
                                <li><strong>Password:</strong> {student.password}</li>
                                <li><strong>Email:</strong> {student.email}</li>
                                <li><strong>Phone:</strong> {student.phone}</li>
                                <li><strong>Faculty:</strong> {student.faculty}</li>
                                <li><strong>Branch:</strong> {student.branch}</li>
                              </ul>

                              <div style={{ textAlign: "right", marginTop: "10px" }}>
                                <button className="btn btn-secondary" onClick={closeDetails}>
                                  Close Details
                                </button>
                              </div>
                            </div>
                          ) : (
                            <div className="details-box">
                              <h3>Edit Student</h3>

                              <div className="form-group-inline">
                                <label>Name</label>
                                <input
                                  value={editData.name}
                                  onChange={(e) =>
                                    setEditData({ ...editData, name: e.target.value })
                                  }
                                />

                                <label>Student ID</label>
                                <input
                                  value={editData.studentId}
                                  onChange={(e) =>
                                    setEditData({ ...editData, studentId: e.target.value })
                                  }
                                />

                                <label>Username</label>
                                <input
                                  value={editData.username}
                                  onChange={(e) =>
                                    setEditData({ ...editData, username: e.target.value })
                                  }
                                />

                                <label>Password</label>
                                <input
                                  value={editData.password}
                                  onChange={(e) =>
                                    setEditData({ ...editData, password: e.target.value })
                                  }
                                />

                                <label>Email</label>
                                <input
                                  value={editData.email}
                                  onChange={(e) =>
                                    setEditData({ ...editData, email: e.target.value })
                                  }
                                />

                                <label>Phone</label>
                                <input
                                  value={editData.phone}
                                  onChange={(e) =>
                                    setEditData({ ...editData, phone: e.target.value })
                                  }
                                />

                                <label>Faculty</label>
                                <select
                                  value={editData.faculty}
                                  onChange={(e) =>
                                    setEditData({ ...editData, faculty: e.target.value })
                                  }
                                >
                                  <option value="">Select Faculty</option>
                                  {faculties.map((f) => (
                                    <option key={f} value={f}>{f}</option>
                                  ))}
                                </select>

                                <label>Branch</label>
                                <select
                                  value={editData.branch}
                                  onChange={(e) =>
                                    setEditData({ ...editData, branch: e.target.value })
                                  }
                                >
                                  <option value="">Select Branch</option>
                                  {branches.map((b) => (
                                    <option key={b} value={b}>{b}</option>
                                  ))}
                                </select>
                              </div>

                              <div
                                style={{
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: "8px",
                                  marginTop: "10px",
                                }}
                              >
                                <button className="btn btn-primary" onClick={saveEdit}>
                                  Save
                                </button>

                                <button className="btn btn-secondary" onClick={closeDetails}>
                                  Cancel
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))}
              </tbody>
            </table>
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