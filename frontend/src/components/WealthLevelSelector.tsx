/**
 * WealthLevel dropdown selector component
 * Task: T032 - Create WealthLevel dropdown in frontend/src/components/WealthLevelSelector.tsx
 *
 * Provides a Material-UI FormControl with Select dropdown for choosing loot wealth levels.
 * Integrates with i18next for localized wealth level labels and descriptions.
 */

import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  SelectChangeEvent,
} from "@mui/material";
import { useTranslation } from "react-i18next";
import { WealthLevel } from "../types";

interface WealthLevelSelectorProps {
  value: WealthLevel;
  onChange: (wealthLevel: WealthLevel) => void;
  disabled?: boolean;
  error?: boolean;
  helperText?: string;
  required?: boolean;
  fullWidth?: boolean;
}

/**
 * WealthLevel dropdown selector with i18n support
 *
 * Features:
 * - Material-UI styled dropdown
 * - Localized labels and descriptions via i18next
 * - Controlled component pattern
 * - Error state support
 * - Accessibility support
 * - Helper text for descriptions
 */
export const WealthLevelSelector: React.FC<WealthLevelSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  error = false,
  helperText,
  required = false,
  fullWidth = true,
}) => {
  const { t: tForm } = useTranslation("form");
  const { t: tLoot } = useTranslation("loot");

  const handleChange = (event: SelectChangeEvent<string>) => {
    onChange(event.target.value as WealthLevel);
  };

  return (
    <FormControl
      fullWidth={fullWidth}
      error={error}
      required={required}
      disabled={disabled}
    >
      <InputLabel id="wealth-level-label">
        {tForm("labels.wealthLevel")}
      </InputLabel>
      <Select
        labelId="wealth-level-label"
        id="wealth-level-select"
        value={value}
        label={tForm("labels.wealthLevel")}
        onChange={handleChange}
        disabled={disabled}
        aria-describedby={helperText ? "wealth-level-helper-text" : undefined}
      >
        {Object.values(WealthLevel).map((level) => (
          <MenuItem key={level} value={level}>
            {tLoot(`wealthLevels.${level}`)}
          </MenuItem>
        ))}
      </Select>
      {(helperText || !disabled) && (
        <FormHelperText id="wealth-level-helper-text">
          {helperText || tLoot(`wealthLevelDescriptions.${value}`)}
        </FormHelperText>
      )}
    </FormControl>
  );
};

export default WealthLevelSelector;
