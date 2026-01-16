import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  CircularProgress,
  Alert,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined } from "@mui/icons-material";

const Login = () => {
  const [email, setEmail] = useState("prithvipatil09@gmail.com");
  const [password, setPassword] = useState("Rahilinkalga");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await login(email, password);
      navigate("/admin");
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
      console.error("Login failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        padding: 2,
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={8}
          sx={{
            padding: 4,
            borderRadius: 3,
            boxShadow: "0 10px 40px rgba(0, 0, 0, 0.2)",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              mb: 3,
            }}
          >
            <Box
              sx={{
                backgroundColor: "#667eea",
                borderRadius: "50%",
                padding: 2,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <LockOutlined sx={{ color: "white", fontSize: 32 }} />
            </Box>
          </Box>

          {/* Title */}
          <Typography
            variant="h4"
            component="h1"
            sx={{
              textAlign: "center",
              fontWeight: "bold",
              mb: 1,
              color: "#333",
            }}
          >
            Rahil's Café
          </Typography>
          <Typography
            variant="body2"
            sx={{
              textAlign: "center",
              color: "#666",
              mb: 3,
            }}
          >
            Admin Portal
          </Typography>

          {/* Error Alert */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleLogin}>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {/* Email Field */}
              <TextField
                fullWidth
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                variant="outlined"
                placeholder="Enter your email"
                disabled={loading}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />

              {/* Password Field */}
              <TextField
                fullWidth
                label="Password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                variant="outlined"
                placeholder="Enter your password"
                disabled={loading}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={handleClickShowPassword}
                        edge="end"
                        disabled={loading}
                        size="small"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                sx={{
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 1.5,
                  },
                }}
              />

              {/* Login Button */}
              <Button
                fullWidth
                variant="contained"
                size="large"
                type="submit"
                disabled={loading}
                sx={{
                  mt: 2,
                  background:
                    "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  textTransform: "none",
                  fontSize: 16,
                  fontWeight: 600,
                  borderRadius: 1.5,
                  padding: "12px",
                  "&:hover": {
                    boxShadow: "0 8px 24px rgba(102, 126, 234, 0.4)",
                  },
                  position: "relative",
                }}
              >
                {loading ? (
                  <>
                    <CircularProgress
                      size={20}
                      sx={{ mr: 1, color: "white" }}
                    />
                    Logging in...
                  </>
                ) : (
                  "Login"
                )}
              </Button>
            </Box>
          </form>

          {/* Footer */}
          <Typography
            variant="caption"
            sx={{
              display: "block",
              textAlign: "center",
              mt: 3,
              color: "#999",
            }}
          >
            © 2026 Rahil's Café Admin Portal. All rights reserved.
          </Typography>
        </Paper>
      </Container>
    </Box>
  );
};

export default Login;
