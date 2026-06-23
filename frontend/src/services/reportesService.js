import api from './api'
export const getReporteDocentes      = () => api.get('/reportes/docentes')
export const getReporteMaterias      = () => api.get('/reportes/materias')
export const getReporteDepartamentos = () => api.get('/reportes/departamentos')
export const getReporteCumplimiento  = () => api.get('/reportes/cumplimiento')
