import api from './api'
export const login = (correo, password) => api.post('/auth/login', { correo, password })
