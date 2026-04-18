export function setAuthSession(token, user) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
}

export function getToken() {
  return localStorage.getItem("token");
}

export function isAuthenticated() {
  return !!localStorage.getItem("token");
}

export function clearAuthSession() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
}