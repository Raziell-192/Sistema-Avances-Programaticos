const pool = require('../config/db')

const getPlanes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM planes_estudio ORDER BY id_plan`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener planes de estudio' })
  }
}

const createPlan = async (req, res) => {
  const { nombre } = req.body

  if (!nombre)
    return res.status(400).json({ error: 'El nombre es requerido' })

  try {
    const result = await pool.query(
      `INSERT INTO planes_estudio (nombre) VALUES ($1) RETURNING *`,
      [nombre]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ error: 'El plan ya existe' })
    res.status(500).json({ error: 'Error al crear plan de estudio' })
  }
}

const updatePlan = async (req, res) => {
  const { id } = req.params
  const { nombre } = req.body

  if (!nombre)
    return res.status(400).json({ error: 'El nombre es requerido' })

  try {
    const result = await pool.query(
      `UPDATE planes_estudio SET nombre = $1
       WHERE id_plan = $2 RETURNING *`,
      [nombre, id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Plan no encontrado' })

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar plan de estudio' })
  }
}

const deletePlan = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE planes_estudio SET activo = FALSE
       WHERE id_plan = $1 RETURNING id_plan`,
      [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Plan no encontrado' })

    res.json({ message: 'Plan desactivado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar plan de estudio' })
  }
}

module.exports = { getPlanes, createPlan, updatePlan, deletePlan }
