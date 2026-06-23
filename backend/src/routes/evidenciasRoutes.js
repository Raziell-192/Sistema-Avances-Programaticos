const express = require('express')
const router = express.Router()
const auth = require('../middlewares/auth')
const upload = require('../config/multer')
const {
  getEvidenciasByAvance,
  createEvidencia,
  deleteEvidencia
} = require('../controllers/evidenciasController')

router.get('/avance/:id',  auth, getEvidenciasByAvance)
router.post('/',           auth, upload.single('archivo'), createEvidencia)
router.delete('/:id',      auth, deleteEvidencia)

module.exports = router
