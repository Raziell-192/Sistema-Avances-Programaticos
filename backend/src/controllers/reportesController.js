const pool = require('../config/db')

const reporteDocentes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.id_usuario,
         u.nombre AS docente,
         COUNT(DISTINCT a.id_materia) AS total_materias,
         COUNT(a.id_avance)           AS total_registros,
         ROUND(AVG(a.porcentaje), 2)  AS promedio_avance
       FROM usuarios u
       LEFT JOIN avances a ON u.id_usuario = a.id_docente
       WHERE u.id_rol = 2
       GROUP BY u.id_usuario, u.nombre
       ORDER BY u.nombre`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al generar reporte de docentes' })
  }
}

const reporteMaterias = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         m.id_materia,
         m.clave,
         m.nombre AS materia,
         d.nombre AS departamento,
         COUNT(a.id_avance)          AS total_registros,
         ROUND(AVG(a.porcentaje), 2) AS promedio_avance,
         MAX(a.fecha)                AS ultimo_registro
       FROM materias m
       JOIN departamentos d ON m.id_departamento = d.id_departamento
       LEFT JOIN avances a  ON m.id_materia = a.id_materia
       GROUP BY m.id_materia, m.clave, m.nombre, d.nombre
       ORDER BY m.nombre`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al generar reporte de materias' })
  }
}

const reporteDepartamentos = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         d.id_departamento,
         d.nombre AS departamento,
         COUNT(DISTINCT m.id_materia)  AS total_materias,
         COUNT(DISTINCT a.id_docente)  AS total_docentes,
         ROUND(AVG(a.porcentaje), 2)   AS promedio_avance
       FROM departamentos d
       LEFT JOIN materias m ON d.id_departamento = m.id_departamento
       LEFT JOIN avances a  ON m.id_materia = a.id_materia
       GROUP BY d.id_departamento, d.nombre
       ORDER BY d.nombre`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al generar reporte de departamentos' })
  }
}

const reporteCumplimiento = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT
         u.nombre AS docente,
         m.nombre AS materia,
         un.nombre AS unidad,
         un.porcentaje_esperado,
         COALESCE(MAX(a.porcentaje), 0)                              AS porcentaje_real,
         ROUND(COALESCE(MAX(a.porcentaje), 0)
               - un.porcentaje_esperado, 2)                          AS diferencia,
         CASE
           WHEN COALESCE(MAX(a.porcentaje), 0) >= un.porcentaje_esperado
           THEN 'Al corriente'
           WHEN COALESCE(MAX(a.porcentaje), 0) >= un.porcentaje_esperado * 0.75
           THEN 'En riesgo'
           ELSE 'Retrasado'
         END AS estado
       FROM unidades un
       JOIN materias m         ON un.id_materia   = m.id_materia
       JOIN docente_materia dm ON m.id_materia     = dm.id_materia
       JOIN usuarios u         ON dm.id_docente    = u.id_usuario
       LEFT JOIN avances a     ON a.id_unidad      = un.id_unidad
                              AND a.id_docente      = dm.id_docente
       GROUP BY u.nombre, m.nombre, un.nombre, un.porcentaje_esperado
       ORDER BY u.nombre, m.nombre, un.nombre`
    )
    res.json(result.rows)
  } catch (err) {
    res.status(500).json({ error: 'Error al generar reporte de cumplimiento' })
  }
}

module.exports = {
  reporteDocentes,
  reporteMaterias,
  reporteDepartamentos,
  reporteCumplimiento
}
