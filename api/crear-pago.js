export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Método no permitido' });

  const { sessionId, userId } = req.body;

  if (!sessionId || !userId) {
    return res.status(400).json({ error: 'Faltan sessionId o userId' });
  }

  const appUrl = 'https://matches.com.ar';

  const preference = {
    items: [
      {
        id: 'sexmatch-unlock',
        title: 'Sex Match — Resultados completos',
        description: 'Desbloqueá todas las coincidencias y el segundo bloque de preguntas',
        quantity: 1,
        currency_id: 'ARS',
        unit_price: 100,
      },
    ],
    external_reference: sessionId,
    back_urls: {
      success: `${appUrl}/?pago=ok&sesion=${sessionId}&uid=${userId}`,
      failure: `${appUrl}/?pago=error&sesion=${sessionId}&uid=${userId}`,
      pending: `${appUrl}/?pago=pendiente&sesion=${sessionId}&uid=${userId}`,
    },
    auto_return: 'approved',
    metadata: { sessionId, userId },
  };

  try {
    const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.MP_ACCESS_TOKEN}`,
      },
      body: JSON.stringify(preference),
    });

    const data = await mpRes.json();

    if (!mpRes.ok) {
      console.error('MP error:', JSON.stringify(data));
      return res.status(500).json({ error: 'Error al crear preferencia', detail: data });
    }

 const url = data.init_point;
return res.status(200).json({ url, preferenceId: data.id });

  } catch (err) {
    console.error('Error servidor:', err.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
}
