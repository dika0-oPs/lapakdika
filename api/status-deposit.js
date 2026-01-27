import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    const { id, email } = req.query;
    const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';

    try {
        const check = await fetch(`https://Fupei-Pedia.web.id/h2h/deposit/status?id=${id}`, {
            headers: { 'X-APIKEY': apiKey }
        });
        const result = await check.json();

        if (result.success && result.data.status === 'success') {
            const { data: user } = await supabase.from('profiles').select('balance').eq('email', email).single();
            const currentBalance = user ? user.balance : 0;
            const newBalance = currentBalance + result.data.get_balance;

            const { error } = await supabase.from('profiles').update({ balance: newBalance }).eq('email', email);

            if (!error) {
                return res.status(200).json({ 
                    success: true, 
                    status: 'success', 
                    new_balance: newBalance, 
                    added: result.data.get_balance 
                });
            }
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ success: false });
    }
                      }
