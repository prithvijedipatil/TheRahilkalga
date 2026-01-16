import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import {
  Card,
  CardContent,
  Typography,
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
  Chip,
  Box,
  Divider,
  Alert as MuiAlert,
} from "@mui/material";
import { Delete as DeleteIcon } from "@mui/icons-material";

const defaultCategories = [
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

const MenuManagement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [menuItems, setMenuItems] = useState([]);
  const [categories, setCategories] = useState([...defaultCategories]);
  const [newItem, setNewItem] = useState({
    name: "",
    price: "",
    category: "breakfast",
    isAvailable: true,
  });
  const [snackOpen, setSnackOpen] = useState(false);
  const [snackMessage, setSnackMessage] = useState("");
  const [snackSeverity, setSnackSeverity] = useState("success");
  const [showItemsToDelete, setShowItemsToDelete] = useState(false);
  const [showCategoryDelete, setShowCategoryDelete] = useState(false);
  const [confirmDeleteDialog, setConfirmDeleteDialog] = useState({
    open: false,
    itemId: null,
    type: "item",
  });
  const [confirmCategoryDialog, setConfirmCategoryDialog] = useState({
    open: false,
    category: null,
  });

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
  }, [snackOpen, showItemsToDelete, showCategoryDelete]);

  const addMenuItem = async (e) => {
    e.preventDefault();
    if (!newItem.name || !newItem.price) {
      setSnackMessage("Please fill all fields");
      setSnackSeverity("error");
      setSnackOpen(true);
      return;
    }
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
      setSnackMessage("Item added successfully 🎉");
      setSnackSeverity("success");
      setSnackOpen(true);
    } catch (error) {
      setSnackMessage("Error adding item: " + error.message);
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const confirmDelete = (itemId) => {
    setConfirmDeleteDialog({ open: true, itemId, type: "item" });
  };

  const handleDeleteItem = async () => {
    try {
      await deleteDoc(doc(db, "menu", confirmDeleteDialog.itemId));
      setConfirmDeleteDialog({ open: false, itemId: null, type: "item" });
      setShowItemsToDelete(false);
      setSnackMessage("Item deleted successfully");
      setSnackSeverity("success");
      setSnackOpen(true);
    } catch (error) {
      setSnackMessage("Error deleting item: " + error.message);
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const confirmDeleteCategory = (category) => {
    setConfirmCategoryDialog({ open: true, category });
  };

  const handleDeleteCategory = async () => {
    try {
      const categoryToDelete = confirmCategoryDialog.category;
      const q = query(
        collection(db, "menu"),
        where("category", "==", categoryToDelete)
      );
      const querySnapshot = await getDocs(q);

      // Delete all items in this category
      const deletePromises = querySnapshot.docs.map((doc) =>
        deleteDoc(doc.ref)
      );
      await Promise.all(deletePromises);

      setConfirmCategoryDialog({ open: false, category: null });
      setShowCategoryDelete(false);
      setSnackMessage(
        `Category "${categoryToDelete}" and all its items deleted`
      );
      setSnackSeverity("success");
      setSnackOpen(true);
    } catch (error) {
      setSnackMessage("Error deleting category: " + error.message);
      setSnackSeverity("error");
      setSnackOpen(true);
    }
  };

  const getCategoryItemCount = (category) => {
    return menuItems.filter((item) => item.category === category).length;
  };

  return (
    <div style={{ maxWidth: 1000, margin: "0 auto", padding: 24 }}>
      <Typography variant="h4" align="center" gutterBottom>
        Menu Management
      </Typography>

      {/* Add Item Section */}
      <Card sx={{ mb: 4 }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Add New Item
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
        </CardContent>
      </Card>

      <Divider sx={{ my: 4 }} />

      {/* Remove Items Section */}
      <Box sx={{ mb: 4 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setShowItemsToDelete(!showItemsToDelete)}
          sx={{ mb: 2 }}
        >
          {showItemsToDelete ? "Hide Menu Items" : "Remove Items from Menu"}
        </Button>

        {showItemsToDelete && (
          <>
            {menuItems.length === 0 ? (
              <MuiAlert severity="info">No items to display</MuiAlert>
            ) : (
              <Grid container spacing={2} sx={{ mt: 1 }}>
                {menuItems.map((item) => (
                  <Grid item xs={12} sm={6} md={4} key={item.id}>
                    <Card>
                      <CardContent>
                        <Typography variant="h6">{item.name}</Typography>
                        <Typography variant="body2" color="textSecondary">
                          ₹{item.price}
                        </Typography>
                        <Chip
                          label={item.category}
                          size="small"
                          sx={{ mt: 1, mb: 2 }}
                        />
                        <br />
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() => confirmDelete(item.id)}
                          startIcon={<DeleteIcon />}
                        >
                          Delete
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Remove Categories Section */}
      <Box>
        <Button
          variant="outlined"
          color="error"
          onClick={() => setShowCategoryDelete(!showCategoryDelete)}
          sx={{ mb: 2 }}
        >
          {showCategoryDelete ? "Hide Categories" : "Remove Categories"}
        </Button>

        {showCategoryDelete && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="error" sx={{ mb: 2 }}>
              ⚠️ Warning: Deleting a category will remove all items in that
              category.
            </Typography>
            <Grid container spacing={1}>
              {categories.map((category) => {
                const itemCount = getCategoryItemCount(category);
                return (
                  <Grid item xs={12} sm={6} md={4} key={category}>
                    <Card
                      sx={{
                        backgroundColor: itemCount > 0 ? "#fff3cd" : "#f0f0f0",
                        border:
                          itemCount > 0
                            ? "1px solid #ffc107"
                            : "1px solid #ccc",
                      }}
                    >
                      <CardContent>
                        <Typography variant="subtitle1">
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="textSecondary"
                          sx={{ mb: 1 }}
                        >
                          {itemCount} item{itemCount !== 1 ? "s" : ""}
                        </Typography>
                        <Button
                          variant="contained"
                          color="error"
                          size="small"
                          fullWidth
                          onClick={() => confirmDeleteCategory(category)}
                          startIcon={<DeleteIcon />}
                          disabled={itemCount === 0}
                        >
                          Delete Category
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </Box>
        )}
      </Box>

      {/* Delete Item Dialog */}
      <Dialog
        open={confirmDeleteDialog.open}
        onClose={() =>
          setConfirmDeleteDialog({ open: false, itemId: null, type: "item" })
        }
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
              setConfirmDeleteDialog({
                open: false,
                itemId: null,
                type: "item",
              })
            }
          >
            Cancel
          </Button>
          <Button onClick={handleDeleteItem} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Category Dialog */}
      <Dialog
        open={confirmCategoryDialog.open}
        onClose={() =>
          setConfirmCategoryDialog({ open: false, category: null })
        }
      >
        <DialogTitle>Confirm Category Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ⚠️ <strong>WARNING:</strong> You are about to delete the category "
            <strong>{confirmCategoryDialog.category}</strong>" and all{" "}
            <strong>
              {getCategoryItemCount(confirmCategoryDialog.category)} item
              {getCategoryItemCount(confirmCategoryDialog.category) !== 1
                ? "s"
                : ""}
            </strong>{" "}
            in it. This action cannot be undone!
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() =>
              setConfirmCategoryDialog({ open: false, category: null })
            }
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteCategory}
            color="error"
            variant="contained"
          >
            Delete Category
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert onClose={() => setSnackOpen(false)} severity={snackSeverity}>
          {snackMessage}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default MenuManagement;
