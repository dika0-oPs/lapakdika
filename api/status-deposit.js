import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');

  const { id, email } = req.query;
  const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';

  if (!id || !email) {
    return res.status(400).json({ success: false, message: "PARAM_MISSING" });
  }

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    return res.status(500).json({ success: false, message: "ENV_MISSING" });
  }

  try {
    const target = `https://fupei-pedia.web.id/h2h/deposit/status?id=${id}&apikey=${apiKey}`;
    const check = await fetch(target);
    const result = await check.json();

    if (!result || !result.success || !result.data || result.data.status !== 'success') {
      return res.status(200).json({
        success: false,
        message: "DEPOSIT_NOT_SUCCESS_YET",
        raw: result
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });
    }

    const { data: alreadyProcessed, error: logError } = await supabase
      .from('deposits_log')
      .select('id')
      .eq('deposit_id', id)
      .maybeSingle();

    if (logError && logError.code !== 'PGRST116') throw logError;

    const amountToAdd = parseInt(result.data.get_balance || 0);
    const currentBal = parseInt(user.balance || 0);

    if (!alreadyProcessed) {
      const newBalance = currentBal + amountToAdd;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ balance: newBalance })
        .eq('email', cleanEmail);

      if (updateError) throw updateError;

      const { error: insertError } = await supabase
        .from('deposits_log')
        .insert([{
          deposit_id: id,
          email: cleanEmail,
          amount: amountToAdd
        }]);

      if (insertError) throw insertError;
    }

    return res.status(200).json({
      success: true,
      status: 'success',
      nominal: result.data.nominal,
      added: amountToAdd,
      processed: !alreadyProcessed
    });

  } catch (e) {
    return res.status(500).json({ 
      success: false, 
      message: "SERVER_ERROR", 
      error: e.message 
    });
  }
}
