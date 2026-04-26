import axios from "axios";

const api = axios.create({
    baseURL: "https://api.tif.uin-suska.ac.id/setoran-dev/v1",
});

// Interceptor untuk MENEMPELKAN token pada setiap request
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Interceptor untuk MENANGANI token expired (401)
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        if (error.response.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                // Panggil endpoint refresh token dari JSON Postman
                const refreshToken = localStorage.getItem("refresh_token");
                const resp = await axios.post("https://id.tif.uin-suska.ac.id/realms/dev/protocol/openid-connect/token", 
                new URLSearchParams({
                    client_id: 'setoran-mobile-dev',
                    client_secret: 'aqJp3xnXKudgC7RMOshEQP7ZoVKWzoSl',
                    grant_type: 'refresh_token',
                    refresh_token: refreshToken
                }), { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } });

                localStorage.setItem("access_token", resp.data.access_token);
                return api(originalRequest); // Ulangi request yang tadi gagal
            } catch (refreshError) {
                // Jika refresh token juga gagal/habis, paksa user login ulang
                localStorage.clear();
                window.location.href = "/login";
            }
        }
        return Promise.reject(error);
    }
);

export default api;