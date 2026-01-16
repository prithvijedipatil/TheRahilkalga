import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 30 },
  header: { fontSize: 20, marginBottom: 20 },
  table: { display: "flex", flexDirection: "column" },
  row: {
    flexDirection: "row",
    borderBottom: "1px solid #EEE",
    padding: 5,
  },
});

const BillPDF = ({ orders, guest }) => (
  <Document>
    <Page style={styles.page}>
      <Text style={styles.header}>Bill Summary for {guest.name}</Text>
      <View style={styles.table}>
        <View style={styles.row}>
          <Text style={{ width: "50%" }}>Order ID</Text>
          <Text style={{ width: "25%" }}>Date</Text>
          <Text style={{ width: "25%" }}>Amount</Text>
        </View>
        {orders.map((order) => (
          <View style={styles.row} key={order.id}>
            <Text style={{ width: "50%" }}>{order.id}</Text>
            <Text style={{ width: "25%" }}>
              {order.createdAt.toLocaleDateString()}
            </Text>
            <Text style={{ width: "25%" }}>₹{order.total}</Text>
          </View>
        ))}
      </View>
    </Page>
  </Document>
);

export default BillPDF;
