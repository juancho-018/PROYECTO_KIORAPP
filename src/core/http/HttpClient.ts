/**
 * Options for making HTTP requests.
 */
export interface HttpRequestOptions {
  method?: string;
  headers?: Record<string, string>;
  credentials?: RequestCredentials;
}

export interface HttpResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  ok: boolean;
}

/**
 * Interface abstracting the HTTP client (DIP).
 */
export interface IHttpClient {
  get<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  patch<T>(url: string, body?: unknown, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
  delete<T>(url: string, options?: HttpRequestOptions): Promise<HttpResponse<T>>;
}

/**
 * Fetch-based concrete implementation of the HTTP client (SRP).
 */
export class FetchHttpClient implements IHttpClient {
  baseURL: string;

  constructor(baseURL: string = '') {
    this.baseURL = baseURL;
  }

  private async request<T>(endpoint: string, options: RequestInit): Promise<HttpResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, options);
      const isJson = response.headers.get('content-type')?.includes('application/json');
      const responseData = isJson ? await response.json() : null;

      if (!response.ok) {
        return {
          data: null,
          error: responseData?.error || responseData?.message || `Error ${response.status}`,
          status: response.status,
          ok: false,
        };
      }

      return {
        data: responseData as T,
        error: null,
        status: response.status,
        ok: true,
      };
    } catch (error: unknown) {
      const err = error as Error;
      return {
        data: null,
        error: err.message || 'Error de conexión',
        status: 0,
        ok: false,
      };
    }
  }

  async get<T>(url: string, headers?: Record<string, string>): Promise<HttpResponse<T>> {
    return this.request<T>(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });
  }

  async post<T>(url: string, body?: unknown, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    const { headers, ...rest } = options;
    return this.request<T>(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
  }

  async patch<T>(url: string, body?: unknown, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    const { headers, ...rest } = options;
    return this.request<T>(url, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      ...rest,
    });
  }

  async delete<T>(url: string, options: HttpRequestOptions = {}): Promise<HttpResponse<T>> {
    const { headers, ...rest } = options;
    return this.request<T>(url, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
      ...rest,
    });
  }
}
