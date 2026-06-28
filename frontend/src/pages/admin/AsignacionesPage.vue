<template>
  <div>
    <div class="page-header">
      <h1>Asignaciones</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Nueva asignación</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Docente</th><th>Materia</th><th>Periodo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="a in asignaciones" :key="a.id_asignacion">
              <td>{{ a.docente }}</td>
              <td>{{ a.materia }}</td>
              <td>{{ a.periodo }}</td>
              <td>
                <button class="btn btn-danger btn-sm" @click="eliminar(a.id_asignacion)">
                  Eliminar
                </button>
              </td>
            </tr>
            <tr v-if="asignaciones.length === 0">
              <td colspan="4" class="text-muted" style="text-align:center;padding:24px">
                No hay asignaciones registradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>Nueva asignación</h3>
          <button class="close-btn" @click="modal=false">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-group">
          <label>Docente *</label>
          <select v-model="form.id_docente">
            <option v-for="d in docentes" :key="d.id_usuario" :value="d.id_usuario">
              {{ d.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Materia *</label>
          <select v-model="form.id_materia">
            <option v-for="m in materias" :key="m.id_materia" :value="m.id_materia">
              {{ m.clave }} — {{ m.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Periodo *</label>
          <select v-model="form.id_periodo">
            <option v-for="p in periodos" :key="p.id_periodo" :value="p.id_periodo">
              {{ p.nombre }}
            </option>
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
import api from '../../services/api'

const asignaciones = ref([])
const docentes     = ref([])
const materias     = ref([])
const periodos     = ref([])
const modal        = ref(false)
const error        = ref('')
const form         = ref({ id_docente: '', id_materia: '', id_periodo: '' })

const cargar = async () => {
  const [a, u, m, p] = await Promise.all([
    api.get('/asignaciones'),
    api.get('/usuarios'),
    api.get('/materias'),
    api.get('/periodos'),
  ])
  asignaciones.value = a.data
  docentes.value     = u.data.filter(u => u.rol === 'docente')
  materias.value     = m.data
  periodos.value     = p.data
}

const abrirModal = () => {
  error.value = ''
  form.value  = {
    id_docente:  docentes.value[0]?.id_usuario  || '',
    id_materia:  materias.value[0]?.id_materia  || '',
    id_periodo:  periodos.value[0]?.id_periodo  || '',
  }
  modal.value = true
}

const guardar = async () => {
  error.value = ''
  try {
    await api.post('/asignaciones', form.value)
    modal.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  }
}

const eliminar = async (id) => {
  if (!confirm('¿Eliminar esta asignación?')) return
  await api.delete(`/asignaciones/${id}`)
  await cargar()
}

onMounted(cargar)
</script>
