const pool = require('../config/db')

const getAsignaciones = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*, u.nombre AS docente, m.nombre AS materia, p.nombre AS periodo
       FROM docente_materia a
       JOIN usuarios u ON a.id_docente = u.id_usuario
       JOIN materias m ON a.id_materia = m.id_materia
       JOIN periodos p ON a.id_periodo = p.id_periodo
       ORDER BY a.id_asignacion`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener asignaciones' })
  }
}

const createAsignacion = async (req, res) => {
  const { id_docente, id_materia, id_periodo } = req.body

  if (!id_docente || !id_materia || !id_periodo)
    return res.status(400).json({ error: 'Todos los campos son requeridos' })

  try {
    const result = await pool.query(
      `INSERT INTO docente_materia (id_docente, id_materia, id_periodo)
       VALUES ($1, $2, $3) RETURNING *`,
      [id_docente, id_materia, id_periodo]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ error: 'La asignación ya existe' })
    res.status(500).json({ error: 'Error al crear asignación' })
  }
}

const deleteAsignacion = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `DELETE FROM docente_materia WHERE id_asignacion=$1 RETURNING id_asignacion`,
      [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Asignación no encontrada' })

    res.json({ message: 'Asignación eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar asignación' })
  }
}

module.exports = { getAsignaciones, createAsignacion, deleteAsignacion }
