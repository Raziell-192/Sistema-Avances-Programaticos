const pool = require('../config/db')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
require('dotenv').config()

const login = async (req, res) => {
  const { correo, password } = req.body

  if (!correo || !password)
    return res.status(400).json({ error: 'Correo y contraseña requeridos' })

  try {
    const result = await pool.query(
      `SELECT u.*, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       WHERE u.correo = $1 AND u.activo = TRUE`,
      [correo]
    )

    const usuario = result.rows[0]
    if (!usuario)
      return res.status(401).json({ error: 'Credenciales incorrectas' })

    const passwordValido = await bcrypt.compare(password, usuario.password)
    if (!passwordValido)
      return res.status(401).json({ error: 'Credenciales incorrectas' })

    const token = jwt.sign(
      {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        correo:     usuario.correo,
        rol:        usuario.rol,
      },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    )

    res.json({
      token,
      usuario: {
        id_usuario: usuario.id_usuario,
        nombre:     usuario.nombre,
        correo:     usuario.correo,
        rol:        usuario.rol,
      }
    })
  } catch (err) {
    res.status(500).json({ error: 'Error interno del servidor' })
  }
}

module.exports = { login }
