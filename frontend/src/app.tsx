import React, { useEffect, useState } from 'react';
import { Leaf, Weight, Calendar, ArrowRight, Plus, X, Trash2 } from 'lucide-react';

const App = () => {
  // 1. STATE MANAGEMENT
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    type: 'Batang Jagung',
    weight: 0,
    price: 0
  });

  // 2. FUNGSI AMBIL DATA (READ)
  const fetchData = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/waste');
      if (!response.ok) throw new Error('Gagal koneksi database');
      const data = await response.json();
      setItems(data);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // 3. FUNGSI TAMBAH DATA (CREATE)
  const handleAddWaste = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('http://localhost:3000/api/waste', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({ title: '', type: 'Batang Jagung', weight: 0, price: 0 });
        fetchData();
      }
    } catch (err) {
      console.error("Post Error:", err);
    }
  };

  // 4. FUNGSI HAPUS DATA (DELETE)
  const handleDelete = async (id: number | string) => {
    if (window.confirm("Hapus data limbah ini dari sistem?")) {
      try {
        const res = await fetch(`http://localhost:3000/api/waste/${id}`, {
          method: 'DELETE',
        });
        if (res.ok) fetchData();
      } catch (err) {
        console.error("Delete Error:", err);
      }
    }
  };

  return (
    <div className="min-h-screen p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* HEADER SECTION */}
        <header className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-navy">Waste Roundabout</h1>
            <p className="text-gray-500 text-sm italic">Project Leader: Tristan | Sirkular Limbah Tanaman</p>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-turmeric hover:brightness-95 text-navy font-bold py-3 px-8 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center"
          >
            <Plus className="mr-2 w-5 h-5" /> Setor Limbah
          </button>
        </header>

        {/* MAIN CONTENT (CARDS) */}
        {loading ? (
          <div className="text-center py-20 text-turmeric font-bold animate-pulse text-xl">
            Menyinkronkan Data Neon...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {items.length > 0 ? (
              items.map((item: any) => (
                <div key={item.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-green-50 rounded-2xl text-green-600">
                        <Leaf className="w-6 h-6" />
                      </div>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-gray-300 hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    <span className="text-[10px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-turmeric/10 text-orange-600">
                      {item.type}
                    </span>
                    <h3 className="text-xl font-bold text-navy mt-3 leading-tight">{item.title}</h3>
                    
                    <div className="mt-6 space-y-3 text-sm text-gray-500 border-t border-gray-50 pt-4">
                      <div className="flex items-center"><Weight className="w-4 h-4 mr-3 text-turmeric" /> {item.weight} kg</div>
                      <div className="flex items-center"><Calendar className="w-4 h-4 mr-3 text-turmeric" /> {item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID') : '-'}</div>
                    </div>
                  </div>

                  <div className="bg-gray-50/50 p-5 flex justify-between items-center border-t border-gray-100">
                    <span className="text-lg font-bold text-navy">Rp {item.price?.toLocaleString('id-ID')}</span>
                    <button className="flex items-center text-sm font-bold text-navy hover:text-turmeric transition-colors">
                      Detail <ArrowRight className="ml-2 w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-3 text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-100 text-gray-400">
                Belum ada setoran limbah hari ini.
              </div>
            )}
          </div>
        )}

        {/* MODAL FORM OVERLAY */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-navy/70 backdrop-blur-md flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in duration-200">
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="absolute top-6 right-6 text-gray-400 hover:text-navy transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              
              <h2 className="text-2xl font-bold text-navy mb-2">Setor Limbah Baru</h2>
              <p className="text-gray-400 text-sm mb-8">Masukkan detail limbah pertanian untuk dipasarkan.</p>

              <form onSubmit={handleAddWaste} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Deskripsi Limbah</label>
                  <input 
                    required 
                    placeholder="Contoh: Batang jagung kering cacah"
                    className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-turmeric focus:bg-white outline-none transition-all" 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Kategori</label>
                    <select 
                      className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-turmeric focus:bg-white outline-none"
                      onChange={(e) => setFormData({...formData, type: e.target.value})}
                    >
                      <option value="Batang Jagung">Batang Jagung</option>
                      <option value="Tongkol Jagung">Tongkol Jagung</option>
                      <option value="Kulit Jagung">Kulit Jagung</option>
                      <option value="Sekam Padi">Sekam Padi</option>
                      <option value="Jerami">Jerami</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Berat (kg)</label>
                    <input 
                      type="number" 
                      required 
                      className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-turmeric focus:bg-white outline-none"
                      onChange={(e) => setFormData({...formData, weight: Number(e.target.value)})} 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase text-gray-400 mb-2 ml-1">Estimasi Harga (Rp)</label>
                  <input 
                    type="number" 
                    required 
                    className="w-full border-2 border-gray-50 bg-gray-50/50 p-4 rounded-2xl focus:border-turmeric focus:bg-white outline-none"
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})} 
                  />
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-turmeric text-navy font-bold py-5 rounded-[1.25rem] shadow-xl shadow-turmeric/20 hover:brightness-95 transition-all mt-4 text-lg"
                >
                  Konfirmasi Setoran
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;