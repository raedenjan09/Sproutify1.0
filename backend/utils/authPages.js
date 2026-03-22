const APP_NAME = process.env.APP_NAME || 'Sproutify';
const APP_LINK = process.env.APP_LINK || 'sproutify://';

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderLayout({ title, subtitle, body, tone = 'success' }) {
  const accent = tone === 'error' ? '#B94B32' : '#2F6B3B';
  const accentSoft = tone === 'error' ? '#FDECE8' : '#E8F2E8';

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)} | ${escapeHtml(APP_NAME)}</title>
    <style>
      :root {
        color-scheme: light;
        --bg: #f6f3eb;
        --surface: #ffffff;
        --border: #e5ddcf;
        --text: #1f2a1f;
        --muted: #617161;
        --accent: ${accent};
        --accent-soft: ${accentSoft};
      }

      * {
        box-sizing: border-box;
      }

      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 24px;
        background:
          radial-gradient(circle at top left, rgba(255,255,255,0.9), transparent 32%),
          linear-gradient(180deg, #f7f5ef 0%, var(--bg) 100%);
        color: var(--text);
        font-family: "Segoe UI", system-ui, sans-serif;
      }

      .card {
        width: 100%;
        max-width: 480px;
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 28px;
        padding: 28px;
        box-shadow: 0 18px 50px rgba(34, 42, 34, 0.08);
      }

      .badge {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        min-width: 54px;
        height: 54px;
        padding: 0 18px;
        border-radius: 999px;
        background: var(--accent-soft);
        color: var(--accent);
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }

      h1 {
        margin: 16px 0 8px;
        font-size: 30px;
        line-height: 1.1;
      }

      p {
        margin: 0;
        color: var(--muted);
        line-height: 1.65;
      }

      .stack {
        display: grid;
        gap: 16px;
        margin-top: 24px;
      }

      .button,
      button {
        width: 100%;
        min-height: 52px;
        border: 0;
        border-radius: 16px;
        background: var(--accent);
        color: #ffffff;
        font: inherit;
        font-weight: 700;
        text-decoration: none;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }

      .button.secondary {
        background: transparent;
        border: 1px solid var(--border);
        color: var(--text);
      }

      label {
        display: block;
        font-weight: 700;
        margin-bottom: 8px;
      }

      input {
        width: 100%;
        min-height: 52px;
        padding: 0 16px;
        border-radius: 16px;
        border: 1px solid var(--border);
        background: #fbfaf7;
        font: inherit;
        color: var(--text);
      }

      .notice {
        padding: 14px 16px;
        border-radius: 16px;
        background: #fbfaf7;
        border: 1px solid var(--border);
        color: var(--muted);
      }

      .notice.error {
        background: #fdf0ed;
        border-color: #f1d0c8;
        color: #a6472f;
      }
    </style>
  </head>
  <body>
    <main class="card">
      <div class="badge">${escapeHtml(APP_NAME)}</div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(subtitle)}</p>
      ${body}
    </main>
  </body>
</html>`;
}

function renderStatusPage({ title, message, tone = 'success', primaryLabel = 'Open App', primaryHref = APP_LINK }) {
  return renderLayout({
    title,
    subtitle: message,
    tone,
    body: `
      <div class="stack">
        <a class="button" href="${escapeHtml(primaryHref)}">${escapeHtml(primaryLabel)}</a>
        <a class="button secondary" href="/">Back to API</a>
      </div>
    `,
  });
}

function renderResetPasswordPage({ token }) {
  const escapedAppName = escapeHtml(APP_NAME);
  const escapedAppLink = escapeHtml(APP_LINK);

  return renderLayout({
    title: 'Reset your password',
    subtitle: `Enter a new password for your ${APP_NAME} account.`,
    body: `
      <form id="reset-form" class="stack">
        <div>
          <label for="password">New password</label>
          <input id="password" name="password" type="password" minlength="6" required placeholder="At least 6 characters" />
        </div>
        <div id="notice" class="notice">This link works for a limited time for your security.</div>
        <button type="submit">Update Password</button>
        <a class="button secondary" href="${escapedAppLink}">Open ${escapedAppName}</a>
      </form>
      <script>
        const form = document.getElementById('reset-form');
        const notice = document.getElementById('notice');

        form.addEventListener('submit', async (event) => {
          event.preventDefault();

          const password = document.getElementById('password').value;
          notice.className = 'notice';
          notice.textContent = 'Updating your password...';

          try {
            const response = await fetch(window.location.pathname, {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ password })
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
              throw new Error(data.message || 'Password reset failed.');
            }

            notice.className = 'notice';
            notice.textContent = data.message || 'Password updated successfully. You can return to the app now.';
          } catch (error) {
            notice.className = 'notice error';
            notice.textContent = error.message || 'Password reset failed.';
          }
        });
      </script>
    `,
  });
}

module.exports = {
  renderResetPasswordPage,
  renderStatusPage,
};
