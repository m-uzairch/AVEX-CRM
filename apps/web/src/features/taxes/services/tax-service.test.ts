import { describe, it, expect } from 'vitest';
import { TaxService } from './tax-service';

describe('TaxService Calculation Engine', () => {
  it('should correctly calculate exclusive tax amounts', () => {
    const result = TaxService.calculateTaxAndDiscount({
      items: [
        { name: 'Item 1', quantity: 2, unitPrice: 100 }, // $200
        { name: 'Item 2', quantity: 1, unitPrice: 300 }, // $300
      ],
      calculationMethod: 'EXCLUSIVE',
      taxes: [{ name: 'GST', rate: 18, type: 'EXCLUSIVE' }],
    });

    expect(result.rawSubtotal).toBe(500);
    expect(result.taxableAmount).toBe(500);
    expect(result.totalTaxAmount).toBe(90); // 18% of 500 = 90
    expect(result.grandTotal).toBe(590);
  });

  it('should correctly calculate inclusive tax amounts', () => {
    const result = TaxService.calculateTaxAndDiscount({
      items: [
        { name: 'Item A', quantity: 1, unitPrice: 110 },
      ],
      calculationMethod: 'INCLUSIVE',
      taxes: [{ name: 'VAT', rate: 10, type: 'INCLUSIVE' }],
    });

    expect(result.rawSubtotal).toBe(110);
    expect(result.taxableAmount).toBe(110);
    expect(result.totalTaxAmount).toBe(10); // 110 - (110 / 1.10) = 10
    expect(result.grandTotal).toBe(110);
  });

  it('should correctly combine line item discounts, order level discounts, and tax', () => {
    const result = TaxService.calculateTaxAndDiscount({
      items: [
        { name: 'Item 1', quantity: 2, unitPrice: 100, discountRate: 10 }, // 200 - 20 = 180
      ],
      calculationMethod: 'EXCLUSIVE',
      orderDiscountType: 'FIXED',
      orderDiscountValue: 30, // 180 - 30 = 150 net base
      taxes: [{ name: 'Sales Tax', rate: 10, type: 'EXCLUSIVE' }], // 10% of 150 = 15
    });

    expect(result.rawSubtotal).toBe(200);
    expect(result.itemDiscountsTotal).toBe(20);
    expect(result.subtotalAfterItemDiscounts).toBe(180);
    expect(result.orderDiscountTotal).toBe(30);
    expect(result.taxableAmount).toBe(150);
    expect(result.totalTaxAmount).toBe(15);
    expect(result.grandTotal).toBe(165);
  });
});
