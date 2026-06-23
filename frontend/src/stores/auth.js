import { defineStore } from 'pinia'

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: localStorage.getItem('token') || null,
    usuario: JSON.parse(localStorage.getItem('usuario')) || null,
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    rol: (state) => state.usuario?.rol || null,
  },

  actions: {
    login(token, usuario) {
      this.token = token
      this.usuario = usuario
      localStorage.setItem('token', token)
      localStorage.setItem('usuario', JSON.stringify(usuario))
    },
    logout() {
      this.token = null
      this.usuario = null
      localStorage.removeItem('token')
      localStorage.removeItem('usuario')
    }
  }
})
