export default async function handler(req, res) {
    const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';
    const { id } = req.query;

    try {
        const response = await fetch(`https://Fupei-Pedia.web.id/h2h/deposit/cancel?id=${id}`, {
            headers: { 'X-APIKEY': apiKey }
        });
        const data = await response.json();
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false });
    }
}
