import { describe, it, expect } from "vitest";
import { calculateSwappedOrders, calculateReorderedList, sortByOrder } from "./reorderUtils";

describe("reorderUtils", () => {
  describe("sortByOrder", () => {
    it("sorts items by order ascending", () => {
      const items = [
        { id: 1, order: 10 },
        { id: 2, order: 2 },
        { id: 3, order: 5 },
      ];
      const sorted = sortByOrder(items);
      expect(sorted.map((i) => i.id)).toEqual([2, 3, 1]);
    });

    it("treats missing order as 0", () => {
      const items = [
        { id: 1, order: 3 },
        { id: 2 },
        { id: 3, order: -1 },
      ];
      const sorted = sortByOrder(items);
      expect(sorted.map((i) => i.id)).toEqual([3, 2, 1]);
    });

    it("does not mutate original array", () => {
      const items = [{ id: 1, order: 5 }, { id: 2, order: 1 }];
      const sorted = sortByOrder(items);
      expect(items[0].id).toBe(1);
      expect(sorted[0].id).toBe(2);
    });
  });

  describe("calculateSwappedOrders", () => {
    it("returns null for invalid inputs or boundaries", () => {
      const items = [{ id: 1, order: 0 }, { id: 2, order: 1 }];

      // Move top item up
      expect(calculateSwappedOrders(items, 0, "up")).toBeNull();

      // Move bottom item down
      expect(calculateSwappedOrders(items, 1, "down")).toBeNull();

      // Index out of bounds
      expect(calculateSwappedOrders(items, -1, "up")).toBeNull();
      expect(calculateSwappedOrders(items, 5, "down")).toBeNull();

      // Less than 2 items
      expect(calculateSwappedOrders([{ id: 1, order: 0 }], 0, "up")).toBeNull();
    });

    it("swaps distinct order values correctly when moving up", () => {
      const items = [
        { id: 1, order: 0 },
        { id: 2, order: 10 },
      ];
      const result = calculateSwappedOrders(items, 1, "up");
      expect(result).not.toBeNull();
      expect(result?.currentItem).toEqual({ id: 2, order: 0 });
      expect(result?.targetItem).toEqual({ id: 1, order: 10 });
    });

    it("swaps distinct order values correctly when moving down", () => {
      const items = [
        { id: 1, order: 0 },
        { id: 2, order: 10 },
      ];
      const result = calculateSwappedOrders(items, 0, "down");
      expect(result).not.toBeNull();
      expect(result?.currentItem).toEqual({ id: 1, order: 10 });
      expect(result?.targetItem).toEqual({ id: 2, order: 0 });
    });

    it("handles identical order values without colliding", () => {
      const items = [
        { id: 1, order: 0 },
        { id: 2, order: 0 },
      ];

      // Moving item 2 up should place it before item 1
      const resultUp = calculateSwappedOrders(items, 1, "up");
      expect(resultUp).not.toBeNull();
      expect(resultUp!.currentItem.order).toBeLessThan(resultUp!.targetItem.order);

      // Moving item 1 down should place it after item 2
      const resultDown = calculateSwappedOrders(items, 0, "down");
      expect(resultDown).not.toBeNull();
      expect(resultDown!.currentItem.order).toBeGreaterThan(resultDown!.targetItem.order);
    });
  });

  describe("calculateReorderedList (Drag-and-Drop)", () => {
    it("returns unchanged items when indices are out of bounds or identical", () => {
      const items = [
        { id: 1, order: 0 },
        { id: 2, order: 1 },
      ];

      expect(calculateReorderedList(items, 0, 0).changedItems).toEqual([]);
      expect(calculateReorderedList(items, -1, 1).changedItems).toEqual([]);
      expect(calculateReorderedList(items, 0, 5).changedItems).toEqual([]);
      expect(calculateReorderedList([], 0, 1).changedItems).toEqual([]);
      expect(calculateReorderedList([{ id: 1, order: 0 }], 0, 1).changedItems).toEqual([]);
    });

    it("correctly reorders items when moving item forward (0 -> 2)", () => {
      const items = [
        { id: 10, order: 0 },
        { id: 20, order: 1 },
        { id: 30, order: 2 },
        { id: 40, order: 3 },
      ];

      const { reorderedItems, changedItems } = calculateReorderedList(items, 0, 2);

      // Moved item 10 to index 2: [20, 30, 10, 40]
      expect(reorderedItems.map((i) => i.id)).toEqual([20, 30, 10, 40]);
      expect(reorderedItems.map((i) => i.order)).toEqual([0, 1, 2, 3]);

      // Changed items: 20 (was 1, now 0), 30 (was 2, now 1), 10 (was 0, now 2)
      // 40 stays unchanged at order 3
      expect(changedItems).toEqual([
        { id: 20, order: 0 },
        { id: 30, order: 1 },
        { id: 10, order: 2 },
      ]);
    });

    it("correctly reorders items when moving item backward (3 -> 1)", () => {
      const items = [
        { id: 10, order: 0 },
        { id: 20, order: 1 },
        { id: 30, order: 2 },
        { id: 40, order: 3 },
      ];

      const { reorderedItems, changedItems } = calculateReorderedList(items, 3, 1);

      // Moved item 40 to index 1: [10, 40, 20, 30]
      expect(reorderedItems.map((i) => i.id)).toEqual([10, 40, 20, 30]);
      expect(reorderedItems.map((i) => i.order)).toEqual([0, 1, 2, 3]);

      // 10 unchanged (order 0). 40 (order 1), 20 (order 2), 30 (order 3)
      expect(changedItems).toEqual([
        { id: 40, order: 1 },
        { id: 20, order: 2 },
        { id: 30, order: 3 },
      ]);
    });

    it("handles adjacent drag-and-drop swap", () => {
      const items = [
        { id: 1, order: 0 },
        { id: 2, order: 1 },
      ];

      const { reorderedItems, changedItems } = calculateReorderedList(items, 0, 1);
      expect(reorderedItems.map((i) => i.id)).toEqual([2, 1]);
      expect(changedItems).toEqual([
        { id: 2, order: 0 },
        { id: 1, order: 1 },
      ]);
    });
  });
});
