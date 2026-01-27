export default async function handler(req, res) {
    const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';
    const { nominal, metode } = req.query;
    const target = `https://Fupei-Pedia.web.id/h2h/deposit/create?nominal=${nominal}&metode=${metode}`;

    try {
        const response = await fetch(target, {
            headers: { 'X-APIKEY': apiKey, 'Accept': 'application/json' }
        });
        const data = await response.json();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false });
    }
}
