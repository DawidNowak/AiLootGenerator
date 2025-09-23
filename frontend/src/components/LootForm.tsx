/**
 * Loot form container component for user input and generation
 * Task: T050 - Create form container in frontend/src/components/LootForm.tsx
 * Task: T051 - Add form submission logic to LootForm
 * Task: T052 - Connect form to API services
 *
 * Provides a comprehensive form for loot generation with all input fields,
 * validation, error handling, cooldown management, and API integration.
 * Combines all form components into a cohesive user interface with
 * accessibility support and responsive design.
 */

import React, { useState, useCallback, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Divider,
  Paper,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// Import form components
import LocationInput from "./LocationInput";
import WealthLevelSelector from "./WealthLevelSelector";
import LanguageSelector from "./LanguageSelector";
import GenerateButton from "./GenerateButton";
import CooldownTimer from "./CooldownTimer";
import LoadingSpinner from "./LoadingSpinner";
import ErrorMessage from "./ErrorMessage";
import StatusMessage from "./StatusMessage";

// Import hooks and services
import { useCooldown } from "../hooks/useCooldown";
import { useLanguage } from "../hooks/useLanguage";
import { generateLoot } from "../services/lootService";

// Import types
import { WealthLevel } from "../types/index";
import { GenerationRequest, LootItem } from "../types/api";

interface LootFormProps {
  /** Callback when loot is successfully generated */
  onLootGenerated?: (items: LootItem[], generatedAt: string) => void;
  /** Callback when form state changes */
  onFormStateChange?: (isValid: boolean, hasErrors: boolean) => void;
  /** Initial form values */
  initialValues?: Partial<GenerationRequest>;
  /** Whether the form should be disabled */
  disabled?: boolean;
  /** Additional CSS classes */
  className?: string;
  /** Whether to show form in compact mode */
  compact?: boolean;
}

/**
 * Main loot generation form with complete functionality
 *
 * Features:
 * - All form input components integrated
 * - Real-time form validation with error display
 * - Cooldown timer management and enforcement
 * - API integration for loot generation
 * - Loading states and progress feedback
 * - Error handling with retry functionality
 * - Success status messages
 * - Responsive design for mobile and desktop
 * - Accessibility support with proper ARIA labels
 * - Session management and persistence
 */
export const LootForm: React.FC<LootFormProps> = ({
  onLootGenerated,
  onFormStateChange,
  initialValues,
  disabled = false,
  className,
  compact = false,
}) => {
  const { t } = useTranslation(["form", "common", "errors"]);

  // Form state
  const [location, setLocation] = useState(initialValues?.location || "");
  const [wealthLevel, setWealthLevel] = useState<WealthLevel>(
    initialValues?.wealthLevel || WealthLevel.Common
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [showError, setShowError] = useState(false);
  const [showStatus, setShowStatus] = useState(false);
  const [lastGeneratedItems, setLastGeneratedItems] = useState<LootItem[]>([]);

  // Get session ID
  const sessionId =
    initialValues?.sessionId ||
    sessionStorage.getItem("sessionId") ||
    "default-session";

  // Hooks
  const { currentLanguage } = useLanguage();
  const { isInCooldown, remainingSeconds, expiresAt } = useCooldown({
    sessionId,
  });

  // Form validation state
  const isLocationValid =
    location.trim().length >= 1 && location.trim().length <= 200;
  const isFormValid = isLocationValid && !isInCooldown;

  // Effect to notify parent of form state changes
  useEffect(() => {
    onFormStateChange?.(isFormValid, showError);
  }, [isFormValid, showError, onFormStateChange]);

  // Form submission handler
  const handleSubmit = useCallback(
    async (event?: React.FormEvent) => {
      event?.preventDefault();

      // Clear previous messages
      setShowError(false);
      setShowStatus(false);
      setGenerationError(null);

      // Validate form
      if (!isLocationValid) {
        setGenerationError(t("errors:validation.invalidLocation"));
        setShowError(true);
        return;
      }

      // Check cooldown
      if (isInCooldown) {
        setGenerationError(t("errors:api.cooldownActive"));
        setShowError(true);
        return;
      }

      // Prepare request
      const request: GenerationRequest = {
        location: location.trim(),
        wealthLevel,
        language: currentLanguage,
        sessionId,
      };

      setIsGenerating(true);

      try {
        const result = await generateLoot(request);

        if (result.success && result.data) {
          setLastGeneratedItems(result.data.items);
          onLootGenerated?.(result.data.items, result.data.generatedAt);
          setShowStatus(true);
        } else {
          const errorMessage =
            result.error?.message || t("errors:loot.generationFailed");
          setGenerationError(errorMessage);
          setShowError(true);
        }
      } catch (error) {
        console.error("Loot generation failed:", error);
        setGenerationError(t("errors:general.unexpectedError"));
        setShowError(true);
      } finally {
        setIsGenerating(false);
      }
    },
    [
      location,
      wealthLevel,
      currentLanguage,
      sessionId,
      isInCooldown,
      isLocationValid,
      onLootGenerated,
      t,
    ]
  );

  // Handle field changes
  const handleLocationChange = useCallback(
    (value: string) => {
      setLocation(value);
      if (generationError) {
        setGenerationError(null);
        setShowError(false);
      }
    },
    [generationError]
  );

  const handleWealthLevelChange = useCallback((value: WealthLevel) => {
    setWealthLevel(value);
  }, []);

  // Handle error dismissal
  const handleCloseError = useCallback(() => {
    setShowError(false);
    setGenerationError(null);
  }, []);

  // Handle status dismissal
  const handleCloseStatus = useCallback(() => {
    setShowStatus(false);
  }, []);

  // Handle retry action
  const handleRetry = useCallback(() => {
    setShowError(false);
    setGenerationError(null);
    handleSubmit();
  }, [handleSubmit]);

  // Determine if form should be disabled
  const isFormDisabled = disabled || isGenerating || isInCooldown;

  // Get location error message
  const getLocationError = (): string | undefined => {
    if (location.trim().length === 0) return undefined; // Don't show error for empty field
    if (location.trim().length < 1)
      return t("form:validation.locationTooShort");
    if (location.trim().length > 200)
      return t("form:validation.locationTooLong");
    return undefined;
  };

  // Render form content
  const renderFormContent = () => (
    <Stack spacing={3}>
      {/* Location Input */}
      <LocationInput
        value={location}
        onChange={handleLocationChange}
        error={!!getLocationError()}
        helperText={getLocationError()}
        disabled={isFormDisabled}
        required
        fullWidth
      />

      {/* Wealth Level Selector */}
      <WealthLevelSelector
        value={wealthLevel}
        onChange={handleWealthLevelChange}
        disabled={isFormDisabled}
        required
        fullWidth
      />

      {/* Language Selector */}
      <LanguageSelector
        value={currentLanguage}
        onChange={() => {}} // Read-only for now
        disabled={true} // Managed by hook internally
        fullWidth
      />

      {/* Cooldown Timer */}
      {isInCooldown && (
        <Paper variant="outlined" sx={{ p: 2 }}>
          <CooldownTimer sessionId={sessionId} expiresAt={expiresAt} />
        </Paper>
      )}

      {/* Generate Button */}
      <GenerateButton
        onClick={handleSubmit}
        disabled={!isFormValid || isInCooldown}
        loading={isGenerating}
        fullWidth
        variant="contained"
        color="primary"
        size="large"
        isFormValid={isFormValid}
        isInCooldown={isInCooldown}
        cooldownTimeRemaining={remainingSeconds}
        disabledReason={
          !isLocationValid
            ? "form"
            : isInCooldown
            ? "cooldown"
            : isGenerating
            ? "loading"
            : undefined
        }
      />
    </Stack>
  );

  // Render compact form
  if (compact) {
    return (
      <Box className={className} component="form" onSubmit={handleSubmit}>
        {/* Error Messages */}
        {showError && generationError && (
          <ErrorMessage
            visible={showError}
            message={generationError}
            severity="error"
            retryable={true}
            onClose={handleCloseError}
            onRetry={handleRetry}
            errorType="general"
          />
        )}

        {/* Status Messages */}
        {showStatus && lastGeneratedItems.length > 0 && (
          <StatusMessage
            visible={showStatus}
            severity="success"
            statusType="generation-success"
            onClose={handleCloseStatus}
            statusData={{
              itemCount: lastGeneratedItems.length,
            }}
          />
        )}

        {/* Loading Spinner */}
        {isGenerating && (
          <LoadingSpinner
            size="medium"
            showText={true}
            text={t("form:buttons.generating")}
            overlay={false}
          />
        )}

        {renderFormContent()}
      </Box>
    );
  }

  // Render full form with card layout
  return (
    <Card className={className} elevation={2}>
      <CardHeader
        title={t("form:title", { defaultValue: "Generate Loot" })}
        subheader={t("form:subtitle", {
          defaultValue:
            "Enter location details to generate thematic loot items",
        })}
      />
      <Divider />
      <CardContent>
        <Box component="form" onSubmit={handleSubmit}>
          {/* Error Messages */}
          {showError && generationError && (
            <ErrorMessage
              visible={showError}
              message={generationError}
              severity="error"
              retryable={true}
              onClose={handleCloseError}
              onRetry={handleRetry}
              errorType="general"
            />
          )}

          {/* Status Messages */}
          {showStatus && lastGeneratedItems.length > 0 && (
            <StatusMessage
              visible={showStatus}
              severity="success"
              statusType="generation-success"
              onClose={handleCloseStatus}
              statusData={{
                itemCount: lastGeneratedItems.length,
              }}
            />
          )}

          {/* Loading Spinner */}
          {isGenerating && (
            <Box sx={{ mb: 3 }}>
              <LoadingSpinner
                size="medium"
                showText={true}
                text={t("form:buttons.generating")}
                overlay={false}
              />
            </Box>
          )}

          {renderFormContent()}
        </Box>
      </CardContent>
    </Card>
  );
};

export default LootForm;
