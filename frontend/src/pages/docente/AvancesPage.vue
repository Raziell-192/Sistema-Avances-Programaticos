<template>
  <div>
    <div class="page-header">
      <h1>Mis Avances</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Registrar avance</button>
    </div>

    <!-- Resumen por materia -->
    <div class="stats-grid" style="margin-bottom:24px">
      <div v-for="r in resumen" :key="r.id_materia" class="stat-card">
        <div class="stat-label">{{ r.materia }}</div>
        <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
          <span v-for="p in ['Parcial 1','Parcial 2','Parcial 3','Ordinario']" :key="p"
            :class="r.reportes_entregados?.includes(p) ? 'badge badge-success' : 'badge badge-danger'">
            {{ p }}
          </span>
        </div>
        <div v-if="r.semestre_completo" class="badge badge-success" style="margin-top:8px">
           Semestre completo
        </div>
      </div>
    </div>

    <!-- Tabla de avances -->
    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Parcial</th>
              <th>Materia</th>
              <th>Grupo</th>
              <th>% Semestre</th>
              <th>% Programa</th>
              <th>% Proyecto</th>
              <th>Promedio</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in avances" :key="a.id_avance">
              <td><span class="badge badge-info">{{ a.numero_avance }}</span></td>
              <td>{{ a.materia }}</td>
              <td>{{ a.grupo || '—' }}</td>
              <td>{{ a.porcentaje_semestre ?? '—' }}%</td>
              <td>{{ a.porcentaje_programa ?? '—' }}%</td>
              <td>{{ a.porcentaje_proyecto ?? 'N/A' }}</td>
              <td>{{ a.promedio_grupo ?? '—' }}</td>
              <td><span :class="badgeEstado(a.porcentaje, a.porcentaje_esperado)">
                {{ estado(a.porcentaje, a.porcentaje_esperado) }}
              </span></td>
              <td>{{ formatFecha(a.fecha) }}</td>
            </tr>
            <tr v-if="avances.length === 0">
              <td colspan="9" class="text-muted" style="text-align:center;padding:24px">
                No hay avances registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="modal-overlay" @click.self="cerrarModal">
      <div class="modal" style="max-width:600px;max-height:90vh;overflow-y:auto">
        <div class="modal-header">
          <h3>Registrar avance programático</h3>
          <button class="close-btn" @click="cerrarModal">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>

        <!-- Sección 1: Identificación -->
        <div class="seccion">
          <h4 class="seccion-title"> Identificación</h4>
          <div class="grid-2">
            <div class="form-group">
              <label>Número de avance *</label>
              <select v-model="form.numero_avance">
                <option>Parcial 1</option>
                <option>Parcial 2</option>
                <option>Parcial 3</option>
                <option>Ordinario</option>
              </select>
            </div>
            <div class="form-group">
              <label>Materia *</label>
              <select v-model="form.id_materia" @change="onMateriaChange">
                <option v-for="m in materias" :key="m.id_materia" :value="m.id_materia">
                  {{ m.nombre }}
                </option>
              </select>
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Unidad temática *</label>
              <select v-model="form.id_unidad">
                <option v-for="u in unidades" :key="u.id_unidad" :value="u.id_unidad">
                  {{ u.nombre }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label>Grupo</label>
              <select v-model="form.id_grupo">
                <option value="">— Sin grupo —</option>
                <option v-for="g in grupos" :key="g.id_grupo" :value="g.id_grupo">
                  {{ g.nombre_grupo }}
                </option>
              </select>
            </div>
          </div>
        </div>

        <!-- Sección 2: Horas y porcentajes -->
        <div class="seccion">
          <h4 class="seccion-title"> Horas y porcentajes</h4>
          <div class="grid-2">
            <div class="form-group">
              <label>Horas efectivas</label>
              <input v-model.number="form.horas_efectivas" type="number" min="0" placeholder="27" />
              <small class="text-muted">El % del semestre se calcula automáticamente</small>
            </div>
            <div class="form-group">
              <label>% avance del semestre</label>
              <input :value="pctSemestreCalculado" type="number" disabled
                style="background:#f1f5f9;cursor:not-allowed" />
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>% avance del programa *</label>
              <input v-model.number="form.porcentaje_programa" type="number" min="0" max="100" placeholder="27" />
              <small class="text-muted">Unidades cubiertas / total unidades × 100</small>
            </div>
            <div class="form-group">
              <label>% avance del proyecto</label>
              <select v-model="form.porcentaje_proyecto">
                <option value="">No aplica</option>
                <option v-for="n in 100" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
          </div>
        </div>

        <!-- Sección 3: Calificaciones -->
        <div class="seccion">
          <h4 class="seccion-title"> Calificaciones del grupo</h4>
          <div class="grid-2">
            <div class="form-group">
              <label>Promedio del grupo</label>
              <input v-model.number="form.promedio_grupo" type="number" step="0.1" min="0" max="10" placeholder="7.5" />
            </div>
            <div class="form-group">
              <label>% de reprobados</label>
              <select v-model="form.porcentaje_reprobados">
                <option value="">No aplica</option>
                <option v-for="n in 100" :key="n" :value="n">{{ n }}</option>
              </select>
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Promedio de aprobados</label>
              <input v-model.number="form.promedio_aprobados" type="number" step="0.1" min="0" max="10" placeholder="8.9" />
            </div>
            <div class="form-group">
              <label>Promedio de reprobados</label>
              <input v-model.number="form.promedio_reprobados" type="number" step="0.1" min="0" max="10"
                placeholder="5.7"
                :disabled="!form.porcentaje_reprobados"
                :style="!form.porcentaje_reprobados ? 'background:#f1f5f9;cursor:not-allowed' : ''" />
            </div>
          </div>
        </div>

        <!-- Sección 4: Contenido y recursos -->
        <div class="seccion">
          <h4 class="seccion-title"> Contenido y recursos</h4>
          <div class="form-group">
            <label>Temas vistos durante el parcial *</label>
            <textarea v-model="form.temas_vistos" rows="4"
              placeholder="Puede copiar directamente de la planeación académica..."></textarea>
          </div>
          <div class="form-group">
            <label>Herramientas institucionales utilizadas</label>
            <div class="checkbox-group">
              <label v-for="h in herramientasBase" :key="h" class="checkbox-item">
                <input type="checkbox" :value="h" v-model="form.herramientas_inst" />
                {{ h }}
              </label>
              <label class="checkbox-item">
                <input type="checkbox" value="Otro" v-model="form.herramientas_inst" />
                Otro:
              </label>
            </div>
            <input v-if="form.herramientas_inst.includes('Otro')"
              v-model="form.herramientas_otro"
              placeholder="Especifica la herramienta..."
              style="margin-top:8px" />
          </div>
          <div class="form-group">
            <label>Recursos adicionales (audios, diapositivas, antologías, etc.)</label>
            <textarea v-model="form.recursos_adicionales" rows="2"
              placeholder="Describe los recursos adicionales utilizados..."></textarea>
          </div>
        </div>

        <!-- Sección 5: Asesorías -->
        <div class="seccion">
          <h4 class="seccion-title"> Asesorías académicas</h4>
          <div class="form-group">
            <label>¿Ha impartido asesorías durante este periodo? *</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" :value="true" v-model="form.dio_asesorias" /> Sí
              </label>
              <label class="radio-item">
                <input type="radio" :value="false" v-model="form.dio_asesorias" /> No
              </label>
            </div>
          </div>
          <template v-if="form.dio_asesorias">
            <div class="form-group">
              <label>Recursos de plataforma utilizados en asesorías *</label>
              <div class="checkbox-group">
                <label v-for="r in recursosAsesoriaBase" :key="r" class="checkbox-item">
                  <input type="checkbox" :value="r" v-model="form.recursos_asesorias" />
                  {{ r }}
                </label>
                <label class="checkbox-item">
                  <input type="checkbox" value="Otro" v-model="form.recursos_asesorias" />
                  Otro:
                </label>
              </div>
              <input v-if="form.recursos_asesorias.includes('Otro')"
                v-model="form.asesorias_otro"
                placeholder="Especifica el recurso..."
                style="margin-top:8px" />
            </div>
            <div class="form-group">
              <label>¿Sobre qué materias impartió asesorías? *</label>
              <textarea v-model="form.materias_asesorias" rows="2"
                placeholder="Nombre las materias..."></textarea>
            </div>
          </template>
        </div>

        <!-- Sección 6: Evidencias obligatorias -->
        <div class="seccion">
          <h4 class="seccion-title"> Evidencias obligatorias</h4>

          <div class="instrucciones-fechas">
            <strong>Instrucciones para lista de asistencia:</strong>
            <ul>
              <li v-for="i in instruccionesFechas[form.numero_avance]" :key="i">{{ i }}</li>
            </ul>
            <p style="margin-top:8px">
              Nombre el archivo como: <code>{{ nombreArchivoAsistencia }}</code>
            </p>
          </div>

          <div class="form-group">
            <label>Lista de asistencia * <span class="text-muted">(con firma autógrafa)</span></label>
            <input type="file" @change="onAsistencia"
              accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png" />
            <small class="text-muted">Formato: PDF, DOCX, PPTX, JPG, PNG — Máx. 10MB</small>
            <div v-if="archivoAsistencia" class="archivo-seleccionado">
               {{ archivoAsistencia.name }}
            </div>
          </div>

          <template v-if="form.dio_asesorias">
            <div class="form-group">
              <label>Reporte de asesorías *</label>
              <p style="margin-top:4px;margin-bottom:8px">
                Nombre el archivo como: <code>{{ nombreArchivoAsesorias }}</code>
              </p>
              <input type="file" @change="onAsesorias"
                accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png,.xls,.xlsx,.ods" />
              <small class="text-muted">Formato: XLS, XLSX, ODS, PDF, JPEG, JPG</small>
              <div v-if="archivoAsesorias" class="archivo-seleccionado">
                 {{ archivoAsesorias.name }}
              </div>
            </div>
          </template>
        </div>

        <!-- Sección 7: Observaciones -->
        <div class="seccion">
          <h4 class="seccion-title"> Observaciones</h4>
          <div class="form-group">
            <label>Observaciones generales</label>
            <textarea v-model="form.observaciones_generales" rows="3"
              placeholder="Agradecemos observaciones que sirvan para el seguimiento académico..."></textarea>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="cerrarModal">Cancelar</button>
          <button class="btn btn-primary" @click="guardar">Guardar avance</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAvances, createAvance } from '../../services/avancesService'
import { getMaterias } from '../../services/materiasService'
import { getGrupos } from '../../services/gruposService'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const auth     = useAuthStore()
const avances  = ref([])
const resumen  = ref([])
const materias = ref([])
const unidades = ref([])
const grupos   = ref([])
const modal    = ref(false)
const error    = ref('')

const herramientasBase     = ['Chat', 'Foro']
const recursosAsesoriaBase = ['Chat', 'Foro', 'Mensajería privada']

const archivoAsistencia = ref(null)
const archivoAsesorias  = ref(null)
const onAsistencia = (e) => { archivoAsistencia.value = e.target.files[0] || null }
const onAsesorias  = (e) => { archivoAsesorias.value  = e.target.files[0] || null }

const instruccionesFechas = {
  'Parcial 1': [
    'Fecha de Inicio: fecha de inicio de semestre.',
    'Fecha Final: un día antes del examen del primer parcial.'
  ],
  'Parcial 2': [
    'Fecha de Inicio: un día después del examen del primer parcial.',
    'Fecha Final: un día antes del examen del segundo parcial.'
  ],
  'Parcial 3': [
    'Fecha de Inicio: un día después del examen del segundo parcial.',
    'Fecha Final: un día antes del examen del tercer parcial.'
  ],
  'Ordinario': [
    'Fecha de Inicio: fecha de inicio de semestre.',
    'Fecha Final: un día antes del inicio del periodo de exámenes ordinarios.'
  ]
}

const nombreArchivoAsistencia = computed(() => {
  const materia = materias.value.find(m => m.id_materia === form.value.id_materia)
  const grupo   = grupos.value.find(g => g.id_grupo === form.value.id_grupo)
  if (!materia) return 'Gpo_Asistencia_Materia'
  const nombreMat = materia.nombre.replace(/\s+/g, '')
  const nombreGpo = grupo?.nombre_grupo || 'Gpo'
  return `${nombreGpo}_Asistencia_${nombreMat}`
})

const nombreArchivoAsesorias = computed(() => {
  const nombre = auth.usuario?.nombre?.replace(/\s+/g, '') || 'Profesor'
  return `Asesorias_${nombre}`
})

const horasSemanaMat = ref(null)
const pctSemestreCalculado = computed(() => {
  if (!form.value.horas_efectivas || !horasSemanaMat.value) return ''
  return Math.round((form.value.horas_efectivas / (horasSemanaMat.value * 17)) * 100)
})

const formInicial = () => ({
  numero_avance:           'Parcial 1',
  id_materia:              '',
  id_unidad:               '',
  id_grupo:                '',
  horas_efectivas:         null,
  porcentaje_programa:     null,
  porcentaje_proyecto:     '',
  promedio_grupo:          null,
  promedio_aprobados:      null,
  promedio_reprobados:     null,
  porcentaje_reprobados:   '',
  temas_vistos:            '',
  herramientas_inst:       [],
  herramientas_otro:       '',
  recursos_adicionales:    '',
  dio_asesorias:           false,
  recursos_asesorias:      [],
  asesorias_otro:          '',
  materias_asesorias:      '',
  observaciones_generales: ''
})

const form = ref(formInicial())

const cargar = async () => {
  const [a, m, g, res] = await Promise.all([
    getAvances(),
    getMaterias(),
    getGrupos(),
    api.get(`/avances/resumen/${auth.usuario.id_usuario}`)
  ])
  avances.value  = a.data
  materias.value = m.data
  grupos.value   = g.data
  resumen.value  = res.data
}

const onMateriaChange = async () => {
  form.value.id_unidad = ''
  unidades.value       = []
  horasSemanaMat.value = null
  if (!form.value.id_materia) return
  const [u, m] = await Promise.all([api.get('/unidades'), getMaterias()])
  unidades.value       = u.data.filter(u => u.id_materia === form.value.id_materia)
  form.value.id_unidad = unidades.value[0]?.id_unidad || ''
  const mat            = m.data.find(m => m.id_materia === form.value.id_materia)
  horasSemanaMat.value = mat?.horas_semana || null
}

const abrirModal = () => {
  error.value             = ''
  archivoAsistencia.value = null
  archivoAsesorias.value  = null
  form.value = formInicial()
  if (materias.value.length) {
    form.value.id_materia = materias.value[0].id_materia
    onMateriaChange()
  }
  modal.value = true
}

const cerrarModal = () => { modal.value = false }

const guardar = async () => {
  error.value = ''

  if (!archivoAsistencia.value)
    return error.value = 'La lista de asistencia es obligatoria'

  if (form.value.dio_asesorias && !archivoAsesorias.value)
    return error.value = 'El reporte de asesorías es obligatorio cuando impartió asesorías'

  try {
    const payload = {
      ...form.value,
      porcentaje_semestre:   pctSemestreCalculado.value || null,
      porcentaje_proyecto:   form.value.porcentaje_proyecto   || null,
      porcentaje_reprobados: form.value.porcentaje_reprobados || null,
      id_grupo:              form.value.id_grupo || null,
      herramientas_otro:     form.value.herramientas_inst.includes('Otro') ? form.value.herramientas_otro : null,
      recursos_asesorias:    form.value.dio_asesorias ? form.value.recursos_asesorias : [],
      asesorias_otro:        form.value.recursos_asesorias.includes('Otro') ? form.value.asesorias_otro : null,
      materias_asesorias:    form.value.dio_asesorias ? form.value.materias_asesorias : null,
    }
    const { data: avance } = await createAvance(payload)

    const fdAsistencia = new FormData()
    fdAsistencia.append('archivo',   archivoAsistencia.value)
    fdAsistencia.append('id_avance', avance.id_avance)
    await api.post('/evidencias', fdAsistencia, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    if (form.value.dio_asesorias && archivoAsesorias.value) {
      const fdAsesorias = new FormData()
      fdAsesorias.append('archivo',   archivoAsesorias.value)
      fdAsesorias.append('id_avance', avance.id_avance)
      await api.post('/evidencias', fdAsesorias, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    }

    modal.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  }
}

const estado = (real, esperado) => {
  if (real >= esperado) return 'Al corriente'
  if (real >= esperado * 0.75) return 'En riesgo'
  return 'Retrasado'
}
const badgeEstado = (real, esperado) => {
  if (real >= esperado) return 'badge badge-success'
  if (real >= esperado * 0.75) return 'badge badge-warning'
  return 'badge badge-danger'
}
const formatFecha = (f) => new Date(f).toLocaleDateString('es-MX')

onMounted(cargar)
</script>

<style scoped>
.seccion { margin-bottom: 24px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
.seccion:last-of-type { border-bottom: none; }
.seccion-title { font-size: 13px; font-weight: 700; text-transform: uppercase;
  letter-spacing: .5px; color: var(--primary); margin-bottom: 16px; }
.checkbox-group, .radio-group { display: flex; flex-wrap: wrap; gap: 12px; }
.checkbox-item, .radio-item { display: flex; align-items: center; gap: 6px; font-size: 14px; cursor: pointer; }
.instrucciones-fechas {
  background: #fffbeb;
  border: 1px solid #fbbf24;
  border-radius: var(--radius);
  padding: 14px;
  margin-bottom: 16px;
  font-size: 13px;
}
.instrucciones-fechas ul { margin: 8px 0 0 16px; line-height: 1.8; }
code {
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: 4px;
  padding: 2px 6px;
  font-size: 12px;
  color: var(--primary);
}
.archivo-seleccionado { margin-top: 6px; font-size: 13px; color: var(--success); font-weight: 500; }
</style>
