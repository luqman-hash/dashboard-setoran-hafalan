<template>
  <v-container class="fill-height d-flex align-center justify-center bg-grey-lighten-4">
    <v-card width="400" elevation="10" class="pa-5 rounded-lg">
      <div class="text-center mb-4">
        <v-avatar color="primary" size="64" class="mb-3">
          <v-icon icon="mdi-lock" size="32"></v-icon>
        </v-avatar>
        <h2 class="text-h5 font-weight-bold">Login Dosen PA</h2>
        <p class="text-body-2 text-grey">Sistem Manajemen Setoran Hafalan</p>
      </div>

      <v-form @submit.prevent="handleLogin">
        <v-text-field v-model="form.username" label="Username" prepend-inner-icon="mdi-account" variant="outlined"
          class="mb-2"></v-text-field>

        <v-text-field v-model="form.password" label="Password" :type="showPassword ? 'text' : 'password'"
          prepend-inner-icon="mdi-key" :append-inner-icon="showPassword ? 'mdi-eye-off' : 'mdi-eye'"
          @click:append-inner="showPassword = !showPassword" variant="outlined" class="mb-4"></v-text-field>

        <v-btn type="submit" color="primary" block size="large" :loading="loading">Masuk</v-btn>
      </v-form>
    </v-card>
  </v-container>
</template>

<script setup>
import { reactive, ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';

const router = useRouter();
const loading = ref(false);
const showPassword = ref(false); // State untuk toggle mata
const form = reactive({ username: '', password: '' });

const handleLogin = async () => {
  loading.value = true;
  try {
    const payload = new URLSearchParams({
      client_id: 'setoran-mobile-dev',
      client_secret: 'aqJp3xnXKudgC7RMOshEQP7ZoVKWzoSl',
      grant_type: 'password',
      username: form.username,
      password: form.password,
      scope: 'openid profile email'
    });

    const resp = await axios.post("https://id.tif.uin-suska.ac.id/realms/dev/protocol/openid-connect/token", payload);

    localStorage.setItem("access_token", resp.data.access_token);
    localStorage.setItem("refresh_token", resp.data.refresh_token);

    router.push("/");
  } catch (err) {
    alert("Login Gagal! Cek kembali username atau password Anda.");
  } finally {
    loading.value = false;
  }
};
</script>