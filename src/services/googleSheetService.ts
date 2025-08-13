import Papa from 'papaparse'; // Import PapaParse

// ไม่ต้องใช้ gapi-script อีกต่อไป
// const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID'; // <--- ไม่ต้องใช้แล้ว
// const API_KEY = 'YOUR_GOOGLE_API_KEY'; // <--- ไม่ต้องใช้แล้ว

// URL พื้นฐานจาก "เผยแพร่ไปยังเว็บ" ของคุณ
// ให้คัดลอกส่วน "https://docs.google.com/spreadsheets/d/e/..." จากลิงก์ที่ได้มา
const PUBLISHED_URL_BASE = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQi9kca7xTx_QmHs5c4zvxgfRnRDVVKYBm-gUkXdHahpNo9IClFdyzpZnePzVSyrfC-ssU59NJiRFGu';
// ตัวอย่าง: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vS4vR-xR...';

// สร้าง Map เพื่อจับคู่ชื่อชีตกับ GID ของมัน
// GID คือ ID ของแต่ละ Tab ในชีต สามารถดูได้จาก URL ตอนที่คุณเปิดชีตนั้นๆ (ตรง ...&gid=XXXXXXXX)
// ชีตแรกสุดปกติจะเป็น gid=0
const SHEET_GIDS = {
  'Summary': '0',
  'Campaign 1': '998218441', // <--- ใส่ GID ของชีต Campaign 1
  'Campaign 2': '1372471406', // <--- ใส่ GID ของชีต Campaign 2
  'Campaign 3': '927765979', // <--- ใส่ GID ของชีต Campaign 2
  'Campaign 4': '1844093623', // <--- ใส่ GID ของชีต Campaign 2
  'Campaign 5': '900329987', // <--- ใส่ GID ของชีต Campaign 2

};

/**
 * แปลงข้อความ CSV เป็น array 2 มิติ (string[][])
 * @param csvText ข้อความที่ได้จากการ fetch
 * @returns Array 2 มิติของข้อมูล
 */
const parseCsv = (csvText: string): string[][] => {
  const results = Papa.parse(csvText, {
    header: false,
    skipEmptyLines: true // จะช่วยข้ามบรรทัดว่างเปล่า เช่น ",,,,,,,,,,,,,"
  });

  if (results.errors.length > 0) {
    console.error("PapaParse errors:", results.errors);
  }

  const dataRows = results.data as string[][];

  // ค้นหาแถวที่เป็น header จริงๆ ที่มีคำว่า 'No' อยู่ในคอลัมน์แรก
  const headerIndex = dataRows.findIndex(row => row.length > 0 && row[0] === 'No');

  // ถ้าไม่เจอ header หรือ header อยู่แถวแรกสุด (index 0) ให้เริ่มข้อมูลที่ index 1
  // ถ้าเจอ header ให้เริ่มข้อมูลหลังจาก header ไป 1 แถว
  const startIndex = headerIndex !== -1 ? headerIndex + 1 : 0; // ถ้าไม่เจอ 'No', ก็ถือว่าแถวแรกเป็นข้อมูล

  // กรองข้อมูลตั้งแต่ startIndex ไปจนจบ
  const actualData = dataRows.slice(startIndex).filter(row => row.length > 1 && row[0] !== ''); // กรองแถวว่างเปล่าอีกครั้งเผื่อมี

  return actualData;
};

/**
 * ฟังก์ชันสำหรับดึงข้อมูลจากชีตที่เผยแพร่เป็น CSV
 * @param sheetName ชื่อของชีตที่ต้องการดึงข้อมูล (เช่น 'Summary')
 * @returns Promise<string[][]>
 */
const fetchData = async (sheetName: keyof typeof SHEET_GIDS): Promise<string[][]> => {
  const gid = SHEET_GIDS[sheetName];
  console.log("gid", gid, sheetName)
  if (!gid) {
    throw new Error(`Sheet name "${sheetName}" not found in SHEET_GIDS map.`);
  }

  // สร้าง URL ที่สมบูรณ์สำหรับดึงข้อมูล CSV
  const url = `${PUBLISHED_URL_BASE}/pub?gid=${gid}&single=true&output=csv`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`);
    }
    const csvText = await response.text();
    console.log("csvText", csvText)
    return parseCsv(csvText);
  } catch (error) {
    console.error('Error fetching data from published Google Sheet:', error);
    throw error; // ส่ง error ต่อเพื่อให้ component ที่เรียกใช้จัดการ
  }
};

export { fetchData };