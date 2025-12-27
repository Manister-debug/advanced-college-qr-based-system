import { createContext, useState, useContext, useEffect } from "react";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase"; // ← عدّل المسار إذا لزم

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

  // 🔥 تسجيل الدخول عبر Firestore
  const loginWithFirestore = async (username, password) => {
    console.log("===== LOGIN DEBUG START =====");

    const cleanUsername = username.trim().toLowerCase();
    const cleanPassword = password.trim();

    console.log("Input username:", username);
    console.log("Clean username:", cleanUsername);
    console.log("Input password:", password);
    console.log("Clean password:", cleanPassword);

    const usersRef = collection(db, "users");

    console.log("Fetching ALL users...");
    const allUsersSnap = await getDocs(usersRef);
    console.log("Total users found:", allUsersSnap.size);

    allUsersSnap.forEach((doc) => {
      console.log("User doc:", doc.id, JSON.stringify(doc.data(), null, 2));
      console.log("User doc:", doc.id, doc.data());
    });

    console.log("Running query...");
    const q = query(
      usersRef,
      where("usernameLower", "==", cleanUsername),
      where("password", "==", cleanPassword)
    );

    const snapshot = await getDocs(q);

    console.log("Query result count:", snapshot.size);

    if (snapshot.empty) {
      console.log("❌ No matching user found");
      console.log("===== LOGIN DEBUG END =====");
      throw new Error("اسم المستخدم أو كلمة المرور غير صحيحة");
    }

    const userData = snapshot.docs[0].data();
    const authToken = snapshot.docs[0].id;

    console.log("Matched user:", userData);
    console.log("Saving user to context...");

    login(userData, authToken);

    console.log("===== LOGIN DEBUG END =====");

    return userData;
  };

  const hasRole = (role) => user?.role === role;
  const hasAnyRole = (roles) => roles.includes(user?.role);
  const getDisplayName = () => user?.name || user?.username || "User";
  const isAuthenticated = () => !!user && !!token;
  const getUserRole = () => user?.role;

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
        loginWithFirestore, // ← تمت إضافتها هنا
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