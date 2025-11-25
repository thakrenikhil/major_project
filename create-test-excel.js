const XLSX = require("xlsx");
const fs = require("fs");

const data = [
  {
    name: "John Doe",
    email: "john.doe@example.com",
    password: "John@1234",
    parents_name: "Jane Doe",
    mobile: "9876543210",
    address: "123 Main St, Pune",
    govt_id: "123456789012",
    govt_id_type: "Aadhaar",
  },
  {
    name: "Jane Smith",
    email: "jane.smith@example.com",
    password: "Jane@5678",
    parents_name: "Robert Smith",
    mobile: "9876501234",
    address: "456 Oak Ave, Nagpur",
    govt_id: "ABCDE1234F",
    govt_id_type: "PAN",
  },
  {
    name: "Rahul Verma",
    email: "rahul.verma@example.com",
    password: "Rahul@9999",
    parents_name: "Suresh Verma",
    mobile: "9876123456",
    address: "789 MG Road, Mumbai",
    govt_id: "987654321098",
    govt_id_type: "Aadhaar",
  },
];

const worksheet = XLSX.utils.json_to_sheet(data);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Students");

const filePath = "./students_test.xlsx";
XLSX.writeFile(workbook, filePath);

console.log(`✅ Test Excel file created: ${filePath}`);
