import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const theme = createTheme({
  palette: {
    primary: {
      main: "#8b4513", // Warhammer brown
    },
    secondary: {
      main: "#ffd700", // Gold
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
        <Box sx={{ my: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom align="center">
            Warhammer Fantasy Loot Generator
          </Typography>
          <Typography
            variant="h6"
            component="p"
            align="center"
            color="text.secondary"
          >
            Generate thematic loot for your Warhammer Fantasy Roleplay sessions
          </Typography>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default App;
