import { Router, Request, Response } from "express";
import rateLimit from "express-rate-limit";
import { prisma } from "../lib/prisma";

export const emergencyPublicRouter = Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

emergencyPublicRouter.use(limiter);

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderHtml(data: {
  fullName: string;
  dob: Date | null;
  gender: string | null;
  bloodType: string | null;
  allergies: string[];
  conditions: string[];
  contacts: Array<{ name: string; phone: string; relationship?: string | null }>;
  notes: string | null;
}): string {
  const dob = data.dob
    ? new Date(data.dob).toLocaleDateString("vi-VN")
    : "—";
  const listItems = (arr: string[], empty: string) =>
    arr.length === 0
      ? `<li class="empty">${empty}</li>`
      : arr.map((a) => `<li>${escapeHtml(a)}</li>`).join("");

  const contactItems = data.contacts.length === 0
    ? `<li class="empty">Chưa có liên hệ khẩn cấp</li>`
    : data.contacts
        .map(
          (c) => `<li>
            <strong>${escapeHtml(c.name)}</strong>
            ${c.relationship ? ` <span class="muted">(${escapeHtml(c.relationship)})</span>` : ""}
            <br><a href="tel:${escapeHtml(c.phone)}">${escapeHtml(c.phone)}</a>
          </li>`
        )
        .join("");

  return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="robots" content="noindex, nofollow" />
  <title>Thẻ khẩn cấp — ${escapeHtml(data.fullName)}</title>
  <style>
    * { box-sizing: border-box; }
    body {
      margin: 0;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      background: linear-gradient(180deg, #F0F9FF 0%, #F8FAFB 100%);
      color: #1E293B;
      padding: 24px 16px;
      min-height: 100vh;
    }
    .card {
      max-width: 480px;
      margin: 0 auto;
      background: white;
      border-radius: 20px;
      padding: 24px;
      box-shadow: 0 10px 40px rgba(14, 165, 233, 0.12);
    }
    .banner {
      background: #EF4444;
      color: white;
      padding: 10px 16px;
      border-radius: 10px;
      font-weight: 600;
      text-align: center;
      margin-bottom: 20px;
      letter-spacing: 0.5px;
      font-size: 13px;
    }
    h1 { margin: 0; font-size: 24px; }
    h2 { margin: 24px 0 8px; font-size: 14px; color: #0284C7; text-transform: uppercase; letter-spacing: 0.8px; }
    .row { display: flex; justify-content: space-between; margin-top: 8px; font-size: 14px; }
    .row .k { color: #64748B; }
    .row .v { font-weight: 600; }
    ul { padding-left: 18px; margin: 4px 0; font-size: 15px; line-height: 1.6; }
    .empty { color: #94A3B8; font-style: italic; list-style: none; padding-left: 0; }
    .muted { color: #64748B; font-weight: 400; }
    a { color: #0EA5E9; }
    .footer { text-align: center; margin-top: 24px; color: #94A3B8; font-size: 12px; }
    .disclaimer { margin-top: 16px; padding: 12px; background: #FEF3C7; border-radius: 10px; font-size: 12px; color: #92400E; }
  </style>
</head>
<body>
  <div class="card">
    <div class="banner">🚨 EMERGENCY MEDICAL CARD</div>
    <h1>${escapeHtml(data.fullName)}</h1>
    <div class="row"><span class="k">Ngày sinh</span><span class="v">${dob}</span></div>
    <div class="row"><span class="k">Giới tính</span><span class="v">${escapeHtml(data.gender ?? "—")}</span></div>
    <div class="row"><span class="k">Nhóm máu</span><span class="v">${escapeHtml(data.bloodType ?? "—")}</span></div>

    <h2>Dị ứng</h2>
    <ul>${listItems(data.allergies, "Không có dị ứng được ghi nhận")}</ul>

    <h2>Bệnh nền</h2>
    <ul>${listItems(data.conditions, "Không có bệnh nền được ghi nhận")}</ul>

    <h2>Liên hệ khẩn cấp</h2>
    <ul>${contactItems}</ul>

    ${data.notes ? `<h2>Ghi chú</h2><p style="font-size:14px;line-height:1.6;margin:4px 0;">${escapeHtml(data.notes)}</p>` : ""}

    <div class="disclaimer">⚕️ Thông tin chỉ mang tính tham khảo. Vui lòng tham khảo bác sĩ chuyên khoa trước khi ra quyết định y tế.</div>
    <div class="footer">HealthGuard · ${new Date().toLocaleString("vi-VN")}</div>
  </div>
</body>
</html>`;
}

emergencyPublicRouter.get("/:token", async (req: Request, res: Response) => {
  const token = String(req.params.token);
  const card = await prisma.emergencyCard.findUnique({
    where: { publicToken: token },
    include: { profile: true },
  });

  if (!card || card.tokenRevokedAt) {
    res.setHeader("X-Robots-Tag", "noindex, nofollow");
    if (req.accepts("html")) {
      return res
        .status(404)
        .type("html")
        .send("<!DOCTYPE html><html><body style=\"font-family:sans-serif;text-align:center;padding:40px;\"><h1>404</h1><p>Thẻ khẩn cấp không tồn tại hoặc đã bị thu hồi.</p></body></html>");
    }
    return res.status(404).json({ error: "Not found" });
  }

  res.setHeader("X-Robots-Tag", "noindex, nofollow");

  if (req.accepts("json") && !req.accepts("html")) {
    return res.json({
      fullName: card.profile.fullName,
      dob: card.profile.dob,
      gender: card.profile.gender,
      bloodType: card.profile.bloodType,
      allergies: card.allergies,
      conditions: card.conditions,
      contacts: card.contacts,
      notes: card.notes,
    });
  }

  res.type("html").send(
    renderHtml({
      fullName: card.profile.fullName,
      dob: card.profile.dob,
      gender: card.profile.gender,
      bloodType: card.profile.bloodType,
      allergies: card.allergies,
      conditions: card.conditions,
      contacts: card.contacts as any,
      notes: card.notes,
    })
  );
});
