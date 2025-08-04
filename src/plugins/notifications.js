/**
 * Notification plugin using Vuetify snackbar
 */
import { reactive } from 'vue'

// Global notification state
export const notificationState = reactive({
  show: false,
  message: '',
  color: 'primary',
  timeout: 4000,
  icon: null
})

// Notification methods
export const notifications = {
  show(message, options = {}) {
    notificationState.message = message
    notificationState.color = options.color || 'primary'
    notificationState.timeout = options.timeout || 4000
    notificationState.icon = options.icon || null
    notificationState.show = true
  },

  success(message, options = {}) {
    this.show(message, {
      color: 'success',
      icon: 'mdi-check-circle',
      ...options
    })
  },

  error(message, options = {}) {
    this.show(message, {
      color: 'error',
      icon: 'mdi-alert-circle',
      timeout: 6000,
      ...options
    })
  },

  warning(message, options = {}) {
    this.show(message, {
      color: 'warning',
      icon: 'mdi-alert',
      ...options
    })
  },

  info(message, options = {}) {
    this.show(message, {
      color: 'info',
      icon: 'mdi-information',
      ...options
    })
  },

  hide() {
    notificationState.show = false
  }
}

// Vue plugin
export default {
  install(app) {
    // Make notifications available globally as $toastr
    app.config.globalProperties.$toastr = notifications
    
    // Also provide as $notify for alternative naming
    app.config.globalProperties.$notify = notifications
    
    // Provide for composition API
    app.provide('notifications', notifications)
  }
}
