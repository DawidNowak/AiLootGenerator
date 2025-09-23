/**
 * Generate button component for loot generation
 * Task: T034 - Create generate button in frontend/src/components/GenerateButton.tsx
 * Task: T035 - Add disabled state logic to GenerateButton
 *
 * Provides a Material-UI Button for triggering loot generation.
 * Integrates with i18next for localized button text and includes
 * comprehensive disabled state logic for form validation and cooldowns.
 */

import React from "react";
import { Button, CircularProgress, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";

interface GenerateButtonProps {
  /** Whether the button should be disabled */
  disabled?: boolean;
  /** Whether generation is currently in progress */
  loading?: boolean;
  /** Whether the button should take full width */
  fullWidth?: boolean;
  /** Click handler for the button */
  onClick: () => void;
  /** Additional CSS classes */
  className?: string;
  /** Button variant */
  variant?: "text" | "outlined" | "contained";
  /** Button color */
  color?: "primary" | "secondary" | "error" | "info" | "success" | "warning";
  /** Button size */
  size?: "small" | "medium" | "large";
  /** Form validation state - whether all required fields are filled */
  isFormValid?: boolean;
  /** Cooldown state - whether user is in cooldown period */
  isInCooldown?: boolean;
  /** Remaining cooldown time in seconds */
  cooldownTimeRemaining?: number;
  /** Reason for disabled state - for tooltip display */
  disabledReason?: "form" | "cooldown" | "loading" | "network" | "other";
}

/**
 * Generate button with comprehensive disabled state logic and i18n support
 *
 * Features:
 * - Material-UI styled button
 * - Loading spinner when generation is in progress
 * - Localized text via i18next
 * - Form validation state handling
 * - Cooldown period enforcement
 * - Detailed tooltips for disabled states
 * - Accessibility support
 * - Configurable styling options
 *
 * Disabled State Logic:
 * - Form validation: Button disabled if required fields are missing
 * - Cooldown period: Button disabled during cooldown with countdown display
 * - Loading state: Button disabled during API request
 * - Network issues: Button disabled when offline/network errors
 * - Manual override: Button can be disabled via disabled prop
 */
export const GenerateButton: React.FC<GenerateButtonProps> = ({
  disabled = false,
  loading = false,
  fullWidth = true,
  onClick,
  className,
  variant = "contained",
  color = "primary",
  size = "large",
  isFormValid = true,
  isInCooldown = false,
  cooldownTimeRemaining = 0,
  disabledReason,
}) => {
  const { t } = useTranslation("form");
  const { t: tErrors } = useTranslation("errors");

  // Determine if button should be disabled based on all conditions
  const shouldBeDisabled = disabled || loading || !isFormValid || isInCooldown;

  // Determine the appropriate disabled reason for tooltip
  const getDisabledReason = (): string => {
    if (loading) return tErrors("button.generatingInProgress");
    if (!isFormValid) return tErrors("button.formIncomplete");
    if (isInCooldown)
      return tErrors("button.cooldownActive", {
        seconds: cooldownTimeRemaining,
      });
    if (disabled && disabledReason === "network")
      return tErrors("button.networkError");
    if (disabled) return tErrors("button.temporarilyDisabled");
    return "";
  };

  const handleClick = () => {
    if (!shouldBeDisabled) {
      onClick();
    }
  };

  // Format cooldown time for display
  const formatCooldownTime = (seconds: number): string => {
    if (seconds <= 0) return "";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) {
      return `${mins}:${secs.toString().padStart(2, "0")}`;
    }
    return `${secs}s`;
  };

  const buttonContent = () => {
    if (loading) {
      return t("buttons.generating");
    }
    if (isInCooldown && cooldownTimeRemaining > 0) {
      return `${t("buttons.generate")} (${formatCooldownTime(
        cooldownTimeRemaining
      )})`;
    }
    return t("buttons.generate");
  };

  const button = (
    <Button
      variant={variant}
      color={color}
      size={size}
      fullWidth={fullWidth}
      disabled={shouldBeDisabled}
      onClick={handleClick}
      className={className}
      startIcon={
        loading ? <CircularProgress size={20} color="inherit" /> : undefined
      }
      aria-label={loading ? t("buttons.generating") : t("buttons.generate")}
      aria-disabled={shouldBeDisabled}
      data-testid="generate-button"
      data-disabled-reason={disabledReason}
    >
      {buttonContent()}
    </Button>
  );

  // Wrap with tooltip if disabled to show reason
  if (shouldBeDisabled) {
    return (
      <Tooltip title={getDisabledReason()} arrow placement="top">
        <span>{button}</span>
      </Tooltip>
    );
  }

  return button;
};

export default GenerateButton;
