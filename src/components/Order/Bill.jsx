import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";

const Bill = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", orderId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setOrder(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching order:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
          background:
            "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        background:
          "linear-gradient(135deg, rgba(102, 126, 234, 0.05) 0%, rgba(118, 75, 162, 0.05) 100%)",
        minHeight: "100vh",
      }}
    >
      {order ? (
        <Card
          sx={{
            maxWidth: 600,
            mx: "auto",
            border: "1px solid rgba(102, 126, 234, 0.2)",
            borderRadius: 2,
          }}
        >
          <CardContent>
            <Typography
              variant="h4"
              gutterBottom
              sx={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                fontWeight: "bold",
                textAlign: "center",
                mb: 3,
              }}
            >
              Bill for Order {orderId}
            </Typography>
            <Box sx={{ textAlign: "center", mb: 3 }}>
              <QRCodeCanvas
                value={`https://yourcafe.com/bills/${orderId}`}
                size={128}
              />
            </Box>
            {/* Add bill details here */}
            <Typography variant="body1" sx={{ mt: 2 }}>
              Order details will be displayed here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <Card sx={{ maxWidth: 600, mx: "auto" }}>
          <CardContent>
            <Typography variant="h6" color="error">
              Order not found
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default Bill;
