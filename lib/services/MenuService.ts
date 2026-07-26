import { getStoreMenu, mapBurgerToProduct, CATEGORIES } from '@/lib/data/storeMenuConfig';
import { MOCK_PRODUCTS } from '@/lib/mockData';
import type { MenuSection, Product, MenuFilterOptions } from '@/lib/types';

export class MenuService {
  /**
   * Get store menu sections for a specific store and category.
   */
  public getMenuSections(storeId: string, categoryId: string = 'burgers'): MenuSection[] {
    return getStoreMenu(storeId, categoryId);
  }

  /**
   * Get available categories list.
   */
  public getCategories() {
    return CATEGORIES;
  }

  /**
   * Get all products mapped from store menu items & mock products.
   */
  public getAllProducts(storeId: string = 'mcd-gangnam'): Product[] {
    const sections = getStoreMenu(storeId, 'burgers');
    const burgerProducts: Product[] = [];

    sections.forEach((sec) => {
      sec.items.forEach((item) => {
        burgerProducts.push(mapBurgerToProduct(item));
      });
    });

    // Combine with coffee/beverage/dessert mock products
    const existingIds = new Set(burgerProducts.map((p) => p.id));
    const uniqueMockProducts = MOCK_PRODUCTS.filter((p) => !existingIds.has(p.id));

    return [...burgerProducts, ...uniqueMockProducts];
  }

  /**
   * Advanced product search & allergen filtering service.
   */
  public filterProducts(storeId: string, options: MenuFilterOptions): Product[] {
    let products = this.getAllProducts(storeId);

    if (options.searchQuery) {
      const q = options.searchQuery.trim().toLowerCase();
      products = products.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.englishName.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q)
      );
    }

    if (options.excludeAllergens && options.excludeAllergens.length > 0) {
      products = products.filter((p) => {
        if (!p.allergies) return true;
        return !p.allergies.some((allergy) =>
          options.excludeAllergens!.some((ex) => allergy.includes(ex))
        );
      });
    }

    return products;
  }

  /**
   * Search for product by name or keyword.
   */
  public findProductByName(query: string, storeId: string = 'mcd-gangnam'): Product | null {
    const q = query.trim().toLowerCase();
    const products = this.getAllProducts(storeId);

    return (
      products.find(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.englishName.toLowerCase().includes(q) ||
          q.includes(p.name.toLowerCase())
      ) || null
    );
  }
}

export const menuService = new MenuService();
