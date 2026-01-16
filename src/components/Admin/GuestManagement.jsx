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
    <Box p={2}>
      <Typography variant="h4" gutterBottom>
        Guest Management
      </Typography>

      <Box display="flex" gap={2} mb={4}>
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
        <Button variant="contained" onClick={addGuest}>
          Add Guest
        </Button>
      </Box>

      <Button variant="outlined" onClick={fetchGuests} sx={{ mb: 3 }}>
        Retrieve Guests
      </Button>

      <Typography variant="h5" gutterBottom>
        All Guests
      </Typography>

      <Grid container spacing={2}>
        {guests.map((guest) => (
          <Grid item xs={12} md={6} lg={4} key={guest.id}>
            <Card
              sx={{
                backgroundColor: guest.isActive ? "inherit" : "#f0f0f0",
                opacity: guest.isActive ? 1 : 0.6,
              }}
            >
              <CardContent>
                <Typography variant="h6">{guest.name}</Typography>
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
