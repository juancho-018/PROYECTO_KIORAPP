import { FetchHttpClient } from "../core/http/HttpClient";
import { SweetAlertService } from "../core/ui/AlertService";
import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";
import { ProductService } from "../services/ProductService";
import { InventoryService } from "../services/InventoryService";
import { OrderService } from "../services/OrderService";
import { HealthService } from "../services/HealthService";

// Restauramos a la arquitectura de punto de entrada único (API Gateway)
// NOTA: Se usará el puerto 3000 (Gateway) una vez que el desarrollador del backend
// configure los proxies para categories, invoices, etc.
export const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000/api";

// Base para imágenes (misma raíz que la API pero sin el /api final)
export const IMAGE_BASE_URL = API_URL.replace(/\/api$/, '');

// Cliente único para todo el sistema
export const httpClient = new FetchHttpClient(API_URL);

// Instancias únicas (Singleton Pattern)
export const authService = new AuthService(httpClient);
export const userService = new UserService(httpClient, authService);
export const productService = new ProductService(httpClient, authService);
export const inventoryService = new InventoryService(httpClient, authService);
export const orderService = new OrderService(httpClient, authService);
export const healthService = new HealthService(httpClient);

export const alertService = new SweetAlertService();

