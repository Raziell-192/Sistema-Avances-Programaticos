<template>
  <div>
    <div class="page-header">
      <h1>Recopilatorio semestral</h1>
    </div>

    <div v-if="cargando" class="text-muted">Cargando...</div>

    <template v-else>
      <div v-if="resumen.length === 0" class="card">
        <p class="text-muted" style="text-align:center;padding:32px">
          No hay avances registrados aún.
        </p>
      </div>

      <div v-for="mat in resumen" :key="mat.id_materia" class="card" style="margin-bottom:16px">
        <div class="recopilatorio-header">
          <div>
            <h3>{{ mat.materia }}</h3>
            <span v-if="mat.semestre_completo" class="badge badge-success">
               Semestre completo
            </span>
            <span v-else class="badge badge-warning">
               {{ mat.total_reportes }}/4 reportes entregados
            </span>
          </div>
          <div class="parciales-status">
            <div v-for="p in parciales" :key="p" class="parcial-chip"
              :class="mat.reportes_entregados?.includes(p) ? 'entregado' : 'pendiente'">
              <span>{{ mat.reportes_entregados?.includes(p) ? '' : '' }}</span>
              {{ p }}
            </div>
          </div>
        </div>

        <!-- Detalle de cada parcial -->
        <div v-if="mat.semestre_completo" class="parciales-detalle">
          <table>
            <thead>
              <tr>
                <th>Parcial</th>
                <th>% Semestre</th>
                <th>% Programa</th>
                <th>% Proyecto</th>
                <th>Promedio grupo</th>
                <th>% Reprobados</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="a in avancesPorMateria(mat.id_materia)" :key="a.id_avance">
                <td><span class="badge badge-info">{{ a.numero_avance }}</span></td>
                <td>{{ a.porcentaje_semestre ?? '—' }}%</td>
                <td>{{ a.porcentaje_programa ?? '—' }}%</td>
                <td>{{ a.porcentaje_proyecto ?? 'N/A' }}</td>
                <td>{{ a.promedio_grupo ?? '—' }}</td>
                <td>{{ a.porcentaje_reprobados ?? 'N/A' }}%</td>
              </tr>
            </tbody>
          </table>

          <!-- Promedios consolidados -->
          <div class="consolidado">
            <div class="consolidado-item">
              <span class="text-muted">Promedio semestral</span>
              <strong>{{ promedioSemestral(mat.id_materia) }}%</strong>
            </div>
            <div class="consolidado-item">
              <span class="text-muted">Avance del programa</span>
              <strong>{{ promedioPrograma(mat.id_materia) }}%</strong>
            </div>
          </div>
        </div>

        <div v-else class="text-muted" style="margin-top:12px;font-size:13px">
          Completa todos los parciales para ver el recopilatorio consolidado.
        </div>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAvances } from '../../services/avancesService'
import api from '../../services/api'
import { useAuthStore } from '../../stores/auth'

const auth     = useAuthStore()
const resumen  = ref([])
const avances  = ref([])
const cargando = ref(true)
const parciales = ['Parcial 1', 'Parcial 2', 'Parcial 3', 'Ordinario']

const avancesPorMateria = (id_materia) =>
  avances.value.filter(a => a.id_materia === id_materia)

const promedioSemestral = (id_materia) => {
  const items = avancesPorMateria(id_materia).filter(a => a.porcentaje_semestre)
  if (!items.length) return '—'
  return (items.reduce((s, a) => s + Number(a.porcentaje_semestre), 0) / items.length).toFixed(1)
}

const promedioPrograma = (id_materia) => {
  const items = avancesPorMateria(id_materia).filter(a => a.porcentaje_programa)
  if (!items.length) return '—'
  return (items.reduce((s, a) => s + Number(a.porcentaje_programa), 0) / items.length).toFixed(1)
}

onMounted(async () => {
  try {
    const [r, a] = await Promise.all([
      api.get(`/avances/resumen/${auth.usuario.id_usuario}`),
      getAvances()
    ])
    resumen.value = r.data
    avances.value = a.data
  } finally {
    cargando.value = false
  }
})
</script>

<style scoped>
.recopilatorio-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 12px;
}
.recopilatorio-header h3 { font-size: 16px; margin-bottom: 6px; }
.parciales-status { display: flex; gap: 8px; flex-wrap: wrap; }
.parcial-chip {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 99px;
  font-size: 12px;
  font-weight: 600;
}
.parcial-chip.entregado { background: #dcfce7; color: #16a34a; }
.parcial-chip.pendiente { background: #fef3c7; color: #d97706; }
.parciales-detalle { margin-top: 16px; }
.consolidado {
  display: flex;
  gap: 24px;
  margin-top: 16px;
  padding: 14px;
  background: var(--bg);
  border-radius: var(--radius);
  border: 1px solid var(--border);
}
.consolidado-item { display: flex; flex-direction: column; gap: 2px; }
.consolidado-item strong { font-size: 20px; color: var(--primary); }
</style>
