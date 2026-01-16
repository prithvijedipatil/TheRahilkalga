import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { useAuth } from "./context/AuthContext";
import Login from "./components/Auth/Login";
import AdminDashboard from "./components/Admin/AdminDashboard";
import theme from "./theme/theme";

const App = () => {
  const { currentUser } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={
              currentUser ? <AdminDashboard /> : <Navigate to="/login" />
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
};

export default App;
