const express = require('express')
const router  = express.Router()
const auth    = require('../middlewares/auth')
const { getGrupos, createGrupo, deleteGrupo } = require('../controllers/gruposController')

router.get('/',       auth, getGrupos)
router.post('/',      auth, createGrupo)
router.delete('/:id', auth, deleteGrupo)

module.exports = router
