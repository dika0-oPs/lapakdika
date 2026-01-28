import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    const { order_id, id_db } = req.query;
    const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';

    if (!order_id || !id_db) {
        return res.status(400).json({ success: false, message: 'Missing parameters' });
    }

    try {
        const response = await fetch(`https://Fupei-Pedia.web.id/h2h/order/check?id=${order_id}`, {
            headers: { 
                'X-APIKEY': apiKey,
                'Accept': 'application/json'
            }
        });
        
        const fupei = await response.json();

        if (fupei.status && fupei.data.status !== 'pending') {
            await supabase.from('h2h_orders')
                .update({ 
                    status: fupei.data.status, 
                    sn: fupei.data.sn || '-' 
                })
                .eq('id', id_db);
        }

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(fupei);
    } catch (e) {
        res.status(500).json({ success: false });
    }
}
