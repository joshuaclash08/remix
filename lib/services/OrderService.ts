import type { CartItem, StoreInfo, OrderReceipt, OrderType } from '@/lib/types';

export class OrderService {
  /**
   * Calculate cart order financial breakdown (subtotal, tax, total).
   */
  public calculateOrderTotal(items: CartItem[]): { subtotal: number; tax: number; total: number } {
    const subtotal = items.reduce((sum, item) => sum + item.totalItemPrice * item.quantity, 0);
    const tax = Math.round(subtotal * 0.1); // 10% VAT included breakdown
    return {
      subtotal,
      tax,
      total: subtotal,
    };
  }

  /**
   * Mock backend order submission with simulated network delay.
   */
  public async submitOrder(
    storeInfo: StoreInfo,
    orderType: OrderType,
    items: CartItem[]
  ): Promise<OrderReceipt> {
    // Simulate backend network latency (1.2 seconds)
    await new Promise((res) => setTimeout(res, 1200));

    const randomNum = Math.floor(100 + Math.random() * 900);
    const orderNumber = `B-${randomNum}`;
    const orderId = `ORD-${Date.now()}-${randomNum}`;
    const { subtotal, tax, total } = this.calculateOrderTotal(items);

    const receipt: OrderReceipt = {
      orderId,
      orderNumber,
      storeInfo,
      orderType,
      items: [...items],
      subtotal,
      tax,
      totalPrice: total,
      createdAt: new Date().toISOString(),
      status: 'completed',
    };

    // Save to order history (sessionStorage)
    this.saveOrderToHistory(receipt);

    return receipt;
  }

  /**
   * Persist order receipt into local history.
   */
  private saveOrderToHistory(receipt: OrderReceipt): void {
    if (typeof window === 'undefined') return;
    try {
      const existing = JSON.parse(sessionStorage.getItem('bf_order_history') || '[]');
      existing.unshift(receipt);
      sessionStorage.setItem('bf_order_history', JSON.stringify(existing.slice(0, 10)));
    } catch (e) {
      console.warn('Failed to save order history', e);
    }
  }

  /**
   * Get order history receipts.
   */
  public getOrderHistory(): OrderReceipt[] {
    if (typeof window === 'undefined') return [];
    try {
      return JSON.parse(sessionStorage.getItem('bf_order_history') || '[]');
    } catch {
      return [];
    }
  }
}

export const orderService = new OrderService();
