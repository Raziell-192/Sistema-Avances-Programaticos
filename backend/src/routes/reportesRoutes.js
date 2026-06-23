const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const {
  reporteDocentes,
  reporteMaterias,
  reporteDepartamentos,
  reporteCumplimiento
} = require('../controllers/reportesController')

router.get('/docentes',       auth, reporteDocentes)
router.get('/materias',       auth, reporteMaterias)
router.get('/departamentos',  auth, reporteDepartamentos)
router.get('/cumplimiento',   auth, reporteCumplimiento)

module.exports = router
