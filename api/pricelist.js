const axios = require('axios');

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    try {
        const response = await axios.get('https://Fupei-Pedia.web.id/h2h/layanan/price-list', {
            headers: {
                'X-APIKEY': 'Fupei-pedia-mqmcszpvfzr984hi'
            }
        });

        if (response.data.success) {
            res.status(200).json({
                success: true,
                data: response.data.data
            });
        } else {
            res.status(500).json({ success: false, message: "Gagal mengambil data dari Fupei" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
