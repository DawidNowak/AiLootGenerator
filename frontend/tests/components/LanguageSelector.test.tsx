import React from "react";
import { render, screen, waitFor, act } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LanguageSelector } from "../../src/components/LanguageSelector";
import { Language } from "../../src/types";

// Mock i18next
const mockChangeLanguage = jest.fn().mockResolvedValue(undefined);
const mockT = jest.fn((key: string) => {
  const translations: Record<string, string> = {
    language: "Language",
    english: "English",
    polish: "Polish",
  };
  return translations[key] || key;
});

const mockI18n = {
  changeLanguage: mockChangeLanguage,
  language: "en",
  languages: ["en", "pl"],
  t: mockT,
};

// Mock useTranslation hook
jest.mock("react-i18next", () => ({
  ...jest.requireActual("react-i18next"),
  useTranslation: () => ({
    t: mockT,
    i18n: mockI18n,
  }),
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("LanguageSelector Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockChangeLanguage.mockClear();
    mockT.mockClear();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      value: "en" as Language,
      onChange: mockOnChange,
      ...props,
    };

    return render(
      <TestWrapper>
        <LanguageSelector {...defaultProps} />
      </TestWrapper>
    );
  };

  describe("T030 - Basic LanguageSelector dropdown", () => {
    test("renders with correct structure", () => {
      renderComponent();

      const selector = screen.getByTestId("language-selector");
      expect(selector).toBeInTheDocument();

      // Check that it has the hidden input with value
      const hiddenInput = screen.getByDisplayValue("en");
      expect(hiddenInput).toBeInTheDocument();
    });

    test("displays language label", () => {
      renderComponent();

      expect(screen.getByLabelText("Language")).toBeInTheDocument();
    });

    test("shows both language options when opened", async () => {
      const user = userEvent.setup();
      renderComponent();

      const selector = screen.getByRole("combobox");
      await act(async () => {
        await user.click(selector);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "English" })
        ).toBeInTheDocument();
        expect(
          screen.getByRole("option", { name: "Polish" })
        ).toBeInTheDocument();
      });
    });

    test("applies disabled state", () => {
      renderComponent({ disabled: true });

      const combobox = screen.getByRole("combobox");
      expect(combobox).toHaveAttribute("aria-disabled", "true");
    });

    test("shows current language value", () => {
      renderComponent({ value: "pl" });

      const hiddenInput = screen.getByDisplayValue("pl");
      expect(hiddenInput).toBeInTheDocument();
    });

    test("supports fullWidth prop", () => {
      const { container } = renderComponent({ fullWidth: true });

      const formControl = container.querySelector(".MuiFormControl-root");
      expect(formControl).toHaveClass("MuiFormControl-fullWidth");
    });
  });

  describe("T031 - i18next integration", () => {
    test("calls onChange when language is selected", async () => {
      const user = userEvent.setup();
      renderComponent();

      const selector = screen.getByRole("combobox");
      await act(async () => {
        await user.click(selector);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Polish" })
        ).toBeInTheDocument();
      });

      const polishOption = screen.getByRole("option", { name: "Polish" });
      await act(async () => {
        await user.click(polishOption);
      });

      expect(mockOnChange).toHaveBeenCalledWith("pl");
    });

    test("changes i18next language when option is selected", async () => {
      const user = userEvent.setup();
      renderComponent();

      const selector = screen.getByRole("combobox");
      await act(async () => {
        await user.click(selector);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Polish" })
        ).toBeInTheDocument();
      });

      const polishOption = screen.getByRole("option", { name: "Polish" });
      await act(async () => {
        await user.click(polishOption);
      });

      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith("pl");
      });
    });

    test("handles i18next language change failure gracefully", async () => {
      const user = userEvent.setup();
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();

      // Mock changeLanguage to reject
      mockChangeLanguage.mockRejectedValueOnce(
        new Error("Language change failed")
      );

      renderComponent();

      const selector = screen.getByRole("combobox");
      await act(async () => {
        await user.click(selector);
      });

      await waitFor(() => {
        expect(
          screen.getByRole("option", { name: "Polish" })
        ).toBeInTheDocument();
      });

      const polishOption = screen.getByRole("option", { name: "Polish" });
      await act(async () => {
        await user.click(polishOption);
      });

      await waitFor(() => {
        expect(mockChangeLanguage).toHaveBeenCalledWith("pl");
        expect(consoleSpy).toHaveBeenCalledWith(
          "Failed to change language:",
          expect.any(Error)
        );
        expect(mockOnChange).toHaveBeenCalledWith("pl");
      });

      consoleSpy.mockRestore();
      // Reset the mock back to resolved
      mockChangeLanguage.mockResolvedValue(undefined);
    });

    test("maintains accessibility with screen readers", () => {
      renderComponent();

      const selector = screen.getByRole("combobox");
      const label = screen.getByLabelText("Language");

      expect(selector).toHaveAttribute("aria-labelledby");
      expect(label).toHaveAttribute("id");
    });
  });

  describe("Integration scenarios", () => {
    test("works correctly in form context", () => {
      // Basic form integration test without useState
      render(
        <TestWrapper>
          <form>
            <LanguageSelector value="en" onChange={mockOnChange} />
          </form>
        </TestWrapper>
      );

      expect(screen.getByRole("combobox")).toBeInTheDocument();
    });

    test("supports controlled component pattern", async () => {
      // Test that the component can be controlled externally
      const { rerender } = render(
        <TestWrapper>
          <LanguageSelector value="en" onChange={mockOnChange} />
        </TestWrapper>
      );

      expect(screen.getByDisplayValue("en")).toBeInTheDocument();

      // Re-render with different value to test controlled behavior
      rerender(
        <TestWrapper>
          <LanguageSelector value="pl" onChange={mockOnChange} />
        </TestWrapper>
      );

      expect(screen.getByDisplayValue("pl")).toBeInTheDocument();
    });
  });
});
