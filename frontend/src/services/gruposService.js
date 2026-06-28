import api from './api'
export const getGrupos    = (params) => api.get('/grupos', { params })
export const createGrupo  = (data)   => api.post('/grupos', data)
export const deleteGrupo  = (id)     => api.delete(`/grupos/${id}`)
