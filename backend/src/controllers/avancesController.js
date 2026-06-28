const pool = require('../config/db')

const getAvances = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT a.*,
              u.nombre  AS docente,
              m.nombre  AS materia,
              un.nombre AS unidad,
              un.porcentaje_esperado,
              g.nombre_grupo AS grupo
       FROM avances a
       JOIN usuarios u   ON a.id_docente = u.id_usuario
       JOIN materias m   ON a.id_materia = m.id_materia
       JOIN unidades un  ON a.id_unidad  = un.id_unidad
       LEFT JOIN grupos g ON a.id_grupo  = g.id_grupo
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
              m.nombre  AS materia,
              un.nombre AS unidad,
              un.porcentaje_esperado,
              g.nombre_grupo AS grupo
       FROM avances a
       JOIN materias m   ON a.id_materia = m.id_materia
       JOIN unidades un  ON a.id_unidad  = un.id_unidad
       LEFT JOIN grupos g ON a.id_grupo  = g.id_grupo
       WHERE a.id_docente = $1
       ORDER BY a.fecha DESC`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener avances del docente' })
  }
}

const getResumenDocente = async (req, res) => {
  const { id } = req.params
  try {
    const result = await pool.query(
      `SELECT
         a.id_materia,
         m.nombre AS materia,
         COUNT(a.id_avance) AS total_reportes,
         ARRAY_AGG(a.numero_avance ORDER BY a.numero_avance) AS reportes_entregados,
         BOOL_AND(a.numero_avance IN ('Parcial 1','Parcial 2','Parcial 3','Ordinario'))
           AND COUNT(a.id_avance) = 4 AS semestre_completo
       FROM avances a
       JOIN materias m ON a.id_materia = m.id_materia
       WHERE a.id_docente = $1
       GROUP BY a.id_materia, m.nombre
       ORDER BY m.nombre`,
      [id]
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener resumen' })
  }
}

const createAvance = async (req, res) => {
  const {
    id_materia, id_unidad, id_grupo, numero_avance,
    horas_efectivas, porcentaje_semestre, porcentaje_programa,
    porcentaje_proyecto, promedio_grupo, promedio_aprobados,
    promedio_reprobados, porcentaje_reprobados, temas_vistos,
    herramientas_inst, recursos_adicionales, dio_asesorias,
    recursos_asesorias, materias_asesorias, observaciones_generales
  } = req.body

  const id_docente = req.usuario.id_usuario

  if (!id_materia || !id_unidad || !numero_avance || !temas_vistos)
    return res.status(400).json({ error: 'Materia, unidad, número de avance y temas vistos son requeridos' })

  try {
    // Verificar que no exista ya ese parcial para esa materia y docente
    const existe = await pool.query(
      `SELECT id_avance FROM avances
       WHERE id_docente=$1 AND id_materia=$2 AND numero_avance=$3`,
      [id_docente, id_materia, numero_avance]
    )
    if (existe.rows.length > 0)
      return res.status(400).json({ error: `Ya registraste el ${numero_avance} para esta materia` })

    // Calcular porcentaje_semestre automáticamente si hay horas
    let pct_semestre = porcentaje_semestre
    if (horas_efectivas) {
      const mat = await pool.query(
        `SELECT horas_semana,
                (SELECT COUNT(*) * 17 * horas_semana FROM materias WHERE id_materia=$1) AS horas_total
         FROM materias WHERE id_materia=$1`, [id_materia]
      )
      if (mat.rows[0]?.horas_semana) {
        const horas_total = mat.rows[0].horas_semana * 17
        pct_semestre = Math.round((horas_efectivas / horas_total) * 100)
      }
    }

    const result = await pool.query(
      `INSERT INTO avances (
         id_docente, id_materia, id_unidad, id_grupo, numero_avance,
         porcentaje, horas_efectivas, porcentaje_semestre, porcentaje_programa,
         porcentaje_proyecto, promedio_grupo, promedio_aprobados,
         promedio_reprobados, porcentaje_reprobados, temas_vistos,
         herramientas_inst, recursos_adicionales, dio_asesorias,
         recursos_asesorias, materias_asesorias, observaciones_generales
       ) VALUES (
         $1,$2,$3,$4,$5,
         $6,$7,$8,$9,
         $10,$11,$12,
         $13,$14,$15,
         $16,$17,$18,
         $19,$20,$21
       ) RETURNING *`,
      [
        id_docente, id_materia, id_unidad, id_grupo || null, numero_avance,
        porcentaje_programa || 0, horas_efectivas || null, pct_semestre || null, porcentaje_programa || null,
        porcentaje_proyecto || null, promedio_grupo || null, promedio_aprobados || null,
        promedio_reprobados || null, porcentaje_reprobados || null, temas_vistos,
        herramientas_inst || [], recursos_adicionales || null, dio_asesorias || false,
        recursos_asesorias || [], materias_asesorias || null, observaciones_generales || null
      ]
    )
    res.status(201).json(result.rows[0])
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Error al registrar avance' })
  }
}

const updateAvance = async (req, res) => {
  const { id } = req.params
  const id_docente = req.usuario.id_usuario
  const {
    horas_efectivas, porcentaje_semestre, porcentaje_programa,
    porcentaje_proyecto, promedio_grupo, promedio_aprobados,
    promedio_reprobados, porcentaje_reprobados, temas_vistos,
    herramientas_inst, recursos_adicionales, dio_asesorias,
    recursos_asesorias, materias_asesorias, observaciones_generales
  } = req.body

  try {
    const result = await pool.query(
      `UPDATE avances SET
         horas_efectivas=$1, porcentaje_semestre=$2, porcentaje_programa=$3,
         porcentaje_proyecto=$4, promedio_grupo=$5, promedio_aprobados=$6,
         promedio_reprobados=$7, porcentaje_reprobados=$8, temas_vistos=$9,
         herramientas_inst=$10, recursos_adicionales=$11, dio_asesorias=$12,
         recursos_asesorias=$13, materias_asesorias=$14, observaciones_generales=$15
       WHERE id_avance=$16 AND id_docente=$17
       RETURNING *`,
      [
        horas_efectivas, porcentaje_semestre, porcentaje_programa,
        porcentaje_proyecto, promedio_grupo, promedio_aprobados,
        promedio_reprobados, porcentaje_reprobados, temas_vistos,
        herramientas_inst, recursos_adicionales, dio_asesorias,
        recursos_asesorias, materias_asesorias, observaciones_generales,
        id, id_docente
      ]
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
      `DELETE FROM avances WHERE id_avance=$1 AND id_docente=$2 RETURNING id_avance`,
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
  getResumenDocente,
  createAvance,
  updateAvance,
  deleteAvance
}
