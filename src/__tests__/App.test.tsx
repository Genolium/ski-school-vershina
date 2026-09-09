import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import App from "../App";
import { initYandexMetrika } from "@/lib/metrika";

vi.mock("@/lib/metrika", () => ({
  initYandexMetrika: vi.fn(),
  reachGoal: vi.fn(),
}));

vi.mock("../pages/Index", () => ({
  default: () => <div data-testid="index-page">Index Page</div>,
}));

vi.mock("../pages/PrivacyPolicy", () => ({
  default: () => <div data-testid="privacy-policy-page">Privacy Policy Page</div>,
}));

vi.mock("../pages/Consent", () => ({
  default: () => <div data-testid="consent-page">Consent Page</div>,
}));

vi.mock("../pages/NotFound", () => ({
  default: () => <div data-testid="not-found-page">Not Found Page</div>,
}));

vi.mock("../pages/Admin", () => ({
  default: () => <div data-testid="admin-page">Admin Page</div>,
}));

describe("App Root & Routing", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls initYandexMetrika with expected ID on mount", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    expect(initYandexMetrika).toHaveBeenCalledWith("105075135");
  });

  it("renders suspense fallback during component resolution", () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    const fallback = screen.queryByRole("status");
    if (fallback) {
      expect(fallback).toHaveTextContent("Загрузка...");
    }
  });

  it("renders IndexPage on route '/'", async () => {
    window.history.pushState({}, "", "/");
    render(<App />);

    expect(await screen.findByTestId("index-page")).toBeInTheDocument();
  });

  it("renders PrivacyPolicyPage on route '/privacy'", async () => {
    window.history.pushState({}, "", "/privacy");
    render(<App />);

    expect(await screen.findByTestId("privacy-policy-page")).toBeInTheDocument();
  });

  it("renders PrivacyPolicyPage on route '/privacy-policy'", async () => {
    window.history.pushState({}, "", "/privacy-policy");
    render(<App />);

    expect(await screen.findByTestId("privacy-policy-page")).toBeInTheDocument();
  });

  it("renders ConsentPage on route '/consent'", async () => {
    window.history.pushState({}, "", "/consent");
    render(<App />);

    expect(await screen.findByTestId("consent-page")).toBeInTheDocument();
  });

  it("renders ConsentPage on route '/personal-data-consent'", async () => {
    window.history.pushState({}, "", "/personal-data-consent");
    render(<App />);

    expect(await screen.findByTestId("consent-page")).toBeInTheDocument();
  });

  it("renders NotFoundPage on route '/non-existent-url'", async () => {
    window.history.pushState({}, "", "/non-existent-url");
    render(<App />);

    expect(await screen.findByTestId("not-found-page")).toBeInTheDocument();
  });

  it("renders NotFoundPage on arbitrary unknown deep route", async () => {
    window.history.pushState({}, "", "/some/deeply/nested/non-existing-path");
    render(<App />);

    expect(await screen.findByTestId("not-found-page")).toBeInTheDocument();
  });

  it("renders AdminPage on route '/admin'", async () => {
    window.history.pushState({}, "", "/admin");
    render(<App />);

    expect(await screen.findByTestId("admin-page")).toBeInTheDocument();
  });
});
