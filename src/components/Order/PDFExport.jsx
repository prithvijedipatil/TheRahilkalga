import jsPDF from "jspdf";
import "jspdf-autotable";

const exportToPDF = (orders, guestName, totalBill) => {
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(20);

  doc.text(`The Rahil's Hostel Tirthan`, 14, 15);
  doc.setFontSize(18);
  doc.text(`Bill Summary for ${guestName}`, 20, 21);

  // Prepare table data
  const tableData = [];
  orders.forEach((order) => {
    order.items.forEach((item) => {
      tableData.push([
        item.name,
        item.quantity,
        order.createdAt?.toLocaleString(),
        `₹${item.price * item.quantity}`,
      ]);
    });
  });

  // Add table
  doc.autoTable({
    head: [["Item Name", "Quantity", "Order Date & Time", "Item Total"]],
    body: tableData,
    startY: 25,
  });

  // Add total bill
  doc.setFontSize(14);
  doc.text(
    `Total Bill: ₹${totalBill}, With GST 5%:₹${totalBill * 1.05} `,
    14,
    doc.autoTable.previous.finalY + 10
  );

  // Save PDF
  doc.save(`bill-${guestName}.pdf`);
};

export default exportToPDF;
