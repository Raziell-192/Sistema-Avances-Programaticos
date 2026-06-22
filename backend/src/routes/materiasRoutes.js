const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const {
  getMaterias,
  createMateria,
  updateMateria,
  deleteMateria
} = require('../controllers/materiasController')

router.get('/',       auth, getMaterias)
router.post('/',      auth, createMateria)
router.put('/:id',    auth, updateMateria)
router.delete('/:id', auth, deleteMateria)

module.exports = router
