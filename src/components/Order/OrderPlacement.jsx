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

// Emoji icons for categories
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

// Enhanced category styling with gradients
const categoryGradients = {
  breakfast: "linear-gradient(135deg, #FFD89B 0%, #FFA500 100%)",
  lunch: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  dinner: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  drinks: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  extras: "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
  "hot beverages": "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "cold beverages": "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
  sandwiches: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  "veg munchies": "linear-gradient(135deg, #90ee90 0%, #228b22 100%)",
  "non-veg munchies": "linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)",
  "indian mains": "linear-gradient(135deg, #f6d365 0%, #fda085 100%)",
  chinese: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  pizza: "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
  pasta: "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  burger: "linear-gradient(135deg, #ff6b35 0%, #f7931e 100%)",
  shakes: "linear-gradient(135deg, #ff006e 0%, #fb5607 100%)",
  desserts: "linear-gradient(135deg, #ffd1dc 0%, #ff69b4 100%)",
  cafe: "linear-gradient(135deg, #8b4513 0%, #d2b48c 100%)",
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
                    height: 160,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "center",
                    cursor: "pointer",
                    textTransform: "capitalize",
                    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                    background:
                      categoryGradients[cat] ||
                      "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    color: "white",
                    position: "relative",
                    overflow: "hidden",
                    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                    "&:hover": {
                      boxShadow: "0 16px 40px rgba(0, 0, 0, 0.25)",
                      transform: "translateY(-8px) scale(1.02)",
                    },
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: "rgba(255, 255, 255, 0.1)",
                      opacity: 0,
                      transition: "opacity 0.3s ease",
                    },
                    "&:hover::before": {
                      opacity: 1,
                    },
                  }}
                  onClick={() => setSelectedCategory(cat)}
                >
                  <Typography
                    variant="h2"
                    mb={1}
                    sx={{
                      fontSize: "3rem",
                      filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))",
                      zIndex: 1,
                    }}
                  >
                    {categoryIcons[cat] || "📦"}
                  </Typography>
                  <Typography
                    variant="h6"
                    sx={{
                      fontWeight: "bold",
                      textShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
                      zIndex: 1,
                    }}
                  >
                    {cat}
                  </Typography>
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
