import React, { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../services/firebase";
import {
  Button,
  Typography,
  Box,
  CircularProgress,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Paper,
  TableContainer,
  Stack,
  useTheme,
  useMediaQuery,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";

const DataAnalysis = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [totalOrders, setTotalOrders] = useState(0);
  const [totalRevenue, setTotalRevenue] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    const fetchOrders = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, "orders"));
        const ordersData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }));
        setOrders(ordersData);
      } catch (err) {
        setError("Failed to fetch orders");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const countItemFrequency = (ordersSubset) => {
    const freq = {};
    ordersSubset.forEach((order) => {
      order.items.forEach((item) => {
        freq[item.name] = (freq[item.name] || 0) + item.quantity;
      });
    });
    return freq;
  };

  const filterOrdersByMonth = (orders, month, year) => {
    return orders.filter(
      (order) =>
        order.createdAt.getMonth() === month &&
        order.createdAt.getFullYear() === year
    );
  };

  const handleMostOrdered = () => {
    if (!orders.length) return;

    const monthOrders = filterOrdersByMonth(
      orders,
      selectedMonth,
      selectedYear
    );
    const freqMonth = countItemFrequency(monthOrders);
    const sortDesc = (obj) => Object.entries(obj).sort((a, b) => b[1] - a[1]);

    setResult({
      type: "Most Ordered Items",
      month: sortDesc(freqMonth),
    });

    const totalCount = monthOrders.length;
    const totalRev = monthOrders.reduce((sum, order) => sum + order.total, 0);
    setTotalOrders(totalCount);
    setTotalRevenue(totalRev);
  };

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const getYearOptions = () => {
    const years = new Set();
    orders.forEach((order) => {
      if (order.createdAt) years.add(order.createdAt.getFullYear());
    });
    return Array.from(years).sort((a, b) => b - a);
  };

  return (
    <Box sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
      <Typography variant="h4" gutterBottom align="center">
        Data Analysis
      </Typography>

      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        justifyContent="center"
        alignItems={{ xs: "stretch", sm: "center" }}
        mb={3}
      >
        <FormControl size="small" sx={{ minWidth: 160 }}>
          <InputLabel>Select Month</InputLabel>
          <Select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            label="Select Month"
          >
            {monthNames.map((month, index) => (
              <MenuItem key={index} value={index}>
                {month}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel>Select Year</InputLabel>
          <Select
            value={selectedYear || 2025}
            onChange={(e) => setSelectedYear(Number(e.target.value))}
            label="Select Year"
          >
            {getYearOptions().map((year) => (
              <MenuItem key={year} value={year}>
                {year}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button variant="contained" color="primary" onClick={handleMostOrdered}>
          Show Most Ordered Items
        </Button>
      </Stack>

      {loading && (
        <Box display="flex" justifyContent="center" mt={3}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Typography color="error" textAlign="center">
          {error}
        </Typography>
      )}

      {result && (
        <Box mt={4}>
          <Typography variant="h5" gutterBottom align="center">
            {result.type} - {monthNames[selectedMonth]} {selectedYear}
          </Typography>

          <Typography align="center" sx={{ mb: 4 }}>
            Total Orders: <strong>{totalOrders}</strong>| Total Revenue: ₹
            <strong>{totalRevenue}</strong>
          </Typography>

          {result.month.length === 0 ? (
            <Typography>No orders in this month.</Typography>
          ) : (
            <Box sx={{ mb: 6 }}>
              <TableContainer component={Paper} sx={{ overflowX: "auto" }}>
                <Table size={isMobile ? "small" : "medium"}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Item</TableCell>
                      <TableCell>Frequency</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {result.month.map(([item, freq]) => (
                      <TableRow key={item}>
                        <TableCell>{item}</TableCell>
                        <TableCell>{freq}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default DataAnalysis;
