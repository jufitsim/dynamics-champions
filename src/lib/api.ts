async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, init)
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(text || `Request failed: ${res.status}`)
  }
  return res
}

export async function getWorkloads() {
  return (await apiFetch('/api/workloads')).json()
}

export async function getChampions() {
  return (await apiFetch('/api/champions')).json()
}

export async function createChampion(data: object) {
  return (await apiFetch('/api/champions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })).json()
}

export async function getChampionByToken(token: string) {
  const res = await fetch(`/api/champions/edit/${token}`)
  if (res.status === 404) return null
  if (!res.ok) throw new Error(await res.text().catch(() => res.statusText))
  return res.json()
}

export async function updateChampionByToken(token: string, data: object) {
  return (await apiFetch(`/api/champions/edit/${token}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  })).json()
}

export async function uploadChampionImage(file: File): Promise<string> {
  const formData = new FormData()
  formData.append('file', file)
  const { url } = await (await apiFetch('/api/upload', { method: 'POST', body: formData })).json()
  return url
}

export async function adminGetChampions() {
  return (await apiFetch('/api/admin/champions')).json()
}

export async function adminGetWorkloads() {
  return (await apiFetch('/api/workloads')).json()
}

export async function adminUpdateChampion(id: string, updates: object) {
  return (await apiFetch(`/api/admin/champions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(updates),
  })).json()
}

export async function adminCreateWorkload(name: string) {
  return (await apiFetch('/api/admin/workloads', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  })).json()
}

export async function adminDeleteWorkload(id: string) {
  await apiFetch(`/api/admin/workloads/${id}`, { method: 'DELETE' })
}
