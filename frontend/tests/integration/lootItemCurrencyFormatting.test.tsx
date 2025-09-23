/**
 * Comprehensive tests for LootItem currency formatting functionality
 * Tests the integration between LootItem component and currency utilities
 */

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import i18n from "../__mocks__/i18n";
import { LootItem } from "../../src/components/LootItem";
import { LootItem as LootItemType } from "../../src/types/api";
import { WealthLevel } from "../../src/types/index";
import * as currencyFormatter from "../../src/utils/currencyFormatter";

// Mock the currency formatter functions
jest.mock("../../src/utils/currencyFormatter");

const mockFormatCurrencyAbbreviated =
  currencyFormatter.formatCurrencyAbbreviated as jest.MockedFunction<
    typeof currencyFormatter.formatCurrencyAbbreviated
  >;
const mockFormatCurrencyFull =
  currencyFormatter.formatCurrencyFull as jest.MockedFunction<
    typeof currencyFormatter.formatCurrencyFull
  >;

// Test theme
const theme = createTheme();

// Test wrapper
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  </ThemeProvider>
);

// Test data with various penny values
const testItems: {
  description: string;
  item: LootItemType;
  expectedAbbreviated: string;
  expectedFull: string;
}[] = [
  {
    description: "Zero value item",
    item: {
      name: "Worthless Trinket",
      description: "A broken piece of pottery.",
      valueInPennies: 0,
      wealthLevel: WealthLevel.Rubbish,
    },
    expectedAbbreviated: "0p",
    expectedFull: "0 pennies",
  },
  {
    description: "Single penny",
    item: {
      name: "Copper Bit",
      description: "A single copper coin.",
      valueInPennies: 1,
      wealthLevel: WealthLevel.Rubbish,
    },
    expectedAbbreviated: "1p",
    expectedFull: "1 penny",
  },
  {
    description: "Less than one shilling",
    item: {
      name: "Few Coppers",
      description: "A handful of copper coins.",
      valueInPennies: 8,
      wealthLevel: WealthLevel.Poor,
    },
    expectedAbbreviated: "8p",
    expectedFull: "8 pennies",
  },
  {
    description: "Exactly one shilling",
    item: {
      name: "Single Shilling",
      description: "One silver shilling.",
      valueInPennies: 12,
      wealthLevel: WealthLevel.Poor,
    },
    expectedAbbreviated: "1s",
    expectedFull: "1 shilling",
  },
  {
    description: "Mixed shillings and pennies",
    item: {
      name: "Silver and Copper",
      description: "Mixed coins from a purse.",
      valueInPennies: 27, // 2 shillings, 3 pennies
      wealthLevel: WealthLevel.Poor,
    },
    expectedAbbreviated: "2s 3p",
    expectedFull: "2 shillings 3 pennies",
  },
  {
    description: "Exactly one crown",
    item: {
      name: "Gold Crown",
      description: "A single gold crown.",
      valueInPennies: 240,
      wealthLevel: WealthLevel.Common,
    },
    expectedAbbreviated: "1gc",
    expectedFull: "1 gold crown",
  },
  {
    description: "Mixed crowns, shillings, and pennies",
    item: {
      name: "Mixed Treasure",
      description: "A collection of various coins.",
      valueInPennies: 267, // 1 crown, 2 shillings, 3 pennies
      wealthLevel: WealthLevel.Wealthy,
    },
    expectedAbbreviated: "1gc 2s 3p",
    expectedFull: "1 gold crown 2 shillings 3 pennies",
  },
  {
    description: "Large value (multiple crowns)",
    item: {
      name: "Dragon Hoard",
      description: "Vast wealth from an ancient dragon.",
      valueInPennies: 1440, // 6 crowns
      wealthLevel: WealthLevel.Noble,
    },
    expectedAbbreviated: "6gc",
    expectedFull: "6 gold crowns",
  },
];

describe("LootItem Currency Formatting Tests", () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Set up mock implementations based on test data
    mockFormatCurrencyAbbreviated.mockImplementation((pennies: number) => {
      const testItem = testItems.find(
        (item) => item.item.valueInPennies === pennies
      );
      return testItem?.expectedAbbreviated || `${pennies}p`;
    });

    mockFormatCurrencyFull.mockImplementation((pennies: number) => {
      const testItem = testItems.find(
        (item) => item.item.valueInPennies === pennies
      );
      return testItem?.expectedFull || `${pennies} pennies`;
    });
  });

  testItems.forEach(
    ({ description, item, expectedAbbreviated, expectedFull }) => {
      describe(`Currency formatting for: ${description}`, () => {
        it("displays full format by default", () => {
          render(
            <TestWrapper>
              <LootItem item={item} />
            </TestWrapper>
          );

          expect(mockFormatCurrencyFull).toHaveBeenCalledWith(
            item.valueInPennies
          );
          expect(screen.getByText(expectedFull)).toBeInTheDocument();
        });

        it("displays abbreviated format when abbreviatedCurrency prop is true", () => {
          render(
            <TestWrapper>
              <LootItem item={item} abbreviatedCurrency={true} />
            </TestWrapper>
          );

          expect(mockFormatCurrencyAbbreviated).toHaveBeenCalledWith(
            item.valueInPennies
          );
          expect(screen.getByText(expectedAbbreviated)).toBeInTheDocument();
        });

        it("toggles between formats when clicked", () => {
          render(
            <TestWrapper>
              <LootItem item={item} />
            </TestWrapper>
          );

          // Initially shows full format
          expect(screen.getByText(expectedFull)).toBeInTheDocument();

          // Click to toggle to abbreviated
          const currencyDisplay = screen.getByText(expectedFull);
          fireEvent.click(currencyDisplay);

          expect(mockFormatCurrencyAbbreviated).toHaveBeenCalledWith(
            item.valueInPennies
          );
          expect(screen.getByText(expectedAbbreviated)).toBeInTheDocument();

          // Click again to toggle back to full
          fireEvent.click(screen.getByText(expectedAbbreviated));

          expect(screen.getByText(expectedFull)).toBeInTheDocument();
        });
      });
    }
  );

  describe("Currency Formatting Function Calls", () => {
    it("calls formatCurrencyFull with correct parameters", () => {
      const testItem = testItems[3]; // Mixed shillings and pennies

      render(
        <TestWrapper>
          <LootItem item={testItem.item} />
        </TestWrapper>
      );

      expect(mockFormatCurrencyFull).toHaveBeenCalledTimes(1);
      expect(mockFormatCurrencyFull).toHaveBeenCalledWith(
        testItem.item.valueInPennies
      );
    });

    it("calls formatCurrencyAbbreviated when toggled", () => {
      const testItem = testItems[2]; // Less than one shilling

      render(
        <TestWrapper>
          <LootItem item={testItem.item} />
        </TestWrapper>
      );

      const currencyDisplay = screen.getByText(
        `${testItem.item.valueInPennies} pennies`
      );
      fireEvent.click(currencyDisplay);

      expect(mockFormatCurrencyAbbreviated).toHaveBeenCalledTimes(1);
      expect(mockFormatCurrencyAbbreviated).toHaveBeenCalledWith(
        testItem.item.valueInPennies
      );
    });

    it("respects initial abbreviatedCurrency prop", () => {
      const testItem = testItems[4]; // Mixed crowns, shillings, and pennies

      render(
        <TestWrapper>
          <LootItem item={testItem.item} abbreviatedCurrency={true} />
        </TestWrapper>
      );

      // Should start with abbreviated format
      expect(mockFormatCurrencyAbbreviated).toHaveBeenCalledWith(
        testItem.item.valueInPennies
      );
      expect(mockFormatCurrencyFull).not.toHaveBeenCalled();

      // Toggle to full format
      const currencyDisplay = screen.getByText(testItem.expectedAbbreviated);
      fireEvent.click(currencyDisplay);

      expect(mockFormatCurrencyFull).toHaveBeenCalledWith(
        testItem.item.valueInPennies
      );
    });
  });

  describe("Price Display Controls", () => {
    const testItem = testItems[5]; // Exactly one crown

    it("shows price section when showPrice is true", () => {
      render(
        <TestWrapper>
          <LootItem item={testItem.item} showPrice={true} />
        </TestWrapper>
      );

      expect(screen.getByText(testItem.expectedFull)).toBeInTheDocument();
      expect(screen.getByText(testItem.expectedFull)).toHaveStyle(
        "cursor: pointer"
      );
    });

    it("hides price section when showPrice is false", () => {
      render(
        <TestWrapper>
          <LootItem item={testItem.item} showPrice={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(screen.queryByText(testItem.expectedFull)).not.toBeInTheDocument();
      expect(mockFormatCurrencyFull).not.toHaveBeenCalled();
      expect(mockFormatCurrencyAbbreviated).not.toHaveBeenCalled();
    });

    it("combines showPrice false with other props correctly", () => {
      render(
        <TestWrapper>
          <LootItem
            item={testItem.item}
            showPrice={false}
            abbreviatedCurrency={true}
          />
        </TestWrapper>
      );

      // Item name and description should still be shown
      expect(screen.getByText(testItem.item.name)).toBeInTheDocument();
      expect(screen.getByText(testItem.item.description)).toBeInTheDocument();

      // Price should be hidden regardless of abbreviatedCurrency prop
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
      expect(mockFormatCurrencyAbbreviated).not.toHaveBeenCalled();
    });
  });

  describe("Accessibility Features", () => {
    const testItem = testItems[6]; // Large value

    it("has clickable currency display", () => {
      render(
        <TestWrapper>
          <LootItem item={testItem.item} />
        </TestWrapper>
      );

      const currencyDisplay = screen.getByText(testItem.expectedFull);
      expect(currencyDisplay).toBeInTheDocument();
      expect(currencyDisplay).toHaveStyle("cursor: pointer");
    });

    it("supports click interaction for currency toggle", () => {
      render(
        <TestWrapper>
          <LootItem item={testItem.item} />
        </TestWrapper>
      );

      const currencyDisplay = screen.getByText(testItem.expectedFull);

      // Click to toggle
      fireEvent.click(currencyDisplay);
      expect(mockFormatCurrencyAbbreviated).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("handles currency formatter errors gracefully", () => {
      const errorItem = testItems[0].item;

      // Mock formatter to throw an error
      mockFormatCurrencyFull.mockImplementation(() => {
        throw new Error("Currency formatting error");
      });

      // Component should not crash
      expect(() => {
        render(
          <TestWrapper>
            <LootItem item={errorItem} />
          </TestWrapper>
        );
      }).not.toThrow();
    });

    it("handles negative values passed to formatter", () => {
      const negativeValueItem = {
        ...testItems[0].item,
        valueInPennies: -100,
      };

      mockFormatCurrencyFull.mockReturnValue("Invalid value");

      render(
        <TestWrapper>
          <LootItem item={negativeValueItem} />
        </TestWrapper>
      );

      expect(mockFormatCurrencyFull).toHaveBeenCalledWith(-100);
      expect(screen.getByText("Invalid value")).toBeInTheDocument();
    });
  });
});
