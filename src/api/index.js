const BASE_URL = '/api'

const handleResponse = async (res) => {
  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    try {
      const text = await res.text()
      console.error('[API Error]', res.status, res.url, text)
      const body = JSON.parse(text)
      msg = body?.message || body?.title || body?.detail || text
    } catch {}
    throw new Error(msg)
  }
  const text = await res.text()
  return text ? JSON.parse(text) : null
}

export const mediaApi = {
  getAll: () => fetch(`${BASE_URL}/Media`).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/Media/${id}`).then(handleResponse),
  delete: (id) => fetch(`${BASE_URL}/Media/${id}`, { method: 'DELETE' }).then(handleResponse),
  upload: (formData) => fetch(`${BASE_URL}/Media/upload-image`, { method: 'POST', body: formData }).then(handleResponse),
}

export const musicApi = {
  getAll: () => fetch(`${BASE_URL}/Music`).then(handleResponse),
  getById: (id) => fetch(`${BASE_URL}/Music/${id}`).then(handleResponse),
  delete: (id) => fetch(`${BASE_URL}/Music/${id}`, { method: 'DELETE' }).then(handleResponse),
  uploadAudio: (formData) => fetch(`${BASE_URL}/Music/upload-audio`, { method: 'POST', body: formData }).then(handleResponse),
  addYoutube: (youTubeUrl) => fetch(`${BASE_URL}/Music/youtube`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ youTubeUrl })
  }).then(handleResponse),
}
