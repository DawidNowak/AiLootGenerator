import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  Box,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { Language } from "../types";

interface LanguageSelectorProps {
  value: Language;
  onChange: (language: Language) => void;
  disabled?: boolean;
  variant?: "outlined" | "filled" | "standard";
  size?: "small" | "medium";
  fullWidth?: boolean;
}

/**
 * Language selector dropdown component for switching between English and Polish
 * Task: T030 - Create basic LanguageSelector dropdown
 * Task: T031 - Add i18next integration to LanguageSelector
 *
 * Features:
 * - Material-UI Select component with proper styling
 * - Displays current language selection
 * - Handles language change events with i18next integration
 * - Support for disabled state during operations
 * - Configurable variants and sizes
 * - Automatic i18next language switching
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  variant = "outlined",
  size = "medium",
  fullWidth = false,
}) => {
  const { t, i18n } = useTranslation();

  const handleChange = async (event: SelectChangeEvent<Language>) => {
    const selectedLanguage = event.target.value as Language;

    try {
      // Change i18next language
      await i18n.changeLanguage(selectedLanguage);

      // Call parent onChange handler
      onChange(selectedLanguage);
    } catch (error) {
      console.error("Failed to change language:", error);
      // Still call parent handler even if i18n change fails
      onChange(selectedLanguage);
    }
  };

  return (
    <Box sx={{ minWidth: 120 }}>
      <FormControl
        variant={variant}
        size={size}
        fullWidth={fullWidth}
        disabled={disabled}
      >
        <InputLabel id="language-select-label">{t("language")}</InputLabel>
        <Select
          labelId="language-select-label"
          id="language-select"
          value={value}
          label={t("language")}
          onChange={handleChange}
          data-testid="language-selector"
        >
          <MenuItem value="en" data-testid="language-option-en">
            {t("english")}
          </MenuItem>
          <MenuItem value="pl" data-testid="language-option-pl">
            {t("polish")}
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default LanguageSelector;
