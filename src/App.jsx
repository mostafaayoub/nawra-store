import { useState, useEffect, createContext, useContext } from "react";
import LogoImg from '/nawra-logo.png';

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
    // ── Address system ──────────────────────────────────────────────────────
    navAddresses:"عناويني",
    addrPageTitle:"عناويني", addrPageSub:"إدارة عناوين التوصيل",
    addrCountry:"الدولة", addrCountryVal:"🇪🇬 مصر",
    addrFullName:"الاسم الكامل", addrFullNamePh:"الاسم الأول والأخير",
    addrPhone:"رقم الموبايل", addrPhonePh:"1xxxxxxxxx",
    addrStreet:"الشارع", addrStreetPh:"اسم الشارع",
    addrBuilding:"اسم / رقم المبنى", addrBuildingPh:"مثال: عمارة النيل، شقة 5",
    addrCity:"المدينة / المنطقة", addrCityPh:"مثال: المعادي، مدينة نصر",
    addrDistrict:"الحي", addrDistrictPh:"اسم الحي",
    addrGov:"المحافظة", addrGovPh:"اختاري المحافظة",
    addrLandmark:"أقرب معلم", addrLandmarkPh:"اختياري — مثال: قرب مسجد النور",
    addrType:"نوع العنوان",
    addrHome:"🏠 منزل", addrOffice:"🏢 مكتب",
    addrOfficeHols:"هل المكتب مفتوح في الإجازات؟",
    addrFriday:"الجمعة", addrSaturday:"السبت",
    addrGPS:"📍 استخدم موقعي الحالي",
    addrGPSGetting:"جاري تحديد الموقع...",
    addrGPSDone:"✓ تم تحديد الموقع",
    addrGPSError:"تعذّر الوصول للموقع",
    addrDefault:"تعيين كعنوان افتراضي",
    addrSave:"حفظ العنوان", addrSaving:"جاري الحفظ...",
    addrEdit:"تعديل", addrRemove:"حذف",
    addrSetDefault:"تعيين كافتراضي", addrDefaultBadge:"الافتراضي",
    addrAddNew:"+ إضافة عنوان جديد",
    addrConfirmDel:"هل تريد حذف هذا العنوان؟",
    addrUseThis:"استخدم هذا العنوان",
    addrAddNewCheckout:"+ إضافة عنوان جديد",
    addrSelectTitle:"اختاري عنوان التوصيل",
    addrNoAddresses:"مفيش عناوين محفوظة",
    addrNoAddressesSub:"أضيفي عنوانك الأول لتسريع عملية الشراء",
    addrRequired:"من فضلك اكملي الحقول الإلزامية",
    // ── Order timeline + detail ─────────────────────────────────────────────
    timelineReceived:"تم الاستلام",
    timelinePreparing:"قيد التجهيز",
    timelineShipped:"تم الشحن",
    timelineDelivered:"تم التسليم",
    timelineCancelled:"تم إلغاء الطلب",
    detailTitle:"تفاصيل الطلب",
    detailCustomer:"معلومات العميل",
    detailAddress:"عنوان التوصيل",
    detailOrderInfo:"معلومات الطلب",
    detailItems:"المنتجات",
    detailUpdateStatus:"تحديث الحالة",
    detailEmail:"البريد",
    detailPhone:"الهاتف",
    detailName:"الاسم",
    detailDate:"التاريخ",
    detailStatus:"الحالة",
    detailTotal:"الإجمالي",
    detailOpenMap:"فتح في خرائط Google",
    detailViewBtn:"عرض التفاصيل",
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
    // ── Address system ──────────────────────────────────────────────────────
    navAddresses:"My Addresses",
    addrPageTitle:"My Addresses", addrPageSub:"Manage your delivery addresses",
    addrCountry:"Country", addrCountryVal:"🇪🇬 Egypt",
    addrFullName:"Full Name", addrFullNamePh:"First and last name",
    addrPhone:"Mobile", addrPhonePh:"1xxxxxxxxx",
    addrStreet:"Street Name", addrStreetPh:"Street name",
    addrBuilding:"Building name or number", addrBuildingPh:"e.g. Nile Tower, Apt 5",
    addrCity:"City / Area", addrCityPh:"e.g. Maadi, Nasr City",
    addrDistrict:"District", addrDistrictPh:"District name",
    addrGov:"Governorate", addrGovPh:"Select governorate",
    addrLandmark:"Nearest Landmark", addrLandmarkPh:"Optional — e.g. Near the mosque",
    addrType:"Address Type",
    addrHome:"🏠 Home", addrOffice:"🏢 Office",
    addrOfficeHols:"Is the office open on holidays?",
    addrFriday:"Friday", addrSaturday:"Saturday",
    addrGPS:"📍 Use My Current Location",
    addrGPSGetting:"Getting location...",
    addrGPSDone:"✓ Location set",
    addrGPSError:"Could not access location",
    addrDefault:"Use as default address",
    addrSave:"Save Address", addrSaving:"Saving...",
    addrEdit:"Edit", addrRemove:"Remove",
    addrSetDefault:"Set as Default", addrDefaultBadge:"Default",
    addrAddNew:"+ Add New Address",
    addrConfirmDel:"Are you sure you want to delete this address?",
    addrUseThis:"Use this address",
    addrAddNewCheckout:"+ Add new address",
    addrSelectTitle:"Select Delivery Address",
    addrNoAddresses:"No saved addresses",
    addrNoAddressesSub:"Add your first address to speed up checkout",
    addrRequired:"Please fill in all required fields",
    // ── Order timeline + detail ─────────────────────────────────────────────
    timelineReceived:"Order received",
    timelinePreparing:"Preparing",
    timelineShipped:"Shipped",
    timelineDelivered:"Delivered",
    timelineCancelled:"Order cancelled",
    detailTitle:"Order details",
    detailCustomer:"Customer info",
    detailAddress:"Delivery address",
    detailOrderInfo:"Order info",
    detailItems:"Items",
    detailUpdateStatus:"Update status",
    detailEmail:"Email",
    detailPhone:"Phone",
    detailName:"Name",
    detailDate:"Date",
    detailStatus:"Status",
    detailTotal:"Total",
    detailOpenMap:"Open in Google Maps",
    detailViewBtn:"View details",
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
  const logout = () => {
    localStorage.removeItem("nawra_user");
    localStorage.removeItem("nawra_cart");
    setUser(null);
    window.dispatchEvent(new Event("nawra-logout"));
  };
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
      if (saved && saved.length) {
        // Backfill any missing translated fields (nameEn, descEn, detEn, useEn, img…)
        // from the fresh PRODS defaults, while keeping admin edits (price, stock, etc.)
        return saved.map(s => {
          const fresh = (initialProds || []).find(p => p.id === s.id);
          return fresh ? { ...fresh, ...s } : s;
        });
      }
    } catch {}
    return initialProds;
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


const C = {
  cr:"#FBF7F4", cr2:"#F3EAE2", cr3:"#EDE0D4",
  go:"#C4956A", gof:"rgba(196,149,106,.10)", gom:"rgba(196,149,106,.40)",
  dk:"#2A1F0E", dk2:"#1E1508", wa:"#7A5C42", mu:"#9C7D65", wh:"#FFFFFF",
  fa:"'Noto Naskh Arabic','Noto Serif Arabic',serif", fb:"'Cairo',sans-serif", fe:"'Cormorant Garamond',serif",
  // legacy aliases
  bl:"#F3EAE2", ro:"#C4956A"
};
const isMob = () => window.innerWidth < 768;
function useMob() {
  const [m, setM] = useState(isMob);
  useEffect(() => { const h = () => setM(isMob()); window.addEventListener("resize", h); return () => window.removeEventListener("resize", h); }, []);
  return m;
}

const PRODS = [
  {
    id:1, brand:"CERAVE",
    nameAr:"غسول الوجه المرطب",      nameEn:"Hydrating Facial Cleanser",
    descAr:"غسول لطيف بالسيراميد — لكل أنواع البشرة", descEn:"Gentle ceramide cleanser — for all skin types",
    detAr:"يحتوي على السيراميد وحمض الهيالورونيك. مناسب للاستخدام اليومي.", detEn:"Contains ceramides and hyaluronic acid. Suitable for daily use.",
    useAr:"ادلكيه على بشرة رطبة ثم اشطفيه بماء فاتر.", useEn:"Massage onto damp skin then rinse with lukewarm water.",
    price:320, badgeAr:"الأكثر مبيعاً", badgeEn:"Best Seller", stars:5,
    bg:"linear-gradient(135deg,#E8F4F8,#C8E6F0)",
    img:"https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80", icon:"🧴", stock:10
  },
  {
    id:2, brand:"THE ORDINARY",
    nameAr:"سيروم النياسيناميد",       nameEn:"Niacinamide 10% + Zinc 1%",
    descAr:"يقلل المسام ويوحد لون البشرة", descEn:"Reduces pores and evens skin tone",
    detAr:"10% نياسيناميد + 1% زنك للبشرة الدهنية.", detEn:"10% Niacinamide + 1% Zinc. Formulated for oily skin.",
    useAr:"بعد الغسول وقبل المرطب. مرتين يومياً.", useEn:"Apply after cleanser and before moisturizer. Twice daily.",
    price:280, badgeAr:"ترند TikTok", badgeEn:"TikTok Viral", stars:5,
    bg:"linear-gradient(135deg,#F0EBE3,#D4C4B0)",
    img:"https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=400&q=80", icon:"💧", stock:10
  },
  {
    id:3, brand:"LA ROCHE-POSAY",
    nameAr:"واقي الشمس SPF50+",        nameEn:"Anthelios SPF50+ Sunscreen",
    descAr:"حماية قصوى — خفيف على البشرة الحساسة", descEn:"Maximum protection — lightweight for sensitive skin",
    detAr:"حماية UVA+UVB. مناسب للبشرة الحساسة.", detEn:"UVA+UVB protection. Suitable for sensitive skin.",
    useAr:"كآخر خطوة صباحاً قبل الخروج بـ 15 دقيقة.", useEn:"Apply as the last morning step 15 minutes before sun exposure.",
    price:450, badgeAr:"جديد", badgeEn:"New", stars:4,
    bg:"linear-gradient(135deg,#FFF8E8,#F0D89A)",
    img:"https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=400&q=80", icon:"☀️", stock:10
  },
  {
    id:4, brand:"CERAVE",
    nameAr:"كريم الترطيب",             nameEn:"Moisturizing Cream",
    descAr:"ترطيب عميق 24 ساعة — للوجه والجسم", descEn:"Deep 24-hour hydration — face & body",
    detAr:"سيراميد يدوم 24 ساعة. للبشرة الجافة.", detEn:"Ceramides that last 24 hours. For dry skin.",
    useAr:"بعد الاستحمام على بشرة رطبة.", useEn:"Apply after shower on damp skin.",
    price:380, badgeAr:null, badgeEn:null, stars:5,
    bg:"linear-gradient(135deg,#EEF5F0,#C8DFC8)",
    img:"https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=400&q=80", icon:"✨", stock:10
  },
  {
    id:5, brand:"THE ORDINARY",
    nameAr:"سيروم فيتامين C",           nameEn:"Vitamin C Suspension 23%",
    descAr:"تفتيح وإشراقة — يعالج التصبغات", descEn:"Brightening & radiance — treats dark spots",
    detAr:"23% فيتامين C. يقلل البقع الداكنة.", detEn:"23% Vitamin C. Reduces dark spots and hyperpigmentation.",
    useAr:"مساءً فقط. قطرة على الوجه النظيف.", useEn:"Evening only. A few drops on clean dry skin.",
    price:260, badgeAr:null, badgeEn:null, stars:4,
    bg:"linear-gradient(135deg,#FFF4E0,#FFD98A)",
    img:"https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=400&q=80", icon:"🍋", stock:10
  },
  {
    id:6, brand:"BIODERMA",
    nameAr:"ماء مزيل المكياج",          nameEn:"Sensibio Micellar Water",
    descAr:"لطيف للبشرة الحساسة — بدون شطف", descEn:"Gentle on sensitive skin — no-rinse formula",
    detAr:"ماء ميسيلار ينظف ويزيل المكياج بلطف.", detEn:"Micellar water that gently cleanses and removes makeup.",
    useAr:"بللي قطنة وامسحي برفق.", useEn:"Soak a cotton pad and wipe gently.",
    price:340, badgeAr:"كلاسيك", badgeEn:"Classic", stars:5,
    bg:"linear-gradient(135deg,#F5E8F0,#E0B8D0)",
    img:"https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=400&q=80", icon:"🌸", stock:10
  },
  {
    id:7, brand:"NEUTROGENA",
    nameAr:"غسول وجه شفاف",            nameEn:"Oil-Free Clear Face Wash",
    descAr:"يزيل الزيادة الزيتية ويبقي البشرة نظيفة", descEn:"Removes excess oil and keeps skin clean",
    detAr:"خالٍ من الزيت للبشرة الدهنية والمختلطة.", detEn:"Oil-free formula for oily and combination skin.",
    useAr:"على بشرة مبللة وادلكي برفق ثم اشطفي.", useEn:"Lather on damp skin, massage gently, then rinse.",
    price:220, badgeAr:null, badgeEn:null, stars:4,
    bg:"linear-gradient(135deg,#E8F0F5,#B8D4E8)",
    img:"https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=400&q=80", icon:"🫧", stock:10
  },
  {
    id:8, brand:"GARNIER",
    nameAr:"كريم مرطب خفيف",           nameEn:"Moisture Bomb Day Cream",
    descAr:"ترطيب خفيف للاستخدام اليومي", descEn:"Lightweight hydration for daily use",
    detAr:"هيالورونيك. خفيف ويمتص سريعاً.", detEn:"Hyaluronic acid formula. Lightweight and fast-absorbing.",
    useAr:"على الوجه النظيف صباحاً ومساءً.", useEn:"Apply on clean face morning and evening.",
    price:190, badgeAr:"قيمة ممتازة", badgeEn:"Best Value", stars:4,
    bg:"linear-gradient(135deg,#E8F5E8,#B8DFB8)",
    img:"https://images.unsplash.com/photo-1570194065650-d99fb4d8ef6b?w=400&q=80", icon:"💚", stock:10
  },
  {
    id:9, brand:"NIVEA",
    nameAr:"كريم الليل",                nameEn:"Nourishing Night Cream",
    descAr:"يجدد البشرة أثناء النوم", descEn:"Renews and restores skin overnight",
    detAr:"زبدة القمح وفيتامين E. ترطيب عميق.", detEn:"Wheat germ oil and Vitamin E. Deep overnight nourishment.",
    useAr:"كآخر خطوة مساءً على بشرة نظيفة.", useEn:"As the last evening step on clean face.",
    price:250, badgeAr:null, badgeEn:null, stars:4,
    bg:"linear-gradient(135deg,#E8EAF5,#B8BEE0)",
    img:"https://images.unsplash.com/photo-1590439471364-192aa70c0b53?w=400&q=80", icon:"🌙", stock:10
  },
];

const GOVS = ["القاهرة","الجيزة","الإسكندرية","الشرقية","الدقهلية","البحيرة","المنوفية","الغربية","القليوبية","أسيوط","سوهاج","قنا","الأقصر","أسوان","المنيا","بني سويف","الفيوم","بورسعيد","السويس","دمياط"];

// ─── Cart ───────────────────────────────────────────────────────────────────
const Ctx = createContext(null);
const useCart = () => useContext(Ctx);
function CartProvider({ children }) {
  // Persist across refreshes
  const [cart, setCart] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nawra_cart") || "[]"); } catch { return []; }
  });
  useEffect(() => { localStorage.setItem("nawra_cart", JSON.stringify(cart)); }, [cart]);
  // Clear cart when user logs out
  useEffect(() => {
    const onLogout = () => setCart([]);
    window.addEventListener("nawra-logout", onLogout);
    return () => window.removeEventListener("nawra-logout", onLogout);
  }, []);
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
  <button onClick={onClick} style={{ cursor: "pointer", fontFamily: C.fb, border: "none", ...style }}>{children}</button>
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
        background: C.dk, color: C.cr,
        padding: "12px 24px", borderRadius: 2,
        fontSize: 13, fontFamily: C.fb, letterSpacing: "0.05em",
        zIndex: 999, transition: "transform .35s cubic-bezier(.4,0,.2,1)",
        whiteSpace: "nowrap", boxShadow: "0 4px 20px rgba(0,0,0,.25)",
        display: "flex", alignItems: "center", gap: 10
      }}>
        <span style={{color:C.go, fontSize:16}}>✓</span> {msg}
      </div>
    </ToastCtx.Provider>
  );
}

// ─── ProductCard ─────────────────────────────────────────────────────────────
function Card({ p, go }) {
  const { add } = useCart();
  const { show } = useToast();
  const { t, lang } = useLang();
  const mob = useMob();
  const [hov, setHov] = useState(false);
  const name = lang === "ar" ? (p.nameAr || p.name) : (p.nameEn || p.nameAr || p.name);
  const desc = lang === "ar" ? (p.descAr || p.desc) : (p.descEn || p.descAr || p.desc);
  const badge = lang === "ar" ? p.badgeAr : (p.badgeEn || p.badgeAr);
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        background: C.wh, overflow: "hidden",
        border: hov ? "1px solid rgba(196,149,106,.4)" : "1px solid rgba(196,149,106,.13)",
        boxShadow: hov ? "0 14px 48px rgba(196,149,106,.13)" : "none",
        transition: "all .32s",
        transform: hov && !mob ? "translateY(-4px)" : "none",
        cursor: "pointer"
      }}>
      <div onClick={() => go(`#product-${p.id}`)} style={{
        height: mob ? 220 : 268, background: p.bg, position: "relative", overflow: "hidden"
      }}>
        {/* Product image — absolute so it always fills regardless of parent display mode */}
        <img src={p.img} alt={name} style={{
          position:"absolute", inset:0, width:"100%", height:"100%",
          objectFit:"cover", display:"block"
        }} />
        {/* Badges */}
        {badge && <span style={{ position: "absolute", top: 10, right: 10, background: C.dk, color: C.cr, fontSize: 9, padding: "3px 9px", letterSpacing: "0.08em", fontFamily: C.fb, zIndex: 2 }}>{badge}</span>}
        {p.stock <= 3 && p.stock > 0 && <span style={{ position: "absolute", top: 10, left: 10, background: "#EF4444", color: "white", fontSize: 9, padding: "3px 8px", fontFamily: C.fb, zIndex: 2 }}>{t("stockLow")} {p.stock} {t("stockLowUnit")}</span>}
        {p.stock === 0 && <span style={{ position: "absolute", top: 10, left: 10, background: "#6B7280", color: "white", fontSize: 9, padding: "3px 8px", fontFamily: C.fb, zIndex: 2 }}>{t("stockOut")}</span>}
        {/* Add to cart overlay */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3,
          background: "rgba(42,31,14,.88)", padding: "10px 12px",
          transform: mob || hov ? "translateY(0)" : "translateY(100%)",
          transition: "transform .28s ease"
        }}>
          <Btn onClick={e => { e.stopPropagation(); add(p); show(t("addedToCart")); }}
            style={{ width: "100%", background: C.go, color: "#fff", padding: "8px 0", fontSize: 12, fontFamily: C.fb, letterSpacing: "0.06em", border: "none" }}>
            {t("addToCart")}
          </Btn>
        </div>
      </div>
      <div style={{ padding: "20px 22px 24px", borderTop: "1px solid rgba(196,149,106,.1)", cursor: "pointer" }} onClick={() => go(`#product-${p.id}`)}>
        <div style={{ fontFamily: C.fe, fontSize: 10.5, letterSpacing: "0.22em", color: C.go, textTransform: "uppercase", marginBottom: 5 }}>{p.brand}</div>
        <div style={{ fontFamily: lang === "ar" ? C.fa : C.fe, fontSize: mob ? 17 : 19, fontWeight: lang === "ar" ? 600 : 500, color: C.dk, marginBottom: 4, lineHeight: 1.3 }}>{name}</div>
        <div style={{ fontSize: 12.5, color: C.mu, lineHeight: 1.6, marginBottom: 13, overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", fontFamily: C.fb }}>{desc}</div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontFamily: C.fe, fontSize: mob ? 18 : 21, fontWeight: 500, color: C.dk }}>{p.price} <span style={{ fontSize: 11, color: C.mu, fontFamily: C.fb }}>{t("egp")}</span></span>
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
    <div style={{display:"flex",alignItems:"center",gap:0,border:"1px solid rgba(196,149,106,.3)",overflow:"hidden"}}>
      {["ar","en"].map(l=>(
        <button key={l} onClick={()=>setLang(l)} style={{
          padding:"5px 11px",background:lang===l?C.go:"none",color:lang===l?"#fff":C.mu,
          border:"none",cursor:"pointer",fontFamily:C.fe,fontSize:11.5,letterSpacing:"0.12em",
          fontWeight:lang===l?600:400
        }}>
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
  return (
    <>
      <nav style={{
        background: "rgba(251,247,244,.95)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(196,149,106,.14)",
        padding: mob ? "0 20px" : "0 52px",
        height: 74, display: "flex", alignItems: "center", justifyContent: "space-between",
        position: "sticky", top: 0, zIndex: 200, direction: dir
      }}>
        <div style={{ cursor: "pointer" }} onClick={() => { go("#home"); setOpen(false); }}><img src={LogoImg} alt="نوّرَة" style={{height:60, width:"auto", display:"block", mixBlendMode:"multiply"}} /></div>
        {!mob && (
          <div style={{display:"flex",alignItems:"center",gap:24}}>
            <ul style={{ display: "flex", gap: 22, listStyle: "none", margin: 0, padding: 0 }}>
              {links.map(([h, l]) => <li key={h}><span onClick={() => go(h)} style={{ cursor: "pointer", color: r === h ? C.go : C.dk, fontSize: 13.5, fontFamily: C.fb, fontWeight: 500, letterSpacing: "0.02em" }}>{l}</span></li>)}
            </ul>
            <SearchBar go={go} allProds={(navProds && navProds.length) ? navProds : PRODS} />
          </div>
        )}
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <LangToggle />
          {user ? (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              {!mob && <span style={{fontSize:12,color:C.mu,fontFamily:C.fb}}>{t("navGreeting")} {user.name} 👋</span>}
              {user.role==="admin" && <Btn onClick={()=>go("#admin")} style={{background:C.go,color:"white",padding:"5px 12px",fontSize:11,letterSpacing:"0.06em",fontFamily:C.fb,border:"none"}}>Admin</Btn>}
              {user.role==="user" && !mob && <Btn onClick={()=>go("#myorders")} style={{background:"none",border:`1.5px solid rgba(42,31,14,.4)`,color:C.dk,padding:"5px 11px",fontSize:11,fontFamily:C.fb,letterSpacing:"0.04em"}}>{t("navMyOrders")}</Btn>}
              {user.role==="user" && !mob && <Btn onClick={()=>go("#addresses")} style={{background:"none",border:`1.5px solid rgba(42,31,14,.4)`,color:C.dk,padding:"5px 11px",fontSize:11,fontFamily:C.fb,letterSpacing:"0.04em"}}>📍 {t("navAddresses")}</Btn>}
              <Btn onClick={onLogout} style={{background:"none",border:"1px solid rgba(196,149,106,.3)",color:C.mu,padding:"5px 11px",fontSize:11,fontFamily:C.fb}}>{t("navLogout")}</Btn>
            </div>
          ) : (
            <Btn onClick={()=>go("#login")} style={{background:"none",border:`1.5px solid rgba(42,31,14,.4)`,color:C.dk,padding:"6px 14px",fontSize:12,fontFamily:C.fb,letterSpacing:"0.04em"}}>{t("navLogin")}</Btn>
          )}
          <Btn onClick={openCart} style={{ background: "none", fontSize: 20, position: "relative", color: C.dk, padding: 0, border: "none" }}>
            🛍️{cnt > 0 && <span style={{ position: "absolute", top: -5, left: -5, background: C.go, color: "#fff", fontSize: 9, width: 17, height: 17, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: C.fb }}>{cnt}</span>}
          </Btn>
          {mob && <Btn onClick={() => setOpen(!open)} style={{ background: "none", fontSize: 20, color: C.dk, padding: 0, border: "none" }}>{open ? "✕" : "☰"}</Btn>}
        </div>
      </nav>
      {mob && open && (
        <div style={{ background: "rgba(251,247,244,.97)", borderBottom: "1px solid rgba(196,149,106,.14)", padding: "6px 20px 14px", direction: dir, position: "sticky", top: 74, zIndex: 199 }}>
          {user && <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(196,149,106,.1)", fontSize: 14, color: C.go, fontFamily: C.fb }}>{t("navGreeting")} {user.name} 👋</div>}
          {links.map(([h, l]) => <span key={h} onClick={() => { go(h); setOpen(false); }} style={{ display: "block", cursor: "pointer", color: r === h ? C.go : C.dk, fontSize: 15, fontFamily: C.fb, fontWeight: 500, padding: "10px 0", borderBottom: "1px solid rgba(196,149,106,.08)" }}>{l}</span>)}
          {user && user.role === "user" && <span onClick={() => { go("#myorders"); setOpen(false); }} style={{ display: "block", cursor: "pointer", color: r === "#myorders" ? C.go : C.dk, fontSize: 15, fontFamily: C.fb, fontWeight: 500, padding: "10px 0", borderBottom: "1px solid rgba(196,149,106,.08)" }}>{t("navMyOrders")} 📦</span>}
          {user && user.role === "user" && <span onClick={() => { go("#addresses"); setOpen(false); }} style={{ display: "block", cursor: "pointer", color: r === "#addresses" ? C.go : C.dk, fontSize: 15, fontFamily: C.fb, fontWeight: 500, padding: "10px 0", borderBottom: "1px solid rgba(196,149,106,.08)" }}>📍 {t("navAddresses")}</span>}
        </div>
      )}
    </>
  );
}

// ─── Cart Sidebar ─────────────────────────────────────────────────────────────
function CartSide({ open, close, go }) {
  const { cart, rem, upd, tot, ship, clr } = useCart();
  const { user } = useAuth();
  const { t, lang, dir } = useLang();
  const mob = useMob();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ n: "", p: "", city: "", addr: "" });
  const [savedAddrs, setSavedAddrs] = useState([]);
  const [selAddrId, setSelAddrId] = useState(null);
  const [showNewAddrInCart, setShowNewAddrInCart] = useState(false);
  const W = mob ? "100vw" : "390px";

  // Load user's saved addresses when entering checkout step
  useEffect(() => {
    if (step !== 1 || !user?.email) return;
    setShowNewAddrInCart(false);
    const load = async () => {
      try {
        const res = await fetch(`/api/addresses/${encodeURIComponent(user.email)}`);
        if (res.ok) {
          const data = await res.json();
          setSavedAddrs(data);
          const def = data.find(a => a.isDefault);
          if (def) setSelAddrId(def.id);
          return;
        }
      } catch {}
      const stored = JSON.parse(localStorage.getItem(`nawra_addresses_${user.email}`) || "[]");
      setSavedAddrs(stored);
      const def = stored.find(a => a.isDefault);
      if (def) setSelAddrId(def.id);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  if (step === 2) return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.6)", zIndex: 400, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ background: C.wh, padding: "36px 24px", textAlign: "center", maxWidth: 360, width: "100%", direction: dir }}>
        <div style={{ fontSize: 44, marginBottom: 12 }}>🎉</div>
        <h3 style={{ fontFamily: C.fa, fontSize: 22, fontWeight: 600, marginBottom: 10, color: C.dk }}>{t("orderSuccess")}</h3>
        <p style={{ color: C.wa, lineHeight: 1.85, marginBottom: 22, fontSize: 13.5, fontFamily: C.fb }}>{t("orderSuccessSub")}<br />{t("orderSuccessNote")}<br />{t("orderCash")}.</p>
        <Btn onClick={() => { setStep(0); close(); }} style={{ width: "100%", padding: 14, background: C.dk, color: C.cr, fontSize: 13, letterSpacing: "0.05em", fontFamily: C.fb, fontWeight: 600, border: "none" }}>{t("orderContinue")}</Btn>
      </div>
    </div>
  );

  // Core order-saving logic — accepts a resolved address object
  const placeOrder = async ({ name, phone, city, address, lat, lng }) => {
    const order = {
      id: Date.now(),
      date: new Date().toLocaleDateString("ar-EG"),
      name, phone, city, address, lat: lat||null, lng: lng||null,
      userEmail: user?.email || null,
      items: cart.map(i => ({ name: i.nameAr || i.nameEn || i.name || "", qty: i.qty, price: i.price })),
      total: tot + ship, status: "جديد"
    };
    try {
      const res = await fetch("/api/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(order) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log("[Nawra] Order saved to API:", order.id);
    } catch (e) { console.warn("[Nawra] API fallback:", e.message); }
    const prev = JSON.parse(localStorage.getItem("nawra_orders") || "[]");
    localStorage.setItem("nawra_orders", JSON.stringify([order, ...prev]));
    window.dispatchEvent(new CustomEvent("nawra-new-order", { detail: order }));
    clr(); setStep(2);
  };

  // Submit from manual form
  const submit = () => {
    if (!f.n || !f.p || !f.city || !f.addr) { alert(t("orderAlert")); return; }
    placeOrder({ name:f.n, phone:f.p, city:f.city, address:f.addr });
  };

  // Submit using a saved address card
  const submitWithAddr = (addr) => placeOrder({
    name: addr.fullName,
    phone: `+20${addr.phone}`,
    city: addr.governorate,
    address: [addr.street, addr.building, addr.district].filter(Boolean).join("، "),
    lat: addr.lat, lng: addr.lng
  });

  const fld = (k, lbl, ph) => (
    <div style={{ marginBottom: 11 }}>
      <label style={{ display: "block", fontFamily: C.fe, fontSize: 10, letterSpacing: "0.2em", color: C.mu, marginBottom: 5, textTransform: "uppercase" }}>{lbl}</label>
      <input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph}
        style={{ width: "100%", padding: "11px 14px", border: "1px solid rgba(196,149,106,.25)", background: C.wh, fontFamily: C.fb, fontSize: 13.5, outline: "none", boxSizing: "border-box", transition: "border-color .2s" }}
        onFocus={e=>e.target.style.borderColor=C.go} onBlur={e=>e.target.style.borderColor="rgba(196,149,106,.25)"} />
    </div>
  );

  return (
    <>
      <div onClick={close} style={{ display: open ? "block" : "none", position: "fixed", inset: 0, background: "rgba(0,0,0,.5)", zIndex: 300 }} />
      <div style={{ position: "fixed", top: 0, left: open ? 0 : `-${W}`, width: W, height: "100vh", background: C.cr, zIndex: 301, transition: "left .35s", display: "flex", flexDirection: "column", direction: dir, overflowX: "hidden" }}>
        <div style={{ padding: "28px 28px 18px", borderBottom: "1px solid rgba(196,149,106,.18)", display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
          <span style={{ fontFamily: C.fa, fontSize: 20, fontWeight: 600, color: C.dk }}>
            {step === 1 && user && savedAddrs.length > 0 && !showNewAddrInCart
              ? t("addrSelectTitle")
              : step === 1 && user && (showNewAddrInCart || savedAddrs.length === 0)
                ? t("addrAddNew")
                : step === 1 ? t("checkoutTitle") : t("cartTitle")}
          </span>
          <Btn onClick={() => { close(); setStep(0); }} style={{ background: "none", fontSize: 20, color: C.mu, padding: 0, border: "none" }}>✕</Btn>
        </div>
        {step === 1 ? (
          <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px" }}>
            {/* COD banner — shown in all checkout states */}
            <div style={{ background: C.cr2, padding:"9px 14px", marginBottom:14, borderInlineStart:`3px solid ${C.go}`, fontSize:12, color:C.wa, fontFamily:C.fb }}>
              <b>{t("checkoutCashLabel")}</b>
            </div>
            {/* Order summary — shown in all checkout states */}
            <div style={{ marginBottom:16, padding:"12px 14px", background:C.wh, border:"1px solid rgba(196,149,106,.13)" }}>
              {cart.map(i => (
                <div key={i.id} style={{ display:"flex", justifyContent:"space-between", fontSize:12, marginBottom:5, color:C.dk, fontFamily:C.fb }}>
                  <span>{(lang==="ar"?i.nameAr:i.nameEn)||i.nameAr||i.name} × {i.qty}</span>
                  <span style={{fontFamily:C.fe}}>{i.price*i.qty} {t("egp")}</span>
                </div>
              ))}
              <div style={{ display:"flex", justifyContent:"space-between", fontFamily:C.fe, fontSize:15, borderTop:"1px solid rgba(196,149,106,.12)", paddingTop:8, marginTop:6, color:C.dk, fontWeight:500 }}>
                <span style={{fontFamily:C.fa,fontSize:13}}>{t("cartTotal")}</span>
                <span>{tot+ship} {t("egp")}</span>
              </div>
            </div>

            {/* CASE 1 — Logged-in + has saved addresses + not adding new ─ pick one */}
            {user && savedAddrs.length > 0 && !showNewAddrInCart ? (
              <div>
                {savedAddrs.map(addr => (
                  <div key={addr.id} onClick={() => setSelAddrId(addr.id)}
                    style={{ border:`1.5px solid ${selAddrId===addr.id?C.go:"rgba(196,149,106,.18)"}`,
                      background: selAddrId===addr.id?"rgba(196,149,106,.06)":C.wh,
                      padding:"14px 16px", marginBottom:10, cursor:"pointer", transition:"all .2s" }}>
                    {addr.isDefault && <span style={{background:C.go,color:"#fff",fontSize:9,padding:"2px 9px",fontFamily:C.fb,letterSpacing:"0.05em",display:"inline-block",marginBottom:6}}>{t("addrDefaultBadge")}</span>}
                    <div style={{fontFamily:C.fa,fontSize:14,fontWeight:600,color:C.dk,marginBottom:5}}>{addr.fullName}</div>
                    <div style={{fontFamily:C.fb,fontSize:12,color:C.wa,lineHeight:1.75}}>
                      {addr.street}{addr.building?`، ${addr.building}`:""}{addr.district?`، ${addr.district}`:""}<br/>
                      {addr.city?`${addr.city}، `:""}{addr.governorate}<br/>
                      🇪🇬 +20 {addr.phone}
                    </div>
                    {selAddrId === addr.id && (
                      <Btn onClick={e => { e.stopPropagation(); submitWithAddr(addr); }}
                        style={{width:"100%",marginTop:10,background:C.dk,color:C.cr,padding:"10px 0",fontSize:12,fontFamily:C.fb,fontWeight:600,border:"none",letterSpacing:"0.04em"}}>
                        {t("addrUseThis")} ←
                      </Btn>
                    )}
                  </div>
                ))}
                <Btn onClick={() => setShowNewAddrInCart(true)}
                  style={{width:"100%",padding:11,background:"none",border:`1.5px dashed rgba(196,149,106,.4)`,color:C.go,fontFamily:C.fb,fontSize:12,marginBottom:10}}>
                  {t("addrAddNewCheckout")}
                </Btn>
                <Btn onClick={() => setStep(0)}
                  style={{width:"100%",padding:11,background:"none",border:"1.5px solid rgba(42,31,14,.25)",color:C.dk,fontSize:12,fontFamily:C.fb}}>
                  {t("checkoutBack")}
                </Btn>
              </div>
            ) : user ? (
              /* CASE 2 — Logged-in but no saved addresses OR clicked "add new"
                  ─── render the FULL AddressForm (same UI as #addresses page).
                  Saving the form both persists it (so it appears in My Addresses)
                  AND places this order in one action. */
              <div>
                <AddressForm
                  userId={user.email}
                  submitLabel={t("checkoutConfirm")}
                  onSave={(addr) => submitWithAddr(addr)}
                  onCancel={() => {
                    if (savedAddrs.length > 0) setShowNewAddrInCart(false);
                    else setStep(0);
                  }}
                />
              </div>
            ) : (
              /* CASE 3 — Guest (not logged-in) ─ simple inline form,
                  since they can't save addresses anyway */
              <div>
                {fld("n", t("checkoutName"), t("checkoutNamePh"))}
                {fld("p", t("checkoutPhone"), t("checkoutPhonePh"))}
                {fld("addr", t("checkoutAddr"), t("checkoutAddrPh"))}
                <div style={{ marginBottom: 11 }}>
                  <label style={{ display:"block", fontFamily:C.fe, fontSize:10, letterSpacing:"0.2em", color:C.mu, marginBottom:5, textTransform:"uppercase" }}>{t("checkoutGov")}</label>
                  <select value={f.city} onChange={e => setF({...f, city:e.target.value})} style={{ width:"100%", padding:"11px 14px", border:"1px solid rgba(196,149,106,.25)", background:C.wh, fontFamily:C.fb, fontSize:13.5, outline:"none" }}>
                    <option value="">{t("checkoutGovPh")}</option>{GOVS.map(g => <option key={g}>{g}</option>)}
                  </select>
                </div>
                <div style={{ display:"flex", gap:8 }}>
                  <Btn onClick={() => setStep(0)} style={{ padding:"13px 14px", background:"none", border:"1.5px solid rgba(42,31,14,.4)", color:C.dk, fontSize:12, whiteSpace:"nowrap", fontFamily:C.fb }}>{t("checkoutBack")}</Btn>
                  <Btn onClick={submit} style={{ flex:1, background:C.dk, color:C.cr, padding:13, fontSize:13, letterSpacing:"0.05em", fontFamily:C.fb, fontWeight:600, border:"none" }}>{t("checkoutConfirm")}</Btn>
                </div>
              </div>
            )}
          </div>
        ) : (
          <>
            <div style={{ flex: 1, overflowY: "auto", padding: "14px 20px" }}>
              {!cart.length ? (
                <div style={{ textAlign: "center", padding: "44px 16px", color: C.mu }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🛍️</div>
                  <p style={{ fontFamily: C.fa, fontSize: 17, fontWeight: 600, marginBottom: 18, color: C.dk }}>{t("cartEmpty")}</p>
                  <Btn onClick={() => { close(); go("#products"); }} style={{ background: C.dk, color: C.cr, padding: "13px 28px", fontSize: 13, letterSpacing: "0.06em", fontFamily: C.fb, fontWeight: 600, border: "none" }}>{t("cartShopNow")}</Btn>
                </div>
              ) : cart.map(i => (
                <div key={i.id} style={{ display: "flex", gap: 12, padding: "14px 0", borderBottom: "1px solid rgba(196,149,106,.1)", alignItems: "center" }}>
                  <div style={{ width: 68, height: 68, flexShrink: 0, overflow: "hidden", background: C.gof, borderRadius: 2 }}>
                    {i.img
                      ? <img src={i.img} alt="" style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                      : <span style={{ fontSize:26, display:"flex", alignItems:"center", justifyContent:"center", height:"100%" }}>{i.icon}</span>}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontFamily: C.fe, fontSize: 9.5, letterSpacing: "0.18em", color: C.go, textTransform: "uppercase", marginBottom: 2 }}>{i.brand || ""}</div>
                    <div style={{ fontFamily: lang==="ar"?C.fa:C.fe, fontSize: 14.5, color: C.dk, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{(lang==="ar"?i.nameAr:i.nameEn)||i.nameAr||i.name}</div>
                    <div style={{ fontFamily: C.fe, fontSize: 16, fontWeight: 500, color: C.dk, marginTop: 2 }}>{i.price * i.qty} {t("egp")}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: 7, marginTop: 6 }}>
                      <Btn onClick={() => upd(i.id, i.qty - 1)} style={{ width: 26, height: 26, border: `1px solid rgba(42,31,14,.3)`, background: "none", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: C.dk }}>−</Btn>
                      <span style={{ fontSize: 13, minWidth: 16, textAlign: "center", fontFamily: C.fe }}>{i.qty}</span>
                      <Btn onClick={() => upd(i.id, i.qty + 1)} style={{ width: 26, height: 26, border: `1px solid rgba(42,31,14,.3)`, background: "none", fontSize: 14, display: "flex", alignItems: "center", justifyContent: "center", padding: 0, color: C.dk }}>+</Btn>
                    </div>
                  </div>
                  <Btn onClick={() => rem(i.id)} style={{ background: "none", color: C.mu, fontSize: 16, padding: 0, flexShrink: 0, border: "none" }}>✕</Btn>
                </div>
              ))}
            </div>
            {cart.length > 0 && (
              <div style={{ padding: "14px 20px 20px", borderTop: "1px solid rgba(196,149,106,.18)", flexShrink: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontFamily: C.fb, fontSize: 11, color: C.mu, letterSpacing: "0.04em" }}>{t("cartTotal")}</span>
                  <span style={{ fontFamily: C.fe, fontSize: 20, fontWeight: 500, color: C.dk }}>{tot} {t("egp")}</span>
                </div>
                {ship > 0 && <div style={{ fontSize: 11, color: C.mu, marginBottom: 6, fontFamily: C.fb }}>+ {ship} {t("egp")} | {500 - tot} {t("cartShipAdd")}</div>}
                {ship === 0 && <div style={{ fontSize: 11, color: "#2E6B3E", marginBottom: 6, fontFamily: C.fb }}>{t("cartShipFree")}</div>}
                <div style={{ background: C.cr2, padding: "9px 13px", fontSize: 11, color: C.wa, marginBottom: 12, fontFamily: C.fb }}>{t("cartCashOnly")}</div>
                <Btn onClick={() => { if (!user) { close(); go("#login"); } else setStep(1); }}
                  style={{ width: "100%", background: C.dk, color: C.cr, padding: 16, fontSize: 13, letterSpacing: "0.05em", marginBottom: 8, fontFamily: C.fb, fontWeight: 600, border: "none" }}>{t("cartCheckout")}</Btn>
                <Btn onClick={close} style={{ width: "100%", background: "transparent", color: C.mu, border: "1.5px solid rgba(42,31,14,.2)", padding: 12, fontSize: 12, fontFamily: C.fb }}>{t("cartContinue")}</Btn>
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
      <label style={{display:"block",fontFamily:C.fe,fontSize:10,letterSpacing:"0.2em",color:C.mu,marginBottom:5,textTransform:"uppercase"}}>{lbl}</label>
      <input type={type} value={f[k]} onChange={e=>setF({...f,[k]:e.target.value})}
        onKeyDown={e=>e.key==="Enter"&&submit()}
        onFocus={e=>e.target.style.borderColor=C.go} onBlur={e=>e.target.style.borderColor="rgba(196,149,106,.25)"}
        placeholder={ph} style={{width:"100%",padding:"11px 14px",border:"1px solid rgba(196,149,106,.25)",background:C.wh,fontFamily:C.fb,fontSize:13.5,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}/>
    </div>
  );

  return (
    <div style={{direction:dir,minHeight:"80vh",display:"flex",alignItems:"center",justifyContent:"center",background:`linear-gradient(135deg,${C.cr2},${C.cr})`}}>
      <div style={{background:C.wh,padding:mob?"28px 24px":"44px 40px",width:mob?"92%":undefined,maxWidth:420,boxShadow:"0 8px 48px rgba(42,31,14,.08)"}}>
        <div style={{textAlign:"center",marginBottom:28}}>
          <img src={LogoImg} alt="نوّرَة" style={{height:80,display:"block",margin:"0 auto 14px",mixBlendMode:"multiply"}}/>
        </div>
        <div style={{display:"flex",borderBottom:"1px solid rgba(196,149,106,.18)",marginBottom:24}}>
          {[["login",t("loginTab")],["register",t("registerTab")]].map(([k,l])=>(
            <button key={k} onClick={()=>{setTab(k);setErr("");}} style={{flex:1,padding:"11px 0",background:"none",border:"none",borderBottom:tab===k?`2px solid ${C.dk}`:"2px solid transparent",cursor:"pointer",fontFamily:C.fb,fontSize:13.5,color:tab===k?C.dk:C.mu,fontWeight:tab===k?500:400,transition:"color .2s"}}>{l}</button>
          ))}
        </div>
        {tab==="register" && inp("name",t("loginFullName"),t("loginFullNamePh"))}
        {inp("email",t("loginEmail"),t("loginEmailPh"),"email")}
        {inp("pass",t("loginPass"),t("loginPassPh"),"password")}
        {tab==="register" && inp("pass2",t("loginConfirmPass"),t("loginPassPh"),"password")}
        {err && <div style={{background:"#FEF2F2",color:"#DC2626",padding:"10px 14px",marginBottom:14,fontSize:12.5,fontFamily:C.fb,borderInlineStart:"3px solid #DC2626"}}>{err}</div>}
        <button onClick={submit} disabled={loading}
          style={{width:"100%",background:loading?C.mu:C.dk,color:C.cr,border:"1.5px solid "+(loading?C.mu:C.dk),padding:14,cursor:loading?"not-allowed":"pointer",fontFamily:C.fb,fontSize:13,fontWeight:600,letterSpacing:"0.06em",transition:"background .2s"}}>
          {loading?t("loginLoading"):tab==="login"?t("loginBtn"):t("registerBtn")}
        </button>
      </div>
    </div>
  );
}

// ─── Admin Dashboard ──────────────────────────────────────────────────────────
// Inline SVG icon helper (mirrors Tabler Icons line style)
function AdmIcon({ name, size = 16 }) {
  const paths = {
    "chart-bar":     <><path d="M3 12h3v9H3z"/><path d="M9 3h3v18H9z"/><path d="M15 8h3v13h-3z"/></>,
    "shopping-cart": <><circle cx="9" cy="20" r="1.5"/><circle cx="17" cy="20" r="1.5"/><path d="M3 3h2l2.5 12h11l2-8H6"/></>,
    "box":           <><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/><path d="M12 13v8"/></>,
    "users":         <><circle cx="9" cy="8" r="3.5"/><path d="M3 21v-1a6 6 0 0 1 12 0v1"/><path d="M16 11a3 3 0 0 0 0-6"/><path d="M21 21v-1a5 5 0 0 0-4-4.9"/></>,
    "truck":         <><path d="M3 6h11v9H3z"/><path d="M14 9h4l3 3v3h-7z"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/></>,
    "discount":      <><path d="M4 12l8-8h6v6l-8 8z"/><circle cx="15" cy="9" r="1.3"/><path d="M9 15l-3 3"/></>,
    "settings":      <><circle cx="12" cy="12" r="3"/><path d="M19 12a7 7 0 0 0-.13-1.35l2-1.55-2-3.46-2.36.95a7 7 0 0 0-2.34-1.36L13.8 3h-3.6l-.37 2.23a7 7 0 0 0-2.34 1.36l-2.36-.95-2 3.46 2 1.55A7 7 0 0 0 5 12c0 .46.04.92.13 1.35l-2 1.55 2 3.46 2.36-.95a7 7 0 0 0 2.34 1.36L10.2 21h3.6l.37-2.23a7 7 0 0 0 2.34-1.36l2.36.95 2-3.46-2-1.55c.09-.43.13-.89.13-1.35z"/></>,
    "arrow-up":      <><path d="M12 19V5"/><path d="M5 12l7-7 7 7"/></>,
    "arrow-down":    <><path d="M12 5v14"/><path d="M5 12l7 7 7-7"/></>,
    "droplet":       <><path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11z"/></>,
    "sun":           <><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></>,
    "package":       <><path d="M21 8l-9-5-9 5 9 5 9-5z"/><path d="M3 8v8l9 5 9-5V8"/></>,
    "refresh":       <><path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/></>,
    "logout":        <><path d="M14 8V6a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7a2 2 0 0 0 2-2v-2"/><path d="M9 12h12"/><path d="M17 8l4 4-4 4"/></>,
    "plus":          <><path d="M12 5v14"/><path d="M5 12h14"/></>
  };
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" style={{flexShrink:0,verticalAlign:"middle"}}>
      {paths[name] || null}
    </svg>
  );
}

function AdminDash({ go }) {
  const { prods, addProd, delProd, editProd } = useProds();
  const { t } = useLang();
  const mob = useMob();
  const [tab, setTab] = useState("overview");
  const [showAdd, setShowAdd] = useState(false);
  const [editId, setEditId] = useState(null);
  const [newP, setNewP] = useState({ name:"", brand:"", desc:"", price:"", stock:"10", icon:"✨", badge:"", bg:"linear-gradient(135deg,#F5EBE8,#E8D5C4)" });
  const [delConfirm, setDelConfirm] = useState(null);
  const [orderList, setOrderList] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("nawra_orders") || "[]");
    } catch { return []; }
  });
  const [statusEdit, setStatusEdit] = useState({});

  // Refresh helper — tries API first, falls back to localStorage
  const refreshOrders = async () => {
    try {
      const res = await fetch("/api/orders");
      if (res.ok) { setOrderList(await res.json()); return; }
    } catch {}
    try { setOrderList(JSON.parse(localStorage.getItem("nawra_orders") || "[]")); } catch {}
  };

  useEffect(() => {
    refreshOrders();
    // Same-tab: customer places order in cart sidebar
    window.addEventListener("nawra-new-order", refreshOrders);
    // Cross-tab: customer in another browser tab saves order to localStorage
    const onStorage = (e) => { if (e.key === "nawra_orders") refreshOrders(); };
    window.addEventListener("storage", onStorage);
    const interval = setInterval(refreshOrders, 10000); // every 10 s
    return () => {
      window.removeEventListener("nawra-new-order", refreshOrders);
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Also refresh immediately whenever the orders or overview tab is opened
  useEffect(() => {
    if (tab === "orders" || tab === "overview") refreshOrders();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

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
      <label style={{display:"block",fontFamily:C.fe,fontSize:10,letterSpacing:"0.18em",color:C.mu,marginBottom:5,textTransform:"uppercase"}}>{lbl}</label>
      <input type={type} value={newP[k]} onChange={e=>setNewP({...newP,[k]:e.target.value})} placeholder={ph}
        style={{width:"100%",padding:"11px 14px",border:"1px solid rgba(196,149,106,.25)",background:C.wh,fontFamily:C.fb,fontSize:13.5,outline:"none",boxSizing:"border-box",transition:"border-color .2s"}}
        onFocus={e=>e.target.style.borderColor=C.go} onBlur={e=>e.target.style.borderColor="rgba(196,149,106,.25)"}/>
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

  const updateOrderStatus = async (id, status) => {
    // Optimistic local update
    setOrderList(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    setStatusEdit({});
    // Persist to API
    try {
      await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
    } catch {}
    // ALWAYS mirror to localStorage — fires the "storage" event in any other
    // open tab/window, which both this admin's other tabs AND the customer's
    // MyOrders page listen for. Real-time cross-tab status updates.
    try {
      const orders = JSON.parse(localStorage.getItem("nawra_orders") || "[]");
      localStorage.setItem("nawra_orders",
        JSON.stringify(orders.map(o => o.id === id ? { ...o, status } : o)));
    } catch {}
  };

  const statCard = (label, value, color="#2A1F0E") => (
    <div style={{background:C.wh,padding:mob?"16px":"20px",boxShadow:"0 2px 12px rgba(196,149,106,.1)"}}>
      <div style={{fontFamily:C.fe,fontSize:10,letterSpacing:"0.2em",color:C.mu,marginBottom:6,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontFamily:C.fe,fontSize:mob?22:28,color,fontWeight:500}}>{value}</div>
    </div>
  );

  // Detail modal state — opened by clicking any order card
  const [detailOrderId, setDetailOrderId] = useState(null);
  const detailOrder = detailOrderId ? orderList.find(o => o.id === detailOrderId) : null;

  // Customers — fetched from /api/users (single source of truth: SQLite)
  const [allUsers, setAllUsers] = useState([]);
  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users");
      if (res.ok) { setAllUsers(await res.json()); return; }
    } catch {}
    // Fallback: old localStorage user list, so the page still works offline
    try {
      const local = JSON.parse(localStorage.getItem("nawra_users") || "[]");
      setAllUsers(local.map(u => ({
        email: u.email, name: u.name, phone: u.phone || null,
        firstOrder: u.registeredAt || null, lastOrder: u.registeredAt || null,
        totalOrders: 0, totalSpent: 0
      })));
    } catch {}
  };
  useEffect(() => { loadUsers(); }, [orderList.length]); // eslint-disable-line

  // ── Computed analytics (all from REAL API/order data) ───────────────────────
  // Parse order date — supports both ISO strings and the "d/m/yyyy" Arabic-style
  // strings produced by the cart sidebar. Falls back to created_at if needed.
  const parseOrderDate = (o) => {
    const raw = o.created_at || o.date;
    if (!raw) return null;
    const d = new Date(raw);
    if (!isNaN(d)) return d;
    // try "DD/MM/YYYY" or "D/M/YYYY"
    const m = String(raw).match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/);
    if (m) {
      const yr = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      return new Date(yr, Number(m[2]) - 1, Number(m[1]));
    }
    return null;
  };

  const now = new Date();
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
  const today0 = startOfDay(now);

  // 7-day series: index 0 = 6 days ago, index 6 = today
  const dayLabels = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
  const last7 = Array.from({length:7}, (_,i) => {
    const d = new Date(today0); d.setDate(d.getDate() - (6-i));
    return { date: d, total: 0, label: dayLabels[d.getDay()] };
  });
  orderList.forEach(o => {
    const d = parseOrderDate(o); if (!d) return;
    const day0 = startOfDay(d);
    const diff = Math.round((today0 - day0) / 86400000);
    if (diff >= 0 && diff <= 6) last7[6-diff].total += Number(o.total)||0;
  });
  const maxDay = Math.max(1, ...last7.map(d=>d.total));

  // Month-over-month sales % change
  const thisMonth = now.getMonth(), thisYear = now.getFullYear();
  const lastMonth = thisMonth === 0 ? 11 : thisMonth - 1;
  const lastMonthYear = thisMonth === 0 ? thisYear - 1 : thisYear;
  let salesThisMonth = 0, salesLastMonth = 0;
  orderList.forEach(o => {
    const d = parseOrderDate(o); if (!d) return;
    if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) salesThisMonth += Number(o.total)||0;
    else if (d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth) salesLastMonth += Number(o.total)||0;
  });
  const salesChangePct = salesLastMonth ? Math.round(((salesThisMonth - salesLastMonth)/salesLastMonth)*100) : (salesThisMonth ? 100 : 0);

  // Orders this month / last month
  let ordersThisMonth = 0, ordersLastMonth = 0;
  orderList.forEach(o => {
    const d = parseOrderDate(o); if (!d) return;
    if (d.getFullYear() === thisYear && d.getMonth() === thisMonth) ordersThisMonth++;
    else if (d.getFullYear() === lastMonthYear && d.getMonth() === lastMonth) ordersLastMonth++;
  });
  const ordersChangePct = ordersLastMonth ? Math.round(((ordersThisMonth - ordersLastMonth)/ordersLastMonth)*100) : (ordersThisMonth ? 100 : 0);

  // New customers this month (firstOrder within current month)
  const newCustomersThisMonth = allUsers.filter(u => {
    if (!u.firstOrder) return false;
    const d = new Date(u.firstOrder);
    return !isNaN(d) && d.getFullYear() === thisYear && d.getMonth() === thisMonth;
  }).length;

  // Avg order — % change vs last month
  const avgThis = ordersThisMonth ? salesThisMonth/ordersThisMonth : 0;
  const avgLast = ordersLastMonth ? salesLastMonth/ordersLastMonth : 0;
  const avgChangePct = avgLast ? Math.round(((avgThis - avgLast)/avgLast)*100) : 0;

  // Top selling products — aggregated from every order's items
  const productAgg = new Map();
  orderList.forEach(o => (o.items||[]).forEach(it => {
    const key = it.name || it.nameAr || "—";
    const prev = productAgg.get(key) || { name: key, qty: 0, rev: 0, icon: it.icon || null, brand: it.brand || "" };
    prev.qty += Number(it.qty) || 0;
    prev.rev += (Number(it.price) || 0) * (Number(it.qty) || 0);
    productAgg.set(key, prev);
  }));
  const topProducts = Array.from(productAgg.values()).sort((a,b)=>b.qty-a.qty).slice(0,5);
  // Fallback: if no orders yet, show products from catalogue (qty=0) so the card is never empty
  const topProductsForRender = topProducts.length ? topProducts
    : prods.slice(0,3).map(p => ({ name: p.nameAr || p.name, qty:0, rev:0, icon: p.icon, brand: p.brand }));

  // Localized current-month label (e.g. "مايو 2026")
  const monthLabel = new Intl.DateTimeFormat("ar-EG", { month:"long", year:"numeric" }).format(now);

  // Status → badge style
  const badgeStyle = (status) => {
    if (status === "مكتمل")  return { bg:"#DCFCE7", fg:"#15803D" };
    if (status === "ملغي")   return { bg:"#FEE2E2", fg:"#B91C1C" };
    if (status === "شحن" || status === "قيد الشحن" || status === "تم الشحن") return { bg:"#FEF3C7", fg:"#92400E" };
    return { bg:"#DBEAFE", fg:"#1D4ED8" }; // "جديد" / default
  };

  // ── Nav items for sidebar ──────────────────────────────────────────────────
  const navItems = [
    { k:"overview",  l:"نظرة عامة", icon:"chart-bar" },
    { k:"orders",    l:"الطلبات",   icon:"shopping-cart" },
    { k:"products",  l:"المنتجات",  icon:"box" },
    { k:"customers", l:"العملاء",   icon:"users" },
    { k:"shipping",  l:"الشحن",     icon:"truck" },
    { k:"coupons",   l:"الكوبونات", icon:"discount" },
    { k:"settings",  l:"الإعدادات", icon:"settings" },
  ];

  const topbarTitle = navItems.find(n=>n.k===tab)?.l || "نظرة عامة";

  // ── Reusable style tokens ──────────────────────────────────────────────────
  const ui = {
    border:    "0.5px solid #E5E5E5",
    cardBg:    "#FFFFFF",
    pageBg:    "#F5F5F5",
    sideBg:    "#FAFAFA",
    text:      "#1A1A1A",
    textSub:   "#737373",
    radius:    8,
    fontHead:  C.fa,
    fontBody:  C.fb,
  };

  // ── Sidebar nav button ─────────────────────────────────────────────────────
  const NavBtn = ({ item }) => {
    const active = tab === item.k;
    return (
      <button onClick={()=>setTab(item.k)}
        style={{
          display:"flex", alignItems:"center", gap:10, width:"100%",
          padding:"10px 16px",
          fontSize:13, fontFamily:ui.fontBody, fontWeight: active?500:400,
          color: active ? ui.text : ui.textSub,
          background: active ? ui.cardBg : "transparent",
          border:"none",
          borderRight: active ? `2px solid ${ui.text}` : "2px solid transparent",
          cursor:"pointer", textAlign:"right",
          transition:"all .15s"
        }}>
        <AdmIcon name={item.icon} size={17} />
        <span>{item.l}</span>
      </button>
    );
  };

  // ── Metric card ────────────────────────────────────────────────────────────
  const Metric = ({ label, value, changePct, suffix, hint }) => {
    const up = changePct > 0, down = changePct < 0;
    const showChange = changePct !== undefined && changePct !== null;
    return (
      <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
        <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>{label}</div>
        <div style={{fontSize:mob?20:24,color:ui.text,fontFamily:ui.fontHead,fontWeight:500,lineHeight:1.1}}>
          {value}{suffix && <span style={{fontSize:13,color:ui.textSub,marginInlineStart:5,fontFamily:ui.fontBody}}>{suffix}</span>}
        </div>
        {showChange ? (
          <div style={{display:"flex",alignItems:"center",gap:4,marginTop:5,fontSize:11,fontFamily:ui.fontBody,
            color: up?"#16A34A":down?"#DC2626":ui.textSub}}>
            <AdmIcon name={up?"arrow-up":"arrow-down"} size={12} />
            <span>{Math.abs(changePct)}% {hint || "هذا الشهر"}</span>
          </div>
        ) : hint ? (
          <div style={{fontSize:11,color:"#16A34A",marginTop:5,fontFamily:ui.fontBody}}>{hint}</div>
        ) : null}
      </div>
    );
  };

  // ── Overview tab content ───────────────────────────────────────────────────
  const Overview = () => (
    <div>
      {/* 4 Metric cards */}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <Metric label="إجمالي المبيعات" value={salesThisMonth.toLocaleString()} suffix="ج" changePct={salesChangePct} />
        <Metric label="عدد الطلبات"     value={ordersThisMonth} changePct={ordersChangePct} />
        <Metric label="العملاء"          value={allUsers.length} hint={newCustomersThisMonth ? `${newCustomersThisMonth} جدد` : "—"} />
        <Metric label="متوسط قيمة الطلب" value={Math.round(avgThis).toLocaleString()} suffix="ج" changePct={avgChangePct} hint="عن الشهر السابق" />
      </div>

      {/* Row: bar chart + latest orders */}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,marginBottom:10}}>
        {/* Bar chart */}
        <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
          <h3 style={{fontSize:13,fontWeight:500,color:ui.text,marginBottom:14,fontFamily:ui.fontBody}}>المبيعات — آخر 7 أيام</h3>
          <div style={{display:"flex",alignItems:"flex-end",gap:6,height:110,paddingTop:8,direction:"ltr"}}>
            {last7.map((d,i)=>{
              const h = Math.max(4, Math.round((d.total / maxDay) * 90));
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,position:"relative"}}>
                  <div title={`${d.total.toLocaleString()} ج`}
                    style={{width:"100%",height:`${h}%`,background:"#3B82F6",borderRadius:"3px 3px 0 0",transition:"height .3s"}} />
                  <span style={{fontSize:10,color:ui.textSub,fontFamily:ui.fontBody}}>{d.label.slice(0,3)}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Latest orders */}
        <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
          <h3 style={{fontSize:13,fontWeight:500,color:ui.text,marginBottom:10,fontFamily:ui.fontBody}}>أحدث الطلبات</h3>
          {orderList.length===0 ? (
            <p style={{color:ui.textSub,fontFamily:ui.fontBody,fontSize:12,textAlign:"center",padding:"20px 0"}}>مفيش طلبات لحد دلوقتي</p>
          ) : orderList.slice(0,5).map(o=>{
            const b = badgeStyle(o.status);
            return (
              <div key={o.id} onClick={()=>setDetailOrderId(o.id)}
                style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",
                  borderBottom:`0.5px solid ${ui.border.replace("0.5px solid ","")}`,fontSize:12,cursor:"pointer"}}>
                <span style={{color:ui.text,fontFamily:ui.fontBody,flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{o.name}</span>
                <span style={{fontSize:10,padding:"2px 9px",borderRadius:20,background:b.bg,color:b.fg,fontFamily:ui.fontBody,margin:"0 8px"}}>{o.status}</span>
                <span style={{fontWeight:500,color:ui.text,fontFamily:ui.fontBody}}>{(o.total||0).toLocaleString()} ج</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top selling products */}
      <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
        <h3 style={{fontSize:13,fontWeight:500,color:ui.text,marginBottom:10,fontFamily:ui.fontBody}}>أكثر المنتجات مبيعاً</h3>
        {topProductsForRender.length === 0 ? (
          <p style={{color:ui.textSub,fontFamily:ui.fontBody,fontSize:12,textAlign:"center",padding:"20px 0"}}>لا توجد بيانات بعد</p>
        ) : topProductsForRender.map((p,i)=>(
          <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 0",
            borderBottom: i < topProductsForRender.length-1 ? `0.5px solid #E5E5E5` : "none"}}>
            <div style={{width:36,height:36,borderRadius:6,background:ui.sideBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>
              {p.icon || <AdmIcon name="droplet" size={18} />}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <div style={{fontSize:13,fontWeight:500,color:ui.text,fontFamily:ui.fontBody,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
              <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>{p.qty} مبيعة</div>
            </div>
            <div style={{fontSize:13,fontWeight:500,color:ui.text,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>{p.rev.toLocaleString()} ج</div>
          </div>
        ))}
      </div>
    </div>
  );

  // ── Placeholder tab for future features ────────────────────────────────────
  const Placeholder = ({ icon, title, body }) => (
    <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:mob?"30px 20px":"60px 40px",textAlign:"center"}}>
      <div style={{marginBottom:14,color:ui.textSub,display:"flex",justifyContent:"center"}}><AdmIcon name={icon} size={42} /></div>
      <h3 style={{fontFamily:ui.fontHead,fontSize:18,fontWeight:500,color:ui.text,marginBottom:8}}>{title}</h3>
      <p style={{fontFamily:ui.fontBody,fontSize:13,color:ui.textSub,maxWidth:380,margin:"0 auto",lineHeight:1.7}}>{body}</p>
    </div>
  );

  return (
    <div style={{direction:"rtl",minHeight:"100vh",background:ui.pageBg,fontFamily:ui.fontBody}}>
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"200px 1fr",minHeight:"100vh"}}>

        {/* SIDEBAR */}
        <aside style={{background:ui.sideBg,borderInlineEnd:ui.border,padding:"16px 0",display:"flex",flexDirection:"column"}}>
          <div style={{padding:"0 16px 14px",borderBottom:ui.border,marginBottom:10}}>
            <div style={{fontFamily:ui.fontHead,fontSize:16,fontWeight:600,color:ui.text}}>نوّرَة</div>
            <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>لوحة التحكم</div>
          </div>
          {mob ? (
            // On mobile: scroll-x bar of nav buttons
            <div style={{display:"flex",overflowX:"auto",gap:4,padding:"0 10px"}}>
              {navItems.map(n => (
                <button key={n.k} onClick={()=>setTab(n.k)} style={{
                  flexShrink:0, display:"flex", alignItems:"center", gap:6, padding:"7px 12px",
                  fontSize:12, fontFamily:ui.fontBody, fontWeight: tab===n.k?500:400,
                  color: tab===n.k?ui.text:ui.textSub,
                  background: tab===n.k?ui.cardBg:"transparent",
                  border:`0.5px solid ${tab===n.k?"#D4D4D4":"transparent"}`,
                  borderRadius:20, cursor:"pointer", whiteSpace:"nowrap"
                }}><AdmIcon name={n.icon} size={14}/>{n.l}</button>
              ))}
            </div>
          ) : navItems.map(n => <NavBtn key={n.k} item={n} />)}
          <div style={{flex:1}} />
          <button onClick={()=>go("#home")} style={{
            display:"flex",alignItems:"center",gap:8,padding:"10px 16px",
            fontSize:12,fontFamily:ui.fontBody,color:ui.textSub,
            background:"transparent",border:"none",cursor:"pointer",textAlign:"right",
            borderTop:ui.border,marginTop:6
          }}>
            <AdmIcon name="logout" size={15}/>
            <span>الرجوع للموقع</span>
          </button>
        </aside>

        {/* MAIN */}
        <main style={{padding:mob?"14px":"20px 24px",overflow:"auto"}}>
          {/* Topbar */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <h2 style={{fontSize:17,fontWeight:500,color:ui.text,fontFamily:ui.fontHead,margin:0}}>{topbarTitle}</h2>
            <span style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>{monthLabel}</span>
          </div>

          {tab === "overview" && <Overview />}

          {/* ORDERS */}
          {tab === "orders" && (
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:13,color:ui.textSub,fontFamily:ui.fontBody}}>الإجمالي: {orderList.length} طلب</span>
                <button onClick={refreshOrders}
                  style={{display:"flex",alignItems:"center",gap:5,background:ui.cardBg,color:ui.text,
                    border:ui.border,padding:"6px 12px",cursor:"pointer",fontFamily:ui.fontBody,
                    fontSize:12,borderRadius:6}}>
                  <AdmIcon name="refresh" size={13}/> تحديث
                </button>
              </div>
              {orderList.length===0 ? (
                <Placeholder icon="shopping-cart" title="مفيش طلبات لحد دلوقتي" body="هتبان الطلبات هنا أول ما عميل يكمّل عملية الشراء." />
              ) : (
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden"}}>
                  {orderList.map((o,i)=>{
                    const b = badgeStyle(o.status);
                    return (
                      <div key={o.id} onClick={()=>setDetailOrderId(o.id)}
                        style={{display:"grid",gridTemplateColumns:mob?"1fr":"1.5fr 1fr 1fr auto auto",
                          gap:10,alignItems:"center",padding:"12px 16px",
                          borderTop: i>0 ? `0.5px solid #EEE` : "none",cursor:"pointer",
                          transition:"background .15s"}}
                        onMouseEnter={e=>e.currentTarget.style.background="#FAFAFA"}
                        onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                        <div>
                          <div style={{fontSize:13.5,color:ui.text,fontFamily:ui.fontBody,fontWeight:500}}>{o.name}</div>
                          <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>{o.phone} · {o.city}</div>
                        </div>
                        {!mob && <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>{o.date}</div>}
                        {!mob && <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>{(o.items||[]).length} منتجات</div>}
                        <span style={{fontSize:10,padding:"3px 10px",borderRadius:20,background:b.bg,color:b.fg,fontFamily:ui.fontBody,justifySelf:"start"}}>{o.status}</span>
                        <div style={{fontSize:13.5,fontWeight:500,color:ui.text,fontFamily:ui.fontBody,textAlign:"left"}}>{(o.total||0).toLocaleString()} ج</div>
                      </div>
                    );
                  })}
                </div>
              )}
              <OrderDetailModal
                order={detailOrder}
                onClose={()=>setDetailOrderId(null)}
                onStatusChange={(id, status)=>updateOrderStatus(id, status)}
              />
            </div>
          )}

          {/* PRODUCTS */}
          {tab === "products" && (
            <div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <span style={{fontSize:13,color:ui.textSub,fontFamily:ui.fontBody}}>الإجمالي: {prods.length} منتج</span>
                <button onClick={()=>{setShowAdd(!showAdd);setEditId(null);setNewP({name:"",brand:"",desc:"",price:"",icon:"✨",badge:"",bg:COLORS[0]});}}
                  style={{display:"flex",alignItems:"center",gap:5,background:ui.text,color:"#fff",
                    border:"none",padding:"7px 14px",cursor:"pointer",fontFamily:ui.fontBody,fontSize:12,borderRadius:6}}>
                  <AdmIcon name="plus" size={13}/> {showAdd?"إلغاء":"إضافة منتج"}
                </button>
              </div>

              {showAdd && (
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:mob?"14px":"18px",marginBottom:12}}>
                  <h4 style={{fontFamily:ui.fontHead,fontSize:15,fontWeight:500,color:ui.text,marginBottom:14}}>{editId?"تعديل المنتج":"إضافة منتج جديد"}</h4>
                  <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:mob?0:16}}>
                    <div>{pInp("name","اسم المنتج","مثال: سيروم النياسيناميد")}{pInp("brand","البراند","مثال: THE ORDINARY")}{pInp("price","السعر (جنيه)","280","number")}{pInp("stock","الكمية في المخزون","10","number")}</div>
                    <div>{pInp("desc","الوصف","وصف مختصر للمنتج")}{pInp("badge","Badge (اختياري)","مثال: جديد")}
                      <div style={{marginBottom:11}}>
                        <label style={{display:"block",fontSize:10,letterSpacing:2,color:ui.textSub,marginBottom:5,fontFamily:ui.fontBody}}>الأيقونة</label>
                        <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                          {ICONS.map(ic=><button key={ic} onClick={()=>setNewP({...newP,icon:ic})} style={{fontSize:18,background:newP.icon===ic?"#F3F4F6":"none",border:newP.icon===ic?`1px solid ${ui.text}`:"1px solid #E5E5E5",width:34,height:34,cursor:"pointer",borderRadius:4}}>{ic}</button>)}
                        </div>
                      </div>
                      <div>
                        <label style={{display:"block",fontSize:10,letterSpacing:2,color:ui.textSub,marginBottom:5,fontFamily:ui.fontBody}}>لون الخلفية</label>
                        <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                          {COLORS.map(c=><div key={c} onClick={()=>setNewP({...newP,bg:c})} style={{width:26,height:26,background:c,cursor:"pointer",border:newP.bg===c?`2px solid ${ui.text}`:"2px solid transparent",borderRadius:3}}/>)}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div style={{marginTop:14,padding:14,background:newP.bg,display:"flex",alignItems:"center",gap:14,borderRadius:6}}>
                    <span style={{fontSize:32}}>{newP.icon}</span>
                    <div>
                      <div style={{fontSize:10,color:"#5C4A2A",letterSpacing:2,fontFamily:ui.fontBody}}>{newP.brand}</div>
                      <div style={{fontFamily:ui.fontHead,fontSize:14,color:ui.text}}>{newP.name||"اسم المنتج"}</div>
                      <div style={{fontFamily:ui.fontHead,fontSize:16,color:ui.text,marginTop:4}}>{newP.price||"0"} جنيه</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:10,marginTop:14}}>
                    <button onClick={saveProduct} style={{flex:1,background:ui.text,color:"#fff",border:"none",padding:11,cursor:"pointer",fontFamily:ui.fontBody,fontSize:12.5,borderRadius:6}}>
                      {editId?"حفظ التعديلات":"إضافة المنتج"}
                    </button>
                    <button onClick={()=>{setShowAdd(false);setEditId(null);}} style={{padding:"11px 16px",background:"none",border:ui.border,cursor:"pointer",color:ui.textSub,fontFamily:ui.fontBody,fontSize:12,borderRadius:6}}>إلغاء</button>
                  </div>
                </div>
              )}

              <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10}}>
                {prods.map(p=>(
                  <div key={p.id} style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,display:"flex",gap:12,padding:12,alignItems:"center"}}>
                    <div style={{width:52,height:52,flexShrink:0,borderRadius:6,overflow:"hidden",background:p.bg}}>
                      {p.img
                        ? <img src={p.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                        : <span style={{fontSize:22,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.icon}</span>}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:9,color:C.go,letterSpacing:2,fontFamily:ui.fontBody}}>{p.brand}</div>
                      <div style={{fontFamily:ui.fontHead,fontSize:13.5,color:ui.text,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nameAr || p.name}</div>
                      <div style={{fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,marginTop:2}}>{p.price} جنيه</div>
                      <div style={{fontSize:10.5,fontFamily:ui.fontBody,marginTop:2,color:p.stock===0?"#DC2626":p.stock<=3?"#D97706":"#16A34A"}}>
                        {p.stock===0?"نفد المخزون":p.stock<=3?`آخر ${p.stock} قطع`:`${p.stock} قطعة`}
                      </div>
                    </div>
                    <div style={{display:"flex",gap:6,flexShrink:0}}>
                      <button onClick={()=>startEdit(p)} style={{background:"#F3F4F6",border:"none",padding:"5px 10px",cursor:"pointer",fontSize:11.5,fontFamily:ui.fontBody,color:ui.text,borderRadius:4}}>تعديل</button>
                      {delConfirm===p.id ? (
                        <div style={{display:"flex",gap:4}}>
                          <button onClick={()=>{delProd(p.id);setDelConfirm(null);}} style={{background:"#DC2626",color:"white",border:"none",padding:"5px 9px",cursor:"pointer",fontSize:11,fontFamily:ui.fontBody,borderRadius:4}}>تأكيد</button>
                          <button onClick={()=>setDelConfirm(null)} style={{background:"none",border:ui.border,padding:"5px 8px",cursor:"pointer",fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,borderRadius:4}}>لا</button>
                        </div>
                      ) : (
                        <button onClick={()=>setDelConfirm(p.id)} style={{background:"none",border:"1px solid rgba(220,38,38,.3)",color:"#DC2626",padding:"5px 9px",cursor:"pointer",fontSize:11.5,fontFamily:ui.fontBody,borderRadius:4}}>حذف</button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CUSTOMERS */}
          {tab === "customers" && (
            <div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12}}>
                <span style={{fontSize:13,color:ui.textSub,fontFamily:ui.fontBody}}>الإجمالي: {allUsers.length} عميل</span>
                <button onClick={loadUsers}
                  style={{display:"flex",alignItems:"center",gap:5,background:ui.cardBg,color:ui.text,
                    border:ui.border,padding:"6px 12px",cursor:"pointer",fontFamily:ui.fontBody,fontSize:12,borderRadius:6}}>
                  <AdmIcon name="refresh" size={13}/> تحديث
                </button>
              </div>
              {allUsers.length===0 ? (
                <Placeholder icon="users" title="مفيش عملاء لحد دلوقتي" body="هتبان قائمة العملاء هنا بعد أول طلب." />
              ) : (
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody}}>
                    <thead>
                      <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                        {["#","الاسم","البريد","الهاتف","آخر طلب","عدد الطلبات","إجمالي الإنفاق"].map(h=>(
                          <th key={h} style={{padding:mob?"9px 10px":"11px 14px",textAlign:"right",fontSize:11,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {allUsers.map((u,i)=>(
                        <tr key={u.email} style={{borderTop:"0.5px solid #EEE"}}>
                          <td style={{padding:mob?"9px 10px":"11px 14px",fontSize:11.5,color:ui.textSub}}>{i+1}</td>
                          <td style={{padding:mob?"9px 10px":"11px 14px"}}>
                            <div style={{display:"flex",alignItems:"center",gap:8}}>
                              <div style={{width:28,height:28,borderRadius:"50%",background:ui.sideBg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,color:ui.text,fontWeight:600,flexShrink:0}}>{(u.name||u.email||"?")[0].toUpperCase()}</div>
                              <span style={{fontSize:13,color:ui.text}}>{u.name||"—"}</span>
                            </div>
                          </td>
                          <td style={{padding:mob?"9px 10px":"11px 14px",fontSize:12,color:ui.textSub}}>{u.email}</td>
                          <td style={{padding:mob?"9px 10px":"11px 14px",fontSize:12,color:ui.textSub,fontFamily:"monospace"}}>{u.phone||"—"}</td>
                          <td style={{padding:mob?"9px 10px":"11px 14px",fontSize:11.5,color:ui.textSub,whiteSpace:"nowrap"}}>{u.lastOrder ? new Date(u.lastOrder).toLocaleDateString("ar-EG") : "—"}</td>
                          <td style={{padding:mob?"9px 10px":"11px 14px",textAlign:"center"}}>
                            <span style={{background:u.totalOrders>0?"#DCFCE7":"#F3F4F6",color:u.totalOrders>0?"#15803D":"#737373",fontSize:11.5,padding:"2px 9px",borderRadius:20}}>{u.totalOrders||0}</span>
                          </td>
                          <td style={{padding:mob?"9px 10px":"11px 14px",whiteSpace:"nowrap"}}>
                            <span style={{fontSize:13,color:ui.text,fontWeight:500}}>{(u.totalSpent||0).toLocaleString()} <span style={{fontSize:10.5,color:ui.textSub}}>ج</span></span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {tab === "shipping" && <Placeholder icon="truck" title="إدارة الشحن" body="هنا هتقدر تتابع وتحدّث حالات شحن الطلبات. هنضيف الميزة دي قريباً." />}
          {tab === "coupons"  && <Placeholder icon="discount" title="الكوبونات والعروض" body="إنشاء أكواد خصم وعروض ترويجية. قريباً." />}
          {tab === "settings" && <Placeholder icon="settings" title="إعدادات المتجر" body="معلومات المتجر، طرق الدفع، اللغة، والإعدادات العامة. قريباً." />}

        </main>
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
          <div style={{fontSize:13,color:"#2A1F0E",fontFamily:C.fb,marginBottom:10,lineHeight:1.6}}>
            {waLines[0]}<br/>{waLines[1]}
          </div>
          <a href={`https://wa.me/${WA_NUM}?text=${msg}`} target="_blank" rel="noreferrer"
            style={{display:"block",background:"#25D366",color:"white",padding:"9px 14px",
              borderRadius:8,textDecoration:"none",fontSize:13,fontFamily:C.fb,
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
    ? (allProds||PRODS).filter(p => {
        const ql = q.toLowerCase();
        return (p.nameAr||p.name||"").includes(q)
          || (p.nameEn||"").toLowerCase().includes(ql)
          || p.brand.toLowerCase().includes(ql)
          || (p.descAr||p.desc||"").includes(q)
          || (p.descEn||"").toLowerCase().includes(ql);
      }).slice(0, 5)
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
          style={{border:"none",background:"none",outline:"none",fontFamily:C.fb,
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
              <div style={{width:36,height:36,flexShrink:0,borderRadius:3,overflow:"hidden",background:p.bg}}>
                {p.img
                  ? <img src={p.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}} />
                  : <span style={{fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",height:"100%"}}>{p.icon}</span>}
              </div>
              <div style={{minWidth:0}}>
                <div style={{fontSize:9,color:"#B8963E",letterSpacing:2,fontFamily:C.fb}}>{p.brand}</div>
                <div style={{fontSize:13,color:"#2A1F0E",fontFamily:C.fb,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.nameAr || p.name}</div>
                <div style={{fontSize:12,color:"#9C7E6A",fontFamily:C.fb}}>{p.price} جنيه</div>
              </div>
            </div>
          ))}
          <div onClick={()=>{go("#products");setQ("");setOpen(false);}}
            style={{padding:"9px 14px",textAlign:"center",fontSize:12,color:"#B8963E",
              cursor:"pointer",fontFamily:C.fb,borderTop:"1px solid rgba(0,0,0,.05)"}}>
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
          <h3 style={{fontFamily:C.fa,fontSize:mob?18:22,fontWeight:400,color:"#2A1F0E",margin:0}}>
            {t("reviewsTitle")}
          </h3>
          {avg && (
            <div style={{display:"flex",alignItems:"center",gap:8}}>
              <span style={{fontFamily:C.fa,fontSize:24,color:"#2A1F0E"}}>{avg}</span>
              <span style={{color:"#B8963E",fontSize:16}}>{Array(5).fill(0).map((_,i)=>i<Math.round(avg)?"★":"☆").join("")}</span>
              <span style={{fontSize:12,color:"#9C7E6A",fontFamily:C.fb}}>({reviews.length} {t("reviewsRatings")})</span>
            </div>
          )}
        </div>

        {/* Review list */}
        <div style={{marginBottom:28}}>
          {reviews.length===0 ? (
            <p style={{color:"#9C7E6A",fontFamily:C.fb,fontSize:13,padding:"20px 0"}}>
              {t("reviewsEmpty")}
            </p>
          ) : reviews.map(r=>(
            <div key={r.id} style={{padding:"14px 0",borderBottom:"1px solid rgba(0,0,0,.06)"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{width:32,height:32,borderRadius:"50%",background:"#F5EBE8",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,color:"#B8963E",fontWeight:600,fontFamily:C.fb}}>
                    {r.name[0]}
                  </div>
                  <div>
                    <div style={{fontSize:13,color:"#2A1F0E",fontFamily:C.fb,fontWeight:500}}>{r.name}</div>
                    <div style={{color:"#B8963E",fontSize:12}}>{Array(5).fill(0).map((_,i)=>i<r.rating?"★":"☆").join("")}</div>
                  </div>
                </div>
                <span style={{fontSize:11,color:"#9C7E6A",fontFamily:C.fb}}>{r.date}</span>
              </div>
              <p style={{fontSize:13,color:"#9C7E6A",lineHeight:1.7,margin:0,fontFamily:C.fb,paddingRight:42}}>{r.comment}</p>
            </div>
          ))}
        </div>

        {/* Add review form */}
        <div style={{background:"#F5EBE8",padding:mob?"16px":"20px"}}>
          <h4 style={{fontFamily:C.fa,fontSize:16,fontWeight:400,color:"#2A1F0E",marginBottom:14}}>
            {t("reviewsFormTitle")}
          </h4>
          {submitted ? (
            <div style={{color:"#10B981",fontFamily:C.fb,fontSize:14,padding:"10px 0"}}>{t("reviewsThanks")}</div>
          ) : (
            <>
              {!user && (
                <div style={{marginBottom:12}}>
                  <label style={{display:"block",fontSize:10,letterSpacing:2,color:"#9C7E6A",marginBottom:5,fontFamily:C.fb}}>{t("reviewsNameLabel")}</label>
                  <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder={t("reviewsNamePh")}
                    style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(0,0,0,.12)",background:"white",fontFamily:C.fb,fontSize:13,outline:"none",boxSizing:"border-box"}}/>
                </div>
              )}
              <div style={{marginBottom:12}}>
                <label style={{display:"block",fontSize:10,letterSpacing:2,color:"#9C7E6A",marginBottom:8,fontFamily:C.fb}}>{t("reviewsRatingLabel")}</label>
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
                <label style={{display:"block",fontSize:10,letterSpacing:2,color:"#9C7E6A",marginBottom:5,fontFamily:C.fb}}>{t("reviewsCommentLabel")}</label>
                <textarea value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})}
                  rows={3} placeholder={t("reviewsCommentPh")}
                  style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(0,0,0,.12)",background:"white",fontFamily:C.fb,fontSize:13,outline:"none",resize:"vertical",boxSizing:"border-box"}}/>
              </div>
              <button onClick={submit}
                style={{background:"#2A1F0E",color:"#FBF7F4",border:"none",padding:"11px 24px",
                  cursor:"pointer",fontFamily:C.fb,fontSize:13,letterSpacing:1}}>
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
        <div style={{ background: C.go, color: "#fff", textAlign: "center", padding: "9px 16px", fontSize: mob ? 12 : 13, fontFamily: C.fb, letterSpacing: "0.03em" }}>
          {t("welcomeBack")} <strong>{user.name}</strong>! 🌸 &nbsp;—&nbsp; <span onClick={() => go("#myorders")} style={{ cursor: "pointer", textDecoration: "underline" }}>{t("welcomeViewOrders")}</span>
        </div>
      )}
      {/* Announcement banner */}
      <div style={{ background: C.dk, color: C.go, textAlign: "center", padding: "10px 24px", fontSize: 13, letterSpacing: "0.05em", fontFamily: C.fb }}>
        {t("topBanner").split("✦").map((part, i, arr) => (
          <span key={i}>{part.trim()}{i < arr.length - 1 && <span style={{color:C.gom,margin:"0 14px"}}>✦</span>}</span>
        ))}
      </div>
      {/* Hero — split editorial layout */}
      <section style={{
        display: mob ? "block" : "grid", gridTemplateColumns: "1fr 1fr",
        minHeight: mob ? undefined : `calc(100vh - 74px - 44px)`,
        direction: dir
      }}>
        {/* Left: Text panel */}
        <div style={{
          padding: mob ? "44px 24px 36px" : "80px 72px 80px 48px",
          display: "flex", flexDirection: "column", justifyContent: "center",
          background: C.cr
        }}>
          {/* Eyebrow */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ width: 44, height: 1, background: C.go }} />
            <span style={{ fontFamily: C.fe, fontSize: 12, letterSpacing: "0.26em", color: C.go, textTransform: "uppercase", fontStyle: "italic" }}>
              Luxury Skincare
            </span>
          </div>
          <h1 style={{
            fontFamily: C.fa,
            fontSize: mob ? "clamp(44px,10vw,68px)" : "clamp(52px,5.5vw,84px)",
            fontWeight: 600, lineHeight: 1.18, color: C.dk,
            marginBottom: 20
          }}>
            {t("heroTitle")}{" "}
            <em style={{ color: C.go, fontStyle: "normal" }}>{t("heroTitleEm")}</em>
          </h1>
          <p style={{ fontFamily: C.fb, fontSize: 15, color: C.wa, lineHeight: 1.85, marginBottom: 32, maxWidth: 360 }}>
            {t("heroSub")}<br />{t("heroSub2")}
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: mob ? 0 : 40 }}>
            <Btn onClick={() => go("#products")} style={{
              background: C.dk, color: C.cr, border: `1.5px solid ${C.dk}`,
              padding: "13px 32px", fontFamily: C.fb, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em"
            }}>{t("heroShopNow")}</Btn>
            <Btn onClick={() => go("#about")} style={{
              background: "transparent", color: C.dk, border: "1.5px solid rgba(42,31,14,.4)",
              padding: "13px 32px", fontFamily: C.fb, fontSize: 13, letterSpacing: "0.06em"
            }}>{t("heroAboutUs")}</Btn>
          </div>
          {!mob && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, opacity: .5 }}>
              <div style={{ width: 1, height: 32, background: C.dk }} />
              <span style={{ fontFamily: C.fe, fontSize: 10, letterSpacing: "0.28em", color: C.dk, textTransform: "uppercase" }}>Scroll</span>
            </div>
          )}
        </div>
        {/* Mobile-only: product image strip */}
        {mob && (
          <div style={{ display: "flex", height: 200, overflow: "hidden" }}>
            {homProds.slice(0, 3).map(p => (
              <div key={p.id} onClick={() => go(`#product-${p.id}`)}
                style={{ flex: 1, overflow: "hidden", cursor: "pointer", position: "relative" }}>
                <img src={p.img} alt={p.nameAr} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                <div style={{ position: "absolute", inset: 0, background: "rgba(42,31,14,.18)" }} />
              </div>
            ))}
          </div>
        )}
        {/* Right: Visual panel */}
        {!mob && (
          <div style={{
            background: "linear-gradient(145deg,#F5E9D8,#EDD8BC,#E6CEB0)",
            display: "flex", alignItems: "center", justifyContent: "center",
            position: "relative", overflow: "hidden"
          }}>
            {/* Concentric rings */}
            {[340, 260, 190].map((size, ri) => (
              <div key={ri} style={{
                position: "absolute",
                width: size, height: size,
                borderRadius: "50%",
                border: `1px solid rgba(196,149,106,${ri===0?.18:ri===1?.28:.38})`,
                background: ri === 2 ? "rgba(255,255,255,.5)" : "transparent",
                boxShadow: ri === 2 ? "0 8px 32px rgba(196,149,106,.15)" : "none",
                animation: ri === 0 ? "ringRotate 50s linear infinite" : "none"
              }} />
            ))}
            {/* Logo centered */}
            <img src={LogoImg} alt="نوّرَة" style={{
              height: 160, width: "auto", display: "block", margin: "0 auto",
              position: "relative", zIndex: 2, mixBlendMode: "multiply"
            }} />
            {/* Corner ornaments */}
            {[[16,16],[16,"auto"],[null,16],["auto","auto"]].map(([t2,b2],i)=>(
              <svg key={i} width="28" height="28" viewBox="0 0 28 28" style={{
                position:"absolute",
                top:t2!==null&&t2!=="auto"?t2:undefined, bottom:b2!==null&&b2!=="auto"?b2:undefined,
                right: i%2===1?"auto":16, left: i%2===1?16:"auto",
                opacity: .35
              }}>
                <circle cx="14" cy="14" r="12" stroke="#C4956A" strokeWidth=".8" fill="none"/>
                <line x1="14" y1="2" x2="14" y2="26" stroke="#C4956A" strokeWidth=".8"/>
                <line x1="2" y1="14" x2="26" y2="14" stroke="#C4956A" strokeWidth=".8"/>
              </svg>
            ))}
          </div>
        )}
      </section>
      <style>{`@keyframes ringRotate{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}`}</style>
      <div style={{ background: C.dk, padding: "11px 0", overflow: "hidden", whiteSpace: "nowrap" }}>
        <div style={{ display: "inline-block", animation: "mq 22s linear infinite" }}>
          {["CERAVE","✦","THE ORDINARY","✦","LA ROCHE-POSAY","✦","NEUTROGENA","✦","GARNIER","✦","BIODERMA","✦","CERAVE","✦","THE ORDINARY","✦","LA ROCHE-POSAY","✦","NEUTROGENA","✦","GARNIER","✦","BIODERMA","✦"].map((s, i) => (
            <span key={i} style={{ color: s === "✦" ? C.go : C.bl, fontSize: 10, letterSpacing: 3, padding: "0 16px", fontFamily: C.fb }}>{s}</span>
          ))}
        </div>
      </div>
      {/* Features bar */}
      <section style={{ background: C.wh, padding: mob ? "36px 20px" : "52px 52px", borderBottom: "1px solid rgba(196,149,106,.1)" }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(4,1fr)", gap: 0, maxWidth: 1050, margin: "0 auto", textAlign: "center" }}>
          {[
            [<svg viewBox="0 0 44 44" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="3" y="22" width="28" height="14" rx="2"/><path d="M31 28h6l4 4v4h-10V28z"/><circle cx="10" cy="38" r="3"/><circle cx="34" cy="38" r="3"/><path d="M15 22v-6a6 6 0 016-6h0a6 6 0 016 6v6"/></svg>, t("feat1"), t("feat1d")],
            [<svg viewBox="0 0 44 44" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.4"><rect x="5" y="12" width="34" height="22" rx="3"/><path d="M5 19h34M14 29h8"/><circle cx="33" cy="29" r="3"/></svg>, t("feat2"), t("feat2d")],
            [<svg viewBox="0 0 44 44" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M22 6l4 8.5 9.5 1.4-6.8 6.6 1.6 9.3L22 27l-8.3 4.8 1.6-9.3L8.5 15.9 18 14.5z"/></svg>, t("feat3"), t("feat3d")],
            [<svg viewBox="0 0 44 44" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="1.4"><path d="M8 22c0-7.7 6.3-14 14-14s14 6.3 14 14"/><path d="M36 22l-4-4M36 22l-4 4"/><path d="M8 28c0 3.9 3.1 7 7 7h14a7 7 0 000-14"/></svg>, t("feat4"), t("feat4d")],
          ].map(([ic, lbl, d], i) => (
            <div key={lbl} style={{ padding: mob ? "20px 12px" : "0 28px", borderInlineEnd: i < 3 && !mob ? "1px solid rgba(196,149,106,.12)" : "none", borderBottom: mob && i < 2 ? "1px solid rgba(196,149,106,.1)" : "none", display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
              <div style={{ color: C.go, display: "flex", alignItems: "center", justifyContent: "center" }}>{ic}</div>
              <div style={{ fontFamily: C.fa, fontSize: mob ? 14 : 15, fontWeight: 600, color: C.dk }}>{lbl}</div>
              <div style={{ fontSize: 12, color: C.mu, lineHeight: 1.6, fontFamily: C.fb }}>{d}</div>
            </div>
          ))}
        </div>
      </section>
      {/* Best sellers */}
      <section style={{ padding: mob ? "48px 20px" : "72px 52px", background: C.cr }}>
        <div style={{ textAlign: "center", marginBottom: mob ? 36 : 52 }}>
          <div style={{ fontFamily: C.fe, fontSize: 12, letterSpacing: "0.26em", color: C.go, textTransform: "uppercase", fontStyle: "italic", marginBottom: 10 }}>{t("homeBestSellersTag")}</div>
          <h2 style={{ fontFamily: C.fa, fontSize: mob ? 28 : 38, fontWeight: 600, color: C.dk, marginBottom: 14 }}>{t("homeBestSellersTitle")}</h2>
          <div style={{ width: 56, height: 1, background: C.go, margin: "0 auto" }} />
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(3,1fr)", gap: mob ? 12 : 24, maxWidth: 1050, margin: "0 auto" }}>
          {homProds.slice(0, 3).map(p => <Card key={p.id} p={p} go={go} />)}
        </div>
        <div style={{ textAlign: "center", marginTop: 36 }}>
          <Btn onClick={() => go("#products")} style={{ background: "transparent", border: `1.5px solid ${C.dk}`, color: C.dk, padding: mob ? "11px 32px" : "13px 52px", fontFamily: C.fb, fontSize: 13, fontWeight: 600, letterSpacing: "0.07em" }}>{t("homeViewAll")}</Btn>
        </div>
      </section>
      {/* CTA Banner */}
      <section style={{ background: C.dk2 || C.dk, padding: mob ? "52px 24px" : "88px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 55% 75% at 50% 50%,rgba(196,149,106,.1) 0%,transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ fontFamily: C.fe, fontSize: 12, letterSpacing: "0.26em", color: "rgba(196,149,106,.6)", textTransform: "uppercase", fontStyle: "italic", marginBottom: 16 }}>Your Routine Starts Here</div>
          <h2 style={{ fontFamily: C.fa, fontSize: mob ? "clamp(28px,8vw,42px)" : "clamp(34px,4vw,52px)", fontWeight: 600, color: C.cr, lineHeight: 1.28, marginBottom: 16 }}>{t("homeCtaTitle")}</h2>
          <p style={{ fontSize: mob ? 13 : 15, color: "rgba(251,247,244,.55)", marginBottom: 36, lineHeight: 1.85, fontFamily: C.fb }}>{t("homeCtaSub")}</p>
          <Btn onClick={() => go("#products")} style={{ background: C.go, color: "#fff", border: `1.5px solid ${C.go}`, padding: mob ? "13px 36px" : "15px 52px", fontFamily: C.fb, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em" }}>{t("homeCtaBtn")}</Btn>
        </div>
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
      {/* Page header */}
      <div style={{ background: C.cr2, padding: mob ? "36px 20px" : "56px 52px", textAlign: "center", borderBottom: "1px solid rgba(196,149,106,.1)" }}>
        <div style={{ fontFamily: C.fe, fontSize: 11, letterSpacing: "0.26em", color: C.go, textTransform: "uppercase", fontStyle: "italic", marginBottom: 10 }}>Our Curation</div>
        <h1 style={{ fontFamily: C.fa, fontSize: mob ? 30 : 42, fontWeight: 600, color: C.dk, marginBottom: 10 }}>{t("prodsTitle")}</h1>
        <p style={{ color: C.mu, fontFamily: C.fb, fontSize: 14, lineHeight: 1.7 }}>{t("prodsSub")}</p>
      </div>
      {/* Filter + sort bar */}
      <div style={{ background: C.wh, padding: mob ? "10px 16px" : "12px 52px", borderBottom: "1px solid rgba(196,149,106,.1)" }}>
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap", alignItems: "center" }}>
          <Btn onClick={() => setFil("__all__")} style={{ padding: "5px 13px", border: `1.5px solid ${fil === "__all__" ? C.dk : "rgba(196,149,106,.25)"}`, background: fil === "__all__" ? C.dk : "transparent", color: fil === "__all__" ? C.cr : C.dk, fontSize: mob ? 10 : 11.5, whiteSpace: "nowrap", fontFamily: C.fb, letterSpacing: "0.04em" }}>{t("prodsFilterAll")}</Btn>
          {brandKeys.map(b => <Btn key={b} onClick={() => setFil(b)} style={{ padding: "5px 13px", border: `1.5px solid ${fil === b ? C.dk : "rgba(196,149,106,.25)"}`, background: fil === b ? C.dk : "transparent", color: fil === b ? C.cr : C.dk, fontSize: mob ? 10 : 11.5, whiteSpace: "nowrap", fontFamily: C.fe, letterSpacing: "0.1em" }}>{b}</Btn>)}
          <select value={srt} onChange={e => setSrt(e.target.value)} style={{ padding: "6px 10px", border: "1px solid rgba(196,149,106,.25)", background: C.cr, fontFamily: C.fb, fontSize: mob ? 10 : 12, outline: "none", marginInlineStart: "auto", color: C.dk }}>
            <option value="d">{t("prodsSortDefault")}</option><option value="a">{t("prodsSortAsc")}</option><option value="z">{t("prodsSortDesc")}</option>
          </select>
        </div>
      </div>
      {/* Products grid */}
      <div style={{ padding: mob ? "20px 16px" : "32px 52px", background: C.cr }}>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(3,1fr)", gap: mob ? 12 : 24, maxWidth: 1100, margin: "0 auto" }}>
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
  const { t, lang, dir } = useLang();
  if (!p) return <div style={{ padding: 60, textAlign: "center" }}>{t("prodNotFound")}</div>;
  const px = mob ? "16px" : "56px";
  const rel = prodsData.filter(x => x.id !== p.id).slice(0, mob ? 2 : 3);
  // Language-aware fields
  const pName = lang === "ar" ? (p.nameAr || p.name) : (p.nameEn || p.nameAr || p.name);
  const pDesc = lang === "ar" ? (p.descAr || p.desc) : (p.descEn || p.descAr || p.desc);
  const pDet  = lang === "ar" ? (p.detAr  || p.det)  : (p.detEn  || p.detAr  || p.det);
  const pUse  = lang === "ar" ? (p.useAr  || p.use)  : (p.useEn  || p.useAr  || p.use);
  return (
    <div style={{ direction: dir, minHeight: "80vh" }}>
      {/* Breadcrumb */}
      <div style={{ padding: `10px ${px}`, background: C.wh, borderBottom: "1px solid rgba(196,149,106,.1)", fontSize: 11, color: C.mu, fontFamily: C.fe, letterSpacing: "0.08em" }}>
        <span onClick={() => go("#home")} style={{ cursor: "pointer" }}>{t("prodHome")}</span>{" › "}<span onClick={() => go("#products")} style={{ cursor: "pointer" }}>{t("prodProds")}</span>{" › "}{pName}
      </div>
      <div style={{ padding: `${mob ? "24px" : "48px"} ${px}`, display: mob ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 48, maxWidth: 1100, margin: "0 auto" }}>
        {/* Product image */}
        <div style={{ height: mob ? 300 : 460, marginBottom: mob ? 24 : 0, position: "relative", overflow: "hidden", border: "1px solid rgba(196,149,106,.13)", background: p.bg }}>
          {p.img ? (
            <img src={p.img} alt={pName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
          ) : (
            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 12,
              backgroundImage: "repeating-linear-gradient(45deg,transparent,transparent 9px,rgba(196,149,106,.05) 9px,rgba(196,149,106,.05) 10px)" }}>
              <span style={{ fontSize: mob ? 72 : 96 }}>{p.icon}</span>
              <span style={{ fontFamily: C.fe, fontSize: 10, letterSpacing: "0.22em", color: "#5C4A2A", textTransform: "uppercase" }}>{p.brand}</span>
            </div>
          )}
        </div>
        <div>
          <div style={{ fontFamily: C.fe, fontSize: 10, letterSpacing: "0.22em", color: C.go, textTransform: "uppercase", marginBottom: 8 }}>{p.brand}</div>
          <h1 style={{ fontFamily: lang === "ar" ? C.fa : C.fe, fontSize: mob ? 24 : 34, fontWeight: lang === "ar" ? 600 : 500, color: C.dk, marginBottom: 10, lineHeight: 1.2 }}>{pName}</h1>
          <div style={{ marginBottom: 14 }}><Stars n={p.stars} /></div>
          <div style={{ marginBottom: 14, display: "flex", alignItems: "center", gap: 10 }}>
            {p.stock > 0 ? (
              <>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.stock <= 3 ? "#EF4444" : "#10B981", display: "inline-block" }}/>
                <span style={{ fontSize: 12, color: p.stock <= 3 ? "#EF4444" : "#10B981", fontFamily: C.fb }}>
                  {p.stock <= 3 ? `${t("prodLowStock")} ${p.stock} ${t("prodLowStockSuffix")}` : `${t("prodAvail")} ${p.stock} ${t("prodInStock")}`}
                </span>
              </>
            ) : (
              <>
                <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#6B7280", display: "inline-block" }}/>
                <span style={{ fontSize: 12, color: "#6B7280", fontFamily: C.fb }}>{t("prodOutStock")}</span>
              </>
            )}
          </div>
          <p style={{ fontSize: mob ? 13.5 : 14.5, color: C.wa, lineHeight: 1.85, marginBottom: 20, fontFamily: C.fb }}>{pDesc}</p>
          <div style={{ fontFamily: C.fe, fontSize: mob ? 28 : 34, fontWeight: 500, color: C.dk, marginBottom: 22 }}>{p.price} <span style={{ fontSize: 13, color: C.mu, fontFamily: C.fb }}>{t("egp")}</span></div>
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
            <Btn onClick={() => setQty(Math.max(1, qty - 1))} style={{ width: 36, height: 36, border: "1.5px solid rgba(42,31,14,.4)", background: "none", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>−</Btn>
            <span style={{ fontFamily: C.fe, fontSize: 18, minWidth: 24, textAlign: "center", color: C.dk }}>{qty}</span>
            <Btn onClick={() => setQty(qty + 1)} style={{ width: 36, height: 36, border: "1.5px solid rgba(42,31,14,.4)", background: "none", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}>+</Btn>
          </div>
          <Btn onClick={() => { for (let i = 0; i < qty; i++) add(p); show(t("addedToCart")); }} style={{ width: "100%", background: C.dk, color: C.cr, padding: "14px 0", fontFamily: C.fb, fontSize: 13.5, fontWeight: 600, letterSpacing: "0.06em", marginBottom: 12, border: `1.5px solid ${C.dk}` }}>{t("prodAddToCart")}</Btn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>
            {[["🚚",t("prodShipping")],["💰",t("prodCash")],["↩️",t("prodReturn")]].map(([ic, lbl]) => (
              <div key={lbl} style={{ background: C.cr2, padding: "10px 6px", textAlign: "center", fontSize: 11, color: C.mu, fontFamily: C.fb, border: "1px solid rgba(196,149,106,.1)" }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{ic}</div>{lbl}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Detail/Usage tabs */}
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: `0 ${px} 36px` }}>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(196,149,106,.15)", marginBottom: 20 }}>
          {[["d",t("prodDetailsTab")],["u",t("prodUseTab")]].map(([k, l]) => (
            <Btn key={k} onClick={() => setTab(k)} style={{ padding: mob ? "11px 18px" : "13px 28px", background: "none", borderBottom: tab === k ? `2px solid ${C.dk}` : "2px solid transparent", color: tab === k ? C.dk : C.mu, fontFamily: C.fb, fontSize: mob ? 12.5 : 13.5, fontWeight: tab === k ? 600 : 400, letterSpacing: "0.03em" }}>{l}</Btn>
          ))}
        </div>
        <p style={{ fontSize: mob ? 13.5 : 14.5, color: C.wa, lineHeight: 1.9, fontFamily: C.fb }}>{tab === "d" ? pDet : pUse}</p>
      </div>
      <Reviews productId={id} />
      {/* Related products */}
      <div style={{ background: C.cr2, padding: mob ? "32px 20px" : "52px 52px" }}>
        <div style={{ textAlign: "center", marginBottom: mob ? 28 : 40 }}>
          <div style={{ fontFamily: C.fe, fontSize: 11, letterSpacing: "0.22em", color: C.go, textTransform: "uppercase", fontStyle: "italic", marginBottom: 8 }}>Discover More</div>
          <h2 style={{ fontFamily: C.fa, fontSize: mob ? 22 : 30, fontWeight: 600, color: C.dk }}>{t("prodRelated")}</h2>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "repeat(3,1fr)", gap: mob ? 12 : 24, maxWidth: 1100, margin: "0 auto" }}>
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
      <div style={{ background: "linear-gradient(145deg,#F5E9D8,#EDD8BC)", padding: mob ? "44px 20px" : "72px 52px", textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 60% 80% at 50% 60%,rgba(255,255,255,.3) 0%,transparent 70%)" }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <img src={LogoImg} alt="نوّرَة" style={{height:120, width:"auto", display:"block", margin:"0 auto 20px", mixBlendMode:"multiply"}} />
          <div style={{ fontFamily: C.fe, fontSize: 11, letterSpacing: "0.26em", color: C.go, textTransform: "uppercase", fontStyle: "italic", marginBottom: 12 }}>Our Story</div>
          <h1 style={{ fontFamily: C.fa, fontSize: mob ? 28 : 44, fontWeight: 600, color: C.dk, marginBottom: 12 }}>{t("aboutTitle")}</h1>
          <div style={{ width: 48, height: 1, background: C.go, margin: "0 auto 14px" }} />
          <p style={{ fontSize: mob ? 13.5 : 15, color: C.wa, maxWidth: 440, margin: "0 auto", lineHeight: 1.9, fontFamily: C.fb }}>{t("aboutSub")}</p>
        </div>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: `${mob ? "32px" : "56px"} ${px}` }}>
        {t("aboutSect").map(s => (
          <div key={s.t} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: "1px solid rgba(196,149,106,.1)" }}>
            <h3 style={{ fontFamily: C.fa, fontSize: mob ? 20 : 24, fontWeight: 600, color: C.dk, marginBottom: 10, borderInlineStart: `3px solid ${C.go}`, paddingInlineStart: 14 }}>{s.t}</h3>
            <p style={{ fontSize: mob ? 13.5 : 14.5, color: C.wa, lineHeight: 1.9, fontFamily: C.fb, paddingInlineStart: 17 }}>{s.x}</p>
          </div>
        ))}
        <div style={{ background: "linear-gradient(135deg,#F5E9D8,#EDD8BC)", padding: mob ? "24px" : "36px", textAlign: "center", marginTop: 16 }}>
          <div style={{ fontFamily: C.fe, fontSize: 11, letterSpacing: "0.2em", color: C.go, textTransform: "uppercase", fontStyle: "italic", marginBottom: 10 }}>Ready?</div>
          <p style={{ fontFamily: C.fa, fontSize: mob ? 18 : 22, fontWeight: 600, color: C.dk, marginBottom: 18 }}>{t("aboutCtaQ")}</p>
          <Btn onClick={() => go("#products")} style={{ background: C.dk, color: C.cr, border: `1.5px solid ${C.dk}`, padding: mob ? "12px 28px" : "14px 40px", fontFamily: C.fb, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em" }}>{t("aboutCtaBtn")}</Btn>
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
      <div style={{ background: C.cr2, padding: mob ? "36px 20px" : "56px 52px", textAlign: "center", borderBottom: "1px solid rgba(196,149,106,.1)" }}>
        <div style={{ fontFamily: C.fe, fontSize: 11, letterSpacing: "0.26em", color: C.go, textTransform: "uppercase", fontStyle: "italic", marginBottom: 10 }}>Get in Touch</div>
        <h1 style={{ fontFamily: C.fa, fontSize: mob ? 28 : 40, fontWeight: 600, color: C.dk, marginBottom: 10 }}>{t("contactTitle")}</h1>
        <div style={{ width: 48, height: 1, background: C.go, margin: "0 auto 12px" }} />
        <p style={{ color: C.wa, fontFamily: C.fb, fontSize: 14 }}>{t("contactSub")}</p>
      </div>
      <div style={{ maxWidth: 820, margin: "0 auto", padding: `${mob ? "28px" : "56px"} ${px}`, display: mob ? "block" : "grid", gridTemplateColumns: "1fr 1fr", gap: 52 }}>
        <div style={{ marginBottom: mob ? 32 : 0 }}>
          <h3 style={{ fontFamily: C.fa, fontSize: mob ? 18 : 22, fontWeight: 600, color: C.dk, marginBottom: 20 }}>{t("contactInfoTitle")}</h3>
          {t("contactInfo").map(([ic, l, v]) => (
            <div key={l} style={{ display: "flex", gap: 14, marginBottom: 18, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, color: C.go, flexShrink: 0, marginTop: 2 }}>{ic}</span>
              <div>
                <div style={{ fontFamily: C.fe, fontSize: 9.5, letterSpacing: "0.18em", color: C.go, textTransform: "uppercase", marginBottom: 3 }}>{l}</div>
                <div style={{ fontSize: 13.5, color: C.dk, fontFamily: C.fb }}>{v}</div>
              </div>
            </div>
          ))}
        </div>
        <div>
          {ok ? (
            <div style={{ textAlign: "center", padding: "32px 0" }}>
              <div style={{ width: 52, height: 52, borderRadius: "50%", background: C.gof, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px", fontSize: 22 }}>✅</div>
              <h3 style={{ fontFamily: C.fa, fontSize: 20, fontWeight: 600, color: C.dk, marginBottom: 8 }}>{t("contactSentTitle")}</h3>
              <p style={{ color: C.wa, fontFamily: C.fb, fontSize: 13.5, marginBottom: 18, lineHeight: 1.7 }}>{t("contactSentMsg")}</p>
              <Btn onClick={() => setOk(false)} style={{ background: C.dk, color: C.cr, border: `1.5px solid ${C.dk}`, padding: "12px 28px", fontFamily: C.fb, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em" }}>{t("contactNewBtn")}</Btn>
            </div>
          ) : (
            <>
              <h3 style={{ fontFamily: C.fa, fontSize: mob ? 18 : 22, fontWeight: 600, color: C.dk, marginBottom: 20 }}>{t("contactFormTitle")}</h3>
              {t("contactFields").map(([k, l, ph]) => (
                <div key={k} style={{ marginBottom: 14 }}>
                  <label style={{ display: "block", fontFamily: C.fe, fontSize: 10, letterSpacing: "0.18em", color: C.mu, textTransform: "uppercase", marginBottom: 5 }}>{l}</label>
                  <input value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} placeholder={ph} style={{ width: "100%", padding: "11px 14px", border: "1px solid rgba(196,149,106,.25)", background: C.wh, fontFamily: C.fb, fontSize: 13.5, outline: "none", boxSizing: "border-box" }} />
                </div>
              ))}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontFamily: C.fe, fontSize: 10, letterSpacing: "0.18em", color: C.mu, textTransform: "uppercase", marginBottom: 5 }}>{t("contactMsgLabel")}</label>
                <textarea value={f.m} onChange={e => setF({ ...f, m: e.target.value })} rows={mob ? 4 : 5} placeholder={t("contactMsgPh")} style={{ width: "100%", padding: "11px 14px", border: "1px solid rgba(196,149,106,.25)", background: C.wh, fontFamily: C.fb, fontSize: 13.5, outline: "none", resize: "vertical", boxSizing: "border-box" }} />
              </div>
              <Btn onClick={() => { if (f.n && f.m) setOk(true); }} style={{ width: "100%", background: C.dk, color: C.cr, border: `1.5px solid ${C.dk}`, padding: 14, fontFamily: C.fb, fontSize: 13.5, fontWeight: 600, letterSpacing: "0.05em" }}>{t("contactSendBtn")}</Btn>
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
      <div style={{ background: C.cr2, padding: mob ? "36px 20px" : "56px 52px", textAlign: "center", borderBottom: "1px solid rgba(196,149,106,.1)" }}>
        <div style={{ fontFamily: C.fe, fontSize: 11, letterSpacing: "0.26em", color: C.go, textTransform: "uppercase", fontStyle: "italic", marginBottom: 10 }}>Policies</div>
        <h1 style={{ fontFamily: C.fa, fontSize: mob ? 28 : 40, fontWeight: 600, color: C.dk, marginBottom: 10 }}>{t("shippingTitle")}</h1>
        <div style={{ width: 48, height: 1, background: C.go, margin: "0 auto 12px" }} />
        <p style={{ color: C.wa, fontFamily: C.fb, fontSize: 14 }}>{t("shippingSub")}</p>
      </div>
      <div style={{ maxWidth: 720, margin: "0 auto", padding: `${mob ? "28px" : "52px"} ${px}` }}>
        {t("shippingSects").map((s, si) => (
          <div key={s.t} style={{ marginBottom: 32, paddingBottom: 32, borderBottom: si < t("shippingSects").length - 1 ? "1px solid rgba(196,149,106,.1)" : "none" }}>
            <h3 style={{ fontFamily: C.fa, fontSize: mob ? 18 : 22, fontWeight: 600, color: C.dk, marginBottom: 14, borderInlineStart: `3px solid ${C.go}`, paddingInlineStart: 14 }}>{s.t}</h3>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {s.i.map(it => <li key={it} style={{ display: "flex", gap: 10, marginBottom: 9, fontFamily: C.fb, fontSize: mob ? 13 : 14, color: C.wa, lineHeight: 1.7 }}><span style={{ color: C.go, flexShrink: 0, marginTop: 2, fontSize: 10 }}>✦</span>{it}</li>)}
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
    <footer style={{ background: C.dk2, color: C.cr, direction: dir }}>
      <div style={{ padding: mob ? "36px 20px 28px" : "52px 52px 40px", display: "grid", gridTemplateColumns: mob ? "1fr 1fr" : "1.5fr 1fr 1fr 1fr", gap: mob ? "24px" : "48px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ gridColumn: mob ? "1 / -1" : undefined }}>
          <img src={LogoImg} alt="نوّرَة" style={{height:70, width:"auto", marginBottom:14, opacity:0.85, mixBlendMode:"screen"}} />
          <p style={{ fontFamily: C.fb, fontSize: 12.5, color: "rgba(251,247,244,.38)", lineHeight: 1.75, maxWidth: 200 }}>{t("footerTagline")}</p>
        </div>
        {t("footerCols").map(col => (
          <div key={col.t}>
            <h4 style={{ fontFamily: C.fe, fontSize: 10.5, letterSpacing: "0.2em", color: "rgba(196,149,106,.75)", textTransform: "uppercase", marginBottom: 16 }}>{col.t}</h4>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 9 }}>
              {col.l.map(([h, l]) => <li key={l}><span onClick={() => go(h)} style={{ fontSize: 13, color: "rgba(251,247,244,.45)", cursor: "pointer", fontFamily: C.fb, transition: "color .2s" }}
                onMouseEnter={e=>e.target.style.color=C.go} onMouseLeave={e=>e.target.style.color="rgba(251,247,244,.45)"}>{l}</span></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div style={{ borderTop: "1px solid rgba(196,149,106,.1)", padding: mob ? "14px 20px" : "14px 52px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
        <span style={{ fontFamily: C.fe, fontSize: 12, color: "rgba(251,247,244,.28)", letterSpacing: "0.04em" }}>{t("footerCopyright")}</span>
        <span style={{ fontFamily: `'Noto Naskh Arabic',${C.fe}`, fontSize: 10.5, letterSpacing: "0.14em", color: "rgba(196,149,106,.4)", fontFeatureSettings: '"kern" 1', WebkitFontSmoothing: "antialiased" }}>NAWRA · نوّرَة</span>
      </div>
    </footer>
  );
}

// ─── Order Timeline (4-step status indicator) ─────────────────────────────────
const ORDER_STATUSES = ["جديد", "قيد التجهيز", "تم الشحن", "مكتمل", "ملغي"];
function OrderTimeline({ status }) {
  const { t, lang } = useLang();
  const STEPS = [
    { key: "جديد",        label: t("timelineReceived"),  icon: "🟡" },
    { key: "قيد التجهيز", label: t("timelinePreparing"), icon: "🔵" },
    { key: "تم الشحن",    label: t("timelineShipped"),   icon: "🚚" },
    { key: "مكتمل",       label: t("timelineDelivered"), icon: "✅" },
  ];
  if (status === "ملغي") {
    return (
      <div style={{ marginTop:14, padding:"12px 14px", background:"#FEE2E2", color:"#DC2626", fontFamily:C.fb, fontSize:13, borderInlineStart:"3px solid #DC2626" }}>
        ❌ {t("timelineCancelled")}
      </div>
    );
  }
  const idx = STEPS.findIndex(s => s.key === status);
  const cur = idx === -1 ? 0 : idx;
  return (
    <div style={{ position:"relative", marginTop:14, paddingTop:18, paddingBottom:6, borderTop:"1px solid rgba(196,149,106,.1)" }}>
      {/* Connecting line — background */}
      <div style={{ position:"absolute", top:36, insetInlineStart:"12.5%", insetInlineEnd:"12.5%", height:2, background:"rgba(196,149,106,.18)", zIndex:1 }}>
        <div style={{
          width: `${(cur/(STEPS.length-1))*100}%`, height:"100%", background:C.go,
          transition:"width .5s ease",
          marginInlineStart: lang==="ar" ? "auto" : 0,
        }}/>
      </div>
      <div style={{ display:"flex", justifyContent:"space-between", position:"relative", zIndex:2 }}>
        {STEPS.map((s, i) => {
          const done = i <= cur;
          const isCur = i === cur;
          return (
            <div key={s.key} style={{ flex:1, textAlign:"center" }}>
              <div style={{
                width:36, height:36, borderRadius:"50%",
                background: done ? C.go : C.wh,
                border: `2px solid ${done ? C.go : "rgba(196,149,106,.3)"}`,
                color: done ? "#fff" : C.mu,
                display:"flex", alignItems:"center", justifyContent:"center",
                fontSize: done ? 16 : 13, margin:"0 auto 8px",
                boxShadow: isCur ? `0 0 0 4px rgba(196,149,106,.18)` : "none",
                transition:"all .3s", fontWeight:600
              }}>
                {done ? s.icon : i+1}
              </div>
              <div style={{ fontFamily:C.fb, fontSize:10.5, color: done ? C.dk : C.mu, fontWeight: isCur ? 600 : 400, lineHeight:1.4 }}>
                {s.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Order Detail Modal (used by AdminDash) ───────────────────────────────────
function OrderDetailModal({ order, onClose, onStatusChange }) {
  const { t, dir } = useLang();
  if (!order) return null;
  const sectionTitle = { fontFamily:C.fa, fontSize:13.5, fontWeight:600, color:C.dk, marginBottom:8, paddingBottom:4, borderBottom:`1px solid rgba(196,149,106,.15)` };
  const row = { fontFamily:C.fb, fontSize:13, color:C.dk, lineHeight:1.85, marginBottom:3 };
  const label = { color:C.mu, marginInlineEnd:6, fontSize:11.5, letterSpacing:".04em" };
  return (
    <div onClick={onClose} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16, direction:dir, overflowY:"auto" }}>
      <div onClick={e=>e.stopPropagation()} style={{ background:C.wh, maxWidth:680, width:"100%", maxHeight:"92vh", overflow:"auto", padding:"22px 26px", boxShadow:"0 12px 48px rgba(0,0,0,.25)" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, paddingBottom:12, borderBottom:`1px solid rgba(196,149,106,.18)` }}>
          <div>
            <h2 style={{ fontFamily:C.fa, fontSize:19, fontWeight:600, color:C.dk, margin:0 }}>{t("detailTitle")}</h2>
            <div style={{ fontFamily:C.fe, fontSize:11, color:C.mu, letterSpacing:".1em", marginTop:3 }}>#{order.id}</div>
          </div>
          <button onClick={onClose} style={{ background:"none", border:"none", fontSize:24, color:C.mu, cursor:"pointer", lineHeight:1, padding:4 }}>✕</button>
        </div>

        {/* Timeline */}
        <OrderTimeline status={order.status}/>

        {/* Customer */}
        <section style={{ marginTop:20 }}>
          <h3 style={sectionTitle}>👤 {t("detailCustomer")}</h3>
          <div style={row}><span style={label}>{t("detailName")}:</span>{order.name}</div>
          <div style={row}><span style={label}>{t("detailPhone")}:</span>{order.phone}</div>
          {order.userEmail && <div style={row}><span style={label}>{t("detailEmail")}:</span>{order.userEmail}</div>}
        </section>

        {/* Address */}
        <section style={{ marginTop:16 }}>
          <h3 style={sectionTitle}>📍 {t("detailAddress")}</h3>
          <div style={row}>{order.address || "—"}</div>
          {order.city && <div style={row}>{order.city}</div>}
          {order.lat && order.lng && (
            <a href={`https://www.google.com/maps?q=${order.lat},${order.lng}`} target="_blank" rel="noreferrer"
              style={{ display:"inline-block", marginTop:4, fontFamily:C.fb, fontSize:12, color:C.go, textDecoration:"none" }}>
              🗺 {t("detailOpenMap")}: {Number(order.lat).toFixed(5)}, {Number(order.lng).toFixed(5)}
            </a>
          )}
        </section>

        {/* Order info */}
        <section style={{ marginTop:16 }}>
          <h3 style={sectionTitle}>📅 {t("detailOrderInfo")}</h3>
          <div style={row}><span style={label}>{t("detailDate")}:</span>{order.created_at || order.date || "—"}</div>
          <div style={row}><span style={label}>{t("detailStatus")}:</span>{order.status}</div>
        </section>

        {/* Items */}
        <section style={{ marginTop:16 }}>
          <h3 style={sectionTitle}>🛍️ {t("detailItems")}</h3>
          {(order.items||[]).map((item,i) => (
            <div key={i} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px dashed rgba(196,149,106,.12)", fontFamily:C.fb, fontSize:13 }}>
              <span style={{ color:C.dk }}>{item.name} × {item.qty}</span>
              <span style={{ fontFamily:C.fe, color:C.dk }}>{(item.price||0) * (item.qty||0)} {t("egp")}</span>
            </div>
          ))}
          <div style={{ display:"flex", justifyContent:"space-between", paddingTop:12, marginTop:4, fontFamily:C.fa, fontSize:17, fontWeight:600, color:C.dk }}>
            <span>{t("detailTotal")}</span>
            <span>{order.total||0} {t("egp")}</span>
          </div>
        </section>

        {/* Status change */}
        {onStatusChange && (
          <section style={{ marginTop:18, paddingTop:14, borderTop:`1px solid rgba(196,149,106,.15)` }}>
            <h3 style={sectionTitle}>{t("detailUpdateStatus")}</h3>
            <div style={{ display:"flex", gap:6, flexWrap:"wrap" }}>
              {ORDER_STATUSES.map(s => (
                <button key={s} onClick={() => onStatusChange(order.id, s)} style={{
                  padding:"7px 13px",
                  background: order.status===s ? C.dk : "none",
                  color: order.status===s ? C.cr : C.dk,
                  border: `1.5px solid ${order.status===s ? C.dk : "rgba(42,31,14,.2)"}`,
                  fontFamily:C.fb, fontSize:12, cursor:"pointer",
                  fontWeight: order.status===s ? 600 : 400, transition:"all .2s"
                }}>{s}</button>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

// ─── Address Form ─────────────────────────────────────────────────────────────
function AddressForm({ initial = {}, userId, onSave, onCancel, submitLabel }) {
  const { t, lang, dir } = useLang();
  const mob = useMob();
  const [saving, setSaving] = useState(false);
  const [gpsStatus, setGpsStatus] = useState(""); // ""|"getting"|"done"|"error"
  const blank = { fullName:"", phone:"", street:"", building:"", city:"", district:"",
    governorate:"", landmark:"", type:"home", officeFri:false, officeSat:false,
    lat:null, lng:null, isDefault:false };
  const [f, setF] = useState({ ...blank, ...initial });
  const set = (k, v) => setF(p => ({ ...p, [k]: v }));

  const getGPS = () => {
    if (!navigator.geolocation) { setGpsStatus("error"); return; }
    setGpsStatus("getting");
    navigator.geolocation.getCurrentPosition(
      pos => { set("lat", pos.coords.latitude); set("lng", pos.coords.longitude); setGpsStatus("done"); },
      () => setGpsStatus("error"),
      { timeout: 10000 }
    );
  };

  const save = async () => {
    if (!f.fullName || !f.phone || !f.street || !f.governorate) {
      alert(t("addrRequired")); return;
    }
    setSaving(true);
    const addr = { ...f, id: initial.id || String(Date.now()), userId,
      createdAt: initial.createdAt || new Date().toISOString() };
    try {
      const method = initial.id ? "PUT" : "POST";
      const url = initial.id ? `/api/addresses/${initial.id}` : "/api/addresses";
      await fetch(url, { method, headers:{"Content-Type":"application/json"}, body:JSON.stringify(addr) });
    } catch {}
    const stored = JSON.parse(localStorage.getItem(`nawra_addresses_${userId}`) || "[]");
    if (initial.id) {
      const idx = stored.findIndex(a => a.id === initial.id);
      if (idx >= 0) stored[idx] = addr; else stored.push(addr);
    } else {
      if (addr.isDefault) stored.forEach(a => { a.isDefault = false; });
      stored.push(addr);
    }
    localStorage.setItem(`nawra_addresses_${userId}`, JSON.stringify(stored));
    setSaving(false);
    onSave(addr);
  };

  const inp = (key, lbl, ph) => (
    <div style={{ marginBottom:14 }}>
      <label style={{ display:"block", fontFamily:C.fe, fontSize:10, letterSpacing:"0.16em", color:C.mu, marginBottom:5, textTransform:"uppercase" }}>{lbl}</label>
      <input value={f[key]} onChange={e => set(key, e.target.value)} placeholder={ph}
        style={{ width:"100%", padding:"11px 14px", border:"1px solid rgba(196,149,106,.25)", background:C.wh, fontFamily:C.fb, fontSize:13.5, outline:"none", boxSizing:"border-box" }}
        onFocus={e=>e.target.style.borderColor=C.go} onBlur={e=>e.target.style.borderColor="rgba(196,149,106,.25)"} />
    </div>
  );

  return (
    <div style={{ direction: dir }}>
      {/* Country — fixed */}
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontFamily:C.fe, fontSize:10, letterSpacing:"0.16em", color:C.mu, marginBottom:5, textTransform:"uppercase" }}>{t("addrCountry")}</label>
        <div style={{ padding:"11px 14px", border:"1px solid rgba(196,149,106,.15)", background:C.cr2, fontFamily:C.fb, fontSize:13.5, color:C.mu }}>{t("addrCountryVal")}</div>
      </div>
      {inp("fullName", t("addrFullName"), t("addrFullNamePh"))}
      {/* Phone with flag prefix */}
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontFamily:C.fe, fontSize:10, letterSpacing:"0.16em", color:C.mu, marginBottom:5, textTransform:"uppercase" }}>{t("addrPhone")}</label>
        <div style={{ display:"flex" }}>
          <div style={{ padding:"11px 12px", border:"1px solid rgba(196,149,106,.25)", borderInlineEnd:"none", background:C.cr2, fontFamily:C.fb, fontSize:13, color:C.dk, flexShrink:0 }}>🇪🇬 +20</div>
          <input value={f.phone} onChange={e => set("phone", e.target.value.replace(/\D/g,""))} placeholder={t("addrPhonePh")} maxLength={10}
            style={{ flex:1, padding:"11px 12px", border:"1px solid rgba(196,149,106,.25)", background:C.wh, fontFamily:C.fb, fontSize:13.5, outline:"none", boxSizing:"border-box" }}
            onFocus={e=>e.target.style.borderColor=C.go} onBlur={e=>e.target.style.borderColor="rgba(196,149,106,.25)"} />
        </div>
      </div>
      {inp("street", t("addrStreet"), t("addrStreetPh"))}
      {inp("building", t("addrBuilding"), t("addrBuildingPh"))}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
        <div>{inp("city", t("addrCity"), t("addrCityPh"))}</div>
        <div>{inp("district", t("addrDistrict"), t("addrDistrictPh"))}</div>
      </div>
      {/* Governorate */}
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontFamily:C.fe, fontSize:10, letterSpacing:"0.16em", color:C.mu, marginBottom:5, textTransform:"uppercase" }}>{t("addrGov")}</label>
        <select value={f.governorate} onChange={e => set("governorate", e.target.value)}
          style={{ width:"100%", padding:"11px 14px", border:"1px solid rgba(196,149,106,.25)", background:C.wh, fontFamily:C.fb, fontSize:13.5, outline:"none" }}
          onFocus={e=>e.target.style.borderColor=C.go} onBlur={e=>e.target.style.borderColor="rgba(196,149,106,.25)"}>
          <option value="">{t("addrGovPh")}</option>
          {GOVS.map(g => <option key={g} value={g}>{g}</option>)}
        </select>
      </div>
      {inp("landmark", t("addrLandmark"), t("addrLandmarkPh"))}
      {/* Address type */}
      <div style={{ marginBottom:14 }}>
        <label style={{ display:"block", fontFamily:C.fe, fontSize:10, letterSpacing:"0.16em", color:C.mu, marginBottom:8, textTransform:"uppercase" }}>{t("addrType")}</label>
        <div style={{ display:"flex", gap:10 }}>
          {[["home",t("addrHome")],["office",t("addrOffice")]].map(([v,lbl]) => (
            <label key={v} style={{ flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:8, cursor:"pointer", padding:"11px 0", border:`1.5px solid ${f.type===v?C.go:"rgba(196,149,106,.2)"}`, background:f.type===v?"rgba(196,149,106,.07)":C.wh, fontFamily:C.fb, fontSize:13 }}>
              <input type="radio" name="addrType" value={v} checked={f.type===v} onChange={() => set("type",v)} style={{ accentColor:C.go }} />
              {lbl}
            </label>
          ))}
        </div>
      </div>
      {/* Office holiday checkboxes */}
      {f.type === "office" && (
        <div style={{ marginBottom:14, background:C.cr2, padding:"12px 16px", borderInlineStart:`3px solid ${C.go}` }}>
          <div style={{ fontFamily:C.fb, fontSize:13, color:C.dk, marginBottom:10 }}>{t("addrOfficeHols")}</div>
          <div style={{ display:"flex", gap:20 }}>
            {[["officeFri",t("addrFriday")],["officeSat",t("addrSaturday")]].map(([k,lbl]) => (
              <label key={k} style={{ display:"flex", alignItems:"center", gap:6, cursor:"pointer", fontFamily:C.fb, fontSize:13, color:C.dk }}>
                <input type="checkbox" checked={f[k]} onChange={e=>set(k,e.target.checked)} style={{ accentColor:C.go }} /> {lbl}
              </label>
            ))}
          </div>
        </div>
      )}
      {/* GPS */}
      <div style={{ marginBottom:14 }}>
        <button onClick={getGPS} disabled={gpsStatus==="getting"}
          style={{ width:"100%", padding:"11px 0", border:`1.5px solid ${gpsStatus==="done"?C.go:"rgba(196,149,106,.35)"}`, background:gpsStatus==="done"?"rgba(196,149,106,.07)":"none", color:gpsStatus==="done"?C.go:C.mu, fontFamily:C.fb, fontSize:13, cursor:gpsStatus==="getting"?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
          {gpsStatus==="getting" ? t("addrGPSGetting") : gpsStatus==="done" ? t("addrGPSDone") : gpsStatus==="error" ? t("addrGPSError") : t("addrGPS")}
        </button>
        {f.lat && f.lng && (
          <div style={{ fontSize:11, fontFamily:C.fb, marginTop:6, textAlign:"center" }}>
            📍 {Number(f.lat).toFixed(5)}, {Number(f.lng).toFixed(5)}{" · "}
            <a href={`https://www.google.com/maps?q=${f.lat},${f.lng}`} target="_blank" rel="noreferrer"
              style={{ color:C.go, textDecoration:"none", fontWeight:500 }}>
              {lang==="ar" ? "فتح في خرائط Google" : "View on Google Maps"}
            </a>
          </div>
        )}
      </div>
      {/* Default checkbox */}
      <label style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", marginBottom:20, fontFamily:C.fb, fontSize:13, color:C.dk }}>
        <input type="checkbox" checked={f.isDefault} onChange={e=>set("isDefault",e.target.checked)} style={{ accentColor:C.go, width:16, height:16 }} />
        {t("addrDefault")}
      </label>
      <div style={{ display:"flex", gap:10 }}>
        {onCancel && <Btn onClick={onCancel} style={{ flex:1, padding:13, background:"none", border:"1.5px solid rgba(42,31,14,.3)", color:C.dk, fontFamily:C.fb, fontSize:13 }}>← {lang==="ar"?"رجوع":"Back"}</Btn>}
        <Btn onClick={save} disabled={saving} style={{ flex:2, padding:13, background:C.dk, color:C.cr, border:`1.5px solid ${C.dk}`, fontFamily:C.fb, fontSize:13, fontWeight:600, letterSpacing:"0.05em" }}>
          {saving ? t("addrSaving") : (submitLabel || t("addrSave"))}
        </Btn>
      </div>
    </div>
  );
}

// ─── My Addresses Page ─────────────────────────────────────────────────────────
function MyAddresses({ go }) {
  const { user } = useAuth();
  const { t, dir } = useLang();
  const mob = useMob();
  const [addresses, setAddresses] = useState([]);
  const [editAddr, setEditAddr] = useState(null);
  const [loading, setLoading] = useState(true);

  // ─ ALL hooks run unconditionally before any conditional return ─────────────
  useEffect(() => {
    if (!user?.email) { go("#login"); return; }
    setLoading(true);
    fetch(`/api/addresses/${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setAddresses(data); setLoading(false); })
      .catch(() => {
        try { setAddresses(JSON.parse(localStorage.getItem(`nawra_addresses_${user.email}`) || "[]")); } catch {}
        setLoading(false);
      });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // Safe early return — all hooks above have already run
  if (!user) return null;

  const reload = () => {
    setLoading(true);
    fetch(`/api/addresses/${encodeURIComponent(user.email)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then(data => { setAddresses(data); setLoading(false); })
      .catch(() => {
        try { setAddresses(JSON.parse(localStorage.getItem(`nawra_addresses_${user.email}`) || "[]")); } catch {}
        setLoading(false);
      });
  };

  const remove = async (id) => {
    if (!window.confirm(t("addrConfirmDel"))) return;
    try { await fetch(`/api/addresses/${id}`, { method:"DELETE" }); } catch {}
    const updated = addresses.filter(a => a.id !== id);
    setAddresses(updated);
    localStorage.setItem(`nawra_addresses_${user.email}`, JSON.stringify(updated));
  };

  const setDef = async (id) => {
    try {
      await fetch(`/api/addresses/${id}/default`, { method:"PATCH",
        headers:{"Content-Type":"application/json"}, body:JSON.stringify({ userId:user.email }) });
    } catch {}
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === id }));
    setAddresses(updated);
    localStorage.setItem(`nawra_addresses_${user.email}`, JSON.stringify(updated));
  };

  if (editAddr) return (
    <div style={{ direction:dir, minHeight:"80vh" }}>
      <div style={{ background:C.cr2, padding:mob?"28px 20px":"40px 52px", borderBottom:"1px solid rgba(196,149,106,.1)" }}>
        <h1 style={{ fontFamily:C.fa, fontSize:mob?22:30, fontWeight:600, color:C.dk }}>
          {editAddr === "new" ? t("addrAddNew") : t("addrEdit")}
        </h1>
      </div>
      <div style={{ maxWidth:600, margin:"0 auto", padding:mob?"20px":"40px 52px" }}>
        <AddressForm
          initial={editAddr === "new" ? {} : editAddr}
          userId={user.email}
          onSave={() => { setEditAddr(null); reload(); }}
          onCancel={() => setEditAddr(null)}
        />
      </div>
    </div>
  );

  return (
    <div style={{ direction:dir, minHeight:"80vh" }}>
      <div style={{ background:C.cr2, padding:mob?"28px 20px":"40px 52px", borderBottom:"1px solid rgba(196,149,106,.1)" }}>
        <div style={{ fontFamily:C.fe, fontSize:11, letterSpacing:"0.22em", color:C.go, textTransform:"uppercase", fontStyle:"italic", marginBottom:8 }}>My Account</div>
        <h1 style={{ fontFamily:C.fa, fontSize:mob?24:32, fontWeight:600, color:C.dk }}>{t("addrPageTitle")}</h1>
        <p style={{ color:C.mu, fontFamily:C.fb, fontSize:13, marginTop:4 }}>{t("addrPageSub")}</p>
      </div>
      <div style={{ maxWidth:1100, margin:"0 auto", padding:mob?"20px":"32px 52px" }}>
        {loading ? (
          <div style={{ textAlign:"center", padding:60, color:C.mu, fontFamily:C.fb }}>...</div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:mob?"1fr":"repeat(auto-fill,minmax(300px,1fr))", gap:16 }}>
            <div onClick={() => setEditAddr("new")}
              style={{ border:"2px dashed rgba(196,149,106,.35)", padding:32, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:12, cursor:"pointer", minHeight:180, transition:"border-color .2s" }}
              onMouseEnter={e=>e.currentTarget.style.borderColor=C.go}
              onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(196,149,106,.35)"}>
              <div style={{ fontSize:32, color:C.go }}>＋</div>
              <div style={{ fontFamily:C.fa, fontSize:15, color:C.go, fontWeight:600 }}>{t("addrAddNew")}</div>
            </div>
            {addresses.map(addr => (
              <div key={addr.id} style={{ background:C.wh, border:`1.5px solid ${addr.isDefault?C.go:"rgba(196,149,106,.15)"}`, padding:"20px 22px", position:"relative" }}>
                {addr.isDefault && (
                  <span style={{ position:"absolute", top:12, insetInlineEnd:12, background:C.go, color:"#fff", fontSize:9, padding:"3px 10px", fontFamily:C.fb, letterSpacing:"0.06em" }}>{t("addrDefaultBadge")}</span>
                )}
                <div style={{ fontFamily:C.fa, fontSize:15, fontWeight:600, color:C.dk, marginBottom:8 }}>{addr.fullName}</div>
                <div style={{ fontFamily:C.fb, fontSize:13, color:C.wa, lineHeight:1.8 }}>
                  {addr.street}{addr.building?`، ${addr.building}`:""}<br/>
                  {addr.district?`${addr.district}، `:""}{addr.city?`${addr.city}، `:""}{addr.governorate}<br/>
                  {addr.landmark && <span style={{ color:C.mu }}>📍 {addr.landmark}<br/></span>}
                  🇪🇬 +20 {addr.phone}
                  {addr.lat && addr.lng && (
                    <a href={`https://www.google.com/maps?q=${addr.lat},${addr.lng}`} target="_blank" rel="noreferrer"
                      style={{ display:"block", fontSize:11, color:C.go, marginTop:3, textDecoration:"none" }}>
                      🗺 {Number(addr.lat).toFixed(4)}, {Number(addr.lng).toFixed(4)}
                    </a>
                  )}
                </div>
                {addr.type === "office" && (addr.officeFri || addr.officeSat) && (
                  <div style={{ fontSize:11, color:C.mu, fontFamily:C.fb, marginTop:4 }}>
                    🏢 {[addr.officeFri && t("addrFriday"), addr.officeSat && t("addrSaturday")].filter(Boolean).join(" · ")}
                  </div>
                )}
                <div style={{ display:"flex", gap:12, marginTop:14, paddingTop:12, borderTop:"1px solid rgba(196,149,106,.1)" }}>
                  <span onClick={() => setEditAddr(addr)} style={{ cursor:"pointer", color:C.go, fontFamily:C.fb, fontSize:12, fontWeight:500 }}>{t("addrEdit")}</span>
                  <span style={{ color:"rgba(196,149,106,.3)" }}>|</span>
                  <span onClick={() => remove(addr.id)} style={{ cursor:"pointer", color:"#EF4444", fontFamily:C.fb, fontSize:12 }}>{t("addrRemove")}</span>
                  {!addr.isDefault && <>
                    <span style={{ color:"rgba(196,149,106,.3)" }}>|</span>
                    <span onClick={() => setDef(addr.id)} style={{ cursor:"pointer", color:C.dk, fontFamily:C.fb, fontSize:12 }}>{t("addrSetDefault")}</span>
                  </>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App ──────────────────────────────────────────────────────────────────────
// ─── My Orders Page ───────────────────────────────────────────────────────────
function MyOrders({ go }) {
  const { user } = useAuth();
  const { t, dir } = useLang();
  const mob = useMob();
  const px = mob ? "16px" : "56px";
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // ─ ALL hooks run unconditionally before any conditional return ─────────────
  useEffect(() => {
    if (!user?.email) { go("#login"); return; }
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch(`/api/orders?userId=${encodeURIComponent(user.email)}`);
        if (res.ok && !cancelled) { setOrders(await res.json()); setOrdersLoading(false); return; }
      } catch {}
      if (!cancelled) {
        try {
          const all = JSON.parse(localStorage.getItem("nawra_orders") || "[]");
          setOrders(all.filter(o => o.userEmail === user.email));
        } catch {}
        setOrdersLoading(false);
      }
    };
    load();
    // Same-tab: order just placed
    const onNew = () => { if (!cancelled) load(); };
    window.addEventListener("nawra-new-order", onNew);
    // Cross-tab: another tab/window saved to localStorage (covers admin
    // status updates on the same machine via updateOrderStatus mirroring)
    const onStorage = (e) => { if (e.key === "nawra_orders" && !cancelled) load(); };
    window.addEventListener("storage", onStorage);
    // Cross-device: poll the API every 15s so the admin changing status from
    // another machine appears here without a page refresh
    const interval = setInterval(() => { if (!cancelled) load(); }, 15000);
    return () => {
      cancelled = true;
      window.removeEventListener("nawra-new-order", onNew);
      window.removeEventListener("storage", onStorage);
      clearInterval(interval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.email]);

  // Safe early return — all hooks above have already run
  if (!user) return null;

  const statusColor = (s) => s === "مكتمل" ? { bg:"#D1FAE5", c:"#065F46" } : s === "ملغي" ? { bg:"#FEE2E2", c:"#DC2626" } : { bg:"#FEF3C7", c:"#92400E" };

  return (
    <div style={{ direction: dir, minHeight: "80vh", background: C.cr }}>
      <div style={{ background: C.cr2, padding: mob ? "36px 20px" : "52px 52px", textAlign: "center", borderBottom: "1px solid rgba(196,149,106,.1)" }}>
        <div style={{ fontFamily: C.fe, fontSize: 11, letterSpacing: "0.22em", color: C.go, textTransform: "uppercase", fontStyle: "italic", marginBottom: 10 }}>Account</div>
        <h1 style={{ fontFamily: C.fa, fontSize: mob ? 26 : 38, fontWeight: 600, color: C.dk, marginBottom: 10 }}>{t("myOrdersTitle")}</h1>
        <div style={{ width: 48, height: 1, background: C.go, margin: "0 auto 12px" }} />
        <p style={{ color: C.wa, fontFamily: C.fb, fontSize: 14 }}>{t("myOrdersHello")} <strong style={{ color: C.dk }}>{user.name}</strong> — {t("myOrdersSub")}</p>
      </div>
      <div style={{ maxWidth: 860, margin: "0 auto", padding: mob ? "20px 16px" : "32px 52px" }}>
        {ordersLoading ? (
          <div style={{ textAlign:"center", padding:60, color:C.mu, fontFamily:C.fb }}>...</div>
        ) : orders.length === 0 ? (
          <div style={{ background: C.wh, padding: "52px 28px", textAlign: "center", border: "1px solid rgba(196,149,106,.13)", boxShadow: "0 4px 20px rgba(196,149,106,.08)" }}>
            <div style={{ fontSize: 52, marginBottom: 16 }}>🛍️</div>
            <p style={{ fontFamily: C.fa, fontSize: 22, fontWeight: 600, color: C.dk, marginBottom: 10 }}>{t("myOrdersEmpty")}</p>
            <p style={{ color: C.wa, fontFamily: C.fb, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>{t("myOrdersEmptySub")}</p>
            <Btn onClick={() => go("#products")} style={{ background: C.dk, color: C.cr, border: `1.5px solid ${C.dk}`, padding: "13px 36px", fontFamily: C.fb, fontSize: 13, fontWeight: 600, letterSpacing: "0.06em" }}>{t("myOrdersShop")}</Btn>
          </div>
        ) : orders.map(o => {
          const sc = statusColor(o.status);
          return (
            <div key={o.id} style={{ background: C.wh, padding: mob ? "16px" : "22px 24px", marginBottom: 14, border: "1px solid rgba(196,149,106,.13)", boxShadow: "0 2px 12px rgba(196,149,106,.07)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontFamily: C.fe, fontSize: 10, letterSpacing: "0.14em", color: C.go, textTransform: "uppercase", marginBottom: 3 }}>{t("myOrdersNum")} {o.id}</div>
                  <div style={{ fontSize: 12.5, color: C.mu, fontFamily: C.fb, marginTop: 2 }}>{o.date} · {o.city}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <span style={{ fontFamily: C.fb, fontSize: 11, padding: "3px 12px", background: sc.bg, color: sc.c, borderRadius: 10 }}>{o.status}</span>
                  <span style={{ fontFamily: C.fe, fontSize: 20, fontWeight: 500, color: C.dk }}>{o.total} <span style={{ fontFamily: C.fb, fontSize: 12, color: C.mu }}>{t("egp")}</span></span>
                </div>
              </div>

              {/* Visual 4-step timeline — reflects admin status updates in real time */}
              <OrderTimeline status={o.status} />

              <div style={{ borderTop: "1px solid rgba(196,149,106,.1)", paddingTop: 12, marginTop: 12 }}>
                {(o.items || []).map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: C.dk, fontFamily: C.fb, marginBottom: 5 }}>
                    <span style={{ color: C.wa }}>{item.name} × {item.qty}</span>
                    <span style={{ fontFamily: C.fe, fontSize: 14 }}>{item.price * item.qty} {t("egp")}</span>
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
              {/* Fonts loaded in index.html: Noto Serif Arabic, Cairo, Cormorant Garamond */}
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
      case "#myorders":  return <MyOrders go={go} />;
      case "#addresses": return <MyAddresses go={go} />;
      default:           return <Home go={go} allProds={(prods&&prods.length)?prods:PRODS} />;
    }
  };

  return (
    <div dir={dir} style={{ fontFamily: C.fb, background: C.cr, minHeight: "100vh", overflowX: "hidden" }}>
      {!isAdmin && <Nav r={route} go={go} openCart={() => setCartOpen(true)} user={user} onLogout={logout} />}
      {!isAdmin && <CartSide open={cartOpen} close={() => setCartOpen(false)} go={go} />}
      <main>{page()}</main>
      {!isAdmin && <Footer go={go} />}
      {!isAdmin && <WAFloat />}
    </div>
  );
}
