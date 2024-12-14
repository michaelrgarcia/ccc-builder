import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import Header from "../components/Header";

describe("Header", () => {
  it("renders header", () => {
    render(<Header />);
    expect(screen.getByRole("heading").textContent).toMatch(/first test/i);
  });
});
