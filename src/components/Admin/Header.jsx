import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  Card,
  CardContent,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import MuiAlert from "@mui/material/Alert";
import MenuIcon from "@mui/icons-material/Menu";

const categories = [
  "breakfast",

  "extras",
  "hot beverages",
  "cold beverages",
  "sandwiches",
  "veg munchies",
  "non-veg munchies",
  "indian mains",
  "chinese",
  "pizza",
  "pasta",
  "burger",
  "shakes",
  "desserts",
  "cafe",
];

const Alert = (props) => <MuiAlert elevation={6} variant="filled" {...props} />;

const navLinks = [
  { label: "Place Order", path: "/place-order" },
  { label: "Bill", path: "/bill" },
  { label: "Live Orders", path: "/live-orders" },
  { label: "Guest Management", path: "/guest-management" },
  { label: "Menu Management", path: "/menu-management" },
  { label: "Analysis", path: "/analysis" },
  { label: "Dashboard", path: "/admin" },
  { label: "Logout", path: "/login" },
];

const MenuManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "breakfast",
    isAvailable: true,
  });
  const [snackOpen, setSnackOpen] = useState(false);
  const [showItemsToDelete, setShowItemsToDelete] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({
    open: false,
    itemId: null,
  });
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchMenu = async () => {
      const querySnapshot = await getDocs(collection(db, "menu"));
      const items = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMenuItems(items);
    };
    fetchMenu();
  }, [snackOpen, showItemsToDelete]);

  const addMenuItem = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "menu"), {
        ...newItem,
        price: parseFloat(newItem.price),
      });
      setNewItem({
        name: "",
        price: "",
        category: "breakfast",
        isAvailable: true,
      });
      setSnackOpen(true);
    } catch (error) {
      alert("Error adding item: " + error.message);
    }
  };

  const confirmDelete = (itemId) => {
    setConfirmDeleteDialog({ open: true, itemId });
  };

  const handleDeleteItem = async () => {
    try {
      await deleteDoc(doc(db, "menu", confirmDeleteDialog.itemId));
      setConfirmDeleteDialog({ open: false, itemId: null });
      setShowItemsToDelete(false);
    } catch (error) {
      alert("Error deleting item: " + error.message);
    }
  };

  return (
    <>
      <AppBar position="static" color="primary">
        <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6">BlueSheep Admin</Typography>
        </Toolbar>
      </AppBar>
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <List>
          {navLinks.map((link) => (
            <ListItemButton
              key={link.path}
              onClick={() => {
                navigate(link.path);
                setDrawerOpen(false);
              }}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
        </List>
      </Drawer>

      <div style={{ maxWidth: 800, margin: "0 auto", padding: 24 }}>
        <Typography variant="h4" align="center" gutterBottom>
          Menu Management
        </Typography>

        <form onSubmit={addMenuItem}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Item Name"
                value={newItem.name}
                onChange={(e) =>
                  setNewItem({ ...newItem, name: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Price (₹)"
                type="number"
                value={newItem.price}
                onChange={(e) =>
                  setNewItem({ ...newItem, price: e.target.value })
                }
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                fullWidth
                label="Category"
                value={newItem.category}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value })
                }
              >
                {categories.map((cat) => (
                  <MenuItem key={cat} value={cat}>
                    {cat.charAt(0).toUpperCase() + cat.slice(1)}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ height: "100%" }}
              >
                Add Item
              </Button>
            </Grid>
          </Grid>
        </form>

        <Button
          variant="outlined"
          color="secondary"
          onClick={() => setShowItemsToDelete(!showItemsToDelete)}
          sx={{ mt: 4 }}
        >
          {showItemsToDelete ? "Hide Menu Items" : "Remove Items from Menu"}
        </Button>

        {showItemsToDelete && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            {menuItems.map((item) => (
              <Grid item xs={12} sm={6} key={item.id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">{item.name}</Typography>
                    <Typography variant="body2">₹{item.price}</Typography>
                    <Typography variant="body2">{item.category}</Typography>
                    <Button
                      variant="outlined"
                      color="error"
                      onClick={() => confirmDelete(item.id)}
                      sx={{ mt: 1 }}
                    >
                      Delete
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        <Dialog
          open={confirmDeleteDialog.open}
          onClose={() => setConfirmDeleteDialog({ open: false, itemId: null })}
        >
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogContent>
            <DialogContentText>
              Are you sure you want to delete this item from the menu?
            </DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() =>
                setConfirmDeleteDialog({ open: false, itemId: null })
              }
            >
              Cancel
            </Button>
            <Button onClick={handleDeleteItem} color="error">
              Delete
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={snackOpen}
          autoHideDuration={3000}
          onClose={() => setSnackOpen(false)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert onClose={() => setSnackOpen(false)} severity="success">
            Yayyy! Item added successfully 🎉
          </Alert>
        </Snackbar>
      </div>
    </>
  );
};

export default MenuManagement;
