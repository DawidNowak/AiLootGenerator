/**
 * Tests for ErrorMessage component
 * Task: T061 - Component tests for basic UI components
 */

import React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { I18nextProvider } from "react-i18next";
import { ErrorMessage } from "../../src/components/ErrorMessage";
import i18n from "../__mocks__/i18n";

// Create Material-UI theme for testing
const theme = createTheme();

// Test wrapper component
const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <I18nextProvider i18n={i18n}>
    <ThemeProvider theme={theme}>{children}</ThemeProvider>
  </I18nextProvider>
);

describe("ErrorMessage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  describe("Basic Rendering", () => {
    it("renders error message with default props", () => {
      render(
        <TestWrapper>
          <ErrorMessage message="Test error message" />
        </TestWrapper>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });

    it("renders with custom title", () => {
      render(
        <TestWrapper>
          <ErrorMessage title="Error Title" message="Test error message" />
        </TestWrapper>
      );

      expect(screen.getByText("Error Title")).toBeInTheDocument();
      expect(screen.getByText("Test error message")).toBeInTheDocument();
    });

    it("applies custom severity", () => {
      render(
        <TestWrapper>
          <ErrorMessage message="Warning message" severity="warning" />
        </TestWrapper>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toHaveClass("MuiAlert-standardWarning");
    });

    it("renders different error types with appropriate messages", () => {
      const { rerender } = render(
        <TestWrapper>
          <ErrorMessage errorType="network" />
        </TestWrapper>
      );

      expect(
        screen.getByText("errors:general.networkError")
      ).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ErrorMessage errorType="server" />
        </TestWrapper>
      );

      expect(
        screen.getByText("errors:general.serverError")
      ).toBeInTheDocument();
    });
  });

  describe("Visibility Control", () => {
    it("shows message when visible is true", () => {
      render(
        <TestWrapper>
          <ErrorMessage message="Visible error" visible={true} />
        </TestWrapper>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();
    });

    it("hides message when visible is false", () => {
      render(
        <TestWrapper>
          <ErrorMessage message="Hidden error" visible={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("updates visibility when prop changes", () => {
      const { rerender } = render(
        <TestWrapper>
          <ErrorMessage message="Test error" visible={true} />
        </TestWrapper>
      );

      expect(screen.getByRole("alert")).toBeInTheDocument();

      rerender(
        <TestWrapper>
          <ErrorMessage message="Test error" visible={false} />
        </TestWrapper>
      );

      expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });
  });

  describe("Close Functionality", () => {
    it("shows close button when closable is true", () => {
      render(
        <TestWrapper>
          <ErrorMessage message="Closable error" closable={true} />
        </TestWrapper>
      );

      expect(screen.getByLabelText("common:actions.close")).toBeInTheDocument();
    });

    it("hides close button when closable is false", () => {
      render(
        <TestWrapper>
          <ErrorMessage message="Non-closable error" closable={false} />
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
          <ErrorMessage
            message="Test error"
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

  describe("Retry Functionality", () => {
    it("shows retry button when retryable is true", () => {
      const mockOnRetry = jest.fn();

      render(
        <TestWrapper>
          <ErrorMessage
            message="Retryable error"
            retryable={true}
            onRetry={mockOnRetry}
          />
        </TestWrapper>
      );

      expect(screen.getByLabelText("common:actions.retry")).toBeInTheDocument();
    });

    it("hides retry button when retryable is false", () => {
      render(
        <TestWrapper>
          <ErrorMessage message="Non-retryable error" retryable={false} />
        </TestWrapper>
      );

      expect(
        screen.queryByLabelText("common:actions.retry")
      ).not.toBeInTheDocument();
    });

    it("calls onRetry when retry button is clicked", async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      const mockOnRetry = jest.fn();

      render(
        <TestWrapper>
          <ErrorMessage
            message="Test error"
            retryable={true}
            onRetry={mockOnRetry}
          />
        </TestWrapper>
      );

      const retryButton = screen.getByLabelText("common:actions.retry");
      await user.click(retryButton);

      expect(mockOnRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("Auto-dismiss Functionality", () => {
    it("auto-dismisses after specified delay", async () => {
      const mockOnClose = jest.fn();

      render(
        <TestWrapper>
          <ErrorMessage
            message="Auto-dismiss error"
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
          <ErrorMessage
            message="No auto-dismiss error"
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

  describe("Error Details", () => {
    it("shows error details in development mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "development";

      const testError = new Error("Test error details");

      render(
        <TestWrapper>
          <ErrorMessage
            message="Error with details"
            error={testError}
            showDetails={true}
          />
        </TestWrapper>
      );

      expect(screen.getByText("Error Details:")).toBeInTheDocument();
      expect(screen.getByText(/Test error details/)).toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });

    it("hides error details in production mode", () => {
      const originalEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = "production";

      const testError = new Error("Test error details");

      render(
        <TestWrapper>
          <ErrorMessage
            message="Error with details"
            error={testError}
            showDetails={true}
          />
        </TestWrapper>
      );

      expect(screen.queryByText("Error Details:")).not.toBeInTheDocument();

      process.env.NODE_ENV = originalEnv;
    });
  });

  describe("Accessibility", () => {
    it("has proper ARIA labels for action buttons", () => {
      const mockOnClose = jest.fn();
      const mockOnRetry = jest.fn();

      render(
        <TestWrapper>
          <ErrorMessage
            message="Accessible error"
            closable={true}
            retryable={true}
            onClose={mockOnClose}
            onRetry={mockOnRetry}
          />
        </TestWrapper>
      );

      expect(screen.getByLabelText("common:actions.close")).toBeInTheDocument();
      expect(screen.getByLabelText("common:actions.retry")).toBeInTheDocument();
    });

    it("maintains alert role for screen readers", () => {
      render(
        <TestWrapper>
          <ErrorMessage message="Screen reader accessible error" />
        </TestWrapper>
      );

      const alert = screen.getByRole("alert");
      expect(alert).toBeInTheDocument();
    });
  });
});
