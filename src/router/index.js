import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from '../views/Dashboard.vue';
import DetailMahasiswa from '../views/DetailMahasiswa.vue';
import Login from '../views/Login.vue';

const routes = [
  { path: '/login', component: Login },
  { path: '/', component: Dashboard },
  { path: '/mahasiswa/:nim', component: DetailMahasiswa },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;