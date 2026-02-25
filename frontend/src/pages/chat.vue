<template>
  <div class="chat-container" v-if="isLoggedIn">
    <h1>Chat with AI</h1>
    <div class="messages" v-if="messages.length > 0">
      <div v-for="(message, index) in messages" :key="index" class="message">
        <div class="user">You: {{ message.question }}</div>
        <div class="bot">Bot: {{ message.answer }}</div>
      </div>
    </div>
    <form @submit.prevent="sendMessage" class="input-form">
      <input
        v-model="question"
        type="text"
        placeholder="Type your question here..."
        required
      />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Sending...' : 'Send' }}
      </button>
    </form>
    <div v-if="loading" class="loading">Loading response...</div>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
  <div v-else>
    <p>Please <router-link to="/login">login</router-link> to chat.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const question = ref('');
const answer = ref('');
const loading = ref(false);
const error = ref('');
const messages = ref<Array<{ question: string; answer: string }>>([]);
const isLoggedIn = ref(false);

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    isLoggedIn.value = true;
  } else {
    isLoggedIn.value = false;
  }
});

const sendMessage = async () => {
  if (!question.value.trim()) return;

  try {
    loading.value = true;
    error.value = '';

    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:3000/chat', { question: question.value }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    const newAnswer = response.data.answer;

    messages.value.push({ question: question.value, answer: newAnswer });
    question.value = '';
  } catch (err) {
    error.value = 'Failed to get response from the AI. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.chat-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.messages {
  margin-bottom: 1rem;
  height: 300px;
  overflow-y: auto;
  border: 1px solid #eee;
  padding: 1rem;
  border-radius: 4px;
}

.message {
  margin-bottom: 1rem;
}

.user {
  font-weight: bold;
  color: #333;
}

.bot {
  color: #555;
}

.input-form {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.input-form input {
  flex: 1;
  padding: 0.5rem;
  font-size: 1rem;
}

.input-form button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.loading {
  color: #007bff;
  margin-top: 1rem;
}

.error {
  color: #dc3545;
  margin-top: 1rem;
}
</style>
