import { useState, useEffect } from 'react'
import Sidebar from './components/sidebar'
import './App.css'

function App()  {
  // --- STATE & LOGIC ---
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  
  const [daftarTamu, setDaftarTamu] = useState([])
  const [nama, setNama] = useState("")
  const [layanan, setLayanan] = useState("")
  const [harga, setHarga] = useState("")
  const [jam, setJam] = useState("")
  const [editId, setEditId] = useState(null)

  // 1. --- FITUR AUTO-LOGIN (Cek Saku Browser) ---
  useEffect(() => {
    // Cek apakah ada 'tiket' user yang tersimpan?
    const userTersimpan = localStorage.getItem("user_salon")
    if (userTersimpan) {
      setIsLoggedIn(true) // Langsung izinkan masuk!
      setUsername(userTersimpan) // Ingat nama bos-nya
    }
  }, []) // Dijalankan cuma sekali pas aplikasi dibuka

  const refreshData = () => {
    fetch('http://localhost:8000/bookings')
      .then(res => res.json())
      .then(data => setDaftarTamu(data))
  }

  useEffect(() => {
    if (isLoggedIn) {
      refreshData()
    }
  }, [isLoggedIn])

  // --- FUNGSI LOGIN / REGISTER ---
  const handleAuth = async (e) => {
    e.preventDefault()
    const endpoint = isRegisterMode ? 'register' : 'login' 
    
    const response = await fetch(`http://localhost:8000/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
    })
    
    const data = await response.json()

    if (response.ok) {
        alert(data.pesan)
        
        // 2. --- SIMPAN KUNCI SAAT LOGIN SUKSES ---
        localStorage.setItem("user_salon", username) 
        
        setIsLoggedIn(true) 
    } else {
        alert(data.detail)
    }
  }

  // --- FUNGSI LOGOUT ---
  const handleLogout = () => {
      // 3. --- BUANG KUNCI SAAT LOGOUT ---
      localStorage.removeItem("user_salon")
      
      setIsLoggedIn(false)
      setUsername("")
      setPassword("")
  }

  // --- TAMPILAN GERBANG ---
  if (!isLoggedIn) {
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', background: '#2c3e50' }}>
            <div className="card" style={{ width: '300px', textAlign: 'center', padding: '30px' }}>
                <h2>🔐 Salon Gate</h2>
                <p>{isRegisterMode ? "Daftarkan Akun Baru" : "Silakan Masuk"}</p>
                
                <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <input 
                        placeholder="Username" 
                        value={username} 
                        onChange={e => setUsername(e.target.value)} 
                        style={{ padding: '10px' }}
                    />
                    <input 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={e => setPassword(e.target.value)} 
                        style={{ padding: '10px' }}
                    />
                    <button type="submit" style={{ padding: '10px', background: isRegisterMode ? '#e67e22' : '#27ae60', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
                        {isRegisterMode ? "Daftar Sekarang" : "Masuk (Login)"}
                    </button>
                </form>

                <p style={{ marginTop: '15px', fontSize: '14px', color: '#7f8c8d' }}>
                    {isRegisterMode ? "Sudah punya akun?" : "Belum punya akun?"}
                    <span onClick={() => setIsRegisterMode(!isRegisterMode)} style={{ color: '#3498db', cursor: 'pointer', fontWeight: 'bold', marginLeft: '5px' }}>
                        {isRegisterMode ? "Login di sini" : "Daftar di sini"}
                    </span>
                </p>
            </div>
        </div>
    )
  }

  // --- TAMPILAN DASHBOARD ---
  const formatRupiah = (angka) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(angka)
  const totalPendapatan = daftarTamu.reduce((total, tamu) => total + tamu.harga, 0)

  const handleSimpan = async (e) => {
    e.preventDefault()
    const dataKirim = { nama, layanan, harga: parseInt(harga), jam }
    const url = editId ?`http://localhost:8000/bookings/${editId}` : 'http://localhost:8000/bookings'
    const method = editId ? 'PUT' : 'POST'

    await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(dataKirim)
    })
    
    setNama(""); setLayanan(""); setHarga(""); setJam(""); setEditId(null)
    refreshData()
  }

  const handleEdit = (tamu) => {
    setNama(tamu.nama); setLayanan(tamu.layanan); setHarga(tamu.harga); setJam(tamu.jam); setEditId(tamu.id)
  }
// --- FUNGSI CETAK STRUK (New!) ---
  const handleCetak = (tamu) => {
    // 1. Buka jendela pop-up kecil
    const strukWindow = window.open('', '', 'width=300,height=600')
    
    // 2. Tulis konten HTML struk di dalamnya
    strukWindow.document.write(`
        <html>
            <head>
                <title>Struk - ${tamu.nama}</title>
                <style>
                    /* Gaya CSS ala Struk Kasir */
                    body { font-family: 'Courier New', Courier, monospace; text-align: center; padding: 10px; }
                    h2 { margin: 0; font-size: 16px; }
                    p { margin: 5px 0; font-size: 12px; }
                    .line { border-bottom: 1px dashed black; margin: 10px 0; }
                    .left { text-align: left; }
                    .flex { display: flex; justify-content: space-between; }
                    .total { font-size: 16px; font-weight: bold; margin: 15px 0; }
                </style>
            </head>
            <body>
                <h2>💇‍♀️ SALON AUGUR</h2>
                <p>Jl. Jambi Sejahtera No. 1</p>
                <div class="line"></div>
                
                <div class="left">
                    <p>Tgl: ${new Date().toLocaleDateString()}</p>
                    <p>Jam: ${tamu.jam}</p>
                    <p>Plg: ${tamu.nama}</p>
                </div>
                
                <div class="line"></div>
                
                <div class="left">
                    <p><strong>${tamu.layanan}</strong></p>
                </div>

                <div class="line"></div>
                
                <p class="total">Total: ${formatRupiah(tamu.harga)}</p>
                
                <div class="line"></div>
                <p>Terima Kasih!</p>
                <p><em>Silakan datang kembali</em></p>
            </body>
        </html>
    `)
    
    // 3. Perintahkan Print
    strukWindow.document.close()
    strukWindow.print()
  }
  async function handleHapus(id) {
    if (window.confirm("Hapus data?")) {
      await fetch(`http://localhost:8000/bookings/${id}`, { method: 'DELETE' })
      refreshData()
    }
  }

  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-content">
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <h1>Dashboard Keuangan 💰</h1>
            {/* Tombol Logout Panggil Fungsi Baru */}
            <button onClick={handleLogout} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '10px', height: 'fit-content', cursor: 'pointer' }}>Logout</button>
        </div>

        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
            <div className="card"><h3>Total Pelanggan</h3><p style={{ fontSize: '24px', fontWeight: 'bold' }}>{daftarTamu.length} Orang</p></div>
            <div className="card" style={{ borderLeft: '5px solid #27ae60' }}><h3>Omzet Hari Ini</h3><p style={{ fontSize: '24px', fontWeight: 'bold', color: '#27ae60' }}>{formatRupiah(totalPendapatan)}</p></div>
        </div>

        <div className="card" style={{ marginBottom: '20px', background: editId ? '#fff3cd' : '#f8f9fa' }}>
          <h3>{editId ? "✏️ Edit Transaksi" : "Tambah Transaksi"}</h3>
          <form onSubmit={handleSimpan} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <input placeholder="Nama" value={nama} onChange={e => setNama(e.target.value)} required />
            <input placeholder="Layanan" value={layanan} onChange={e => setLayanan(e.target.value)} required />
            <input type="number" placeholder="Harga" value={harga} onChange={e => setHarga(e.target.value)} required />
            <input type="time" value={jam} onChange={e => setJam(e.target.value)} required />
            <button type="submit" style={{ background: editId ? '#f39c12' : '#2980b9', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}>{editId ? "Update" : "+ Simpan"}</button>
            {editId && <button type="button" onClick={() => {setEditId(null); setNama(""); setLayanan(""); setHarga(""); setJam("")}} style={{ background: '#95a5a6', color: 'white', border: 'none', padding: '10px 20px', cursor: 'pointer' }}>Batal</button>}
          </form>
        </div>

        <div className="booking-list">
          {daftarTamu.map((tamu) => (
            <div key={tamu.id} className="booking-card" style={{ borderLeft: editId === tamu.id ? '5px solid #f39c12' : '5px solid #3498db' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h4>{tamu.nama}</h4>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {/* TOMBOL CETAK (Biru Tua) - BARU */}
                    <button 
                        onClick={() => handleCetak(tamu)} 
                        style={{ background: '#34495e', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}
                        title="Cetak Struk"
                    >
                        🖨️
                    </button>

                    {/* TOMBOL EDIT (Kuning) */}
                    <button onClick={() => handleEdit(tamu)} style={{ background: '#f1c40f', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                        ✏️
                    </button>
                    
                    {/* TOMBOL HAPUS (Merah) */}
                    <button onClick={() => handleHapus(tamu.id)} style={{ background: '#e74c3c', color: 'white', border: 'none', padding: '5px 8px', borderRadius: '4px', cursor: 'pointer' }}>
                        ✅
                    </button>
                </div>
              </div>
              <p>✂️ {tamu.layanan}</p>
              <p style={{ fontWeight: 'bold', color: '#27ae60' }}>💵 {formatRupiah(tamu.harga)}</p>
              <small>⏰ {tamu.jam}</small>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default App