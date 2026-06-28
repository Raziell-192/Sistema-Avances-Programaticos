<template>
  <div>
    <div class="page-header">
      <h1>Periodos escolares</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Nuevo periodo</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Inicio</th><th>Fin</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in periodos" :key="p.id_periodo">
              <td>{{ p.nombre }}</td>
              <td>{{ formatFecha(p.fecha_inicio) }}</td>
              <td>{{ formatFecha(p.fecha_fin) }}</td>
              <td><span :class="p.activo ? 'badge badge-success' : 'badge badge-danger'">
                {{ p.activo ? 'Activo' : 'Inactivo' }}
              </span></td>
              <td>
                <button class="btn btn-ghost btn-sm" @click="abrirModal(p)">Editar</button>
                <button class="btn btn-danger btn-sm" style="margin-left:6px"
                  @click="desactivar(p.id_periodo)">Desactivar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ form.id_periodo ? 'Editar' : 'Nuevo' }} periodo</h3>
          <button class="close-btn" @click="modal=false">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" placeholder="Enero-Junio 2025" />
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Fecha inicio</label>
            <input v-model="form.fecha_inicio" type="date" />
          </div>
          <div class="form-group">
            <label>Fecha fin</label>
            <input v-model="form.fecha_fin" type="date" />
          </div>
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
import api from '../../services/api'

const periodos = ref([])
const modal    = ref(false)
const error    = ref('')
const form     = ref({ nombre: '', fecha_inicio: '', fecha_fin: '' })

const cargar = async () => {
  const { data } = await api.get('/periodos')
  periodos.value = data
}

const abrirModal = (p = null) => {
  error.value = ''
  form.value  = p
    ? { id_periodo: p.id_periodo, nombre: p.nombre,
        fecha_inicio: p.fecha_inicio?.split('T')[0],
        fecha_fin:    p.fecha_fin?.split('T')[0],
        activo:       p.activo }
    : { nombre: '', fecha_inicio: '', fecha_fin: '' }
  modal.value = true
}

const guardar = async () => {
  error.value = ''
  try {
    if (form.value.id_periodo) {
      await api.put(`/periodos/${form.value.id_periodo}`, form.value)
    } else {
      await api.post('/periodos', form.value)
    }
    modal.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  }
}

const desactivar = async (id) => {
  if (!confirm('¿Desactivar este periodo?')) return
  await api.delete(`/periodos/${id}`)
  await cargar()
}

const formatFecha = (f) => f ? new Date(f).toLocaleDateString('es-MX') : '—'

onMounted(cargar)
</script>
