const express = require('express')
const router  = express.Router()
const auth    = require('../middlewares/auth')
const { getLicenciaturas, updateLicenciatura } = require('../controllers/licenciaturasController')

router.get('/',      auth, getLicenciaturas)
router.put('/:id',   auth, updateLicenciatura)

module.exports = router
