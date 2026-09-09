import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import GeometricPatterns from "../GeometricPatterns";

describe("GeometricPatterns Component", () => {
  it("renders 'x-grid' pattern with grid of cross symbols", () => {
    const { container } = render(
      <GeometricPatterns type="x-grid" color="primary" size="md" opacity={20} />
    );

    const patternWrapper = container.firstElementChild as HTMLElement;
    expect(patternWrapper).toHaveClass("absolute", "pointer-events-none");

    const innerDiv = patternWrapper.querySelector("div");
    expect(innerDiv).toHaveClass("text-primary", "text-4xl", "md:text-6xl");
    expect(innerDiv?.style.opacity).toBe("0.2");

    const crosses = patternWrapper.querySelectorAll("span");
    expect(crosses.length).toBe(15);
    expect(crosses[0].textContent).toBe("×");
  });

  it("renders 'chevrons-left' pattern with chevron elements", () => {
    const { container } = render(
      <GeometricPatterns type="chevrons-left" color="white" size="sm" opacity={40} />
    );

    const innerDiv = container.querySelector(".text-ski-white");
    expect(innerDiv).toBeInTheDocument();
    expect(innerDiv).toHaveClass("text-2xl", "md:text-4xl");
    expect(innerDiv?.textContent).toContain("‹‹‹");
  });

  it("renders 'chevrons-right' pattern with chevron elements", () => {
    const { container } = render(
      <GeometricPatterns type="chevrons-right" color="black" size="lg" opacity={50} />
    );

    const innerDiv = container.querySelector(".text-ski-black");
    expect(innerDiv).toBeInTheDocument();
    expect(innerDiv).toHaveClass("text-5xl", "md:text-7xl");
    expect(innerDiv?.textContent).toContain("›››");
  });

  it("renders 'zigzag' SVG pattern with paths and attributes", () => {
    const { container } = render(
      <GeometricPatterns type="zigzag" color="muted" size="xl" opacity={10} />
    );

    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveAttribute("viewBox", "0 0 100 40");

    const paths = container.querySelectorAll("path");
    expect(paths.length).toBe(2);
    expect(paths[0]).toHaveAttribute("d", "M0,20 L20,5 L40,20 L60,5 L80,20 L100,5");
    expect(paths[1]).toHaveAttribute("d", "M0,35 L20,20 L40,35 L60,20 L80,35 L100,20");

    const patternContainer = container.querySelector(".text-muted-foreground");
    expect(patternContainer).toHaveClass("text-6xl", "md:text-8xl");
  });

  it("renders 'triangle' symbol with correct text and styling", () => {
    const { container } = render(
      <GeometricPatterns type="triangle" color="primary" size="sm" opacity={30} />
    );

    const triangle = container.querySelector(".text-primary");
    expect(triangle?.textContent?.trim()).toBe("▲");
    expect(triangle?.style.opacity).toBe("0.3");
  });

  it("applies custom className and default color and size props", () => {
    const { container } = render(
      <GeometricPatterns type="triangle" className="custom-pattern-pos -top-4 -right-4" />
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper).toHaveClass("custom-pattern-pos", "-top-4", "-right-4");

    // Default color is 'white' -> 'text-ski-white', default size 'md' -> 'text-4xl md:text-6xl', default opacity 30 -> '0.3'
    const triangle = container.querySelector(".text-ski-white");
    expect(triangle).toHaveClass("text-4xl", "md:text-6xl");
    expect(triangle?.style.opacity).toBe("0.3");
  });

  it("renders empty when unknown type is provided", () => {
    const { container } = render(
      <GeometricPatterns type={"unknown-type" as any} />
    );

    const wrapper = container.firstElementChild as HTMLElement;
    expect(wrapper.children.length).toBe(0);
  });
});
