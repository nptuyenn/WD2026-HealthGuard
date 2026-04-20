import { Router, Request, Response } from "express";
import QRCode from "qrcode";
import { prisma } from "../lib/prisma";

const router = Router();

// ── HTML form served to the "doctor" ──────────────────────────────────────
const FORM_HTML = `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Phiếu Kết Quả Khám — HealthGuard</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#f0f4f8;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:24px 12px}
  .card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:760px;width:100%;padding:36px}
  .logo{display:flex;align-items:center;gap:10px;margin-bottom:28px}
  .logo-icon{width:36px;height:36px;background:#0ea5e9;border-radius:8px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:16px}
  h1{font-size:20px;color:#0f172a;font-weight:700}
  .subtitle{font-size:13px;color:#64748b;margin-top:2px}
  .section{margin-top:24px}
  .section-title{font-size:13px;font-weight:600;color:#0ea5e9;text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;padding-bottom:6px;border-bottom:1px solid #e2e8f0}
  .accordion-title{display:flex;align-items:center;justify-content:space-between;cursor:pointer;user-select:none;font-size:13px;font-weight:600;color:#0ea5e9;text-transform:uppercase;letter-spacing:.6px;padding-bottom:6px;border-bottom:1px solid #e2e8f0;margin-bottom:0}
  .accordion-title:hover{color:#0284c7}
  .accordion-chevron{font-size:16px;transition:transform .2s;display:inline-block;color:#94a3b8}
  .accordion-body{overflow:hidden;transition:max-height .25s ease,opacity .2s ease;max-height:0;opacity:0}
  .accordion-body.open{max-height:600px;opacity:1}
  .accordion-body-inner{padding-top:12px}
  .row{display:grid;grid-template-columns:1fr 1fr;gap:14px}
  .row-lab{display:grid;grid-template-columns:3fr 1fr 1fr 2fr;gap:10px;margin-bottom:10px;align-items:end}
  .row-rx{display:grid;grid-template-columns:2fr 1fr 2fr;gap:10px;margin-bottom:10px;align-items:end}
  .col-head{font-size:11px;font-weight:600;color:#94a3b8;text-transform:uppercase;letter-spacing:.5px;padding-bottom:4px}
  .col-heads-lab{display:grid;grid-template-columns:3fr 1fr 1fr 2fr;gap:10px;margin-bottom:6px}
  .col-heads-rx{display:grid;grid-template-columns:2fr 1fr 2fr;gap:10px;margin-bottom:6px}
  .field{display:flex;flex-direction:column;gap:4px;margin-bottom:12px}
  label{font-size:12px;font-weight:500;color:#475569}
  input,textarea{border:1px solid #e2e8f0;border-radius:8px;padding:10px 12px;font-size:14px;color:#0f172a;outline:none;transition:border-color .15s;font-family:inherit}
  textarea{resize:vertical;min-height:72px}
  input:focus,textarea:focus{border-color:#0ea5e9}
  input::placeholder,textarea::placeholder{color:#94a3b8}
  .bp-row{display:grid;grid-template-columns:1fr auto 1fr;gap:8px;align-items:center}
  .bp-sep{font-size:22px;color:#94a3b8;text-align:center;padding-top:16px}
  .opt-label{font-size:11px;color:#94a3b8;margin-left:4px;font-weight:400;text-transform:none;letter-spacing:0}
  .submit-btn{width:100%;margin-top:28px;background:#0ea5e9;color:#fff;border:none;border-radius:10px;padding:14px;font-size:15px;font-weight:600;cursor:pointer;transition:background .15s}
  .submit-btn:hover{background:#0284c7}
  @media(max-width:600px){.row,.row-lab,.row-rx,.col-heads-lab,.col-heads-rx{grid-template-columns:1fr}.col-head{display:none}}
</style>
</head>
<body>
<div class="card">
  <div class="logo">
    <div class="logo-icon">HG</div>
    <div>
      <div style="font-size:16px;font-weight:700;color:#0f172a">HealthGuard</div>
      <div class="subtitle">Phiếu kết quả khám bệnh</div>
    </div>
  </div>

  <form method="POST" action="/exam">
    <div class="section">
      <div class="section-title">Thông tin bác sĩ</div>
      <div class="row">
        <div class="field">
          <label>Tên bác sĩ</label>
          <input name="doctorName" placeholder="BS. Nguyễn Văn A" />
        </div>
        <div class="field">
          <label>Tên phòng khám</label>
          <input name="clinicName" placeholder="Phòng khám Đa khoa ABC" />
        </div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Chẩn đoán <span class="opt-label">(tùy chọn)</span></div>
      <div class="field">
        <textarea name="diagnosis" placeholder="Ví dụ: Tăng huyết áp độ 1, theo dõi đường huyết..."></textarea>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Chỉ số sinh tồn <span class="opt-label">(bỏ trống nếu không đo)</span></div>

      <div class="field">
        <label>Huyết áp (mmHg)</label>
        <div class="bp-row">
          <input name="bp_sys" type="number" placeholder="Tâm thu — 120" min="60" max="250" />
          <div class="bp-sep">/</div>
          <input name="bp_dia" type="number" placeholder="Tâm trương — 80" min="40" max="150" />
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>Đường huyết (mg/dL)</label>
          <input name="glucose" type="number" step="0.1" placeholder="95" min="20" max="600" />
        </div>
        <div class="field">
          <label>Cân nặng (kg)</label>
          <input name="weight" type="number" step="0.1" placeholder="65" min="1" max="300" />
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>Nhịp tim (bpm)</label>
          <input name="heart_rate" type="number" placeholder="72" min="30" max="250" />
        </div>
        <div class="field">
          <label>SpO2 (%)</label>
          <input name="spo2" type="number" step="0.1" placeholder="98" min="50" max="100" />
        </div>
      </div>

      <div class="row">
        <div class="field">
          <label>Nhiệt độ (°C)</label>
          <input name="temperature" type="number" step="0.1" placeholder="36.5" min="30" max="45" />
        </div>
      </div>
    </div>

    <div class="section">
      <div class="accordion-title" onclick="toggle('lab')">
        Kết quả xét nghiệm <span class="opt-label">(tùy chọn, tối đa 4)</span>
        <span class="accordion-chevron" id="chev-lab">▼</span>
      </div>
      <div class="accordion-body" id="body-lab">
        <div class="accordion-body-inner">
          <div class="col-heads-lab">
            <div class="col-head">Tên xét nghiệm</div>
            <div class="col-head">Giá trị</div>
            <div class="col-head">Đơn vị</div>
            <div class="col-head">Tham chiếu (VD: &lt;200)</div>
          </div>
          ${[1, 2, 3, 4].map(i => `
          <div class="row-lab">
            <input name="lab${i}_name" placeholder="Ví dụ: Cholesterol toàn phần" />
            <input name="lab${i}_value" type="number" step="0.01" placeholder="5.2" />
            <input name="lab${i}_unit" placeholder="mmol/L" />
            <input name="lab${i}_ref" placeholder="&lt; 5.2" />
          </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="accordion-title" onclick="toggle('rx')">
        Đơn thuốc <span class="opt-label">(tùy chọn, tối đa 4)</span>
        <span class="accordion-chevron" id="chev-rx">▼</span>
      </div>
      <div class="accordion-body" id="body-rx">
        <div class="accordion-body-inner">
          <div class="col-heads-rx">
            <div class="col-head">Tên thuốc</div>
            <div class="col-head">Liều dùng</div>
            <div class="col-head">Hướng dẫn sử dụng</div>
          </div>
          ${[1, 2, 3, 4].map(i => `
          <div class="row-rx">
            <input name="rx${i}_name" placeholder="Ví dụ: Amlodipine" />
            <input name="rx${i}_dosage" placeholder="5 mg" />
            <input name="rx${i}_instructions" placeholder="1 viên/ngày, uống buổi sáng" />
          </div>`).join("")}
        </div>
      </div>
    </div>

    <div class="section">
      <div class="accordion-title" onclick="toggle('appt')">
        Lịch tái khám <span class="opt-label">(tùy chọn)</span>
        <span class="accordion-chevron" id="chev-appt">▼</span>
      </div>
      <div class="accordion-body" id="body-appt">
        <div class="accordion-body-inner">
          <div class="field">
            <label>Tiêu đề</label>
            <input name="appt_title" placeholder="Tái khám nội khoa" />
          </div>
          <div class="row">
            <div class="field">
              <label>Ngày</label>
              <input name="appt_date" type="date" />
            </div>
            <div class="field">
              <label>Giờ</label>
              <input name="appt_time" type="time" value="08:00" />
            </div>
          </div>
          <div class="field">
            <label>Địa điểm</label>
            <input name="appt_location" placeholder="Phòng 203, tầng 2" />
          </div>
        </div>
      </div>
    </div>

    <button type="submit" class="submit-btn">Tạo mã QR →</button>
  </form>
</div>
<script>
  function toggle(id) {
    const body = document.getElementById('body-' + id);
    const chev = document.getElementById('chev-' + id);
    const open = body.classList.toggle('open');
    chev.style.transform = open ? 'rotate(180deg)' : 'rotate(0deg)';
  }
</script>
</body>
</html>`;

function successHtml(qrDataUrl: string, doctorName: string, clinicName: string) {
  return `<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Mã QR Kết Quả Khám — HealthGuard</title>
<style>
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',system-ui,sans-serif;background:#f0f4f8;min-height:100vh;display:flex;align-items:flex-start;justify-content:center;padding:24px 12px}
  .card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);max-width:420px;width:100%;padding:32px;text-align:center}
  .check{width:56px;height:56px;background:#dcfce7;border-radius:50%;display:flex;align-items:center;justify-content:center;margin:0 auto 16px;font-size:26px}
  h1{font-size:20px;font-weight:700;color:#0f172a}
  .sub{font-size:14px;color:#64748b;margin-top:6px}
  .qr-wrap{background:#f8fafc;border-radius:12px;padding:20px;margin:24px 0;display:inline-block;width:100%}
  .qr-wrap img{width:220px;height:220px;display:block;margin:0 auto}
  .meta{font-size:13px;color:#475569;margin-top:12px}
  .meta strong{color:#0f172a}
  .expire{font-size:12px;color:#f59e0b;margin-top:8px}
  .steps{text-align:left;background:#f0f9ff;border-radius:10px;padding:16px 20px;margin-top:8px}
  .steps p{font-size:13px;color:#0369a1;margin-bottom:6px}
  .steps p:last-child{margin-bottom:0}
  .new-btn{display:inline-block;margin-top:20px;padding:12px 24px;background:#0ea5e9;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}
</style>
</head>
<body>
<div class="card">
  <div class="check">✓</div>
  <h1>Phiếu khám đã tạo!</h1>
  <div class="sub">Yêu cầu bệnh nhân quét mã QR dưới đây.</div>

  <div class="qr-wrap">
    <img src="${qrDataUrl}" alt="QR Code" />
    <div class="meta">
      ${doctorName ? `<strong>${doctorName}</strong>` : ""}
      ${clinicName ? ` — ${clinicName}` : ""}
    </div>
    <div class="expire">⏱ Mã hết hạn sau 24 giờ</div>
  </div>

  <div class="steps">
    <p>📱 Mở app HealthGuard</p>
    <p>📷 Nhấn <strong>Quét QR</strong> ở màn hình chính</p>
    <p>✅ Xác nhận nhập dữ liệu</p>
  </div>

  <a href="/exam/new" class="new-btn">Tạo phiếu mới</a>
</div>
</body>
</html>`;
}

const toNum = (v: unknown): number | null => {
  if (typeof v !== "string" || !v.trim()) return null;
  const n = parseFloat(v);
  return Number.isFinite(n) ? n : null;
};

// GET /exam/new → HTML form for doctor
router.get("/new", (_req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(FORM_HTML);
});

// POST /exam → save result, return QR page
router.post("/", async (req: Request, res: Response) => {
  const body = req.body as Record<string, string>;
  const {
    doctorName, clinicName, diagnosis,
    bp_sys, bp_dia, glucose, weight, heart_rate, spo2, temperature,
    appt_title, appt_date, appt_time, appt_location,
  } = body;

  const metrics: any[] = [];
  const sys = toNum(bp_sys), dia = toNum(bp_dia);
  if (sys !== null && dia !== null) metrics.push({ metricType: "blood_pressure", valueNum: sys, valueNum2: dia, unit: "mmHg" });

  const glu = toNum(glucose);
  if (glu !== null) metrics.push({ metricType: "glucose", valueNum: glu, unit: "mg/dL" });

  const w = toNum(weight);
  if (w !== null) metrics.push({ metricType: "weight", valueNum: w, unit: "kg" });

  const hr = toNum(heart_rate);
  if (hr !== null) metrics.push({ metricType: "heart_rate", valueNum: hr, unit: "bpm" });

  const sp = toNum(spo2);
  if (sp !== null) metrics.push({ metricType: "spo2", valueNum: sp, unit: "%" });

  const temp = toNum(temperature);
  if (temp !== null) metrics.push({ metricType: "temperature", valueNum: temp, unit: "°C" });

  const labResults: any[] = [];
  for (const i of [1, 2, 3, 4]) {
    const name = body[`lab${i}_name`]?.trim();
    const value = toNum(body[`lab${i}_value`]);
    const unit = body[`lab${i}_unit`]?.trim();
    const ref = body[`lab${i}_ref`]?.trim();
    if (name && value !== null) {
      labResults.push({ name, value, unit: unit || "", referenceRange: ref || null });
    }
  }

  const prescription: any[] = [];
  for (const i of [1, 2, 3, 4]) {
    const name = body[`rx${i}_name`]?.trim();
    const dosage = body[`rx${i}_dosage`]?.trim();
    const instructions = body[`rx${i}_instructions`]?.trim();
    if (name) {
      prescription.push({ name, dosage: dosage || null, instructions: instructions || null });
    }
  }

  let appointment: any = null;
  if (appt_title && appt_date) {
    const time = appt_time || "08:00";
    appointment = {
      title: appt_title,
      scheduledAt: new Date(`${appt_date}T${time}:00`).toISOString(),
      doctorName: doctorName || null,
      location: appt_location || null,
    };
  }

  const expiresAt = new Date(Date.now() + 24 * 3600 * 1000);
  const exam = await prisma.examResult.create({
    data: {
      doctorName: doctorName || null,
      clinicName: clinicName || null,
      diagnosis: diagnosis || null,
      metrics,
      labResults,
      prescription,
      appointment,
      expiresAt,
    },
  });

  const qrDataUrl = await QRCode.toDataURL(`HG_EXAM:${exam.token}`, { width: 256, margin: 2, color: { dark: "#0f172a", light: "#ffffff" } });

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(successHtml(qrDataUrl, doctorName || "", clinicName || ""));
});

// GET /api/v1/exam/:token → mobile fetches exam data
router.get("/:token", async (req: Request, res: Response) => {
  const token = String(req.params.token);
  const exam = await prisma.examResult.findUnique({ where: { token } });
  if (!exam) return res.status(404).json({ error: "Không tìm thấy kết quả khám." });
  if (new Date() > exam.expiresAt) return res.status(410).json({ error: "Mã QR đã hết hạn (24h)." });
  return res.json(exam);
});

export default router;
