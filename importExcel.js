const XLSX = require("xlsx");
const dayjs = require("dayjs");
const pool = require("./db");

async function importExcel(filePath) {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(sheet);

    console.log(`Found ${rows.length} rows. Importing...`);

    const client = await pool.connect();

    for (let row of rows) {
      const rawStart = row["Start date"] ? String(row["Start date"]).trim() : null;
      const rawEnd = row["End Date"] ? String(row["End Date"]).trim() : null;
      const rawInvoiceDate = row["Invoice Date"] ? String(row["Invoice Date"]).trim() : null;

      const startDate =
        rawStart && dayjs(rawStart, ["YYYYMMDD", "DD/MM/YYYY", "YYYY-MM-DD"], true).isValid()
          ? dayjs(rawStart, ["YYYYMMDD", "DD/MM/YYYY", "YYYY-MM-DD"], true).format("YYYY-MM-DD")
          : null;

      const endDate =
        rawEnd && dayjs(rawEnd, ["YYYYMMDD", "DD/MM/YYYY", "YYYY-MM-DD"], true).isValid()
          ? dayjs(rawEnd, ["YYYYMMDD", "DD/MM/YYYY", "YYYY-MM-DD"], true).format("YYYY-MM-DD")
          : null;

      const invoiceDate =
        rawInvoiceDate && dayjs(rawInvoiceDate, ["YYYYMMDD", "DD/MM/YYYY", "YYYY-MM-DD"], true).isValid()
          ? dayjs(rawInvoiceDate, ["YYYYMMDD", "DD/MM/YYYY", "YYYY-MM-DD"], true).format("YYYY-MM-DD")
          : null;

      await client.query(
        `INSERT INTO invoices (
          support_item_number, support_item_name,
          registration_group_number, registration_group_name,
          support_category_number, support_category_number_pace,
          support_category_name, support_category_name_pace,
          unit, quote, start_date, end_date,
          act, nsw, nt, qld, sa, tas, vic, wa,
          remote, very_remote,
          non_face_to_face_support_provision, provider_travel,
          short_notice_cancellations, ndia_requested_reports,
          irregular_sil_supports, type,
          invoice_date, invoice_amount, invoice_rate, invoice_number, max_rate, created_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
          $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
          $21,$22,$23,$24,$25,$26,$27,$28,
          $29,$30,$31,$32,$33,NOW()
        )`,
        [
          row["Support Item Number"] || null,
          row["Support Item Name"] || null,
          row["Registration Group Number"] || null,
          row["Registration Group Name"] || null,
          row["Support Category Number"] || null,
          row["Support Category Number (PACE)"] || null,
          row["Support Category Name"] || null,
          row["Support Category Name (PACE)"] || null,
          row["Unit"] || null,
          row["Quote"] || null,
          startDate,
          endDate,
          row["ACT"] || null,
          row["NSW"] || null,
          row["NT"] || null,
          row["QLD"] || null,
          row["SA"] || null,
          row["TAS"] || null,
          row["VIC"] || null,
          row["WA"] || null,
          row["Remote"] || null,
          row["Very Remote"] || null,
          row["Non-Face-to-Face Support Provision"] || null,
          row["Provider Travel"] || null,
          row["Short Notice Cancellations."] || null,
          row["NDIA Requested Reports"] || null,
          row["Irregular SIL Supports"] || null,
          row["Type"] || null,
          invoiceDate,
          row["Invoice Amount"] || null,
          row["Invoice Rate"] || null,
          row["Invoice Number"] || null,
          row["Max Rate"] || null
          // created_at uses NOW()
        ]
      );
    }

    client.release();
    console.log("✅ Import completed successfully!");
    return { total: rows.length };
  } catch (err) {
    console.error("❌ Import failed:", err);
    throw err;
  }
}

module.exports = importExcel;
