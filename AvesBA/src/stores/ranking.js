import { defineStore } from 'pinia'
import { obtenerRankingCompleto } from '../servicios/metricasService.js'

function agregarPrecision(jugador) {
  const intentos = jugador.aciertos + jugador.fallos
  let precision = null
  if (intentos > 0) precision = Math.round(jugador.aciertos / intentos * 100)

  return {
    ...jugador,
    precision,
  }
}

function agregarPosicion(jugador, indice, state) {
  let posicion = jugador.posicion
  if (posicion === null || posicion === undefined) {
    posicion = (state.pagina - 1) * state.limite + indice + 1
  }
  return agregarPrecision({ ...jugador, posicion })
}

export const useRankingStore = defineStore('ranking', {
  state: () => ({
    jugadores: [],
    jugadorActual: null,
    totalJugadores: 0,
    limite: 10,
    pagina: 1,
    cargando: false,
    error: '',
    solicitudId: 0,
  }),
  getters: {
    filas: (state) => state.jugadores.map((jugador, indice) => agregarPosicion(jugador, indice, state)),
    filaPersonal: (state) => {
      if (state.jugadorActual === null) return null
      return agregarPrecision(state.jugadorActual)
    },
    totalPaginas: (state) => Math.max(1, Math.ceil(state.totalJugadores / state.limite)),
  },
  actions: {
    async cambiarLimite(limite) {
      this.limite = limite
      this.pagina = 1
      return this.cargarRanking()
    },
    async cambiarPagina(pagina) {
      if (this.cargando || pagina < 1 || pagina > this.totalPaginas) return
      this.pagina = pagina
      return this.cargarRanking()
    },
    async cargarRanking() {
      const solicitudId = ++this.solicitudId
      const paginaSolicitada = this.pagina
      const limiteSolicitado = this.limite
      this.cargando = true
      this.error = ''
      try {
        const offset = (paginaSolicitada - 1) * limiteSolicitado
        const respuesta = await obtenerRankingCompleto(limiteSolicitado, offset)
        if (solicitudId !== this.solicitudId) return

        const totalJugadores = respuesta.total_jugadores
        const totalPaginas = Math.max(1, Math.ceil(totalJugadores / limiteSolicitado))
        if (paginaSolicitada > totalPaginas) {
          this.totalJugadores = totalJugadores
          this.pagina = totalPaginas
          return this.cargarRanking()
        }

        this.jugadores = respuesta.ranking
        this.jugadorActual = respuesta.jugador_actual
        this.totalJugadores = totalJugadores
      } catch (err) {
        if (solicitudId === this.solicitudId) {
          this.error = err.status === 401
            ? 'Ingresá a tu cuenta para consultar el ranking.'
            : err.message || 'No se pudo cargar el ranking. Intentá nuevamente.'
        }
      } finally {
        if (solicitudId === this.solicitudId) this.cargando = false
      }
    },
  },
})