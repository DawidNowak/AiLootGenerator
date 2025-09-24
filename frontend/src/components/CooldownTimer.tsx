/**
 * Cooldown Timer Component for Warhammer Fantasy Loot Generator
 * Task: T044 - Create CooldownTimer component
 *
 * Displays countdown timer with Material-UI styling.
 * Shows remaining time until next loot generation is available.
 */

import React, { useEffect } from "react";
import { Box, Typography, Chip, CircularProgress, Fade } from "@mui/material";
import {
  AccessTime as TimeIcon,
  CheckCircle as ReadyIcon,
} from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { useCooldown } from "../hooks/useCooldown";

/**
 * CooldownTimer component props
 */
export interface CooldownTimerProps {
  /** Session ID for cooldown tracking */
  sessionId: string;
  /** Cooldown expiry timestamp (if known) */
  expiresAt?: Date | string | null;
  /** Callback when cooldown ends */
  onCooldownEnd?: () => void;
  /** Component size variant */
  size?: "small" | "medium" | "large";
  /** Display variant */
  variant?: "chip" | "text" | "full";
  /** Whether to show loading state */
  showLoading?: boolean;
  /** Custom className for styling */
  className?: string;
}

/**
 * Get component styling based on size
 */
function getSizeStyles(size: "small" | "medium" | "large") {
  switch (size) {
    case "small":
      return {
        fontSize: "0.875rem",
        padding: "4px 8px",
        minHeight: "24px",
      };
    case "large":
      return {
        fontSize: "1.25rem",
        padding: "12px 16px",
        minHeight: "48px",
      };
    default: // medium
      return {
        fontSize: "1rem",
        padding: "8px 12px",
        minHeight: "32px",
      };
  }
}

/**
 * Cooldown Timer component
 *
 * @example
 * ```typescript
 * // Basic usage
 * <CooldownTimer
 *   sessionId={sessionId}
 *   onCooldownEnd={() => setCanGenerate(true)}
 * />
 *
 * // With specific expiry time
 * <CooldownTimer
 *   sessionId={sessionId}
 *   expiresAt={generationResponse.cooldownExpiresAt}
 *   variant="full"
 *   size="large"
 * />
 *
 * // Compact chip variant
 * <CooldownTimer
 *   sessionId={sessionId}
 *   variant="chip"
 *   size="small"
 * />
 * ```
 */
export const CooldownTimer: React.FC<CooldownTimerProps> = ({
  sessionId,
  expiresAt,
  onCooldownEnd,
  size = "medium",
  variant = "text",
  showLoading = true,
  className,
}) => {
  const { t } = useTranslation(["loot", "common"]);

  // Use cooldown hook for state management
  const cooldown = useCooldown({
    sessionId,
    onCooldownEnd,
    autoStart: true,
  });

  // Update cooldown if expiresAt prop changes
  useEffect(() => {
    if (expiresAt) {
      cooldown.setCooldown(expiresAt);
    }
  }, [expiresAt, cooldown]);

  const sizeStyles = getSizeStyles(size);

  // Loading state
  if (cooldown.isLoading && showLoading) {
    return (
      <Fade in>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          className={className}
          sx={{ ...sizeStyles }}
        >
          <CircularProgress size={16} />
          <Typography variant="body2" color="text.secondary">
            {t("loot:cooldown.loading")}
          </Typography>
        </Box>
      </Fade>
    );
  }

  // Ready state (no cooldown)
  if (!cooldown.isInCooldown) {
    const content = (
      <>
        <ReadyIcon
          sx={{
            fontSize: size === "small" ? 16 : size === "large" ? 24 : 20,
            color: "success.main",
          }}
        />
        <Typography
          variant="body2"
          color="success.main"
          sx={{ fontWeight: "medium" }}
        >
          {t("loot:cooldown.ready")}
        </Typography>
      </>
    );

    if (variant === "chip") {
      return (
        <Fade in>
          <Chip
            icon={<ReadyIcon />}
            label={t("loot:cooldown.ready")}
            color="success"
            variant="outlined"
            size={size === "large" ? "medium" : "small"}
            className={className}
          />
        </Fade>
      );
    }

    return (
      <Fade in>
        <Box
          display="flex"
          alignItems="center"
          gap={1}
          className={className}
          sx={{ ...sizeStyles }}
        >
          {content}
        </Box>
      </Fade>
    );
  }

  // Cooldown active state
  const timeDisplay = cooldown.formattedTime;
  const progressPercentage = cooldown.expiresAt
    ? Math.max(0, Math.min(100, (cooldown.remainingSeconds / 30) * 100)) // Assuming 30s cooldown
    : 0;

  const cooldownContent = (
    <>
      <TimeIcon
        sx={{
          fontSize: size === "small" ? 16 : size === "large" ? 24 : 20,
          color: "warning.main",
        }}
      />
      <Typography
        variant="body2"
        color="warning.main"
        sx={{ fontWeight: "medium" }}
      >
        {variant === "full"
          ? t("loot:cooldown.nextGenerationIn", { time: timeDisplay })
          : timeDisplay}
      </Typography>
    </>
  );

  // Chip variant
  if (variant === "chip") {
    return (
      <Fade in>
        <Chip
          icon={<TimeIcon />}
          label={timeDisplay}
          color="warning"
          variant="outlined"
          size={size === "large" ? "medium" : "small"}
          className={className}
        />
      </Fade>
    );
  }

  // Full variant with progress indicator
  if (variant === "full") {
    return (
      <Fade in>
        <Box
          className={className}
          sx={{
            ...sizeStyles,
            border: 1,
            borderColor: "warning.main",
            borderRadius: 1,
            bgcolor: "warning.light",
            display: "flex",
            alignItems: "center",
            gap: 1,
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Progress background */}
          <Box
            sx={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: `${progressPercentage}%`,
              bgcolor: "warning.main",
              opacity: 0.1,
              transition: "width 1s ease-in-out",
            }}
          />

          {/* Content */}
          <Box
            display="flex"
            alignItems="center"
            gap={1}
            sx={{ position: "relative", zIndex: 1 }}
          >
            {cooldownContent}
          </Box>
        </Box>
      </Fade>
    );
  }

  // Default text variant
  return (
    <Fade in>
      <Box
        display="flex"
        alignItems="center"
        gap={1}
        className={className}
        sx={{ ...sizeStyles }}
      >
        {cooldownContent}
      </Box>
    </Fade>
  );
};

export default CooldownTimer;
