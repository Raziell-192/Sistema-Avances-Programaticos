const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const {
  getAsignaciones,
  createAsignacion,
  deleteAsignacion
} = require('../controllers/asignacionesController')

router.get('/',       auth, getAsignaciones)
router.post('/',      auth, createAsignacion)
router.delete('/:id', auth, deleteAsignacion)

module.exports = router
