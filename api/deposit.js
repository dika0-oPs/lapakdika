import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { nominal, email } = req.query;
  const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';

  if (!nominal || !email) {
    return res.status(400).json({ success: false, message: "DATA_TIDAK_LENGKAP" });
  }

  try {
    const target = `https://fupei-pedia.web.id/h2h/deposit/create?nominal=${nominal}&apikey=${apiKey}&metode=QRISFAST`;
    const response = await fetch(target);
    const result = await response.json();

    if (result.success) {
      await supabase.from('deposits_log').insert([{
        deposit_id: result.data.id,
        email: email.trim().toLowerCase(),
        amount: parseInt(result.data.get_balance),
        status: 'pending'
      }]);

      return res.status(200).json(result);
    }
    
    return res.status(400).json(result);

  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}
