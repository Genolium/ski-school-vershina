import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminSchedule from "../AdminSchedule";
import * as api from "@/lib/api";
import { toast } from "sonner";

vi.mock("@/lib/api", () => ({
  adminGetSchedule: vi.fn(),
  createSchedule: vi.fn(),
  updateSchedule: vi.fn(),
  deleteSchedule: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminSchedule CRUD & Interactive Operations", () => {
  let queryClient: QueryClient;

  const mockSchedule: api.ScheduleGroup[] = [
    {
      id: 1,
      group: "Юниоры Начальный",
      age_range: "7-12 лет",
      days: "Сб, Вс",
      time: "10:00 - 12:00",
      location: "Курорт Игора",
      spots: 8,
      price: "6 000 ₽/мес.",
      is_active: true,
      order: 1,
    },
    {
      id: 2,
      group: "Спортивная смена",
      age_range: "12-17 лет",
      days: "Вт, Чт, Сб",
      time: "16:00 - 18:30",
      location: "Охта Парк",
      spots: 6,
      price: "12 000 ₽/мес.",
      is_active: false,
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

  const renderComponent = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <AdminSchedule />
      </QueryClientProvider>
    );

  it("table renders schedule rows (group name, age range, days, time, spots)", async () => {
    vi.mocked(api.adminGetSchedule).mockResolvedValue(mockSchedule);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Юниоры Начальный")).toBeInTheDocument();
      expect(screen.getByText("Спортивная смена")).toBeInTheDocument();
    });

    // Age ranges
    expect(screen.getByText("7-12 лет")).toBeInTheDocument();
    expect(screen.getByText("12-17 лет")).toBeInTheDocument();

    // Days & Times
    expect(screen.getByText("Сб, Вс")).toBeInTheDocument();
    expect(screen.getByText("10:00 - 12:00")).toBeInTheDocument();
    expect(screen.getByText("Вт, Чт, Сб")).toBeInTheDocument();
    expect(screen.getByText("16:00 - 18:30")).toBeInTheDocument();

    // Spots
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("6")).toBeInTheDocument();

    // Locations
    expect(screen.getByText("Курорт Игора")).toBeInTheDocument();
    expect(screen.getByText("Охта Парк")).toBeInTheDocument();
  });

  it("test add group opens ScheduleDialog and creates a group", async () => {
    vi.mocked(api.adminGetSchedule).mockResolvedValue(mockSchedule);
    vi.mocked(api.createSchedule).mockResolvedValue({
      id: 3,
      group: "Малыши",
      age_range: "4-6 лет",
      days: "Сб",
      time: "11:00 - 12:00",
      location: "Северный Склон",
      spots: 5,
      is_active: true,
      order: 3,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Юниоры Начальный")).toBeInTheDocument();
    });

    const addGroupButton = screen.getByRole("button", { name: /Добавить группу/i });
    fireEvent.click(addGroupButton);

    // ScheduleDialog modal heading
    expect(await screen.findByRole("heading", { name: "Добавить группу" })).toBeInTheDocument();

    const groupInput = screen.getByLabelText("Группа");
    const ageInput = screen.getByLabelText("Возраст");
    const daysInput = screen.getByLabelText("Дни");
    const timeInput = screen.getByLabelText("Время");
    const locationInput = screen.getByLabelText("Локация");
    const spotsInput = screen.getByLabelText("Места");

    fireEvent.change(groupInput, { target: { value: "Малыши" } });
    fireEvent.change(ageInput, { target: { value: "4-6 лет" } });
    fireEvent.change(daysInput, { target: { value: "Сб" } });
    fireEvent.change(timeInput, { target: { value: "11:00 - 12:00" } });
    fireEvent.change(locationInput, { target: { value: "Северный Склон" } });
    fireEvent.change(spotsInput, { target: { value: "5" } });

    const submitButton = screen.getByRole("button", { name: "Добавить" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createSchedule).toHaveBeenCalledWith(
        expect.objectContaining({
          group: "Малыши",
          age_range: "4-6 лет",
          days: "Сб",
          time: "11:00 - 12:00",
          location: "Северный Склон",
          spots: 5,
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Группа добавлена");
    });
  });

  it("editing a schedule group opens ScheduleDialog pre-filled and submits update", async () => {
    vi.mocked(api.adminGetSchedule).mockResolvedValue(mockSchedule);
    vi.mocked(api.updateSchedule).mockResolvedValue({
      ...mockSchedule[0],
      spots: 10,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Юниоры Начальный")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /Редактировать/i });
    fireEvent.click(editButtons[0]);

    // Heading in dialog
    expect(
      await screen.findByRole("heading", { name: "Редактировать группу" })
    ).toBeInTheDocument();

    const groupInput = screen.getByLabelText("Группа") as HTMLInputElement;
    expect(groupInput.value).toBe("Юниоры Начальный");

    const spotsInput = screen.getByLabelText("Места") as HTMLInputElement;
    expect(spotsInput.value).toBe("8");

    fireEvent.change(spotsInput, { target: { value: "10" } });

    const saveButton = screen.getByRole("button", { name: "Сохранить" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.updateSchedule).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          spots: 10,
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Группа обновлена");
    });
  });

  it("deleting a schedule group opens AlertDialog and triggers delete mutation", async () => {
    vi.mocked(api.adminGetSchedule).mockResolvedValue(mockSchedule);
    vi.mocked(api.deleteSchedule).mockResolvedValue({ success: true } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Юниоры Начальный")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Удалить" });
    fireEvent.click(deleteButtons[0]);

    expect(await screen.findByText("Удалить группу?")).toBeInTheDocument();
    expect(
      screen.getByText("Это действие нельзя отменить. Группа будет удалена навсегда.")
    ).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Удалить" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.deleteSchedule).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith("Группа удалена");
    });
  });

  it("renders empty state message when schedule is empty", async () => {
    vi.mocked(api.adminGetSchedule).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Группы не добавлены")).toBeInTheDocument();
    });
  });

  it("reorders schedule groups with up and down buttons", async () => {
    vi.mocked(api.adminGetSchedule).mockResolvedValue(mockSchedule);
    vi.mocked(api.updateSchedule).mockResolvedValue({} as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Юниоры Начальный")).toBeInTheDocument();
    });

    const downButtons = screen.getAllByTitle("Опустить ниже");
    fireEvent.click(downButtons[0]);

    await waitFor(() => {
      expect(api.updateSchedule).toHaveBeenCalledWith(1, { order: 2 });
      expect(api.updateSchedule).toHaveBeenCalledWith(2, { order: 1 });
      expect(toast.success).toHaveBeenCalledWith("Порядок изменен");
    });
  });
});
