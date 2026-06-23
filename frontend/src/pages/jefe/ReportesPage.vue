<template>
  <div>
    <div class="page-header">
      <h1>Reportes</h1>
    </div>

    <!-- Tabs -->
    <div class="tabs">
      <button v-for="t in tabs" :key="t.key"
        :class="['tab', { active: tab === t.key }]"
        @click="tab = t.key">
        {{ t.label }}
      </button>
    </div>

    <div class="card mt-16">
      <!-- Cumplimiento -->
      <div v-if="tab === 'cumplimiento'">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Docente</th><th>Materia</th><th>Unidad</th><th>Esperado</th><th>Real</th><th>Estado</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in cumplimiento" :key="r.unidad + r.docente">
                <td>{{ r.docente }}</td>
                <td>{{ r.materia }}</td>
                <td>{{ r.unidad }}</td>
                <td>{{ r.porcentaje_esperado }}%</td>
                <td>{{ r.porcentaje_real }}%</td>
                <td><span :class="badgeEstado(r.estado)">{{ r.estado }}</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Docentes -->
      <div v-if="tab === 'docentes'">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Docente</th><th>Materias</th><th>Registros</th><th>Promedio</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in docentes" :key="r.id_usuario">
                <td>{{ r.docente }}</td>
                <td>{{ r.total_materias }}</td>
                <td>{{ r.total_registros }}</td>
                <td><span class="badge badge-info">{{ r.promedio_avance }}%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Materias -->
      <div v-if="tab === 'materias'">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Clave</th><th>Materia</th><th>Departamento</th><th>Registros</th><th>Promedio</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in materias" :key="r.id_materia">
                <td><span class="badge badge-info">{{ r.clave }}</span></td>
                <td>{{ r.materia }}</td>
                <td>{{ r.departamento }}</td>
                <td>{{ r.total_registros }}</td>
                <td><span class="badge badge-info">{{ r.promedio_avance }}%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Departamentos -->
      <div v-if="tab === 'departamentos'">
        <div class="table-wrap">
          <table>
            <thead>
              <tr><th>Departamento</th><th>Materias</th><th>Docentes</th><th>Promedio</th></tr>
            </thead>
            <tbody>
              <tr v-for="r in departamentos" :key="r.id_departamento">
                <td>{{ r.departamento }}</td>
                <td>{{ r.total_materias }}</td>
                <td>{{ r.total_docentes }}</td>
                <td><span class="badge badge-info">{{ r.promedio_avance }}%</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  getReporteCumplimiento,
  getReporteDocentes,
  getReporteMaterias,
  getReporteDepartamentos
} from '../../services/reportesService'

const tab           = ref('cumplimiento')
const cumplimiento  = ref([])
const docentes      = ref([])
const materias      = ref([])
const departamentos = ref([])

const tabs = [
  { key: 'cumplimiento',  label: 'Cumplimiento' },
  { key: 'docentes',      label: 'Docentes' },
  { key: 'materias',      label: 'Materias' },
  { key: 'departamentos', label: 'Departamentos' },
]

const badgeEstado = (estado) => {
  if (estado === 'Al corriente') return 'badge badge-success'
  if (estado === 'En riesgo')    return 'badge badge-warning'
  return 'badge badge-danger'
}

onMounted(async () => {
  const [c, d, m, dep] = await Promise.all([
    getReporteCumplimiento(),
    getReporteDocentes(),
    getReporteMaterias(),
    getReporteDepartamentos(),
  ])
  cumplimiento.value  = c.data
  docentes.value      = d.data
  materias.value      = m.data
  departamentos.value = dep.data
})
</script>

<style scoped>
.tabs { display: flex; gap: 8px; }
.tab {
  padding: 8px 18px;
  border-radius: 6px;
  border: 1px solid var(--border);
  background: var(--surface);
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  color: var(--text-muted);
  transition: all .15s;
}
.tab.active, .tab:hover {
  background: var(--primary);
  color: #fff;
  border-color: var(--primary);
}
</style>
