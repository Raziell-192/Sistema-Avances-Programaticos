<template>
  <div>
    <div class="page-header">
      <h1>Evidencias</h1>
    </div>

    <!-- Seleccionar avance -->
    <div class="card" style="margin-bottom:16px;padding:16px">
      <div class="form-group" style="margin:0;max-width:500px">
        <label>Selecciona un avance</label>
        <select v-model="avanceSeleccionado" @change="cargarEvidencias">
          <option value="">— Selecciona —</option>
          <option v-for="a in avances" :key="a.id_avance" :value="a.id_avance">
            {{ a.numero_avance }} — {{ a.materia }} ({{ formatFecha(a.fecha) }})
          </option>
        </select>
      </div>
    </div>

    <template v-if="avanceSeleccionado">
      <div class="page-header">
        <h2 style="font-size:16px">Archivos adjuntos</h2>
        <label class="btn btn-primary" style="cursor:pointer">
          + Subir archivo
          <input type="file" style="display:none"
            accept=".pdf,.docx,.pptx,.jpg,.jpeg,.png"
            @change="subirArchivo" />
        </label>
      </div>

      <div v-if="subiendo" class="alert alert-success">Subiendo archivo...</div>
      <div v-if="errorSubida" class="alert alert-error">{{ errorSubida }}</div>

      <div class="card">
        <div v-if="evidencias.length === 0" class="text-muted" style="text-align:center;padding:32px">
          No hay evidencias adjuntas para este avance
        </div>
        <div v-else class="evidencias-grid">
          <div v-for="e in evidencias" :key="e.id_evidencia" class="evidencia-item">
            <div class="evidencia-icon">{{ iconoArchivo(e.archivo) }}</div>
            <div class="evidencia-info">
              <div class="evidencia-nombre">{{ e.archivo }}</div>
              <div class="evidencia-fecha text-muted">{{ formatFecha(e.fecha_subida) }}</div>
            </div>
            <div class="evidencia-acciones">
              <a :href="`http://localhost:3000/uploads/${e.archivo}`"
                target="_blank" class="btn btn-ghost btn-sm">Ver</a>
              <button class="btn btn-danger btn-sm" style="margin-left:6px"
                @click="eliminar(e.id_evidencia)">Eliminar</button>
            </div>
          </div>
        </div>
      </div>

      <!-- Info de tipos permitidos -->
      <p class="text-muted" style="margin-top:12px;font-size:12px">
        Tipos permitidos: PDF, DOCX, PPTX, JPG, PNG — Máximo 10MB por archivo
      </p>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAvances } from '../../services/avancesService'
import api from '../../services/api'

const avances           = ref([])
const evidencias        = ref([])
const avanceSeleccionado = ref('')
const subiendo          = ref(false)
const errorSubida       = ref('')

const cargar = async () => {
  const { data } = await getAvances()
  avances.value = data
}

const cargarEvidencias = async () => {
  if (!avanceSeleccionado.value) return
  const { data } = await api.get(`/evidencias/avance/${avanceSeleccionado.value}`)
  evidencias.value = data
}

const subirArchivo = async (e) => {
  const archivo = e.target.files[0]
  if (!archivo) return

  errorSubida.value = ''
  subiendo.value    = true

  try {
    const formData = new FormData()
    formData.append('archivo', archivo)
    formData.append('id_avance', avanceSeleccionado.value)
    await api.post('/evidencias', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })
    await cargarEvidencias()
  } catch (err) {
    errorSubida.value = err.response?.data?.error || 'Error al subir archivo'
  } finally {
    subiendo.value = false
    e.target.value = ''
  }
}

const eliminar = async (id) => {
  if (!confirm('¿Eliminar esta evidencia?')) return
  await api.delete(`/evidencias/${id}`)
  await cargarEvidencias()
}

const iconoArchivo = (nombre) => {
  const ext = nombre.split('.').pop().toLowerCase()
  const iconos = { pdf: '📄', docx: '📝', pptx: '📊', jpg: '🖼️', jpeg: '🖼️', png: '🖼️' }
  return iconos[ext] || '📎'
}

const formatFecha = (f) => new Date(f).toLocaleDateString('es-MX')

onMounted(cargar)
</script>

<style scoped>
.evidencias-grid { display: flex; flex-direction: column; gap: 12px; }
.evidencia-item {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  border: 1px solid var(--border);
  border-radius: var(--radius);
  background: var(--bg);
}
.evidencia-icon { font-size: 28px; }
.evidencia-info { flex: 1; }
.evidencia-nombre { font-size: 14px; font-weight: 500; word-break: break-all; }
.evidencia-fecha  { font-size: 12px; margin-top: 2px; }
.evidencia-acciones { display: flex; }
</style>
