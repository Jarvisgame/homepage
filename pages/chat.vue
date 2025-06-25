<template>
  <UDashboardPanel>
    <template #body>
      <UContainer>
        <UChatMessages :messages="messages" :status="status">
          <template #content="{ message }">
            <div>{{ message.content }}</div>
          </template>
        </UChatMessages>
        {{ messages }}
      </UContainer>
    </template>

    <template #footer>
      <UContainer>
        <UChatPrompt v-model="input" :error="error" @submit="handleSubmit">
          <UChatPromptSubmit :status="status" @stop="stop" @reload="reload" />
        </UChatPrompt>
      </UContainer>
    </template>
  </UDashboardPanel>
</template>

<script setup lang="ts">
import { useChat } from '@ai-sdk/vue'

const { messages, input, handleSubmit, reload, stop, status, error } = useChat({
  api: '/api/chat',
})

const { data } = await useFetch('/api/notion');

if (error.value) {
  console.error('Error:', error.value);
} else {
  console.log('Notion Data:', data.value);
}

</script>
