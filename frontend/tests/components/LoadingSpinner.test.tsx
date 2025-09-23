import React from "react";
import { render, screen } from "@testing-library/react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { LoadingSpinner } from "../../src/components/LoadingSpinner";

// Mock i18next
const mockT = jest.fn();

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

describe("LoadingSpinner Component", () => {
  beforeEach(() => {
    mockT.mockClear();

    // Setup default translations
    mockT.mockImplementation((key: string, fallback?: string) => {
      const translations: Record<string, string> = {
        loading: "Loading...",
      };
      return translations[key] || fallback || key;
    });
  });

  describe("Basic Rendering", () => {
    it("renders basic spinner without text", () => {
      render(
        <TestWrapper>
          <LoadingSpinner />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute("aria-label", "Loading...");
    });

    it("renders spinner with default loading text when showText is true", () => {
      render(
        <TestWrapper>
          <LoadingSpinner showText />
        </TestWrapper>
      );

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("renders spinner with custom text", () => {
      const customText = "Generating loot...";

      render(
        <TestWrapper>
          <LoadingSpinner showText text={customText} />
        </TestWrapper>
      );

      expect(screen.getByText(customText)).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toHaveAttribute(
        "aria-label",
        customText
      );
    });

    it("uses i18n translation for default text", () => {
      mockT.mockReturnValue("Ładowanie...");

      render(
        <TestWrapper>
          <LoadingSpinner showText />
        </TestWrapper>
      );

      expect(mockT).toHaveBeenCalledWith("loading", "Loading...");
      expect(screen.getByText("Ładowanie...")).toBeInTheDocument();
    });
  });

  describe("Size Variants", () => {
    it("renders with small size", () => {
      render(
        <TestWrapper>
          <LoadingSpinner size="small" />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });

    it("renders with medium size", () => {
      render(
        <TestWrapper>
          <LoadingSpinner size="medium" />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });

    it("renders with large size", () => {
      render(
        <TestWrapper>
          <LoadingSpinner size="large" />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });

    it("renders with custom numeric size", () => {
      render(
        <TestWrapper>
          <LoadingSpinner size={60} />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Color Variants", () => {
    it("renders with primary color by default", () => {
      render(
        <TestWrapper>
          <LoadingSpinner />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });

    it("renders with secondary color", () => {
      render(
        <TestWrapper>
          <LoadingSpinner color="secondary" />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });

    it("renders with error color", () => {
      render(
        <TestWrapper>
          <LoadingSpinner color="error" />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Text Positioning", () => {
    it("renders text at bottom by default", () => {
      render(
        <TestWrapper>
          <LoadingSpinner showText text="Loading..." />
        </TestWrapper>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders text at top", () => {
      render(
        <TestWrapper>
          <LoadingSpinner showText text="Loading..." textPosition="top" />
        </TestWrapper>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders text on left", () => {
      render(
        <TestWrapper>
          <LoadingSpinner showText text="Loading..." textPosition="left" />
        </TestWrapper>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("renders text on right", () => {
      render(
        <TestWrapper>
          <LoadingSpinner showText text="Loading..." textPosition="right" />
        </TestWrapper>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });
  });

  describe("Progress Variants", () => {
    it("renders indeterminate progress by default", () => {
      render(
        <TestWrapper>
          <LoadingSpinner />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
      expect(spinner).not.toHaveAttribute("aria-valuenow");
    });

    it("renders determinate progress with value", () => {
      render(
        <TestWrapper>
          <LoadingSpinner variant="determinate" value={75} />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
      expect(spinner).toHaveAttribute("aria-valuenow", "75");
    });

    it("shows percentage in text for determinate progress", () => {
      render(
        <TestWrapper>
          <LoadingSpinner
            variant="determinate"
            value={50}
            showText
            text="Processing"
          />
        </TestWrapper>
      );

      expect(screen.getByText("Processing")).toBeInTheDocument();
      expect(screen.getByText("(50%)")).toBeInTheDocument();
    });
  });

  describe("Overlay Mode", () => {
    it("renders as overlay when overlay prop is true", () => {
      const { container } = render(
        <TestWrapper>
          <LoadingSpinner overlay />
        </TestWrapper>
      );

      // Check if backdrop is rendered
      const backdrop = container.querySelector(".MuiBackdrop-root");
      expect(backdrop).toBeInTheDocument();
      // For overlay, use hidden: true to find elements inside the backdrop
      expect(
        screen.getByRole("progressbar", { hidden: true })
      ).toBeInTheDocument();
    });

    it("renders overlay with text", () => {
      const { container } = render(
        <TestWrapper>
          <LoadingSpinner overlay showText text="Loading data..." />
        </TestWrapper>
      );

      const backdrop = container.querySelector(".MuiBackdrop-root");
      expect(backdrop).toBeInTheDocument();
      expect(screen.getByText("Loading data...")).toBeInTheDocument();
      expect(
        screen.getByRole("progressbar", { hidden: true })
      ).toBeInTheDocument();
    });
  });

  describe("Centering and Layout", () => {
    it("centers content by default", () => {
      render(
        <TestWrapper>
          <LoadingSpinner />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });

    it("can disable centering", () => {
      render(
        <TestWrapper>
          <LoadingSpinner centered={false} />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });

    it("applies custom minimum height", () => {
      render(
        <TestWrapper>
          <LoadingSpinner minHeight="300px" />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Custom Props", () => {
    it("applies custom className", () => {
      render(
        <TestWrapper>
          <LoadingSpinner className="custom-spinner" />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toHaveClass("custom-spinner");
    });

    it("applies custom thickness", () => {
      render(
        <TestWrapper>
          <LoadingSpinner thickness={5} />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("has proper aria-label", () => {
      render(
        <TestWrapper>
          <LoadingSpinner text="Loading content" />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toHaveAttribute("aria-label", "Loading content");
    });

    it("has aria-live region for text", () => {
      render(
        <TestWrapper>
          <LoadingSpinner showText text="Processing data" />
        </TestWrapper>
      );

      const text = screen.getByText("Processing data");
      expect(text).toHaveAttribute("aria-live", "polite");
    });

    it("announces progress changes for determinate variant", () => {
      const { rerender } = render(
        <TestWrapper>
          <LoadingSpinner variant="determinate" value={25} showText />
        </TestWrapper>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByText("(25%)")).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <LoadingSpinner variant="determinate" value={75} showText />
        </TestWrapper>
      );

      expect(screen.getByText("Loading...")).toBeInTheDocument();
      expect(screen.getByText("(75%)")).toBeInTheDocument();
    });
  });

  describe("Error Cases", () => {
    it("handles missing translation gracefully", () => {
      mockT.mockReturnValue("loading");

      render(
        <TestWrapper>
          <LoadingSpinner showText />
        </TestWrapper>
      );

      // Should fall back to the key if translation is missing
      expect(screen.getByText("loading")).toBeInTheDocument();
    });

    it("handles undefined value for determinate progress", () => {
      render(
        <TestWrapper>
          <LoadingSpinner variant="determinate" />
        </TestWrapper>
      );

      const spinner = screen.getByRole("progressbar");
      expect(spinner).toBeInTheDocument();
    });
  });

  describe("Integration Scenarios", () => {
    it("works with different Material-UI themes", () => {
      const darkTheme = createTheme({
        palette: {
          mode: "dark",
        },
      });

      render(
        <ThemeProvider theme={darkTheme}>
          <LoadingSpinner showText />
        </ThemeProvider>
      );

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });

    it("maintains responsive behavior", () => {
      render(
        <TestWrapper>
          <LoadingSpinner showText />
        </TestWrapper>
      );

      const text = screen.getByText("Loading...");
      expect(text).toBeInTheDocument();
      // Typography component should have responsive styling
    });
  });
});
