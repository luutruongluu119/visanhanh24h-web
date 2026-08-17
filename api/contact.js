// Vercel Serverless Function — nhan du lieu tu form lien-he.html va gui mail qua Resend.
// Can bien moi truong RESEND_API_KEY tren Vercel (Settings > Environment Variables).
// Khong can domain rieng: dung dia chi gui mac dinh cua Resend (onboarding@resend.dev),
// gui toi hop thu that cua cong ty.

const TO_EMAIL = "visa@skywaytravel.vn";
const FROM_EMAIL = "Visa Nhanh 24h Website <onboarding@resend.dev>";

function escapeHtml(str) {
  return String(str || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const body = req.body || {};
  const name = (body.name || "").trim();
  const phone = (body.phone || "").trim();
  const visaType = (body["visa-type"] || "").trim();
  const note = (body.note || "").trim();

  if (!name || !phone) {
    res.status(400).json({ error: "Thieu ho ten hoac so dien thoai" });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error("RESEND_API_KEY chua duoc cau hinh tren Vercel");
    res.status(500).json({ error: "Server chua cau hinh gui mail" });
    return;
  }

  try {
    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [TO_EMAIL],
        subject: `[Website] Yeu cau tu van moi: ${name}`,
        html: `
          <h2>Yêu cầu tư vấn mới từ website</h2>
          <p><b>Họ tên:</b> ${escapeHtml(name)}</p>
          <p><b>Số điện thoại:</b> ${escapeHtml(phone)}</p>
          <p><b>Loại visa quan tâm:</b> ${escapeHtml(visaType || "Chưa rõ")}</p>
          <p><b>Ghi chú:</b> ${escapeHtml(note || "(không có)")}</p>
          <hr>
          <p style="color:#888;font-size:12px;">Gửi tự động từ form Liên hệ trên visanhanh24h.com</p>
        `,
      }),
    });

    if (!resendRes.ok) {
      const errText = await resendRes.text();
      console.error("Resend API error:", resendRes.status, errText);
      res.status(502).json({ error: "Gui mail that bai" });
      return;
    }

    res.status(200).json({ ok: true });
  } catch (err) {
    console.error("Loi khi goi Resend API:", err);
    res.status(500).json({ error: "Loi server" });
  }
}
