<template>
  <div class="app-shell">
    <!-- Sidebar -->
    <aside class="sidebar">
      <div class="sidebar-logo">
        <span></span>
        <strong>SAP UNSIS</strong>
      </div>

      <nav class="sidebar-nav">
        <RouterLink to="/dashboard" class="nav-item">
          <span></span> Dashboard
        </RouterLink>

        <template v-if="auth.rol === 'administrador'">
          <RouterLink to="/usuarios" class="nav-item">
            <span></span> Usuarios
          </RouterLink>
          <RouterLink to="/materias" class="nav-item">
            <span></span> Materias
          </RouterLink>
          <RouterLink to="/reportes" class="nav-item">
            <span></span> Reportes
          </RouterLink>
          <RouterLink to="/departamentos" class="nav-item">
            <span></span> Departamentos
          </RouterLink>
          <RouterLink to="/periodos" class="nav-item">
            <span></span> Periodos
          </RouterLink>
          <RouterLink to="/grupos" class="nav-item">
            <span></span> Grupos
          </RouterLink>
          <RouterLink to="/asignaciones" class="nav-item">
            <span></span> Asignaciones
          </RouterLink>
          <RouterLink to="/planes" class="nav-item">
            <span></span> Planes de estudio
          </RouterLink>
          <RouterLink to="/unidades" class="nav-item">
            <span></span> Unidades temáticas
          </RouterLink>
        </template>

        <template v-if="auth.rol === 'docente'">
          <RouterLink to="/avances" class="nav-item">
            <span></span> Mis Avances
          </RouterLink>
          <RouterLink to="/evidencias" class="nav-item">
            <span></span> Evidencias
          </RouterLink>
          <RouterLink to="/recopilatorio" class="nav-item">
            <span></span> Recopilatorio
          </RouterLink>
        </template>

        <template v-if="auth.rol === 'jefe_departamento'">
          <RouterLink to="/reportes" class="nav-item">
            <span></span> Reportes
          </RouterLink>
        </template>
      </nav>

      <div class="sidebar-footer">
        <div class="user-info">
          <div class="user-avatar">{{ inicial }}</div>
          <div>
            <div class="user-name">{{ auth.usuario?.nombre }}</div>
            <div class="user-rol">{{ auth.rol }}</div>
          </div>
        </div>
        <button class="btn btn-ghost btn-sm" @click="handleLogout">Salir</button>
      </div>
    </aside>

    <!-- Contenido -->
    <main class="main-content">
      <RouterView />
    </main>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const auth    = useAuthStore()
const router  = useRouter()
const inicial = computed(() => auth.usuario?.nombre?.charAt(0).toUpperCase() || 'U')

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}
</script>

<style scoped>
.app-shell { display: flex; min-height: 100vh; }

.sidebar {
  width: var(--sidebar-w);
  background: #1e293b;
  color: #fff;
  display: flex;
  flex-direction: column;
  position: fixed;
  top: 0; left: 0; bottom: 0;
}
.sidebar-logo {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 20px;
  font-size: 20px;
  border-bottom: 1px solid rgba(255,255,255,.1);
}
.sidebar-nav { flex: 1; padding: 16px 8px; display: flex; flex-direction: column; gap: 4px; }
.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: #94a3b8;
  text-decoration: none;
  font-size: 14px;
  transition: all .15s;
}
.nav-item:hover, .nav-item.router-link-active {
  background: rgba(255,255,255,.1);
  color: #fff;
}
.sidebar-footer { padding: 16px; border-top: 1px solid rgba(255,255,255,.1); }
.user-info { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
.user-avatar {
  width: 36px; height: 36px;
  background: #2563eb;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 14px;
}
.user-name { font-size: 13px; font-weight: 600; }
.user-rol  { font-size: 11px; color: #64748b; text-transform: capitalize; }

.main-content { margin-left: var(--sidebar-w); flex: 1; padding: 32px; }
</style>
