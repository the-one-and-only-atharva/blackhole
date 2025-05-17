const API_URL = "http://localhost:8000";

export async function fetchProperties() {
  const res = await fetch(`${API_URL}/properties`);
  return res.json();
}

export async function createProperty(data) {
  const res = await fetch(`${API_URL}/properties`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function fetchAuditLog(propertyId) {
  const res = await fetch(`${API_URL}/properties/${propertyId}/audit`);
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
}

export async function register({ email, password, name }) {
  const res = await fetch(`${API_URL}/register?email=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}&name=${encodeURIComponent(name)}`, {
    method: "POST"
  });
  return res.json();
}

export async function login({ email, password }) {
  const form = new URLSearchParams();
  form.append("username", email);
  form.append("password", password);
  const res = await fetch(`${API_URL}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: form
  });
  return res.json();
}

export async function getCurrentUser(token) {
  const res = await fetch(`${API_URL}/me`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  return res.json();
}
