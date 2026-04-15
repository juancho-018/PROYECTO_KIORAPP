import { FetchHttpClient } from "../core/http/HttpClient";
import { SweetAlertService } from "../core/ui/AlertService";
import { AuthService } from "../services/AuthService";
import { UserService } from "../services/UserService";
import { ProductService } from "../services/ProductService";
import { InventoryService } from "../services/InventoryService";
import { OrderService } from "../services/OrderService";
import { MaintenanceService } from "../services/MaintenanceService";

// Utilizamos la variable entorno o el fallback
export const API_URL = import.meta.env.PUBLIC_API_URL || "http://localhost:3001/api";

// Instancias únicas (Singleton Pattern)
export const httpClient = new FetchHttpClient(API_URL);
export const authService = new AuthService(httpClient);
export const userService = new UserService(httpClient, authService);
export const productService = new ProductService(httpClient, authService);
export const inventoryService = new InventoryService(httpClient, authService);
export const orderService = new OrderService(httpClient, authService);
export const maintenanceService = new MaintenanceService(httpClient, authService);
export const alertService = new SweetAlertService();
