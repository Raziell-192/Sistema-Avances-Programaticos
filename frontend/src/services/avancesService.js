import api from './api'
export const getAvances    = ()         => api.get('/avances')
export const createAvance  = (data)     => api.post('/avances', data)
export const updateAvance  = (id, data) => api.put(`/avances/${id}`, data)
export const deleteAvance  = (id)       => api.delete(`/avances/${id}`)
