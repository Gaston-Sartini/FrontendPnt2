import { ref } from 'vue'
import { defineStore } from 'pinia'
import { obtenerSesionActiva } from '../servicios/juegoService.js'

export const usePartidaStore = defineStore('partida', () => {
  const pendiente = ref(false)
  const juegoVisible = ref(false)
  let revision = 0

  function marcarPendiente(valor) {
    revision++
    pendiente.value = valor
  }

  async function consultarPendiente() {
    const consulta = ++revision
    try {
      const sesion = await obtenerSesionActiva()
      if (consulta === revision) pendiente.value = Boolean(sesion?.preguntas?.length)
    } catch {
      // Si se corta la conexión, conservá el último estado confirmado.
    }
  }

  return { pendiente, juegoVisible, marcarPendiente, consultarPendiente }
})
