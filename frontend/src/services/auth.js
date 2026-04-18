// ✅ SAVE TOKEN + USER
export function setAuthSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

// ✅ GET TOKEN (VERY IMPORTANT)
export function getToken() {
  return localStorage.getItem("token");   // ✅ FIXED
}

// ✅ CHECK LOGIN
export function isAuthenticated() {
  return !!localStorage.getItem("token"); // ✅ FIXED
}

// ✅ CLEAR SESSION
export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}