import { useState, useMemo } from 'react';
import { DEFAULT_USERS } from '../constants/index.js';

export const useAuth = () => {
  const [loggedIn, setLoggedIn] = useState(false);
  const [allUsers, setAllUsers] = useState(DEFAULT_USERS);
  const [currentUserId, setCurrentUserId] = useState(null);
  const [loginEmail, setLoginEmail] = useState("admin@menas.vn");
  const [loginPass, setLoginPass] = useState("");
  const [loginErr, setLoginErr] = useState("");
  const [editingUser, setEditingUser] = useState(null);

  const currentUser = useMemo(() => allUsers.find(u => u.id === currentUserId) || null, [allUsers, currentUserId]);

  const handleLogin = () => {
    const user = allUsers.find(u => u.email === loginEmail && u.status === "active");
    if (!user) {
      setLoginErr("Email không tồn tại hoặc tài khoản bị khóa");
      return;
    }
    if (loginPass !== "123") {
      setLoginErr("Mật khẩu không đúng (demo: 123)");
      return;
    }
    setCurrentUserId(user.id);
    setLoggedIn(true);
    setLoginErr("");
  };

  const handleLogout = () => {
    setLoggedIn(false);
    setCurrentUserId(null);
  };

  return {
    loggedIn,
    setLoggedIn,
    allUsers,
    setAllUsers,
    currentUserId,
    setCurrentUserId,
    currentUser,
    loginEmail,
    setLoginEmail,
    loginPass,
    setLoginPass,
    loginErr,
    setLoginErr,
    editingUser,
    setEditingUser,
    handleLogin,
    handleLogout,
  };
};
