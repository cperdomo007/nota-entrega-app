import { describe, expect, it } from "vitest";

// Test utilities for calculations
function calculateLineTotal(quantity: number, unitPrice: number): number {
  return quantity * unitPrice;
}

function calculateSubtotal(lines: Array<{ lineTotal: number }>): number {
  return lines.reduce((sum, line) => sum + line.lineTotal, 0);
}

function calculateIVA(subtotal: number, ivaRate: number = 16): number {
  return (subtotal * ivaRate) / 100;
}

function calculateTotal(subtotal: number, ivaAmount: number): number {
  return subtotal + ivaAmount;
}

describe("Note Calculations", () => {
  describe("calculateLineTotal", () => {
    it("should calculate line total correctly", () => {
      const result = calculateLineTotal(5, 100);
      expect(result).toBe(500);
    });

    it("should handle decimal quantities", () => {
      const result = calculateLineTotal(2.5, 50);
      expect(result).toBe(125);
    });

    it("should handle zero quantity", () => {
      const result = calculateLineTotal(0, 100);
      expect(result).toBe(0);
    });

    it("should handle decimal prices", () => {
      const result = calculateLineTotal(3, 99.99);
      expect(result).toBeCloseTo(299.97, 2);
    });
  });

  describe("calculateSubtotal", () => {
    it("should sum all line totals", () => {
      const lines = [
        { lineTotal: 100 },
        { lineTotal: 200 },
        { lineTotal: 300 },
      ];
      const result = calculateSubtotal(lines);
      expect(result).toBe(600);
    });

    it("should handle empty lines array", () => {
      const result = calculateSubtotal([]);
      expect(result).toBe(0);
    });

    it("should handle decimal totals", () => {
      const lines = [
        { lineTotal: 99.99 },
        { lineTotal: 50.01 },
      ];
      const result = calculateSubtotal(lines);
      expect(result).toBeCloseTo(150, 2);
    });
  });

  describe("calculateIVA", () => {
    it("should calculate 16% IVA correctly", () => {
      const result = calculateIVA(1000);
      expect(result).toBe(160);
    });

    it("should calculate custom IVA rate", () => {
      const result = calculateIVA(1000, 12);
      expect(result).toBe(120);
    });

    it("should handle zero subtotal", () => {
      const result = calculateIVA(0);
      expect(result).toBe(0);
    });

    it("should handle decimal subtotal", () => {
      const result = calculateIVA(999.99, 16);
      expect(result).toBeCloseTo(159.9984, 2);
    });
  });

  describe("calculateTotal", () => {
    it("should sum subtotal and IVA", () => {
      const result = calculateTotal(1000, 160);
      expect(result).toBe(1160);
    });

    it("should handle zero IVA", () => {
      const result = calculateTotal(1000, 0);
      expect(result).toBe(1000);
    });

    it("should handle decimal amounts", () => {
      const result = calculateTotal(999.99, 159.9984);
      expect(result).toBeCloseTo(1159.9884, 2);
    });
  });

  describe("Complete note calculation flow", () => {
    it("should calculate complete note with multiple lines", () => {
      // Create lines
      const line1 = {
        quantity: 5,
        unitPrice: 100,
        lineTotal: calculateLineTotal(5, 100),
      };
      const line2 = {
        quantity: 3,
        unitPrice: 250,
        lineTotal: calculateLineTotal(3, 250),
      };

      // Calculate subtotal
      const subtotal = calculateSubtotal([
        { lineTotal: line1.lineTotal },
        { lineTotal: line2.lineTotal },
      ]);
      expect(subtotal).toBe(1250); // 500 + 750

      // Calculate IVA
      const ivaAmount = calculateIVA(subtotal, 16);
      expect(ivaAmount).toBe(200); // 1250 * 0.16

      // Calculate total
      const total = calculateTotal(subtotal, ivaAmount);
      expect(total).toBe(1450); // 1250 + 200
    });

    it("should handle complex decimal scenario", () => {
      const line1 = {
        quantity: 2.5,
        unitPrice: 99.99,
        lineTotal: calculateLineTotal(2.5, 99.99),
      };
      const line2 = {
        quantity: 1,
        unitPrice: 150.50,
        lineTotal: calculateLineTotal(1, 150.50),
      };

      const subtotal = calculateSubtotal([
        { lineTotal: line1.lineTotal },
        { lineTotal: line2.lineTotal },
      ]);
      expect(subtotal).toBeCloseTo(400.475, 2);

      const ivaAmount = calculateIVA(subtotal, 16);
      expect(ivaAmount).toBeCloseTo(64.076, 2);

      const total = calculateTotal(subtotal, ivaAmount);
      expect(total).toBeCloseTo(464.551, 2);
    });
  });
});
