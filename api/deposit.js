import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    const { nominal } = req.query;
    const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';

    if (!nominal) return res.status(400).json({ success: false, message: 'Nominal wajib ada' });

    try {
        const target = `https://Fupei-Pedia.web.id/h2h/deposit/create?nominal=${nominal}&apikey=${apiKey}&metode=QRISFAST`;
        const response = await fetch(target);
        const result = await response.json();

        res.setHeader('Access-Control-Allow-Origin', '*');
        return res.status(200).json(result);
    } catch (e) {
        return res.status(500).json({ success: false, error: e.message });
    }
}
