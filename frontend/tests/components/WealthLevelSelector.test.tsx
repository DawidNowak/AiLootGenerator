import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { WealthLevelSelector } from "../../src/components/WealthLevelSelector";
import { WealthLevel } from "../../src/types";

// Mock i18next
const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    // Form translations
    "labels.wealthLevel": "Wealth Level",
    // Loot translations
    "wealthLevels.Rubbish": "Rubbish",
    "wealthLevels.Poor": "Poor",
    "wealthLevels.Common": "Common",
    "wealthLevels.Wealthy": "Wealthy",
    "wealthLevels.Noble": "Noble",
    "wealthLevelDescriptions.Rubbish": "Junk items, lowest tier (1-12 pennies)",
    "wealthLevelDescriptions.Poor":
      "Peasant scraps, basic items (13-60 pennies)",
    "wealthLevelDescriptions.Common":
      "Everyday goods, standard quality (61-240 pennies)",
    "wealthLevelDescriptions.Wealthy":
      "Merchant spoils, valuable items (241-1200 pennies)",
    "wealthLevelDescriptions.Noble":
      "Opulent treasures, rare magic items (1201+ pennies)",
  };
  return translations[key] || key;
});

// Mock useTranslation hook
jest.mock("react-i18next", () => ({
  ...jest.requireActual("react-i18next"),
  useTranslation: () => ({
    t: mockT,
  }),
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("WealthLevelSelector Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockT.mockClear();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      value: WealthLevel.Common,
      onChange: mockOnChange,
      ...props,
    };

    return render(
      <TestWrapper>
        <WealthLevelSelector {...defaultProps} />
      </TestWrapper>
    );
  };

  describe("Rendering", () => {
    test("renders wealth level selector with default props", () => {
      renderComponent();

      expect(screen.getByLabelText("Wealth Level")).toBeInTheDocument();
      expect(screen.getByDisplayValue("Common")).toBeInTheDocument();
    });

    test("renders with required asterisk when required=true", () => {
      renderComponent({ required: true });

      const select = screen.getByRole("combobox", { name: /wealth level/i });
      expect(select).toBeInTheDocument();

      // Check that the hidden input has the required attribute
      const hiddenInput = document.querySelector(".MuiSelect-nativeInput");
      expect(hiddenInput).toHaveAttribute("required");
    });

    test("renders all wealth level options when opened", async () => {
      const user = userEvent.setup();
      renderComponent();

      const select = screen.getByLabelText("Wealth Level");
      await user.click(select);

      await waitFor(() => {
        expect(screen.getAllByText("Rubbish")).toHaveLength(1);
        expect(screen.getAllByText("Poor")).toHaveLength(1);
        expect(screen.getAllByText("Common")).toHaveLength(2); // One in select, one in dropdown
        expect(screen.getAllByText("Wealthy")).toHaveLength(1);
        expect(screen.getAllByText("Noble")).toHaveLength(1);
      });
    });

    test("displays helper text with description", () => {
      renderComponent({ value: WealthLevel.Wealthy });

      expect(
        screen.getByText("Merchant spoils, valuable items (241-1200 pennies)")
      ).toBeInTheDocument();
    });

    test("displays custom helper text when provided", () => {
      const customHelperText = "Custom helper text";
      renderComponent({ helperText: customHelperText });

      expect(screen.getByText(customHelperText)).toBeInTheDocument();
    });

    test("renders in error state when error=true", () => {
      renderComponent({ error: true });

      const hiddenInput = document.querySelector(".MuiSelect-nativeInput");
      expect(hiddenInput).toHaveAttribute("aria-invalid", "true");
    });

    test("renders in disabled state when disabled=true", () => {
      renderComponent({ disabled: true });

      const select = screen.getByLabelText("Wealth Level");
      expect(select).toHaveAttribute("aria-disabled", "true");
    });
  });

  describe("Interaction", () => {
    test("calls onChange when different wealth level is selected", async () => {
      const user = userEvent.setup();
      renderComponent({ value: WealthLevel.Common });

      const select = screen.getByLabelText("Wealth Level");
      await user.click(select);

      await waitFor(() => {
        expect(screen.getByText("Noble")).toBeInTheDocument();
      });

      await user.click(screen.getByText("Noble"));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(WealthLevel.Noble);
      });
    });

    test("does not call onChange when disabled", async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      const select = screen.getByLabelText("Wealth Level");

      // Try to click disabled select - this should not open dropdown
      await user.click(select);

      // Verify onChange was not called
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test("updates description when wealth level changes", async () => {
      const { rerender } = renderComponent({ value: WealthLevel.Rubbish });

      expect(
        screen.getByText("Junk items, lowest tier (1-12 pennies)")
      ).toBeInTheDocument();

      // Simulate external state change
      rerender(
        <TestWrapper>
          <WealthLevelSelector
            value={WealthLevel.Noble}
            onChange={mockOnChange}
          />
        </TestWrapper>
      );

      expect(
        screen.getByText("Opulent treasures, rare magic items (1201+ pennies)")
      ).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    test("respects fullWidth=false", () => {
      renderComponent({ fullWidth: false });

      const formControl = screen
        .getByLabelText("Wealth Level")
        .closest(".MuiFormControl-root");
      expect(formControl).not.toHaveClass("MuiFormControl-fullWidth");
    });

    test("applies fullWidth=true by default", () => {
      renderComponent();

      const formControl = screen
        .getByLabelText("Wealth Level")
        .closest(".MuiFormControl-root");
      expect(formControl).toHaveClass("MuiFormControl-fullWidth");
    });

    test("handles all wealth level values correctly", () => {
      Object.values(WealthLevel).forEach((level) => {
        const { rerender } = renderComponent({ value: level });
        expect(screen.getByDisplayValue(level)).toBeInTheDocument();

        // Clean up for next iteration
        rerender(<div />);
      });
    });
  });

  describe("Accessibility", () => {
    test("has proper aria labels", () => {
      renderComponent();

      const select = screen.getByLabelText("Wealth Level");
      expect(select).toHaveAttribute("aria-labelledby");
      expect(select).toHaveAttribute("role", "combobox");
    });

    test("has proper aria labels when required", () => {
      renderComponent({ required: true });

      const select = screen.getByRole("combobox", { name: /wealth level/i });
      expect(select).toHaveAttribute("aria-labelledby");
      expect(select).toHaveAttribute("role", "combobox");
    });

    test("associates helper text with select input", () => {
      renderComponent({ helperText: "Custom helper" });

      const select = screen.getByLabelText("Wealth Level");
      const helperTextId = select.getAttribute("aria-describedby");

      expect(helperTextId).toBeTruthy();
      expect(screen.getByText("Custom helper")).toHaveAttribute(
        "id",
        helperTextId
      );
    });
  });

  describe("Internationalization", () => {
    test("calls translation function for wealth level label", () => {
      renderComponent();

      expect(mockT).toHaveBeenCalledWith("labels.wealthLevel");
    });

    test("calls translation function for each wealth level name", async () => {
      renderComponent();

      const select = screen.getByLabelText("Wealth Level");
      await userEvent.click(select);

      await waitFor(() => {
        expect(mockT).toHaveBeenCalledWith("wealthLevels.Rubbish");
        expect(mockT).toHaveBeenCalledWith("wealthLevels.Poor");
        expect(mockT).toHaveBeenCalledWith("wealthLevels.Common");
        expect(mockT).toHaveBeenCalledWith("wealthLevels.Wealthy");
        expect(mockT).toHaveBeenCalledWith("wealthLevels.Noble");
      });
    });

    test("calls translation function for wealth level description", () => {
      renderComponent({ value: WealthLevel.Noble });

      expect(mockT).toHaveBeenCalledWith("wealthLevelDescriptions.Noble");
    });
  });
});
