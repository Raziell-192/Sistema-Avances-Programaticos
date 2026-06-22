const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const {
  getPeriodos,
  createPeriodo,
  updatePeriodo,
  deletePeriodo
} = require('../controllers/periodosController')

router.get('/',       auth, getPeriodos)
router.post('/',      auth, createPeriodo)
router.put('/:id',    auth, updatePeriodo)
router.delete('/:id', auth, deletePeriodo)

module.exports = router
