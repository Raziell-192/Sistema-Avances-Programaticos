const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const {
  getUnidades,
  createUnidad,
  updateUnidad,
  deleteUnidad
} = require('../controllers/unidadesController')

router.get('/',       auth, getUnidades)
router.post('/',      auth, createUnidad)
router.put('/:id',    auth, updateUnidad)
router.delete('/:id', auth, deleteUnidad)

module.exports = router
