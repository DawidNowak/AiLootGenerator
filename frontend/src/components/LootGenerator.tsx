/**
 * LootGenerator main container component
 * Task: T053 - Create LootGenerator main container in frontend/src/components/LootGenerator.tsx
 * Task: T054 - Add form section to LootGenerator
 * Task: T055 - Add results section to LootGenerator
 * Task: T056 - Add error handling to LootGenerator
 * Task: T057 - Add responsive layout to LootGenerator
 *
 * Main container component that orchestrates the entire loot generation workflow.
 * Combines the form, results display, error handling, and responsive layout into
 * a cohesive user experience. Manages global state and coordinates between form
 * and results sections.
 */

import React, { useState, useCallback } from "react";
import {
  Box,
  Container,
  Grid,
  Paper,
  Typography,
  Divider,
  Stack,
  Fade,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useTranslation } from "react-i18next";

// Import form and display components
import LootForm from "./LootForm";
import LootList from "./LootList";
import PriceToggle from "./PriceToggle";
import ErrorMessage from "./ErrorMessage";
import StatusMessage from "./StatusMessage";

// Import types
import { LootItem } from "../types/api";

interface LootGeneratorState {
  /** Generated loot items */
  items: LootItem[];
  /** Timestamp when items were generated */
  generatedAt: string | null;
  /** Whether generation is in progress */
  isLoading: boolean;
  /** Current error message */
  error: string | null;
  /** Whether prices should be displayed */
  showPrices: boolean;
  /** Whether form has valid input */
  isFormValid: boolean;
  /** Whether form has errors */
  hasFormErrors: boolean;
}

const LootGenerator: React.FC = () => {
  const { t } = useTranslation(["common", "loot", "errors"]);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [state, setState] = useState<LootGeneratorState>({
    items: [],
    generatedAt: null,
    isLoading: false,
    error: null,
    showPrices: true,
    isFormValid: false,
    hasFormErrors: false,
  });

  // Task T054: Form section handlers
  const handleLootGenerated = useCallback(
    (items: LootItem[], generatedAt: string) => {
      setState((prev) => ({
        ...prev,
        items,
        generatedAt,
        isLoading: false,
        error: null,
      }));
    },
    []
  );

  const handleFormStateChange = useCallback(
    (isValid: boolean, hasErrors: boolean) => {
      setState((prev) => ({
        ...prev,
        isFormValid: isValid,
        hasFormErrors: hasErrors,
      }));
    },
    []
  );

  // Task T055: Results section handlers
  const handlePriceToggle = useCallback((showPrices: boolean) => {
    setState((prev) => ({
      ...prev,
      showPrices,
    }));
  }, []);

  // Task T056: Error handling
  const clearError = useCallback(() => {
    setState((prev) => ({
      ...prev,
      error: null,
    }));
  }, []);

  // Task T057: Responsive layout logic
  const formSectionSize = isMobile ? 12 : 6;
  const resultsSectionSize = isMobile ? 12 : 6;
  const containerMaxWidth = isMobile ? "sm" : "lg";

  return (
    <Container
      maxWidth={containerMaxWidth}
      sx={{
        py: { xs: 2, md: 4 },
        px: { xs: 1, md: 2 },
      }}
    >
      {/* Task T056: Global error display */}
      {state.error && (
        <Fade in={!!state.error}>
          <Box sx={{ mb: 2 }}>
            <ErrorMessage
              message={state.error}
              onClose={clearError}
              severity="error"
            />
          </Box>
        </Fade>
      )}

      {/* Task T057: Responsive layout with Grid */}
      <Grid container spacing={{ xs: 2, md: 3 }} alignItems="flex-start">
        {/* Task T054: Form Section */}
        <Grid item xs={formSectionSize}>
          <LootForm
            onLootGenerated={handleLootGenerated}
            onFormStateChange={handleFormStateChange}
          />
        </Grid>

        {/* Task T055: Results Section */}
        <Grid item xs={resultsSectionSize}>
          <Paper
            elevation={2}
            sx={{
              p: { xs: 2, md: 3 },
              minHeight: { xs: "auto", md: "400px" },
            }}
          >
            <Stack spacing={2}>
              {/* Results Header */}
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1,
                }}
              >
                <Typography variant="h5" component="h2" sx={{ flexGrow: 1 }}>
                  {t("loot:results.title")}
                </Typography>

                {/* Price toggle - only show when we have items */}
                {state.items.length > 0 && (
                  <PriceToggle
                    showPrices={state.showPrices}
                    onToggle={handlePriceToggle}
                  />
                )}
              </Box>

              <Divider />

              {/* Results Content */}
              <Box sx={{ minHeight: "200px" }}>
                {state.items.length === 0 ? (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: "200px",
                      textAlign: "center",
                    }}
                  >
                    <Typography
                      variant="body1"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      {t("loot:results.empty")}
                    </Typography>
                  </Box>
                ) : (
                  <Fade in={state.items.length > 0}>
                    <Box>
                      {/* Generation timestamp */}
                      {state.generatedAt && (
                        <Box sx={{ mb: 2 }}>
                          <Typography variant="caption" color="text.secondary">
                            {t("loot:results.generatedAt", {
                              time: new Date(
                                state.generatedAt
                              ).toLocaleString(),
                            })}
                          </Typography>
                        </Box>
                      )}

                      {/* Loot items */}
                      <LootList
                        items={state.items}
                        showPrices={state.showPrices}
                      />
                    </Box>
                  </Fade>
                )}
              </Box>

              {/* Status messages for user feedback */}
              {!state.error && state.items.length > 0 && (
                <StatusMessage
                  severity="success"
                  message={t("loot:results.success", {
                    count: state.items.length,
                  })}
                />
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      {/* Task T057: Mobile-specific bottom spacing */}
      {isMobile && <Box sx={{ height: theme.spacing(4) }} />}
    </Container>
  );
};

export default LootGenerator;
