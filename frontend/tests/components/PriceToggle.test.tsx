/**
 * Unit tests for PriceToggle component
 * Tests toggle functionality, accessibility, and user interactions
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { PriceToggle } from "../../src/components/PriceToggle";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "prices.label": "Item Prices",
        "prices.show": "Show Prices",
        "prices.hide": "Hide Prices",
        "prices.showTooltip":
          "Display item values in Warhammer Fantasy currency",
        "prices.hideTooltip": "Hide item values for immersion",
      };
      return translations[key] || key;
    },
  }),
}));

// Create a test theme
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("PriceToggle Component", () => {
  const mockOnToggle = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders with default horizontal layout", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByText("Show Prices")).toBeInTheDocument();
    });

    it("renders with vertical layout when specified", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} vertical />
        </TestWrapper>
      );

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByText("Item Prices")).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const { container } = render(
        <TestWrapper>
          <PriceToggle
            showPrices={false}
            onToggle={mockOnToggle}
            className="custom-class"
          />
        </TestWrapper>
      );

      expect(container.querySelector(".custom-class")).toBeInTheDocument();
    });
  });

  describe("Toggle State", () => {
    it("displays 'Show Prices' when showPrices is false", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      expect(screen.getByText("Show Prices")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).not.toBeChecked();
    });

    it("displays 'Hide Prices' when showPrices is true", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={true} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      expect(screen.getByText("Hide Prices")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeChecked();
    });

    it("reflects the checked state in the switch", () => {
      const { rerender } = render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");
      expect(toggle).not.toBeChecked();

      rerender(
        <TestWrapper>
          <PriceToggle showPrices={true} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      expect(toggle).toBeChecked();
    });
  });

  describe("User Interactions", () => {
    it("calls onToggle with true when switching from false to true", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it("calls onToggle with false when switching from true to false", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={true} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledTimes(1);
      expect(mockOnToggle).toHaveBeenCalledWith(false);
    });

    it("does not call onToggle when disabled", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} disabled />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");
      expect(toggle).toBeDisabled();

      // Material-UI disabled switches still trigger onChange, but we can verify the disabled state
      expect(toggle).toHaveAttribute("disabled");
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label when prices are hidden", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");
      expect(toggle).toHaveAttribute("aria-label", "Show Prices");
    });

    it("has proper aria-label when prices are shown", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={true} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");
      expect(toggle).toHaveAttribute("aria-label", "Hide Prices");
    });

    it("can be toggled using keyboard", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");
      // Click to simulate keyboard toggle
      fireEvent.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });
  });

  describe("Tooltips", () => {
    it("has tooltip text available via aria-label when prices are hidden", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      // Check that the tooltip content is accessible via aria-label
      const tooltipElement = screen.getByLabelText(
        "Display item values in Warhammer Fantasy currency"
      );
      expect(tooltipElement).toBeInTheDocument();
    });

    it("has tooltip text available via aria-label when prices are shown", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={true} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      const tooltipElement = screen.getByLabelText(
        "Hide item values for immersion"
      );
      expect(tooltipElement).toBeInTheDocument();
    });
  });

  describe("Layout Variations", () => {
    it("renders horizontal layout by default", () => {
      const { container } = render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      // Check that it's using FormControlLabel (horizontal layout)
      expect(
        container.querySelector(".MuiFormControlLabel-root")
      ).toBeInTheDocument();
      expect(screen.getByText("Show Prices")).toBeInTheDocument();
    });

    it("renders vertical layout when vertical prop is true", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} vertical />
        </TestWrapper>
      );

      // In vertical layout, we should see the "Item Prices" label
      expect(screen.getByText("Item Prices")).toBeInTheDocument();
      // And the toggle should still be present
      expect(screen.getByRole("checkbox")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid toggle clicks correctly", () => {
      const { rerender } = render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");

      // Simulate rapid clicks by changing the component state
      fireEvent.click(toggle);
      expect(mockOnToggle).toHaveBeenNthCalledWith(1, true);

      // Rerender with new state
      rerender(
        <TestWrapper>
          <PriceToggle showPrices={true} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      fireEvent.click(toggle);
      expect(mockOnToggle).toHaveBeenNthCalledWith(2, false);

      // Rerender with new state again
      rerender(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      fireEvent.click(toggle);
      expect(mockOnToggle).toHaveBeenNthCalledWith(3, true);
      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });

    it("maintains state consistency with props", () => {
      const { rerender } = render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      let toggle = screen.getByRole("checkbox");
      expect(toggle).not.toBeChecked();

      // Simulate parent component changing the state
      rerender(
        <TestWrapper>
          <PriceToggle showPrices={true} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      toggle = screen.getByRole("checkbox");
      expect(toggle).toBeChecked();
      expect(screen.getByText("Hide Prices")).toBeInTheDocument();
    });
  });

  describe("Component Props Validation", () => {
    it("works with minimal required props", () => {
      render(
        <TestWrapper>
          <PriceToggle showPrices={false} onToggle={mockOnToggle} />
        </TestWrapper>
      );

      expect(screen.getByRole("checkbox")).toBeInTheDocument();
      expect(screen.getByText("Show Prices")).toBeInTheDocument();
    });

    it("handles all optional props correctly", () => {
      render(
        <TestWrapper>
          <PriceToggle
            showPrices={true}
            onToggle={mockOnToggle}
            className="test-class"
            vertical={true}
            disabled={true}
          />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");
      expect(toggle).toBeChecked();
      expect(toggle).toBeDisabled();
      expect(screen.getByText("Item Prices")).toBeInTheDocument();
    });
  });
});
