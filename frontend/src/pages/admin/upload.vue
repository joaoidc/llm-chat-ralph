<template>
  <div class="upload-container" v-if="isAdmin">
    <h1>Upload Document</h1>
    <form @submit.prevent="uploadDocument" class="upload-form">
      <textarea
        v-model="documentText"
        placeholder="Enter or paste your document text here..."
        required
        rows="10"
        cols="50"
      ></textarea>
      <br />
      <button type="submit" :disabled="loading">
        {{ loading ? 'Uploading...' : 'Upload' }}
      </button>
    </form>
    <div v-if="successMessage" class="success-message">{{ successMessage }}</div>
    <div v-if="errorMessage" class="error-message">{{ errorMessage }}</div>
  </div>
  <div v-else>
    <p>You are not authorized to access this page.</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

const documentText = ref('');
const loading = ref(false);
const successMessage = ref('');
const errorMessage = ref('');
const isAdmin = ref(false);

onMounted(() => {
  const token = localStorage.getItem('token');
  if (token) {
    axios.get('http://localhost:3000/auth/me', {
      headers: { Authorization: `Bearer ${token}` }
    }).then(response => {
      isAdmin.value = response.data.role === 'admin';
    }).catch(() => {
      isAdmin.value = false;
    });
  } else {
    isAdmin.value = false;
  }
});

const uploadDocument = async () => {
  if (!documentText.value.trim()) {
    errorMessage.value = 'Document text cannot be empty.';
    return;
  }

  try {
    loading.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    const token = localStorage.getItem('token');
    const response = await axios.post('http://localhost:3000/documents', { text: documentText.value }, {
      headers: { Authorization: `Bearer ${token}` }
    });
    successMessage.value = 'Document uploaded successfully!';
    documentText.value = '';
  } catch (err) {
    errorMessage.value = 'Failed to upload document. Please try again.';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.upload-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
}

.upload-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.upload-form textarea {
  padding: 0.5rem;
  font-size: 1rem;
  resize: vertical;
}

.upload-form button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  cursor: pointer;
}

.success-message {
  color: #28a745;
  margin-top: 1rem;
}

.error-message {
  color: #dc3545;
  margin-top: 1rem;
}
</style>
