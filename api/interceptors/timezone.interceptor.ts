import { AxiosInstance } from "axios";

export function setupTimezoneInterceptor(apiClient: AxiosInstance) {
    apiClient.interceptors.request.use((config) => {
        const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        console.log('🌍 X-Timezone:', timezone); 
        config.headers["X-Timezone"] = timezone
        return config
    })
}