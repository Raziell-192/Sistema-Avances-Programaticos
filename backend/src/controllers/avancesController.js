const pool = require('../config/db')

const getAvances = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*,
              u.nombre AS docente,
              m.nombre AS materia,
              un.nombre AS unidad,
              un.porcentaje_esperado
       FROM avances a
       JOIN usuarios u  ON a.id_docente = u.id_usuario
       JOIN materias m  ON a.id_materia = m.id_materia
       JOIN unidades un ON a.id_unidad  = un.id_unidad
       ORDER BY a.fecha DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener avances' })
  }
}

const getAvancesByDocente = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT a.*,
              m.nombre AS materia,
              un.nombre AS unidad,
              un.porcentaje_esperado
       FROM avances a
       JOIN materias m  ON a.id_materia = m.id_materia
       JOIN unidades un ON a.id_unidad  = un.id_unidad
       WHERE a.id_docente = $1
       ORDER BY a.fecha DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener avances del docente' })
  }
}

const createAvance = async (req, res) => {
  const { id_materia, id_unidad, porcentaje, observaciones } = req.body
  const id_docente = req.usuario.id_usuario

  if (!id_materia || !id_unidad || porcentaje === undefined)
    return res.status(400).json({ error: 'Materia, unidad y porcentaje son requeridos' })

  if (porcentaje < 0 || porcentaje > 100)
    return res.status(400).json({ error: 'El porcentaje debe estar entre 0 y 100' })

  try {
    // Verificar que la unidad pertenece a la materia
    const unidad = await pool.query(
      `SELECT id_unidad FROM unidades WHERE id_unidad=$1 AND id_materia=$2`,
      [id_unidad, id_materia]
    )
    if (unidad.rows.length === 0)
      return res.status(400).json({ error: 'La unidad no pertenece a la materia' })

    const result = await pool.query(
      `INSERT INTO avances (id_docente, id_materia, id_unidad, porcentaje, observaciones)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [id_docente, id_materia, id_unidad, porcentaje, observaciones || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al registrar avance' })
  }
}

const updateAvance = async (req, res) => {
  const { id } = req.params
  const { porcentaje, observaciones } = req.body
  const id_docente = req.usuario.id_usuario

  if (porcentaje < 0 || porcentaje > 100)
    return res.status(400).json({ error: 'El porcentaje debe estar entre 0 y 100' })

  try {
    const result = await pool.query(
      `UPDATE avances SET porcentaje=$1, observaciones=$2
       WHERE id_avance=$3 AND id_docente=$4
       RETURNING *`,
      [porcentaje, observaciones || null, id, id_docente]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Avance no encontrado o sin permiso' })

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar avance' })
  }
}

const deleteAvance = async (req, res) => {
  const { id } = req.params
  const id_docente = req.usuario.id_usuario

  try {
    const result = await pool.query(
      `DELETE FROM avances WHERE id_avance=$1 AND id_docente=$2
       RETURNING id_avance`,
      [id, id_docente]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Avance no encontrado o sin permiso' })

    res.json({ message: 'Avance eliminado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar avance' })
  }
}

module.exports = {
  getAvances,
  getAvancesByDocente,
  createAvance,
  updateAvance,
  deleteAvance
}
