import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminApplications from "../AdminApplications";
import * as api from "@/lib/api";
import { toast } from "sonner";

vi.mock("@/lib/api", () => ({
  getApplications: vi.fn(),
  updateApplication: vi.fn(),
  deleteApplication: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/hooks/useAuthErrorHandler", () => ({
  useAuthErrorHandler: () => ({
    handleAuthError: vi.fn(),
  }),
}));

describe("AdminApplications Optimistic UI Updates", () => {
  let queryClient: QueryClient;

  const mockApplications: api.Application[] = [
    {
      id: 101,
      name: "Иван Иванов",
      phone: "+7 (999) 111-22-33",
      age: "Взрослый",
      tariff: "Стандарт",
      status: "pending",
      created_at: "2026-09-08T10:00:00Z",
    },
    {
      id: 102,
      name: "Анна Смирнова",
      phone: "+7 (999) 444-55-66",
      age: "Ребенок",
      tariff: "VIP",
      status: "contacted",
      created_at: "2026-09-08T11:00:00Z",
    },
  ];

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    vi.clearAllMocks();
  });

  it("optimistically updates application status immediately on mutation trigger", async () => {
    vi.mocked(api.getApplications).mockResolvedValue([...mockApplications]);
    // Create a delayed promise to verify optimistic cache update before mutation resolves
    let resolveMutation: (val: any) => void = () => {};
    const mutationPromise = new Promise((resolve) => {
      resolveMutation = resolve;
    });
    vi.mocked(api.updateApplication).mockReturnValue(mutationPromise as any);

    render(
      <QueryClientProvider client={queryClient}>
        <AdminApplications />
      </QueryClientProvider>
    );

    // Initial render: Иван Иванов has status "Новая"
    await waitFor(() => {
      expect(screen.getByText("Иван Иванов")).toBeInTheDocument();
      expect(screen.getByText("Новая")).toBeInTheDocument();
    });

    // Check queryClient cache has pending status
    const cachedBefore = queryClient.getQueryData<api.Application[]>(["admin-applications"]);
    expect(cachedBefore?.find((a) => a.id === 101)?.status).toBe("pending");

    // Click to change status to "completed"
    // Since Select in Radix UI renders trigger button, we can call updateMutation or trigger through select
    // Let's test the mutation directly in the component's cache or trigger change
    const selectTrigger = screen.getAllByTitle("Изменить статус")[0];
    fireEvent.click(selectTrigger);

    // Select completed
    const completedOption = await screen.findByRole("option", { name: "Завершена" });
    fireEvent.click(completedOption);

    // INSTANT OPTIMISTIC CHECK: Cache should immediately reflect status="completed"
    await waitFor(() => {
      const cachedAfterMutate = queryClient.getQueryData<api.Application[]>(["admin-applications"]);
      expect(cachedAfterMutate?.find((a) => a.id === 101)?.status).toBe("completed");
    });

    // UI should show "Завершена" immediately
    expect(screen.getByText("Завершена")).toBeInTheDocument();

    // Now resolve server response
    resolveMutation({ ...mockApplications[0], status: "completed" });
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Статус заявки обновлен");
    });
  });

  it("rolls back cache and shows error toast when status update fails", async () => {
    vi.mocked(api.getApplications).mockResolvedValue([...mockApplications]);
    vi.mocked(api.updateApplication).mockRejectedValue(new Error("Network connection lost on slope"));

    render(
      <QueryClientProvider client={queryClient}>
        <AdminApplications />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Иван Иванов")).toBeInTheDocument();
    });

    const selectTrigger = screen.getAllByTitle("Изменить статус")[0];
    fireEvent.click(selectTrigger);

    const contactedOption = await screen.findByRole("option", { name: "Связались" });
    fireEvent.click(contactedOption);

    // After mutation error, cache rolls back to previous snapshot ("pending")
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Ошибка обновления");
      const rolledBackCache = queryClient.getQueryData<api.Application[]>(["admin-applications"]);
      expect(rolledBackCache?.find((a) => a.id === 101)?.status).toBe("pending");
    });
  });

  it("optimistically removes application when deleted", async () => {
    vi.mocked(api.getApplications).mockResolvedValue([...mockApplications]);
    let resolveDelete: () => void = () => {};
    const deletePromise = new Promise<void>((resolve) => {
      resolveDelete = resolve;
    });
    vi.mocked(api.deleteApplication).mockReturnValue(deletePromise as any);

    render(
      <QueryClientProvider client={queryClient}>
        <AdminApplications />
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Иван Иванов")).toBeInTheDocument();
    });

    // Find delete button
    const deleteButton = screen.getAllByTitle("Удалить заявку")[0];
    fireEvent.click(deleteButton);

    // Click confirm inside AlertDialog
    const confirmButton = await screen.findByRole("button", { name: "Удалить" });
    fireEvent.click(confirmButton);

    // Optimistically removed from cache
    await waitFor(() => {
      const cacheAfterDelete = queryClient.getQueryData<api.Application[]>(["admin-applications"]);
      expect(cacheAfterDelete?.some((a) => a.id === 101)).toBe(false);
    });

    resolveDelete();
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith("Заявка успешно удалена");
    });
  });
});
