/**
 * Error message component for displaying various error states
 * Task: T048 - Create error message component in frontend/src/components/ErrorMessage.tsx
 *
 * Provides a reusable Material-UI Alert component for displaying error messages.
 * Supports different severity levels, auto-dismiss functionality, and integrates
 * with i18next for localized error messages. Handles API errors, validation errors,
 * and network connectivity issues with appropriate styling and accessibility.
 */

import React, { useState, useEffect } from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Collapse,
  IconButton,
  Typography,
} from "@mui/material";
import {
  Close as CloseIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface ErrorMessageProps {
  /** Error message or translation key */
  message?: string;
  /** Error title or translation key */
  title?: string;
  /** Error severity level */
  severity?: "error" | "warning" | "info";
  /** Whether the error message is visible */
  visible?: boolean;
  /** Whether to show a close button */
  closable?: boolean;
  /** Whether to show a retry button */
  retryable?: boolean;
  /** Handler for close button click */
  onClose?: () => void;
  /** Handler for retry button click */
  onRetry?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to auto-dismiss after a delay */
  autoDismiss?: boolean;
  /** Auto-dismiss delay in milliseconds */
  autoDismissDelay?: number;
  /** Error type for styling and icon selection */
  errorType?:
    | "network"
    | "validation"
    | "server"
    | "cooldown"
    | "timeout"
    | "general";
  /** Raw error object for debugging (development only) */
  error?: Error | unknown;
  /** Whether to show error details */
  showDetails?: boolean;
}

/**
 * Error message component with comprehensive error state handling
 *
 * Features:
 * - Material-UI Alert with customizable severity
 * - Localized error messages via i18next
 * - Auto-dismiss functionality with configurable delay
 * - Retry functionality for recoverable errors
 * - Different styling based on error type
 * - Accessibility support with proper ARIA labels
 * - Development mode error details display
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title,
  severity = "error",
  visible = true,
  closable = true,
  retryable = false,
  onClose,
  onRetry,
  className,
  autoDismiss = false,
  autoDismissDelay = 5000,
  errorType = "general",
  error,
  showDetails = false,
}) => {
  const { t } = useTranslation(["errors", "common"]);
  const [isVisible, setIsVisible] = useState(visible);

  // Auto-dismiss functionality
  useEffect(() => {
    if (autoDismiss && visible && autoDismissDelay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, visible, autoDismissDelay, onClose]);

  // Update visibility when prop changes
  useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  // Handle close action
  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Get localized error message
  const getErrorMessage = (): string => {
    if (message) {
      // Try translation first, fallback to raw message
      const translated = t(message, { defaultValue: message });
      return translated !== message ? translated : message;
    }

    // Default messages based on error type
    switch (errorType) {
      case "network":
        return t("errors:general.networkError");
      case "server":
        return t("errors:general.serverError");
      case "timeout":
        return t("errors:api.timeout");
      case "cooldown":
        return t("errors:api.cooldownActive");
      case "validation":
        return t("errors:api.invalidRequest");
      default:
        return t("errors:general.unexpectedError");
    }
  };

  // Get localized error title
  const getErrorTitle = (): string | undefined => {
    if (title) {
      const translated = t(title, { defaultValue: title });
      return translated !== title ? translated : title;
    }
    return undefined;
  };

  // Render error details for development
  const renderErrorDetails = () => {
    if (!showDetails || !error || process.env.NODE_ENV === "production") {
      return null;
    }

    return (
      <Box sx={{ mt: 1, fontSize: "0.875rem", opacity: 0.8 }}>
        <Typography variant="caption" component="div">
          <strong>Error Details:</strong>
        </Typography>
        <Typography
          variant="caption"
          component="pre"
          sx={{ fontSize: "0.75rem" }}
        >
          {error instanceof Error
            ? error.stack
            : JSON.stringify(error, null, 2)}
        </Typography>
      </Box>
    );
  };

  return (
    <Collapse in={isVisible} timeout={300}>
      <Alert
        severity={severity}
        className={className}
        sx={{
          mb: 2,
          alignItems: "flex-start",
          "& .MuiAlert-action": {
            paddingTop: 0,
          },
        }}
        action={
          <Box sx={{ display: "flex", gap: 1 }}>
            {retryable && onRetry && (
              <IconButton
                color="inherit"
                size="small"
                onClick={onRetry}
                aria-label={t("common:actions.retry")}
                title={t("common:actions.retry")}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            )}
            {closable && (
              <IconButton
                color="inherit"
                size="small"
                onClick={handleClose}
                aria-label={t("common:actions.close")}
                title={t("common:actions.close")}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            )}
          </Box>
        }
      >
        {getErrorTitle() && <AlertTitle>{getErrorTitle()}</AlertTitle>}
        <Typography variant="body2" component="div">
          {getErrorMessage()}
        </Typography>
        {renderErrorDetails()}
      </Alert>
    </Collapse>
  );
};

export default ErrorMessage;
