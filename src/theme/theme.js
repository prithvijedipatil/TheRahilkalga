import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      main: "#667eea",
      light: "#8b9ff0",
      dark: "#4c5bb8",
    },
    secondary: {
      main: "#764ba2",
      light: "#8e5fb8",
      dark: "#5a3980",
    },
    background: {
      default: "#f7f7f7",
      paper: "#ffffff",
    },
    error: {
      main: "#f44336",
    },
    success: {
      main: "#4caf50",
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 700,
    },
    h3: {
      fontWeight: 600,
    },
    h4: {
      fontWeight: 600,
    },
    h5: {
      fontWeight: 500,
    },
  },
  components: {
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          boxShadow: "0 4px 20px rgba(102, 126, 234, 0.3)",
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        contained: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          boxShadow: "0 4px 12px rgba(102, 126, 234, 0.3)",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(102, 126, 234, 0.4)",
          },
        },
        outlined: {
          textTransform: "none",
          fontWeight: 600,
          borderRadius: "8px",
          borderWidth: "2px",
          "&:hover": {
            borderWidth: "2px",
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.08)",
          transition: "all 0.3s ease",
          "&:hover": {
            boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
            transform: "translateY(-4px)",
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: "12px",
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          "& .MuiOutlinedInput-root": {
            borderRadius: "8px",
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: "#667eea",
            },
            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
              borderColor: "#667eea",
            },
          },
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: "linear-gradient(180deg, #f7f7f7 0%, #ffffff 100%)",
        },
      },
    },
  },
});

export default theme;
