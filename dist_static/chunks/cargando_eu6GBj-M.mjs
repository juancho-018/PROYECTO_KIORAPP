import Swal from 'sweetalert2';
import { jsxs, jsx } from 'react/jsx-runtime';
import 'react';

function errorMessageFromResponseBody(responseData, status) {
  if (responseData == null) {
    return `Error ${status}`;
  }
  if (typeof responseData === "string") {
    return responseData || `Error ${status}`;
  }
  if (typeof responseData !== "object") {
    return `Error ${status}`;
  }
  const d = responseData;
  if (typeof d.error === "string" && d.error) return d.error;
  if (typeof d.message === "string" && d.message) return d.message;
  if (Array.isArray(d.errors)) {
    const parts = d.errors.map((e) => {
      if (typeof e === "string") return e;
      if (e && typeof e === "object" && "message" in e) {
        return String(e.message);
      }
      return "";
    }).filter(Boolean);
    if (parts.length) return parts.join(", ");
  }
  return `Error ${status}`;
}
class FetchHttpClient {
  baseURL;
  constructor(baseURL = "") {
    this.baseURL = baseURL;
  }
  async request(endpoint, options) {
    const url = `${this.baseURL}${endpoint}`;
    try {
      const response = await fetch(url, options);
      const isJson = response.headers.get("content-type")?.includes("application/json");
      const responseData = isJson ? await response.json() : null;
      if (!response.ok) {
        return {
          data: null,
          error: errorMessageFromResponseBody(responseData, response.status),
          status: response.status,
          ok: false
        };
      }
      return {
        data: responseData,
        error: null,
        status: response.status,
        ok: true
      };
    } catch (error) {
      const err = error;
      return {
        data: null,
        error: err.message || "Error de conexión",
        status: 0,
        ok: false
      };
    }
  }
  async get(url, headers) {
    return this.request(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        ...headers
      }
    });
  }
  async post(url, body, options = {}) {
    const { headers, ...rest } = options;
    return this.request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: body ? JSON.stringify(body) : void 0,
      ...rest
    });
  }
  async patch(url, body, options = {}) {
    const { headers, ...rest } = options;
    return this.request(url, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: body ? JSON.stringify(body) : void 0,
      ...rest
    });
  }
  async put(url, body, options = {}) {
    const { headers, ...rest } = options;
    return this.request(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      body: body ? JSON.stringify(body) : void 0,
      ...rest
    });
  }
  async delete(url, options = {}) {
    const { headers, ...rest } = options;
    return this.request(url, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        ...headers
      },
      ...rest
    });
  }
}

class SweetAlertService {
  showSuccess(title, text = "") {
    Swal.fire({ icon: "success", title, text, confirmButtonColor: "#ec131e" });
  }
  showError(title, text = "") {
    Swal.fire({ icon: "error", title, text, confirmButtonColor: "#ec131e" });
  }
  showInfo(title, text = "") {
    Swal.fire({ icon: "info", title, text, confirmButtonColor: "#ec131e" });
  }
  showWarning(title, text = "") {
    Swal.fire({ icon: "warning", title, text, confirmButtonColor: "#ec131e" });
  }
  showToast(icon, title, timer = 3e3) {
    Swal.fire({
      toast: true,
      position: "top-end",
      icon,
      title,
      showConfirmButton: false,
      timer,
      timerProgressBar: true
    });
  }
  async showConfirm(title, text, confirmText, cancelText) {
    const result = await Swal.fire({
      title,
      text,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ec131e",
      cancelButtonColor: "#64748b",
      confirmButtonText: confirmText,
      cancelButtonText: cancelText
    });
    return result.isConfirmed;
  }
  async showExpiringSession(title, text) {
    await Swal.fire({
      icon: "warning",
      title,
      text,
      confirmButtonColor: "#ec131e",
      allowOutsideClick: false
    });
  }
}

class AuthService {
  constructor(httpClient) {
    this.httpClient = httpClient;
  }
  async login(credentials) {
    const response = await this.httpClient.post("/auth/login", credentials, {
      credentials: "include"
      // needed for HttpOnly cookies or CORS
    });
    if (!response.ok || !response.data) {
      throw new Error(response.error ?? "Error desconocido al iniciar sesión");
    }
    this.saveSession(response.data.token, response.data.usuario);
    return response.data;
  }
  async refreshToken() {
    const response = await this.httpClient.post("/auth/refresh", void 0, {
      credentials: "include"
    });
    if (response.ok && response.data?.token) {
      this.saveSession(response.data.token, this.getUser());
      return response.data.token;
    }
    return null;
  }
  async logout() {
    try {
      await this.httpClient.post("/auth/logout", void 0, {
        headers: { Authorization: `Bearer ${this.getToken()}` }
      });
    } catch (e) {
      console.error("Error al cerrar sesión en el servidor:", e);
    }
    this.clearSession();
    window.location.href = "/login";
  }
  saveSession(token, user) {
    if (user) {
      localStorage.setItem("kiora_token", token);
      localStorage.setItem("kiora_user", typeof user === "string" ? user : JSON.stringify(user));
    }
  }
  clearSession() {
    localStorage.removeItem("kiora_token");
    localStorage.removeItem("kiora_user");
  }
  getToken() {
    return localStorage.getItem("kiora_token");
  }
  getUser() {
    const userStr = localStorage.getItem("kiora_user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      this.clearSession();
      return null;
    }
  }
  isAuthenticated() {
    return !!this.getToken();
  }
  // ── Password Recovery (HU05) ────────────────────────────────────────────────
  async forgotPassword(email) {
    const response = await this.httpClient.post("/auth/forgot-password", {
      correo_usu: email
    });
    if (!response.ok) {
      throw new Error(response.error ?? "Error al solicitar el código de recuperación");
    }
  }
  async verifyResetCode(email, code) {
    const response = await this.httpClient.post("/auth/verify-reset-code", {
      correo_usu: email,
      code
    });
    if (!response.ok) {
      throw new Error(response.error ?? "Código inválido o expirado");
    }
  }
  async resetPassword(email, code, newPassword) {
    const response = await this.httpClient.post("/auth/reset-password", {
      correo_usu: email,
      code,
      new_password: newPassword
    });
    if (!response.ok) {
      throw new Error(response.error ?? "Error al restablecer la contraseña");
    }
  }
}

const API_URL = "/api";
const httpClient = new FetchHttpClient(API_URL);
const authService = new AuthService(httpClient);
const alertService = new SweetAlertService();

const Loading = ({ message = "Cargando..." }) => /* @__PURE__ */ jsxs("div", { className: "absolute inset-0 z-50 overflow-hidden flex flex-col items-center justify-center bg-white/80 backdrop-blur-sm", children: [
  /* @__PURE__ */ jsx("div", { className: "w-10 h-10 border-4 border-gray-200 border-t-[#ec131e] rounded-full animate-spin mb-3" }),
  /* @__PURE__ */ jsx("p", { className: "weglot-dynamic text-sm font-semibold text-[#334155]", children: message })
] });

export { Loading as L, alertService as a, authService as b };
