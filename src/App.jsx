import { useState, useEffect, createContext, useContext } from "react";
import LogoSVG from "/nawra-logo-animated.svg";

// ─── Translations ─────────────────────────────────────────────────────────────
const TR = {
  ar: {
    navHome:"الرئيسية", navProducts:"المنتجات", navAbout:"عن نوّرَة", navContact:"تواصلي معنا", navShipping:"الشحن والإرجاع",
    navGreeting:"أهلاً،", navMyOrders:"طلباتي", navLogout:"خروج", navLogin:"دخول",
    topBanner:"شحن مجاني فوق 500 جنيه ✦ كاش عند الاستلام",
    welcomeBack:"أهلاً بك مجدداً،", welcomeViewOrders:"اعرضي طلباتك",
    heroTitle:"جمالك يبدأ من", heroTitleEm:"هنا",
    heroSub:"منتجات عناية مختارة من أفضل البراندات العالمية", heroSub2:"توصيل سريع لكل محافظات مصر",
    heroShopNow:"تسوّقي الآن", heroAboutUs:"تعرفي علينا",
    feat1:"توصيل سريع", feat1d:"2-4 أيام", feat2:"كاش عند الاستلام", feat2d:"ادفعي لما يوصلك",
    feat3:"منتجات أصلية", feat3d:"موصى بها جلدياً", feat4:"إرجاع مجاني", feat4d:"خلال 14 يوم",
    homeBestSellersTag:"الأكثر مبيعاً", homeBestSellersTitle:"منتجاتنا المختارة",
    homeViewAll:"عرض كل المنتجات", homeCtaTitle:"ابدئي روتينك المثالي",
    homeCtaSub:"من أفضل البراندات بأسعار تنافسية", homeCtaBtn:"تسوقي الآن",
    addToCart:"+ أضيفي للعربة", addedToCart:"تمت الإضافة للعربة 🛍️",
    stockLow:"آخر", stockLowUnit:"قطع", stockOut:"نفد",
    prodsTitle:"جميع المنتجات", prodsSub:"روتينك المثالي يبدأ من هنا",
    prodsFilterAll:"الكل", prodsSortDefault:"الترتيب", prodsSortAsc:"الأقل سعراً", prodsSortDesc:"الأعلى سعراً",
    prodNotFound:"المنتج غير موجود", prodHome:"الرئيسية", prodProds:"المنتجات",
    prodAvail:"متاح —", prodInStock:"قطعة في المخزون",
    prodLowStock:"آخر", prodLowStockSuffix:"قطع فقط!", prodOutStock:"نفد المخزون",
    prodAddToCart:"أضيفي للعربة 🛍️", prodDetailsTab:"تفاصيل المنتج", prodUseTab:"طريقة الاستخدام",
    prodShipping:"شحن 2-4 أيام", prodCash:"كاش عند الاستلام", prodReturn:"إرجاع 14 يوم",
    prodRelated:"قد يعجبكِ أيضاً", egp:"جنيه",
    cartTitle:"عربتي 🛍️", checkoutTitle:"إتمام الطلب", cartEmpty:"عربتك فاضية", cartShopNow:"تسوقي الآن",
    cartTotal:"الإجمالي", cartShipAdd:"للشحن المجاني", cartShipFree:"✓ شحن مجاني",
    cartCashOnly:"💰 كاش عند الاستلام فقط", cartCheckout:"إتمام الطلب", cartContinue:"← متابعة التسوق",
    checkoutCashLabel:"💰 كاش عند الاستلام",
    checkoutName:"الاسم", checkoutNamePh:"اسمك", checkoutPhone:"رقم الموبايل", checkoutPhonePh:"01xxxxxxxxx",
    checkoutAddr:"العنوان", checkoutAddrPh:"الشارع والمبنى", checkoutGov:"المحافظة", checkoutGovPh:"اختاري",
    checkoutBack:"← رجوع", checkoutConfirm:"تأكيد الطلب ✓",
    orderSuccess:"تم استلام طلبك!", orderSuccessSub:"شكراً لثقتك في نوّرَة 💕",
    orderSuccessNote:"هيتواصل معاكي فريقنا خلال 24 ساعة.", orderCash:"كاش عند الاستلام",
    orderContinue:"متابعة التسوق", orderAlert:"من فضلك اكملي البيانات",
    loginTab:"تسجيل الدخول", registerTab:"حساب جديد",
    loginFullName:"الاسم الكامل", loginFullNamePh:"اسمك",
    loginEmail:"البريد الإلكتروني", loginEmailPh:"example@email.com",
    loginPass:"كلمة المرور", loginPassPh:"••••••••", loginConfirmPass:"تأكيد كلمة المرور",
    loginLoading:"جاري التحقق...", loginBtn:"دخول", registerBtn:"إنشاء الحساب",
    loginErrFields:"من فضلك اكمل البيانات", loginErrEmail:"البريد الإلكتروني غير صحيح", loginErrPass:"كلمة المرور مش متطابقة",
    myOrdersTitle:"طلباتي 📦", myOrdersSub:"سجل مشترياتك", myOrdersHello:"أهلاً،",
    myOrdersEmpty:"مفيش طلبات لحد دلوقتي", myOrdersEmptySub:"ابدئي التسوق وهتلاقي طلباتك هنا",
    myOrdersShop:"تسوقي الآن", myOrdersNum:"رقم الطلب:",
    aboutTitle:"قصة نوّرَة", aboutSub:"ولدنا من حبّ البشرة الصحية والجمال الحقيقي",
    aboutSect:[{t:"لماذا نوّرَة؟",x:"نوّرَة هو الاسم العربي للإشراقة والنور — وهذا ما نسعى لتقديمه. بشرة مشرقة وصحية تعكس جمالك الحقيقي."},{t:"فلسفتنا",x:"نختار كل منتج بعناية من براندات عالمية موثوقة وموصى بها من أطباء الجلدية. العناية الفعّالة بأسعار مناسبة."},{t:"وعدنا لك",x:"كل منتج في نوّرَة أصلي 100% من مصادر موثوقة. توصيل سريع لكل محافظات مصر مع ضمان الجودة."}],
    aboutCtaQ:"جاهزة تبدئي روتينك؟", aboutCtaBtn:"اكتشفي المنتجات",
    contactTitle:"تواصلي معنا", contactSub:"سعيدون بمساعدتك",
    contactInfoTitle:"معلومات التواصل",
    contactInfo:[["📱","واتساب","01xxxxxxxx"],["📧","البريد","info@nawra.eg"],["📍","العنوان","القاهرة، مصر"],["🕐","أوقات العمل","السبت-الخميس: 10ص-10م"]],
    contactFormTitle:"أرسلي رسالة",
    contactFields:[["n","الاسم","اسمك"],["e","البريد","email@example.com"],["p","الموبايل","01xxxxxxxxx"]],
    contactMsgLabel:"الرسالة", contactMsgPh:"كيف يمكننا مساعدتك؟", contactSendBtn:"إرسال الرسالة",
    contactSentTitle:"تم الإرسال!", contactSentMsg:"هنرد عليكِ قريباً.", contactNewBtn:"رسالة جديدة",
    shippingTitle:"الشحن والإرجاع", shippingSub:"كل اللي محتاجة تعرفيه",
    shippingSects:[{t:"الشحن",i:["نوصل لكل مصر خلال 2-4 أيام","شحن مجاني فوق 500 جنيه","50 جنيه للطلبات الأقل","عبر Bosta / J&T"]},{t:"الإرجاع",i:["خلال 14 يوم من الاستلام","المنتج بحالته الأصلية","مجاني لو المنتج معيب","يُستثنى المنتجات المفتوحة"]},{t:"الدفع",i:["كاش عند الاستلام فقط","مفيش بطاقة مطلوبة","ادفعي لما الطلب يوصلك"]},{t:"التواصل",i:["واتساب: 01xxxxxxxx","info@nawra.eg","السبت-الخميس: 10ص-10م"]}],
    footerTagline:"منتجات عناية مختارة لبشرة صحية ومتألقة.",
    footerCols:[{t:"تصفحي",l:[["#home","الرئيسية"],["#products","المنتجات"],["#about","عن نوّرَة"]]},{t:"خدمة العملاء",l:[["#contact","تواصلي"],["#shipping","الشحن والإرجاع"]]},{t:"تابعينا",l:[["#","Instagram"],["#","TikTok"],["#","Facebook"]]}],
    footerCopyright:"© 2025 NAWRA SKINCARE — نوّرَة للعناية بالبشرة",
    reviewsTitle:"آراء العملاء", reviewsEmpty:"كوني أول من تقيّم هذا المنتج ✨",
    reviewsFormTitle:"أضيفي تقييمك", reviewsNameLabel:"الاسم", reviewsNamePh:"اسمك",
    reviewsRatingLabel:"التقييم", reviewsCommentLabel:"رأيك في المنتج",
    reviewsCommentPh:"شاركي تجربتك مع المنتج...", reviewsSubmit:"إرسال التقييم",
    reviewsThanks:"✓ شكراً لتقييمك!", reviewsRatings:"تقييم", reviewsDefault:"عميلة",
    searchPh:"ابحثي عن منتج...", searchViewAll:"عرض كل النتائج ←",
    waHello:"👋 أهلاً!\nمحتاجة مساعدة في اختيار المنتج؟", waStart:"ابدئي المحادثة",
    waMsg:"مرحباً، أريد الاستفسار عن منتج من نوّرَة 💕",
  },
  en: {
    navHome:"Home", navProducts:"Products", navAbout:"About Nawra", navContact:"Contact", navShipping:"Shipping & Returns",
    navGreeting:"Hello,", navMyOrders:"My Orders", navLogout:"Logout", navLogin:"Login",
    topBanner:"Free shipping over 500 EGP ✦ Cash on Delivery",
    welcomeBack:"Welcome back,", welcomeViewOrders:"View your orders",
    heroTitle:"Your Beauty Starts", heroTitleEm:"Here",
    heroSub:"Curated skincare from the world's best brands", heroSub2:"Fast delivery across all of Egypt",
    heroShopNow:"Shop Now", heroAboutUs:"About Us",
    feat1:"Fast Delivery", feat1d:"2-4 days", feat2:"Cash on Delivery", feat2d:"Pay on arrival",
    feat3:"Authentic Products", feat3d:"Dermatologist approved", feat4:"Free Returns", feat4d:"Within 14 days",
    homeBestSellersTag:"BEST SELLERS", homeBestSellersTitle:"Our Curated Products",
    homeViewAll:"View All Products", homeCtaTitle:"Start Your Perfect Routine",
    homeCtaSub:"From the best brands at competitive prices", homeCtaBtn:"Shop Now",
    addToCart:"+ Add to Cart", addedToCart:"Added to cart 🛍️",
    stockLow:"Last", stockLowUnit:"left", stockOut:"Out",
    prodsTitle:"All Products", prodsSub:"Your perfect routine starts here",
    prodsFilterAll:"All", prodsSortDefault:"Sort", prodsSortAsc:"Price: Low to High", prodsSortDesc:"Price: High to Low",
    prodNotFound:"Product not found", prodHome:"Home", prodProds:"Products",
    prodAvail:"In stock —", prodInStock:"pieces available",
    prodLowStock:"Last", prodLowStockSuffix:"pieces only!", prodOutStock:"Out of Stock",
    prodAddToCart:"Add to Cart 🛍️", prodDetailsTab:"Product Details", prodUseTab:"How to Use",
    prodShipping:"Shipping 2-4 days", prodCash:"Cash on Delivery", prodReturn:"14-day Returns",
    prodRelated:"You Might Also Like", egp:"EGP",
    cartTitle:"My Cart 🛍️", checkoutTitle:"Checkout", cartEmpty:"Your cart is empty", cartShopNow:"Shop Now",
    cartTotal:"Total", cartShipAdd:"for free shipping", cartShipFree:"✓ Free Shipping",
    cartCashOnly:"💰 Cash on Delivery only", cartCheckout:"Checkout", cartContinue:"← Continue Shopping",
    checkoutCashLabel:"💰 Cash on Delivery",
    checkoutName:"Name", checkoutNamePh:"Your name", checkoutPhone:"Phone", checkoutPhonePh:"01xxxxxxxxx",
    checkoutAddr:"Address", checkoutAddrPh:"Street and building", checkoutGov:"Governorate", checkoutGovPh:"Select",
    checkoutBack:"← Back", checkoutConfirm:"Confirm Order ✓",
    orderSuccess:"Order Received!", orderSuccessSub:"Thank you for trusting Nawra 💕",
    orderSuccessNote:"Our team will contact you within 24 hours.", orderCash:"Cash on Delivery",
    orderContinue:"Continue Shopping", orderAlert:"Please complete all fields",
    loginTab:"Sign In", registerTab:"New Account",
    loginFullName:"Full Name", loginFullNamePh:"Your name",
    loginEmail:"Email Address", loginEmailPh:"example@email.com",
    loginPass:"Password", loginPassPh:"••••••••", loginConfirmPass:"Confirm Password",
    loginLoading:"Verifying...", loginBtn:"Sign In", registerBtn:"Create Account",
    loginErrFields:"Please fill in all fields", loginErrEmail:"Invalid email address", loginErrPass:"Passwords do not match",
    myOrdersTitle:"My Orders 📦", myOrdersSub:"Your purchase history", myOrdersHello:"Hello,",
    myOrdersEmpty:"No orders yet", myOrdersEmptySub:"Start shopping and your orders will appear here",
    myOrdersShop:"Shop Now", myOrdersNum:"Order #:",
    aboutTitle:"The Nawra Story", aboutSub:"Born from a love of healthy skin and true beauty",
    aboutSect:[{t:"Why Nawra?",x:"Nawra is the Arabic word for radiance and light — and that is what we strive to deliver. Glowing, healthy skin that reflects your true beauty."},{t:"Our Philosophy",x:"We carefully select every product from trusted global brands recommended by dermatologists. Effective skincare at accessible prices."},{t:"Our Promise",x:"Every product at Nawra is 100% authentic from verified sources. Fast delivery to all of Egypt with a quality guarantee."}],
    aboutCtaQ:"Ready to start your routine?", aboutCtaBtn:"Discover Products",
    contactTitle:"Contact Us", contactSub:"Happy to help you",
    contactInfoTitle:"Contact Information",
    contactInfo:[["📱","WhatsApp","01xxxxxxxx"],["📧","Email","info@nawra.eg"],["📍","Address","Cairo, Egypt"],["🕐","Working Hours","Sat–Thu: 10am–10pm"]],
    contactFormTitle:"Send a Message",
    contactFields:[["n","Name","Your name"],["e","Email","email@example.com"],["p","Phone","01xxxxxxxxx"]],
    contactMsgLabel:"Message", contactMsgPh:"How can we help you?", contactSendBtn:"Send Message",
    contactSentTitle:"Sent!", contactSentMsg:"We'll get back to you soon.", contactNewBtn:"New Message",
    shippingTitle:"Shipping & Returns", shippingSub:"Everything you need to know",
    shippingSects:[{t:"Shipping",i:["Delivery across Egypt in 2-4 days","Free shipping over 500 EGP","50 EGP for smaller orders","Via Bosta / J&T"]},{t:"Returns",i:["Within 14 days of receipt","Product in original condition","Free if item is defective","Opened products excluded"]},{t:"Payment",i:["Cash on Delivery only","No card required","Pay when your order arrives"]},{t:"Contact",i:["WhatsApp: 01xxxxxxxx","info@nawra.eg","Sat–Thu: 10am–10pm"]}],
    footerTagline:"Curated skincare for healthy, glowing skin.",
    footerCols:[{t:"Browse",l:[["#home","Home"],["#products","Products"],["#about","About Nawra"]]},{t:"Customer Service",l:[["#contact","Contact"],["#shipping","Shipping & Returns"]]},{t:"Follow Us",l:[["#","Instagram"],["#","TikTok"],["#","Facebook"]]}],
    footerCopyright:"© 2025 NAWRA SKINCARE",
    reviewsTitle:"Customer Reviews", reviewsEmpty:"Be the first to review this product ✨",
    reviewsFormTitle:"Add Your Review", reviewsNameLabel:"Name", reviewsNamePh:"Your name",
    reviewsRatingLabel:"Rating", reviewsCommentLabel:"Your Review",
    reviewsCommentPh:"Share your experience with this product...", reviewsSubmit:"Submit Review",
    reviewsThanks:"✓ Thank you for your review!", reviewsRatings:"reviews", reviewsDefault:"Customer",
    searchPh:"Search for a product...", searchViewAll:"View all results →",
    waHello:"👋 Hello!\nNeed help choosing a product?", waStart:"Start a chat",
    waMsg:"Hello, I'd like to inquire about a product from Nawra 💕",
  }
};

// ─── Language Context ─────────────────────────────────────────────────────────
const LangCtx = createContext(null);
const useLang = () => useContext(LangCtx);
function LangProvider({ children }) {
  const [lang, setLangState] = useState(() => localStorage.getItem("nawra_lang") || "ar");
  const setLang = (l) => { setLangState(l); localStorage.setItem("nawra_lang", l); };
  useEffect(() => { document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"; document.documentElement.lang = lang; }, [lang]);
  const t = (key) => TR[lang]?.[key] ?? TR.ar?.[key] ?? key;
  const dir = lang === "ar" ? "rtl" : "ltr";
  return <LangCtx.Provider value={{ lang, setLang, t, dir }}>{children}</LangCtx.Provider>;
}

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
    const found = users.find(x => x.email === u && x.password === p);
    if (found) {
      const u2 = { name: found.name, role: "user", email: found.email };
      localStorage.setItem("nawra_user", JSON.stringify(u2));
      setUser(u2); return { ok: true };
    }
    return { ok: false, err: "البريد الإلكتروني أو كلمة المرور غلط" };
  };
  const register = (name, email, p) => {
    const users = JSON.parse(localStorage.getItem("nawra_users") || "[]");
    if (users.find(x => x.email === email)) return { ok: false, err: "البريد الإلكتروني مسجل بالفعل" };
    const registeredAt = new Date().toLocaleDateString("ar-EG");
    users.push({ name, email, password: p, registeredAt });
    localStorage.setItem("nawra_users", JSON.stringify(users));
    const u2 = { name, role: "user", email };
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
  const { t } = useLang();
  const mob = useMob();
  const [hov, setHov] = useState(false);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background: C.wh, overflow: "hidden", boxShadow: hov ? "0 6px 20px rgba(0,0,0,.1)" : "0 2px 6px rgba(0,0,0,.06)", transition: "all .3s", transform: hov && !mob ? "translateY(-3px)" : "none" }}>
      <div onClick={() => go(`#product-${p.id}`)} style={{ height: mob ? 170 : 230, background: p.bg, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6, position: "relative", cursor: "pointer" }}>
        {p.badge && <span style={{ position: "absolute", top: 8, right: 8, background: C.dk, color: C.cr, fontSize: 9, padding: "3px 8px", letterSpacing: 1 }}>{p.badge}</span>}
        {p.stock <= 3 && p.stock > 0 && <span style={{ position: "absolute", top: 8, left: 8, background: "#EF4444", color: "white", fontSize: 9, padding: "3px 8px" }}>{t("stockLow")} {p.stock} {t("stockLowUnit")}</span>}
        {p.stock === 0 && <span style={{ position: "absolute", top: 8, left: 8, background: "#6B7280", color: "white", fontSize: 9, padding: "3px 8px" }}>{t("stockOut")}</span>}
        <span style={{ fontSize: mob ? 40 : 48 }}>{p.icon}</span>
        <span style={{ fontSize: 9, letterSpacing: 2, color: "#5C4A2A", fontWeight: 600 }}>{p.brand}</span>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, background: "rgba(42,31,14,.88)", padding: "8px 10px", opacity: mob || hov ? 1 : 0, transition: "opacity .25s" }}>
          <Btn onClick={e => { e.stopPropagation(); add(p); show(t("addedToCart")); }} style={{ width: "100%", background: C.go, color: "#fff", padding: "6px 0", fontSize: 12 }}>{t("addToCart")}</Btn>
        </div>
      </div>
      <div style={{ padding: mob ? "10px" : "14px", cursor: "pointer" }} onClick={() => go(`#product-${p.id}`)}>
        <div style={{ fontSize: 9, color: C.go, letterSpacing: 2, marginBottom: 3 }}>{p.brand}</div>
        <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 14 : 16, color: C.dk, marginBottom: 4, lineHeight: 1.3 }}>{p.name}</div>
        <div style={{ fontSize: 11, color: C.mu, lineHeight: 1.5, marginBottom: 8, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" }}>{p.desc}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 18, color: C.dk }}>{p.price} <span style={{ fontSize: 11, color: C.mu, fontFamily: "sans-serif" }}>{t("egp")}</span></span>
          <Stars n={p.stars} />
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Nav({ r, go, openCart, user, onLogout }) {
  const { cnt } = useCart();
  const mob = useMob();
  const { prods: navProds } = useProds();
  const { t, lang, setLang, dir } = useLang();
  const [open, setOpen] = useState(false);
  const links = [["#home",t("navHome")],["#products",t("navProducts")],["#about",t("navAbout")],["#contact",t("navContact")],["#shipping",t("navShipping")]];
  const LangToggle = () => (
    <div style={{display:"flex",alignItems:"center",gap:2,border:`1px solid rgba(0,0,0,.12)`,borderRadius:2,overflow:"hidden",fontSize:11,fontFamily:"Tajawal,sans-serif"}}>
      {["ar","en"].map(l=>(
        <button key={l} onClick={()=>setLang(l)} style={{padding:"4px 8px",background:lang===l?C.go:"none",color:lang===l?"#fff":C.mu,border:"none",cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:11,fontWeight:lang===l?600:400,letterSpacing:.5}}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
  return (
    <>
      <nav style={{ background: C.wh, borderBottom: `1px solid rgba(184,150,62,.15)`, padding: mob ? "10px 16px" : "10px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 200, direction: dir }}>
        <div style={{ cursor: "pointer" }} onClick={() => { go("#home"); setOpen(false); }}><img src={LogoSVG} alt="نوّرَة" style={{height: mob ? 70 : 90, width:"auto", display:"block"}} /></div>
        {!mob && (
          <div style={{display:"flex",alignItems:"center",gap:24}}>
            <ul style={{ display: "flex", gap: 20, listStyle: "none", margin: 0, padding: 0 }}>
              {links.map(([h, l]) => <li key={h}><span onClick={() => go(h)} style={{ cursor: "pointer", color: r === h ? C.go : C.dk, fontSize: 13, fontFamily: "Tajawal,sans-serif" }}>{l}</span></li>)}
            </ul>
            <SearchBar go={go} allProds={(navProds && navProds.length) ? navProds : PRODS} />
          </div>
        )}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <LangToggle />
          {user ? (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {!mob && <span style={{fontSize:12,color:C.mu,fontFamily:"Tajawal,sans-serif"}}>{t("navGreeting")} {user.name} 👋</span>}
              {user.role==="admin" && <Btn onClick={()=>go("#admin")} style={{background:C.go,color:"white",padding:"5px 10px",fontSize:11,letterSpacing:1}}>Admin</Btn>}
              {user.role==="user" && !mob && <Btn onClick={()=>go("#myorders")} style={{background:"none",border:`1px solid ${C.dk}`,color:C.dk,padding:"5px 10px",fontSize:11,fontFamily:"Tajawal,sans-serif"}}>{t("navMyOrders")}</Btn>}
              <Btn onClick={onLogout} style={{background:"none",border:`1px solid rgba(0,0,0,.15)`,color:C.mu,padding:"5px 10px",fontSize:11,fontFamily:"Tajawal,sans-serif"}}>{t("navLogout")}</Btn>
            </div>
          ) : (
            <Btn onClick={()=>go("#login")} style={{background:"none",border:`1px solid ${C.dk}`,color:C.dk,padding:"6px 12px",fontSize:12,fontFamily:"Tajawal,sans-serif"}}>{t("navLogin")}</Btn>
          )}
          <Btn onClick={openCart} style={{ background: "none", fontSize: 20, position: "relative", color: C.dk, padding: 0 }}>
            🛍️{cnt > 0 && <span style={{ position: "absolute", top: -5, left: -5, background: C.go, color: "#fff", fontSize: 9, width: 15, height: 15, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center" }}>{cnt}</span>}
          </Btn>
          {mob && <Btn onClick={() => setOpen(!open)} style={{ background: "none", fontSize: 20, color: C.dk, padding: 0 }}>{open ? "✕" : "☰"}</Btn>}
        </div>
      </nav>
      {mob && open && (
        <div style={{ background: C.wh, borderBottom: `1px solid rgba(0,0,0,.07)`, padding: "6px 20px 14px", direction: dir, position: "sticky", top: 60, zIndex: 199 }}>
          {user && <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)", fontSize: 14, color: C.go, fontFamily: "Tajawal,sans-serif" }}>{t("navGreeting")} {user.name} 👋</div>}
          {links.map(([h, l]) => <span key={h} onClick={() => { go(h); setOpen(false); }} style={{ display: "block", cursor: "pointer", color: r === h ? C.go : C.dk, fontSize: 15, fontFamily: "Tajawal,sans-serif", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}>{l}</span>)}
          {user && user.role === "user" && <span onClick={() => { go("#myorders"); setOpen(false); }} style={{ display: "block", cursor: "pointer", color: r === "#myorders" ? C.go : C.dk, fontSize: 15, fontFamily: "Tajawal,sans-serif", padding: "10px 0", borderBottom: "1px solid rgba(0,0,0,.05)" }}>{t("navMyOrders")} 📦</span>}
        </div>
      )}
    </>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSide({ open, close, go }) {
  const { cart, rem, upd, tot, ship, clr } = useCart();
  const { user } = useAuth();
  const { t, dir } = useLang();
  const mob = useMob();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ n: "", p: "", city: "", addr: "" });
  const W = mob ? "100vw" : "390px";

  if (step === 2) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.wh, padding: "36px 24px", textAlign: "center", maxWidth: 360, width: "100%", direction: dir }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontFamily: "Georgia,serif", fontSize: 22, fontWeight: 300, marginBottom: 10, color: C.dk }}>{t("orderSuccess")}</h3>
        <p style={{ color: C.mu, lineHeight: 1.7, marginBottom: 22, fontSize: 13, fontFamily: "Tajawal,sans-serif" }}>{t("orderSuccessSub")}<br />{t("orderSuccessNote")}<br />{t("orderCash")}.</p>
        <Btn onClick={() => { setStep(0); close(); }} style={{ width: "100%", padding: 13, background: C.dk, color: C.cr, fontSize: 13, letterSpacing: 1 }}>{t("orderContinue")}</Btn>
      </div>
    </div>
  );

  const submit = () => {
    if (!f.n || !f.p || !f.city || !f.addr) { alert(t("orderAlert")); return; }
    const order = {
      id: Date.now(), date: new Date().toLocaleDateString("ar-EG"),
      name: f.n, phone: f.p, city: f.city, address: f.addr,
      userEmail: user?.email || null,
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
      <div style={{ position: "fixed", top: 0, left: open ? 0 : `-${W}`, width: W, height: "100vh", background: C.wh, zIndex: 301, transition: "left .35s", display: "flex", flexDirection: "column", direction: dir, overflowX: "hidden" }}>
        <div style={{ padding: "15px 18px", borderBottom: `1px solid rgba(184,150,62,.15)`, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontFamily: "Georgia,serif", fontSize: 19, color: C.dk }}>{step === 1 ? t("checkoutTitle") : t("cartTitle")}</span>
          <Btn onClick={() => { close(); setStep(0); }} style={{ background: "none", fontSize: 20, color: C.mu, padding: 0 }}>✕</Btn>
        </div>
        {step === 1 ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
            <div style={{ background: C.bl, padding: "9px 12px", marginBottom: 13, borderRight: dir==="rtl"?`3px solid ${C.go}`:undefined, borderLeft: dir==="ltr"?`3px solid ${C.go}`:undefined, fontSize: 12, color: C.mu, fontFamily: "Tajawal,sans-serif" }}><b>{t("checkoutCashLabel")}</b></div>
            {fld("n", t("checkoutName"), t("checkoutNamePh"))}
            {fld("p", t("checkoutPhone"), t("checkoutPhonePh"))}
            {fld("addr", t("checkoutAddr"), t("checkoutAddrPh"))}
            <div style={{ marginBottom: 11 }}>
              <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: C.mu, marginBottom: 5, fontFamily: "Tajawal,sans-serif" }}>{t("checkoutGov")}</label>
              <select value={f.city} onChange={e => setF({ ...f, city: e.target.value })} style={{ width: "100%", padding: "10px 11px", border: "1px solid rgba(0,0,0,.12)", background: C.cr, fontFamily: "Tajawal,sans-serif", fontSize: 13, outline: "none" }}>
                <option value="">{t("checkoutGovPh")}</option>{GOVS.map(g => <option key={g}>{g}</option>)}
              </select>
            </div>
            <div style={{ borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 12, marginBottom: 14 }}>
              {cart.map(i => <div key={i.id} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5, color: C.dk, fontFamily: "Tajawal,sans-serif" }}><span>{i.name} × {i.qty}</span><span>{i.price * i.qty} {t("egp")}</span></div>)}
              <div style={{ display: "flex", justifyContent: "space-between", fontFamily: "Georgia,serif", fontSize: 16, borderTop: "1px solid rgba(0,0,0,.08)", paddingTop: 9, marginTop: 6 }}><span>{t("cartTotal")}</span><span>{tot + ship} {t("egp")}</span></div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={() => setStep(0)} style={{ padding: "12px 14px", background: "none", border: "1px solid rgba(0,0,0,.15)", color: C.mu, fontSize: 12, whiteSpace: "nowrap" }}>{t("checkoutBack")}</Btn>
              <Btn onClick={submit} style={{ flex: 1, background: C.dk, color: C.cr, padding: 12, fontSize: 13, letterSpacing: 1 }}>{t("checkoutConfirm")}</Btn>
            </div>
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 18px" }}>
              {!cart.length ? (
                <div style={{ textAlign: "center", padding: "44px 16px", color: C.mu }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
                  <p style={{ fontFamily: "Georgia,serif", fontSize: 17, fontWeight: 300, marginBottom: 18 }}>{t("cartEmpty")}</p>
                  <Btn onClick={() => { close(); go("#products"); }} style={{ background: C.dk, color: C.cr, padding: "11px 22px", fontSize: 12 }}>{t("cartShopNow")}</Btn>
                </div>
              ) : cart.map(i => (
                <div key={i.id} style={{ display: "flex", gap: 10, padding: "12px 0", borderBottom: "1px solid rgba(0,0,0,.06)", alignItems: "center" }}>
                  <div style={{ width: 56, height: 56, background: i.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, borderRadius: 3 }}><span style={{ fontSize: 22 }}>{i.icon}</span></div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: "Georgia,serif", fontSize: 13, color: C.dk, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{i.name}</div>
                    <div style={{ fontSize: 13, color: C.dk, fontWeight: 500, fontFamily: "Tajawal,sans-serif", marginTop: 2 }}>{i.price * i.qty} {t("egp")}</div>
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
                  <span style={{ fontSize: 11, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>{t("cartTotal")}</span>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 18, color: C.dk }}>{tot} {t("egp")}</span>
                </div>
                {ship > 0 && <div style={{ fontSize: 11, color: C.mu, marginBottom: 6, fontFamily: "Tajawal,sans-serif" }}>+ {ship} {t("egp")} | {500 - tot} {t("cartShipAdd")}</div>}
                {ship === 0 && <div style={{ fontSize: 11, color: "#2E6B3E", marginBottom: 6, fontFamily: "Tajawal,sans-serif" }}>{t("cartShipFree")}</div>}
                <div style={{ background: C.bl, padding: "8px 11px", fontSize: 11, color: C.mu, marginBottom: 10, fontFamily: "Tajawal,sans-serif" }}>{t("cartCashOnly")}</div>
                <Btn onClick={() => { if (!user) { close(); go("#login"); } else setStep(1); }} style={{ width: "100%", background: C.dk, color: C.cr, padding: 13, fontSize: 13, letterSpacing: 1, marginBottom: 7 }}>{t("cartCheckout")}</Btn>
                <Btn onClick={close} style={{ width: "100%", background: "transparent", color: C.mu, border: "1px solid rgba(0,0,0,.1)", padding: 11, fontSize: 12 }}>{t("cartContinue")}</Btn>
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
  const { t, dir } = useLang();
  const mob = useMob();
  const [tab, setTab] = useState("login");
  const [f, setF] = useState({ name:"", email:"", pass:"", pass2:"" });
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = () => {
    setErr(""); setLoading(true);
    setTimeout(() => {
      setLoading(false);
      if (tab === "login") {
        const r = login(f.email, f.pass);
        if (r.ok) go("#home"); else setErr(r.err);
      } else {
        if (!f.name || !f.email || !f.pass) return setErr(t("loginErrFields"));
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) return setErr(t("loginErrEmail"));
        if (f.pass !== f.pass2) return setErr(t("loginErrPass"));
        const r = register(f.name, f.email, f.pass);
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
    <div style={{direction:dir,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.bl},${C.cr})`}}>
      <div style={{background:C.wh,padding:mob?"28px 20px":"44px",width:mob?"92%":"420px",boxShadow:"0 8px 40px rgba(0,0,0,.10)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LogoSVG} alt="نوّرَة" style={{height:80,display:"block",margin:"0 auto 14px"}}/>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid rgba(0,0,0,.1)",marginBottom:24}}>
          {[["login",t("loginTab")],["register",t("registerTab")]].map(([k,l])=>(
            <button key={k} onClick={()=>{setTab(k);setErr("");}} style={{flex:1,padding:"11px 0",background:"none",border:"none",borderBottom:tab===k?`2px solid ${C.dk}`:"2px solid transparent",cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:14,color:tab===k?C.dk:C.mu,fontWeight:tab===k?500:300}}>{l}</button>
          ))}
        </div>
        {tab==="register" && inp("name",t("loginFullName"),t("loginFullNamePh"))}
        {inp("email",t("loginEmail"),t("loginEmailPh"),"email")}
        {inp("pass",t("loginPass"),t("loginPassPh"),"password")}
        {tab==="register" && inp("pass2",t("loginConfirmPass"),t("loginPassPh"),"password")}
        {err && <div style={{background:"#FEE2E2",color:"#DC2626",padding:"9px 12px",marginBottom:14,fontSize:12,fontFamily:"Tajawal,sans-serif",borderRight:dir==="rtl"?"3px solid #DC2626":undefined,borderLeft:dir==="ltr"?"3px solid #DC2626":undefined}}>{err}</div>}
        <button onClick={submit} disabled={loading}
          style={{width:"100%",background:loading?C.mu:C.dk,color:C.cr,border:"none",padding:14,cursor:loading?"not-allowed":"pointer",fontFamily:"Tajawal,sans-serif",fontSize:14,letterSpacing:1,transition:"background .2s"}}>
          {loading?t("loginLoading"):tab==="login"?t("loginBtn"):t("registerBtn")}
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

  const allRegisteredUsers = (() => { try { return JSON.parse(localStorage.getItem("nawra_users") || "[]"); } catch { return []; } })();
  const tabs = [["overview","📊 نظرة عامة"],["products","📦 المنتجات"],["orders","🧾 الطلبات"],["customers","👥 العملاء"]];

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

        {/* CUSTOMERS */}
        {tab==="customers" && (
          <div>
            <h3 style={{fontFamily:"Georgia,serif",fontSize:18,fontWeight:400,color:C.dk,marginBottom:16}}>العملاء المسجلون ({allRegisteredUsers.length})</h3>
            {allRegisteredUsers.length===0 ? (
              <div style={{background:C.wh,padding:"40px",textAlign:"center",color:C.mu,fontFamily:"Tajawal,sans-serif",boxShadow:"0 2px 8px rgba(0,0,0,.06)"}}>
                <div style={{fontSize:40,marginBottom:12}}>👥</div>
                <p>مفيش عملاء مسجلين لحد دلوقتي</p>
              </div>
            ) : (
              <div style={{background:C.wh,boxShadow:"0 2px 8px rgba(0,0,0,.06)",overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:"Tajawal,sans-serif"}}>
                  <thead>
                    <tr style={{background:C.bl,borderBottom:`2px solid rgba(184,150,62,.2)`}}>
                      {["#","الاسم","البريد الإلكتروني","تاريخ التسجيل","عدد الطلبات","إجمالي الإنفاق"].map(h=>(
                        <th key={h} style={{padding:mob?"10px 10px":"12px 16px",textAlign:"right",fontSize:11,letterSpacing:1,color:C.mu,fontWeight:500}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {allRegisteredUsers.map((u,i)=>{
                      const userOrders = orderList.filter(o=>o.userEmail===u.email);
                      const totalSpent = userOrders.reduce((s,o)=>s+(o.total||0),0);
                      return (
                        <tr key={u.email} style={{borderBottom:"1px solid rgba(0,0,0,.06)",background:i%2===0?C.wh:C.cr}}>
                          <td style={{padding:mob?"10px 10px":"12px 16px",fontSize:12,color:C.mu}}>{i+1}</td>
                          <td style={{padding:mob?"10px 10px":"12px 16px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{width:32,height:32,borderRadius:"50%",background:C.bl,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:C.go,fontWeight:600,flexShrink:0}}>{u.name[0]}</div>
                              <span style={{fontSize:14,color:C.dk}}>{u.name}</span>
                            </div>
                          </td>
                          <td style={{padding:mob?"10px 10px":"12px 16px",fontSize:13,color:C.mu}}>{u.email}</td>
                          <td style={{padding:mob?"10px 10px":"12px 16px",fontSize:12,color:C.mu}}>{u.registeredAt||"—"}</td>
                          <td style={{padding:mob?"10px 10px":"12px 16px",textAlign:"center"}}>
                            <span style={{background:userOrders.length>0?"#D1FAE5":"#F3F4F6",color:userOrders.length>0?"#065F46":"#6B7280",fontSize:12,padding:"2px 10px",borderRadius:10}}>{userOrders.length}</span>
                          </td>
                          <td style={{padding:mob?"10px 10px":"12px 16px"}}>
                            <span style={{fontFamily:"Georgia,serif",fontSize:15,color:C.dk}}>{totalSpent.toLocaleString()} <span style={{fontSize:11,color:C.mu,fontFamily:"sans-serif"}}>جنيه</span></span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
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
  const { t } = useLang();
  const msg = encodeURIComponent(t("waMsg"));
  const waLines = t("waHello").split("\n");
  return (
    <div style={{position:"fixed",bottom:24,left:24,zIndex:500,direction:"ltr"}}>
      {show && (
        <div style={{background:"white",borderRadius:12,padding:16,marginBottom:10,
          boxShadow:"0 4px 20px rgba(0,0,0,.15)",maxWidth:220,direction:"rtl",
          animation:"fadeIn .2s ease"}}>
          <div style={{fontSize:13,color:"#2A1F0E",fontFamily:"Tajawal,sans-serif",marginBottom:10,lineHeight:1.6}}>
            {waLines[0]}<br/>{waLines[1]}
          </div>
          <a href={`https://wa.me/${WA_NUM}?text=${msg}`} target="_blank" rel="noreferrer"
            style={{display:"block",background:"#25D366",color:"white",padding:"9px 14px",
              borderRadius:8,textDecoration:"none",fontSize:13,fontFamily:"Tajawal,sans-serif",
              textAlign:"center",fontWeight:500}}>
            {t("waStart")}
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
  const { t } = useLang();
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
          placeholder={t("searchPh")}
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
            {t("searchViewAll")}
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
  const { t } = useLang();
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
      name: user?.name || form.name || t("reviewsDefault"),
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
            {t("reviewsTitle")}
          </h3>
          {avg && (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:"Georgia,serif",fontSize:24,color:"#2A1F0E"}}>{avg}</span>
              <span style={{color:"#B8963E",fontSize:16}}>{Array(5).fill(0).map((_,i)=>i<Math.round(avg)?"★":"☆").join("")}</span>
              <span style={{fontSize:12,color:"#9C7E6A",fontFamily:"Tajawal,sans-serif"}}>({reviews.length} {t("reviewsRatings")})</span>
            </div>
          )}
        </div>

        {/* Review list */}
        <div style={{marginBottom:28}}>
          {reviews.length===0 ? (
            <p style={{color:"#9C7E6A",fontFamily:"Tajawal,sans-serif",fontSize:13,padding:"20px 0"}}>
              {t("reviewsEmpty")}
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
            {t("reviewsFormTitle")}
          </h4>
          {submitted ? (
            <div style={{color:"#10B981",fontFamily:"Tajawal,sans-serif",fontSize:14,padding:"10px 0"}}>{t("reviewsThanks")}</div>
          ) : (
            <>
              {!user && (
                <div style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:10,letterSpacing:2,color:"#9C7E6A",marginBottom:5,fontFamily:"Tajawal,sans-serif"}}>{t("reviewsNameLabel")}</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={t("reviewsNamePh")}
                    style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(0,0,0,.12)",background:"white",fontFamily:"Tajawal,sans-serif",fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>
              )}
              <div style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:10,letterSpacing:2,color:"#9C7E6A",marginBottom:8,fontFamily:"Tajawal,sans-serif"}}>{t("reviewsRatingLabel")}</label>
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
                <label style={{display:"block",fontSize:10,letterSpacing:2,color:"#9C7E6A",marginBottom:5,fontFamily:"Tajawal,sans-serif"}}>{t("reviewsCommentLabel")}</label>
                <textarea value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})}
                  rows={3} placeholder={t("reviewsCommentPh")}
                  style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(0,0,0,.12)",background:"white",fontFamily:"Tajawal,sans-serif",fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <button onClick={submit}
                style={{background:"#2A1F0E",color:"#FBF7F4",border:"none",padding:"11px 24px",
                  cursor:"pointer",fontFamily:"Tajawal,sans-serif",fontSize:13,letterSpacing:1}}>
                {t("reviewsSubmit")}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Pages ────────────────────────────────────────────────────────────────────
function Home({ go, allProds }) {
  const { prods: _p } = useProds();
  const { user } = useAuth();
  const { t, dir } = useLang();
  const homProds = allProds || _p || PRODS;
  const mob = useMob();
  const px = mob ? "16px" : "56px";
  const feats = [["🚚",t("feat1"),t("feat1d")],["💳",t("feat2"),t("feat2d")],["✅",t("feat3"),t("feat3d")],["↩️",t("feat4"),t("feat4d")]];
  return (
    <div style={{ direction: dir }}>
      {user && user.role === "user" && (
        <div style={{ background: C.go, color: "#fff", textAlign: "center", padding: "9px 16px", fontSize: mob ? 12 : 14, fontFamily: "Tajawal,sans-serif" }}>
          {t("welcomeBack")} <strong>{user.name}</strong>! 🌸 &nbsp;—&nbsp; <span onClick={() => go("#myorders")} style={{ cursor: "pointer", textDecoration: "underline" }}>{t("welcomeViewOrders")}</span>
        </div>
      )}
      <div style={{ background: C.dk, color: C.bl, textAlign: "center", padding: "8px", fontSize: mob ? 11 : 13, letterSpacing: 1, fontFamily: "Tajawal,sans-serif" }}>{t("topBanner")}</div>
      <section style={{ background: `linear-gradient(135deg,${C.bl},${C.cr},#EDE3DC)`, display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center", padding: mob ? "44px 20px" : "72px 40px", minHeight: mob ? "55vh" : "78vh" }}>
        <div>
          <img src={LogoSVG} alt="نوّرَة" style={{height: mob ? 180 : 240, width:"auto", display:"block", margin:"0 auto 24px"}} />
          <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? "clamp(26px,8vw,38px)" : "clamp(36px,5vw,58px)", fontWeight: 300, color: C.dk, lineHeight: 1.2, marginBottom: 14 }}>{t("heroTitle")} <em style={{ color: C.ro }}>{t("heroTitleEm")}</em></h1>
          <p style={{ fontSize: mob ? 13 : 15, color: C.mu, lineHeight: 1.8, marginBottom: 28, fontFamily: "Tajawal,sans-serif", fontWeight: 300 }}>{t("heroSub")}<br />{t("heroSub2")}</p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <Btn onClick={() => go("#products")} style={{ background: C.dk, color: C.cr, padding: mob ? "11px 22px" : "13px 30px", fontSize: 12, letterSpacing: 2 }}>{t("heroShopNow")}</Btn>
            <Btn onClick={() => go("#about")} style={{ background: "transparent", color: C.dk, padding: mob ? "11px 22px" : "13px 30px", border: `1px solid ${C.dk}`, fontSize: 12, letterSpacing: 2 }}>{t("heroAboutUs")}</Btn>
          </div>
        </div>
      </section>
      <div style={{ background: C.dk, padding: "11px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-block", animation: "mq 22s linear infinite" }}>
          {["CERAVE","✦","THE ORDINARY","✦","LA ROCHE-POSAY","✦","NEUTROGENA","✦","GARNIER","✦","BIODERMA","✦","CERAVE","✦","THE ORDINARY","✦","LA ROCHE-POSAY","✦","NEUTROGENA","✦","GARNIER","✦","BIODERMA","✦"].map((s, i) => (
            <span key={i} style={{ color: s === "✦" ? C.go : C.bl, fontSize: 10, letterSpacing: 3, padding: "0 16px", fontFamily: "Tajawal,sans-serif" }}>{s}</span>
          ))}
        </div>
      </div>
      <section style={{ background: C.wh, padding: mob ? "22px 16px" : "32px 56px" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)", gap: mob ? 12 : 22, maxWidth: 1050, margin: "0 auto", textAlign: "center" }}>
          {feats.map(([ic, lbl, d]) => (
            <div key={lbl}>
              <div style={{ fontSize: mob ? 20 : 24, color: C.go, marginBottom: 6 }}>{ic}</div>
              <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 13 : 14, color: C.dk, marginBottom: 3 }}>{lbl}</div>
              <div style={{ fontSize: mob ? 10 : 11, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>{d}</div>
            </div>
          ))}
        </div>
      </section>
      <section style={{ padding: `32px ${px}`, background: C.cr }}>
        <div style={{ textAlign: "center", marginBottom: 22 }}>
          <div style={{ fontSize: 9, letterSpacing: 3, color: C.go, marginBottom: 7, fontFamily: "Tajawal,sans-serif" }}>{t("homeBestSellersTag")}</div>
          <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 24 : 32, fontWeight: 300, color: C.dk }}>{t("homeBestSellersTitle")}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr" : "repeat(3,1fr)", gap: mob ? 12 : 16, maxWidth: 1050, margin: "0 auto" }}>
          {homProds.slice(0, 3).map(p => <Card key={p.id} p={p} go={go} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <Btn onClick={() => go("#products")} style={{ background: "none", border: `1px solid ${C.dk}`, color: C.dk, padding: mob ? "10px 22px" : "12px 28px", fontSize: 12, letterSpacing: 2 }}>{t("homeViewAll")}</Btn>
        </div>
      </section>
      <section style={{ background: C.dk, padding: mob ? "34px 20px" : "48px 40px", textAlign: "center", color: C.bl }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 22 : 30, fontWeight: 300, marginBottom: 10 }}>{t("homeCtaTitle")}</h2>
        <p style={{ fontSize: mob ? 12 : 14, opacity: .7, marginBottom: 22, fontFamily: "Tajawal,sans-serif" }}>{t("homeCtaSub")}</p>
        <Btn onClick={() => go("#products")} style={{ background: C.go, color: "#fff", padding: mob ? "11px 26px" : "13px 40px", fontSize: 12, letterSpacing: 2 }}>{t("homeCtaBtn")}</Btn>
      </section>
      <style>{`@keyframes mq{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
    </div>
  );
}

function Products({ go, allProds }) {
  const { prods: _p } = useProds();
  allProds = allProds || _p || PRODS;
  const { t, dir } = useLang();
  const mob = useMob();
  const [fil, setFil] = useState("__all__");
  const [srt, setSrt] = useState("d");
  const prodsData = (allProds && allProds.length) ? allProds : PRODS;
  const brandKeys = [...new Set(prodsData.map(p => p.brand))];
  let list = fil === "__all__" ? prodsData : prodsData.filter(p => p.brand === fil);
  if (srt === "a") list = [...list].sort((a, b) => a.price - b.price);
  if (srt === "z") list = [...list].sort((a, b) => b.price - a.price);
  const px = mob ? "16px" : "56px";
  return (
    <div style={{ direction: dir, minHeight: "80vh" }}>
      <div style={{ background: C.bl, padding: mob ? "26px 20px" : "40px 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 36, fontWeight: 300, color: C.dk }}>{t("prodsTitle")}</h1>
        <p style={{ color: C.mu, marginTop: 8, fontFamily: "Tajawal,sans-serif", fontSize: 13 }}>{t("prodsSub")}</p>
      </div>
      <div style={{ background: C.wh, padding: mob ? "10px 16px" : "12px 56px", borderBottom: "1px solid rgba(0,0,0,.07)" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <Btn onClick={() => setFil("__all__")} style={{ padding: "5px 11px", border: `1px solid ${fil === "__all__" ? C.dk : "rgba(0,0,0,.12)"}`, background: fil === "__all__" ? C.dk : C.wh, color: fil === "__all__" ? C.cr : C.dk, fontSize: mob ? 10 : 12, whiteSpace: "nowrap" }}>{t("prodsFilterAll")}</Btn>
          {brandKeys.map(b => <Btn key={b} onClick={() => setFil(b)} style={{ padding: "5px 11px", border: `1px solid ${fil === b ? C.dk : "rgba(0,0,0,.12)"}`, background: fil === b ? C.dk : C.wh, color: fil === b ? C.cr : C.dk, fontSize: mob ? 10 : 12, whiteSpace: "nowrap" }}>{b}</Btn>)}
          <select value={srt} onChange={e => setSrt(e.target.value)} style={{ padding: "5px 9px", border: "1px solid rgba(0,0,0,.12)", background: C.cr, fontFamily: "Tajawal,sans-serif", fontSize: mob ? 10 : 12, outline: "none", marginInlineStart: "auto" }}>
            <option value="d">{t("prodsSortDefault")}</option><option value="a">{t("prodsSortAsc")}</option><option value="z">{t("prodsSortDesc")}</option>
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
  const { t, dir } = useLang();
  if (!p) return <div style={{ padding: 60, textAlign: "center" }}>{t("prodNotFound")}</div>;
  const px = mob ? "16px" : "56px";
  const rel = prodsData.filter(x => x.id !== p.id).slice(0, mob ? 2 : 3);
  return (
    <div style={{ direction: dir, minHeight: "80vh" }}>
      <div style={{ padding: `10px ${px}`, background: C.wh, borderBottom: "1px solid rgba(0,0,0,.06)", fontSize: 11, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>
        <span onClick={() => go("#home")} style={{ cursor: "pointer" }}>{t("prodHome")}</span>{" > "}<span onClick={() => go("#products")} style={{ cursor: "pointer" }}>{t("prodProds")}</span>{" > "}{p.name}
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
                  {p.stock <= 3 ? `${t("prodLowStock")} ${p.stock} ${t("prodLowStockSuffix")}` : `${t("prodAvail")} ${p.stock} ${t("prodInStock")}`}
                </span>
              </>
            ) : (
              <>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6B7280", display: "inline-block" }}/>
                <span style={{ fontSize: 12, color: "#6B7280", fontFamily: "Tajawal,sans-serif" }}>{t("prodOutStock")}</span>
              </>
            )}
          </div>
          <p style={{ fontSize: mob ? 13 : 14, color: C.mu, lineHeight: 1.8, marginBottom: 16, fontFamily: "Tajawal,sans-serif" }}>{p.desc}</p>
          <div style={{ fontFamily: "Georgia,serif", fontSize: mob ? 24 : 30, color: C.dk, marginBottom: 18 }}>{p.price} <span style={{ fontSize: 12, color: C.mu, fontFamily: "sans-serif" }}>{t("egp")}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
            <Btn onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 34, height: 34, border: `1px solid ${C.dk}`, background: "none", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</Btn>
            <span style={{ fontSize: 16, minWidth: 22, textAlign: "center" }}>{qty}</span>
            <Btn onClick={() => setQty(qty + 1)} style={{ width: 34, height: 34, border: `1px solid ${C.dk}`, background: "none", fontSize: 17, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</Btn>
          </div>
          <Btn onClick={() => { for (let i = 0; i < qty; i++) add(p); show(t("addedToCart")); }} style={{ width: "100%", background: C.dk, color: C.cr, padding: 13, fontSize: 13, letterSpacing: 1, marginBottom: 10 }}>{t("prodAddToCart")}</Btn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 6 }}>
            {[["🚚",t("prodShipping")],["💰",t("prodCash")],["↩️",t("prodReturn")]].map(([ic, lbl]) => (
              <div key={lbl} style={{ background: C.cr, padding: "8px 5px", textAlign: "center", fontSize: 10, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>
                <div style={{ fontSize: 16, marginBottom: 3 }}>{ic}</div>{lbl}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div style={{ maxWidth: 1050, margin: "0 auto", padding: `0 ${px} 32px` }}>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(0,0,0,.1)", marginBottom: 16 }}>
          {[["d",t("prodDetailsTab")],["u",t("prodUseTab")]].map(([k, l]) => (
            <Btn key={k} onClick={() => setTab(k)} style={{ padding: mob ? "10px 16px" : "11px 24px", background: "none", borderBottom: tab === k ? `2px solid ${C.dk}` : "2px solid transparent", color: tab === k ? C.dk : C.mu, fontSize: mob ? 12 : 13, fontWeight: tab === k ? 500 : 300 }}>{l}</Btn>
          ))}
        </div>
        <p style={{ fontSize: mob ? 13 : 14, color: C.mu, lineHeight: 1.9, fontFamily: "Tajawal,sans-serif", fontWeight: 300 }}>{tab === "d" ? p.det : p.use}</p>
      </div>
      <Reviews productId={id} />
      <div style={{ background: C.cr, padding: `28px ${px}` }}>
        <h2 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 18 : 24, fontWeight: 300, color: C.dk, marginBottom: 16, textAlign: "center" }}>{t("prodRelated")}</h2>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(3,1fr)", gap: mob ? 10 : 12, maxWidth: 1050, margin: "0 auto" }}>
          {rel.map(p => <Card key={p.id} p={p} go={go} />)}
        </div>
      </div>
    </div>
  );
}

function About({ go }) {
  const { t, dir } = useLang();
  const mob = useMob();
  const px = mob ? "20px" : "56px";
  return (
    <div style={{ direction: dir }}>
      <div style={{ background: C.bl, padding: mob ? "34px 20px" : "60px 56px", textAlign: "center" }}>
        <img src={LogoSVG} alt="نوّرَة" style={{height: mob ? 150 : 200, width:"auto", display:"block", margin:"0 auto 16px"}} />
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 22 : 36, fontWeight: 300, color: C.dk, marginBottom: 10 }}>{t("aboutTitle")}</h1>
        <p style={{ fontSize: mob ? 13 : 15, color: C.mu, maxWidth: 440, margin: "0 auto", lineHeight: 1.9, fontFamily: "Tajawal,sans-serif" }}>{t("aboutSub")}</p>
      </div>
      <div style={{ maxWidth: 700, margin: "0 auto", padding: `${mob ? "28px" : "48px"} ${px}` }}>
        {t("aboutSect").map(s => (
          <div key={s.t} style={{ marginBottom: 26 }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 18 : 22, fontWeight: 400, color: C.dk, marginBottom: 8, borderInlineStart: `3px solid ${C.go}`, paddingInlineStart: 12 }}>{s.t}</h3>
            <p style={{ fontSize: mob ? 13 : 14, color: C.mu, lineHeight: 1.9, fontFamily: "Tajawal,sans-serif", fontWeight: 300, paddingInlineStart: 15 }}>{s.x}</p>
          </div>
        ))}
        <div style={{ background: C.bl, padding: mob ? "20px" : "26px", textAlign: "center", marginTop: 26 }}>
          <p style={{ fontFamily: "Georgia,serif", fontSize: mob ? 16 : 19, fontStyle: "italic", color: C.dk, marginBottom: 14 }}>{t("aboutCtaQ")}</p>
          <Btn onClick={() => go("#products")} style={{ background: C.dk, color: C.cr, padding: mob ? "10px 22px" : "12px 28px", fontSize: 12, letterSpacing: 2 }}>{t("aboutCtaBtn")}</Btn>
        </div>
      </div>
    </div>
  );
}

function Contact() {
  const { t, dir } = useLang();
  const mob = useMob();
  const px = mob ? "20px" : "56px";
  const [f, setF] = useState({ n: "", e: "", p: "", m: "" });
  const [ok, setOk] = useState(false);
  return (
    <div style={{ direction: dir }}>
      <div style={{ background: C.bl, padding: mob ? "30px 20px" : "48px 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 36, fontWeight: 300, color: C.dk }}>{t("contactTitle")}</h1>
        <p style={{ color: C.mu, marginTop: 8, fontFamily: "Tajawal,sans-serif", fontSize: 13 }}>{t("contactSub")}</p>
      </div>
      <div style={{ maxWidth: 780, margin: "0 auto", padding: `${mob ? "26px" : "48px"} ${px}`, display: mob ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 48 }}>
        <div style={{ marginBottom: mob ? 26 : 0 }}>
          <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 18 : 22, fontWeight: 400, color: C.dk, marginBottom: 16 }}>{t("contactInfoTitle")}</h3>
          {t("contactInfo").map(([ic, l, v]) => (
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
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: 18, marginBottom: 7 }}>{t("contactSentTitle")}</h3>
              <p style={{ color: C.mu, fontFamily: "Tajawal,sans-serif", fontSize: 13, marginBottom: 14 }}>{t("contactSentMsg")}</p>
              <Btn onClick={() => setOk(false)} style={{ background: C.dk, color: C.cr, padding: "10px 20px", fontSize: 12 }}>{t("contactNewBtn")}</Btn>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 18 : 22, fontWeight: 400, color: C.dk, marginBottom: 16 }}>{t("contactFormTitle")}</h3>
              {t("contactFields").map(([k, l, ph]) => (
                <div key={k} style={{ marginBottom: 11 }}>
                  <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: C.mu, marginBottom: 4, fontFamily: "Tajawal,sans-serif" }}>{l}</label>
                  <input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} style={{ width: "100%", padding: "10px 11px", border: "1px solid rgba(0,0,0,.12)", background: C.cr, fontFamily: "Tajawal,sans-serif", fontSize: 13, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 14 }}>
                <label style={{ display: "block", fontSize: 10, letterSpacing: 2, color: C.mu, marginBottom: 4, fontFamily: "Tajawal,sans-serif" }}>{t("contactMsgLabel")}</label>
                <textarea value={f.m} onChange={e => setF({ ...f, m: e.target.value })} rows={mob ? 4 : 5} placeholder={t("contactMsgPh")} style={{ width: "100%", padding: "10px 11px", border: "1px solid rgba(0,0,0,.12)", background: C.cr, fontFamily: "Tajawal,sans-serif", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <Btn onClick={() => { if (f.n && f.m) setOk(true); }} style={{ width: "100%", background: C.dk, color: C.cr, padding: 13, fontSize: 13, letterSpacing: 1 }}>{t("contactSendBtn")}</Btn>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function Shipping() {
  const { t, dir } = useLang();
  const mob = useMob();
  const px = mob ? "20px" : "56px";
  return (
    <div style={{ direction: dir }}>
      <div style={{ background: C.bl, padding: mob ? "30px 20px" : "48px 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 26 : 36, fontWeight: 300, color: C.dk }}>{t("shippingTitle")}</h1>
        <p style={{ color: C.mu, marginTop: 8, fontFamily: "Tajawal,sans-serif", fontSize: 13 }}>{t("shippingSub")}</p>
      </div>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: `${mob ? "26px" : "44px"} ${px}` }}>
        {t("shippingSects").map(s => (
          <div key={s.t} style={{ marginBottom: 24 }}>
            <h3 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 17 : 21, fontWeight: 400, color: C.dk, marginBottom: 10, borderInlineStart: `3px solid ${C.go}`, paddingInlineStart: 12 }}>{s.t}</h3>
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
  const { t, dir } = useLang();
  const mob = useMob();
  return (
    <footer style={{ background: C.dk, color: C.bl, direction: dir }}>
      <div style={{ padding: mob ? "26px 18px" : "36px 56px", display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "2fr 1fr 1fr 1fr", gap: mob ? "18px" : "36px", maxWidth: 1050, margin: "0 auto" }}>
        <div style={{ gridColumn: mob ? "1 / -1" : undefined }}>
          <img src={LogoSVG} alt="نوّرَة" style={{height: mob ? 80 : 100, width:"auto", marginBottom:12, filter:"brightness(0) invert(1) opacity(0.85)"}} />
          <p style={{ fontSize: 11, opacity: .5, lineHeight: 1.8, fontFamily: "Tajawal,sans-serif", fontWeight: 300, maxWidth: 200 }}>{t("footerTagline")}</p>
        </div>
        {t("footerCols").map(col => (
          <div key={col.t}>
            <h4 style={{ fontSize: 9, letterSpacing: 3, color: C.go, marginBottom: 11, fontFamily: "Tajawal,sans-serif" }}>{col.t}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {col.l.map(([h, l]) => <li key={l} style={{ marginBottom: 7 }}><span onClick={() => go(h)} style={{ fontSize: 12, opacity: .6, cursor: "pointer", color: C.bl, fontFamily: "Tajawal,sans-serif" }}>{l}</span></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(255,255,255,.08)", padding: "11px 18px", textAlign: "center", fontSize: 10, opacity: .4, letterSpacing: 1, fontFamily: "Tajawal,sans-serif" }}>
        {t("footerCopyright")}
      </div>
    </footer>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
// ─── My Orders Page ───────────────────────────────────────────────────────────
function MyOrders({ go }) {
  const { user } = useAuth();
  const { t, dir } = useLang();
  const mob = useMob();
  const px = mob ? "16px" : "56px";

  if (!user) { go("#login"); return null; }

  const allOrders = (() => { try { return JSON.parse(localStorage.getItem("nawra_orders") || "[]"); } catch { return []; } })();
  const orders = allOrders.filter(o => o.userEmail === user.email);
  const statusColor = (s) => s === "مكتمل" ? { bg:"#D1FAE5", c:"#065F46" } : s === "ملغي" ? { bg:"#FEE2E2", c:"#DC2626" } : { bg:"#FEF3C7", c:"#92400E" };

  return (
    <div style={{ direction: dir, minHeight: "80vh", background: C.cr }}>
      <div style={{ background: C.bl, padding: mob ? "28px 20px" : "40px 56px", textAlign: "center" }}>
        <h1 style={{ fontFamily: "Georgia,serif", fontSize: mob ? 24 : 34, fontWeight: 300, color: C.dk }}>{t("myOrdersTitle")}</h1>
        <p style={{ color: C.mu, marginTop: 8, fontFamily: "Tajawal,sans-serif", fontSize: 13 }}>{t("myOrdersHello")} <strong>{user.name}</strong> — {t("myOrdersSub")}</p>
      </div>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: `24px ${px}` }}>
        {orders.length === 0 ? (
          <div style={{ background: C.wh, padding: "48px 24px", textAlign: "center", boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
            <div style={{ fontSize: 48, marginBottom: 14 }}>🛍️</div>
            <p style={{ fontFamily: "Georgia,serif", fontSize: 20, fontWeight: 300, color: C.dk, marginBottom: 10 }}>{t("myOrdersEmpty")}</p>
            <p style={{ color: C.mu, fontFamily: "Tajawal,sans-serif", fontSize: 13, marginBottom: 22 }}>{t("myOrdersEmptySub")}</p>
            <Btn onClick={() => go("#products")} style={{ background: C.dk, color: C.cr, padding: "12px 28px", fontSize: 13, letterSpacing: 1 }}>{t("myOrdersShop")}</Btn>
          </div>
        ) : orders.map(o => {
          const sc = statusColor(o.status);
          return (
            <div key={o.id} style={{ background: C.wh, padding: mob ? "16px" : "20px", marginBottom: 12, boxShadow: "0 2px 8px rgba(0,0,0,.06)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 12, color: C.mu, fontFamily: "Tajawal,sans-serif" }}>{t("myOrdersNum")} <span style={{ color: C.dk, fontWeight: 500 }}>#{o.id}</span></div>
                  <div style={{ fontSize: 12, color: C.mu, fontFamily: "Tajawal,sans-serif", marginTop: 3 }}>{o.date} | {o.city}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 11, padding: "3px 12px", background: sc.bg, color: sc.c, fontFamily: "Tajawal,sans-serif", borderRadius: 10 }}>{o.status}</span>
                  <span style={{ fontFamily: "Georgia,serif", fontSize: 17, color: C.dk }}>{o.total} {t("egp")}</span>
                </div>
              </div>
              <div style={{ borderTop: "1px solid rgba(0,0,0,.06)", paddingTop: 10 }}>
                {(o.items || []).map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.dk, fontFamily: "Tajawal,sans-serif", marginBottom: 4 }}>
                    <span>{item.name} × {item.qty}</span>
                    <span>{item.price * item.qty} {t("egp")}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
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
    </LangProvider>
  );
}

function AppInner() {
  const { route, nav: go } = useRoute();
  const { user, logout } = useAuth();
  const { prods } = useProds();
  const { dir } = useLang();
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
      case "#myorders": return <MyOrders go={go} />;
      default:          return <Home go={go} allProds={(prods&&prods.length)?prods:PRODS} />;
    }
  };

  return (
    <div dir={dir} style={{ fontFamily: "Tajawal,sans-serif", background: C.cr, minHeight: "100vh", overflowX: "hidden" }}>
      {!isAdmin && <Nav r={route} go={go} openCart={() => setCartOpen(true)} user={user} onLogout={logout} />}
      {!isAdmin && <CartSide open={cartOpen} close={() => setCartOpen(false)} go={go} />}
      <main>{page()}</main>
      {!isAdmin && <Footer go={go} />}
      {!isAdmin && <WAFloat />}
    </div>
  );
}
