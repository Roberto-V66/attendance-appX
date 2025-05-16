// scripts/importExcelToFirebase.js
import { db, collection, addDoc } from '$lib/firebase';
import XLSX from 'xlsx';
import fs from 'fs';

async function importExcelToFirebase(filePath, collectionName) {
  // Read Excel file
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);

  // Import to Firebase
  const batchSize = 500; // To prevent timeout
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    await Promise.all(batch.map(async (item) => {
      try {
        await addDoc(collection(db, collectionName), item);
        console.log(`Added record ${i}`);
      } catch (e) {
        console.error(`Error adding record ${i}:`, e);
      }
    }));
  }
  console.log('Import completed!');
}

// Usage: node scripts/importExcelToFirebase.js path/to/your/file.xlsx attendees
const [filePath, collectionName] = process.argv.slice(2);
importExcelToFirebase(filePath, collectionName);