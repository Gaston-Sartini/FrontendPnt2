<script setup>
import { computed, onMounted } from 'vue'
import { storeToRefs } from 'pinia'
import { useRankingStore } from '../stores/ranking.js'

const rankingStore = useRankingStore()
const { filas, filaPersonal, totalJugadores, pagina, totalPaginas, cargando, error } = storeToRefs(rankingStore)
const jugadorActualId = computed(() => {
  if (!filaPersonal.value) return null
  return filaPersonal.value.user_id
})
const jugadorActualEstaEnPagina = computed(() => {
  if (jugadorActualId.value === null) return false
  return filas.value.some(jugador => jugador.user_id === jugadorActualId.value)
})
const jugadorActualSinRespuestas = computed(() => {
  if (!filaPersonal.value) return false
  return filaPersonal.value.aciertos + filaPersonal.value.fallos === 0
})

onMounted(() => rankingStore.cargarRanking())
</script>

<template>
  <section class="box av-ranking" :aria-busy="cargando">
    <div class="av-encabezado mb-4">
      <div>
        <h1 class="title is-3 mb-2">🏆 Ranking</h1>
        <p class="av-texto-suave">Conocé a los jugadores con más puntos y seguí sumando con cada ave.</p>
      </div>
      <div class="av-acciones">
        <button type="button" class="button is-primary av-elevable" :class="{ 'is-loading': cargando }"
          :disabled="cargando" aria-label="Actualizar ranking" title="Actualizar ranking" @click="rankingStore.cargarRanking()">
          <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
            stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="M20 10a8 8 0 1 0-.9 6.2M20 5v5h-5" />
          </svg>
        </button>
        <router-link to="/modo" class="button is-primary av-elevable">🐦 Jugar</router-link>
      </div>
    </div>
    <div v-if="cargando" role="status" class="py-5 has-text-centered">
      <p class="mb-3">🐦 Buscando a los mejores observadores...</p>
      <progress class="progress is-small is-primary" max="100"></progress>
    </div>
    <div v-else-if="error" class="notification is-danger is-light" role="alert">
      <p class="mb-3">{{ error }}</p>
      <button class="button is-danger is-light" @click="rankingStore.cargarRanking()">Reintentar</button>
    </div>
    <div v-else>
      <template v-if="totalJugadores > 0">
        <p id="ranking-desplazamiento" class="av-ayuda-tabla av-texto-suave is-size-7 mb-2">Deslizá la tabla hacia los costados para ver todas las estadísticas.</p>
        <div class="table-container av-tabla-contenedor" tabindex="0" role="region" aria-label="Tabla de posiciones" aria-describedby="ranking-desplazamiento">
          <table class="table is-fullwidth is-hoverable">
            <caption class="has-text-left av-texto-suave mb-3">Clasificación por puntos acumulados</caption>
            <thead>
              <tr>
                <th scope="col">Puesto</th><th scope="col">Jugador</th>
                <th scope="col" class="has-text-right">Puntos</th><th scope="col" class="has-text-right">Aciertos</th>
                <th scope="col" class="has-text-right">Fallos</th><th scope="col" class="has-text-right">Precisión</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="jugador in filas" :key="jugador.user_id" :class="{ 'av-mi-fila': jugador.user_id === jugadorActualId }">
                <td class="av-puesto">{{ jugador.posicion }} <span v-if="jugador.posicion === 1" aria-hidden="true">🥇</span></td>
                <th scope="row" class="av-jugador">{{ jugador.nombre }} {{ jugador.apellido }} <span v-if="jugador.user_id === jugadorActualId" class="tag is-primary is-light ml-2">Vos</span></th>
                <td class="has-text-right av-puntos">{{ jugador.puntos_totales }}</td>
                <td class="has-text-right">{{ jugador.aciertos }}</td><td class="has-text-right">{{ jugador.fallos }}</td>
                <td class="has-text-right">{{ jugador.precision === null ? 'Sin respuestas' : `${jugador.precision}%` }}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <nav class="av-paginacion mb-5" aria-label="Paginación del ranking">
          <button type="button" class="button is-light" :disabled="cargando || pagina <= 1" @click="rankingStore.cambiarPagina(pagina - 1)">Anterior</button>
          <span aria-live="polite">Página {{ pagina }} de {{ totalPaginas }}</span>
          <button type="button" class="button is-light" :disabled="cargando || pagina >= totalPaginas" @click="rankingStore.cambiarPagina(pagina + 1)">Siguiente</button>
        </nav>
      </template>
      <p v-else class="notification is-info is-light">🐣 Todavía no hay jugadores en el ranking. ¡Jugá una partida para empezar!</p>

      <section v-if="!jugadorActualEstaEnPagina" class="av-tu-posicion" aria-labelledby="ranking-posicion-titulo">
        <h2 id="ranking-posicion-titulo" class="title is-5">Tu posición</h2>
        <div v-if="filaPersonal" class="table-container av-tabla-contenedor">
          <table class="table is-fullwidth">
            <caption class="has-text-left av-texto-suave mb-3">Tus estadísticas personales</caption>
            <thead>
              <tr>
                <th scope="col">Puesto</th><th scope="col">Jugador</th>
                <th scope="col" class="has-text-right">Puntos</th><th scope="col" class="has-text-right">Aciertos</th>
                <th scope="col" class="has-text-right">Fallos</th><th scope="col" class="has-text-right">Precisión</th>
              </tr>
            </thead>
            <tbody>
              <tr class="av-mi-fila">
                <td class="av-puesto">
                  <template v-if="filaPersonal.posicion">
                    {{ filaPersonal.posicion }}
                    <span v-if="filaPersonal.posicion === 1" aria-hidden="true">🥇</span>
                  </template>
                  <span v-else>Sin posición</span>
                </td>
                <th scope="row" class="av-jugador">{{ filaPersonal.nombre }} {{ filaPersonal.apellido }} <span class="tag is-primary is-light ml-2">Vos</span></th>
                <td class="has-text-right av-puntos">{{ filaPersonal.puntos_totales }}</td>
                <td class="has-text-right">{{ filaPersonal.aciertos }}</td><td class="has-text-right">{{ filaPersonal.fallos }}</td>
                <td class="has-text-right">{{ filaPersonal.precision === null ? 'Sin respuestas' : `${filaPersonal.precision}%` }}</td>
              </tr>
            </tbody>
          </table>
          <p v-if="jugadorActualSinRespuestas" class="av-texto-suave is-size-7">Todavía no tenés respuestas, por eso aún no hay un puesto en el ranking.</p>
        </div>
        <p v-else class="notification is-warning is-light">No se pudo obtener tu posición en el ranking. Actualizá para intentarlo nuevamente.</p>
      </section>
      <p class="av-texto-suave is-size-7 mt-4">Precisión = aciertos / (aciertos + fallos) × 100. Sin respuestas, se muestra “Sin respuestas”.</p>
    </div>
  </section>
</template>

<style scoped>
.av-ranking {
  border-top: 5px solid var(--color-dorado);
  min-width: 0;
  max-width: 100%;
}
.av-encabezado > :first-child {
  flex: 1 1 16rem;
  min-width: 0;
  overflow-wrap: anywhere;
}
.av-tabla-contenedor {
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  border: 1px solid var(--color-crema);
  border-radius: 8px;
}
.av-tabla-contenedor:focus-visible {
  outline: 2px solid var(--color-musgo);
  outline-offset: 3px;
}
.table {
  min-width: 40rem;
  margin-bottom: 0;
}
.av-jugador {
  min-width: 10rem;
  max-width: 18rem;
  overflow-wrap: anywhere;
}
.av-ayuda-tabla { display: none; }
.av-encabezado {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  align-items: center;
  gap: 1rem;
}
.av-acciones {
  display: flex;
  gap: 0.5rem;
  margin-left: auto;
}
.av-paginacion {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}
.av-tu-posicion {
  padding-top: 1.25rem;
  border-top: 2px solid var(--color-salvia);
}
.table th, .table td { vertical-align: middle; }
.av-puesto { white-space: nowrap; font-weight: 700; }
.av-puntos { color: var(--color-madera); font-weight: 800; }
.table tbody tr.av-mi-fila {
  background-color: #e7f1df;
  box-shadow: inset 4px 0 var(--color-musgo);
}
.table tbody tr.av-mi-fila th,
.table tbody tr.av-mi-fila td { color: var(--color-texto); }
@media (max-width: 768px) {
  .av-ranking { padding: 1rem; }
}
@media (max-width: 1200px) {
  .av-ayuda-tabla { display: block; }
}
</style>