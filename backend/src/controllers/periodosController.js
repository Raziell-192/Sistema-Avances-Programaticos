const pool = require('../config/db')

const getPeriodos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM periodos ORDER BY fecha_inicio DESC`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener periodos' })
  }
}

const createPeriodo = async (req, res) => {
  const { nombre, fecha_inicio, fecha_fin } = req.body

  if (!nombre || !fecha_inicio || !fecha_fin)
    return res.status(400).json({ error: 'Todos los campos son requeridos' })

  if (new Date(fecha_inicio) >= new Date(fecha_fin))
    return res.status(400).json({ error: 'La fecha de inicio debe ser menor a la fecha fin' })

  try {
    const result = await pool.query(
      `INSERT INTO periodos (nombre, fecha_inicio, fecha_fin)
       VALUES ($1, $2, $3) RETURNING *`,
      [nombre, fecha_inicio, fecha_fin]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al crear periodo' })
  }
}

const updatePeriodo = async (req, res) => {
  const { id } = req.params
  const { nombre, fecha_inicio, fecha_fin, activo } = req.body

  try {
    const result = await pool.query(
      `UPDATE periodos SET nombre=$1, fecha_inicio=$2, fecha_fin=$3, activo=$4
       WHERE id_periodo=$5 RETURNING *`,
      [nombre, fecha_inicio, fecha_fin, activo, id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Periodo no encontrado' })

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar periodo' })
  }
}

const deletePeriodo = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE periodos SET activo = FALSE
       WHERE id_periodo=$1 RETURNING id_periodo`,
      [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Periodo no encontrado' })

    res.json({ message: 'Periodo desactivado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar periodo' })
  }
}

module.exports = { getPeriodos, createPeriodo, updatePeriodo, deletePeriodo }
