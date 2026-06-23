<template>
  <div>
    <div class="page-header">
      <h1>Mis Avances</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Registrar avance</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Materia</th><th>Unidad</th><th>Avance</th><th>Esperado</th><th>Estado</th><th>Fecha</th><th>Observaciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in avances" :key="a.id_avance">
              <td>{{ a.materia }}</td>
              <td>{{ a.unidad }}</td>
              <td><strong>{{ a.porcentaje }}%</strong></td>
              <td>{{ a.porcentaje_esperado }}%</td>
              <td><span :class="badgeEstado(a.porcentaje, a.porcentaje_esperado)">{{ estado(a.porcentaje, a.porcentaje_esperado) }}</span></td>
              <td>{{ formatFecha(a.fecha) }}</td>
              <td class="text-muted">{{ a.observaciones || '—' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>Registrar avance</h3>
          <button class="close-btn" @click="modal=false">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-group">
          <label>Materia</label>
          <select v-model="form.id_materia" @change="cargarUnidades">
            <option v-for="m in materias" :key="m.id_materia" :value="m.id_materia">{{ m.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Unidad temática</label>
          <select v-model="form.id_unidad">
            <option v-for="u in unidades" :key="u.id_unidad" :value="u.id_unidad">{{ u.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Porcentaje de avance (0-100)</label>
          <input v-model.number="form.porcentaje" type="number" min="0" max="100" placeholder="75" />
        </div>
        <div class="form-group">
          <label>Observaciones</label>
          <textarea v-model="form.observaciones" rows="3" placeholder="Temas cubiertos, actividades realizadas..."></textarea>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="modal=false">Cancelar</button>
          <button class="btn btn-primary" @click="guardar">Guardar</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getAvances, createAvance } from '../../services/avancesService'
import { getMaterias } from '../../services/materiasService'
import api from '../../services/api'

const avances  = ref([])
const materias = ref([])
const unidades = ref([])
const modal    = ref(false)
const error    = ref('')
const form     = ref({ id_materia: '', id_unidad: '', porcentaje: '', observaciones: '' })

const cargar = async () => {
  const [a, m] = await Promise.all([getAvances(), getMaterias()])
  avances.value  = a.data
  materias.value = m.data
}

const cargarUnidades = async () => {
  if (!form.value.id_materia) return
  const { data } = await api.get('/unidades')
  unidades.value = data.filter(u => u.id_materia === form.value.id_materia)
  form.value.id_unidad = unidades.value[0]?.id_unidad || ''
}

const abrirModal = () => {
  error.value = ''
  form.value  = { id_materia: materias.value[0]?.id_materia || '', id_unidad: '', porcentaje: '', observaciones: '' }
  modal.value = true
  cargarUnidades()
}

const guardar = async () => {
  error.value = ''
  try {
    await createAvance(form.value)
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
