/**
 * Status message component for displaying success and informational messages
 * Task: T049 - Create status message component in frontend/src/components/StatusMessage.tsx
 *
 * Provides a reusable Material-UI Alert component for displaying positive status
 * messages like successful operations, information updates, and warnings.
 * Supports auto-dismiss functionality and integrates with i18next for localized
 * status messages. Complements ErrorMessage for complete user feedback.
 */

import React from "react";
import {
  Alert,
  AlertTitle,
  Box,
  Collapse,
  IconButton,
  Typography,
  LinearProgress,
} from "@mui/material";
import {
  Close as CloseIcon,
  CheckCircle as SuccessIcon,
  Info as InfoIcon,
  Warning as WarningIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";

interface StatusMessageProps {
  /** Status message or translation key */
  message?: string;
  /** Status title or translation key */
  title?: string;
  /** Status severity level */
  severity?: "success" | "info" | "warning";
  /** Whether the status message is visible */
  visible?: boolean;
  /** Whether to show a close button */
  closable?: boolean;
  /** Handler for close button click */
  onClose?: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Whether to auto-dismiss after a delay */
  autoDismiss?: boolean;
  /** Auto-dismiss delay in milliseconds */
  autoDismissDelay?: number;
  /** Status type for specific styling and content */
  statusType?:
    | "generation-success"
    | "cooldown-info"
    | "form-saved"
    | "loading"
    | "general";
  /** Whether to show a progress indicator */
  showProgress?: boolean;
  /** Progress value (0-100) for progress indicator */
  progress?: number;
  /** Additional data for status context */
  statusData?: {
    /** Number of items generated */
    itemCount?: number;
    /** Generation time in seconds */
    generationTime?: number;
    /** Cooldown remaining in seconds */
    cooldownRemaining?: number;
    /** Any additional metadata */
    metadata?: Record<string, any>;
  };
}

/**
 * Status message component with comprehensive status state handling
 *
 * Features:
 * - Material-UI Alert with success, info, and warning variants
 * - Localized status messages via i18next
 * - Auto-dismiss functionality with configurable delay
 * - Progress indicator for loading states
 * - Contextual status data display
 * - Accessibility support with proper ARIA labels
 * - Smooth animations for show/hide transitions
 */
export const StatusMessage: React.FC<StatusMessageProps> = ({
  message,
  title,
  severity = "success",
  visible = true,
  closable = true,
  onClose,
  className,
  autoDismiss = true,
  autoDismissDelay = 4000,
  statusType = "general",
  showProgress = false,
  progress = 0,
  statusData,
}) => {
  const { t } = useTranslation(["common", "loot", "form"]);
  const [isVisible, setIsVisible] = React.useState(visible);

  // Auto-dismiss functionality
  React.useEffect(() => {
    if (
      autoDismiss &&
      visible &&
      autoDismissDelay > 0 &&
      severity !== "warning"
    ) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onClose?.();
      }, autoDismissDelay);

      return () => clearTimeout(timer);
    }
  }, [autoDismiss, visible, autoDismissDelay, severity, onClose]);

  // Update visibility when prop changes
  React.useEffect(() => {
    setIsVisible(visible);
  }, [visible]);

  // Handle close action
  const handleClose = () => {
    setIsVisible(false);
    onClose?.();
  };

  // Get appropriate icon for status type
  const getStatusIcon = () => {
    switch (severity) {
      case "success":
        return <SuccessIcon fontSize="small" />;
      case "info":
        return <InfoIcon fontSize="small" />;
      case "warning":
        return <WarningIcon fontSize="small" />;
      default:
        return null;
    }
  };

  // Get localized status message
  const getStatusMessage = (): string => {
    if (message) {
      // Try translation first, fallback to raw message
      const translated = t(message, { defaultValue: message });
      return translated !== message ? translated : message;
    }

    // Default messages based on status type
    switch (statusType) {
      case "generation-success":
        const itemCount = statusData?.itemCount || 0;
        return t("loot:generation.success", {
          count: itemCount,
          defaultValue: `Successfully generated ${itemCount} items`,
        });
      case "cooldown-info":
        const cooldownTime = statusData?.cooldownRemaining || 0;
        return t("common:cooldown.remaining", {
          seconds: cooldownTime,
          defaultValue: `${cooldownTime} seconds remaining`,
        });
      case "form-saved":
        return t("form:status.saved", {
          defaultValue: "Form preferences saved",
        });
      case "loading":
        return t("common:status.loading", { defaultValue: "Loading..." });
      default:
        return t("common:status.success", {
          defaultValue: "Operation completed successfully",
        });
    }
  };

  // Get localized status title
  const getStatusTitle = (): string | undefined => {
    if (title) {
      const translated = t(title, { defaultValue: title });
      return translated !== title ? translated : title;
    }

    // Default titles based on status type
    switch (statusType) {
      case "generation-success":
        return t("loot:generation.title", { defaultValue: "Loot Generated" });
      case "cooldown-info":
        return t("common:cooldown.title", { defaultValue: "Cooldown Active" });
      case "form-saved":
        return t("form:status.savedTitle", { defaultValue: "Settings Saved" });
      default:
        return undefined;
    }
  };

  // Render additional status information
  const renderStatusDetails = () => {
    if (!statusData) return null;

    return (
      <Box sx={{ mt: 1 }}>
        {statusType === "generation-success" && statusData.generationTime && (
          <Typography variant="caption" color="text.secondary">
            {t("loot:generation.timeInfo", {
              time: statusData.generationTime.toFixed(1),
              defaultValue: `Generated in ${statusData.generationTime.toFixed(
                1
              )}s`,
            })}
          </Typography>
        )}
        {statusType === "cooldown-info" && statusData.cooldownRemaining && (
          <Typography variant="caption" color="text.secondary">
            {t("common:cooldown.nextGeneration", {
              defaultValue:
                "You can generate more loot when the cooldown expires",
            })}
          </Typography>
        )}
      </Box>
    );
  };

  // Render progress indicator
  const renderProgress = () => {
    if (!showProgress) return null;

    return (
      <Box sx={{ mt: 1, mb: 1 }}>
        <LinearProgress
          variant={progress > 0 ? "determinate" : "indeterminate"}
          value={progress}
          sx={{ borderRadius: 1 }}
        />
        {progress > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
            {Math.round(progress)}%
          </Typography>
        )}
      </Box>
    );
  };

  return (
    <Collapse in={isVisible} timeout={300}>
      <Alert
        severity={severity}
        icon={getStatusIcon()}
        className={className}
        sx={{
          mb: 2,
          alignItems: "flex-start",
          "& .MuiAlert-action": {
            paddingTop: 0,
          },
        }}
        action={
          closable && (
            <IconButton
              color="inherit"
              size="small"
              onClick={handleClose}
              aria-label={t("common:actions.close")}
              title={t("common:actions.close")}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          )
        }
      >
        {getStatusTitle() && <AlertTitle>{getStatusTitle()}</AlertTitle>}
        <Typography variant="body2" component="div">
          {getStatusMessage()}
        </Typography>
        {renderProgress()}
        {renderStatusDetails()}
      </Alert>
    </Collapse>
  );
};

export default StatusMessage;
