/**
 * Integration tests for PriceToggle with LootList
 * Tests the price visibility toggle functionality
 */

import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import PriceToggle from "../../src/components/PriceToggle";
import LootList from "../../src/components/LootList";
import { LootItem as LootItemType } from "../../src/types/api";
import { WealthLevel } from "../../src/types/index";

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
        noItems: "No loot items generated yet",
        "wealthLevels.Common": "Common",
        "wealthLevels.Wealthy": "Wealthy",
      };
      return translations[key] || key;
    },
  }),
}));

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
const mockLootItems: LootItemType[] = [
  {
    name: "Ancient Sword",
    description:
      "A weathered blade with intricate engravings along its fuller.",
    valueInPennies: 1250,
    wealthLevel: WealthLevel.Wealthy,
  },
  {
    name: "Iron Dagger",
    description: "A simple but sturdy dagger made of iron.",
    valueInPennies: 150,
    wealthLevel: WealthLevel.Common,
  },
];

// Component that combines PriceToggle with LootList
const PriceToggleWithLootList: React.FC<{ items: LootItemType[] }> = ({
  items,
}) => {
  const [showPrices, setShowPrices] = useState(true);

  return (
    <div>
      <PriceToggle showPrices={showPrices} onToggle={setShowPrices} />
      <LootList items={items} showPrices={showPrices} />
    </div>
  );
};

describe("PriceToggle with LootList Integration", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Price Visibility Control", () => {
    it("shows prices in loot items when toggle is enabled", () => {
      render(
        <TestWrapper>
          <PriceToggleWithLootList items={mockLootItems} />
        </TestWrapper>
      );

      // Initially prices should be shown
      expect(screen.getByText("Hide Prices")).toBeInTheDocument();
      expect(screen.getByRole("checkbox")).toBeChecked();

      // Check that prices are visible in loot items
      const lootList = screen.getByTestId("loot-list");
      expect(lootList).toBeInTheDocument();

      // Prices should be displayed (currency formatter is mocked to return simple format)
      expect(screen.getByText("1250 pennies")).toBeInTheDocument();
      expect(screen.getByText("150 pennies")).toBeInTheDocument();
    });

    it("hides prices in loot items when toggle is disabled", () => {
      render(
        <TestWrapper>
          <PriceToggleWithLootList items={mockLootItems} />
        </TestWrapper>
      );

      // Toggle the price visibility off
      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      // Toggle should now show "Show Prices"
      expect(screen.getByText("Show Prices")).toBeInTheDocument();
      expect(toggle).not.toBeChecked();

      // Prices should no longer be visible
      expect(screen.queryByText("1250 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("150 pennies")).not.toBeInTheDocument();

      // But item names and descriptions should still be visible
      expect(screen.getByText("Ancient Sword")).toBeInTheDocument();
      expect(screen.getByText("Iron Dagger")).toBeInTheDocument();
    });

    it("can toggle price visibility multiple times", () => {
      render(
        <TestWrapper>
          <PriceToggleWithLootList items={mockLootItems} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");

      // Initially prices are shown
      expect(screen.getByText("1250 pennies")).toBeInTheDocument();
      expect(toggle).toBeChecked();

      // Hide prices
      fireEvent.click(toggle);
      expect(screen.queryByText("1250 pennies")).not.toBeInTheDocument();
      expect(toggle).not.toBeChecked();

      // Show prices again
      fireEvent.click(toggle);
      expect(screen.getByText("1250 pennies")).toBeInTheDocument();
      expect(toggle).toBeChecked();

      // Hide prices again
      fireEvent.click(toggle);
      expect(screen.queryByText("1250 pennies")).not.toBeInTheDocument();
      expect(toggle).not.toBeChecked();
    });
  });

  describe("Empty List Handling", () => {
    it("works correctly with empty loot list", () => {
      render(
        <TestWrapper>
          <PriceToggleWithLootList items={[]} />
        </TestWrapper>
      );

      expect(screen.getByText("Hide Prices")).toBeInTheDocument();
      expect(screen.getByTestId("loot-list-empty")).toBeInTheDocument();
      expect(
        screen.getByText("No loot items generated yet")
      ).toBeInTheDocument();

      // Toggle should still work
      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);
      expect(screen.getByText("Show Prices")).toBeInTheDocument();
    });
  });

  describe("Accessibility Integration", () => {
    it("maintains proper focus management between toggle and list", () => {
      render(
        <TestWrapper>
          <PriceToggleWithLootList items={mockLootItems} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");

      // Focus the toggle
      toggle.focus();
      expect(document.activeElement).toBe(toggle);

      // Toggle should still be focusable after state change
      fireEvent.click(toggle);
      expect(document.activeElement).toBe(toggle);
    });

    it("has proper aria relationships", () => {
      render(
        <TestWrapper>
          <PriceToggleWithLootList items={mockLootItems} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");
      expect(toggle).toHaveAttribute("aria-label", "Hide Prices");

      // After toggling
      fireEvent.click(toggle);
      expect(toggle).toHaveAttribute("aria-label", "Show Prices");
    });
  });

  describe("State Synchronization", () => {
    it("maintains consistent state between toggle and list display", () => {
      render(
        <TestWrapper>
          <PriceToggleWithLootList items={mockLootItems} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");

      // Verify initial state consistency
      expect(toggle).toBeChecked();
      expect(screen.getByText("1250 pennies")).toBeInTheDocument();

      // Change state and verify consistency
      fireEvent.click(toggle);
      expect(toggle).not.toBeChecked();
      expect(screen.queryByText("1250 pennies")).not.toBeInTheDocument();

      // Change back and verify consistency
      fireEvent.click(toggle);
      expect(toggle).toBeChecked();
      expect(screen.getByText("1250 pennies")).toBeInTheDocument();
    });
  });

  describe("Performance Considerations", () => {
    it("handles large lists efficiently when toggling", () => {
      // Create a larger list for performance testing
      const largeLootList: LootItemType[] = Array.from(
        { length: 50 },
        (_, i) => ({
          name: `Item ${i}`,
          description: `Description for item ${i}`,
          valueInPennies: 100 + i,
          wealthLevel: WealthLevel.Common,
        })
      );

      const startTime = performance.now();

      render(
        <TestWrapper>
          <PriceToggleWithLootList items={largeLootList} />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");

      // Toggle even number of times to end up in initial state
      fireEvent.click(toggle); // hide prices
      fireEvent.click(toggle); // show prices

      const endTime = performance.now();
      const duration = endTime - startTime;

      // Should complete in reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);

      // Verify final state is correct (should be showing prices)
      expect(toggle).toBeChecked();
      expect(screen.getByText("100 pennies")).toBeInTheDocument();
    });
  });
});
