<template>
  <div>
    <div class="page-header">
      <h1>Materias</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Nueva materia</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Clave</th><th>Nombre</th><th>Departamento</th><th>Plan</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="m in materias" :key="m.id_materia">
              <td><span class="badge badge-info">{{ m.clave }}</span></td>
              <td>{{ m.nombre }}</td>
              <td>{{ m.departamento }}</td>
              <td>{{ m.plan }}</td>
              <td>
                <button class="btn btn-ghost btn-sm" @click="abrirModal(m)">Editar</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ form.id_materia ? 'Editar materia' : 'Nueva materia' }}</h3>
          <button class="close-btn" @click="modal=false">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-group">
          <label>Clave</label>
          <input v-model="form.clave" placeholder="SC-401" />
        </div>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" placeholder="Nombre de la materia" />
        </div>
        <div class="form-group">
          <label>Departamento</label>
          <select v-model="form.id_departamento">
            <option v-for="d in departamentos" :key="d.id_departamento" :value="d.id_departamento">{{ d.nombre }}</option>
          </select>
        </div>
        <div class="form-group">
          <label>Plan de estudio</label>
          <select v-model="form.id_plan">
            <option v-for="p in planes" :key="p.id_plan" :value="p.id_plan">{{ p.nombre }}</option>
          </select>
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
import { getMaterias, createMateria, updateMateria } from '../../services/materiasService'
import api from '../../services/api'

const materias      = ref([])
const departamentos = ref([])
const planes        = ref([])
const modal         = ref(false)
const error         = ref('')
const form          = ref({ clave: '', nombre: '', id_departamento: '', id_plan: '' })

const cargar = async () => {
  const [m, d, p] = await Promise.all([
    getMaterias(),
    api.get('/departamentos'),
    api.get('/planes'),
  ])
  materias.value      = m.data
  departamentos.value = d.data
  planes.value        = p.data
}

const abrirModal = (m = null) => {
  error.value = ''
  form.value  = m
    ? { id_materia: m.id_materia, clave: m.clave, nombre: m.nombre, id_departamento: m.id_departamento, id_plan: m.id_plan }
    : { clave: '', nombre: '', id_departamento: departamentos.value[0]?.id_departamento, id_plan: planes.value[0]?.id_plan }
  modal.value = true
}

const guardar = async () => {
  error.value = ''
  try {
    if (form.value.id_materia) {
      await updateMateria(form.value.id_materia, form.value)
    } else {
      await createMateria(form.value)
    }
    modal.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  }
}

onMounted(cargar)
</script>
