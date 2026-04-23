import { FetchHttpClient } from "../core/http/HttpClient";
import { SweetAlertService } from "../core/ui/AlertService";
import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";
import { ProductService } from "../services/ProductService";
import { InventoryService } from "../services/InventoryService";
import { OrderService } from "../services/OrderService";
import { HealthService } from "../services/HealthService";
import { MaintenanceService } from "../services/MaintenanceService";
import { NotificationService } from "../services/NotificationService";
import { IncidentService } from "../services/IncidentService";
import { ReportService } from "../services/ReportService";

// Punto de entrada único (API Gateway)
export const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3000/api";

// Base para imágenes
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
export const maintenanceService = new MaintenanceService(httpClient, authService);
export const incidentService = new IncidentService(httpClient, authService);
export const reportService = new ReportService(httpClient, authService);
export const notificationService = new NotificationService();

// AlertService requiere NotificationService para integraciones
export const alertService = new SweetAlertService(notificationService);
