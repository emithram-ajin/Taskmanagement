const escapeHtml = (str = "") =>
    String(str)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

const FONT_STACK = "'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

const formatDeadline = (deadline) =>
    new Date(deadline).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "long",
        year: "numeric",
    });

const getTaskLink = (task) => {
    return `https://doflow.in/`;
};

/* ------------------------------------------------------------------ */
/* HTML version - Corporate Professional                               */
/* ------------------------------------------------------------------ */
export const taskAssignedTemplate = (task) => {
    const assigneeName = task.assignee?.name || "Team Member";
    const assignedBy = task.createdBy?.name || "Administrator";
    const projectName = task.project?.projectName || "-";
    const deadline = formatDeadline(task.deadline);
    const taskLink = getTaskLink(task);

    const row = (label, value, last = false) => `
              <tr>
                <td width="35%" valign="top" style="padding:14px 20px; background-color:#f8fafc; border-bottom:${last ? 'none' : '1px solid #e2e8f0'}; border-right:1px solid #e2e8f0; font-size:14px; font-weight:600; color:#334155;">${label}</td>
                <td width="65%" valign="top" style="padding:14px 20px; background-color:#ffffff; border-bottom:${last ? 'none' : '1px solid #e2e8f0'}; font-size:14px; color:#0f172a; font-weight:500;">${value}</td>
              </tr>`;

    const linkParagraph = taskLink
        ? `
              <!-- Action Button -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td align="center">
                    <a href="${escapeHtml(taskLink)}" target="_blank" style="display:inline-block; padding:14px 32px; background-color:#1e293b; color:#ffffff; font-size:15px; font-weight:bold; text-decoration:none; border-radius:6px; letter-spacing:0.5px;">
                      View Task Dashboard
                    </a>
                  </td>
                </tr>
              </table>`
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Task Assignment Notification</title>
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
              <h2 style="margin:0 0 20px 0; font-size:20px; color:#1e293b; font-weight:600;">Task Assignment Notification</h2>
              <p style="margin:0 0 15px 0; font-size:15px; line-height:1.6; color:#475569;">
                Dear ${escapeHtml(assigneeName)},
              </p>
              <p style="margin:0 0 30px 0; font-size:15px; line-height:1.6; color:#475569;">
                This is to inform you that a new task has been assigned to you by ${escapeHtml(assignedBy)}. The details are given below:
              </p>

              <!-- Details Table -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="border:1px solid #e2e8f0; border-radius:6px; overflow:hidden;">
                ${row("Task Title", escapeHtml(task.title))}
                ${row("Project", escapeHtml(projectName))}
                ${row("Priority", escapeHtml(task.priority))}
                ${row("Deadline", escapeHtml(deadline))}
                ${row("Assigned By", escapeHtml(assignedBy))}
                ${row("Description", `<span style="white-space:pre-line; display:block; padding-top:4px; line-height:1.6;">${escapeHtml(task.description)}</span>`, true)}
              </table>

              <p style="margin:30px 0 25px 0; font-size:15px; line-height:1.6; color:#475569;">
                Kindly review the task and complete it on or before the deadline.
              </p>
              ${linkParagraph}
              
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
                This is an automated notification from TaskManager.<br/>
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
export const taskAssignedText = (task) => {
    const assigneeName = task.assignee?.name || "Team Member";
    const assignedBy = task.createdBy?.name || "Administrator";
    const taskLink = getTaskLink(task);

    const lines = [
        "TaskManager - Task Assignment",
        "=============================",
        "",
        `Dear ${assigneeName},`,
        "",
        `This is to inform you that a new task has been assigned to you by ${assignedBy}. The details are given below:`,
        "",
        `Task Title : ${task.title}`,
        `Project    : ${task.project?.projectName || "-"}`,
        `Priority   : ${task.priority}`,
        `Deadline   : ${formatDeadline(task.deadline)}`,
        `Assigned By: ${assignedBy}`,
        "",
        "Description:",
        task.description,
        "",
        "Kindly review the task and complete it on or before the deadline.",
    ];

    if (taskLink) {
        lines.push("", `You may view the task at: ${taskLink}`);
    }

    lines.push("", "Best regards,", "TaskManager Administration", "", "--------------------------------------------------", "This is an automated notification from TaskManager.");

    return lines.join("\n");
};

/* ------------------------------------------------------------------ */
/* Blocker Assigned HTML version                                       */
/* ------------------------------------------------------------------ */
export const blockerAssignedTemplate = (task) => {
    const assigneeName = task.blockerAssignee?.name || "Team Member";
    const assignedBy = task.assignee?.name || "Team Member";
    const projectName = task.project?.projectName || "-";
    const deadline = formatDeadline(task.deadline);
    const taskLink = getTaskLink(task);

    const linkParagraph = taskLink
        ? `<div style="margin-top: 24px;">
             <a href="${escapeHtml(taskLink)}" target="_blank" style="display:inline-block; padding:12px 24px; background-color:#ef4444; color:#ffffff; font-size:14px; font-weight:600; text-decoration:none; border-radius:4px;">
               View Task Details
             </a>
           </div>`
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Action Required: Task Blocker</title>
</head>
<body style="margin:0; padding:20px; font-family:${FONT_STACK}; color:#333333; background-color:#f9fafb;">
  <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 8px; border: 1px solid #e5e7eb; border-top: 4px solid #ef4444; padding: 32px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);">
    <h2 style="margin-top: 0; color: #111827; font-size: 20px;">🚨 Task Blocker Assigned</h2>
    
    <p style="font-size: 15px; color: #4b5563; line-height: 1.5; margin-bottom: 24px;">
      Hi ${escapeHtml(assigneeName)},<br><br>
      <strong>${escapeHtml(assignedBy)}</strong> has assigned you to resolve a blocker for the task <strong>"${escapeHtml(task.title)}"</strong> in project <strong>${escapeHtml(projectName)}</strong>.
    </p>

    <div style="background-color: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; margin-bottom: 24px; border-radius: 4px;">
      <h3 style="margin-top: 0; margin-bottom: 8px; font-size: 14px; color: #991b1b; text-transform: uppercase; letter-spacing: 0.5px;">Blocker Reason</h3>
      <p style="margin: 0; font-size: 15px; color: #7f1d1d; white-space: pre-line;">${escapeHtml(task.blockerReason)}</p>
    </div>
    
    <p style="font-size: 14px; color: #6b7280; margin-bottom: 24px;">
      <strong>Deadline:</strong> ${escapeHtml(deadline)}
    </p>

    ${linkParagraph}

    <hr style="border: 0; border-top: 1px solid #e5e7eb; margin: 32px 0 24px 0;" />
    
    <p style="font-size: 13px; color: #9ca3af; margin: 0;">
      This is an automated message from TaskManager. Please do not reply.
    </p>
  </div>
</body>
</html>`;
};

/* ------------------------------------------------------------------ */
/* Blocker Assigned Plain-text version                                 */
/* ------------------------------------------------------------------ */
export const blockerAssignedText = (task) => {
    const assigneeName = task.blockerAssignee?.name || "Team Member";
    const assignedBy = task.assignee?.name || "Team Member";
    const taskLink = getTaskLink(task);

    const lines = [
        "TaskManager - Task Blocker Assignment",
        "=====================================",
        "",
        `Dear ${assigneeName},`,
        "",
        `This is to inform you that a task blocker has been assigned to you by ${assignedBy}. The details are given below:`,
        "",
        `Task Title    : ${task.title}`,
        `Project       : ${task.project?.projectName || "-"}`,
        `Deadline      : ${formatDeadline(task.deadline)}`,
        `Assigned By   : ${assignedBy}`,
        "",
        "Blocker Reason:",
        task.blockerReason,
        "",
        "Kindly review the blocker and resolve it as soon as possible.",
    ];

    if (taskLink) {
        lines.push("", `You may view the task at: ${taskLink}`);
    }

    lines.push("", "Best regards,", "TaskManager Administration", "", "--------------------------------------------------", "This is an automated notification from TaskManager.");

    return lines.join("\n");
};