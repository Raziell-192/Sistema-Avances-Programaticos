const pool = require('../config/db')

const getMaterias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT m.*, d.nombre AS departamento, p.nombre AS plan
       FROM materias m
       JOIN departamentos d ON m.id_departamento = d.id_departamento
       JOIN planes_estudio p ON m.id_plan = p.id_plan
       ORDER BY m.id_materia`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener materias' })
  }
}

const createMateria = async (req, res) => {
  const { clave, nombre, id_departamento, id_plan } = req.body

  if (!clave || !nombre || !id_departamento || !id_plan)
    return res.status(400).json({ error: 'Todos los campos son requeridos' })

  try {
    const result = await pool.query(
      `INSERT INTO materias (clave, nombre, id_departamento, id_plan)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [clave, nombre, id_departamento, id_plan]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ error: 'La clave ya existe' })
    res.status(500).json({ error: 'Error al crear materia' })
  }
}

const updateMateria = async (req, res) => {
  const { id } = req.params
  const { clave, nombre, id_departamento, id_plan } = req.body

  try {
    const result = await pool.query(
      `UPDATE materias SET clave=$1, nombre=$2, id_departamento=$3, id_plan=$4
       WHERE id_materia=$5 RETURNING *`,
      [clave, nombre, id_departamento, id_plan, id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Materia no encontrada' })

    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar materia' })
  }
}

const deleteMateria = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE materias SET activo = FALSE
       WHERE id_materia = $1 RETURNING id_materia`,
      [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Materia no encontrada' })

    res.json({ message: 'Materia desactivada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar materia' })
  }
}

module.exports = { getMaterias, createMateria, updateMateria, deleteMateria }
