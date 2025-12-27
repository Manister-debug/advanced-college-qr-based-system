import React, { useState, useEffect } from "react";
import { db } from "../../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import "./AddCourses.css";

function AddCourse() {
  const [courseName, setCourseName] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [selectedProfessor, setSelectedProfessor] = useState("");
  const [courseType, setCourseType] = useState("theory");
  const [professors, setProfessors] = useState([]);

  // جلب الأساتذة من Firestore
  useEffect(() => {
    const fetchProfessors = async () => {
      const querySnapshot = await getDocs(collection(db, "professors"));
      const profs = querySnapshot.docs.map((doc) => doc.data());
      setProfessors(profs);
    };
    fetchProfessors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!courseName || !courseCode || !selectedProfessor || !courseType) {
      alert("يرجى تعبئة جميع الحقول");
      return;
    }

    try {
      await addDoc(collection(db, "courses"), {
        name: courseName,
        code: courseCode,
        professorId: selectedProfessor,
        type: courseType,
      });

      setCourseName("");
      setCourseCode("");
      setSelectedProfessor("");
      setCourseType("theory");

      alert("تمت إضافة المادة بنجاح!");
    } catch (error) {
      console.error("خطأ أثناء إضافة المادة:", error);
      alert("حدث خطأ أثناء إضافة المادة");
    }
  };

  return (
    <div className="add-course-container">
      <h2>إضافة مادة جديدة</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>اسم المادة:</label>
          <input
            type="text"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            placeholder="أدخل اسم المادة"
          />
        </div>

        <div className="form-group">
          <label>رمز المادة:</label>
          <input
            type="text"
            value={courseCode}
            onChange={(e) => setCourseCode(e.target.value)}
            placeholder="أدخل رمز المادة"
          />
        </div>

        <div className="form-group">
          <label>نوع المادة:</label>
          <select
            value={courseType}
            onChange={(e) => setCourseType(e.target.value)}
          >
            <option value="theory">نظري</option>
            <option value="practical">عملي</option>
            <option value="both">نظري وعملي</option>
          </select>
        </div>

        <div className="form-group">
          <label>اسم الدكتور:</label>
          <select
            value={selectedProfessor}
            onChange={(e) => setSelectedProfessor(e.target.value)}
          >
            <option value="">اختر الدكتور</option>
            {professors.map((prof) => (
              <option key={prof.id} value={prof.id}>
                {prof.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit">إضافة المادة</button>
      </form>
    </div>
  );
}

export default AddCourse;