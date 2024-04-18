<script setup lang="ts">
import { computed, provide } from 'vue'
import { localeContextKey } from '@turbo-design/hooks'
import type { ConfigProviderProps } from './configProvider'

defineOptions({ name: 'TConfigProvider' })

const props = defineProps<ConfigProviderProps>()

provide(localeContextKey, computed(() => props.locale))
</script>

<template>
  <slot v-bind="{ config: props }" />
</template>
