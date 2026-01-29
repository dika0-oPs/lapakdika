import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    const { id, email } = req.query;
    const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';

    if (!id || !email) return res.status(400).json({ success: false });

    try {
        const target = `https://Fupei-Pedia.web.id/h2h/deposit/status?id=${id}&apikey=${apiKey}`;
        const check = await fetch(target);
        const result = await check.json();

        if (result.success && result.data.status === 'success') {
            const cleanEmail = email.trim().toLowerCase();
            const { data: user } = await supabase.from('profiles').select('balance').eq('email', cleanEmail).single();
            
            if (user) {
                const amountToAdd = parseInt(result.data.get_balance);
                const currentBal = parseInt(user.balance || 0);
                
                const { data: alreadyProcessed } = await supabase
                    .from('deposits_log')
                    .select('id')
                    .eq('deposit_id', id)
                    .single();

                if (!alreadyProcessed) {
                    const newBalance = currentBal + amountToAdd;

                    await supabase.from('profiles').update({ balance: newBalance }).eq('email', cleanEmail);
                    
                    await supabase.from('deposits_log').insert([{ 
                        deposit_id: id, 
                        email: cleanEmail, 
                        amount: amountToAdd 
                    }]);

                    res.setHeader('Access-Control-Allow-Origin', '*');
                    return res.status(200).json({ 
                        success: true, 
                        status: 'success', 
                        nominal: result.data.nominal,
                        fee: result.data.fee,
                        added: amountToAdd 
                    });
                } else {
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    return res.status(200).json({ success: true, status: 'success' });
                }
            }
        }
        
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ success: false });
    }
}
