import { createMuiTheme } from "@material-ui/core/styles";
export default createMuiTheme({
  typography: {
    useNextVariants: true
  },
  palette: {
    common: { black: "#000", white: "#fff" },
    background: { paper: "#fff", default: "#fafafa" },
    primary: {
      light: "rgba(119, 235, 235, 1)",
      main: "rgba(51, 175, 223, 1)",
      dark: "#303f9f",
      contrastText: "#fff"
    },
    secondary: {
      light: "rgba(252, 254, 217, 1)",
      main: "rgba(245, 179, 0, 1)",
      dark: "rgba(160, 109, 9, 1)",
      contrastText: "#fff"
    },
    error: {
      light: "#e57373",
      main: "#f44336",
      dark: "#d32f2f",
      contrastText: "#fff"
    },
    text: {
      primary: "rgba(0, 0, 0, 0.87)",
      secondary: "rgba(0, 0, 0, 0.54)",
      disabled: "rgba(0, 0, 0, 0.38)",
      hint: "rgba(0, 0, 0, 0.38)"
    }
  }
});
