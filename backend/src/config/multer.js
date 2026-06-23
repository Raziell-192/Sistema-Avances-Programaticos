const multer = require('multer')
const path = require('path')

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads'))
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now()
    const ext = path.extname(file.originalname)
    const nombre = path.basename(file.originalname, ext)
    cb(null, `${nombre}-${timestamp}${ext}`)
  }
})

const fileFilter = (req, file, cb) => {
  const tiposPermitidos = [
    'application/pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'image/jpeg',
    'image/png'
  ]

  if (tiposPermitidos.includes(file.mimetype)) {
    cb(null, true)
  } else {
    cb(new Error('Tipo de archivo no permitido. Solo PDF, DOCX, PPTX, JPG y PNG.'))
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB máximo
})

module.exports = upload
