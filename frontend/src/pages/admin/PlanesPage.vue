<template>
  <div>
    <div class="page-header">
      <h1>Planes de estudio</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Nuevo plan</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="p in planes" :key="p.id_plan">
              <td>{{ p.nombre }}</td>
              <td><span :class="p.activo ? 'badge badge-success' : 'badge badge-danger'">
                {{ p.activo ? 'Activo' : 'Inactivo' }}
              </span></td>
              <td>
                <button class="btn btn-ghost btn-sm" @click="abrirModal(p)">Editar</button>
                <button class="btn btn-danger btn-sm" style="margin-left:6px"
                  @click="desactivar(p.id_plan)">Desactivar</button>
              </td>
            </tr>
            <tr v-if="planes.length === 0">
              <td colspan="3" class="text-muted" style="text-align:center;padding:24px">
                No hay planes registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ form.id_plan ? 'Editar' : 'Nuevo' }} plan de estudio</h3>
          <button class="close-btn" @click="modal=false">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" placeholder="Nombre del plan de estudio" />
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

const planes = ref([])
const modal  = ref(false)
const error  = ref('')
const form   = ref({ nombre: '' })

const cargar = async () => {
  const { data } = await api.get('/planes')
  planes.value = data
}

const abrirModal = (p = null) => {
  error.value = ''
  form.value  = p ? { id_plan: p.id_plan, nombre: p.nombre } : { nombre: '' }
  modal.value = true
}

const guardar = async () => {
  error.value = ''
  try {
    if (form.value.id_plan) {
      await api.put(`/planes/${form.value.id_plan}`, form.value)
    } else {
      await api.post('/planes', form.value)
    }
    modal.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  }
}

const desactivar = async (id) => {
  if (!confirm('¿Desactivar este plan?')) return
  await api.delete(`/planes/${id}`)
  await cargar()
}

onMounted(cargar)
</script>
