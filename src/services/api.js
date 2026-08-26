// E-Credits Backend API Client Integration
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkBackendHealth() {
  try {
    const res = await fetch(`${API_BASE}/health`, { method: 'GET' });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch (err) {
    return { online: false, error: err.message };
  }
}

export async function fetchMetadataOptions() {
  try {
    const res = await fetch(`${API_BASE}/metadata/options`);
    if (!res.ok) throw new Error("Failed to fetch metadata");
    return await res.json();
  } catch (err) {
    console.warn("Backend offline, using local metadata fallback.");
    return null;
  }
}

export async function uploadBomFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/bom/upload`, {
    method: 'POST',
    body: formData
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "File upload failed");
  }

  return await res.json();
}

export async function matchFactorsBatch(lines) {
  const res = await fetch(`${API_BASE}/match/batch`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ lines })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Factor matching failed");
  }

  return await res.json();
}
export async function sendAgentChatMessage(project_id, question, history = []) {
  const res = await fetch(${API_BASE}/agent/chat, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ project_id, question, history })
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(err.detail || "Agent chat request failed");
  }

  return await res.json();
}
