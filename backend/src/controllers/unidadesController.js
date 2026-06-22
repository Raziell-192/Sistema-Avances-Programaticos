const pool = require('../config/db')

const getUnidades = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.*, m.nombre AS materia
       FROM unidades u
       JOIN materias m ON u.id_materia = m.id_materia
       ORDER BY u.id_unidad`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener unidades' })
  }
}

const createUnidad = async (req, res) => {
  const { id_materia, nombre, porcentaje_esperado } = req.body

  if (!id_materia || !nombre || porcentaje_esperado === undefined)
    return res.status(400).json({ error: 'Todos los campos son requeridos' })

  try {
    const result = await pool.query(
      `INSERT INTO unidades (id_materia, nombre, porcentaje_esperado)
       VALUES ($1, $2, $3) RETURNING *`,
      [id_materia, nombre, porcentaje_esperado]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al crear unidad' })
  }
}

const updateUnidad = async (req, res) => {
  const { id } = req.params
  const { nombre, porcentaje_esperado } = req.body

  try {
    const result = await pool.query(
      `UPDATE unidades SET nombre=$1, porcentaje_esperado=$2
       WHERE id_unidad=$3 RETURNING *`,
      [nombre, porcentaje_esperado, id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Unidad no encontrada' })

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar unidad' })
  }
}

const deleteUnidad = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `DELETE FROM unidades WHERE id_unidad=$1 RETURNING id_unidad`, [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Unidad no encontrada' })

    res.json({ message: 'Unidad eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar unidad' })
  }
}

module.exports = { getUnidades, createUnidad, updateUnidad, deleteUnidad }
