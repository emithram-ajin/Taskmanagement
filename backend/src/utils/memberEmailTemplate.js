const escapeHtml = (str = "") =>
    String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const FONT_STACK = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const getLoginLink = () => {
    return `https://doflow.in/`;
};

/* ------------------------------------------------------------------ */
/* HTML version - Corporate Professional                               */
/* ------------------------------------------------------------------ */
export const memberAddedTemplate = (user, password) => {
    const memberName = user.name || "Team Member";
    const loginLink = getLoginLink();

    const row = (label, value, last = false) => `
              <tr>
                <td width="35%" valign="middle" style="padding:14px 20px; background-color:#f8fafc; border-bottom:${last ? 'none' : '1px solid #e2e8f0'}; border-right:1px solid #e2e8f0; font-size:14px; font-weight:600; color:#334155;">${label}</td>
                <td width="65%" valign="middle" style="padding:14px 20px; background-color:#ffffff; border-bottom:${last ? 'none' : '1px solid #e2e8f0'}; font-size:14px; color:#0f172a; font-weight:500;">${value}</td>
              </tr>`;

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Welcome to TaskManager</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f7fa; font-family:${FONT_STACK}; color:#333333; -webkit-font-smoothing: antialiased;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f7fa; padding:40px 0;">
    <tr>
      <td align="center">
        <!-- Main Container -->
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="background-color:#ffffff; border-radius:8px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.05); width:100%; max-width:600px; text-align:left;">
          
          <!-- Header -->
          <tr>
            <td bgcolor="#1e293b" style="padding:30px 40px; text-align:center;">
              <h1 style="margin:0; color:#ffffff; font-size:24px; font-weight:600; letter-spacing:1px;">TaskManager</h1>
            </td>
          </tr>

          <!-- Body content -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 20px 0; font-size:20px; color:#1e293b; font-weight:600;">Welcome to the team!</h2>
              <p style="margin:0 0 15px 0; font-size:15px; line-height:1.6; color:#475569;">
                Dear ${escapeHtml(memberName)},
              </p>
              <p style="margin:0 0 30px 0; font-size:15px; line-height:1.6; color:#475569;">
                An administrator has added you to the system. You can now log in to your account. Your login details are provided below:
              </p>

              <!-- Credentials Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0; border-radius:6px; overflow:hidden;">
                ${row("Email", escapeHtml(user.email))}
                ${row("Password", escapeHtml(password))}
                ${row("Role", escapeHtml(user.role))}
                ${row("Department", escapeHtml(user.department) || "N/A", true)}
              </table>

              <p style="margin:30px 0 25px 0; font-size:15px; line-height:1.6; color:#475569;">
                Please log in and change your password as soon as possible to ensure your account remains secure.
              </p>

              <!-- Action Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(loginLink)}" target="_blank" style="display:inline-block; padding:14px 32px; background-color:#1e293b; color:#ffffff; font-size:15px; font-weight:bold; text-decoration:none; border-radius:6px; letter-spacing:0.5px;">
                      Log in to your account
                    </a>
                  </td>
                </tr>
              </table>
              
              <p style="margin:35px 0 0 0; font-size:15px; line-height:1.6; color:#475569;">
                Best regards,<br/>
                <strong style="color:#1e293b;">TaskManager Administration</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td bgcolor="#f8fafc" style="padding:24px 40px; border-top:1px solid #e2e8f0; text-align:center;">
              <p style="margin:0; font-size:13px; color:#64748b; line-height:1.6;">
                This is an automated security notification from TaskManager.<br/>
                Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

/* ------------------------------------------------------------------ */
/* Plain-text version                                                  */
/* ------------------------------------------------------------------ */
export const memberAddedText = (user, password) => {
    const memberName = user.name || "Team Member";
    const loginLink = getLoginLink();

    const lines = [
        "Welcome to TaskManager",
        "======================",
        "",
        `Dear ${memberName},`,
        "",
        "An administrator has added you to the system. You can now log in to your account. Your login details are provided below:",
        "",
        `Email     : ${user.email}`,
        `Password  : ${password}`,
        `Role      : ${user.role}`,
        `Department: ${user.department || "N/A"}`,
        "",
        "Please log in and change your password as soon as possible.",
        "",
        `You may log in to your account at: ${loginLink}`,
        "",
        "Best regards,",
        "TaskManager Administration",
        "",
        "--------------------------------------------------",
        "This is an automated notification from TaskManager.",
        "Please do not reply to this email."
    ];

    return lines.join("\n");
};
