const pool = require('../config/db')

const getDepartamentos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM departamentos ORDER BY id_departamento`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener departamentos' })
  }
}

const createDepartamento = async (req, res) => {
  const { nombre } = req.body

  if (!nombre)
    return res.status(400).json({ error: 'El nombre es requerido' })

  try {
    const result = await pool.query(
      `INSERT INTO departamentos (nombre)
       VALUES ($1)
       RETURNING *`,
      [nombre]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ error: 'El departamento ya existe' })
    res.status(500).json({ error: 'Error al crear departamento' })
  }
}

const updateDepartamento = async (req, res) => {
  const { id } = req.params
  const { nombre } = req.body

  if (!nombre)
    return res.status(400).json({ error: 'El nombre es requerido' })

  try {
    const result = await pool.query(
      `UPDATE departamentos SET nombre = $1
       WHERE id_departamento = $2
       RETURNING *`,
      [nombre, id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Departamento no encontrado' })

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar departamento' })
  }
}

const deleteDepartamento = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE departamentos SET activo = FALSE
       WHERE id_departamento = $1
       RETURNING id_departamento`,
      [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Departamento no encontrado' })

    res.json({ message: 'Departamento desactivado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar departamento' })
  }
}

module.exports = { getDepartamentos, createDepartamento, updateDepartamento, deleteDepartamento }
