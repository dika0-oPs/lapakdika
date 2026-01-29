import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  
  const { id, email } = req.query;
  const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';

  if (!id || !email) {
    return res.status(400).json({ success: false, message: "PARAM_MISSING" });
  }

  try {
    const target = `https://fupei-pedia.web.id/h2h/deposit/status?id=${id}&apikey=${apiKey}`;
    const check = await fetch(target);
    const result = await check.json();

    if (!result.success || result.data.status !== 'success') {
      return res.status(200).json({
        success: false,
        message: "STATUS_NOT_SUCCESS",
        data: result.data
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const { data: alreadyProcessed, error: logError } = await supabase
      .from('deposits_log')
      .select('deposit_id')
      .eq('deposit_id', id)
      .maybeSingle();

    if (logError) throw logError;

    if (alreadyProcessed) {
      return res.status(200).json({
        success: false,
        message: "ALREADY_PROCESSED"
      });
    }

    const { data: user, error: userError } = await supabase
      .from('profiles')
      .select('balance')
      .eq('email', cleanEmail)
      .maybeSingle();

    if (userError) throw userError;
    if (!user) {
      return res.status(404).json({ success: false, message: "USER_NOT_FOUND" });
    }

    const amountToAdd = parseInt(result.data.get_balance);
    const currentBal = parseInt(user.balance || 0);
    const newBalance = currentBal + amountToAdd;

    const { error: updateError } = await supabase
      .from('profiles')
      .update({ balance: newBalance })
      .eq('email', cleanEmail);

    if (updateError) throw updateError;

    await supabase.from('deposits_log').insert([{
      deposit_id: id,
      email: cleanEmail,
      amount: amountToAdd
    }]);

    return res.status(200).json({
      success: true,
      message: "BALANCE_UPDATED",
      new_balance: newBalance,
      added: amountToAdd
    });

  } catch (e) {
    return res.status(500).json({ 
      success: false, 
      error: e.message 
    });
  }
}
