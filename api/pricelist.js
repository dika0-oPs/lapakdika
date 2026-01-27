const axios = require('axios');

async function getPriceList(req, res) {
    try {
        const response = await axios.get('https://Fupei-Pedia.web.id/h2h/layanan/price-list', {
            headers: {
                'X-APIKEY': 'your_api_key_here'
            }
        });

        if (response.data.success) {
            res.json({
                success: true,
                data: response.data.data
            });
        } else {
            res.status(500).json({ success: false, message: "Gagal ambil data Fupei" });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
}

module.exports = getPriceList;
