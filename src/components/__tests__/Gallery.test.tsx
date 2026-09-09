import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import Gallery from "../Gallery";
import * as api from "@/lib/api";

vi.mock("@/lib/api", () => ({
  getMedia: vi.fn(),
}));

describe("Gallery Component", () => {
  const mockMedia: api.Media[] = [
    {
      id: 101,
      title: "Тренировка слалома на склоне",
      description: "Отработка коротких дуг и поворотов",
      file_path: "/uploads/slalom.jpg",
      media_type: "photo",
      category: "Тренировки",
      order: 1,
      is_active: true,
      created_at: "2026-09-01T10:00:00Z",
    },
    {
      id: 102,
      title: "Видео спуска чемпионата",
      description: "Финальный заезд на время",
      file_path: "/uploads/championship.mp4",
      media_type: "video",
      category: "Соревнования",
      order: 2,
      is_active: true,
      created_at: "2026-09-02T10:00:00Z",
    },
    {
      id: 103,
      title: "Сборы в горах Хибины",
      description: "Командная тренировка на леднике",
      file_path: "/uploads/camps-khibiny.jpg",
      media_type: "photo",
      category: "Сборы",
      order: 3,
      is_active: true,
      created_at: "2026-09-03T10:00:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders category filtering tabs ('Все', 'Тренировки', 'Соревнования', 'Сборы')", async () => {
    vi.mocked(api.getMedia).mockResolvedValue(mockMedia);

    render(<Gallery />);

    expect(screen.getByRole("tab", { name: "Все" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Тренировки" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Соревнования" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Сборы" })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("gallery-item-101")).toBeInTheDocument();
    });
  });

  it("renders media items from API (both photo and video)", async () => {
    vi.mocked(api.getMedia).mockResolvedValue(mockMedia);

    render(<Gallery />);

    await waitFor(() => {
      expect(screen.getByTestId("gallery-item-101")).toBeInTheDocument();
      expect(screen.getByTestId("gallery-item-102")).toBeInTheDocument();
      expect(screen.getByTestId("gallery-item-103")).toBeInTheDocument();
    });

    // Check photo
    const photoItem = screen.getByTestId("gallery-item-101");
    const img = photoItem.querySelector("img");
    expect(img).toHaveAttribute("src", expect.stringContaining("slalom.jpg"));

    // Check video item with play trigger
    const videoItem = screen.getByTestId("gallery-item-102");
    expect(videoItem.querySelector("video")).toBeInTheDocument();
    expect(screen.getByTestId("video-play-trigger")).toBeInTheDocument();
  });

  it("filters media items when clicking category tabs", async () => {
    vi.mocked(api.getMedia).mockResolvedValue(mockMedia);

    render(<Gallery />);

    await waitFor(() => {
      expect(screen.getByTestId("gallery-item-101")).toBeInTheDocument();
    });

    // Switch to "Тренировки"
    const trainingTab = screen.getByRole("tab", { name: "Тренировки" });
    fireEvent.click(trainingTab);

    expect(screen.getByTestId("gallery-item-101")).toBeInTheDocument();
    expect(screen.queryByTestId("gallery-item-102")).not.toBeInTheDocument();
    expect(screen.queryByTestId("gallery-item-103")).not.toBeInTheDocument();

    // Switch to "Соревнования"
    const compTab = screen.getByRole("tab", { name: "Соревнования" });
    fireEvent.click(compTab);

    expect(screen.queryByTestId("gallery-item-101")).not.toBeInTheDocument();
    expect(screen.getByTestId("gallery-item-102")).toBeInTheDocument();
    expect(screen.queryByTestId("gallery-item-103")).not.toBeInTheDocument();

    // Switch to "Сборы"
    const campTab = screen.getByRole("tab", { name: "Сборы" });
    fireEvent.click(campTab);

    expect(screen.queryByTestId("gallery-item-101")).not.toBeInTheDocument();
    expect(screen.queryByTestId("gallery-item-102")).not.toBeInTheDocument();
    expect(screen.getByTestId("gallery-item-103")).toBeInTheDocument();

    // Switch back to "Все"
    const allTab = screen.getByRole("tab", { name: "Все" });
    fireEvent.click(allTab);

    expect(screen.getByTestId("gallery-item-101")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-item-102")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-item-103")).toBeInTheDocument();
  });

  it("opens photo lightbox modal with controls, title, counter and handles navigation", async () => {
    vi.mocked(api.getMedia).mockResolvedValue(mockMedia);

    render(<Gallery />);

    await waitFor(() => {
      expect(screen.getByTestId("gallery-item-101")).toBeInTheDocument();
    });

    // Click on photo item
    fireEvent.click(screen.getByTestId("gallery-item-101"));

    // Modal dialog is open
    const dialog = screen.getByRole("dialog", { name: "Просмотр фотографии" });
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("Тренировка слалома на склоне")).toBeInTheDocument();
    expect(screen.getByText("Отработка коротких дуг и поворотов")).toBeInTheDocument();
    expect(screen.getByText("1 / 3")).toBeInTheDocument();

    // Next item button
    const nextBtn = screen.getByRole("button", { name: "Следующий элемент" });
    fireEvent.click(nextBtn);

    // Now video is shown (2 / 3)
    expect(screen.getByText("Видео спуска чемпионата")).toBeInTheDocument();
    expect(screen.getByText("2 / 3")).toBeInTheDocument();

    // Prev item button
    const prevBtn = screen.getByRole("button", { name: "Предыдущий элемент" });
    fireEvent.click(prevBtn);

    expect(screen.getByText("Тренировка слалома на склоне")).toBeInTheDocument();

    // Keyboard navigation: ArrowRight
    fireEvent.keyDown(document, { key: "ArrowRight" });
    expect(screen.getByText("Видео спуска чемпионата")).toBeInTheDocument();

    // Keyboard navigation: ArrowLeft
    fireEvent.keyDown(document, { key: "ArrowLeft" });
    expect(screen.getByText("Тренировка слалома на склоне")).toBeInTheDocument();

    // Escape closes modal
    fireEvent.keyDown(document, { key: "Escape" });
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("triggers video play and opens modal with video player", async () => {
    vi.mocked(api.getMedia).mockResolvedValue(mockMedia);

    render(<Gallery />);

    await waitFor(() => {
      expect(screen.getByTestId("gallery-item-102")).toBeInTheDocument();
    });

    const playTrigger = screen.getByTestId("video-play-trigger");
    fireEvent.click(playTrigger);

    const dialog = screen.getByRole("dialog", { name: "Просмотр видео" });
    expect(dialog).toBeInTheDocument();

    const videoInModal = dialog.querySelector("video");
    expect(videoInModal).toBeInTheDocument();
    expect(videoInModal).toHaveAttribute("controls");

    // Close with X button
    const closeBtn = screen.getByRole("button", { name: "Закрыть" });
    fireEvent.click(closeBtn);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders fallback default photos when API fails", async () => {
    vi.mocked(api.getMedia).mockRejectedValue(new Error("Network error"));

    render(<Gallery />);

    await waitFor(() => {
      // Default photos have 12 items
      expect(screen.getByTestId("gallery-item-1")).toBeInTheDocument();
    });

    // Check that items 1 through 12 exist
    for (let i = 1; i <= 12; i++) {
      expect(screen.getByTestId(`gallery-item-${i}`)).toBeInTheDocument();
    }

    // Category tabs still work on fallback
    const trainingTab = screen.getByRole("tab", { name: "Тренировки" });
    fireEvent.click(trainingTab);

    // Items 1, 2, 3, 4 are training photos
    expect(screen.getByTestId("gallery-item-1")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-item-2")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-item-3")).toBeInTheDocument();
    expect(screen.getByTestId("gallery-item-4")).toBeInTheDocument();
    expect(screen.queryByTestId("gallery-item-5")).not.toBeInTheDocument();

    // Lightbox opens for fallback item
    fireEvent.click(screen.getByTestId("gallery-item-1"));
    expect(screen.getByRole("dialog", { name: "Просмотр фотографии" })).toBeInTheDocument();

    // Close on backdrop click
    const backdrop = screen.getByRole("dialog");
    fireEvent.click(backdrop);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});
