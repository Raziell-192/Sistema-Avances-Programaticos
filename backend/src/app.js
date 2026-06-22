const express = require('express')
const cors = require('cors')
require('dotenv').config()

const app = express()

app.use(cors())
app.use(express.json())

// Conexión DB
require('./config/db')

// Rutas
app.use('/api/auth',         require('./routes/authRoutes'))
app.use('/api/usuarios',     require('./routes/usuariosRoutes'))
app.use('/api/departamentos',require('./routes/departamentosRoutes'))
app.use('/api/planes',       require('./routes/planesRoutes'))
app.use('/api/periodos',     require('./routes/periodosRoutes'))
app.use('/api/materias',     require('./routes/materiasRoutes'))
app.use('/api/unidades',     require('./routes/unidadesRoutes'))
app.use('/api/asignaciones', require('./routes/asignacionesRoutes'))

app.get('/', (req, res) => {
  res.json({ message: 'SAP API funcionando ' })
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`)
})

module.exports = app
