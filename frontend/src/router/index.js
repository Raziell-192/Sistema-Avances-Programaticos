import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../pages/LoginPage.vue'),
    meta: { publico: true }
  },
  {
    path: '/',
    component: () => import('../layouts/MainLayout.vue'),
    meta: { requiereAuth: true },
    children: [
      { path: '',          redirect: '/dashboard' },
      { path: 'dashboard', name: 'Dashboard',   component: () => import('../pages/DashboardPage.vue') },
      { path: 'usuarios',  name: 'Usuarios',    component: () => import('../pages/admin/UsuariosPage.vue'),  meta: { roles: ['administrador'] } },
      { path: 'materias',  name: 'Materias',    component: () => import('../pages/admin/MateriasPage.vue'),  meta: { roles: ['administrador'] } },
      { path: 'avances',   name: 'Avances',     component: () => import('../pages/docente/AvancesPage.vue'), meta: { roles: ['docente'] } },
      { path: 'reportes',  name: 'Reportes',    component: () => import('../pages/jefe/ReportesPage.vue'),   meta: { roles: ['jefe_departamento', 'administrador'] } },
      { path: 'departamentos', name: 'Departamentos', component: () => import('../pages/admin/DepartamentosPage.vue'), meta: { roles: ['administrador'] } },
      { path: 'periodos',      name: 'Periodos',      component: () => import('../pages/admin/PeriodosPage.vue'),      meta: { roles: ['administrador'] } },
      { path: 'grupos',        name: 'Grupos',        component: () => import('../pages/admin/GruposPage.vue'),        meta: { roles: ['administrador'] } },
      { path: 'asignaciones',  name: 'Asignaciones',  component: () => import('../pages/admin/AsignacionesPage.vue'),  meta: { roles: ['administrador'] } },
      { path: 'planes',        name: 'Planes',        component: () => import('../pages/admin/PlanesPage.vue'),        meta: { roles: ['administrador'] } },
      { path: 'unidades',      name: 'Unidades',      component: () => import('../pages/admin/UnidadesPage.vue'),      meta: { roles: ['administrador'] } },
      { path: 'evidencias',    name: 'Evidencias',    component: () => import('../pages/docente/EvidenciasPage.vue'),  meta: { roles: ['docente'] } },
      { path: 'recopilatorio', name: 'Recopilatorio', component: () => import('../pages/docente/RecopilatorioPage.vue'), meta: { roles: ['docente'] } },
    ]
  },
  { path: '/:pathMatch(.*)*', redirect: '/dashboard' }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _, next) => {
  const auth = useAuthStore()

  if (to.meta.publico) return next()
  if (!auth.isAuthenticated) return next('/login')
  if (to.meta.roles && !to.meta.roles.includes(auth.rol)) return next('/dashboard')

  next()
})

export default router
