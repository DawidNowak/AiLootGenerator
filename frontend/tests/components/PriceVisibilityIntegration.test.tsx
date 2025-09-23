/**
 * Integration tests for the complete price visibility workflow
 * Task T040: Add hide/show price logic to LootList
 *
 * These tests verify the full integration between PriceToggle, LootList, and LootItem
 * components for the hide/show price functionality.
 */

import React, { useState } from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { PriceToggle } from "../../src/components/PriceToggle";
import LootList from "../../src/components/LootList";
import { LootItem as LootItemType } from "../../src/types/api";
import { WealthLevel } from "../../src/types/index";

// Mock react-i18next
jest.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => {
      const translations: Record<string, string> = {
        "loot.noItems": "No items found",
        "loot.wealthLevels.Poor": "Poor",
        "loot.wealthLevels.Common": "Common",
        "loot.wealthLevels.Wealthy": "Wealthy",
        "loot.wealthLevelDescriptions.Poor": "Basic items",
        "loot.wealthLevelDescriptions.Common": "Standard quality",
        "loot.wealthLevelDescriptions.Wealthy": "High quality items",
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

// Sample test data
const mockLootItems: LootItemType[] = [
  {
    name: "Iron Sword",
    description: "A well-crafted blade of simple steel.",
    valueInPennies: 240, // 1 gold crown
    wealthLevel: WealthLevel.Common,
  },
  {
    name: "Silk Cloak",
    description: "A luxurious garment of fine materials.",
    valueInPennies: 1200, // 5 gold crowns
    wealthLevel: WealthLevel.Wealthy,
  },
  {
    name: "Bent Copper Coin",
    description: "A damaged coin of little worth.",
    valueInPennies: 3,
    wealthLevel: WealthLevel.Poor,
  },
];

// Test component that combines PriceToggle with LootList
const PriceVisibilityTestComponent: React.FC<{
  items: LootItemType[];
  initialShowPrices?: boolean;
}> = ({ items, initialShowPrices = false }) => {
  const [showPrices, setShowPrices] = useState(initialShowPrices);

  return (
    <div>
      <PriceToggle
        showPrices={showPrices}
        onToggle={(show) => setShowPrices(show)}
      />
      <LootList items={items} showPrices={showPrices} />
    </div>
  );
};

describe("Price Visibility Integration (Task T040)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("PriceToggle Integration with LootList", () => {
    it("initially hides prices when toggle starts in 'off' position", () => {
      render(
        <TestWrapper>
          <PriceVisibilityTestComponent
            items={mockLootItems}
            initialShowPrices={false}
          />
        </TestWrapper>
      );

      // Toggle should show "Show Prices"
      expect(screen.getByText("Show Prices")).toBeInTheDocument();

      // No prices should be visible
      expect(screen.queryByText("240 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("1200 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("3 pennies")).not.toBeInTheDocument();

      // But item names should be visible
      expect(screen.getByText("Iron Sword")).toBeInTheDocument();
      expect(screen.getByText("Silk Cloak")).toBeInTheDocument();
      expect(screen.getByText("Bent Copper Coin")).toBeInTheDocument();
    });

    it("initially shows prices when toggle starts in 'on' position", () => {
      render(
        <TestWrapper>
          <PriceVisibilityTestComponent
            items={mockLootItems}
            initialShowPrices={true}
          />
        </TestWrapper>
      );

      // Toggle should show "Hide Prices"
      expect(screen.getByText("Hide Prices")).toBeInTheDocument();

      // All prices should be visible
      expect(screen.getByText("240 pennies")).toBeInTheDocument();
      expect(screen.getByText("1200 pennies")).toBeInTheDocument();
      expect(screen.getByText("3 pennies")).toBeInTheDocument();
    });

    it("toggles price visibility when PriceToggle is clicked", () => {
      render(
        <TestWrapper>
          <PriceVisibilityTestComponent
            items={mockLootItems}
            initialShowPrices={false}
          />
        </TestWrapper>
      );

      // Initially prices should be hidden
      expect(screen.queryByText("240 pennies")).not.toBeInTheDocument();

      // Click the toggle to show prices
      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      // Prices should now be visible
      expect(screen.getByText("240 pennies")).toBeInTheDocument();
      expect(screen.getByText("1200 pennies")).toBeInTheDocument();
      expect(screen.getByText("3 pennies")).toBeInTheDocument();
      expect(screen.getByText("Hide Prices")).toBeInTheDocument();

      // Click again to hide prices
      fireEvent.click(toggle);

      // Prices should be hidden again
      expect(screen.queryByText("240 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("1200 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("3 pennies")).not.toBeInTheDocument();
      expect(screen.getByText("Show Prices")).toBeInTheDocument();
    });

    it("preserves currency format toggle state when price visibility changes", () => {
      render(
        <TestWrapper>
          <PriceVisibilityTestComponent
            items={[mockLootItems[0]]}
            initialShowPrices={true}
          />
        </TestWrapper>
      );

      // Should show full format initially
      expect(screen.getByText("240 pennies")).toBeInTheDocument();

      // Click currency to toggle to abbreviated format
      const currencyDisplay = screen.getByText("240 pennies");
      fireEvent.click(currencyDisplay);
      expect(screen.getByText("1gc 0s 0p")).toBeInTheDocument();

      // Hide prices using toggle
      const priceToggle = screen.getByRole("checkbox");
      fireEvent.click(priceToggle);
      expect(screen.queryByText("1gc 0s 0p")).not.toBeInTheDocument();

      // Show prices again
      fireEvent.click(priceToggle);

      // Should remember the abbreviated format
      expect(screen.getByText("1gc 0s 0p")).toBeInTheDocument();
    });
  });

  describe("Responsive Price Visibility Behavior", () => {
    it("maintains proper layout when prices are toggled", () => {
      render(
        <TestWrapper>
          <PriceVisibilityTestComponent
            items={mockLootItems}
            initialShowPrices={false}
          />
        </TestWrapper>
      );

      // Get the list container
      const lootList = screen.getByTestId("loot-list");
      expect(lootList).toBeInTheDocument();

      // Toggle prices on
      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      // List should still be properly rendered with prices
      expect(lootList).toBeInTheDocument();
      expect(screen.getByText("240 pennies")).toBeInTheDocument();

      // Toggle prices off
      fireEvent.click(toggle);

      // List should still be properly rendered without prices
      expect(lootList).toBeInTheDocument();
      expect(screen.queryByText("240 pennies")).not.toBeInTheDocument();
    });

    it("handles empty item list correctly with price toggle", () => {
      render(
        <TestWrapper>
          <PriceVisibilityTestComponent items={[]} initialShowPrices={false} />
        </TestWrapper>
      );

      // Should show empty state
      expect(screen.getByTestId("loot-list-empty")).toBeInTheDocument();

      // Toggle prices on (should still show empty state)
      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      expect(screen.getByTestId("loot-list-empty")).toBeInTheDocument();
      expect(screen.getByText("Hide Prices")).toBeInTheDocument();
    });
  });

  describe("Accessibility with Price Visibility", () => {
    it("maintains proper ARIA states when toggling prices", () => {
      render(
        <TestWrapper>
          <PriceVisibilityTestComponent
            items={mockLootItems}
            initialShowPrices={false}
          />
        </TestWrapper>
      );

      const toggle = screen.getByRole("checkbox");

      // Initially unchecked
      expect(toggle).not.toBeChecked();

      // Click to check
      fireEvent.click(toggle);
      expect(toggle).toBeChecked();

      // Click to uncheck
      fireEvent.click(toggle);
      expect(toggle).not.toBeChecked();
    });

    it("maintains heading structure regardless of price visibility", () => {
      render(
        <TestWrapper>
          <PriceVisibilityTestComponent
            items={[mockLootItems[0]]}
            initialShowPrices={false}
          />
        </TestWrapper>
      );

      // Heading should be accessible when prices are hidden
      expect(
        screen.getByRole("heading", { name: "Iron Sword" })
      ).toBeInTheDocument();

      // Toggle prices on
      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      // Heading should still be accessible when prices are shown
      expect(
        screen.getByRole("heading", { name: "Iron Sword" })
      ).toBeInTheDocument();
    });
  });

  describe("Performance with Price Visibility", () => {
    it("efficiently handles large lists when toggling prices", () => {
      // Create a larger dataset
      const largeItemList: LootItemType[] = Array.from(
        { length: 50 },
        (_, index) => ({
          name: `Item ${index + 1}`,
          description: `Description for item ${index + 1}`,
          valueInPennies: (index + 1) * 10,
          wealthLevel: WealthLevel.Common,
        })
      );

      render(
        <TestWrapper>
          <PriceVisibilityTestComponent
            items={largeItemList}
            initialShowPrices={false}
          />
        </TestWrapper>
      );

      // Should render without performance issues
      expect(screen.getByText("Item 1")).toBeInTheDocument();
      expect(screen.getByText("Item 50")).toBeInTheDocument();

      // No prices should be visible
      expect(screen.queryByText("10 pennies")).not.toBeInTheDocument();

      // Toggle prices on
      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      // Should efficiently show all prices
      expect(screen.getByText("10 pennies")).toBeInTheDocument();
      expect(screen.getByText("500 pennies")).toBeInTheDocument();
    });
  });

  describe("Edge Cases with Price Visibility", () => {
    it("handles dynamic item list updates with price visibility", () => {
      const initialItems = [mockLootItems[0]];

      const DynamicItemsComponent: React.FC = () => {
        const [items, setItems] = useState(initialItems);
        const [showPrices, setShowPrices] = useState(false);

        return (
          <div>
            <button
              onClick={() => setItems([...items, mockLootItems[1]])}
              data-testid="add-item"
            >
              Add Item
            </button>
            <PriceToggle showPrices={showPrices} onToggle={setShowPrices} />
            <LootList items={items} showPrices={showPrices} />
          </div>
        );
      };

      render(
        <TestWrapper>
          <DynamicItemsComponent />
        </TestWrapper>
      );

      // Initially one item, no prices
      expect(screen.getByText("Iron Sword")).toBeInTheDocument();
      expect(screen.queryByText("240 pennies")).not.toBeInTheDocument();

      // Add another item
      fireEvent.click(screen.getByTestId("add-item"));
      expect(screen.getByText("Silk Cloak")).toBeInTheDocument();

      // Still no prices should be visible
      expect(screen.queryByText("240 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("1200 pennies")).not.toBeInTheDocument();

      // Toggle prices on
      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      // Both items should now show prices
      expect(screen.getByText("240 pennies")).toBeInTheDocument();
      expect(screen.getByText("1200 pennies")).toBeInTheDocument();
    });

    it("handles items with extreme values correctly", () => {
      const extremeItems: LootItemType[] = [
        {
          name: "Worthless Debris",
          description: "Truly without value.",
          valueInPennies: 0,
          wealthLevel: WealthLevel.Rubbish,
        },
        {
          name: "Legendary Artifact",
          description: "A priceless treasure of immense power.",
          valueInPennies: 999999,
          wealthLevel: WealthLevel.Noble,
        },
      ];

      render(
        <TestWrapper>
          <PriceVisibilityTestComponent
            items={extremeItems}
            initialShowPrices={false}
          />
        </TestWrapper>
      );

      // No prices should be visible initially
      expect(screen.queryByText("0 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("999999 pennies")).not.toBeInTheDocument();

      // Toggle prices on
      const toggle = screen.getByRole("checkbox");
      fireEvent.click(toggle);

      // Both extreme values should be displayed correctly
      expect(screen.getByText("0 pennies")).toBeInTheDocument();
      expect(screen.getByText("999999 pennies")).toBeInTheDocument();

      // Toggle prices off
      fireEvent.click(toggle);

      // Both should be hidden again
      expect(screen.queryByText("0 pennies")).not.toBeInTheDocument();
      expect(screen.queryByText("999999 pennies")).not.toBeInTheDocument();
    });
  });
});
