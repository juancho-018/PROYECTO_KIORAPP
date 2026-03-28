import { FetchHttpClient } from "../core/http/HttpClient";
import { SweetAlertService } from "../core/ui/AlertService";
import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";

// Utilizamos la variable entorno o el fallback
export const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3001/api";

// Instancias únicas (Singleton Pattern)
export const httpClient = new FetchHttpClient(API_URL);
export const authService = new AuthService(httpClient);
export const userService = new UserService(httpClient, authService);
export const alertService = new SweetAlertService();
