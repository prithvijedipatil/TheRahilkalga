import { useState } from "react";
import {
  Drawer,
  IconButton,
  Typography,
  Select,
  MenuItem,
  Divider,
  Button,
  TextField,
  Box,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import DeleteIcon from "@mui/icons-material/Delete";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

const CartDrawer = ({
  isOpen,
  onClose,
  cart,
  addToCart,
  decreaseQuantity,
  removeFromCart,
  guests,
  selectedGuest,
  setSelectedGuest,
  placeOrder,
}) => {
  const [customRequest, setCustomRequest] = useState("");
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const sendWhatsAppMessage = (orderData) => {
    const phoneNumber = "919902225769";
    const selectedGuestName =
      guests.find((g) => g.id === selectedGuest)?.name || "Guest";

    const itemsList = orderData.items
      .map((item) => `${item.name} x ${item.quantity}`)
      .join("\n");

    const message =
      `Guest Name : ${selectedGuestName}\n\n` +
      `Items:\n${itemsList}\n\n` +
      `Special Request: ${
        orderData.customRequest || "Iss order me koi special request nahi hai"
      }`;

    window.open(
      `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`,
      "_blank"
    );
  };

  const handlePlaceOrder = async () => {
    if (!currentUser) {
      alert("Please login to place an order");
      navigate("/login");
      return;
    }

    if (!selectedGuest) {
      alert("Please select a guest");
      return;
    }

    if (cart.length === 0) {
      alert("Please add items to your cart");
      return;
    }

    const orderData = {
      guestId: selectedGuest,
      items: cart.map((item) => ({
        itemId: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
      })),
      total: cart.reduce((sum, item) => sum + item.price * item.quantity, 0),
      status: "pending",
      createdAt: new Date(),
      customRequest,
    };

    try {
      await placeOrder(orderData);
      sendWhatsAppMessage(orderData);
      setCustomRequest("");
      onClose();
    } catch (error) {
      console.error("Order placement failed:", error);
      alert("Failed to place order. Please try again.");
    }
  };

  return (
    <Drawer
      anchor="right"
      open={isOpen}
      onClose={onClose}
      BackdropProps={{ invisible: true }}
      PaperProps={{
        sx: {
          width: isMobile ? "100vw" : 400,
          maxWidth: "95vw",
          display: "flex",
          flexDirection: "column",
          height: "90vh", // Limit to 80% of screen height
          marginTop: "4vh", // Center it vertically (optional)
          borderTopLeftRadius: 12,
          borderTopRightRadius: 12,
        },
      }}
    >
      {/* Outer Wrapper */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
          overflow: "hidden",
          px: isMobile ? 1 : 2,
          py: 2,
        }}
      >
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6">Cart</Typography>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Box>

        {/* Guest Selection */}
        <Select
          value={selectedGuest}
          onChange={(e) => setSelectedGuest(e.target.value)}
          displayEmpty
          fullWidth
          size="small"
          sx={{ mb: 2 }}
        >
          <MenuItem value="">Select Guest</MenuItem>
          {guests.map((guest) => (
            <MenuItem key={guest.id} value={guest.id}>
              {guest.name} ({guest.phone})
            </MenuItem>
          ))}
        </Select>

        {/* Cart Items */}
        <Box
          sx={{
            flex: "1 1 auto",
            overflowY: "auto",
            pr: 1,
          }}
        >
          {cart.length === 0 ? (
            <Typography align="center" color="text.secondary" sx={{ mt: 4 }}>
              Your cart is empty
            </Typography>
          ) : (
            cart.map((item) => (
              <Box
                key={item.id}
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 2,
                  boxShadow: 1,
                  bgcolor: "background.paper",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box>
                  <Typography fontWeight={600}>{item.name}</Typography>
                  <Typography variant="body2" color="text.secondary">
                    ₹{item.price}
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <IconButton
                    size="small"
                    onClick={() => decreaseQuantity(item.id)}
                  >
                    <RemoveIcon />
                  </IconButton>
                  <Typography>{item.quantity}</Typography>
                  <IconButton size="small" onClick={() => addToCart(item)}>
                    <AddIcon />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => removeFromCart(item.id)}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            ))
          )}
        </Box>

        {/* Custom Request */}
        {cart.length > 0 && (
          <TextField
            label="Custom Request"
            variant="outlined"
            fullWidth
            multiline
            rows={3}
            value={customRequest}
            onChange={(e) => setCustomRequest(e.target.value)}
            sx={{ mt: 2 }}
            placeholder="Any special instructions..."
          />
        )}

        {/* Total and Place Order Button */}
        {cart.length > 0 && (
          <Box sx={{ mt: 3 }}>
            <Divider sx={{ mb: 2 }} />
            <Box
              sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}
            >
              <Typography variant="h6">Total:</Typography>
              <Typography variant="h6">
                ₹
                {cart.reduce(
                  (sum, item) => sum + item.price * item.quantity,
                  0
                )}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              size="large"
              onClick={handlePlaceOrder}
              sx={{ mb: 4 }}
            >
              Place Order & WhatsApp
            </Button>
          </Box>
        )}
      </Box>
    </Drawer>
  );
};

export default CartDrawer;
