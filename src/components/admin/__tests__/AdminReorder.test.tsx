import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { calculateSwappedOrders, sortByOrder } from "@/lib/reorderUtils";
import { toast } from "sonner";
import AdminTariffs from "../AdminTariffs";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  adminGetTariffs: vi.fn(),
  createTariff: vi.fn(),
  updateTariff: vi.fn(),
  deleteTariff: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("../TariffDialog", () => ({
  TariffDialog: () => null,
}));

describe("Admin Reordering & calculateSwappedOrders", () => {
  describe("calculateSwappedOrders algorithm", () => {
    it("correctly calculates swapped orders when moving item down", () => {
      const items = [
        { id: 10, order: 0 },
        { id: 20, order: 1 },
        { id: 30, order: 2 },
      ];

      const result = calculateSwappedOrders(items, 0, "down");
      expect(result).not.toBeNull();
      expect(result?.currentItem).toEqual({ id: 10, order: 1 });
      expect(result?.targetItem).toEqual({ id: 20, order: 0 });
    });

    it("correctly calculates swapped orders when moving item up", () => {
      const items = [
        { id: 10, order: 0 },
        { id: 20, order: 1 },
        { id: 30, order: 2 },
      ];

      const result = calculateSwappedOrders(items, 2, "up");
      expect(result).not.toBeNull();
      expect(result?.currentItem).toEqual({ id: 30, order: 1 });
      expect(result?.targetItem).toEqual({ id: 20, order: 2 });
    });

    it("enforces boundary conditions: first item cannot move up, last item cannot move down", () => {
      const items = [
        { id: 1, order: 0 },
        { id: 2, order: 1 },
        { id: 3, order: 2 },
      ];

      // Первый элемент не может двигаться вверх
      const firstItemUp = calculateSwappedOrders(items, 0, "up");
      expect(firstItemUp).toBeNull();

      // Последний элемент не может двигаться вниз
      const lastItemDown = calculateSwappedOrders(items, items.length - 1, "down");
      expect(lastItemDown).toBeNull();
    });

    it("handles out of bounds indices and lists with fewer than 2 items", () => {
      const items = [
        { id: 1, order: 0 },
        { id: 2, order: 1 },
      ];

      // Отрицательный индекс
      expect(calculateSwappedOrders(items, -1, "up")).toBeNull();
      expect(calculateSwappedOrders(items, -1, "down")).toBeNull();

      // Индекс за пределами массива
      expect(calculateSwappedOrders(items, 2, "down")).toBeNull();
      expect(calculateSwappedOrders(items, 5, "up")).toBeNull();

      // Массив из 1 элемента
      expect(calculateSwappedOrders([{ id: 1, order: 0 }], 0, "up")).toBeNull();
      expect(calculateSwappedOrders([{ id: 1, order: 0 }], 0, "down")).toBeNull();

      // Пустой массив
      expect(calculateSwappedOrders([], 0, "up")).toBeNull();
    });

    it("handles identical order values correctly without collision", () => {
      const items = [
        { id: 100, order: 5 },
        { id: 200, order: 5 },
      ];

      const moveUpResult = calculateSwappedOrders(items, 1, "up");
      expect(moveUpResult).not.toBeNull();
      expect(moveUpResult!.currentItem.order).toBe(4);
      expect(moveUpResult!.targetItem.order).toBe(5);

      const moveDownResult = calculateSwappedOrders(items, 0, "down");
      expect(moveDownResult).not.toBeNull();
      expect(moveDownResult!.currentItem.order).toBe(6);
      expect(moveDownResult!.targetItem.order).toBe(5);
    });

    it("falls back to item index when order property is undefined", () => {
      const items = [
        { id: 1 },
        { id: 2 },
      ];

      const result = calculateSwappedOrders(items, 1, "up");
      expect(result).not.toBeNull();
      expect(result?.currentItem).toEqual({ id: 2, order: 0 });
      expect(result?.targetItem).toEqual({ id: 1, order: 1 });
    });
  });

  describe("Admin Panel UI Reorder Buttons (Boundary & Interaction)", () => {
    let queryClient: QueryClient;

    const mockTariffList: api.Tariff[] = [
      {
        id: 1,
        title: "Тариф 1 - Active",
        description: "Описание 1",
        price: "5000",
        features: "[]",
        is_active: true,
        order: 0,
      },
      {
        id: 2,
        title: "Тариф 2 - Standard",
        description: "Описание 2",
        price: "10000",
        features: "[]",
        is_active: true,
        order: 1,
      },
      {
        id: 3,
        title: "Тариф 3 - Pro",
        description: "Описание 3",
        price: "15000",
        features: "[]",
        is_active: true,
        order: 2,
      },
    ];

    let consoleSpy: any;

    beforeEach(() => {
      consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});
      queryClient = new QueryClient({
        defaultOptions: {
          queries: {
            retry: false,
          },
        },
      });
      vi.clearAllMocks();
    });

    afterEach(() => {
      consoleSpy?.mockRestore();
    });

    it("disables 'up' button on first item and 'down' button on last item in admin table", async () => {
      vi.mocked(api.adminGetTariffs).mockResolvedValue(mockTariffList);

      render(
        <QueryClientProvider client={queryClient}>
          <AdminTariffs />
        </QueryClientProvider>
      );

      // Ожидаем загрузку тарифов
      await waitFor(() => {
        expect(screen.getByText("Тариф 1 - Active")).toBeInTheDocument();
      });

      const upButtons = screen.getAllByTitle("Поднять выше");
      const downButtons = screen.getAllByTitle("Опустить ниже");

      expect(upButtons).toHaveLength(3);
      expect(downButtons).toHaveLength(3);

      // Граничные условия UI:
      // 1. Первая строка: кнопка вверх отключена, кнопка вниз активна
      expect(upButtons[0]).toBeDisabled();
      expect(downButtons[0]).not.toBeDisabled();

      // 2. Средняя строка: обе кнопки активны
      expect(upButtons[1]).not.toBeDisabled();
      expect(downButtons[1]).not.toBeDisabled();

      // 3. Последняя строка: кнопка вверх активна, кнопка вниз отключена
      expect(upButtons[2]).not.toBeDisabled();
      expect(downButtons[2]).toBeDisabled();
    });

    it("disables both 'up' and 'down' buttons when only one item exists", async () => {
      vi.mocked(api.adminGetTariffs).mockResolvedValue([mockTariffList[0]]);

      render(
        <QueryClientProvider client={queryClient}>
          <AdminTariffs />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Тариф 1 - Active")).toBeInTheDocument();
      });

      const upButtons = screen.getAllByTitle("Поднять выше");
      const downButtons = screen.getAllByTitle("Опустить ниже");

      expect(upButtons).toHaveLength(1);
      expect(downButtons).toHaveLength(1);

      // И вверх, и вниз должны быть отключены
      expect(upButtons[0]).toBeDisabled();
      expect(downButtons[0]).toBeDisabled();
    });

    it("calls updateTariff with swapped order values when reordering", async () => {
      vi.mocked(api.adminGetTariffs).mockResolvedValue(mockTariffList);
      vi.mocked(api.updateTariff).mockResolvedValue(mockTariffList[0]);

      render(
        <QueryClientProvider client={queryClient}>
          <AdminTariffs />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Тариф 1 - Active")).toBeInTheDocument();
      });

      const downButtons = screen.getAllByTitle("Опустить ниже");

      // Нажимаем опустить первый элемент (id 1, order 0) вниз -> должен поменяться с id 2, order 1
      fireEvent.click(downButtons[0]);

      await waitFor(() => {
        expect(api.updateTariff).toHaveBeenCalledWith(1, { order: 1 });
        expect(api.updateTariff).toHaveBeenCalledWith(2, { order: 0 });
      });
    });

    it("renders GripVertical drag handle alongside Up/Down buttons for each tariff row", async () => {
      vi.mocked(api.adminGetTariffs).mockResolvedValue(mockTariffList);

      render(
        <QueryClientProvider client={queryClient}>
          <AdminTariffs />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Тариф 1 - Active")).toBeInTheDocument();
      });

      const handles = screen.getAllByTestId("drag-handle");
      expect(handles).toHaveLength(3);
    });

    it("optimistically updates tariff orders in React Query cache immediately", async () => {
      vi.mocked(api.adminGetTariffs).mockResolvedValue([...mockTariffList]);
      let resolveUpdate: () => void = () => {};
      const pendingPromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });
      vi.mocked(api.updateTariff).mockReturnValue(pendingPromise as any);

      render(
        <QueryClientProvider client={queryClient}>
          <AdminTariffs />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Тариф 1 - Active")).toBeInTheDocument();
      });

      const downButtons = screen.getAllByTitle("Опустить ниже");
      fireEvent.click(downButtons[0]);

      // Cache should immediately reflect swapped orders optimistically
      await waitFor(() => {
        const cached = queryClient.getQueryData<api.Tariff[]>(["admin-tariffs"]);
        expect(cached?.find((t) => t.id === 1)?.order).toBe(1);
        expect(cached?.find((t) => t.id === 2)?.order).toBe(0);
      });

      resolveUpdate();
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith("Порядок изменен");
      });
    });

    it("rolls back cache and shows error toast when reordering fails", async () => {
      vi.mocked(api.adminGetTariffs).mockResolvedValue([...mockTariffList]);
      vi.mocked(api.updateTariff).mockRejectedValue(new Error("Network failure on slope"));

      render(
        <QueryClientProvider client={queryClient}>
          <AdminTariffs />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Тариф 1 - Active")).toBeInTheDocument();
      });

      const downButtons = screen.getAllByTitle("Опустить ниже");
      fireEvent.click(downButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Ошибка обновления");
        const cache = queryClient.getQueryData<api.Tariff[]>(["admin-tariffs"]);
        // Restored to initial order
        expect(cache?.find((t) => t.id === 1)?.order).toBe(0);
        expect(cache?.find((t) => t.id === 2)?.order).toBe(1);
      });
    });

    it("triggers reorder mutation when row is dragged and dropped (0 -> 2)", async () => {
      vi.mocked(api.adminGetTariffs).mockResolvedValue([...mockTariffList]);
      vi.mocked(api.updateTariff).mockResolvedValue(mockTariffList[0]);

      render(
        <QueryClientProvider client={queryClient}>
          <AdminTariffs />
        </QueryClientProvider>
      );

      await waitFor(() => {
        expect(screen.getByText("Тариф 1 - Active")).toBeInTheDocument();
      });

      const targetRow = screen.getByTestId("draggable-row-2");

      // Drag row index 0 and drop on row index 2
      fireEvent.drop(targetRow, {
        dataTransfer: {
          getData: (format: string) => (format === "text/plain" ? "0" : ""),
        },
      });

      await waitFor(() => {
        // Moving item 0 to index 2 changes orders:
        // item 2 (id 2) -> order 0
        // item 3 (id 3) -> order 1
        // item 1 (id 1) -> order 2
        expect(api.updateTariff).toHaveBeenCalledWith(2, { order: 0 });
        expect(api.updateTariff).toHaveBeenCalledWith(3, { order: 1 });
        expect(api.updateTariff).toHaveBeenCalledWith(1, { order: 2 });
      });
    });
  });
});
