const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const {
  getDepartamentos,
  createDepartamento,
  updateDepartamento,
  deleteDepartamento
} = require('../controllers/departamentosController')

router.get('/',       auth, getDepartamentos)
router.post('/',      auth, createDepartamento)
router.put('/:id',    auth, updateDepartamento)
router.delete('/:id', auth, deleteDepartamento)

module.exports = router
