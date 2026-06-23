const pool = require('../config/db')
const fs = require('fs')
const path = require('path')

const getEvidenciasByAvance = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT * FROM evidencias WHERE id_avance=$1 ORDER BY fecha_subida DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener evidencias' })
  }
}

const createEvidencia = async (req, res) => {
  const { id_avance } = req.body

  if (!req.file)
    return res.status(400).json({ error: 'Archivo requerido' })

  if (!id_avance)
    return res.status(400).json({ error: 'id_avance es requerido' })

  try {
    // Verificar que el avance existe
    const avance = await pool.query(
      `SELECT id_avance FROM avances WHERE id_avance=$1`, [id_avance]
    )
    if (avance.rows.length === 0)
      return res.status(404).json({ error: 'Avance no encontrado' })

    const result = await pool.query(
      `INSERT INTO evidencias (id_avance, archivo)
       VALUES ($1, $2) RETURNING *`,
      [id_avance, req.file.filename]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al guardar evidencia' })
  }
}

const deleteEvidencia = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `DELETE FROM evidencias WHERE id_evidencia=$1 RETURNING *`,
      [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Evidencia no encontrada' })

    // Eliminar archivo del disco
    const filePath = path.join(__dirname, '../uploads', result.rows[0].archivo)
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath)

    res.json({ message: 'Evidencia eliminada correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar evidencia' })
  }
}

module.exports = { getEvidenciasByAvance, createEvidencia, deleteEvidencia }
