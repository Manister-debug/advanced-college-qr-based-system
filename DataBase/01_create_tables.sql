-- =====================================================================
-- QR Code Attendance System - Database Schema
-- =====================================================================
-- Database: QR_Code_Attendees
-- Purpose: Manage student attendance tracking using QR codes
-- =====================================================================

USE QR_Code_Attendees;
GO

-- =====================================================================
-- 1. Students Table
-- =====================================================================
CREATE TABLE Students (
    UNI_ID VARCHAR(12) NOT NULL,
    PASS NVARCHAR(255) NOT NULL,
    Full_Name VARCHAR(30) NOT NULL,
    Phone_Number VARCHAR(15),
    email VARCHAR(35) NOT NULL,
    Branch VARCHAR(30) NOT NULL,
    
    CONSTRAINT students_pk PRIMARY KEY (UNI_ID),
    CONSTRAINT students_Phone_Number_unique UNIQUE (Phone_Number),
    CONSTRAINT students_email_unique UNIQUE (email)
);

-- =====================================================================
-- 2. Lecturer Table
-- =====================================================================
CREATE TABLE lecturer (
    ID_lecturer INT NOT NULL IDENTITY(1,1),
    Full_Name VARCHAR(30) NOT NULL,
    Specialization VARCHAR(30) NOT NULL,
    Role VARCHAR(20) NOT NULL,
    Phone_Number VARCHAR(15),
    email VARCHAR(35) NOT NULL,
    
    CONSTRAINT lecturer_pk PRIMARY KEY (ID_lecturer),
    CONSTRAINT lecturer_Phone_Number_unique UNIQUE (Phone_Number),
    CONSTRAINT lecturer_email_unique UNIQUE (email)
);

-- =====================================================================
-- 3. Courses Table
-- =====================================================================
CREATE TABLE Courses (
    ID_course VARCHAR(8) NOT NULL,
    Cours_Name VARCHAR(50) NOT NULL,
    Symbol_course VARCHAR(6) NOT NULL,
    Credt_Hour INT,
    Courses_type VARCHAR(3) NOT NULL,
    
    CONSTRAINT Courses_pk PRIMARY KEY (ID_course),
    CONSTRAINT Courses_type_chk CHECK (Courses_type IN ('T', 'P', 'T,P'))
);

-- =====================================================================
-- 4. Dean of Colleges Admin Table
-- =====================================================================
CREATE TABLE Dean_of_colleges_Admin (
    ID INT NOT NULL IDENTITY(1,1),
    Full_Name VARCHAR(30) NOT NULL,
    Specialization VARCHAR(30) NOT NULL,
    Role VARCHAR(10) NOT NULL,
    Phone_Number VARCHAR(15),
    email VARCHAR(35) NOT NULL,
    
    CONSTRAINT Dean_of_colleges_Admin_pk PRIMARY KEY (ID),
    CONSTRAINT Dean_of_colleges_Admin_Phone_Number_unique UNIQUE (Phone_Number),
    CONSTRAINT Dean_of_colleges_Admin_email_unique UNIQUE (email)
);

-- =====================================================================
-- 5. Coordinators Sub Admin Table
-- =====================================================================
CREATE TABLE coordinators_Sub_Admin (
    ID INT NOT NULL IDENTITY(1,1),
    Full_Name VARCHAR(30) NOT NULL,
    Specialization VARCHAR(30) NOT NULL,
    Role VARCHAR(10) NOT NULL,
    Phone_Number VARCHAR(15),
    email VARCHAR(35) NOT NULL,
    
    CONSTRAINT coordinators_Sub_Admin_pk PRIMARY KEY (ID),
    CONSTRAINT coordinators_Sub_Admin_Phone_Number_unique UNIQUE (Phone_Number),
    CONSTRAINT coordinators_Sub_Admin_email_unique UNIQUE (email)
);

-- =====================================================================
-- 6. Lecture Time Table
-- =====================================================================
CREATE TABLE Lecture_Time (
    Lecture_ID INT NOT NULL IDENTITY(1,1),
    ID_course VARCHAR(8) NOT NULL,
    ID_lecturer INT NOT NULL,
    Lecture_Date DATE,
    Start_Time TIME,
    End_Time TIME,
    
    CONSTRAINT Lecture_Time_pk PRIMARY KEY (Lecture_ID),
    CONSTRAINT Lecture_course_FK FOREIGN KEY (ID_course) REFERENCES Courses(ID_course),
    CONSTRAINT course_DR_fk FOREIGN KEY (ID_lecturer) REFERENCES lecturer (ID_lecturer),
    CONSTRAINT Lecture_Time_unique UNIQUE (Lecture_Date, Start_Time, ID_course, ID_lecturer),
    CONSTRAINT Lecture_Time_range_chk CHECK (End_Time > Start_Time)
);

-- =====================================================================
-- 7. Student-Course Enrollment Table
-- =====================================================================
CREATE TABLE Name_Student_Cours (
    UNI_ID VARCHAR(12) NOT NULL,
    ID_course VARCHAR(8) NOT NULL,
    
    CONSTRAINT Student_Courses_pk PRIMARY KEY (UNI_ID, ID_course),
    CONSTRAINT UNI_ID_FK FOREIGN KEY (UNI_ID) REFERENCES Students (UNI_ID),
    CONSTRAINT ID_course_FK FOREIGN KEY (ID_course) REFERENCES Courses (ID_course)
);

-- =====================================================================
-- 8. Attendance Table
-- =====================================================================
CREATE TABLE Attendees_Name (
    UNI_ID VARCHAR(12) NOT NULL,
    Lecture_ID INT NOT NULL,
    
    CONSTRAINT Attendees_pk PRIMARY KEY (UNI_ID, Lecture_ID),
    CONSTRAINT Attendees_student_FK FOREIGN KEY (UNI_ID) REFERENCES Students(UNI_ID),
    CONSTRAINT Attendees_lecture_FK FOREIGN KEY (Lecture_ID) REFERENCES Lecture_Time(Lecture_ID)
);

-- =====================================================================
-- 9. Users Table
-- =====================================================================
CREATE TABLE Users (
    User_ID INT NOT NULL IDENTITY(1,1),
    Username VARCHAR(30) NOT NULL UNIQUE,
    Password NVARCHAR(255) NOT NULL,
    Role VARCHAR(10) NOT NULL,
    
    CONSTRAINT Users_pk PRIMARY KEY (User_ID)
);

-- =====================================================================
-- End of Schema Creation
-- =====================================================================
