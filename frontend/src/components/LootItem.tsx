/**
 * LootItem Display Component
 * Task: T036 - Frontend Display Components
 *
 * Displays a single loot item with name, description, and value
 * Supports currency formatting and responsive design
 */

import { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Chip,
  Box,
  Tooltip,
} from "@mui/material";
import { MonetizationOn as CoinIcon } from "@mui/icons-material";
import { useTranslation } from "react-i18next";
import { LootItem as LootItemType } from "../types/api";
import {
  formatCurrencyAbbreviated,
  formatCurrencyFull,
} from "../utils/currencyFormatter";

/**
 * Props for the LootItem component
 */
export interface LootItemProps {
  /** The loot item data to display */
  item: LootItemType;
  /** Whether to show the price value */
  showPrice?: boolean;
  /** Use abbreviated currency format (e.g., "1gc 5s 3p" vs "1 gold crown 5 shillings 3 pennies") */
  abbreviatedCurrency?: boolean;
  /** Optional CSS class name */
  className?: string;
}

/**
 * Individual loot item display component
 * Shows item name, description, wealth level, and optional price
 */
export const LootItem: React.FC<LootItemProps> = ({
  item,
  showPrice = true,
  abbreviatedCurrency = false,
  className,
}) => {
  const { t } = useTranslation("loot");
  const [currencyFormat, setCurrencyFormat] = useState<"abbreviated" | "full">(
    abbreviatedCurrency ? "abbreviated" : "full"
  );

  // Handle currency formatting with error handling
  const getFormattedCurrency = () => {
    try {
      return currencyFormat === "abbreviated"
        ? formatCurrencyAbbreviated(item.valueInPennies)
        : formatCurrencyFull(item.valueInPennies);
    } catch (error) {
      console.warn("Currency formatting error:", error);
      return `${item.valueInPennies}p`; // Fallback to simple pennies display
    }
  };

  return (
    <Card
      className={className}
      sx={{
        mb: 2,
        transition: "elevation 0.2s",
        "&:hover": {
          elevation: 4,
        },
      }}
    >
      <CardContent>
        {/* Item header with name and wealth level */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 1,
          }}
        >
          <Typography
            variant="h6"
            component="h3"
            sx={{
              fontWeight: "bold",
              flex: 1,
              mr: 2,
              wordBreak: "break-word",
            }}
          >
            {item.name}
          </Typography>

          <Tooltip title={t(`wealthLevelDescriptions.${item.wealthLevel}`)}>
            <Chip
              label={t(`wealthLevels.${item.wealthLevel}`)}
              size="small"
              variant="outlined"
            />
          </Tooltip>
        </Box>

        {/* Item description */}
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: showPrice ? 2 : 0,
            lineHeight: 1.6,
            wordBreak: "break-word",
          }}
        >
          {item.description}
        </Typography>

        {/* Price display (conditional) */}
        {showPrice && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CoinIcon sx={{ color: "primary.main", fontSize: "1.2rem" }} />
              <Typography
                variant="caption"
                color="text.secondary"
                sx={{ fontSize: "0.75rem" }}
              >
                {t("wealthLevels." + item.wealthLevel)} Item
              </Typography>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography
                variant="subtitle2"
                onClick={() =>
                  setCurrencyFormat((prev) =>
                    prev === "abbreviated" ? "full" : "abbreviated"
                  )
                }
                sx={{
                  fontWeight: "bold",
                  color: "primary.main",
                  fontSize: "0.875rem",
                  cursor: "pointer",
                  textDecoration: "underline",
                  textDecorationStyle: "dotted",
                  "&:hover": {
                    textDecoration: "underline",
                    textDecorationStyle: "solid",
                  },
                }}
              >
                {getFormattedCurrency()}
              </Typography>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export default LootItem;
