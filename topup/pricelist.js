<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Store Digital - Lapak Dika</title>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        :root { 
            --aksen: #8b5cf6; 
            --bg: #09090b; 
            --card: #18181b; 
            --border: #27272a;
            --text-muted: #a1a1aa;
            --green: #22c55e;
        }
        body { font-family: 'Plus Jakarta Sans', sans-serif; background: var(--bg); color: white; margin: 0; padding: 15px; display: flex; justify-content: center; }
        .app { width: 100%; max-width: 450px; }
        
        .header { display: flex; align-items: center; gap: 15px; margin: 10px 0 25px; }
        .back { background: var(--card); border: 1px solid var(--border); color: white; width: 40px; height: 40px; border-radius: 12px; cursor: pointer; }

        .input-group { display: flex; flex-direction: column; gap: 10px; margin-bottom: 20px; position: sticky; top: 10px; z-index: 50; background: var(--bg); padding-bottom: 5px; }
        .inp { width: 100%; background: var(--card); border: 1px solid var(--border); padding: 16px; border-radius: 15px; color: white; font-size: 14px; outline: none; box-sizing: border-box; }
        .inp:focus { border-color: var(--aksen); }
        .target { border-left: 4px solid var(--aksen); font-weight: 800; }

        .cats { display: flex; gap: 8px; overflow-x: auto; padding-bottom: 15px; scrollbar-width: none; }
        .cats::-webkit-scrollbar { display: none; }
        .chip { background: var(--card); border: 1px solid var(--border); padding: 10px 18px; border-radius: 12px; font-size: 11px; font-weight: 700; white-space: nowrap; cursor: pointer; color: var(--text-muted); }
        .chip.active { background: var(--aksen); color: white; border-color: var(--aksen); }

        .grid { display: grid; gap: 10px; }
        .item { background: var(--card); border: 1px solid var(--border); padding: 15px; border-radius: 20px; display: flex; align-items: center; gap: 12px; }
        .img { width: 45px; height: 45px; border-radius: 12px; background: white; padding: 5px; flex-shrink: 0; }
        .info { flex: 1; }
        .name { font-size: 12px; font-weight: 700; display: block; margin-bottom: 3px; }
        .price { font-size: 15px; font-weight: 800; color: var(--green); }
        .btn { background: var(--aksen); color: white; border: none; padding: 8px 15px; border-radius: 10px; font-size: 11px; font-weight: 800; cursor: pointer; }

        #modal { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.9); backdrop-filter: blur(5px); z-index: 100; place-items: center; padding: 20px; }
        .m-box { background: var(--card); border: 1px solid var(--border); padding: 30px 20px; border-radius: 25px; width: 100%; max-width: 320px; text-align: center; }
        .m-btn { width: 100%; background: var(--aksen); color: white; border: none; padding: 15px; border-radius: 15px; font-weight: 800; cursor: pointer; margin-top: 20px; }

        #loading { text-align: center; padding: 50px 0; }
        .spin { font-size: 30px; color: var(--aksen); animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
    </style>
</head>
<body>

<div class="app">
    <div class="header">
        <button class="back" onclick="history.back()"><i class="fas fa-arrow-left"></i></button>
        <h2 style="font-size: 18px; font-weight: 800; margin:0">Digital Store</h2>
    </div>

    <div class="input-group">
        <input type="text" id="targetID" class="inp target" placeholder="MASUKKAN NOMOR / ID TUJUAN">
        <input type="text" id="search" class="inp" placeholder="Cari produk...">
    </div>

    <div class="cats" id="catList">
        <div class="chip active">Semua</div>
    </div>

    <div id="loading">
        <i class="fas fa-circle-notch spin"></i>
        <p style="font-size: 12px; color: var(--text-muted); margin-top: 10px;">Sinkronisasi harga...</p>
    </div>

    <div class="grid" id="mainGrid" style="display: none;"></div>
</div>

<div id="modal">
    <div class="m-box">
        <div style="font-size: 11px; color: var(--text-muted); text-transform: uppercase;">Konfirmasi Pesanan</div>
        <div id="m-name" style="font-weight: 800; font-size: 15px; margin: 10px 0 5px;"></div>
        <div id="m-target" style="color: var(--aksen); font-weight: 700; margin-bottom: 10px;"></div>
        <div id="m-price" style="font-size: 22px; font-weight: 800; color: var(--green); margin-bottom: 10px;"></div>
        <button class="m-btn" id="gasOrder">BAYAR SEKARANG</button>
        <button onclick="closeM()" style="background:none; border:none; color:var(--text-muted); margin-top:15px; cursor:pointer; font-weight: 700; font-size: 12px;">BATALKAN</button>
    </div>
</div>

<script>
    let products = [];
    let activeCat = 'All';
    let selected = null;

    async function getPrice() {
        try {
            const res = await fetch('/api/pricelist');
            const data = await res.json();
            if(data.success) {
                products = data.data;
                renderCats();
                renderItems(products);
                document.getElementById('loading').style.display = 'none';
                document.getElementById('mainGrid').style.display = 'grid';
            }
        } catch(e) { document.getElementById('loading').innerHTML = 'Gagal memuat data.'; }
    }

    function renderCats() {
        const u = ['All', ...new Set(products.map(p => p.category))];
        document.getElementById('catList').innerHTML = u.map(c => `
            <div class="chip ${c === activeCat ? 'active' : ''}" onclick="setCat('${c}', this)">${c}</div>
        `).join('');
    }

    function renderItems(arr) {
        document.getElementById('mainGrid').innerHTML = arr.map(p => `
            <div class="item">
                <img src="${p.img_url}" class="img" onerror="this.src='https://ui-avatars.com/api/?name=${p.provider}'">
                <div class="info">
                    <span class="name">${p.name}</span>
                    <span class="price">Rp ${parseInt(p.price).toLocaleString('id-ID')}</span>
                </div>
                <button class="btn" onclick="openM('${p.code}', '${p.name}', '${p.price}')">BELI</button>
            </div>
        `).join('');
    }

    function openM(code, name, price) {
        const t = document.getElementById('targetID').value;
        if(!t) {
            alert("Nomor / ID Tujuan wajib diisi!");
            document.getElementById('targetID').focus();
            return;
        }
        selected = { code, name, price, target: t };
        document.getElementById('m-name').innerText = name;
        document.getElementById('m-target').innerText = t;
        document.getElementById('m-price').innerText = "Rp " + parseInt(price).toLocaleString('id-ID');
        document.getElementById('modal').style.display = 'grid';
    }

    function closeM() { document.getElementById('modal').style.display = 'none'; }

    document.getElementById('gasOrder').onclick = async () => {
        const b = document.getElementById('gasOrder');
        b.disabled = true;
        b.innerText = "PROSES...";

        try {
            const res = await fetch(`/api/order?code=${selected.code}&tujuan=${selected.target}`);
            const data = await res.json();
            
            if(data.success) {
                alert(`Berhasil!\nID: ${data.data.id}\nStatus: ${data.data.status}`);
                location.reload();
            } else {
                const msg = data.message.toLowerCase();
                if(msg.includes('saldo') || msg.includes('balance')) {
                    alert("Gagal: Saldo pusat tidak cukup. Segera lapor Admin untuk isi saldo!");
                } else {
                    alert("Gagal: " + data.message);
                }
            }
        } catch(e) { alert("Sistem Error! Cek koneksi lo."); }
        finally { b.disabled = false; b.innerText = "BAYAR SEKARANG"; }
    };

    function setCat(c, el) {
        activeCat = c;
        document.querySelectorAll('.chip').forEach(x => x.classList.remove('active'));
        el.classList.add('active');
        filter();
    }

    function filter() {
        const q = document.getElementById('search').value.toLowerCase();
        const f = products.filter(p => {
            const s = p.name.toLowerCase().includes(q) || p.provider.toLowerCase().includes(q);
            const c = activeCat === 'All' || p.category === activeCat;
            return s && c;
        });
        renderItems(f);
    }

    document.getElementById('search').addEventListener('input', filter);
    getPrice();
</script>
</body>
</html>
