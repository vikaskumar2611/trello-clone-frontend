import axios from "axios";
import toast from "react-hot-toast";

const axiosInstance = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
    withCredentials: true,
    headers: { "Content-Type": "application/json" },
});

// Response interceptor - handle errors globally
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        const message = error.response?.data?.message || "Something went wrong";
        // Don't toast on 404 - let components handle that
        if (error.response?.status !== 404) {
            toast.error(message);
        }
        return Promise.reject(error);
    },
);

export default axiosInstance;
