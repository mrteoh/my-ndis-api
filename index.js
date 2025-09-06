const importExcel = require("./importExcel");

const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");
const multer = require("@koa/multer"); // ✅ for file upload
const xlsx = require("xlsx");

const pool = require("./db"); // Your DB
const app = new Koa();
const router = new Router();

// =======================
// Middleware
// =======================
app.use(cors({ origin: "http://localhost:3000" })); // ✅ allow frontend
app.use(bodyParser());

// Setup multer (store in memory or uploads/)
const upload = multer({ dest: "uploads/" });

// =======================
// Routes
// =======================

// Get all invoices
router.get("/invoices", async (ctx) => {
  try {
    const result = await pool.query("SELECT * FROM invoices ORDER BY id ASC");
    ctx.body = result.rows;
  } catch (err) {
    console.error("❌ Error fetching invoices:", err);
    ctx.status = 500;
    ctx.body = { error: "Failed to fetch invoices" };
  }
});

// Get single invoice by ID
router.get("/invoices/:id", async (ctx) => {
  const { id } = ctx.params;
  try {
    const result = await pool.query("SELECT * FROM invoices WHERE id = $1", [
      id,
    ]);
    if (result.rows.length === 0) {
      ctx.status = 404;
      ctx.body = { error: "Invoice not found" };
    } else {
      ctx.body = result.rows[0];
    }
  } catch (err) {
    console.error("❌ Error fetching invoice:", err);
    ctx.status = 500;
    ctx.body = { error: "Failed to fetch invoice" };
  }
});

// Create new invoice
// Create new invoice
router.post("/invoices", async (ctx) => {
  const {
    support_category_number,
    support_category_name,
    start_date,
    end_date,
    support_item_number,
    support_item_name,
    registration_group_number,
    registration_group_name,
    max_rate,
    type,
    unit,
    invoice_rate,
    invoice_number,
    invoice_date,
  } = ctx.request.body;

  if (!support_item_name) {
    ctx.status = 400;
    ctx.body = { error: "support_item_name is required" };
    return;
  }

  // ✅ Validate start_date and end_date
  if (start_date && end_date) {
    const start = new Date(start_date);
    const end = new Date(end_date);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      ctx.status = 400;
      ctx.body = { error: "Invalid start_date or end_date format" };
      return;
    }
    if (start > end) {
      ctx.status = 400;
      ctx.body = { error: "start_date cannot be after end_date" };
      return;
    }
  }

  try {
    // ✅ Calculate invoice_amount
    const invoice_amount =
      unit && invoice_rate ? Number(unit) * Number(invoice_rate) : null;

    const result = await pool.query(
      `INSERT INTO invoices (
        support_category_number,
        support_category_name,
        start_date,
        end_date,
        support_item_number,
        support_item_name,
        registration_group_number,
        registration_group_name,
        max_rate,
        type,
        unit,
        invoice_rate,
        invoice_number,
        invoice_date,
        invoice_amount,
        created_at
      ) VALUES (
        $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
        $11,$12,$13,$14,$15,$16
      ) RETURNING *`,
      [
        support_category_number,
        support_category_name,
        start_date,
        end_date,
        support_item_number,
        support_item_name,
        registration_group_number,
        registration_group_name,
        max_rate,
        type,
        unit,
        invoice_rate,
        invoice_number,
        invoice_date || new Date(), // fallback if not provided
        invoice_amount,
        new Date(), // created_at
      ]
    );

    ctx.status = 201;
    ctx.body = {
      message: "✅ Invoice inserted successfully",
      invoice: result.rows[0],
    };
  } catch (err) {
    console.error("❌ Error inserting invoice:", err);
    ctx.status = 500;
    ctx.body = {
      error: "Failed to create invoice",
      details: err.message,
      code: err.code || null,
    };
  }
});


router.put("/invoices/:id", async (ctx) => {
  const { id } = ctx.params;
  const {
    unit,
    invoice_rate,
    invoice_number,
    invoice_amount,
    support_category_number,
    support_category_name,
    start_date,
    end_date,
    support_item_number,
    support_item_name,
    registration_group_number,
    registration_group_name,
    max_rate,
    type,
  } = ctx.request.body;

  try {
    const result = await pool.query(
      `UPDATE invoices SET
        unit = $1,
        invoice_rate = $2,
        invoice_number = $3,
        invoice_amount = $4,
        support_category_number = $5,
        support_category_name = $6,
        start_date = $7,
        end_date = $8,
        support_item_number = $9,
        support_item_name = $10,
        registration_group_number = $11,
        registration_group_name = $12,
        max_rate = $13,
        type = $14
      WHERE id = $15
      RETURNING *`,
      [
        unit,
        invoice_rate,
        invoice_number,
        invoice_amount,
        support_category_number,
        support_category_name,
        start_date,
        end_date,
        support_item_number,
        support_item_name,
        registration_group_number,
        registration_group_name,
        max_rate,
        type,
        id,
      ]
    );

    if (result.rows.length === 0) {
      ctx.status = 404;
      ctx.body = { error: "Invoice not found" };
    } else {
      ctx.body = result.rows[0];
    }
  } catch (err) {
    console.error("❌ Error updating invoice:", err);
    ctx.status = 500;
    ctx.body = {
      error: "Failed to update invoice",
      details: err.message,
      code: err.code || null,
    };
  }
});

// Upload XLSX Route
router.post("/upload-xlsx", upload.single("file"), async (ctx) => {
  try {
    if (!ctx.file) {
      ctx.status = 400;
      ctx.body = { error: "No file uploaded" };
      return;
    }

    // Read XLSX file
    const workbook = xlsx.readFile(ctx.file.path);
    const sheetName = workbook.SheetNames[0]; // first sheet
    const sheet = workbook.Sheets[sheetName];
    const rows = xlsx.utils.sheet_to_json(sheet);

    if (rows.length === 0) {
      ctx.status = 400;
      ctx.body = { error: "XLSX file is empty" };
      return;
    }

    // =========================
    // Bulk Insert into invoices
    // =========================
    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      for (const row of rows) {
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
            irregular_sil_supports, type
          ) VALUES (
            $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,
            $11,$12,$13,$14,$15,$16,$17,$18,$19,$20,
            $21,$22,$23,$24,$25,$26,$27,$28
          )`,
          [
            row.support_item_number || null,
            row.support_item_name || null,
            row.registration_group_number || null,
            row.registration_group_name || null,
            row.support_category_number || null,
            row.support_category_number_pace || null,
            row.support_category_name || null,
            row.support_category_name_pace || null,
            row.unit || null,
            row.quote || null,
            row.start_date ? new Date(row.start_date) : null,
            row.end_date ? new Date(row.end_date) : null,
            row.act || null,
            row.nsw || null,
            row.nt || null,
            row.qld || null,
            row.sa || null,
            row.tas || null,
            row.vic || null,
            row.wa || null,
            row.remote || null,
            row.very_remote || null,
            row.non_face_to_face_support_provision || null,
            row.provider_travel || null,
            row.short_notice_cancellations || null,
            row.ndia_requested_reports || null,
            row.irregular_sil_supports || null,
            row.type || null,
          ]
        );
      }

      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }

    ctx.body = {
      fileName: ctx.file.originalname,
      totalTransactions: rows.length,
      message: "✅ Invoices inserted successfully",
    };
  } catch (err) {
    console.error("❌ Error processing XLSX:", err);
    ctx.status = 500;
    ctx.body = { error: "Failed to process XLSX", details: err.message };
  }
});

// Delete invoice
router.delete("/invoices/:id", async (ctx) => {
  const { id } = ctx.params;

  try {
    const result = await pool.query("DELETE FROM invoices WHERE id = $1 RETURNING *", [id]);

    if (result.rows.length === 0) {
      ctx.status = 404;
      ctx.body = { error: "Invoice not found" };
    } else {
      ctx.body = {
        message: "✅ Invoice deleted successfully",
        deletedInvoice: result.rows[0],
      };
    }
  } catch (err) {
    console.error("❌ Error deleting invoice:", err);
    ctx.status = 500;
    ctx.body = { error: "Failed to delete invoice", details: err.message };
  }
});


app.use(router.routes()).use(router.allowedMethods());

// =======================
// Start server
// =======================
const PORT = 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
