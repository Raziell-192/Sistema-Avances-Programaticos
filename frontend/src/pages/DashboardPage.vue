<template>
  <div>
    <div class="page-header">
      <h1>Dashboard</h1>
      <span class="text-muted">Resumen general del sistema</span>
    </div>

    <div v-if="cargando" class="text-muted">Cargando...</div>

    <template v-else>
      <!-- Stats -->
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-label">Docentes</div>
          <div class="stat-value">{{ data.totales?.total_docentes || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Materias</div>
          <div class="stat-value">{{ data.totales?.total_materias || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Avances registrados</div>
          <div class="stat-value">{{ data.totales?.total_avances || 0 }}</div>
        </div>
        <div class="stat-card">
          <div class="stat-label">Promedio general</div>
          <div class="stat-value">{{ data.totales?.promedio_general || 0 }}%</div>
        </div>
      </div>

      <!-- Gráficas -->
      <div class="grid-2">
        <div class="card">
          <h3 style="margin-bottom:16px;font-size:15px">Avance por materia</h3>
          <Bar v-if="chartMaterias.labels.length" :data="chartMaterias" :options="chartOpts" />
          <p v-else class="text-muted">Sin datos</p>
        </div>
        <div class="card">
          <h3 style="margin-bottom:16px;font-size:15px">Avance por docente</h3>
          <Bar v-if="chartDocentes.labels.length" :data="chartDocentes" :options="chartOpts" />
          <p v-else class="text-muted">Sin datos</p>
        </div>
      </div>

      <!-- Alertas -->
      <div class="card mt-16">
        <h3 style="margin-bottom:16px;font-size:15px">⚠️ Alertas de retraso</h3>
        <div v-if="data.alertas?.length === 0" class="text-muted">Sin alertas. Todo al corriente.</div>
        <table v-else>
          <thead>
            <tr>
              <th>Docente</th>
              <th>Materia</th>
              <th>Unidad</th>
              <th>Esperado</th>
              <th>Real</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in data.alertas" :key="a.unidad">
              <td>{{ a.docente }}</td>
              <td>{{ a.materia }}</td>
              <td>{{ a.unidad }}</td>
              <td><span class="badge badge-info">{{ a.porcentaje_esperado }}%</span></td>
              <td><span class="badge badge-danger">{{ a.porcentaje_real }}%</span></td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import { getDashboard } from '../services/dashboardService'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const data     = ref({ totales: {}, avance_materias: [], avance_docentes: [], alertas: [] })
const cargando = ref(true)

const chartOpts = {
  responsive: true,
  plugins: { legend: { display: false } },
  scales: { y: { min: 0, max: 100 } }
}

const chartMaterias = computed(() => ({
  labels:   data.value.avance_materias.map(m => m.materia),
  datasets: [{ label: 'Avance %', data: data.value.avance_materias.map(m => m.promedio || 0),
    backgroundColor: '#2563eb', borderRadius: 6 }]
}))

const chartDocentes = computed(() => ({
  labels:   data.value.avance_docentes.map(d => d.docente),
  datasets: [{ label: 'Avance %', data: data.value.avance_docentes.map(d => d.promedio || 0),
    backgroundColor: '#16a34a', borderRadius: 6 }]
}))

onMounted(async () => {
  try {
    const res = await getDashboard()
    data.value = res.data
  } finally {
    cargando.value = false
  }
})
</script>
