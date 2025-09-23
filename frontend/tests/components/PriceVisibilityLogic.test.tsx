/**
 * Unit tests focused specifically on the hide/show price logic implementation
 * Task T040: Add hide/show price logic to LootList
 *
 * These tests verify the price visibility feature across LootList and LootItem components
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import LootList from "../../src/components/LootList";
import { LootItem } from "../../src/components/LootItem";
import { LootItem as LootItemType } from "../../src/types/api";
import { WealthLevel } from "../../src/types/index";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "loot.noItems": "No items found",
        "loot.wealthLevels.Rubbish": "Rubbish",
        "loot.wealthLevels.Poor": "Poor",
        "loot.wealthLevels.Common": "Common",
        "loot.wealthLevels.Wealthy": "Wealthy",
        "loot.wealthLevels.Noble": "Noble",
        "loot.wealthLevelDescriptions.Rubbish": "Worthless junk",
        "loot.wealthLevelDescriptions.Poor": "Basic items",
        "loot.wealthLevelDescriptions.Common": "Standard quality",
        "loot.wealthLevelDescriptions.Wealthy": "High quality items",
        "loot.wealthLevelDescriptions.Noble": "Luxury items",
      };
      return translations[key] || key;
    },
  }),
}));

// Mock the currency formatter functions
jest.mock("../../src/utils/currencyFormatter", () => ({
  formatCurrencyAbbreviated: jest.fn(
    (pennies: number) =>
      `${Math.floor(pennies / 240)}gc ${Math.floor((pennies % 240) / 12)}s ${
        pennies % 12
      }p`
  ),
  formatCurrencyFull: jest.fn((pennies: number) => `${pennies} pennies`),
}));

// Create a test theme
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Sample test data
const mockLootItems: LootItemType[] = [
  {
    name: "Rusty Dagger",
    description: "A weathered blade with chipped edges.",
    valueInPennies: 50,
    wealthLevel: WealthLevel.Poor,
  },
  {
    name: "Silver Goblet",
    description: "An ornate drinking vessel with engravings.",
    valueInPennies: 2400, // 10 gold crowns
    wealthLevel: WealthLevel.Wealthy,
  },
  {
    name: "Broken Tool",
    description: "A hammer with a cracked handle.",
    valueInPennies: 5,
    wealthLevel: WealthLevel.Rubbish,
  },
];

describe("Price Visibility Logic (Task T040)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("LootList Price Visibility", () => {
    it("shows prices for all items when showPrices is true", () => {
      render(
        <TestWrapper>
          <LootList items={mockLootItems} showPrices={true} />
        </TestWrapper>
      );

      // Check that price information is visible for all items
      expect(screen.getByText("50 pennies")).toBeInTheDocument();
      expect(screen.getByText("2400 pennies")).toBeInTheDocument();
      expect(screen.getByText("5 pennies")).toBeInTheDocument();
    });

    it("hides prices for all items when showPrices is false", () => {
      render(
        <TestWrapper>
          <LootList items={mockLootItems} showPrices={false} />
        </TestWrapper>
      );

      // Check that price information is not visible for any items
      expect(screen.queryByText("50 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("2400 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("5 pennies")).not.toBeInTheDocument();

      // But item names and descriptions should still be visible
      expect(screen.getByText("Rusty Dagger")).toBeInTheDocument();
      expect(screen.getByText("Silver Goblet")).toBeInTheDocument();
      expect(screen.getByText("Broken Tool")).toBeInTheDocument();
    });

    it("correctly passes showPrices prop to individual LootItem components", () => {
      const { rerender } = render(
        <TestWrapper>
          <LootList items={[mockLootItems[0]]} showPrices={true} />
        </TestWrapper>
      );

      // Should show price when showPrices is true
      expect(screen.getByText("50 pennies")).toBeInTheDocument();

      // Re-render with showPrices false
      rerender(
        <TestWrapper>
          <LootList items={[mockLootItems[0]]} showPrices={false} />
        </TestWrapper>
      );

      // Should hide price when showPrices is false
      expect(screen.queryByText("50 pennies")).not.toBeInTheDocument();
    });

    it("handles empty item list regardless of showPrices setting", () => {
      const { rerender } = render(
        <TestWrapper>
          <LootList items={[]} showPrices={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId("loot-list-empty")).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <LootList items={[]} showPrices={false} />
        </TestWrapper>
      );

      expect(screen.getByTestId("loot-list-empty")).toBeInTheDocument();
    });
  });

  describe("Individual LootItem Price Visibility", () => {
    it("shows price section when showPrice is true (default)", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItems[1]} />
        </TestWrapper>
      );

      // Should show the entire price section
      expect(screen.getByText("2400 pennies")).toBeInTheDocument();

      // Should show coin icon (accessible by role or test id)
      const coinIcons = screen.getAllByTestId(/MonetizationOnIcon|CoinIcon/i);
      expect(coinIcons.length).toBeGreaterThan(0);
    });

    it("completely hides price section when showPrice is false", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItems[1]} showPrice={false} />
        </TestWrapper>
      );

      // Should not show any price-related elements
      expect(screen.queryByText("2400 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("10gc 0s 0p")).not.toBeInTheDocument();

      // Coin icon should not be visible
      expect(
        screen.queryByTestId(/MonetizationOnIcon|CoinIcon/i)
      ).not.toBeInTheDocument();
    });

    it("preserves other content when price is hidden", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItems[1]} showPrice={false} />
        </TestWrapper>
      );

      // Should still show item name, description, and wealth level
      expect(screen.getByText("Silver Goblet")).toBeInTheDocument();
      expect(
        screen.getByText("An ornate drinking vessel with engravings.")
      ).toBeInTheDocument();
      expect(screen.getByText("wealthLevels.Wealthy")).toBeInTheDocument();
    });

    it("toggles currency format only when price is visible", () => {
      const { rerender } = render(
        <TestWrapper>
          <LootItem item={mockLootItems[1]} showPrice={true} />
        </TestWrapper>
      );

      // Should show price and allow toggle
      const currencyDisplay = screen.getByText("2400 pennies");
      expect(currencyDisplay).toBeInTheDocument();

      // Click to toggle format
      fireEvent.click(currencyDisplay);
      expect(screen.getByText("10gc 0s 0p")).toBeInTheDocument();

      // Re-render with price hidden
      rerender(
        <TestWrapper>
          <LootItem item={mockLootItems[1]} showPrice={false} />
        </TestWrapper>
      );

      // No currency display should be visible at all
      expect(screen.queryByText("2400 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("10gc 0s 0p")).not.toBeInTheDocument();
    });
  });

  describe("Price Visibility Edge Cases", () => {
    it("handles zero-value items correctly with price visibility", () => {
      const zeroValueItem: LootItemType = {
        name: "Worthless Trinket",
        description: "Completely without value.",
        valueInPennies: 0,
        wealthLevel: WealthLevel.Rubbish,
      };

      const { rerender } = render(
        <TestWrapper>
          <LootItem item={zeroValueItem} showPrice={true} />
        </TestWrapper>
      );

      // Should show zero value when prices are visible
      expect(screen.getByText("0 pennies")).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <LootItem item={zeroValueItem} showPrice={false} />
        </TestWrapper>
      );

      // Should hide zero value when prices are hidden
      expect(screen.queryByText("0 pennies")).not.toBeInTheDocument();
    });

    it("handles high-value items correctly with price visibility", () => {
      const highValueItem: LootItemType = {
        name: "Crown of Kings",
        description: "A priceless royal artifact.",
        valueInPennies: 100000, // Very expensive
        wealthLevel: WealthLevel.Noble,
      };

      const { rerender } = render(
        <TestWrapper>
          <LootItem item={highValueItem} showPrice={true} />
        </TestWrapper>
      );

      // Should show high value when prices are visible
      expect(screen.getByText("100000 pennies")).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <LootItem item={highValueItem} showPrice={false} />
        </TestWrapper>
      );

      // Should hide high value when prices are hidden
      expect(screen.queryByText("100000 pennies")).not.toBeInTheDocument();
    });

    it("handles mixed price visibility states in a list", () => {
      // This test verifies that LootList correctly controls all its children
      const mixedItems = [mockLootItems[0], mockLootItems[2]]; // Different wealth levels

      render(
        <TestWrapper>
          <LootList items={mixedItems} showPrices={false} />
        </TestWrapper>
      );

      // All prices should be hidden regardless of individual item values
      expect(screen.queryByText("50 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("5 pennies")).not.toBeInTheDocument();

      // All names should still be visible
      expect(screen.getByText("Rusty Dagger")).toBeInTheDocument();
      expect(screen.getByText("Broken Tool")).toBeInTheDocument();
    });
  });

  describe("Price Visibility Integration", () => {
    it("maintains responsive layout when prices are hidden", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItems[1]} showPrice={false} />
        </TestWrapper>
      );

      // The card should still be properly rendered
      const cardContent = screen
        .getByText("Silver Goblet")
        .closest('[class*="MuiCardContent"]');
      expect(cardContent).toBeInTheDocument();

      // Description should have proper spacing even without price section
      expect(
        screen.getByText("An ornate drinking vessel with engravings.")
      ).toBeInTheDocument();
    });

    it("preserves accessibility when prices are hidden", () => {
      render(
        <TestWrapper>
          <LootItem item={mockLootItems[0]} showPrice={false} />
        </TestWrapper>
      );

      // Heading structure should remain intact
      expect(
        screen.getByRole("heading", { name: "Rusty Dagger" })
      ).toBeInTheDocument();

      // Wealth level chip should still be accessible
      expect(screen.getByText("wealthLevels.Poor")).toBeInTheDocument();
    });

    it("correctly updates when showPrices prop changes dynamically", () => {
      let showPrices = true;
      const { rerender } = render(
        <TestWrapper>
          <LootList items={mockLootItems} showPrices={showPrices} />
        </TestWrapper>
      );

      // Initially all prices should be visible
      expect(screen.getByText("50 pennies")).toBeInTheDocument();
      expect(screen.getByText("2400 pennies")).toBeInTheDocument();
      expect(screen.getByText("5 pennies")).toBeInTheDocument();

      // Toggle to hide prices
      showPrices = false;
      rerender(
        <TestWrapper>
          <LootList items={mockLootItems} showPrices={showPrices} />
        </TestWrapper>
      );

      // All prices should now be hidden
      expect(screen.queryByText("50 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("2400 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("5 pennies")).not.toBeInTheDocument();

      // Toggle back to show prices
      showPrices = true;
      rerender(
        <TestWrapper>
          <LootList items={mockLootItems} showPrices={showPrices} />
        </TestWrapper>
      );

      // All prices should be visible again
      expect(screen.getByText("50 pennies")).toBeInTheDocument();
      expect(screen.getByText("2400 pennies")).toBeInTheDocument();
      expect(screen.getByText("5 pennies")).toBeInTheDocument();
    });
  });
});
