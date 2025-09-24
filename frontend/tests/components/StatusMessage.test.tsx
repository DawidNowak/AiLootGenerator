/**
 * Tests for StatusMessage component
 * Task: T061 - Component tests for basic UI components
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import { StatusMessage } from "../../src/components/StatusMessage";
import i18n from "../__mocks__/i18n";

// Create Material-UI theme for testing
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </I18nextProvider>
);

describe("StatusMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Basic Rendering", () => {
    it("renders status message with default props", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Test status message" />
        </TestWrapper>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Test status message")).toBeInTheDocument();
    });

    it("renders with custom title", () => {
      render(
        <TestWrapper>
          <StatusMessage title="Success Title" message="Test status message" />
        </TestWrapper>
      );

      expect(screen.getByText("Success Title")).toBeInTheDocument();
      expect(screen.getByText("Test status message")).toBeInTheDocument();
    });

    it("applies custom severity", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Info message" severity="info" />
        </TestWrapper>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardInfo");
    });

    it("renders different status types with appropriate messages", () => {
      const { rerender } = render(
        <TestWrapper>
          <StatusMessage statusType="generation-success" />
        </TestWrapper>
      );

      expect(
        screen.getByText("loot:status.generationSuccess")
      ).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <StatusMessage statusType="cooldown-info" />
        </TestWrapper>
      );

      expect(screen.getByText("loot:status.cooldownInfo")).toBeInTheDocument();
    });
  });

  describe("Visibility Control", () => {
    it("shows message when visible is true", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Visible status" visible={true} />
        </TestWrapper>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("hides message when visible is false", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Hidden status" visible={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("updates visibility when prop changes", () => {
      const { rerender } = render(
        <TestWrapper>
          <StatusMessage message="Test status" visible={true} />
        </TestWrapper>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <StatusMessage message="Test status" visible={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    it("shows close button when closable is true", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Closable status" closable={true} />
        </TestWrapper>
      );

      expect(screen.getByLabelText("common:actions.close")).toBeInTheDocument();
    });

    it("hides close button when closable is false", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Non-closable status" closable={false} />
        </TestWrapper>
      );

      expect(
        screen.queryByLabelText("common:actions.close")
      ).not.toBeInTheDocument();
    });

    it("calls onClose when close button is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <StatusMessage
            message="Test status"
            onClose={mockOnClose}
            closable={true}
          />
        </TestWrapper>
      );

      const closeButton = screen.getByLabelText("common:actions.close");
      await user.click(closeButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Auto-dismiss Functionality", () => {
    it("auto-dismisses after specified delay", async () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <StatusMessage
            message="Auto-dismiss status"
            autoDismiss={true}
            autoDismissDelay={2000}
            onClose={mockOnClose}
          />
        </TestWrapper>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();

      // Fast-forward time by 2000ms
      jest.advanceTimersByTime(2000);

      await waitFor(() => {
        expect(mockOnClose).toHaveBeenCalledTimes(1);
      });
    });

    it("does not auto-dismiss when autoDismiss is false", () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <StatusMessage
            message="No auto-dismiss status"
            autoDismiss={false}
            autoDismissDelay={1000}
            onClose={mockOnClose}
          />
        </TestWrapper>
      );

      jest.advanceTimersByTime(2000);

      expect(mockOnClose).not.toHaveBeenCalled();
      expect(screen.getByRole("alert")).toBeInTheDocument();
    });
  });

  describe("Progress Indicator", () => {
    it("shows progress indicator when showProgress is true", () => {
      render(
        <TestWrapper>
          <StatusMessage
            message="Loading status"
            showProgress={true}
            progress={50}
          />
        </TestWrapper>
      );

      expect(screen.getByRole("progressbar")).toBeInTheDocument();
    });

    it("hides progress indicator when showProgress is false", () => {
      render(
        <TestWrapper>
          <StatusMessage message="No progress status" showProgress={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole("progressbar")).not.toBeInTheDocument();
    });

    it("displays correct progress value", () => {
      render(
        <TestWrapper>
          <StatusMessage
            message="Progress status"
            showProgress={true}
            progress={75}
          />
        </TestWrapper>
      );

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "75");
    });
  });

  describe("Status Data", () => {
    it("displays item count when provided", () => {
      render(
        <TestWrapper>
          <StatusMessage
            message="Generation complete"
            statusType="generation-success"
            statusData={{ itemCount: 5 }}
          />
        </TestWrapper>
      );

      expect(screen.getByText("5")).toBeInTheDocument();
    });

    it("displays generation time when provided", () => {
      render(
        <TestWrapper>
          <StatusMessage
            message="Generation complete"
            statusType="generation-success"
            statusData={{ generationTime: 2.5 }}
          />
        </TestWrapper>
      );

      expect(screen.getByText(/2\.5/)).toBeInTheDocument();
    });

    it("displays cooldown remaining when provided", () => {
      render(
        <TestWrapper>
          <StatusMessage
            message="Cooldown active"
            statusType="cooldown-info"
            statusData={{ cooldownRemaining: 30 }}
          />
        </TestWrapper>
      );

      expect(screen.getByText("30")).toBeInTheDocument();
    });
  });

  describe("Severity Variants", () => {
    it("renders success variant correctly", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Success message" severity="success" />
        </TestWrapper>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardSuccess");
    });

    it("renders info variant correctly", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Info message" severity="info" />
        </TestWrapper>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardInfo");
    });

    it("renders warning variant correctly", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Warning message" severity="warning" />
        </TestWrapper>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardWarning");
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for close button", () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <StatusMessage
            message="Accessible status"
            closable={true}
            onClose={mockOnClose}
          />
        </TestWrapper>
      );

      expect(screen.getByLabelText("common:actions.close")).toBeInTheDocument();
    });

    it("maintains alert role for screen readers", () => {
      render(
        <TestWrapper>
          <StatusMessage message="Screen reader accessible status" />
        </TestWrapper>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });

    it("has proper aria attributes for progress bar", () => {
      render(
        <TestWrapper>
          <StatusMessage
            message="Progress status"
            showProgress={true}
            progress={60}
          />
        </TestWrapper>
      );

      const progressBar = screen.getByRole("progressbar");
      expect(progressBar).toHaveAttribute("aria-valuenow", "60");
      expect(progressBar).toHaveAttribute("aria-valuemin", "0");
      expect(progressBar).toHaveAttribute("aria-valuemax", "100");
    });
  });
});
