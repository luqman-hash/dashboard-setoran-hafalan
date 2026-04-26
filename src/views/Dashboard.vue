<template>
  <v-container>
    <v-toolbar color="primary" class="rounded-lg mb-4" elevation="2">
      <v-toolbar-title class="font-weight-bold">Dashboard Dosen Pembimbing Akademik</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn variant="text" prepend-icon="mdi-logout" @click="logout">Keluar</v-btn>
    </v-toolbar>

    <v-row>
      <v-col cols="12" md="4">
        <v-card elevation="3" class="mb-4 rounded-lg">
          <v-card-text class="text-center pt-6">
            <v-avatar size="90" color="primary" class="mb-3 text-h3 font-weight-bold">
              {{ dosenInfo.nama ? dosenInfo.nama.charAt(0) : 'D' }}
            </v-avatar>
            <h3 class="text-h6 font-weight-bold mb-1">{{ dosenInfo.nama || 'Memuat...' }}</h3>
            <div class="text-subtitle-2 text-grey-darken-1">{{ dosenInfo.nip || '-' }}</div>
            <div class="text-caption text-grey">{{ dosenInfo.email || '-' }}</div>
          </v-card-text>
        </v-card>

        <v-card elevation="3" class="rounded-lg">
          <v-card-title class="bg-primary text-white text-subtitle-1">
            <v-icon start icon="mdi-chart-pie" size="small"></v-icon> Statistik Angkatan
          </v-card-title>
          <v-table density="compact">
            <thead>
              <tr>
                <th class="text-left">Tahun Masuk</th>
                <th class="text-center">Total Mahasiswa</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in ringkasanAngkatan" :key="item.tahun">
                <td class="font-weight-bold">{{ item.tahun }}</td>
                <td class="text-center">
                  <v-chip size="small" color="primary" variant="flat">{{ item.total }}</v-chip>
                </td>
              </tr>
            </tbody>
          </v-table>
        </v-card>
      </v-col>

      <v-col cols="12" md="8">
        <v-card elevation="3" class="rounded-lg">
          <v-card-text class="bg-grey-lighten-4 border-bottom">
            <v-row align="center">
              <v-col cols="12" sm="9">
                <v-text-field id="input-cari-nim" v-model="nimCari" label="Cari Mahasiswa (NIM)"
                  prepend-inner-icon="mdi-magnify" variant="outlined" density="compact" hide-details
                  @keyup.enter="cariMahasiswa" placeholder="Contoh: 12250113521"></v-text-field>
              </v-col>
              <v-col cols="12" sm="3">
                <v-btn color="primary" block :loading="loadingCari" @click="cariMahasiswa" :disabled="!nimCari">
                  Cari
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>

          <v-divider></v-divider>

          <v-list lines="two" style="max-height: 710px; overflow-y: auto;">
            <v-list-subheader class="font-weight-bold">Daftar Mahasiswa Bimbingan Anda</v-list-subheader>

            <v-card-text v-if="loading" class="text-center">
              <v-progress-circular indeterminate color="primary"></v-progress-circular>
            </v-card-text>

            <v-list-item v-else v-for="mhs in daftarMahasiswa" :key="mhs.nim" :title="mhs.nama"
              :subtitle="'NIM: ' + mhs.nim" @click="$router.push('/mahasiswa/' + mhs.nim)" link>
              <template v-slot:prepend>
                <v-avatar color="primary" class="text-white">
                  {{ mhs.nama.charAt(0) }}
                </v-avatar>
              </template>
              <template v-slot:append>
                <v-icon icon="mdi-chevron-right" color="grey"></v-icon>
              </template>
            </v-list-item>
          </v-list>
        </v-card>
      </v-col>
    </v-row>

    <v-snackbar v-model="snackbar.show" :color="snackbar.color" timeout="4000" location="bottom right">
      <div class="d-flex align-center">
        <v-icon start :icon="snackbar.color === 'success' ? 'mdi-check-circle' : 'mdi-alert-circle'"
          color="white"></v-icon>
        {{ snackbar.text }}
      </div>
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="snackbar.show = false">Tutup</v-btn>
      </template>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import api from '../services/api';

const router = useRouter();
const loading = ref(false);
const loadingCari = ref(false);
const nimCari = ref('');

// State Data Dosen
const dosenInfo = ref({});
const ringkasanAngkatan = ref([]);
const daftarMahasiswa = ref([]);

// State Snackbar
const snackbar = ref({ show: false, text: '', color: 'error' });

const fetchData = async () => {
  loading.value = true;
  try {
    const response = await api.get('/dosen/pa-saya');
    const dataAPI = response.data.data;

    // Ekstraksi Data dari API
    dosenInfo.value = { nip: dataAPI.nip, nama: dataAPI.nama, email: dataAPI.email };
    ringkasanAngkatan.value = dataAPI.info_mahasiswa_pa.ringkasan;
    daftarMahasiswa.value = dataAPI.info_mahasiswa_pa.daftar_mahasiswa;
  } catch (error) {
    if (error.response?.status === 401) {
      logout();
    }
    snackbar.value = { show: true, text: "Gagal mengambil data dosen.", color: 'error' };
  } finally {
    loading.value = false;
  }
};

const cariMahasiswa = async () => {
  if (!nimCari.value) return;
  loadingCari.value = true;
  try {
    await api.get(`/mahasiswa/setoran/${nimCari.value}`);
    router.push(`/mahasiswa/${nimCari.value}`);
  } catch (err) {
    const pesanBackend = err.response?.data?.message || "Terjadi kesalahan pada server.";
    snackbar.value = { show: true, text: pesanBackend, color: 'error' };
  } finally {
    loadingCari.value = false;
  }
};

const logout = () => {
  localStorage.clear();
  router.push('/login');
};

onMounted(fetchData);
</script>