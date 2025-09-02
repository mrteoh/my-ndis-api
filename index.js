const Koa = require("koa");
const Router = require("koa-router");
const bodyParser = require("koa-bodyparser");
const cors = require("@koa/cors");   // ✅ add this
const pool = require("./db"); // PostgreSQL connection pool

const app = new Koa();
const router = new Router();

// =======================
// Middleware
// =======================
app.use(cors({ origin: "http://localhost:3000" })); // ✅ allow frontend
app.use(bodyParser());

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
router.post("/invoices", async (ctx) => {
  const {
    support_item_number,
    support_item_name,
    registration_group_number,
    registration_group_name,
    support_category_number,
    support_category_number_pace,
    support_category_name,
    support_category_name_pace,
    unit,
    quote,
    start_date,
    end_date,
    act,
    nsw,
    nt,
    qld,
    sa,
    tas,
    vic,
    wa,
    remote,
    very_remote,
    non_face_to_face_support_provision,
    provider_travel,
    short_notice_cancellations,
    ndia_requested_reports,
    irregular_sil_supports,
    type,
  } = ctx.request.body;

  try {
    const result = await pool.query(
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
      ) RETURNING *`,
      [
        support_item_number,
        support_item_name,
        registration_group_number,
        registration_group_name,
        support_category_number,
        support_category_number_pace,
        support_category_name,
        support_category_name_pace,
        unit,
        quote,
        start_date,
        end_date,
        act,
        nsw,
        nt,
        qld,
        sa,
        tas,
        vic,
        wa,
        remote,
        very_remote,
        non_face_to_face_support_provision,
        provider_travel,
        short_notice_cancellations,
        ndia_requested_reports,
        irregular_sil_supports,
        type,
      ]
    );

    ctx.status = 201;
    ctx.body = result.rows[0];
  } catch (err) {
    console.error("❌ Error inserting invoice:", err);

    // Send full error details in response for debugging
    ctx.status = 500;
    ctx.body = {
      error: "Failed to create invoice",
      details: err.message,        // main error message
      stack: err.stack,            // useful during development
      code: err.code || null,      // e.g., Postgres error code
    };
  }
});

router.put("/invoices/:id", async (ctx) => {
    const { id } = ctx.params;
    const {
        support_item_number,
        support_item_name,
        registration_group_number,
        registration_group_name,
        support_category_number,
        support_category_number_pace,
        support_category_name,
        support_category_name_pace,
        unit,
        quote,
        start_date,
        end_date,
        act,
        nsw,
        nt,
        qld,
        sa,
        tas,
        vic,
        wa,
        remote,
        very_remote,
        non_face_to_face_support_provision,
        provider_travel,
        short_notice_cancellations,
        ndia_requested_reports,
        irregular_sil_supports,
        type,
    } = ctx.request.body;

    try {
        const result = await pool.query(
            `UPDATE invoices SET
                support_item_number = $1,
                support_item_name = $2,
                registration_group_number = $3,
                registration_group_name = $4,
                support_category_number = $5,
                support_category_number_pace = $6,
                support_category_name = $7,
                support_category_name_pace = $8,
                unit = $9,
                quote = $10,
                start_date = $11,
                end_date = $12,
                act = $13,
                nsw = $14,
                nt = $15,
                qld = $16,
                sa = $17,
                tas = $18,
                vic = $19,
                wa = $20,
                remote = $21,
                very_remote = $22,
                non_face_to_face_support_provision = $23,
                provider_travel = $24,
                short_notice_cancellations = $25,
                ndia_requested_reports = $26,
                irregular_sil_supports = $27,
                type = $28
            WHERE id = $29
            RETURNING *`,
            [
                support_item_number,
                support_item_name,
                registration_group_number,
                registration_group_name,
                support_category_number,
                support_category_number_pace,
                support_category_name,
                support_category_name_pace,
                unit,
                quote,
                start_date,
                end_date,
                act,
                nsw,
                nt,
                qld,
                sa,
                tas,
                vic,
                wa,
                remote,
                very_remote,
                non_face_to_face_support_provision,
                provider_travel,
                short_notice_cancellations,
                ndia_requested_reports,
                irregular_sil_supports,
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
            stack: err.stack,
            code: err.code || null,
        };
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
