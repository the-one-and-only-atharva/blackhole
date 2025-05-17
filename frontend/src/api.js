const API_URL = "http://localhost:8000";

export async function fetchProperties({ intent, location } = {}) {
  const params = new URLSearchParams();
  if (intent) params.append('intent', intent);
  if (location) params.append('location', location);
  
  const queryString = params.toString();
  const url = `${API_URL}/properties${queryString ? `?${queryString}` : ''}`;
  
  const res = await fetch(url);
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to fetch properties');
  }
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

export async function fetchAuditLog(propertyId, { sortBy = 'timestamp', sortOrder = 'desc' } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/properties/${propertyId}/audit`, {
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to fetch audit log');
  }
  const logs = await res.json();
  
  // Sort logs
  return logs.sort((a, b) => {
    const aValue = a[sortBy];
    const bValue = b[sortBy];
    if (sortOrder === 'desc') {
      return bValue > aValue ? 1 : -1;
    }
    return aValue > bValue ? 1 : -1;
  });
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

export async function getProperty(propertyId) {
  const res = await fetch(`${API_URL}/properties/${propertyId}`);
  return res.json();
}

export async function updateProperty(propertyId, data) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/properties/${propertyId}`, {
    method: "PUT",
    headers: { 
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to update property');
  }
  return res.json();
}

export async function deleteProperty(propertyId) {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/properties/${propertyId}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.detail || 'Failed to delete property');
  }
  return res.json();
}
