/**
 * Location input field component
 * Task: T033 - Create location input field in frontend/src/components/LocationInput.tsx
 *
 * Provides a Material-UI TextField for entering Warhammer Fantasy location contexts.
 * Integrates with i18next for localized labels and placeholder text.
 */

import React from "react";
import { TextField } from "@mui/material";
import { useTranslation } from "react-i18next";

interface LocationInputProps {
  value: string;
  onChange: (location: string) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onValidate?: (value: string) => string | undefined; // Returns error message if invalid
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
  placeholder?: string;
  maxLength?: number;
}

/**
 * Location context input field with i18n support
 *
 * Features:
 * - Material-UI styled text input
 * - Localized labels and placeholders via i18next
 * - Controlled component pattern
 * - Error state support
 * - Character limit enforcement
 * - Accessibility support
 * - Helper text for validation/guidance
 */
export const LocationInput: React.FC<LocationInputProps> = ({
  value,
  onChange,
  onBlur,
  onValidate,
  disabled = false,
  error = false,
  helperText,
  required = false,
  fullWidth = true,
  placeholder,
  maxLength = 200,
}) => {
  const { t } = useTranslation("form");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;

    // Let the input element handle maxLength natively
    // The input already has maxLength attribute set
    onChange(newValue);
  };

  const handleBlur = (event: React.FocusEvent<HTMLInputElement>) => {
    // Call validation if provided
    if (onValidate) {
      onValidate(value);
    }

    // Call parent blur handler if provided
    if (onBlur) {
      onBlur(event);
    }
  };

  // Use custom placeholder or fallback to translation
  const placeholderText = placeholder || t("placeholders.location");

  return (
    <TextField
      id="location-input"
      label={t("labels.location")}
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      disabled={disabled}
      error={error}
      helperText={helperText || t("hints.location")}
      required={required}
      fullWidth={fullWidth}
      placeholder={placeholderText}
      variant="outlined"
      inputProps={{
        maxLength,
        "aria-describedby": "location-helper-text",
      }}
      FormHelperTextProps={{
        id: "location-helper-text",
      }}
    />
  );
};

export default LocationInput;
