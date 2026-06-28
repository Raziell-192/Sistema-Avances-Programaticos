<template>
  <div>
    <div class="page-header">
      <h1>Departamentos</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Nuevo departamento</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Nombre</th><th>Estado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="d in departamentos" :key="d.id_departamento">
              <td>{{ d.nombre }}</td>
              <td><span :class="d.activo ? 'badge badge-success' : 'badge badge-danger'">
                {{ d.activo ? 'Activo' : 'Inactivo' }}
              </span></td>
              <td>
                <button class="btn btn-ghost btn-sm" @click="abrirModal(d)">Editar</button>
                <button class="btn btn-danger btn-sm" style="margin-left:6px"
                  @click="desactivar(d.id_departamento)">Desactivar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ form.id_departamento ? 'Editar' : 'Nuevo' }} departamento</h3>
          <button class="close-btn" @click="modal=false">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" placeholder="Nombre del departamento" />
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

const departamentos = ref([])
const modal = ref(false)
const error = ref('')
const form  = ref({ nombre: '' })

const cargar = async () => {
  const { data } = await api.get('/departamentos')
  departamentos.value = data
}

const abrirModal = (d = null) => {
  error.value = ''
  form.value  = d ? { id_departamento: d.id_departamento, nombre: d.nombre } : { nombre: '' }
  modal.value = true
}

const guardar = async () => {
  error.value = ''
  try {
    if (form.value.id_departamento) {
      await api.put(`/departamentos/${form.value.id_departamento}`, form.value)
    } else {
      await api.post('/departamentos', form.value)
    }
    modal.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  }
}

const desactivar = async (id) => {
  if (!confirm('¿Desactivar este departamento?')) return
  await api.delete(`/departamentos/${id}`)
  await cargar()
}

onMounted(cargar)
</script>
