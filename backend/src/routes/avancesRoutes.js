const express = require('express')
const router  = express.Router()
const auth    = require('../middlewares/auth')
const {
  getAvances,
  getAvancesByDocente,
  getResumenDocente,
  createAvance,
  updateAvance,
  deleteAvance
} = require('../controllers/avancesController')

router.get('/',                auth, getAvances)
router.get('/docente/:id',     auth, getAvancesByDocente)
router.get('/resumen/:id',     auth, getResumenDocente)
router.post('/',               auth, createAvance)
router.put('/:id',             auth, updateAvance)
router.delete('/:id',          auth, deleteAvance)

module.exports = router
