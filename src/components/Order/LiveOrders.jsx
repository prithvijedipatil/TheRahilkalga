import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  updateDoc,
  doc,
  getDocs,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../../services/firebase";
import { useAuth } from "../../context/AuthContext";
import {
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Stack,
  Box,
} from "@mui/material";

const LiveOrders = () => {
  const [orders, setOrders] = useState([]);
  const [guestsMap, setGuestsMap] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);

  useEffect(() => {
    const fetchGuests = async () => {
      try {
        const snapshot = await getDocs(collection(db, "guests"));
        const map = {};
        snapshot.docs.forEach((doc) => {
          map[doc.id] = doc.data().name;
        });
        setGuestsMap(map);
      } catch (err) {
        console.error("Error fetching guests:", err);
      }
    };

    fetchGuests();
  }, []);

  useEffect(() => {
    if (!currentUser) {
      navigate("/login");
      return;
    }

    const ordersQuery = query(
      collection(db, "orders"),
      orderBy("createdAt", "asc")
    );

    const unsubscribe = onSnapshot(ordersQuery, (snapshot) => {
      const allOrders = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate
          ? doc.data().createdAt.toDate()
          : new Date(),
      }));

      const visibleOrders = allOrders.filter(
        (order) => order.status === "pending"
      );

      setOrders(visibleOrders);
    });

    return () => unsubscribe();
  }, [currentUser, navigate]);

  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [orders]);

  const markAsServed = async (orderId) => {
    try {
      const confirm = window.confirm("Mark this order as served?");
      if (!confirm) return;

      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, { status: "served" });
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  };

  const deleteOrder = async (orderId) => {
    try {
      const confirm = window.confirm(
        "Are you sure you want to delete this order?"
      );
      if (!confirm) return;

      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);
    } catch (error) {
      console.error("Error deleting order:", error);
    }
  };

  return (
    <Box className="p-4" sx={{ maxHeight: "70vh", overflowY: "auto" }}>
      <Typography variant="h4" gutterBottom>
        Live Orders
      </Typography>

      {orders.length === 0 && (
        <Typography>No pending orders available.</Typography>
      )}

      <Stack spacing={2}>
        {orders.map((order) => (
          <Card key={order.id} elevation={3}>
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                <strong>Guest:</strong>{" "}
                {guestsMap[order.guestId] || "Unknown Guest"} ({order.guestId})
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Status:</strong> {order.status}
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                <strong>Ordered At:</strong> {order.createdAt.toLocaleString()}
              </Typography>

              <Typography variant="body1" gutterBottom>
                <strong>Items:</strong>
              </Typography>
              <ul style={{ marginTop: 0, paddingLeft: "1.25rem" }}>
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x {item.quantity} - ₹
                    {item.price * item.quantity}
                  </li>
                ))}
              </ul>

              <Typography
                variant="body2"
                color="primary"
                sx={{ marginTop: 1, whiteSpace: "pre-wrap" }}
              >
                <strong>Special Request:</strong>{" "}
                {order.customRequest
                  ? order.customRequest
                  : "Iss order pe koi special request nahi hai"}
              </Typography>
            </CardContent>

            <CardActions>
              <Button
                size="small"
                variant="contained"
                color="success"
                onClick={() => markAsServed(order.id)}
              >
                Mark as Served
              </Button>
              <Button
                size="small"
                variant="outlined"
                color="error"
                onClick={() => deleteOrder(order.id)}
              >
                Delete Order
              </Button>
            </CardActions>
          </Card>
        ))}

        <div ref={bottomRef} />
      </Stack>
    </Box>
  );
};

export default LiveOrders;
