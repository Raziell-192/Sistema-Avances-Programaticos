const pool = require('../config/db')

const getGrupos = async (req, res) => {
  const { id_periodo, id_licenciatura } = req.query
  try {
    let query = `
      SELECT g.*, l.nombre AS licenciatura, p.nombre AS periodo
      FROM grupos g
      JOIN licenciaturas l ON g.id_licenciatura = l.id_licenciatura
      JOIN periodos p      ON g.id_periodo      = p.id_periodo
      WHERE g.activo = TRUE`
    const params = []

    if (id_periodo) {
      params.push(id_periodo)
      query += ` AND g.id_periodo = $${params.length}`
    }
    if (id_licenciatura) {
      params.push(id_licenciatura)
      query += ` AND g.id_licenciatura = $${params.length}`
    }

    query += ` ORDER BY g.id_licenciatura, g.semestre, g.subgrupo`
    const result = await pool.query(query, params)
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener grupos' })
  }
}

const createGrupo = async (req, res) => {
  const { id_licenciatura, id_periodo, semestre, subgrupo } = req.body

  if (!id_licenciatura || !id_periodo || !semestre)
    return res.status(400).json({ error: 'Licenciatura, periodo y semestre son requeridos' })

  try {
    const lic = await pool.query(
      `SELECT semestres_max FROM licenciaturas WHERE id_licenciatura=$1`, [id_licenciatura]
    )
    if (lic.rows.length === 0)
      return res.status(404).json({ error: 'Licenciatura no encontrada' })

    if (semestre > lic.rows[0].semestres_max)
      return res.status(400).json({
        error: `El semestre máximo para esta licenciatura es ${lic.rows[0].semestres_max}`
      })

    const result = await pool.query(
      `INSERT INTO grupos (id_licenciatura, id_periodo, semestre, subgrupo)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [id_licenciatura, id_periodo, semestre, subgrupo || null]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    if (err.code === '23505')
      return res.status(400).json({ error: 'Este grupo ya existe en el periodo' })
    res.status(500).json({ error: 'Error al crear grupo' })
  }
}

const deleteGrupo = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `UPDATE grupos SET activo=FALSE WHERE id_grupo=$1 RETURNING id_grupo`, [id]
    )
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Grupo no encontrado' })
    res.json({ message: 'Grupo desactivado correctamente' })
  } catch (err) {
    res.status(500).json({ error: 'Error al desactivar grupo' })
  }
}

module.exports = { getGrupos, createGrupo, deleteGrupo }
