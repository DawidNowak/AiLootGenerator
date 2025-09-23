import React, { useState } from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LocationInput } from "../../src/components/LocationInput";

// Mock i18next
const mockT = jest.fn((key: string, options?: any) => {
  const translations: Record<string, string> = {
    "labels.location": "Location",
    "placeholders.location": "e.g., Ubersreik, Altdorf, The Grey Mountains",
    "hints.location": `Enter a Warhammer Fantasy location (max ${
      options?.maxLength || 200
    } characters)`,
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

describe("LocationInput Component", () => {
  const mockOnChange = jest.fn();

  beforeEach(() => {
    mockOnChange.mockClear();
    mockT.mockClear();
  });

  const renderComponent = (props = {}) => {
    const defaultProps = {
      value: "",
      onChange: mockOnChange,
      ...props,
    };

    // For controlled components in tests, we need to manage state
    const TestComponent = () => {
      const [value, setValue] = useState<string>(defaultProps.value || "");

      const handleChange = (newValue: string) => {
        setValue(newValue);
        mockOnChange(newValue);
      };

      return (
        <LocationInput
          {...defaultProps}
          value={value}
          onChange={handleChange}
        />
      );
    };

    return render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );
  };

  describe("Rendering", () => {
    test("renders location input with default props", () => {
      renderComponent();

      expect(screen.getByLabelText("Location")).toBeInTheDocument();
      expect(
        screen.getByPlaceholderText(
          "e.g., Ubersreik, Altdorf, The Grey Mountains"
        )
      ).toBeInTheDocument();
    });

    test("renders with required asterisk when required=true", () => {
      renderComponent({ required: true });

      const input = screen.getByRole("textbox", { name: /location/i });
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("required");
    });

    test("displays current value in input", () => {
      const testValue = "Ubersreik";
      renderComponent({ value: testValue });

      expect(screen.getByDisplayValue(testValue)).toBeInTheDocument();
    });

    test("displays default helper text", () => {
      renderComponent();

      expect(
        screen.getByText(
          "Enter a Warhammer Fantasy location (max 200 characters)"
        )
      ).toBeInTheDocument();
    });

    test("displays custom helper text when provided", () => {
      const customHelperText = "Custom helper text";
      renderComponent({ helperText: customHelperText });

      expect(screen.getByText(customHelperText)).toBeInTheDocument();
    });

    test("displays custom placeholder when provided", () => {
      const customPlaceholder = "Enter your location here";
      renderComponent({ placeholder: customPlaceholder });

      expect(
        screen.getByPlaceholderText(customPlaceholder)
      ).toBeInTheDocument();
    });

    test("renders in error state when error=true", () => {
      renderComponent({ error: true });

      const input = screen.getByLabelText("Location");
      expect(input).toHaveAttribute("aria-invalid", "true");
    });

    test("renders in disabled state when disabled=true", () => {
      renderComponent({ disabled: true });

      expect(screen.getByLabelText("Location")).toBeDisabled();
    });
  });

  describe("Interaction", () => {
    test("calls onChange when text is entered", async () => {
      const user = userEvent.setup();
      renderComponent();

      const input = screen.getByLabelText("Location");
      await user.type(input, "Altdorf");

      expect(mockOnChange).toHaveBeenCalledTimes(7); // One for each character
      // userEvent.type fires individual events, so we check the final value in the input
      expect(input).toHaveValue("Altdorf");
    });

    test("calls onChange when text is cleared", async () => {
      const user = userEvent.setup();
      renderComponent({ value: "Ubersreik" });

      const input = screen.getByLabelText("Location");
      await user.clear(input);

      expect(mockOnChange).toHaveBeenCalledWith("");
    });

    test("does not call onChange when disabled", async () => {
      const user = userEvent.setup();
      renderComponent({ disabled: true });

      const input = screen.getByLabelText("Location");
      await user.type(input, "test");

      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test("enforces character limit", async () => {
      const user = userEvent.setup();
      const maxLength = 10;
      renderComponent({ maxLength });

      const input = screen.getByLabelText("Location");
      const longText =
        "This is a very long location name that exceeds the limit";

      await user.type(input, longText);

      // Should only allow up to maxLength characters in the input value
      expect(input).toHaveValue("This is a ");
      expect(input).toHaveAttribute("maxlength", maxLength.toString());
    });

    test("allows typing when under character limit", async () => {
      const user = userEvent.setup();
      const maxLength = 50;
      renderComponent({ maxLength });

      const input = screen.getByLabelText("Location");
      const normalText = "Ubersreik";

      await user.type(input, normalText);

      expect(mockOnChange).toHaveBeenCalledTimes(normalText.length);
      expect(input).toHaveValue(normalText);
    });
  });

  describe("Props", () => {
    test("respects fullWidth=false", () => {
      renderComponent({ fullWidth: false });

      const input = screen.getByLabelText("Location");
      expect(input.closest(".MuiTextField-root")).not.toHaveClass(
        "MuiTextField-fullWidth"
      );
    });

    test("applies fullWidth=true by default", () => {
      renderComponent();

      const input = screen.getByLabelText("Location");
      expect(input.closest(".MuiFormControl-root")).toHaveClass(
        "MuiFormControl-fullWidth"
      );
    });

    test("applies custom maxLength", () => {
      const customMaxLength = 50;
      renderComponent({ maxLength: customMaxLength });

      const input = screen.getByLabelText("Location");
      expect(input).toHaveAttribute("maxlength", customMaxLength.toString());
    });

    test("applies default maxLength when not specified", () => {
      renderComponent();

      const input = screen.getByLabelText("Location");
      expect(input).toHaveAttribute("maxlength", "200");
    });
  });

  describe("Accessibility", () => {
    test("has proper aria labels", () => {
      renderComponent();

      const input = screen.getByLabelText("Location");
      expect(input).toHaveAttribute("aria-describedby", "location-helper-text");
    });

    test("has proper aria labels when required", () => {
      renderComponent({ required: true });

      const input = screen.getByRole("textbox", { name: /location/i });
      expect(input).toHaveAttribute("required");
      expect(input).toHaveAttribute("aria-describedby", "location-helper-text");
    });

    test("associates helper text with input", () => {
      renderComponent({ helperText: "Custom helper" });

      const input = screen.getByLabelText("Location");
      const helperTextId = input.getAttribute("aria-describedby");

      expect(helperTextId).toBe("location-helper-text");
      expect(screen.getByText("Custom helper")).toHaveAttribute(
        "id",
        helperTextId
      );
    });

    test("has proper input attributes", () => {
      renderComponent();

      const input = screen.getByLabelText("Location");
      expect(input).toHaveAttribute("id", "location-input");
      expect(input).toHaveAttribute("type", "text");
    });
  });

  describe("Validation", () => {
    test("prevents input beyond maxLength", async () => {
      const user = userEvent.setup();
      const maxLength = 5;
      renderComponent({ maxLength, value: "12345" });

      const input = screen.getByLabelText("Location");

      // Try to type more characters
      await user.type(input, "6");

      // onChange should not have been called for the 6th character
      expect(mockOnChange).not.toHaveBeenCalled();
    });

    test("allows typing when at exactly maxLength-1", async () => {
      const user = userEvent.setup();
      const maxLength = 5;
      renderComponent({ maxLength, value: "1234" });

      const input = screen.getByLabelText("Location");

      // Should allow typing one more character
      await user.type(input, "5");

      expect(mockOnChange).toHaveBeenCalledWith("12345");
    });
  });

  describe("Internationalization", () => {
    test("calls translation function for location label", () => {
      renderComponent();

      expect(mockT).toHaveBeenCalledWith("labels.location");
    });

    test("calls translation function for placeholder", () => {
      renderComponent();

      expect(mockT).toHaveBeenCalledWith("placeholders.location");
    });

    test("calls translation function for helper text", () => {
      renderComponent();

      expect(mockT).toHaveBeenCalledWith("hints.location");
    });

    test("uses custom placeholder instead of translation when provided", () => {
      const customPlaceholder = "Custom placeholder";
      renderComponent({ placeholder: customPlaceholder });

      expect(
        screen.getByPlaceholderText(customPlaceholder)
      ).toBeInTheDocument();
      // Should not call translation for placeholder when custom one is provided
      expect(mockT).not.toHaveBeenCalledWith("placeholder");
    });
  });
});
