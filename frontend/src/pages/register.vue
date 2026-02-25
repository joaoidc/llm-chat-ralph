<template>
  <div class="register-container">
    <h1>Register</h1>
    <form @submit.prevent="register" class="register-form">
      <input
        v-model="username"
        type="text"
        placeholder="Username"
        required
      />
      <input
        v-model="password"
        type="password"
        placeholder="Password"
        required
      />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Registering...' : 'Register' }}
      </button>
    </form>
    <div v-if="error" class="error">{{ error }}</div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import axios from 'axios';

const username = ref('');
const password = ref('');
const loading = ref(false);
const error = ref('');

const register = async () => {
  if (!username.value.trim() || !password.value.trim()) {
    error.value = 'Username and password are required.';
    return;
  }

  try {
    loading.value = true;
    error.value = '';

    const response = await axios.post('http://localhost:3000/auth/register', { username: username.value, password: password.value });
    alert('Registration successful! Please login.');
    window.location.href = '/login';
  } catch (err) {
    error.value = 'Failed to register. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.register-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.register-form input {
  padding: 0.5rem;
  font-size: 1rem;
}

.register-form button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.error {
  color: #dc3545;
  margin-top: 1rem;
}
</style>
