const Admin: React.FC<AdminProps> = ({ onExit }) => {
  // 1. ΟΛΑ ΤΑ STATES (ΜΟΝΟ ΜΙΑ ΦΟΡΑ)
  const [session, setSession] = React.useState<any>(null);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [authLoading, setAuthLoading] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSaving, setIsSaving] = React.useState(false);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);
  const [isAiProcessing, setIsAiProcessing] = React.useState(false);
  
  const [state, setState] = React.useState<CMSState>({
    properties: [], brandName: '', stripePublicKey: '', hosthubApiKey: ''
  });
  const [bookings, setBookings] = React.useState<RealBooking[]>([]);
  const [activeTab, setActiveTab] = React.useState<'dashboard' | 'properties' | 'bookings' | 'settings' | 'transactions' | 'ai'>('dashboard');
  const [editingProp, setEditingProp] = React.useState<Property | null>(null);
  const [settingsFeedback, setSettingsFeedback] = React.useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = React.useState('');
  const [aiFeedback, setAiFeedback] = React.useState<{type: 'success'|'error', msg: string} | null>(null);
  const [currentDate, setCurrentDate] = React.useState(new Date());

  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const totalRevenue = bookings.reduce((a, b) => a + b.amount, 0);

  // 2. AUTH & DATA FETCHING
  React.useEffect(() => {
    const init = async () => {
      const { data: { session: cur } } = await supabase.auth.getSession();
      setSession(cur);
      if (cur) {
        const [cmsData, bookingData] = await Promise.all([
          cmsService.loadContent(),
          cmsService.fetchBookings()
        ]);
        setState(cmsData);
        setBookings(bookingData);
      }
      setIsLoading(false);
    };
    init();
  }, []);

  // 3. HANDLERS (LOGIN, SAVE, SYNC, AI, IMAGES)
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message); else setSession(data.session);
    setAuthLoading(false);
  };

  const handleSaveProperty = async () => {
    if (!editingProp) return;
    setIsSaving(true);
    try {
      await cmsService.updateProperty(editingProp);
      const isNew = !state.properties.find(p => p.id === editingProp.id);
      const newProps = isNew ? [...state.properties, editingProp] : state.properties.map(p => p.id === editingProp.id ? editingProp : p);
      setState({ ...state, properties: newProps });
      setEditingProp(null);
    } catch (e: any) { alert(e.message); } finally { setIsSaving(false); }
  };

  const handleSyncHosthub = async () => {
    if (!state.hosthubApiKey) return alert("Missing API Key");
    if (!window.confirm("Sync with Hosthub?")) return;
    setIsSyncing(true);
    try {
      await cmsService.syncAllPropertiesFromHosthub();
      const data = await cmsService.loadContent();
      setState(data);
      setSettingsFeedback("Sync Complete!");
    } catch (e: any) { alert(e.message); } finally { setIsSyncing(false); }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((res, rej) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (e) => {
        const img = new Image();
        img.src = e.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX = 1200;
          let w = img.width, h = img.height;
          if (w > h) { if (w > MAX) { h *= MAX/w; w = MAX; } }
          else { if (h > MAX) { w *= MAX/h; h = MAX; } }
          canvas.width = w; canvas.height = h;
          canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
          res(canvas.toDataURL('image/jpeg', 0.7));
        };
      };
    });
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    setIsUploading(true);
    try {
      const urls = await Promise.all(Array.from(e.target.files).map(f => compressImage(f)));
      setEditingProp(prev => prev ? { ...prev, images: [...prev.images, ...urls] } : null);
    } finally { setIsUploading(false); }
  };

  const handleAiMagic = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiProcessing(true);
    try {
      const newState = await aiService.processCmsUpdate(state, aiPrompt);
      for (const p of newState.properties) await cmsService.updateProperty(p);
      setState(newState);
      setAiPrompt('');
      setAiFeedback({type: 'success', msg: 'AI Architect updated your site!'});
    } catch (e: any) { setAiFeedback({type: 'error', msg: e.message}); } finally { setIsAiProcessing(false); }
  };

  // 4. HELPER FUNCTIONS (CALENDAR)
  const changeMonth = (d: number) => {
    const n = new Date(currentDate); n.setMonth(n.getMonth() + d); setCurrentDate(n);
  };
  const getDaysInMonth = (date: Date) => Array.from({ length: new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate() }, (_, i) => i + 1);
  const isBooked = (pId: string, d: number) => {
    const target = new Date(currentDate.getFullYear(), currentDate.getMonth(), d).setHours(0,0,0,0);
    return bookings.find(b => pId === b.propertyId && target >= new Date(b.checkIn).setHours(0,0,0,0) && target < new Date(b.checkOut).setHours(0,0,0,0));
  };
const Admin: React.FC<AdminProps> = ({ onExit }) => {
  // --- ΕΔΩ ΕΙΝΑΙ ΤΑ STATES ΣΟΥ ---
  const [session, setSession] = React.useState<any>(null);
  // ... όλα τα άλλα states ...

  // --- ΕΔΩ ΕΙΝΑΙ ΤΑ EFFECTS ΣΟΥ ---
  React.useEffect(() => { /* ... fetching logic ... */ }, []);

  // --- ΕΔΩ ΒΑΛΕ ΤΟΥΣ ΝΕΟΥΣ HANDLERS (ΑΥΤΑ ΠΟΥ ΣΟΥ ΕΔΩΣΑ) ---
  const handleSaveSettings = async () => { /* ... logic ... */ };
  const handleAddNew = () => { /* ... logic ... */ };

  // --- ΕΔΩ ΕΙΝΑΙ ΟΙ ΗΔΗ ΥΠΑΡΧΟΝΤΕΣ HANDLERS ΣΟΥ ---
  const handleLogin = async (e: React.FormEvent) => { /* ... */ };
  // ... κλπ ...

  // --- ΒΟΗΘΗΤΙΚΟ COMPONENT ΓΙΑ ΤΟ MENU (NavItem) ---
  // Μπορείς να το βάλεις και έξω από το Admin component για να μην "πιάνει χώρο"
  const NavItem = ({ id, label, icon: Icon }: any) => (
     <button onClick={() => setActiveTab(id)} ... >...</button>
  );

  // --- ΤΕΛΟΣ ΤΗΣ ΛΟΓΙΚΗΣ ---
  // 5. RENDER LOGIC (LOGIN / LOADING / MAIN)
  if (!session && !isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl border border-yellow-600/20 w-full max-w-md">
          <h2 className="text-2xl font-serif text-yellow-500 mb-6 text-center">Admin Access</h2>
          <input type="email" placeholder="Email" className="w-full bg-gray-700 p-3 mb-4 rounded text-white" value={email} onChange={e => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full bg-gray-700 p-3 mb-4 rounded text-white" value={password} onChange={e => setPassword(e.target.value)} />
          <button className="w-full bg-yellow-600 text-black py-3 rounded font-bold uppercase tracking-widest">{authLoading ? 'Σύνδεση...' : 'Είσοδος'}</button>
        </form>
      </div>
    );
  }
return (
    <div className="min-h-screen ...">
      {/* 1. ΤΟ MODAL ΤΟΥ EDITOR (Το "αόρατο" παράθυρο) */}
      {/* Βάλτο στην αρχή του return, ώστε όταν ενεργοποιείται να μπαίνει "πάνω" από όλα */}
      {editingProp && (
        <div className="fixed inset-0 ..."> 
           {/* Ο κώδικας του Editor που σου έστειλα πριν */}
        </div>
      )}

      {/* 2. SIDEBAR & MOBILE HEADER */}
      <aside> ... </aside>
      <header> ... </header>

      {/* 3. ΤΟ ΚΥΡΙΩΣ ΠΕΡΙΕΧΟΜΕΝΟ (MAIN) */}
      <main className="...">
         {/* Εδώ εμφανίζονται τα tabs ανάλογα με το τι πάτησες */}
         {activeTab === 'dashboard' && <DashboardUI />}
         {activeTab === 'properties' && <PropertiesUI />}
         {/* κλπ... */}
      </main>
    </div>
  );
}; // Τέλος του Admin component
  if (isLoading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>;

  // --- ΑΠΟ ΕΔΩ ΚΑΙ ΚΑΤΩ ΞΕΚΙΝΑΕΙ ΤΟ UI ΣΟΥ (ΤΟ return () ΠΟΥ ΗΔΗ ΕΧΕΙΣ) ---
         <div className="flex flex-col items-center gap-4">
            <Loader2 size={40} className="text-slate-900 animate-spin" />
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">Loading Dashboard...</p>
         </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-24 md:pb-0 md:pl-72 relative">
      {/* Mobile Header with Exit Button */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-[60] flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
           <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center font-serif text-sm">T15</div>
           <span className="text-xs font-bold uppercase tracking-widest text-slate-900">Admin Panel</span>
        </div>
        <button 
          onClick={onExit}
          className="flex items-center gap-2 px-3 py-2 bg-rose-50 text-rose-600 rounded-lg text-[10px] font-bold uppercase tracking-widest hover:bg-rose-100 transition-colors"
        >
          <LogOut size={14} /> Exit
        </button>
      </header>

      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-72 bg-white border-r border-slate-200 p-8 flex-col gap-2 shrink-0 z-50">
        <div className="px-4 py-2 mb-10 flex items-center gap-2">
           <div className="w-8 h-8 bg-slate-900 text-white rounded flex items-center justify-center font-serif text-sm">T15</div>
           <h2 className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.3em]">Management</h2>
        </div>
        <nav className="space-y-1">
          <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <NavItem id="properties" label="Residences" icon={Home} />
          <NavItem id="bookings" label="Bookings" icon={BookOpen} />
          <NavItem id="transactions" label="Payments" icon={History} />
          <NavItem id="ai" label="AI Architect" icon={Wand2} />
          <NavItem id="settings" label="Config" icon={Settings} />
        </nav>
        <button onClick={onExit} className="mt-auto flex items-center gap-3 px-5 py-4 text-slate-400 hover:text-rose-500 font-bold text-sm transition-colors uppercase tracking-widest">
          <LogOut size={18} /> Exit Portal
        </button>
      </aside>

      <main className="flex-1 p-4 md:p-12 mt-16 md:mt-0 max-w-7xl mx-auto w-full">
        
        {/* 1. DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="animate-in fade-in duration-500">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-8 tracking-tighter">Performance</h1>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Balance</p>
                <p className="text-3xl font-bold text-slate-900">€{totalRevenue.toLocaleString()}</p>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">POS Status</p>
                <div className={`flex items-center gap-2 font-bold ${state.stripePublicKey ? 'text-emerald-600' : 'text-slate-300'}`}>
                  <Zap size={18} /> <span className="text-xl">{state.stripePublicKey ? 'Online' : 'Setup Req.'}</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Hosthub Sync</p>
                <div className={`flex items-center gap-2 font-bold ${state.hosthubApiKey ? 'text-blue-600' : 'text-slate-300'}`}>
                   <RefreshCw size={18} className={state.hosthubApiKey ? "animate-spin-slow" : ""} /> 
                   <span className="text-xl">{state.hosthubApiKey ? 'Active' : 'Offline'}</span>
                </div>
              </div>
              <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">myDATA (AADE)</p>
                <div className={`flex items-center gap-2 font-bold ${state.mydataUserId ? 'text-emerald-600' : 'text-slate-300'}`}>
                   <Server size={18} /> 
                   <span className="text-xl">{state.mydataUserId ? 'Connected' : 'Offline'}</span>
                </div>
              </div>
            </div>
            
            {/* Recent Bookings List */}
            <h3 className="text-xl font-bold mb-6">Recent Transactions</h3>
            {bookings.length === 0 ? (
               <div className="bg-white p-12 rounded-[2rem] border border-slate-100 text-center space-y-4">
                  <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-300"><History size={32} /></div>
                  <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">No bookings yet</p>
               </div>
            ) : (
               <div className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden">
                  {bookings.map((b) => (
                    <div key={b.id} className="p-6 border-b border-slate-50 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div>
                        <p className="font-bold text-slate-900">{b.guestEmail}</p>
                        <p className="text-xs text-slate-500">{b.propertyName} | {b.checkIn} - {b.checkOut}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-slate-900">€{b.amount}</p>
                        <span className="text-[9px] uppercase font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Paid via POS</span>
                      </div>
                    </div>
                  ))}
               </div>
            )}
          </div>
        )}

        {/* 2. PROPERTIES */}
        {activeTab === 'properties' && !editingProp && (
          <div className="animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-3xl font-bold tracking-tighter">My Residences</h1>
              <button onClick={handleAddNew} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl"><Plus size={18} /> New Residence</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {state.properties.map(p => (
                <div key={p.id} className="bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all group">
                  <img src={p.images[0] || 'https://via.placeholder.com/400x300'} className="w-full h-48 object-cover" alt={p.title} />
                  <div className="p-6">
                    <h4 className="font-bold text-slate-900 truncate mb-1">{p.title}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">{p.category}</p>
                    <button onClick={() => setEditingProp(p)} className="w-full py-3 bg-slate-50 text-slate-900 rounded-xl text-xs font-bold hover:bg-slate-900 hover:text-white transition-all flex items-center justify-center gap-2"><Edit3 size={14} /> Edit Content</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 3. BOOKINGS CALENDAR */}
        {activeTab === 'bookings' && (
           <div className="animate-in fade-in duration-500 h-full flex flex-col">
              <div className="flex flex-col md:flex-row justify-between items-end md:items-center mb-8 gap-4">
                 <div>
                    <h1 className="text-3xl font-bold tracking-tighter">Availability Calendar</h1>
                    <p className="text-slate-400 text-sm font-medium mt-1">Manage reservations and view occupancy.</p>
                 </div>
                 
                 <div className="flex items-center gap-4 bg-white p-1 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                    <div className="w-40 text-center font-bold text-slate-900 flex items-center justify-center gap-2">
                       <CalendarIcon size={16} className="text-slate-400" />
                       {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </div>
                    <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 rounded-lg transition-colors"><ChevronRight size={20} /></button>
                 </div>
              </div>

              {/* CALENDAR GRID CONTAINER */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden flex-1 flex flex-col">
                 <div className="overflow-x-auto custom-scrollbar-footer pb-4">
                    <div className="min-w-[1200px] p-6">
                       {/* Header Row: Days */}
                       <div className="flex mb-2">
                          <div className="w-48 shrink-0 font-bold text-xs uppercase tracking-widest text-slate-400 pt-2 sticky left-0 bg-white z-10">Property</div>
                          <div className="flex-1 grid" style={{ gridTemplateColumns: `repeat(${getDaysInMonth(currentDate).length}, minmax(36px, 1fr))` }}>
                             {getDaysInMonth(currentDate).map(day => {
                                const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                                return (
                                   <div key={day} className={`text-center text-xs font-bold py-2 rounded-lg mb-2 ${isWeekend ? 'bg-slate-50 text-slate-900' : 'text-slate-400'}`}>
                                      {day}
                                   </div>
                                );
                             })}
                          </div>
                       </div>

                       {/* Body: Properties & Cells */}
                       <div className="space-y-3">
                          {state.properties.map(property => (
                             <div key={property.id} className="flex items-center group">
                                {/* Property Label (Sticky) */}
                                <div className="w-48 shrink-0 sticky left-0 bg-white z-10 pr-4">
                                   <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 group-hover:border-slate-300 transition-colors">
                                      <div>
                                         <span className="block font-bold text-xs text-slate-900 truncate w-32">{property.title}</span>
                                         <span className="block text-[9px] text-slate-400 uppercase tracking-wider">{property.category}</span>
                                      </div>
                                   </div>
                                </div>

                                {/* Days Grid */}
                                <div className="flex-1 grid gap-1" style={{ gridTemplateColumns: `repeat(${getDaysInMonth(currentDate).length}, minmax(36px, 1fr))` }}>
                                   {getDaysInMonth(currentDate).map(day => {
                                      const booking = isBooked(property.id, day);
                                      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
                                      const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                                      return (
                                         <div 
                                            key={day} 
                                            className={`
                                               h-12 rounded-lg transition-all relative group/cell
                                               ${booking 
                                                  ? 'bg-emerald-100 border border-emerald-200 cursor-pointer hover:bg-emerald-200' 
                                                  : isWeekend ? 'bg-slate-50/50' : 'bg-white border border-slate-50'
                                               }
                                            `}
                                         >
                                            {booking && (
                                               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max max-w-[200px] bg-slate-900 text-white text-[10px] p-2 rounded-lg opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity z-20 shadow-xl">
                                                  <p className="font-bold flex items-center gap-1"><User size={10} /> {booking.guestEmail}</p>
                                                  <p className="opacity-70">{booking.checkIn} → {booking.checkOut}</p>
                                               </div>
                                            )}
                                         </div>
                                      );
                                   })}
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 </div>
                 
                 {/* Legend */}
                 <div className="border-t border-slate-100 p-4 bg-slate-50/50 flex gap-6 text-[10px] uppercase font-bold tracking-widest text-slate-400">
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-white border border-slate-200"></div> Available</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-slate-100"></div> Weekend</div>
                    <div className="flex items-center gap-2"><div className="w-3 h-3 rounded bg-emerald-100 border border-emerald-200"></div> Booked</div>
                 </div>
              </div>
           </div>
        )}

        {/* 3. AI ARCHITECT */}
        {activeTab === 'ai' && (
          <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in zoom-in-95 duration-500">
             <div className="text-center space-y-4">
                <div className="w-20 h-20 bg-slate-900 rounded-[2rem] flex items-center justify-center mx-auto shadow-2xl">
                   <Wand2 size={40} className="text-white animate-pulse" />
                </div>
                <h1 className="text-4xl font-bold tracking-tighter">AI Website Architect</h1>
                <p className="text-slate-400 max-w-lg mx-auto leading-relaxed">
                   Describe the changes you want to make to your website. The AI will analyze your properties and update the data automatically.
                </p>
             </div>

             <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-2xl space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5">
                   <Sparkles size={200} />
                </div>

                <div className="space-y-4 relative z-10">
                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <Sparkles size={14} className="text-blue-500" /> What do you want to change?
                   </label>
                   <textarea 
                     rows={6}
                     className="w-full p-6 bg-slate-50 border-none rounded-[2rem] text-slate-900 font-medium placeholder:text-slate-300 focus:ring-2 focus:ring-slate-900 transition-all text-lg resize-none shadow-inner"
                     placeholder="e.g. 'Increase all prices on the 7th floor by 20%' or 'Update all descriptions to mention that we offer free Greek breakfast starting this summer'..."
                     value={aiPrompt}
                     onChange={e => setAiPrompt(e.target.value)}
                     disabled={isAiProcessing}
                   />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                   <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Capabilities</p>
                      <ul className="space-y-2 text-xs text-slate-600 font-medium">
                         <li className="flex items-center gap-2">· Bulk pricing updates</li>
                         <li className="flex items-center gap-2">· Property description optimization</li>
                         <li className="flex items-center gap-2">· Amenity list management</li>
                         <li className="flex items-center gap-2">· General branding text updates</li>
                      </ul>
                   </div>
                   <div className="p-5 bg-blue-50 rounded-2xl border border-blue-100">
                      <p className="text-[10px] font-bold text-blue-400 uppercase tracking-widest mb-2">Tip</p>
                      <p className="text-xs text-blue-700 font-medium leading-relaxed">
                         Be specific about which residences or categories you want to modify for more accurate results.
                      </p>
                   </div>
                </div>

                {aiFeedback && (
                  <div className={`p-6 rounded-2xl flex items-center gap-4 animate-in slide-in-from-top-2 ${aiFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-rose-50 text-rose-700 border border-rose-100'}`}>
                    {aiFeedback.type === 'success' ? <CheckCircle2 size={24} /> : <X size={24} />}
                    <p className="font-bold text-sm uppercase tracking-tight">{aiFeedback.msg}</p>
                  </div>
                )}

                <button 
                  onClick={handleAiMagic}
                  disabled={isAiProcessing || !aiPrompt.trim()}
                  className={`w-full py-6 rounded-3xl font-bold text-xl flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95 relative z-10 ${
                    isAiProcessing 
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed" 
                    : "bg-slate-900 text-white hover:bg-slate-800"
                  }`}
                >
                  {isAiProcessing ? (
                    <>
                      <Loader2 size={24} className="animate-spin" />
                      AI is architecting your site...
                    </>
                  ) : (
                    <>
                      Apply Magic Changes <ChevronRight size={24} />
                    </>
                  )}
                </button>
             </div>
          </div>
        )}

        {/* 4. SETTINGS TAB */}
        {activeTab === 'settings' && (
           <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in duration-500">
              <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold tracking-tighter">System Configuration</h1>
                 <div className="flex gap-4">
                   <button onClick={handleSyncHosthub} disabled={isSyncing} className="px-6 py-3 bg-blue-50 text-blue-600 rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-sm hover:bg-blue-100 transition-all disabled:opacity-50">
                      {isSyncing ? <Loader2 className="animate-spin" size={18} /> : <DownloadCloud size={18} />} Sync Hosthub
                   </button>
                   <button onClick={handleSaveSettings} disabled={isSaving} className="px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest flex items-center gap-2 shadow-xl hover:bg-slate-800 transition-all disabled:opacity-50">
                      {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Settings
                   </button>
                 </div>
              </div>

              {settingsFeedback && (
                 <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 p-4 rounded-xl flex items-center gap-3 font-bold text-sm animate-in slide-in-from-top-2">
                    <CheckCircle2 size={18} /> {settingsFeedback}
                 </div>
              )}
              
              <div className="space-y-8">
                 {/* Brand Settings */}
                 <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3"><Globe size={20} className="text-slate-400"/> General Settings</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Brand Name</label>
                          <input 
                             className="w-full p-4 bg-slate-50 rounded-xl border-none font-bold" 
                             value={state.brandName} 
                             onChange={e => setState({...state, brandName: e.target.value})}
                          />
                       </div>
                    </div>
                 </section>

                 {/* Hosthub Settings */}
                 <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3"><RefreshCw size={20} className="text-blue-500"/> Hosthub Sync</h3>
                    <div className="p-4 bg-blue-50 text-blue-800 rounded-xl text-xs font-medium leading-relaxed">
                       Enter your Hosthub API Key to enable real-time synchronization of availability and bookings with Airbnb, Booking.com, and Expedia.
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Hosthub API Key</label>
                       <div className="relative">
                          <input 
                             type="password"
                             className="w-full p-4 bg-slate-50 rounded-xl border-none font-mono tracking-wider" 
                             value={state.hosthubApiKey} 
                             onChange={e => setState({...state, hosthubApiKey: e.target.value})}
                          />
                          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                       </div>
                    </div>
                 </section>

                 {/* Stripe Settings */}
                 <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3"><CreditCard size={20} className="text-emerald-500"/> Payments (SoftPOS)</h3>
                    <div className="grid grid-cols-1 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Stripe Public Key</label>
                          <input 
                             type="text"
                             placeholder="pk_live_..."
                             className="w-full p-4 bg-slate-50 rounded-xl border-none font-mono text-sm" 
                             value={state.stripePublicKey} 
                             onChange={e => setState({...state, stripePublicKey: e.target.value})}
                          />
                       </div>
                    </div>
                 </section>

                 {/* myDATA (AADE) Settings */}
                 <section className="bg-white p-8 rounded-[2rem] border border-slate-100 shadow-sm space-y-6">
                    <h3 className="text-xl font-bold flex items-center gap-3"><Server size={20} className="text-slate-900"/> myDATA (AADE) Integration</h3>
                    <div className="p-4 bg-slate-50 rounded-xl text-xs font-medium text-slate-500 leading-relaxed mb-4">
                       Configure your Greek Fiscal Authority (AADE) credentials here. This enables automatic transmission of invoices for every booking.
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AADE User ID</label>
                          <input 
                             className="w-full p-4 bg-slate-50 rounded-xl border-none font-medium" 
                             value={state.mydataUserId || ''} 
                             onChange={e => setState({...state, mydataUserId: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">AADE Subscription Key</label>
                          <input 
                             type="password"
                             className="w-full p-4 bg-slate-50 rounded-xl border-none font-mono" 
                             value={state.mydataApiKey || ''} 
                             onChange={e => setState({...state, mydataApiKey: e.target.value})}
                          />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">VAT Number (AFM)</label>
                          <input 
                             className="w-full p-4 bg-slate-50 rounded-xl border-none font-bold tracking-widest" 
                             value={state.vatNumber || ''} 
                             onChange={e => setState({...state, vatNumber: e.target.value})}
                          />
                       </div>
                    </div>
                 </section>
              </div>
           </div>
        )}

        {/* OTHER TABS */}
        {(activeTab === 'transactions') && (
           <div className="animate-in fade-in duration-500">
              <h1 className="text-3xl font-bold mb-8 capitalize">{activeTab}</h1>
              <p className="text-slate-400 font-medium">Coming soon or same as previous build.</p>
           </div>
        )}

        {/* EDITING PROPERTY OVERLAY */}
        {editingProp && (
          <div className="fixed inset-0 bg-white z-[100] overflow-y-auto">
             <div className="max-w-5xl mx-auto p-6 md:p-12 pb-32">
                <div className="flex justify-between items-center mb-12 sticky top-0 bg-white/90 backdrop-blur-md py-4 z-10 border-b border-slate-100">
                   <button onClick={() => setEditingProp(null)} className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2"><X size={18} /> Cancel</button>
                   <button onClick={handleSaveProperty} disabled={isSaving || isUploading} className="px-10 py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm uppercase tracking-widest flex items-center gap-2 shadow-2xl hover:bg-slate-800 transition-all disabled:opacity-50">
                     {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Save Residence
                   </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                   <div className="space-y-10">
                      <section className="space-y-6">
                        <h3 className="text-xl font-bold border-b border-slate-100 pb-4 flex items-center gap-3"><SlidersHorizontal size={20} /> Basic Information</h3>
                        <div className="space-y-4">
                           <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Title</label>
                              <input className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold" value={editingProp.title} onChange={e => setEditingProp({...editingProp, title: e.target.value})} />
                           </div>
                           <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Listing ID</label>
                                 <input className="w-full p-5 bg-slate-50 rounded-2xl border-none font-mono" value={editingProp.hosthubListingId} onChange={e => setEditingProp({...editingProp, hosthubListingId: e.target.value})} />
                              </div>
                              <div className="space-y-2">
                                 <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Floor / Cat</label>
                                 <input className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold" value={editingProp.category} onChange={e => setEditingProp({...editingProp, category: e.target.value})} />
                              </div>
                           </div>
                        </div>
                      </section>

                      <section className="space-y-6">
                        <h3 className="text-xl font-bold border-b border-slate-100 pb-4 flex items-center gap-3"><ImageIcon size={20} /> Photos</h3>
                        <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleFileChange} />
                        <button onClick={() => fileInputRef.current?.click()} className="w-full py-12 border-2 border-dashed border-slate-200 rounded-[2rem] text-slate-400 flex flex-col items-center gap-3 hover:border-slate-900 hover:text-slate-900 transition-all group">
                           {isUploading ? <Loader2 size={32} className="animate-spin" /> : <Upload size={32} className="group-hover:scale-110 transition-transform" />}
                           <p className="font-bold text-xs uppercase tracking-widest">Upload local images</p>
                        </button>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                           {editingProp.images.map((img, idx) => (
                              <div key={idx} className="relative aspect-[4/3] rounded-xl overflow-hidden group border border-slate-100 bg-slate-50">
                                 <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                                 <button 
                                   onClick={() => setEditingProp(prev => prev ? ({...prev, images: prev.images.filter((_, i) => i !== idx)}) : null)} 
                                   className="absolute top-2 right-2 p-2 bg-white/90 text-rose-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all shadow-sm hover:bg-rose-500 hover:text-white"
                                   title="Remove Image"
                                 >
                                    <Trash2 size={14}/>
                                 </button>
                              </div>
                           ))}
                        </div>
                      </section>
                   </div>

                   <div className="space-y-10">
                      <section className="space-y-6">
                        <h3 className="text-xl font-bold border-b border-slate-100 pb-4 flex items-center gap-3"><FileText size={20} /> Content</h3>
                        <textarea rows={8} className="w-full p-5 bg-slate-50 rounded-2xl border-none text-slate-600 leading-relaxed" value={editingProp.description} onChange={e => setEditingProp({...editingProp, description: e.target.value})} />
                      </section>
                      <section className="space-y-6">
                        <h3 className="text-xl font-bold border-b border-slate-100 pb-4 flex items-center gap-3"><Scale size={20} /> Policies</h3>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cancellation Policy</label>
                            <textarea 
                              rows={4} 
                              className="w-full p-5 bg-slate-50 rounded-2xl border-none text-slate-600 leading-relaxed" 
                              value={editingProp.cancellationPolicy} 
                              onChange={e => setEditingProp({...editingProp, cancellationPolicy: e.target.value})} 
                            />
                        </div>
                      </section>
                      <section className="space-y-6">
                        <h3 className="text-xl font-bold border-b border-slate-100 pb-4 flex items-center gap-3"><CreditCard size={20} /> Pricing & Fees</h3>
                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Base Price (€)</label>
                             <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold text-emerald-600" value={editingProp.pricePerNightBase} onChange={e => setEditingProp({...editingProp, pricePerNightBase: parseInt(e.target.value) || 0})} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Cleaning Fee (€)</label>
                             <input type="number" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold" value={editingProp.cleaningFee} onChange={e => setEditingProp({...editingProp, cleaningFee: parseInt(e.target.value) || 0})} />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Climate Tax (€/night)</label>
                             <input type="number" step="0.5" className="w-full p-5 bg-slate-50 rounded-2xl border-none font-bold" value={editingProp.climateCrisisTax} onChange={e => setEditingProp({...editingProp, climateCrisisTax: parseFloat(e.target.value) || 0})} />
                          </div>
                        </div>
                      </section>
                   </div>
                </div>
             </div>
          </div>
        )}
      </main>

      <nav className="fixed bottom-0 left-0 right-0 h-20 bg-white border-t border-slate-200 z-[60] flex items-center px-4 gap-2 md:hidden">
        <NavItem id="dashboard" label="Home" icon={LayoutDashboard} />
        <NavItem id="properties" label="Rooms" icon={Home} />
        <NavItem id="ai" label="Magic" icon={Wand2} />
        <NavItem id="bookings" label="Bookings" icon={BookOpen} />
        <NavItem id="settings" label="Config" icon={Settings} />
      </nav>
    </div>
  );
};

export default Admin;
