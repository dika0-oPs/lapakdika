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
            
            if (user) {
                // PENTING: Cek apakah ID ini sudah pernah masuk saldonya (cegah double saldo)
                const { data: logs } = await supabase.from('deposits_log').select('id').eq('deposit_id', id).single();

                if (!logs) {
                    const amountToAdd = parseInt(result.data.get_balance);
                    const newBalance = parseInt(user.balance || 0) + amountToAdd;

                    await supabase.from('profiles').update({ balance: newBalance }).eq('email', email);
                    
                    // Catat agar tidak diproses lagi
                    await supabase.from('deposits_log').insert([{ deposit_id: id, email: email, amount: amountToAdd }]);

                    res.setHeader('Access-Control-Allow-Origin', '*');
                    return res.status(200).json({ 
                        success: true, 
                        status: 'success', 
                        added: amountToAdd,
                        nominal: result.data.nominal,
                        fee: result.data.fee
                    });
                } else {
                    // Jika sudah pernah diproses, tetap kasih status success biar frontend berhenti polling
                    res.setHeader('Access-Control-Allow-Origin', '*');
                    return res.status(200).json({ success: true, status: 'success', added: result.data.get_balance });
                }
            }
        }
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(result);
    } catch (e) {
        res.status(500).json({ success: false });
    }
}
