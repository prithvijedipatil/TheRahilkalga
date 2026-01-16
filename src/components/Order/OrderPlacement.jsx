import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useOutletContext } from "react-router-dom";

import {
  collection,
  getDocs,
  addDoc,
  doc,
  setDoc,
  increment,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";

import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  CircularProgress,
} from "@mui/material";

import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SearchIcon from "@mui/icons-material/Search";
import AddShoppingCartIcon from "@mui/icons-material/AddShoppingCart";

import CartDrawer from "./CartDrawer";

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

// Emoji icons for categories - fallback if no image/icon provided
const categoryIcons = {
  breakfast: "🍳",
  lunch: "🥗",
  dinner: "🍽️",
  drinks: "🥤",
  extras: "➕",
  "hot beverages": "☕",
  "cold beverages": "🧊",
  sandwiches: "🥪",
  "veg munchies": "🥒",
  "non-veg munchies": "🍗",
  "indian mains": "🍛",
  chinese: "🥡",
  pizza: "🍕",
  pasta: "🍝",
  burger: "🍔",
  shakes: "🥤",
  desserts: "🍰",
  cafe: "🏠",
};

const OrderPlacement = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState("");
  // const [cart, setCart] = useState([]);
  // const [isCartOpen, setIsCartOpen] = useState(false);
  const { cart, setCart, isCartOpen, setIsCartOpen } = useOutletContext();

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);
  const [categoryItems, setCategoryItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Redirect if not logged in
  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  // Fetch guests and all menu items (for fallback)
  useEffect(() => {
    const fetchData = async () => {
      const guestsSnapshot = await getDocs(collection(db, "guests"));
      const guestsList = guestsSnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((guest) => guest.isActive);

      setGuests(guestsList);

      // We no longer fetch all menu items upfront to optimize load.
    };
    fetchData();
  }, []);

  // Fetch items for the selected category from Firestore
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchCategoryItems = async () => {
      setLoadingItems(true);
      try {
        const q = query(
          collection(db, "menu"),
          where("category", "==", selectedCategory),
          where("isAvailable", "==", true)
        );
        const snapshot = await getDocs(q);
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setCategoryItems(items);
      } catch (err) {
        console.error("Error fetching category items:", err);
        setCategoryItems([]);
      } finally {
        setLoadingItems(false);
      }
    };

    fetchCategoryItems();
  }, [selectedCategory]);

  // Your existing addToCart function logic (unchanged)
  const addToCart = (item) => {
    const existingItem = cart.find((cartItem) => cartItem.id === item.id);
    if (existingItem) {
      setCart(
        cart.map((cartItem) =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        )
      );
    } else {
      setCart([...cart, { ...item, quantity: 1 }]);
    }
    // made changes here about cart open only this line
    // setIsCartOpen(true);
  };

  const decreaseQuantity = (itemId) => {
    setCart(
      cart.map((cartItem) =>
        cartItem.id === itemId
          ? { ...cartItem, quantity: Math.max(1, cartItem.quantity - 1) }
          : cartItem
      )
    );
  };

  const removeFromCart = (itemId) => {
    setCart(cart.filter((item) => item.id !== itemId));
  };

  const placeOrder = async (order) => {
    try {
      await addDoc(collection(db, "orders"), order);

      // Update analytics for each item
      order.items.forEach(async (item) => {
        const analyticsRef = doc(db, "analytics", item.itemId);
        await setDoc(
          analyticsRef,
          {
            orderCount: increment(1),
            lastOrdered: new Date(),
          },
          { merge: true }
        );
      });

      setCart([]);
      setSelectedGuest("");
      setIsCartOpen(false);
      alert("Order placed successfully!");
    } catch (error) {
      alert("Error placing order: " + error.message);
    }
  };

  // Filter category items by search term
  const filteredCategoryItems = categoryItems.filter((item) =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      <Box p={4} maxWidth={1200} mx="auto">
        <Typography variant="h4" mb={3} fontWeight="bold">
          {selectedCategory
            ? `Category: ${
                selectedCategory.charAt(0).toUpperCase() +
                selectedCategory.slice(1)
              }`
            : "Select Category"}
        </Typography>

        {/* Back button if category selected */}
        {selectedCategory && (
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => {
              setSelectedCategory(null);
              setCategoryItems([]);
              setSearchTerm("");
            }}
            sx={{ mb: 3 }}
          >
            Back to Categories
          </Button>
        )}

        {/* Show categories if none selected */}
        {!selectedCategory && (
          <Grid container spacing={3}>
            {categories.map((cat) => (
              <Grid item xs={6} sm={4} md={3} key={cat}>
                <Card
                  sx={{
                    height: 140,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    "&:hover": {
                      boxShadow: 6,
                      transform: "scale(1.05)",
                    },
                  }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <Typography variant="h3" mb={1}>
                    {categoryIcons[cat] || "📦"}
                  </Typography>
                  <Typography variant="h6">{cat}</Typography>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* Show items inside selected category */}
        {selectedCategory && (
          <>
            <TextField
              placeholder={`Search ${selectedCategory}...`}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              fullWidth
              variant="outlined"
              size="small"
              InputProps={{
                startAdornment: <SearchIcon sx={{ mr: 1 }} />,
              }}
              sx={{ mb: 3 }}
            />

            {loadingItems ? (
              <Box display="flex" justifyContent="center" mt={4}>
                <CircularProgress />
              </Box>
            ) : filteredCategoryItems.length === 0 ? (
              <Typography>No items found.</Typography>
            ) : (
              <Grid container spacing={2}>
                {filteredCategoryItems.map((item) => (
                  <Grid item xs={6} sm={4} md={3} key={item.id}>
                    <Card
                      sx={{
                        height: "180px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        p: 2,
                        cursor: "default",
                        transition: "box-shadow 0.2s ease",
                        "&:hover": { boxShadow: 6 },
                      }}
                      elevation={1}
                    >
                      <CardContent
                        sx={{
                          textAlign: "center",
                          flexGrow: 1,
                          display: "flex",
                          flexDirection: "column",
                          justifyContent: "center",
                        }}
                      >
                        <Typography
                          variant="h6"
                          wrap="true"
                          title={item.name}
                          sx={{ mb: 1, fontSize: 12 }}
                        >
                          {item.name}
                        </Typography>
                        <Typography
                          variant="subtitle1"
                          color="text.secondary"
                          sx={{ fontSize: 12 }}
                        >
                          ₹{item.price}
                        </Typography>
                      </CardContent>

                      <Button
                        variant="contained"
                        size="small"
                        startIcon={<AddShoppingCartIcon />}
                        onClick={() => addToCart(item)}
                        sx={{ fontSize: 12 }}
                      >
                        Add to Cart
                      </Button>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        )}

        {/* Cart Drawer */}
        <CartDrawer
          isOpen={isCartOpen}
          onClose={() => setIsCartOpen(false)}
          cart={cart}
          addToCart={addToCart}
          decreaseQuantity={decreaseQuantity}
          removeFromCart={removeFromCart}
          guests={guests}
          selectedGuest={selectedGuest}
          setSelectedGuest={setSelectedGuest}
          placeOrder={placeOrder}
        />
      </Box>
    </>
  );
};

export default OrderPlacement;
