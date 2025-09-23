import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import LootGenerator from "./components/LootGenerator";

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
      <LootGenerator />
    </ThemeProvider>
  );
}

export default App;
