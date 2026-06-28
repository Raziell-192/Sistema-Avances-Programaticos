const pool = require('../config/db')

const getLicenciaturas = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM licenciaturas ORDER BY tipo, nombre`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener licenciaturas' })
  }
}

const updateLicenciatura = async (req, res) => {
  const { id } = req.params
  const { nombre, semestres_max, activo } = req.body
  try {
    const result = await pool.query(
      `UPDATE licenciaturas SET nombre=$1, semestres_max=$2, activo=$3
       WHERE id_licenciatura=$4 RETURNING *`,
      [nombre, semestres_max, activo, id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Licenciatura no encontrada' })
    res.json(result.rows[0])
  } catch (err) {
    res.status(500).json({ error: 'Error al actualizar licenciatura' })
  }
}

module.exports = { getLicenciaturas, updateLicenciatura }
