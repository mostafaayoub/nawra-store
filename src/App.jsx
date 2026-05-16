import { useState, useEffect, createContext, useContext } from "react";

// ─── Auth ─────────────────────────────────────────────────────────────────────
const ADMIN_USER = "nawra_admin";
const ADMIN_PASS = "Nawra@2025";

const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nawra_user")) || null; } catch { return null; }
  });
  const login = (u, p) => {
    if (u === ADMIN_USER && p === ADMIN_PASS) {
      const admin = { name: "Admin", role: "admin" };
      localStorage.setItem("nawra_user", JSON.stringify(admin));
      setUser(admin); return { ok: true };
    }
    const users = JSON.parse(localStorage.getItem("nawra_users") || "[]");
    const found = users.find(x => x.username === u && x.password === p);
    if (found) {
      const u2 = { name: found.name, role: "user", username: found.username };
      localStorage.setItem("nawra_user", JSON.stringify(u2));
      setUser(u2); return { ok: true };
    }
    return { ok: false, err: "اسم المستخدم أو كلمة المرور غلط" };
  };
  const register = (name, username, p) => {
    const users = JSON.parse(localStorage.getItem("nawra_users") || "[]");
    if (users.find(x => x.username === username)) return { ok: false, err: "اسم المستخدم موجود بالفعل" };
    users.push({ name, username, password: p });
    localStorage.setItem("nawra_users", JSON.stringify(users));
    const u2 = { name, role: "user", username };
    localStorage.setItem("nawra_user", JSON.stringify(u2));
    setUser(u2); return { ok: true };
  };
  const logout = () => { localStorage.removeItem("nawra_user"); setUser(null); };
  return <AuthCtx.Provider value={{ user, login, register, logout }}>{children}</AuthCtx.Provider>;
}

// ─── Products Store ───────────────────────────────────────────────────────────
const PRODS_KEY = "nawra_products";
const ProdsCtx = createContext(null);
const useProds = () => useContext(ProdsCtx);

function ProdsProvider({ children, initialProds }) {
  const [prods, setProds] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(PRODS_KEY));
      return saved && saved.length ? saved : initialProds;
    } catch { return initialProds; }
  });
  const save = (p) => { setProds(p); localStorage.setItem(PRODS_KEY, JSON.stringify(p)); };
  const addProd = (p) => save([...prods, { ...p, id: Date.now(), stock: parseInt(p.stock)||10 }]);
  const updateStock = (id, qty) => save(prods.map(p => p.id === id ? { ...p, stock: Math.max(0, p.stock - qty) } : p));
  const delProd = (id) => save(prods.filter(p => p.id !== id));
  const editProd = (id, data) => save(prods.map(p => p.id === id ? { ...p, ...data } : p));
  return <ProdsCtx.Provider value={{ prods, addProd, delProd, editProd, updateStock }}>{children}</ProdsCtx.Provider>;
}

// ─── Orders Store ─────────────────────────────────────────────────────────────
const ORDERS_KEY = "nawra_orders";
const useOrders = () => {
  const getOrders = () => { try { return JSON.parse(localStorage.getItem(ORDERS_KEY)) || []; } catch { return []; } };
  const saveOrder = (o) => {
    const orders = getOrders();
    const newOrder = { ...o, id: Date.now(), date: new Date().toLocaleDateString("ar-EG"), status: "جديد" };
    localStorage.setItem(ORDERS_KEY, JSON.stringify([newOrder, ...orders]));
    return newOrder;
  };
  const updateStatus = (id, status) => {
    const orders = getOrders();
    const updated = orders.map(o => o.id === id ? { ...o, status } : o);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(updated));
  };
  return { getOrders, saveOrder, updateStatus };
};

const LOGO = "data:image/webp;base64,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";

const C = { cr:"#FBF7F4", bl:"#F5EBE8", go:"#B8963E", dk:"#2A1F0E", mu:"#9C7E6A", wh:"#FFFFFF", ro:"#C4956A" };
const isMob = () => window.innerWidth < 768;
function useMob() {
  const [m, setM] = useState(isMob);
  useEffect(() => { const h = () => setM(isMob()); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return m;
}

const PRODS = [
  { id:1, brand:"CERAVE", name:"غسول الوجه المرطب", desc:"غسول لطيف بالسيراميد — لكل أنواع البشرة", price:320, badge:"الأكثر مبيعاً", stars:5, bg:"linear-gradient(135deg,#E8F4F8,#C8E6F0)", icon:"🧴", det:"يحتوي على السيراميد وحمض الهيالورونيك. مناسب للاستخدام اليومي.", use:"ادلكيه على بشرة رطبة ثم اشطفيه بماء فاتر.", stock:10 },
  { id:2, brand:"THE ORDINARY", name:"سيروم النياسيناميد", desc:"يقلل المسام ويوحد لون البشرة", price:280, badge:"ترند TikTok", stars:5, bg:"linear-gradient(135deg,#F0EBE3,#D4C4B0)", icon:"💧", det:"10% نياسيناميد + 1% زنك للبشرة الدهنية.", use:"بعد الغسول وقبل المرطب. مرتين يومياً.", stock:10 },
  { id:3, brand:"LA ROCHE-POSAY", name:"واقي الشمس SPF50+", desc:"حماية قصوى — خفيف على البشرة الحساسة", price:450, badge:"جديد", stars:4, bg:"linear-gradient(135deg,#FFF8E8,#F0D89A)", icon:"☀️", det:"حماية UVA+UVB. مناسب للبشرة الحساسة.", use:"كآخر خطوة صباحاً قبل الخروج بـ 15 دقيقة.", stock:10 },
  { id:4, brand:"CERAVE", name:"كريم الترطيب", desc:"ترطيب عميق 24 ساعة — للوجه والجسم", price:380, badge:null, stars:5, bg:"linear-gradient(135deg,#EEF5F0,#C8DFC8)", icon:"✨", det:"سيراميد يدوم 24 ساعة. للبشرة الجافة.", use:"بعد الاستحمام على بشرة رطبة.", stock:10 },
  { id:5, brand:"THE ORDINARY", name:"سيروم فيتامين C", desc:"تفتيح وإشراقة — يعالج التصبغات", price:260, badge:null, stars:4, bg:"linear-gradient(135deg,#FFF4E0,#FFD98A)", icon:"🍋", det:"23% فيتامين C. يقلل البقع الداكنة.", use:"مساءً فقط. قطرة على الوجه النظيف.", stock:10 },
  { id:6, brand:"BIODERMA", name:"ماء مزيل المكياج", desc:"لطيف للبشرة الحساسة — بدون شطف", price:340, badge:"كلاسيك", stars:5, bg:"linear-gradient(135deg,#F5E8F0,#E0B8D0)", icon:"🌸", det:"ماء ميسيلار ينظف ويزيل المكياج بلطف.", use:"بللي قطنة وامسحي برفق.", stock:10 },
  { id:7, brand:"NEUTROGENA", name:"غسول وجه شفاف", desc:"يزيل الزيادة الزيتية ويبقي البشرة نظيفة", price:220, badge:null, stars:4, bg:"linear-gradient(135deg,#E8F0F5,#B8D4E8)", icon:"🫧", det:"خالٍ من الزيت للبشرة الدهنية والمختلطة.", use:"على بشرة مبللة وادلكي برفق ثم اشطفي.", stock:10 },
  { id:8, brand:"GARNIER", name:"كريم مرطب خفيف", desc:"ترطيب خفيف للاستخدام اليومي", price:190, badge:"قيمة ممتازة", stars:4, bg:"linear-gradient(135deg,#E8F5E8,#B8DFB8)", icon:"💚", det:"هيالورونيك. خفيف ويمتص سريعاً.", use:"على الوجه النظيف صباحاً ومساءً.", stock:10 },
  { id:9, brand:"NIVEA", name:"كريم الليل", desc:"يجدد البشرة أثناء النوم", price:250, badge:null, stars:4, bg:"linear-gradient(135deg,#E8EAF5,#B8BEE0)", icon:"🌙", det:"زبدة القمح وفيتامين E. ترطيب عميق.", use:"كآخر خطوة مساءً على بشرة نظيفة.", stock:10 },
];

const GOVS = ["القاهرة","الجيزة","الإسكندرية","الشرقية","الدقهلية","البحيرة","المنوفية","الغربية","القليوبية","أسيوط","سوهاج","قنا","الأقصر","أسوان","المنيا","بني سويف","الفيوم","بورسعيد","السويس","دمياط"];

// ─── Cart ───────────────────────────────────────────────────────────────────
const Ctx = createContext(null);
const useCart = () => useContext(Ctx);
function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const add = p => setCart(prev => { const ex = prev.find(i => i.id === p.id); return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]; });
  const rem = id => setCart(prev => prev.filter(i => i.id !== id));
  const upd = (id, q) => q <= 0 ? rem(id) : setCart(prev => prev.map(i => i.id === id ? { ...i, qty: q } : i));
  const clr = () => setCart([]);
  const tot = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cnt = cart.reduce((s, i) => s + i.qty, 0);
  const ship = tot > 0 && tot < 500 ? 50 : 0;
  return <Ctx.Provider value={{ cart, add, rem, upd, clr, tot, cnt, ship }}>{children}</Ctx.Provider>;
}

// ─── Router ──────────────────────────────────────────────────────────────────
function useRoute() {
  const [route, setRoute] = useState(() => window.location.hash || "#home");
  useEffect(() => { const h = () => setRoute(window.location.hash || "#home"); window.addEventListener("hashchange", h); return () => window.removeEventListener("hashchange", h); }, []);
  const nav = (href) => { window.location.hash = href; window.scrollTo(0, 0); };
  return { route, nav };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
const Stars = ({ n }) => <span style={{ color: C.go, fontSize: 12 }}>{Array(5).fill(0).map((_, i) => i < n ? "★" : "☆").join("")}</span>;

const Btn = ({ onClick, children, style = {} }) => (
  <button onClick={onClick} style={{ cursor: "pointer", fontFamily: "Tajawal,sans-serif", border: "none", ...style }}>{children}</button>
);

// ─── Toast ────────────────────────────────────────────────────────────────────
const ToastCtx = createContext(null);
function useToast() { return useContext(ToastCtx); }
function ToastProvider({ children }) {
  const [msg, setMsg] = useState("");
  const [vis, setVis] = useState(false);
  const show = (m) => {
    setMsg(m); setVis(true);
    setTimeout(() => setVis(false), 2500);
  };
  return (
    <ToastCtx.Provider value={{ show }}>
      {children}
      <div style={{
        position: "fixed", bottom: 24, left: "50%",
        transform: vis ? "translateX(-50%) translateY(0)" : "translateX(-50%) translateY(80px)",
        background: "#2A1F0E", color: "#F5EBE8",
        padding: "12px 24px", borderRadius: 2,
        fontSize: 13, fontFamily: "Tajawal,sans-serif", letterSpacing: 1,
        zIndex: 999, transition: "transform .35s cubic-bezier(.4,0,.2,1)",
        whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.25)",
        display: "flex", alignItems: "center", gap: 10
      }}>
        <span style={{color:"#B8963E", fontSize:16}}>✓</span> {msg}
      </div>
    </ToastCtx.Provider>
  );
}

// ─── ProductCard ─────────────────────────────────────────────────────────────
function Card({ p, go }) {
  const { add } = useCart();
  const { show } = useToast();
  const mob = useMob();
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.wh, overflow: "hidden", boxShadow: hov ? "0 6px 20px rgba(0,0,0,.1)" : "0 2px 6px rgba(0,0,0,.06)", transition: "all .3s", transform: hov && !mob ? "translateY(-3px)" : "none" }}>
      <div onClick={() => go(`#product-${p.id}`)} style={{ height: mob ? 170 : 230, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, position: "relative", cursor: "pointer" }}>
        {p.badge && <span style={{ position: "absolute", top: 8, right: 8, background: C.dk, color: C.cr, fontSize: 9, padding: "3px 8px", letterSpacing: 1 }}>{p.badge}</span>}
        {p.stock <= 3 && p.stock > 0 && <span style={{ position: "absolute", top: 8, left: 8, background: "#EF4444", color: "white", fontSize: 9, padding: "3px 8px" }}>آخر {p.stock} قطع</span>}
        {p.stock === 0 && <span style={{ position: "absolute", top: 8, left: 8, background: "#6B7280", color: "white", fontSize: 9, padding: "3px 8px" }}>نفد</span>}
        <span style={{ fontSize: mob ? 40 : 48 }}>{p.icon}</span>
        <span style={{ fontSize: 9, letterSpacing: 2, color: "#5C4A2A", fontWeight: 600 }}>{p.brand}</span>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(42,31,14,.88)", padding: "8px 10px", opacity: mob || hov ? 1 : 0, transition: "opacity .25s" }}>
          <Btn onClick={e => { e.stopPropagation(); add(p); show("تمت الإضافة للعربة 🛍️"); }} style={{ width: "100%", background: C.go, color: "#fff", padding: "6px 0", fontSize: 12 }}>+ أضيفي للعربة</Btn>
        </div>
      </div>
      <div style={{ padding: mob ? "10px" : "14px", cursor: "pointer" }} onClick={() => go(`#product-${p.id}`)}>
        <div style={{ fontSize: 9, color: C.go, letterSpacing: 2, marginBottom: 3 }}>{p.brand}</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 14 : 16, color: C.dk, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
        <div style={{ fontSize: 11, color: C.mu, lineHeight: 1.5, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.desc}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 18, color: C.dk }}>{p.price} <span style={{ fontSize: 11, color: C.mu, fontFamily: "sans-serif" }}>جنيه</span></span>
          <Stars n={p.stars} />
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Nav({ r, go, openCart, user, logout, onLogout }) {
  const { cnt } = useCart();
  const mob = useMob();
  const { prods: navProds } = useProds();
  const [open, setOpen] = useState(false);
  const links = [["#home","الرئيسية"],["#products","المنتجات"],["#about","عن نوّرة"],["#contact","تواصلي معنا"],["#shipping","الشحن والإرجاع"]];
  return (
    <>
      <nav style={{ background: C.wh, borderBottom: `1px solid rgba(184,150,62,.15)`, padding: mob ? "10px 16px" : "10px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200, direction: "rtl" }}>
        <div style={{ cursor: "pointer", fontFamily: "Georgia,serif", fontSize: mob ? 20 : 24, letterSpacing: 6, color: C.dk }} onClick={() => { go("#home"); setOpen(false); }}><img src={LOGO} alt="nawra" style={{height: mob ? 46 : 58, display:"block", objectFit:"contain"}} /></div>
        {!mob && (
          <div style={{display:"flex",alignItems:"center",gap:24}}>
            <ul style={{ display: "flex", gap: 20, listStyle: "none", margin: 0, padding: 0 }}>
              {links.map(([h, l]) => <li key={h}><span onClick={() => go(h)} style={{ cursor: "pointer", color: r === h ? C.go : C.dk, fontSize: 13, fontFamily: "Tajawal,sans-serif" }}>{l}</span></li>)}
            </ul>
            <SearchBar go={go} allProds={(navProds && navProds.length) ? navProds : PRODS} />
          </div>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          {user ? (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {!mob && <span style={{fontSize:12,color:C.mu,fontFamily:"Tajawal,sans-serif"}}>أهلاً، {user.name}</span>}
              {user.role==="admin" && <Btn onClick={()=>go("#admin")} style={{background:C.go,color:"white",padding:"5px 10px",fontSize:11,letterSpacing:1}}>Admin</Btn>}
              <Btn onClick={onLogout} style={{background:"none",border:`1px solid rgba(0,0,0,.15)`,color:C.mu,padding:"5px 10px",fontSize:11,fontFamily:"Tajawal,sans-serif"}}>خروج</Btn>
            </div>
          ) : (
            <Btn onClick={()=>go("#login")} style={{background:"none",border:`1px solid ${C.dk}`,color:C.dk,padding:"6px 12px",fontSize:12,fontFamily:"Tajawal,sans-serif"}}>دخول</Btn>
          )}
          <Btn onClick={openCart} style={{ background: "none", fontSize: 20, position: "relative", color: C.dk, padding: 0 }}>
            🛍️{cnt > 0 && <span style={{ position: "absolute", top: -5, left: -5, background: C.go, color: "#fff", fontSize: 9, width: 15, height: 15, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{cnt}</span>}
          </Btn>
          {mob && <Btn onClick={() => setOpen(!open)} style={{ background: "none", fontSize: 20, color: C.dk, padding: 0 }}>{open ? "✕" : "☰"}</Btn>}
        </div>
      </nav>
      {mob && open && (
        <div style={{ background: C.wh, borderBottom: `1px solid rgba(0,0,0,.07)`, padding: "6px 20px 14px", direction: "rtl", position: "sticky", top: 60, zIndex: 199 }}>
          {links.map(([h, l]) => <span key={h} onClick={() => { go(h); setOpen(false); }} style={{ display: "block", cursor: "pointer", color: r === h ? C.go : C.dk, fontSize: 15, fontFamily: "Tajawal,sans-serif", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}>{l}</span>)}
        </div>
      )}
    </>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSide({ open, close, go }) {
  const { cart, rem, upd, tot, ship, clr } = useCart();
  const mob = useMob();
  const [step, setStep] = useState(0); // 0=cart 1=checkout 2=done
  const [f, setF] = useState({ n: "", p: "", city: "", addr: "" });
  const W = mob ? "100vw" : "390px";

  if (step === 2) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.wh, padding: "36px 24px", textAlign: "center", maxWidth: 360, width: "100%", direction: "rtl" }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 300, marginBottom: 10, color: C.dk }}>تم استلام طلبك!</h3>
        <p style={{ color: C.mu, lineHeight: 1.7, marginBottom: 22, fontSize: 13, fontFamily: "Tajawal,sans-serif" }}>شكراً لثقتك في نوّرة 💕<br />هيتواصل معاكي فريقنا خلال 24 ساعة.<br />الدفع <strong>كاش عند الاستلام</strong>.</p>
        <Btn onClick={() => { setStep(0); close(); }} style={{ width: "100%", padding: 13, background: C.dk, color: C.cr, fontSize: 13, letterSpacing: 1 }}>متابعة التسوق</Btn>
      </div>
    </div>
  );

  const submit = () => {
    if (!f.n || !f.p || !f.city || !f.addr) { alert("من فضلك اكملي البيانات"); return; }
    // Save order to localStorage
    const order = {
      id: Date.now(), date: new Date().toLocaleDateString("ar-EG"),
      name: f.n, phone: f.p, city: f.city, address: f.addr,
      items: cart.map(i=>({name:i.name, qty:i.qty, price:i.price})),
      total: tot + ship, status: "جديد"
    };
    const orders = JSON.parse(localStorage.getItem("nawra_orders")||"[]");
    localStorage.setItem("nawra_orders", JSON.stringify([order, ...orders]));
    clr(); setStep(2);
  };

  const fld = (k, lbl, ph) => (
    <div style={{ marginBottom: 11 }}>
      <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: C.mu, marginBottom: 5, fontFamily: "Tajawal,sans-serif" }}>{lbl}</label>
      <input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph}
        style={{ width: "100%", padding: "10px 11px", border: "1px solid rgba(0,0,0,.12)", background: C.cr, fontFamily: "Tajawal,sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
    </div>
  );

  return (
    <>
      <div onClick={close} style={{ display: open ? "block" : "none", position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300 }} />
      <div style={{ position: "fixed", top: 0, left: open ? 0 : `-${W}`, width: W, height: "100vh", background: C.wh, zIndex: 301, transition: "left .35s", display: "flex", flexDirection: "column", direction: "rtl", overflowX: "hidden" }}>
        <div style={{ padding: "15px 18px", borderBottom: `1px solid rgba(184,150,62,.15)`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 19, color: C.dk }}>{step === 1 ? "إتمام الطلب" : "عربتي 🛍️"}</span>
          <Btn onClick={() => { close(); setStep(0); }} style={{ background: "none", fontSize: 20, color: C.mu, padding: 0 }}>✕</Btn>
        </div>

        {step === 1 ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
            <div style={{ background: C.bl, padding: "9px 12px", marginBottom: 13, borderRight: `3px solid ${C.go}`, fontSize: 12, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>💰 <b>كاش عند الاستلام</b></div>
            {fld("n", "الاسم", "اسمك")}{fld("p", "رقم الموبايل", "01xxxxxxxxx")}{fld("addr", "العنوان", "الشارع والمبنى")}
            <div style={{ marginBottom: 11 }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: C.mu, marginBottom: 5, fontFamily: "Tajawal,sans-serif" }}>المحافظة</label>
              <select value={f.city} onChange={e => setF({ ...f, city: e.target.value })} style={{ width: "100%", padding: "10px 11px", border: "1px solid rgba(0,0,0,.12)", background: C.cr, fontFamily: "Tajawal,sans-serif", fontSize: 13, outline: "none" }}>
                <option value="">اختاري</option>{GOVS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 12, marginBottom: 14 }}>
              {cart.map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5, color: C.dk, fontFamily: "Tajawal,sans-serif" }}><span>{i.name} × {i.qty}</span><span>{i.price * i.qty} جنيه</span></div>)}
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Georgia,serif", fontSize: 16, borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 9, marginTop: 6 }}><span>الإجمالي</span><span>{tot + ship} جنيه</span></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={() => setStep(0)} style={{ padding: "12px 14px", background: "none", border: "1px solid rgba(0,0,0,.15)", color: C.mu, fontSize: 12, whiteSpace: "nowrap" }}>← رجوع</Btn>
              <Btn onClick={submit} style={{ flex: 1, background: C.dk, color: C.cr, padding: 12, fontSize: 13, letterSpacing: 1 }}>تأكيد الطلب ✓</Btn>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
              {!cart.length ? (
                <div style={{ textAlign: "center", padding: "44px 16px", color: C.mu }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
                  <p style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 300, marginBottom: 18 }}>عربتك فاضية</p>
                  <Btn onClick={() => { close(); go("#products"); }} style={{ background: C.dk, color: C.cr, padding: "11px 22px", fontSize: 12 }}>تسوقي الآن</Btn>
                </div>
              ) : cart.map(i => (
                <div key={i.id} style={{ display: "flex", gap: 10, padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,.06)", alignItems: "center" }}>
                  <div style={{ width: 56, height: 56, background: i.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 3 }}><span style={{ fontSize: 22 }}>{i.icon}</span></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: 13, color: C.dk, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</div>
                    <div style={{ fontSize: 13, color: C.dk, fontWeight: 500, fontFamily: "Tajawal,sans-serif", marginTop: 2 }}>{i.price * i.qty} جنيه</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 5 }}>
                      <Btn onClick={() => upd(i.id, i.qty - 1)} style={{ width: 25, height: 25, border: `1px solid ${C.dk}`, background: "none", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</Btn>
                      <span style={{ fontSize: 13, minWidth: 16, textAlign: "center" }}>{i.qty}</span>
                      <Btn onClick={() => upd(i.id, i.qty + 1)} style={{ width: 25, height: 25, border: `1px solid ${C.dk}`, background: "none", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</Btn>
                    </div>
                  </div>
                  <Btn onClick={() => rem(i.id)} style={{ background: "none", color: C.mu, fontSize: 16, padding: 0, flexShrink: 0 }}>✕</Btn>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: "13px 18px", borderTop: `1px solid rgba(184,150,62,.15)`, flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 11, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>الإجمالي</span>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 18, color: C.dk }}>{tot} جنيه</span>
                </div>
                {ship > 0 && <div style={{ fontSize: 11, color: C.mu, marginBottom: 6, fontFamily: "Tajawal,sans-serif" }}>+ {ship} جنيه شحن | أضيفي {500 - tot} للشحن المجاني</div>}
                {ship === 0 && <div style={{ fontSize: 11, color: "#2E6B3E", marginBottom: 6, fontFamily: "Tajawal,sans-serif" }}>✓ شحن مجاني</div>}
                <div style={{ background: C.bl, padding: "8px 11px", fontSize: 11, color: C.mu, marginBottom: 10, fontFamily: "Tajawal,sans-serif" }}>💰 كاش عند الاستلام فقط</div>
                <Btn onClick={() => setStep(1)} style={{ width: "100%", background: C.dk, color: C.cr, padding: 13, fontSize: 13, letterSpacing: 1, marginBottom: 7 }}>إتمام الطلب</Btn>
                <Btn onClick={close} style={{ width: "100%", background: "transparent", color: C.mu, border: "1px solid rgba(0,0,0,.1)", padding: 11, fontSize: 12 }}>← متابعة التسوق</Btn>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
}

// ─── Login Page ───────────────────────────────────────────────────────────────
function LoginPage({ go }) {
  const { login, register } = useAuth();
  const mob = useMob();
  const [tab, setTab] = useState("login");
  const [f, setF] = useState({ name:"", username:"", pass:"", pass2:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setErr(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === "login") {
        const r = login(f.username, f.pass);
        if (r.ok) go("#home"); else setErr(r.err);
      } else {
        if (!f.name || !f.username || !f.pass) return setErr("من فضلك اكمل البيانات");
        if (f.pass !== f.pass2) return setErr("كلمة المرور مش متطابقة");
        const r = register(f.name, f.username, f.pass);
        if (r.ok) go("#home"); else setErr(r.err);
      }
    }, 400);
  };

  const inp = (k, lbl, ph, type="text") => (
    <div style={{marginBottom:14}}>
      <label style={{display:"block",fontSize:10,letterSpacing:2,color:C.mu,marginBottom:5,fontFamily:"Tajawal,sans-serif"}}>{lbl}</label>
      <input type={type} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}
        onKeyDown={e=>e.key==="Enter"&&submit()}
        placeholder={ph} style={{width:"100%",padding:"11px 13px",border:"1px solid rgba(0,0,0,.12)",background:C.cr,fontFamily:"Tajawal,sans-serif",fontSize:14,outline:"none",boxSizing:"border-box"}}/>
    </div>
  );

  return (
    <div style={{direction:"rtl",minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.bl},${C.cr})`}}>
      <div style={{background:C.wh,padding:mob?"28px 20px":"44px",width:mob?"92%":"420px",boxShadow:"0 8px 40px rgba(0,0,0,.10)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LOGO} alt="nawra" style={{height:80,display:"block",margin:"0 auto 14px"}}/>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid rgba(0,0,0,.1)",marginBottom:24}}>
          {[["login","تسجيل الدخول"],["register","حساب جديد"]].map(([k,l])=>(
            <button key={k} onClick={()=>{setTab(k);setErr("");}} style={{flex:1,padding:"11px 0",background:"none",border:"none",borderBottom:tab===k?`2px solid ${C.dk}`:"2px solid transparent",cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:14,color:tab===k?C.dk:C.mu,fontWeight:tab===k?500:300}}>{l}</button>
          ))}
        </div>
        {tab==="register" && inp("name","الاسم الكامل","اسمك")}
        {inp("username","اسم المستخدم","username")}
        {inp("pass","كلمة المرور","••••••••","password")}
        {tab==="register" && inp("pass2","تأكيد كلمة المرور","••••••••","password")}
        {err && <div style={{background:"#FEE2E2",color:"#DC2626",padding:"9px 12px",marginBottom:14,fontSize:12,fontFamily:"Tajawal,sans-serif",borderRight:"3px solid #DC2626"}}>{err}</div>}
        <button onClick={submit} disabled={loading}
          style={{width:"100%",background:loading?C.mu:C.dk,color:C.cr,border:"none",padding:14,cursor:loading?"not-allowed":"pointer",fontFamily:"Tajawal,sans-serif",fontSize:14,letterSpacing:1,transition:"background .2s"}}>
          {loading?"جاري التحقق...":tab==="login"?"دخول":"إنشاء الحساب"}
        </button>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
function AdminDash({ go }) {
  const { prods, addProd, delProd, editProd } = useProds();
  const mob = useMob();
  const [tab, setTab] = useState("overview");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newP, setNewP] = useState({ name:"", brand:"", desc:"", price:"", stock:"10", icon:"✨", badge:"", bg:"linear-gradient(135deg,#F5EBE8,#E8D5C4)" });
  const [delConfirm, setDelConfirm] = useState(null);
  const orders = (() => { try { return JSON.parse(localStorage.getItem("nawra_orders")||"[]"); } catch { return []; } })();
  const [orderList, setOrderList] = useState(orders);
  const [statusEdit, setStatusEdit] = useState({});

  const totalRev = orderList.reduce((s,o)=>s+(o.total||0),0);
  const totalOrders = orderList.length;
  const avgOrder = totalOrders ? Math.round(totalRev/totalOrders) : 0;

  const ICONS = ["✨","🧴","💧","☀️","🌸","🍋","🫧","💚","🌙","🌿","💫","🪷"];
  const COLORS = [
    "linear-gradient(135deg,#E8F4F8,#C8E6F0)",
    "linear-gradient(135deg,#F0EBE3,#D4C4B0)",
    "linear-gradient(135deg,#FFF8E8,#F0D89A)",
    "linear-gradient(135deg,#EEF5F0,#C8DFC8)",
    "linear-gradient(135deg,#F5E8F0,#E0B8D0)",
    "linear-gradient(135deg,#FFF4E0,#FFD98A)",
    "linear-gradient(135deg,#E8EAF5,#B8BEE0)",
  ];

  const pInp = (k, lbl, ph, type="text") => (
    <div style={{marginBottom:11}}>
      <label style={{display:"block",fontSize:10,letterSpacing:2,color:C.mu,marginBottom:5,fontFamily:"Tajawal,sans-serif"}}>{lbl}</label>
      <input type={type} value={newP[k]} onChange={e=>setNewP({...newP,[k]:e.target.value})} placeholder={ph}
        style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(0,0,0,.12)",background:C.cr,fontFamily:"Tajawal,sans-serif",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
    </div>
  );

  const saveProduct = () => {
    if (!newP.name||!newP.price) return;
    if (editId) { editProd(editId, {...newP, price:parseInt(newP.price), stars:5, det:"", use:""}); setEditId(null); }
    else addProd({...newP, price:parseInt(newP.price), stars:5, det:"وصف تفصيلي للمنتج", use:"طريقة الاستخدام", stock:10});
    setNewP({name:"",brand:"",desc:"",price:"",icon:"✨",badge:"",bg:"linear-gradient(135deg,#F5EBE8,#E8D5C4)"});
    setShowAdd(false);
  };

  const startEdit = (p) => {
    setNewP({name:p.name,brand:p.brand,desc:p.desc,price:String(p.price),stock:String(p.stock||0),icon:p.icon,badge:p.badge||"",bg:p.bg});
    setEditId(p.id); setShowAdd(true);
  };

  const updateOrderStatus = (id, status) => {
    const updated = orderList.map(o=>o.id===id?{...o,status}:o);
    setOrderList(updated);
    localStorage.setItem("nawra_orders", JSON.stringify(updated));
    setStatusEdit({});
  };

  const statCard = (label, value, color="#2A1F0E") => (
    <div style={{background:C.wh,padding:mob?"16px":"20px",boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
      <div style={{fontSize:10,letterSpacing:2,color:C.mu,marginBottom:6,fontFamily:"Tajawal,sans-serif"}}>{label}</div>
      <div style={{fontFamily:"Georgia,serif",fontSize:mob?22:28,color,fontWeight:400}}>{value}</div>
    </div>
  );

  const tabs = [["overview","📊 نظرة عامة"],["products","📦 المنتجات"],["orders","🧾 الطلبات"]];

  return (
    <div style={{direction:"rtl",minHeight:"80vh",background:"#F8F6F3"}}>
      {/* Header */}
      <div style={{background:C.dk,padding:mob?"14px 16px":"16px 40px",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
        <div>
          <div style={{fontFamily:"Georgia,serif",fontSize:mob?14:18,color:C.bl,letterSpacing:3}}>NAWRA ADMIN</div>
          <div style={{fontSize:10,color:C.go,letterSpacing:2,fontFamily:"Tajawal,sans-serif"}}>لوحة التحكم</div>
        </div>
        <button onClick={()=>go("#home")} style={{background:"none",border:"1px solid rgba(245,235,232,.3)",color:C.bl,padding:"7px 14px",cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:12}}>← الموقع</button>
      </div>

      {/* Tabs */}
      <div style={{background:C.wh,borderBottom:"1px solid rgba(0,0,0,.08)",padding:mob?"0 16px":"0 40px",display:"flex",gap:0,overflowX:"auto"}}>
        {tabs.map(([k,l])=>(
          <button key={k} onClick={()=>setTab(k)} style={{padding:mob?"12px 14px":"14px 20px",background:"none",border:"none",borderBottom:tab===k?`2px solid ${C.dk}`:"2px solid transparent",cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:mob?12:13,color:tab===k?C.dk:C.mu,whiteSpace:"nowrap",fontWeight:tab===k?500:300}}>{l}</button>
        ))}
      </div>

      <div style={{padding:mob?"16px":"24px 40px",maxWidth:1100,margin:"0 auto"}}>

        {/* OVERVIEW */}
        {tab==="overview" && (
          <div>
            <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:mob?12:16,marginBottom:24}}>
              {statCard("إجمالي المبيعات", totalRev.toLocaleString()+" جنيه", C.go)}
              {statCard("عدد الطلبات", totalOrders)}
              {statCard("متوسط الطلب", avgOrder+" جنيه")}
              {statCard("المنتجات", prods.length)}
            </div>
            {/* Recent orders */}
            <div style={{background:C.wh,padding:mob?"16px":"20px",boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
              <h3 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:400,color:C.dk,marginBottom:16}}>آخر الطلبات</h3>
              {orderList.length===0 ? (
                <p style={{color:C.mu,fontFamily:"Tajawal,sans-serif",fontSize:13,textAlign:"center",padding:"24px 0"}}>مفيش طلبات لحد دلوقتي</p>
              ) : orderList.slice(0,5).map(o=>(
                <div key={o.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
                  <div>
                    <div style={{fontSize:14,color:C.dk,fontFamily:"Tajawal,sans-serif"}}>{o.name} — {o.city}</div>
                    <div style={{fontSize:11,color:C.mu,fontFamily:"Tajawal,sans-serif",marginTop:2}}>{o.date} | {o.phone}</div>
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontFamily:"Georgia,serif",fontSize:16,color:C.dk}}>{(o.total||0)} جنيه</div>
                    <div style={{fontSize:10,padding:"2px 8px",background:o.status==="مكتمل"?"#D1FAE5":o.status==="ملغي"?"#FEE2E2":"#FEF3C7",color:o.status==="مكتمل"?"#065F46":o.status==="ملغي"?"#DC2626":"#92400E",borderRadius:10,marginTop:3,fontFamily:"Tajawal,sans-serif",textAlign:"center"}}>{o.status}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* PRODUCTS */}
        {tab==="products" && (
          <div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
              <h3 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:400,color:C.dk,margin:0}}>المنتجات ({prods.length})</h3>
              <button onClick={()=>{setShowAdd(!showAdd);setEditId(null);setNewP({name:"",brand:"",desc:"",price:"",icon:"✨",badge:"",bg:COLORS[0]});}}
                style={{background:C.dk,color:C.cr,border:"none",padding:"9px 18px",cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:13}}>
                {showAdd?"إلغاء":"+ إضافة منتج"}
              </button>
            </div>

            {/* Add/Edit Form */}
            {showAdd && (
              <div style={{background:C.wh,padding:mob?"16px":"20px",marginBottom:20,boxShadow:"0 2px 8px rgba(0,0,0,.07)"}}>
                <h4 style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:400,color:C.dk,marginBottom:16}}>{editId?"تعديل المنتج":"إضافة منتج جديد"}</h4>
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?0:16}}>
                  <div>{pInp("name","اسم المنتج","مثال: سيروم النياسيناميد")}{pInp("brand","البراند","مثال: THE ORDINARY")}{pInp("price","السعر (جنيه)","280","number")}{pInp("stock","الكمية في المخزون","10","number")}</div>
                  <div>{pInp("desc","الوصف","وصف مختصر للمنتج")}{pInp("badge","Badge (اختياري)","مثال: جديد")}
                    <div style={{marginBottom:11}}>
                      <label style={{display:"block",fontSize:10,letterSpacing:2,color:C.mu,marginBottom:5,fontFamily:"Tajawal,sans-serif"}}>الأيقونة</label>
                      <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                        {ICONS.map(ic=><button key={ic} onClick={()=>setNewP({...newP,icon:ic})} style={{fontSize:20,background:newP.icon===ic?C.bl:"none",border:newP.icon===ic?`1px solid ${C.go}`:"1px solid rgba(0,0,0,.1)",width:36,height:36,cursor:"pointer",borderRadius:4}}>{ic}</button>)}
                      </div>
                    </div>
                    <div>
                      <label style={{display:"block",fontSize:10,letterSpacing:2,color:C.mu,marginBottom:5,fontFamily:"Tajawal,sans-serif"}}>لون الخلفية</label>
                      <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                        {COLORS.map(c=><div key={c} onClick={()=>setNewP({...newP,bg:c})} style={{width:28,height:28,background:c,cursor:"pointer",border:newP.bg===c?`2px solid ${C.dk}`:"2px solid transparent",borderRadius:3}}/>)}
                      </div>
                    </div>
                  </div>
                </div>
                {/* Preview */}
                <div style={{marginTop:14,padding:14,background:newP.bg,display:"flex",alignItems:"center",gap:14}}>
                  <span style={{fontSize:36}}>{newP.icon}</span>
                  <div>
                    <div style={{fontSize:10,color:"#5C4A2A",letterSpacing:2}}>{newP.brand}</div>
                    <div style={{fontFamily:"Georgia,serif",fontSize:16,color:C.dk}}>{newP.name||"اسم المنتج"}</div>
                    <div style={{fontFamily:"Georgia,serif",fontSize:18,color:C.dk,marginTop:4}}>{newP.price||"0"} جنيه</div>
                  </div>
                </div>
                <div style={{display:"flex",gap:10,marginTop:14}}>
                  <button onClick={saveProduct} style={{flex:1,background:C.dk,color:C.cr,border:"none",padding:12,cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:13}}>
                    {editId?"حفظ التعديلات":"إضافة المنتج"}
                  </button>
                  <button onClick={()=>{setShowAdd(false);setEditId(null);}} style={{padding:"12px 18px",background:"none",border:"1px solid rgba(0,0,0,.15)",cursor:"pointer",color:C.mu,fontFamily:"Tajawal,sans-serif",fontSize:12}}>إلغاء</button>
                </div>
              </div>
            )}

            {/* Products list */}
            <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
              {prods.map(p=>(
                <div key={p.id} style={{background:C.wh,display:"flex",gap:12,padding:14,boxShadow:"0 2px 6px rgba(0,0,0,.06)",alignItems:"center"}}>
                  <div style={{width:56,height:56,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,borderRadius:4}}>
                    <span style={{fontSize:24}}>{p.icon}</span>
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:9,color:C.go,letterSpacing:2,fontFamily:"Tajawal,sans-serif"}}>{p.brand}</div>
                    <div style={{fontFamily:"Georgia,serif",fontSize:14,color:C.dk,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                    <div style={{fontSize:13,color:C.dk,fontFamily:"Tajawal,sans-serif",marginTop:2}}>{p.price} جنيه</div>
                    <div style={{fontSize:11,fontFamily:"Tajawal,sans-serif",marginTop:2,color:p.stock===0?"#EF4444":p.stock<=3?"#F59E0B":"#10B981"}}>
                      {p.stock===0?"نفد المخزون":p.stock<=3?`آخر ${p.stock} قطع`:`${p.stock} قطعة`}
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6,flexShrink:0}}>
                    <button onClick={()=>startEdit(p)} style={{background:C.bl,border:"none",padding:"6px 12px",cursor:"pointer",fontSize:12,fontFamily:"Tajawal,sans-serif",color:C.dk}}>تعديل</button>
                    {delConfirm===p.id ? (
                      <div style={{display:"flex",gap:4}}>
                        <button onClick={()=>{delProd(p.id);setDelConfirm(null);}} style={{background:"#DC2626",color:"white",border:"none",padding:"6px 10px",cursor:"pointer",fontSize:11,fontFamily:"Tajawal,sans-serif"}}>تأكيد</button>
                        <button onClick={()=>setDelConfirm(null)} style={{background:"none",border:"1px solid rgba(0,0,0,.15)",padding:"6px 8px",cursor:"pointer",fontSize:11,color:C.mu,fontFamily:"Tajawal,sans-serif"}}>لا</button>
                      </div>
                    ) : (
                      <button onClick={()=>setDelConfirm(p.id)} style={{background:"none",border:"1px solid rgba(220,38,38,.3)",color:"#DC2626",padding:"6px 10px",cursor:"pointer",fontSize:12,fontFamily:"Tajawal,sans-serif"}}>حذف</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ORDERS */}
        {tab==="orders" && (
          <div>
            <h3 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:400,color:C.dk,marginBottom:16}}>الطلبات ({orderList.length})</h3>
            {orderList.length===0 ? (
              <div style={{background:C.wh,padding:"40px",textAlign:"center",color:C.mu,fontFamily:"Tajawal,sans-serif"}}>
                <div style={{fontSize:40,marginBottom:12}}>🧾</div>
                <p>مفيش طلبات لحد دلوقتي</p>
              </div>
            ) : orderList.map(o=>(
              <div key={o.id} style={{background:C.wh,padding:mob?"14px":"18px",marginBottom:10,boxShadow:"0 2px 6px rgba(0,0,0,.06)"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",flexWrap:"wrap",gap:8}}>
                  <div>
                    <div style={{fontSize:15,color:C.dk,fontFamily:"Tajawal,sans-serif",fontWeight:500}}>{o.name}</div>
                    <div style={{fontSize:12,color:C.mu,fontFamily:"Tajawal,sans-serif",marginTop:3}}>{o.phone} | {o.city} | {o.date}</div>
                    <div style={{fontSize:12,color:C.mu,fontFamily:"Tajawal,sans-serif",marginTop:2}}>{o.address}</div>
                    <div style={{marginTop:8}}>
                      {(o.items||[]).map((item,i)=>(
                        <span key={i} style={{display:"inline-block",background:C.bl,padding:"2px 8px",fontSize:11,color:C.dk,fontFamily:"Tajawal,sans-serif",marginLeft:4,marginBottom:3}}>{item.name} × {item.qty}</span>
                      ))}
                    </div>
                  </div>
                  <div style={{textAlign:"left"}}>
                    <div style={{fontFamily:"Georgia,serif",fontSize:18,color:C.dk}}>{o.total||0} جنيه</div>
                    <div style={{marginTop:6}}>
                      {statusEdit[o.id] ? (
                        <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                          {["جديد","قيد التجهيز","تم الشحن","مكتمل","ملغي"].map(s=>(
                            <button key={s} onClick={()=>updateOrderStatus(o.id,s)} style={{padding:"4px 8px",background:o.status===s?C.dk:"none",color:o.status===s?C.cr:C.dk,border:`1px solid ${C.dk}`,cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:10}}>{s}</button>
                          ))}
                        </div>
                      ) : (
                        <div style={{display:"flex",gap:6,alignItems:"center"}}>
                          <span style={{fontSize:11,padding:"3px 10px",background:o.status==="مكتمل"?"#D1FAE5":o.status==="ملغي"?"#FEE2E2":"#FEF3C7",color:o.status==="مكتمل"?"#065F46":o.status==="ملغي"?"#DC2626":"#92400E",fontFamily:"Tajawal,sans-serif"}}>{o.status}</span>
                          <button onClick={()=>setStatusEdit({...statusEdit,[o.id]:true})} style={{background:"none",border:"1px solid rgba(0,0,0,.15)",padding:"3px 8px",cursor:"pointer",fontSize:10,color:C.mu,fontFamily:"Tajawal,sans-serif"}}>تغيير</button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── WhatsApp Float ───────────────────────────────────────────────────────────
function WAFloat() {
  const [show, setShow] = useState(false);
  const WA_NUM = "201000000000"; // ← غير الرقم ده لرقمك
  const msg = encodeURIComponent("مرحباً، أريد الاستفسار عن منتج من نوّرة 💕");
  return (
    <div style={{position:"fixed",bottom:24,left:24,zIndex:500,direction:"ltr"}}>
      {show && (
        <div style={{background:"white",borderRadius:12,padding:16,marginBottom:10,
          boxShadow:"0 4px 20px rgba(0,0,0,.15)",maxWidth:220,direction:"rtl",
          animation:"fadeIn .2s ease"}}>
          <div style={{fontSize:13,color:"#2A1F0E",fontFamily:"Tajawal,sans-serif",marginBottom:10,lineHeight:1.6}}>
            👋 أهلاً!<br/>محتاجة مساعدة في اختيار المنتج؟
          </div>
          <a href={`https://wa.me/${WA_NUM}?text=${msg}`} target="_blank" rel="noreferrer"
            style={{display:"block",background:"#25D366",color:"white",padding:"9px 14px",
              borderRadius:8,textDecoration:"none",fontSize:13,fontFamily:"Tajawal,sans-serif",
              textAlign:"center",fontWeight:500}}>
            ابدئي المحادثة
          </a>
        </div>
      )}
      <button onClick={()=>setShow(!show)}
        style={{width:54,height:54,borderRadius:"50%",background:"#25D366",border:"none",
          cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
          boxShadow:"0 4px 16px rgba(37,211,102,.4)",transition:"transform .2s",
          transform:show?"scale(1.1)":"scale(1)"}}>
        {show ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white"><path d="M18 6L6 18M6 6l12 12" stroke="white" strokeWidth="2.5" strokeLinecap="round"/></svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z" fillRule="evenodd" clipRule="evenodd"/>
          </svg>
        )}
      </button>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ─── Search ───────────────────────────────────────────────────────────────────
function SearchBar({ go, allProds }) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);
  const mob = useMob();
  const results = q.length > 1
    ? (allProds||PRODS).filter(p =>
        p.name.includes(q) || p.brand.toLowerCase().includes(q.toLowerCase()) || p.desc.includes(q)
      ).slice(0, 5)
    : [];

  useEffect(() => {
    const h = (e) => { if (e.key === "Escape") { setQ(""); setOpen(false); }};
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, []);

  return (
    <div style={{position:"relative",direction:"rtl"}}>
      <div style={{display:"flex",alignItems:"center",background:"#F5EBE8",borderRadius:2,padding:mob?"6px 10px":"7px 12px",gap:8,border:"1px solid rgba(184,150,62,.2)"}}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9C7E6A" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
        <input value={q} onChange={e=>{setQ(e.target.value);setOpen(true);}}
          onFocus={()=>setOpen(true)}
          placeholder="ابحثي عن منتج..."
          style={{border:"none",background:"none",outline:"none",fontFamily:"Tajawal,sans-serif",
            fontSize:13,color:"#2A1F0E",width:mob?120:180,direction:"rtl"}}/>
        {q && <button onClick={()=>{setQ("");setOpen(false);}} style={{background:"none",border:"none",cursor:"pointer",color:"#9C7E6A",fontSize:14,padding:0}}>✕</button>}
      </div>
      {open && results.length>0 && (
        <div style={{position:"absolute",top:"calc(100% + 6px)",right:0,background:"white",
          width:280,boxShadow:"0 8px 24px rgba(0,0,0,.12)",zIndex:300,direction:"rtl"}}>
          {results.map(p=>(
            <div key={p.id} onClick={()=>{go(`#product-${p.id}`);setQ("");setOpen(false);}}
              style={{display:"flex",gap:10,padding:"10px 14px",cursor:"pointer",
                borderBottom:"1px solid rgba(0,0,0,.05)",alignItems:"center"}}
              onMouseEnter={e=>e.currentTarget.style.background="#F5EBE8"}
              onMouseLeave={e=>e.currentTarget.style.background="white"}>
              <div style={{width:36,height:36,background:p.bg,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,borderRadius:3,fontSize:18}}>{p.icon}</div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:9,color:"#B8963E",letterSpacing:2,fontFamily:"Tajawal,sans-serif"}}>{p.brand}</div>
                <div style={{fontSize:13,color:"#2A1F0E",fontFamily:"Tajawal,sans-serif",overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                <div style={{fontSize:12,color:"#9C7E6A",fontFamily:"Tajawal,sans-serif"}}>{p.price} جنيه</div>
              </div>
            </div>
          ))}
          <div onClick={()=>{go("#products");setQ("");setOpen(false);}}
            style={{padding:"9px 14px",textAlign:"center",fontSize:12,color:"#B8963E",
              cursor:"pointer",fontFamily:"Tajawal,sans-serif",borderTop:"1px solid rgba(0,0,0,.05)"}}>
            عرض كل النتائج ←
          </div>
        </div>
      )}
      {open && q && <div onClick={()=>{setQ("");setOpen(false);}} style={{position:"fixed",inset:0,zIndex:299}}/>}
    </div>
  );
}

// ─── Reviews ──────────────────────────────────────────────────────────────────
function Reviews({ productId }) {
  const REVIEWS_KEY = `nawra_reviews_${productId}`;
  const { user } = useAuth();
  const mob = useMob();
  const [reviews, setReviews] = useState(() => {
    try { return JSON.parse(localStorage.getItem(REVIEWS_KEY)) || []; } catch { return []; }
  });
  const [form, setForm] = useState({ rating: 5, comment: "", name: "" });
  const [submitted, setSubmitted] = useState(false);

  const avg = reviews.length ? (reviews.reduce((s,r)=>s+r.rating,0)/reviews.length).toFixed(1) : null;

  const submit = () => {
    if (!form.comment.trim()) return;
    const newR = {
      id: Date.now(),
      name: user?.name || form.name || "عميلة",
      rating: form.rating,
      comment: form.comment,
      date: new Date().toLocaleDateString("ar-EG")
    };
    const updated = [newR, ...reviews];
    setReviews(updated);
    localStorage.setItem(REVIEWS_KEY, JSON.stringify(updated));
    setForm({ rating: 5, comment: "", name: "" });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div style={{maxWidth:1050,margin:"0 auto",padding:mob?"0 16px 32px":"0 56px 40px",direction:"rtl"}}>
      <div style={{borderTop:"1px solid rgba(0,0,0,.08)",paddingTop:28}}>
        <div style={{display:"flex",alignItems:"center",gap:16,marginBottom:24,flexWrap:"wrap"}}>
          <h3 style={{fontFamily:"Georgia,serif",fontSize:mob?18:22,fontWeight:400,color:"#2A1F0E",margin:0}}>
            آراء العملاء
          </h3>
          {avg && (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:24,color:"#2A1F0E"}}>{avg}</span>
              <span style={{color:"#B8963E",fontSize:16}}>{Array(5).fill(0).map((_,i)=>i<Math.round(avg)?"★":"☆").join("")}</span>
              <span style={{fontSize:12,color:"#9C7E6A",fontFamily:"Tajawal,sans-serif"}}>({reviews.length} تقييم)</span>
            </div>
          )}
        </div>

        {/* Review list */}
        <div style={{marginBottom:28}}>
          {reviews.length===0 ? (
            <p style={{color:"#9C7E6A",fontFamily:"Tajawal,sans-serif",fontSize:13,padding:"20px 0"}}>
              كوني أول من تقيّم هذا المنتج ✨
            </p>
          ) : reviews.map(r=>(
            <div key={r.id} style={{padding:"14px 0",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"#F5EBE8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#B8963E",fontWeight:600,fontFamily:"Tajawal,sans-serif"}}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div style={{fontSize:13,color:"#2A1F0E",fontFamily:"Tajawal,sans-serif",fontWeight:500}}>{r.name}</div>
                    <div style={{color:"#B8963E",fontSize:12}}>{Array(5).fill(0).map((_,i)=>i<r.rating?"★":"☆").join("")}</div>
                  </div>
                </div>
                <span style={{fontSize:11,color:"#9C7E6A",fontFamily:"Tajawal,sans-serif"}}>{r.date}</span>
              </div>
              <p style={{fontSize:13,color:"#9C7E6A",lineHeight:1.7,margin:0,fontFamily:"Tajawal,sans-serif",paddingRight:42}}>{r.comment}</p>
            </div>
          ))}
        </div>

        {/* Add review form */}
        <div style={{background:"#F5EBE8",padding:mob?"16px":"20px"}}>
          <h4 style={{fontFamily:"Georgia,serif",fontSize:16,fontWeight:400,color:"#2A1F0E",marginBottom:14}}>
            أضيفي تقييمك
          </h4>
          {submitted ? (
            <div style={{color:"#10B981",fontFamily:"Tajawal,sans-serif",fontSize:14,padding:"10px 0"}}>✓ شكراً لتقييمك!</div>
          ) : (
            <>
              {!user && (
                <div style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:10,letterSpacing:2,color:"#9C7E6A",marginBottom:5,fontFamily:"Tajawal,sans-serif"}}>الاسم</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="اسمك"
                    style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(0,0,0,.12)",background:"white",fontFamily:"Tajawal,sans-serif",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>
              )}
              <div style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:10,letterSpacing:2,color:"#9C7E6A",marginBottom:8,fontFamily:"Tajawal,sans-serif"}}>التقييم</label>
                <div style={{display:"flex",gap:6}}>
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setForm({...form,rating:n})}
                      style={{fontSize:24,background:"none",border:"none",cursor:"pointer",
                        color:n<=form.rating?"#B8963E":"#D1D5DB",transition:"transform .1s",
                        transform:n<=form.rating?"scale(1.1)":"scale(1)",padding:0}}>★</button>
                  ))}
                </div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:10,letterSpacing:2,color:"#9C7E6A",marginBottom:5,fontFamily:"Tajawal,sans-serif"}}>رأيك في المنتج</label>
                <textarea value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})}
                  rows={3} placeholder="شاركي تجربتك مع المنتج..."
                  style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(0,0,0,.12)",background:"white",fontFamily:"Tajawal,sans-serif",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <button onClick={submit}
                style={{background:"#2A1F0E",color:"#FBF7F4",border:"none",padding:"11px 24px",
                  cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:13,letterSpacing:1}}>
                إرسال التقييم
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function Home({ go, prods, allProds }) {
  const { prods: _p } = useProds();
  const homProds = allProds || prods || _p || PRODS;
  const mob = useMob();
  const px = mob ? "16px" : "56px";
  return (
    <div style={{ direction: "rtl" }}>
      <div style={{ background: C.dk, color: C.bl, textAlign: "center", padding: "8px", fontSize: mob ? 11 : 13, letterSpacing: 1, fontFamily: "Tajawal,sans-serif" }}>شحن مجاني فوق 500 جنيه &nbsp;✦&nbsp; كاش عند الاستلام</div>
      <section style={{ background: `linear-gradient(135deg,${C.bl},${C.cr},#EDE3DC)`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: mob ? "44px 20px" : "72px 40px", minHeight: mob ? "55vh" : "78vh" }}>
        <div>
          <div style={{ fontFamily: "Georgia,serif", display:"none"}}>x</div>
          <img src={LOGO} alt="nawra" style={{height: mob ? 110 : 140, display:"block", margin: mob ? "0 auto 16px" : "0 auto 20px"}} />
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? "clamp(26px,8vw,38px)" : "clamp(36px,5vw,58px)", fontWeight: 300, color: C.dk, lineHeight: 1.2, marginBottom: 14 }}>جمالك يبدأ من <em style={{ color: C.ro }}>هنا</em></h1>
          <p style={{ fontSize: mob ? 13 : 15, color: C.mu, lineHeight: 1.8, marginBottom: 28, fontFamily: "Tajawal,sans-serif", fontWeight: 300 }}>منتجات عناية مختارة من أفضل البراندات العالمية<br />توصيل سريع لكل محافظات مصر</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => go("#products")} style={{ background: C.dk, color: C.cr, padding: mob ? "11px 22px" : "13px 30px", fontSize: 12, letterSpacing: 2 }}>تسوّقي الآن</Btn>
            <Btn onClick={() => go("#about")} style={{ background: "transparent", color: C.dk, padding: mob ? "11px 22px" : "13px 30px", border: `1px solid ${C.dk}`, fontSize: 12, letterSpacing: 2 }}>تعرفي علينا</Btn>
          </div>
        </div>
      </section>
      <div style={{ background: C.dk, padding: "11px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-block", animation: "mq 22s linear infinite" }}>
          {["CERAVE","✦","THE ORDINARY","✦","LA ROCHE-POSAY","✦","NEUTROGENA","✦","GARNIER","✦","BIODERMA","✦","CERAVE","✦","THE ORDINARY","✦","LA ROCHE-POSAY","✦","NEUTROGENA","✦","GARNIER","✦","BIODERMA","✦"].map((t, i) => (
            <span key={i} style={{ color: t === "✦" ? C.go : C.bl, fontSize: 10, letterSpacing: 3, padding: "0 16px", fontFamily: "Tajawal,sans-serif" }}>{t}</span>
          ))}
        </div>
      </div>
      <section style={{ background: C.wh, padding: mob ? "22px 16px" : "32px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)", gap: mob ? 12 : 22, maxWidth: 1050, margin: "0 auto", textAlign: "center" }}>
          {[["🚚","توصيل سريع","2-4 أيام"],["💳","كاش عند الاستلام","ادفعي لما يوصلك"],["✅","منتجات أصلية","موصى بها جلدياً"],["↩️","إرجاع مجاني","خلال 14 يوم"]].map(([ic, t, d]) => (
            <div key={t}>
              <div style={{ fontSize: mob ? 20 : 24, color: C.go, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 13 : 14, color: C.dk, marginBottom: 3 }}>{t}</div>
              <div style={{ fontSize: mob ? 10 : 11, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>{d}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: `32px ${px}`, background: C.cr }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: C.go, marginBottom: 7, fontFamily: "Tajawal,sans-serif" }}>الأكثر مبيعاً</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 24 : 32, fontWeight: 300, color: C.dk }}>منتجاتنا المختارة</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: mob ? 12 : 16, maxWidth: 1050, margin: "0 auto" }}>
          {homProds.slice(0, 3).map(p => <Card key={p.id} p={p} go={go} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <Btn onClick={() => go("#products")} style={{ background: "none", border: `1px solid ${C.dk}`, color: C.dk, padding: mob ? "10px 22px" : "12px 28px", fontSize: 12, letterSpacing: 2 }}>عرض كل المنتجات</Btn>
        </div>
      </section>
      <section style={{ background: C.dk, padding: mob ? "34px 20px" : "48px 40px", textAlign: "center", color: C.bl }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 22 : 30, fontWeight: 300, marginBottom: 10 }}>ابدئي روتينك المثالي</h2>
        <p style={{ fontSize: mob ? 12 : 14, opacity: .7, marginBottom: 22, fontFamily: "Tajawal,sans-serif" }}>من أفضل البراندات بأسعار تنافسية</p>
        <Btn onClick={() => go("#products")} style={{ background: C.go, color: "#fff", padding: mob ? "11px 26px" : "13px 40px", fontSize: 12, letterSpacing: 2 }}>تسوقي الآن</Btn>
      </section>
      <style>{`@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

function Products({ go, allProds }) {
  const { prods: _p } = useProds();
  allProds = allProds || _p || PRODS;
  const mob = useMob();
  const [fil, setFil] = useState("الكل");
  const [srt, setSrt] = useState("d");
  const prodsData = (allProds && allProds.length) ? allProds : PRODS;
  const brands = ["الكل", ...[...new Set(prodsData.map(p => p.brand))]];
  let list = fil === "الكل" ? prodsData : prodsData.filter(p => p.brand === fil);
  if (srt === "a") list = [...list].sort((a, b) => a.price - b.price);
  if (srt === "z") list = [...list].sort((a, b) => b.price - a.price);
  const px = mob ? "16px" : "56px";
  return (
    <div style={{ direction: "rtl", minHeight: "80vh" }}>
      <div style={{ background: C.bl, padding: mob ? "26px 20px" : "40px 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 36, fontWeight: 300, color: C.dk }}>جميع المنتجات</h1>
        <p style={{ color: C.mu, marginTop: 8, fontFamily: "Tajawal,sans-serif", fontSize: 13 }}>روتينك المثالي يبدأ من هنا</p>
      </div>
      <div style={{ background: C.wh, padding: mob ? "10px 16px" : "12px 56px", borderBottom: "1px solid rgba(0,0,0,.07)", direction: "rtl" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          {brands.map(b => <Btn key={b} onClick={() => setFil(b)} style={{ padding: "5px 11px", border: `1px solid ${fil === b ? C.dk : "rgba(0,0,0,.12)"}`, background: fil === b ? C.dk : C.wh, color: fil === b ? C.cr : C.dk, fontSize: mob ? 10 : 12, whiteSpace: "nowrap" }}>{b}</Btn>)}
          <select value={srt} onChange={e => setSrt(e.target.value)} style={{ padding: "5px 9px", border: "1px solid rgba(0,0,0,.12)", background: C.cr, fontFamily: "Tajawal,sans-serif", fontSize: mob ? 10 : 12, outline: "none", marginRight: "auto" }}>
            <option value="d">الترتيب</option><option value="a">الأقل سعراً</option><option value="z">الأعلى سعراً</option>
          </select>
        </div>
      </div>
      <div style={{ padding: `22px ${px}`, background: C.cr }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(3,1fr)", gap: mob ? 10 : 14, maxWidth: 1050, margin: "0 auto" }}>
          {list.map(p => <Card key={p.id} p={p} go={go} />)}
        </div>
      </div>
    </div>
  );
}

function ProdDetail({ id, go, allProds }) {
  const { prods: _p } = useProds();
  allProds = allProds || _p || PRODS;
  const { add } = useCart();
  const { show } = useToast();
  const mob = useMob();
  const [qty, setQty] = useState(1);
  const [tab, setTab] = useState("d");
  const prodsData = (allProds && allProds.length) ? allProds : PRODS;
  const p = prodsData.find(x => x.id === id);
  if (!p) return <div style={{ padding: 60, textAlign: "center", direction: "rtl" }}>المنتج غير موجود</div>;
  const px = mob ? "16px" : "56px";
  const rel = prodsData.filter(x => x.id !== p.id).slice(0, mob ? 2 : 3);
  return (
    <div style={{ direction: "rtl", minHeight: "80vh" }}>
      <div style={{ padding: `10px ${px}`, background: C.wh, borderBottom: "1px solid rgba(0,0,0,.06)", fontSize: 11, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>
        <span onClick={() => go("#home")} style={{ cursor: "pointer" }}>الرئيسية</span>{" > "}<span onClick={() => go("#products")} style={{ cursor: "pointer" }}>المنتجات</span>{" > "}{p.name}
      </div>
      <div style={{ padding: `${mob ? "20px" : "40px"} ${px}`, display: mob ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 40, maxWidth: 1050, margin: "0 auto" }}>
        <div style={{ background: p.bg, height: mob ? 220 : 380, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, marginBottom: mob ? 18 : 0 }}>
          <span style={{ fontSize: mob ? 68 : 88 }}>{p.icon}</span>
          <span style={{ fontSize: 10, letterSpacing: 3, fontWeight: 600, color: "#5C4A2A" }}>{p.brand}</span>
        </div>
        <div>
          <div style={{ fontSize: 9, letterSpacing: 3, color: C.go, marginBottom: 5, fontFamily: "Tajawal,sans-serif" }}>{p.brand}</div>
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 22 : 30, fontWeight: 300, color: C.dk, marginBottom: 7 }}>{p.name}</h1>
          <div style={{ marginBottom: 11 }}><Stars n={p.stars} /></div>
          <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            {p.stock > 0 ? (
              <>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.stock <= 3 ? "#EF4444" : "#10B981", display: "inline-block" }}/>
                <span style={{ fontSize: 12, color: p.stock <= 3 ? "#EF4444" : "#10B981", fontFamily: "Tajawal,sans-serif" }}>
                  {p.stock <= 3 ? `آخر ${p.stock} قطع فقط!` : `متاح — ${p.stock} قطعة في المخزون`}
                </span>
              </>
            ) : (
              <>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6B7280", display: "inline-block" }}/>
                <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "Tajawal,sans-serif" }}>نفد المخزون</span>
              </>
            )}
          </div>
          <p style={{ fontSize: mob ? 13 : 14, color: C.mu, lineHeight: 1.8, marginBottom: 16, fontFamily: "Tajawal,sans-serif" }}>{p.desc}</p>
          <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 24 : 30, color: C.dk, marginBottom: 18 }}>{p.price} <span style={{ fontSize: 12, color: C.mu, fontFamily: "sans-serif" }}>جنيه</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
            <Btn onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 34, height: 34, border: `1px solid ${C.dk}`, background: "none", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</Btn>
            <span style={{ fontSize: 16, minWidth: 22, textAlign: "center" }}>{qty}</span>
            <Btn onClick={() => setQty(qty + 1)} style={{ width: 34, height: 34, border: `1px solid ${C.dk}`, background: "none", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</Btn>
          </div>
          <Btn onClick={() => { for (let i = 0; i < qty; i++) add(p); show(`تمت إضافة ${qty > 1 ? qty + ' قطع' : ''} ${p.name} للعربة 🛍️`); }} style={{ width: "100%", background: C.dk, color: C.cr, padding: 13, fontSize: 13, letterSpacing: 1, marginBottom: 10 }}>أضيفي للعربة 🛍️</Btn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[["🚚","شحن 2-4 أيام"],["💰","كاش عند الاستلام"],["↩️","إرجاع 14 يوم"]].map(([ic, t]) => (
              <div key={t} style={{ background: C.cr, padding: "8px 5px", textAlign: "center", fontSize: 10, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{ic}</div>{t}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1050, margin: "0 auto", padding: `0 ${px} 32px` }}>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,.1)", marginBottom: 16 }}>
          {[["d","تفاصيل المنتج"],["u","طريقة الاستخدام"]].map(([k, l]) => (
            <Btn key={k} onClick={() => setTab(k)} style={{ padding: mob ? "10px 16px" : "11px 24px", background: "none", borderBottom: tab === k ? `2px solid ${C.dk}` : "2px solid transparent", color: tab === k ? C.dk : C.mu, fontSize: mob ? 12 : 13, fontWeight: tab === k ? 500 : 300 }}>{l}</Btn>
          ))}
        </div>
        <p style={{ fontSize: mob ? 13 : 14, color: C.mu, lineHeight: 1.9, fontFamily: "Tajawal,sans-serif", fontWeight: 300 }}>{tab === "d" ? p.det : p.use}</p>
      </div>
      <Reviews productId={id} />
      <div style={{ background: C.cr, padding: `28px ${px}` }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 18 : 24, fontWeight: 300, color: C.dk, marginBottom: 16, textAlign: "center" }}>قد يعجبكِ أيضاً</h2>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(3,1fr)", gap: mob ? 10 : 12, maxWidth: 1050, margin: "0 auto" }}>
          {rel.map(p => <Card key={p.id} p={p} go={go} />)}
        </div>
      </div>
    </div>
  );
}

function About({ go }) {
  const mob = useMob();
  const px = mob ? "20px" : "56px";
  return (
    <div style={{ direction: "rtl" }}>
      <div style={{ background: C.bl, padding: mob ? "34px 20px" : "60px 56px", textAlign: "center" }}>
        <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 28 : 44, letterSpacing: 8, color: C.dk, marginBottom: 8 }}><img src={LOGO} alt="nawra" style={{height: mob ? 46 : 58, display:"block", objectFit:"contain"}} /></div>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 22 : 36, fontWeight: 300, color: C.dk, marginBottom: 10 }}>قصة نوّرة</h1>
        <p style={{ fontSize: mob ? 13 : 15, color: C.mu, maxWidth: 440, margin: "0 auto", lineHeight: 1.9, fontFamily: "Tajawal,sans-serif" }}>ولدنا من حبّ البشرة الصحية والجمال الحقيقي</p>
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: `${mob ? "28px" : "48px"} ${px}` }}>
        {[{t:"لماذا نوّرة؟",x:"نوّرة هو الاسم العربي للإشراقة والنور — وهذا ما نسعى لتقديمه. بشرة مشرقة وصحية تعكس جمالك الحقيقي."},
          {t:"فلسفتنا",x:"نختار كل منتج بعناية من براندات عالمية موثوقة وموصى بها من أطباء الجلدية. العناية الفعّالة بأسعار مناسبة."},
          {t:"وعدنا لك",x:"كل منتج في نوّرة أصلي 100% من مصادر موثوقة. توصيل سريع لكل محافظات مصر مع ضمان الجودة."},
        ].map(s => (
          <div key={s.t} style={{ marginBottom: 26 }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 18 : 22, fontWeight: 400, color: C.dk, marginBottom: 8, borderRight: `3px solid ${C.go}`, paddingRight: 12 }}>{s.t}</h3>
            <p style={{ fontSize: mob ? 13 : 14, color: C.mu, lineHeight: 1.9, fontFamily: "Tajawal,sans-serif", fontWeight: 300, paddingRight: 15 }}>{s.x}</p>
          </div>
        ))}
        <div style={{ background: C.bl, padding: mob ? "20px" : "26px", textAlign: "center", marginTop: 26 }}>
          <p style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 19, fontStyle: "italic", color: C.dk, marginBottom: 14 }}>جاهزة تبدئي روتينك؟</p>
          <Btn onClick={() => go("#products")} style={{ background: C.dk, color: C.cr, padding: mob ? "10px 22px" : "12px 28px", fontSize: 12, letterSpacing: 2 }}>اكتشفي المنتجات</Btn>
        </div>
      </div>
    </div>
  );
}

function Contact() {
  const mob = useMob();
  const px = mob ? "20px" : "56px";
  const [f, setF] = useState({ n: "", e: "", p: "", m: "" });
  const [ok, setOk] = useState(false);
  return (
    <div style={{ direction: "rtl" }}>
      <div style={{ background: C.bl, padding: mob ? "30px 20px" : "48px 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 36, fontWeight: 300, color: C.dk }}>تواصلي معنا</h1>
        <p style={{ color: C.mu, marginTop: 8, fontFamily: "Tajawal,sans-serif", fontSize: 13 }}>سعيدون بمساعدتك</p>
      </div>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: `${mob ? "26px" : "48px"} ${px}`, display: mob ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div style={{ marginBottom: mob ? 26 : 0 }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 18 : 22, fontWeight: 400, color: C.dk, marginBottom: 16 }}>معلومات التواصل</h3>
          {[["📱","واتساب","01xxxxxxxx"],["📧","البريد","info@nawra.eg"],["📍","العنوان","القاهرة، مصر"],["🕐","أوقات العمل","السبت-الخميس: 10ص-10م"]].map(([ic, l, v]) => (
            <div key={l} style={{ display: "flex", gap: 10, marginBottom: 14, alignItems: "flex-start" }}>
              <span style={{ fontSize: 18, color: C.go, flexShrink: 0 }}>{ic}</span>
              <div>
                <div style={{ fontSize: 9, letterSpacing: 2, color: C.mu, marginBottom: 2, fontFamily: "Tajawal,sans-serif" }}>{l}</div>
                <div style={{ fontSize: 13, color: C.dk, fontFamily: "Tajawal,sans-serif" }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          {ok ? (
            <div style={{ textAlign: "center", padding: "26px 0" }}>
              <div style={{ fontSize: 38, marginBottom: 10 }}>✅</div>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, marginBottom: 7 }}>تم الإرسال!</h3>
              <p style={{ color: C.mu, fontFamily: "Tajawal,sans-serif", fontSize: 13, marginBottom: 14 }}>هنرد عليكِ قريباً.</p>
              <Btn onClick={() => setOk(false)} style={{ background: C.dk, color: C.cr, padding: "10px 20px", fontSize: 12 }}>رسالة جديدة</Btn>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 18 : 22, fontWeight: 400, color: C.dk, marginBottom: 16 }}>أرسلي رسالة</h3>
              {[["n","الاسم","اسمك"],["e","البريد","email@example.com"],["p","الموبايل","01xxxxxxxxx"]].map(([k, l, ph]) => (
                <div key={k} style={{ marginBottom: 11 }}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: C.mu, marginBottom: 4, fontFamily: "Tajawal,sans-serif" }}>{l}</label>
                  <input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} style={{ width: "100%", padding: "10px 11px", border: "1px solid rgba(0,0,0,.12)", background: C.cr, fontFamily: "Tajawal,sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: C.mu, marginBottom: 4, fontFamily: "Tajawal,sans-serif" }}>الرسالة</label>
                <textarea value={f.m} onChange={e => setF({ ...f, m: e.target.value })} rows={mob ? 4 : 5} placeholder="كيف يمكننا مساعدتك؟" style={{ width: "100%", padding: "10px 11px", border: "1px solid rgba(0,0,0,.12)", background: C.cr, fontFamily: "Tajawal,sans-serif", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <Btn onClick={() => { if (f.n && f.m) setOk(true); }} style={{ width: "100%", background: C.dk, color: C.cr, padding: 13, fontSize: 13, letterSpacing: 1 }}>إرسال الرسالة</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Shipping() {
  const mob = useMob();
  const px = mob ? "20px" : "56px";
  return (
    <div style={{ direction: "rtl" }}>
      <div style={{ background: C.bl, padding: mob ? "30px 20px" : "48px 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 36, fontWeight: 300, color: C.dk }}>الشحن والإرجاع</h1>
        <p style={{ color: C.mu, marginTop: 8, fontFamily: "Tajawal,sans-serif", fontSize: 13 }}>كل اللي محتاجة تعرفيه</p>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: `${mob ? "26px" : "44px"} ${px}` }}>
        {[{t:"الشحن",i:["نوصل لكل مصر خلال 2-4 أيام","شحن مجاني فوق 500 جنيه","50 جنيه للطلبات الأقل","عبر Bosta / J&T"]},
          {t:"الإرجاع",i:["خلال 14 يوم من الاستلام","المنتج بحالته الأصلية","مجاني لو المنتج معيب","يُستثنى المنتجات المفتوحة"]},
          {t:"الدفع",i:["كاش عند الاستلام فقط","مفيش بطاقة مطلوبة","ادفعي لما الطلب يوصلك"]},
          {t:"التواصل",i:["واتساب: 01xxxxxxxx","info@nawra.eg","السبت-الخميس: 10ص-10م"]},
        ].map(s => (
          <div key={s.t} style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 17 : 21, fontWeight: 400, color: C.dk, marginBottom: 10, borderRight: `3px solid ${C.go}`, paddingRight: 12 }}>{s.t}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {s.i.map(it => <li key={it} style={{ display: "flex", gap: 8, marginBottom: 7, fontFamily: "Tajawal,sans-serif", fontSize: mob ? 12 : 13, color: C.mu, lineHeight: 1.6 }}><span style={{ color: C.go, flexShrink: 0 }}>✦</span>{it}</li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}

function Footer({ go }) {
  const mob = useMob();
  return (
    <footer style={{ background: C.dk, color: C.bl, direction: "rtl" }}>
      <div style={{ padding: mob ? "26px 18px" : "36px 56px", display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "2fr 1fr 1fr 1fr", gap: mob ? "18px" : "36px", maxWidth: 1050, margin: "0 auto" }}>
        <div style={{ gridColumn: mob ? "1 / -1" : undefined }}>
          <div style={{ fontFamily: "Georgia,serif", display:"none"}}>x</div>
          <img src={LOGO} alt="nawra" style={{height: mob ? 52 : 64, marginBottom: 10, opacity: 0.85}} />
          <p style={{ fontSize: 11, opacity: .5, lineHeight: 1.8, fontFamily: "Tajawal,sans-serif", fontWeight: 300, maxWidth: 200 }}>منتجات عناية مختارة لبشرة صحية ومتألقة.</p>
        </div>
        {[{t:"تصفحي",l:[["#home","الرئيسية"],["#products","المنتجات"],["#about","عن نوّرة"]]},
          {t:"خدمة العملاء",l:[["#contact","تواصلي"],["#shipping","الشحن والإرجاع"]]},
          {t:"تابعينا",l:[["#","Instagram"],["#","TikTok"],["#","Facebook"]]},
        ].map(col => (
          <div key={col.t}>
            <h4 style={{ fontSize: 9, letterSpacing: 3, color: C.go, marginBottom: 11, fontFamily: "Tajawal,sans-serif" }}>{col.t}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {col.l.map(([h, l]) => <li key={l} style={{ marginBottom: 7 }}><span onClick={() => go(h)} style={{ fontSize: 12, opacity: .6, cursor: "pointer", color: C.bl, fontFamily: "Tajawal,sans-serif" }}>{l}</span></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", padding: "11px 18px", textAlign: "center", fontSize: 10, opacity: .4, letterSpacing: 1, fontFamily: "Tajawal,sans-serif" }}>
        © 2025 NAWRA SKINCARE — نوّرة للعناية بالبشرة
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
export default function App() {
  return (
    <AuthProvider>
      <ProdsProvider initialProds={PRODS}>
        <CartProvider>
          <ToastProvider>
            <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500&display=swap" rel="stylesheet" />
            <AppInner />
          </ToastProvider>
        </CartProvider>
      </ProdsProvider>
    </AuthProvider>
  );
}

function AppInner() {
  const { route, nav: go } = useRoute();
  const { user, logout } = useAuth();
  const { prods } = useProds();
  const [cartOpen, setCartOpen] = useState(false);
  const pid = (() => { const m = route.match(/^#product-(\d+)/); return m ? parseInt(m[1]) : null; })();
  const isAdmin = route === "#admin";

  const page = () => {
    if (route === "#login") return <LoginPage go={go} />;
    if (route === "#admin") {
      if (!user || user.role !== "admin") { go("#login"); return null; }
      return <AdminDash go={go} />;
    }
    if (pid) return <ProdDetail id={pid} go={go} allProds={(prods&&prods.length)?prods:PRODS} />;
    switch (route) {
      case "#products": return <Products go={go} allProds={(prods&&prods.length)?prods:PRODS} />;
      case "#about":    return <About go={go} />;
      case "#contact":  return <Contact />;
      case "#shipping": return <Shipping />;
      default:          return <Home go={go} allProds={(prods&&prods.length)?prods:PRODS} />;
    }
  };

  return (
    <div style={{ fontFamily: "Tajawal,sans-serif", background: C.cr, minHeight: "100vh", overflowX: "hidden" }}>
      {!isAdmin && <Nav r={route} go={go} openCart={() => setCartOpen(true)} user={user} onLogout={logout} />}
      {!isAdmin && <CartSide open={cartOpen} close={() => setCartOpen(false)} go={go} />}
      <main>{page()}</main>
      {!isAdmin && <Footer go={go} />}
      {!isAdmin && <WAFloat />}
    </div>
  );
}
