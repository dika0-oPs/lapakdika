export default async function handler(req, res) {
    const apiKey = 'Fupei-pedia-mqmcszpvfzr984hi';
    const { code, tujuan, email } = req.query;

    if (!code || !tujuan || !email) {
        return res.status(400).json({ success: false, message: 'Data tidak lengkap' });
    }

    try {
        const userReq = await fetch(`https://lo-punya-web.vercel.app/api/get-user?email=${email}`);
        const userData = await userReq.json();

        const priceReq = await fetch(`https://Fupei-Pedia.web.id/h2h/layanan/price-list`, {
            headers: { 'X-APIKEY': apiKey }
        });
        const priceData = await priceReq.json();
        const produk = priceData.data.find(p => p.code === code);

        if (userData.saldo < parseInt(produk.price)) {
            return res.status(400).json({ 
                success: false, 
                message: 'Saldo tidak cukup', 
                current_balance: userData.saldo 
            });
        }

        const target = `https://Fupei-Pedia.web.id/h2h/order/create?code=${code}&tujuan=${tujuan}`;
        const response = await fetch(target, {
            headers: { 'X-APIKEY': apiKey, 'Accept': 'application/json' }
        });
        const data = await response.json();

        res.setHeader('Access-Control-Allow-Origin', '*');
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ success: false, message: "Terjadi kesalahan sistem" });
    }
}
