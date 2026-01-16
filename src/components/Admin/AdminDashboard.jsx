import React, { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Tabs,
  Tab,
  IconButton,
  Menu,
  MenuItem,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Box,
  Avatar,
  useMediaQuery,
  useTheme,
  Button,
  Badge,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import LogoutIcon from "@mui/icons-material/Logout";
import PersonIcon from "@mui/icons-material/Person";
import GroupIcon from "@mui/icons-material/Group";
import RestaurantMenuIcon from "@mui/icons-material/RestaurantMenu";
import ShoppingCartIcon from "@mui/icons-material/ShoppingCart";
import ReceiptIcon from "@mui/icons-material/Receipt";
import BarChartIcon from "@mui/icons-material/BarChart";

const navItems = [
  { label: "Guest Management", path: "guest-management", icon: <GroupIcon /> },
  {
    label: "Menu Management",
    path: "menu-management",
    icon: <RestaurantMenuIcon />,
  },
  { label: "Place Order", path: "place-order", icon: <ShoppingCartIcon /> },
  { label: "Live Orders", path: "live-orders", icon: <ReceiptIcon /> },
  { label: "Bills", path: "bill", icon: <ReceiptIcon /> },
  { label: "Analysis", path: "analysis", icon: <BarChartIcon /> },
];

const AdminDashboard = () => {
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const location = useLocation();
  const navigate = useNavigate();

  // For mobile menu drawer
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // For profile menu
  const [profileAnchorEl, setProfileAnchorEl] = useState(null);
  const isProfileMenuOpen = Boolean(profileAnchorEl);

  const handleProfileMenuOpen = (event) => {
    setProfileAnchorEl(event.currentTarget);
  };
  const handleProfileMenuClose = () => {
    setProfileAnchorEl(null);
  };

  const handleLogout = () => {
    // Add your logout logic here, e.g. auth.signOut()
    alert("Logging out...");
    handleProfileMenuClose();
    navigate("/login");
  };

  // Find active tab index based on pathname
  const activeTabIndex = navItems.findIndex(({ path }) =>
    location.pathname.includes(path)
  );

  // Render Tabs for desktop
  const renderTabs = () => (
    <Tabs
      value={activeTabIndex === -1 ? false : activeTabIndex}
      textColor="inherit"
      indicatorColor="secondary"
      aria-label="Admin navigation tabs"
      sx={{ flexGrow: 1 }}
    >
      {navItems.map(({ label, path, icon }) => (
        <Tab
          key={path}
          label={label}
          icon={icon}
          iconPosition="start"
          component={Link}
          to={path}
          sx={{
            textTransform: "none",
            fontWeight: "medium",
            fontSize: "1rem",
            minWidth: 130,
            "&.Mui-selected": {
              fontWeight: "bold",
              color: theme.palette.secondary.main,
            },
          }}
        />
      ))}
    </Tabs>
  );

  // Render drawer menu for mobile
  const renderMobileMenu = () => (
    <Drawer
      anchor="left"
      open={mobileMenuOpen}
      onClose={() => setMobileMenuOpen(false)}
      PaperProps={{ sx: { width: 250 } }}
    >
      <List>
        {navItems.map(({ label, path, icon }) => (
          <ListItemButton
            key={path}
            component={Link}
            to={path}
            onClick={() => setMobileMenuOpen(false)}
            selected={location.pathname.includes(path)}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
    </Drawer>
  );

  return (
    <>
      <AppBar position="sticky" color="primary" elevation={3}>
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          {isMobile && (
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileMenuOpen(true)}
              size="large"
            >
              <MenuIcon />
            </IconButton>
          )}

          <Typography
            variant="h5"
            component={Link}
            to="/admin"
            sx={{
              color: "inherit",
              textDecoration: "none",
              fontWeight: "bold",
              flexGrow: isMobile ? 1 : 0,
              userSelect: "none",
              margin: "10px",
            }}
          >
            The Rahil's
          </Typography>

          {!isMobile && renderTabs()}

          {/* Profile + Logout */}
          <Box sx={{ ml: 2, display: "flex", alignItems: "center" }}>
            <IconButton
              size="large"
              color="inherit"
              onClick={() => setIsCartOpen(!isCartOpen)}
              aria-label="open cart"
              sx={{ ml: 1 }}
            >
              <Badge badgeContent={cart.length} color="error">
                <ShoppingCartIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls="profile-menu"
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
            >
              <Avatar alt="User" src="/static/images/avatar/1.jpg" />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {renderMobileMenu()}

      <Menu
        id="profile-menu"
        anchorEl={profileAnchorEl}
        open={isProfileMenuOpen}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem
          onClick={() => {
            alert("Profile clicked");
            handleProfileMenuClose();
          }}
        >
          <PersonIcon fontSize="small" sx={{ mr: 1 }} />
          Profile
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
          Logout
        </MenuItem>
      </Menu>

      <Box sx={{ p: { xs: 2, md: 3 }, maxWidth: 1200, mx: "auto" }}>
        {location.pathname === "/admin" && (
          <>
            <Typography variant="h3" align="center" gutterBottom>
              The Rahil's
            </Typography>
            <Typography
              variant="h5"
              align="center"
              color="text.secondary"
              gutterBottom
            >
              Welcome to the Admin Dashboard
            </Typography>

            <Box sx={{ display: "flex", justifyContent: "center", mb: 4 }}>
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate("/admin/place-order")}
              >
                Order Now
              </Button>
            </Box>
          </>
        )}

        <Outlet context={{ cart, setCart, isCartOpen, setIsCartOpen }} />
      </Box>
    </>
  );
};

export default AdminDashboard;
