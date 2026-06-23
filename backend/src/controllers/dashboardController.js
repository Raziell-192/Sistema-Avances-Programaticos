const pool = require('../config/db')

const getDashboard = async (req, res) => {
  try {
    // Totales generales
    const totales = await pool.query(
      `SELECT
         (SELECT COUNT(*) FROM usuarios WHERE id_rol = 2 AND activo = TRUE)    AS total_docentes,
         (SELECT COUNT(*) FROM materias  WHERE activo = TRUE)                   AS total_materias,
         (SELECT COUNT(*) FROM avances)                                         AS total_avances,
         (SELECT ROUND(AVG(porcentaje), 2) FROM avances)                        AS promedio_general`
    )

    // Avance por materia
    const avancePorMateria = await pool.query(
      `SELECT
         m.nombre AS materia,
         ROUND(AVG(a.porcentaje), 2) AS promedio
       FROM materias m
       LEFT JOIN avances a ON m.id_materia = a.id_materia
       GROUP BY m.nombre
       ORDER BY m.nombre`
    )

    // Avance por docente
    const avancePorDocente = await pool.query(
      `SELECT
         u.nombre AS docente,
         ROUND(AVG(a.porcentaje), 2) AS promedio
       FROM usuarios u
       LEFT JOIN avances a ON u.id_usuario = a.id_docente
       WHERE u.id_rol = 2
       GROUP BY u.nombre
       ORDER BY u.nombre`
    )

    // Alertas — unidades retrasadas
    const alertas = await pool.query(
      `SELECT
         u.nombre AS docente,
         m.nombre AS materia,
         un.nombre AS unidad,
         un.porcentaje_esperado,
         COALESCE(MAX(a.porcentaje), 0) AS porcentaje_real
       FROM unidades un
       JOIN materias m         ON un.id_materia  = m.id_materia
       JOIN docente_materia dm ON m.id_materia   = dm.id_materia
       JOIN usuarios u         ON dm.id_docente  = u.id_usuario
       LEFT JOIN avances a     ON a.id_unidad    = un.id_unidad
                              AND a.id_docente   = dm.id_docente
       GROUP BY u.nombre, m.nombre, un.nombre, un.porcentaje_esperado
       HAVING COALESCE(MAX(a.porcentaje), 0) < un.porcentaje_esperado * 0.75
       ORDER BY u.nombre`
    )

    res.json({
      totales:          totales.rows[0],
      avance_materias:  avancePorMateria.rows,
      avance_docentes:  avancePorDocente.rows,
      alertas:          alertas.rows
    })
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener datos del dashboard' })
  }
}

module.exports = { getDashboard }
