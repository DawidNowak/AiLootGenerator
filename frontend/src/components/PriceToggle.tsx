/**
 * PriceToggle Switch Component
 * Task: T039 - Frontend Display Components
 *
 * Toggle switch to show/hide item prices in the loot list
 * Uses Material-UI Switch component with accessibility support
 */

import React from "react";
import {
  FormControlLabel,
  Switch,
  Box,
  Typography,
  Tooltip,
} from "@mui/material";
import { VisibilityOff, Visibility } from "@mui/icons-material";
import { useTranslation } from "react-i18next";

/**
 * Props for the PriceToggle component
 */
export interface PriceToggleProps {
  /** Current state of price visibility */
  showPrices: boolean;
  /** Callback function when toggle state changes */
  onToggle: (showPrices: boolean) => void;
  /** Optional CSS class name */
  className?: string;
  /** Show as vertical layout (label above switch) */
  vertical?: boolean;
  /** Disable the toggle */
  disabled?: boolean;
}

/**
 * Toggle switch component for showing/hiding loot item prices
 * Provides accessibility support and clear visual feedback
 */
export const PriceToggle: React.FC<PriceToggleProps> = ({
  showPrices,
  onToggle,
  className,
  vertical = false,
  disabled = false,
}) => {
  const { t } = useTranslation("loot");

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onToggle(event.target.checked);
  };

  const label = showPrices ? t("prices.hide") : t("prices.show");
  const tooltipText = showPrices
    ? t("prices.hideTooltip")
    : t("prices.showTooltip");

  if (vertical) {
    return (
      <Box
        className={className}
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 1,
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t("prices.label")}
        </Typography>
        <Tooltip title={tooltipText} arrow>
          <FormControlLabel
            control={
              <Switch
                checked={showPrices}
                onChange={handleChange}
                disabled={disabled}
                color="primary"
                inputProps={
                  {
                    "aria-label": label,
                  } as any
                }
                icon={<VisibilityOff />}
                checkedIcon={<Visibility />}
              />
            }
            label=""
            sx={{ margin: 0 }}
          />
        </Tooltip>
      </Box>
    );
  }

  return (
    <Tooltip title={tooltipText} arrow>
      <FormControlLabel
        className={className}
        control={
          <Switch
            checked={showPrices}
            onChange={handleChange}
            disabled={disabled}
            color="primary"
            inputProps={
              {
                "aria-label": label,
              } as any
            }
            icon={<VisibilityOff />}
            checkedIcon={<Visibility />}
          />
        }
        label={label}
        labelPlacement="start"
        sx={{
          margin: 0,
          "& .MuiFormControlLabel-label": {
            fontSize: "0.875rem",
            color: "text.secondary",
          },
        }}
      />
    </Tooltip>
  );
};

export default PriceToggle;
