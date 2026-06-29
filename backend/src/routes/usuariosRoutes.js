const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const { getUsuarios, createUsuario, updateUsuario, deleteUsuario, toggleUsuario } = require('../controllers/usuariosController')
router.patch('/:id/toggle', auth, toggleUsuario)
router.get('/',      auth, getUsuarios)
router.post('/',     auth, createUsuario)
router.put('/:id',   auth, updateUsuario)
router.delete('/:id', auth, deleteUsuario)

module.exports = router
