function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export function buildResultsEmail(results) {
  const {
    compatibility = 0,
    compatibilityLabel = "",
    block1Matches = [],
    block2Matches = [],
    totalMatches = 0,
    totalQuestions = 0,
  } = results;

  const renderMatches = (matches) => {
    if (!matches.length) {
      return `
        <p style="color:#A0A0A0;margin:0;">
          No hubo coincidencias en este bloque.
        </p>
      `;
    }

    return `
      <ul style="padding-left:20px;color:#ffffff;line-height:1.7;margin:0;">
        ${matches
          .map(
            (item) => `
              <li style="margin-bottom:10px;">
                ${escapeHtml(item.question)}
                <span style="color:#b7a7ff;">
                  (${item.score1} + ${item.score2} = ${item.total})
                </span>
              </li>
            `
          )
          .join("")}
      </ul>
    `;
  };

  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tus resultados de Matches</title>
</head>

<body style="margin:0;background:#111111;font-family:Arial,Helvetica,sans-serif;padding:24px 12px;">

  <div style="
    max-width:650px;
    margin:0 auto;
    background:#1b1b1b;
    border:1px solid #333333;
    border-radius:18px;
    padding:36px 24px;
  ">

    <h1 style="
      margin:0;
      color:#ffffff;
      text-align:center;
      font-size:30px;
    ">
      💜 Matches
    </h1>

    <p style="
      text-align:center;
      color:#cfcfcf;
      margin:12px 0 0;
      font-size:16px;
    ">
      Estos son sus resultados.
    </p>

    <div style="
      margin:32px auto 12px;
      max-width:220px;
      padding:18px;
      background:#7c3aed;
      border-radius:14px;
      text-align:center;
      color:#ffffff;
    ">
      <div style="
        font-size:32px;
        font-weight:bold;
        line-height:1;
      ">
        ${compatibility}%
      </div>

      <div style="
        margin-top:10px;
        font-size:14px;
        line-height:1.4;
      ">
        ${escapeHtml(compatibilityLabel)}
      </div>
    </div>

    <p style="
      text-align:center;
      color:#a0a0a0;
      margin:14px 0 34px;
      font-size:14px;
    ">
      ${totalMatches} coincidencias de ${totalQuestions} preguntas
    </p>

    <h2 style="
      color:#ffffff;
      font-size:20px;
      margin:0 0 16px;
    ">
      Bloque 1
    </h2>

    ${renderMatches(block1Matches)}

    <hr style="
      margin:34px 0;
      border:none;
      border-top:1px solid #333333;
    ">

    <h2 style="
      color:#ffffff;
      font-size:20px;
      margin:0 0 16px;
    ">
      Bloque 2
    </h2>

    ${renderMatches(block2Matches)}

    <p style="
      margin:40px 0 0;
      font-size:13px;
      color:#999999;
      text-align:center;
      line-height:1.5;
    ">
      Gracias por usar Matches 💜
    </p>

  </div>

</body>
</html>
  `;
}
