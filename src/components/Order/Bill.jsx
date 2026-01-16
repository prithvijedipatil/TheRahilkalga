import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../services/firebase";
import { QRCodeCanvas, QRCodeSVG } from "qrcode.react";

const Bill = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const docRef = doc(db, "orders", orderId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setOrder(docSnap.data());
      }
    };
    fetchOrder();
  }, [orderId]);

  return (
    <div className="p-4">
      {order ? (
        <div>
          <h2 className="text-2xl font-bold mb-4">Bill for Order {orderId}</h2>
          <QRCodeCanvas
            value={`https://yourcafe.com/bills/${orderId}`}
            size={128}
            className="mb-4"
          />
          {/* Add bill details here */}
        </div>
      ) : (
        <p>Loading...</p>
      )}
    </div>
  );
};

export default Bill;
