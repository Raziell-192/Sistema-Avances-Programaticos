<template>
  <div>
    <div class="page-header">
      <h1>Usuarios</h1>
      <button class="btn btn-primary" @click="abrirModal()">+ Nuevo usuario</button>
    </div>

    <div class="card">
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>Correo</th>
              <th>Rol</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in usuarios" :key="u.id_usuario">
              <td>{{ u.nombre }}</td>
              <td>{{ u.correo }}</td>
              <td><span class="badge badge-info">{{ u.rol }}</span></td>
              <td>
                <span :class="u.activo ? 'badge badge-success' : 'badge badge-danger'">
                  {{ u.activo ? 'Activo' : 'Inactivo' }}
                </span>
              </td>
              <td>
                <button class="btn btn-ghost btn-sm" @click="abrirModal(u)">
                  Editar
                </button>
                <button
                  :class="u.activo ? 'btn btn-danger btn-sm' : 'btn btn-primary btn-sm'"
                  style="margin-left:6px"
                  @click="toggle(u.id_usuario, u.activo)">
                  {{ u.activo ? 'Desactivar' : 'Activar' }}
                </button>
              </td>
            </tr>
            <tr v-if="usuarios.length === 0">
              <td colspan="5" class="text-muted" style="text-align:center;padding:24px">
                No hay usuarios registrados
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <div v-if="modal" class="modal-overlay" @click.self="modal=false">
      <div class="modal">
        <div class="modal-header">
          <h3>{{ form.id_usuario ? 'Editar usuario' : 'Nuevo usuario' }}</h3>
          <button class="close-btn" @click="modal=false">×</button>
        </div>
        <div v-if="error" class="alert alert-error">{{ error }}</div>
        <div class="form-group">
          <label>Nombre</label>
          <input v-model="form.nombre" type="text" placeholder="Nombre completo" />
        </div>
        <div class="form-group">
          <label>Correo</label>
          <input v-model="form.correo" type="email" placeholder="correo@sap.edu.mx" />
        </div>
        <div class="form-group">
          <label>
            {{ form.id_usuario ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña' }}
          </label>
          <input v-model="form.password" type="password" placeholder="••••••••" />
        </div>
        <div class="form-group">
          <label>Rol</label>
          <select v-model="form.id_rol">
            <option value="1">Administrador</option>
            <option value="2">Docente</option>
            <option value="3">Jefe de Departamento</option>
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
import { getUsuarios, createUsuario, updateUsuario, toggleUsuario } from '../../services/usuariosService'

const usuarios = ref([])
const modal    = ref(false)
const error    = ref('')
const form     = ref({ nombre: '', correo: '', password: '', id_rol: 2 })

const cargar = async () => {
  const { data } = await getUsuarios()
  usuarios.value = data
}

const abrirModal = (u = null) => {
  error.value = ''
  form.value  = u
    ? { id_usuario: u.id_usuario, nombre: u.nombre, correo: u.correo, password: '', id_rol: u.id_rol || 2 }
    : { nombre: '', correo: '', password: '', id_rol: 2 }
  modal.value = true
}

const guardar = async () => {
  error.value = ''
  try {
    if (form.value.id_usuario) {
      await updateUsuario(form.value.id_usuario, form.value)
    } else {
      await createUsuario(form.value)
    }
    modal.value = false
    await cargar()
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al guardar'
  }
}

const toggle = async (id, activo) => {
  const accion = activo ? 'desactivar' : 'activar'
  if (!confirm(`¿Deseas ${accion} este usuario?`)) return
  await toggleUsuario(id)
  await cargar()
}

onMounted(cargar)
</script>
