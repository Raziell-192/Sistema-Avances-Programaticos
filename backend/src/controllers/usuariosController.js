const pool = require('../config/db')
const bcrypt = require('bcryptjs')

const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.id_usuario, u.nombre, u.correo, u.activo, r.nombre AS rol
       FROM usuarios u
       JOIN roles r ON u.id_rol = r.id_rol
       ORDER BY u.id_usuario`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuarios' })
  }
}

const createUsuario = async (req, res) => {
  const { nombre, correo, password, id_rol } = req.body

  if (!nombre || !correo || !password || !id_rol)
    return res.status(400).json({ error: 'Todos los campos son requeridos' })

  try {
    const existe = await pool.query(
      'SELECT id_usuario FROM usuarios WHERE correo = $1', [correo]
    )
    if (existe.rows.length > 0)
      return res.status(400).json({ error: 'El correo ya está registrado' })

    const hash = await bcrypt.hash(password, 10)

    const result = await pool.query(
      `INSERT INTO usuarios (nombre, correo, password, id_rol)
       VALUES ($1, $2, $3, $4)
       RETURNING id_usuario, nombre, correo, id_rol`,
      [nombre, correo, hash, id_rol]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al crear usuario' })
  }
}

const updateUsuario = async (req, res) => {
  const { id } = req.params
  const { nombre, correo, id_rol, password } = req.body

  try {
    let query, params

    if (password) {
      const hash = await bcrypt.hash(password, 10)
      query = `UPDATE usuarios SET nombre=$1, correo=$2, id_rol=$3, password=$4
               WHERE id_usuario=$5 RETURNING id_usuario, nombre, correo, id_rol`
      params = [nombre, correo, id_rol, hash, id]
    } else {
      query = `UPDATE usuarios SET nombre=$1, correo=$2, id_rol=$3
               WHERE id_usuario=$4 RETURNING id_usuario, nombre, correo, id_rol`
      params = [nombre, correo, id_rol, id]
    }

    const result = await pool.query(query, params)

    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Usuario no encontrado' })

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar usuario' })
  }
}

const deleteUsuario = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE usuarios SET activo = FALSE
       WHERE id_usuario = $1 RETURNING id_usuario`,
      [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Usuario no encontrado' })

    res.json({ message: 'Usuario desactivado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar usuario' })
  }
}

const toggleUsuario = async (req, res) => {
  const { id } = req.params
  try {
    const actual = await pool.query(
      `SELECT activo FROM usuarios WHERE id_usuario=$1`, [id]
    )
    if (actual.rows.length === 0)
      return res.status(404).json({ error: 'Usuario no encontrado' })

    const nuevoEstado = !actual.rows[0].activo
    const result = await pool.query(
      `UPDATE usuarios SET activo=$1 WHERE id_usuario=$2 RETURNING id_usuario, activo`,
      [nuevoEstado, id]
    )
    res.json({
      message: nuevoEstado ? 'Usuario activado correctamente' : 'Usuario desactivado correctamente',
      activo: result.rows[0].activo
    })
  } catch (err) {
    res.status(500).json({ error: 'Error al cambiar estado del usuario' })
  }
}

module.exports = { getUsuarios, createUsuario, updateUsuario, deleteUsuario, toggleUsuario }
