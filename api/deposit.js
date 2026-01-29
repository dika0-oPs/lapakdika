import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id, email } = req.query;
  const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';

  if (!id || !email) {
    return res.status(400).json({ success: false, message: "ID_ATAU_EMAIL_KOSONG" });
  }

  try {
    const target = `https://fupei-pedia.web.id/h2h/deposit/status?id=${id}&apikey=${apiKey}`;
    const response = await fetch(target);
    const result = await response.json();

    if (result.success && result.data.status === 'success') {
      const cleanEmail = email.trim().toLowerCase();
      
      const { data: user } = await supabase
        .from('profiles')
        .select('balance')
        .eq('email', cleanEmail)
        .single();

      if (user) {
        const { data: sudahAda } = await supabase
          .from('deposits_log')
          .select('id')
          .eq('deposit_id', id)
          .eq('status', 'success')
          .single();

        if (!sudahAda) {
          const amountToAdd = parseInt(result.data.get_balance);
          const newBalance = parseInt(user.balance || 0) + amountToAdd;

          await supabase
            .from('profiles')
            .update({ balance: newBalance })
            .eq('email', cleanEmail);

          await supabase
            .from('deposits_log')
            .upsert({ 
              deposit_id: id, 
              email: cleanEmail, 
              status: 'success',
              amount: amountToAdd 
            }, { onConflict: 'deposit_id' });

          res.setHeader('Access-Control-Allow-Origin', '*');
          return res.status(200).json({ 
            success: true, 
            status: 'success', 
            added: amountToAdd 
          });
        }
      }
    }
    
    res.setHeader('Access-Control-Allow-Origin', '*');
    return res.status(200).json(result);

  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}
