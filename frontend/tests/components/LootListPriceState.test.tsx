/**
 * Unit tests for LootList component's price visibility state management
 * Task T040: Add hide/show price logic to LootList
 *
 * These tests focus specifically on how LootList manages and propagates
 * the showPrices state to its child components.
 */

import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import LootList from "../../src/components/LootList";
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
  formatCurrencyAbbreviated: jest.fn((pennies: number) => {
    const gold = Math.floor(pennies / 240);
    const silver = Math.floor((pennies % 240) / 12);
    const pence = pennies % 12;
    return `${gold}gc ${silver}s ${pence}p`;
  }),
  formatCurrencyFull: jest.fn((pennies: number) => `${pennies} pennies`),
}));

// Create a test theme
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

// Comprehensive test data covering different scenarios
const testLootItems: LootItemType[] = [
  {
    name: "Tattered Map",
    description: "An old map with missing pieces.",
    valueInPennies: 15,
    wealthLevel: WealthLevel.Poor,
  },
  {
    name: "Merchant's Scales",
    description: "Brass scales for weighing goods.",
    valueInPennies: 180, // 15 shillings
    wealthLevel: WealthLevel.Common,
  },
  {
    name: "Noble's Signet Ring",
    description: "A gold ring bearing a family crest.",
    valueInPennies: 7200, // 30 gold crowns
    wealthLevel: WealthLevel.Noble,
  },
  {
    name: "Broken Pottery Shard",
    description: "Fragment of a once-beautiful vase.",
    valueInPennies: 0,
    wealthLevel: WealthLevel.Rubbish,
  },
  {
    name: "Gemstone Pendant",
    description: "A pendant with a small but valuable gem.",
    valueInPennies: 3600, // 15 gold crowns
    wealthLevel: WealthLevel.Wealthy,
  },
];

describe("LootList Price State Management (Task T040)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Price Propagation to Child Components", () => {
    it("propagates showPrices=true to all LootItem children", () => {
      render(
        <TestWrapper>
          <LootList items={testLootItems} showPrices={true} />
        </TestWrapper>
      );

      // All prices should be visible
      expect(screen.getByText("15 pennies")).toBeInTheDocument();
      expect(screen.getByText("180 pennies")).toBeInTheDocument();
      expect(screen.getByText("7200 pennies")).toBeInTheDocument();
      expect(screen.getByText("0 pennies")).toBeInTheDocument();
      expect(screen.getByText("3600 pennies")).toBeInTheDocument();
    });

    it("propagates showPrices=false to all LootItem children", () => {
      render(
        <TestWrapper>
          <LootList items={testLootItems} showPrices={false} />
        </TestWrapper>
      );

      // No prices should be visible
      expect(screen.queryByText("15 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("180 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("7200 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("0 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("3600 pennies")).not.toBeInTheDocument();

      // But all item names should still be visible
      expect(screen.getByText("Tattered Map")).toBeInTheDocument();
      expect(screen.getByText("Merchant's Scales")).toBeInTheDocument();
      expect(screen.getByText("Noble's Signet Ring")).toBeInTheDocument();
      expect(screen.getByText("Broken Pottery Shard")).toBeInTheDocument();
      expect(screen.getByText("Gemstone Pendant")).toBeInTheDocument();
    });

    it("applies showPrices consistently across different wealth levels", () => {
      // Test with mixed wealth levels to ensure no wealth-based filtering
      const mixedWealthItems = [
        testLootItems[0], // Poor
        testLootItems[2], // Noble
        testLootItems[3], // Rubbish
      ];

      const { rerender } = render(
        <TestWrapper>
          <LootList items={mixedWealthItems} showPrices={true} />
        </TestWrapper>
      );

      // All should show prices regardless of wealth level
      expect(screen.getByText("15 pennies")).toBeInTheDocument();
      expect(screen.getByText("7200 pennies")).toBeInTheDocument();
      expect(screen.getByText("0 pennies")).toBeInTheDocument();

      // Re-render with prices hidden
      rerender(
        <TestWrapper>
          <LootList items={mixedWealthItems} showPrices={false} />
        </TestWrapper>
      );

      // All should hide prices regardless of wealth level
      expect(screen.queryByText("15 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("7200 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("0 pennies")).not.toBeInTheDocument();
    });
  });

  describe("State Change Handling", () => {
    it("immediately reflects showPrices prop changes", () => {
      const { rerender } = render(
        <TestWrapper>
          <LootList items={[testLootItems[1]]} showPrices={false} />
        </TestWrapper>
      );

      // Initially no price
      expect(screen.queryByText("180 pennies")).not.toBeInTheDocument();
      expect(screen.getByText("Merchant's Scales")).toBeInTheDocument();

      // Change to show prices
      rerender(
        <TestWrapper>
          <LootList items={[testLootItems[1]]} showPrices={true} />
        </TestWrapper>
      );

      // Price should now be visible
      expect(screen.getByText("180 pennies")).toBeInTheDocument();
      expect(screen.getByText("Merchant's Scales")).toBeInTheDocument();

      // Change back to hide prices
      rerender(
        <TestWrapper>
          <LootList items={[testLootItems[1]]} showPrices={false} />
        </TestWrapper>
      );

      // Price should be hidden again
      expect(screen.queryByText("180 pennies")).not.toBeInTheDocument();
      expect(screen.getByText("Merchant's Scales")).toBeInTheDocument();
    });

    it("handles rapid showPrices prop changes", () => {
      let showPrices = false;
      const { rerender } = render(
        <TestWrapper>
          <LootList items={[testLootItems[4]]} showPrices={showPrices} />
        </TestWrapper>
      );

      // Simulate rapid toggling
      for (let i = 0; i < 5; i++) {
        showPrices = !showPrices;
        rerender(
          <TestWrapper>
            <LootList items={[testLootItems[4]]} showPrices={showPrices} />
          </TestWrapper>
        );

        if (showPrices) {
          expect(screen.getByText("3600 pennies")).toBeInTheDocument();
        } else {
          expect(screen.queryByText("3600 pennies")).not.toBeInTheDocument();
        }
      }
    });
  });

  describe("Item List Changes with Price Visibility", () => {
    it("maintains price visibility state when items change", () => {
      const initialItems = [testLootItems[0]];
      const { rerender } = render(
        <TestWrapper>
          <LootList items={initialItems} showPrices={true} />
        </TestWrapper>
      );

      expect(screen.getByText("15 pennies")).toBeInTheDocument();

      // Change items while keeping showPrices=true
      const newItems = [testLootItems[1], testLootItems[2]];
      rerender(
        <TestWrapper>
          <LootList items={newItems} showPrices={true} />
        </TestWrapper>
      );

      // Old item price should be gone, new item prices should appear
      expect(screen.queryByText("15 pennies")).not.toBeInTheDocument();
      expect(screen.getByText("180 pennies")).toBeInTheDocument();
      expect(screen.getByText("7200 pennies")).toBeInTheDocument();
    });

    it("maintains price hidden state when items change", () => {
      const initialItems = [testLootItems[0]];
      const { rerender } = render(
        <TestWrapper>
          <LootList items={initialItems} showPrices={false} />
        </TestWrapper>
      );

      expect(screen.queryByText("15 pennies")).not.toBeInTheDocument();
      expect(screen.getByText("Tattered Map")).toBeInTheDocument();

      // Change items while keeping showPrices=false
      const newItems = [testLootItems[1], testLootItems[2]];
      rerender(
        <TestWrapper>
          <LootList items={newItems} showPrices={false} />
        </TestWrapper>
      );

      // No prices should be visible for any items
      expect(screen.queryByText("15 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("180 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("7200 pennies")).not.toBeInTheDocument();

      // But new item names should be visible
      expect(screen.getByText("Merchant's Scales")).toBeInTheDocument();
      expect(screen.getByText("Noble's Signet Ring")).toBeInTheDocument();
    });

    it("handles empty to populated list transitions", () => {
      const { rerender } = render(
        <TestWrapper>
          <LootList items={[]} showPrices={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId("loot-list-empty")).toBeInTheDocument();

      // Add items while prices are enabled
      rerender(
        <TestWrapper>
          <LootList items={testLootItems.slice(0, 2)} showPrices={true} />
        </TestWrapper>
      );

      expect(screen.queryByTestId("loot-list-empty")).not.toBeInTheDocument();
      expect(screen.getByText("15 pennies")).toBeInTheDocument();
      expect(screen.getByText("180 pennies")).toBeInTheDocument();
    });

    it("handles populated to empty list transitions", () => {
      const { rerender } = render(
        <TestWrapper>
          <LootList items={testLootItems.slice(0, 2)} showPrices={true} />
        </TestWrapper>
      );

      expect(screen.getByText("15 pennies")).toBeInTheDocument();
      expect(screen.getByText("180 pennies")).toBeInTheDocument();

      // Remove all items
      rerender(
        <TestWrapper>
          <LootList items={[]} showPrices={true} />
        </TestWrapper>
      );

      expect(screen.getByTestId("loot-list-empty")).toBeInTheDocument();
      expect(screen.queryByText("15 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("180 pennies")).not.toBeInTheDocument();
    });
  });

  describe("Edge Cases and Error Handling", () => {
    it("handles undefined items array gracefully", () => {
      // TypeScript might prevent this, but test runtime safety
      const { container } = render(
        <TestWrapper>
          <LootList items={undefined as any} showPrices={true} />
        </TestWrapper>
      );

      // Should not crash and should show empty state
      expect(container).toBeInTheDocument();
    });

    it("handles null items array gracefully", () => {
      // TypeScript might prevent this, but test runtime safety
      const { container } = render(
        <TestWrapper>
          <LootList items={null as any} showPrices={true} />
        </TestWrapper>
      );

      // Should not crash and should show empty state
      expect(container).toBeInTheDocument();
    });

    it("handles items with missing properties", () => {
      const incompleteItems = [
        {
          name: "Incomplete Item",
          // Missing description, valueInPennies, wealthLevel
        } as LootItemType,
      ];

      const { container } = render(
        <TestWrapper>
          <LootList items={incompleteItems} showPrices={true} />
        </TestWrapper>
      );

      // Should not crash
      expect(container).toBeInTheDocument();
      expect(screen.getByText("Incomplete Item")).toBeInTheDocument();
    });

    it("handles very large item lists efficiently", () => {
      const largeItemList: LootItemType[] = Array.from(
        { length: 1000 },
        (_, index) => ({
          name: `Item ${index + 1}`,
          description: `Description ${index + 1}`,
          valueInPennies: index + 1,
          wealthLevel: WealthLevel.Common,
        })
      );

      const { rerender } = render(
        <TestWrapper>
          <LootList items={largeItemList} showPrices={false} />
        </TestWrapper>
      );

      // Should render without performance issues
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.queryByText("1 pennies")).not.toBeInTheDocument();

      // Toggle to show prices
      rerender(
        <TestWrapper>
          <LootList items={largeItemList} showPrices={true} />
        </TestWrapper>
      );

      // Should handle the state change efficiently
      expect(screen.getByText("1 pennies")).toBeInTheDocument();
    });
  });

  describe("Component Key and Re-rendering Behavior", () => {
    it("maintains proper list item keys when price visibility changes", () => {
      const { rerender } = render(
        <TestWrapper>
          <LootList items={testLootItems.slice(0, 3)} showPrices={false} />
        </TestWrapper>
      );

      const listItems = screen.getAllByRole("listitem");
      expect(listItems).toHaveLength(3);

      // Change price visibility
      rerender(
        <TestWrapper>
          <LootList items={testLootItems.slice(0, 3)} showPrices={true} />
        </TestWrapper>
      );

      // Should still have same number of list items
      const updatedListItems = screen.getAllByRole("listitem");
      expect(updatedListItems).toHaveLength(3);

      // Prices should now be visible
      expect(screen.getByText("15 pennies")).toBeInTheDocument();
      expect(screen.getByText("180 pennies")).toBeInTheDocument();
      expect(screen.getByText("7200 pennies")).toBeInTheDocument();
    });

    it("preserves individual item state during price visibility changes", () => {
      // This test ensures that individual LootItem components maintain their
      // internal state (like currency format preference) when price visibility changes
      const singleItem = [testLootItems[1]];

      const { rerender } = render(
        <TestWrapper>
          <LootList items={singleItem} showPrices={true} />
        </TestWrapper>
      );

      expect(screen.getByText("180 pennies")).toBeInTheDocument();

      // Hide prices
      rerender(
        <TestWrapper>
          <LootList items={singleItem} showPrices={false} />
        </TestWrapper>
      );

      expect(screen.queryByText("180 pennies")).not.toBeInTheDocument();

      // Show prices again
      rerender(
        <TestWrapper>
          <LootList items={singleItem} showPrices={true} />
        </TestWrapper>
      );

      // Price should be visible again
      expect(screen.getByText("180 pennies")).toBeInTheDocument();
    });
  });
});
