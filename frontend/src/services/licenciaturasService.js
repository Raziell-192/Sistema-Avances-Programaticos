import api from './api'
export const getLicenciaturas  = ()           => api.get('/licenciaturas')
export const updateLicenciatura = (id, data)  => api.put(`/licenciaturas/${id}`, data)
