// Vercel serverless function — adds email to Brevo contact list.
// Required env vars (set in Vercel project settings):
//   BREVO_API_KEY  — your Brevo API v3 key
//   BREVO_LIST_ID  — numeric ID of the list to add subscribers to
//
// Until env vars are set, the endpoint returns a friendly 200 in dev
// so the form still works for demo purposes.

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let email;
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    email = (body?.email || '').trim().toLowerCase();
  } catch {
    return res.status(400).json({ error: 'Invalid JSON body' });
  }

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Please enter a valid email address.' });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = process.env.BREVO_LIST_ID;

  // Graceful fallback while Brevo isn't wired up yet.
  if (!apiKey || !listId) {
    console.log('[subscribe] Brevo not configured yet. Email captured:', email);
    return res.status(200).json({
      message: "You're on the list. We'll be in touch Friday ☕",
      note: 'Brevo not configured — set BREVO_API_KEY and BREVO_LIST_ID in Vercel.'
    });
  }

  try {
    const brevoRes = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'content-type': 'application/json',
        'api-key': apiKey
      },
      body: JSON.stringify({
        email,
        listIds: [Number(listId)],
        updateEnabled: true
      })
    });

    if (brevoRes.ok || brevoRes.status === 204) {
      return res.status(200).json({ message: "You're in. Check your inbox Friday ☕" });
    }

    const errData = await brevoRes.json().catch(() => ({}));
    // Brevo returns 400 with code 'duplicate_parameter' when contact already exists.
    if (errData?.code === 'duplicate_parameter') {
      return res.status(200).json({ message: "You're already on the list ☕" });
    }
    console.error('[subscribe] Brevo error:', brevoRes.status, errData);
    return res.status(502).json({ error: 'Could not subscribe right now. Please try again.' });
  } catch (err) {
    console.error('[subscribe] Unexpected error:', err);
    return res.status(500).json({ error: 'Server error. Please try again.' });
  }
}
