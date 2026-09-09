import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminLocations from "../AdminLocations";
import * as api from "@/lib/api";
import { toast } from "sonner";

vi.mock("@/lib/api", () => ({
  adminGetLocations: vi.fn(),
  createLocation: vi.fn(),
  updateLocation: vi.fn(),
  deleteLocation: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe("AdminLocations CRUD & LocationForm Interactions", () => {
  let queryClient: QueryClient;

  const mockLocations: api.Location[] = [
    {
      id: 1,
      title: "Курорт Игора",
      address: "Ленинградская обл., Приозерский район, 54-й км",
      description: "Всесезонный курорт мирового уровня с профессиональными склонами",
      features: JSON.stringify(["Прокат снаряжения", "Освещенные трассы"]),
      icon_type: "Mountain",
      latitude: 60.514,
      longitude: 30.213,
      route_url: "https://igora.ru/route",
      order: 1,
    },
    {
      id: 2,
      title: "Охта Парк",
      address: "Ленинградская обл., дер. Сярьги",
      description: "Популярный семейный курорт в 15 минутах от СПб",
      features: JSON.stringify(["Детский клуб", "Тюбинг"]),
      icon_type: "MapPin",
      latitude: 60.128,
      longitude: 30.442,
      route_url: "https://ohtapark.ru/route",
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
        <AdminLocations />
      </QueryClientProvider>
    );

  it("LocationTable renders rows with title, address and truncated description", async () => {
    vi.mocked(api.adminGetLocations).mockResolvedValue(mockLocations);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Курорт Игора")).toBeInTheDocument();
      expect(screen.getByText("Охта Парк")).toBeInTheDocument();
    });

    expect(
      screen.getByText("Ленинградская обл., Приозерский район, 54-й км")
    ).toBeInTheDocument();
    expect(
      screen.getByText("Ленинградская обл., дер. Сярьги")
    ).toBeInTheDocument();

    // Verify description is rendered (truncated with ellipsis in table)
    expect(
      screen.getByText(/Всесезонный курорт мирового уровня/i)
    ).toBeInTheDocument();
  });

  it("clicking 'Добавить локацию' opens dialog, and submitting form calls createLocation", async () => {
    vi.mocked(api.adminGetLocations).mockResolvedValue(mockLocations);
    vi.mocked(api.createLocation).mockResolvedValue({
      id: 3,
      title: "Северный Склон",
      address: "пос. Токсово",
      description: "Уютный склон для начинающих",
      features: "[]",
      icon_type: "MapPin",
      latitude: 60.155,
      longitude: 30.523,
      route_url: "https://sevsklon.ru",
      order: 3,
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Курорт Игора")).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: /Добавить локацию/i });
    fireEvent.click(addButton);

    expect(await screen.findByRole("heading", { name: "Добавить локацию" })).toBeInTheDocument();

    const titleInput = screen.getByLabelText("Название");
    const addressInput = screen.getByLabelText("Адрес");
    const descInput = screen.getByLabelText("Описание");
    const latInput = screen.getByLabelText("Широта (latitude)");
    const lngInput = screen.getByLabelText("Долгота (longitude)");

    fireEvent.change(titleInput, { target: { value: "Северный Склон" } });
    fireEvent.change(addressInput, { target: { value: "пос. Токсово" } });
    fireEvent.change(descInput, { target: { value: "Уютный склон для начинающих" } });
    fireEvent.change(latInput, { target: { value: "60.155" } });
    fireEvent.change(lngInput, { target: { value: "30.523" } });

    const submitButton = screen.getByRole("button", { name: "Добавить" });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(api.createLocation).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Северный Склон",
          address: "пос. Токсово",
          description: "Уютный склон для начинающих",
          latitude: 60.155,
          longitude: 30.523,
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Локация добавлена");
    });
  });

  it("clicking 'Редактировать' opens dialog pre-filled and submitting calls updateLocation", async () => {
    vi.mocked(api.adminGetLocations).mockResolvedValue(mockLocations);
    vi.mocked(api.updateLocation).mockResolvedValue({
      ...mockLocations[0],
      title: "Курорт Игора (Обновлено)",
    });

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Курорт Игора")).toBeInTheDocument();
    });

    const editButtons = screen.getAllByRole("button", { name: /Редактировать/i });
    fireEvent.click(editButtons[0]);

    expect(
      await screen.findByRole("heading", { name: "Редактировать локацию" })
    ).toBeInTheDocument();

    const titleInput = screen.getByLabelText("Название") as HTMLInputElement;
    expect(titleInput.value).toBe("Курорт Игора");

    fireEvent.change(titleInput, { target: { value: "Курорт Игора (Обновлено)" } });

    const saveButton = screen.getByRole("button", { name: "Сохранить" });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(api.updateLocation).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: "Курорт Игора (Обновлено)",
        })
      );
      expect(toast.success).toHaveBeenCalledWith("Локация обновлена");
    });
  });

  it("deleting a location opens confirmation AlertDialog and calls deleteLocation", async () => {
    vi.mocked(api.adminGetLocations).mockResolvedValue(mockLocations);
    vi.mocked(api.deleteLocation).mockResolvedValue({ success: true } as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Курорт Игора")).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole("button", { name: "Удалить" });
    fireEvent.click(deleteButtons[0]);

    expect(await screen.findByText("Удалить локацию?")).toBeInTheDocument();
    expect(screen.getByText("Это действие нельзя отменить.")).toBeInTheDocument();

    const confirmButton = screen.getByRole("button", { name: "Удалить" });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(api.deleteLocation).toHaveBeenCalledWith(1);
      expect(toast.success).toHaveBeenCalledWith("Локация удалена");
    });
  });

  it("validates latitude and longitude ranges preventing invalid form submission", async () => {
    vi.mocked(api.adminGetLocations).mockResolvedValue(mockLocations);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Курорт Игора")).toBeInTheDocument();
    });

    const addButton = screen.getByRole("button", { name: /Добавить локацию/i });
    fireEvent.click(addButton);

    const titleInput = await screen.findByLabelText("Название");
    const addressInput = screen.getByLabelText("Адрес");
    const latInput = screen.getByLabelText("Широта (latitude)");

    fireEvent.change(titleInput, { target: { value: "Тестовая локация" } });
    fireEvent.change(addressInput, { target: { value: "Тестовый адрес" } });
    // Invalid latitude > 90
    fireEvent.change(latInput, { target: { value: "105.5" } });

    const submitButton = screen.getByRole("button", { name: "Добавить" });
    fireEvent.click(submitButton);

    expect(toast.error).toHaveBeenCalledWith("Широта должна быть числом от -90 до 90");
    expect(api.createLocation).not.toHaveBeenCalled();
  });

  it("renders empty state placeholder when no locations are available", async () => {
    vi.mocked(api.adminGetLocations).mockResolvedValue([]);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Локации не добавлены")).toBeInTheDocument();
    });
  });

  it("reorders locations using arrow buttons", async () => {
    vi.mocked(api.adminGetLocations).mockResolvedValue(mockLocations);
    vi.mocked(api.updateLocation).mockResolvedValue({} as any);

    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Курорт Игора")).toBeInTheDocument();
    });

    const downButtons = screen.getAllByTitle("Опустить ниже");
    fireEvent.click(downButtons[0]);

    await waitFor(() => {
      expect(api.updateLocation).toHaveBeenCalledWith(1, { order: 2 });
      expect(api.updateLocation).toHaveBeenCalledWith(2, { order: 1 });
      expect(toast.success).toHaveBeenCalledWith("Порядок изменен");
    });
  });
});
