<script setup>
import { computed, ref } from 'vue';

const props = defineProps({
  jugador: { type: Object, required: true },
});

const nombreCompleto = computed(() =>
  [props.jugador.nombre, props.jugador.apellido].filter(Boolean).join(' ')
);
const inicial = computed(() => nombreCompleto.value.charAt(0));
const perfil = ref(null);
const disparador = ref(null);

function cerrarAlSalir(evento) {
  if (!perfil.value.contains(evento.relatedTarget)) perfil.value.open = false;
}

function cerrarConEscape() {
  if (!perfil.value.open) return;
  perfil.value.open = false;
  disparador.value.focus();
}
</script>

<template>
  <details ref="perfil" class="av-perfil" @focusout="cerrarAlSalir" @keydown.esc="cerrarConEscape">
    <summary ref="disparador" class="av-perfil-disparador" :aria-label="`Datos del jugador: ${nombreCompleto}`">
      <span class="av-avatar av-avatar-disparador" aria-hidden="true">{{ inicial }}</span>
      <span class="av-nombre">{{ jugador.nombre || 'Mi perfil' }}</span>
    </summary>

    <div class="box av-ficha" tabindex="-1">
      <span class="av-avatar" aria-hidden="true">{{ inicial }}</span>
      <div class="av-datos">
        <p class="title is-5 mb-2">{{ nombreCompleto }}</p>
        <p class="mb-3">{{ jugador.email }}</p>
        <span class="tag is-primary is-light">Rol: {{ jugador.role }}</span>
      </div>
    </div>
  </details>
</template>

<style scoped>
.av-perfil {
  position: relative;
  min-width: 0;
}

.av-perfil-disparador {
  display: flex;
  align-items: center;
  gap: 0.35rem;
  list-style: none;
  color: var(--color-crema);
  cursor: pointer;
  padding: 0.35rem;
}

.av-perfil-disparador::-webkit-details-marker {
  display: none;
}

.av-perfil-disparador::after {
  content: '';
  width: 0.35rem;
  height: 0.35rem;
  border-right: 1px solid currentColor;
  border-bottom: 1px solid currentColor;
  transform: translateY(-0.1rem) rotate(45deg);
}

.av-nombre {
  display: inline-block;
  max-width: min(10rem, 28vw);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.av-ficha {
  position: absolute;
  z-index: 2;
  top: calc(100% + 0.5rem);
  right: 0;
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: min(18rem, calc(100vw - 1rem));
  cursor: auto;
}

.av-datos {
  min-width: 0;
  overflow-wrap: anywhere;
}

.av-avatar {
  display: grid;
  flex: 0 0 auto;
  place-items: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 2px solid var(--color-dorado);
  border-radius: 50%;
  background-color: var(--color-musgo);
  color: white;
  font-family: var(--fuente-titulos);
  font-size: 1.25rem;
}

.av-avatar-disparador {
  width: 1.75rem;
  height: 1.75rem;
  font-size: 0.95rem;
}

@media (max-width: 768px) {
  .av-perfil {
    position: static;
  }
}
</style>