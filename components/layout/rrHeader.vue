<template>
  <UHeader>
    <template #title>
      <div>RRTeam</div>
    </template>

    <template #right>
      <UNavigationMenu class="pr-10" :items="items"></UNavigationMenu>

      <UColorModeButton/>

      <UTooltip text="Open on Github" :kbds="['meta', 'G']">
        <UButton
          color="neutral"
          variant="ghost"
          to="https://github.com/Jarvisgame/homepage"
          target="_blank"
          icon="i-simple-icons-github"
          aria-label="GitHub"
        />
      </UTooltip>
    </template>
  </UHeader>
</template>

<script lang="ts" setup>
import type { NavigationMenuItem } from '@nuxt/ui'

const route = useRoute()

const items = computed<NavigationMenuItem[]>(() => [
  {
    label: 'Home',
    to: '/home',
    active: route.path.startsWith('/home')
  },
  {
    label: 'Members',
    to: '/members',
    active: route.path.startsWith('/members')
  }
])

</script>