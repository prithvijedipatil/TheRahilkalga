import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import {
  Select,
  MenuItem,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  CircularProgress,
  Button,
  Grid,
} from "@mui/material";
import { keyframes } from "@emotion/react";
import exportToPDF from "./PDFExport";

// Fade-in animation
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const UserBills = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const [guests, setGuests] = useState([]);
  const [selectedGuest, setSelectedGuest] = useState("");
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentUser) navigate("/login");
  }, [currentUser, navigate]);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "guests"));
        setGuests(
          querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
        );
      } catch (error) {
        console.error("Error fetching guests:", error);
      }
    };
    fetchGuests();
  }, []);

  useEffect(() => {
    const fetchOrders = async () => {
      if (!selectedGuest) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "orders"),
          where("guestId", "==", selectedGuest)
        );
        const querySnapshot = await getDocs(q);
        const ordersList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        setOrders(ordersList); // Only existing orders are used
      } catch (error) {
        console.error("Error fetching orders:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [selectedGuest]);

  const totalBill = orders.reduce((sum, order) => sum + order.total, 0);
  const sortedOrders = [...orders].sort((a, b) => a.createdAt - b.createdAt);

  return (
    <Box
      sx={{
        animation: `${fadeIn} 0.3s ease`,
        fontFamily: "'Poppins', sans-serif",
      }}
    >
      <Typography variant="h4" gutterBottom fontWeight={600}>
        Guest Bill History
      </Typography>

      <Grid container spacing={3} sx={{ my: 2 }}>
        <Grid item xs={12} sm={6}>
          <Select
            value={selectedGuest}
            onChange={(e) => setSelectedGuest(e.target.value)}
            displayEmpty
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: "#fff" }}
          >
            <MenuItem value="">Select Guest</MenuItem>
            {guests.map((guest) => (
              <MenuItem key={guest.id} value={guest.id}>
                {guest.name} ({guest.phone})
              </MenuItem>
            ))}
          </Select>
        </Grid>
      </Grid>

      {loading && <CircularProgress sx={{ mt: 3 }} />}

      {selectedGuest && !loading && (
        <>
          <TableContainer component={Paper} sx={{ mt: 2, borderRadius: 2 }}>
            <Table>
              <TableHead sx={{ backgroundColor: "#f5f5f5" }}>
                <TableRow>
                  <TableCell>
                    <strong>Item Name</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Quantity</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Order Date & Time</strong>
                  </TableCell>
                  <TableCell>
                    <strong>Item Total</strong>
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedOrders.map((order) =>
                  order.items.map((item, index) => (
                    <TableRow key={`${order.id}-${index}`}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>{order.createdAt?.toLocaleString()}</TableCell>
                      <TableCell>₹{item.price * item.quantity}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <Box
            sx={{
              mt: 4,
              p: 3,
              backgroundColor: "#e3f2fd",
              borderRadius: 2,
              boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Final Bill Summary
            </Typography>
            <Typography variant="body1" fontSize={18}>
              Total Amount: <strong>₹{totalBill}</strong>
            </Typography>
            <Typography variant="body2" fontSize={18}>
              Gst 5% : <strong>₹{totalBill * 1.05 - totalBill}</strong>
            </Typography>
            <Typography variant="body2" fontSize={18}>
              with GST: <strong>₹{totalBill * 1.05}</strong>
            </Typography>
          </Box>

          <Button
            variant="contained"
            color="primary"
            sx={{ mt: 3, px: 4 }}
            onClick={() => {
              const guestName =
                guests.find((g) => g.id === selectedGuest)?.name || "Guest";
              exportToPDF(orders, guestName, totalBill);
            }}
          >
            Export as PDF
          </Button>
        </>
      )}
    </Box>
  );
};

export default UserBills;
