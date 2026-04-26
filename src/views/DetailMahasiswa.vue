<template>
  <v-container>
    <v-btn variant="text" prepend-icon="mdi-arrow-left" @click="$router.push('/')" class="mb-4">
      Kembali ke Dashboard
    </v-btn>

    <v-row v-if="loading" justify="center" align="center" style="height: 400px;">
      <v-progress-circular indeterminate color="primary" size="64"></v-progress-circular>
    </v-row>

    <v-alert v-else-if="errorFatal" type="error" variant="tonal" class="mb-4">
      {{ errorFatal }}
    </v-alert>

    <div v-else-if="detail">
      <v-row>
        <v-col cols="12" md="4">
          <v-card elevation="3" class="mb-4 rounded-lg">
            <v-card-item class="bg-primary text-white">
              <v-card-title>Profil Mahasiswa</v-card-title>
            </v-card-item>

            <v-card-text class="pt-4">
              <v-avatar size="80" color="primary" class="mb-4 text-h4">
                {{ detail.info.nama.charAt(0) }}
              </v-avatar>
              <div class="text-h6 font-weight-bold">{{ detail.info.nama }}</div>
              <div class="text-subtitle-1 text-grey-darken-1">{{ detail.info.nim }}</div>
              <v-divider class="my-4"></v-divider>

              <div class="d-flex justify-space-between mb-1">
                <span class="text-body-2">Progres Hafalan</span>
                <span class="text-body-2 font-weight-bold">{{ detail.setoran.info_dasar.persentase_progres_setor
                  }}%</span>
              </div>
              <v-progress-linear :model-value="detail.setoran.info_dasar.persentase_progres_setor" color="success"
                height="15" rounded striped></v-progress-linear>
              <div class="mt-2 text-caption text-right">
                {{ detail.setoran.info_dasar.total_sudah_setor }} / {{ detail.setoran.info_dasar.total_wajib_setor }}
                Surah
              </div>
            </v-card-text>
          </v-card>

          <v-card elevation="2" class="rounded-lg">
            <v-list density="comfortable">
              <v-list-item prepend-icon="mdi-email" :title="detail.info.email" subtitle="Email"></v-list-item>
              <v-list-item prepend-icon="mdi-school" :title="'Angkatan ' + detail.info.angkatan"
                subtitle="Tahun Masuk"></v-list-item>
              <v-list-item prepend-icon="mdi-account-tie" :title="detail.info.dosen_pa.nama"
                subtitle="Dosen PA"></v-list-item>
            </v-list>
          </v-card>
        </v-col>

        <v-col cols="12" md="8">
          <v-card elevation="3" class="rounded-lg">
            <v-card-title class="pa-4 d-flex align-center">
              <v-icon start icon="mdi-book-open-variant" color="primary"></v-icon>
              Daftar Surah Muroja'ah
              <v-spacer></v-spacer>

              <v-btn color="primary" prepend-icon="mdi-plus" @click="dialogTambah = true" class="mr-4">
                Tambah Setoran
              </v-btn>

              <v-text-field id="input-cari-surah" v-model="search" append-inner-icon="mdi-magnify" label="Cari Surah"
                single-line hide-details density="compact" max-width="200"></v-text-field>
            </v-card-title>

            <v-divider></v-divider>

            <v-table fixed-header height="740px">
              <thead>
                <tr>
                  <th class="text-left" width="50">No</th>
                  <th class="text-left">Surah</th>
                  <th class="text-center">Persyaratan</th>
                  <th class="text-center">Status</th>
                  <th class="text-left">Tanggal</th>
                  <th class="text-center">Aksi</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(surah, index) in filteredSurah" :key="surah.id">
                  <td>{{ surah.external_id }}</td>
                  <td>
                    <div class="font-weight-bold">{{ surah.nama }}</div>
                    <div class="text-caption text-grey">{{ surah.nama_arab }}</div>
                  </td>
                  <td class="text-center">
                    <v-chip size="small" :color="warnaLabel(surah.label)" variant="tonal">
                      {{ formatLabel(surah.label) }}
                    </v-chip>
                  </td>
                  <td class="text-center">
                    <v-chip :color="surah.sudah_setor ? 'success' : 'error'"
                      :prepend-icon="surah.sudah_setor ? 'mdi-check-circle' : 'mdi-close-circle'" size="small"
                      variant="flat">
                      {{ surah.sudah_setor ? 'Sudah' : 'Belum' }}
                    </v-chip>
                  </td>
                  <td class="text-caption">
                    {{ surah.info_setoran ? surah.info_setoran.tgl_setoran : '-' }}
                  </td>
                  <td class="text-center">
                    <v-btn v-if="surah.sudah_setor" icon="mdi-delete" size="small" variant="text" color="error"
                      @click="confirmHapus(surah)" title="Batalkan Setoran"></v-btn>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </v-col>
      </v-row>
    </div>

    <v-dialog v-model="dialogTambah" max-width="500px">
      <v-card>
        <v-card-title class="bg-primary text-white">Tambah Setoran Hafalan</v-card-title>
        <v-card-text class="pt-4">
          <v-select id="select-surah" v-model="surahTerpilih" :items="listSurahBelumSetor" item-title="nama"
            item-value="id" label="Pilih Surah (Bisa lebih dari satu)" return-object multiple chips closable-chips
            variant="outlined"></v-select>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialogTambah = false">Batal</v-btn>
          <v-btn color="primary" variant="elevated" :disabled="surahTerpilih.length === 0"
            @click="eksekusiTambah">Simpan Setoran</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

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
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import api from '../services/api';

const route = useRoute();
const detail = ref(null);
const loading = ref(false);
const errorFatal = ref('');
const search = ref('');

const dialogTambah = ref(false);
const surahTerpilih = ref([]);

// State Snackbar Notifikasi
const snackbar = ref({ show: false, text: '', color: 'success' });

const tampilkanNotif = (pesan, warna) => {
  snackbar.value = { show: true, text: pesan, color: warna };
};

// --- FUNGSI FORMAT LABEL ---
const formatLabel = (label) => {
  const mapTeks = {
    'KP': 'Kerja Praktik',
    'SEMKP': 'Seminar Kerja Praktik',
    'DAFTAR_TA': 'Tugas Akhir',
    'SEMPRO': 'Seminar Proposal',
    'SIDANG_TA': 'Sidang Tugas Akhir'
  };
  return mapTeks[label] || label;
};

const warnaLabel = (label) => {
  const mapWarna = {
    'KP': 'pink',
    'SEMKP': 'blue',
    'DAFTAR_TA': 'green',
    'SEMPRO': 'orange',
    'SIDANG_TA': 'deep-orange'
  };
  return mapWarna[label] || 'grey';
};

// --- AMBIL DATA ---
const fetchDetail = async () => {
  loading.value = true;
  errorFatal.value = '';
  try {
    const response = await api.get(`/mahasiswa/setoran/${route.params.nim}`);
    detail.value = response.data.data;
  } catch (error) {
    errorFatal.value = error.response?.data?.message || "Gagal mengambil data mahasiswa.";
  } finally {
    loading.value = false;
  }
};

// --- PENCARIAN & FILTER ---
const filteredSurah = computed(() => {
  if (!detail.value) return [];
  return detail.value.setoran.detail.filter(surah =>
    surah.nama.toLowerCase().includes(search.value.toLowerCase())
  );
});

const listSurahBelumSetor = computed(() => {
  if (!detail.value) return [];
  return detail.value.setoran.detail.filter(s => !s.sudah_setor);
});

// --- POST TAMBAH (MULTIPLE) ---
const eksekusiTambah = async () => {
  try {
    const payload = {
      data_setoran: surahTerpilih.value.map(surah => ({
        nama_komponen_setoran: surah.nama,
        id_komponen_setoran: surah.id
      })),
      tgl_setoran: new Date().toISOString().split('T')[0]
    };

    const response = await api.post(`/mahasiswa/setoran/${route.params.nim}`, payload);

    dialogTambah.value = false;
    surahTerpilih.value = [];
    fetchDetail();

    tampilkanNotif(response.data.message, 'success');
  } catch (err) {
    const pesanGagal = err.response?.data?.message || "Terjadi kesalahan.";
    tampilkanNotif(pesanGagal, 'error');
  }
};

// --- DELETE HAPUS ---
const confirmHapus = async (surah) => {
  if (confirm(`Apakah Anda yakin ingin membatalkan setoran surah ${surah.nama}?`)) {
    try {
      const payload = {
        data_setoran: [{
          id: surah.info_setoran.id,
          id_komponen_setoran: surah.id,
          nama_komponen_setoran: surah.nama
        }]
      };

      const response = await api.delete(`/mahasiswa/setoran/${route.params.nim}`, { data: payload });
      fetchDetail();

      tampilkanNotif(response.data.message, 'success');
    } catch (err) {
      const pesanGagal = err.response?.data?.message || "Terjadi kesalahan.";
      tampilkanNotif(pesanGagal, 'error');
    }
  }
};

onMounted(fetchDetail);
</script>