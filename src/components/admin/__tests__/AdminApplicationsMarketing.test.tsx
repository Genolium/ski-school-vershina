import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AdminApplications, { formatMarketingSource, formatDateSafe } from "../AdminApplications";
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

describe("AdminApplications - Marketing Insights & 152-ФЗ Compliance", () => {
  let queryClient: QueryClient;

  const mockApplications: api.Application[] = [
    {
      id: 201,
      name: "Дмитрий Кузнецов",
      phone: "+7 (981) 111-22-33",
      tariff: "Active",
      status: "pending",
      created_at: "2026-09-08T10:30:00Z",
      utm_source: "yandex",
      utm_medium: "cpc",
      utm_campaign: "Дети СПб",
      utm_content: "banner_winter",
      utm_term: "лыжи для детей",
      consent_given: true,
      consent_policy_version: "2026.1",
      consent_timestamp: "2026-09-08T10:29:55Z",
      client_ip: "178.62.199.45",
    },
    {
      id: 202,
      name: "Екатерина Морозова",
      phone: "+7 (921) 444-55-66",
      tariff: "Pro",
      status: "contacted",
      created_at: "2026-09-08T12:15:00Z",
      utm_source: "vk",
      utm_medium: "target",
      utm_campaign: "Взрослые 2026",
      consent_given: true,
      consent_policy_version: "2026.1",
      consent_timestamp: "2026-09-08T12:14:50Z",
      client_ip: "95.24.120.10",
    },
    {
      id: 203,
      name: "Сергей Васильев",
      phone: "+7 (999) 777-88-99",
      tariff: "Standard",
      status: "completed",
      created_at: "2026-09-08T14:00:00Z",
      // Direct visit without UTM
      consent_given: true,
      consent_policy_version: "2026.1",
      consent_timestamp: "2026-09-08T13:59:45Z",
      client_ip: "213.87.160.2",
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
        <AdminApplications />
      </QueryClientProvider>
    );

  it("renders rich marketing UTM badges and campaign labels", async () => {
    vi.mocked(api.getApplications).mockResolvedValue(mockApplications);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Дмитрий Кузнецов")).toBeInTheDocument();
    });

    // Yandex source is formatted to Яндекс.Директ
    expect(screen.getByText("Яндекс.Директ")).toBeInTheDocument();
    expect(screen.getByText("Дети СПб")).toBeInTheDocument();

    // VK source badge
    expect(screen.getByText("VK")).toBeInTheDocument();
    expect(screen.getByText("Взрослые 2026")).toBeInTheDocument();

    // Direct visit
    expect(screen.getByText("Прямой заход")).toBeInTheDocument();
  });

  it("renders emerald 152-ФЗ consent proof badges for all applications with consent", async () => {
    vi.mocked(api.getApplications).mockResolvedValue(mockApplications);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Дмитрий Кузнецов")).toBeInTheDocument();
    });

    // Emerald badges "152-ФЗ Согласие подтверждено"
    const consentBadges = screen.getAllByText("152-ФЗ Согласие подтверждено");
    expect(consentBadges.length).toBe(3);
  });

  it("filters applications by marketing channel/source", async () => {
    vi.mocked(api.getApplications).mockResolvedValue(mockApplications);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Дмитрий Кузнецов")).toBeInTheDocument();
      expect(screen.getByText("Екатерина Морозова")).toBeInTheDocument();
      expect(screen.getByText("Сергей Васильев")).toBeInTheDocument();
    });

    // Open channel filter select (first combobox on the page)
    const channelSelect = screen.getAllByRole("combobox")[0];
    fireEvent.click(channelSelect);

    // Filter by "Рекламные (все с UTM)"
    const utmOption = await screen.findByRole("option", { name: /Рекламные \(все с UTM\)/i });
    fireEvent.click(utmOption);

    // Only Dmitry and Ekaterina should be shown
    expect(screen.getByText("Дмитрий Кузнецов")).toBeInTheDocument();
    expect(screen.getByText("Екатерина Морозова")).toBeInTheDocument();
    expect(screen.queryByText("Сергей Васильев")).not.toBeInTheDocument();

    // Now filter by "Прямой заход (без меток)"
    fireEvent.click(channelSelect);
    const directOption = await screen.findByRole("option", { name: /Прямой заход \(без меток\)/i });
    fireEvent.click(directOption);

    // Only Sergey should be shown
    expect(screen.queryByText("Дмитрий Кузнецов")).not.toBeInTheDocument();
    expect(screen.queryByText("Екатерина Морозова")).not.toBeInTheDocument();
    expect(screen.getByText("Сергей Васильев")).toBeInTheDocument();
  });

  it("searches applications by campaign name and marketing keywords", async () => {
    vi.mocked(api.getApplications).mockResolvedValue(mockApplications);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Дмитрий Кузнецов")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/Поиск по имени, телефону, тарифу, источнику/i);

    // Search by campaign name "Дети СПб"
    fireEvent.change(searchInput, { target: { value: "Дети СПб" } });
    expect(screen.getByText("Дмитрий Кузнецов")).toBeInTheDocument();
    expect(screen.queryByText("Екатерина Морозова")).not.toBeInTheDocument();
    expect(screen.queryByText("Сергей Васильев")).not.toBeInTheDocument();

    // Search by keyword "лыжи для детей"
    fireEvent.change(searchInput, { target: { value: "лыжи для детей" } });
    expect(screen.getByText("Дмитрий Кузнецов")).toBeInTheDocument();
    expect(screen.queryByText("Екатерина Морозова")).not.toBeInTheDocument();
  });

  it("opens details dialog with complete marketing and 152-ФЗ compliance audit trail", async () => {
    vi.mocked(api.getApplications).mockResolvedValue(mockApplications);
    renderComponent();

    await waitFor(() => {
      expect(screen.getByText("Дмитрий Кузнецов")).toBeInTheDocument();
    });

    // Click the details/eye button for the first application
    const detailsButtons = screen.getAllByTitle("Просмотр карточки заявки и аудита 152-ФЗ");
    fireEvent.click(detailsButtons[0]);

    // Modal dialog should open with title
    expect(await screen.findByText("Заявка #201")).toBeInTheDocument();
    expect(screen.getByText("Маркетинговые метрики (UTM)")).toBeInTheDocument();
    expect(screen.getByText("Юридический след согласия 152-ФЗ")).toBeInTheDocument();
    expect(screen.getByText("178.62.199.45")).toBeInTheDocument();
    expect(screen.getByText("2026.1")).toBeInTheDocument();
  });

  describe("formatMarketingSource helper", () => {
    it("correctly maps known advertising channels to Russian labels", () => {
      expect(formatMarketingSource("yandex", "cpc")).toBe("Яндекс.Директ");
      expect(formatMarketingSource("yandex")).toBe("Яндекс");
      expect(formatMarketingSource("vk")).toBe("VK");
      expect(formatMarketingSource("google", "cpc")).toBe("Google Ads");
      expect(formatMarketingSource("tg")).toBe("Telegram");
      expect(formatMarketingSource("avito")).toBe("Авито");
      expect(formatMarketingSource(undefined)).toBe("Прямой заход");
    });
  });

  describe("formatDateSafe helper", () => {
    it("safely formats valid dates and prevents Invalid Date output", () => {
      const formatted = formatDateSafe("2026-09-08T10:30:00Z");
      expect(formatted).not.toBe("-");
      expect(formatted).not.toContain("Invalid");

      expect(formatDateSafe(undefined)).toBe("-");
      expect(formatDateSafe("not-a-date")).toBe("-");
    });
  });

  describe("Excel / CSV Export", () => {
    it("exports CSV with UTF-8 BOM, escaped quotes, formula-protected phone numbers, and all 12 columns", async () => {
      vi.mocked(api.getApplications).mockResolvedValue(mockApplications);

      // Mock URL.createObjectURL and document.createElement anchor
      const createObjectURLSpy = vi
        .spyOn(URL, "createObjectURL")
        .mockReturnValue("blob:http://localhost/test-blob");
      const revokeObjectURLSpy = vi.spyOn(URL, "revokeObjectURL").mockImplementation(() => {});

      let capturedBlob: Blob | null = null;
      window.Blob = class MockBlob extends Blob {
        constructor(content?: any[], options?: any) {
          super(content, options);
          if (content) {
            capturedBlob = this;
            (this as any)._capturedContent = content;
          }
        }
      } as any;

      renderComponent();

      await waitFor(() => {
        expect(screen.getByText("Дмитрий Кузнецов")).toBeInTheDocument();
      });

      const exportButton = screen.getByRole("button", { name: /Экспорт в Excel/i });
      fireEvent.click(exportButton);

      expect(toast.success).toHaveBeenCalledWith("Файл успешно экспортирован в CSV / Excel");
      expect(capturedBlob).not.toBeNull();

      const text = ((capturedBlob as any)._capturedContent as string[]).join("");

      // 1. Starts with UTF-8 BOM for Excel
      expect(text.startsWith("\uFEFF")).toBe(true);

      // 2. Contains all 12 required headers delimited by semicolon
      expect(text).toContain(
        "ID;Имя;Телефон;Тариф / Направление;Статус;Дата создания;Источник (UTM Source);Кампания (UTM Campaign);Канал (UTM Medium);Согласие 152-ФЗ;Дата согласия;IP адрес"
      );

      // 3. Phone numbers are formatted with Excel formula ="phone" to avoid formula `#NAME?` or scientific notation
      expect(text).toContain('"=""+7 (981) 111-22-33"""');

      // 4. Marketing and compliance attributes are present
      expect(text).toContain('"yandex"');
      expect(text).toContain('"Дети СПб"');
      expect(text).toContain('"178.62.199.45"');
      expect(text).toContain('"Подтверждено"');

      createObjectURLSpy.mockRestore();
      revokeObjectURLSpy.mockRestore();
    });
  });
});
