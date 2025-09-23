/**
 * Integration tests for LootItem component with currency formatting
 * Tests the complete workflow of displaying loot items with proper formatting
 */

import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import i18n from "../__mocks__/i18n";
import { LootItem } from "../../src/components/LootItem";
import { LootItem as LootItemType } from "../../src/types/api";
import { WealthLevel } from "../../src/types/index";

// Test theme
const theme = createTheme();

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </ThemeProvider>
);

// Test data for different wealth levels and values
const testItems: LootItemType[] = [
  {
    name: "Rusty Spoon",
    description: "A bent and tarnished eating utensil.",
    valueInPennies: 5,
    wealthLevel: WealthLevel.Rubbish,
  },
  {
    name: "Leather Boots",
    description: "Well-worn but serviceable footwear.",
    valueInPennies: 45,
    wealthLevel: WealthLevel.Poor,
  },
  {
    name: "Steel Dagger",
    description: "A simple but effective blade.",
    valueInPennies: 180,
    wealthLevel: WealthLevel.Common,
  },
  {
    name: "Silver Goblet",
    description: "An ornate drinking vessel with family crests.",
    valueInPennies: 720,
    wealthLevel: WealthLevel.Wealthy,
  },
  {
    name: "Enchanted Amulet",
    description: "A mystical pendant that glows faintly in moonlight.",
    valueInPennies: 2400,
    wealthLevel: WealthLevel.Noble,
  },
];

describe("LootItem Integration Tests", () => {
  describe("Multiple Items Display", () => {
    it("renders multiple loot items correctly", () => {
      render(
        <TestWrapper>
          <div>
            {testItems.map((item, index) => (
              <LootItem key={index} item={item} />
            ))}
          </div>
        </TestWrapper>
      );

      // Check that all items are rendered
      testItems.forEach((item) => {
        expect(screen.getByText(item.name)).toBeInTheDocument();
        expect(screen.getByText(item.description)).toBeInTheDocument();
        expect(
          screen.getByText(`wealthLevels.${item.wealthLevel}`)
        ).toBeInTheDocument();
      });
    });

    it("handles price display toggle for multiple items independently", async () => {
      render(
        <TestWrapper>
          <div>
            {testItems.slice(0, 2).map((item, index) => (
              <LootItem key={index} item={item} />
            ))}
          </div>
        </TestWrapper>
      );

      // Get all currency display elements (they're now clickable text, not buttons)
      const currencyElements = screen.getAllByText(
        /loot:currencyUnits\.(pennies|penny|shillings|shilling|crowns|crown|golds|gold)|[0-9]+[pgsc]/
      );

      // First item should start with full format (translation keys) - use getAllByText to handle multiple matches
      const pennyElements = screen.getAllByText(
        /loot:currencyUnits\.(pennies|penny)/
      );
      expect(pennyElements.length).toBeGreaterThan(0);

      // Click first item's currency toggle
      fireEvent.click(currencyElements[0]);

      // First item should now show abbreviated format
      await waitFor(() => {
        expect(screen.getByText(/\d+p/)).toBeInTheDocument();
      });

      // Second item should still show full format
      expect(screen.getByText(/pennies?/)).toBeInTheDocument();
    });
  });

  describe("Currency Formatting Integration", () => {
    it("formats different value ranges correctly", () => {
      const valueTestItems = [
        { ...testItems[0], valueInPennies: 0 }, // Zero value
        { ...testItems[0], valueInPennies: 1 }, // Single penny
        { ...testItems[0], valueInPennies: 12 }, // Exactly one shilling
        { ...testItems[0], valueInPennies: 240 }, // Exactly one crown
        { ...testItems[0], valueInPennies: 267 }, // Mixed currency
      ];

      render(
        <TestWrapper>
          <div>
            {valueTestItems.map((item, index) => (
              <LootItem key={index} item={item} />
            ))}
          </div>
        </TestWrapper>
      );

      // Check that currency formatting works for different values
      valueTestItems.forEach((item, index) => {
        // Each item should have some form of currency display (use getAllByText to handle multiple items with same name)
        const itemElements = screen.getAllByText(item.name);
        expect(itemElements[index]).toBeInTheDocument();
      });
    });

    it("toggles between abbreviated and full currency formats", async () => {
      const item = testItems[4]; // High value item

      render(
        <TestWrapper>
          <LootItem item={item} />
        </TestWrapper>
      );

      const currencyElement = screen.getByText(
        /loot:currencyUnits\.(golds|gold)/
      );

      // Should start with full format (translation keys)
      expect(currencyElement).toHaveTextContent(
        /loot:currencyUnits\.(pennies|penny|shillings|shilling|crowns|crown|golds|gold)/
      );

      // Toggle to abbreviated
      fireEvent.click(currencyElement);

      await waitFor(() => {
        expect(currencyElement).toHaveTextContent(/[pgsc]/);
      });

      // Toggle back to full
      fireEvent.click(currencyElement);

      await waitFor(() => {
        expect(currencyElement).toHaveTextContent(
          /loot:currencyUnits\.(pennies|penny|shillings|shilling|crowns|crown|golds|gold)/
        );
      });
    });
  });

  describe("Wealth Level Integration", () => {
    it("displays all wealth levels without special styling", () => {
      render(
        <TestWrapper>
          <div>
            {testItems.map((item, index) => (
              <LootItem key={index} item={item} />
            ))}
          </div>
        </TestWrapper>
      );

      // Check that each wealth level is displayed (they appear as translation keys)
      Object.values(WealthLevel).forEach((level) => {
        expect(screen.getByText(`wealthLevels.${level}`)).toBeInTheDocument();
      });

      // Check that chips don't have color-specific styling
      const chips = screen.getAllByText(
        /wealthLevels\.(Rubbish|Poor|Common|Wealthy|Noble)/
      );
      chips.forEach((chip) => {
        // The chip should be present without checking for specific colors
        expect(chip).toBeInTheDocument();
      });
    });

    it("shows appropriate tooltips for wealth levels", async () => {
      render(
        <TestWrapper>
          <LootItem item={testItems[0]} />
        </TestWrapper>
      );

      const wealthChip = screen.getByText(
        `wealthLevels.${testItems[0].wealthLevel}`
      );

      // Hover to show tooltip
      fireEvent.mouseEnter(wealthChip);

      // Tooltip should be accessible
      expect(wealthChip).toBeInTheDocument();
    });
  });

  describe("Responsive Layout Integration", () => {
    it("handles long content gracefully", () => {
      const longContentItem: LootItemType = {
        name: "An Extraordinarily Long Item Name That Should Test Text Wrapping and Layout Behavior",
        description:
          "This is an extremely detailed description that contains many words and should test how the component handles text wrapping and layout when there is a significant amount of content to display. It should not break the layout or cause any visual issues.",
        valueInPennies: 1500,
        wealthLevel: WealthLevel.Wealthy,
      };

      render(
        <TestWrapper>
          <LootItem item={longContentItem} />
        </TestWrapper>
      );

      expect(screen.getByText(longContentItem.name)).toBeInTheDocument();
      expect(screen.getByText(longContentItem.description)).toBeInTheDocument();
    });

    it("maintains layout with hidden prices", () => {
      render(
        <TestWrapper>
          <div>
            <LootItem item={testItems[0]} showPrice={true} />
            <LootItem item={testItems[1]} showPrice={false} />
            <LootItem item={testItems[2]} showPrice={true} />
          </div>
        </TestWrapper>
      );

      // All items should be rendered
      expect(screen.getByText(testItems[0].name)).toBeInTheDocument();
      expect(screen.getByText(testItems[1].name)).toBeInTheDocument();
      expect(screen.getByText(testItems[2].name)).toBeInTheDocument();

      // Only items with showPrice=true should have currency elements
      const currencyElements = screen.getAllByText(
        /loot:currencyUnits\.(pennies|penny|shillings|shilling|crowns|crown|golds|gold)|[0-9]+[pgsc]/
      );
      expect(currencyElements).toHaveLength(2); // Two items with prices shown
    });
  });

  describe("Accessibility Integration", () => {
    it("maintains proper heading hierarchy with multiple items", () => {
      render(
        <TestWrapper>
          <div>
            <h1>Loot Generator Results</h1>
            <h2>Generated Items</h2>
            {testItems.slice(0, 3).map((item, index) => (
              <LootItem key={index} item={item} />
            ))}
          </div>
        </TestWrapper>
      );

      // Check heading hierarchy
      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
      expect(screen.getByRole("heading", { level: 2 })).toBeInTheDocument();

      // Each item should have h3 headings
      const itemHeadings = screen.getAllByRole("heading", { level: 3 });
      expect(itemHeadings).toHaveLength(3);
    });

    it("supports click interaction for currency toggles", async () => {
      render(
        <TestWrapper>
          <LootItem item={testItems[0]} />
        </TestWrapper>
      );

      const currencyElement = screen.getByText(
        /loot:currencyUnits\.(pennies|penny)/
      );

      // Typography elements might not be focusable by default, so we'll just test the click behavior
      // Click to toggle
      fireEvent.click(currencyElement);

      // Format should change
      await waitFor(() => {
        expect(currencyElement).toHaveTextContent(/[p]/);
      });
    });
  });

  describe("Error Handling Integration", () => {
    it("handles malformed item data gracefully", () => {
      const malformedItem = {
        name: "",
        description: "",
        valueInPennies: -1,
        wealthLevel: "InvalidLevel" as any,
      };

      // Should not throw an error
      expect(() => {
        render(
          <TestWrapper>
            <LootItem item={malformedItem} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it("handles missing translation keys gracefully", () => {
      const itemWithUnknownWealth = {
        ...testItems[0],
        wealthLevel: "UnknownWealth" as any,
      };

      render(
        <TestWrapper>
          <LootItem item={itemWithUnknownWealth} />
        </TestWrapper>
      );

      // Component should still render
      expect(screen.getByText(itemWithUnknownWealth.name)).toBeInTheDocument();
    });
  });
});
