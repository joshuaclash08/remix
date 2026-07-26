import { STORES } from '@/lib/data/storeMenuConfig';
import type { Store, StoreInfo } from '@/lib/types';

export class StoreService {
  /**
   * Get all stores sorted by distance (proximity locator).
   */
  public getNearbyStores(): Store[] {
    return [...STORES].sort((a, b) => a.distanceM - b.distanceM);
  }

  /**
   * Find store by store ID.
   */
  public getStoreById(storeId: string): Store | null {
    return STORES.find((s) => s.id === storeId) || null;
  }

  /**
   * Parse NFC or QR tag parameter to resolve store & table info.
   */
  public parseTagUrl(storeParam: string | null, tableParam: string | null): StoreInfo | null {
    if (!storeParam) return null;
    const store = this.getStoreById(storeParam);
    if (!store) return null;

    return {
      id: store.id,
      name: store.name,
      table: tableParam || store.table,
      nfcTagId: store.nfcTagId,
    };
  }

  /**
   * Search stores by query (name or address).
   */
  public searchStores(query: string): Store[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.getNearbyStores();

    return STORES.filter(
      (s) => s.name.toLowerCase().includes(q) || s.address.toLowerCase().includes(q)
    );
  }
}

export const storeService = new StoreService();
