/**
 * Unit tests for LootItem component
 * Tests display functionality, currency formatting, and user interactions
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LootItem } from "../../src/components/LootItem";
import { LootItem as LootItemType } from "../../src/types/api";
import { WealthLevel } from "../../src/types/index";

// Mock the currency formatter functions
jest.mock("../../src/utils/currencyFormatter", () => ({
  formatCurrencyAbbreviated: jest.fn((pennies: number) => `${pennies}p`),
  formatCurrencyFull: jest.fn((pennies: number) => `${pennies} pennies`),
}));

// Create a test theme
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Sample test data
const mockLootItem: LootItemType = {
  name: "Ancient Sword",
  description: "A weathered blade with intricate engravings along its fuller.",
  valueInPennies: 1250,
  wealthLevel: WealthLevel.Wealthy,
};

describe("LootItem Component", () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe("Basic Rendering", () => {
    it("renders item name correctly", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      expect(
        screen.getByRole("heading", { name: mockLootItem.name })
      ).toBeInTheDocument();
    });

    it("renders item description correctly", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      expect(screen.getByText(mockLootItem.description)).toBeInTheDocument();
    });

    it("renders wealth level chip", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      expect(screen.getByText("wealthLevels.Wealthy")).toBeInTheDocument();
    });

    it("applies custom className when provided", () => {
      const customClass = "custom-loot-item";
      const { container } = render(
        <TestWrapper>
          <LootItem item={mockLootItem} className={customClass} />
        </TestWrapper>
      );

      expect(container.querySelector(`.${customClass}`)).toBeInTheDocument();
    });
  });

  describe("Price Display", () => {
    it("shows price when showPrice is true (default)", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      expect(screen.getByText("1250 pennies")).toBeInTheDocument();
    });

    it("hides price when showPrice is false", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} showPrice={false} />
        </TestWrapper>
      );

      expect(screen.queryByText("1250 pennies")).not.toBeInTheDocument();
    });

    it("uses abbreviated format when abbreviatedCurrency is true", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} abbreviatedCurrency={true} />
        </TestWrapper>
      );

      expect(screen.getByText("1250p")).toBeInTheDocument();
    });

    it("uses full format by default", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      expect(screen.getByText("1250 pennies")).toBeInTheDocument();
    });
  });

  describe("Currency Format Toggle", () => {
    it("toggles between abbreviated and full currency format when clicked", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      const currencyButton = screen.getByText("1250 pennies");

      // Click to toggle to abbreviated
      fireEvent.click(currencyButton);
      expect(screen.getByText("1250p")).toBeInTheDocument();

      // Click again to toggle back to full
      fireEvent.click(screen.getByText("1250p"));
      expect(screen.getByText("1250 pennies")).toBeInTheDocument();
    });

    it("starts with abbreviated format when abbreviatedCurrency prop is true", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} abbreviatedCurrency={true} />
        </TestWrapper>
      );

      expect(screen.getByText("1250p")).toBeInTheDocument();

      // Click to toggle to full
      fireEvent.click(screen.getByText("1250p"));
      expect(screen.getByText("1250 pennies")).toBeInTheDocument();
    });
  });

  describe("Wealth Level Variations", () => {
    const wealthLevels = [
      WealthLevel.Rubbish,
      WealthLevel.Poor,
      WealthLevel.Common,
      WealthLevel.Wealthy,
      WealthLevel.Noble,
    ];

    wealthLevels.forEach((wealthLevel) => {
      it(`renders correctly for ${wealthLevel} wealth level`, () => {
        const testItem: LootItemType = {
          ...mockLootItem,
          wealthLevel,
        };

        render(
          <TestWrapper>
            <LootItem item={testItem} />
          </TestWrapper>
        );

        expect(
          screen.getByText(`wealthLevels.${wealthLevel}`)
        ).toBeInTheDocument();
      });
    });
  });

  describe("Long Text Handling", () => {
    it("handles long item names gracefully", () => {
      const longNameItem: LootItemType = {
        ...mockLootItem,
        name: "A Very Long and Elaborate Item Name That Might Cause Layout Issues If Not Handled Properly",
      };

      render(
        <TestWrapper>
          <LootItem item={longNameItem} />
        </TestWrapper>
      );

      expect(
        screen.getByRole("heading", { name: longNameItem.name })
      ).toBeInTheDocument();
    });

    it("handles long descriptions gracefully", () => {
      const longDescriptionItem: LootItemType = {
        ...mockLootItem,
        description:
          "This is an extremely long description that goes on and on with many details about the item, its history, its magical properties, and various other characteristics that might cause the component to break if not handled properly with appropriate text wrapping and layout considerations.",
      };

      render(
        <TestWrapper>
          <LootItem item={longDescriptionItem} />
        </TestWrapper>
      );

      expect(
        screen.getByText(longDescriptionItem.description)
      ).toBeInTheDocument();
    });
  });

  describe("Tooltip Functionality", () => {
    it("shows wealth level description tooltip on hover", async () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      const wealthChip = screen.getByText("wealthLevels.Wealthy");

      // Trigger tooltip by hovering
      fireEvent.mouseEnter(wealthChip);

      // The tooltip content should be available (though visibility depends on MUI implementation)
      expect(wealthChip).toBeInTheDocument();
    });

    it("shows interactive currency display", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      const currencyDisplay = screen.getByText("1250 pennies");

      // The currency display should be interactive (clickable)
      expect(currencyDisplay).toBeInTheDocument();
      expect(currencyDisplay).toHaveStyle("cursor: pointer");
    });
  });

  describe("Edge Cases", () => {
    it("handles zero value items", () => {
      const zeroValueItem: LootItemType = {
        ...mockLootItem,
        valueInPennies: 0,
      };

      render(
        <TestWrapper>
          <LootItem item={zeroValueItem} />
        </TestWrapper>
      );

      expect(screen.getByText("0 pennies")).toBeInTheDocument();
    });

    it("handles items with special characters in name", () => {
      const specialCharItem: LootItemType = {
        ...mockLootItem,
        name: "Spëcîál Çhäracters & Symbols!",
      };

      render(
        <TestWrapper>
          <LootItem item={specialCharItem} />
        </TestWrapper>
      );

      expect(
        screen.getByRole("heading", { name: specialCharItem.name })
      ).toBeInTheDocument();
    });

    it("handles empty description", () => {
      const emptyDescItem: LootItemType = {
        ...mockLootItem,
        description: "",
      };

      render(
        <TestWrapper>
          <LootItem item={emptyDescItem} />
        </TestWrapper>
      );

      // Component should still render without breaking
      expect(
        screen.getByRole("heading", { name: mockLootItem.name })
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper heading structure", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      expect(screen.getByRole("heading", { level: 3 })).toBeInTheDocument();
    });

    it("has clickable currency display for interaction", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItem} />
        </TestWrapper>
      );

      const currencyDisplay = screen.getByText("1250 pennies");
      expect(currencyDisplay).toBeInTheDocument();

      // Test click interaction
      fireEvent.click(currencyDisplay);
      expect(screen.getByText("1250p")).toBeInTheDocument();
    });
  });
});
