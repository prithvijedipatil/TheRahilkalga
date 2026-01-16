import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AdminDashboard from "../components/Admin/AdminDashboard"; // Fixed path
import GuestManagement from "../components/Admin/GuestManagement"; // Fixed path
import MenuManagement from "../components/Admin/MenuManagement"; // Fixed path
import OrderPlacement from "../components/Order/OrderPlacement"; // Fixed path
import LiveOrders from "../components/Order/LiveOrders"; // Fixed path
import Login from "../components/Auth/Login";

import UserBills from "../components/Order/UserBills";
import DataAnalysis from "../components/Order/DataAnalysis";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="guest-management" element={<GuestManagement />} />
          <Route path="menu-management" element={<MenuManagement />} />
          <Route path="place-order" element={<OrderPlacement />} />
          <Route path="live-orders" element={<LiveOrders />} />
          <Route path="bill" element={<UserBills />} />
          <Route path="analysis" element={<DataAnalysis />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;
