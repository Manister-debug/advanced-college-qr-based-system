import { createContext, useState, useContext, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load saved user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      try {
        setUser(JSON.parse(savedUser));
        setToken(savedToken);
      } catch (error) {
        console.error("Error parsing saved user:", error);
        clearAuth();
      }
    }

    setLoading(false);
  }, []);

  // Save user to state + localStorage
  const login = (userData, authToken) => {
    setUser(userData);
    setToken(authToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", authToken);
  };

  const logout = () => {
    clearAuth();
  };

  const clearAuth = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  // 🔥 Enhanced login function for professors with LecturerID
  const loginWithFirestore = async (username, password) => {
    console.log("===== LOGIN DEBUG START =====");

    const trimmedUsername = username.trim();
    const trimmedPassword = password.trim();

    console.log("Input username:", username);
    console.log("Trimmed username:", trimmedUsername);
    console.log("Input password:", password);
    console.log("Trimmed password:", trimmedPassword);

    // ================== STEP 1: Check in professors collection ==================
    console.log("Checking in professors collection...");
    const professorsRef = collection(db, "professors");
    
    // Try to find by username
    const professorQuery1 = query(
      professorsRef,
      where("username", "==", trimmedUsername),
      where("password", "==", trimmedPassword)
    );

    const professorSnapshot1 = await getDocs(professorQuery1);
    console.log("Professors found by username:", professorSnapshot1.size);

    // Try to find by LecturerID
    const professorQuery2 = query(
      professorsRef,
      where("LecturerID", "==", trimmedUsername),
      where("password", "==", trimmedPassword)
    );

    const professorSnapshot2 = await getDocs(professorQuery2);
    console.log("Professors found by LecturerID:", professorSnapshot2.size);

    if (!professorSnapshot1.empty || !professorSnapshot2.empty) {
      const professorDoc = professorSnapshot1.empty ? professorSnapshot2.docs[0] : professorSnapshot1.docs[0];
      const professorData = professorDoc.data();
      console.log("Professor data found:", professorData);
      
      // Create user data with professor role - normalize role to lowercase
      const userData = {
        ...professorData,
        id: professorDoc.id,
        uid: professorDoc.id,
        // Normalize role to lowercase for consistent checking
        role: professorData.role ? professorData.role.toLowerCase() : 'professor',
        // Store original role for display if needed
        originalRole: professorData.role || 'Professor',
        // Store type for course filtering
        professorType: professorData.type || 'Theory',
        // Store LecturerID for course assignment lookup
        lecturerId: professorData.LecturerID || professorDoc.id
      };
      
      console.log("Logging in as professor:", userData);
      login(userData, professorDoc.id);
      return userData;
    }

    // ================== STEP 2: Check in users collection ==================
    console.log("Checking in users collection...");
    const usersRef = collection(db, "users");
    
    // First try with usernameLower (existing logic)
    const userQuery1 = query(
      usersRef,
      where("usernameLower", "==", trimmedUsername.toLowerCase()),
      where("password", "==", trimmedPassword)
    );

    const userSnapshot1 = await getDocs(userQuery1);
    console.log("Users found (with usernameLower):", userSnapshot1.size);

    if (!userSnapshot1.empty) {
      const userDoc = userSnapshot1.docs[0];
      const userData = userDoc.data();
      console.log("User data found (with usernameLower):", userData);
      
      // Normalize role to lowercase
      const normalizedData = {
        ...userData,
        role: userData.role ? userData.role.toLowerCase() : userData.role
      };
      
      login(normalizedData, userDoc.id);
      return normalizedData;
    }

    // Also try with regular username field
    const userQuery2 = query(
      usersRef,
      where("username", "==", trimmedUsername),
      where("password", "==", trimmedPassword)
    );

    const userSnapshot2 = await getDocs(userQuery2);
    console.log("Users found (with username):", userSnapshot2.size);

    if (!userSnapshot2.empty) {
      const userDoc = userSnapshot2.docs[0];
      const userData = userDoc.data();
      console.log("User data found (with username):", userData);
      
      // Normalize role to lowercase
      const normalizedData = {
        ...userData,
        role: userData.role ? userData.role.toLowerCase() : userData.role
      };
      
      login(normalizedData, userDoc.id);
      return normalizedData;
    }

    // ================== STEP 3: Check in students collection ==================
    console.log("Checking in students collection...");
    const studentsRef = collection(db, "students");
    const studentQuery = query(
      studentsRef,
      where("username", "==", trimmedUsername),
      where("password", "==", trimmedPassword)
    );

    const studentSnapshot = await getDocs(studentQuery);
    console.log("Students found:", studentSnapshot.size);

    if (!studentSnapshot.empty) {
      const studentDoc = studentSnapshot.docs[0];
      const studentData = studentDoc.data();
      console.log("Student data found:", studentData);
      
      const userData = {
        ...studentData,
        id: studentDoc.id,
        uid: studentDoc.id,
        role: 'student'
      };
      
      console.log("Logging in as student:", userData);
      login(userData, studentDoc.id);
      return userData;
    }

    // ================== STEP 4: Check in subAdmins collection ==================
    console.log("Checking in subAdmins collection...");
    const subAdminsRef = collection(db, "subAdmins");
    const subAdminQuery = query(
      subAdminsRef,
      where("username", "==", trimmedUsername),
      where("password", "==", trimmedPassword)
    );

    const subAdminSnapshot = await getDocs(subAdminQuery);
    console.log("SubAdmins found:", subAdminSnapshot.size);

    if (!subAdminSnapshot.empty) {
      const subAdminDoc = subAdminSnapshot.docs[0];
      const subAdminData = subAdminDoc.data();
      console.log("SubAdmin data found:", subAdminData);
      
      const userData = {
        ...subAdminData,
        id: subAdminDoc.id,
        uid: subAdminDoc.id,
        role: 'sub-admin'
      };
      
      console.log("Logging in as sub-admin:", userData);
      login(userData, subAdminDoc.id);
      return userData;
    }

    console.log("❌ No matching user found in any collection");
    console.log("===== LOGIN DEBUG END =====");
    throw new Error("Invalid username or password");
  };

  const hasRole = (role) => user?.role === role.toLowerCase();
  const hasAnyRole = (roles) => roles.map(r => r.toLowerCase()).includes(user?.role);
  const getDisplayName = () => user?.name || user?.username || "User";
  const isAuthenticated = () => !!user && !!token;
  const getUserRole = () => user?.role;

  // Get professor type (Theory/Practical/Both)
  const getProfessorType = () => user?.professorType || user?.type;
  
  // Get lecturer ID for course assignment lookup
  const getLecturerId = () => user?.lecturerId || user?.LecturerID || user?.id;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        login,
        logout,
        loading,
        hasRole,
        hasAnyRole,
        getDisplayName,
        isAuthenticated,
        getUserRole,
        loginWithFirestore,
        getProfessorType,
        getLecturerId
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};