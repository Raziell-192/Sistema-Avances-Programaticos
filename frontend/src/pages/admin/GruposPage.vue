<template>
  <div>
    <div class="page-header">
      <h1>Grupos</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Nuevo grupo</button>
    </div>

    <!-- Filtros -->
    <div class="card" style="margin-bottom:16px;padding:16px">
      <div class="grid-2">
        <div class="form-group" style="margin:0">
          <label>Filtrar por periodo</label>
          <select v-model="filtro.id_periodo" @change="cargar">
            <option value="">Todos</option>
            <option v-for="p in periodos" :key="p.id_periodo" :value="p.id_periodo">
              {{ p.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group" style="margin:0">
          <label>Filtrar por licenciatura</label>
          <select v-model="filtro.id_licenciatura" @change="cargar">
            <option value="">Todas</option>
            <option v-for="l in licenciaturas" :key="l.id_licenciatura" :value="l.id_licenciatura">
              {{ l.nombre }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr><th>Grupo</th><th>Licenciatura</th><th>Semestre</th><th>Periodo</th><th>Acciones</th></tr>
          </thead>
          <tbody>
            <tr v-for="g in grupos" :key="g.id_grupo">
              <td><span class="badge badge-info">{{ g.nombre_grupo }}</span></td>
              <td>{{ g.licenciatura }}</td>
              <td>{{ g.semestre }}°</td>
              <td>{{ g.periodo }}</td>
              <td>
                <button class="btn btn-danger btn-sm" @click="desactivar(g.id_grupo)">
                  Desactivar
                </button>
              </td>
            </tr>
            <tr v-if="grupos.length === 0">
              <td colspan="5" class="text-muted" style="text-align:center;padding:24px">
                No hay grupos registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>Nuevo grupo</h3>
          <button class="close-btn" @click="modal=false">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-group">
          <label>Periodo *</label>
          <select v-model="form.id_periodo">
            <option v-for="p in periodos" :key="p.id_periodo" :value="p.id_periodo">
              {{ p.nombre }}
            </option>
          </select>
        </div>
        <div class="form-group">
          <label>Licenciatura *</label>
          <select v-model="form.id_licenciatura" @change="actualizarSemestresMax">
            <option v-for="l in licenciaturas" :key="l.id_licenciatura" :value="l.id_licenciatura">
              {{ l.nombre }}
            </option>
          </select>
        </div>
        <div class="grid-2">
          <div class="form-group">
            <label>Semestre *</label>
            <select v-model="form.semestre">
              <option v-for="s in semestresMax" :key="s" :value="s">{{ s }}°</option>
            </select>
          </div>
          <div class="form-group">
            <label>Subgrupo (opcional)</label>
            <input v-model="form.subgrupo" placeholder="A, B, C..." maxlength="2"
              style="text-transform:uppercase" />
            <small class="text-muted">Solo si hay más de un grupo en ese semestre</small>
          </div>
        </div>

        <!-- Preview del nombre -->
        <div v-if="form.id_licenciatura && form.semestre" class="preview-grupo">
          Nombre del grupo: <strong>{{ previewNombre }}</strong>
        </div>

        <div class="modal-footer">
          <button class="btn btn-ghost" @click="modal=false">Cancelar</button>
          <button class="btn btn-primary" @click="guardar">Crear grupo</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getGrupos, createGrupo, deleteGrupo } from '../../services/gruposService'
import { getLicenciaturas } from '../../services/licenciaturasService'
import api from '../../services/api'

const grupos        = ref([])
const periodos      = ref([])
const licenciaturas = ref([])
const modal         = ref(false)
const error         = ref('')
const semestresMax  = ref(10)

const filtro = ref({ id_periodo: '', id_licenciatura: '' })
const form   = ref({ id_periodo: '', id_licenciatura: '', semestre: 1, subgrupo: '' })

const previewNombre = computed(() => {
  if (!form.value.id_licenciatura || !form.value.semestre) return ''
  return `${form.value.semestre}${form.value.id_licenciatura}${form.value.subgrupo ? '-' + form.value.subgrupo.toUpperCase() : ''}`
})

const cargar = async () => {
  const params = {}
  if (filtro.value.id_periodo)      params.id_periodo      = filtro.value.id_periodo
  if (filtro.value.id_licenciatura) params.id_licenciatura = filtro.value.id_licenciatura
  const { data } = await getGrupos(params)
  grupos.value = data
}

const actualizarSemestresMax = () => {
  const lic = licenciaturas.value.find(l => l.id_licenciatura === form.value.id_licenciatura)
  semestresMax.value = lic ? Array.from({ length: lic.semestres_max }, (_, i) => i + 1) : 10
  form.value.semestre = 1
}

const abrirModal = () => {
  error.value = ''
  form.value  = {
    id_periodo:      periodos.value[0]?.id_periodo || '',
    id_licenciatura: licenciaturas.value[0]?.id_licenciatura || '',
    semestre:        1,
    subgrupo:        ''
  }
  actualizarSemestresMax()
  modal.value = true
}

const guardar = async () => {
  error.value = ''
  try {
    await createGrupo({
      ...form.value,
      subgrupo: form.value.subgrupo?.toUpperCase() || null
    })
    modal.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al crear grupo'
  }
}

const desactivar = async (id) => {
  if (!confirm('¿Desactivar este grupo?')) return
  await deleteGrupo(id)
  await cargar()
}

onMounted(async () => {
  const [p, l] = await Promise.all([api.get('/periodos'), getLicenciaturas()])
  periodos.value      = p.data
  licenciaturas.value = l.data
  await cargar()
})
</script>

<style scoped>
.preview-grupo {
  background: var(--primary-light);
  border: 1px solid var(--primary);
  border-radius: var(--radius);
  padding: 10px 14px;
  font-size: 14px;
  margin-bottom: 16px;
  color: var(--primary);
}
</style>
