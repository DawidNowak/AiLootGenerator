/**
 * Loading spinner component for displaying loading states
 * Task: T041 - Create loading spinner in frontend/src/components/LoadingSpinner.tsx
 *
 * Provides a reusable Material-UI CircularProgress component for various loading states.
 * Supports different sizes, colors, and positioning options with optional text labels
 * and overlay functionality. Integrates with i18next for localized loading messages.
 */

import React from "react";
import {
  CircularProgress,
  Box,
  Typography,
  Backdrop,
  Stack,
} from "@mui/material";
import { useTranslation } from "react-i18next";

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: number | "small" | "medium" | "large";
  /** Color of the spinner */
  color?:
    | "primary"
    | "secondary"
    | "error"
    | "info"
    | "success"
    | "warning"
    | "inherit";
  /** Whether to show as an overlay covering the screen */
  overlay?: boolean;
  /** Whether to show loading text */
  showText?: boolean;
  /** Custom loading text (if not provided, uses i18n default) */
  text?: string;
  /** Text position relative to spinner */
  textPosition?: "top" | "bottom" | "right" | "left";
  /** Whether to center the spinner in its container */
  centered?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Custom thickness of the progress circle */
  thickness?: number;
  /** Custom variant for progress */
  variant?: "determinate" | "indeterminate";
  /** Progress value (0-100) when variant is "determinate" */
  value?: number;
  /** Minimum height for centered container */
  minHeight?: string | number;
}

/**
 * Loading spinner with comprehensive customization options and i18n support
 *
 * Features:
 * - Material-UI CircularProgress with customizable appearance
 * - Optional overlay mode for full-screen loading
 * - Localized loading text via i18next
 * - Flexible positioning and sizing options
 * - Support for determinate progress indication
 * - Accessibility support with aria-labels
 * - Responsive design considerations
 *
 * Usage Examples:
 * - Basic spinner: <LoadingSpinner />
 * - Overlay spinner: <LoadingSpinner overlay showText />
 * - Custom size: <LoadingSpinner size={60} />
 * - With progress: <LoadingSpinner variant="determinate" value={75} />
 * - Positioned text: <LoadingSpinner showText textPosition="bottom" />
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "medium",
  color = "primary",
  overlay = false,
  showText = false,
  text,
  textPosition = "bottom",
  centered = true,
  className,
  thickness = 3.6,
  variant = "indeterminate",
  value,
  minHeight = "200px",
}) => {
  const { t } = useTranslation("common");

  const displayText = text || t("loading", "Loading...");

  // Create the spinner element
  const spinnerElement = (
    <CircularProgress
      size={size}
      color={color}
      thickness={thickness}
      variant={variant}
      value={variant === "determinate" ? value : undefined}
      aria-label={displayText}
      className={className}
    />
  );

  // Create the text element if needed
  const textElement = showText ? (
    <Typography
      variant="body2"
      color="text.secondary"
      aria-live="polite"
      sx={{
        textAlign: "center",
        fontSize: { xs: "0.875rem", sm: "1rem" },
      }}
    >
      {displayText}
      {variant === "determinate" && value !== undefined && (
        <span> ({Math.round(value)}%)</span>
      )}
    </Typography>
  ) : null;

  // Arrange spinner and text based on position
  const getContentArrangement = () => {
    if (!showText) {
      return centered ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight={minHeight}
        >
          {spinnerElement}
        </Box>
      ) : (
        spinnerElement
      );
    }

    const spacing = 2;
    const isVertical = textPosition === "top" || textPosition === "bottom";

    if (isVertical) {
      return (
        <Stack
          direction="column"
          spacing={spacing}
          alignItems="center"
          justifyContent={centered ? "center" : "flex-start"}
          minHeight={centered ? minHeight : "auto"}
        >
          {textPosition === "top" && textElement}
          {spinnerElement}
          {textPosition === "bottom" && textElement}
        </Stack>
      );
    } else {
      return (
        <Stack
          direction="row"
          spacing={spacing}
          alignItems="center"
          justifyContent={centered ? "center" : "flex-start"}
          minHeight={centered ? minHeight : "auto"}
        >
          {textPosition === "left" && textElement}
          {spinnerElement}
          {textPosition === "right" && textElement}
        </Stack>
      );
    }
  };

  const content = getContentArrangement();

  // Return overlay version if requested
  if (overlay) {
    return (
      <Backdrop
        sx={{
          color: "#fff",
          zIndex: (theme) => theme.zIndex.drawer + 1,
          backgroundColor: "rgba(0, 0, 0, 0.5)",
        }}
        open={true}
      >
        {content}
      </Backdrop>
    );
  }

  return content;
};

export default LoadingSpinner;
