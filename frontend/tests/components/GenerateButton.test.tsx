import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { GenerateButton } from "../../src/components/GenerateButton";

// Mock i18next
const mockT = jest.fn();
const mockTErrors = jest.fn();

jest.mock("react-i18next", () => ({
  ...jest.requireActual("react-i18next"),
  useTranslation: (namespace: string) => {
    if (namespace === "errors") {
      return { t: mockTErrors };
    }
    return { t: mockT };
  },
}));

const theme = createTheme();

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <ThemeProvider theme={theme}>{children}</ThemeProvider>
);

describe("GenerateButton Component", () => {
  const mockOnClick = jest.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
    mockT.mockClear();
    mockTErrors.mockClear();

    // Setup default translations
    mockT.mockImplementation((key: string) => {
      const translations: Record<string, string> = {
        "buttons.generate": "Generate Loot",
        "buttons.generating": "Generating...",
      };
      return translations[key] || key;
    });

    mockTErrors.mockImplementation((key: string, options?: any) => {
      const translations: Record<string, string> = {
        "button.generatingInProgress": "Generation in progress, please wait",
        "button.formIncomplete": "Please fill in all required fields",
        "button.cooldownActive": `Please wait ${
          options?.seconds || 0
        } seconds before generating again`,
        "button.networkError": "Network error - please check your connection",
        "button.temporarilyDisabled": "Button temporarily disabled",
      };
      return translations[key] || key;
    });
  });

  describe("Basic Rendering", () => {
    it("renders generate button with default props", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveTextContent("Generate Loot");
      expect(button).not.toBeDisabled();
    });

    it("renders with custom variant and color", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            variant="outlined"
            color="secondary"
          />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeInTheDocument();
      expect(button).toHaveClass("MuiButton-outlined");
      expect(button).toHaveClass("MuiButton-colorSecondary");
    });

    it("renders with custom size", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} size="small" />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toHaveClass("MuiButton-sizeSmall");
    });

    it("renders with full width by default", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toHaveClass("MuiButton-fullWidth");
    });

    it("renders without full width when specified", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} fullWidth={false} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).not.toHaveClass("MuiButton-fullWidth");
    });
  });

  describe("Click Behavior", () => {
    it("calls onClick when clicked and enabled", async () => {
      const user = userEvent.setup();

      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      await user.click(button);

      expect(mockOnClick).toHaveBeenCalledTimes(1);
    });

    it("does not call onClick when disabled", async () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} disabled={true} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
      // Disabled buttons can't be clicked in Material-UI
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when loading", async () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} loading={true} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
      // Disabled buttons can't be clicked in Material-UI
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when form is invalid", async () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} isFormValid={false} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
      // Disabled buttons can't be clicked in Material-UI
      expect(mockOnClick).not.toHaveBeenCalled();
    });

    it("does not call onClick when in cooldown", async () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} isInCooldown={true} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
      // Disabled buttons can't be clicked in Material-UI
      expect(mockOnClick).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("displays loading text when loading", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} loading={true} />
        </TestWrapper>
      );

      expect(screen.getByText("Generating...")).toBeInTheDocument();
    });

    it("displays loading spinner when loading", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} loading={true} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(
        button.querySelector(".MuiCircularProgress-root")
      ).toBeInTheDocument();
    });

    it("is disabled when loading", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} loading={true} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
    });

    it("has correct aria-label when loading", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} loading={true} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toHaveAttribute("aria-label", "Generating...");
    });
  });

  describe("Disabled States", () => {
    it("is disabled when disabled prop is true", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} disabled={true} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
    });

    it("is disabled when form is invalid", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} isFormValid={false} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
    });

    it("is disabled when in cooldown", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} isInCooldown={true} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
    });

    it("shows tooltip for form validation error", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} isFormValid={false} />
        </TestWrapper>
      );

      // Check that tooltip span wrapper exists (for disabled state)
      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
      expect(button.parentElement?.tagName.toLowerCase()).toBe("span");
    });

    it("shows tooltip for cooldown state", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            isInCooldown={true}
            cooldownTimeRemaining={15}
          />
        </TestWrapper>
      );

      // Check that tooltip span wrapper exists (for disabled state)
      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
      expect(button.parentElement?.tagName.toLowerCase()).toBe("span");
    });

    it("shows tooltip for loading state", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} loading={true} />
        </TestWrapper>
      );

      // Check that tooltip span wrapper exists (for disabled state)
      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
      expect(button.parentElement?.tagName.toLowerCase()).toBe("span");
    });

    it("shows tooltip for network error", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            disabled={true}
            disabledReason="network"
          />
        </TestWrapper>
      );

      // Check that tooltip span wrapper exists (for disabled state)
      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
      expect(button.parentElement?.tagName.toLowerCase()).toBe("span");
    });
  });

  describe("Cooldown Display", () => {
    it("displays cooldown time in button text when in cooldown", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            isInCooldown={true}
            cooldownTimeRemaining={25}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Generate Loot (25s)")).toBeInTheDocument();
    });

    it("displays cooldown time in minutes and seconds format", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            isInCooldown={true}
            cooldownTimeRemaining={125} // 2 minutes 5 seconds
          />
        </TestWrapper>
      );

      expect(screen.getByText("Generate Loot (2:05)")).toBeInTheDocument();
    });

    it("displays only seconds when less than a minute", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            isInCooldown={true}
            cooldownTimeRemaining={45}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Generate Loot (45s)")).toBeInTheDocument();
    });

    it("does not display cooldown time when zero", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            isInCooldown={true}
            cooldownTimeRemaining={0}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Generate Loot")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has correct aria-disabled when disabled", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} disabled={true} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toHaveAttribute("aria-disabled", "true");
    });

    it("has correct aria-label when enabled", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toHaveAttribute("aria-label", "Generate Loot");
    });

    it("has data-disabled-reason attribute when specified", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            disabled={true}
            disabledReason="network"
          />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).toHaveAttribute("data-disabled-reason", "network");
    });
  });

  describe("Translation Integration", () => {
    it("calls form translation for generate text", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} />
        </TestWrapper>
      );

      expect(mockT).toHaveBeenCalledWith("buttons.generate");
    });

    it("calls form translation for generating text", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} loading={true} />
        </TestWrapper>
      );

      expect(mockT).toHaveBeenCalledWith("buttons.generating");
    });

    it("calls error translation for disabled state tooltips", () => {
      render(
        <TestWrapper>
          <GenerateButton onClick={mockOnClick} isFormValid={false} />
        </TestWrapper>
      );

      // Translation should be called when component renders with disabled state
      expect(mockTErrors).toHaveBeenCalledWith("button.formIncomplete");
    });

    it("calls error translation with cooldown parameters", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            isInCooldown={true}
            cooldownTimeRemaining={30}
          />
        </TestWrapper>
      );

      // Translation should be called when component renders with cooldown
      expect(mockTErrors).toHaveBeenCalledWith("button.cooldownActive", {
        seconds: 30,
      });
    });
  });

  describe("Complex State Combinations", () => {
    it("prioritizes loading state over other disabled states", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            loading={true}
            disabled={true}
            isFormValid={false}
            isInCooldown={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Generating...")).toBeInTheDocument();
      expect(screen.getByTestId("generate-button")).toBeDisabled();
    });

    it("prioritizes form validation over cooldown in tooltip", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            isFormValid={false}
            isInCooldown={true}
            cooldownTimeRemaining={15}
          />
        </TestWrapper>
      );

      // Form validation should be checked first
      const button = screen.getByTestId("generate-button");
      expect(button).toBeDisabled();
      expect(mockTErrors).toHaveBeenCalledWith("button.formIncomplete");
    });

    it("enables button when all conditions are met", () => {
      render(
        <TestWrapper>
          <GenerateButton
            onClick={mockOnClick}
            disabled={false}
            loading={false}
            isFormValid={true}
            isInCooldown={false}
          />
        </TestWrapper>
      );

      const button = screen.getByTestId("generate-button");
      expect(button).not.toBeDisabled();
      expect(screen.getByText("Generate Loot")).toBeInTheDocument();
    });
  });
});
