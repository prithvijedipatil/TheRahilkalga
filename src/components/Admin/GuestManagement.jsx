import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Grid,
} from "@mui/material";
import { db } from "../../services/firebase";

const GuestManagement = () => {
  const [guests, setGuests] = useState([]);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [confirmDialog, setConfirmDialog] = useState({
    open: false,
    guestId: null,
  });

  const fetchGuests = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "guests"));
      const guestList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setGuests(guestList);
    } catch (error) {
      console.error("Error fetching guests:", error);
      alert("Failed to fetch guests");
    }
  };

  useEffect(() => {
    fetchGuests();
  }, []);

  const addGuest = async () => {
    if (!name || !phone) return alert("Please fill all fields");

    try {
      await addDoc(collection(db, "guests"), {
        name,
        phone,
        isActive: true,
        createdAt: new Date(),
      });
      alert("Guest added successfully!");
      setName("");
      setPhone("");
      fetchGuests();
    } catch (error) {
      console.error("Error adding guest:", error);
      alert("Failed to add guest");
    }
  };

  const confirmRemoveGuest = (guestId) => {
    setConfirmDialog({ open: true, guestId });
  };

  const removeGuest = async () => {
    try {
      await deleteDoc(doc(db, "guests", confirmDialog.guestId));
      alert("Guest removed successfully!");
      setConfirmDialog({ open: false, guestId: null });
      fetchGuests();
    } catch (error) {
      console.error("Error deleting guest:", error);
      alert("Failed to remove guest. Please try again.");
    }
  };

  return (
    <Box
      sx={{
        p: 3,
        background:
          "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
        minHeight: "calc(100vh - 64px)",
        borderRadius: 2,
      }}
    >
      <Typography
        variant="h4"
        gutterBottom
        sx={{
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontWeight: "bold",
          mb: 3,
        }}
      >
        Guest Management
      </Typography>

      <Card
        sx={{
          mb: 4,
          border: "1px solid rgba(102, 126, 234, 0.2)",
          borderRadius: 2,
        }}
      >
        <CardContent sx={{ pb: 3 }}>
          <Typography
            variant="h6"
            gutterBottom
            sx={{ color: "#667eea", fontWeight: "bold" }}
          >
            Add New Guest
          </Typography>
          <Box display="flex" gap={2} mt={2}>
            <TextField
              label="Guest Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              fullWidth
            />
            <TextField
              label="Phone Number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              fullWidth
            />
            <Button
              variant="contained"
              onClick={addGuest}
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
              }}
            >
              Add Guest
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Button variant="outlined" onClick={fetchGuests} sx={{ mb: 3 }}>
        Retrieve Guests
      </Button>

      <Typography
        variant="h5"
        gutterBottom
        sx={{ color: "#667eea", fontWeight: "bold" }}
      >
        All Guests
      </Typography>

      <Grid container spacing={2}>
        {guests.map((guest) => (
          <Grid item xs={12} md={6} lg={4} key={guest.id}>
            <Card
              sx={{
                backgroundColor: guest.isActive ? "inherit" : "#f0f0f0",
                opacity: guest.isActive ? 1 : 0.6,
                border: "1px solid rgba(102, 126, 234, 0.2)",
                borderRadius: 2,
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 8px 24px rgba(102, 126, 234, 0.15)",
                  transform: "translateY(-4px)",
                },
              }}
            >
              <CardContent>
                <Typography variant="h6" sx={{ fontWeight: "bold" }}>
                  {guest.name}
                </Typography>
                <Typography color="textSecondary">{guest.phone}</Typography>
                {!guest.isActive && (
                  <Typography color="error" variant="body2">
                    Checked Out
                  </Typography>
                )}
              </CardContent>
              {guest.isActive && (
                <CardActions>
                  <Button
                    variant="outlined"
                    color="error"
                    onClick={() => confirmRemoveGuest(guest.id)}
                  >
                    Check Out
                  </Button>
                </CardActions>
              )}
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog
        open={confirmDialog.open}
        onClose={() => setConfirmDialog({ open: false, guestId: null })}
      >
        <DialogTitle>Confirm Checkout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to remove this guest permanently?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setConfirmDialog({ open: false, guestId: null })}
          >
            Cancel
          </Button>
          <Button color="error" onClick={removeGuest}>
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GuestManagement;
