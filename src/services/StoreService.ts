export interface Regional {
  id: number;
  nombre: string;
}

export interface Ciudad {
  id: number;
  nombre: string;
  fk_regional_id: number;
  regional_nombre?: string;
}

export interface Tienda {
  id_tienda: number;
  nombre: string;
  direccion: string;
  telefono: string | null;
  factus_prefix: string;
  activa: boolean;
  estado: string;
  latitud: number | null;
  longitud: number | null;
  creado_en: string;
  fk_ciudad_id: number | null;
  ciudad_nombre?: string;
  regional_id?: number;
  regional_nombre?: string;
}

export class StoreService {
  private baseUrl: string;
  private getToken: () => string | null;

  constructor(baseUrl: string, getToken: () => string | null) {
    this.baseUrl = baseUrl;
    this.getToken = getToken;
  }

  private get headers() {
    return {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.getToken()}`,
    };
  }

  // ── Regionales ─────────────────────────────────────────────────────────────

  async getRegionales(): Promise<Regional[]> {
    const res = await fetch(`${this.baseUrl}/api/stores/regiones`, { headers: this.headers });
    if (!res.ok) throw new Error('Error al cargar regionales');
    const { data } = await res.json();
    return data;
  }

  async createRegional(nombre: string): Promise<Regional> {
    const res = await fetch(`${this.baseUrl}/api/stores/regiones`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ nombre }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al crear regional');
    return json.data;
  }

  async updateRegional(id: number, nombre: string): Promise<Regional> {
    const res = await fetch(`${this.baseUrl}/api/stores/regiones/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify({ nombre }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al actualizar regional');
    return json.data;
  }

  async deleteRegional(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/stores/regiones/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Error al eliminar regional');
    }
  }

  // ── Ciudades ───────────────────────────────────────────────────────────────

  async getCiudades(regionalId?: number): Promise<Ciudad[]> {
    const url = regionalId 
        ? `${this.baseUrl}/api/stores/ciudades?regional_id=${regionalId}`
        : `${this.baseUrl}/api/stores/ciudades`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error('Error al cargar ciudades');
    const { data } = await res.json();
    return data;
  }

  async createCiudad(nombre: string, fk_regional_id: number): Promise<Ciudad> {
    const res = await fetch(`${this.baseUrl}/api/stores/ciudades`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({ nombre, fk_regional_id }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al crear ciudad');
    return json.data;
  }

  async updateCiudad(id: number, payload: { nombre?: string, fk_regional_id?: number }): Promise<Ciudad> {
    const res = await fetch(`${this.baseUrl}/api/stores/ciudades/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al actualizar ciudad');
    return json.data;
  }

  async deleteCiudad(id: number): Promise<void> {
    const res = await fetch(`${this.baseUrl}/api/stores/ciudades/${id}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!res.ok) {
      const json = await res.json();
      throw new Error(json.error || 'Error al eliminar ciudad');
    }
  }

  // ── Tiendas (Centros de Operación) ─────────────────────────────────────────

  async getStores(activas = false): Promise<Tienda[]> {
    const url = activas 
        ? `${this.baseUrl}/api/stores?activas=true`
        : `${this.baseUrl}/api/stores`;
    const res = await fetch(url, { headers: this.headers });
    if (!res.ok) throw new Error('Error al cargar tiendas');
    const { data } = await res.json();
    return data;
  }

  async createStore(payload: Partial<Tienda>): Promise<Tienda> {
    const res = await fetch(`${this.baseUrl}/api/stores`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al crear tienda');
    return json.data;
  }

  async updateStore(id: number, payload: Partial<Tienda>): Promise<Tienda> {
    const res = await fetch(`${this.baseUrl}/api/stores/${id}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'Error al actualizar tienda');
    return json.data;
  }
}
