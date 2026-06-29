<template>
  <div>
    <div class="page-header">
      <h1>Unidades temáticas</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Nueva unidad</button>
    </div>

    <!-- Filtro por materia -->
    <div class="card" style="margin-bottom:16px;padding:16px">
      <div class="form-group" style="margin:0;max-width:400px">
        <label>Filtrar por materia</label>
        <select v-model="filtroMateria" @change="filtrar">
          <option value="">Todas las materias</option>
          <option v-for="m in materias" :key="m.id_materia" :value="m.id_materia">
            {{ m.clave }} — {{ m.nombre }}
          </option>
        </select>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Materia</th><th>Unidad</th><th>% Esperado</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="u in unidadesFiltradas" :key="u.id_unidad">
              <td>{{ u.materia }}</td>
              <td>{{ u.nombre }}</td>
              <td><span class="badge badge-info">{{ u.porcentaje_esperado }}%</span></td>
              <td>
                <button class="btn btn-ghost btn-sm" @click="abrirModal(u)">Editar</button>
                <button class="btn btn-danger btn-sm" style="margin-left:6px"
                  @click="eliminar(u.id_unidad)">Eliminar</button>
              </td>
            </tr>
            <tr v-if="unidadesFiltradas.length === 0">
              <td colspan="4" class="text-muted" style="text-align:center;padding:24px">
                No hay unidades registradas
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ form.id_unidad ? 'Editar' : 'Nueva' }} unidad temática</h3>
          <button class="close-btn" @click="modal=false">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-group">
          <label>Materia *</label>
          <select v-model="form.id_materia">
            <option v-for="m in materias" :key="m.id_materia" :value="m.id_materia">
              {{ m.clave }} — {{ m.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Nombre de la unidad *</label>
          <input v-model="form.nombre" placeholder="Unidad 1 - Introducción" />
        </div>
        <div class="form-group">
          <label>Porcentaje esperado *</label>
          <input v-model.number="form.porcentaje_esperado" type="number"
            min="0" max="100" placeholder="25" />
          <small class="text-muted">La suma de todas las unidades debe ser 100%</small>
        </div>

        <!-- Indicador de suma -->
        <div v-if="sumaOtrasUnidades !== null" :class="['alert', sumaTotal === 100 ? 'alert-success' : 'alert-error']">
          Suma actual de unidades: <strong>{{ sumaTotal }}%</strong>
          {{ sumaTotal === 100 ? ' Correcto' : '— debe sumar 100%' }}
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
import { ref, computed, onMounted } from 'vue'
import api from '../../services/api'

const unidades          = ref([])
const materias          = ref([])
const modal             = ref(false)
const error             = ref('')
const filtroMateria     = ref('')
const sumaOtrasUnidades = ref(null)
const form              = ref({ nombre: '', id_materia: '', porcentaje_esperado: '' })

const unidadesFiltradas = computed(() =>
  filtroMateria.value
    ? unidades.value.filter(u => u.id_materia === filtroMateria.value)
    : unidades.value
)

const sumaTotal = computed(() => {
  if (sumaOtrasUnidades.value === null) return 0
  return sumaOtrasUnidades.value + (Number(form.value.porcentaje_esperado) || 0)
})

const cargar = async () => {
  const [u, m] = await Promise.all([api.get('/unidades'), api.get('/materias')])
  unidades.value = u.data
  materias.value = m.data
}

const filtrar = () => {} // reactivo por computed

const abrirModal = (u = null) => {
  error.value = ''
  if (u) {
    form.value = { id_unidad: u.id_unidad, nombre: u.nombre,
      id_materia: u.id_materia, porcentaje_esperado: u.porcentaje_esperado }
    // Suma de otras unidades de la misma materia
    sumaOtrasUnidades.value = unidades.value
      .filter(x => x.id_materia === u.id_materia && x.id_unidad !== u.id_unidad)
      .reduce((acc, x) => acc + Number(x.porcentaje_esperado), 0)
  } else {
    form.value = { nombre: '', id_materia: materias.value[0]?.id_materia || '', porcentaje_esperado: '' }
    sumaOtrasUnidades.value = null
  }
  modal.value = true
}

const guardar = async () => {
  error.value = ''
  try {
    if (form.value.id_unidad) {
      await api.put(`/unidades/${form.value.id_unidad}`, form.value)
    } else {
      await api.post('/unidades', form.value)
    }
    modal.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  }
}

const eliminar = async (id) => {
  if (!confirm('¿Eliminar esta unidad? Esta acción no se puede deshacer.')) return
  try {
    await api.delete(`/unidades/${id}`)
    await cargar()
  } catch (e) {
    alert(e.response?.data?.error || 'Error al eliminar')
  }
}

onMounted(cargar)
</script>
