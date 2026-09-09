import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminCamps from "../AdminCamps";
import Camps from "../../Camps";
import * as api from "@/lib/api";
import { toast } from "sonner";
import { parseSmartArray } from "@/lib/arrayParser";

vi.mock("@/lib/api", () => ({
  adminGetCamps: vi.fn(),
  createCamp: vi.fn(),
  updateCamp: vi.fn(),
  deleteCamp: vi.fn(),
  getCamps: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminCamps Reordering & Camps Smart Array Handling", () => {
  let queryClient: QueryClient;

  const mockCampsList: api.Camp[] = [
    {
      id: 101,
      title: "Кировск - Хибины Сборы",
      location: "Хибины, Большой Вудъявр",
      location_desc: "Северные склоны",
      dates: "03.01.2026 - 10.01.2026",
      duration: "7 дней",
      group_size: "до 10 человек",
      group_desc: "2 тренера",
      training_desc: "Техника карвинга",
      included_items: JSON.stringify(["Проживание", "Питание"]),
      stats: "{}",
      is_active: true,
      order: 0,
    },
    {
      id: 102,
      title: "Эльбрус - Высокогорный Сбор",
      location: "Приэльбрусье, поляна Азау",
      location_desc: "Ледниковые трассы",
      dates: "15.02.2026 - 23.02.2026",
      duration: "8 дней",
      group_size: "до 8 человек",
      group_desc: "Мастера спорта",
      training_desc: "Спецслалом",
      included_items: JSON.stringify(["Ски-пасс", "Видеоразбор"]),
      stats: "{}",
      is_active: true,
      order: 1,
    },
    {
      id: 103,
      title: "Шерегеш - Фрирайд и Карвинг",
      location: "Шерегеш, Сектор Е",
      location_desc: "Пухляк и подготовленные трассы",
      dates: "10.03.2026 - 18.03.2026",
      duration: "9 дней",
      group_size: "до 12 человек",
      group_desc: "Фрирайд-гиды",
      training_desc: "Катание вне трасс",
      included_items: JSON.stringify(["Трансфер", "Страховка"]),
      stats: "{}",
      is_active: true,
      order: 2,
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    });
    vi.clearAllMocks();
  });

  const renderAdminCamps = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AdminCamps />
      </QueryClientProvider>
    );

  describe("Arrow Up and Down Reordering Controls", () => {
    it("renders position badges (№1, №2, №3) and drag handles for each camp row", async () => {
      vi.mocked(api.adminGetCamps).mockResolvedValue(mockCampsList);

      renderAdminCamps();

      await waitFor(() => {
        expect(screen.getByText("Кировск - Хибины Сборы")).toBeInTheDocument();
      });

      // Badges
      expect(screen.getByTestId("camp-position-0")).toHaveTextContent("№1");
      expect(screen.getByTestId("camp-position-1")).toHaveTextContent("№2");
      expect(screen.getByTestId("camp-position-2")).toHaveTextContent("№3");

      // Drag handles
      const dragHandles = screen.getAllByLabelText("Перетащить строку");
      expect(dragHandles).toHaveLength(3);
    });

    it("enforces boundary conditions: first item cannot move up, last item cannot move down", async () => {
      vi.mocked(api.adminGetCamps).mockResolvedValue(mockCampsList);

      renderAdminCamps();

      await waitFor(() => {
        expect(screen.getByText("Кировск - Хибины Сборы")).toBeInTheDocument();
      });

      const upButtons = screen.getAllByTitle("Выше");
      const downButtons = screen.getAllByTitle("Ниже");

      expect(upButtons).toHaveLength(3);
      expect(downButtons).toHaveLength(3);

      // 1-я строка (Кировск): Выше отключено, Ниже активно
      expect(upButtons[0]).toBeDisabled();
      expect(downButtons[0]).not.toBeDisabled();

      // 2-я строка (Эльбрус): обе активны
      expect(upButtons[1]).not.toBeDisabled();
      expect(downButtons[1]).not.toBeDisabled();

      // 3-я строка (Шерегеш): Выше активно, Ниже отключено
      expect(upButtons[2]).not.toBeDisabled();
      expect(downButtons[2]).toBeDisabled();
    });

    it("clicking Arrow Down swaps orders of first and second camps and updates optimistic cache", async () => {
      vi.mocked(api.adminGetCamps).mockResolvedValue([...mockCampsList]);
      let resolveUpdate: () => void = () => {};
      const pendingPromise = new Promise<any>((resolve) => {
        resolveUpdate = () => resolve(mockCampsList[0]);
      });
      vi.mocked(api.updateCamp).mockReturnValue(pendingPromise);

      renderAdminCamps();

      await waitFor(() => {
        expect(screen.getByText("Кировск - Хибины Сборы")).toBeInTheDocument();
      });

      const downButtons = screen.getAllByTitle("Ниже");

      // Нажимаем опустить первый сбор (id 101, order 0) -> должен поменяться с (id 102, order 1)
      fireEvent.click(downButtons[0]);

      // Cache should immediately reflect swapped orders optimistically
      await waitFor(
        () => {
          const cached = queryClient.getQueryData<api.Camp[]>(["admin-camps"]);
          expect(cached?.find((c) => c.id === 101)?.order).toBe(1);
          expect(cached?.find((c) => c.id === 102)?.order).toBe(0);
        },
        { timeout: 3000 }
      );

      resolveUpdate();

      await waitFor(() => {
        expect(api.updateCamp).toHaveBeenCalledWith(101, { order: 1 });
        expect(api.updateCamp).toHaveBeenCalledWith(102, { order: 0 });
        expect(toast.success).toHaveBeenCalledWith("Порядок изменен");
      });
    });

    it("clicking Arrow Up swaps orders of middle and first camps", async () => {
      vi.mocked(api.adminGetCamps).mockResolvedValue([...mockCampsList]);
      vi.mocked(api.updateCamp).mockResolvedValue(mockCampsList[1]);

      renderAdminCamps();

      await waitFor(() => {
        expect(screen.getByText("Эльбрус - Высокогорный Сбор")).toBeInTheDocument();
      });

      const upButtons = screen.getAllByTitle("Выше");

      // Нажимаем поднять второй сбор (id 102, order 1) -> меняется с (id 101, order 0)
      fireEvent.click(upButtons[1]);

      await waitFor(() => {
        expect(api.updateCamp).toHaveBeenCalledWith(102, { order: 0 });
        expect(api.updateCamp).toHaveBeenCalledWith(101, { order: 1 });
        expect(toast.success).toHaveBeenCalledWith("Порядок изменен");
      });
    });

    it("rolls back cache and displays error toast when reordering fails", async () => {
      vi.mocked(api.adminGetCamps).mockResolvedValue([...mockCampsList]);
      vi.mocked(api.updateCamp).mockRejectedValue(new Error("Database write error"));

      renderAdminCamps();

      await waitFor(() => {
        expect(screen.getByText("Кировск - Хибины Сборы")).toBeInTheDocument();
      });

      const downButtons = screen.getAllByTitle("Ниже");
      fireEvent.click(downButtons[0]);

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith("Не удалось изменить порядок");
        const cached = queryClient.getQueryData<api.Camp[]>(["admin-camps"]);
        expect(cached?.find((c) => c.id === 101)?.order).toBe(0);
        expect(cached?.find((c) => c.id === 102)?.order).toBe(1);
      });
    });
  });

  describe("HTML5 Drag and Drop Reordering", () => {
    it("triggers reorder mutation when row 0 is dragged and dropped on row 2", async () => {
      vi.mocked(api.adminGetCamps).mockResolvedValue([...mockCampsList]);
      vi.mocked(api.updateCamp).mockResolvedValue(mockCampsList[0]);

      renderAdminCamps();

      await waitFor(() => {
        expect(screen.getByText("Кировск - Хибины Сборы")).toBeInTheDocument();
      });

      const targetRow = screen.getByTestId("draggable-row-2");

      fireEvent.drop(targetRow, {
        dataTransfer: {
          getData: (format: string) => (format === "text/plain" ? "0" : ""),
        },
      });

      await waitFor(() => {
        // Перемещение элемента 0 на индекс 2:
        // Эльбрус (102) -> 0
        // Шерегеш (103) -> 1
        // Кировск (101) -> 2
        expect(api.updateCamp).toHaveBeenCalledWith(102, { order: 0 });
        expect(api.updateCamp).toHaveBeenCalledWith(103, { order: 1 });
        expect(api.updateCamp).toHaveBeenCalledWith(101, { order: 2 });
      });
    });
  });

  describe("Dialog Quick Position Selector", () => {
    it("offers quick position preset buttons and updates order input value", async () => {
      vi.mocked(api.adminGetCamps).mockResolvedValue(mockCampsList);
      vi.mocked(api.createCamp).mockResolvedValue({
        id: 104,
        title: "Камчатка Сбор",
        location: "Вулканы Камчатки",
        location_desc: "",
        dates: "10.04.2026 - 20.04.2026",
        duration: "10 дней",
        group_size: "6 человек",
        group_desc: "",
        training_desc: "Хели-ски",
        included_items: "[]",
        stats: "{}",
        is_active: true,
        order: 0,
      });

      renderAdminCamps();

      await waitFor(() => {
        expect(screen.getByText("Кировск - Хибины Сборы")).toBeInTheDocument();
      });

      const addCampBtn = screen.getByRole("button", { name: /Добавить сборы/i });
      fireEvent.click(addCampBtn);

      expect(await screen.findByRole("heading", { name: "Добавить сборы" })).toBeInTheDocument();

      // Quick preset button "№1 (В начало)"
      const startPosButton = screen.getByRole("button", { name: /№1 \(В начало\)/i });
      expect(startPosButton).toBeInTheDocument();

      // Click "№1 (В начало)"
      fireEvent.click(startPosButton);

      const orderInput = screen.getByLabelText(/Порядок отображения/i) as HTMLInputElement;
      expect(parseInt(orderInput.value, 10)).toBeLessThanOrEqual(0);

      // Fill in required fields and submit
      fireEvent.change(screen.getByLabelText("Название"), {
        target: { value: "Камчатка Сбор" },
      });
      fireEvent.change(screen.getByLabelText("Локация"), {
        target: { value: "Вулканы Камчатки" },
      });
      fireEvent.change(screen.getByLabelText("Даты"), {
        target: { value: "10.04.2026 - 20.04.2026" },
      });

      const submitBtn = screen.getByRole("button", { name: "Добавить" });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(api.createCamp).toHaveBeenCalledWith(
          expect.objectContaining({
            title: "Камчатка Сбор",
            order: parseInt(orderInput.value, 10),
          })
        );
        expect(toast.success).toHaveBeenCalledWith("Сборы добавлены");
      });
    });
  });

  describe("parseSmartArray and Public Camps Semicolon Format", () => {
    it("correctly parses user screenshot's semicolon list format with quotes", () => {
      const rawAdminInput =
        '"Проживание"; "Питание"; "3 тренировки в день"; "Видео разбор"; "Развлекательная программа";';
      const parsed = parseSmartArray(rawAdminInput);

      expect(parsed).toEqual([
        "Проживание",
        "Питание",
        "3 тренировки в день",
        "Видео разбор",
        "Развлекательная программа",
      ]);
    });

    it("renders all items from screenshot's semicolon format on the public Camps page", async () => {
      const campWithSemicolonItems: api.Camp = {
        id: 201,
        title: "Сборы в горах 2026",
        location: "Красная Поляна",
        location_desc: "Горная Олимпийская Деревня",
        dates: "12.01.2026 - 19.01.2026",
        duration: "7 дней",
        group_size: "10 участников",
        group_desc: "Любой уровень",
        training_desc: "Ежедневные тренировки",
        included_items:
          '"Проживание"; "Питание"; "3 тренировки в день"; "Видео разбор"; "Развлекательная программа";',
        stats: "{}",
        is_active: true,
        order: 1,
      };

      vi.mocked(api.getCamps).mockResolvedValue([campWithSemicolonItems]);

      render(<Camps />);

      // Wait for debounce and rendering
      await waitFor(
        () => {
          expect(screen.getByText("Сборы в горах 2026")).toBeInTheDocument();
        },
        { timeout: 2000 }
      );

      // Verify each item from the semicolon list is cleanly rendered
      expect(screen.getByText("Проживание")).toBeInTheDocument();
      expect(screen.getByText("Питание")).toBeInTheDocument();
      expect(screen.getByText("3 тренировки в день")).toBeInTheDocument();
      expect(screen.getByText("Видео разбор")).toBeInTheDocument();
      expect(screen.getByText("Развлекательная программа")).toBeInTheDocument();

      // Ensure fallback "Список формируется…" is NOT rendered
      expect(screen.queryByText("Список формируется…")).not.toBeInTheDocument();
    });
  });
});
