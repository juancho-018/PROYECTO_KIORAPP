import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { CategoriasSection } from '../../components/panel/CategoriasSection';
import { productService } from '../../config/setup';
import { axe } from 'vitest-axe';

// Mock the services
vi.mock('../../config/setup', () => ({
  productService: {
    getCategories: vi.fn(),
  },
  alertService: {
    showError: vi.fn(),
    showConfirm: vi.fn(),
    showSuccess: vi.fn(),
  },
}));

describe('CategoriasSection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render and load categories', async () => {
    const mockCategories = { 
       data: [{ cod_cat: 1, nom_cat: 'Electrónica' }, { cod_cat: 2, nom_cat: 'Hogar' }] 
    };
    (productService.getCategories as any).mockResolvedValue(mockCategories);

    render(<CategoriasSection />);
    
    expect(screen.getByText(/Categorías de Catálogo/i)).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Electrónica')).toBeInTheDocument();
      expect(screen.getByText('Hogar')).toBeInTheDocument();
    });
  });

  it('should show empty state when no categories exist', async () => {
    (productService.getCategories as any).mockResolvedValue({ data: [] });
    
    render(<CategoriasSection />);
    
    await waitFor(() => {
      expect(screen.getByText(/No hay categorías registradas/i)).toBeInTheDocument();
    });
  });

  it('should pass accessibility audit', async () => {
    (productService.getCategories as any).mockResolvedValue({ data: [] });
    const { container } = render(<CategoriasSection />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
