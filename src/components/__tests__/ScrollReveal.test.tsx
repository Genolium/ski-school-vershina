import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import ScrollReveal from "../ScrollReveal";
import * as observerHook from "@/hooks/useIntersectionObserver";

describe("ScrollReveal Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders children properly", () => {
    render(
      <ScrollReveal>
        <span data-testid="child-content">Горнолыжная школа</span>
      </ScrollReveal>
    );

    expect(screen.getByTestId("child-content")).toBeInTheDocument();
    expect(screen.getByText("Горнолыжная школа")).toBeInTheDocument();
  });

  it("applies transitionDelay and backdrop blur delay according to delay prop", () => {
    const { container } = render(
      <ScrollReveal delay={250}>
        <div>Animated Item</div>
      </ScrollReveal>
    );

    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv.style.transitionDelay).toBe("250ms");

    const innerDiv = outerDiv.firstElementChild as HTMLElement;
    expect(innerDiv.style.getPropertyValue("--backdrop-blur-delay")).toBe("250ms");
  });

  it("applies visibility classes when element is in viewport", () => {
    // Default mock observer in setup.ts sets isVisible to true
    const { container } = render(
      <ScrollReveal>
        <div>Visible Item</div>
      </ScrollReveal>
    );

    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv).toHaveClass("translate-y-0", "translate-x-0", "opacity-100");

    const innerDiv = outerDiv.firstElementChild as HTMLElement;
    expect(innerDiv).toHaveAttribute("data-visible", "true");
  });

  it("applies initial direction transform and opacity-0 when not visible", () => {
    const mockRef = { current: null };
    const spy = vi.spyOn(observerHook, "useIntersectionObserver");

    // Direction: up (translate-y-8)
    spy.mockReturnValue([mockRef, false]);
    const { container: containerUp, rerender } = render(
      <ScrollReveal direction="up">
        <div>Up Item</div>
      </ScrollReveal>
    );
    expect(containerUp.firstElementChild).toHaveClass("translate-y-8", "opacity-0");

    // Direction: down (-translate-y-8)
    rerender(
      <ScrollReveal direction="down">
        <div>Down Item</div>
      </ScrollReveal>
    );
    expect(containerUp.firstElementChild).toHaveClass("-translate-y-8", "opacity-0");

    // Direction: left (-translate-x-8)
    rerender(
      <ScrollReveal direction="left">
        <div>Left Item</div>
      </ScrollReveal>
    );
    expect(containerUp.firstElementChild).toHaveClass("-translate-x-8", "opacity-0");

    // Direction: right (translate-x-8)
    rerender(
      <ScrollReveal direction="right">
        <div>Right Item</div>
      </ScrollReveal>
    );
    expect(containerUp.firstElementChild).toHaveClass("translate-x-8", "opacity-0");

    // Direction: fade (no translation)
    rerender(
      <ScrollReveal direction="fade">
        <div>Fade Item</div>
      </ScrollReveal>
    );
    const fadeDiv = containerUp.firstElementChild as HTMLElement;
    expect(fadeDiv).toHaveClass("opacity-0");
    expect(fadeDiv.className).not.toContain("translate-");
  });

  it("merges custom className and applies h-full styling to inner element", () => {
    const { container } = render(
      <ScrollReveal className="custom-class h-full">
        <div>Full Height Box</div>
      </ScrollReveal>
    );

    const outerDiv = container.firstElementChild as HTMLElement;
    expect(outerDiv).toHaveClass("custom-class", "h-full");

    const innerDiv = outerDiv.firstElementChild as HTMLElement;
    expect(innerDiv).toHaveClass("h-full", "flex", "flex-col");
  });
});
