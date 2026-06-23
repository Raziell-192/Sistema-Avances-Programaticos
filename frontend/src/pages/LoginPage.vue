<template>
  <div class="login-wrap">
    <div class="login-card">
      <div class="login-logo">
        <span class="logo-icon">📊</span>
        <h1>SAP</h1>
        <p>Sistema de Avances Programáticos</p>
      </div>

      <div v-if="error" class="alert alert-error">{{ error }}</div>

      <form @submit.prevent="handleLogin">
        <div class="form-group">
          <label>Correo institucional</label>
          <input v-model="correo" type="email" placeholder="usuario@sap.edu.mx" required />
        </div>
        <div class="form-group">
          <label>Contraseña</label>
          <input v-model="password" type="password" placeholder="••••••••" required />
        </div>
        <button class="btn btn-primary" style="width:100%" :disabled="cargando">
          {{ cargando ? 'Ingresando...' : 'Iniciar sesión' }}
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { login } from '../services/authService'

const router   = useRouter()
const auth     = useAuthStore()
const correo   = ref('')
const password = ref('')
const error    = ref('')
const cargando = ref(false)

const handleLogin = async () => {
  error.value   = ''
  cargando.value = true
  try {
    const { data } = await login(correo.value, password.value)
    auth.login(data.token, data.usuario)
    router.push('/dashboard')
  } catch (e) {
    error.value = e.response?.data?.error || 'Error al iniciar sesión'
  } finally {
    cargando.value = false
  }
}
</script>

<style scoped>
.login-wrap {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%);
}
.login-card {
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  width: 100%;
  max-width: 400px;
  box-shadow: 0 20px 60px rgba(0,0,0,.2);
}
.login-logo {
  text-align: center;
  margin-bottom: 32px;
}
.logo-icon { font-size: 40px; }
.login-logo h1 { font-size: 28px; font-weight: 700; color: #2563eb; margin-top: 8px; }
.login-logo p  { font-size: 13px; color: #64748b; margin-top: 4px; }
</style>
