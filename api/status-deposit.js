import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  const { id, email } = req.query;

  try {
    const { data: log } = await supabase
      .from('deposits_log')
      .select('*')
      .eq('deposit_id', id)
      .maybeSingle();

    if (log && log.status === 'success') {
      return res.status(200).json({ success: true, message: "ALREADY_PROCESSED", added: log.amount });
    }

    const target = `https://fupei-pedia.web.id/h2h/deposit/status?id=${id}&apikey=Fupei-pedia-mqmcszpvfzr984hi`;
    const check = await fetch(target);
    const result = await check.json();

    if (result.success && result.data.status === 'success') {
      const cleanEmail = email.trim().toLowerCase();
      const amountToAdd = parseInt(result.data.get_balance);

      const { data: user } = await supabase
        .from('profiles')
        .select('balance')
        .eq('email', cleanEmail)
        .maybeSingle();

      if (user) {
        const newBalance = (parseInt(user.balance) || 0) + amountToAdd;

        await supabase.from('profiles').update({ balance: newBalance }).eq('email', cleanEmail);

        await supabase.from('deposits_log')
          .update({ status: 'success' })
          .eq('deposit_id', id);

        return res.status(200).json({ 
          success: true, 
          message: "BALANCE_UPDATED", 
          added: amountToAdd 
        });
      }
    }

    return res.status(200).json({ success: false, message: "PENDING_OR_FAILED" });

  } catch (e) {
    return res.status(500).json({ success: false, error: e.message });
  }
}
