import React, { useState, useEffect, useRef, useCallback, useMemo, createContext, useContext } from "react";
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
// Super-admin login goes through the backend (/api/auth/login → scrypt-hashed
// password). Customer accounts still live in localStorage. The legacy
// `nawra_admin` shortcut was removed — `nawraskincare@gmail.com` (or whichever
// email is configured in admin_credentials) is the only admin login now.
const AuthCtx = createContext(null);
const useAuth = () => useContext(AuthCtx);

// Heuristic: anything that looks like the team-config role keys (or the
// historical "admin") gets admin access. Customer accounts use "user".
const isAdminRole = (role) => role && role !== "user";

function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nawra_user")) || null; } catch { return null; }
  });
  const login = async (u, p) => {
    // 1) Try the API as the super admin (only nawraskincare@gmail.com etc.)
    try {
      const r = await fetch("/api/auth/login", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: u, password: p })
      });
      if (r.ok) {
        const data = await r.json();
        // Determine the actual role for this user from the team settings if
        // it's not the super admin. Falls back to "super_admin" when the
        // login endpoint returns it.
        let role = data.role || "super_admin";
        if (role !== "super_admin") {
          try {
            const ts = await fetch("/api/settings/team");
            const team = ts.ok ? (await ts.json()).value : null;
            const member = team && team.members && team.members.find(m => (m.email||"").toLowerCase() === (data.email||"").toLowerCase());
            if (member) role = member.role;
          } catch {}
        }
        const admin = { name: data.name || "Admin", email: data.email, role };
        localStorage.setItem("nawra_user", JSON.stringify(admin));
        setUser(admin);
        return { ok: true };
      }
    } catch {}
    // 2) Fall through to local customer login
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

  // ── Shipping policy (fetched live from /api/settings/shipping) ─────────────
  // Cached in localStorage so the cart UI doesn't flash before the network
  // resolves. Refetched on every page load + when the admin saves changes
  // (admin dispatches the `nawra-shipping-saved` event below).
  const [shipCfg, setShipCfg] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nawra_shipping_cfg")) || null; }
    catch { return null; }
  });
  const reloadShipCfg = async () => {
    try {
      const r = await fetch("/api/settings/shipping");
      if (!r.ok) return;
      const { value } = await r.json();
      if (value && typeof value === "object") {
        setShipCfg(value);
        try { localStorage.setItem("nawra_shipping_cfg", JSON.stringify(value)); } catch {}
      }
    } catch {}
  };
  useEffect(() => {
    reloadShipCfg();
    const h = () => reloadShipCfg();
    window.addEventListener("nawra-shipping-saved", h);
    return () => window.removeEventListener("nawra-shipping-saved", h);
  }, []);

  const add = p => setCart(prev => { const ex = prev.find(i => i.id === p.id); return ex ? prev.map(i => i.id === p.id ? { ...i, qty: i.qty + 1 } : i) : [...prev, { ...p, qty: 1 }]; });
  const rem = id => setCart(prev => prev.filter(i => i.id !== id));
  const upd = (id, q) => q <= 0 ? rem(id) : setCart(prev => prev.map(i => i.id === id ? { ...i, qty: q } : i));
  const clr = () => setCart([]);
  const tot = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const cnt = cart.reduce((s, i) => s + i.qty, 0);

  // Resolve free-shipping threshold + flat ship fee from the live settings,
  // falling back to historical defaults if the backend never had a record.
  const freeShipMin   = (shipCfg && shipCfg.free_shipping_enabled && Number(shipCfg.free_shipping_min_order)) || 500;
  const defaultZoneFee = (() => {
    const z = shipCfg && Array.isArray(shipCfg.zones) ? shipCfg.zones[0] : null;
    return z ? Number(z.price) || 50 : 50;
  })();
  const ship = tot > 0 && tot < freeShipMin ? defaultZoneFee : 0;
  return <Ctx.Provider value={{ cart, add, rem, upd, clr, tot, cnt, ship, freeShipMin, defaultZoneFee, shipCfg }}>{children}</Ctx.Provider>;
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
              {isAdminRole(user.role) && <Btn onClick={()=>go("#admin")} style={{background:C.go,color:"white",padding:"5px 12px",fontSize:11,letterSpacing:"0.06em",fontFamily:C.fb,border:"none"}}>Admin</Btn>}
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
  const { cart, rem, upd, tot, ship, clr, freeShipMin } = useCart();
  const { user } = useAuth();
  const { t, lang, dir } = useLang();
  const mob = useMob();
  const [step, setStep] = useState(0);
  const [f, setF] = useState({ n: "", p: "", city: "", addr: "" });
  const [savedAddrs, setSavedAddrs] = useState([]);
  const [selAddrId, setSelAddrId] = useState(null);
  const [showNewAddrInCart, setShowNewAddrInCart] = useState(false);
  const [customerNotes, setCustomerNotes] = useState("");
  // Live shipping quote — queries /api/shipping/calculate once the user has
  // picked an address (so we know the governorate → zone). Until then we
  // fall back to the flat `ship` that CartProvider computes from settings.
  const [liveShip, setLiveShip] = useState(null); // null = not loaded; object = { fee, free, zone, ... }
  const W = mob ? "100vw" : "390px";

  // Resolve the destination governorate from whichever input we have.
  const selAddr = savedAddrs.find(a => a.id === selAddrId) || null;
  const destGovernorate = selAddr ? selAddr.governorate : (f.city || "");

  // Fetch live shipping fee whenever governorate or cart total changes.
  // Falls back silently to the legacy `ship` value if the API errors.
  useEffect(() => {
    if (!destGovernorate || tot <= 0) { setLiveShip(null); return; }
    let cancelled = false;
    const qs = new URLSearchParams({ governorate: destGovernorate, total: String(tot) });
    fetch(`/api/shipping/calculate?${qs}`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (!cancelled && d) setLiveShip(d); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [destGovernorate, tot]);

  // The fee actually shown to the customer + recorded on the order. Prefer
  // the live quote when we have one; fall back to the CartProvider flat fee.
  const effShip = liveShip ? (Number(liveShip.fee) || 0) : ship;
  const effFreeNote = liveShip ? !!liveShip.free : (effShip === 0);
  const effZoneName = liveShip && liveShip.zone ? liveShip.zone.name_ar : null;
  const effEtaDays  = liveShip && liveShip.zone ? `${liveShip.zone.min_days}-${liveShip.zone.max_days}` : null;

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
      items: cart.map(i => ({
        id: i.id,
        name: i.nameAr || i.nameEn || i.name || "",
        qty: i.qty, price: i.price,
        img: i.img || null,
      })),
      total: tot + effShip, status: "جديد",
      // New fields — recorded so admin Order Details can show the breakdown,
      // payment method, and any customer note. Defaults: cash-on-delivery, unpaid.
      subtotal: tot,
      shipping_cost: effShip,
      // Zone label captured for analytics + the shipments page filter.
      shipping_zone_name: effZoneName,
      discount_amount: 0,
      coupon_code: null,
      payment_method: "cash",
      payment_status: "unpaid",
      customer_notes: (customerNotes || "").trim() || null,
    };
    try {
      const res = await fetch("/api/orders", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(order) });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      console.log("[Nawra] Order saved to API:", order.id);
    } catch (e) { console.warn("[Nawra] API fallback:", e.message); }
    const prev = JSON.parse(localStorage.getItem("nawra_orders") || "[]");
    localStorage.setItem("nawra_orders", JSON.stringify([order, ...prev]));
    window.dispatchEvent(new CustomEvent("nawra-new-order", { detail: order }));
    clr(); setCustomerNotes(""); setStep(2);
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
                <span>{tot+effShip} {t("egp")}</span>
              </div>
            </div>

            {/* Customer notes (optional) — shown to the admin in Order Details */}
            <div style={{ marginBottom:16 }}>
              <label style={{ display:"block", fontFamily:C.fe, fontSize:10, letterSpacing:"0.2em", color:C.mu, marginBottom:5, textTransform:"uppercase" }}>
                {lang === "ar" ? "ملاحظات للطلب (اختياري)" : "Order notes (optional)"}
              </label>
              <textarea rows={2} value={customerNotes} onChange={e => setCustomerNotes(e.target.value)}
                placeholder={lang === "ar" ? "مثلاً: اتصلوا قبل الوصول..." : "e.g. Please call before arrival..."}
                style={{ width:"100%", padding:"10px 12px", border:"1px solid rgba(196,149,106,.25)", background:C.wh, fontFamily:C.fb, fontSize:13, outline:"none", boxSizing:"border-box", resize:"vertical", minHeight:54, direction:dir }} />
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
                {effShip > 0 && !effFreeNote && (
                  <div style={{ fontSize: 11, color: C.mu, marginBottom: 6, fontFamily: C.fb }}>
                    + {effShip} {t("egp")}
                    {effZoneName ? ` · ${effZoneName}` : ""}
                    {effEtaDays ? ` · ${effEtaDays} يوم` : ""}
                    {!liveShip && <> | {Math.max(0, freeShipMin - tot)} {t("cartShipAdd")}</>}
                  </div>
                )}
                {effFreeNote && <div style={{ fontSize: 11, color: "#2E6B3E", marginBottom: 6, fontFamily: C.fb }}>{t("cartShipFree")}{effZoneName ? ` · ${effZoneName}` : ""}</div>}
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
    (async () => {
      if (tab === "login") {
        const r = await login(f.email, f.pass);
        setLoading(false);
        // Admin accounts land on the dashboard; customers go home.
        if (r.ok) {
          try {
            const u = JSON.parse(localStorage.getItem("nawra_user") || "{}");
            go(u.role && u.role !== "user" ? "#admin" : "#home");
          } catch { go("#home"); }
        } else setErr(r.err);
      } else {
        if (!f.name || !f.email || !f.pass)  { setLoading(false); return setErr(t("loginErrFields")); }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) { setLoading(false); return setErr(t("loginErrEmail")); }
        if (f.pass !== f.pass2) { setLoading(false); return setErr(t("loginErrPass")); }
        const r = register(f.name, f.email, f.pass);
        setLoading(false);
        if (r.ok) go("#home"); else setErr(r.err);
      }
    })();
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
    "plus":          <><path d="M12 5v14"/><path d="M5 12h14"/></>,
    "receipt":       <><path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16l-3-2-3 2-3-2-3 2-2-2z"/><path d="M9 7h6M9 11h6M9 15h4"/></>,
    "report-money":  <><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M9 9h6M12 9v8"/><path d="M9 13c0 1.5 1.5 2 3 2s3-.5 3-2-1.5-2-3-2-3-.5-3-2 1.5-2 3-2 3 .5 3 2"/></>,
    "trash":         <><path d="M4 7h16"/><path d="M10 11v6M14 11v6"/><path d="M5 7l1 12a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-12"/><path d="M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3"/></>,
    "pencil":        <><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z"/></>
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

  // Overview date range — controls the bar chart + the "export CSV" scope
  // ranges: today | 7d | 30d | custom
  const [ovRange, setOvRange] = useState("7d");
  const [ovFrom, setOvFrom] = useState("");
  const [ovTo, setOvTo]     = useState("");

  // ── DB-backed products (separate from the legacy useProds storefront cache) ──
  // Categories now come from /api/categories so the admin can add new ones.
  const FALLBACK_CATEGORIES = ["سيروم","غسول","مرطب","واقي شمس"];
  const [categories, setCategories] = useState([]);
  const PRODUCT_CATEGORIES = categories.length ? categories.map(c => c.name) : FALLBACK_CATEGORIES;
  const refreshCategories = async () => {
    try {
      const r = await fetch("/api/categories");
      if (r.ok) setCategories(await r.json());
    } catch {}
  };
  useEffect(() => { refreshCategories(); }, []);
  const addCategory = async (name) => {
    const n = String(name||"").trim();
    if (!n) return null;
    try {
      const r = await fetch("/api/categories", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name: n })
      });
      if (r.ok) { await refreshCategories(); return n; }
    } catch {}
    return null;
  };
  // Default seeded categories cannot be deleted. Two prefixes are honoured
  // because earlier builds used `cat_seed_*` and the rename to `cat_default_*`
  // came later — existing DBs still have the old ids.
  const isDefaultCategory = (cat) => {
    if (!cat || !cat.id) return false;
    const id = String(cat.id);
    return id.startsWith("cat_default_") || id.startsWith("cat_seed_");
  };
  const deleteCategory = async (id, name) => {
    if (!confirm(`متأكد من حذف الفئة "${name}"؟`)) return false;
    try {
      const r = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (r.ok) { await refreshCategories(); return true; }
    } catch {}
    return false;
  };
  const blankProdForm = () => ({
    name: "", description: "", category: PRODUCT_CATEGORIES[0], brand: "",
    ingredients: "", images: [], price: "", price_before: "", cost: "",
    stock: "0", alert_threshold: "5", status: "published",
    in_stock: true, featured: false,
    seo_title: "", seo_description: "", tags: [], tagInput: ""
  });
  const [pForm, setPForm] = useState(blankProdForm);
  const [pSaving, setPSaving] = useState(false);
  const [pSaveMsg, setPSaveMsg] = useState(null); // { kind:"ok"|"err", text }
  const [dbProducts, setDbProducts] = useState([]);
  const [invSearch, setInvSearch] = useState("");
  const [invStatusFil, setInvStatusFil] = useState("all"); // all|available|low|out
  const [invCatFil, setInvCatFil] = useState("all");
  const [invEditing, setInvEditing] = useState(null); // product id currently saving
  const [invImporting, setInvImporting] = useState(false);
  const [invNotice, setInvNotice]   = useState(null); // one-time auto-import banner
  const importedRef = useRef(false); // make sure auto-import runs at most once per session

  // Inline reason-capture modal for every stock reduction.
  // Shape: { product, fromQty, toQty, reason, onConfirm: () => void }
  const [reduceAsk, setReduceAsk] = useState(null);

  // ── Movement-based inventory state ─────────────────────────────────────────
  const [invSubTab, setInvSubTab]   = useState("current"); // current | history | alerts
  const [movements, setMovements]   = useState([]);
  const [movementFilter, setMovementFilter] = useState({ product_id: "", type: "" });
  const [stockInOpen,    setStockInOpen]    = useState(false);
  const [stockOutOpen,   setStockOutOpen]   = useState(false);
  const [stockTakeOpen,  setStockTakeOpen]  = useState(false);
  const [stockInForm,    setStockInForm]    = useState({ product_id:"", quantity:"", unit_cost:"", supplier:"", notes:"" });
  const [stockOutForm,   setStockOutForm]   = useState({ product_id:"", quantity:"", reason:"تالف", notes:"" });
  const [stockTakeRows,  setStockTakeRows]  = useState({}); // { [product_id]: countedString }
  const [invBusy, setInvBusy] = useState(false);

  const refreshMovements = async (opts = {}) => {
    try {
      const qs = new URLSearchParams();
      if (opts.product_id || movementFilter.product_id) qs.set("product_id", opts.product_id || movementFilter.product_id);
      if (opts.type       || movementFilter.type)       qs.set("type",       opts.type       || movementFilter.type);
      const r = await fetch(`/api/stock-movements?${qs.toString()}`);
      if (r.ok) setMovements(await r.json());
    } catch {}
  };
  useEffect(() => {
    if (tab === "inventory") {
      refreshProducts();
      if (invSubTab === "history") refreshMovements();
    }
  // eslint-disable-next-line
  }, [tab, invSubTab, movementFilter.product_id, movementFilter.type]);

  const submitStockIn = async () => {
    if (!stockInForm.product_id || !stockInForm.quantity) return;
    setInvBusy(true);
    try {
      const r = await fetch("/api/stock-movements/in", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          product_id: stockInForm.product_id,
          quantity:   Number(stockInForm.quantity) || 0,
          unit_cost:  Number(stockInForm.unit_cost) || 0,
          supplier:   stockInForm.supplier || null,
          notes:      stockInForm.notes || null,
          user_id:    (authUser && authUser.email) || activeRole,
          user_name:  (authUser && authUser.name)  || null,
        })
      });
      if (r.ok) {
        setStockInOpen(false);
        setStockInForm({ product_id:"", quantity:"", unit_cost:"", supplier:"", notes:"" });
        refreshProducts(); refreshMovements();
        setSavedToast("تم تسجيل الوارد وتحديث المخزون");
        setTimeout(()=>setSavedToast(""), 2500);
      }
    } catch {}
    setInvBusy(false);
  };

  const submitStockOut = async () => {
    if (!stockOutForm.product_id || !stockOutForm.quantity) return;
    setInvBusy(true);
    try {
      const r = await fetch("/api/stock-movements/out", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          product_id: stockOutForm.product_id,
          quantity:   Number(stockOutForm.quantity) || 0,
          reason:     stockOutForm.reason,
          notes:      stockOutForm.notes || null,
          user_id:    (authUser && authUser.email) || activeRole,
          user_name:  (authUser && authUser.name)  || null,
        })
      });
      if (r.ok) {
        setStockOutOpen(false);
        setStockOutForm({ product_id:"", quantity:"", reason:"تالف", notes:"" });
        refreshApprovals(); refreshMessages();
        setSavedToast("تم إرسال طلب الصرف لـ Super Admin للموافقة");
        setTimeout(()=>setSavedToast(""), 3000);
      } else {
        const err = await r.json().catch(()=>({}));
        alert(err.error || "فشل إرسال الطلب");
      }
    } catch {}
    setInvBusy(false);
  };

  const submitStockTake = async () => {
    const counts = Object.entries(stockTakeRows)
      .map(([product_id, counted]) => ({ product_id, counted: Number(counted) || 0 }))
      .filter(c => Number.isFinite(c.counted));
    if (!counts.length) return;
    setInvBusy(true);
    try {
      const r = await fetch("/api/stock-movements/stock-take", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          counts,
          reason: "تعديل جرد",
          user_id:   (authUser && authUser.email) || activeRole,
          user_name: (authUser && authUser.name)  || null,
        })
      });
      if (r.ok) {
        const data = await r.json();
        setStockTakeOpen(false);
        setStockTakeRows({});
        refreshProducts(); refreshMovements();
        setSavedToast(`تم تطبيق الجرد على ${data.applied} منتج`);
        setTimeout(()=>setSavedToast(""), 3000);
      }
    } catch {}
    setInvBusy(false);
  };

  // ── Active role ────────────────────────────────────────────────────────────
  // Derived strictly from the logged-in user (set by AuthProvider after the
  // /api/auth/login round-trip). No client-side switcher — the role on the
  // user object dictates what the dashboard exposes.
  const { user: authUser } = useAuth() || {};
  const activeRole = (authUser && authUser.role) || "super_admin";
  // Legacy localStorage sessions stored role as "admin"; treat them as super
  // until they log out & back in (which will fetch the proper role).
  const isSuper = activeRole === "super_admin" || activeRole === "admin";
  // Per ROLES spec: super admin and "مشرف طلبات" can update order status / cancel
  const canManageOrders   = isSuper || activeRole === "orders_admin";
  // Products: super_admin and "مشرف مخزون" can edit. Inventory-only admins
  // can only edit stock fields — UI disables the rest.
  const canManageProducts = isSuper || activeRole === "inventory_admin";
  const canEditAllProductFields = isSuper; // inventory_admin is stock-only
  const canSeeCost = isSuper;              // cost field is super-only

  // ── Approvals (product delete / stock reduce / etc.) + Notifications ───────
  const [approvals, setApprovals] = useState([]);
  const [notiSeenAt, setNotiSeenAt] = useState(() => Number(localStorage.getItem("nawra_noti_seen_at")) || (Date.now() - 24*3600*1000));
  const [editProdModal, setEditProdModal] = useState(null); // inventory deep-edit modal state

  const refreshApprovals = async () => {
    try { const r = await fetch("/api/approvals?status=pending"); if (r.ok) setApprovals(await r.json()); } catch {}
  };

  // ── Messages inbox ─────────────────────────────────────────────────────────
  const [messages, setMessages] = useState([]);
  // Local-only set of message ids that have been actioned (approved/rejected)
  // and should disappear from the inbox immediately. We don't rely on the
  // server removing them — the inbox is the actor's queue, not the audit log.
  const [removedMsgIds, setRemovedMsgIds] = useState({}); // { [id]: 'fading' | 'gone' }
  const [inboxOpen, setInboxOpen] = useState(false);
  const [rejectionFor, setRejectionFor] = useState(null); // { msgId, approvalId, label, note }
  // Budget-overrun "exception reason" modal — opened from the inbox when a
  // super admin chooses to approve an expense that busts its category's
  // monthly budget. Requires a >=5 char audit-trail reason.
  const [budgetOverrideFor, setBudgetOverrideFor] = useState(null); // { msgId, expenseId, label, note }
  const myInboxAddr = (authUser && authUser.email) || activeRole;

  // Visible inbox = server messages minus anything we've optimistically removed.
  // 'fading' rows stay rendered for ~200ms so the animation plays; 'gone' rows
  // are filtered out completely.
  const visibleMessages = messages.filter(m => removedMsgIds[m.id] !== 'gone');
  const unreadCount = visibleMessages.filter(m => !m.read_at && removedMsgIds[m.id] !== 'fading').length;

  const refreshMessages = async () => {
    try {
      const r = await fetch(`/api/messages?to=${encodeURIComponent(myInboxAddr)}`);
      if (r.ok) {
        const fresh = await r.json();
        setMessages(fresh);
        // Drop any "gone" entries the server has now actually dropped on its
        // side too, so the map doesn't grow unbounded.
        setRemovedMsgIds(prev => {
          const freshIds = new Set(fresh.map(m => m.id));
          const next = {};
          Object.keys(prev).forEach(id => { if (freshIds.has(id)) next[id] = prev[id]; });
          return next;
        });
      }
    } catch {}
  };
  // Poll the inbox every 10 seconds — works on every admin tab.
  useEffect(() => {
    refreshMessages();
    const i = setInterval(refreshMessages, 10000);
    return () => clearInterval(i);
  // eslint-disable-next-line
  }, [myInboxAddr]);

  const markMessageRead = async (id) => {
    setMessages(prev => prev.map(m => m.id === id && !m.read_at ? { ...m, read_at: new Date().toISOString() } : m));
    try { await fetch(`/api/messages/${id}/read`, { method:"PATCH" }); } catch {}
  };
  const markAllRead = async () => {
    setMessages(prev => prev.map(m => m.read_at ? m : { ...m, read_at: new Date().toISOString() }));
    try { await fetch(`/api/messages/read-all`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ to: myInboxAddr }) }); } catch {}
  };

  // Optimistically remove a message from the inbox (with fade-out), then call
  // the approval API. On failure, restore the row.
  const actionMessage = async (msgId, approvalId, status, note = "") => {
    // Phase 1: trigger fade — buttons disappear, opacity drops
    setRemovedMsgIds(prev => ({ ...prev, [msgId]: 'fading' }));
    // Mark read on the server in parallel (best-effort)
    fetch(`/api/messages/${msgId}/read`, { method:"PATCH" }).catch(()=>{});
    // Phase 2: after 200ms, fully hide
    setTimeout(() => {
      setRemovedMsgIds(prev => ({ ...prev, [msgId]: 'gone' }));
    }, 200);
    try {
      const r = await fetch(`/api/approvals/${approvalId}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ status, resolution_note: note })
      });
      if (!r.ok) throw new Error('approval failed');
      // success — refresh related stores so the user sees fresh data
      refreshApprovals(); refreshProducts({ allowImport: false }); refreshMessages();
      setSavedToast(status === 'approved' ? 'تمت الموافقة' : 'تم الرفض');
      setTimeout(()=>setSavedToast(''), 2000);
    } catch {
      // Rollback the optimistic removal
      setRemovedMsgIds(prev => {
        const next = { ...prev };
        delete next[msgId];
        return next;
      });
      alert('فشل تنفيذ الإجراء — تم إعادة الرسالة للصندوق');
    }
  };
  // Overview poller — every 10s — fans out to orders / users / products / approvals
  useEffect(() => {
    if (tab !== "overview") return;
    refreshApprovals();
    const i = setInterval(() => {
      refreshOrders(); loadUsers(); refreshProducts(); refreshApprovals();
    }, 10000);
    return () => clearInterval(i);
  // eslint-disable-next-line
  }, [tab]);

  const submitApproval = async (req) => {
    try {
      const r = await fetch("/api/approvals", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ requester: activeRole, ...req })
      });
      if (r.ok) {
        refreshApprovals();
        setSavedToast("تم إرسال الطلب للمراجعة من Super Admin");
        setTimeout(()=>setSavedToast(""), 2500);
      }
    } catch {}
  };
  // ── Expenses ────────────────────────────────────────────────────────────────
  const EXPENSE_CATEGORIES = [
    { key:"salaries",  l:"الرواتب",  color:"#534AB7" },
    { key:"marketing", l:"التسويق",  color:"#3B82F6" },
    { key:"packing",   l:"التغليف",  color:"#16A34A" },
    { key:"shipping",  l:"الشحن",    color:"#F97316" },
    { key:"overhead",  l:"تشغيلي",   color:"#EC4899" },
    { key:"general",   l:"عام",      color:"#6B7280" },
  ];
  const [expenses, setExpenses] = useState([]);
  const [expCatTab, setExpCatTab] = useState("all"); // "all" or category key
  const [expMonth, setExpMonth] = useState(() => String(new Date().getMonth()+1));
  const [expYear,  setExpYear]  = useState(() => String(new Date().getFullYear()));
  const [expDraft, setExpDraft] = useState({
    description:"", quantity:"1", unit_price:"",
    date: new Date().toISOString().slice(0,10),
    type:"variable", supplier_id:"", payment_method:"cash",
    receipt_path:"", is_recurring:false, notes:"",
    category_key:"",
    // payment_date: distinct from `date`. NULL/'' = unpaid; YYYY-MM-DD = paid on that date.
    payment_date:"",
  });
  const [expEditingId, setExpEditingId] = useState(null);
  const [expEditDraft, setExpEditDraft] = useState(null);

  // ── CRM-grade expense state ──────────────────────────────────────────────
  const [expCategories, setExpCategories] = useState([]); // DB-backed
  const [expSuppliers,  setExpSuppliers]  = useState([]);
  const [expBudgets,    setExpBudgets]    = useState([]);
  const [expSugg,       setExpSugg]       = useState([]);
  const [expSuggOpen,   setExpSuggOpen]   = useState(false);
  const [expTrend,      setExpTrend]      = useState([]);
  const [expFilters, setExpFilters] = useState({
    q:"", type:"all", payment_method:"all", supplier_id:"all", min:"", max:"", sort:"date",
  });
  const [expUploading,    setExpUploading]    = useState(false);
  const [expBudgetsOpen,  setExpBudgetsOpen]  = useState(false);

  const refreshExpenses = async () => {
    try {
      const r = await fetch(`/api/expenses?month=${expMonth}&year=${expYear}`);
      if (r.ok) {
        const d = await r.json();
        setExpenses(Array.isArray(d) ? d : []);
      }
    } catch {}
  };
  const refreshExpCategories = useCallback(async () => {
    try {
      const r = await fetch("/api/expense-categories?all=1");
      if (r.ok) { const d = await r.json(); setExpCategories(Array.isArray(d) ? d : []); }
    } catch {}
  }, []);
  const refreshExpSuppliers = useCallback(async () => {
    try {
      const r = await fetch("/api/suppliers");
      if (r.ok) { const d = await r.json(); setExpSuppliers(Array.isArray(d) ? d : []); }
    } catch {}
  }, []);
  const refreshExpBudgets = useCallback(async () => {
    try {
      const r = await fetch("/api/expense-budgets");
      if (r.ok) { const d = await r.json(); setExpBudgets(Array.isArray(d) ? d : []); }
    } catch {}
  }, []);
  const refreshExpSugg = useCallback(async () => {
    try {
      const r = await fetch("/api/expenses/recurring-suggestions");
      if (r.ok) {
        const d = await r.json();
        setExpSugg((d && Array.isArray(d.suggestions)) ? d.suggestions : []);
      }
    } catch {}
  }, []);
  const refreshExpTrend = useCallback(async () => {
    try {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 5, 1);
      const startISO = start.toISOString().slice(0, 10);
      const endISO   = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);
      const r = await fetch(`/api/expenses?from=${startISO}&to=${endISO}&status=approved`);
      if (!r.ok) return;
      const rows = await r.json();
      const buckets = [];
      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        buckets.push({
          ym: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`,
          label: d.toLocaleDateString("ar-EG", { month: "short" }),
          byCategory: {},
        });
      }
      (Array.isArray(rows) ? rows : []).forEach(e => {
        const ym = String(e.date || "").slice(0,7);
        const b = buckets.find(x => x.ym === ym);
        if (!b) return;
        const key = e.category || "general";
        b.byCategory[key] = (b.byCategory[key] || 0) + (Number(e.amount) || 0);
      });
      setExpTrend(buckets);
    } catch {}
  }, []);
  useEffect(() => {
    if (tab === "expenses") {
      refreshExpenses();
      refreshExpCategories();
      refreshExpSuppliers();
      refreshExpBudgets();
      refreshExpSugg();
      refreshExpTrend();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, expMonth, expYear]);

  // Resolve the category key the draft will use: when on "all" tab, take
  // the user-picked dropdown value; otherwise inherit from the active tab.
  const draftCategoryKey = () => expCatTab === "all" ? expDraft.category_key : expCatTab;

  const addExpense = async () => {
    if (!expDraft.description.trim()) return;
    const catKey = draftCategoryKey();
    if (!catKey) { setSavedToast("اختر فئة للمصروف"); setTimeout(()=>setSavedToast(""), 2200); return; }
    const qty  = Number(expDraft.quantity)   || 0;
    const unit = Number(expDraft.unit_price) || 0;
    try {
      const r = await fetch("/api/expenses", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: catKey,
          description: expDraft.description.trim(),
          quantity: qty, unit_price: unit, amount: qty * unit,
          date: expDraft.date,
          notes: expDraft.notes.trim() || null,
          type: expDraft.type || "variable",
          supplier_id: expDraft.supplier_id || null,
          // Free-text beneficiary name (server auto-creates a supplier row
          // when this is set and supplier_id isn't).
          beneficiary_name: expDraft._supplierTyped || null,
          beneficiary_type: expDraft.beneficiary_type || "supplier",
          payment_method: expDraft.payment_method || "cash",
          // payment_date — empty string maps to NULL (unpaid) on the server.
          payment_date: expDraft.payment_date || null,
          receipt_path: expDraft.receipt_path || null,
          is_recurring: !!expDraft.is_recurring,
          created_by: (authUser && authUser.email) || null,
          created_by_name: (authUser && authUser.name) || null,
          actor_role: activeRole,
        })
      });
      if (r.ok) {
        const result = await r.json().catch(()=>({}));
        if (result && result.status === "pending") {
          setSavedToast("تم إرسال المصروف للموافقة من Super Admin");
        } else {
          setSavedToast("تم حفظ المصروف");
        }
        setTimeout(()=>setSavedToast(""), 2400);
        setExpDraft({
          description:"", quantity:"1", unit_price:"",
          date: new Date().toISOString().slice(0,10),
          type:"variable", supplier_id:"", payment_method:"cash",
          receipt_path:"", is_recurring:false, notes:"",
          category_key: expCatTab === "all" ? "" : expCatTab,
          beneficiary_type: "supplier",
          payment_date:"",
        });
        refreshExpenses();
        refreshExpTrend();
        refreshExpSuppliers(); // pick up any newly-auto-created supplier
        refreshMessages();      // if it went pending, the inbox needs an update
      }
    } catch {}
  };
  const saveExpenseEdit = async () => {
    if (!expEditingId || !expEditDraft) return;
    const qty  = Number(expEditDraft.quantity)   || 0;
    const unit = Number(expEditDraft.unit_price) || 0;
    try {
      const r = await fetch(`/api/expenses/${expEditingId}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...expEditDraft,
          quantity: qty, unit_price: unit, amount: qty * unit,
          // Forward beneficiary so the server can find-or-create the supplier
          beneficiary_name: expEditDraft._beneficiaryTyped || null,
          beneficiary_type: expEditDraft.beneficiary_type || null,
        })
      });
      if (r.ok) {
        setExpEditingId(null); setExpEditDraft(null);
        setSavedToast("تم حفظ التعديلات"); setTimeout(()=>setSavedToast(""), 1800);
        refreshExpenses();
        refreshExpTrend();
        refreshExpSuppliers();
      }
    } catch {}
  };
  const deleteExpense = async (id) => {
    if (!window.confirm("حذف هذا المصروف نهائياً؟")) return;
    try { await fetch(`/api/expenses/${id}`, { method: "DELETE" }); refreshExpenses(); refreshExpTrend(); } catch {}
  };
  const approveExpense = async (id) => {
    try {
      await fetch(`/api/expenses/${id}/approve`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ actor: (authUser && authUser.email) || null }),
      });
      refreshExpenses(); refreshExpTrend();
      setSavedToast("تمت الموافقة على المصروف"); setTimeout(()=>setSavedToast(""), 1800);
    } catch {}
  };
  const rejectExpense = async (id) => {
    const reason = window.prompt("سبب الرفض (اختياري):") || null;
    try {
      await fetch(`/api/expenses/${id}/reject`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ actor: (authUser && authUser.email) || null, reason }),
      });
      refreshExpenses(); refreshExpTrend();
      setSavedToast("تم رفض المصروف"); setTimeout(()=>setSavedToast(""), 1800);
    } catch {}
  };
  // Approve / reject expense FROM the inbox bell — applies the same
  // optimistic-fade-then-confirm pattern as actionMessage so the message
  // visually disappears immediately and the bell badge decrements.
  // overrideReason is required when the row is in pending_budget_approval —
  // the backend rejects the approval with 400 if it's missing or too short.
  const approveExpenseFromInbox = async (msgId, expenseId, overrideReason) => {
    setRemovedMsgIds(prev => ({ ...prev, [msgId]: 'fading' }));
    fetch(`/api/messages/${msgId}/read`, { method:"PATCH" }).catch(()=>{});
    setTimeout(() => setRemovedMsgIds(prev => ({ ...prev, [msgId]: 'gone' })), 200);
    try {
      const body = { actor: (authUser && authUser.email) || null };
      if (overrideReason) body.override_reason = overrideReason;
      const r = await fetch(`/api/expenses/${expenseId}/approve`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error('approve failed');
      refreshExpenses(); refreshExpTrend(); refreshMessages();
      setSavedToast(overrideReason ? "تمت الموافقة الاستثنائية" : "تمت الموافقة على المصروف"); setTimeout(()=>setSavedToast(""), 1800);
    } catch {
      setRemovedMsgIds(prev => { const n = { ...prev }; delete n[msgId]; return n; });
      window.alert('فشل تنفيذ الإجراء — تم إعادة الرسالة للصندوق');
    }
  };
  const rejectExpenseFromInbox = async (msgId, expenseId, reason) => {
    setRemovedMsgIds(prev => ({ ...prev, [msgId]: 'fading' }));
    fetch(`/api/messages/${msgId}/read`, { method:"PATCH" }).catch(()=>{});
    setTimeout(() => setRemovedMsgIds(prev => ({ ...prev, [msgId]: 'gone' })), 200);
    try {
      const r = await fetch(`/api/expenses/${expenseId}/reject`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ actor: (authUser && authUser.email) || null, reason }),
      });
      if (!r.ok) throw new Error('reject failed');
      refreshExpenses(); refreshExpTrend(); refreshMessages();
      setSavedToast("تم رفض المصروف"); setTimeout(()=>setSavedToast(""), 1800);
    } catch {
      setRemovedMsgIds(prev => { const n = { ...prev }; delete n[msgId]; return n; });
      window.alert('فشل تنفيذ الإجراء — تم إعادة الرسالة للصندوق');
    }
  };
  const uploadExpenseReceipt = async (file) => {
    if (!file) return null;
    if (file.size > 3 * 1024 * 1024) { setSavedToast("الإيصال أكبر من 3MB"); setTimeout(()=>setSavedToast(""), 2200); return null; }
    setExpUploading(true);
    try {
      const fd = new FormData();
      fd.append("receipt", file);
      const r = await fetch("/api/expenses/upload-receipt", { method:"POST", body: fd });
      const data = await r.json().catch(()=>({}));
      if (r.ok && data.url) {
        setExpUploading(false);
        return data.url;
      }
      setExpUploading(false);
      setSavedToast(`فشل رفع الإيصال: ${data.error || r.status}`);
      setTimeout(()=>setSavedToast(""), 2400);
      return null;
    } catch { setExpUploading(false); return null; }
  };
  // Copy a recurring-suggestion forward into this month
  const acceptRecurringSuggestion = async (s) => {
    try {
      const today = new Date().toISOString().slice(0,10);
      await fetch("/api/expenses", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          category: s.category, category_id: s.category_id,
          description: s.description, quantity: s.quantity, unit_price: s.unit_price, amount: s.amount,
          date: today, notes: s.notes,
          type: s.type, supplier_id: s.supplier_id, payment_method: s.payment_method,
          is_recurring: true,
          created_by: (authUser && authUser.email) || null,
          actor_role: activeRole,
        }),
      });
      refreshExpenses(); refreshExpTrend(); refreshExpSugg();
    } catch {}
  };

  // ── Finance ────────────────────────────────────────────────────────────────
  const [finRange,    setFinRange]    = useState("month"); // today | month | 3months | 6months | year | custom
  const [finFrom,     setFinFrom]     = useState("");
  const [finTo,       setFinTo]       = useState("");
  const [finCompare,  setFinCompare]  = useState("period"); // period | yoy
  const [finSummary,  setFinSummary]  = useState(null);
  const [finChart,    setFinChart]    = useState([]);
  const [finExpBreakdown, setFinExpBreakdown] = useState({ rows: [], total: 0, revenue: 0 });
  // Phase 2 additions — one piece of state per new endpoint.
  const [finCashFlow,     setFinCashFlow]     = useState(null);
  const [finReceivables,  setFinReceivables]  = useState(null);
  const [finPayables,     setFinPayables]     = useState(null);
  const [finProfitByCategory, setFinProfitByCategory] = useState({ rows: [] });
  const [finKeyMetrics,   setFinKeyMetrics]   = useState(null);
  const [finBreakEven,    setFinBreakEven]    = useState(null);
  // Filter chips — collapsed dropdown panel toggled by a chip button.
  // payment_method/product_category server-side filtering isn't wired yet
  // (Phase-1 backend didn't add those query params); these affect only
  // client-side visualization filtering in Phase 2.
  const [finFilters, setFinFilters] = useState({ payment_methods: [], product_categories: [] });
  const [finFiltersOpen, setFinFiltersOpen] = useState(false);
  // Top-products tab toggle (revenue vs profit).
  const [finTopTab, setFinTopTab] = useState("revenue"); // revenue | profit

  const resolveFinRange = () => {
    const today = new Date();
    const iso = (d) => d.toISOString().slice(0,10);
    if (finRange === "today")    return { from: iso(today), to: iso(today) };
    if (finRange === "month")    { const f = new Date(today.getFullYear(), today.getMonth(), 1); return { from: iso(f), to: iso(today) }; }
    if (finRange === "3months")  { const f = new Date(today); f.setMonth(f.getMonth() - 3); return { from: iso(f), to: iso(today) }; }
    if (finRange === "6months")  { const f = new Date(today); f.setMonth(f.getMonth() - 6); return { from: iso(f), to: iso(today) }; }
    if (finRange === "year")     { const f = new Date(today.getFullYear(), 0, 1);          return { from: iso(f), to: iso(today) }; }
    if (finRange === "custom" && finFrom && finTo) return { from: finFrom, to: finTo };
    return { from: iso(new Date(today.getFullYear(), today.getMonth(), 1)), to: iso(today) };
  };

  const refreshFinance = async () => {
    const { from, to } = resolveFinRange();
    try {
      const compareQS = finCompare === "yoy" ? "&comparison=yoy" : "";
      // One round-trip per logical concern. Parallel so the UI doesn't wait
      // on the slowest endpoint serially.
      const [s, c, b, cf, rcv, pay, pbc, km, be] = await Promise.all([
        fetch(`/api/finance/summary?from=${from}&to=${to}${compareQS}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/finance/chart?from=${from}&to=${to}`).then(r => r.ok ? r.json() : []),
        fetch(`/api/finance/expenses?from=${from}&to=${to}`).then(r => r.ok ? r.json() : { rows:[], total:0, revenue:0 }),
        fetch(`/api/finance/cash-flow?from=${from}&to=${to}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/finance/receivables`).then(r => r.ok ? r.json() : null),
        fetch(`/api/finance/payables`).then(r => r.ok ? r.json() : null),
        fetch(`/api/finance/profit-by-category?from=${from}&to=${to}`).then(r => r.ok ? r.json() : { rows:[] }),
        fetch(`/api/finance/key-metrics?from=${from}&to=${to}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/finance/break-even`).then(r => r.ok ? r.json() : null),
      ]);
      setFinSummary(s); setFinChart(c || []); setFinExpBreakdown(b || { rows:[], total:0, revenue:0 });
      setFinCashFlow(cf); setFinReceivables(rcv); setFinPayables(pay);
      setFinProfitByCategory(pbc || { rows:[] });
      setFinKeyMetrics(km); setFinBreakEven(be);
    } catch {}
  };
  useEffect(() => { if (tab === "finance") refreshFinance(); }, [tab, finRange, finFrom, finTo, finCompare]); // eslint-disable-line

  const resolveApproval = async (id, status, note = "") => {
    try {
      const r = await fetch(`/api/approvals/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ status, resolution_note: note })
      });
      if (r.ok) {
        refreshApprovals();
        refreshProducts({ allowImport: false });
        refreshMessages();
        setSavedToast(status === "approved" ? "تمت الموافقة" : "تم الرفض");
        setTimeout(()=>setSavedToast(""), 2000);
      }
    } catch {}
  };

  // Map a legacy localStorage product (from useProds / PRODS_KEY) onto the
  // shape that POST /api/products expects. Best-guesses category from name.
  const guessCategory = (name = "") => {
    const n = String(name);
    if (/سيروم/i.test(n))         return "سيروم";
    if (/غسول|cleanser/i.test(n)) return "غسول";
    if (/sun|spf|واقي/i.test(n))  return "واقي شمس";
    return "مرطب";
  };
  const legacyToApi = (p) => ({
    name:        p.nameAr || p.name || "منتج",
    description: p.descAr || p.desc || p.detAr || "",
    category:    guessCategory(p.nameAr || p.name || ""),
    brand:       p.brand || "",
    ingredients: p.useAr || "",
    images:      p.img ? [p.img] : [],
    price:        Number(p.price) || 0,
    price_before: 0,
    cost:         0,
    stock:           Number(p.stock) || 0,
    alert_threshold: 5,
    status:   "published",
    in_stock: (Number(p.stock) || 0) > 0,
    featured: !!p.badgeAr,
    tags:     p.brand ? [p.brand] : [],
  });

  const refreshProducts = async (_opts) => {
    // Auto-import on first load is disabled. The DB is the single source of
    // truth now; re-importing from legacy localStorage would create dupes
    // and could clobber edits made on the live store. The "استيراد"
    // button in the empty-state remains available for explicit migrations.
    try {
      const res = await fetch("/api/products");
      if (!res.ok) return;
      const list = await res.json();
      // Preserve any row that has an in-flight PATCH so the GET response
      // can't overwrite an optimistic update with stale data.
      setDbProducts(prev => {
        const prevById = new Map(prev.map(p => [p.id, p]));
        return list.map(p => (inFlightRef.current && inFlightRef.current.has(p.id) && prevById.has(p.id))
          ? prevById.get(p.id)
          : p);
      });
    } catch {}
  };

  // Fetch on mount AND whenever the tab switches into a page that uses
  // dbProducts. The empty-deps useEffect catches the initial admin load.
  useEffect(() => { refreshProducts(); /* eslint-disable-next-line */ }, []);
  useEffect(() => {
    if (tab === "inventory" || tab === "overview" || tab === "add-product") refreshProducts();
  }, [tab]); // eslint-disable-line

  // ── Coupons ────────────────────────────────────────────────────────────────
  const [coupons, setCoupons] = useState([]);
  const blankCoupon = () => ({ code:"", type:"percent", discount:"", min_order:"", max_discount:"", start_date:"", end_date:"", max_uses:"" });
  const [cForm, setCForm] = useState(blankCoupon);
  const [cMsg, setCMsg] = useState(null);
  const refreshCoupons = async () => {
    try { const r = await fetch("/api/coupons"); if (r.ok) setCoupons(await r.json()); } catch {}
  };
  useEffect(() => { if (tab === "coupons") refreshCoupons(); }, [tab]);

  const saveCoupon = async () => {
    if (!cForm.code.trim()) { setCMsg({kind:"err",text:"الكود مطلوب"}); return; }
    if (cForm.type !== "free_shipping" && (!cForm.discount || Number(cForm.discount) <= 0)) {
      setCMsg({kind:"err",text:"قيمة الخصم مطلوبة"}); return;
    }
    try {
      const r = await fetch("/api/coupons", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          code: cForm.code, type: cForm.type,
          discount: Number(cForm.discount)||0,
          min_order: Number(cForm.min_order)||0,
          max_discount: Number(cForm.max_discount)||0,
          start_date: cForm.start_date||null,
          end_date:   cForm.end_date||null,
          max_uses: Number(cForm.max_uses)||0,
        })
      });
      if (!r.ok) { const e = await r.json().catch(()=>({})); throw new Error(e.error || `HTTP ${r.status}`); }
      setCMsg({kind:"ok",text:"تم إضافة الكوبون"});
      setCForm(blankCoupon());
      refreshCoupons();
    } catch (e) { setCMsg({kind:"err",text:`فشل: ${e.message}`}); }
  };
  const delCoupon = async (id) => {
    if (!confirm("حذف الكوبون نهائياً؟")) return;
    try { await fetch(`/api/coupons/${id}`, { method:"DELETE" }); refreshCoupons(); } catch {}
  };

  // ── Shipments ─────────────────────────────────────────────────────────────
  // Phase 2 list/details page. List uses the {rows,total,page,perPage}
  // envelope from /api/shipments. Details opens as a modal — keyed by AWB
  // so the URL can deep-link via #admin/shipments/AWB-XXXX (future).
  const [shipments,       setShipments]       = useState([]);
  const [shipTotal,       setShipTotal]       = useState(0);
  const [shipPage,        setShipPage]        = useState(1);
  const [shipTab,         setShipTab]         = useState("all"); // all | ready | shipped | delivered | returned | cancelled
  const [shipFilters,     setShipFilters]     = useState({ q:"", from:"", to:"", courier_id:"all", zone_id:"all", sort:"newest" });
  const [shipAggregates,  setShipAggregates]  = useState({ counts:{}, courier_cost_month:0, customer_paid_month:0, shipping_margin_month:0 });
  const [shipCouriers,    setShipCouriers]    = useState([]);
  const [shipZones,       setShipZones]       = useState([]);
  const [shipSelected,    setShipSelected]    = useState({}); // { [id]: true } for bulk
  const [shipDetailAwb,   setShipDetailAwb]   = useState(null);
  const [shipDetail,      setShipDetail]      = useState(null);

  const refreshShipments = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        status: shipTab,
        q: shipFilters.q || "",
        from: shipFilters.from || "",
        to: shipFilters.to || "",
        courier_id: shipFilters.courier_id !== "all" ? shipFilters.courier_id : "",
        zone_id:    shipFilters.zone_id    !== "all" ? shipFilters.zone_id    : "",
        sort: shipFilters.sort === "newest" ? "" : shipFilters.sort,
        page: String(shipPage), perPage: "25",
      });
      [...qs.keys()].forEach(k => { if (qs.get(k) === "") qs.delete(k); });
      const r = await fetch(`/api/shipments?${qs}`);
      if (r.ok) { const d = await r.json(); setShipments(d.rows || []); setShipTotal(Number(d.total) || 0); }
    } catch {}
  }, [shipTab, shipFilters, shipPage]);
  const refreshShipAggregates = useCallback(async () => {
    try { const r = await fetch("/api/shipments/aggregates"); if (r.ok) setShipAggregates(await r.json()); } catch {}
  }, []);
  const refreshShipCouriers = useCallback(async () => {
    try { const r = await fetch("/api/shipping/couriers?all=1"); if (r.ok) setShipCouriers(await r.json()); } catch {}
  }, []);
  const refreshShipZones = useCallback(async () => {
    try { const r = await fetch("/api/shipping/zones?all=1"); if (r.ok) setShipZones(await r.json()); } catch {}
  }, []);
  useEffect(() => {
    if (tab === "shipping") {
      refreshShipments(); refreshShipAggregates(); refreshShipCouriers(); refreshShipZones();
    }
  }, [tab, refreshShipments, refreshShipAggregates, refreshShipCouriers, refreshShipZones]);

  const patchShipment = async (idOrAwb, patch) => {
    setShipments(prev => prev.map(s => (s.id === idOrAwb || s.awb_number === idOrAwb) ? { ...s, ...patch } : s));
    try {
      const r = await fetch(`/api/shipments/${encodeURIComponent(idOrAwb)}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...patch, actor_id: (authUser && authUser.email) || null, actor_name: (authUser && authUser.name) || null }),
      });
      if (r.ok) { const fresh = await r.json(); setShipDetail(prev => (prev && (prev.id === idOrAwb || prev.awb_number === idOrAwb)) ? fresh : prev); refreshShipAggregates(); refreshShipments(); }
    } catch {}
  };
  const refreshShipDetail = useCallback(async (awb) => {
    if (!awb) { setShipDetail(null); return; }
    try { const r = await fetch(`/api/shipments/${encodeURIComponent(awb)}`); if (r.ok) setShipDetail(await r.json()); else setShipDetail(null); } catch { setShipDetail(null); }
  }, []);
  useEffect(() => { refreshShipDetail(shipDetailAwb); }, [shipDetailAwb, refreshShipDetail]);

  // ── Returns ────────────────────────────────────────────────────────────────
  // Phase 1: list page uses {rows,total,page,perPage} envelope from the new
  // backend; we keep a flat array on the client + the total/page state next
  // to it for pagination. Details subroute is keyed by RET-XXXX so deep
  // links survive id rewrites.
  const [returns, setReturns] = useState([]);
  const [retTotal, setRetTotal] = useState(0);
  const [retPage, setRetPage] = useState(1);
  const [retAggregates, setRetAggregates] = useState({ counts:{}, refunded_total:0, return_rate_pct:0, avg_processing_days:null, top_product:null, top_reason:null });
  const [retReasons, setRetReasons] = useState([]);
  const [retTab, setRetTab] = useState("all"); // all | pending | approved | rejected | refunded
  const [retFilters, setRetFilters] = useState({ q:"", from:"", to:"", reason_id:"all", refund_method:"all", sort:"date" });
  const [retSelected, setRetSelected] = useState({}); // { [id]: true } for bulk actions
  const [retDetail, setRetDetail] = useState(null);   // hydrated return detail OR null
  const [retDetailKey, setRetDetailKey] = useState(null); // RET-XXXX in hash
  const [retManualOpen, setRetManualOpen] = useState(false); // future Phase 2: manual create modal

  const refreshReturns = useCallback(async () => {
    try {
      const qs = new URLSearchParams({
        status: retTab,
        q: retFilters.q || "",
        from: retFilters.from || "",
        to: retFilters.to || "",
        reason_id: retFilters.reason_id !== "all" ? retFilters.reason_id : "",
        refund_method: retFilters.refund_method !== "all" ? retFilters.refund_method : "",
        sort: retFilters.sort,
        page: String(retPage),
        perPage: "25",
      });
      // Drop empty params so the backend doesn't AND them as ''
      [...qs.keys()].forEach(k => { if (qs.get(k) === "") qs.delete(k); });
      const r = await fetch(`/api/returns?${qs}`);
      if (r.ok) {
        const d = await r.json();
        setReturns(Array.isArray(d.rows) ? d.rows : []);
        setRetTotal(Number(d.total) || 0);
      }
    } catch {}
  }, [retTab, retFilters, retPage]);
  const refreshRetAggregates = useCallback(async () => {
    try {
      const r = await fetch("/api/returns/aggregates");
      if (r.ok) setRetAggregates(await r.json());
    } catch {}
  }, []);
  const refreshRetReasons = useCallback(async () => {
    try { const r = await fetch("/api/return-reasons"); if (r.ok) setRetReasons(await r.json()); } catch {}
  }, []);
  useEffect(() => {
    if (tab === "returns") { refreshReturns(); refreshRetAggregates(); refreshRetReasons(); }
  }, [tab, refreshReturns, refreshRetAggregates, refreshRetReasons]);

  const patchReturn = async (idOrNum, patch) => {
    setReturns(prev => prev.map(x => (x.id === idOrNum || x.return_number === idOrNum) ? { ...x, ...patch } : x));
    try {
      const r = await fetch(`/api/returns/${encodeURIComponent(idOrNum)}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...patch, actor_id: (authUser && authUser.email) || null, actor_name: (authUser && authUser.name) || null }),
      });
      if (r.ok) {
        const fresh = await r.json();
        // If we're on the details page for this row, swap in the hydrated version
        setRetDetail(prev => (prev && (prev.id === idOrNum || prev.return_number === idOrNum)) ? fresh : prev);
        refreshRetAggregates();
        refreshReturns();
      }
    } catch {}
  };

  // Details fetch — used when the hash route puts us on #admin/returns/:retNum
  const refreshRetDetail = useCallback(async (key) => {
    if (!key) { setRetDetail(null); return; }
    try {
      const r = await fetch(`/api/returns/${encodeURIComponent(key)}`);
      if (r.ok) setRetDetail(await r.json());
      else setRetDetail(null);
    } catch { setRetDetail(null); }
  }, []);
  useEffect(() => { refreshRetDetail(retDetailKey); }, [retDetailKey, refreshRetDetail]);

  // ── Settings (shipping / payment / seo) ────────────────────────────────────
  const DEFAULT_SHIPPING = {
    free_shipping_enabled: false,
    free_shipping_min_order: 1000,
    companies: { bosta: true, jt: false, aramex: false },
    zones: [
      { id:"z1", name:"القاهرة الكبرى",     governorates:"القاهرة، الجيزة، القليوبية",         price:50,  days:"1-2" },
      { id:"z2", name:"الإسكندرية والساحل", governorates:"الإسكندرية، البحيرة، مرسى مطروح",     price:70,  days:"2-3" },
      { id:"z3", name:"الدلتا",              governorates:"الدقهلية، الغربية، المنوفية، كفر الشيخ، الشرقية، دمياط", price:60, days:"2-3" },
      { id:"z4", name:"الصعيد",              governorates:"الفيوم، بني سويف، المنيا، أسيوط، سوهاج، قنا، الأقصر، أسوان", price:90, days:"3-5" },
      { id:"z5", name:"القناة وسيناء",       governorates:"السويس، الإسماعيلية، بورسعيد، شمال سيناء، جنوب سيناء، البحر الأحمر، الوادي الجديد", price:100, days:"3-5" },
    ],
  };
  const DEFAULT_PAYMENT = {
    paymob:  { enabled:false, api_key:"", integration_id:"" },
    fawry:   { enabled:false, merchant_code:"", security_key:"" },
    cod:     { enabled:true },
    vodafone:{ enabled:false, number:"" },
    instapay:{ enabled:false, handle:"" },
  };
  const DEFAULT_SEO = {
    page_url:    "https://nawra.ayoupstudio.tech",
    title:       "نوّرَة | منتجات العناية بالبشرة الأصلية في مصر",
    description: "متجر نوّرَة — أفضل البراندات العالمية للعناية بالبشرة، أسعار حقيقية وشحن سريع لكل محافظات مصر.",
    keywords:    "نوّرَة, عناية بالبشرة, سيروم, واقي شمس, ذا أوردينري, سيتافيل, لاروش بوزيه",
  };
  const DEFAULT_STORE = {
    name: "نوّرَة",
    description: "متجر العناية بالبشرة — أفضل البراندات العالمية",
    email: "nawraskincare@gmail.com",
    whatsapp: "01000000000",
    address: "القاهرة، مصر",
    social: { instagram: "", tiktok: "", facebook: "" },
    logo_url: "",
    brand_primary: "#2A1F0E",
    brand_accent:  "#C4956A",
    store_open: true,
    registration_enabled: true,
    guest_checkout: true,
    monthly_target: 0,
    vip_threshold: 5000,        // EGP — customer becomes VIP at this lifetime spend
  };
  const DEFAULT_ACCOUNT = {
    admin_name: "Super Admin",
    admin_email: "nawraskincare@gmail.com",
    // password fields are not persisted — they're only used to submit a change
  };
  const DEFAULT_EMAILS = {
    order_subject: "✅ تم استلام طلبك من نوّرَة #{{order_id}}",
    order_body: "مرحباً {{customer_name}}،\n\nتم استلام طلبك بنجاح! 🎉\n\nرقم الطلب: #{{order_id}}\nالإجمالي: {{order_total}} جنيه\n\nجاري التجهيز وسيتم التواصل معك قريباً.\n\nشكراً لاختيارك نوّرَة 💕",
  };
  const DEFAULT_NOTIFICATIONS = {
    email_enabled: true,
    telegram_enabled: false,
    telegram_bot_token: "",
    telegram_chat_id: "",
  };
  const DEFAULT_TEAM = {
    members: [
      { id: "u_owner", name: "Super Admin", email: "nawraskincare@gmail.com", role: "super_admin" },
    ],
    permissions: {
      super_admin:     { overview: true, orders: true,  products: true,  inventory: true, customers: true, returns: true,  shipping: true,  coupons: true,  settings: true },
      orders_admin:    { overview: true, orders: true,  products: false, inventory: false, customers: true,  returns: true,  shipping: false, coupons: false, settings: false },
      inventory_admin: { overview: true, orders: false, products: true,  inventory: true, customers: false, returns: false, shipping: false, coupons: false, settings: false },
      shipping_admin:  { overview: true, orders: true,  products: false, inventory: false, customers: false, returns: false, shipping: true,  coupons: false, settings: false },
    },
  };

  const [shipping, setShipping] = useState(DEFAULT_SHIPPING);
  const [payment,  setPayment]  = useState(DEFAULT_PAYMENT);
  const [seoCfg,   setSeoCfg]   = useState(DEFAULT_SEO);
  const [storeCfg,  setStoreCfg]  = useState(DEFAULT_STORE);
  const [accountCfg, setAccountCfg] = useState({ ...DEFAULT_ACCOUNT, pw_current:"", pw_new:"", pw_confirm:"" });
  const [emailsCfg, setEmailsCfg] = useState(DEFAULT_EMAILS);
  const [notifyCfg, setNotifyCfg] = useState(DEFAULT_NOTIFICATIONS);
  const [teamCfg,   setTeamCfg]   = useState(DEFAULT_TEAM);
  const [newTeamMember, setNewTeamMember] = useState({ name:"", email:"", role:"orders_admin" });

  const [savedToast, setSavedToast] = useState("");
  const [settingsTab, setSettingsTab] = useState("store");
  const [shipZoneEdit, setShipZoneEdit] = useState(null);

  const loadSetting = async (key, fallback, setter) => {
    try {
      const r = await fetch(`/api/settings/${key}`);
      if (r.ok) {
        const { value } = await r.json();
        if (value && typeof value === "object") setter({ ...fallback, ...value });
      }
    } catch {}
  };
  const saveSetting = async (key, value) => {
    try {
      await fetch(`/api/settings/${key}`, { method:"PUT", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ value }) });
      setSavedToast("تم الحفظ");
      setTimeout(()=>setSavedToast(""), 1500);
      // Cross-component sync: storefront cart listens to refresh shipping rules
      if (key === "shipping") window.dispatchEvent(new Event("nawra-shipping-saved"));
    } catch {}
  };
  useEffect(() => {
    if (tab === "shipping") loadSetting("shipping", DEFAULT_SHIPPING, setShipping);
    // Overview needs the store config so the "هدف الشهر" card knows its target.
    if (tab === "overview") loadSetting("store", DEFAULT_STORE, setStoreCfg);
    if (tab === "settings") {
      loadSetting("payment",       DEFAULT_PAYMENT,       setPayment);
      loadSetting("seo",           DEFAULT_SEO,           setSeoCfg);
      loadSetting("store",         DEFAULT_STORE,         setStoreCfg);
      loadSetting("account",       DEFAULT_ACCOUNT,       (v) => setAccountCfg({ ...v, pw_current:"", pw_new:"", pw_confirm:"" }));
      loadSetting("emails",        DEFAULT_EMAILS,        setEmailsCfg);
      loadSetting("notifications", DEFAULT_NOTIFICATIONS, setNotifyCfg);
      loadSetting("team",          DEFAULT_TEAM,          setTeamCfg);
    }
  }, [tab]); // eslint-disable-line

  // Convert one file to a data URL (base64) — used by the multi-image uploader
  const fileToDataUrl = (file) => new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload  = () => resolve(r.result);
    r.onerror = reject;
    r.readAsDataURL(file);
  });

  const handleImagesPick = async (files) => {
    const arr = Array.from(files || []);
    if (!arr.length) return;
    // Cap each file at ~3MB to keep request bodies reasonable
    const ok = []; const tooBig = [];
    for (const f of arr) {
      if (f.size > 3 * 1024 * 1024) { tooBig.push(f.name); continue; }
      try { ok.push(await fileToDataUrl(f)); } catch {}
    }
    setPForm(p => ({ ...p, images: [...p.images, ...ok] }));
    if (tooBig.length) setPSaveMsg({ kind:"err", text:`تم تجاهل صور أكبر من 3MB: ${tooBig.join("، ")}` });
  };

  const removeImg = (i) => setPForm(p => ({ ...p, images: p.images.filter((_,j)=>j!==i) }));

  const submitProduct = async (asDraft = false) => {
    if (!pForm.name.trim()) { setPSaveMsg({ kind:"err", text:"اسم المنتج مطلوب" }); return; }
    if (!asDraft && (!pForm.price || Number(pForm.price) <= 0)) {
      setPSaveMsg({ kind:"err", text:"السعر مطلوب للنشر" }); return;
    }
    setPSaving(true); setPSaveMsg(null);
    try {
      const body = {
        name: pForm.name.trim(),
        description: pForm.description.trim(),
        category: pForm.category,
        brand: pForm.brand.trim(),
        ingredients: pForm.ingredients.trim(),
        images: pForm.images,
        price: Number(pForm.price)||0,
        price_before: Number(pForm.price_before)||0,
        cost: Number(pForm.cost)||0,
        stock: Number(pForm.stock)||0,
        alert_threshold: Number(pForm.alert_threshold)||5,
        status: asDraft ? "draft" : (pForm.status || "published"),
        in_stock: !!pForm.in_stock,
        featured: !!pForm.featured,
        seo_title: pForm.seo_title.trim(),
        seo_description: pForm.seo_description.trim(),
        tags: pForm.tags,
      };
      const res = await fetch("/api/products", {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify(body)
      });
      if (!res.ok) {
        const err = await res.json().catch(()=>({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const saved = await res.json();
      setPSaveMsg({ kind:"ok", text: asDraft
        ? `تم حفظ المسودة • SKU: ${saved.sku}`
        : `تم نشر المنتج بنجاح • SKU: ${saved.sku}` });
      setPForm(blankProdForm());
      refreshProducts();
    } catch (e) {
      setPSaveMsg({ kind:"err", text:`فشل الحفظ: ${e.message}` });
    } finally { setPSaving(false); }
  };

  // Inventory: update stock or threshold immediately via PATCH.
  // Maintains a set of in-flight product ids so concurrent refreshes can't
  // overwrite optimistic updates with stale GET responses. The PATCH itself
  // hits `WHERE id = ?` on the server, so it only ever touches one row.
  const inFlightRef = useRef(new Set());
  const patchProduct = async (id, patch) => {
    inFlightRef.current.add(id);
    setInvEditing(id);
    // Optimistic — only the targeted row is mutated. Others are passed
    // through by reference, so React-keyed rows for other products won't
    // re-render due to identity changes.
    setDbProducts(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p));
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch)
      });
      if (res.ok) {
        const updated = await res.json();
        setDbProducts(prev => prev.map(p => p.id === id ? updated : p));
      } else {
        // On failure, refetch only this product (still won't touch others).
        try {
          const r = await fetch(`/api/products/${id}`);
          if (r.ok) {
            const fresh = await r.json();
            setDbProducts(prev => prev.map(p => p.id === id ? fresh : p));
          }
        } catch {}
      }
    } catch {}
    finally {
      inFlightRef.current.delete(id);
      setInvEditing(null);
    }
  };

  // Single entry-point for changing a product's stock.
  // - Increases → applied immediately via PATCH.
  // - Decreases → capture reason via modal, then ALWAYS create a
  //   `stock_reduce` approval request. The server only writes the new stock
  //   value when super admin approves the request. Until then, the row's
  //   visible stock stays at its old value.
  const applyStockChange = (product, newQty, opts = {}) => {
    const id   = product.id;
    const name = product.name || "—";
    const from = Number(product.stock) || 0;
    const to   = Math.max(0, Number(newQty) || 0);
    if (from === to) return;

    if (to > from) {
      // Increase — straight PATCH.
      patchProduct(id, { stock: to }).then(() => { if (opts.onDone) opts.onDone(); });
      return;
    }

    // Decrease — open reason modal, then submit approval.
    setReduceAsk({
      product, fromQty: from, toQty: to, reason: "",
      onConfirm: async (reason) => {
        setReduceAsk(null);
        const requester     = (authUser && authUser.email) || activeRole;
        const requesterName = (authUser && authUser.name)  || activeRole;
        try {
          // Audit log
          await fetch("/api/stock-changes", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              product_id: id, product_name: name,
              old_qty: from, new_qty: to, reason, actor: requester,
            }),
          });
          // Approval request — server applies the new stock value only on approve
          await fetch("/api/approvals", {
            method: "POST", headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              type: "stock_reduce",
              target_id: String(id), target_label: name,
              requester, requester_id: requester, requester_name: requesterName,
              reason, payload: { old_qty: from, new_qty: to },
            }),
          });
          refreshApprovals();
          refreshMessages();
          setSavedToast("تم إرسال طلب تقليل الكمية للمراجعة من Super Admin");
          setTimeout(()=>setSavedToast(""), 2500);
        } catch {}
        if (opts.onDone) opts.onDone();
      },
    });
  };

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

  const saveProduct = async () => {
    if (!newP.name||!newP.price) return;
    if (editId) {
      editProd(editId, {...newP, price:parseInt(newP.price), stars:5, det:"", use:""});
      setEditId(null);
    } else {
      addProd({...newP, price:parseInt(newP.price), stars:5, det:"وصف تفصيلي للمنتج", use:"طريقة الاستخدام", stock:10});
      // Also mirror the new product into the DB so it shows up immediately
      // in the inventory tab. Best-effort — failures don't block the legacy
      // localStorage save.
      try {
        await fetch("/api/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: newP.name,
            brand: newP.brand || "",
            description: newP.desc || "",
            category: guessCategory(newP.name),
            images: [],
            price: parseInt(newP.price) || 0,
            stock: parseInt(newP.stock) || 10,
            alert_threshold: 5,
            status: "published",
            in_stock: (parseInt(newP.stock) || 10) > 0,
            tags: newP.brand ? [newP.brand] : [],
          })
        });
        refreshProducts({ allowImport: false });
      } catch {}
    }
    setNewP({name:"",brand:"",desc:"",price:"",icon:"✨",badge:"",bg:"linear-gradient(135deg,#F5EBE8,#E8D5C4)"});
    setShowAdd(false);
  };

  const startEdit = (p) => {
    setNewP({name:p.name,brand:p.brand,desc:p.desc,price:String(p.price),stock:String(p.stock||0),icon:p.icon,badge:p.badge||"",bg:p.bg});
    setEditId(p.id); setShowAdd(true);
  };

  // Update one order's status and (optionally) payment_status / cancellation
  // reason. Sends actor metadata so the server can append a status_history row
  // with "who did what when". Always mirrors to localStorage so other tabs and
  // the customer's MyOrders page pick up the change in real time.
  const updateOrderStatus = async (id, statusOrPatch, extra = {}) => {
    // Backwards-compatible: callers can pass either (id, "تم الشحن") OR
    // (id, { status, cancellation_reason, payment_status, note, ... })
    const patch = typeof statusOrPatch === "string"
      ? { status: statusOrPatch, ...extra }
      : { ...statusOrPatch, ...extra };

    const actor_id   = (authUser && authUser.email) || null;
    const actor_name = (authUser && (authUser.name || authUser.email)) || "الإدارة";

    // Optimistic local update
    setOrderList(prev => prev.map(o => o.id === id ? { ...o, ...patch } : o));
    setStatusEdit({});
    let fresh = null;
    try {
      const r = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...patch, actor_id, actor_name }),
      });
      if (r.ok) {
        const data = await r.json().catch(() => null);
        if (data && data.order) {
          fresh = data.order;
          setOrderList(prev => prev.map(o => o.id === id ? { ...o, ...fresh } : o));
        }
      }
    } catch {}
    try {
      const orders = JSON.parse(localStorage.getItem("nawra_orders") || "[]");
      localStorage.setItem("nawra_orders",
        JSON.stringify(orders.map(o => o.id === id ? { ...o, ...patch, ...(fresh||{}) } : o)));
    } catch {}
    return fresh;
  };

  const statCard = (label, value, color="#2A1F0E") => (
    <div style={{background:C.wh,padding:mob?"16px":"20px",boxShadow:"0 2px 12px rgba(196,149,106,.1)"}}>
      <div style={{fontFamily:C.fe,fontSize:10,letterSpacing:"0.2em",color:C.mu,marginBottom:6,textTransform:"uppercase"}}>{label}</div>
      <div style={{fontFamily:C.fe,fontSize:mob?22:28,color,fontWeight:500}}>{value}</div>
    </div>
  );

  // Detail page state — keyed by hash route. Clicking an order navigates to
  // `#admin/orders/<id>` so the browser back button takes the admin back to
  // the list. `detailOrderId` is derived from the hash on every render.
  const detailOrderId = (() => {
    if (typeof window === "undefined") return null;
    const h = window.location.hash || "";
    const m = h.match(/^#admin\/orders\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  })();
  const setDetailOrderId = (id) => {
    if (id == null) {
      // Returning to the list — keep the user on the orders tab.
      if (window.location.hash !== "#admin") window.location.hash = "#admin";
      setTab("orders");
    } else {
      window.location.hash = `#admin/orders/${encodeURIComponent(id)}`;
    }
  };
  // Order may have been cached only by short order_number — try both id forms.
  const detailOrder = detailOrderId
    ? (orderList.find(o => String(o.id) === String(detailOrderId)) ||
       orderList.find(o => String(o.order_number) === String(detailOrderId)))
    : null;

  // Products subroutes: #admin/products/new or #admin/products/:id/edit
  const productFormRoute = (() => {
    if (typeof window === "undefined") return null;
    const h = window.location.hash || "";
    if (h === "#admin/products/new") return { mode: "new" };
    const m = h.match(/^#admin\/products\/([^/]+)\/edit$/);
    if (m) return { mode: "edit", id: decodeURIComponent(m[1]) };
    return null;
  })();
  // Whenever the user lands on a product subroute, make sure the products tab
  // is active so the sidebar highlights correctly and back-button works.
  useEffect(() => {
    if (productFormRoute && tab !== "products") setTab("products");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productFormRoute && productFormRoute.mode, productFormRoute && productFormRoute.id]);
  const goProductNew  = ()   => { window.location.hash = "#admin/products/new"; };
  const goProductEdit = (id) => { window.location.hash = `#admin/products/${encodeURIComponent(id)}/edit`; };
  const goProductsList = ()  => { if (window.location.hash !== "#admin") window.location.hash = "#admin"; setTab("products"); };

  // Customer detail subroute — same pattern as orders/products
  const customerDetailEmail = (() => {
    if (typeof window === "undefined") return null;
    const h = window.location.hash || "";
    const m = h.match(/^#admin\/customers\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  })();
  useEffect(() => {
    if (customerDetailEmail && tab !== "customers") setTab("customers");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [customerDetailEmail]);
  const goCustomer       = (email) => { window.location.hash = `#admin/customers/${encodeURIComponent(email)}`; };
  const goCustomersList  = ()      => { if (window.location.hash !== "#admin") window.location.hash = "#admin"; setTab("customers"); };

  // Return detail subroute — #admin/returns/RET-0001
  const retDetailHash = (() => {
    if (typeof window === "undefined") return null;
    const h = window.location.hash || "";
    const m = h.match(/^#admin\/returns\/(.+)$/);
    return m ? decodeURIComponent(m[1]) : null;
  })();
  useEffect(() => {
    setRetDetailKey(retDetailHash);
    if (retDetailHash && tab !== "returns") setTab("returns");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [retDetailHash]);
  const goReturn       = (retNum) => { window.location.hash = `#admin/returns/${encodeURIComponent(retNum)}`; };
  const goReturnsList  = ()       => { if (window.location.hash !== "#admin") window.location.hash = "#admin"; setTab("returns"); };
  // Whenever the user lands on an order-detail URL, ensure the active tab is
  // "orders" (so leaving the detail returns to the right list, and the topbar
  // title is correct).
  useEffect(() => {
    if (detailOrderId && tab !== "orders") setTab("orders");
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detailOrderId]);
  // Re-render when the hash changes so detailOrderId picks up the new value
  // (the AdminDash itself doesn't otherwise subscribe to hashchange).
  const [, forceHashTick] = useState(0);
  useEffect(() => {
    const h = () => forceHashTick(n => n + 1);
    window.addEventListener("hashchange", h);
    return () => window.removeEventListener("hashchange", h);
  }, []);

  // ── Customers (CRM) list filters / selection / pagination ─────────────────
  const [custSearch,      setCustSearch]      = useState("");
  const [custCategory,    setCustCategory]    = useState("all"); // all|new|regular|repeat|vip|inactive
  const [custRegFrom,     setCustRegFrom]     = useState("");
  const [custRegTo,       setCustRegTo]       = useState("");
  const [custOrderFrom,   setCustOrderFrom]   = useState("");
  const [custOrderTo,     setCustOrderTo]     = useState("");
  const [custSort,        setCustSort]        = useState("last_activity");
  const [custPage,        setCustPage]        = useState(1);
  const [custPerPage]     = useState(25);
  const [custSelected,    setCustSelected]    = useState({});
  const [custRows,        setCustRows]        = useState([]);
  const [custTotal,       setCustTotal]       = useState(0);
  const [custLoading,     setCustLoading]     = useState(false);
  const [custAggregates,  setCustAggregates]  = useState(null);
  const [bulkEmailOpen,   setBulkEmailOpen]   = useState(false);
  const [bulkEmailDraft,  setBulkEmailDraft]  = useState({ subject:"", body:"" });

  // Compose query string from current filter state.
  const buildCustQuery = (overrides = {}) => {
    const p = new URLSearchParams();
    p.set("page", String(overrides.page || custPage));
    p.set("perPage", String(overrides.perPage || custPerPage));
    if (custSearch.trim())  p.set("q", custSearch.trim());
    if (custCategory !== "all") p.set("category", custCategory);
    if (custRegFrom)        p.set("reg_from", custRegFrom);
    if (custRegTo)          p.set("reg_to", custRegTo);
    if (custOrderFrom)      p.set("order_from", custOrderFrom);
    if (custOrderTo)        p.set("order_to", custOrderTo);
    if (custSort)           p.set("sort", custSort);
    if (overrides.bulk)     p.set("bulk", "1");
    return p.toString();
  };
  const refreshCustomers = async () => {
    setCustLoading(true);
    try {
      const [list, agg] = await Promise.all([
        fetch(`/api/users?${buildCustQuery()}`).then(r => r.ok ? r.json() : null),
        fetch(`/api/users/aggregates`).then(r => r.ok ? r.json() : null),
      ]);
      if (list)  { setCustRows(list.rows || []); setCustTotal(list.total || 0); }
      if (agg)   { setCustAggregates(agg); }
    } catch {}
    setCustLoading(false);
  };
  // Reload on filter change (debounced via direct fire — UI inputs are slow enough)
  useEffect(() => {
    if (tab !== "customers" || customerDetailEmail) return;
    refreshCustomers();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab, customerDetailEmail, custPage, custCategory, custRegFrom, custRegTo, custOrderFrom, custOrderTo, custSort]);
  // Search input debounced to 350ms
  useEffect(() => {
    if (tab !== "customers" || customerDetailEmail) return;
    const t = setTimeout(() => { setCustPage(1); refreshCustomers(); }, 350);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [custSearch]);
  useEffect(() => { setCustPage(1); }, [custCategory, custRegFrom, custRegTo, custOrderFrom, custOrderTo, custSort]);

  // ── Products list filters / selection / pagination ─────────────────────────
  const [prodSearch,    setProdSearch]    = useState("");
  const [prodCatFil,    setProdCatFil]    = useState("all");
  const [prodBrandFil,  setProdBrandFil]  = useState("all");
  const [prodStockFil,  setProdStockFil]  = useState("all"); // all | available | low | out
  const [prodStatusFil, setProdStatusFil] = useState("all"); // all | published | draft
  const [prodSort,      setProdSort]      = useState("new"); // new | old | priceDesc | priceAsc | stockAsc
  const [prodSelected,  setProdSelected]  = useState({});
  const [prodPage,      setProdPage]      = useState(1);
  const PROD_PER_PAGE = 20;
  useEffect(() => { setProdPage(1); }, [prodSearch, prodCatFil, prodBrandFil, prodStockFil, prodStatusFil, prodSort]);

  // ── Orders page filters / selection / pagination / auto-refresh ────────────
  const [ordSearch,       setOrdSearch]       = useState("");
  const [ordStatusFilter, setOrdStatusFilter] = useState("all");   // all | جديد | قيد التجهيز | تم الشحن | مكتمل | ملغي
  const [ordPayFilter,    setOrdPayFilter]    = useState("all");   // all | cash | visa | wallet
  const [ordFrom,         setOrdFrom]         = useState("");      // YYYY-MM-DD
  const [ordTo,           setOrdTo]           = useState("");
  const [ordSelected,     setOrdSelected]     = useState({});      // { [id]: true }
  const [ordPage,         setOrdPage]         = useState(1);
  const ORD_PER_PAGE = 20;
  const [ordLastRefresh,  setOrdLastRefresh]  = useState(Date.now());
  const [, forceClockTick] = useState(0);
  // Refresh the orders list every 60s while the orders tab is open. Separate
  // from the 10s general poll (which already runs for overview).
  useEffect(() => {
    if (tab !== "orders") return;
    refreshOrders().then(()=>setOrdLastRefresh(Date.now()));
    const i = setInterval(async () => {
      await refreshOrders();
      setOrdLastRefresh(Date.now());
    }, 60000);
    // Tick the "آخر تحديث: منذ X" label every 15s for liveness.
    const clock = setInterval(() => forceClockTick(n => n + 1), 15000);
    return () => { clearInterval(i); clearInterval(clock); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);
  // Reset to page 1 whenever filters change so users don't land on an empty page.
  useEffect(() => { setOrdPage(1); }, [ordSearch, ordStatusFilter, ordPayFilter, ordFrom, ordTo]);

  // Bulk-update helper — used by the bulk action bar.
  const bulkUpdateStatus = async (ids, status) => {
    if (!ids.length) return;
    const ok = window.confirm(`تغيير حالة ${ids.length} طلب إلى "${status}"؟`);
    if (!ok) return;
    for (const id of ids) {
      // sequential so reservation/shipping side-effects don't race each other
      // eslint-disable-next-line no-await-in-loop
      await updateOrderStatus(id, status);
    }
    setOrdSelected({});
    setSavedToast(`تم تحديث ${ids.length} طلب`);
    setTimeout(()=>setSavedToast(""), 2200);
  };

  // Human-readable "X ago" for the last-refresh label.
  const relTime = (ts) => {
    const s = Math.max(0, Math.round((Date.now() - ts) / 1000));
    if (s < 5)   return "الآن";
    if (s < 60)  return `منذ ${s} ث`;
    const m = Math.floor(s / 60);
    if (m < 60)  return `منذ ${m} د`;
    const h = Math.floor(m / 60);
    return `منذ ${h} س`;
  };

  // Resolve a thumbnail URL for an order line item. Falls back to the legacy
  // PRODS catalog (matched by Arabic name) for orders saved before items
  // started carrying their own img field.
  const thumbForItem = (it) => {
    if (it && it.img) return it.img;
    if (!it || !it.name) return null;
    const p = (prods || []).find(p =>
      p.nameAr === it.name || p.nameEn === it.name || p.name === it.name);
    return (p && p.img) || null;
  };

  // Payment-method label + colour. Single source of truth so the table cell,
  // the filter badge, and the detail page all match.
  const PAY_METHOD_LABEL = { cash: "كاش", visa: "فيزا", wallet: "محفظة" };
  const PAY_METHOD_STYLE = {
    cash:   { bg: "#F0FDF4", fg: "#15803D" },
    visa:   { bg: "#EFF6FF", fg: "#1D4ED8" },
    wallet: { bg: "#FEF3C7", fg: "#92400E" },
  };
  const payStyle = (m) => PAY_METHOD_STYLE[m] || PAY_METHOD_STYLE.cash;
  const payLabel = (m) => PAY_METHOD_LABEL[m] || PAY_METHOD_LABEL.cash;

  // Customers — fetched from /api/users (single source of truth: SQLite).
  // HOTFIX: /api/users was changed to return a paginated envelope
  // { total, page, perPage, rows } as part of the CRM redesign. Older
  // code paths (Metric cards, newCustomersThisMonth) call .filter()/.length
  // on allUsers expecting an array — we extract `rows` here and fall back
  // to `[]` so nothing in the admin tree can ever hit "filter is not a
  // function" again.
  const [allUsers, setAllUsers] = useState([]);
  const loadUsers = async () => {
    try {
      const res = await fetch("/api/users?perPage=200");
      if (res.ok) {
        const data = await res.json();
        // Accept both shapes: legacy array OR { rows: [...] }
        const arr = Array.isArray(data) ? data
                  : (data && Array.isArray(data.rows)) ? data.rows
                  : [];
        setAllUsers(arr);
        return;
      }
    } catch {}
    // Fallback: old localStorage user list, so the page still works offline
    try {
      const local = JSON.parse(localStorage.getItem("nawra_users") || "[]");
      setAllUsers(Array.isArray(local) ? local.map(u => ({
        email: u.email, name: u.name, phone: u.phone || null,
        firstOrder: u.registeredAt || null, lastOrder: u.registeredAt || null,
        totalOrders: 0, totalSpent: 0
      })) : []);
    } catch { setAllUsers([]); }
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
    const m = String(raw).match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/);
    if (m) {
      const yr = m[3].length === 2 ? 2000 + Number(m[3]) : Number(m[3]);
      return new Date(yr, Number(m[2]) - 1, Number(m[1]));
    }
    return null;
  };

  const now = new Date();
  const startOfDay = (d) => { const x = new Date(d); x.setHours(0,0,0,0); return x; };
  const today0 = startOfDay(now);

  // Day-name helpers — used both by the dynamic chart range and the legacy
  // "last 7 days" data path that other parts of the page still use.
  const dayLabels = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];

  // ── Dynamic chart series (based on ovRange / ovFrom / ovTo) ────────────────
  // Computes [{date, total, label}], the chart's title, and the matching
  // subset of orders (used by the CSV export button).
  const ovSeries = (() => {
    let from, to;
    if (ovRange === "today")       { from = new Date(today0); to = new Date(today0); }
    else if (ovRange === "7d")     { from = new Date(today0); from.setDate(from.getDate()-6); to = new Date(today0); }
    else if (ovRange === "30d")    { from = new Date(today0); from.setDate(from.getDate()-29); to = new Date(today0); }
    else if (ovRange === "custom" && ovFrom && ovTo) {
      from = startOfDay(new Date(ovFrom)); to = startOfDay(new Date(ovTo));
      if (from > to) { const x = from; from = to; to = x; }
    } else { from = new Date(today0); from.setDate(from.getDate()-6); to = new Date(today0); }

    const dayCount = Math.min(60, Math.max(1, Math.round((to - from) / 86400000) + 1));
    const series = Array.from({length: dayCount}, (_, i) => {
      const d = new Date(from); d.setDate(d.getDate() + i);
      // For long ranges, show day/month instead of weekday for readability
      const label = dayCount <= 7 ? dayLabels[d.getDay()].slice(0,3)
        : `${d.getDate()}/${d.getMonth()+1}`;
      return { date: d, total: 0, label };
    });
    const inRange = [];
    orderList.forEach(o => {
      const d = parseOrderDate(o); if (!d) return;
      const day0 = startOfDay(d);
      if (day0 < from || day0 > to) return;
      inRange.push(o);
      const idx = Math.round((day0 - from) / 86400000);
      if (idx >= 0 && idx < series.length) series[idx].total += Number(o.total)||0;
    });
    return { from, to, series, inRange };
  })();
  const last7 = ovSeries.series; // alias kept so the existing render keeps working
  const maxDay = Math.max(1, ...last7.map(d=>d.total));
  const ovRangeLabel = ovRange === "today" ? "اليوم"
    : ovRange === "7d"  ? "آخر 7 أيام"
    : ovRange === "30d" ? "آخر 30 يوم"
    : (ovFrom && ovTo)  ? `${ovFrom} → ${ovTo}` : "مخصص";

  const exportOrdersCsv = () => {
    // Use orders inside the selected window, falling back to the full
    // orderList if the date-range filter excluded everything (e.g. because
    // historical orders have unparseable date strings). This guarantees the
    // user always gets the actual orders, not just chart aggregates.
    let rows = ovSeries.inRange;
    if (!rows.length) rows = orderList;
    if (!rows.length) { alert("لا توجد طلبات لتصديرها."); return; }

    const head = ["رقم الطلب","التاريخ","العميل","الهاتف","المدينة","العنوان","عدد المنتجات","المنتجات","الإجمالي","الحالة","البريد"];
    const esc = (v) => {
      const s = v == null ? "" : String(v);
      return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
    };
    const lines = [head.join(",")];
    rows.forEach(o => {
      const items = (o.items||[]).map(it => `${it.name} ×${it.qty}`).join(" | ");
      lines.push([
        o.id, o.created_at || o.date || "", o.name || "", o.phone || "",
        o.city || "", o.address || "", (o.items||[]).length, items,
        o.total || 0, o.status || "", o.userEmail || ""
      ].map(esc).join(","));
    });
    // BOM so Excel opens UTF-8 Arabic correctly
    const blob = new Blob(["﻿" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders_${ovRange}_${new Date().toISOString().slice(0,10)}.csv`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
  };

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
    { k:"overview",    l:"نظرة عامة",   icon:"chart-bar" },
    { k:"orders",      l:"الطلبات",     icon:"shopping-cart" },
    { k:"products",    l:"المنتجات",    icon:"box" },
    { k:"add-product", l:"إضافة منتج",  icon:"plus" },
    { k:"inventory",   l:"المخزون",     icon:"package" },
    { k:"customers",   l:"العملاء",     icon:"users" },
    { k:"returns",     l:"المرتجعات",   icon:"refresh" },
    { k:"expenses",    l:"المصروفات",   icon:"receipt" },
    { k:"finance",     l:"المالية",     icon:"report-money" },
    { k:"shipping",    l:"الشحن",       icon:"truck" },
    { k:"coupons",     l:"الكوبونات",   icon:"discount" },
    { k:"settings",    l:"الإعدادات",   icon:"settings" },
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
    const active = tab === item.k && !detailOrderId && !productFormRoute && !customerDetailEmail && !retDetailHash;
    return (
      <button onClick={()=>{
        // "إضافة منتج" is now a shortcut into the products subroute.
        if (item.k === "add-product") { goProductNew(); return; }
        // Leave any subroute (order detail, product form) when switching tabs.
        if (window.location.hash !== "#admin") window.location.hash = "#admin";
        setTab(item.k);
      }}
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

  // (Metric + Placeholder moved to module scope at the bottom of this file.
  // We bind ui/mob via closure here so existing call sites keep working
  // without prop changes — but the underlying component is stable, so
  // typing in any input inside a tab that renders Metric no longer pays
  // an unmount+mount cost per keystroke.)
  const Metric      = useCallback((props) => <MetricCardBase   {...props} ui={ui} mob={mob} />, [ui, mob]);
  const Placeholder = useCallback((props) => <PlaceholderBase  {...props} ui={ui} mob={mob} />, [ui, mob]);

  // ── Overview tab content ───────────────────────────────────────────────────
  const Overview = () => {
    // Monthly target gauge — only shown when the super-admin has set a target > 0
    const target = Number(storeCfg.monthly_target) || 0;
    const pct       = target > 0 ? Math.min(100, Math.round((salesThisMonth / target) * 100)) : 0;
    const remaining = Math.max(0, target - salesThisMonth);
    const dashOffset = 251.2 * (1 - pct / 100); // circumference 2πr (r=40) ≈ 251.2
    const gaugeColor = pct >= 100 ? "#16A34A" : pct >= 75 ? "#3B82F6" : pct >= 50 ? "#F59E0B" : "#DC2626";

    return (
    <div>
      {/* 4 Metric cards */}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:14}}>
        <Metric label="إجمالي المبيعات" value={salesThisMonth.toLocaleString()} suffix="ج" changePct={salesChangePct} />
        <Metric label="عدد الطلبات"     value={ordersThisMonth} changePct={ordersChangePct} />
        <Metric label="العملاء"          value={allUsers.length} hint={newCustomersThisMonth ? `${newCustomersThisMonth} جدد` : "—"} />
        <Metric label="متوسط قيمة الطلب" value={Math.round(avgThis).toLocaleString()} suffix="ج" changePct={avgChangePct} hint="عن الشهر السابق" />
      </div>

      {/* Monthly target gauge — only when configured */}
      {target > 0 && (
        <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"16px 18px",marginBottom:14,
          display:"grid",gridTemplateColumns:mob?"1fr":"auto 1fr",gap:mob?14:24,alignItems:"center"}}>
          {/* SVG circular gauge */}
          <div style={{position:"relative",width:120,height:120,direction:"ltr",margin:mob?"0 auto":0}}>
            <svg width="120" height="120" viewBox="0 0 120 120">
              <circle cx="60" cy="60" r="40" fill="none" stroke="#F3F4F6" strokeWidth="10"/>
              <circle cx="60" cy="60" r="40" fill="none" stroke={gaugeColor} strokeWidth="10"
                strokeDasharray="251.2" strokeDashoffset={dashOffset}
                strokeLinecap="round" transform="rotate(-90 60 60)"
                style={{transition: "stroke-dashoffset .8s ease, stroke .3s"}}/>
              <text x="60" y="60" textAnchor="middle" dominantBaseline="central"
                style={{fontFamily:ui.fontHead, fontSize:24, fontWeight:600, fill:ui.text}}>
                {pct}%
              </text>
              <text x="60" y="82" textAnchor="middle" dominantBaseline="central"
                style={{fontFamily:ui.fontBody, fontSize:10, fill:ui.textSub}}>
                من الهدف
              </text>
            </svg>
          </div>
          <div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:6}}>
              <h3 style={{fontSize:14,fontWeight:600,color:ui.text,margin:0,fontFamily:ui.fontBody}}>هدف الشهر</h3>
              <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>{monthLabel}</span>
            </div>
            <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(3,1fr)",gap:14}}>
              <div>
                <div style={{fontSize:10.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:3}}>المبيعات الفعلية</div>
                <div style={{fontSize:16,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>
                  {salesThisMonth.toLocaleString()} <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>ج</span>
                </div>
              </div>
              <div>
                <div style={{fontSize:10.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:3}}>الهدف</div>
                <div style={{fontSize:16,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>
                  {target.toLocaleString()} <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>ج</span>
                </div>
              </div>
              <div>
                <div style={{fontSize:10.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:3}}>
                  {pct >= 100 ? "تجاوز" : "المتبقي"}
                </div>
                <div style={{fontSize:16, color: pct >= 100 ? "#16A34A" : "#DC2626", fontFamily:ui.fontHead,fontWeight:500}}>
                  {(pct >= 100 ? salesThisMonth - target : remaining).toLocaleString()}
                  <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginInlineStart:4}}>ج</span>
                </div>
              </div>
            </div>
            {/* Linear bar under the kpis for at-a-glance scanning */}
            <div style={{marginTop:12,height:6,background:"#F3F4F6",borderRadius:3,overflow:"hidden"}}>
              <div style={{width: `${pct}%`, height:"100%", background: gaugeColor, transition:"width .8s ease, background .3s"}}/>
            </div>
          </div>
        </div>
      )}

      {/* Row: bar chart + latest orders */}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,marginBottom:10}}>
        {/* Bar chart with date-range controls + CSV export */}
        <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
          <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10,flexWrap:"wrap",gap:8}}>
            <h3 style={{fontSize:13,fontWeight:500,color:ui.text,margin:0,fontFamily:ui.fontBody}}>المبيعات — {ovRangeLabel}</h3>
            <button onClick={exportOrdersCsv} disabled={orderList.length===0}
              title={ovSeries.inRange.length > 0
                ? `تصدير ${ovSeries.inRange.length} طلب في النطاق`
                : orderList.length > 0
                  ? `تصدير كل الطلبات (${orderList.length}) — النطاق المحدد فارغ`
                  : "لا توجد طلبات لتصديرها"}
              style={{display:"flex",alignItems:"center",gap:5,
                background: orderList.length===0 ? "transparent" : ui.text,
                color: orderList.length===0 ? ui.textSub : "#fff",
                border: orderList.length===0 ? ui.border : "none",
                padding:"5px 11px",cursor: orderList.length===0 ? "not-allowed":"pointer",
                fontSize:11,fontFamily:ui.fontBody,borderRadius:5}}>
              تصدير CSV
            </button>
          </div>

          {/* Range chips */}
          <div style={{display:"flex",gap:4,flexWrap:"wrap",marginBottom:10}}>
            {[["today","اليوم"],["7d","7 أيام"],["30d","30 يوم"],["custom","مخصص"]].map(([k,l])=>(
              <button key={k} onClick={()=>setOvRange(k)}
                style={{padding:"4px 10px",borderRadius:14,fontSize:11,fontFamily:ui.fontBody,cursor:"pointer",
                  background: ovRange===k ? ui.text : "transparent",
                  color: ovRange===k ? "#fff" : ui.textSub,
                  border: ovRange===k ? "none" : ui.border}}>{l}</button>
            ))}
          </div>
          {ovRange === "custom" && (
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:10}}>
              <input type="date" value={ovFrom} onChange={e=>setOvFrom(e.target.value)}
                style={{padding:"5px 9px",border:ui.border,borderRadius:5,background:ui.cardBg,
                  fontFamily:ui.fontBody,fontSize:12,color:ui.text}}/>
              <input type="date" value={ovTo} onChange={e=>setOvTo(e.target.value)}
                style={{padding:"5px 9px",border:ui.border,borderRadius:5,background:ui.cardBg,
                  fontFamily:ui.fontBody,fontSize:12,color:ui.text}}/>
            </div>
          )}

          <div style={{display:"flex",alignItems:"flex-end",gap:last7.length > 14 ? 3 : 6,height:110,paddingTop:8,direction:"ltr"}}>
            {last7.map((d,i)=>{
              const h = Math.max(4, Math.round((d.total / maxDay) * 90));
              return (
                <div key={i} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:5,position:"relative"}}>
                  <div title={`${d.label}: ${d.total.toLocaleString()} ج`}
                    style={{width:"100%",height:`${h}%`,background:"#3B82F6",borderRadius:"3px 3px 0 0",transition:"height .3s"}} />
                  {last7.length <= 14 && <span style={{fontSize:10,color:ui.textSub,fontFamily:ui.fontBody}}>{d.label}</span>}
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
  };

  // (PlaceholderBase lives at module scope; bound above via useCallback.)

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
          {/* Show the active super-admin's name as a quiet footer label. */}
          {!mob && authUser && (
            <div style={{padding:"10px 16px",borderTop:ui.border,fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,lineHeight:1.5}}>
              <div style={{color:ui.text,fontWeight:500}}>{authUser.name || "Super Admin"}</div>
              <div style={{fontSize:10.5,direction:"ltr",textAlign:"right"}}>{authUser.email || "—"}</div>
            </div>
          )}
          <button onClick={()=>go("#home")} style={{
            display:"flex",alignItems:"center",gap:8,padding:"10px 16px",
            fontSize:12,fontFamily:ui.fontBody,color:ui.textSub,
            background:"transparent",border:"none",cursor:"pointer",textAlign:"right",
            borderTop:ui.border
          }}>
            <AdmIcon name="logout" size={15}/>
            <span>الرجوع للموقع</span>
          </button>
        </aside>

        {/* MAIN */}
        <main style={{padding:mob?"14px":"20px 24px",overflow:"auto"}}>
          {/* Topbar with messages bell */}
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14,gap:12}}>
            <h2 style={{fontSize:17,fontWeight:500,color:ui.text,fontFamily:ui.fontHead,margin:0,flex:1}}>{topbarTitle}</h2>
            <span style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>{monthLabel}</span>
            <button type="button"
              onClick={()=>setInboxOpen(true)}
              title={`الرسائل (${unreadCount} غير مقروءة)`}
              style={{position:"relative",background:ui.cardBg,border:ui.border,borderRadius:"50%",
                width:36,height:36,cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",
                color: unreadCount > 0 ? ui.text : ui.textSub, flexShrink:0}}>
              {/* Bell icon */}
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
              </svg>
              {unreadCount > 0 && (
                <span style={{position:"absolute",top:-2,insetInlineStart:-2,
                  minWidth:18,height:18,padding:"0 5px",borderRadius:9,
                  background:"#DC2626",color:"#fff",fontSize:10,fontWeight:600,
                  display:"flex",alignItems:"center",justifyContent:"center",fontFamily:ui.fontBody}}>
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>
          </div>

          {/* Inbox drawer */}
          {inboxOpen && (
            <div onClick={()=>setInboxOpen(false)}
              style={{position:"fixed",inset:0,background:"rgba(0,0,0,.45)",zIndex:600,display:"flex",justifyContent:"flex-start",direction:"rtl"}}>
              <aside onClick={e=>e.stopPropagation()}
                style={{width: mob ? "100%" : 420, height:"100%", background:ui.cardBg, borderInlineEnd:ui.border, overflow:"auto", display:"flex", flexDirection:"column"}}>
                <header style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"14px 16px",borderBottom:ui.border}}>
                  <div>
                    <div style={{fontSize:14.5,fontWeight:600,color:ui.text,fontFamily:ui.fontBody}}>صندوق الرسائل</div>
                    <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>
                      {visibleMessages.length} رسالة · {unreadCount} غير مقروءة
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead}
                        style={{background:"transparent",border:ui.border,padding:"5px 10px",cursor:"pointer",fontSize:11,fontFamily:ui.fontBody,color:ui.text,borderRadius:5}}>
                        تحديد الكل كمقروء
                      </button>
                    )}
                    <button onClick={()=>setInboxOpen(false)} style={{background:"none",border:"none",fontSize:22,color:ui.textSub,cursor:"pointer",lineHeight:1,padding:4}}>✕</button>
                  </div>
                </header>
                <div style={{flex:1,overflowY:"auto"}}>
                  {visibleMessages.length === 0 ? (
                    <div style={{padding:"40px 20px",textAlign:"center",color:ui.textSub,fontFamily:ui.fontBody,fontSize:13}}>
                      لا توجد رسائل
                    </div>
                  ) : visibleMessages.map(m => {
                    const isReq = m.type === 'request';
                    const isApp = m.type === 'approval';
                    const isRej = m.type === 'rejection';
                    const accent = isReq ? "#F59E0B" : isApp ? "#16A34A" : isRej ? "#DC2626" : ui.textSub;
                    const actioned   = removedMsgIds[m.id] === 'fading';
                    // Two flavours of "needs admin action": the legacy
                    // approvals table (product_delete / stock_*) carries an
                    // approval_id, AND the expense-approval flow carries an
                    // expense_id under metadata.kind === 'expense_approval'.
                    const isExpenseAppr  = !!(m.metadata && m.metadata.kind === 'expense_approval' && m.metadata.expense_id);
                    const isBudgetOverrun = !!(m.metadata && m.metadata.kind === 'expense_budget_overrun' && m.metadata.expense_id);
                    const isLegacyAppr   = !!(m.metadata && m.metadata.approval_id);
                    const needsAction    = !actioned && isReq && m.metadata && m.metadata.requires_action && isSuper && (isExpenseAppr || isBudgetOverrun || isLegacyAppr);
                    return (
                      <article key={m.id}
                        onClick={()=>!m.read_at && !actioned && markMessageRead(m.id)}
                        style={{padding:"12px 16px",borderBottom:`0.5px solid #EEE`,
                          background: m.read_at ? "transparent" : "#FFFBEA",
                          cursor: m.read_at || actioned ? "default" : "pointer",
                          borderInlineStart:`3px solid ${accent}`,
                          opacity: actioned ? 0 : 1,
                          maxHeight: actioned ? 0 : 600,
                          paddingTop: actioned ? 0 : 12,
                          paddingBottom: actioned ? 0 : 12,
                          overflow: "hidden",
                          transition: "opacity .2s ease, max-height .2s ease, padding .2s ease"}}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"baseline",gap:8,marginBottom:4}}>
                          <div style={{fontSize:13,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,flex:1,minWidth:0}}>{m.subject || "—"}</div>
                          <div style={{fontSize:10.5,color:ui.textSub,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>
                            {(() => {
                              const t = new Date((m.created_at || "").replace(" ","T")+"Z").getTime();
                              if (!t) return "—";
                              const min = Math.round((Date.now() - t) / 60000);
                              if (min < 1) return "الآن";
                              if (min < 60) return `${min} د`;
                              if (min < 60*24) return `${Math.round(min/60)} س`;
                              return `${Math.round(min/(60*24))} ي`;
                            })()}
                          </div>
                        </div>
                        {m.from_user_name && (
                          <div style={{fontSize:10.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>
                            من: {m.from_user_name}
                          </div>
                        )}
                        {m.body && (
                          <pre style={{fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,whiteSpace:"pre-wrap",lineHeight:1.7,margin:0,wordBreak:"break-word"}}>{m.body}</pre>
                        )}
                        {needsAction && (
                          <div style={{display:"flex",gap:6,marginTop:10}}>
                            <button onClick={(ev)=>{
                              ev.stopPropagation();
                              if (isBudgetOverrun) {
                                setBudgetOverrideFor({ msgId: m.id, expenseId: m.metadata.expense_id, label: m.subject, note: "" });
                              } else if (isExpenseAppr) {
                                approveExpenseFromInbox(m.id, m.metadata.expense_id);
                              } else {
                                actionMessage(m.id, m.metadata.approval_id, "approved");
                              }
                            }}
                              style={{background: isBudgetOverrun ? "#FED7AA" : "#DCFCE7",border:`0.5px solid ${isBudgetOverrun ? "#FB923C" : "#86EFAC"}`,padding:"5px 12px",cursor:"pointer",fontSize:11.5,fontFamily:ui.fontBody,color: isBudgetOverrun ? "#9A3412" : "#15803D",borderRadius:5}}>
                              {isBudgetOverrun ? "✓ موافقة استثنائية" : "✓ موافقة"}
                            </button>
                            <button onClick={(ev)=>{
                              ev.stopPropagation();
                              if (isExpenseAppr || isBudgetOverrun) {
                                setRejectionFor({ msgId: m.id, expenseId: m.metadata.expense_id, label: m.subject, note: "", kind: "expense" });
                              } else {
                                setRejectionFor({ msgId: m.id, approvalId: m.metadata.approval_id, label: m.subject, note: "" });
                              }
                            }}
                              style={{background:"#FEE2E2",border:"0.5px solid #FCA5A5",padding:"5px 12px",cursor:"pointer",fontSize:11.5,fontFamily:ui.fontBody,color:"#B91C1C",borderRadius:5}}>
                              ✗ رفض
                            </button>
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              </aside>
            </div>
          )}

          {/* Rejection modal — requires a reason that's delivered to the original requester */}
          {rejectionFor && (
            <div onClick={()=>setRejectionFor(null)}
              style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
              <div onClick={e=>e.stopPropagation()}
                style={{background:ui.cardBg,maxWidth:440,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
                <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"0 0 4px"}}>
                  رفض الطلب
                </h3>
                <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:14}}>
                  {rejectionFor.label || "—"}
                </div>
                <label style={{display:"block",fontSize:12,color:ui.text,marginBottom:5,fontFamily:ui.fontBody,fontWeight:500}}>
                  سبب الرفض (هيوصل للطالب)
                </label>
                <textarea rows={3} autoFocus
                  value={rejectionFor.note}
                  onChange={e=>setRejectionFor({...rejectionFor, note:e.target.value})}
                  placeholder="مثال: المخزون ضروري للطلبات الحالية..."
                  style={{padding:"8px 12px",border:`1px solid #FCA5A5`,borderRadius:6,background:"#FEF2F2",fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",width:"100%",direction:"rtl",resize:"vertical",minHeight:80,boxSizing:"border-box"}}/>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
                  <button onClick={()=>setRejectionFor(null)}
                    style={{padding:"8px 16px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,cursor:"pointer"}}>إلغاء</button>
                  <button
                    disabled={(rejectionFor.note || "").trim().length < 3}
                    onClick={() => {
                      const note = rejectionFor.note.trim();
                      // Two routing paths: expense rejection hits the expense
                      // endpoint, legacy approvals hit /api/approvals.
                      if (rejectionFor.kind === "expense") {
                        rejectExpenseFromInbox(rejectionFor.msgId, rejectionFor.expenseId, note);
                      } else {
                        actionMessage(rejectionFor.msgId, rejectionFor.approvalId, "rejected", note);
                      }
                      setRejectionFor(null);
                    }}
                    style={{padding:"8px 18px",background: (rejectionFor.note||"").trim().length >= 3 ? "#DC2626" : "#9CA3AF",color:"#fff",border:"none",borderRadius:6,fontSize:12.5,fontFamily:ui.fontBody,cursor:(rejectionFor.note||"").trim().length >= 3 ? "pointer" : "not-allowed"}}>
                    إرسال الرفض
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Budget-overrun exception modal — Super Admin approves a row that
              busts the category's monthly budget. Reason (>=5 chars) is
              stored on expenses.budget_override_reason for audit. */}
          {budgetOverrideFor && (
            <div onClick={()=>setBudgetOverrideFor(null)}
              style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
              <div onClick={ev=>ev.stopPropagation()}
                style={{background:ui.cardBg,maxWidth:460,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
                <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"0 0 4px"}}>
                  موافقة استثنائية على تجاوز الميزانية
                </h3>
                <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:14}}>
                  {budgetOverrideFor.label || "—"}
                </div>
                <label style={{display:"block",fontSize:12,color:ui.text,marginBottom:5,fontFamily:ui.fontBody,fontWeight:500}}>
                  سبب الاستثناء (5 أحرف على الأقل — يُحفظ في السجل)
                </label>
                <textarea rows={3} autoFocus
                  value={budgetOverrideFor.note}
                  onChange={ev=>setBudgetOverrideFor({...budgetOverrideFor, note:ev.target.value})}
                  placeholder="مثال: حملة تسويقية طارئة معتمدة من الإدارة..."
                  style={{padding:"8px 12px",border:`1px solid #FB923C`,borderRadius:6,background:"#FFF7ED",fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",width:"100%",direction:"rtl",resize:"vertical",minHeight:80,boxSizing:"border-box"}}/>
                <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
                  <button onClick={()=>setBudgetOverrideFor(null)}
                    style={{padding:"8px 16px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,cursor:"pointer"}}>إلغاء</button>
                  <button
                    disabled={(budgetOverrideFor.note || "").trim().length < 5}
                    onClick={() => {
                      const reason = budgetOverrideFor.note.trim();
                      approveExpenseFromInbox(budgetOverrideFor.msgId, budgetOverrideFor.expenseId, reason);
                      setBudgetOverrideFor(null);
                    }}
                    style={{padding:"8px 18px",background: (budgetOverrideFor.note||"").trim().length >= 5 ? "#EA580C" : "#9CA3AF",color:"#fff",border:"none",borderRadius:6,fontSize:12.5,fontFamily:ui.fontBody,cursor:(budgetOverrideFor.note||"").trim().length >= 5 ? "pointer" : "not-allowed"}}>
                    تأكيد الموافقة الاستثنائية
                  </button>
                </div>
              </div>
            </div>
          )}

          {tab === "overview" && <Overview />}

          {/* ORDERS */}
          {tab === "orders" && (
            detailOrderId ? (
              <OrderDetailPage
                order={detailOrder}
                orderId={detailOrderId}
                onBack={()=>setDetailOrderId(null)}
                onStatusChange={updateOrderStatus}
                canManage={canManageOrders}
                thumbForItem={thumbForItem}
                payLabel={payLabel}
                payStyle={payStyle}
                badgeStyle={badgeStyle}
                ui={ui}
                mob={mob}
                refreshOrders={refreshOrders}
              />
            ) : (() => {
              // ── KPI cards ────────────────────────────────────────────────
              const today0 = (() => { const d=new Date(); d.setHours(0,0,0,0); return d; })();
              const todayOrders = orderList.filter(o => {
                const d = parseOrderDate(o); if (!d) return false;
                const x = new Date(d); x.setHours(0,0,0,0);
                return x.getTime() === today0.getTime();
              });
              const kpiPreparing = orderList.filter(o => o.status === "قيد التجهيز").length;
              const kpiShipped   = orderList.filter(o => o.status === "تم الشحن").length;
              const kpiSalesToday = todayOrders
                .filter(o => o.status !== "ملغي")
                .reduce((s,o)=>s+(Number(o.total)||0), 0);
              const nonCancelled = orderList.filter(o => o.status !== "ملغي");
              const kpiAvgOrder = nonCancelled.length
                ? Math.round(nonCancelled.reduce((s,o)=>s+(Number(o.total)||0),0) / nonCancelled.length)
                : 0;

              // ── Filter pipeline ──────────────────────────────────────────
              const q = (ordSearch || "").trim().toLowerCase();
              const fromTs = ordFrom ? new Date(ordFrom+"T00:00:00").getTime() : null;
              const toTs   = ordTo   ? new Date(ordTo  +"T23:59:59").getTime() : null;
              const filtered = orderList.filter(o => {
                if (ordStatusFilter !== "all" && o.status !== ordStatusFilter) return false;
                if (ordPayFilter !== "all" && (o.payment_method || "cash") !== ordPayFilter) return false;
                if (fromTs || toTs) {
                  const d = parseOrderDate(o); if (!d) return false;
                  const t = d.getTime();
                  if (fromTs && t < fromTs) return false;
                  if (toTs   && t > toTs)   return false;
                }
                if (q) {
                  const hay = `${o.order_number||""} ${o.id||""} ${o.name||""} ${o.phone||""}`.toLowerCase();
                  if (!hay.includes(q)) return false;
                }
                return true;
              });

              // ── Pagination ───────────────────────────────────────────────
              const totalPages = Math.max(1, Math.ceil(filtered.length / ORD_PER_PAGE));
              const page = Math.min(ordPage, totalPages);
              const pageRows = filtered.slice((page-1)*ORD_PER_PAGE, page*ORD_PER_PAGE);

              const selectedIds = Object.keys(ordSelected).filter(k => ordSelected[k]);
              const allOnPageSelected = pageRows.length > 0 && pageRows.every(o => ordSelected[o.id]);
              const togglePage = () => {
                const next = { ...ordSelected };
                if (allOnPageSelected) { pageRows.forEach(o => { delete next[o.id]; }); }
                else                    { pageRows.forEach(o => { next[o.id] = true; }); }
                setOrdSelected(next);
              };

              // CSV export for the current filtered set (not just this page).
              const exportFilteredCsv = () => {
                const head = ["#","الاسم","الهاتف","المدينة","التاريخ","المنتجات","الإجمالي","الدفع","الحالة"];
                const rows = filtered.map(o => [
                  o.order_number || o.id, o.name||"", o.phone||"", o.city||"",
                  o.date||"", (o.items||[]).length,
                  o.total||0, payLabel(o.payment_method||"cash"), o.status||""
                ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","));
                const csv = "﻿" + [head.join(","), ...rows].join("\n");
                const url = URL.createObjectURL(new Blob([csv], { type:"text/csv;charset=utf-8" }));
                const a = document.createElement("a"); a.href = url;
                a.download = `nawra-orders-${new Date().toISOString().slice(0,10)}.csv`;
                a.click(); URL.revokeObjectURL(url);
              };

              return (
              <div>
                {/* 4 KPI cards */}
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:14}}>
                  <Metric label="قيد التجهيز"        value={kpiPreparing} />
                  <Metric label="تم الشحن"            value={kpiShipped} />
                  <Metric label="مبيعات اليوم"        value={kpiSalesToday.toLocaleString()} suffix="ج" />
                  <Metric label="متوسط قيمة الطلب"    value={kpiAvgOrder.toLocaleString()} suffix="ج" />
                </div>

                {/* Filter bar */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"12px 14px",marginBottom:12,
                  display:"grid",gap:8,gridTemplateColumns: mob ? "1fr" : "minmax(220px,2fr) repeat(4, minmax(0,1fr))"}}>
                  <input value={ordSearch} onChange={e=>setOrdSearch(e.target.value)}
                    placeholder="بحث برقم الطلب، الاسم أو الهاتف..."
                    style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                      fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl"}}/>
                  <select value={ordStatusFilter} onChange={e=>setOrdStatusFilter(e.target.value)}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,
                      fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل الحالات</option>
                    {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <select value={ordPayFilter} onChange={e=>setOrdPayFilter(e.target.value)}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,
                      fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل طرق الدفع</option>
                    <option value="cash">كاش</option>
                    <option value="visa">فيزا</option>
                    <option value="wallet">محفظة</option>
                  </select>
                  <input type="date" value={ordFrom} onChange={e=>setOrdFrom(e.target.value)}
                    title="من تاريخ"
                    style={{padding:"7px 9px",border:ui.border,borderRadius:6,background:ui.cardBg,
                      fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none"}}/>
                  <input type="date" value={ordTo} onChange={e=>setOrdTo(e.target.value)}
                    title="إلى تاريخ"
                    style={{padding:"7px 9px",border:ui.border,borderRadius:6,background:ui.cardBg,
                      fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none"}}/>
                </div>

                {/* Result count + last refresh */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,
                  flexWrap:"wrap",gap:8}}>
                  <span style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                    {filtered.length === orderList.length
                      ? `${orderList.length} طلب`
                      : `${filtered.length} من ${orderList.length} طلب`}
                  </span>
                  <span style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,display:"flex",alignItems:"center",gap:5}}>
                    <span style={{width:6,height:6,borderRadius:"50%",background:"#22C55E",display:"inline-block"}}/>
                    آخر تحديث: {relTime(ordLastRefresh)}
                  </span>
                </div>

                {/* Bulk action bar — appears when items selected */}
                {selectedIds.length > 0 && (
                  <div style={{background:"#EFF6FF",border:"1px solid #BFDBFE",borderRadius:ui.radius,
                    padding:"10px 14px",marginBottom:10,display:"flex",flexWrap:"wrap",alignItems:"center",gap:10}}>
                    <span style={{fontSize:12.5,fontFamily:ui.fontBody,color:"#1E40AF",fontWeight:600}}>
                      {selectedIds.length} محدد
                    </span>
                    <div style={{flex:1}}/>
                    {canManageOrders && (
                      <select onChange={e=>{ if(e.target.value){ bulkUpdateStatus(selectedIds, e.target.value); e.target.value=""; } }}
                        defaultValue=""
                        style={{padding:"6px 10px",border:"1px solid #BFDBFE",borderRadius:6,background:"#fff",
                          fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none"}}>
                        <option value="">تغيير الحالة لـ...</option>
                        {ORDER_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    )}
                    <button onClick={()=>{ window.print(); }}
                      style={{padding:"6px 11px",border:"1px solid #BFDBFE",background:"#fff",borderRadius:6,
                        fontFamily:ui.fontBody,fontSize:12,color:ui.text,cursor:"pointer"}}>
                      🖨 طباعة الفواتير
                    </button>
                    <button onClick={exportFilteredCsv}
                      style={{padding:"6px 11px",border:"1px solid #BFDBFE",background:"#fff",borderRadius:6,
                        fontFamily:ui.fontBody,fontSize:12,color:ui.text,cursor:"pointer"}}>
                      تصدير CSV
                    </button>
                    <button onClick={()=>setOrdSelected({})}
                      style={{padding:"6px 10px",border:"none",background:"transparent",
                        fontFamily:ui.fontBody,fontSize:12,color:"#6B7280",cursor:"pointer"}}>
                      إلغاء التحديد ✕
                    </button>
                  </div>
                )}

                {/* Table */}
                {orderList.length===0 ? (
                  <Placeholder icon="shopping-cart" title="مفيش طلبات لحد دلوقتي" body="هتبان الطلبات هنا أول ما عميل يكمّل عملية الشراء." />
                ) : filtered.length === 0 ? (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"34px 18px",textAlign:"center"}}>
                    <div style={{fontSize:32,marginBottom:8}}>🔎</div>
                    <div style={{fontSize:13.5,color:ui.text,fontFamily:ui.fontBody,fontWeight:500,marginBottom:4}}>
                      لا توجد طلبات تطابق الفلاتر
                    </div>
                    <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>
                      جرب تعديل البحث أو إعادة ضبط الفلاتر
                    </div>
                  </div>
                ) : (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:980}}>
                      <thead>
                        <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                          <th style={{padding:"10px 12px",width:36}}>
                            <input type="checkbox" checked={allOnPageSelected} onChange={togglePage}
                              style={{cursor:"pointer",accentColor:ui.text}}/>
                          </th>
                          {["#","العميل","التاريخ","المنتجات","الإجمالي","الدفع","حالة الدفع","الحالة",""].map(h=>(
                            <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map(o => {
                          const b = badgeStyle(o.status);
                          const pm = o.payment_method || "cash";
                          const ps = o.payment_status || "unpaid";
                          const psStyle = ps === "paid" ? {bg:"#DCFCE7",fg:"#15803D"} : {bg:"#FEE2E2",fg:"#B91C1C"};
                          const pmS = payStyle(pm);
                          const items = o.items || [];
                          const thumbs = items.slice(0,2).map(thumbForItem).filter(Boolean);
                          return (
                            <tr key={o.id} onClick={()=>setDetailOrderId(o.id)}
                              style={{borderTop:"0.5px solid #EEE",cursor:"pointer",transition:"background .15s"}}
                              onMouseEnter={e=>e.currentTarget.style.background="#FAFAFA"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <td style={{padding:"10px 12px"}} onClick={e=>e.stopPropagation()}>
                                <input type="checkbox"
                                  checked={!!ordSelected[o.id]}
                                  onChange={e=>setOrdSelected(s => ({ ...s, [o.id]: e.target.checked }))}
                                  style={{cursor:"pointer",accentColor:ui.text}}/>
                              </td>
                              <td style={{padding:"11px 12px",fontFamily:"monospace",fontSize:12.5,color:ui.text,fontWeight:600,whiteSpace:"nowrap"}}>
                                #{o.order_number || o.id}
                              </td>
                              <td style={{padding:"11px 12px"}}>
                                <div style={{fontSize:13,color:ui.text,fontWeight:500}}>{o.name}</div>
                                <div style={{fontSize:11,color:ui.textSub,fontFamily:"monospace",direction:"ltr",textAlign:"right",marginTop:2}}>{o.phone}</div>
                              </td>
                              <td style={{padding:"11px 12px",fontSize:12,color:ui.textSub,whiteSpace:"nowrap"}}>{o.date || "—"}</td>
                              <td style={{padding:"11px 12px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  {thumbs.length > 0 ? (
                                    <div style={{display:"flex"}}>
                                      {thumbs.map((src,i)=>(
                                        <img key={i} src={src} alt=""
                                          style={{width:28,height:28,borderRadius:"50%",objectFit:"cover",
                                            border:"2px solid #fff",marginInlineStart:i?-8:0,background:"#F3F4F6"}}/>
                                      ))}
                                    </div>
                                  ) : (
                                    <div style={{width:28,height:28,borderRadius:"50%",background:"#F3F4F6",
                                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:13}}>🛍️</div>
                                  )}
                                  <span style={{fontSize:11.5,color:ui.textSub,whiteSpace:"nowrap"}}>
                                    {items.length} {items.length === 1 ? "منتج" : "منتجات"}
                                  </span>
                                </div>
                              </td>
                              <td style={{padding:"11px 12px",fontSize:13,color:ui.text,fontWeight:500,whiteSpace:"nowrap"}}>
                                {(o.total||0).toLocaleString()} <span style={{fontSize:11,color:ui.textSub}}>ج</span>
                              </td>
                              <td style={{padding:"11px 12px"}}>
                                <span style={{fontSize:10.5,padding:"3px 9px",borderRadius:20,background:pmS.bg,color:pmS.fg,whiteSpace:"nowrap"}}>
                                  {payLabel(pm)}
                                </span>
                              </td>
                              <td style={{padding:"11px 12px"}}>
                                <span style={{fontSize:10.5,padding:"3px 9px",borderRadius:20,background:psStyle.bg,color:psStyle.fg,whiteSpace:"nowrap"}}>
                                  {ps === "paid" ? "مدفوع" : "غير مدفوع"}
                                </span>
                              </td>
                              <td style={{padding:"11px 12px"}}>
                                <span style={{fontSize:10.5,padding:"3px 10px",borderRadius:20,background:b.bg,color:b.fg,whiteSpace:"nowrap"}}>
                                  {o.status}
                                </span>
                              </td>
                              <td style={{padding:"11px 12px",textAlign:"left",whiteSpace:"nowrap"}}>
                                <button onClick={e=>{ e.stopPropagation(); setDetailOrderId(o.id); }}
                                  title="عرض التفاصيل"
                                  style={{background:"transparent",border:ui.border,padding:"4px 8px",cursor:"pointer",
                                    fontFamily:ui.fontBody,fontSize:13,color:ui.text,borderRadius:5}}>
                                  👁
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {filtered.length > ORD_PER_PAGE && (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12,
                    fontFamily:ui.fontBody,fontSize:12.5,color:ui.textSub}}>
                    <span>
                      {(page-1)*ORD_PER_PAGE + 1}–{Math.min(page*ORD_PER_PAGE, filtered.length)} من {filtered.length}
                    </span>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <button disabled={page <= 1} onClick={()=>setOrdPage(p => Math.max(1, p-1))}
                        style={{padding:"6px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                          fontFamily:ui.fontBody,fontSize:12,color: page<=1?"#D1D5DB":ui.text,
                          cursor: page<=1?"not-allowed":"pointer"}}>التالي ←</button>
                      <span style={{fontSize:12,color:ui.text,padding:"0 8px"}}>
                        صفحة {page} من {totalPages}
                      </span>
                      <button disabled={page >= totalPages} onClick={()=>setOrdPage(p => Math.min(totalPages, p+1))}
                        style={{padding:"6px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                          fontFamily:ui.fontBody,fontSize:12,color: page>=totalPages?"#D1D5DB":ui.text,
                          cursor: page>=totalPages?"not-allowed":"pointer"}}>→ السابق</button>
                    </div>
                  </div>
                )}
              </div>
              );
            })()
          )}

          {/* PRODUCTS */}
          {tab === "products" && (
            productFormRoute ? (
              <ProductForm
                mode={productFormRoute.mode}
                productId={productFormRoute.id}
                ui={ui} mob={mob} C={C}
                categories={PRODUCT_CATEGORIES}
                allTags={(() => { const s=new Set(); dbProducts.forEach(p => (p.tags||[]).forEach(t => s.add(t))); return Array.from(s); })()}
                allBrands={(() => { const s=new Set(); dbProducts.forEach(p => { if (p.brand) s.add(p.brand); }); return Array.from(s); })()}
                canEditAll={canEditAllProductFields}
                canSeeCost={canSeeCost}
                isSuper={isSuper}
                onBack={goProductsList}
                onSaved={()=>{ refreshProducts(); }}
                onDeleted={()=>{ refreshProducts(); goProductsList(); }}
                submitApproval={submitApproval}
              />
            ) : (() => {
              // ── KPI cards ────────────────────────────────────────────────
              const totalCount = dbProducts.length;
              const publishedCount = dbProducts.filter(p => p.status === "published" && !p.archived).length;
              const lowStockCount  = dbProducts.filter(p => (p.stock||0) <= (p.alert_threshold||0) && !p.archived).length;
              const invValue = dbProducts.reduce((s,p)=>s + ((Number(p.cost)||0) * (Number(p.stock)||0)), 0);

              // ── Brand list (for filter) ─────────────────────────────────
              const brandSet = new Set();
              dbProducts.forEach(p => { if (p.brand) brandSet.add(p.brand); });
              const brands = Array.from(brandSet).sort();

              // ── Filter pipeline ─────────────────────────────────────────
              const q = (prodSearch || "").trim().toLowerCase();
              const filtered = dbProducts.filter(p => {
                if (p.archived) return false;
                if (prodCatFil    !== "all" && p.category !== prodCatFil) return false;
                if (prodBrandFil  !== "all" && p.brand    !== prodBrandFil) return false;
                if (prodStatusFil !== "all" && p.status   !== prodStatusFil) return false;
                if (prodStockFil  !== "all") {
                  const stk = Number(p.stock)||0;
                  const thr = Number(p.alert_threshold)||0;
                  if (prodStockFil === "available" && stk <= thr) return false;
                  if (prodStockFil === "low"       && (stk === 0 || stk > thr)) return false;
                  if (prodStockFil === "out"       && stk > 0) return false;
                }
                if (q) {
                  const hay = `${p.name||""} ${p.sku||""} ${p.brand||""} ${p.slug||""}`.toLowerCase();
                  if (!hay.includes(q)) return false;
                }
                return true;
              });
              // Sort
              const sorted = filtered.slice();
              if (prodSort === "old")        sorted.sort((a,b)=>String(a.created_at).localeCompare(String(b.created_at)));
              else if (prodSort === "new")   sorted.sort((a,b)=>String(b.created_at).localeCompare(String(a.created_at)));
              else if (prodSort === "priceDesc") sorted.sort((a,b)=>(b.price||0)-(a.price||0));
              else if (prodSort === "priceAsc")  sorted.sort((a,b)=>(a.price||0)-(b.price||0));
              else if (prodSort === "stockAsc")  sorted.sort((a,b)=>(a.stock||0)-(b.stock||0));

              // ── Pagination ───────────────────────────────────────────────
              const totalPages = Math.max(1, Math.ceil(sorted.length / PROD_PER_PAGE));
              const page = Math.min(prodPage, totalPages);
              const pageRows = sorted.slice((page-1)*PROD_PER_PAGE, page*PROD_PER_PAGE);
              const selectedIds = Object.keys(prodSelected).filter(k => prodSelected[k]);
              const allOnPageSelected = pageRows.length > 0 && pageRows.every(p => prodSelected[p.id]);
              const togglePage = () => {
                const next = { ...prodSelected };
                if (allOnPageSelected) pageRows.forEach(p => { delete next[p.id]; });
                else                   pageRows.forEach(p => { next[p.id] = true; });
                setProdSelected(next);
              };

              const exportProductsCsv = () => {
                const head = ["#","SKU","الاسم","البراند","الفئة","السعر","المخزون","الحالة"];
                const rows = sorted.map(p => [
                  p.id, p.sku||"", p.name||"", p.brand||"", p.category||"",
                  p.price||0, p.stock||0, p.status||""
                ].map(v => `"${String(v).replace(/"/g,'""')}"`).join(","));
                const csv = "﻿" + [head.join(","), ...rows].join("\n");
                const url = URL.createObjectURL(new Blob([csv], { type:"text/csv;charset=utf-8" }));
                const a = document.createElement("a"); a.href = url;
                a.download = `nawra-products-${new Date().toISOString().slice(0,10)}.csv`;
                a.click(); URL.revokeObjectURL(url);
              };

              // Bulk handlers — small wrappers around PATCH/DELETE.
              const bulkPatch = async (patch) => {
                const ids = selectedIds.slice();
                if (!ids.length) return;
                if (!window.confirm(`تطبيق التغيير على ${ids.length} منتج؟`)) return;
                for (const id of ids) {
                  // eslint-disable-next-line no-await-in-loop
                  try { await fetch(`/api/products/${id}`, {
                    method:"PATCH", headers:{"Content-Type":"application/json"},
                    body: JSON.stringify(patch)
                  }); } catch {}
                }
                setProdSelected({}); refreshProducts();
                setSavedToast(`تم تحديث ${ids.length} منتج`); setTimeout(()=>setSavedToast(""), 2000);
              };
              const bulkDelete = async () => {
                const ids = selectedIds.slice();
                if (!ids.length) return;
                if (!isSuper) { alert("الحذف يتطلب Super Admin"); return; }
                if (!window.confirm(`حذف ${ids.length} منتج نهائياً؟`)) return;
                for (const id of ids) {
                  // eslint-disable-next-line no-await-in-loop
                  try { await fetch(`/api/products/${id}`, { method:"DELETE" }); } catch {}
                }
                setProdSelected({}); refreshProducts();
                setSavedToast(`تم حذف ${ids.length} منتج`); setTimeout(()=>setSavedToast(""), 2000);
              };

              // Stock-status colour helper for the المخزون column.
              const stockTone = (p) => {
                const stk = Number(p.stock)||0;
                const thr = Number(p.alert_threshold)||0;
                if (stk === 0) return { c:"#DC2626", txt:"نفذ" };
                if (stk <= thr) return { c:"#D97706", txt:`${stk} (منخفض)` };
                return { c:"#16A34A", txt:`${stk}` };
              };

              return (
              <div>
                {/* Top bar */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:0}}>المنتجات</h2>
                    <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>إدارة الكتالوج</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={exportProductsCsv} disabled={sorted.length===0}
                      style={{padding:"8px 14px",background:"transparent",border:ui.border,borderRadius:6,
                        fontFamily:ui.fontBody,fontSize:12.5,color: sorted.length===0?ui.textSub:ui.text,
                        cursor: sorted.length===0?"not-allowed":"pointer",display:"flex",alignItems:"center",gap:5}}>
                      تصدير CSV
                    </button>
                    {canManageProducts && (
                      <button onClick={goProductNew}
                        style={{padding:"8px 16px",background:ui.text,color:"#fff",border:"none",borderRadius:6,
                          fontFamily:ui.fontBody,fontSize:12.5,fontWeight:500,cursor:"pointer",display:"flex",alignItems:"center",gap:5}}>
                        <AdmIcon name="plus" size={13}/> إضافة منتج
                      </button>
                    )}
                  </div>
                </div>

                {/* KPI cards */}
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:14}}>
                  <Metric label="إجمالي المنتجات" value={totalCount} />
                  <Metric label="منشور"            value={publishedCount} />
                  <div style={{background:ui.cardBg,border:`0.5px solid ${lowStockCount>0?"#FCD34D":"#E5E5E5"}`,borderRadius:ui.radius,padding:"14px 16px"}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>منخفض المخزون</div>
                    <div style={{fontSize:mob?20:24,color: lowStockCount>0 ? "#D97706" : ui.text,fontFamily:ui.fontHead,fontWeight:500,lineHeight:1.1}}>
                      {lowStockCount}
                    </div>
                  </div>
                  <Metric label="قيمة المخزون" value={Math.round(invValue).toLocaleString()} suffix="ج" />
                </div>

                {/* Filter bar */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"12px 14px",marginBottom:12,
                  display:"grid",gap:8,gridTemplateColumns: mob ? "1fr" : "minmax(220px,2fr) repeat(5, minmax(0,1fr))"}}>
                  <input value={prodSearch} onChange={e=>setProdSearch(e.target.value)}
                    placeholder="بحث بالاسم أو SKU..."
                    style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                      fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl"}}/>
                  <select value={prodCatFil} onChange={e=>setProdCatFil(e.target.value)}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل الفئات</option>
                    {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                  <select value={prodBrandFil} onChange={e=>setProdBrandFil(e.target.value)}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل البراندات</option>
                    {brands.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                  <select value={prodStockFil} onChange={e=>setProdStockFil(e.target.value)}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل المخزون</option>
                    <option value="available">متوفر</option>
                    <option value="low">منخفض</option>
                    <option value="out">نفذ</option>
                  </select>
                  <select value={prodStatusFil} onChange={e=>setProdStatusFil(e.target.value)}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل الحالات</option>
                    <option value="published">منشور</option>
                    <option value="draft">مسودة</option>
                  </select>
                  <select value={prodSort} onChange={e=>setProdSort(e.target.value)}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="new">الأحدث</option>
                    <option value="old">الأقدم</option>
                    <option value="priceDesc">الأعلى سعراً</option>
                    <option value="priceAsc">الأقل سعراً</option>
                    <option value="stockAsc">الأقل مخزوناً</option>
                  </select>
                </div>

                {/* Result count */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                  <span style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                    {sorted.length === dbProducts.length
                      ? `${dbProducts.length} منتج`
                      : `${sorted.length} من ${dbProducts.length} منتج`}
                  </span>
                </div>

                {/* Bulk actions bar — sticky black */}
                {selectedIds.length > 0 && (
                  <div style={{position:"sticky",top:0,zIndex:40,
                    background:"#111111",borderRadius:ui.radius,padding:"10px 14px",marginBottom:10,
                    display:"flex",flexWrap:"wrap",alignItems:"center",gap:10,color:"#fff"}}>
                    <span style={{fontSize:12.5,fontFamily:ui.fontBody,fontWeight:600}}>
                      تم تحديد {selectedIds.length} منتج
                    </span>
                    <div style={{flex:1}}/>
                    <select onChange={e=>{ if(e.target.value){ bulkPatch({ category:e.target.value }); e.target.value=""; } }} defaultValue=""
                      style={{padding:"6px 10px",border:"1px solid #444",borderRadius:6,background:"#222",color:"#fff",
                        fontFamily:ui.fontBody,fontSize:12,outline:"none"}}>
                      <option value="">تغيير الفئة...</option>
                      {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <button onClick={()=>bulkPatch({ status:"published" })}
                      style={{padding:"6px 11px",border:"1px solid #444",background:"#222",color:"#fff",borderRadius:6,
                        fontFamily:ui.fontBody,fontSize:12,cursor:"pointer"}}>
                      نشر
                    </button>
                    <button onClick={()=>bulkPatch({ status:"draft" })}
                      style={{padding:"6px 11px",border:"1px solid #444",background:"#222",color:"#fff",borderRadius:6,
                        fontFamily:ui.fontBody,fontSize:12,cursor:"pointer"}}>
                      تحويل لمسودة
                    </button>
                    {isSuper && (
                      <button onClick={bulkDelete}
                        style={{padding:"6px 11px",border:"1px solid #7F1D1D",background:"#7F1D1D",color:"#fff",borderRadius:6,
                          fontFamily:ui.fontBody,fontSize:12,cursor:"pointer"}}>
                        حذف
                      </button>
                    )}
                    <button onClick={()=>setProdSelected({})}
                      style={{padding:"6px 10px",border:"none",background:"transparent",color:"#9CA3AF",
                        fontFamily:ui.fontBody,fontSize:12,cursor:"pointer"}}>
                      إلغاء التحديد ✕
                    </button>
                  </div>
                )}

                {/* Table / empty state */}
                {dbProducts.length === 0 ? (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"40px 22px",textAlign:"center"}}>
                    <div style={{fontSize:42,marginBottom:10}}>🧴</div>
                    <div style={{fontSize:15,color:ui.text,fontFamily:ui.fontBody,fontWeight:600,marginBottom:6}}>لا توجد منتجات بعد</div>
                    <div style={{fontSize:13,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:16}}>ابدأ بإضافة منتجك الأول للظهور في المتجر</div>
                    {canManageProducts && (
                      <button onClick={goProductNew}
                        style={{padding:"10px 22px",background:ui.text,color:"#fff",border:"none",borderRadius:6,
                          fontFamily:ui.fontBody,fontSize:13,fontWeight:500,cursor:"pointer"}}>
                        + إضافة أول منتج
                      </button>
                    )}
                  </div>
                ) : sorted.length === 0 ? (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"34px 18px",textAlign:"center"}}>
                    <div style={{fontSize:32,marginBottom:8}}>🔎</div>
                    <div style={{fontSize:14,color:ui.text,fontFamily:ui.fontBody,fontWeight:500,marginBottom:6}}>لا توجد منتجات تطابق الفلاتر</div>
                    <button onClick={()=>{ setProdSearch(""); setProdCatFil("all"); setProdBrandFil("all"); setProdStockFil("all"); setProdStatusFil("all"); }}
                      style={{marginTop:8,padding:"7px 16px",background:"transparent",border:ui.border,borderRadius:6,
                        fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,cursor:"pointer"}}>
                      إعادة ضبط الفلاتر
                    </button>
                  </div>
                ) : (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:900}}>
                      <thead>
                        <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                          <th style={{padding:"10px 12px",width:36}}>
                            <input type="checkbox" checked={allOnPageSelected} onChange={togglePage}
                              style={{cursor:"pointer",accentColor:ui.text}}/>
                          </th>
                          {["المنتج","SKU","الفئة","السعر","المخزون","منشور","الإجراءات"].map(h=>(
                            <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {pageRows.map(p => {
                          const thumb = (p.images && p.images[0]) || null;
                          const ton = stockTone(p);
                          const isPub = p.status === "published";
                          return (
                            <tr key={p.id} style={{borderTop:"0.5px solid #EEE"}}>
                              <td style={{padding:"10px 12px"}}>
                                <input type="checkbox"
                                  checked={!!prodSelected[p.id]}
                                  onChange={e=>setProdSelected(s => ({ ...s, [p.id]: e.target.checked }))}
                                  style={{cursor:"pointer",accentColor:ui.text}}/>
                              </td>
                              <td style={{padding:"11px 12px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:10}}>
                                  <div style={{width:36,height:36,borderRadius:6,overflow:"hidden",background:"#F3F4F6",flexShrink:0,
                                    display:"flex",alignItems:"center",justifyContent:"center",fontSize:14}}>
                                    {thumb ? <img src={thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "🧴"}
                                  </div>
                                  <div style={{minWidth:0}}>
                                    <div style={{fontSize:13,color:ui.text,fontWeight:500,
                                      overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:260}}>{p.name}</div>
                                    {p.brand && <div style={{fontSize:10,color:ui.textSub,letterSpacing:"0.12em",textTransform:"uppercase",marginTop:2}}>{p.brand}</div>}
                                  </div>
                                </div>
                              </td>
                              <td style={{padding:"11px 12px",fontSize:11.5,color:ui.textSub,fontFamily:"monospace",whiteSpace:"nowrap"}}>{p.sku || "—"}</td>
                              <td style={{padding:"11px 12px",fontSize:12.5,color:ui.text,whiteSpace:"nowrap"}}>{p.category || "—"}</td>
                              <td style={{padding:"11px 12px",fontSize:13,color:ui.text,fontWeight:500,whiteSpace:"nowrap"}}>
                                {(p.price||0).toLocaleString()} <span style={{fontSize:11,color:ui.textSub}}>ج</span>
                                {p.price_before > 0 && p.price_before > p.price && (
                                  <span style={{fontSize:11,color:ui.textSub,textDecoration:"line-through",marginInlineStart:6}}>
                                    {p.price_before.toLocaleString()}
                                  </span>
                                )}
                              </td>
                              <td style={{padding:"11px 12px",fontSize:12.5,fontWeight:500,color:ton.c,whiteSpace:"nowrap"}}>{ton.txt}</td>
                              <td style={{padding:"11px 12px"}}>
                                {/* Inline publish toggle */}
                                <button onClick={async ()=>{
                                  const next = isPub ? "draft" : "published";
                                  // Optimistic
                                  setDbProducts(prev => prev.map(x => x.id === p.id ? { ...x, status: next } : x));
                                  try {
                                    await fetch(`/api/products/${p.id}`, {
                                      method:"PATCH", headers:{"Content-Type":"application/json"},
                                      body: JSON.stringify({ status: next })
                                    });
                                  } catch {} refreshProducts();
                                }}
                                  disabled={!canManageProducts}
                                  title={isPub ? "إيقاف النشر" : "نشر"}
                                  style={{ width:38, height:22, borderRadius:11, border:"none",
                                    background: isPub ? "#16A34A" : "#D4D4D4", position:"relative",
                                    cursor: canManageProducts ? "pointer" : "not-allowed", transition:"background .2s",
                                    opacity: canManageProducts ? 1 : 0.6 }}>
                                  <span style={{ position:"absolute", top:2, [isPub?"left":"right"]:2, width:18, height:18,
                                    background:"#fff", borderRadius:"50%", transition:"all .2s",
                                    boxShadow:"0 1px 2px rgba(0,0,0,.2)" }}/>
                                </button>
                              </td>
                              <td style={{padding:"11px 12px",whiteSpace:"nowrap"}}>
                                <div style={{display:"flex",gap:4}}>
                                  <button onClick={()=>window.open(`/#product-${p.id}`, "_blank")}
                                    title="معاينة في المتجر"
                                    style={{background:"transparent",border:ui.border,padding:"5px 8px",cursor:"pointer",borderRadius:5,fontSize:13}}>👁</button>
                                  <button onClick={()=>goProductEdit(p.id)}
                                    title="تعديل"
                                    disabled={!canManageProducts}
                                    style={{background:"transparent",border:ui.border,padding:"5px 8px",
                                      cursor: canManageProducts ? "pointer" : "not-allowed", borderRadius:5, fontSize:13,
                                      opacity: canManageProducts ? 1 : 0.5}}>✏️</button>
                                  <ProductRowMenu
                                    product={p}
                                    ui={ui} isSuper={isSuper}
                                    onDuplicate={async ()=>{
                                      try {
                                        const { id, sku, created_at, updated_at, variants, ...rest } = p;
                                        const body = { ...rest, name: `${p.name} (نسخة)`, slug: null, sku: null, status:"draft", id: undefined };
                                        const r = await fetch("/api/products", {
                                          method:"POST", headers:{"Content-Type":"application/json"},
                                          body: JSON.stringify(body)
                                        });
                                        if (r.ok) { refreshProducts(); setSavedToast("تم تكرار المنتج"); setTimeout(()=>setSavedToast(""), 1800); }
                                      } catch {}
                                    }}
                                    onArchive={async ()=>{
                                      try {
                                        await fetch(`/api/products/${p.id}`, {
                                          method:"PATCH", headers:{"Content-Type":"application/json"},
                                          body: JSON.stringify({ archived: true })
                                        });
                                        refreshProducts();
                                      } catch {}
                                    }}
                                    onDelete={async ()=>{
                                      if (isSuper) {
                                        if (!window.confirm("حذف المنتج نهائياً؟")) return;
                                        try { await fetch(`/api/products/${p.id}`, { method:"DELETE" }); } catch {}
                                        refreshProducts();
                                      } else {
                                        await submitApproval({
                                          type: "product_delete",
                                          target_id: String(p.id),
                                          target_label: p.name,
                                          reason: window.prompt("سبب الحذف (اختياري):") || "",
                                        });
                                      }
                                    }}
                                  />
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {sorted.length > PROD_PER_PAGE && (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12,
                    fontFamily:ui.fontBody,fontSize:12.5,color:ui.textSub}}>
                    <span>عرض {(page-1)*PROD_PER_PAGE + 1}–{Math.min(page*PROD_PER_PAGE, sorted.length)} من {sorted.length} منتج</span>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <button disabled={page <= 1} onClick={()=>setProdPage(p => Math.max(1, p-1))}
                        style={{padding:"6px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                          fontFamily:ui.fontBody,fontSize:12,color: page<=1?"#D1D5DB":ui.text,
                          cursor: page<=1?"not-allowed":"pointer"}}>التالي ←</button>
                      <span style={{fontSize:12,color:ui.text,padding:"0 8px"}}>صفحة {page} من {totalPages}</span>
                      <button disabled={page >= totalPages} onClick={()=>setProdPage(p => Math.min(totalPages, p+1))}
                        style={{padding:"6px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                          fontFamily:ui.fontBody,fontSize:12,color: page>=totalPages?"#D1D5DB":ui.text,
                          cursor: page>=totalPages?"not-allowed":"pointer"}}>→ السابق</button>
                    </div>
                  </div>
                )}
              </div>
              );
            })()
          )}

          {/* CUSTOMERS */}
          {tab === "customers" && (
            customerDetailEmail ? (
              <CustomerDetailsPage
                email={customerDetailEmail}
                ui={ui} mob={mob} C={C}
                isSuper={isSuper}
                canManageOrders={canManageOrders}
                onBack={goCustomersList}
                refreshList={refreshCustomers}
              />
            ) : (() => {
              const topSpend = Math.max(1, ...custRows.map(u => Number(u.totalSpent) || 0));
              const selectedIds = Object.keys(custSelected).filter(k => custSelected[k]);
              const allOnPageSelected = custRows.length > 0 && custRows.every(u => custSelected[u.email]);
              const togglePage = () => {
                const next = { ...custSelected };
                if (allOnPageSelected) custRows.forEach(u => { delete next[u.email]; });
                else custRows.forEach(u => { next[u.email] = true; });
                setCustSelected(next);
              };

              // CSV export — fetches the full filtered set (bulk=1) to export beyond current page
              const exportCustomersCsv = async () => {
                const r = await fetch(`/api/users?${buildCustQuery({ bulk: true })}`);
                const data = r.ok ? await r.json() : null;
                const rows = (data && data.rows) || custRows;
                if (!rows.length) { alert("لا توجد عملاء للتصدير."); return; }
                const head = ["البريد","الاسم","الهاتف","الفئة","عدد الطلبات","إجمالي الإنفاق","آخر طلب","تاريخ التسجيل","آخر دخول","حظر"];
                const esc = (v) => { const s = v==null?"":String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
                const lines = [head.join(",")];
                rows.forEach(u => lines.push([
                  u.email, u.name||"", u.phone||"",
                  CUST_CAT_LABEL[u.category] || u.category || "—",
                  u.totalOrders||0, u.totalSpent||0,
                  u.lastOrder||"", u.registered_at||"", u.last_login_date||"",
                  u.blocked ? "نعم" : "لا"
                ].map(esc).join(",")));
                const url = URL.createObjectURL(new Blob(["﻿" + lines.join("\n")], { type:"text/csv;charset=utf-8" }));
                const a = document.createElement("a"); a.href = url;
                a.download = `nawra-customers-${new Date().toISOString().slice(0,10)}.csv`;
                a.click(); URL.revokeObjectURL(url);
              };

              const sendBulkEmail = async () => {
                if (!selectedIds.length || !bulkEmailDraft.subject.trim() || !bulkEmailDraft.body.trim()) {
                  alert("اختر العملاء واكتب الموضوع والنص."); return;
                }
                if (!window.confirm(`إرسال الإيميل إلى ${selectedIds.length} عميل؟`)) return;
                try {
                  const r = await fetch("/api/users/bulk-email", {
                    method:"POST", headers:{"Content-Type":"application/json"},
                    body: JSON.stringify({
                      recipients: selectedIds,
                      subject: bulkEmailDraft.subject,
                      body: bulkEmailDraft.body,
                      actor_id: (authUser && authUser.email) || null,
                      actor_name: (authUser && authUser.name) || "Admin",
                    })
                  });
                  const data = await r.json();
                  if (r.ok) {
                    setSavedToast(`تم الإرسال: ${data.sent}/${selectedIds.length}`);
                    setTimeout(()=>setSavedToast(""), 2500);
                    setBulkEmailOpen(false);
                    setBulkEmailDraft({ subject:"", body:"" });
                    setCustSelected({});
                  } else {
                    alert(`فشل الإرسال: ${data.error || r.status}`);
                  }
                } catch (e) { alert(`خطأ في الشبكة: ${e.message}`); }
              };

              const totalPages = Math.max(1, Math.ceil(custTotal / custPerPage));
              const page = Math.min(custPage, totalPages);

              return (
              <div>
                {/* Top bar */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:8}}>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:0}}>العملاء</h2>
                    <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>إدارة قاعدة بيانات العملاء</div>
                  </div>
                  <div style={{display:"flex",gap:8}}>
                    <button onClick={exportCustomersCsv} disabled={custTotal===0}
                      style={{padding:"8px 14px",background:"transparent",border:ui.border,borderRadius:6,
                        fontFamily:ui.fontBody,fontSize:12.5,color: custTotal===0?ui.textSub:ui.text,
                        cursor: custTotal===0?"not-allowed":"pointer"}}>تصدير CSV</button>
                  </div>
                </div>

                {/* 5 KPI cards */}
                <div style={{display:"grid",gridTemplateColumns: mob?"1fr 1fr":"repeat(5,1fr)",gap:10,marginBottom:14}}>
                  <Metric label="إجمالي العملاء" value={custAggregates?.total_customers ?? "—"} />
                  <Metric label="جدد هذا الشهر"
                    value={custAggregates?.new_this_month ?? "—"}
                    changePct={custAggregates?.new_change_pct}
                    hint="عن الشهر السابق" />
                  <Metric label="عملاء VIP"      value={custAggregates?.vip_count ?? "—"} />
                  <Metric label="معدل العملاء المكررين" value={custAggregates ? `${custAggregates.repeat_rate_pct}%` : "—"} />
                  <Metric label="متوسط قيمة العميل (CLV)" value={custAggregates ? custAggregates.avg_clv.toLocaleString() : "—"} suffix="ج" />
                </div>

                {/* Filter bar */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"12px 14px",marginBottom:12,
                  display:"grid",gap:8,gridTemplateColumns: mob ? "1fr" : "minmax(220px,2fr) repeat(5, minmax(0,1fr))"}}>
                  <input value={custSearch} onChange={e=>setCustSearch(e.target.value)}
                    placeholder="بحث بالاسم أو الإيميل أو الهاتف..."
                    style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl"}}/>
                  <select value={custCategory} onChange={e=>setCustCategory(e.target.value)}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل الفئات</option>
                    {Object.entries(CUST_CAT_LABEL).map(([k,l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <input type="date" value={custRegFrom} onChange={e=>setCustRegFrom(e.target.value)} title="من تاريخ التسجيل"
                    style={{padding:"7px 9px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none"}}/>
                  <input type="date" value={custRegTo}   onChange={e=>setCustRegTo(e.target.value)}   title="إلى تاريخ التسجيل"
                    style={{padding:"7px 9px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none"}}/>
                  <input type="date" value={custOrderFrom} onChange={e=>setCustOrderFrom(e.target.value)} title="من تاريخ آخر طلب"
                    style={{padding:"7px 9px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none"}}/>
                  <select value={custSort} onChange={e=>setCustSort(e.target.value)}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="last_activity">آخر نشاط</option>
                    <option value="newest">الأحدث تسجيلاً</option>
                    <option value="top_spender">الأعلى إنفاقاً</option>
                    <option value="top_orders">الأكثر طلباً</option>
                  </select>
                </div>

                {/* Result count + loading indicator */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8,flexWrap:"wrap",gap:8}}>
                  <span style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                    {custLoading ? "جارٍ التحميل..." : `${custTotal} عميل`}
                  </span>
                </div>

                {/* Bulk actions bar */}
                {selectedIds.length > 0 && (
                  <div style={{position:"sticky",top:0,zIndex:40,background:"#111",borderRadius:ui.radius,padding:"10px 14px",marginBottom:10,
                    display:"flex",flexWrap:"wrap",alignItems:"center",gap:10,color:"#fff"}}>
                    <span style={{fontSize:12.5,fontFamily:ui.fontBody,fontWeight:600}}>تم تحديد {selectedIds.length} عميل</span>
                    <div style={{flex:1}}/>
                    <button onClick={()=>setBulkEmailOpen(true)}
                      style={{padding:"6px 11px",border:"1px solid #444",background:"#222",color:"#fff",borderRadius:6,fontFamily:ui.fontBody,fontSize:12,cursor:"pointer"}}>📧 إرسال إيميل جماعي</button>
                    <button onClick={exportCustomersCsv}
                      style={{padding:"6px 11px",border:"1px solid #444",background:"#222",color:"#fff",borderRadius:6,fontFamily:ui.fontBody,fontSize:12,cursor:"pointer"}}>تصدير المحدد</button>
                    <button onClick={()=>setCustSelected({})}
                      style={{padding:"6px 10px",border:"none",background:"transparent",color:"#9CA3AF",fontFamily:ui.fontBody,fontSize:12,cursor:"pointer"}}>إلغاء التحديد ✕</button>
                  </div>
                )}

                {/* Table / empty state */}
                {custTotal === 0 && !custLoading ? (
                  <Placeholder icon="users" title="لا توجد عملاء" body={custSearch || custCategory!=="all" || custRegFrom || custRegTo ? "جرب تعديل الفلاتر" : "هتبان قائمة العملاء هنا بعد أول طلب."} />
                ) : (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto",opacity: custLoading ? 0.6 : 1, transition:"opacity .15s"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:1100}}>
                      <thead>
                        <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                          <th style={{padding:"10px 12px",width:36}}>
                            <input type="checkbox" checked={allOnPageSelected} onChange={togglePage} style={{cursor:"pointer",accentColor:ui.text}}/>
                          </th>
                          {["العميل","الهاتف","الطلبات","إجمالي الإنفاق","متوسط الطلب","آخر طلب","آخر نشاط","الفئة",""].map(h=>(
                            <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {custRows.map(u => {
                          const tier = CUST_CAT_STYLE[u.category] || CUST_CAT_STYLE.regular;
                          const avg = u.totalOrders ? Math.round((Number(u.totalSpent)||0) / Number(u.totalOrders)) : 0;
                          const barPct = Math.round(((Number(u.totalSpent)||0) / topSpend) * 100);
                          const initial = ((u.name||u.email||"?")[0]||"?").toUpperCase();
                          const phoneDigits = String(u.phone||"").replace(/\D/g,"");
                          const waHref = phoneDigits ? `https://wa.me/${phoneDigits.startsWith("20") ? phoneDigits : `20${phoneDigits.replace(/^0+/,"")}`}` : null;
                          return (
                            <tr key={u.email} onClick={()=>goCustomer(u.email)}
                              style={{borderTop:"0.5px solid #EEE",cursor:"pointer",transition:"background .15s"}}
                              onMouseEnter={e=>e.currentTarget.style.background="#FAFAFA"}
                              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                              <td style={{padding:"10px 12px"}} onClick={e=>e.stopPropagation()}>
                                <input type="checkbox" checked={!!custSelected[u.email]}
                                  onChange={e=>setCustSelected(s => ({...s, [u.email]: e.target.checked}))}
                                  style={{cursor:"pointer",accentColor:ui.text}}/>
                              </td>
                              <td style={{padding:"11px 12px"}}>
                                <div style={{display:"flex",alignItems:"center",gap:10}}>
                                  <div style={{width:36,height:36,borderRadius:"50%",background:tier.bg,color:tier.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:600,flexShrink:0}}>{initial}</div>
                                  <div style={{minWidth:0}}>
                                    <div style={{fontSize:13,color:ui.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{u.name || "—"}</div>
                                    <div style={{fontSize:11,color:ui.textSub,marginTop:2,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:200}}>{u.email}</div>
                                  </div>
                                </div>
                              </td>
                              <td style={{padding:"11px 12px",fontSize:12,color:ui.textSub,fontFamily:"monospace",whiteSpace:"nowrap"}} onClick={e=>e.stopPropagation()}>
                                {u.phone ? (
                                  <div style={{display:"flex",alignItems:"center",gap:6,direction:"ltr"}}>
                                    <span>{u.phone}</span>
                                    {waHref && <a href={waHref} target="_blank" rel="noreferrer" title="فتح واتساب" style={{textDecoration:"none",fontSize:14}}>💬</a>}
                                  </div>
                                ) : "—"}
                              </td>
                              <td style={{padding:"11px 12px",fontSize:13,color:ui.text,fontWeight:500,whiteSpace:"nowrap"}}>{u.totalOrders||0}</td>
                              <td style={{padding:"11px 12px",minWidth:160}}>
                                <div style={{display:"flex",alignItems:"center",gap:8}}>
                                  <span style={{fontSize:13,color:ui.text,fontWeight:500,whiteSpace:"nowrap"}}>{(u.totalSpent||0).toLocaleString()} <span style={{fontSize:10.5,color:ui.textSub}}>ج</span></span>
                                  <div style={{flex:1,height:4,background:"#F3F4F6",borderRadius:2,overflow:"hidden",minWidth:40}}>
                                    <div style={{width:`${barPct}%`,height:"100%",background:tier.fg}}/>
                                  </div>
                                </div>
                              </td>
                              <td style={{padding:"11px 12px",fontSize:12.5,color:ui.text,whiteSpace:"nowrap"}}>{avg.toLocaleString()} <span style={{fontSize:10.5,color:ui.textSub}}>ج</span></td>
                              <td style={{padding:"11px 12px",fontSize:11.5,color:ui.textSub,whiteSpace:"nowrap"}} title={u.lastOrder || ""}>
                                {u.lastOrder ? relTime(new Date(u.lastOrder).getTime()) : "—"}
                              </td>
                              <td style={{padding:"11px 12px",fontSize:11.5,color:ui.textSub,whiteSpace:"nowrap"}}>
                                {u.last_login_date ? relTime(new Date(u.last_login_date).getTime()) : "—"}
                              </td>
                              <td style={{padding:"11px 12px"}}>
                                <span style={{fontSize:10.5,padding:"3px 10px",borderRadius:20,background:tier.bg,color:tier.fg,whiteSpace:"nowrap",fontWeight:500}}>
                                  {CUST_CAT_LABEL[u.category] || u.category || "—"}
                                </span>
                                {u.blocked && <span style={{fontSize:10,marginInlineStart:6,padding:"2px 7px",borderRadius:10,background:"#FEE2E2",color:"#B91C1C"}}>محظور</span>}
                              </td>
                              <td style={{padding:"11px 12px",whiteSpace:"nowrap"}} onClick={e=>e.stopPropagation()}>
                                <div style={{display:"flex",gap:4}}>
                                  <button onClick={()=>goCustomer(u.email)} title="عرض" style={{background:"transparent",border:ui.border,padding:"5px 8px",cursor:"pointer",borderRadius:5,fontSize:13}}>👁</button>
                                  <a href={`mailto:${u.email}`} title="إرسال إيميل" style={{background:"transparent",border:ui.border,padding:"4px 8px",cursor:"pointer",borderRadius:5,fontSize:13,textDecoration:"none",color:ui.text,display:"inline-flex",alignItems:"center"}}>📧</a>
                                  {waHref && <a href={waHref} target="_blank" rel="noreferrer" title="واتساب" style={{background:"transparent",border:ui.border,padding:"4px 8px",cursor:"pointer",borderRadius:5,fontSize:13,textDecoration:"none",color:ui.text,display:"inline-flex",alignItems:"center"}}>💬</a>}
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {custTotal > custPerPage && (
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginTop:12,
                    fontFamily:ui.fontBody,fontSize:12.5,color:ui.textSub}}>
                    <span>عرض {(page-1)*custPerPage + 1}–{Math.min(page*custPerPage, custTotal)} من {custTotal} عميل</span>
                    <div style={{display:"flex",gap:6,alignItems:"center"}}>
                      <button disabled={page <= 1} onClick={()=>setCustPage(p => Math.max(1, p-1))}
                        style={{padding:"6px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color: page<=1?"#D1D5DB":ui.text,cursor: page<=1?"not-allowed":"pointer"}}>التالي ←</button>
                      <span style={{fontSize:12,color:ui.text,padding:"0 8px"}}>صفحة {page} من {totalPages}</span>
                      <button disabled={page >= totalPages} onClick={()=>setCustPage(p => Math.min(totalPages, p+1))}
                        style={{padding:"6px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color: page>=totalPages?"#D1D5DB":ui.text,cursor: page>=totalPages?"not-allowed":"pointer"}}>→ السابق</button>
                    </div>
                  </div>
                )}

                {/* Bulk email modal */}
                {bulkEmailOpen && (
                  <div onClick={()=>setBulkEmailOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
                    <div onClick={e=>e.stopPropagation()} style={{background:ui.cardBg,maxWidth:520,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
                      <h3 style={{fontSize:15,fontWeight:600,color:ui.text,margin:"0 0 4px"}}>إرسال إيميل جماعي</h3>
                      <div style={{fontSize:12.5,color:ui.textSub,marginBottom:12}}>إلى {selectedIds.length} عميل · المتغيرات: {`{{customer_name}}, {{order_count}}, {{total_spent}}`}</div>
                      <label style={{display:"block",fontSize:12,color:ui.text,marginBottom:5,fontWeight:500}}>الموضوع</label>
                      <input value={bulkEmailDraft.subject} onChange={e=>setBulkEmailDraft({...bulkEmailDraft, subject:e.target.value})}
                        style={{width:"100%",padding:"9px 11px",border:ui.border,borderRadius:6,fontSize:13,marginBottom:10,boxSizing:"border-box",direction:"rtl"}}/>
                      <label style={{display:"block",fontSize:12,color:ui.text,marginBottom:5,fontWeight:500}}>النص</label>
                      <textarea rows={8} value={bulkEmailDraft.body} onChange={e=>setBulkEmailDraft({...bulkEmailDraft, body:e.target.value})}
                        placeholder={`أهلاً {{customer_name}},\n\nبشكر إنك جزء من نوّرَة. لديك ${`{{order_count}}`} طلب سابق...`}
                        style={{width:"100%",padding:"9px 11px",border:ui.border,borderRadius:6,fontSize:13,resize:"vertical",minHeight:160,boxSizing:"border-box",direction:"rtl",fontFamily:ui.fontBody}}/>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
                        <button onClick={()=>setBulkEmailOpen(false)} style={{padding:"8px 16px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.textSub,cursor:"pointer"}}>إلغاء</button>
                        <button onClick={sendBulkEmail} style={{padding:"8px 18px",background:ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:12.5,fontWeight:500,cursor:"pointer"}}>إرسال</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              );
            })()
          )}

          {/* ─── ADD PRODUCT — legacy tab redirects to the new route ────── */}
          {tab === "add-product" && (
            <div>
              {(() => { goProductNew(); return null; })()}
            </div>
          )}

          {/* ─── INVENTORY — movement-based ─────────────────────────────── */}
          {tab === "inventory" && (() => {
            // Aggregates (per product calc — never depends on others' state)
            const totalProducts = dbProducts.length;
            const totalAvailable = dbProducts.reduce((s,p)=>s+(p.stock||0), 0);
            const totalReserved  = dbProducts.reduce((s,p)=>s+(p.stock_reserved||0), 0);
            const totalDamaged   = dbProducts.reduce((s,p)=>s+(p.stock_damaged||0),  0);
            const totalCostValue = dbProducts.reduce((s,p)=>s+((Number(p.cost)||0) * (p.stock||0)), 0);

            const stockBadge = (p) => {
              if ((p.stock||0) <= 0) return { bg:"#FEE2E2", fg:"#B91C1C", l:"نفد" };
              if ((p.stock||0) <= (p.alert_threshold||0)) return { bg:"#FEF3C7", fg:"#92400E", l:"قارب النفاد" };
              return { bg:"#DCFCE7", fg:"#15803D", l:"متاح" };
            };
            const lowStock = dbProducts.filter(p => (p.stock||0) <= (p.alert_threshold||0));

            const filteredProducts = dbProducts.filter(p => {
              if (invSearch) {
                const q = invSearch.toLowerCase();
                if (!(p.name||"").toLowerCase().includes(q)
                  && !(p.sku||"").toLowerCase().includes(q)
                  && !(p.brand||"").toLowerCase().includes(q)) return false;
              }
              if (invCatFil !== "all" && p.category !== invCatFil) return false;
              const isOut = (p.stock||0) <= 0;
              const isLow = !isOut && (p.stock||0) <= (p.alert_threshold||0);
              if (invStatusFil === "out" && !isOut) return false;
              if (invStatusFil === "low" && !isLow) return false;
              if (invStatusFil === "available" && (isOut || isLow)) return false;
              return true;
            });

            const MOVEMENT_META = {
              in:               { l:"وارد جديد",       color:"#16A34A", icon:"↓" },
              out:              { l:"صرف",             color:"#F97316", icon:"↑" },
              customer_order:   { l:"طلب عميل",        color:"#3B82F6", icon:"⇆" },
              shipped:          { l:"شحن",             color:"#0EA5E9", icon:"🚚" },
              order_cancelled:  { l:"إلغاء طلب",       color:"#6B7280", icon:"↩" },
              return_good:      { l:"مرتجع صالح",      color:"#22C55E", icon:"↩" },
              damaged:          { l:"هالك",             color:"#DC2626", icon:"⚠" },
              stock_take:       { l:"جرد",             color:"#6B7280", icon:"≡" },
              stock_take_legacy:{ l:"تعديل كمية",      color:"#9CA3AF", icon:"≡" },
            };

            const fmtDate = (s) => {
              if (!s) return "—";
              try {
                const d = new Date(s.replace(" ","T")+"Z");
                return d.toLocaleDateString("ar-EG", { day:"2-digit", month:"2-digit" }) + " " +
                       d.toLocaleTimeString("ar-EG", { hour:"2-digit", minute:"2-digit" });
              } catch { return s; }
            };

            return (
              <div>
                {/* Top action bar */}
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(3,1fr)",gap:10,marginBottom:14}}>
                  <button onClick={()=>setStockInOpen(true)}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      background:"#16A34A",color:"#fff",border:"none",padding:"12px",cursor:"pointer",
                      fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                    <AdmIcon name="plus" size={15}/> وارد جديد
                  </button>
                  <button onClick={()=>setStockOutOpen(true)}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      background:"#F97316",color:"#fff",border:"none",padding:"12px",cursor:"pointer",
                      fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                    <AdmIcon name="package" size={15}/> صرف / تخفيض
                  </button>
                  <button onClick={()=>{
                      const init = {};
                      dbProducts.forEach(p => { init[p.id] = String(p.stock || 0); });
                      setStockTakeRows(init); setStockTakeOpen(true);
                    }}
                    style={{display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                      background:ui.text,color:"#fff",border:"none",padding:"12px",cursor:"pointer",
                      fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                    <AdmIcon name="chart-bar" size={15}/> جرد المخزون
                  </button>
                </div>

                {/* 5 metric cards */}
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(5,1fr)",gap:10,marginBottom:14}}>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>إجمالي المنتجات</div>
                    <div style={{fontSize:mob?20:24,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>{totalProducts}</div>
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px",borderTop:`3px solid #16A34A`}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>المتاح للبيع</div>
                    <div style={{fontSize:mob?20:24,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>{totalAvailable.toLocaleString()}</div>
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px",borderTop:`3px solid #F97316`}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>المحجوز للطلبات</div>
                    <div style={{fontSize:mob?20:24,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>{totalReserved.toLocaleString()}</div>
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px",borderTop:`3px solid #DC2626`}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>الهالك</div>
                    <div style={{fontSize:mob?20:24,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>{totalDamaged.toLocaleString()}</div>
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>قيمة المخزون (تكلفة)</div>
                    <div style={{fontSize:mob?17:20,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>
                      {totalCostValue.toLocaleString()}
                      <span style={{fontSize:11.5,color:ui.textSub,marginInlineStart:5,fontFamily:ui.fontBody}}>ج</span>
                    </div>
                  </div>
                </div>

                {/* Sub-tabs */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"6px 6px",marginBottom:12,display:"flex",gap:4,overflowX:"auto"}}>
                  {[["current","المخزون الحالي"],["history","سجل الحركات"],["alerts",`تنبيهات النفاد${lowStock.length ? ` (${lowStock.length})` : ""}`]].map(([k,l])=>(
                    <button key={k} onClick={()=>setInvSubTab(k)}
                      style={{padding:"7px 14px",border:"none",cursor:"pointer",borderRadius:6,
                        background: invSubTab===k ? ui.text : "transparent",
                        color: invSubTab===k ? "#fff" : ui.textSub,
                        fontSize:12.5, fontFamily:ui.fontBody, whiteSpace:"nowrap"}}>{l}</button>
                  ))}
                </div>

                {/* ── Current inventory (READ-ONLY) ─────────────────────── */}
                {invSubTab === "current" && (
                  <>
                    {/* Filters */}
                    <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"10px 12px",marginBottom:12,
                      display:"grid",gridTemplateColumns:mob?"1fr":"1fr 180px 180px auto",gap:10,alignItems:"center"}}>
                      <input type="search" placeholder="ابحث بالاسم أو SKU أو الماركة..."
                        value={invSearch} onChange={e=>setInvSearch(e.target.value)}
                        style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                          fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%"}}/>
                      <select value={invStatusFil} onChange={e=>setInvStatusFil(e.target.value)}
                        style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                          fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%"}}>
                        <option value="all">كل الحالات</option>
                        <option value="available">متاح</option>
                        <option value="low">قارب النفاد</option>
                        <option value="out">نفد</option>
                      </select>
                      <select value={invCatFil} onChange={e=>setInvCatFil(e.target.value)}
                        style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                          fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%"}}>
                        <option value="all">كل الفئات</option>
                        {PRODUCT_CATEGORIES.map(c=><option key={c} value={c}>{c}</option>)}
                      </select>
                      <button onClick={refreshProducts}
                        style={{display:"flex",alignItems:"center",gap:5,background:ui.cardBg,color:ui.text,
                          border:ui.border,padding:"8px 14px",cursor:"pointer",fontFamily:ui.fontBody,
                          fontSize:12,borderRadius:6,justifyContent:"center"}}>
                        <AdmIcon name="refresh" size={13}/> تحديث
                      </button>
                    </div>

                    {filteredProducts.length === 0 ? (
                      <Placeholder icon="package" title="لا توجد منتجات في النطاق المحدد"
                        body='عدّل الفلاتر أو أضف منتجات جديدة من تاب "إضافة منتج".' />
                    ) : (
                      <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:880}}>
                          <thead>
                            <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                              {["المنتج","الحالة","متاح","محجوز","هالك","الإجمالي","آخر حركة",""].map(h=>(
                                <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {filteredProducts.map(p => {
                              const b = stockBadge(p);
                              const total = (p.stock||0) + (p.stock_reserved||0) + (p.stock_damaged||0);
                              return (
                                <tr key={p.id} style={{borderTop:"0.5px solid #EEE"}}>
                                  <td style={{padding:"11px 12px"}}>
                                    <div style={{display:"flex",alignItems:"center",gap:10}}>
                                      <div style={{width:38,height:38,borderRadius:6,background:ui.sideBg,overflow:"hidden",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                        {p.images && p.images[0]
                                          ? <img src={p.images[0]} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                                          : <AdmIcon name="package" size={18}/>}
                                      </div>
                                      <div style={{minWidth:0}}>
                                        <div style={{fontSize:13,color:ui.text,fontWeight:500,fontFamily:ui.fontBody,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:220}}>{p.name}</div>
                                        <div style={{fontSize:10.5,color:ui.textSub,fontFamily:"monospace",marginTop:2}}>{p.sku || "—"}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{padding:"11px 12px"}}>
                                    <span style={{fontSize:10.5,padding:"3px 10px",borderRadius:20,background:b.bg,color:b.fg,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>{b.l}</span>
                                  </td>
                                  <td style={{padding:"11px 12px",fontSize:13,color:"#16A34A",fontWeight:500,fontFamily:ui.fontBody,textAlign:"center"}}>{p.stock||0}</td>
                                  <td style={{padding:"11px 12px",fontSize:13,color:"#F97316",fontFamily:ui.fontBody,textAlign:"center"}}>{p.stock_reserved||0}</td>
                                  <td style={{padding:"11px 12px",fontSize:13,color:(p.stock_damaged||0)>0?"#DC2626":ui.textSub,fontFamily:ui.fontBody,textAlign:"center"}}>{p.stock_damaged||0}</td>
                                  <td style={{padding:"11px 12px",fontSize:13,color:ui.text,fontWeight:500,fontFamily:ui.fontBody,textAlign:"center"}}>{total}</td>
                                  <td style={{padding:"11px 12px",fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>
                                    {p.updated_at ? fmtDate(p.updated_at) : "—"}
                                  </td>
                                  <td style={{padding:"11px 12px",textAlign:"left"}}>
                                    <button onClick={()=>{ setInvSubTab("history"); setMovementFilter({ product_id: p.id, type: "" }); }}
                                      title="سجل حركات هذا المنتج"
                                      style={{background:"transparent",border:ui.border,padding:"5px 10px",cursor:"pointer",fontFamily:ui.fontBody,fontSize:11,color:ui.text,borderRadius:4}}>
                                      السجل
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* ── Movement history ──────────────────────────────────── */}
                {invSubTab === "history" && (
                  <>
                    <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"10px 12px",marginBottom:12,
                      display:"grid",gridTemplateColumns:mob?"1fr":"1fr 200px auto",gap:10,alignItems:"center"}}>
                      <select value={movementFilter.product_id}
                        onChange={e=>setMovementFilter({...movementFilter, product_id:e.target.value})}
                        style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                          fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%"}}>
                        <option value="">كل المنتجات</option>
                        {dbProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                      </select>
                      <select value={movementFilter.type}
                        onChange={e=>setMovementFilter({...movementFilter, type:e.target.value})}
                        style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                          fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%"}}>
                        <option value="">كل أنواع الحركات</option>
                        {Object.entries(MOVEMENT_META).map(([k,v]) => <option key={k} value={k}>{v.l}</option>)}
                      </select>
                      <button onClick={()=>refreshMovements()}
                        style={{display:"flex",alignItems:"center",gap:5,background:ui.cardBg,color:ui.text,
                          border:ui.border,padding:"8px 14px",cursor:"pointer",fontFamily:ui.fontBody,
                          fontSize:12,borderRadius:6,justifyContent:"center"}}>
                        <AdmIcon name="refresh" size={13}/> تحديث
                      </button>
                    </div>

                    {movements.length === 0 ? (
                      <Placeholder icon="package" title="لا توجد حركات بعد"
                        body="هتظهر الحركات هنا — وارد، صرف، طلبات، شحن، مرتجعات." />
                    ) : (
                      <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:860}}>
                          <thead>
                            <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                              {["المنتج","نوع الحركة","الكمية","السبب/المرجع","المستخدم","التاريخ"].map(h=>(
                                <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {movements.map(m => {
                              const meta = MOVEMENT_META[m.type] || { l:m.type, color:ui.textSub, icon:"·" };
                              const delta = Number(m.quantity_delta) || 0;
                              return (
                                <tr key={m.id} style={{borderTop:"0.5px solid #EEE"}}>
                                  <td style={{padding:"11px 12px",fontSize:13,color:ui.text,fontFamily:ui.fontBody}}>{m.product_name || m.product_id}</td>
                                  <td style={{padding:"11px 12px"}}>
                                    <span style={{display:"inline-flex",alignItems:"center",gap:6,fontSize:11,padding:"3px 10px",borderRadius:20,
                                      background: meta.color + "22", color: meta.color, fontFamily:ui.fontBody, fontWeight:500, whiteSpace:"nowrap"}}>
                                      <span>{meta.icon}</span>{meta.l}
                                    </span>
                                  </td>
                                  <td style={{padding:"11px 12px",fontSize:13,fontFamily:"monospace",fontWeight:500,
                                    color: delta > 0 ? "#16A34A" : delta < 0 ? "#DC2626" : ui.textSub}}>
                                    {delta > 0 ? `+${delta}` : delta}
                                  </td>
                                  <td style={{padding:"11px 12px",fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,maxWidth:260,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                                    {m.reason || "—"}{m.reference ? ` · #${m.reference}` : ""}
                                  </td>
                                  <td style={{padding:"11px 12px",fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>{m.user_name || m.user_id || "—"}</td>
                                  <td style={{padding:"11px 12px",fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>{fmtDate(m.created_at)}</td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </>
                )}

                {/* ── Low-stock alerts ──────────────────────────────────── */}
                {invSubTab === "alerts" && (
                  lowStock.length === 0 ? (
                    <Placeholder icon="package" title="ولا منتج قارب على النفاد"
                      body="هتظهر هنا أي منتجات وصلت لحد التنبيه أو أقل." />
                  ) : (
                    <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:680}}>
                        <thead>
                          <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                            {["المنتج","المتاح","حد التنبيه","الناقص","إجراء"].map(h=>(
                              <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {lowStock.map(p => {
                            const shortfall = Math.max(0, (p.alert_threshold||0) * 3 - (p.stock||0));
                            return (
                              <tr key={p.id} style={{borderTop:"0.5px solid #EEE"}}>
                                <td style={{padding:"11px 12px",fontSize:13,color:ui.text,fontWeight:500,fontFamily:ui.fontBody}}>{p.name}</td>
                                <td style={{padding:"11px 12px",fontSize:13,color: (p.stock||0)===0 ? "#DC2626" : "#F97316",fontWeight:500,textAlign:"center"}}>{p.stock||0}</td>
                                <td style={{padding:"11px 12px",fontSize:12.5,color:ui.textSub,textAlign:"center"}}>{p.alert_threshold||0}</td>
                                <td style={{padding:"11px 12px",fontSize:12.5,color:"#B91C1C",fontWeight:500,fontFamily:"monospace",textAlign:"center"}}>{shortfall}</td>
                                <td style={{padding:"11px 12px"}}>
                                  <button onClick={()=>{ setStockInForm({ ...stockInForm, product_id: p.id }); setStockInOpen(true); }}
                                    style={{background:"#16A34A",color:"#fff",border:"none",padding:"5px 12px",cursor:"pointer",fontSize:11.5,fontFamily:ui.fontBody,borderRadius:4}}>
                                    وارد جديد
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )
                )}

                {/* ── Stock In modal ───────────────────────────────────── */}
                {stockInOpen && (
                  <div onClick={()=>!invBusy && setStockInOpen(false)}
                    style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
                    <div onClick={e=>e.stopPropagation()}
                      style={{background:ui.cardBg,maxWidth:480,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
                      <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"0 0 14px",display:"flex",alignItems:"center",gap:8}}>
                        <span style={{width:8,height:8,background:"#16A34A",borderRadius:"50%"}}/>
                        تسجيل وارد جديد
                      </h3>
                      <div style={{marginBottom:12}}>
                        <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>المنتج</label>
                        <select value={stockInForm.product_id} onChange={e=>setStockInForm({...stockInForm, product_id:e.target.value})}
                          style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%"}}>
                          <option value="">— اختر منتج —</option>
                          {dbProducts.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                        <div>
                          <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>الكمية</label>
                          <input type="text" inputMode="numeric" value={stockInForm.quantity}
                            onChange={e=>setStockInForm({...stockInForm, quantity:e.target.value.replace(/[^0-9]/g,"")})}
                            style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"ltr",textAlign:"left",width:"100%",boxSizing:"border-box"}}/>
                        </div>
                        <div>
                          <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>تكلفة الوحدة (ج)</label>
                          <input type="text" inputMode="decimal" value={stockInForm.unit_cost}
                            onChange={e=>setStockInForm({...stockInForm, unit_cost:e.target.value.replace(/[^0-9.]/g,"")})}
                            style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"ltr",textAlign:"left",width:"100%",boxSizing:"border-box"}}/>
                        </div>
                      </div>
                      <div style={{marginBottom:12}}>
                        <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>المورد</label>
                        <input value={stockInForm.supplier} onChange={e=>setStockInForm({...stockInForm, supplier:e.target.value})}
                          placeholder="اسم المورد"
                          style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%",boxSizing:"border-box"}}/>
                      </div>
                      <div style={{marginBottom:14}}>
                        <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>ملاحظات</label>
                        <textarea rows={2} value={stockInForm.notes} onChange={e=>setStockInForm({...stockInForm, notes:e.target.value})}
                          style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%",resize:"vertical",minHeight:50,boxSizing:"border-box"}}/>
                      </div>
                      <div style={{padding:"8px 12px",background:"#F0FDF4",borderRadius:6,fontSize:11.5,color:"#15803D",fontFamily:ui.fontBody,marginBottom:12}}>
                        ℹ سيتم إضافة الكمية لـ "المتاح للبيع" وإنشاء قيد مصروف تلقائي بالتكلفة في المالية.
                      </div>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                        <button onClick={()=>setStockInOpen(false)} disabled={invBusy}
                          style={{padding:"9px 18px",background:"transparent",border:ui.border,borderRadius:6,fontSize:13,color:ui.textSub,fontFamily:ui.fontBody,cursor:"pointer"}}>إلغاء</button>
                        <button onClick={submitStockIn}
                          disabled={invBusy || !stockInForm.product_id || !stockInForm.quantity}
                          style={{padding:"9px 20px",background: (!invBusy && stockInForm.product_id && stockInForm.quantity) ? "#16A34A" : "#9CA3AF",
                            color:"#fff",border:"none",borderRadius:6,fontSize:13,fontWeight:500,fontFamily:ui.fontBody,cursor:"pointer"}}>
                          {invBusy ? "جاري الحفظ..." : "تسجيل الوارد"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Stock Out modal ──────────────────────────────────── */}
                {stockOutOpen && (
                  <div onClick={()=>!invBusy && setStockOutOpen(false)}
                    style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
                    <div onClick={e=>e.stopPropagation()}
                      style={{background:ui.cardBg,maxWidth:460,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
                      <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"0 0 14px",display:"flex",alignItems:"center",gap:8}}>
                        <span style={{width:8,height:8,background:"#F97316",borderRadius:"50%"}}/>
                        طلب صرف / تخفيض
                      </h3>
                      <div style={{marginBottom:12}}>
                        <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>المنتج</label>
                        <select value={stockOutForm.product_id} onChange={e=>setStockOutForm({...stockOutForm, product_id:e.target.value})}
                          style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%"}}>
                          <option value="">— اختر منتج —</option>
                          {dbProducts.map(p => <option key={p.id} value={p.id}>{p.name} (متاح: {p.stock||0})</option>)}
                        </select>
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
                        <div>
                          <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>الكمية</label>
                          <input type="text" inputMode="numeric" value={stockOutForm.quantity}
                            onChange={e=>setStockOutForm({...stockOutForm, quantity:e.target.value.replace(/[^0-9]/g,"")})}
                            style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"ltr",textAlign:"left",width:"100%",boxSizing:"border-box"}}/>
                        </div>
                        <div>
                          <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>السبب</label>
                          <select value={stockOutForm.reason} onChange={e=>setStockOutForm({...stockOutForm, reason:e.target.value})}
                            style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%"}}>
                            <option value="تالف">تالف</option>
                            <option value="عينات">عينات</option>
                            <option value="استخدام شخصي">استخدام شخصي</option>
                            <option value="تخفيض جرد">تخفيض جرد</option>
                          </select>
                        </div>
                      </div>
                      <div style={{marginBottom:14}}>
                        <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>ملاحظات</label>
                        <textarea rows={2} value={stockOutForm.notes} onChange={e=>setStockOutForm({...stockOutForm, notes:e.target.value})}
                          style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"rtl",width:"100%",resize:"vertical",minHeight:50,boxSizing:"border-box"}}/>
                      </div>
                      <div style={{padding:"8px 12px",background:"#FFF7ED",borderRadius:6,fontSize:11.5,color:"#9A3412",fontFamily:ui.fontBody,marginBottom:12}}>
                        ⚠ سيتم إرسال الطلب لـ Super Admin للموافقة. لن يتم خصم الكمية إلا بعد الموافقة.
                      </div>
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
                        <button onClick={()=>setStockOutOpen(false)} disabled={invBusy}
                          style={{padding:"9px 18px",background:"transparent",border:ui.border,borderRadius:6,fontSize:13,color:ui.textSub,fontFamily:ui.fontBody,cursor:"pointer"}}>إلغاء</button>
                        <button onClick={submitStockOut}
                          disabled={invBusy || !stockOutForm.product_id || !stockOutForm.quantity}
                          style={{padding:"9px 20px",background: (!invBusy && stockOutForm.product_id && stockOutForm.quantity) ? "#F97316" : "#9CA3AF",
                            color:"#fff",border:"none",borderRadius:6,fontSize:13,fontWeight:500,fontFamily:ui.fontBody,cursor:"pointer"}}>
                          {invBusy ? "جاري الإرسال..." : "إرسال الطلب"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Stock Take modal ────────────────────────────────── */}
                {stockTakeOpen && (
                  <div onClick={()=>!invBusy && setStockTakeOpen(false)}
                    style={{position:"fixed",inset:0,background:"rgba(0,0,0,.5)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
                    <div onClick={e=>e.stopPropagation()}
                      style={{background:ui.cardBg,maxWidth:680,width:"100%",maxHeight:"85vh",padding:0,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)",display:"flex",flexDirection:"column"}}>
                      <div style={{padding:"18px 22px",borderBottom:ui.border}}>
                        <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:0}}>جرد المخزون</h3>
                        <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:4}}>
                          أدخل الكمية المعدودة فعلياً لكل منتج. سيتم تسجيل الفرق كحركة تعديل جرد.
                        </div>
                      </div>
                      <div style={{flex:1,overflowY:"auto",padding:"6px 0"}}>
                        <table style={{width:"100%",borderCollapse:"collapse",fontFamily:ui.fontBody}}>
                          <thead>
                            <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                              {["المنتج","الكمية الحالية","الكمية الفعلية","الفرق"].map(h=>(
                                <th key={h} style={{padding:"10px 14px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {dbProducts.map(p => {
                              const cur     = p.stock || 0;
                              const counted = Number(stockTakeRows[p.id] ?? cur);
                              const delta   = (Number.isFinite(counted) ? counted : cur) - cur;
                              return (
                                <tr key={p.id} style={{borderTop:"0.5px solid #EEE"}}>
                                  <td style={{padding:"10px 14px",fontSize:13,color:ui.text,fontFamily:ui.fontBody}}>{p.name}</td>
                                  <td style={{padding:"10px 14px",fontSize:13,color:ui.textSub,textAlign:"center"}}>{cur}</td>
                                  <td style={{padding:"10px 14px"}}>
                                    <input type="text" inputMode="numeric"
                                      value={stockTakeRows[p.id] ?? String(cur)}
                                      onChange={e=>setStockTakeRows({...stockTakeRows, [p.id]: e.target.value.replace(/[^0-9]/g,"")})}
                                      style={{padding:"5px 10px",border:ui.border,borderRadius:5,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",direction:"ltr",textAlign:"center",width:70,boxSizing:"border-box"}}/>
                                  </td>
                                  <td style={{padding:"10px 14px",fontSize:12.5,fontFamily:"monospace",fontWeight:500,
                                    color: delta > 0 ? "#16A34A" : delta < 0 ? "#DC2626" : ui.textSub}}>
                                    {delta > 0 ? `+${delta}` : delta || 0}
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                      <div style={{padding:"14px 22px",borderTop:ui.border,display:"flex",justifyContent:"space-between",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                        <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                          سيتم تسجيل حركة "جرد" لكل منتج له فرق فقط.
                        </div>
                        <div style={{display:"flex",gap:8}}>
                          <button onClick={()=>setStockTakeOpen(false)} disabled={invBusy}
                            style={{padding:"9px 18px",background:"transparent",border:ui.border,borderRadius:6,fontSize:13,color:ui.textSub,fontFamily:ui.fontBody,cursor:"pointer"}}>إلغاء</button>
                          <button onClick={submitStockTake} disabled={invBusy}
                            style={{padding:"9px 20px",background: ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:13,fontWeight:500,fontFamily:ui.fontBody,cursor:"pointer"}}>
                            {invBusy ? "جاري التطبيق..." : "تطبيق الجرد"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ─── RETURNS ─────────────────────────────────────────────────── */}
          {/* Two rendering paths: detail page (when #admin/returns/RET-XXXX
              is in the hash) OR the list with KPIs + filters + table. */}
          {tab === "returns" && retDetailHash && (
            <ReturnDetailsView
              ret={retDetail}
              retKey={retDetailHash}
              ui={ui} mob={mob}
              isSuper={isSuper}
              authUser={authUser}
              onBack={goReturnsList}
              onPatch={patchReturn}
              onReload={() => refreshRetDetail(retDetailHash)}
            />
          )}
          {tab === "returns" && !retDetailHash && (() => {
            const ag = retAggregates || {};
            const counts = ag.counts || {};
            const statusBadge = (s) => {
              if (s === "approved")  return { bg:"#DBEAFE", fg:"#1D4ED8", l:"موافق" };
              if (s === "rejected")  return { bg:"#FEE2E2", fg:"#B91C1C", l:"مرفوض" };
              if (s === "refunded")  return { bg:"#DCFCE7", fg:"#15803D", l:"تم الاسترداد" };
              if (s === "exchange")  return { bg:"#F3E8FF", fg:"#6B21A8", l:"استبدال" };
              if (s === "cancelled") return { bg:"#F3F4F6", fg:"#525252", l:"ملغي" };
              return { bg:"#FEF3C7", fg:"#92400E", l:"انتظار" };
            };
            const retTabs = [
              ["all",      "الكل",         counts.total    || 0],
              ["pending",  "في الانتظار",   counts.pending  || 0],
              ["approved", "موافق عليه",    counts.approved || 0],
              ["rejected", "مرفوض",         counts.rejected || 0],
              ["refunded", "تم الاسترداد",  counts.refunded || 0],
            ];
            const rmLabel = (m) => ({ cash:"كاش", transfer:"تحويل بنكي", wallet:"محفظة", store_credit:"رصيد متجر", exchange:"استبدال" })[m] || (m || "—");
            const relativeDate = (iso) => {
              if (!iso) return "—";
              const t = new Date(String(iso).replace(" ","T") + "Z").getTime();
              if (!t) return "—";
              const days = Math.round((Date.now() - t) / 86400000);
              if (days < 1) return "اليوم";
              if (days === 1) return "أمس";
              if (days < 7) return `منذ ${days} أيام`;
              if (days < 30) return `منذ ${Math.round(days/7)} أسابيع`;
              return new Date(t).toLocaleDateString("ar-EG");
            };
            const allChecked = returns.length > 0 && returns.every(r => retSelected[r.id]);
            const someChecked = Object.values(retSelected).filter(Boolean).length > 0;
            const selectedIds = Object.keys(retSelected).filter(k => retSelected[k]);
            const exportCsv = () => {
              const head = ["رقم المرتجع","رقم الطلب","العميل","المبلغ","الحالة","طريقة الاسترداد","السبب","تاريخ الطلب"];
              const esc = (v) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
              const rows = retSelected && someChecked ? returns.filter(r => retSelected[r.id]) : returns;
              const lines = [head.join(",")];
              rows.forEach(r => lines.push([
                r.return_number, r.order_id, r.customer, (Number(r.amount)||0).toLocaleString(),
                statusBadge(r.status).l, rmLabel(r.refund_method), r.reason || "—", r.requested_at || r.created_at || ""
              ].map(esc).join(",")));
              const blob = new Blob(["﻿" + lines.join("\n")], { type:"text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `returns_${Date.now()}.csv`;
              document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            };
            const totalPages = Math.max(1, Math.ceil(retTotal / 25));
            return (
              <div>
                {/* Top bar */}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:0}}>المرتجعات</h2>
                    <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>إدارة طلبات الإرجاع والاسترداد</div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button onClick={exportCsv}
                      style={{padding:"8px 14px",background:ui.cardBg,color:ui.text,border:ui.border,borderRadius:6,fontSize:12.5,cursor:"pointer",fontFamily:ui.fontBody}}>
                      تصدير CSV
                    </button>
                    <button onClick={() => setRetManualOpen(true)}
                      title="سيتم تفعيل النموذج اليدوي في المرحلة الثانية"
                      style={{padding:"8px 14px",background:ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:12.5,cursor:"pointer",fontFamily:ui.fontBody}}>
                      + إنشاء مرتجع يدوي
                    </button>
                  </div>
                </div>

                {/* KPI cards (5) */}
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(5,1fr)",gap:10,marginBottom:10}}>
                  <Metric label="إجمالي المرتجعات" value={counts.total || 0} />
                  <Metric label="في الانتظار"      value={counts.pending || 0}
                          hint={(counts.pending || 0) > 0 ? "بحاجة لمراجعة" : "—"} />
                  <Metric label="تم الاسترداد"     value={(ag.refunded_total || 0).toLocaleString()} suffix="ج"
                          hint={(counts.refunded || 0) ? `${counts.refunded} طلب` : "—"} />
                  <Metric label="نسبة الإرجاع"     value={ag.return_rate_pct ?? 0} suffix="%" />
                  <Metric label="متوسط مدة المعالجة"
                          value={ag.avg_processing_days == null ? "—" : ag.avg_processing_days} suffix={ag.avg_processing_days == null ? "" : " يوم"} />
                </div>

                {/* Insight cards (2) */}
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,marginBottom:14}}>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"12px 14px"}}>
                    <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>أعلى منتج مُرجع</div>
                    {ag.top_product ? (
                      <>
                        <div style={{fontSize:14,color:ui.text,fontFamily:ui.fontBody,fontWeight:600}}>{ag.top_product.name}</div>
                        <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:3}}>
                          {ag.top_product.return_count} إرجاع
                          {ag.top_product.return_pct != null ? ` · ${ag.top_product.return_pct}% من مبيعاته` : ""}
                        </div>
                      </>
                    ) : <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>لا توجد بيانات كافية بعد</div>}
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"12px 14px"}}>
                    <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>أعلى سبب إرجاع</div>
                    {ag.top_reason ? (
                      <>
                        <div style={{fontSize:14,color:ui.text,fontFamily:ui.fontBody,fontWeight:600}}>{ag.top_reason.label}</div>
                        <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:3}}>{ag.top_reason.count} طلب · {ag.top_reason.pct}% من الإجمالي</div>
                      </>
                    ) : <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>لا توجد بيانات كافية بعد</div>}
                  </div>
                </div>

                {/* Tabs with counters */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"6px 6px",marginBottom:10,display:"flex",gap:4,overflowX:"auto"}}>
                  {retTabs.map(([k,l,n])=>(
                    <button key={k} onClick={()=>{ setRetTab(k); setRetPage(1); setRetSelected({}); }}
                      style={{padding:"7px 14px",border:"none",cursor:"pointer",borderRadius:6,
                        background: retTab===k ? ui.text : "transparent",
                        color: retTab===k ? "#fff" : ui.textSub,
                        fontSize:12, fontFamily:ui.fontBody, whiteSpace:"nowrap"}}>
                      {l} ({n})
                    </button>
                  ))}
                </div>

                {/* Filter bar */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                  <input value={retFilters.q} onChange={e=>{setRetFilters({...retFilters,q:e.target.value}); setRetPage(1);}}
                    placeholder="بحث برقم المرتجع/الطلب/العميل"
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none",direction:"rtl",minWidth:220,flex:1}}/>
                  <input type="date" value={retFilters.from} onChange={e=>{setRetFilters({...retFilters,from:e.target.value}); setRetPage(1);}}
                    title="من تاريخ"
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}/>
                  <input type="date" value={retFilters.to} onChange={e=>{setRetFilters({...retFilters,to:e.target.value}); setRetPage(1);}}
                    title="إلى تاريخ"
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}/>
                  <select value={retFilters.reason_id} onChange={e=>{setRetFilters({...retFilters,reason_id:e.target.value}); setRetPage(1);}}
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل الأسباب</option>
                    {(retReasons || []).map(r => <option key={r.id} value={r.id}>{r.name_ar}</option>)}
                  </select>
                  <select value={retFilters.refund_method} onChange={e=>{setRetFilters({...retFilters,refund_method:e.target.value}); setRetPage(1);}}
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل طرق الاسترداد</option>
                    <option value="cash">كاش</option>
                    <option value="transfer">تحويل بنكي</option>
                    <option value="wallet">محفظة</option>
                    <option value="store_credit">رصيد متجر</option>
                    <option value="exchange">استبدال</option>
                  </select>
                  <select value={retFilters.sort} onChange={e=>setRetFilters({...retFilters,sort:e.target.value})}
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="date">الأحدث</option>
                    <option value="oldest">الأقدم</option>
                    <option value="amount_desc">الأعلى قيمة</option>
                    <option value="amount_asc">الأقل قيمة</option>
                  </select>
                </div>

                {/* Bulk actions */}
                {someChecked && (
                  <div style={{background:"#FFFBEA",border:"1px solid #FDE68A",borderRadius:6,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:12.5,color:"#92400E",fontFamily:ui.fontBody}}>{selectedIds.length} مرتجع محدد</span>
                    <button onClick={exportCsv}
                      style={{padding:"5px 11px",background:"#fff",border:"0.5px solid #FDE68A",borderRadius:5,fontSize:11.5,cursor:"pointer",color:"#92400E",fontFamily:ui.fontBody}}>تصدير المحدد</button>
                    {isSuper && (
                      <>
                        <button onClick={() => { selectedIds.forEach(id => patchReturn(id, { status:"approved" })); setRetSelected({}); }}
                          style={{padding:"5px 11px",background:"#DCFCE7",border:"0.5px solid #86EFAC",borderRadius:5,fontSize:11.5,cursor:"pointer",color:"#15803D",fontFamily:ui.fontBody}}>موافقة جماعية</button>
                        <button onClick={() => { const r = window.prompt("سبب الرفض الجماعي:"); if (r) { selectedIds.forEach(id => patchReturn(id, { status:"rejected", rejection_reason: r })); setRetSelected({}); } }}
                          style={{padding:"5px 11px",background:"#FEE2E2",border:"0.5px solid #FCA5A5",borderRadius:5,fontSize:11.5,cursor:"pointer",color:"#B91C1C",fontFamily:ui.fontBody}}>رفض جماعي</button>
                      </>
                    )}
                  </div>
                )}

                {/* Result count */}
                <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:8}}>
                  {retTotal === 0 ? "لا توجد نتائج" : `${returns.length} من ${retTotal} مرتجع`}
                </div>

                {/* Table or empty state */}
                {(counts.total || 0) === 0 ? (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"56px 20px",textAlign:"center"}}>
                    <div style={{fontSize:42,marginBottom:10}}>📦</div>
                    <div style={{fontSize:15,color:ui.text,fontFamily:ui.fontBody,fontWeight:600,marginBottom:6}}>لا توجد مرتجعات حالياً</div>
                    <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,maxWidth:380,margin:"0 auto"}}>
                      ستظهر هنا كل طلبات الإرجاع من العملاء لمراجعتها والموافقة عليها.
                    </div>
                  </div>
                ) : returns.length === 0 ? (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"40px",textAlign:"center",color:ui.textSub,fontFamily:ui.fontBody,fontSize:13}}>
                    لا توجد نتائج تطابق الفلاتر — جرّب توسيع المعايير
                  </div>
                ) : (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:1100}}>
                      <thead>
                        <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                          <th style={{padding:"11px 10px",textAlign:"right",width:34}}>
                            <input type="checkbox" checked={allChecked}
                              onChange={e => {
                                if (e.target.checked) { const next = {}; returns.forEach(r => { next[r.id] = true; }); setRetSelected(next); }
                                else setRetSelected({});
                              }}/>
                          </th>
                          {["رقم المرتجع","رقم الطلب","العميل","المنتجات","السبب","المبلغ","تاريخ الطلب","الحالة","الإجراءات"].map(h => (
                            <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {returns.map(r => {
                          const b = statusBadge(r.status);
                          const prev = Array.isArray(r.items_preview) ? r.items_preview : [];
                          return (
                            <tr key={r.id} style={{borderTop:"0.5px solid #EEE"}}>
                              <td style={{padding:"9px 10px"}}>
                                <input type="checkbox" checked={!!retSelected[r.id]}
                                  onChange={e => setRetSelected(prev2 => ({ ...prev2, [r.id]: e.target.checked }))}/>
                              </td>
                              <td style={{padding:"9px 12px",fontSize:11.5,color:ui.textSub,fontFamily:"monospace"}}>{r.return_number || "—"}</td>
                              <td style={{padding:"9px 12px",fontSize:12,fontFamily:"monospace"}}>
                                {r.order_id ? (
                                  <a href={`#admin/orders/${encodeURIComponent(r.order_id)}`} style={{color:"#1D4ED8",textDecoration:"none"}}>#{r.order_id}</a>
                                ) : "—"}
                              </td>
                              <td style={{padding:"9px 12px",fontSize:13,color:ui.text,fontFamily:ui.fontBody}}>
                                {r.customer || "—"}
                                {r.customer_email && <div style={{fontSize:11,color:ui.textSub,fontFamily:"monospace"}}>{r.customer_email}</div>}
                              </td>
                              <td style={{padding:"9px 12px"}}>
                                {prev.length === 0 ? (
                                  <span style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>{r.product || "—"}</span>
                                ) : (
                                  <div style={{display:"flex",gap:4,alignItems:"center"}}>
                                    {prev.slice(0,2).map((it, i) => (
                                      <span key={i} title={it.product_name}
                                        style={{width:28,height:28,borderRadius:4,background:"#F3F4F6",overflow:"hidden",display:"inline-block",border:"0.5px solid #E5E5E5"}}>
                                        {it.product_image && <img src={it.product_image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                                      </span>
                                    ))}
                                    {prev.length > 2 && <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>+{prev.length - 2}</span>}
                                  </div>
                                )}
                              </td>
                              <td style={{padding:"9px 12px",fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,maxWidth:200,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}} title={r.reason || ""}>
                                {r.reason || "—"}
                              </td>
                              <td style={{padding:"9px 12px",fontSize:13,color:ui.text,fontWeight:500,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>
                                {(Number(r.amount)||0).toLocaleString()} ج
                              </td>
                              <td style={{padding:"9px 12px",fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>
                                {relativeDate(r.requested_at || r.created_at)}
                              </td>
                              <td style={{padding:"9px 12px"}}>
                                <span style={{fontSize:10.5,padding:"3px 10px",borderRadius:20,background:b.bg,color:b.fg,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>{b.l}</span>
                              </td>
                              <td style={{padding:"9px 12px",textAlign:"left",whiteSpace:"nowrap"}}>
                                <button title="عرض التفاصيل" onClick={() => goReturn(r.return_number || r.id)}
                                  style={{background:"transparent",border:"none",cursor:"pointer",padding:4,color:"#1D4ED8",fontSize:14}}>
                                  👁
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:12,fontFamily:ui.fontBody,fontSize:12.5}}>
                    <button disabled={retPage <= 1} onClick={() => setRetPage(retPage - 1)}
                      style={{padding:"5px 11px",border:ui.border,background:ui.cardBg,borderRadius:5,cursor:retPage <= 1 ? "not-allowed" : "pointer",opacity:retPage <= 1 ? 0.5 : 1,color:ui.text}}>السابق</button>
                    <span style={{color:ui.textSub}}>{retPage} / {totalPages}</span>
                    <button disabled={retPage >= totalPages} onClick={() => setRetPage(retPage + 1)}
                      style={{padding:"5px 11px",border:ui.border,background:ui.cardBg,borderRadius:5,cursor:retPage >= totalPages ? "not-allowed" : "pointer",opacity:retPage >= totalPages ? 0.5 : 1,color:ui.text}}>التالي</button>
                  </div>
                )}

                {/* Manual-create placeholder modal (Phase 2 wires the form) */}
                {retManualOpen && (
                  <div onClick={() => setRetManualOpen(false)}
                    style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
                    <div onClick={ev => ev.stopPropagation()}
                      style={{background:ui.cardBg,maxWidth:440,width:"100%",padding:22,borderRadius:8}}>
                      <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"0 0 8px"}}>إنشاء مرتجع يدوي</h3>
                      <p style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:14}}>
                        النموذج الكامل (اختيار الطلب + اختيار المنتجات + السبب + الصور) سيتم تفعيله في المرحلة الثانية مع نموذج العميل في الواجهة.
                      </p>
                      <div style={{textAlign:"left"}}>
                        <button onClick={() => setRetManualOpen(false)}
                          style={{padding:"7px 14px",background:ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:12.5,cursor:"pointer",fontFamily:ui.fontBody}}>حسناً</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}


          {/* ─── EXPENSES ────────────────────────────────────────────────── */}
          {tab === "expenses" && (() => {
            const months = [
              {v:"1",l:"يناير"},{v:"2",l:"فبراير"},{v:"3",l:"مارس"},{v:"4",l:"أبريل"},
              {v:"5",l:"مايو"},{v:"6",l:"يونيو"},{v:"7",l:"يوليو"},{v:"8",l:"أغسطس"},
              {v:"9",l:"سبتمبر"},{v:"10",l:"أكتوبر"},{v:"11",l:"نوفمبر"},{v:"12",l:"ديسمبر"},
            ];
            const years = [];
            const yNow = new Date().getFullYear();
            for (let y = yNow - 3; y <= yNow + 1; y++) years.push(String(y));

            const inputSm = { padding:"6px 10px", border:ui.border, borderRadius:6, background:ui.cardBg,
              fontFamily:ui.fontBody, fontSize:13, color:ui.text, outline:"none", direction:"rtl", boxSizing:"border-box" };
            const tdCell  = { padding:"9px 12px", fontSize:12.5, color:ui.text, fontFamily:ui.fontBody, verticalAlign:"middle" };

            // Categories: prefer DB-backed list (active rows) but fall back to
            // the hardcoded legacy enum so the page works pre-migration.
            const effCategories = (expCategories && expCategories.length)
              ? expCategories.filter(c => c.active)
                  .map(c => ({ key: c.key, id: c.id, l: c.name_ar, color: c.color || "#6B7280", icon: c.icon || "" }))
              : EXPENSE_CATEGORIES;
            const catByKey = Object.fromEntries(effCategories.map(c => [c.key, c]));
            const catLabel = (k) => (catByKey[k] || { l:k }).l;
            const catColor = (k) => (catByKey[k] || { color:"#6B7280" }).color;
            const catById  = Object.fromEntries(effCategories.filter(c=>c.id).map(c=>[c.id, c]));
            // DEPRECATED categories — hidden from the new-expense dropdown +
            // tab list, but still kept in catByKey so existing rows render
            // their proper Arabic label. `purchases` (مشتريات منتجات) is the
            // first to be deprecated: buying inventory is asset conversion,
            // not an operating expense, so it's been moved out of /summary's
            // expensesTotal calculation (see api/server.js aggregateFinance).
            const DEPRECATED_EXPENSE_KEYS = new Set(["purchases"]);
            const dropdownCategories = effCategories.filter(c => !DEPRECATED_EXPENSE_KEYS.has(c.key));
            // Rows in the current view that still use a deprecated category —
            // surfaces the warning banner + count.
            const deprecatedRows = expenses.filter(e => DEPRECATED_EXPENSE_KEYS.has(e.category));
            const deprecatedTotal = deprecatedRows.reduce((s, e) => s + (Number(e.amount) || 0), 0);

            // ── Totals (approved only — pending/rejected excluded) ───────
            const approved = expenses.filter(e => (e.status || "approved") === "approved");
            const totals = {};
            effCategories.forEach(c => totals[c.key] = 0);
            approved.forEach(e => { totals[e.category] = (totals[e.category]||0) + (Number(e.amount)||0); });
            const totalAll = Object.values(totals).reduce((s,n)=>s+n,0);

            // KPIs
            // Top category by spend
            const topCatKey = Object.keys(totals).sort((a,b)=>totals[b]-totals[a])[0];
            const topCatAmt = topCatKey ? totals[topCatKey] : 0;
            const topCatPct = totalAll > 0 ? Math.round((topCatAmt / totalAll) * 100) : 0;
            // Fixed vs variable
            const fixedSum    = approved.filter(e => e.type === "fixed").reduce((s,e)=>s+(Number(e.amount)||0), 0);
            const variableSum = approved.filter(e => e.type !== "fixed").reduce((s,e)=>s+(Number(e.amount)||0), 0);
            // Month-over-month % change (computed from the trend if loaded)
            const trendCurr = expTrend.length >= 1 ? expTrend[expTrend.length - 1] : null;
            const trendPrev = expTrend.length >= 2 ? expTrend[expTrend.length - 2] : null;
            const trendSum  = (b) => b ? Object.values(b.byCategory).reduce((s,n)=>s+(Number(n)||0),0) : 0;
            const monthChange = (() => {
              const c = trendSum(trendCurr), p = trendSum(trendPrev);
              if (!p) return null;
              return Math.round(((c - p) / p) * 100);
            })();
            // Burn rate (expenses / revenue) — use finSummary if loaded
            const revenueMonth = (finSummary && finSummary.revenue) || 0;
            const burnRate = revenueMonth > 0 ? Math.round((totalAll / revenueMonth) * 100) : null;

            // Pie + bar chart data
            const pieSlices = effCategories
              .filter(c => (totals[c.key] || 0) > 0)
              .map(c => ({ label: c.l, value: totals[c.key], color: c.color }));

            // Per-tab counts (count of entries within current month)
            const tabCounts = { _all: expenses.length };
            effCategories.forEach(c => { tabCounts[c.key] = expenses.filter(e => e.category === c.key).length; });

            // Active tab subset + filter pipeline
            const tabRows = expCatTab === "all" ? expenses : expenses.filter(e => e.category === expCatTab);
            const q = (expFilters.q || "").trim().toLowerCase();
            const minA = Number(expFilters.min) || null;
            const maxA = Number(expFilters.max) || null;
            const filtered = tabRows.filter(e => {
              if (expFilters.type !== "all" && (e.type || "variable") !== expFilters.type) return false;
              if (expFilters.payment_method !== "all" && (e.payment_method || "cash") !== expFilters.payment_method) return false;
              if (expFilters.supplier_id !== "all" && (e.supplier_id || "") !== expFilters.supplier_id) return false;
              if (minA != null && Number(e.amount||0) < minA) return false;
              if (maxA != null && Number(e.amount||0) > maxA) return false;
              if (q) {
                const benName = e.supplier_name || (expSuppliers.find(s => s.id === e.supplier_id) || {}).name || "";
                const hay = `${e.description||""} ${e.notes||""} ${benName}`.toLowerCase();
                if (!hay.includes(q)) return false;
              }
              return true;
            });
            const sorted = filtered.slice();
            if (expFilters.sort === "amountDesc") sorted.sort((a,b)=>(b.amount||0)-(a.amount||0));
            else if (expFilters.sort === "amountAsc") sorted.sort((a,b)=>(a.amount||0)-(b.amount||0));
            else sorted.sort((a,b) => String(b.date||"").localeCompare(String(a.date||"")));

            const activeCat = expCatTab === "all" ? null : (catByKey[expCatTab] || null);
            const draftCatKey = expCatTab === "all" ? expDraft.category_key : expCatTab;

            // Resolve beneficiary display name: prefer the server-joined
            // value (e.supplier_name) which is always fresh; fall back to the
            // suppliers cache for legacy callers; finally "—" if truly empty.
            const beneficiaryName = (e) => {
              if (e && e.supplier_name) return e.supplier_name;
              if (e && e.supplier_id) {
                const hit = expSuppliers.find(s => s.id === e.supplier_id);
                if (hit) return hit.name;
              }
              return "—";
            };
            const benTypeLabel = (t) => ({
              supplier:"مورد", employee:"موظف", platform:"منصة تسويق", government:"جهة حكومية", other:"أخرى"
            })[t || "supplier"] || "مورد";
            const pmLabel = (m) => ({cash:"كاش",transfer:"تحويل",card:"فيزا",wallet:"محفظة"})[m] || m;
            const pmColor = (m) => ({cash:"#F0FDF4",transfer:"#EFF6FF",card:"#FEF3C7",wallet:"#F5F3FF"})[m] || "#F3F4F6";
            const pmFg    = (m) => ({cash:"#15803D",transfer:"#1D4ED8",card:"#92400E",wallet:"#6D28D9"})[m] || "#374151";
            const statusBadge = (s) => {
              if (s === "pending")                  return { bg:"#FEF3C7", fg:"#92400E", t:"بانتظار الموافقة", tip:"" };
              if (s === "pending_budget_approval")  return { bg:"#FED7AA", fg:"#9A3412", t:"بانتظار موافقة ميزانية", tip:"هذا المصروف سيتجاوز ميزانية الفئة الشهرية" };
              if (s === "rejected")                 return { bg:"#FEE2E2", fg:"#B91C1C", t:"مرفوض", tip:"" };
              return { bg:"#DCFCE7", fg:"#15803D", t:"موافق", tip:"" };
            };

            const exportCsv = () => {
              const head = ["الفئة","الوصف","النوع","الكمية","سعر الوحدة","الإجمالي","الجهة المستفيدة","طريقة الدفع","التاريخ","الحالة","ملاحظات"];
              const esc = (v) => { const s = v == null ? "" : String(v); return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s; };
              const lines = [head.join(",")];
              sorted.forEach(e => lines.push([
                catLabel(e.category), e.description, e.type==="fixed"?"ثابت":"متغير",
                e.quantity, e.unit_price, e.amount,
                beneficiaryName(e), pmLabel(e.payment_method || "cash"),
                e.date, statusBadge(e.status).t, e.notes
              ].map(esc).join(",")));
              const blob = new Blob(["﻿" + lines.join("\n")], { type:"text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url; a.download = `expenses_${expYear}_${String(expMonth).padStart(2,"0")}.csv`;
              document.body.appendChild(a); a.click(); a.remove();
              URL.revokeObjectURL(url);
            };

            // Budget vs actual rows. Phase 2 polish: include rows that
            // don't have a budget set (state="none") for visibility, and
            // sort: over (red) → approaching (amber) → under (green) →
            // no-budget (gray) at the bottom.
            const budgetState = (spent, budget) => {
              if (!budget || budget <= 0) return "none";
              const pct = (spent / budget) * 100;
              if (spent > budget) return "over";
              if (pct >= 80)     return "approaching";
              return "under";
            };
            const stateRank = { over:0, approaching:1, under:2, none:3 };
            const stateTone = { over:"#DC2626", approaching:"#D97706", under:"#16A34A", none:"#9CA3AF" };
            const budgetRows = effCategories.filter(c => c.active !== false).map(c => {
              const budgetRow = expBudgets.find(b => (b.category_id && b.category_id === c.id) || b.key === c.key);
              const budget = Number(budgetRow && budgetRow.monthly_budget) || 0;
              const spent  = totals[c.key] || 0;
              const state  = budgetState(spent, budget);
              const pct    = budget > 0 ? Math.min(100, Math.round((spent / budget) * 100)) : 0;
              const realPct = budget > 0 ? Math.round((spent / budget) * 100) : 0;
              const over   = Math.max(0, spent - budget);
              const remaining = Math.max(0, budget - spent);
              return { cat: c, spent, budget, pct, realPct, tone: stateTone[state], state, over, remaining };
            })
            // Only show rows where there's either a budget set OR some
            // spending happened — keeps the section meaningful instead of
            // listing every category with "لم يتم تحديد ميزانية".
            .filter(r => r.budget > 0 || r.spent > 0)
            .sort((a, b) => {
              const r = stateRank[a.state] - stateRank[b.state];
              if (r !== 0) return r;
              return b.spent - a.spent; // tiebreaker: higher spend first
            });

            return (
              <div>
                {/* Deprecated-category banner — surfaces when any expense in
                    the current view uses a category being phased out (today:
                    purchases). The Finance Dashboard already excludes these
                    from operating-expense totals; this banner is the admin's
                    cue to reclassify them. */}
                {deprecatedRows.length > 0 && (
                  <div style={{background:"#FEF2F2",border:"1px solid #FCA5A5",color:"#B91C1C",borderRadius:ui.radius,
                    padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"flex-start",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                    <div style={{fontSize:12.5,fontFamily:ui.fontBody,lineHeight:1.7}}>
                      ⚠ <b>{deprecatedRows.length}</b> مصروف{deprecatedRows.length > 1 ? "ات" : ""} بقيمة <b>{Math.round(deprecatedTotal).toLocaleString()} ج</b> يستخدم{deprecatedRows.length > 1 ? "ون" : ""} فئة <b>"مشتريات منتجات"</b>.
                      <br/>هذه الفئة ستُلغى — مشتريات المنتجات يجب أن تُسجل في وحدة المخزون، لا في المصروفات.
                      <br/><span style={{fontSize:11.5,color:"#7F1D1D"}}>تم استبعاد هذه المبالغ بالفعل من حساب صافي الربح في لوحة المالية (تُحسب فقط ضمن التدفق النقدي الخارج).</span>
                    </div>
                  </div>
                )}

                {/* Recurring suggestions banner */}
                {expSugg.length > 0 && (
                  <div style={{background:"#FFFBEB",border:"1px solid #FDE68A",color:"#92400E",borderRadius:ui.radius,
                    padding:"10px 14px",marginBottom:12,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:13,fontFamily:ui.fontBody}}>
                      ⚠ لديك <b>{expSugg.length}</b> مصروف{expSugg.length > 1 ? "ات" : ""} متكرر{expSugg.length > 1 ? "ة" : ""} من الشهر السابق لم تتم إضافتها بعد
                    </span>
                    <button onClick={()=>setExpSuggOpen(true)}
                      style={{padding:"6px 14px",border:"1px solid #FDE68A",background:"#fff",borderRadius:6,
                        fontFamily:ui.fontBody,fontSize:12.5,color:"#92400E",cursor:"pointer",fontWeight:600}}>
                      مراجعة المقترحات
                    </button>
                  </div>
                )}

                {/* Top bar */}
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,flexWrap:"wrap",gap:10}}>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:0}}>المصروفات</h2>
                    <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>إدارة وتتبع كل مصروفات المتجر</div>
                  </div>
                  <div style={{display:"flex",gap:8,alignItems:"end",flexWrap:"wrap"}}>
                    <div>
                      <label style={{display:"block",fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>الشهر</label>
                      <select value={expMonth} onChange={e=>setExpMonth(e.target.value)} style={{...inputSm,padding:"7px 12px"}}>
                        {months.map(m => <option key={m.v} value={m.v}>{m.l}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{display:"block",fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>السنة</label>
                      <select value={expYear} onChange={e=>setExpYear(e.target.value)} style={{...inputSm,padding:"7px 12px"}}>
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                      </select>
                    </div>
                    <button onClick={refreshExpenses}
                      style={{padding:"8px 14px",background:ui.cardBg,color:ui.text,border:ui.border,borderRadius:6,
                        fontFamily:ui.fontBody,fontSize:12.5,cursor:"pointer"}}>
                      تحديث
                    </button>
                    <button onClick={exportCsv} disabled={sorted.length===0}
                      style={{padding:"8px 14px",background: sorted.length===0?"transparent":ui.cardBg, color: sorted.length===0?ui.textSub:ui.text,
                        border:ui.border,borderRadius:6,fontFamily:ui.fontBody,fontSize:12.5,
                        cursor: sorted.length===0?"not-allowed":"pointer"}}>
                      تصدير CSV
                    </button>
                  </div>
                </div>

                {/* 5 KPI cards */}
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(5,1fr)",gap:10,marginBottom:14}}>
                  <MetricCardBase ui={ui} mob={mob} label="إجمالي المصروفات" value={Math.round(totalAll).toLocaleString()} suffix="ج"
                    changePct={monthChange != null ? -monthChange : undefined}
                    hint={monthChange != null ? (monthChange < 0 ? "أقل من الشهر السابق" : "أعلى من الشهر السابق") : undefined}/>
                  <MetricCardBase ui={ui} mob={mob}
                    label="أعلى فئة مصروفات"
                    value={topCatKey ? catLabel(topCatKey) : "—"}
                    hint={topCatKey ? `${Math.round(topCatAmt).toLocaleString()} ج · ${topCatPct}%` : "—"}/>
                  <MetricCardBase ui={ui} mob={mob} label="Burn Rate" value={burnRate != null ? burnRate : "—"} suffix={burnRate != null ? "%" : ""}
                    hint={burnRate != null ? "المصروفات / الإيرادات" : "افتح المالية لاحتسابها"}/>
                  <MetricCardBase ui={ui} mob={mob} label="مصروفات ثابتة" value={Math.round(fixedSum).toLocaleString()} suffix="ج"/>
                  <MetricCardBase ui={ui} mob={mob} label="مصروفات متغيرة" value={Math.round(variableSum).toLocaleString()} suffix="ج"/>
                </div>

                {/* Charts row */}
                <div style={{display:"grid",gridTemplateColumns: mob ? "1fr" : "1fr 1.6fr", gap:10, marginBottom:14}}>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
                    <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,fontWeight:600,marginBottom:10}}>توزيع المصروفات حسب الفئة</div>
                    <div style={{display:"grid",gridTemplateColumns:"160px 1fr",gap:14,alignItems:"center"}}>
                      <ExpensePieChart slices={pieSlices} total={totalAll} ui={ui} size={150}/>
                      <ChartLegend items={pieSlices} total={totalAll} ui={ui}/>
                    </div>
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
                    <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,fontWeight:600,marginBottom:10}}>مقارنة آخر 6 شهور</div>
                    <ExpenseTrendChart months={expTrend} categories={effCategories} ui={ui} height={170}/>
                    <div style={{display:"flex",flexWrap:"wrap",gap:10,marginTop:8}}>
                      {effCategories.filter(c => expTrend.some(b => (b.byCategory||{})[c.key] > 0)).map(c => (
                        <div key={c.key} style={{display:"flex",alignItems:"center",gap:5,fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>
                          <span style={{width:9,height:9,background:c.color,borderRadius:2,display:"inline-block"}}/> {c.l}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Category tabs (all + per-category, each with a counter) */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"6px",marginBottom:12,display:"flex",gap:4,overflowX:"auto"}}>
                  <button onClick={()=>setExpCatTab("all")}
                    style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",border:"none",cursor:"pointer",borderRadius:6,
                      background: expCatTab==="all" ? ui.text : "transparent",
                      color: expCatTab==="all" ? "#fff" : ui.textSub,
                      fontSize:12,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>
                    الكل <span style={{background: expCatTab==="all" ? "rgba(255,255,255,.2)" : "#F3F4F6",
                      color: expCatTab==="all" ? "#fff" : ui.textSub,padding:"1px 7px",borderRadius:9,fontSize:11}}>{tabCounts._all}</span>
                  </button>
                  {/* Deprecated keys excluded from the tab list — they still
                      render labels for existing rows via catLabel, but no new
                      categorization should flow through them. */}
                  {dropdownCategories.map(c => (
                    <button key={c.key} onClick={()=>setExpCatTab(c.key)}
                      style={{display:"flex",alignItems:"center",gap:6,padding:"7px 12px",border:"none",cursor:"pointer",borderRadius:6,
                        background: expCatTab===c.key ? c.color : "transparent",
                        color: expCatTab===c.key ? "#fff" : ui.textSub,
                        fontSize:12,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>
                      <span style={{width:6,height:6,borderRadius:"50%",background: expCatTab===c.key ? "#fff" : c.color, display:"inline-block"}}/>
                      {c.l}
                      <span style={{background: expCatTab===c.key ? "rgba(255,255,255,.2)" : "#F3F4F6",
                        color: expCatTab===c.key ? "#fff" : ui.textSub,padding:"1px 6px",borderRadius:9,fontSize:11}}>{tabCounts[c.key] || 0}</span>
                    </button>
                  ))}
                </div>

                {/* Filter bar */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"10px 12px",marginBottom:12,
                  display:"grid",gap:8,gridTemplateColumns: mob?"1fr":"minmax(180px,2fr) repeat(5, minmax(0,1fr))"}}>
                  <input value={expFilters.q} onChange={e=>setExpFilters({...expFilters, q:e.target.value})}
                    placeholder="بحث بالوصف أو المورد..."
                    style={{padding:"8px 12px",border:ui.border,borderRadius:6,background:ui.cardBg,
                      fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none",direction:"rtl"}}/>
                  <select value={expFilters.type} onChange={e=>setExpFilters({...expFilters, type:e.target.value})}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none"}}>
                    <option value="all">كل الأنواع</option>
                    <option value="fixed">ثابت</option>
                    <option value="variable">متغير</option>
                  </select>
                  <select value={expFilters.payment_method} onChange={e=>setExpFilters({...expFilters, payment_method:e.target.value})}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none"}}>
                    <option value="all">كل طرق الدفع</option>
                    <option value="cash">كاش</option>
                    <option value="transfer">تحويل</option>
                    <option value="card">فيزا</option>
                    <option value="wallet">محفظة</option>
                  </select>
                  <input type="text" inputMode="numeric" value={expFilters.min} onChange={e=>setExpFilters({...expFilters, min:e.target.value.replace(/[^0-9.]/g,'')})}
                    placeholder="أقل مبلغ"
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none",direction:"ltr",textAlign:"left"}}/>
                  <input type="text" inputMode="numeric" value={expFilters.max} onChange={e=>setExpFilters({...expFilters, max:e.target.value.replace(/[^0-9.]/g,'')})}
                    placeholder="أعلى مبلغ"
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none",direction:"ltr",textAlign:"left"}}/>
                  <select value={expFilters.sort} onChange={e=>setExpFilters({...expFilters, sort:e.target.value})}
                    style={{padding:"8px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none"}}>
                    <option value="date">الأحدث</option>
                    <option value="amountDesc">الأعلى مبلغاً</option>
                    <option value="amountAsc">الأقل مبلغاً</option>
                  </select>
                </div>

                {/* Result count */}
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8,flexWrap:"wrap",gap:8}}>
                  <span style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                    {sorted.length === expenses.length ? `${expenses.length} مصروف` : `${sorted.length} من ${expenses.length} مصروف`}
                  </span>
                </div>

                {/* Table */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:1100}}>
                    <thead>
                      <tr style={{background:ui.sideBg,borderBottom:"0.5px solid #E5E5E5"}}>
                        {(expCatTab === "all"
                          ? ["الوصف","الفئة","النوع","الكمية","سعر الوحدة","الإجمالي","الجهة المستفيدة","الدفع","التاريخ","حالة الدفع","الحالة","ملاحظات",""]
                          : ["الوصف","النوع","الكمية","سعر الوحدة","الإجمالي","الجهة المستفيدة","الدفع","التاريخ","حالة الدفع","الحالة","ملاحظات",""]
                        ).map(h => (
                          <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sorted.length === 0 ? (
                        <tr><td colSpan={expCatTab === "all" ? 13 : 12} style={{padding:"26px 14px",textAlign:"center",color:ui.textSub,fontSize:12.5,fontFamily:ui.fontBody}}>
                          {expenses.length === 0
                            ? `لا توجد مصروفات لشهر ${months.find(m=>m.v===expMonth)?.l} ${expYear} — أضف أول سطر من الأسفل ↓`
                            : "لا توجد نتائج تطابق الفلاتر — جرّب توسيع المعايير"}
                        </td></tr>
                      ) : sorted.map(e => {
                        const editing = expEditingId === e.id;
                        const stat    = statusBadge(e.status);
                        // Display values for the edit row default to the
                        // existing record so dropdowns / checkboxes show
                        // the current selection. The "_beneficiaryTyped"
                        // capture works the same way as the add row.
                        const editVal = editing ? expEditDraft : null;
                        return (
                          <tr key={e.id} style={{borderTop:"0.5px solid #EEE", background: editing ? "#F0F9FF" : e.status === "pending" ? "#FFFBEB" : e.status === "pending_budget_approval" ? "#FFF7ED" : e.status === "rejected" ? "#FEF2F2" : "transparent"}}>
                            {/* Description */}
                            <td style={tdCell}>
                              {editing
                                ? <input style={{...inputSm, width:"100%"}} value={editVal.description||""} onChange={ev=>setExpEditDraft({...editVal, description:ev.target.value})}/>
                                : (e.description || "—")}
                            </td>
                            {/* Category (editable on الكل tab only) */}
                            {expCatTab === "all" && (
                              <td style={tdCell}>
                                {editing ? (
                                  <select value={editVal.category} onChange={ev=>setExpEditDraft({...editVal, category:ev.target.value, category_id: (catByKey[ev.target.value] || {}).id || null})}
                                    style={{...inputSm,padding:"6px 8px"}}>
                                    {effCategories.map(c => <option key={c.key} value={c.key}>{c.l}</option>)}
                                  </select>
                                ) : (
                                  <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background:catColor(e.category) + "22",color:catColor(e.category),fontWeight:600,whiteSpace:"nowrap"}}>
                                    {catLabel(e.category)}
                                  </span>
                                )}
                              </td>
                            )}
                            {/* Type */}
                            <td style={tdCell}>
                              {editing ? (
                                <select value={editVal.type || "variable"} onChange={ev=>setExpEditDraft({...editVal, type:ev.target.value})}
                                  style={{...inputSm,padding:"6px 8px"}}>
                                  <option value="variable">متغير</option>
                                  <option value="fixed">ثابت</option>
                                </select>
                              ) : (
                                <span style={{fontSize:11,padding:"3px 9px",borderRadius:20, background: e.type === "fixed" ? "#EFF6FF" : "#F3F4F6", color: e.type === "fixed" ? "#1D4ED8" : ui.textSub}}>
                                  {e.type === "fixed" ? "ثابت" : "متغير"}
                                </span>
                              )}
                            </td>
                            {/* Quantity */}
                            <td style={tdCell}>{editing
                              ? <input type="text" inputMode="numeric" style={{...inputSm, width:70, direction:"ltr", textAlign:"left"}} value={editVal.quantity} onChange={ev=>setExpEditDraft({...editVal, quantity:ev.target.value.replace(/[^0-9.]/g,'')})}/>
                              : (Number(e.quantity)||0).toLocaleString()}</td>
                            {/* Unit price */}
                            <td style={tdCell}>{editing
                              ? <input type="text" inputMode="decimal" style={{...inputSm, width:90, direction:"ltr", textAlign:"left"}} value={editVal.unit_price} onChange={ev=>setExpEditDraft({...editVal, unit_price:ev.target.value.replace(/[^0-9.]/g,'')})}/>
                              : (Number(e.unit_price)||0).toLocaleString() + " ج"}</td>
                            {/* Total (auto, always read-only) */}
                            <td style={{...tdCell, fontWeight:500, background:"#FAFAFA"}}>
                              {editing
                                ? ((Number(editVal.quantity)||0) * (Number(editVal.unit_price)||0)).toLocaleString() + " ج"
                                : (Number(e.amount)||0).toLocaleString() + " ج"}
                            </td>
                            {/* Beneficiary */}
                            <td style={tdCell}>
                              {editing ? (
                                <div style={{display:"flex",gap:4,alignItems:"center"}}>
                                  <input list={`exp-edit-ben-list-${e.id}`} style={{...inputSm,padding:"6px 8px",minWidth:140}}
                                    value={editVal._beneficiaryTyped !== undefined
                                      ? editVal._beneficiaryTyped
                                      : ((expSuppliers.find(s => s.id === editVal.supplier_id) || {}).name || e.supplier_name || "")}
                                    onChange={ev => {
                                      const val = ev.target.value;
                                      const hit = expSuppliers.find(s => s.name === val);
                                      setExpEditDraft({...editVal, supplier_id: hit ? hit.id : null, _beneficiaryTyped: hit ? "" : val});
                                    }}/>
                                  <datalist id={`exp-edit-ben-list-${e.id}`}>
                                    {expSuppliers.map(s => <option key={s.id} value={s.name}/>)}
                                  </datalist>
                                  <select value={editVal.beneficiary_type || "supplier"} onChange={ev=>setExpEditDraft({...editVal, beneficiary_type:ev.target.value})}
                                    style={{...inputSm,padding:"6px 6px",fontSize:11}}>
                                    <option value="supplier">مورد</option>
                                    <option value="employee">موظف</option>
                                    <option value="platform">منصة</option>
                                    <option value="government">حكومية</option>
                                    <option value="other">أخرى</option>
                                  </select>
                                </div>
                              ) : (
                                // When the row has a beneficiary, render the
                                // name + optional type pill. When it doesn't
                                // (legacy rows from before the Phase 2 fix
                                // saved supplier_id at all), show a subtle
                                // "+ أضف جهة" affordance that drops into edit
                                // mode focused on the beneficiary field.
                                beneficiaryName(e) !== "—" ? (
                                  <div>
                                    <div style={{fontSize:12.5,color:ui.text}}>{beneficiaryName(e)}</div>
                                    {e.beneficiary_type && e.beneficiary_type !== "supplier" && (
                                      <div style={{fontSize:10,color:ui.textSub,fontFamily:ui.fontBody}}>{benTypeLabel(e.beneficiary_type)}</div>
                                    )}
                                  </div>
                                ) : (
                                  <button onClick={() => {
                                    setExpEditingId(e.id);
                                    setExpEditDraft({
                                      ...e,
                                      quantity: String(e.quantity ?? ""),
                                      unit_price: String(e.unit_price ?? ""),
                                      type: e.type || "variable",
                                      payment_method: e.payment_method || "cash",
                                      beneficiary_type: e.beneficiary_type || "supplier",
                                      is_recurring: !!e.is_recurring,
                                      receipt_path: e.receipt_path || "",
                                      _beneficiaryTyped: "",
                                    });
                                  }}
                                    title="لم يتم حفظ جهة لهذا المصروف — اضغط للإضافة"
                                    style={{background:"transparent",border:"1px dashed #D4D4D4",borderRadius:4,
                                      padding:"3px 8px",cursor:"pointer",fontFamily:ui.fontBody,fontSize:11,
                                      color:ui.textSub,fontStyle:"italic"}}>
                                    + أضف جهة
                                  </button>
                                )
                              )}
                            </td>
                            {/* Payment method */}
                            <td style={tdCell}>
                              {editing ? (
                                <select value={editVal.payment_method || "cash"} onChange={ev=>setExpEditDraft({...editVal, payment_method:ev.target.value})}
                                  style={{...inputSm,padding:"6px 8px"}}>
                                  <option value="cash">كاش</option>
                                  <option value="transfer">تحويل</option>
                                  <option value="card">فيزا</option>
                                  <option value="wallet">محفظة</option>
                                </select>
                              ) : (
                                <span style={{fontSize:11,padding:"3px 9px",borderRadius:20,background: pmColor(e.payment_method||"cash"),color: pmFg(e.payment_method||"cash"),whiteSpace:"nowrap"}}>
                                  {pmLabel(e.payment_method||"cash")}
                                </span>
                              )}
                            </td>
                            {/* Date (entry date — read-only after creation) */}
                            <td style={{...tdCell,whiteSpace:"nowrap",color:ui.textSub,fontSize:11.5}}>
                              {editing
                                ? <input type="date" style={{...inputSm,padding:"5px 9px"}} value={editVal.date || ""} onChange={ev=>setExpEditDraft({...editVal, date:ev.target.value})}/>
                                : (e.date || "—")}
                            </td>
                            {/* Payment status (مدفوع / غير مدفوع) — drives Cash Out aggregates.
                                In edit mode: checkbox toggles payment_date between today and NULL,
                                with a date picker shown when paid. */}
                            <td style={tdCell}>
                              {editing ? (
                                <div style={{display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
                                  <label style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:ui.text,cursor:"pointer"}}>
                                    <input type="checkbox"
                                      checked={!!editVal.payment_date}
                                      onChange={ev => setExpEditDraft({
                                        ...editVal,
                                        payment_date: ev.target.checked ? (editVal.payment_date || new Date().toISOString().slice(0,10)) : "",
                                      })}
                                      style={{accentColor:ui.text,cursor:"pointer"}}/>
                                    تم الدفع
                                  </label>
                                  {!!editVal.payment_date && (
                                    <input type="date" style={{...inputSm,padding:"4px 7px",width:118}} value={editVal.payment_date || ""}
                                      onChange={ev=>setExpEditDraft({...editVal, payment_date:ev.target.value})}/>
                                  )}
                                </div>
                              ) : e.payment_date ? (
                                <span style={{fontSize:10.5,padding:"3px 9px",borderRadius:20,background:"#DCFCE7",color:"#15803D",whiteSpace:"nowrap"}}
                                  title={`دُفع في ${e.payment_date}`}>
                                  مدفوع
                                  <span style={{marginInlineStart:5,fontSize:9.5,color:"#166534",fontFamily:"monospace"}}>{String(e.payment_date).slice(0,10)}</span>
                                </span>
                              ) : (
                                <span style={{fontSize:10.5,padding:"3px 9px",borderRadius:20,background:"#FEF3C7",color:"#92400E",whiteSpace:"nowrap"}}
                                  title="هذا المصروف موافق عليه لكن لم يُدفع بعد — يظهر في الذمم">
                                  غير مدفوع
                                </span>
                              )}
                            </td>
                            {/* Status badge — approval workflow (always read-only) */}
                            <td style={tdCell}>
                              <span style={{fontSize:10.5,padding:"3px 9px",borderRadius:20,background:stat.bg,color:stat.fg,whiteSpace:"nowrap"}}
                                title={stat.tip || e.rejection_reason || e.budget_override_reason || ""}>{stat.t}</span>
                            </td>
                            {/* Notes + receipt + recurring */}
                            <td style={{...tdCell, color:ui.textSub, fontSize:11.5, maxWidth:200, whiteSpace:"nowrap"}} title={e.notes || ""}>
                              {editing ? (
                                <div style={{display:"flex",alignItems:"center",gap:6}}>
                                  <input style={{...inputSm,padding:"5px 9px",flex:1,minWidth:120}} value={editVal.notes || ""} onChange={ev=>setExpEditDraft({...editVal, notes:ev.target.value})} placeholder="ملاحظات"/>
                                  <label style={{cursor: expUploading?"wait":"pointer",padding:"3px 7px",border:ui.border,borderRadius:4,fontSize:10.5,color:ui.textSub}} title={editVal.receipt_path ? "استبدال الإيصال" : "إضافة إيصال"}>
                                    {expUploading ? "..." : editVal.receipt_path ? "✓📎" : "📎"}
                                    <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{display:"none"}}
                                      onChange={async (ev) => { const url = await uploadExpenseReceipt(ev.target.files && ev.target.files[0]); if (url) setExpEditDraft({...editVal, receipt_path:url}); ev.target.value=""; }}/>
                                  </label>
                                  <label title="متكرر شهرياً" style={{display:"flex",alignItems:"center",fontSize:10.5,color:ui.textSub,cursor:"pointer"}}>
                                    <input type="checkbox" checked={!!editVal.is_recurring} onChange={ev=>setExpEditDraft({...editVal, is_recurring:ev.target.checked})} style={{accentColor:ui.text,cursor:"pointer"}}/>↻
                                  </label>
                                </div>
                              ) : (
                                <>
                                  {e.receipt_path && (
                                    <a href={e.receipt_path} target="_blank" rel="noreferrer" title="عرض الإيصال" style={{color:"#1D4ED8",textDecoration:"none",marginInlineEnd:6}}>📎</a>
                                  )}
                                  {e.is_recurring && <span title="متكرر شهرياً" style={{color:"#92400E",marginInlineEnd:4}}>↻</span>}
                                  <span style={{overflow:"hidden",textOverflow:"ellipsis",display:"inline-block",maxWidth:120,verticalAlign:"middle"}}>{e.notes || "—"}</span>
                                </>
                              )}
                            </td>
                            {/* Action buttons */}
                            <td style={{...tdCell, textAlign:"left",whiteSpace:"nowrap"}}>
                              {editing ? (
                                <div style={{display:"flex",gap:4}}>
                                  <button onClick={saveExpenseEdit} style={{background:ui.text,color:"#fff",border:"none",padding:"4px 10px",cursor:"pointer",fontSize:11,fontFamily:ui.fontBody,borderRadius:4}}>حفظ</button>
                                  <button onClick={()=>{ setExpEditingId(null); setExpEditDraft(null); }} style={{background:"transparent",border:ui.border,padding:"4px 9px",cursor:"pointer",fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,borderRadius:4}}>إلغاء</button>
                                </div>
                              ) : (
                                <div style={{display:"flex",gap:4,alignItems:"center",justifyContent:"flex-end"}}>
                                  {e.status === "pending" && isSuper && (
                                    <>
                                      <button title="موافقة" onClick={()=>approveExpense(e.id)} style={{background:"#DCFCE7",color:"#15803D",border:"none",padding:"4px 8px",borderRadius:4,fontSize:11,cursor:"pointer",fontFamily:ui.fontBody}}>✓</button>
                                      <button title="رفض" onClick={()=>rejectExpense(e.id)} style={{background:"#FEE2E2",color:"#B91C1C",border:"none",padding:"4px 8px",borderRadius:4,fontSize:11,cursor:"pointer",fontFamily:ui.fontBody}}>✗</button>
                                    </>
                                  )}
                                  <button title="تعديل" onClick={()=>{
                                    setExpEditingId(e.id);
                                    setExpEditDraft({
                                      ...e,
                                      quantity: String(e.quantity ?? ""),
                                      unit_price: String(e.unit_price ?? ""),
                                      type: e.type || "variable",
                                      payment_method: e.payment_method || "cash",
                                      beneficiary_type: e.beneficiary_type || "supplier",
                                      is_recurring: !!e.is_recurring,
                                      receipt_path: e.receipt_path || "",
                                      // _beneficiaryTyped left undefined → falls back to current name from cache
                                    });
                                  }}
                                    style={{background:"transparent",border:"none",cursor:"pointer",padding:4,color:ui.textSub,display:"flex"}}>
                                    <AdmIcon name="pencil" size={14}/>
                                  </button>
                                  <button title="حذف" onClick={()=>deleteExpense(e.id)}
                                    style={{background:"transparent",border:"none",cursor:"pointer",padding:4,color:"#DC2626",display:"flex"}}>
                                    <AdmIcon name="trash" size={14}/>
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}

                      {/* Inline add row */}
                      <tr style={{borderTop:"0.5px solid #EEE", background:"#FAFAFA"}}>
                        <td style={{padding:"9px 12px"}}>
                          <input style={{...inputSm, width:"100%"}} value={expDraft.description}
                            onChange={e=>setExpDraft({...expDraft, description:e.target.value})}
                            placeholder={`وصف ${expCatTab==="all" ? "المصروف" : (activeCat?.l || "")}`}/>
                        </td>
                        {expCatTab === "all" && (
                          <td style={{padding:"9px 12px"}}>
                            <select value={expDraft.category_key} onChange={e=>setExpDraft({...expDraft, category_key:e.target.value})}
                              style={{...inputSm, padding:"6px 8px"}}>
                              <option value="">اختر فئة...</option>
                              {/* dropdownCategories excludes deprecated keys (e.g., purchases). */}
                              {dropdownCategories.map(c => <option key={c.key} value={c.key}>{c.l}</option>)}
                            </select>
                          </td>
                        )}
                        <td style={{padding:"9px 12px"}}>
                          <select value={expDraft.type} onChange={e=>setExpDraft({...expDraft, type:e.target.value})}
                            style={{...inputSm, padding:"6px 8px"}}>
                            <option value="variable">متغير</option>
                            <option value="fixed">ثابت</option>
                          </select>
                        </td>
                        <td style={{padding:"9px 12px"}}>
                          <input type="text" inputMode="numeric" style={{...inputSm, width:70, direction:"ltr", textAlign:"left"}}
                            value={expDraft.quantity} onChange={e=>setExpDraft({...expDraft, quantity:e.target.value.replace(/[^0-9.]/g,'')})}/>
                        </td>
                        <td style={{padding:"9px 12px"}}>
                          <input type="text" inputMode="decimal" style={{...inputSm, width:90, direction:"ltr", textAlign:"left"}}
                            value={expDraft.unit_price} onChange={e=>setExpDraft({...expDraft, unit_price:e.target.value.replace(/[^0-9.]/g,'')})}/>
                        </td>
                        <td style={{padding:"9px 12px",fontWeight:500,fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,background:"#F3F4F6"}}>
                          {((Number(expDraft.quantity)||0) * (Number(expDraft.unit_price)||0)).toLocaleString()} ج
                        </td>
                        <td style={{padding:"9px 12px"}}>
                          {/* Beneficiary text + type. The "type" pill helps
                              segment expenses across employees / suppliers /
                              platforms for better reporting. */}
                          <div style={{display:"flex",gap:4,alignItems:"center"}}>
                            <input list="exp-beneficiary-list" style={{...inputSm, flex:1, minWidth:100}}
                              value={(expSuppliers.find(s => s.id === expDraft.supplier_id) || {}).name || expDraft._supplierTyped || ""}
                              onChange={e => {
                                const val = e.target.value;
                                const hit = expSuppliers.find(s => s.name === val);
                                setExpDraft({...expDraft, supplier_id: hit ? hit.id : "", _supplierTyped: hit ? "" : val});
                              }}
                              placeholder="اسم الجهة المستفيدة"/>
                            <datalist id="exp-beneficiary-list">
                              {expSuppliers.map(s => <option key={s.id} value={s.name}/>)}
                            </datalist>
                            <select value={expDraft.beneficiary_type || "supplier"} onChange={e=>setExpDraft({...expDraft, beneficiary_type:e.target.value})}
                              title="نوع الجهة"
                              style={{...inputSm,padding:"6px 6px",fontSize:11,width:74}}>
                              <option value="supplier">مورد</option>
                              <option value="employee">موظف</option>
                              <option value="platform">منصة</option>
                              <option value="government">حكومية</option>
                              <option value="other">أخرى</option>
                            </select>
                          </div>
                        </td>
                        <td style={{padding:"9px 12px"}}>
                          <select value={expDraft.payment_method} onChange={e=>setExpDraft({...expDraft, payment_method:e.target.value})}
                            style={{...inputSm, padding:"6px 8px"}}>
                            <option value="cash">كاش</option>
                            <option value="transfer">تحويل</option>
                            <option value="card">فيزا</option>
                            <option value="wallet">محفظة</option>
                          </select>
                        </td>
                        <td style={{padding:"9px 12px"}}>
                          <input type="date" style={{...inputSm, padding:"5px 9px"}} value={expDraft.date}
                            onChange={e=>setExpDraft({...expDraft, date:e.target.value})}/>
                        </td>
                        {/* Payment status — toggle "تم الدفع" reveals a date picker.
                            Default off (creates as Payable). When toggled on, defaults to today. */}
                        <td style={{padding:"9px 12px"}}>
                          <div style={{display:"flex",alignItems:"center",gap:4,whiteSpace:"nowrap"}}>
                            <label style={{display:"flex",alignItems:"center",gap:3,fontSize:11,color:ui.text,fontFamily:ui.fontBody,cursor:"pointer"}}>
                              <input type="checkbox"
                                checked={!!expDraft.payment_date}
                                onChange={e=>setExpDraft({
                                  ...expDraft,
                                  payment_date: e.target.checked ? (expDraft.payment_date || new Date().toISOString().slice(0,10)) : "",
                                })}
                                style={{accentColor:ui.text,cursor:"pointer"}}/>
                              تم الدفع
                            </label>
                            {!!expDraft.payment_date && (
                              <input type="date" style={{...inputSm,padding:"4px 7px",width:118}} value={expDraft.payment_date}
                                onChange={e=>setExpDraft({...expDraft, payment_date:e.target.value})}/>
                            )}
                          </div>
                        </td>
                        <td style={{padding:"9px 12px"}}>
                          {/* Receipt + recurring controls live here in the add-row's status slot */}
                          <div style={{display:"flex",alignItems:"center",gap:6}}>
                            <label style={{cursor: expUploading?"wait":"pointer",padding:"4px 8px",border:ui.border,borderRadius:5,fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>
                              {expUploading ? "..." : expDraft.receipt_path ? "✓ إيصال" : "📎 إيصال"}
                              <input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" style={{display:"none"}}
                                onChange={async (e) => { const url = await uploadExpenseReceipt(e.target.files && e.target.files[0]); if (url) setExpDraft({...expDraft, receipt_path:url}); e.target.value=""; }}/>
                            </label>
                            <label style={{display:"flex",alignItems:"center",gap:3,fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,cursor:"pointer"}}>
                              <input type="checkbox" checked={expDraft.is_recurring} onChange={e=>setExpDraft({...expDraft, is_recurring:e.target.checked})}
                                style={{accentColor:ui.text,cursor:"pointer"}}/>
                              متكرر
                            </label>
                          </div>
                        </td>
                        <td style={{padding:"9px 12px"}}>
                          <input style={{...inputSm, width:"100%"}} value={expDraft.notes}
                            onChange={e=>setExpDraft({...expDraft, notes:e.target.value})}
                            placeholder="ملاحظات (اختياري)"/>
                        </td>
                        <td style={{padding:"9px 12px",textAlign:"left",whiteSpace:"nowrap"}}>
                          <button onClick={addExpense} disabled={!expDraft.description.trim() || (expCatTab==="all" && !expDraft.category_key)}
                            style={{background: (expDraft.description.trim() && (expCatTab!=="all" || expDraft.category_key)) ? (catColor(draftCatKey) || ui.text) : "#9CA3AF",
                              color:"#fff",border:"none",padding:"6px 14px",
                              cursor: (expDraft.description.trim() && (expCatTab!=="all" || expDraft.category_key)) ? "pointer" : "not-allowed",
                              fontSize:12,fontFamily:ui.fontBody,borderRadius:4}}>
                            إضافة
                          </button>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Budget vs actual */}
                {budgetRows.length > 0 && (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,marginTop:14}}>
                    <button onClick={()=>setExpBudgetsOpen(o=>!o)}
                      style={{width:"100%",background:"transparent",border:"none",cursor:"pointer",padding:"12px 14px",
                        display:"flex",alignItems:"center",justifyContent:"space-between",
                        fontFamily:ui.fontBody,fontSize:13.5,color:ui.text,fontWeight:600}}>
                      <span>الميزانية مقابل الفعلي ({budgetRows.length})</span>
                      <span style={{color:ui.textSub,fontSize:12}}>{expBudgetsOpen ? "▲" : "▼"}</span>
                    </button>
                    {expBudgetsOpen && (
                      <div style={{padding:"0 14px 14px"}}>
                        {budgetRows.map(b => {
                          // Per-state icon next to the bar — green check (safe),
                          // amber alert-triangle (warning ≥ 80%), red alert-octagon
                          // (overrun ≥ 100%). Stays out of the layout when there
                          // is no budget configured for the row.
                          const stateIcon = b.state === "over" ? "⛔" : b.state === "approaching" ? "⚠️" : b.state === "under" ? "✓" : "";
                          const stateAria = b.state === "over" ? "تجاوز الميزانية" : b.state === "approaching" ? "اقتراب من حد الميزانية" : b.state === "under" ? "ضمن الميزانية" : "";
                          return (
                          <div key={b.cat.key} style={{padding:"10px 0",borderTop:"0.5px solid #EEE"}}>
                            <div style={{display:"flex",justifyContent:"space-between",fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,marginBottom:5,gap:8,flexWrap:"wrap"}}>
                              <span style={{display:"flex",alignItems:"center",gap:6}}>
                                <span style={{width:18,height:18,borderRadius:3,background:b.cat.color + "22",color:b.cat.color,display:"inline-flex",alignItems:"center",justifyContent:"center",fontSize:12}}>{b.cat.icon || "•"}</span>
                                {b.cat.l}
                                {stateIcon && (
                                  <span title={stateAria} aria-label={stateAria}
                                    style={{fontSize:13,color:b.tone,lineHeight:1,display:"inline-flex",alignItems:"center"}}>
                                    {stateIcon}
                                  </span>
                                )}
                              </span>
                              {b.state === "none" ? (
                                <span style={{color:"#9CA3AF",fontSize:11.5}}>لم يتم تحديد ميزانية · أُنفِق {b.spent.toLocaleString()} ج</span>
                              ) : b.state === "over" ? (
                                <span style={{color:ui.textSub}}>
                                  {b.spent.toLocaleString()} / {b.budget.toLocaleString()} ج
                                  <span style={{color:"#DC2626",fontWeight:700,marginInlineStart:8}}>زيادة {b.over.toLocaleString()} ج (+{b.realPct - 100}%)</span>
                                </span>
                              ) : (
                                <span style={{color:ui.textSub}}>
                                  {b.spent.toLocaleString()} / {b.budget.toLocaleString()} ج · متبقي {b.remaining.toLocaleString()} ج
                                </span>
                              )}
                            </div>
                            <div style={{height:6,background:"#F3F4F6",borderRadius:3,overflow:"hidden"}}>
                              <div style={{width: `${b.pct}%`, height:"100%", background:b.tone, transition:"width .3s"}}/>
                            </div>
                          </div>
                          );
                        })}
                        <div style={{textAlign:"left",marginTop:8}}>
                          <button onClick={()=>{ setTab("settings"); setSettingsTab("expenses"); }}
                            style={{background:"transparent",border:"none",color:"#1D4ED8",fontFamily:ui.fontBody,fontSize:12,cursor:"pointer",padding:0}}>
                            إدارة الميزانيات ←
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Recurring suggestions modal */}
                {expSuggOpen && (
                  <div onClick={()=>setExpSuggOpen(false)}
                    style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
                    <div onClick={e=>e.stopPropagation()}
                      style={{background:ui.cardBg,maxWidth:560,width:"100%",maxHeight:"80vh",overflow:"auto",padding:18,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
                      <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"0 0 12px"}}>المصروفات المتكررة من الشهر السابق</h3>
                      {expSugg.length === 0 ? (
                        <div style={{padding:"20px 0",textAlign:"center",color:ui.textSub,fontSize:12.5,fontFamily:ui.fontBody}}>لا توجد مقترحات</div>
                      ) : expSugg.map(s => (
                        <div key={s.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,padding:"10px 0",borderTop:"0.5px solid #EEE"}}>
                          <div style={{minWidth:0}}>
                            <div style={{fontSize:13,color:ui.text,fontWeight:500,fontFamily:ui.fontBody}}>{s.description || "—"}</div>
                            <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>{catLabel(s.category)} · {(Number(s.amount)||0).toLocaleString()} ج</div>
                          </div>
                          <div style={{display:"flex",gap:6}}>
                            <button onClick={async ()=>{ await acceptRecurringSuggestion(s); }}
                              style={{padding:"5px 12px",background:"#DCFCE7",color:"#15803D",border:"none",borderRadius:5,fontSize:11.5,fontFamily:ui.fontBody,cursor:"pointer"}}>
                              إضافة
                            </button>
                            <button onClick={()=>setExpSugg(prev => prev.filter(x => x.id !== s.id))}
                              style={{padding:"5px 12px",background:"transparent",border:ui.border,borderRadius:5,fontSize:11.5,fontFamily:ui.fontBody,color:ui.textSub,cursor:"pointer"}}>
                              تجاهل
                            </button>
                          </div>
                        </div>
                      ))}
                      <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
                        {expSugg.length > 0 && (
                          <button onClick={async ()=>{ for (const s of expSugg) { await acceptRecurringSuggestion(s); } setExpSuggOpen(false); }}
                            style={{padding:"7px 14px",background:ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:12.5,fontFamily:ui.fontBody,cursor:"pointer"}}>
                            إضافة الكل
                          </button>
                        )}
                        <button onClick={()=>setExpSuggOpen(false)}
                          style={{padding:"7px 14px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,fontFamily:ui.fontBody,color:ui.textSub,cursor:"pointer"}}>
                          إغلاق
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

          {/* ─── FINANCE ─────────────────────────────────────────────────── */}
          {tab === "finance" && (() => {
            // ── Phase 2 finance dashboard — 12 sections per spec.
            // Source of truth comes from refreshFinance() above, which fans
            // out to 9 backend endpoints in parallel and stashes results in
            // finSummary / finChart / finExpBreakdown / finCashFlow / finReceivables
            // / finPayables / finProfitByCategory / finKeyMetrics / finBreakEven.
            // Phase 3 deferred: dedicated print-PDF view + nightly cron.
            const s = finSummary || { revenue:0, cogs:0, gross_profit:0, gross_margin_pct:0, expenses_total:0, net_profit:0, margin_pct:0, net_margin_pct:0, cash_flow:0, cash_in:0, cash_out:0, order_count:0, top_products:[], top_by_revenue:[], top_by_profit:[], profit_by_category:[], cogs_warning_count:0, cogs_warning_products:[], forecast:null, comparison_mode:"period", change:null };
            const catLabel = (k) => (EXPENSE_CATEGORIES.find(c=>c.key===k) || {l:k}).l;
            const catColor = (k) => (EXPENSE_CATEGORIES.find(c=>c.key===k) || {color:"#6B7280"}).color;
            const fmt = (n) => Math.round(Number(n)||0).toLocaleString();
            const inputSm = { padding:"6px 10px", border:ui.border, borderRadius:6, background:ui.cardBg,
              fontFamily:ui.fontBody, fontSize:12, color:ui.text, outline:"none", direction:"ltr", boxSizing:"border-box" };
            const compareLabel = finCompare === "yoy" ? "السنة الماضية" : "الفترة السابقة";

            // Section 1 — 8 KPI cards (4 profitability + 4 operations).
            // `inverted` flips the change-direction color: a rising COGS or
            // expense bar is BAD (red), whereas rising revenue/profit is GOOD (green).
            const kpisRow1 = [
              { l:"الإيرادات",            v: fmt(s.revenue),          change: s.change?.revenue,          accent:"#16A34A" },
              { l:"تكلفة البضاعة (COGS)", v: fmt(s.cogs),             change: s.change?.cogs,             accent:"#F97316", inverted:true },
              { l:"إجمالي الربح",         v: fmt(s.gross_profit),     change: s.change?.gross_profit,     accent:"#3B82F6" },
              { l:"هامش الربح الإجمالي",   v: `${s.gross_margin_pct}%`,change: s.change?.gross_margin_pct, accent:"#0EA5E9", isPct:true },
            ];
            const kpisRow2 = [
              { l:"إجمالي المصروفات", v: fmt(s.expenses_total), change: s.change?.expenses_total, accent:"#EC4899", inverted:true },
              { l:"صافي الربح",      v: fmt(s.net_profit),     change: s.change?.net_profit,     accent:"#534AB7" },
              { l:"هامش صافي الربح", v: `${s.net_margin_pct}%`,change: s.change?.net_margin_pct, accent:"#9333EA", isPct:true },
              { l:"التدفق النقدي",   v: fmt(s.cash_flow),      change: s.change?.cash_flow,      accent: s.cash_flow >= 0 ? "#16A34A" : "#DC2626" },
            ];

            // CSV export — every visible section
            const exportFinanceCsv = () => {
              const head = ["القسم","البند","القيمة"];
              const lines = [head.join(",")];
              [...kpisRow1, ...kpisRow2].forEach(k => lines.push(["مؤشرات", k.l, String(k.v)].join(",")));
              if (finCashFlow) {
                lines.push(["التدفق النقدي", "كاش مستلم", String(finCashFlow.in_breakdown.cash)].join(","));
                lines.push(["التدفق النقدي", "تحويلات بنكية", String(finCashFlow.in_breakdown.transfer)].join(","));
                lines.push(["التدفق النقدي", "محافظ", String(finCashFlow.in_breakdown.wallet)].join(","));
                lines.push(["التدفق النقدي", "فيزا", String(finCashFlow.in_breakdown.visa)].join(","));
                lines.push(["التدفق النقدي", "مصروفات مدفوعة", String(finCashFlow.out_breakdown.expenses)].join(","));
                lines.push(["التدفق النقدي", "مرتجعات مسترجعة", String(finCashFlow.out_breakdown.refunds)].join(","));
                lines.push(["التدفق النقدي", "مشتريات مخزون", String(finCashFlow.out_breakdown.purchases)].join(","));
              }
              finExpBreakdown.rows.forEach(r => lines.push(["مصروفات بالفئة", catLabel(r.category), String(Math.round(r.amount))].join(",")));
              (s.top_by_revenue||[]).forEach(p => lines.push(["أفضل المنتجات (إيراد)", p.name, String(Math.round(p.revenue))].join(",")));
              (s.top_by_profit||[]).forEach(p => lines.push(["أفضل المنتجات (ربح)", p.name, String(Math.round(p.profit||0))].join(",")));
              (finProfitByCategory.rows||[]).forEach(r => lines.push(["ربح بفئة المنتج", r.category, String(Math.round(r.profit||0))].join(",")));
              const blob = new Blob(["﻿" + lines.join("\n")], { type:"text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              const { from, to } = resolveFinRange();
              a.href = url; a.download = `finance_${from}_to_${to}.csv`;
              document.body.appendChild(a); a.click(); a.remove();
              URL.revokeObjectURL(url);
            };
            // Phase 2 print — reuses the existing print-mode CSS. Dedicated
            // PDF report view ships in Phase 3.
            const exportFinancePdf = () => {
              injectPrintStyles();
              document.body.classList.add("nawra-print-mode");
              const cleanup = () => { document.body.classList.remove("nawra-print-mode"); window.removeEventListener("afterprint", cleanup); };
              window.addEventListener("afterprint", cleanup);
              setTimeout(cleanup, 4000);
              window.print();
            };

            // Tone tokens reused below
            const cardStyle = { background:ui.cardBg, border:ui.border, borderRadius:ui.radius };
            const sectionTitle = { fontSize:13, fontWeight:600, color:ui.text, fontFamily:ui.fontBody, padding:"12px 14px", borderBottom:"0.5px solid #EEE" };

            // Render KPI helper (used by both rows of section 1)
            const KpiCard = ({ k }) => {
              const ch = k.change;
              const showChange = ch !== undefined && ch !== null;
              const isGood = k.inverted ? (ch < 0) : (ch > 0);
              return (
                <div style={{...cardStyle, padding:"14px 16px", borderTop:`3px solid ${k.accent}`}}>
                  <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>{k.l}</div>
                  <div style={{fontSize:mob?17:21,color:ui.text,fontFamily:ui.fontHead,fontWeight:500,lineHeight:1.1}}>
                    {k.v}{!k.isPct && <span style={{fontSize:11.5,color:ui.textSub,marginInlineStart:5,fontFamily:ui.fontBody}}>ج</span>}
                  </div>
                  {showChange && (
                    <div style={{display:"flex",alignItems:"center",gap:4,marginTop:5,fontSize:11,fontFamily:ui.fontBody,
                      color: ch === 0 ? ui.textSub : (isGood ? "#16A34A" : "#DC2626")}}>
                      {ch !== 0 && <AdmIcon name={ch > 0 ? "arrow-up" : "arrow-down"} size={11}/>}
                      <span>{Math.abs(ch)}{k.isPct ? " نقطة" : "%"} مقارنة بـ{compareLabel}</span>
                    </div>
                  )}
                </div>
              );
            };

            // Section 4 — chart data preparation
            const revenueValues = finChart.map(m => Number(m.revenue) || 0);
            const expenseValues = finChart.map(m => Number(m.expenses) || 0);
            const netValues     = finChart.map(m => Number(m.net) || 0);
            const labels        = finChart.map(m => m.label);
            // Trend (simple moving 2-point avg) for the net-profit bar chart
            const netTrend = netValues.map((_, i, arr) => {
              if (i === 0) return arr[0];
              return (arr[i] + arr[i-1]) / 2;
            });

            // Section 5 — pie data
            const pieSlices = (finExpBreakdown.rows || []).map(r => ({
              label: catLabel(r.category), value: r.amount, color: catColor(r.category),
            }));

            // Section 6 — top products list per active tab
            const topList = finTopTab === "revenue" ? (s.top_by_revenue || []) : (s.top_by_profit || []);

            // Section 7 — profit-by-category rows
            const profitCategoryRows = (finProfitByCategory.rows || []).slice(0, 8).map(r => ({
              label: r.category || "غير مصنف", value: r.profit || 0, color: "#534AB7",
            }));

            // Section 11 — payment methods donut (from cash-flow in_breakdown)
            const paymentSlices = finCashFlow ? [
              { label:"كاش",          value: finCashFlow.in_breakdown.cash,     color:"#16A34A" },
              { label:"تحويل بنكي",   value: finCashFlow.in_breakdown.transfer, color:"#3B82F6" },
              { label:"محفظة",        value: finCashFlow.in_breakdown.wallet,   color:"#9333EA" },
              { label:"فيزا",         value: finCashFlow.in_breakdown.visa,     color:"#F97316" },
            ].filter(sl => sl.value > 0) : [];

            // Section 8 — break-even progress tone
            const beTone = finBreakEven == null ? "#9CA3AF"
              : finBreakEven.pct_of_break_even == null ? "#9CA3AF"
              : finBreakEven.pct_of_break_even >= 100 ? "#16A34A"
              : finBreakEven.pct_of_break_even >= 80  ? "#F59E0B"
              : "#DC2626";

            // Section 10 — forecast
            const fc = s.forecast;

            return (
              <div className="order-print-overlay" style={{padding:0}}>
                <div className="order-print-card" style={{background:"transparent"}}>

                  {/* TOP BAR — title + date pills + YoY toggle + filter chips + export */}
                  <div className="no-print" style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",flexWrap:"wrap",gap:10,marginBottom:12}}>
                    <div>
                      <h2 style={{fontSize:18,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:0}}>المالية</h2>
                      <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>تحليل مالي شامل وتدفق نقدي</div>
                    </div>
                    <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                      <button onClick={exportFinanceCsv}
                        style={{padding:"8px 14px",background:ui.cardBg,color:ui.text,border:ui.border,borderRadius:6,fontSize:12.5,cursor:"pointer",fontFamily:ui.fontBody}}>
                        تصدير CSV
                      </button>
                      <button onClick={exportFinancePdf}
                        style={{padding:"8px 14px",background:ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:12.5,cursor:"pointer",fontFamily:ui.fontBody}}>
                        طباعة تقرير
                      </button>
                    </div>
                  </div>

                  {/* Section 12 — Filter bar (sticky pills row) */}
                  <div className="no-print" style={{...cardStyle,padding:"10px 14px",marginBottom:12}}>
                    <div style={{display:"flex",gap:14,flexWrap:"wrap",alignItems:"center"}}>
                      <div style={{display:"flex",gap:4,flexWrap:"wrap"}}>
                        {[["today","اليوم"],["month","هذا الشهر"],["3months","آخر 3 أشهر"],["6months","آخر 6 أشهر"],["year","هذا العام"],["custom","مخصص"]].map(([k,l])=>(
                          <button key={k} onClick={()=>setFinRange(k)}
                            style={{padding:"5px 12px",borderRadius:14,fontSize:11.5,fontFamily:ui.fontBody,cursor:"pointer",
                              background: finRange===k ? ui.text : "transparent",
                              color: finRange===k ? "#fff" : ui.textSub,
                              border: finRange===k ? "none" : ui.border}}>{l}</button>
                        ))}
                      </div>
                      <div style={{display:"flex",gap:4,alignItems:"center"}}>
                        <span style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody}}>مقارنة بـ</span>
                        {[["period","الفترة السابقة"],["yoy","نفس الفترة العام الماضي"]].map(([k,l])=>(
                          <button key={k} onClick={()=>setFinCompare(k)}
                            style={{padding:"5px 11px",borderRadius:14,fontSize:11,fontFamily:ui.fontBody,cursor:"pointer",
                              background: finCompare===k ? "#534AB7" : "transparent",
                              color: finCompare===k ? "#fff" : ui.textSub,
                              border: finCompare===k ? "none" : ui.border}}>{l}</button>
                        ))}
                      </div>
                      <button onClick={()=>setFinFiltersOpen(o=>!o)}
                        style={{padding:"5px 11px",borderRadius:14,fontSize:11,fontFamily:ui.fontBody,cursor:"pointer",
                          background: (finFilters.payment_methods.length||finFilters.product_categories.length) ? "#0EA5E9" : "transparent",
                          color: (finFilters.payment_methods.length||finFilters.product_categories.length) ? "#fff" : ui.textSub,
                          border:ui.border}}>
                        فلاتر متقدمة {(finFilters.payment_methods.length||finFilters.product_categories.length) ? `(${finFilters.payment_methods.length + finFilters.product_categories.length})` : ""}
                      </button>
                    </div>
                    {finRange === "custom" && (
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginTop:8,maxWidth:340}}>
                        <input type="date" value={finFrom} onChange={e=>setFinFrom(e.target.value)} style={{...inputSm, padding:"6px 10px"}}/>
                        <input type="date" value={finTo}   onChange={e=>setFinTo(e.target.value)}   style={{...inputSm, padding:"6px 10px"}}/>
                      </div>
                    )}
                    {finFiltersOpen && (
                      <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px dashed #EEE",display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:14}}>
                        <div>
                          <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>طريقة الدفع</div>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {[["cash","كاش"],["transfer","تحويل"],["wallet","محفظة"],["card","فيزا"]].map(([k,l])=>{
                              const on = finFilters.payment_methods.includes(k);
                              return (
                                <button key={k} onClick={()=>setFinFilters(f=>({...f,payment_methods: on ? f.payment_methods.filter(x=>x!==k) : [...f.payment_methods,k]}))}
                                  style={{padding:"4px 11px",borderRadius:14,fontSize:11,fontFamily:ui.fontBody,cursor:"pointer",
                                    background: on ? ui.text : "transparent", color: on ? "#fff" : ui.textSub, border: on ? "none" : ui.border}}>{l}</button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6}}>فئة المنتج</div>
                          <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                            {(profitCategoryRows.length ? profitCategoryRows : [{label:"—"}]).map(r => {
                              const on = finFilters.product_categories.includes(r.label);
                              return (
                                <button key={r.label} onClick={()=>setFinFilters(f=>({...f,product_categories: on ? f.product_categories.filter(x=>x!==r.label) : [...f.product_categories,r.label]}))}
                                  style={{padding:"4px 11px",borderRadius:14,fontSize:11,fontFamily:ui.fontBody,cursor:"pointer",
                                    background: on ? ui.text : "transparent", color: on ? "#fff" : ui.textSub, border: on ? "none" : ui.border}}>{r.label}</button>
                              );
                            })}
                          </div>
                          <div style={{fontSize:10.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:6,fontStyle:"italic"}}>
                            ⚙ فلتر طريقة الدفع وفئة المنتج يؤثر على العرض (Phase 3 يدعمهما على الخادم).
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Warning banners — products with cost=0, negative cash flow */}
                  {s.cogs_warning_count > 0 && (
                    <div className="no-print" style={{padding:"10px 14px",background:"#FFFBEB",border:"1px solid #FDE68A",color:"#92400E",borderRadius:6,marginBottom:10,fontSize:12.5,fontFamily:ui.fontBody}}>
                      ⚠ <b>{s.cogs_warning_count}</b> منتج لا يحتوي على تكلفة محددة — تقدير الربح غير دقيق.
                      {s.cogs_warning_products && s.cogs_warning_products.length > 0 && (
                        <span style={{marginInlineStart:6}}>
                          {s.cogs_warning_products.map((name, i) => (
                            <React.Fragment key={name}>
                              {i > 0 && <span style={{color:ui.textSub,marginInlineStart:4,marginInlineEnd:4}}>·</span>}
                              <a href="#admin" onClick={(e)=>{e.preventDefault(); setTab("products");}}
                                style={{color:"#92400E",textDecoration:"underline",cursor:"pointer"}}>{name}</a>
                            </React.Fragment>
                          ))}
                        </span>
                      )}
                      <div style={{fontSize:11.5,color:"#9A3412",marginTop:4}}>
                        افتح صفحة المنتجات وحدّث حقل "التكلفة" لكل منتج لتظهر هوامش الربح الفعلية.
                      </div>
                    </div>
                  )}
                  {/* Deprecated-category note — surfaces when there are paid
                      purchases-category expenses in the period. Shows them
                      bucketed as inventory cash-out so the admin understands
                      why operating expenses excludes this number. */}
                  {(s.inventory_purchases_total || 0) > 0 && (
                    <div className="no-print" style={{padding:"10px 14px",background:"#EFF6FF",border:"1px solid #93C5FD",color:"#1E40AF",borderRadius:6,marginBottom:10,fontSize:12.5,fontFamily:ui.fontBody}}>
                      ℹ️ <b>{fmt(s.inventory_purchases_total)} ج</b> مشتريات مخزون مُسجَّلة كمصروفات (فئة مُلغاة) — مُستبعدة من إجمالي المصروفات التشغيلية ومن صافي الربح، لكن تظهر في التدفق النقدي الخارج (مشتريات مخزون).
                      <a href="#admin" onClick={(e)=>{e.preventDefault(); setTab("expenses");}}
                        style={{color:"#1D4ED8",textDecoration:"underline",cursor:"pointer",marginInlineStart:6}}>
                        راجع وأعد التصنيف ←
                      </a>
                    </div>
                  )}
                  {(s.cash_flow || 0) < 0 && (
                    <div className="no-print" style={{padding:"10px 14px",background:"#FEF2F2",border:"1px solid #FCA5A5",color:"#B91C1C",borderRadius:6,marginBottom:10,fontSize:12.5,fontFamily:ui.fontBody}}>
                      ⚠ تدفق نقدي سلبي — راجع المصروفات
                    </div>
                  )}

                  {/* SECTION 1 — KPI cards (8) in two rows of 4 */}
                  <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:10}}>
                    {kpisRow1.map((k,i) => <KpiCard key={`r1-${i}`} k={k}/>)}
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:12}}>
                    {kpisRow2.map((k,i) => <KpiCard key={`r2-${i}`} k={k}/>)}
                  </div>

                  {/* SECTION 2 — Cash flow breakdown */}
                  <div style={{...cardStyle,marginBottom:12}}>
                    <div style={sectionTitle}>التدفق النقدي</div>
                    <div style={{padding:"12px 14px",display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:18}}>
                      <div>
                        <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:8,fontWeight:600}}>تدفق داخل (Cash In)</div>
                        {[
                          ["كاش مستلم",        finCashFlow?.in_breakdown?.cash     || 0, "#16A34A"],
                          ["تحويلات بنكية",    finCashFlow?.in_breakdown?.transfer || 0, "#3B82F6"],
                          ["محافظ إلكترونية",  finCashFlow?.in_breakdown?.wallet   || 0, "#9333EA"],
                          ["مدفوعات فيزا",     finCashFlow?.in_breakdown?.visa     || 0, "#F97316"],
                        ].map(([lbl,val,col]) => (
                          <div key={lbl} style={{display:"flex",justifyContent:"space-between",fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,padding:"5px 0"}}>
                            <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                              <span style={{width:8,height:8,borderRadius:2,background:col}}/>{lbl}
                            </span>
                            <span style={{fontFamily:"monospace"}}>{fmt(val)} ج</span>
                          </div>
                        ))}
                        <div style={{display:"flex",justifyContent:"space-between",fontFamily:ui.fontBody,fontSize:13,color:ui.text,fontWeight:700,paddingTop:8,marginTop:6,borderTop:"1px dashed #E5E5E5"}}>
                          <span>الإجمالي الداخل</span>
                          <span style={{fontFamily:"monospace",color:"#16A34A"}}>{fmt(finCashFlow?.cash_in || 0)} ج</span>
                        </div>
                      </div>
                      <div>
                        <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:8,fontWeight:600}}>تدفق خارج (Cash Out)</div>
                        {[
                          ["مصروفات مدفوعة",  finCashFlow?.out_breakdown?.expenses  || 0, "#EC4899"],
                          ["مرتجعات مسترجعة", finCashFlow?.out_breakdown?.refunds   || 0, "#F97316"],
                          ["مشتريات مخزون",   finCashFlow?.out_breakdown?.purchases || 0, "#0EA5E9"],
                        ].map(([lbl,val,col]) => (
                          <div key={lbl} style={{display:"flex",justifyContent:"space-between",fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,padding:"5px 0"}}>
                            <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                              <span style={{width:8,height:8,borderRadius:2,background:col}}/>{lbl}
                            </span>
                            <span style={{fontFamily:"monospace"}}>{fmt(val)} ج</span>
                          </div>
                        ))}
                        <div style={{display:"flex",justifyContent:"space-between",fontFamily:ui.fontBody,fontSize:13,color:ui.text,fontWeight:700,paddingTop:8,marginTop:6,borderTop:"1px dashed #E5E5E5"}}>
                          <span>الإجمالي الخارج</span>
                          <span style={{fontFamily:"monospace",color:"#DC2626"}}>{fmt(finCashFlow?.cash_out || 0)} ج</span>
                        </div>
                      </div>
                    </div>
                    <div style={{padding:"12px 14px",borderTop:"0.5px solid #EEE",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#FAFAFA"}}>
                      <span style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,fontWeight:600}}>صافي التدفق النقدي</span>
                      <span style={{fontSize:16,fontFamily:ui.fontHead,fontWeight:700,color: (finCashFlow?.net_cash || 0) >= 0 ? "#16A34A" : "#DC2626"}}>
                        {(finCashFlow?.net_cash || 0) >= 0 ? "↑" : "↓"} {fmt(finCashFlow?.net_cash || 0)} <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,fontWeight:400}}>ج</span>
                      </span>
                    </div>
                  </div>

                  {/* SECTION 3 — Receivables + Payables */}
                  <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,marginBottom:12}}>
                    <div style={cardStyle}>
                      <div style={sectionTitle}>ذمم العملاء (Receivables)</div>
                      <div style={{padding:"12px 14px"}}>
                        <div style={{fontSize:24,color:ui.text,fontFamily:ui.fontHead,fontWeight:600}}>
                          {fmt(finReceivables?.total || 0)} <span style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>ج</span>
                        </div>
                        <div style={{marginTop:10,fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,display:"flex",flexDirection:"column",gap:6}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span>طلبات COD لم يتم استلامها</span>
                            <span style={{fontFamily:"monospace"}}>{fmt(finReceivables?.cod_pending?.amount || 0)} ج <span style={{color:ui.textSub,fontSize:11}}>({finReceivables?.cod_pending?.count || 0})</span></span>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span>أونلاين قيد التسوية</span>
                            <span style={{fontFamily:"monospace"}}>{fmt(finReceivables?.online_pending?.amount || 0)} ج <span style={{color:ui.textSub,fontSize:11}}>({finReceivables?.online_pending?.count || 0})</span></span>
                          </div>
                        </div>
                        <a href="#admin" onClick={(e)=>{e.preventDefault(); setTab("orders");}}
                          style={{display:"inline-block",marginTop:10,fontSize:12,color:"#1D4ED8",textDecoration:"none",fontFamily:ui.fontBody}}>عرض الطلبات ←</a>
                      </div>
                    </div>
                    <div style={cardStyle}>
                      <div style={sectionTitle}>ذمم الموردين (Payables)</div>
                      <div style={{padding:"12px 14px"}}>
                        <div style={{fontSize:24,color:ui.text,fontFamily:ui.fontHead,fontWeight:600}}>
                          {fmt(finPayables?.total || 0)} <span style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>ج</span>
                        </div>
                        <div style={{marginTop:10,fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,display:"flex",flexDirection:"column",gap:6}}>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span>فواتير معلقة (غير مدفوعة)</span>
                            <span style={{fontFamily:"monospace"}}>{fmt(finPayables?.pending_invoices?.amount || 0)} ج <span style={{color:ui.textSub,fontSize:11}}>({finPayables?.pending_invoices?.count || 0})</span></span>
                          </div>
                          <div style={{display:"flex",justifyContent:"space-between"}}>
                            <span>دفعات مجدولة هذا الشهر</span>
                            <span style={{fontFamily:"monospace"}}>{fmt(finPayables?.scheduled_this_month?.amount || 0)} ج <span style={{color:ui.textSub,fontSize:11}}>({finPayables?.scheduled_this_month?.count || 0})</span></span>
                          </div>
                        </div>
                        <a href="#admin" onClick={(e)=>{e.preventDefault(); setTab("expenses");}}
                          style={{display:"inline-block",marginTop:10,fontSize:12,color:"#1D4ED8",textDecoration:"none",fontFamily:ui.fontBody}}>عرض المصروفات ←</a>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 4 — 2 charts in one row */}
                  <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,marginBottom:12}}>
                    <div style={cardStyle}>
                      <div style={{...sectionTitle,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <span>الإيرادات مقابل المصروفات</span>
                        <div style={{display:"flex",gap:8,fontSize:10.5,fontFamily:ui.fontBody,fontWeight:400}}>
                          <span style={{display:"inline-flex",alignItems:"center",gap:4,color:ui.textSub}}>
                            <span style={{width:10,height:2,background:"#16A34A",display:"inline-block"}}/>إيرادات
                          </span>
                          <span style={{display:"inline-flex",alignItems:"center",gap:4,color:ui.textSub}}>
                            <span style={{width:10,height:2,background:"#EC4899",display:"inline-block"}}/>مصروفات
                          </span>
                          <span style={{display:"inline-flex",alignItems:"center",gap:4,color:ui.textSub}}>
                            <span style={{width:10,height:2,background:"#534AB7",display:"inline-block",borderTop:"1px dashed #534AB7"}}/>صافي الربح
                          </span>
                        </div>
                      </div>
                      <div style={{padding:"12px 14px"}}>
                        <MultiLineChart
                          series={[
                            { label:"الإيرادات", color:"#16A34A", values: revenueValues },
                            { label:"المصروفات", color:"#EC4899", values: expenseValues },
                            { label:"صافي الربح", color:"#534AB7", values: netValues, dashed: true },
                          ]}
                          xLabels={labels}
                          height={160}
                          ui={ui}
                        />
                      </div>
                    </div>
                    <div style={cardStyle}>
                      <div style={sectionTitle}>تطور صافي الربح</div>
                      <div style={{padding:"12px 14px"}}>
                        <BarChartSigned values={netValues} labels={labels} trendValues={netTrend} height={160} ui={ui}/>
                      </div>
                    </div>
                  </div>

                  {/* SECTION 5 — Expenses breakdown (pie + table) */}
                  <div style={{...cardStyle,marginBottom:12}}>
                    <div style={sectionTitle}>تفصيل المصروفات حسب الفئة</div>
                    {finExpBreakdown.rows.length === 0 ? (
                      <div style={{padding:"24px",textAlign:"center",color:ui.textSub,fontSize:12.5,fontFamily:ui.fontBody}}>لا توجد مصروفات في النطاق المحدد</div>
                    ) : (
                      <div style={{padding:"14px",display:"grid",gridTemplateColumns:mob?"1fr":"180px 1fr",gap:16,alignItems:"center"}}>
                        <div style={{display:"flex",justifyContent:"center"}}>
                          <PieChart slices={pieSlices} size={170} ui={ui}/>
                        </div>
                        <div style={{overflowX:"auto"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:480}}>
                            <thead>
                              <tr style={{background:ui.sideBg,borderBottom:"0.5px solid #E5E5E5"}}>
                                {["الفئة","المبلغ","% من الإيرادات","% من الإجمالي",`مقارنة بـ${compareLabel}`].map(h => (
                                  <th key={h} style={{padding:"9px 11px",textAlign:"right",fontSize:11,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {finExpBreakdown.rows.map(r => {
                                const pctOfTotal = finExpBreakdown.total ? Math.round((r.amount / finExpBreakdown.total) * 1000) / 10 : 0;
                                return (
                                  <tr key={r.category} style={{borderTop:"0.5px solid #EEE"}}>
                                    <td style={{padding:"8px 11px",fontSize:12.5,color:ui.text}}>
                                      <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                                        <span style={{width:8,height:8,borderRadius:"50%",background:catColor(r.category)}}/>
                                        {catLabel(r.category)}
                                      </span>
                                    </td>
                                    <td style={{padding:"8px 11px",fontSize:12.5,color:ui.text,fontWeight:500,whiteSpace:"nowrap"}}>{fmt(r.amount)} ج</td>
                                    <td style={{padding:"8px 11px",fontSize:11.5,color:ui.textSub,whiteSpace:"nowrap"}}>{r.pct_of_revenue}%</td>
                                    <td style={{padding:"8px 11px",fontSize:11.5,color:ui.textSub,whiteSpace:"nowrap"}}>{pctOfTotal}%</td>
                                    <td style={{padding:"8px 11px",fontSize:11,whiteSpace:"nowrap",
                                      color: r.change_pct == null ? ui.textSub : r.change_pct > 0 ? "#DC2626" : r.change_pct < 0 ? "#16A34A" : ui.textSub}}>
                                      {r.change_pct == null ? "—" : `${r.change_pct > 0 ? "↑+" : "↓"}${Math.abs(r.change_pct)}%`}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* SECTION 6 — Top products (tabs + thumbnails + cost/profit columns) */}
                  <div style={{...cardStyle,marginBottom:12}}>
                    <div style={{...sectionTitle,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                      <span>أفضل المنتجات (Top 5)</span>
                      <div style={{display:"flex",gap:4}}>
                        {[["revenue","الأكثر إيراداً"],["profit","الأكثر ربحية"]].map(([k,l])=>(
                          <button key={k} onClick={()=>setFinTopTab(k)}
                            style={{padding:"4px 11px",borderRadius:12,fontSize:11,fontFamily:ui.fontBody,cursor:"pointer",
                              background: finTopTab===k ? ui.text : "transparent",
                              color: finTopTab===k ? "#fff" : ui.textSub,
                              border: finTopTab===k ? "none" : ui.border, fontWeight:400}}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{overflowX:"auto"}}>
                      <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:640}}>
                        <thead>
                          <tr style={{background:ui.sideBg,borderBottom:"0.5px solid #E5E5E5"}}>
                            {["","المنتج","المبيعات","الإيراد","التكلفة","الربح","هامش %"].map(h => (
                              <th key={h} style={{padding:"9px 11px",textAlign:"right",fontSize:11,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {topList.length === 0 ? (
                            <tr><td colSpan={7} style={{padding:"20px",textAlign:"center",color:ui.textSub,fontSize:12.5}}>لا توجد طلبات في النطاق</td></tr>
                          ) : topList.map((p,i) => (
                            <tr key={i} style={{borderTop:"0.5px solid #EEE"}}>
                              <td style={{padding:"7px 11px"}}>
                                <span style={{width:30,height:30,display:"inline-block",borderRadius:5,background:"#F3F4F6",overflow:"hidden",verticalAlign:"middle",border:"0.5px solid #EEE"}}>
                                  {p.image && <img src={p.image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                                </span>
                              </td>
                              <td style={{padding:"7px 11px",fontSize:12.5,color:ui.text,fontWeight:500}}>{p.name}</td>
                              <td style={{padding:"7px 11px",fontSize:12,color:ui.textSub}}>{p.qty} قطعة</td>
                              <td style={{padding:"7px 11px",fontSize:12.5,color:ui.text,whiteSpace:"nowrap"}}>{fmt(p.revenue)} ج</td>
                              <td style={{padding:"7px 11px",fontSize:12,color:ui.textSub,whiteSpace:"nowrap"}}>{fmt(p.cost)} ج</td>
                              <td style={{padding:"7px 11px",fontSize:12.5,color: (p.profit||0) >= 0 ? "#16A34A" : "#DC2626",fontWeight:500,whiteSpace:"nowrap"}}>{fmt(p.profit||0)} ج</td>
                              <td style={{padding:"7px 11px",fontSize:12,fontWeight:500,whiteSpace:"nowrap",
                                color: p.margin_pct > 30 ? "#16A34A" : p.margin_pct > 10 ? "#F97316" : "#DC2626"}}>
                                {p.margin_pct}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* SECTION 7 — Profit by product category */}
                  <div style={{...cardStyle,marginBottom:12}}>
                    <div style={sectionTitle}>الأرباح حسب فئة المنتج</div>
                    <div style={{padding:"14px"}}>
                      <HBarChart rows={profitCategoryRows} ui={ui}/>
                    </div>
                  </div>

                  {/* SECTION 8 — Break-even analysis */}
                  <div style={{...cardStyle,marginBottom:12}}>
                    <div style={sectionTitle}>نقطة التعادل الشهرية</div>
                    <div style={{padding:"14px"}}>
                      {finBreakEven == null ? (
                        <div style={{color:ui.textSub,fontSize:12.5,fontFamily:ui.fontBody}}>جاري التحميل…</div>
                      ) : (
                        <>
                          <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(3,1fr)",gap:12,marginBottom:14}}>
                            <div>
                              <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:3}}>المصروفات الثابتة الشهرية</div>
                              <div style={{fontSize:16,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>{fmt(finBreakEven.fixed_monthly_expenses)} <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>ج</span></div>
                            </div>
                            <div>
                              <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:3}}>هامش الربح الإجمالي</div>
                              <div style={{fontSize:16,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>{finBreakEven.gross_margin_pct}%</div>
                            </div>
                            <div>
                              <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:3}}>نقطة التعادل (إيراد)</div>
                              <div style={{fontSize:16,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>
                                {finBreakEven.break_even_revenue == null ? "—" : `${fmt(finBreakEven.break_even_revenue)} ج`}
                              </div>
                            </div>
                          </div>
                          {finBreakEven.break_even_revenue != null && (
                            <>
                              <div style={{fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,marginBottom:8}}>
                                تحتاج إلى مبيعات بقيمة <b>{fmt(finBreakEven.break_even_revenue)} ج</b> شهرياً لتغطية المصروفات الثابتة.
                              </div>
                              <div style={{display:"flex",justifyContent:"space-between",fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>
                                <span>الإيرادات الفعلية حالياً: {fmt(finBreakEven.current_revenue)} ج</span>
                                <span>{finBreakEven.pct_of_break_even}%</span>
                              </div>
                              <div style={{height:10,background:"#F3F4F6",borderRadius:5,overflow:"hidden",marginBottom:8}}>
                                <div style={{width: `${Math.min(100, finBreakEven.pct_of_break_even || 0)}%`, height:"100%", background: beTone, transition:"width .35s ease"}}/>
                              </div>
                              <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                                باقي {finBreakEven.days_remaining} يوم في الشهر · توقّع نهاية الشهر: <b style={{color:ui.text}}>{fmt(finBreakEven.projected_revenue)} ج</b>
                              </div>
                            </>
                          )}
                        </>
                      )}
                    </div>
                  </div>

                  {/* SECTION 9 — Key metrics (AOV / Inv Turnover / CAC / CLV) with sparklines */}
                  <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:12}}>
                    {[
                      { l:"متوسط قيمة الطلب (AOV)", v: fmt(finKeyMetrics?.aov?.value || 0), suf:"ج", spark: finKeyMetrics?.aov?.sparkline || [], col:"#16A34A" },
                      { l:"معدل دوران المخزون (سنوي)", v: finKeyMetrics?.inventory_turnover?.value ?? 0, suf:"×", spark: finKeyMetrics?.inventory_turnover?.sparkline || [], col:"#3B82F6" },
                      { l:"تكلفة جذب العميل (CAC)", v: fmt(finKeyMetrics?.cac?.value || 0), suf:"ج", spark: finKeyMetrics?.cac?.sparkline || [], col:"#F97316" },
                      { l:"قيمة العميل (CLV)", v: fmt(finKeyMetrics?.clv?.value || 0), suf:"ج", spark: finKeyMetrics?.clv?.sparkline || [], col:"#9333EA" },
                    ].map((m,i) => (
                      <div key={i} style={{...cardStyle, padding:"12px 14px"}}>
                        <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>{m.l}</div>
                        <div style={{display:"flex",alignItems:"baseline",justifyContent:"space-between",gap:8}}>
                          <div style={{fontSize:mob?16:18,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>
                            {m.v}<span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginInlineStart:3}}>{m.suf}</span>
                          </div>
                          <Sparkline values={m.spark} color={m.col}/>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* SECTION 10 — Forecast (3 scenarios) */}
                  <div style={{background:"linear-gradient(135deg,#FAF7F2,#F0EBE3)",border:ui.border,borderRadius:ui.radius,padding:"16px 18px",marginBottom:12}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:6,letterSpacing:".04em"}}>توقع الفترة القادمة</div>
                    {fc ? (
                      <>
                        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(3,1fr)",gap:14,marginTop:8}}>
                          {[
                            { l:"متشائم", v: fc.pessimistic, col:"#DC2626" },
                            { l:"واقعي",  v: fc.realistic,   col:"#534AB7" },
                            { l:"متفائل", v: fc.optimistic,  col:"#16A34A" },
                          ].map((sc,i) => (
                            <div key={i} style={{padding:"10px 14px",background:ui.cardBg,borderRadius:6,border:`0.5px solid ${sc.col}33`}}>
                              <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:4}}>{sc.l}</div>
                              <div style={{fontSize:18,color:sc.col,fontFamily:ui.fontHead,fontWeight:600}}>
                                {sc.v.toLocaleString()} <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,fontWeight:400}}>ج</span>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div style={{marginTop:12,display:"flex",justifyContent:"space-between",alignItems:"center",fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                          <span>{fc.method}</span>
                          <Sparkline values={fc.history} color="#534AB7" width={100} height={28}/>
                        </div>
                      </>
                    ) : (
                      <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,lineHeight:1.7,maxWidth:480}}>
                        التوقع يتطلب 3 أشهر على الأقل من البيانات. كلما توفّرت بيانات أكثر، كلما أصبح التوقع أدق.
                      </div>
                    )}
                  </div>

                  {/* SECTION 11 — Payment methods donut */}
                  <div style={{...cardStyle,marginBottom:12}}>
                    <div style={sectionTitle}>الإيرادات حسب طريقة الدفع</div>
                    <div style={{padding:"14px",display:"grid",gridTemplateColumns:mob?"1fr":"180px 1fr",gap:16,alignItems:"center"}}>
                      <div style={{display:"flex",justifyContent:"center"}}>
                        <PieChart slices={paymentSlices} size={170} innerRadiusPct={55} ui={ui}/>
                      </div>
                      <div style={{display:"flex",flexDirection:"column",gap:6}}>
                        {paymentSlices.length === 0 ? (
                          <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>لا توجد مدفوعات مستلمة بعد</div>
                        ) : paymentSlices.map(sl => (
                          <div key={sl.label} style={{display:"flex",justifyContent:"space-between",alignItems:"center",fontFamily:ui.fontBody,fontSize:12.5,color:ui.text}}>
                            <span style={{display:"inline-flex",alignItems:"center",gap:6}}>
                              <span style={{width:10,height:10,borderRadius:2,background:sl.color}}/>{sl.label}
                            </span>
                            <span style={{fontFamily:"monospace"}}>{fmt(sl.value)} ج</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            );
          })()}

          {/* ─── SHIPMENTS MANAGEMENT (Phase 2 of the shipping refactor) ─── */}
          {tab === "shipping" && (() => {
            const ag = shipAggregates || { counts:{} };
            const counts = ag.counts || {};
            const statusBadge = (s) => {
              if (s === "ready")     return { bg:"#FEF3C7", fg:"#92400E", l:"جاهز للشحن" };
              if (s === "shipped")   return { bg:"#DBEAFE", fg:"#1D4ED8", l:"تم الشحن" };
              if (s === "delivered") return { bg:"#DCFCE7", fg:"#15803D", l:"تم التسليم" };
              if (s === "returned")  return { bg:"#FEE2E2", fg:"#B91C1C", l:"مرتجع للمتجر" };
              if (s === "cancelled") return { bg:"#F3F4F6", fg:"#525252", l:"ملغي" };
              return { bg:"#F3F4F6", fg:"#525252", l: s || "—" };
            };
            const shipTabs = [
              ["all",       "الكل",         counts.total     || 0],
              ["ready",     "جاهز للشحن",   counts.ready     || 0],
              ["shipped",   "تم الشحن",     counts.shipped   || 0],
              ["delivered", "تم التسليم",   counts.delivered || 0],
              ["returned",  "مرتجع للمتجر", counts.returned  || 0],
              ["cancelled", "ملغي",         counts.cancelled || 0],
            ];
            const relDate = (iso) => {
              if (!iso) return "—";
              const t = new Date(String(iso).replace(" ","T") + "Z").getTime();
              if (!t) return "—";
              const days = Math.round((Date.now() - t) / 86400000);
              if (days < 1) return "اليوم";
              if (days === 1) return "أمس";
              if (days < 7) return `منذ ${days} أيام`;
              return new Date(t).toLocaleDateString("ar-EG");
            };
            const exportCsv = () => {
              const head = ["AWB","رقم الطلب","العميل","المنطقة","الوزن (كجم)","الشركة","تكلفة الشحن","محصل من العميل","الحالة","تاريخ الشحن"];
              const esc = (v) => { const x = v == null ? "" : String(v); return /[",\n]/.test(x) ? `"${x.replace(/"/g,'""')}"` : x; };
              const rows = (Object.keys(shipSelected).filter(k => shipSelected[k]).length > 0)
                ? shipments.filter(r => shipSelected[r.id]) : shipments;
              const lines = [head.join(",")];
              rows.forEach(r => lines.push([
                r.awb_number, r.order_id, r.customer_name, r.zone_name,
                r.weight_kg, r.courier_name,
                (Number(r.courier_cost)||0).toLocaleString(),
                ((Number(r.customer_paid_shipping)||0) + (Number(r.customer_paid_cod)||0)).toLocaleString(),
                statusBadge(r.status).l,
                r.shipped_at || ""
              ].map(esc).join(",")));
              const blob = new Blob(["﻿" + lines.join("\n")], { type:"text/csv;charset=utf-8;" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a"); a.href = url; a.download = `shipments_${Date.now()}.csv`;
              document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url);
            };
            const totalPages = Math.max(1, Math.ceil(shipTotal / 25));
            const allChecked = shipments.length > 0 && shipments.every(r => shipSelected[r.id]);
            const selectedIds = Object.keys(shipSelected).filter(k => shipSelected[k]);

            return (
              <div>
                {/* Top bar */}
                <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
                  <div>
                    <h2 style={{fontSize:18,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:0}}>إدارة الشحنات</h2>
                    <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>تتبع كل شحنات المتجر</div>
                  </div>
                  <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                    <button onClick={exportCsv}
                      style={{padding:"8px 14px",background:ui.cardBg,color:ui.text,border:ui.border,borderRadius:6,fontSize:12.5,cursor:"pointer",fontFamily:ui.fontBody}}>
                      تصدير CSV
                    </button>
                    <button disabled title="سيتم تفعيل طباعة البوليصات المجمعة في المرحلة الثالثة (jsPDF + bwip-js)"
                      style={{padding:"8px 14px",background:ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:12.5,cursor:"not-allowed",fontFamily:ui.fontBody,opacity:0.55}}>
                      طباعة بوليصات مجمعة
                    </button>
                  </div>
                </div>

                {/* KPI cards (5) */}
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(5,1fr)",gap:10,marginBottom:10}}>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px",borderTop:`3px solid ${(counts.shipped || 0) > 10 ? "#F59E0B" : "#3B82F6"}`}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>شحنات قيد التوصيل</div>
                    <div style={{fontSize:mob?17:21,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>{counts.shipped || 0}</div>
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px",borderTop:"3px solid #16A34A"}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>تم تسليمها هذا الشهر</div>
                    <div style={{fontSize:mob?17:21,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>{ag.delivered_current_month || 0}</div>
                    {ag.delivered_change_pct != null && ag.delivered_change_pct !== 0 && (
                      <div style={{fontSize:11,marginTop:4,color: ag.delivered_change_pct > 0 ? "#16A34A" : "#DC2626",fontFamily:ui.fontBody}}>
                        {ag.delivered_change_pct > 0 ? "↑" : "↓"} {Math.abs(ag.delivered_change_pct)}% مقارنة بالشهر السابق
                      </div>
                    )}
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px",borderTop:"3px solid #0EA5E9"}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>متوسط وقت التوصيل</div>
                    <div style={{fontSize:mob?17:21,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>
                      {ag.avg_delivery_days == null ? "—" : `${ag.avg_delivery_days}`}
                      {ag.avg_delivery_days != null && <span style={{fontSize:11,color:ui.textSub,marginInlineStart:4,fontFamily:ui.fontBody}}>يوم</span>}
                    </div>
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px",borderTop:"3px solid #9333EA"}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>نسبة التوصيل في الوقت</div>
                    <div style={{fontSize:mob?17:21,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>
                      {ag.on_time_pct == null ? "—" : `${ag.on_time_pct}%`}
                    </div>
                  </div>
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px",borderTop:"3px solid #F97316"}}>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>تكلفة الشحن (الشهر)</div>
                    <div style={{fontSize:mob?17:21,color:ui.text,fontFamily:ui.fontHead,fontWeight:500}}>
                      {(ag.courier_cost_month || 0).toLocaleString()} <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>ج</span>
                    </div>
                  </div>
                </div>

                {/* Insight: shipping margin */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"12px 16px",marginBottom:14,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,flexWrap:"wrap"}}>
                  <div>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:4}}>هامش الشحن (الشهر)</div>
                    <div style={{fontSize:14,color:ui.text,fontFamily:ui.fontBody,lineHeight:1.7}}>
                      محصل من العملاء <b style={{fontFamily:"monospace"}}>{(ag.customer_paid_month || 0).toLocaleString()} ج</b> ناقص تكلفة الشركة <b style={{fontFamily:"monospace"}}>{(ag.courier_cost_month || 0).toLocaleString()} ج</b>
                    </div>
                  </div>
                  <div style={{fontSize:20,fontFamily:ui.fontHead,fontWeight:700,color: (ag.shipping_margin_month || 0) >= 0 ? "#16A34A" : "#DC2626"}}>
                    {(ag.shipping_margin_month || 0) >= 0 ? "+" : ""}{(ag.shipping_margin_month || 0).toLocaleString()} <span style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,fontWeight:400}}>ج</span>
                    <div style={{fontSize:10.5,color: (ag.shipping_margin_month || 0) >= 0 ? "#15803D" : "#B91C1C",fontFamily:ui.fontBody,fontWeight:400,textAlign:"end"}}>
                      {(ag.shipping_margin_month || 0) >= 0 ? "مربح" : "أنت تدعم الشحن"}
                    </div>
                  </div>
                </div>

                {/* Tabs */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"6px 6px",marginBottom:10,display:"flex",gap:4,overflowX:"auto"}}>
                  {shipTabs.map(([k,l,n]) => (
                    <button key={k} onClick={()=>{ setShipTab(k); setShipPage(1); setShipSelected({}); }}
                      style={{padding:"7px 14px",border:"none",cursor:"pointer",borderRadius:6,
                        background: shipTab===k ? ui.text : "transparent",
                        color: shipTab===k ? "#fff" : ui.textSub,
                        fontSize:12, fontFamily:ui.fontBody, whiteSpace:"nowrap"}}>
                      {l} ({n})
                    </button>
                  ))}
                </div>

                {/* Filter bar */}
                <div style={{display:"flex",gap:8,flexWrap:"wrap",marginBottom:10}}>
                  <input value={shipFilters.q} onChange={e=>{setShipFilters({...shipFilters,q:e.target.value}); setShipPage(1);}}
                    placeholder="بحث برقم البوليصة/الطلب/العميل/الهاتف"
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none",direction:"rtl",minWidth:240,flex:1}}/>
                  <select value={shipFilters.zone_id} onChange={e=>{setShipFilters({...shipFilters,zone_id:e.target.value}); setShipPage(1);}}
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل المناطق</option>
                    {(shipZones || []).map(z => <option key={z.id} value={z.id}>{z.name_ar}</option>)}
                  </select>
                  <select value={shipFilters.courier_id} onChange={e=>{setShipFilters({...shipFilters,courier_id:e.target.value}); setShipPage(1);}}
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="all">كل الشركات</option>
                    {(shipCouriers || []).map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                  <input type="date" value={shipFilters.from} onChange={e=>{setShipFilters({...shipFilters,from:e.target.value}); setShipPage(1);}}
                    title="من تاريخ"
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}/>
                  <input type="date" value={shipFilters.to} onChange={e=>{setShipFilters({...shipFilters,to:e.target.value}); setShipPage(1);}}
                    title="إلى تاريخ"
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}/>
                  <select value={shipFilters.sort} onChange={e=>setShipFilters({...shipFilters,sort:e.target.value})}
                    style={{padding:"8px 11px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none"}}>
                    <option value="newest">الأحدث</option>
                    <option value="late">المتأخرة أولاً</option>
                    <option value="heavy">الأعلى وزناً</option>
                  </select>
                </div>

                {/* Bulk action bar */}
                {selectedIds.length > 0 && (
                  <div style={{background:"#FFFBEA",border:"1px solid #FDE68A",borderRadius:6,padding:"8px 12px",marginBottom:8,display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
                    <span style={{fontSize:12.5,color:"#92400E",fontFamily:ui.fontBody}}>{selectedIds.length} شحنة محددة</span>
                    <button onClick={exportCsv}
                      style={{padding:"5px 11px",background:"#fff",border:"0.5px solid #FDE68A",borderRadius:5,fontSize:11.5,cursor:"pointer",color:"#92400E",fontFamily:ui.fontBody}}>تصدير المحدد</button>
                    <button onClick={() => { selectedIds.forEach(id => patchShipment(id, {status:"shipped"})); setShipSelected({}); }}
                      style={{padding:"5px 11px",background:"#DBEAFE",border:"0.5px solid #93C5FD",borderRadius:5,fontSize:11.5,cursor:"pointer",color:"#1D4ED8",fontFamily:ui.fontBody}}>
                      تحديث الحالة → تم الشحن
                    </button>
                  </div>
                )}

                {/* Result count */}
                <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:8}}>
                  {shipTotal === 0 ? "لا توجد شحنات حالياً" : `${shipments.length} من ${shipTotal} شحنة`}
                </div>

                {/* Table or empty state */}
                {(counts.total || 0) === 0 ? (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"56px 20px",textAlign:"center"}}>
                    <div style={{fontSize:42,marginBottom:10}}>📦</div>
                    <div style={{fontSize:15,color:ui.text,fontFamily:ui.fontBody,fontWeight:600,marginBottom:6}}>لا توجد شحنات بعد</div>
                    <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,maxWidth:380,margin:"0 auto"}}>
                      ستظهر هنا كل الشحنات بعد ضغط "شحن الطلب" من صفحة تفاصيل أي طلب.
                    </div>
                  </div>
                ) : shipments.length === 0 ? (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"40px",textAlign:"center",color:ui.textSub,fontFamily:ui.fontBody,fontSize:13}}>
                    لا توجد نتائج تطابق الفلاتر — جرّب توسيع المعايير
                  </div>
                ) : (
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:1100}}>
                      <thead>
                        <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                          <th style={{padding:"11px 10px",textAlign:"right",width:32}}>
                            <input type="checkbox" checked={allChecked}
                              onChange={e => {
                                if (e.target.checked) { const n = {}; shipments.forEach(r => { n[r.id] = true; }); setShipSelected(n); }
                                else setShipSelected({});
                              }}/>
                          </th>
                          {["AWB","رقم الطلب","العميل","المنطقة","الوزن","الشركة","تكلفة الشحن","محصل من العميل","تاريخ الشحن","المتوقع","الحالة","الإجراءات"].map(h => (
                            <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {shipments.map(r => {
                          const b = statusBadge(r.status);
                          const customerPaid = (Number(r.customer_paid_shipping)||0) + (Number(r.customer_paid_cod)||0);
                          const isLate = r.status === "shipped" && r.expected_delivery_date
                            && r.expected_delivery_date < new Date().toISOString().slice(0,10);
                          return (
                            <tr key={r.id} style={{borderTop:"0.5px solid #EEE", background: isLate ? "#FEF2F2" : "transparent"}}>
                              <td style={{padding:"9px 10px"}}>
                                <input type="checkbox" checked={!!shipSelected[r.id]}
                                  onChange={e => setShipSelected(p => ({...p, [r.id]: e.target.checked}))}/>
                              </td>
                              <td style={{padding:"9px 12px",fontSize:11.5,color:ui.textSub,fontFamily:"monospace"}}>{r.awb_number || "—"}</td>
                              <td style={{padding:"9px 12px",fontSize:12,fontFamily:"monospace"}}>
                                {r.order_id ? (
                                  <a href={`#admin/orders/${encodeURIComponent(r.order_id)}`} style={{color:"#1D4ED8",textDecoration:"none"}}>
                                    #{r.order_number || r.order_id}
                                  </a>
                                ) : "—"}
                              </td>
                              <td style={{padding:"9px 12px",fontSize:13,color:ui.text}}>
                                {r.customer_name || "—"}
                                {r.customer_phone && <div style={{fontSize:11,color:ui.textSub,fontFamily:"monospace"}}>{r.customer_phone}</div>}
                              </td>
                              <td style={{padding:"9px 12px",fontSize:12,color:ui.textSub}}>{r.zone_name || "—"}</td>
                              <td style={{padding:"9px 12px",fontSize:12,color:ui.text,whiteSpace:"nowrap"}}>{(Number(r.weight_kg) || 0).toFixed(2)} <span style={{fontSize:10.5,color:ui.textSub}}>كجم</span></td>
                              <td style={{padding:"9px 12px",fontSize:12,color:ui.text}}>{r.courier_name || "—"}</td>
                              <td style={{padding:"9px 12px",fontSize:12.5,color:ui.text,fontWeight:500,whiteSpace:"nowrap"}}>{(Number(r.courier_cost)||0).toLocaleString()} ج</td>
                              <td style={{padding:"9px 12px",fontSize:12.5,color:ui.text,fontWeight:500,whiteSpace:"nowrap"}}>{customerPaid.toLocaleString()} ج</td>
                              <td style={{padding:"9px 12px",fontSize:11.5,color:ui.textSub,whiteSpace:"nowrap"}}>
                                {r.shipped_at ? relDate(r.shipped_at) : <span style={{color:ui.textSub,fontStyle:"italic"}}>—</span>}
                              </td>
                              <td style={{padding:"9px 12px",fontSize:11.5,color: isLate ? "#B91C1C" : ui.textSub,whiteSpace:"nowrap",fontWeight: isLate ? 600 : 400}}>
                                {r.expected_delivery_date || "—"}
                                {isLate && <span style={{marginInlineStart:4,fontSize:10}}>⚠</span>}
                              </td>
                              <td style={{padding:"9px 12px"}}>
                                <span style={{fontSize:10.5,padding:"3px 10px",borderRadius:20,background:b.bg,color:b.fg,fontFamily:ui.fontBody,whiteSpace:"nowrap"}}>{b.l}</span>
                              </td>
                              <td style={{padding:"9px 12px",textAlign:"left",whiteSpace:"nowrap"}}>
                                <button title="عرض التفاصيل" onClick={() => setShipDetailAwb(r.awb_number || r.id)}
                                  style={{background:"transparent",border:"none",cursor:"pointer",padding:4,color:"#1D4ED8",fontSize:14}}>
                                  👁
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                  <div style={{display:"flex",justifyContent:"center",alignItems:"center",gap:8,marginTop:12,fontFamily:ui.fontBody,fontSize:12.5}}>
                    <button disabled={shipPage <= 1} onClick={() => setShipPage(shipPage - 1)}
                      style={{padding:"5px 11px",border:ui.border,background:ui.cardBg,borderRadius:5,cursor:shipPage <= 1 ? "not-allowed" : "pointer",opacity:shipPage <= 1 ? 0.5 : 1,color:ui.text}}>السابق</button>
                    <span style={{color:ui.textSub}}>{shipPage} / {totalPages}</span>
                    <button disabled={shipPage >= totalPages} onClick={() => setShipPage(shipPage + 1)}
                      style={{padding:"5px 11px",border:ui.border,background:ui.cardBg,borderRadius:5,cursor:shipPage >= totalPages ? "not-allowed" : "pointer",opacity:shipPage >= totalPages ? 0.5 : 1,color:ui.text}}>التالي</button>
                  </div>
                )}

                {/* Shipment Details modal */}
                {shipDetailAwb && (
                  <ShipmentDetailsModal
                    ship={shipDetail}
                    awbKey={shipDetailAwb}
                    sender={storeCfg}
                    onClose={() => setShipDetailAwb(null)}
                    onPatch={patchShipment}
                    onAppendNote={async (note) => {
                      try {
                        const r = await fetch(`/api/shipments/${encodeURIComponent(shipDetailAwb)}/notes`, {
                          method:"POST", headers:{"Content-Type":"application/json"},
                          body: JSON.stringify({ note, author: (authUser && authUser.name) || (authUser && authUser.email) || "admin" }),
                        });
                        if (r.ok) refreshShipDetail(shipDetailAwb);
                      } catch {}
                    }}
                    isSuper={isSuper}
                    ui={ui}
                    mob={mob}
                  />
                )}
              </div>
            );
          })()}

          {/* ─── COUPONS ─────────────────────────────────────────────────── */}
          {tab === "coupons" && (() => {
            const total       = coupons.length;
            const activeCnt   = coupons.filter(c => c.status === "نشط").length;
            const totalUses   = coupons.reduce((s,c)=>s+(c.uses||0),0);
            const totalSaved  = coupons.reduce((s,c)=>s+(c.total_saved||0),0);
            const inputStyle = { padding:"8px 11px", border:ui.border, borderRadius:6, background:ui.cardBg,
              fontFamily:ui.fontBody, fontSize:13, color:ui.text, outline:"none", direction:"rtl", boxSizing:"border-box", width:"100%" };
            const labelStyle = { display:"block", fontSize:12, color:ui.text, marginBottom:5, fontFamily:ui.fontBody };
            const couponTypeLabel = (t) => t==="percent"?"نسبة %" : t==="fixed"?"مبلغ ثابت" : "شحن مجاني";
            const couponDiscLabel = (c) => c.type==="percent" ? `${c.discount}%` : c.type==="fixed" ? `${c.discount} ج` : "—";
            const stBadge = (st) => st==="نشط" ? {bg:"#DCFCE7",fg:"#15803D"}
              : st==="مجدول" ? {bg:"#DBEAFE",fg:"#1D4ED8"}
              : {bg:"#F3F4F6",fg:"#737373"};

            return (
              <div>
                <div style={{display:"grid",gridTemplateColumns:mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:14}}>
                  <Metric label="كل الكوبونات" value={total} />
                  <Metric label="نشط"          value={activeCnt} hint={activeCnt ? "متاح للاستخدام" : "—"} />
                  <Metric label="استخدامات"     value={totalUses} />
                  <Metric label="توفير العملاء" value={totalSaved.toLocaleString()} suffix="ج" />
                </div>

                {cMsg && (
                  <div style={{padding:"8px 14px",borderRadius:6,marginBottom:10,fontSize:12.5,fontFamily:ui.fontBody,
                    background: cMsg.kind==="ok"?"#DCFCE7":"#FEE2E2",
                    color: cMsg.kind==="ok"?"#15803D":"#B91C1C",
                    border: `0.5px solid ${cMsg.kind==="ok"?"#86EFAC":"#FCA5A5"}`}}>{cMsg.text}</div>
                )}

                <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"2fr 1fr",gap:12}}>
                  {/* Table */}
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,overflow:"hidden",overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:600}}>
                      <thead>
                        <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                          {["الكود","النوع","الخصم","الاستخدام","ينتهي","الحالة",""].map(h=>(
                            <th key={h} style={{padding:"11px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {coupons.length === 0 ? (
                          <tr><td colSpan={7} style={{padding:"30px",textAlign:"center",color:ui.textSub,fontSize:12.5}}>لا توجد كوبونات — أضف أول كوبون من الجانب ←</td></tr>
                        ) : coupons.map(c => {
                          const sb = stBadge(c.status);
                          return (
                            <tr key={c.id} style={{borderTop:"0.5px solid #EEE"}}>
                              <td style={{padding:"11px 12px",fontFamily:"monospace",fontSize:13,color:ui.text,fontWeight:500}}>{c.code}</td>
                              <td style={{padding:"11px 12px",fontSize:12,color:ui.textSub}}>{couponTypeLabel(c.type)}</td>
                              <td style={{padding:"11px 12px",fontSize:13,color:ui.text,fontWeight:500,whiteSpace:"nowrap"}}>{couponDiscLabel(c)}</td>
                              <td style={{padding:"11px 12px",fontSize:12,color:ui.textSub,whiteSpace:"nowrap"}}>{c.uses||0}{c.max_uses ? ` / ${c.max_uses}` : ""}</td>
                              <td style={{padding:"11px 12px",fontSize:11.5,color:ui.textSub,whiteSpace:"nowrap"}}>{c.end_date ? new Date(c.end_date).toLocaleDateString("ar-EG") : "—"}</td>
                              <td style={{padding:"11px 12px"}}><span style={{fontSize:10.5,padding:"3px 10px",borderRadius:20,background:sb.bg,color:sb.fg,fontFamily:ui.fontBody}}>{c.status}</span></td>
                              <td style={{padding:"11px 12px",textAlign:"left"}}>
                                <button onClick={()=>delCoupon(c.id)} title="حذف"
                                  style={{background:"none",border:"1px solid rgba(220,38,38,.3)",color:"#DC2626",padding:"4px 9px",cursor:"pointer",fontSize:11,fontFamily:ui.fontBody,borderRadius:4}}>حذف</button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Add form */}
                  <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:mob?"14px":"16px",alignSelf:"start"}}>
                    <div style={{fontSize:13,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,marginBottom:12,paddingBottom:8,borderBottom:`0.5px solid #EEE`}}>إضافة كوبون جديد</div>
                    <div style={{marginBottom:12}}>
                      <label style={labelStyle}>نوع الخصم</label>
                      <div style={{display:"flex",border:ui.border,borderRadius:6,overflow:"hidden"}}>
                        {[["percent","%"],["fixed","مبلغ ثابت"],["free_shipping","شحن مجاني"]].map(([k,l])=>(
                          <button key={k} type="button" onClick={()=>setCForm({...cForm, type:k})}
                            style={{flex:1,padding:"7px 8px",border:"none",cursor:"pointer",
                              background: cForm.type===k ? ui.text : "transparent",
                              color: cForm.type===k ? "#fff" : ui.textSub,
                              fontSize:11.5,fontFamily:ui.fontBody}}>{l}</button>
                        ))}
                      </div>
                    </div>
                    <div style={{marginBottom:12}}>
                      <label style={labelStyle}>الكود</label>
                      <input style={inputStyle} value={cForm.code} onChange={e=>setCForm({...cForm, code:e.target.value.toUpperCase()})} placeholder="WELCOME10"/>
                    </div>
                    {cForm.type !== "free_shipping" && (
                      <div style={{marginBottom:12}}>
                        <label style={labelStyle}>قيمة الخصم ({cForm.type==="percent" ? "%" : "جنيه"})</label>
                        <input type="number" style={inputStyle} value={cForm.discount} onChange={e=>setCForm({...cForm, discount:e.target.value})} placeholder={cForm.type==="percent"?"10":"50"}/>
                      </div>
                    )}
                    <div style={{marginBottom:12}}>
                      <label style={labelStyle}>الحد الأدنى للطلب (جنيه)</label>
                      <input type="number" style={inputStyle} value={cForm.min_order} onChange={e=>setCForm({...cForm, min_order:e.target.value})} placeholder="0"/>
                    </div>
                    {cForm.type === "percent" && (
                      <div style={{marginBottom:12}}>
                        <label style={labelStyle}>الحد الأقصى للخصم (جنيه — اختياري)</label>
                        <input type="number" style={inputStyle} value={cForm.max_discount} onChange={e=>setCForm({...cForm, max_discount:e.target.value})} placeholder="200"/>
                      </div>
                    )}
                    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:12}}>
                      <div>
                        <label style={labelStyle}>تاريخ البدء</label>
                        <input type="date" style={inputStyle} value={cForm.start_date} onChange={e=>setCForm({...cForm, start_date:e.target.value})}/>
                      </div>
                      <div>
                        <label style={labelStyle}>تاريخ الانتهاء</label>
                        <input type="date" style={inputStyle} value={cForm.end_date} onChange={e=>setCForm({...cForm, end_date:e.target.value})}/>
                      </div>
                    </div>
                    <div style={{marginBottom:14}}>
                      <label style={labelStyle}>الحد الأقصى للاستخدام (0 = غير محدود)</label>
                      <input type="number" style={inputStyle} value={cForm.max_uses} onChange={e=>setCForm({...cForm, max_uses:e.target.value})} placeholder="0"/>
                    </div>
                    <button onClick={saveCoupon}
                      style={{width:"100%",background:ui.text,color:"#fff",border:"none",padding:"10px",cursor:"pointer",fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                      إضافة الكوبون
                    </button>
                  </div>
                </div>
              </div>
            );
          })()}

          {/* ─── SETTINGS (payment + SEO sub-tabs) ─────────────────────── */}
          {tab === "settings" && (() => {
            const inputStyle = { padding:"8px 11px", border:ui.border, borderRadius:6, background:ui.cardBg,
              fontFamily:ui.fontBody, fontSize:13, color:ui.text, outline:"none", direction:"ltr", boxSizing:"border-box", width:"100%" };
            const inputAr = { ...inputStyle, direction:"rtl" };
            const labelStyle = { display:"block", fontSize:12, color:ui.text, marginBottom:5, fontFamily:ui.fontBody };
            const Toggle = ({ value, onChange }) => (
              <button type="button" onClick={()=>onChange(!value)}
                style={{ width:38, height:22, borderRadius:11, border:"none",
                  background: value ? "#16A34A" : "#D4D4D4", position:"relative", cursor:"pointer", flexShrink:0 }}>
                <span style={{ position:"absolute", top:2, [value?"left":"right"]:2, width:18, height:18, background:"#fff", borderRadius:"50%", boxShadow:"0 1px 2px rgba(0,0,0,.2)" }}/>
              </button>
            );
            const sectionCard = { background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:mob?"14px":"18px",marginBottom:12 };
            const sectionTitle = { fontSize:13, fontWeight:600, color:ui.text, fontFamily:ui.fontBody, marginBottom:14, paddingBottom:8, borderBottom:`0.5px solid #EEE`, display:"flex", justifyContent:"space-between", alignItems:"center" };

            return (
              <div style={{maxWidth:980}}>
                {savedToast && (
                  <div style={{padding:"8px 14px",borderRadius:6,marginBottom:10,background:"#DCFCE7",color:"#15803D",fontSize:12.5,fontFamily:ui.fontBody,border:"0.5px solid #86EFAC"}}>{savedToast}</div>
                )}

                {/* Sub-tabs */}
                <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"6px 6px",marginBottom:12,display:"flex",gap:4,flexWrap:"wrap"}}>
                  {[
                    ["store","المتجر"],["account","الحساب"],["emails","الإيميلات"],
                    ["payment","الدفع"],["shipping","الشحن"],
                    ["notifications","الإشعارات"],["team","الفريق"],
                    ["expenses","المصروفات"],["returns","المرتجعات"],["seo","SEO"]
                  ].map(([k,l])=>(
                    <button key={k} onClick={()=>setSettingsTab(k)}
                      style={{padding:"8px 14px",border:"none",cursor:"pointer",borderRadius:6,
                        background: settingsTab===k ? ui.text : "transparent",
                        color: settingsTab===k ? "#fff" : ui.textSub,
                        fontSize:12.5, fontFamily:ui.fontBody, whiteSpace:"nowrap"}}>{l}</button>
                  ))}
                </div>

                {/* ── STORE ───────────────────────────────────────────── */}
                {settingsTab === "store" && (
                  <div>
                    <div style={sectionCard}>
                      <div style={sectionTitle}>معلومات المتجر</div>
                      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
                        <div>
                          <label style={labelStyle}>اسم المتجر</label>
                          <input style={inputAr} value={storeCfg.name} onChange={e=>setStoreCfg({...storeCfg, name:e.target.value})}/>
                        </div>
                        <div>
                          <label style={labelStyle}>بريد التواصل</label>
                          <input style={{...inputStyle, textAlign:"left"}} value={storeCfg.email} onChange={e=>setStoreCfg({...storeCfg, email:e.target.value})}/>
                        </div>
                        <div>
                          <label style={labelStyle}>رقم الواتساب</label>
                          <input style={{...inputStyle, textAlign:"left"}} value={storeCfg.whatsapp} onChange={e=>setStoreCfg({...storeCfg, whatsapp:e.target.value})} placeholder="01000000000"/>
                        </div>
                        <div>
                          <label style={labelStyle}>العنوان</label>
                          <input style={inputAr} value={storeCfg.address} onChange={e=>setStoreCfg({...storeCfg, address:e.target.value})}/>
                        </div>
                      </div>
                      <div style={{marginTop:12}}>
                        <label style={labelStyle}>وصف المتجر</label>
                        <textarea rows={2} style={{...inputAr, minHeight:60, resize:"vertical"}}
                          value={storeCfg.description} onChange={e=>setStoreCfg({...storeCfg, description:e.target.value})}/>
                      </div>
                    </div>

                    <div style={sectionCard}>
                      <div style={sectionTitle}>السوشيال ميديا</div>
                      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(3,1fr)",gap:12}}>
                        {[["instagram","Instagram"],["tiktok","TikTok"],["facebook","Facebook"]].map(([k,l])=>(
                          <div key={k}>
                            <label style={labelStyle}>{l}</label>
                            <input style={{...inputStyle, textAlign:"left"}}
                              value={storeCfg.social[k] || ""}
                              onChange={e=>setStoreCfg({...storeCfg, social:{...storeCfg.social, [k]:e.target.value}})}
                              placeholder={`https://${k}.com/...`}/>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={sectionCard}>
                      <div style={sectionTitle}>الشعار والألوان</div>
                      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr 1fr",gap:12,alignItems:"end"}}>
                        <div>
                          <label style={labelStyle}>شعار المتجر</label>
                          <div style={{display:"flex",alignItems:"center",gap:10}}>
                            {storeCfg.logo_url ? (
                              <img src={storeCfg.logo_url} alt="logo" style={{width:48,height:48,objectFit:"contain",borderRadius:6,border:ui.border,background:"#fff"}}/>
                            ) : (
                              <div style={{width:48,height:48,background:ui.sideBg,border:ui.border,borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center"}}>
                                <AdmIcon name="box" size={18}/>
                              </div>
                            )}
                            <label style={{padding:"7px 12px",border:ui.border,borderRadius:6,fontSize:12,fontFamily:ui.fontBody,cursor:"pointer",color:ui.text}}>
                              رفع شعار
                              <input type="file" accept="image/*" style={{display:"none"}}
                                onChange={async e=>{
                                  const f = e.target.files && e.target.files[0]; if (!f) return;
                                  if (f.size > 1024*1024) { alert("الشعار أكبر من 1MB"); return; }
                                  const r = new FileReader();
                                  r.onload = () => setStoreCfg({...storeCfg, logo_url: r.result});
                                  r.readAsDataURL(f);
                                  e.target.value = "";
                                }}/>
                            </label>
                            {storeCfg.logo_url && (
                              <button onClick={()=>setStoreCfg({...storeCfg, logo_url:""})}
                                style={{background:"transparent",border:"1px solid rgba(220,38,38,.3)",color:"#DC2626",padding:"5px 9px",cursor:"pointer",fontSize:11,borderRadius:4,fontFamily:ui.fontBody}}>إزالة</button>
                            )}
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>اللون الرئيسي</label>
                          <div style={{display:"flex",gap:6}}>
                            <input type="color" value={storeCfg.brand_primary}
                              onChange={e=>setStoreCfg({...storeCfg, brand_primary:e.target.value})}
                              style={{width:40,height:36,border:ui.border,borderRadius:6,padding:2,background:ui.cardBg,cursor:"pointer"}}/>
                            <input style={{...inputStyle, textAlign:"left", fontFamily:"monospace"}}
                              value={storeCfg.brand_primary} onChange={e=>setStoreCfg({...storeCfg, brand_primary:e.target.value})}/>
                          </div>
                        </div>
                        <div>
                          <label style={labelStyle}>لون التمييز</label>
                          <div style={{display:"flex",gap:6}}>
                            <input type="color" value={storeCfg.brand_accent}
                              onChange={e=>setStoreCfg({...storeCfg, brand_accent:e.target.value})}
                              style={{width:40,height:36,border:ui.border,borderRadius:6,padding:2,background:ui.cardBg,cursor:"pointer"}}/>
                            <input style={{...inputStyle, textAlign:"left", fontFamily:"monospace"}}
                              value={storeCfg.brand_accent} onChange={e=>setStoreCfg({...storeCfg, brand_accent:e.target.value})}/>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div style={sectionCard}>
                      <div style={sectionTitle}>هدف المبيعات الشهري</div>
                      <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:12,padding:"8px 12px",background:"#FAFAFA",borderRadius:6}}>
                        🎯 يظهر تقدم الشهر على بطاقة "هدف الشهر" في صفحة "نظرة عامة". يتحكم فيه <strong>Super Admin</strong> فقط.
                      </div>
                      <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>الهدف (جنيه)</label>
                      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr auto",gap:10,alignItems:"end"}}>
                        <input type="text" inputMode="numeric" pattern="[0-9]*"
                          key={`mtgt-${storeCfg.monthly_target}`}
                          defaultValue={String(storeCfg.monthly_target ?? 0)}
                          onBlur={e=>{
                            const v = Math.max(0, parseInt(e.target.value.replace(/[^0-9]/g,""), 10) || 0);
                            setStoreCfg({...storeCfg, monthly_target: v});
                          }}
                          placeholder="مثال: 50000"
                          style={{padding:"10px 14px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:14,color:ui.text,outline:"none",width:"100%",direction:"ltr",textAlign:"left",boxSizing:"border-box"}}/>
                        <button onClick={()=>saveSetting("store", storeCfg)}
                          style={{background:ui.text,color:"#fff",border:"none",padding:"10px 22px",cursor:"pointer",fontSize:13,borderRadius:6,fontFamily:ui.fontBody,fontWeight:500}}>حفظ</button>
                      </div>
                      <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:8}}>
                        اتركها 0 لإخفاء البطاقة من صفحة "نظرة عامة".
                      </div>
                    </div>

                    <div style={sectionCard}>
                      <div style={sectionTitle}>حد عميل VIP بالجنيه</div>
                      <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:12,padding:"8px 12px",background:"#FAFAFA",borderRadius:6}}>
                        ⭐ العملاء الذين تجاوز إنفاقهم هذا الحد يحصلون تلقائياً على فئة VIP. يُطبق ليلياً وفور كل طلب جديد.
                      </div>
                      <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>الحد (جنيه)</label>
                      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr auto",gap:10,alignItems:"end"}}>
                        <input type="text" inputMode="numeric" pattern="[0-9]*"
                          key={`vipt-${storeCfg.vip_threshold}`}
                          defaultValue={String(storeCfg.vip_threshold ?? 5000)}
                          onBlur={e=>{
                            const v = Math.max(0, parseInt(e.target.value.replace(/[^0-9]/g,""), 10) || 0);
                            setStoreCfg({...storeCfg, vip_threshold: v});
                          }}
                          placeholder="مثال: 5000"
                          style={{padding:"10px 14px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:14,color:ui.text,outline:"none",width:"100%",direction:"ltr",textAlign:"left",boxSizing:"border-box"}}/>
                        <button onClick={async ()=>{
                          await saveSetting("store", storeCfg);
                          // After saving threshold, trigger a server-side recategorize so the
                          // new rule applies immediately (rather than waiting for 02:00 cron).
                          try { await fetch("/api/users/recategorize", { method:"POST" }); } catch {}
                        }}
                          style={{background:ui.text,color:"#fff",border:"none",padding:"10px 22px",cursor:"pointer",fontSize:13,borderRadius:6,fontFamily:ui.fontBody,fontWeight:500}}>حفظ</button>
                      </div>
                      <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:8}}>
                        التعديل يعيد تصنيف كل العملاء فوراً.
                      </div>
                    </div>

                    <div style={sectionCard}>
                      <div style={sectionTitle}>سياسات المتجر</div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`0.5px solid #EEE`}}>
                        <div>
                          <div style={{fontSize:13,color:ui.text,fontWeight:500,fontFamily:ui.fontBody}}>المتجر مفتوح</div>
                          <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>عند الإغلاق، يظهر بانر للعملاء ويتم تعطيل الطلبات</div>
                        </div>
                        <Toggle value={storeCfg.store_open} onChange={v=>setStoreCfg({...storeCfg, store_open:v})}/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0",borderBottom:`0.5px solid #EEE`}}>
                        <div>
                          <div style={{fontSize:13,color:ui.text,fontWeight:500,fontFamily:ui.fontBody}}>السماح بإنشاء حسابات جديدة</div>
                          <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>يقدر العملاء يسجّلوا حسابات لمتابعة طلباتهم</div>
                        </div>
                        <Toggle value={storeCfg.registration_enabled} onChange={v=>setStoreCfg({...storeCfg, registration_enabled:v})}/>
                      </div>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 0"}}>
                        <div>
                          <div style={{fontSize:13,color:ui.text,fontWeight:500,fontFamily:ui.fontBody}}>الشراء كزائر</div>
                          <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>السماح بإتمام الطلب بدون تسجيل دخول</div>
                        </div>
                        <Toggle value={storeCfg.guest_checkout} onChange={v=>setStoreCfg({...storeCfg, guest_checkout:v})}/>
                      </div>
                    </div>

                    <button onClick={()=>saveSetting("store", storeCfg)}
                      style={{background:ui.text,color:"#fff",border:"none",padding:"11px 22px",cursor:"pointer",fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                      حفظ إعدادات المتجر
                    </button>
                  </div>
                )}

                {/* ── ACCOUNT ─────────────────────────────────────────── */}
                {settingsTab === "account" && (
                  <div>
                    <div style={sectionCard}>
                      <div style={sectionTitle}>بيانات المسؤول</div>
                      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
                        <div>
                          <label style={labelStyle}>الاسم</label>
                          <input style={inputAr} value={accountCfg.admin_name} onChange={e=>setAccountCfg({...accountCfg, admin_name:e.target.value})}/>
                        </div>
                        <div>
                          <label style={labelStyle}>البريد الإلكتروني (Super Admin)</label>
                          <input style={{...inputStyle, textAlign:"left"}} value={accountCfg.admin_email} disabled
                            title="بريد الـ Super Admin غير قابل للتعديل"/>
                        </div>
                      </div>
                      <button onClick={()=>{
                        const { pw_current, pw_new, pw_confirm, ...persist } = accountCfg;
                        saveSetting("account", persist);
                      }}
                        style={{marginTop:14,background:ui.text,color:"#fff",border:"none",padding:"10px 22px",cursor:"pointer",fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                        حفظ البيانات
                      </button>
                    </div>

                    <div style={sectionCard}>
                      <div style={sectionTitle}>تغيير كلمة المرور</div>
                      <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:12,padding:"8px 12px",background:"#FAFAFA",borderRadius:6}}>
                        🔐 ميزة مخصصة لـ Super Admin فقط — تستخدم خوارزمية scrypt للتشفير على الخادم.
                      </div>
                      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"repeat(3,1fr)",gap:12}}>
                        <div>
                          <label style={labelStyle}>كلمة المرور الحالية</label>
                          <input type="password" style={inputStyle} value={accountCfg.pw_current} onChange={e=>setAccountCfg({...accountCfg, pw_current:e.target.value})}/>
                        </div>
                        <div>
                          <label style={labelStyle}>الجديدة (8 أحرف على الأقل)</label>
                          <input type="password" style={inputStyle} value={accountCfg.pw_new} onChange={e=>setAccountCfg({...accountCfg, pw_new:e.target.value})}/>
                        </div>
                        <div>
                          <label style={labelStyle}>تأكيد الجديدة</label>
                          <input type="password" style={inputStyle} value={accountCfg.pw_confirm} onChange={e=>setAccountCfg({...accountCfg, pw_confirm:e.target.value})}/>
                        </div>
                      </div>
                      <button
                        onClick={async ()=>{
                          if (!accountCfg.pw_current || !accountCfg.pw_new) { alert("كل الحقول مطلوبة"); return; }
                          if (accountCfg.pw_new !== accountCfg.pw_confirm) { alert("كلمتا المرور غير متطابقتين"); return; }
                          if (accountCfg.pw_new.length < 8) { alert("كلمة المرور الجديدة لازم تكون 8 أحرف على الأقل"); return; }
                          try {
                            const r = await fetch("/api/auth/change-password", {
                              method:"POST", headers:{"Content-Type":"application/json"},
                              body: JSON.stringify({ current_password: accountCfg.pw_current, new_password: accountCfg.pw_new })
                            });
                            const data = await r.json();
                            if (r.ok) {
                              setAccountCfg({...accountCfg, pw_current:"", pw_new:"", pw_confirm:""});
                              setSavedToast("تم تغيير كلمة المرور بنجاح");
                              setTimeout(()=>setSavedToast(""), 2500);
                            } else {
                              alert(data.error || "فشل تغيير كلمة المرور");
                            }
                          } catch (e) { alert("خطأ في الشبكة: " + e.message); }
                        }}
                        style={{marginTop:14,background:ui.text,color:"#fff",border:"none",padding:"10px 22px",cursor:"pointer",fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                        تغيير كلمة المرور
                      </button>
                    </div>
                  </div>
                )}

                {/* ── EMAILS ──────────────────────────────────────────── */}
                {settingsTab === "emails" && (
                  <div>
                    <div style={sectionCard}>
                      <div style={sectionTitle}>قالب إيميل تأكيد الطلب</div>
                      <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:10,padding:"8px 12px",background:"#FAFAFA",borderRadius:6}}>
                        المتغيرات المتاحة: <code>{"{{customer_name}}"}</code> · <code>{"{{order_id}}"}</code> · <code>{"{{order_total}}"}</code>
                      </div>
                      <div style={{marginBottom:12}}>
                        <label style={labelStyle}>عنوان الإيميل (Subject)</label>
                        <input style={inputAr} value={emailsCfg.order_subject} onChange={e=>setEmailsCfg({...emailsCfg, order_subject:e.target.value})}/>
                      </div>
                      <div style={{marginBottom:12}}>
                        <label style={labelStyle}>نص الإيميل (Body)</label>
                        <textarea rows={8} style={{...inputAr, minHeight:160, resize:"vertical", fontFamily:ui.fontBody}}
                          value={emailsCfg.order_body} onChange={e=>setEmailsCfg({...emailsCfg, order_body:e.target.value})}/>
                      </div>
                    </div>

                    <div style={sectionCard}>
                      <div style={sectionTitle}>معاينة</div>
                      <div style={{padding:"14px 16px",background:"#FAFAFA",border:"0.5px solid #EEE",borderRadius:6}}>
                        <div style={{fontSize:13,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,marginBottom:10,paddingBottom:8,borderBottom:`0.5px solid #DDD`}}>
                          {emailsCfg.order_subject
                            .replace("{{order_id}}", "12345")
                            .replace("{{customer_name}}", "أحمد محمد")
                            .replace("{{order_total}}", "640")}
                        </div>
                        <div style={{fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,whiteSpace:"pre-wrap",lineHeight:1.8}}>
                          {emailsCfg.order_body
                            .replace(/{{order_id}}/g, "12345")
                            .replace(/{{customer_name}}/g, "أحمد محمد")
                            .replace(/{{order_total}}/g, "640")}
                        </div>
                      </div>
                    </div>

                    <button onClick={()=>saveSetting("emails", emailsCfg)}
                      style={{background:ui.text,color:"#fff",border:"none",padding:"11px 22px",cursor:"pointer",fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                      حفظ قوالب الإيميل
                    </button>
                  </div>
                )}

                {/* ── SHIPPING (super-admin only) ──────────────────────── */}
                {settingsTab === "shipping" && (
                  <ShippingSettingsPanel
                    ui={ui} mob={mob} isSuper={isSuper}
                    storeCfg={storeCfg} setStoreCfg={setStoreCfg}
                    saveSetting={saveSetting}
                    shipping={shipping} setShipping={setShipping}
                  />
                )}

                {settingsTab === "payment" && (
                  <div>
                    {/* Paymob */}
                    <div style={sectionCard}>
                      <div style={sectionTitle}>
                        <span>Paymob</span>
                        <Toggle value={payment.paymob.enabled} onChange={v=>setPayment({...payment, paymob:{...payment.paymob, enabled:v}})}/>
                      </div>
                      <div style={{marginBottom:10}}>
                        <label style={labelStyle}>API Key</label>
                        <input style={inputStyle} value={payment.paymob.api_key} onChange={e=>setPayment({...payment, paymob:{...payment.paymob, api_key:e.target.value}})} placeholder="ZXlKaGJHY2lPaUpJVXpVeE1pSXNJblI1Y0NJNkpVcFhWQ0o5..."/>
                      </div>
                      <div style={{marginBottom:10}}>
                        <label style={labelStyle}>Integration ID</label>
                        <input style={inputStyle} value={payment.paymob.integration_id} onChange={e=>setPayment({...payment, paymob:{...payment.paymob, integration_id:e.target.value}})} placeholder="1234567"/>
                      </div>
                    </div>

                    {/* Fawry */}
                    <div style={sectionCard}>
                      <div style={sectionTitle}>
                        <span>Fawry</span>
                        <Toggle value={payment.fawry.enabled} onChange={v=>setPayment({...payment, fawry:{...payment.fawry, enabled:v}})}/>
                      </div>
                      <div style={{marginBottom:10}}>
                        <label style={labelStyle}>Merchant Code</label>
                        <input style={inputStyle} value={payment.fawry.merchant_code} onChange={e=>setPayment({...payment, fawry:{...payment.fawry, merchant_code:e.target.value}})} placeholder="700"/>
                      </div>
                      <div style={{marginBottom:10}}>
                        <label style={labelStyle}>Security Key</label>
                        <input style={inputStyle} value={payment.fawry.security_key} onChange={e=>setPayment({...payment, fawry:{...payment.fawry, security_key:e.target.value}})} placeholder="••••••••••••"/>
                      </div>
                    </div>

                    {/* COD */}
                    <div style={sectionCard}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                        <div>
                          <div style={{fontSize:13,color:ui.text,fontWeight:600,fontFamily:ui.fontBody}}>كاش عند الاستلام</div>
                          <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:3}}>السماح للعملاء بالدفع نقداً عند استلام الطلب</div>
                        </div>
                        <Toggle value={payment.cod.enabled} onChange={v=>setPayment({...payment, cod:{...payment.cod, enabled:v}})}/>
                      </div>
                    </div>

                    {/* Vodafone Cash */}
                    <div style={sectionCard}>
                      <div style={sectionTitle}>
                        <span>فودافون كاش</span>
                        <Toggle value={payment.vodafone.enabled} onChange={v=>setPayment({...payment, vodafone:{...payment.vodafone, enabled:v}})}/>
                      </div>
                      <div>
                        <label style={labelStyle}>رقم محفظة الاستلام</label>
                        <input style={{...inputStyle, direction:"ltr", textAlign:"left"}} value={payment.vodafone.number} onChange={e=>setPayment({...payment, vodafone:{...payment.vodafone, number:e.target.value}})} placeholder="01012345678"/>
                      </div>
                    </div>

                    {/* InstaPay */}
                    <div style={sectionCard}>
                      <div style={sectionTitle}>
                        <span>إنستاباي (InstaPay)</span>
                        <Toggle value={payment.instapay.enabled} onChange={v=>setPayment({...payment, instapay:{...payment.instapay, enabled:v}})}/>
                      </div>
                      <div>
                        <label style={labelStyle}>الـ Handle / الرقم</label>
                        <input style={{...inputStyle, direction:"ltr", textAlign:"left"}} value={payment.instapay.handle} onChange={e=>setPayment({...payment, instapay:{...payment.instapay, handle:e.target.value}})} placeholder="nawra@instapay"/>
                      </div>
                    </div>

                    <button onClick={()=>saveSetting("payment", payment)}
                      style={{background:ui.text,color:"#fff",border:"none",padding:"11px 22px",cursor:"pointer",fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                      حفظ إعدادات الدفع
                    </button>
                  </div>
                )}

                {/* ── NOTIFICATIONS ───────────────────────────────────── */}
                {settingsTab === "notifications" && (
                  <div>
                    <div style={sectionCard}>
                      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0"}}>
                        <div>
                          <div style={{fontSize:13,color:ui.text,fontWeight:600,fontFamily:ui.fontBody}}>إشعارات الإيميل</div>
                          <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:3}}>استلام إيميل لكل طلب جديد على {DEFAULT_STORE.email}</div>
                        </div>
                        <Toggle value={notifyCfg.email_enabled} onChange={v=>setNotifyCfg({...notifyCfg, email_enabled:v})}/>
                      </div>
                    </div>

                    <div style={sectionCard}>
                      <div style={sectionTitle}>
                        <span>إشعارات Telegram</span>
                        <Toggle value={notifyCfg.telegram_enabled} onChange={v=>setNotifyCfg({...notifyCfg, telegram_enabled:v})}/>
                      </div>
                      <div style={{marginBottom:10}}>
                        <label style={labelStyle}>Bot Token</label>
                        <input style={{...inputStyle, textAlign:"left", fontFamily:"monospace"}}
                          value={notifyCfg.telegram_bot_token}
                          onChange={e=>setNotifyCfg({...notifyCfg, telegram_bot_token:e.target.value})}
                          placeholder="123456:ABC-DEF1234ghIkl-zyx57W2v1u123ew11"/>
                      </div>
                      <div style={{marginBottom:10}}>
                        <label style={labelStyle}>Chat ID</label>
                        <input style={{...inputStyle, textAlign:"left", fontFamily:"monospace"}}
                          value={notifyCfg.telegram_chat_id}
                          onChange={e=>setNotifyCfg({...notifyCfg, telegram_chat_id:e.target.value})}
                          placeholder="-1001234567890"/>
                      </div>
                      <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:6}}>
                        أنشئ بوت من <code>@BotFather</code> واحصل على الـ Chat ID من <code>@userinfobot</code>.
                      </div>
                    </div>

                    <button onClick={()=>saveSetting("notifications", notifyCfg)}
                      style={{background:ui.text,color:"#fff",border:"none",padding:"11px 22px",cursor:"pointer",fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                      حفظ الإشعارات
                    </button>
                  </div>
                )}

                {/* ── TEAM & PERMISSIONS ──────────────────────────────── */}
                {settingsTab === "team" && (() => {
                  const ROLE_LABELS = {
                    super_admin:     "Super Admin",
                    orders_admin:    "مشرف طلبات",
                    inventory_admin: "مشرف مخزون",
                    shipping_admin:  "موظف شحن",
                  };
                  const PERM_LABELS = {
                    overview:"نظرة عامة",
                    orders:"الطلبات", products:"المنتجات", inventory:"المخزون",
                    customers:"العملاء", returns:"المرتجعات", shipping:"الشحن",
                    coupons:"الكوبونات", settings:"الإعدادات",
                  };
                  const addMember = () => {
                    if (!newTeamMember.name.trim() || !newTeamMember.email.trim()) return;
                    setTeamCfg({...teamCfg, members:[...teamCfg.members, { ...newTeamMember, id:`u_${Date.now().toString(36)}` }]});
                    setNewTeamMember({ name:"", email:"", role:"orders_admin" });
                  };
                  const removeMember = (id) => setTeamCfg({...teamCfg, members:teamCfg.members.filter(m=>m.id!==id)});
                  return (
                    <div>
                      <div style={sectionCard}>
                        <div style={sectionTitle}>أعضاء الفريق</div>
                        <div style={{overflowX:"auto"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontFamily:ui.fontBody,minWidth:560}}>
                            <thead>
                              <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                                {["الاسم","البريد","الصلاحية",""].map(h=>(
                                  <th key={h} style={{padding:"10px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500}}>{h}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {teamCfg.members.map(m => (
                                <tr key={m.id} style={{borderTop:"0.5px solid #EEE"}}>
                                  <td style={{padding:"10px 12px",fontSize:13,color:ui.text,fontWeight:500}}>{m.name}</td>
                                  <td style={{padding:"10px 12px",fontSize:12,color:ui.textSub}}>{m.email}</td>
                                  <td style={{padding:"10px 12px"}}>
                                    <select value={m.role}
                                      onChange={e=>setTeamCfg({...teamCfg, members:teamCfg.members.map(x=>x.id===m.id?{...x, role:e.target.value}:x)})}
                                      style={{...inputStyle, padding:"5px 8px", width:"auto", direction:"rtl"}}>
                                      {Object.keys(ROLE_LABELS).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                                    </select>
                                  </td>
                                  <td style={{padding:"10px 12px",textAlign:"left"}}>
                                    {m.role === "super_admin" && teamCfg.members.filter(x=>x.role==="super_admin").length === 1 ? (
                                      <span style={{fontSize:11,color:ui.textSub}}>—</span>
                                    ) : (
                                      <button onClick={()=>removeMember(m.id)}
                                        style={{background:"none",border:"1px solid rgba(220,38,38,.3)",color:"#DC2626",padding:"4px 9px",cursor:"pointer",fontSize:11,fontFamily:ui.fontBody,borderRadius:4}}>إزالة</button>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div style={sectionCard}>
                        <div style={sectionTitle}>إضافة عضو جديد</div>
                        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr 1fr auto",gap:10,alignItems:"end"}}>
                          <div>
                            <label style={labelStyle}>الاسم</label>
                            <input style={inputAr} value={newTeamMember.name} onChange={e=>setNewTeamMember({...newTeamMember, name:e.target.value})}/>
                          </div>
                          <div>
                            <label style={labelStyle}>البريد</label>
                            <input style={{...inputStyle, textAlign:"left"}} value={newTeamMember.email} onChange={e=>setNewTeamMember({...newTeamMember, email:e.target.value})}/>
                          </div>
                          <div>
                            <label style={labelStyle}>الصلاحية</label>
                            <select style={{...inputStyle, direction:"rtl"}} value={newTeamMember.role} onChange={e=>setNewTeamMember({...newTeamMember, role:e.target.value})}>
                              {Object.keys(ROLE_LABELS).map(r => <option key={r} value={r}>{ROLE_LABELS[r]}</option>)}
                            </select>
                          </div>
                          <button onClick={addMember}
                            style={{background:ui.text,color:"#fff",border:"none",padding:"9px 16px",cursor:"pointer",fontSize:12.5,borderRadius:6,fontFamily:ui.fontBody}}>إضافة</button>
                        </div>
                      </div>

                      <div style={sectionCard}>
                        <div style={sectionTitle}>صلاحيات الأدوار</div>
                        <div style={{overflowX:"auto"}}>
                          <table style={{width:"100%",borderCollapse:"collapse",fontFamily:ui.fontBody,minWidth:600}}>
                            <thead>
                              <tr style={{background:ui.sideBg,borderBottom:`0.5px solid #E5E5E5`}}>
                                <th style={{padding:"10px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>الدور</th>
                                {Object.keys(PERM_LABELS).map(p => (
                                  <th key={p} style={{padding:"10px 6px",textAlign:"center",fontSize:11,color:ui.textSub,fontWeight:500,whiteSpace:"nowrap"}}>{PERM_LABELS[p]}</th>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {Object.keys(ROLE_LABELS).map(role => (
                                <tr key={role} style={{borderTop:"0.5px solid #EEE"}}>
                                  <td style={{padding:"10px 12px",fontSize:13,color:ui.text,fontWeight:500,whiteSpace:"nowrap"}}>{ROLE_LABELS[role]}</td>
                                  {Object.keys(PERM_LABELS).map(p => {
                                    const allowed = !!(teamCfg.permissions[role] && teamCfg.permissions[role][p]);
                                    const isSuper = role === "super_admin";
                                    return (
                                      <td key={p} style={{padding:"10px 6px",textAlign:"center"}}>
                                        <input type="checkbox" checked={allowed} disabled={isSuper}
                                          onChange={e=>setTeamCfg({
                                            ...teamCfg,
                                            permissions:{
                                              ...teamCfg.permissions,
                                              [role]: { ...(teamCfg.permissions[role]||{}), [p]: e.target.checked }
                                            }
                                          })}
                                          style={{width:16,height:16,cursor:isSuper?"not-allowed":"pointer",accentColor:ui.text}}/>
                                      </td>
                                    );
                                  })}
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                        <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:8}}>
                          Super Admin له صلاحية كاملة دائماً ولا يمكن تعديل صلاحياته من هنا.
                        </div>
                      </div>

                      <button onClick={()=>saveSetting("team", teamCfg)}
                        style={{background:ui.text,color:"#fff",border:"none",padding:"11px 22px",cursor:"pointer",fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                        حفظ الفريق والصلاحيات
                      </button>
                    </div>
                  );
                })()}

                {settingsTab === "expenses" && (() => {
                  // Load on tab open (idempotent)
                  return (
                    <ExpenseSettingsPanel
                      ui={ui} mob={mob} isSuper={isSuper}
                      storeCfg={storeCfg} setStoreCfg={setStoreCfg}
                      saveSetting={saveSetting}
                      onAnyChange={() => { refreshExpCategories(); refreshExpSuppliers(); refreshExpBudgets(); refreshExpenses(); }}
                    />
                  );
                })()}

                {settingsTab === "returns" && (
                  <ReturnsSettingsPanel
                    ui={ui} mob={mob} isSuper={isSuper}
                    storeCfg={storeCfg} setStoreCfg={setStoreCfg}
                    saveSetting={saveSetting}
                    reasons={retReasons}
                    onReasonsChanged={refreshRetReasons}
                  />
                )}

                {settingsTab === "seo" && (
                  <div>
                    {/* Google preview */}
                    <div style={sectionCard}>
                      <div style={sectionTitle}>معاينة جوجل</div>
                      <div style={{padding:"14px 16px",background:"#FAFAFA",border:"0.5px solid #EEE",borderRadius:6,direction:"ltr",textAlign:"left",fontFamily:"Arial, sans-serif"}}>
                        <div style={{fontSize:12,color:"#202124",marginBottom:4}}>{seoCfg.page_url}</div>
                        <div style={{fontSize:18,color:"#1a0dab",fontWeight:400,marginBottom:5,lineHeight:1.3}}>{seoCfg.title || "بدون عنوان"}</div>
                        <div style={{fontSize:13,color:"#4d5156",lineHeight:1.5,maxWidth:600}}>{seoCfg.description || "بدون وصف"}</div>
                      </div>
                    </div>

                    <div style={sectionCard}>
                      <div style={sectionTitle}>إعدادات SEO</div>
                      <div style={{marginBottom:12}}>
                        <label style={labelStyle}>رابط الصفحة (Canonical URL)</label>
                        <input style={{...inputStyle, direction:"ltr", textAlign:"left"}} value={seoCfg.page_url} onChange={e=>setSeoCfg({...seoCfg, page_url:e.target.value})}/>
                      </div>
                      <div style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <label style={labelStyle}>عنوان الصفحة (Title)</label>
                          <span style={{fontSize:10.5, color: seoCfg.title.length > 60 ? "#DC2626" : ui.textSub}}>{seoCfg.title.length}/60</span>
                        </div>
                        <input style={inputAr} value={seoCfg.title} onChange={e=>setSeoCfg({...seoCfg, title:e.target.value})}/>
                      </div>
                      <div style={{marginBottom:12}}>
                        <div style={{display:"flex",justifyContent:"space-between"}}>
                          <label style={labelStyle}>وصف Meta</label>
                          <span style={{fontSize:10.5, color: seoCfg.description.length > 160 ? "#DC2626" : ui.textSub}}>{seoCfg.description.length}/160</span>
                        </div>
                        <textarea rows={3} style={{...inputAr, resize:"vertical", minHeight:70, fontFamily:ui.fontBody}}
                          value={seoCfg.description} onChange={e=>setSeoCfg({...seoCfg, description:e.target.value})}/>
                      </div>
                      <div style={{marginBottom:14}}>
                        <label style={labelStyle}>الكلمات المفتاحية (مفصولة بفواصل)</label>
                        <input style={inputAr} value={seoCfg.keywords} onChange={e=>setSeoCfg({...seoCfg, keywords:e.target.value})} placeholder="عناية بالبشرة, سيروم, واقي شمس"/>
                      </div>
                      <button onClick={()=>saveSetting("seo", seoCfg)}
                        style={{background:ui.text,color:"#fff",border:"none",padding:"11px 22px",cursor:"pointer",fontSize:13,fontFamily:ui.fontBody,fontWeight:500,borderRadius:6}}>
                        حفظ إعدادات SEO
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })()}

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
  const cartCtxForBanner = useCart();
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
      {/* Announcement banner — free-shipping line reads live from /api/settings */}
      <div style={{ background: C.dk, color: C.go, textAlign: "center", padding: "10px 24px", fontSize: 13, letterSpacing: "0.05em", fontFamily: C.fb }}>
        {(() => {
          const liveFreeMin = (cartCtxForBanner && cartCtxForBanner.freeShipMin) || 500;
          // Substitute the live number into the translated banner, replacing any
          // hardcoded "500"/"1000" that was in the locale string.
          const banner = String(t("topBanner")).replace(/\d{2,}/, String(liveFreeMin));
          return banner.split("✦").map((part, i, arr) => (
            <span key={i}>{part.trim()}{i < arr.length - 1 && <span style={{color:C.gom,margin:"0 14px"}}>✦</span>}</span>
          ));
        })()}
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
// Inject print-only CSS once. The modal renders deep inside the React tree
// (not as a direct child of <body>), so `body > *:not(.x)` won't work — every
// ancestor of the modal would also be hidden, including the modal itself.
// Visibility-based isolation is the safe approach: hide everything, then
// re-show only the target subtree + force it to fill the page.
function injectPrintStyles() {
  if (document.getElementById("nawra-print-styles")) return;
  const s = document.createElement("style");
  s.id = "nawra-print-styles";
  s.textContent = `
    @media print {
      @page { margin: 14mm; size: A4; }
      body.nawra-print-mode { background: #fff !important; }
      /* hide everything */
      body.nawra-print-mode * { visibility: hidden !important; }
      /* re-show the print card and all its descendants */
      body.nawra-print-mode .order-print-card,
      body.nawra-print-mode .order-print-card * { visibility: visible !important; }
      /* fully hide the dim overlay backdrop and any .no-print element */
      body.nawra-print-mode .order-print-overlay {
        background: #fff !important;
        position: static !important;
        inset: auto !important;
        padding: 0 !important;
        overflow: visible !important;
      }
      body.nawra-print-mode .no-print,
      body.nawra-print-mode .no-print * { visibility: hidden !important; display: none !important; }
      /* pull the card to the top-left of the page */
      body.nawra-print-mode .order-print-card {
        position: absolute !important;
        top: 0 !important; left: 0 !important; right: 0 !important;
        margin: 0 !important;
        width: 100% !important; max-width: 100% !important;
        max-height: none !important;
        box-shadow: none !important;
        border: none !important;
        padding: 0 !important;
        overflow: visible !important;
        background: #fff !important;
      }
      /* nice link colour for the map URL when printed */
      body.nawra-print-mode .order-print-card a { color: #000 !important; text-decoration: underline; }
    }
  `;
  document.head.appendChild(s);
}

// ─── Module-scope helpers + sub-components for ProductForm ───────────────────
// Defining components at module scope (instead of inside ProductForm's body)
// is the single most important perf fix in this file. When a component is
// declared inline, every parent re-render creates a NEW function reference;
// React treats that as a different component type and unmounts + remounts
// the entire subtree, destroying input focus and any internal useState. The
// classic "type one letter, wait, type the next letter" symptom.
//
// Module-scope means the reference is stable across renders, so React reuses
// the existing instance, the input keeps focus, and internal state survives.

// URL-safe slug (mirrors the server-side slugify in api/server.js)
function slugifyClient(s) {
  return String(s || '')
    .toLowerCase()
    .replace(/[‏‎]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/[^\p{L}\p{N}-]+/gu, '')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

// Input filtering / keyboard hints for the price/stock fields.
// kind: "int" (whole numbers) | "dec" (decimals allowed)
const numProps = (kind) => ({
  type: "text",
  inputMode: kind === "int" ? "numeric" : "decimal",
  pattern:   kind === "int" ? "[0-9]*"  : "[0-9]*\\.?[0-9]*",
  autoComplete: "off",
});
function cleanNumInt(raw) { return String(raw).replace(/[^0-9]/g, ""); }
function cleanNumDec(raw) {
  const cleaned = String(raw).replace(/[^0-9.]/g, "");
  const firstDot = cleaned.indexOf(".");
  if (firstDot === -1) return cleaned;
  return cleaned.slice(0, firstDot + 1) + cleaned.slice(firstDot + 1).replace(/\./g, "");
}

// Bilingual input with an inline AR/EN tab toggle. Owns its own `side` state.
// CRITICAL: must live at module scope so React doesn't tear down the input on
// every parent re-render. Wrapped in React.memo so props equality lets us
// short-circuit re-renders when only sibling fields change.
const Bilingual = React.memo(function Bilingual({
  value,         // { ar, en }
  onChange,      // (side, newValue) => void
  label,
  multiline,
  rows = 3,
  maxLen,
  enWarn,
  publishing,    // true when the product is published — gates the EN-empty warning
  ui,
  inputStyle,
  labelStyle,
}) {
  const [side, setSide] = useState("ar");
  const v = (value && value[side]) || "";
  const setAr = useCallback((e) => onChange("ar", e.target.value), [onChange]);
  const setEn = useCallback((e) => onChange("en", e.target.value), [onChange]);
  const handleChange = side === "ar" ? setAr : setEn;
  return (
    <div style={{marginBottom:12}}>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:5}}>
        <label style={{...labelStyle, marginBottom:0}}>{label}</label>
        <div style={{display:"flex",border:ui.border,borderRadius:4,overflow:"hidden"}}>
          {["ar","en"].map(s => (
            <button key={s} type="button" onClick={()=>setSide(s)}
              style={{padding:"2px 10px",border:"none",cursor:"pointer",fontFamily:ui.fontBody,fontSize:11,
                background: side===s ? ui.text : "transparent",
                color: side===s ? "#fff" : ui.textSub}}>
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      {multiline ? (
        <textarea rows={rows} value={v} onChange={handleChange}
          style={{...inputStyle, direction: side==="ar"?"rtl":"ltr", resize:"vertical", minHeight: rows*22}}/>
      ) : (
        <input value={v} onChange={handleChange} maxLength={maxLen}
          style={{...inputStyle, direction: side==="ar"?"rtl":"ltr"}}/>
      )}
      {maxLen && (
        <div style={{fontSize:10.5,color: v.length > maxLen*0.9 ? "#D97706" : ui.textSub, fontFamily:ui.fontBody,marginTop:3,textAlign:"left"}}>
          {v.length} / {maxLen}
        </div>
      )}
      {enWarn && side==="en" && !v && publishing && (
        <div style={{fontSize:11,color:"#D97706",marginTop:3,fontFamily:ui.fontBody}}>⚠ النسخة الإنجليزية فارغة — سيتم استخدام العربية</div>
      )}
    </div>
  );
});

// Metric card used across admin tabs (Overview KPIs, Products KPIs, etc.).
// Hoisted to module scope so React reuses the same instance across re-renders
// of AdminDash — that's important because typing in ANY input inside a tab
// that mounts Metric cards used to recreate them on every keystroke.
const MetricCardBase = React.memo(function MetricCardBase({ label, value, changePct, suffix, hint, ui, mob }) {
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
});

// Empty-state placeholder card. Module-scope for the same perf reason.
const PlaceholderBase = React.memo(function PlaceholderBase({ icon, title, body, ui, mob }) {
  return (
    <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:mob?"30px 20px":"60px 40px",textAlign:"center"}}>
      <div style={{marginBottom:14,color:ui.textSub,display:"flex",justifyContent:"center"}}><AdmIcon name={icon} size={42} /></div>
      <h3 style={{fontFamily:ui.fontHead,fontSize:18,fontWeight:500,color:ui.text,marginBottom:8}}>{title}</h3>
      <p style={{fontFamily:ui.fontBody,fontSize:13,color:ui.textSub,maxWidth:380,margin:"0 auto",lineHeight:1.7}}>{body}</p>
    </div>
  );
});

// ─── Inline SVG charts for Expenses ──────────────────────────────────────────
// No external chart deps. Kept at module scope so React reuses the same
// component identity across parent re-renders.
const ExpensePieChart = React.memo(function ExpensePieChart({ slices, total, ui, size = 150 }) {
  const data = (slices || []).filter(s => Number(s.value) > 0);
  const sum  = Number(total) || data.reduce((s, x) => s + Number(x.value || 0), 0);
  if (!data.length || sum <= 0) {
    return (
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:size,color:ui.textSub,fontFamily:ui.fontBody,fontSize:12}}>
        لا توجد بيانات
      </div>
    );
  }
  const r = size / 2 - 4;
  const cx = size / 2, cy = size / 2;
  let angle = -Math.PI / 2;
  const paths = data.map((s, i) => {
    const v = Number(s.value) || 0;
    const slice = (v / sum) * Math.PI * 2;
    const x1 = cx + r * Math.cos(angle);
    const y1 = cy + r * Math.sin(angle);
    angle += slice;
    const x2 = cx + r * Math.cos(angle);
    const y2 = cy + r * Math.sin(angle);
    const largeArc = slice > Math.PI ? 1 : 0;
    const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
    const pct = Math.round((v / sum) * 100);
    return <path key={i} d={d} fill={s.color || "#9CA3AF"} stroke="#fff" strokeWidth={1}>
      <title>{`${s.label}: ${v.toLocaleString()} ج (${pct}%)`}</title>
    </path>;
  });
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} role="img" aria-label="توزيع المصروفات">
      {paths}
    </svg>
  );
});

// 6-month grouped-by-category bar chart. `months` is an array of
// { label, byCategory: { [catKey]: amount } }. `categories` is an array of
// { key, label, color }.
const ExpenseTrendChart = React.memo(function ExpenseTrendChart({ months, categories, ui, height = 160 }) {
  const data = months || [];
  if (!data.length) {
    return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:ui.textSub,fontFamily:ui.fontBody,fontSize:12}}>لا توجد بيانات</div>;
  }
  const totals = data.map(m => Object.values(m.byCategory || {}).reduce((s,n)=>s+Number(n||0),0));
  const maxV  = Math.max(1, ...totals);
  const padX = 40, padTop = 8, padBottom = 20;
  const innerH = height - padTop - padBottom;
  return (
    <div style={{overflowX:"auto"}}>
      <svg width={Math.max(260, data.length * 90)} height={height} role="img" aria-label="مقارنة 6 شهور">
        {data.map((m, i) => {
          const x = padX + i * 80;
          const total = totals[i] || 0;
          let acc = 0;
          return (
            <g key={i}>
              {categories.map(c => {
                const v = Number((m.byCategory||{})[c.key] || 0);
                if (v <= 0) return null;
                const segH = Math.round((v / maxV) * innerH);
                const y = padTop + innerH - Math.round(((acc + v) / maxV) * innerH);
                acc += v;
                return <rect key={c.key} x={x} y={y} width={56} height={segH} fill={c.color}>
                  <title>{`${m.label} · ${c.label}: ${v.toLocaleString()} ج`}</title>
                </rect>;
              })}
              <text x={x + 28} y={padTop + innerH + 14} textAnchor="middle" fontSize="10" fill={ui.textSub} fontFamily={ui.fontBody}>{m.label}</text>
              <text x={x + 28} y={padTop + innerH - Math.round((total / maxV) * innerH) - 3} textAnchor="middle" fontSize="9.5" fill={ui.text} fontFamily={ui.fontBody}>
                {total > 0 ? Math.round(total / 1000) + "k" : ""}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
});

// Tiny chart-legend pill (color dot + label + amount).
const ChartLegend = React.memo(function ChartLegend({ items, ui, total }) {
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {(items || []).map((it, i) => {
        const pct = total > 0 ? Math.round((Number(it.value) / total) * 100) : 0;
        return (
          <div key={i} style={{display:"flex",alignItems:"center",justifyContent:"space-between",gap:8,fontSize:12,fontFamily:ui.fontBody}}>
            <div style={{display:"flex",alignItems:"center",gap:6,minWidth:0}}>
              <span style={{width:10,height:10,background:it.color || "#9CA3AF",borderRadius:2,flexShrink:0}}/>
              <span style={{color:ui.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{it.label}</span>
            </div>
            <div style={{display:"flex",alignItems:"center",gap:6,color:ui.textSub,whiteSpace:"nowrap"}}>
              <span>{Number(it.value).toLocaleString()} ج</span>
              <span style={{color:ui.textSub,fontSize:11}}>· {pct}%</span>
            </div>
          </div>
        );
      })}
    </div>
  );
});

// ─── Expense Settings Panel ──────────────────────────────────────────────────
// Module-scope so typing in any field doesn't trigger AdminDash re-renders.
// Owns its own fetch state for categories / suppliers / budgets. Approval
// settings live on settings.store (so they're loaded with the rest of store
// config) and persisted via the parent's saveSetting().
// ─── Returns Settings Panel ──────────────────────────────────────────────────
// Module scope so typing in any input doesn't trigger AdminDash re-renders.
// All 7 spec sections store into `settings.store.returns.*` so they ship in
// the same payload as the rest of store config. Updates persist via the
// parent's saveSetting('store', next). Reasons CRUD reuses the existing
// /api/return-reasons endpoints; we just expose add/rename/toggle here.
// ─── Shipping Settings Panel — 4 sections ───────────────────────────────────
// Section A: Warehouse + sender info (NEW, lives in settings.store.shipping_*).
// Section B: Zones — full CRUD via /api/shipping/zones (replaces legacy JSON edit).
// Section C: Couriers — full CRUD via /api/shipping/couriers with single-default radio.
// Section D: General — free threshold, auto weight calc, default product weight,
//            payment method, processing days, delay alert, signature default,
//            default special instructions.
function ShippingSettingsPanel({ ui, mob, isSuper, storeCfg, setStoreCfg, saveSetting, shipping, setShipping }) {
  const [zones, setZones]       = useState([]);
  const [couriers, setCouriers] = useState([]);
  const [zonesBusy, setZonesBusy] = useState(false);
  const [courBusy,  setCourBusy]  = useState(false);
  const [zoneExpanded, setZoneExpanded] = useState({});         // { [id]: true } for details panel
  const [courierExpanded, setCourierExpanded] = useState({});
  const [zoneDraft, setZoneDraft] = useState({ name_ar:"" });   // new-zone inline form
  const [courDraft, setCourDraft] = useState({ name:"" });
  const [msg, setMsg] = useState("");
  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 1800); };
  const reload = useCallback(async () => {
    try {
      const [z, c] = await Promise.all([
        fetch("/api/shipping/zones?all=1").then(r => r.ok ? r.json() : []),
        fetch("/api/shipping/couriers?all=1").then(r => r.ok ? r.json() : []),
      ]);
      setZones(Array.isArray(z) ? z : []);
      setCouriers(Array.isArray(c) ? c : []);
    } catch {}
  }, []);
  useEffect(() => { reload(); }, [reload]);

  // ── A. Warehouse settings (NEW) ──
  const wh = {
    sender_name:        storeCfg.shipping_sender_name        || "",
    sender_phone:       storeCfg.shipping_sender_phone       || "",
    warehouse_address:  storeCfg.shipping_warehouse_address  || "",
    warehouse_lat:      storeCfg.shipping_warehouse_lat      || "",
    warehouse_lng:      storeCfg.shipping_warehouse_lng      || "",
    pickup_hours_from:  storeCfg.shipping_pickup_hours_from  || "10:00",
    pickup_hours_to:    storeCfg.shipping_pickup_hours_to    || "18:00",
    pickup_days:        Array.isArray(storeCfg.shipping_pickup_days) ? storeCfg.shipping_pickup_days : ["sat","sun","mon","tue","wed","thu"],
  };
  const saveStore = async (patch) => {
    if (!isSuper) return;
    const next = { ...storeCfg, ...patch };
    setStoreCfg(next);
    try { await saveSetting("store", next); flash("تم الحفظ"); } catch {}
  };

  // ── D. General settings (NEW) ──
  const gen = {
    default_free_threshold:    storeCfg.shipping_default_free_threshold    ?? (shipping && shipping.free_shipping_min_order) ?? 1000,
    auto_weight_calc:          storeCfg.shipping_auto_weight_calc !== false,    // default ON
    default_product_weight:    storeCfg.shipping_default_product_weight    ?? 0.3,
    payment_method:            storeCfg.shipping_payment_method            || "both",   // prepaid | cod | both
    processing_days:           storeCfg.shipping_processing_days           ?? 1,
    delay_alert_days:          storeCfg.shipping_delay_alert_days          ?? 5,
    signature_default:         !!storeCfg.shipping_signature_default,
    default_instructions:      storeCfg.shipping_default_instructions      || "",
  };

  // ── B. Zone CRUD ──
  const addZone = async () => {
    if (!zoneDraft.name_ar.trim()) return;
    setZonesBusy(true);
    try {
      const r = await fetch("/api/shipping/zones", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...zoneDraft, governorates: Array.isArray(zoneDraft.governorates) ? zoneDraft.governorates : [] }),
      });
      if (r.ok) { setZoneDraft({ name_ar:"" }); reload(); flash("تمت إضافة المنطقة"); }
    } catch {} finally { setZonesBusy(false); }
  };
  const patchZone = async (id, patch) => {
    try {
      const r = await fetch(`/api/shipping/zones/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(patch),
      });
      if (r.ok) reload();
    } catch {}
  };
  const deleteZone = async (z) => {
    if (!window.confirm(`حذف منطقة "${z.name_ar}"؟ (سيتم منع الحذف إذا كانت مرتبطة بشحنات)`)) return;
    try {
      const r = await fetch(`/api/shipping/zones/${z.id}`, { method:"DELETE" });
      const d = await r.json().catch(()=>({}));
      if (!r.ok) { window.alert(d.error || "تعذّر الحذف"); return; }
      reload(); flash("تم الحذف");
    } catch {}
  };

  // ── C. Courier CRUD ──
  const addCourier = async () => {
    if (!courDraft.name.trim()) return;
    setCourBusy(true);
    try {
      const r = await fetch("/api/shipping/couriers", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...courDraft }),
      });
      if (r.ok) { setCourDraft({ name:"" }); reload(); flash("تمت إضافة الشركة"); }
    } catch {} finally { setCourBusy(false); }
  };
  const patchCourier = async (id, patch) => {
    try {
      const r = await fetch(`/api/shipping/couriers/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(patch),
      });
      if (r.ok) reload();
    } catch {}
  };
  const deleteCourier = async (c) => {
    if (!window.confirm(`حذف "${c.name}"؟ (سيتم منع الحذف إذا كانت مرتبطة بشحنات)`)) return;
    try {
      const r = await fetch(`/api/shipping/couriers/${c.id}`, { method:"DELETE" });
      const d = await r.json().catch(()=>({}));
      if (!r.ok) { window.alert(d.error || "تعذّر الحذف"); return; }
      reload(); flash("تم الحذف");
    } catch {}
  };

  const card = { background:ui.cardBg, border:ui.border, borderRadius:ui.radius, padding: mob?"14px":"18px", marginBottom:12 };
  const cardTitle = { fontSize:13, fontWeight:600, color:ui.text, fontFamily:ui.fontBody, marginBottom:12, paddingBottom:8, borderBottom:"0.5px solid #EEE" };
  const labelStyle = { display:"block", fontSize:11.5, color:ui.textSub, fontFamily:ui.fontBody, marginBottom:4 };
  const inputStyle = { width:"100%", padding:"7px 10px", border:ui.border, borderRadius:5, background:ui.cardBg, fontFamily:ui.fontBody, fontSize:12.5, color:ui.text, outline:"none", direction:"rtl", boxSizing:"border-box" };
  const inputLtr   = { ...inputStyle, direction:"ltr", textAlign:"left", fontFamily:"monospace" };
  const Toggle = ({ value, onChange, disabled }) => (
    <button onClick={() => !disabled && onChange(!value)} disabled={disabled}
      style={{width:38,height:22,borderRadius:11,border:"none",background: value ? "#16A34A" : "#D4D4D4",position:"relative",cursor: disabled ? "not-allowed" : "pointer",opacity: disabled ? 0.6 : 1,flexShrink:0}}>
      <span style={{position:"absolute",top:2,[value?"left":"right"]:2,width:18,height:18,background:"#fff",borderRadius:"50%",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/>
    </button>
  );

  const EGYPT_GOVS = [
    "القاهرة","الجيزة","القليوبية","الإسكندرية","البحيرة","مرسى مطروح",
    "الدقهلية","الغربية","المنوفية","كفر الشيخ","الشرقية","دمياط",
    "الفيوم","بني سويف","المنيا","أسيوط","سوهاج","قنا","الأقصر","أسوان",
    "السويس","الإسماعيلية","بورسعيد","شمال سيناء","جنوب سيناء","البحر الأحمر","الوادي الجديد",
  ];

  return (
    <div>
      {msg && <div style={{padding:"8px 14px",borderRadius:6,marginBottom:10,background:"#DCFCE7",color:"#15803D",fontSize:12.5,fontFamily:ui.fontBody,border:"0.5px solid #86EFAC"}}>{msg}</div>}
      {!isSuper && (
        <div style={{padding:"8px 14px",borderRadius:6,marginBottom:10,background:"#FFFBEB",color:"#92400E",fontSize:12.5,fontFamily:ui.fontBody,border:"0.5px solid #FDE68A"}}>
          🔒 إعدادات الشحن تتطلب صلاحية Super Admin
        </div>
      )}

      {/* ─── A. Warehouse + sender ─── */}
      <div style={card}>
        <div style={cardTitle}>العناوين والمستودع</div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
          <div>
            <label style={labelStyle}>اسم المرسل (يظهر على البوليصة)</label>
            <input style={inputStyle} defaultValue={wh.sender_name} disabled={!isSuper}
              onBlur={e => e.target.value !== wh.sender_name && saveStore({ shipping_sender_name: e.target.value })}
              placeholder="نوّرَة Skincare"/>
          </div>
          <div>
            <label style={labelStyle}>رقم هاتف المرسل</label>
            <input style={inputLtr} defaultValue={wh.sender_phone} disabled={!isSuper}
              onBlur={e => e.target.value !== wh.sender_phone && saveStore({ shipping_sender_phone: e.target.value })}
              placeholder="+201xxxxxxxxx"/>
          </div>
          <div style={{gridColumn: mob ? "1" : "1 / -1"}}>
            <label style={labelStyle}>عنوان المستودع</label>
            <input style={inputStyle} defaultValue={wh.warehouse_address} disabled={!isSuper}
              onBlur={e => e.target.value !== wh.warehouse_address && saveStore({ shipping_warehouse_address: e.target.value })}
              placeholder="مثال: شارع 9، المعادي، القاهرة"/>
          </div>
          <div>
            <label style={labelStyle}>خط العرض (Lat)</label>
            <input style={inputLtr} defaultValue={wh.warehouse_lat} disabled={!isSuper}
              onBlur={e => e.target.value !== wh.warehouse_lat && saveStore({ shipping_warehouse_lat: e.target.value })}
              placeholder="29.95..."/>
          </div>
          <div>
            <label style={labelStyle}>خط الطول (Lng)</label>
            <input style={inputLtr} defaultValue={wh.warehouse_lng} disabled={!isSuper}
              onBlur={e => e.target.value !== wh.warehouse_lng && saveStore({ shipping_warehouse_lng: e.target.value })}
              placeholder="31.25..."/>
          </div>
          <div>
            <label style={labelStyle}>بداية ساعات الاستلام</label>
            <input type="time" style={inputStyle} defaultValue={wh.pickup_hours_from} disabled={!isSuper}
              onBlur={e => e.target.value !== wh.pickup_hours_from && saveStore({ shipping_pickup_hours_from: e.target.value })}/>
          </div>
          <div>
            <label style={labelStyle}>نهاية ساعات الاستلام</label>
            <input type="time" style={inputStyle} defaultValue={wh.pickup_hours_to} disabled={!isSuper}
              onBlur={e => e.target.value !== wh.pickup_hours_to && saveStore({ shipping_pickup_hours_to: e.target.value })}/>
          </div>
          <div style={{gridColumn: mob ? "1" : "1 / -1"}}>
            <label style={labelStyle}>أيام الاستلام</label>
            <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
              {[["sat","السبت"],["sun","الأحد"],["mon","الإثنين"],["tue","الثلاثاء"],["wed","الأربعاء"],["thu","الخميس"],["fri","الجمعة"]].map(([k,l])=>{
                const on = wh.pickup_days.includes(k);
                return (
                  <button key={k} disabled={!isSuper}
                    onClick={() => saveStore({ shipping_pickup_days: on ? wh.pickup_days.filter(x => x !== k) : [...wh.pickup_days, k] })}
                    style={{padding:"5px 12px",borderRadius:14,fontSize:11.5,fontFamily:ui.fontBody,cursor: isSuper?"pointer":"not-allowed",
                      background: on ? ui.text : "transparent", color: on ? "#fff" : ui.textSub, border: on ? "none" : ui.border}}>{l}</button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* ─── B. Shipping zones ─── */}
      <div style={card}>
        <div style={{...cardTitle,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>مناطق الشحن ({zones.length})</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {zones.map(z => {
            const expanded = !!zoneExpanded[z.id];
            return (
              <div key={z.id} style={{border:"0.5px solid #EEE",borderRadius:6,background:"#FAFAFA"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",gap:8,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                    <Toggle value={!!z.active} onChange={v => patchZone(z.id, { active: v })} disabled={!isSuper}/>
                    <span style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,fontWeight:500}}>{z.name_ar}</span>
                    <span style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody}}>· {z.base_price} ج · {z.min_days}-{z.max_days} يوم · {(z.governorates||[]).length} محافظة</span>
                    {(z.shipments_count || 0) > 0 && (
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:10,background:"#EFF6FF",color:"#1D4ED8",fontFamily:ui.fontBody}}>
                        {z.shipments_count} شحنة
                      </span>
                    )}
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <button onClick={() => setZoneExpanded(p => ({...p, [z.id]: !expanded}))}
                      style={{padding:"4px 10px",border:ui.border,background:ui.cardBg,borderRadius:4,fontSize:11.5,cursor:"pointer",color:ui.text,fontFamily:ui.fontBody}}>{expanded ? "إغلاق" : "تعديل"}</button>
                    <button onClick={() => deleteZone(z)} disabled={!isSuper || (z.shipments_count || 0) > 0}
                      title={(z.shipments_count || 0) > 0 ? "مرتبطة بشحنات — أوقفها بدلاً من الحذف" : "حذف"}
                      style={{padding:"4px 10px",border:"0.5px solid #FCA5A5",background:"transparent",borderRadius:4,fontSize:11.5,cursor: (isSuper && (z.shipments_count || 0) === 0) ? "pointer" : "not-allowed",color:"#B91C1C",fontFamily:ui.fontBody,opacity:(isSuper && (z.shipments_count || 0) === 0) ? 1 : 0.5}}>✕</button>
                  </div>
                </div>
                {expanded && (
                  <div style={{padding:"10px 11px 12px",borderTop:"0.5px solid #EEE",display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10}}>
                    <div>
                      <label style={labelStyle}>الاسم (عربي)</label>
                      <input style={inputStyle} defaultValue={z.name_ar} disabled={!isSuper}
                        onBlur={e => e.target.value !== z.name_ar && patchZone(z.id, { name_ar: e.target.value })}/>
                    </div>
                    <div>
                      <label style={labelStyle}>الاسم (English)</label>
                      <input style={inputLtr} defaultValue={z.name_en || ""} disabled={!isSuper}
                        onBlur={e => (e.target.value || null) !== (z.name_en || null) && patchZone(z.id, { name_en: e.target.value || null })}/>
                    </div>
                    <div style={{gridColumn: mob ? "1" : "1 / -1"}}>
                      <label style={labelStyle}>المحافظات المشمولة ({(z.governorates||[]).length})</label>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",padding:"6px 8px",background:ui.cardBg,border:ui.border,borderRadius:5,maxHeight:120,overflow:"auto"}}>
                        {EGYPT_GOVS.map(g => {
                          const on = (z.governorates || []).includes(g);
                          return (
                            <button key={g} disabled={!isSuper}
                              onClick={() => patchZone(z.id, { governorates: on ? z.governorates.filter(x => x !== g) : [...(z.governorates || []), g] })}
                              style={{padding:"3px 9px",borderRadius:12,fontSize:11,fontFamily:ui.fontBody,cursor:isSuper?"pointer":"not-allowed",
                                background: on ? ui.text : "transparent", color: on ? "#fff" : ui.textSub, border: on ? "none" : ui.border}}>{g}</button>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>السعر الأساسي (ج)</label>
                      <input type="text" inputMode="numeric" style={inputLtr} defaultValue={z.base_price} disabled={!isSuper}
                        onBlur={e => patchZone(z.id, { base_price: Number(e.target.value) || 0 })}/>
                    </div>
                    <div>
                      <label style={labelStyle}>الوزن الأساسي (كجم)</label>
                      <input type="text" inputMode="decimal" style={inputLtr} defaultValue={z.base_weight} disabled={!isSuper}
                        onBlur={e => patchZone(z.id, { base_weight: Number(e.target.value) || 1 })}/>
                    </div>
                    <div>
                      <label style={labelStyle}>سعر الكيلو الإضافي (ج)</label>
                      <input type="text" inputMode="numeric" style={inputLtr} defaultValue={z.extra_per_kg} disabled={!isSuper}
                        onBlur={e => patchZone(z.id, { extra_per_kg: Number(e.target.value) || 0 })}/>
                    </div>
                    <div>
                      <label style={labelStyle}>أيام التوصيل (من - إلى)</label>
                      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6}}>
                        <input type="text" inputMode="numeric" style={inputLtr} defaultValue={z.min_days} disabled={!isSuper}
                          onBlur={e => patchZone(z.id, { min_days: Number(e.target.value) || 1 })}/>
                        <input type="text" inputMode="numeric" style={inputLtr} defaultValue={z.max_days} disabled={!isSuper}
                          onBlur={e => patchZone(z.id, { max_days: Number(e.target.value) || 3 })}/>
                      </div>
                    </div>
                    <div>
                      <label style={labelStyle}>حد الشحن المجاني للمنطقة (ج، اتركه فارغاً للحد الافتراضي)</label>
                      <input type="text" inputMode="numeric" style={inputLtr} defaultValue={z.free_shipping_threshold ?? ""} disabled={!isSuper}
                        onBlur={e => patchZone(z.id, { free_shipping_threshold: e.target.value === "" ? null : Number(e.target.value) })}/>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Inline add row */}
        <div style={{display:"flex",gap:8,marginTop:10,paddingTop:10,borderTop:"0.5px dashed #EEE"}}>
          <input value={zoneDraft.name_ar || ""} onChange={e => setZoneDraft({...zoneDraft, name_ar: e.target.value})}
            placeholder="اسم منطقة جديدة..." disabled={!isSuper} style={{...inputStyle, flex:1}}/>
          <button onClick={addZone} disabled={!isSuper || zonesBusy || !zoneDraft.name_ar.trim()}
            style={{padding:"7px 14px",background:(!isSuper||zonesBusy||!zoneDraft.name_ar.trim())?"#9CA3AF":ui.text,color:"#fff",border:"none",borderRadius:5,fontSize:12.5,cursor:(!isSuper||zonesBusy||!zoneDraft.name_ar.trim())?"not-allowed":"pointer",fontFamily:ui.fontBody}}>
            + إضافة منطقة
          </button>
        </div>
      </div>

      {/* ─── C. Couriers ─── */}
      <div style={card}>
        <div style={{...cardTitle,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <span>شركات الشحن ({couriers.length})</span>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {couriers.map(c => {
            const expanded = !!courierExpanded[c.id];
            return (
              <div key={c.id} style={{border:"0.5px solid #EEE",borderRadius:6,background:"#FAFAFA"}}>
                <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 11px",gap:8,flexWrap:"wrap"}}>
                  <div style={{display:"flex",alignItems:"center",gap:8,flex:1,minWidth:0}}>
                    <Toggle value={!!c.active} onChange={v => patchCourier(c.id, { active: v })} disabled={!isSuper}/>
                    <span style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,fontWeight:500}}>{c.name}</span>
                    {c.is_default ? <span style={{fontSize:10.5,padding:"2px 8px",borderRadius:10,background:"#534AB7",color:"#fff",fontFamily:ui.fontBody}}>افتراضية</span> : null}
                    {c.description && <span style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody}}>· {c.description}</span>}
                  </div>
                  <div style={{display:"flex",gap:4}}>
                    <label style={{display:"inline-flex",alignItems:"center",gap:4,fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,cursor:isSuper?"pointer":"not-allowed",padding:"4px 8px"}}>
                      <input type="radio" name="default-courier" checked={!!c.is_default} disabled={!isSuper}
                        onChange={() => patchCourier(c.id, { is_default: true })}
                        style={{accentColor:ui.text,cursor:isSuper?"pointer":"not-allowed"}}/>
                      افتراضية
                    </label>
                    <button onClick={() => setCourierExpanded(p => ({...p, [c.id]: !expanded}))}
                      style={{padding:"4px 10px",border:ui.border,background:ui.cardBg,borderRadius:4,fontSize:11.5,cursor:"pointer",color:ui.text,fontFamily:ui.fontBody}}>{expanded ? "إغلاق" : "تعديل"}</button>
                    <button onClick={() => deleteCourier(c)} disabled={!isSuper}
                      style={{padding:"4px 10px",border:"0.5px solid #FCA5A5",background:"transparent",borderRadius:4,fontSize:11.5,cursor:isSuper?"pointer":"not-allowed",color:"#B91C1C",fontFamily:ui.fontBody,opacity:isSuper?1:0.5}}>✕</button>
                  </div>
                </div>
                {expanded && (
                  <div style={{padding:"10px 11px 12px",borderTop:"0.5px solid #EEE",display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10}}>
                    <div>
                      <label style={labelStyle}>اسم الشركة</label>
                      <input style={inputStyle} defaultValue={c.name} disabled={!isSuper}
                        onBlur={e => e.target.value !== c.name && patchCourier(c.id, { name: e.target.value })}/>
                    </div>
                    <div>
                      <label style={labelStyle}>وصف مختصر</label>
                      <input style={inputStyle} defaultValue={c.description || ""} disabled={!isSuper}
                        onBlur={e => (e.target.value || null) !== (c.description || null) && patchCourier(c.id, { description: e.target.value || null })}/>
                    </div>
                    <div>
                      <label style={labelStyle}>جهة الاتصال</label>
                      <input style={inputStyle} defaultValue={c.contact_name || ""} disabled={!isSuper}
                        onBlur={e => (e.target.value || null) !== (c.contact_name || null) && patchCourier(c.id, { contact_name: e.target.value || null })}/>
                    </div>
                    <div>
                      <label style={labelStyle}>هاتف</label>
                      <input style={inputLtr} defaultValue={c.contact_phone || ""} disabled={!isSuper}
                        onBlur={e => (e.target.value || null) !== (c.contact_phone || null) && patchCourier(c.id, { contact_phone: e.target.value || null })}/>
                    </div>
                    <div>
                      <label style={labelStyle}>إيميل</label>
                      <input type="email" style={inputLtr} defaultValue={c.contact_email || ""} disabled={!isSuper}
                        onBlur={e => (e.target.value || null) !== (c.contact_email || null) && patchCourier(c.id, { contact_email: e.target.value || null })}/>
                    </div>
                    <div>
                      <label style={labelStyle}>قالب رابط التتبع</label>
                      <input style={inputLtr} defaultValue={c.tracking_url_template || ""} disabled={!isSuper}
                        onBlur={e => (e.target.value || null) !== (c.tracking_url_template || null) && patchCourier(c.id, { tracking_url_template: e.target.value || null })}
                        placeholder="https://bosta.co/track/{tracking_number}"/>
                      <div style={{fontSize:10.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:3}}>استخدم <code>{"{tracking_number}"}</code> كمتغير</div>
                    </div>
                    <div style={{gridColumn:mob?"1":"1 / -1"}}>
                      <label style={labelStyle}>ملاحظات داخلية</label>
                      <textarea rows={2} style={inputStyle} defaultValue={c.internal_notes || ""} disabled={!isSuper}
                        onBlur={e => (e.target.value || null) !== (c.internal_notes || null) && patchCourier(c.id, { internal_notes: e.target.value || null })}/>
                    </div>
                    <div style={{gridColumn:mob?"1":"1 / -1"}}>
                      <label style={labelStyle}>المناطق التي تخدمها (اتركها فارغة = كل المناطق)</label>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap"}}>
                        {zones.map(z => {
                          const on = (c.zone_ids || []).includes(z.id);
                          return (
                            <button key={z.id} disabled={!isSuper}
                              onClick={() => patchCourier(c.id, { zone_ids: on ? (c.zone_ids || []).filter(x => x !== z.id) : [...(c.zone_ids || []), z.id] })}
                              style={{padding:"3px 9px",borderRadius:12,fontSize:11,fontFamily:ui.fontBody,cursor:isSuper?"pointer":"not-allowed",
                                background: on ? ui.text : "transparent", color: on ? "#fff" : ui.textSub, border: on ? "none" : ui.border}}>{z.name_ar}</button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
        {/* Inline add row */}
        <div style={{display:"flex",gap:8,marginTop:10,paddingTop:10,borderTop:"0.5px dashed #EEE"}}>
          <input value={courDraft.name || ""} onChange={e => setCourDraft({...courDraft, name: e.target.value})}
            placeholder="اسم شركة شحن جديدة..." disabled={!isSuper} style={{...inputStyle, flex:1}}/>
          <button onClick={addCourier} disabled={!isSuper || courBusy || !courDraft.name.trim()}
            style={{padding:"7px 14px",background:(!isSuper||courBusy||!courDraft.name.trim())?"#9CA3AF":ui.text,color:"#fff",border:"none",borderRadius:5,fontSize:12.5,cursor:(!isSuper||courBusy||!courDraft.name.trim())?"not-allowed":"pointer",fontFamily:ui.fontBody}}>
            + إضافة شركة
          </button>
        </div>
      </div>

      {/* ─── D. General settings ─── */}
      <div style={card}>
        <div style={cardTitle}>إعدادات عامة</div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
          <div>
            <label style={labelStyle}>الحد الافتراضي للشحن المجاني (ج)</label>
            <input type="text" inputMode="numeric" style={inputLtr} defaultValue={gen.default_free_threshold} disabled={!isSuper}
              onBlur={e => saveStore({ shipping_default_free_threshold: Number(e.target.value) || 0 })}/>
            <div style={{fontSize:10.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:3}}>المناطق التي لها حد خاص تتجاوز هذا الحد</div>
          </div>
          <div>
            <label style={labelStyle}>الوزن الافتراضي للمنتج (كجم)</label>
            <input type="text" inputMode="decimal" style={inputLtr} defaultValue={gen.default_product_weight} disabled={!isSuper}
              onBlur={e => saveStore({ shipping_default_product_weight: Number(e.target.value) || 0.3 })}/>
          </div>
          <div>
            <label style={labelStyle}>زمن المعالجة قبل الشحن (أيام)</label>
            <input type="text" inputMode="numeric" style={inputLtr} defaultValue={gen.processing_days} disabled={!isSuper}
              onBlur={e => saveStore({ shipping_processing_days: Number(e.target.value) || 0 })}/>
          </div>
          <div>
            <label style={labelStyle}>تنبيه التأخير بعد (أيام)</label>
            <input type="text" inputMode="numeric" style={inputLtr} defaultValue={gen.delay_alert_days} disabled={!isSuper}
              onBlur={e => saveStore({ shipping_delay_alert_days: Number(e.target.value) || 5 })}/>
          </div>
          <div>
            <label style={labelStyle}>طريقة دفع الشحن</label>
            <select value={gen.payment_method} disabled={!isSuper}
              onChange={e => saveStore({ shipping_payment_method: e.target.value })}
              style={inputStyle}>
              <option value="prepaid">العميل يدفع مع الطلب</option>
              <option value="cod">الدفع عند الاستلام</option>
              <option value="both">كلاهما (يختار العميل)</option>
            </select>
          </div>
          <div style={{display:"flex",alignItems:"flex-end",gap:14}}>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,cursor:isSuper?"pointer":"not-allowed"}}>
              <input type="checkbox" checked={gen.auto_weight_calc} disabled={!isSuper}
                onChange={e => saveStore({ shipping_auto_weight_calc: e.target.checked })}
                style={{accentColor:ui.text}}/>
              حساب الوزن تلقائياً
            </label>
            <label style={{display:"flex",alignItems:"center",gap:6,fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,cursor:isSuper?"pointer":"not-allowed"}}>
              <input type="checkbox" checked={gen.signature_default} disabled={!isSuper}
                onChange={e => saveStore({ shipping_signature_default: e.target.checked })}
                style={{accentColor:ui.text}}/>
              توقيع المستلم مطلوب
            </label>
          </div>
          <div style={{gridColumn:mob?"1":"1 / -1"}}>
            <label style={labelStyle}>تعليمات خاصة افتراضية (تظهر على كل بوليصة)</label>
            <textarea rows={2} style={inputStyle} defaultValue={gen.default_instructions} disabled={!isSuper}
              onBlur={e => saveStore({ shipping_default_instructions: e.target.value })}
              placeholder="مثال: التعامل بحذر — منتجات قابلة للكسر"/>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReturnsSettingsPanel({ ui, mob, isSuper, storeCfg, setStoreCfg, saveSetting, reasons, onReasonsChanged }) {
  const ret = storeCfg.returns || {};
  // Defaults — applied on first read when the key is absent so the UI shows
  // sensible values even before the admin has touched the form.
  const cfg = {
    window_days:            Number.isFinite(ret.window_days) ? ret.window_days : 14,
    allow_refund:           ret.allow_refund !== false,                    // default ON
    allow_exchange:         ret.allow_exchange !== false,                  // default ON
    allow_store_credit:     ret.allow_store_credit !== false,              // default ON
    non_returnable_ids:     Array.isArray(ret.non_returnable_ids) ? ret.non_returnable_ids : [],
    shipping_policy:        ret.shipping_policy || 'store',                // store | customer | by_reason
    store_credit_bonus_pct: Number.isFinite(ret.store_credit_bonus_pct) ? ret.store_credit_bonus_pct : 5,
    approver:               ret.approver || 'super_only',                  // super_only | orders_admin
  };
  const [busy, setBusy] = useState(false);
  const [msg,  setMsg]  = useState("");
  const [reasonDraft, setReasonDraft] = useState("");
  const [products, setProducts] = useState([]);

  useEffect(() => {
    // Load products once for the non-returnable multi-select.
    fetch("/api/products").then(r => r.ok ? r.json() : []).then(d => setProducts(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const flash = (t) => { setMsg(t); setTimeout(() => setMsg(""), 2000); };
  const saveCfg = async (patch) => {
    if (!isSuper) return;
    const next = { ...storeCfg, returns: { ...cfg, ...patch } };
    setStoreCfg(next);
    setBusy(true);
    try { await saveSetting("store", next); flash("تم الحفظ"); } catch {}
    setBusy(false);
  };

  const addReason = async () => {
    const name = reasonDraft.trim();
    if (!name) return;
    setBusy(true);
    try {
      await fetch("/api/return-reasons", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ name_ar: name }),
      });
      setReasonDraft(""); flash("تمت الإضافة"); onReasonsChanged && onReasonsChanged();
    } catch {} finally { setBusy(false); }
  };
  const renameReason = async (id, name_ar) => {
    try { await fetch(`/api/return-reasons/${id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ name_ar }) }); onReasonsChanged && onReasonsChanged(); } catch {}
  };
  const toggleReason = async (r) => {
    try { await fetch(`/api/return-reasons/${r.id}`, { method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ active: !r.active }) }); onReasonsChanged && onReasonsChanged(); } catch {}
  };
  const deleteReason = async (r) => {
    if (r.is_default) { window.alert("الأسباب الافتراضية غير قابلة للحذف — يمكن إيقافها بدلاً من ذلك."); return; }
    if (!window.confirm(`حذف سبب "${r.name_ar}"؟`)) return;
    try { await fetch(`/api/return-reasons/${r.id}`, { method:"DELETE" }); onReasonsChanged && onReasonsChanged(); } catch {}
  };

  const card = { background:ui.cardBg, border:ui.border, borderRadius:ui.radius, padding: mob?"14px":"18px", marginBottom:12 };
  const cardTitle = { fontSize:13, fontWeight:600, color:ui.text, fontFamily:ui.fontBody, marginBottom:12, paddingBottom:8, borderBottom:"0.5px solid #EEE" };
  const inputStyle = { width:"100%", padding:"8px 11px", border:ui.border, borderRadius:6, background:ui.cardBg, fontFamily:ui.fontBody, fontSize:13, color:ui.text, outline:"none", direction:"rtl", boxSizing:"border-box" };
  const switchBtn = (val, onClick) => (
    <button onClick={onClick} disabled={!isSuper}
      style={{width:38,height:22,borderRadius:11,border:"none",background: val ? "#16A34A" : "#D4D4D4",position:"relative",cursor: isSuper ? "pointer" : "not-allowed",opacity: isSuper ? 1 : 0.6}}>
      <span style={{position:"absolute",top:2,[val?"left":"right"]:2,width:18,height:18,background:"#fff",borderRadius:"50%",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/>
    </button>
  );

  return (
    <div>
      {msg && (
        <div style={{padding:"8px 14px",borderRadius:6,marginBottom:10,background:"#DCFCE7",color:"#15803D",fontSize:12.5,fontFamily:ui.fontBody,border:"0.5px solid #86EFAC"}}>{msg}</div>
      )}
      {!isSuper && (
        <div style={{padding:"8px 14px",borderRadius:6,marginBottom:10,background:"#FFFBEB",color:"#92400E",fontSize:12.5,fontFamily:ui.fontBody,border:"0.5px solid #FDE68A"}}>
          🔒 إعدادات المرتجعات تتطلب صلاحية Super Admin
        </div>
      )}

      {/* A. Return window */}
      <div style={card}>
        <div style={cardTitle}>مدة الإرجاع المسموح بها</div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          <input type="text" inputMode="numeric" defaultValue={cfg.window_days}
            disabled={!isSuper}
            onBlur={e => { const v = Math.max(1, Math.min(365, parseInt(e.target.value, 10) || 14)); saveCfg({ window_days: v }); }}
            style={{...inputStyle, maxWidth:120, direction:"ltr", textAlign:"left"}}/>
          <span style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>يوم من تاريخ التسليم (الافتراضي 14)</span>
        </div>
      </div>

      {/* B. Allowed return types */}
      <div style={card}>
        <div style={cardTitle}>أنواع الإرجاع المسموح بها</div>
        {[
          ["allow_refund",       "استرداد كامل (نقدي / تحويل / محفظة)"],
          ["allow_exchange",     "استبدال بمنتج آخر"],
          ["allow_store_credit", "رصيد للمتجر (Store Credit)"],
        ].map(([k, l]) => (
          <div key={k} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"0.5px solid #EEE"}}>
            <span style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody}}>{l}</span>
            {switchBtn(cfg[k], () => saveCfg({ [k]: !cfg[k] }))}
          </div>
        ))}
      </div>

      {/* C. Non-returnable products */}
      <div style={card}>
        <div style={cardTitle}>منتجات غير قابلة للإرجاع</div>
        <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:8}}>اختر المنتجات التي لا يمكن إرجاعها (مثل منتجات النظافة الشخصية)</div>
        <select multiple value={cfg.non_returnable_ids.map(String)} disabled={!isSuper}
          onChange={e => {
            const sel = Array.from(e.target.selectedOptions).map(o => o.value);
            saveCfg({ non_returnable_ids: sel });
          }}
          style={{...inputStyle, minHeight:150, padding:"8px 10px"}}>
          {products.map(p => (
            <option key={p.id} value={p.id}>{p.name || (p.name_i18n && p.name_i18n.ar) || p.id}</option>
          ))}
        </select>
        <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:6}}>
          استخدم Ctrl/Cmd للاختيار المتعدد · {cfg.non_returnable_ids.length} منتج محدد
        </div>
      </div>

      {/* D. Return reasons CRUD */}
      <div style={card}>
        <div style={cardTitle}>أسباب الإرجاع المتاحة ({(reasons || []).length})</div>
        <div style={{display:"flex",flexDirection:"column",gap:8}}>
          {(reasons || []).map(r => (
            <div key={r.id} style={{display:"flex",alignItems:"center",gap:8,padding:"6px 10px",border:"0.5px solid #EEE",borderRadius:6,background:"#FAFAFA"}}>
              <input defaultValue={r.name_ar}
                onBlur={e => { if (e.target.value !== r.name_ar) renameReason(r.id, e.target.value); }}
                disabled={!isSuper}
                style={{...inputStyle, padding:"5px 9px", flex:1, fontSize:12.5}}/>
              {switchBtn(!!r.active, () => toggleReason(r))}
              {!r.is_default ? (
                <button onClick={() => deleteReason(r)} disabled={!isSuper}
                  style={{background:"transparent",border:"none",color:"#DC2626",cursor:isSuper?"pointer":"not-allowed",fontSize:15,padding:"0 4px"}}>×</button>
              ) : <span style={{fontSize:10,color:ui.textSub,fontFamily:ui.fontBody,paddingLeft:6}}>افتراضي</span>}
            </div>
          ))}
          <div style={{display:"flex",gap:8,marginTop:4}}>
            <input value={reasonDraft} onChange={e => setReasonDraft(e.target.value)}
              placeholder="+ إضافة سبب جديد..." disabled={!isSuper}
              style={{...inputStyle, flex:1}}/>
            <button onClick={addReason} disabled={!isSuper || busy || !reasonDraft.trim()}
              style={{padding:"6px 14px",background:(!isSuper||busy||!reasonDraft.trim())?"#9CA3AF":ui.text,color:"#fff",border:"none",borderRadius:5,fontSize:12.5,cursor:(!isSuper||busy||!reasonDraft.trim())?"not-allowed":"pointer",fontFamily:ui.fontBody}}>إضافة</button>
          </div>
        </div>
      </div>

      {/* E. Shipping policy */}
      <div style={card}>
        <div style={cardTitle}>سياسة الشحن المرتجع</div>
        <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:8}}>من يتحمل تكلفة الشحن المرتجع؟</div>
        <select value={cfg.shipping_policy} disabled={!isSuper}
          onChange={e => saveCfg({ shipping_policy: e.target.value })}
          style={{...inputStyle, maxWidth:300}}>
          <option value="store">المتجر يتحمل التكلفة</option>
          <option value="customer">العميل يتحمل التكلفة</option>
          <option value="by_reason">حسب سبب الإرجاع (تالف → المتجر، غير ذلك → العميل)</option>
        </select>
      </div>

      {/* F. Store credit bonus */}
      <div style={card}>
        <div style={cardTitle}>مكافأة رصيد المتجر</div>
        <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:8}}>
          نسبة إضافية تُمنح للعميل عند اختياره رصيد المتجر بدلاً من الاسترداد النقدي
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          <input type="text" inputMode="numeric" defaultValue={cfg.store_credit_bonus_pct}
            disabled={!isSuper}
            onBlur={e => { const v = Math.max(0, Math.min(100, parseFloat(e.target.value) || 0)); saveCfg({ store_credit_bonus_pct: v }); }}
            style={{...inputStyle, maxWidth:120, direction:"ltr", textAlign:"left"}}/>
          <span style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>% (الافتراضي 5%، اضبط 0 لتعطيل المكافأة)</span>
        </div>
      </div>

      {/* G. Approver permission */}
      <div style={card}>
        <div style={cardTitle}>الموافقة المطلوبة</div>
        <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:8}}>من يستطيع الموافقة على طلبات الإرجاع؟</div>
        <select value={cfg.approver} disabled={!isSuper}
          onChange={e => saveCfg({ approver: e.target.value })}
          style={{...inputStyle, maxWidth:360}}>
          <option value="super_only">Super Admin فقط</option>
          <option value="orders_admin">مشرف الطلبات + Super Admin</option>
        </select>
      </div>
    </div>
  );
}

function ExpenseSettingsPanel({ ui, mob, isSuper, storeCfg, setStoreCfg, saveSetting, onAnyChange }) {
  const [cats,      setCats]      = useState([]);
  const [sups,      setSups]      = useState([]);
  const [budgets,   setBudgets]   = useState([]);
  const [busy,      setBusy]      = useState(false);
  const [msg,       setMsg]       = useState("");

  // ── Drafts ──
  const [catDraft,  setCatDraft]  = useState({ name_ar:"", name_en:"", color:"#6B7280", icon:"" });
  const [supDraft,  setSupDraft]  = useState({ name:"", phone:"", email:"", notes:"" });
  const [budgetDraft, setBudgetDraft] = useState({}); // { [category_id]: amount string }

  const reload = useCallback(async () => {
    try {
      const [c, s, b] = await Promise.all([
        fetch("/api/expense-categories?all=1").then(r => r.ok ? r.json() : []),
        fetch("/api/suppliers").then(r => r.ok ? r.json() : []),
        fetch("/api/expense-budgets").then(r => r.ok ? r.json() : []),
      ]);
      setCats(Array.isArray(c) ? c : []);
      setSups(Array.isArray(s) ? s : []);
      const bArr = Array.isArray(b) ? b : [];
      setBudgets(bArr);
      // Seed the budget draft with current values
      const draft = {};
      bArr.forEach(x => { if (x.category_id) draft[x.category_id] = String(x.monthly_budget || ""); });
      setBudgetDraft(draft);
    } catch {}
  }, []);
  useEffect(() => { reload(); }, [reload]);

  const flash = (t) => { setMsg(t); setTimeout(()=>setMsg(""), 2200); };

  // ── Categories ──
  const addCategory = async () => {
    if (!catDraft.name_ar.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/expense-categories", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(catDraft),
      });
      if (r.ok) {
        setCatDraft({ name_ar:"", name_en:"", color:"#6B7280", icon:"" });
        flash("تمت إضافة الفئة");
        reload(); onAnyChange && onAnyChange();
      }
    } catch {} finally { setBusy(false); }
  };
  const patchCategory = async (id, patch) => {
    try {
      await fetch(`/api/expense-categories/${id}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(patch),
      });
      reload(); onAnyChange && onAnyChange();
    } catch {}
  };
  const deleteCategory = async (c) => {
    if (!window.confirm(`حذف فئة "${c.name_ar}"؟`)) return;
    try {
      const r = await fetch(`/api/expense-categories/${c.id}`, { method:"DELETE" });
      if (!r.ok) { const j = await r.json().catch(()=>({})); flash(`فشل الحذف: ${j.error || r.status}`); return; }
      reload(); onAnyChange && onAnyChange();
    } catch {}
  };

  // ── Suppliers ──
  const addSupplier = async () => {
    if (!supDraft.name.trim()) return;
    setBusy(true);
    try {
      const r = await fetch("/api/suppliers", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(supDraft),
      });
      if (r.ok) {
        setSupDraft({ name:"", phone:"", email:"", notes:"" });
        flash("تمت إضافة المورد");
        reload(); onAnyChange && onAnyChange();
      }
    } catch {} finally { setBusy(false); }
  };
  const deleteSupplier = async (s) => {
    if (!window.confirm(`حذف المورد "${s.name}"؟`)) return;
    try { await fetch(`/api/suppliers/${s.id}`, { method:"DELETE" }); reload(); onAnyChange && onAnyChange(); } catch {}
  };

  // ── Budgets ──
  const saveBudget = async (categoryId) => {
    const amt = Number(budgetDraft[categoryId]) || 0;
    try {
      await fetch(`/api/expense-budgets/${categoryId}`, {
        method:"PUT", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ monthly_budget: amt }),
      });
      reload(); flash("تم حفظ الميزانية");
    } catch {}
  };

  // ── Approval system (saved into settings.store) ──
  const approvalEnabled   = !!storeCfg.expense_approval_enabled;
  const approvalThreshold = Number(storeCfg.expense_approval_threshold) || 1000;
  const saveStoreApproval = async (patch) => {
    const next = { ...storeCfg, ...patch };
    setStoreCfg(next);
    try { await saveSetting("store", next); flash("تم حفظ إعدادات الموافقة"); } catch {}
  };
  // ── Budget alerts (also in settings.store) ──
  // Default ON when the key isn't set yet — matches the spec.
  const budgetAlertsEnabled = storeCfg.budget_alerts_enabled === undefined ? true : !!storeCfg.budget_alerts_enabled;
  const budgetWarningThreshold = (() => {
    const v = Number(storeCfg.budget_warning_threshold);
    if (!Number.isFinite(v) || v <= 0 || v >= 100) return 80;
    return v;
  })();
  const saveBudgetAlerts = async (patch) => {
    const next = { ...storeCfg, ...patch };
    setStoreCfg(next);
    try { await saveSetting("store", next); flash("تم حفظ إعدادات التنبيهات"); } catch {}
  };

  const card = { background:ui.cardBg, border:ui.border, borderRadius:ui.radius, padding: mob?"14px":"18px", marginBottom:12 };
  const cardTitle = { fontSize:13, fontWeight:600, color:ui.text, fontFamily:ui.fontBody, marginBottom:12, paddingBottom:8, borderBottom:"0.5px solid #EEE" };
  const inputStyle = { width:"100%", padding:"8px 11px", border:ui.border, borderRadius:6, background:ui.cardBg, fontFamily:ui.fontBody, fontSize:13, color:ui.text, outline:"none", direction:"rtl", boxSizing:"border-box" };

  return (
    <div>
      {msg && (
        <div style={{padding:"8px 14px",borderRadius:6,marginBottom:10,background:"#DCFCE7",color:"#15803D",fontSize:12.5,fontFamily:ui.fontBody,border:"0.5px solid #86EFAC"}}>{msg}</div>
      )}

      {/* CATEGORIES ─────────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={cardTitle}>الفئات ({cats.length})</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:680}}>
            <thead>
              <tr style={{background:ui.sideBg,borderBottom:"0.5px solid #E5E5E5"}}>
                {["الاسم (عربي)","Name (EN)","اللون","أيقونة","حالة",""].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {cats.map(c => (
                <tr key={c.id} style={{borderTop:"0.5px solid #EEE"}}>
                  <td style={{padding:"8px 12px"}}>
                    <input style={{...inputStyle,padding:"6px 9px"}} defaultValue={c.name_ar}
                      onBlur={e => { if (e.target.value !== c.name_ar) patchCategory(c.id, { name_ar: e.target.value }); }}/>
                  </td>
                  <td style={{padding:"8px 12px"}}>
                    <input style={{...inputStyle,padding:"6px 9px",direction:"ltr",textAlign:"left"}} defaultValue={c.name_en || ""}
                      onBlur={e => { if ((e.target.value||"") !== (c.name_en||"")) patchCategory(c.id, { name_en: e.target.value }); }}/>
                  </td>
                  <td style={{padding:"8px 12px"}}>
                    <input type="color" defaultValue={c.color || "#6B7280"} onBlur={e => { if (e.target.value !== c.color) patchCategory(c.id, { color: e.target.value }); }}
                      style={{width:36,height:28,border:"none",cursor:"pointer",padding:0,background:"transparent"}}/>
                  </td>
                  <td style={{padding:"8px 12px"}}>
                    <input style={{...inputStyle,padding:"6px 9px",width:60,textAlign:"center"}} defaultValue={c.icon || ""}
                      onBlur={e => { if ((e.target.value||"") !== (c.icon||"")) patchCategory(c.id, { icon: e.target.value }); }}/>
                  </td>
                  <td style={{padding:"8px 12px"}}>
                    <button onClick={()=>patchCategory(c.id, { active: !c.active })}
                      style={{width:38,height:22,borderRadius:11,border:"none",background: c.active ? "#16A34A" : "#D4D4D4",position:"relative",cursor:"pointer"}}>
                      <span style={{position:"absolute",top:2,[c.active?"left":"right"]:2,width:18,height:18,background:"#fff",borderRadius:"50%",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/>
                    </button>
                  </td>
                  <td style={{padding:"8px 12px",textAlign:"left"}}>
                    {!c.is_default && (
                      <button onClick={()=>deleteCategory(c)} style={{background:"transparent",border:"none",color:"#DC2626",cursor:"pointer",fontSize:14}}>×</button>
                    )}
                    {c.is_default && <span style={{fontSize:10.5,color:ui.textSub,fontFamily:ui.fontBody}}>افتراضي</span>}
                  </td>
                </tr>
              ))}
              {/* Inline add row */}
              <tr style={{borderTop:"0.5px solid #EEE",background:"#FAFAFA"}}>
                <td style={{padding:"8px 12px"}}><input style={{...inputStyle,padding:"6px 9px"}} value={catDraft.name_ar} onChange={e=>setCatDraft({...catDraft,name_ar:e.target.value})} placeholder="فئة جديدة..."/></td>
                <td style={{padding:"8px 12px"}}><input style={{...inputStyle,padding:"6px 9px",direction:"ltr",textAlign:"left"}} value={catDraft.name_en} onChange={e=>setCatDraft({...catDraft,name_en:e.target.value})} placeholder="EN"/></td>
                <td style={{padding:"8px 12px"}}><input type="color" value={catDraft.color} onChange={e=>setCatDraft({...catDraft,color:e.target.value})} style={{width:36,height:28,border:"none",cursor:"pointer",padding:0,background:"transparent"}}/></td>
                <td style={{padding:"8px 12px"}}><input style={{...inputStyle,padding:"6px 9px",width:60,textAlign:"center"}} value={catDraft.icon} onChange={e=>setCatDraft({...catDraft,icon:e.target.value})} placeholder="🧾"/></td>
                <td/>
                <td style={{padding:"8px 12px",textAlign:"left"}}>
                  <button onClick={addCategory} disabled={busy || !catDraft.name_ar.trim()}
                    style={{background: catDraft.name_ar.trim() ? ui.text : "#9CA3AF",color:"#fff",border:"none",padding:"6px 14px",borderRadius:4,fontSize:12,fontFamily:ui.fontBody,cursor: catDraft.name_ar.trim()?"pointer":"not-allowed"}}>إضافة</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:8}}>الفئات الافتراضية لا يمكن حذفها — يمكنك فقط إعادة تسميتها أو إيقافها</div>
      </div>

      {/* BUDGETS ─────────────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={cardTitle}>الميزانيات الشهرية</div>
        <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:10}}>اضبط ميزانية شهرية لكل فئة — ستظهر في قسم "الميزانية مقابل الفعلي" بصفحة المصروفات</div>
        <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10}}>
          {cats.filter(c => c.active).map(c => (
            <div key={c.id} style={{display:"flex",alignItems:"center",gap:8,padding:"8px 10px",border:"0.5px solid #EEE",borderRadius:6,background:"#FAFAFA"}}>
              <span style={{width:10,height:10,background:c.color,borderRadius:2,flexShrink:0}}/>
              <span style={{flex:1,fontSize:13,color:ui.text,fontFamily:ui.fontBody,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>{c.name_ar}</span>
              <input type="text" inputMode="numeric"
                value={budgetDraft[c.id] || ""}
                onChange={e=>setBudgetDraft({...budgetDraft, [c.id]: e.target.value.replace(/[^0-9.]/g,'')})}
                onBlur={()=>saveBudget(c.id)}
                placeholder="0"
                style={{...inputStyle,padding:"5px 8px",width:100,direction:"ltr",textAlign:"left"}}/>
              <span style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody}}>ج / شهر</span>
            </div>
          ))}
        </div>
      </div>

      {/* APPROVAL SYSTEM ─────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={cardTitle}>نظام الموافقات</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0"}}>
          <div>
            <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody}}>تفعيل الموافقة على المصروفات الكبيرة</div>
            <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>عند التفعيل، أي مصروف يضيفه شخص غير Super Admin ويتجاوز الحد المحدد سيظهر في الإنبوكس بانتظار الموافقة</div>
          </div>
          <button onClick={()=>isSuper && saveStoreApproval({ expense_approval_enabled: !approvalEnabled })} disabled={!isSuper}
            style={{width:38,height:22,borderRadius:11,border:"none",background: approvalEnabled?"#16A34A":"#D4D4D4",position:"relative",cursor: isSuper?"pointer":"not-allowed",opacity: isSuper?1:0.6}}>
            <span style={{position:"absolute",top:2,[approvalEnabled?"left":"right"]:2,width:18,height:18,background:"#fff",borderRadius:"50%",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/>
          </button>
        </div>
        {approvalEnabled && (
          <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid #EEE"}}>
            <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>الحد الأدنى للمصروف الذي يتطلب موافقة (ج)</label>
            <input type="text" inputMode="numeric" defaultValue={approvalThreshold}
              onBlur={e => saveStoreApproval({ expense_approval_threshold: Number(e.target.value.replace(/[^0-9.]/g,''))||0 })}
              disabled={!isSuper}
              style={{...inputStyle,maxWidth:240,direction:"ltr",textAlign:"left"}}/>
            <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:5}}>المعتمد: Super Admin فقط</div>
          </div>
        )}
        {!isSuper && (
          <div style={{marginTop:8,fontSize:11.5,color:"#92400E",fontFamily:ui.fontBody,background:"#FFFBEB",padding:"7px 10px",borderRadius:5}}>
            🔒 إعدادات الموافقة تتطلب صلاحية Super Admin
          </div>
        )}
      </div>

      {/* BUDGET ALERTS ────────────────────────────────────────────────────── */}
      {/* Separate from the per-expense approval system above. Monitors total
          spend per category against monthly_budget and fires inbox messages
          at the warning threshold (info) and at 100% (actionable). */}
      <div style={card}>
        <div style={cardTitle}>تنبيهات الميزانية</div>
        <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"6px 0"}}>
          <div>
            <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody}}>تفعيل نظام تنبيهات تجاوز الميزانية</div>
            <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>
              يراقب إجمالي مصروفات كل فئة مقابل ميزانيتها الشهرية ويرسل تنبيهات للـ Super Admin
            </div>
          </div>
          <button onClick={()=>isSuper && saveBudgetAlerts({ budget_alerts_enabled: !budgetAlertsEnabled })} disabled={!isSuper}
            style={{width:38,height:22,borderRadius:11,border:"none",background: budgetAlertsEnabled?"#16A34A":"#D4D4D4",position:"relative",cursor: isSuper?"pointer":"not-allowed",opacity: isSuper?1:0.6}}>
            <span style={{position:"absolute",top:2,[budgetAlertsEnabled?"left":"right"]:2,width:18,height:18,background:"#fff",borderRadius:"50%",boxShadow:"0 1px 2px rgba(0,0,0,.2)"}}/>
          </button>
        </div>
        {budgetAlertsEnabled && (
          <div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid #EEE"}}>
            <label style={{display:"block",fontSize:12,color:ui.text,fontFamily:ui.fontBody,marginBottom:5}}>
              إرسال تحذير عند الوصول إلى ___% من الميزانية
            </label>
            <input type="text" inputMode="numeric" defaultValue={budgetWarningThreshold}
              onBlur={ev => {
                const raw = Number(ev.target.value.replace(/[^0-9.]/g,'')) || 0;
                const clamped = Math.max(1, Math.min(99, raw));
                saveBudgetAlerts({ budget_warning_threshold: clamped });
              }}
              disabled={!isSuper}
              style={{...inputStyle,maxWidth:160,direction:"ltr",textAlign:"left"}}/>
            <span style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginInlineStart:6}}>% (بين 1 و 99)</span>
            <div style={{fontSize:11.5,color:"#9A3412",fontFamily:ui.fontBody,marginTop:8,background:"#FFF7ED",padding:"7px 10px",borderRadius:5,border:"0.5px solid #FED7AA"}}>
              عند تجاوز 100% من الميزانية، يتطلب المصروف موافقة استثنائية من Super Admin مع تسجيل سبب الاستثناء.
            </div>
          </div>
        )}
        {!isSuper && (
          <div style={{marginTop:8,fontSize:11.5,color:"#92400E",fontFamily:ui.fontBody,background:"#FFFBEB",padding:"7px 10px",borderRadius:5}}>
            🔒 إعدادات التنبيهات تتطلب صلاحية Super Admin
          </div>
        )}
      </div>

      {/* SUPPLIERS ───────────────────────────────────────────────────────── */}
      <div style={card}>
        <div style={cardTitle}>الموردين ({sups.length})</div>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:560}}>
            <thead>
              <tr style={{background:ui.sideBg,borderBottom:"0.5px solid #E5E5E5"}}>
                {["الاسم","الهاتف","الإيميل","ملاحظات",""].map(h=>(
                  <th key={h} style={{padding:"10px 12px",textAlign:"right",fontSize:11.5,color:ui.textSub,fontWeight:500}}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sups.map(s => (
                <tr key={s.id} style={{borderTop:"0.5px solid #EEE"}}>
                  <td style={{padding:"8px 12px",fontSize:13,color:ui.text,fontFamily:ui.fontBody}}>{s.name}</td>
                  <td style={{padding:"8px 12px",fontSize:12,color:ui.textSub,fontFamily:"monospace"}}>{s.phone || "—"}</td>
                  <td style={{padding:"8px 12px",fontSize:12,color:ui.textSub,fontFamily:"monospace"}}>{s.email || "—"}</td>
                  <td style={{padding:"8px 12px",fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,maxWidth:240,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.notes || "—"}</td>
                  <td style={{padding:"8px 12px",textAlign:"left"}}>
                    <button onClick={()=>deleteSupplier(s)} style={{background:"transparent",border:"none",color:"#DC2626",cursor:"pointer",fontSize:14}}>×</button>
                  </td>
                </tr>
              ))}
              <tr style={{borderTop:"0.5px solid #EEE",background:"#FAFAFA"}}>
                <td style={{padding:"8px 12px"}}><input style={{...inputStyle,padding:"6px 9px"}} value={supDraft.name} onChange={e=>setSupDraft({...supDraft,name:e.target.value})} placeholder="مورد جديد..."/></td>
                <td style={{padding:"8px 12px"}}><input style={{...inputStyle,padding:"6px 9px",direction:"ltr",textAlign:"left"}} value={supDraft.phone} onChange={e=>setSupDraft({...supDraft,phone:e.target.value})} placeholder="01000000000"/></td>
                <td style={{padding:"8px 12px"}}><input style={{...inputStyle,padding:"6px 9px",direction:"ltr",textAlign:"left"}} value={supDraft.email} onChange={e=>setSupDraft({...supDraft,email:e.target.value})} placeholder="email@..."/></td>
                <td style={{padding:"8px 12px"}}><input style={{...inputStyle,padding:"6px 9px"}} value={supDraft.notes} onChange={e=>setSupDraft({...supDraft,notes:e.target.value})} placeholder="ملاحظات"/></td>
                <td style={{padding:"8px 12px",textAlign:"left"}}>
                  <button onClick={addSupplier} disabled={busy || !supDraft.name.trim()}
                    style={{background: supDraft.name.trim() ? ui.text : "#9CA3AF",color:"#fff",border:"none",padding:"6px 14px",borderRadius:4,fontSize:12,fontFamily:ui.fontBody,cursor: supDraft.name.trim()?"pointer":"not-allowed"}}>إضافة</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Switch toggle for booleans (in_stock / featured / is_best_seller / etc.)
const SwitchToggle = React.memo(function SwitchToggle({ value, onChange, label, disabled, hint, ui }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"8px 0",borderBottom:"0.5px solid #EEE"}}>
      <div>
        <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody}}>{label}</div>
        {hint && <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>{hint}</div>}
      </div>
      <button type="button" onClick={()=>!disabled && onChange(!value)} disabled={disabled}
        style={{ width:38, height:22, borderRadius:11, border:"none",
          background: value ? "#16A34A" : "#D4D4D4", position:"relative",
          cursor: disabled ? "not-allowed" : "pointer", opacity: disabled ? 0.6 : 1, flexShrink:0 }}>
        <span style={{ position:"absolute", top:2, [value?"left":"right"]:2, width:18, height:18,
          background:"#fff", borderRadius:"50%", boxShadow:"0 1px 2px rgba(0,0,0,.2)" }}/>
      </button>
    </div>
  );
});

// ─── Customer category labels + colour palette (shared between list + detail)
const CUST_CAT_LABEL = {
  new:      "جديد",
  regular:  "عميل عادي",
  repeat:   "عميل مكرر",
  vip:      "VIP",
  inactive: "غير نشط",
};
const CUST_CAT_STYLE = {
  new:      { bg: "#DBEAFE", fg: "#1D4ED8" }, // blue
  regular:  { bg: "#F3F4F6", fg: "#525252" }, // gray
  repeat:   { bg: "#CCFBF1", fg: "#0F766E" }, // teal
  vip:      { bg: "#FEF3C7", fg: "#92400E" }, // amber/gold
  inactive: { bg: "#FEE2E2", fg: "#B91C1C" }, // red
};

// ─── CustomerDetailsPage — module-scope to keep input focus on every keystroke
function CustomerDetailsPage({ email, ui, mob, C, isSuper, canManageOrders, onBack, refreshList }) {
  const toast = useToast();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [noteDraft, setNoteDraft] = useState("");
  const [emailOpen, setEmailOpen] = useState(false);
  const [emailDraft, setEmailDraft] = useState({ subject:"", body:"" });
  const [couponOpen, setCouponOpen] = useState(false);
  const [couponDraft, setCouponDraft] = useState({ type:"percent", discount:"10", min_order:"0", max_uses:"1", end_date:"" });
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);

  const load = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const [det, addr] = await Promise.all([
        fetch(`/api/users/${encodeURIComponent(email)}`).then(r => r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))),
        fetch(`/api/addresses/${encodeURIComponent(email)}`).then(r => r.ok ? r.json() : []),
      ]);
      setData(det); setAddresses(Array.isArray(addr) ? addr : []);
    } catch (e) { setError(e.message); }
    setLoading(false);
  }, [email]);
  useEffect(() => { load(); }, [load]);

  const patchCustomer = async (patch) => {
    try {
      const r = await fetch(`/api/users/${encodeURIComponent(email)}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...patch, actor_id: null, actor_name: "Admin" }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      await load(); refreshList && refreshList();
    } catch (e) { alert(`فشل التحديث: ${e.message}`); }
  };

  const addNote = async () => {
    const n = noteDraft.trim();
    if (!n) return;
    try {
      await fetch(`/api/users/${encodeURIComponent(email)}/notes`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ note: n, author_name: "Admin" }),
      });
      setNoteDraft(""); load();
      toast && toast.show("تمت إضافة الملاحظة");
    } catch (e) { alert(`فشل الحفظ: ${e.message}`); }
  };

  const sendEmail = async () => {
    if (!emailDraft.subject.trim() || !emailDraft.body.trim()) { alert("املأ الموضوع والنص."); return; }
    try {
      const r = await fetch(`/api/users/${encodeURIComponent(email)}/email`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ ...emailDraft, actor_name: "Admin" })
      });
      if (!r.ok) { const j = await r.json().catch(()=>({})); throw new Error(j.error || `HTTP ${r.status}`); }
      toast && toast.show("تم إرسال الإيميل");
      setEmailOpen(false); setEmailDraft({ subject:"", body:"" }); load();
    } catch (e) { alert(`فشل الإرسال: ${e.message}`); }
  };

  const createCoupon = async () => {
    try {
      const r = await fetch(`/api/users/${encodeURIComponent(email)}/coupon`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          type: couponDraft.type,
          discount: Number(couponDraft.discount) || 10,
          min_order: Number(couponDraft.min_order) || 0,
          max_uses: Number(couponDraft.max_uses) || 1,
          end_date: couponDraft.end_date || null,
          actor_name: "Admin",
        })
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || `HTTP ${r.status}`);
      toast && toast.show(`تم إنشاء الكوبون ${j.code}`);
      setCouponOpen(false); load();
    } catch (e) { alert(`فشل الإنشاء: ${e.message}`); }
  };

  const handleDelete = async () => {
    setConfirmDel(false);
    try {
      const r = await fetch(`/api/users/${encodeURIComponent(email)}`, { method:"DELETE" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      toast && toast.show("تم حذف العميل");
      refreshList && refreshList();
      onBack && onBack();
    } catch (e) { alert(`فشل الحذف: ${e.message}`); }
  };

  if (loading) return <div style={{padding:40,textAlign:"center",color:ui.textSub,fontFamily:ui.fontBody,fontSize:13}}>...جارٍ التحميل</div>;
  if (error || !data) return (
    <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"40px 22px",textAlign:"center"}}>
      <div style={{fontSize:32,marginBottom:10}}>🔍</div>
      <div style={{fontSize:14,color:ui.text,fontWeight:500,marginBottom:6}}>العميل غير موجود</div>
      <div style={{fontSize:12,color:ui.textSub,marginBottom:14}}>{email}</div>
      <button onClick={onBack} style={{padding:"8px 18px",border:ui.border,borderRadius:6,background:ui.cardBg,fontSize:12.5,color:ui.text,cursor:"pointer"}}>← رجوع للعملاء</button>
    </div>
  );

  // HOTFIX: never trust API arrays — wrap every list in a safe coercion so a
  // malformed/error response can't blank the admin panel with "X.filter is
  // not a function".
  const arr = (v) => Array.isArray(v) ? v : [];
  const { customer: u } = data;
  const orders             = arr(data.orders);
  const notes              = arr(data.notes);
  const activity           = arr(data.activity);
  const favorite_products  = arr(data.favorite_products);
  const initial = ((u.name || u.email || "?")[0] || "?").toUpperCase();
  const tier = CUST_CAT_STYLE[u.category] || CUST_CAT_STYLE.regular;
  const ordersToShow = showAllOrders ? orders : orders.slice(0, 10);
  const returnsCount = orders.filter(o => o.status === "ملغي").length;
  const aov = u.totalOrders ? Math.round(u.totalSpent / u.totalOrders) : 0;
  const phoneDigits = String(u.phone||"").replace(/\D/g,"");
  const waHref = phoneDigits ? `https://wa.me/${phoneDigits.startsWith("20") ? phoneDigits : `20${phoneDigits.replace(/^0+/,"")}`}` : null;
  const fmtDate = (iso) => iso ? new Date(iso).toLocaleString("ar-EG", { dateStyle:"short", timeStyle:"short" }) : "—";

  // Activity icon + label
  const evtIcon = (t) => ({
    registered:"👤", order_placed:"🛒", order_cancelled:"❌", return:"↩", email_sent:"📧",
    coupon_created:"🎫", note_added:"📝", login:"🔑", blocked:"🚫", unblocked:"✓",
    vip_set:"⭐", vip_cleared:"⭐",
  })[t] || "•";
  const evtLabel = (t) => ({
    registered:"التسجيل في الموقع",
    order_placed:"تم وضع طلب",
    order_cancelled:"تم إلغاء طلب",
    return:"تم إنشاء مرتجع",
    email_sent:"تم إرسال إيميل",
    coupon_created:"تم إنشاء كوبون",
    note_added:"تمت إضافة ملاحظة",
    login:"تسجيل دخول",
    blocked:"تم حظر الحساب",
    unblocked:"تم رفع الحظر",
    vip_set:"تم تعليم كـ VIP يدوياً",
    vip_cleared:"تم رفع تعليم VIP",
  })[t] || t;

  const card = { background:ui.cardBg, border:ui.border, borderRadius:ui.radius, padding: mob?"14px":"18px", marginBottom:12 };
  const cardTitle = { fontSize:13, fontWeight:600, color:ui.text, fontFamily:ui.fontBody, marginBottom:12, paddingBottom:8, borderBottom:"0.5px solid #EEE" };

  return (
    <div style={{direction:"rtl"}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"flex-start",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <button onClick={onBack} style={{background:"transparent",border:"none",cursor:"pointer",fontSize:12.5,color:ui.textSub,padding:"4px 0"}}>← العودة للعملاء</button>
          <div style={{display:"flex",alignItems:"center",gap:10,marginTop:4}}>
            <h2 style={{fontSize:20,fontWeight:600,color:ui.text,margin:0}}>{u.name || "—"}</h2>
            <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:tier.bg,color:tier.fg,fontWeight:600}}>{CUST_CAT_LABEL[u.category] || "—"}</span>
            {u.blocked && <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:"#FEE2E2",color:"#B91C1C"}}>محظور</span>}
          </div>
          <div style={{fontSize:12,color:ui.textSub,marginTop:2}}>{u.email}</div>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {waHref && <a href={waHref} target="_blank" rel="noreferrer" style={{padding:"8px 12px",background:"#F0FDF4",border:"1px solid #BBF7D0",borderRadius:6,color:"#15803D",fontSize:12.5,textDecoration:"none"}}>💬 واتساب</a>}
          <button onClick={()=>setEmailOpen(true)} style={{padding:"8px 12px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.text,cursor:"pointer"}}>📧 إيميل</button>
          <button onClick={()=>setCouponOpen(true)} style={{padding:"8px 12px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.text,cursor:"pointer"}}>🎫 كوبون</button>
          {!u.blocked
            ? <button onClick={()=>patchCustomer({ blocked: true })} style={{padding:"8px 12px",background:"transparent",border:"1px solid #FCA5A5",borderRadius:6,fontSize:12.5,color:"#B91C1C",cursor:"pointer"}}>🚫 حظر</button>
            : <button onClick={()=>patchCustomer({ blocked: false })} style={{padding:"8px 12px",background:"transparent",border:"1px solid #BBF7D0",borderRadius:6,fontSize:12.5,color:"#15803D",cursor:"pointer"}}>✓ رفع الحظر</button>}
          {isSuper && (
            <button onClick={()=>patchCustomer({ manual_vip_override: !u.manual_vip_override })}
              style={{padding:"8px 12px",background: u.manual_vip_override ? "#FEF3C7" : "transparent",border: u.manual_vip_override ? "1px solid #FCD34D" : ui.border,borderRadius:6,fontSize:12.5,color: u.manual_vip_override ? "#92400E" : ui.text,cursor:"pointer"}}>
              ⭐ {u.manual_vip_override ? "VIP يدوي ✓" : "تعليم VIP"}
            </button>
          )}
          {isSuper && (
            <button onClick={()=>setConfirmDel(true)} style={{padding:"8px 12px",background:"transparent",border:"1px solid #FCA5A5",borderRadius:6,fontSize:12.5,color:"#B91C1C",cursor:"pointer"}}>🗑 حذف</button>
          )}
        </div>
      </div>

      <div style={{display:"grid",gap:12,gridTemplateColumns: mob ? "1fr" : "2fr 1fr"}}>
        {/* LEFT COLUMN */}
        <div>
          {/* Spending summary — use MetricCardBase directly (module scope).
              We can't use AdminDash's `Metric` binding here because this
              component lives at module scope and has no closure access. */}
          <section style={card}>
            <div style={cardTitle}>ملخص الإنفاق</div>
            <div style={{display:"grid",gridTemplateColumns: mob?"1fr 1fr":"repeat(4,1fr)",gap:10,marginBottom:10}}>
              <MetricCardBase ui={ui} mob={mob} label="إجمالي الإنفاق"   value={(u.totalSpent||0).toLocaleString()} suffix="ج" />
              <MetricCardBase ui={ui} mob={mob} label="عدد الطلبات"      value={u.totalOrders||0} />
              <MetricCardBase ui={ui} mob={mob} label="متوسط قيمة الطلب" value={aov.toLocaleString()} suffix="ج" />
              <MetricCardBase ui={ui} mob={mob} label="عدد المرتجعات"   value={returnsCount} hint={u.totalOrders ? `${Math.round((returnsCount/u.totalOrders)*100)}%` : "—"} />
            </div>
            {(Number(u.store_credit_balance) || 0) > 0 && (
              <div style={{padding:"10px 14px",background:"#F0FDF4",border:"0.5px solid #86EFAC",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"space-between",gap:10,fontFamily:ui.fontBody}}>
                <span style={{fontSize:12.5,color:"#15803D",fontWeight:500}}>💳 رصيد المتجر المتاح</span>
                <span style={{fontSize:15,color:"#15803D",fontWeight:700}}>
                  {Number(u.store_credit_balance).toLocaleString()} <span style={{fontSize:11,fontWeight:400}}>ج</span>
                </span>
              </div>
            )}
          </section>

          {/* Orders */}
          <section style={card}>
            <div style={{...cardTitle,display:"flex",justifyContent:"space-between"}}>
              <span>سجل الطلبات ({orders.length})</span>
              {orders.length > 10 && (
                <button onClick={()=>setShowAllOrders(!showAllOrders)} style={{background:"transparent",border:"none",color:"#1D4ED8",fontSize:12,cursor:"pointer"}}>
                  {showAllOrders ? "عرض أقل" : `عرض كل الطلبات (${orders.length})`}
                </button>
              )}
            </div>
            {orders.length === 0 ? (
              <div style={{padding:"22px 8px",textAlign:"center",color:ui.textSub,fontSize:13}}>لم يقم بأي طلب بعد</div>
            ) : (
              <div style={{overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,fontSize:12.5,minWidth:600}}>
                  <thead>
                    <tr style={{background:ui.sideBg}}>
                      {["#","التاريخ","المنتجات","الإجمالي","الدفع","الحالة",""].map(h => (
                        <th key={h} style={{padding:"8px 10px",textAlign:"right",fontSize:11,color:ui.textSub,fontWeight:500}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {ordersToShow.map(o => (
                      <tr key={o.id} style={{borderTop:"0.5px solid #EEE"}}>
                        <td style={{padding:"8px 10px",fontFamily:"monospace",fontSize:12}}>#{o.order_number || o.id}</td>
                        <td style={{padding:"8px 10px",color:ui.textSub}}>{o.date || "—"}</td>
                        <td style={{padding:"8px 10px"}}>{(o.items||[]).length}</td>
                        <td style={{padding:"8px 10px",fontWeight:500}}>{(o.total||0).toLocaleString()} ج</td>
                        <td style={{padding:"8px 10px",color:ui.textSub}}>{o.payment_method === "cash" ? "كاش" : o.payment_method === "visa" ? "فيزا" : o.payment_method === "wallet" ? "محفظة" : "—"}</td>
                        <td style={{padding:"8px 10px"}}><span style={{fontSize:10.5,padding:"2px 8px",borderRadius:10,background:"#F3F4F6"}}>{o.status}</span></td>
                        <td style={{padding:"8px 10px"}}>
                          <a href={`#admin/orders/${encodeURIComponent(o.id)}`} style={{color:"#1D4ED8",textDecoration:"none",fontSize:12}}>عرض</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {/* Favorite products */}
          <section style={card}>
            <div style={cardTitle}>المنتجات المفضلة</div>
            {favorite_products.length === 0 ? (
              <div style={{padding:"14px 0",color:ui.textSub,fontSize:12.5,textAlign:"center"}}>لا توجد بيانات كافية</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {favorite_products.map((p,i) => (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"6px 0",borderTop: i ? "0.5px solid #EEE" : "none"}}>
                    <div style={{width:36,height:36,borderRadius:6,overflow:"hidden",background:"#F3F4F6",flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16}}>
                      {p.img ? <img src={p.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : "🧴"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13,color:ui.text,fontWeight:500,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{p.name}</div>
                      <div style={{fontSize:11,color:ui.textSub,marginTop:2}}>طلب {p.qty} مرة · إجمالي {p.rev.toLocaleString()} ج</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Activity timeline */}
          <section style={card}>
            <div style={cardTitle}>سجل النشاط</div>
            {activity.length === 0 ? (
              <div style={{padding:"14px 0",color:ui.textSub,fontSize:12.5,textAlign:"center"}}>لا توجد أحداث</div>
            ) : (
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",top:6,bottom:6,insetInlineStart:9,width:2,background:"#E5E7EB"}}/>
                {activity.map((a,i) => (
                  <div key={a.id} style={{position:"relative",paddingInlineStart:28,paddingBottom:12}}>
                    <div style={{position:"absolute",insetInlineStart:0,top:2,width:20,height:20,borderRadius:"50%",background:"#fff",border:"2px solid #E5E7EB",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11}}>{evtIcon(a.event_type)}</div>
                    <div style={{fontSize:13,color:ui.text,fontWeight:500}}>{evtLabel(a.event_type)}</div>
                    <div style={{fontSize:11,color:ui.textSub,marginTop:2}}>
                      {a.actor_name || "النظام"} · {fmtDate(a.created_at)}
                      {a.event_data && a.event_data.order_number && ` · #${a.event_data.order_number} (${(a.event_data.total||0).toLocaleString()} ج)`}
                      {a.event_data && a.event_data.subject && ` · ${a.event_data.subject}`}
                      {a.event_data && a.event_data.code    && ` · ${a.event_data.code}`}
                      {a.event_data && a.event_data.preview && ` · "${a.event_data.preview}..."`}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Internal notes */}
          <section style={card}>
            <div style={cardTitle}>ملاحظات داخلية ({notes.length})</div>
            <div style={{display:"flex",gap:8,marginBottom:12}}>
              <textarea value={noteDraft} onChange={e=>setNoteDraft(e.target.value)}
                placeholder="ملاحظة جديدة (تظهر للأدمن فقط)..."
                rows={2}
                style={{flex:1,padding:"9px 11px",border:ui.border,borderRadius:6,fontSize:13,direction:"rtl",resize:"vertical",minHeight:44,fontFamily:ui.fontBody,boxSizing:"border-box"}}/>
              <button onClick={addNote} disabled={!noteDraft.trim()}
                style={{padding:"0 18px",background: noteDraft.trim() ? ui.text : "#9CA3AF",color:"#fff",border:"none",borderRadius:6,fontSize:13,cursor: noteDraft.trim()?"pointer":"not-allowed",whiteSpace:"nowrap"}}>إضافة</button>
            </div>
            {notes.length === 0 ? (
              <div style={{padding:"10px 0",color:ui.textSub,fontSize:12,textAlign:"center"}}>لا توجد ملاحظات بعد</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {notes.map(n => (
                  <div key={n.id} style={{padding:"10px 12px",background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:6}}>
                    <div style={{fontSize:13,color:"#7C2D12",lineHeight:1.7,whiteSpace:"pre-wrap"}}>{n.note}</div>
                    <div style={{fontSize:11,color:"#92400E",marginTop:5}}>{n.author_name || "—"} · {fmtDate(n.created_at)}</div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Customer info */}
          <section style={card}>
            <div style={cardTitle}>معلومات العميل</div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"center",gap:8,paddingBottom:12,borderBottom:"0.5px solid #EEE",marginBottom:12}}>
              <div style={{width:72,height:72,borderRadius:"50%",background:tier.bg,color:tier.fg,display:"flex",alignItems:"center",justifyContent:"center",fontSize:28,fontWeight:600}}>{initial}</div>
              <div style={{fontSize:14,color:ui.text,fontWeight:500}}>{u.name || "—"}</div>
            </div>
            <DetailRow label="البريد"      value={u.email} copyable />
            <DetailRow label="الهاتف"      value={u.phone || "—"} copyable={!!u.phone} ltr />
            <DetailRow label="تاريخ الميلاد" value={u.date_of_birth || "—"} />
            <DetailRow label="النوع"       value={u.gender || "—"} />
            <DetailRow label="التسجيل"      value={fmtDate(u.registered_at || u.firstOrder)} />
            <DetailRow label="آخر دخول"     value={u.last_login_date ? fmtDate(u.last_login_date) : "—"} />
          </section>

          {/* Addresses */}
          <section style={card}>
            <div style={cardTitle}>العناوين المحفوظة ({addresses.length})</div>
            {addresses.length === 0 ? (
              <div style={{padding:"10px 0",color:ui.textSub,fontSize:12,textAlign:"center"}}>لا توجد عناوين</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {addresses.map(a => (
                  <div key={a.id} style={{padding:"10px 12px",border: a.isDefault ? `1.5px solid ${C.go}` : ui.border,borderRadius:6,fontSize:12.5,position:"relative"}}>
                    {a.isDefault && <span style={{position:"absolute",top:6,insetInlineEnd:6,background:C.go,color:"#fff",fontSize:9,padding:"2px 7px",borderRadius:3}}>افتراضي</span>}
                    <div style={{fontWeight:500,color:ui.text,marginBottom:4}}>{a.fullName || u.name || "—"}</div>
                    <div style={{color:ui.textSub,lineHeight:1.7}}>
                      {[a.street, a.building, a.district].filter(Boolean).join("، ")}<br/>
                      {a.city ? `${a.city}، ` : ""}{a.governorate || ""}
                      {a.lat && a.lng && (
                        <a href={`https://www.google.com/maps?q=${a.lat},${a.lng}`} target="_blank" rel="noreferrer"
                          style={{display:"block",color:"#1D4ED8",textDecoration:"none",marginTop:4,fontSize:11}}>
                          🗺 {Number(a.lat).toFixed(4)}, {Number(a.lng).toFixed(4)}
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Preferences */}
          <section style={card}>
            <div style={cardTitle}>التفضيلات</div>
            <DetailRow label="اللغة المفضلة"     value={u.preferred_lang === "en" ? "English" : "العربية"} />
            <DetailRow label="إيميلات تسويقية"   value={u.marketing_emails_enabled ? "مفعّل" : "موقوف"} />
            <DetailRow label="إشعارات واتساب"    value={u.whatsapp_notifications_enabled ? "مفعّل" : "موقوف"} />
          </section>

          {/* Account status */}
          <section style={card}>
            <div style={cardTitle}>حالة الحساب</div>
            <DetailRow label="الحالة" value={u.blocked ? "محظور" : "نشط"} valueColor={u.blocked ? "#B91C1C" : "#15803D"} />
            <DetailRow label="التحقق من الإيميل" value="—" />
            <DetailRow label="التحقق من الهاتف"  value="—" />
            <DetailRow label="VIP يدوي" value={u.manual_vip_override ? "نعم" : "لا"} />
          </section>
        </div>
      </div>

      {/* Email modal */}
      {emailOpen && (
        <div onClick={()=>setEmailOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:ui.cardBg,maxWidth:480,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
            <h3 style={{fontSize:15,fontWeight:600,color:ui.text,margin:"0 0 4px"}}>إرسال إيميل</h3>
            <div style={{fontSize:12.5,color:ui.textSub,marginBottom:12}}>إلى {u.email}</div>
            <input value={emailDraft.subject} onChange={e=>setEmailDraft({...emailDraft, subject:e.target.value})}
              placeholder="الموضوع" style={{width:"100%",padding:"9px 11px",border:ui.border,borderRadius:6,fontSize:13,marginBottom:10,boxSizing:"border-box",direction:"rtl"}}/>
            <textarea rows={8} value={emailDraft.body} onChange={e=>setEmailDraft({...emailDraft, body:e.target.value})}
              placeholder={`أهلاً ${u.name || u.email},\n\n...`} style={{width:"100%",padding:"9px 11px",border:ui.border,borderRadius:6,fontSize:13,resize:"vertical",minHeight:160,boxSizing:"border-box",direction:"rtl",fontFamily:ui.fontBody}}/>
            <div style={{fontSize:11,color:ui.textSub,marginTop:4}}>متاح: {`{{customer_name}}, {{order_count}}, {{total_spent}}`}</div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
              <button onClick={()=>setEmailOpen(false)} style={{padding:"8px 16px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.textSub,cursor:"pointer"}}>إلغاء</button>
              <button onClick={sendEmail} style={{padding:"8px 18px",background:ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:12.5,fontWeight:500,cursor:"pointer"}}>إرسال</button>
            </div>
          </div>
        </div>
      )}

      {/* Coupon modal */}
      {couponOpen && (
        <div onClick={()=>setCouponOpen(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:ui.cardBg,maxWidth:420,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
            <h3 style={{fontSize:15,fontWeight:600,color:ui.text,margin:"0 0 12px"}}>كوبون خاص بهذا العميل</h3>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:10}}>
              <div><label style={{fontSize:11.5,color:ui.textSub,display:"block",marginBottom:4}}>النوع</label>
                <select value={couponDraft.type} onChange={e=>setCouponDraft({...couponDraft, type:e.target.value})} style={{width:"100%",padding:"7px 10px",border:ui.border,borderRadius:6,fontSize:12.5}}>
                  <option value="percent">نسبة %</option>
                  <option value="fixed">مبلغ ثابت</option>
                  <option value="free_shipping">شحن مجاني</option>
                </select>
              </div>
              <div><label style={{fontSize:11.5,color:ui.textSub,display:"block",marginBottom:4}}>القيمة</label>
                <input value={couponDraft.discount} onChange={e=>setCouponDraft({...couponDraft, discount:e.target.value.replace(/[^0-9.]/g,"")})}
                  style={{width:"100%",padding:"7px 10px",border:ui.border,borderRadius:6,fontSize:12.5,direction:"rtl",boxSizing:"border-box"}} inputMode="decimal"/></div>
              <div><label style={{fontSize:11.5,color:ui.textSub,display:"block",marginBottom:4}}>حد أدنى للطلب</label>
                <input value={couponDraft.min_order} onChange={e=>setCouponDraft({...couponDraft, min_order:e.target.value.replace(/[^0-9.]/g,"")})}
                  style={{width:"100%",padding:"7px 10px",border:ui.border,borderRadius:6,fontSize:12.5,direction:"rtl",boxSizing:"border-box"}} inputMode="decimal"/></div>
              <div><label style={{fontSize:11.5,color:ui.textSub,display:"block",marginBottom:4}}>عدد مرات الاستخدام</label>
                <input value={couponDraft.max_uses} onChange={e=>setCouponDraft({...couponDraft, max_uses:e.target.value.replace(/[^0-9]/g,"")})}
                  style={{width:"100%",padding:"7px 10px",border:ui.border,borderRadius:6,fontSize:12.5,direction:"rtl",boxSizing:"border-box"}} inputMode="numeric"/></div>
            </div>
            <div><label style={{fontSize:11.5,color:ui.textSub,display:"block",marginBottom:4}}>تاريخ انتهاء (اختياري)</label>
              <input type="date" value={couponDraft.end_date} onChange={e=>setCouponDraft({...couponDraft, end_date:e.target.value})}
                style={{width:"100%",padding:"7px 10px",border:ui.border,borderRadius:6,fontSize:12.5,direction:"ltr",boxSizing:"border-box"}}/></div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:14}}>
              <button onClick={()=>setCouponOpen(false)} style={{padding:"8px 16px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.textSub,cursor:"pointer"}}>إلغاء</button>
              <button onClick={createCoupon} style={{padding:"8px 18px",background:ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:12.5,fontWeight:500,cursor:"pointer"}}>إنشاء الكوبون</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirmation */}
      {confirmDel && (
        <div onClick={()=>setConfirmDel(false)} style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
          <div onClick={e=>e.stopPropagation()} style={{background:ui.cardBg,maxWidth:420,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
            <h3 style={{fontSize:15,fontWeight:600,color:ui.text,margin:"0 0 4px"}}>حذف العميل نهائياً</h3>
            <div style={{fontSize:13,color:ui.textSub,marginBottom:14}}>سيتم حذف <b style={{color:ui.text}}>{u.name || u.email}</b>، عناوينه، ملاحظاته، وسجل نشاطه. لا يمكن التراجع.</div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setConfirmDel(false)} style={{padding:"8px 16px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.textSub,cursor:"pointer"}}>تراجع</button>
              <button onClick={handleDelete} style={{padding:"8px 18px",background:"#DC2626",color:"#fff",border:"none",borderRadius:6,fontSize:12.5,cursor:"pointer"}}>تأكيد الحذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tiny label/value row for the customer details sidebar.
function DetailRow({ label, value, copyable, ltr, valueColor }) {
  const [copied, setCopied] = useState(false);
  return (
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"7px 0",borderBottom:"0.5px solid #F3F4F6"}}>
      <span style={{fontSize:11.5,color:"#6B7280",fontFamily:"inherit"}}>{label}</span>
      <div style={{display:"flex",alignItems:"center",gap:6}}>
        <span style={{fontSize:12.5,color: valueColor || "#1A1A1A",direction: ltr?"ltr":"rtl",wordBreak:"break-all",textAlign:"left"}}>{value}</span>
        {copyable && value && value !== "—" && (
          <button onClick={async ()=>{ try { await navigator.clipboard.writeText(String(value)); setCopied(true); setTimeout(()=>setCopied(false),1200); } catch {} }}
            title="نسخ" style={{background:"transparent",border:"none",cursor:"pointer",padding:0,fontSize:12,color:"#6B7280"}}>
            {copied ? "✓" : "📋"}
          </button>
        )}
      </div>
    </div>
  );
}

// ─── Product Row Menu (3-dots menu in admin Products list) ───────────────────
// Tiny popover with تكرار / حذف / أرشفة actions. Closing on outside click
// is handled by a transparent full-screen overlay div behind the menu.
function ProductRowMenu({ product, ui, isSuper, onDuplicate, onArchive, onDelete }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{position:"relative"}}>
      <button onClick={()=>setOpen(o=>!o)}
        title="المزيد"
        style={{background:"transparent",border:ui.border,padding:"5px 8px",cursor:"pointer",borderRadius:5,fontSize:13}}>⋯</button>
      {open && (
        <>
          <div onClick={()=>setOpen(false)} style={{position:"fixed",inset:0,zIndex:30}}/>
          <div style={{position:"absolute",top:"100%",insetInlineEnd:0,marginTop:4,zIndex:31,
            background:ui.cardBg,border:ui.border,borderRadius:6,boxShadow:"0 4px 14px rgba(0,0,0,.08)",minWidth:140,overflow:"hidden"}}>
            <button onClick={()=>{ setOpen(false); onDuplicate && onDuplicate(); }}
              style={{display:"block",width:"100%",textAlign:"right",padding:"8px 14px",fontSize:12.5,
                background:"transparent",border:"none",cursor:"pointer",color:ui.text,fontFamily:ui.fontBody}}>تكرار</button>
            <button onClick={()=>{ setOpen(false); onArchive && onArchive(); }}
              style={{display:"block",width:"100%",textAlign:"right",padding:"8px 14px",fontSize:12.5,
                background:"transparent",border:"none",cursor:"pointer",color:ui.text,fontFamily:ui.fontBody,
                borderTop:"0.5px solid #EEE"}}>أرشفة</button>
            <button onClick={()=>{ setOpen(false); onDelete && onDelete(); }}
              style={{display:"block",width:"100%",textAlign:"right",padding:"8px 14px",fontSize:12.5,
                background:"transparent",border:"none",cursor:"pointer",color:"#DC2626",fontFamily:ui.fontBody,
                borderTop:"0.5px solid #EEE"}}>
              {isSuper ? "حذف" : "طلب حذف"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── ProductForm — shared by /admin/products/new and /admin/products/:id/edit ─
// Big multi-card form. Most internal state lives here so AdminDash doesn't get
// re-rendered on every keystroke. Validation runs on demand (publish blocks on
// errors; draft never blocks). The right-side preview re-renders live.
function ProductForm({
  mode, productId, ui, mob, C,
  categories, allTags, allBrands,
  canEditAll, canSeeCost, isSuper,
  onBack, onSaved, onDeleted, submitApproval,
}) {
  const ADD = mode === "new";
  const toast = useToast(); // global toast — confirms save/publish/delete
  const blank = () => ({
    name:        { ar: "", en: "" },
    description: { ar: "", en: "" },
    ingredients: { ar: "", en: "" },
    usage:       { ar: "", en: "" },
    seo_title:        { ar: "", en: "" },
    seo_description:  { ar: "", en: "" },
    category: categories[0] || "",
    brand:    "",
    size:     "",
    slug:     "",
    images:   [],
    sku:      "",
    price:        "",
    price_before: "",
    cost:         "",
    // weight_kg: per-unit shipping weight; defaults to the new schema default (0.3 kg)
    // for newly-created products. Existing rows take the value loaded from the
    // server when editing (see the hydration path below).
    weight_kg:    "0.3",
    stock:           "0",
    alert_threshold: "5",
    status:    "draft",
    in_stock:  true,
    featured:  false,
    is_best_seller: false,
    publish_at: "",
    has_variants: false,
    variants: [],   // [{ size, price, price_before, stock, sku }]
    tags: [],
  });

  const [f, setF] = useState(blank);
  const [errors, setErrors] = useState({});             // field → message
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);       // { kind, text }
  const [loading, setLoading] = useState(!ADD);
  const [original, setOriginal] = useState(null);       // for dirty check
  const [autoSavedAt, setAutoSavedAt] = useState(null); // Date | null
  const [slugStatus, setSlugStatus] = useState("idle"); // idle | checking | ok | taken | invalid
  const [confirmDel, setConfirmDel] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [tagDraft, setTagDraft] = useState("");
  const [dragIdx, setDragIdx] = useState(null);
  const [showCatNew, setShowCatNew] = useState(false);

  // useCallback so child components (Bilingual, SwitchToggle) wrapped in
  // React.memo can actually short-circuit re-renders.
  const update = useCallback((patch) => setF(prev => ({ ...prev, ...patch })), []);
  const setBilingual = useCallback((key, side, value) =>
    setF(prev => ({ ...prev, [key]: { ...prev[key], [side]: value } })), []);

  // (slugifyClient lives at module scope — see top of file.)
  const slugify = slugifyClient;
  const [slugTouched, setSlugTouched] = useState(false);

  // Auto-suggest SKU from brand + name (only in add mode, only when empty).
  const suggestSku = () => {
    if (!ADD) return;
    if (f.sku) return;
    const b = (f.brand || "NWR").replace(/[^A-Za-z0-9]+/g,"").slice(0,4).toUpperCase() || "NWR";
    const n = (f.name.ar || "PROD").replace(/[^A-Za-z0-9]+/g,"").slice(0,4).toUpperCase() || "PROD";
    update({ sku: `${b}-${n}` });
  };

  // ── Load existing product when editing ────────────────────────────────────
  useEffect(() => {
    if (ADD || !productId) return;
    let cancelled = false;
    setLoading(true);
    (async () => {
      try {
        const r = await fetch(`/api/products/${encodeURIComponent(productId)}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const p = await r.json();
        if (cancelled) return;
        const filled = {
          name:        p.name_i18n        || { ar: p.name||"", en: "" },
          description: p.description_i18n || { ar: p.description||"", en: "" },
          ingredients: p.ingredients_i18n || { ar: p.ingredients||"", en: "" },
          usage:       p.usage_i18n       || { ar: p.usage_text||"",  en: "" },
          seo_title:        p.seo_title_i18n       || { ar: p.seo_title||"", en: "" },
          seo_description:  p.seo_description_i18n || { ar: p.seo_description||"", en: "" },
          category: p.category || categories[0] || "",
          brand:    p.brand || "",
          size:     p.size || "",
          slug:     p.slug || "",
          images:   Array.isArray(p.images) ? p.images : [],
          sku:      p.sku || "",
          price:        p.price != null ? String(p.price) : "",
          price_before: p.price_before ? String(p.price_before) : "",
          cost:         p.cost ? String(p.cost) : "",
          weight_kg:    p.weight_kg != null ? String(p.weight_kg) : "0.3",
          stock:           String(p.stock || 0),
          alert_threshold: String(p.alert_threshold || 5),
          status:    p.status || "draft",
          in_stock:  !!p.in_stock,
          featured:  !!p.featured,
          is_best_seller: !!p.is_best_seller,
          publish_at: p.publish_at || "",
          has_variants: !!p.has_variants,
          variants: (p.variants || []).map(v => ({
            size: v.size||"", price: String(v.price||""), price_before: String(v.price_before||""),
            stock: String(v.stock||0), sku: v.sku||"",
          })),
          tags: Array.isArray(p.tags) ? p.tags : [],
        };
        setF(filled);
        setOriginal(JSON.stringify(filled));
        setSlugTouched(true); // existing slug — don't auto-overwrite
      } catch (e) {
        setFeedback({ kind:"err", text:`فشل تحميل المنتج: ${e.message}` });
      } finally { if (!cancelled) setLoading(false); }
    })();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  // ── Validation ────────────────────────────────────────────────────────────
  const validate = (publishing) => {
    const e = {};
    if (!f.name.ar.trim()) e.name = "اسم المنتج (عربي) مطلوب";
    if (!f.category)       e.category = "اختر فئة";
    if (publishing) {
      if (!f.price || Number(f.price) <= 0) e.price = "السعر مطلوب للنشر";
      if ((f.images || []).length === 0)    e.images = "أضف صورة واحدة على الأقل قبل النشر";
    }
    if (f.slug && slugify(f.slug) !== f.slug.toLowerCase()) e.slug = "Slug غير صالح";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── Slug uniqueness — checked on blur ────────────────────────────────────
  const checkSlug = async () => {
    if (!f.slug) { setSlugStatus("idle"); return; }
    setSlugStatus("checking");
    try {
      const params = new URLSearchParams({ slug: f.slug });
      if (!ADD && productId) params.set("exclude", productId);
      const r = await fetch(`/api/products/slug-check?${params}`);
      const j = await r.json();
      setSlugStatus(j.available ? "ok" : j.error ? "invalid" : "taken");
      if (j.slug && j.slug !== f.slug && j.available) update({ slug: j.slug });
    } catch { setSlugStatus("idle"); }
  };

  // ── Image upload ──────────────────────────────────────────────────────────
  const uploadOne = async (file) => {
    if (file.size > 3 * 1024 * 1024) throw new Error(`${file.name}: أكبر من 3MB`);
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) throw new Error(`${file.name}: jpg/png/webp فقط`);
    const fd = new FormData();
    fd.append("image", file);
    return await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/products/upload-image");
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setUploadPct(Math.round(e.loaded / e.total * 100));
      };
      xhr.onload = () => {
        try { const j = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300) resolve(j);
          else reject(new Error(j.error || `HTTP ${xhr.status}`));
        } catch (err) { reject(err); }
      };
      xhr.onerror = () => reject(new Error("network error"));
      xhr.send(fd);
    });
  };

  const handleFiles = async (fileList) => {
    const files = Array.from(fileList || []);
    if (!files.length) return;
    setUploading(true); setUploadPct(0); setErrors(e => ({ ...e, images: undefined }));
    const added = [];
    const fails = [];
    for (const file of files) {
      try {
        // eslint-disable-next-line no-await-in-loop
        const j = await uploadOne(file);
        added.push(j.url);
      } catch (e) { fails.push(e.message); }
    }
    if (added.length) update({ images: [...f.images, ...added] });
    if (fails.length) setFeedback({ kind:"err", text: fails.join(" — ") });
    setUploading(false); setUploadPct(0);
  };

  const removeImage = (i) => update({ images: f.images.filter((_, j) => j !== i) });
  const moveImage   = (from, to) => {
    if (to < 0 || to >= f.images.length) return;
    const arr = f.images.slice();
    const [it] = arr.splice(from, 1);
    arr.splice(to, 0, it);
    update({ images: arr });
  };

  // ── Tags ──────────────────────────────────────────────────────────────────
  const addTag = (t) => {
    const v = String(t || "").trim();
    if (!v) return;
    if (f.tags.includes(v)) return;
    update({ tags: [...f.tags, v] });
    setTagDraft("");
  };
  const tagSuggestions = tagDraft
    ? (allTags || []).filter(t => t.toLowerCase().includes(tagDraft.toLowerCase()) && !f.tags.includes(t)).slice(0, 6)
    : [];

  // ── Variants ──────────────────────────────────────────────────────────────
  const addVariant = () => update({ variants: [...f.variants, { size:"", price:"", price_before:"", stock:"0", sku:"" }] });
  const updateVariant = (i, patch) => update({ variants: f.variants.map((v, j) => j===i ? { ...v, ...patch } : v) });
  const removeVariant = (i)         => update({ variants: f.variants.filter((_, j) => j !== i) });

  // ── Save ──────────────────────────────────────────────────────────────────
  const buildBody = (overrideStatus) => ({
    name_i18n:        f.name,
    description_i18n: f.description,
    ingredients_i18n: f.ingredients,
    usage_i18n:       f.usage,
    seo_title_i18n:       f.seo_title,
    seo_description_i18n: f.seo_description,
    category: f.category,
    brand:    f.brand,
    size:     f.size,
    slug:     f.slug || undefined,
    images:   f.images,
    sku:      f.sku || undefined,
    price:        Number(f.price)||0,
    price_before: Number(f.price_before)||0,
    cost:         Number(f.cost)||0,
    weight_kg:    Number(f.weight_kg)||0,   // 0 means "use shipping_default_product_weight" at calc time
    stock:           Number(f.stock)||0,
    alert_threshold: Number(f.alert_threshold)||5,
    status:    overrideStatus || f.status,
    in_stock:  !!f.in_stock,
    featured:  !!f.featured,
    is_best_seller: !!f.is_best_seller,
    publish_at: f.publish_at || null,
    has_variants: !!f.has_variants,
    variants: f.has_variants ? f.variants.map(v => ({
      size: v.size, price: Number(v.price)||0, price_before: Number(v.price_before)||0,
      stock: Number(v.stock)||0, sku: v.sku,
    })) : [],
    tags: f.tags,
  });

  // Save with an explicit target status — the caller decides whether we're
  // saving a draft, publishing, or unpublishing. Validation only blocks when
  // the target is "published" (drafts can always save mid-edit).
  // `intent` is one of: "save-draft" | "publish" | "save-edits" | "unpublish"
  const persist = async (targetStatus, intent) => {
    const mustValidate = targetStatus === "published";
    if (mustValidate && !validate(true)) {
      setFeedback({ kind:"err", text:"يوجد أخطاء بالنموذج — راجع الحقول المعلمة" });
      return;
    }
    setSaving(true); setFeedback(null);
    try {
      const url = ADD ? "/api/products" : `/api/products/${encodeURIComponent(productId)}`;
      const method = ADD ? "POST" : "PATCH";
      const body = buildBody(targetStatus);
      const r = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      if (!r.ok) { const j = await r.json().catch(()=>({})); throw new Error(j.error || `HTTP ${r.status}`); }
      const saved = await r.json();
      // Keep local form state aligned with what the server just persisted
      update({ status: targetStatus });
      setOriginal(JSON.stringify({ ...f, status: targetStatus }));
      setAutoSavedAt(new Date());
      onSaved && onSaved(saved);

      // Success messaging + post-save navigation per intent
      if (intent === "publish") {
        toast && toast.show("تم نشر المنتج بنجاح");
        // Redirect to list when publishing (covers ADD + edit-draft → published)
        onBack && onBack();
        return;
      }
      if (intent === "unpublish") {
        toast && toast.show("تم إلغاء نشر المنتج");
        // Stay on the page — admin probably wants to keep editing
      }
      if (intent === "save-edits") {
        toast && toast.show("تم حفظ التعديلات");
      }
      if (intent === "save-draft") {
        toast && toast.show("تم حفظ المسودة");
        // When this is the very first save of a new product → redirect to
        // /edit so further saves PATCH the existing row.
        if (ADD && saved && saved.id) {
          window.location.hash = `#admin/products/${encodeURIComponent(saved.id)}/edit`;
        }
      }
    } catch (e) {
      setFeedback({ kind:"err", text:`فشل الحفظ: ${e.message}` });
    } finally { setSaving(false); }
  };

  // ── Auto-save (edit mode only) ────────────────────────────────────────────
  // Silent PATCH every 30s when the form is dirty AND currently a draft.
  // Never touches a live product without explicit user action.
  useEffect(() => {
    if (ADD || !productId) return;
    const i = setInterval(() => {
      const dirty = original && JSON.stringify(f) !== original;
      if (dirty && f.status === "draft" && !saving) {
        (async () => {
          try {
            await fetch(`/api/products/${encodeURIComponent(productId)}`, {
              method:"PATCH", headers:{"Content-Type":"application/json"},
              body: JSON.stringify(buildBody(f.status)),
            });
            setOriginal(JSON.stringify(f));
            setAutoSavedAt(new Date());
          } catch {}
        })();
      }
    }, 30000);
    return () => clearInterval(i);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [f, original, ADD, productId]);

  // Warn on leaving with unsaved changes.
  useEffect(() => {
    const h = (e) => {
      const dirty = original && JSON.stringify(f) !== original;
      if (dirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", h);
    return () => window.removeEventListener("beforeunload", h);
  }, [f, original]);

  // numProps / cleanNumInt / cleanNumDec / slugifyClient are defined at module
  // scope (above) so they aren't reallocated per render.

  // ── Styles ────────────────────────────────────────────────────────────────
  const inputStyle = {
    width:"100%", padding:"9px 11px", border:ui.border, borderRadius:6,
    background:ui.cardBg, fontFamily:ui.fontBody, fontSize:13, color:ui.text,
    outline:"none", direction:"rtl", boxSizing:"border-box",
  };
  const errorInput = { ...inputStyle, border:"1px solid #FCA5A5", background:"#FEF2F2" };
  const helperText = { fontSize:11, color:ui.textSub, fontFamily:ui.fontBody, marginTop:4 };
  const labelStyle = { display:"block", fontSize:12, color:ui.text, fontFamily:ui.fontBody, marginBottom:5, fontWeight:500 };
  const card = { background:ui.cardBg, border:ui.border, borderRadius:ui.radius, padding: mob?"14px":"18px", marginBottom:12 };
  const cardTitle = { fontSize:13, fontWeight:600, color:ui.text, fontFamily:ui.fontBody, marginBottom:12, paddingBottom:8, borderBottom:"0.5px solid #EEE" };

  // Bilingual + SwitchToggle live at module scope. The single biggest perf
  // win on this page: stable component identity → React keeps the input
  // mounted and focused across keystrokes. Stable bilingual onChange refs
  // are needed so React.memo can actually skip re-renders of OTHER fields
  // when one field's text changes.
  const onChangeName        = useCallback((side, v) => setBilingual("name",        side, v), [setBilingual]);
  const onChangeDescription = useCallback((side, v) => setBilingual("description", side, v), [setBilingual]);
  const onChangeIngredients = useCallback((side, v) => setBilingual("ingredients", side, v), [setBilingual]);
  const onChangeUsage       = useCallback((side, v) => setBilingual("usage",       side, v), [setBilingual]);
  const onChangeSeoTitle    = useCallback((side, v) => setBilingual("seo_title",        side, v), [setBilingual]);
  const onChangeSeoDesc     = useCallback((side, v) => setBilingual("seo_description", side, v), [setBilingual]);
  const isPublished = f.status === "published";

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return <div style={{padding:40,textAlign:"center",color:ui.textSub,fontFamily:ui.fontBody,fontSize:13}}>...جارٍ التحميل</div>;
  }

  const margin = (() => {
    const p = Number(f.price)||0, c = Number(f.cost)||0;
    if (!p || !c) return null;
    return Math.round(((p - c) / p) * 100);
  })();

  // Live storefront preview ── mimics the public product card.
  const previewImg = f.images[0] || null;
  const previewDiscount = (() => {
    const p = Number(f.price)||0, pb = Number(f.price_before)||0;
    if (!pb || pb <= p) return null;
    return Math.round((1 - p/pb) * 100);
  })();

  const onlyStock = !canEditAll; // inventory_admin can only edit stock
  const disabledStyle = onlyStock ? { opacity:0.55, pointerEvents:"none" } : {};

  return (
    <div style={{direction:"rtl"}}>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div>
          <button onClick={onBack}
            style={{background:"transparent",border:"none",cursor:"pointer",fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,padding:"4px 0"}}>
            ← العودة للمنتجات
          </button>
          <h2 style={{fontSize:18,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"4px 0 2px"}}>
            {ADD ? "إضافة منتج جديد" : "تعديل المنتج"}
          </h2>
          <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>
            {ADD ? "أدخل بيانات المنتج للنشر في المتجر" : (f.name.ar || "—")}
          </div>
        </div>
        <div style={{display:"flex",gap:8,alignItems:"center",flexWrap:"wrap"}}>
          {!ADD && autoSavedAt && (
            <span style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody}}>
              تم الحفظ تلقائياً • {autoSavedAt.toLocaleTimeString("ar-EG", { hour:"2-digit", minute:"2-digit" })}
            </span>
          )}
          {!ADD && isSuper && (
            <button onClick={()=>setConfirmDel(true)} type="button"
              style={{padding:"8px 14px",background:"transparent",border:"1px solid #FCA5A5",borderRadius:6,
                color:"#B91C1C",fontFamily:ui.fontBody,fontSize:12.5,cursor:"pointer"}}>
              حذف المنتج
            </button>
          )}
          {!ADD && !isSuper && (
            <button onClick={async ()=>{
              const reason = window.prompt("سبب الحذف:") || "";
              if (!reason) return;
              await submitApproval({ type:"product_delete", target_id: String(productId), target_label: f.name.ar || "منتج", reason });
              setFeedback({ kind:"ok", text:"تم إرسال طلب الحذف للمراجعة من Super Admin" });
            }}
              style={{padding:"8px 14px",background:"transparent",border:"1px solid #FCD34D",borderRadius:6,
                color:"#92400E",fontFamily:ui.fontBody,fontSize:12.5,cursor:"pointer"}}>
              طلب حذف
            </button>
          )}
          {/* Cancel — always present */}
          <button onClick={onBack} type="button"
            style={{padding:"8px 14px",background:"transparent",border:ui.border,borderRadius:6,
              fontFamily:ui.fontBody,fontSize:12.5,color:ui.textSub,cursor:"pointer"}}>إلغاء</button>

          {/* Contextual save buttons. Three modes:                              */}
          {/*  - ADD                  : [حفظ كمسودة]  [نشر المنتج]               */}
          {/*  - EDIT (status=draft)  : [حفظ كمسودة]  [نشر المنتج]               */}
          {/*  - EDIT (status=published): [إلغاء النشر]  [حفظ التعديلات]         */}
          {/* The rightmost button is always the obvious primary action.        */}
          {(ADD || f.status === "draft") ? (
            <>
              <button onClick={()=>persist("draft", "save-draft")} disabled={saving} type="button"
                style={{padding:"8px 14px",background:"transparent",border:`1px solid ${ui.text}`,borderRadius:6,
                  fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,cursor:saving?"wait":"pointer"}}>
                حفظ كمسودة
              </button>
              <button onClick={()=>persist("published", "publish")} disabled={saving} type="button"
                style={{padding:"8px 18px",background: saving ? "#9CA3AF" : ui.text,color:"#fff",border:"none",borderRadius:6,
                  fontFamily:ui.fontBody,fontSize:12.5,fontWeight:500,cursor:saving?"wait":"pointer"}}>
                {saving ? "جارٍ الحفظ..." : "نشر المنتج"}
              </button>
            </>
          ) : (
            <>
              <button onClick={()=>persist("draft", "unpublish")} disabled={saving} type="button"
                style={{padding:"8px 14px",background:"transparent",border:"1px solid #FCD34D",borderRadius:6,
                  fontFamily:ui.fontBody,fontSize:12.5,color:"#92400E",cursor:saving?"wait":"pointer"}}>
                إلغاء النشر
              </button>
              <button onClick={()=>persist("published", "save-edits")} disabled={saving} type="button"
                style={{padding:"8px 18px",background: saving ? "#9CA3AF" : ui.text,color:"#fff",border:"none",borderRadius:6,
                  fontFamily:ui.fontBody,fontSize:12.5,fontWeight:500,cursor:saving?"wait":"pointer"}}>
                {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
              </button>
            </>
          )}
        </div>
      </div>

      {feedback && (
        <div style={{padding:"10px 14px",borderRadius:6,marginBottom:12,fontSize:13,fontFamily:ui.fontBody,
          background: feedback.kind==="ok" ? "#DCFCE7" : "#FEE2E2",
          color: feedback.kind==="ok" ? "#15803D" : "#B91C1C",
          border: `0.5px solid ${feedback.kind==="ok" ? "#86EFAC" : "#FCA5A5"}`}}>{feedback.text}</div>
      )}

      {onlyStock && (
        <div style={{padding:"10px 14px",borderRadius:6,marginBottom:12,fontSize:12.5,fontFamily:ui.fontBody,
          background:"#FFFBEB",color:"#92400E",border:"0.5px solid #FDE68A"}}>
          🔒 صلاحيتك تسمح بتعديل المخزون فقط — باقي الحقول معطلة. للتعديل الكامل تواصل مع Super Admin.
        </div>
      )}

      {/* Main grid */}
      <div style={{display:"grid",gap:12,gridTemplateColumns: mob ? "1fr" : "2fr 1fr"}}>
        {/* LEFT COLUMN */}
        <div style={onlyStock ? disabledStyle : {}}>
          {/* CARD 1 — Basic info */}
          <div style={card}>
            <div style={cardTitle}>المعلومات الأساسية</div>
            <Bilingual value={f.name} onChange={onChangeName} label="اسم المنتج *" enWarn publishing={isPublished} ui={ui} inputStyle={inputStyle} labelStyle={labelStyle} />
            {errors.name && <div style={{fontSize:11.5,color:"#DC2626",marginTop:-8,marginBottom:8,fontFamily:ui.fontBody}}>{errors.name}</div>}

            <Bilingual value={f.description} onChange={onChangeDescription} label="الوصف التفصيلي" multiline rows={5} enWarn publishing={isPublished} ui={ui} inputStyle={inputStyle} labelStyle={labelStyle} />
            <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:-8,marginBottom:10}}>
              💡 استخدم سطر فارغ بين الفقرات. القوائم: ابدأ السطر بـ <code>- </code>
            </div>

            <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
              <div>
                <label style={labelStyle}>الفئة *</label>
                {showCatNew ? (
                  <div style={{display:"flex",gap:6}}>
                    <input style={{...inputStyle, flex:1}}
                      autoFocus value={f._newCatDraft || ""}
                      onChange={e=>update({ _newCatDraft: e.target.value })}
                      placeholder="اسم فئة جديدة..."
                      onKeyDown={async e => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const v = (f._newCatDraft || "").trim();
                          if (!v) return;
                          try {
                            const r = await fetch("/api/categories", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify({ name: v }) });
                            if (r.ok) { update({ category: v, _newCatDraft:"" }); setShowCatNew(false); }
                          } catch {}
                        } else if (e.key === "Escape") { setShowCatNew(false); update({ _newCatDraft:"" }); }
                      }}/>
                    <button type="button" onClick={()=>{ setShowCatNew(false); update({ _newCatDraft:"" }); }}
                      style={{padding:"0 12px",background:"transparent",color:ui.textSub,border:ui.border,borderRadius:6,fontSize:18,cursor:"pointer"}}>×</button>
                  </div>
                ) : (
                  <select value={f.category} onChange={e=>{
                      if (e.target.value === "__new__") setShowCatNew(true);
                      else update({ category: e.target.value });
                    }}
                    style={errors.category ? errorInput : inputStyle}>
                    <option value="">اختر فئة...</option>
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    <option value="__new__">+ إضافة فئة جديدة</option>
                  </select>
                )}
                {errors.category && <div style={{fontSize:11.5,color:"#DC2626",marginTop:4,fontFamily:ui.fontBody}}>{errors.category}</div>}
              </div>
              <div>
                <label style={labelStyle}>الماركة</label>
                <input list="prod-brand-list" style={inputStyle} value={f.brand}
                  onChange={e=>update({ brand: e.target.value })}
                  onBlur={suggestSku}
                  placeholder="مثال: THE ORDINARY"/>
                <datalist id="prod-brand-list">
                  {(allBrands||[]).map(b => <option key={b} value={b}/>)}
                </datalist>
              </div>
            </div>

            <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:12}}>
              <div>
                <label style={labelStyle}>الحجم / الوزن</label>
                <input style={inputStyle} value={f.size}
                  onChange={e=>update({ size: e.target.value })}
                  placeholder="مثال: 30ml أو 100g"/>
              </div>
              <div>
                <label style={labelStyle}>URL Slug</label>
                <input style={errors.slug || slugStatus==="taken" || slugStatus==="invalid" ? errorInput : inputStyle}
                  value={f.slug}
                  onChange={e=>{ setSlugTouched(true); update({ slug: e.target.value }); setSlugStatus("idle"); }}
                  onBlur={checkSlug}
                  placeholder={ADD ? "يتم توليده تلقائياً من الاسم" : ""}/>
                <div style={{fontSize:11,fontFamily:ui.fontBody,marginTop:3,
                  color: slugStatus==="ok" ? "#16A34A" : slugStatus==="taken" ? "#DC2626" : slugStatus==="invalid" ? "#DC2626" : ui.textSub}}>
                  {slugStatus==="checking" && "جارٍ التحقق..."}
                  {slugStatus==="ok"       && "✓ متاح"}
                  {slugStatus==="taken"    && "✗ هذا Slug مستخدم بالفعل"}
                  {slugStatus==="invalid"  && "✗ Slug غير صالح"}
                  {slugStatus==="idle" && f.slug && "اضغط خارج الحقل للتحقق"}
                  {!f.slug && ADD && "سيتم توليده من الاسم العربي عند الحفظ"}
                </div>
                {ADD && !slugTouched && f.name.ar && (
                  <button type="button"
                    onClick={()=>{ update({ slug: slugify(f.name.ar) }); setSlugTouched(true); }}
                    style={{background:"none",border:"none",color:"#1D4ED8",cursor:"pointer",fontSize:11,padding:0,marginTop:3,fontFamily:ui.fontBody}}>
                    توليد من الاسم
                  </button>
                )}
              </div>
            </div>

            <Bilingual value={f.ingredients} onChange={onChangeIngredients} label="المكونات"          multiline rows={3} ui={ui} inputStyle={inputStyle} labelStyle={labelStyle}/>
            <Bilingual value={f.usage}       onChange={onChangeUsage}       label="طريقة الاستخدام" multiline rows={3} ui={ui} inputStyle={inputStyle} labelStyle={labelStyle}/>
          </div>

          {/* CARD 2 — Images */}
          <div style={card}>
            <div style={cardTitle}>الصور {f.images.length > 0 && <span style={{color:ui.textSub,fontWeight:400,fontSize:11,marginInlineStart:6}}>({f.images.length})</span>}</div>
            <label htmlFor="prod-form-imgs"
              onDragOver={e=>{ e.preventDefault(); e.currentTarget.style.background="#F0F9FF"; e.currentTarget.style.borderColor="#3B82F6"; }}
              onDragLeave={e=>{ e.currentTarget.style.background="#FAFAFA"; e.currentTarget.style.borderColor="#D4D4D4"; }}
              onDrop={e=>{ e.preventDefault(); e.currentTarget.style.background="#FAFAFA"; e.currentTarget.style.borderColor="#D4D4D4"; handleFiles(e.dataTransfer.files); }}
              style={{display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",
                padding:"24px 16px",border:`1.5px dashed ${errors.images ? "#FCA5A5" : "#D4D4D4"}`,borderRadius:6,
                cursor:"pointer",background: errors.images ? "#FEF2F2" : "#FAFAFA", marginBottom:12,color:ui.textSub,
                transition:"background .15s, border-color .15s"}}>
              <AdmIcon name="plus" size={22}/>
              <span style={{fontSize:13,fontFamily:ui.fontBody,marginTop:6}}>اسحب وأفلت أو اضغط لرفع الصور</span>
              <span style={{fontSize:11,fontFamily:ui.fontBody,marginTop:3,color:"#A3A3A3"}}>jpg / png / webp · الحد الأقصى 3MB لكل صورة</span>
              {uploading && (
                <div style={{width:"100%",maxWidth:240,height:4,background:"#E5E7EB",borderRadius:2,overflow:"hidden",marginTop:10}}>
                  <div style={{width:`${uploadPct}%`,height:"100%",background:"#3B82F6",transition:"width .2s"}}/>
                </div>
              )}
            </label>
            <input id="prod-form-imgs" type="file" multiple accept="image/jpeg,image/png,image/webp"
              style={{display:"none"}} onChange={e=>{ handleFiles(e.target.files); e.target.value=""; }}/>
            {errors.images && <div style={{fontSize:11.5,color:"#DC2626",marginTop:-8,marginBottom:8,fontFamily:ui.fontBody}}>{errors.images}</div>}

            {f.images.length > 0 && (
              <div style={{display:"grid",gridTemplateColumns:"repeat(4, 1fr)",gap:8}}>
                {f.images.map((src, i) => (
                  <div key={src+i}
                    draggable
                    onDragStart={()=>setDragIdx(i)}
                    onDragOver={e=>e.preventDefault()}
                    onDrop={()=>{ if (dragIdx!=null && dragIdx!==i) moveImage(dragIdx, i); setDragIdx(null); }}
                    style={{position:"relative",aspectRatio:"1",borderRadius:6,overflow:"hidden",border: i===0 ? "2px solid #3B82F6" : ui.border,background:"#F3F4F6",cursor:"move"}}>
                    <img src={src} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    {i === 0 && (
                      <span style={{position:"absolute",top:4,insetInlineStart:4,background:"#3B82F6",color:"#fff",fontSize:9,padding:"2px 6px",borderRadius:3,fontFamily:ui.fontBody}}>أساسية</span>
                    )}
                    <button type="button" onClick={()=>removeImage(i)}
                      title="حذف"
                      style={{position:"absolute",top:4,insetInlineEnd:4,width:22,height:22,borderRadius:"50%",
                        background:"rgba(0,0,0,.6)",color:"#fff",border:"none",cursor:"pointer",fontSize:12,lineHeight:1,
                        display:"flex",alignItems:"center",justifyContent:"center"}}>×</button>
                    {i > 0 && (
                      <button type="button" onClick={()=>moveImage(i, 0)}
                        title="جعلها الأساسية"
                        style={{position:"absolute",bottom:4,insetInlineEnd:4,padding:"2px 7px",borderRadius:4,
                          background:"rgba(0,0,0,.6)",color:"#fff",border:"none",cursor:"pointer",fontSize:10,fontFamily:ui.fontBody}}>★</button>
                    )}
                  </div>
                ))}
              </div>
            )}
            {f.images.length > 1 && (
              <div style={{fontSize:11,color:ui.textSub,marginTop:8,fontFamily:ui.fontBody}}>💡 اسحب الصور لإعادة ترتيبها — الصورة الأولى هي الأساسية</div>
            )}
          </div>

          {/* CARD 3 — Variants */}
          <div style={card}>
            <SwitchToggle value={f.has_variants} onChange={v=>update({ has_variants: v, variants: v && f.variants.length===0 ? [{ size:"", price:"", price_before:"", stock:"0", sku:"" }] : f.variants })}
              label="الأحجام (Variants)" hint="عند التفعيل، سيتم تجاهل السعر والمخزون في الشريط الجانبي" ui={ui} />
            {f.has_variants && (
              <div style={{marginTop:12,overflowX:"auto"}}>
                <table style={{width:"100%",borderCollapse:"collapse",direction:"rtl",fontFamily:ui.fontBody,minWidth:560}}>
                  <thead>
                    <tr style={{background:ui.sideBg}}>
                      {["الحجم","السعر","السعر قبل الخصم","الكمية","SKU",""].map(h => (
                        <th key={h} style={{padding:"7px 10px",textAlign:"right",fontSize:11,color:ui.textSub,fontWeight:500}}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {f.variants.map((v, i) => (
                      <tr key={i} style={{borderTop:"0.5px solid #EEE"}}>
                        <td style={{padding:"6px 8px"}}><input style={{...inputStyle,padding:"6px 9px"}} value={v.size} onChange={e=>updateVariant(i, { size:e.target.value })} placeholder="50ml"/></td>
                        <td style={{padding:"6px 8px"}}><input {...numProps("dec")} style={{...inputStyle,padding:"6px 9px"}} value={v.price}        onChange={e=>updateVariant(i, { price: cleanNumDec(e.target.value) })}/></td>
                        <td style={{padding:"6px 8px"}}><input {...numProps("dec")} style={{...inputStyle,padding:"6px 9px"}} value={v.price_before} onChange={e=>updateVariant(i, { price_before: cleanNumDec(e.target.value) })}/></td>
                        <td style={{padding:"6px 8px"}}><input {...numProps("int")} style={{...inputStyle,padding:"6px 9px"}} value={v.stock}        onChange={e=>updateVariant(i, { stock: cleanNumInt(e.target.value) })}/></td>
                        <td style={{padding:"6px 8px"}}><input style={{...inputStyle,padding:"6px 9px",fontFamily:"monospace"}} value={v.sku} onChange={e=>updateVariant(i, { sku:e.target.value })} placeholder="auto"/></td>
                        <td style={{padding:"6px 4px",textAlign:"center"}}>
                          <button type="button" onClick={()=>removeVariant(i)}
                            style={{background:"transparent",border:"none",color:"#DC2626",cursor:"pointer",fontSize:14,padding:4}}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <button type="button" onClick={addVariant}
                  style={{marginTop:8,padding:"7px 14px",background:"transparent",border:ui.border,borderRadius:6,
                    fontFamily:ui.fontBody,fontSize:12,color:ui.text,cursor:"pointer"}}>
                  + إضافة حجم
                </button>
              </div>
            )}
          </div>

          {/* CARD 4 — SEO */}
          <div style={card}>
            <div style={cardTitle}>SEO — تحسين محركات البحث</div>
            <Bilingual value={f.seo_title}       onChange={onChangeSeoTitle} label="عنوان الصفحة (Page Title)" maxLen={60}                          ui={ui} inputStyle={inputStyle} labelStyle={labelStyle}/>
            <Bilingual value={f.seo_description} onChange={onChangeSeoDesc}  label="وصف Meta"                   multiline rows={2} maxLen={160} ui={ui} inputStyle={inputStyle} labelStyle={labelStyle}/>
            {/* Live Google preview */}
            <div style={{marginTop:10,padding:14,border:ui.border,borderRadius:6,background:"#fff"}}>
              <div style={{fontSize:11,color:"#6B7280",fontFamily:ui.fontBody,marginBottom:6}}>معاينة في Google</div>
              <div style={{color:"#1A0DAB",fontSize:17,fontFamily:"Arial, sans-serif",marginBottom:2,
                overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>
                {f.seo_title.ar || f.name.ar || "عنوان الصفحة"}
              </div>
              <div style={{color:"#0E7C28",fontSize:12,fontFamily:"Arial, sans-serif",direction:"ltr",marginBottom:4}}>
                https://nawra.ayoupstudio.tech/#product-{f.slug || "..."}
              </div>
              <div style={{color:"#4D5156",fontSize:13,lineHeight:1.5,fontFamily:"Arial, sans-serif"}}>
                {f.seo_description.ar || f.description.ar?.slice(0,160) || "وصف الصفحة سيظهر هنا..."}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* CARD 1 — Pricing & stock */}
          <div style={card}>
            <div style={cardTitle}>السعر والمخزون</div>
            <div style={onlyStock ? disabledStyle : {}}>
              <div style={{marginBottom:12}}>
                <label style={labelStyle}>السعر الحالي (ج) *</label>
                <input {...numProps("dec")} style={errors.price ? errorInput : inputStyle} value={f.price}
                  onChange={e=>update({ price: cleanNumDec(e.target.value) })}
                  disabled={f.has_variants || onlyStock}/>
                {f.has_variants && <div style={helperText}>السعر مأخوذ من الأحجام</div>}
                {errors.price && <div style={{fontSize:11.5,color:"#DC2626",marginTop:4,fontFamily:ui.fontBody}}>{errors.price}</div>}
              </div>
              <div style={{marginBottom:12}}>
                <label style={labelStyle}>السعر قبل الخصم</label>
                <input {...numProps("dec")} style={inputStyle} value={f.price_before}
                  onChange={e=>update({ price_before: cleanNumDec(e.target.value) })}
                  disabled={f.has_variants || onlyStock}/>
                <div style={helperText}>اتركه فارغاً إن لم يكن هناك خصم</div>
              </div>
              {canSeeCost && (
                <div style={{marginBottom:12}}>
                  <label style={labelStyle}>التكلفة (للحسابات الداخلية)</label>
                  <input {...numProps("dec")} style={inputStyle} value={f.cost}
                    onChange={e=>update({ cost: cleanNumDec(e.target.value) })}/>
                  {margin !== null ? (
                    <div style={{fontSize:11.5,marginTop:4,fontFamily:ui.fontBody,color: margin >= 30 ? "#16A34A" : margin >= 10 ? "#D97706" : "#DC2626"}}>
                      هامش الربح: {margin}%
                    </div>
                  ) : (
                    <div style={helperText}>سعر شراء المنتج — تظهر منه نسبة الربح</div>
                  )}
                </div>
              )}
              {/* Per-unit shipping weight in kilograms. Read by the auto
                  weight-calc on order/checkout: weight × qty summed per line,
                  falls back to settings.store.shipping_default_product_weight
                  when this is 0. Affects shipping fee tier (base + extra/kg). */}
              <div style={{marginBottom:12}}>
                <label style={labelStyle}>وزن الوحدة (كجم)</label>
                <input {...numProps("dec")} style={inputStyle} value={f.weight_kg}
                  onChange={e=>update({ weight_kg: cleanNumDec(e.target.value) })}
                  placeholder="0.3"/>
                <div style={helperText}>يُستخدم لحساب تكلفة الشحن — اتركه 0 لاستخدام الوزن الافتراضي من الإعدادات</div>
              </div>
              <div style={{marginBottom:12}}>
                <label style={labelStyle}>SKU</label>
                <input style={inputStyle} value={f.sku} onChange={e=>update({ sku: e.target.value })}
                  disabled={onlyStock} autoComplete="off"/>
                <div style={helperText}>يتم اقتراحه تلقائياً (BRND-NAME-NNN)</div>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <div>
                <label style={labelStyle}>الكمية المتاحة</label>
                <input {...numProps("int")} style={inputStyle} value={f.stock}
                  onChange={e=>update({ stock: cleanNumInt(e.target.value) })}
                  disabled={f.has_variants}/>
              </div>
              <div style={onlyStock ? disabledStyle : {}}>
                <label style={labelStyle}>حد التنبيه</label>
                <input {...numProps("int")} style={inputStyle} value={f.alert_threshold}
                  onChange={e=>update({ alert_threshold: cleanNumInt(e.target.value) })}
                  disabled={onlyStock}/>
              </div>
            </div>
          </div>

          {/* CARD 2 — Settings */}
          <div style={card}>
            <div style={cardTitle}>الإعدادات</div>
            <div style={onlyStock ? disabledStyle : {}}>
              {/* Publish state is controlled exclusively by the top-right
                  action buttons (نشر المنتج / حفظ التعديلات / إلغاء النشر).
                  Having a duplicate pill here led to confusion + a broken
                  click handler that didn't actually persist. */}
              <SwitchToggle value={f.in_stock}       onChange={v=>update({ in_stock: v })}        label="متاح في المخزون" disabled={onlyStock} ui={ui}/>
              <SwitchToggle value={f.featured}       onChange={v=>update({ featured: v })}        label="منتج مميز"        hint="يظهر في الصفحة الرئيسية" disabled={onlyStock} ui={ui}/>
              <SwitchToggle value={f.is_best_seller} onChange={v=>update({ is_best_seller: v })}  label="الأكثر مبيعاً"    hint="إضافة لأكثر المبيعات يدوياً" disabled={onlyStock} ui={ui}/>
              <div style={{padding:"10px 0",borderBottom:"0.5px solid #EEE"}}>
                <label style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,display:"block",marginBottom:5}}>وقت النشر (اختياري)</label>
                <input type="datetime-local" value={f.publish_at ? f.publish_at.slice(0,16) : ""}
                  onChange={e=>update({ publish_at: e.target.value })}
                  style={{...inputStyle,direction:"ltr"}} disabled={onlyStock}/>
              </div>
            </div>
          </div>

          {/* CARD 3 — Tags */}
          <div style={card}>
            <div style={cardTitle}>الوسوم</div>
            <div style={{display:"flex",gap:6,marginBottom:10,position:"relative"}}>
              <input style={{...inputStyle, flex:1}} value={tagDraft}
                onChange={e=>setTagDraft(e.target.value)}
                onKeyDown={e=>{ if (e.key==="Enter"){ e.preventDefault(); addTag(tagDraft); } }}
                placeholder="بشرة دهنية، مسامات، تفتيح..."
                disabled={onlyStock}/>
              <button type="button" onClick={()=>addTag(tagDraft)} disabled={onlyStock || !tagDraft.trim()}
                style={{padding:"0 14px",background:ui.text,color:"#fff",border:"none",borderRadius:6,fontSize:18,
                  cursor: onlyStock || !tagDraft.trim() ? "not-allowed" : "pointer", opacity: onlyStock || !tagDraft.trim() ? 0.5 : 1}}>+</button>
              {tagSuggestions.length > 0 && (
                <div style={{position:"absolute",top:"100%",insetInlineStart:0,right:0,marginTop:4,zIndex:20,
                  background:ui.cardBg,border:ui.border,borderRadius:6,boxShadow:"0 4px 14px rgba(0,0,0,.08)",maxHeight:160,overflow:"auto"}}>
                  {tagSuggestions.map(t => (
                    <div key={t} onClick={()=>addTag(t)}
                      style={{padding:"7px 12px",cursor:"pointer",fontSize:12.5,color:ui.text,fontFamily:ui.fontBody}}>{t}</div>
                  ))}
                </div>
              )}
            </div>
            {f.tags.length > 0 && (
              <div style={{display:"flex",flexWrap:"wrap",gap:6}}>
                {f.tags.map((t, i) => (
                  <span key={i} style={{display:"inline-flex",alignItems:"center",gap:6,padding:"3px 10px",background:"#F3F4F6",color:ui.text,borderRadius:20,fontSize:11.5,fontFamily:ui.fontBody}}>
                    {t}
                    {!onlyStock && (
                      <button type="button" onClick={()=>update({ tags: f.tags.filter((_, j) => j !== i) })}
                        style={{background:"none",border:"none",cursor:"pointer",color:ui.textSub,fontSize:14,lineHeight:1,padding:0}}>×</button>
                    )}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* CARD 4 — Store preview */}
          <div style={card}>
            <div style={cardTitle}>معاينة في المتجر</div>
            <div style={{background:"#FBF7F4",borderRadius:6,padding:12,direction:"rtl"}}>
              <div style={{background: "#fff", borderRadius:4, overflow:"hidden", border:"1px solid rgba(196,149,106,.13)"}}>
                <div style={{height:160,background:"#F3F4F6",position:"relative"}}>
                  {previewImg
                    ? <img src={previewImg} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                    : <div style={{display:"flex",alignItems:"center",justifyContent:"center",height:"100%",color:"#9CA3AF",fontSize:14,fontFamily:ui.fontBody}}>(لا توجد صورة)</div>}
                  {previewDiscount && (
                    <span style={{position:"absolute",top:8,insetInlineStart:8,background:"#DC2626",color:"#fff",padding:"3px 8px",fontSize:11,fontFamily:ui.fontBody,borderRadius:3,fontWeight:600}}>
                      -{previewDiscount}%
                    </span>
                  )}
                </div>
                <div style={{padding:"12px 14px"}}>
                  {f.brand && <div style={{fontSize:10,letterSpacing:"0.16em",color:C.go,textTransform:"uppercase",fontFamily:ui.fontBody,marginBottom:4}}>{f.brand}</div>}
                  <div style={{fontSize:14,fontWeight:600,color:C.dk,fontFamily:C.fa,marginBottom:6,lineHeight:1.3,
                    overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical"}}>
                    {f.name.ar || "اسم المنتج"}
                  </div>
                  <div style={{display:"flex",alignItems:"baseline",gap:8}}>
                    <span style={{fontSize:16,fontWeight:600,color:C.dk,fontFamily:ui.fontBody}}>{f.price ? Number(f.price).toLocaleString() : "0"} <span style={{fontSize:10,color:C.mu}}>ج</span></span>
                    {f.price_before && Number(f.price_before) > Number(f.price) && (
                      <span style={{fontSize:12,color:C.mu,textDecoration:"line-through",fontFamily:ui.fontBody}}>{Number(f.price_before).toLocaleString()}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {confirmDel && (
        <div onClick={()=>setConfirmDel(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:ui.cardBg,maxWidth:420,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
            <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"0 0 4px"}}>
              تأكيد حذف المنتج
            </h3>
            <div style={{fontSize:13,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:14}}>
              سيتم حذف <b style={{color:ui.text}}>{f.name.ar || "المنتج"}</b> ومعه جميع الأحجام. لا يمكن التراجع.
            </div>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
              <button onClick={()=>setConfirmDel(false)} type="button"
                style={{padding:"8px 16px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,cursor:"pointer"}}>تراجع</button>
              <button onClick={async ()=>{
                setConfirmDel(false);
                try {
                  const r = await fetch(`/api/products/${encodeURIComponent(productId)}`, { method:"DELETE" });
                  if (!r.ok) throw new Error(`HTTP ${r.status}`);
                  toast && toast.show("تم حذف المنتج");
                  onDeleted && onDeleted(); // redirects back to products list
                } catch (e) {
                  setFeedback({ kind:"err", text:`فشل الحذف: ${e.message}` });
                }
              }}
                style={{padding:"8px 18px",background:"#DC2626",color:"#fff",border:"none",borderRadius:6,fontSize:12.5,fontFamily:ui.fontBody,cursor:"pointer"}}>
                تأكيد الحذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Order Detail Page (full-page admin view of one order) ────────────────────
// Replaces the OrderDetailModal in the admin Orders tab. Renders all the
// sections required by the new spec: RTL status stepper, payment info,
// product thumbnails, price breakdown, customer notes, activity timeline,
// action buttons (WhatsApp, email invoice, PDF, print, copy), sticky bottom
// status bar, and a separate Cancel button with confirmation modal.
// ─── SVG chart helpers ───────────────────────────────────────────────────────
// All charts are hand-rolled SVG (zero deps). They're presentation-only:
// the parent computes the data + handles tooltips via <title> children.
// viewBox='0 0 100 H' with preserveAspectRatio='none' means callers size
// the container and the chart scales to fit.

// Multi-line chart — N series sharing a single Y scale. Each series is
// { label, color, values: number[] }. xLabels is parallel to values[].
// Used by section 4-A (revenue/expenses/net profit).
function MultiLineChart({ series, xLabels, height = 160, ui }) {
  const allValues = series.flatMap(s => s.values || []);
  if (!allValues.length) return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:ui.textSub,fontFamily:ui.fontBody,fontSize:12.5}}>لا توجد بيانات</div>;
  const min = Math.min(0, ...allValues);
  const max = Math.max(...allValues);
  const range = (max - min) || 1;
  const n = Math.max(2, xLabels.length);
  const yScale = (v) => 95 - ((v - min) / range) * 85;
  const xScale = (i) => 3 + (i / (n - 1)) * 94;
  // Zero baseline if the data straddles it
  const zeroY = min < 0 && max > 0 ? yScale(0) : null;
  return (
    <div style={{position:"relative"}}>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:"100%",height,direction:"ltr"}}>
        <line x1="0" y1="95" x2="100" y2="95" stroke="#E5E5E5" strokeWidth="0.2"/>
        {zeroY != null && <line x1="0" y1={zeroY} x2="100" y2={zeroY} stroke="#9CA3AF" strokeWidth="0.2" strokeDasharray="0.6,0.6"/>}
        {series.map((s) => {
          const pts = (s.values || []).map((v, i) => `${xScale(i).toFixed(2)},${yScale(v).toFixed(2)}`).join(" ");
          return (
            <g key={s.label}>
              <polyline fill="none" stroke={s.color} strokeWidth="0.9" strokeDasharray={s.dashed ? "1.6,1" : undefined} points={pts}/>
              {(s.values || []).map((v, i) => (
                <circle key={i} cx={xScale(i)} cy={yScale(v)} r="0.9" fill={s.color}>
                  <title>{`${s.label} — ${xLabels[i]}: ${Math.round(v).toLocaleString()} ج`}</title>
                </circle>
              ))}
            </g>
          );
        })}
      </svg>
      {/* x-axis labels — outside the SVG so they don't get scaled awkwardly */}
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:4,direction:"ltr"}}>
        {xLabels.length > 0 && <span>{xLabels[0]}</span>}
        {xLabels.length > 1 && <span>{xLabels[xLabels.length - 1]}</span>}
      </div>
    </div>
  );
}

// Bar chart where positive bars are green and negative bars are red,
// optionally with a trend overlay. Used by section 4-B (net profit per period).
function BarChartSigned({ values, labels, trendValues, height = 160, ui, posColor = "#16A34A", negColor = "#DC2626", trendColor = "#534AB7" }) {
  if (!values.length) return <div style={{height,display:"flex",alignItems:"center",justifyContent:"center",color:ui.textSub,fontFamily:ui.fontBody,fontSize:12.5}}>لا توجد بيانات</div>;
  const max = Math.max(0, ...values, ...(trendValues || []));
  const min = Math.min(0, ...values, ...(trendValues || []));
  const range = (max - min) || 1;
  const zeroY = 95 - ((0 - min) / range) * 85;
  const yScale = (v) => 95 - ((v - min) / range) * 85;
  const n = values.length;
  const barW = Math.min(8, 80 / n);
  const xCenter = (i) => 3 + (i / (n - 1 || 1)) * 94;
  return (
    <div>
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width:"100%",height,direction:"ltr"}}>
        <line x1="0" y1={zeroY} x2="100" y2={zeroY} stroke="#9CA3AF" strokeWidth="0.2"/>
        {values.map((v, i) => {
          const y = yScale(v);
          const top = Math.min(y, zeroY);
          const h = Math.abs(y - zeroY);
          return (
            <rect key={i} x={xCenter(i) - barW/2} y={top} width={barW} height={Math.max(0.6, h)}
              fill={v >= 0 ? posColor : negColor} rx="0.4">
              <title>{`${labels[i]}: ${Math.round(v).toLocaleString()} ج`}</title>
            </rect>
          );
        })}
        {Array.isArray(trendValues) && trendValues.length === n && (
          <polyline fill="none" stroke={trendColor} strokeWidth="0.7" strokeDasharray="1.2,0.8"
            points={trendValues.map((v, i) => `${xCenter(i).toFixed(2)},${yScale(v).toFixed(2)}`).join(" ")}/>
        )}
      </svg>
      <div style={{display:"flex",justifyContent:"space-between",fontSize:9.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:4,direction:"ltr"}}>
        {labels.length > 0 && <span>{labels[0]}</span>}
        {labels.length > 1 && <span>{labels[labels.length - 1]}</span>}
      </div>
    </div>
  );
}

// SVG path for a single pie/donut slice. (cx,cy) center, r outer radius,
// rInner inner radius (0 = pie). startAngle/endAngle in radians, clockwise
// from 12 o'clock.
function arcPath(cx, cy, rOuter, rInner, startAngle, endAngle) {
  const polar = (r, a) => [cx + r * Math.sin(a), cy - r * Math.cos(a)];
  const [x1, y1] = polar(rOuter, startAngle);
  const [x2, y2] = polar(rOuter, endAngle);
  const [x3, y3] = polar(rInner, endAngle);
  const [x4, y4] = polar(rInner, startAngle);
  const large = (endAngle - startAngle) > Math.PI ? 1 : 0;
  if (rInner <= 0) {
    return `M ${cx} ${cy} L ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} Z`;
  }
  return `M ${x1} ${y1} A ${rOuter} ${rOuter} 0 ${large} 1 ${x2} ${y2} L ${x3} ${y3} A ${rInner} ${rInner} 0 ${large} 0 ${x4} ${y4} Z`;
}

// Pie / donut chart from {label, value, color} slices. innerRadiusPct = 0 → pie.
function PieChart({ slices, size = 160, innerRadiusPct = 0, ui }) {
  const total = slices.reduce((s, sl) => s + (Number(sl.value) || 0), 0);
  if (total <= 0) return <div style={{width:size,height:size,display:"flex",alignItems:"center",justifyContent:"center",color:ui.textSub,fontFamily:ui.fontBody,fontSize:12.5}}>لا توجد بيانات</div>;
  const cx = 50, cy = 50, rO = 48, rI = (innerRadiusPct / 100) * rO;
  let angle = 0;
  return (
    <svg viewBox="0 0 100 100" style={{width:size,height:size,display:"block",direction:"ltr"}}>
      {slices.map((sl, i) => {
        const v = Number(sl.value) || 0;
        if (v <= 0) return null;
        const start = angle;
        const end = start + (v / total) * Math.PI * 2;
        angle = end;
        const pct = Math.round((v / total) * 1000) / 10;
        return (
          <path key={i} d={arcPath(cx, cy, rO, rI, start, end)} fill={sl.color} stroke="#fff" strokeWidth="0.3">
            <title>{`${sl.label}: ${Math.round(v).toLocaleString()} ج (${pct}%)`}</title>
          </path>
        );
      })}
      {rI > 0 && (
        <text x={cx} y={cy + 1} textAnchor="middle" dominantBaseline="middle" style={{fontSize:7,fill:ui.textSub,fontFamily:ui.fontBody}}>
          {Math.round(total).toLocaleString()} ج
        </text>
      )}
    </svg>
  );
}

// Horizontal bar chart used by section 7 (profit by product category).
function HBarChart({ rows, height = 22, ui, color = "#534AB7" }) {
  if (!rows.length) return <div style={{padding:"24px",color:ui.textSub,fontFamily:ui.fontBody,fontSize:12.5,textAlign:"center"}}>لا توجد بيانات</div>;
  const max = Math.max(1, ...rows.map(r => Math.abs(Number(r.value) || 0)));
  return (
    <div style={{display:"flex",flexDirection:"column",gap:6}}>
      {rows.map((r, i) => {
        const v = Number(r.value) || 0;
        const pct = Math.round((Math.abs(v) / max) * 100);
        const barColor = v < 0 ? "#DC2626" : (r.color || color);
        return (
          <div key={i} style={{display:"grid",gridTemplateColumns:"110px 1fr 80px",alignItems:"center",gap:8,fontFamily:ui.fontBody,fontSize:12}}>
            <span style={{color:ui.text,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}} title={r.label}>{r.label}</span>
            <div style={{height,background:"#F3F4F6",borderRadius:3,position:"relative",overflow:"hidden"}}>
              <div style={{width:`${pct}%`,height:"100%",background:barColor,borderRadius:3,transition:"width .35s ease"}}/>
            </div>
            <span style={{color:ui.text,fontWeight:500,textAlign:"left",fontFamily:"monospace",fontSize:11.5}}>
              {Math.round(v).toLocaleString()} ج
            </span>
          </div>
        );
      })}
    </div>
  );
}

// Tiny sparkline — used inside key-metric cards.
function Sparkline({ values, color = "#534AB7", width = 80, height = 24 }) {
  if (!values || values.length < 2) return <div style={{width,height}}/>;
  const min = Math.min(...values), max = Math.max(...values);
  const range = (max - min) || 1;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - ((v - min) / range) * 100;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{width,height,display:"block"}}>
      <polyline fill="none" stroke={color} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" points={pts}/>
    </svg>
  );
}

// ─── Print a return slip via the browser's window.print() ─────────────────────
// Opens a new popup window with a styled, self-contained HTML page, gives the
// browser a beat to render, then triggers print. No new deps — works offline.
// The "barcode" is a CSS-only striped block (good enough to scan visually).
function printReturnSlip(ret) {
  if (!ret || !ret.return_number) return;
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;")
    .replace(/"/g,"&quot;").replace(/'/g,"&#39;");
  const itemsHtml = (ret.items || []).length === 0
    ? `<tr><td colspan="4" style="padding:14px;text-align:center;color:#666;">${esc(ret.product || "—")}</td></tr>`
    : ret.items.map(it => `
        <tr>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;">${esc(it.product_name || "—")}${it.sku ? `<br><span style="font-size:10px;color:#666;font-family:monospace;">SKU: ${esc(it.sku)}</span>` : ""}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:center;">${esc(it.quantity)}</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:left;">${(Number(it.unit_price)||0).toLocaleString()} ج</td>
          <td style="padding:8px 10px;border-bottom:1px solid #eee;text-align:left;font-weight:600;">${(Number(it.refund_amount)||0).toLocaleString()} ج</td>
        </tr>
      `).join("");
  // Pure-CSS striped "barcode" — alternating black bars derived from the
  // return number's char codes so the same RET-XXXX always renders the same.
  const code = ret.return_number;
  const bars = Array.from(code).map((c) => {
    const w = ((c.charCodeAt(0) % 4) + 1) * 2;
    return `<span style="display:inline-block;width:${w}px;height:38px;background:#000;margin-right:2px;"></span>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<title>بوليصة إرجاع ${esc(ret.return_number)}</title>
<style>
  * { box-sizing: border-box; }
  body { margin:0; padding:24px; font-family: 'Segoe UI', Tahoma, Arial, sans-serif; color:#1A1A1A; background:#fff; direction:rtl; }
  .slip { max-width:680px; margin:0 auto; border:1px solid #ccc; padding:28px 26px; }
  .header { display:flex; justify-content:space-between; align-items:flex-start; padding-bottom:18px; border-bottom:2px solid #000; margin-bottom:20px; }
  .brand { font-size:30px; font-weight:400; letter-spacing:0.12em; color:#c9a96e; font-family:'Times New Roman', serif; }
  .brand-sub { font-size:9px; letter-spacing:0.3em; color:#666; margin-top:4px; }
  .slip-title { font-size:18px; font-weight:600; margin-bottom:4px; }
  .slip-num { font-size:12px; color:#666; font-family:monospace; }
  .meta { display:grid; grid-template-columns: 1fr 1fr; gap:10px 18px; font-size:12.5px; margin-bottom:18px; }
  .meta label { color:#666; font-size:11px; display:block; margin-bottom:2px; }
  .meta b { color:#1A1A1A; font-weight:500; }
  table { width:100%; border-collapse:collapse; margin-bottom:18px; }
  th { background:#f5f5f5; padding:8px 10px; text-align:right; font-size:11px; color:#666; border-bottom:2px solid #000; font-weight:600; }
  .total-row { background:#f9f9f9; }
  .total-row td { padding:11px 10px; font-size:14px; font-weight:700; border-top:2px solid #000; }
  .notes { font-size:12px; color:#444; padding:12px 14px; background:#FFFBEA; border:1px dashed #FDE68A; border-radius:6px; margin-bottom:18px; }
  .footer { display:flex; align-items:center; justify-content:space-between; padding-top:18px; border-top:1px dashed #ccc; }
  .barcode-block { text-align:center; }
  .barcode-bars { display:inline-block; padding:6px 10px; background:#fff; border:1px solid #eee; line-height:0; }
  .barcode-text { display:block; margin-top:5px; font-family:monospace; font-size:13px; letter-spacing:0.15em; color:#000; }
  .instructions { font-size:11px; color:#444; line-height:1.7; max-width:340px; }
  @media print {
    body { padding:0; }
    .slip { border:none; max-width:none; padding:0; }
    .no-print { display:none; }
  }
</style>
</head>
<body>
  <div class="slip">
    <div class="header">
      <div>
        <div class="brand">نوّرَة</div>
        <div class="brand-sub">SKINCARE&nbsp;E-SHOP</div>
      </div>
      <div style="text-align:left;">
        <div class="slip-title">بوليصة إرجاع</div>
        <div class="slip-num">${esc(ret.return_number)}</div>
        <div style="font-size:10.5px;color:#666;margin-top:3px;">${esc(String(ret.requested_at || ret.created_at || "").slice(0, 16))}</div>
      </div>
    </div>

    <div class="meta">
      <div><label>العميل</label><b>${esc(ret.customer || (ret.customer && ret.customer.name) || "—")}</b></div>
      <div><label>الطلب الأصلي</label><b>#${esc(ret.order_id || "—")}</b></div>
      <div><label>الهاتف</label><b>${esc(ret.customer && ret.customer.phone || "—")}</b></div>
      <div><label>السبب</label><b>${esc(ret.reason_label || ret.reason || "—")}</b></div>
    </div>

    <table>
      <thead>
        <tr>
          <th>المنتج</th>
          <th style="text-align:center;width:60px;">الكمية</th>
          <th style="text-align:left;width:90px;">السعر</th>
          <th style="text-align:left;width:90px;">الاسترداد</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr class="total-row">
          <td colspan="3">الإجمالي المسترد</td>
          <td style="text-align:left;">${(Number(ret.amount)||0).toLocaleString()} ج</td>
        </tr>
      </tbody>
    </table>

    ${ret.customer_notes ? `<div class="notes"><b>ملاحظات العميل:</b><br>${esc(ret.customer_notes)}</div>` : ""}

    <div class="footer">
      <div class="instructions">
        <b>تعليمات:</b><br>
        1. ضع هذه البوليصة داخل العبوة مع المنتج المُرجع.<br>
        2. تأكد من أن المنتج بحالته الأصلية.<br>
        3. سيتم معالجة الاسترداد خلال 3 أيام عمل من الاستلام.<br>
        4. للاستفسار: <a href="https://wa.me/2010" target="_blank">واتساب نوّرَة</a>
      </div>
      <div class="barcode-block">
        <div class="barcode-bars">${bars}</div>
        <span class="barcode-text">${esc(code)}</span>
      </div>
    </div>
  </div>
  <script>
    // Give the browser one tick to layout + load fonts, then print.
    window.addEventListener('load', function() { setTimeout(function() { window.print(); }, 250); });
  </script>
</body>
</html>`;

  const win = window.open("", "nawra-return-slip", "width=820,height=900");
  if (!win) { window.alert("تم منع النافذة المنبثقة. فعّل النوافذ المنبثقة من إعدادات المتصفح."); return; }
  win.document.open(); win.document.write(html); win.document.close();
}

// ─── AWB PDF generation (Phase 3 slice 1) ────────────────────────────────────
// Builds an A6 portrait PDF for one shipment with sender + recipient blocks,
// items count, weight, COD amount, and a CODE128 barcode of the AWB number.
// Strategy: render a hidden HTML label (native browser RTL Arabic shaping +
// bwip-js barcode canvas) → snapshot with html2canvas → wrap in jsPDF.
// All three libs are dynamically imported so they only load when an admin
// clicks the print button. Pass `bulk = [ship1, ship2, ...]` (overrides ship)
// for multi-page output. Returns the jsPDF doc instance so callers can choose
// .save() or .output('bloburl').
async function generateAwbPdf({ ship, bulk, sender, action = "save" } = {}) {
  const ships = Array.isArray(bulk) && bulk.length ? bulk : (ship ? [ship] : []);
  if (!ships.length) throw new Error("no shipment provided");

  // Lazy-load heavy deps once per click.
  const [jsPdfMod, h2cMod, bwipMod] = await Promise.all([
    import("jspdf"),
    import("html2canvas"),
    import("bwip-js"),
  ]);
  const jsPDF      = jsPdfMod.jsPDF;
  const html2canvas = h2cMod.default || h2cMod;
  const bwipjs     = bwipMod.default || bwipMod;

  // Off-screen host so html2canvas can lay out flow content reliably.
  const host = document.createElement("div");
  host.style.cssText = "position:fixed;left:-99999px;top:0;background:#fff;direction:rtl;";
  document.body.appendChild(host);

  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a6", compress: true });
  const pageW = 105, pageH = 148;

  try {
    for (let i = 0; i < ships.length; i++) {
      const s = ships[i] || {};
      const o = s.order || {};
      const items = Array.isArray(o.items) ? o.items : [];
      const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
      const codAmount = (s.payment_method === "cod" || o.payment_method === "cod")
        ? (Number(s.customer_paid_cod) || Number(o.total) || 0)
        : 0;
      const senderName  = (sender && sender.shipping_sender_name)       || (sender && sender.name) || "نوّرَة Nawra Skincare";
      const senderPhone = (sender && sender.shipping_sender_phone)      || (sender && sender.whatsapp) || "";
      const senderAddr  = (sender && sender.shipping_warehouse_address) || (sender && sender.address) || "";

      // Build the label DOM. Width = 105mm matches A6 page width.
      const label = document.createElement("div");
      label.style.cssText = `
        width:105mm;min-height:148mm;background:#fff;color:#000;
        font-family:'Cairo','Noto Naskh Arabic',sans-serif;
        direction:rtl;padding:5mm 5mm 5mm 5mm;box-sizing:border-box;
      `;
      label.innerHTML = `
        <div style="display:flex;align-items:flex-start;justify-content:space-between;border-bottom:1.2px solid #000;padding-bottom:2mm;margin-bottom:2.5mm;">
          <div>
            <div style="font-size:14pt;font-weight:700;line-height:1.1;">نوّرَة</div>
            <div style="font-size:7pt;color:#444;letter-spacing:.5px;">NAWRA SKINCARE</div>
          </div>
          <div style="text-align:left;">
            <div style="font-size:7pt;color:#555;">رقم البوليصة</div>
            <div style="font-family:monospace;font-size:11pt;font-weight:700;">${escAttr(s.awb_number || "")}</div>
            <div style="font-size:7pt;color:#555;margin-top:.5mm;">${escAttr((s.created_at || "").slice(0, 10))}</div>
          </div>
        </div>
        <div style="text-align:center;margin-bottom:2.5mm;">
          <canvas id="bc-${i}" style="max-width:100%;height:auto;"></canvas>
        </div>
        <div style="border:0.6px solid #000;border-radius:1.5mm;padding:2mm 2.5mm;margin-bottom:2mm;">
          <div style="font-size:7.5pt;color:#555;margin-bottom:1mm;">المرسل</div>
          <div style="font-size:10pt;font-weight:600;">${escAttr(senderName)}</div>
          ${senderAddr ? `<div style="font-size:8.5pt;line-height:1.35;margin-top:.5mm;">${escAttr(senderAddr)}</div>` : ""}
          ${senderPhone ? `<div style="font-family:monospace;font-size:8.5pt;margin-top:.5mm;">${escAttr(senderPhone)}</div>` : ""}
        </div>
        <div style="border:1.2px solid #000;border-radius:1.5mm;padding:2.5mm 2.5mm;margin-bottom:2mm;background:#f7f7f7;">
          <div style="font-size:7.5pt;color:#555;margin-bottom:1mm;">المستلم</div>
          <div style="font-size:12pt;font-weight:700;line-height:1.25;">${escAttr(o.name || "—")}</div>
          ${o.phone ? `<div style="font-family:monospace;font-size:10pt;font-weight:600;margin-top:1mm;">${escAttr(o.phone)}</div>` : ""}
          <div style="font-size:9.5pt;line-height:1.4;margin-top:1.5mm;">
            ${o.city ? `<b>${escAttr(o.city)}</b> — ` : ""}${escAttr(o.address || "—")}
          </div>
          ${s.zone && s.zone.name_ar ? `<div style="font-size:8pt;color:#555;margin-top:1mm;">المنطقة: ${escAttr(s.zone.name_ar)}</div>` : ""}
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:8.5pt;margin-bottom:2mm;">
          <tr>
            <td style="border:0.5px solid #000;padding:1.5mm 2mm;width:50%;">
              <div style="color:#555;font-size:7pt;">الشركة</div>
              <div style="font-weight:600;">${escAttr((s.courier && s.courier.name) || "—")}</div>
            </td>
            <td style="border:0.5px solid #000;padding:1.5mm 2mm;">
              <div style="color:#555;font-size:7pt;">الوزن</div>
              <div style="font-weight:600;">${(Number(s.weight_kg) || 0).toFixed(2)} كجم</div>
            </td>
          </tr>
          <tr>
            <td style="border:0.5px solid #000;padding:1.5mm 2mm;">
              <div style="color:#555;font-size:7pt;">عدد القطع</div>
              <div style="font-weight:600;">${totalQty || items.length || 0}</div>
            </td>
            <td style="border:0.5px solid #000;padding:1.5mm 2mm;">
              <div style="color:#555;font-size:7pt;">طريقة الدفع</div>
              <div style="font-weight:600;">${codAmount > 0 ? "الدفع عند الاستلام (COD)" : "مدفوع مسبقاً"}</div>
            </td>
          </tr>
          ${codAmount > 0 ? `
          <tr>
            <td colspan="2" style="border:0.8px solid #000;padding:2mm 2.5mm;background:#FFF7E6;">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <span style="font-size:9pt;font-weight:600;">المبلغ المطلوب تحصيله</span>
                <span style="font-family:monospace;font-size:13pt;font-weight:700;">${codAmount.toLocaleString()} ج</span>
              </div>
            </td>
          </tr>` : ""}
          ${s.expected_delivery_date ? `
          <tr>
            <td colspan="2" style="border:0.5px solid #000;padding:1.5mm 2mm;">
              <div style="color:#555;font-size:7pt;">تاريخ التسليم المتوقع</div>
              <div style="font-weight:600;font-family:monospace;">${escAttr(s.expected_delivery_date)}</div>
            </td>
          </tr>` : ""}
        </table>
        ${s.internal_notes ? `
          <div style="border-top:0.5px dashed #999;padding-top:1.5mm;font-size:8pt;line-height:1.35;color:#333;">
            <b style="color:#000;">ملاحظات:</b> ${escAttr(s.internal_notes)}
          </div>` : ""}
        <div style="position:absolute;bottom:5mm;left:5mm;right:5mm;font-size:7pt;color:#777;text-align:center;border-top:0.3px solid #ccc;padding-top:1mm;">
          شكراً لاختياركم نوّرَة • للاستفسار اتصل ${escAttr(senderPhone || "—")}
        </div>
      `;
      host.appendChild(label);

      // Draw barcode after the label is in the DOM so the canvas exists.
      const canvas = label.querySelector(`#bc-${i}`);
      if (canvas && s.awb_number) {
        try {
          bwipjs.toCanvas(canvas, {
            bcid:        "code128",
            text:        String(s.awb_number),
            scale:       3,
            height:      12,
            includetext: true,
            textxalign:  "center",
            textsize:    9,
            backgroundcolor: "FFFFFF",
          });
        } catch (e) { console.warn("[awb] barcode draw failed", e); }
      }

      // Snapshot the label → image → PDF page.
      const snap = await html2canvas(label, { scale: 2, backgroundColor: "#FFFFFF", logging: false, useCORS: true });
      const png  = snap.toDataURL("image/png");
      if (i > 0) doc.addPage("a6", "portrait");
      doc.addImage(png, "PNG", 0, 0, pageW, pageH, undefined, "FAST");

      host.removeChild(label);
    }
  } finally {
    if (host.parentNode) host.parentNode.removeChild(host);
  }

  if (action === "open") {
    const url = doc.output("bloburl");
    window.open(url, "_blank");
  } else {
    const name = ships.length === 1
      ? `${ships[0].awb_number || "AWB"}.pdf`
      : `AWB-bulk-${new Date().toISOString().slice(0,10)}-${ships.length}.pdf`;
    doc.save(name);
  }
  return doc;
}

// Minimal HTML attribute escape — used by the AWB label template literal.
function escAttr(s) {
  return String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

// ─── ShipmentDetailsModal — module-scope to keep input focus on every keystroke ───
// Renders a modal for a single hydrated shipment from /api/shipments/:awb.
// Phase 2 wires: status transitions, courier reassignment, cost edits,
// notes, customer contact links. Phase 3 slice 1 wires AWB PDF print.
function ShipmentDetailsModal({ ship, awbKey, onClose, onPatch, onAppendNote, isSuper, ui, mob, sender }) {
  const [noteDraft, setNoteDraft] = useState("");
  const [noteBusy,  setNoteBusy]  = useState(false);
  const [pdfBusy,   setPdfBusy]   = useState(false);
  const printAwb = async () => {
    if (!ship) return;
    setPdfBusy(true);
    try { await generateAwbPdf({ ship, sender, action: "save" }); }
    catch (e) { console.error("[awb] generate failed", e); window.alert("تعذّر إنشاء البوليصة: " + (e.message || e)); }
    finally { setPdfBusy(false); }
  };
  if (!ship) {
    return (
      <div onClick={onClose}
        style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
        <div style={{background:ui.cardBg,padding:30,borderRadius:8,fontFamily:ui.fontBody,fontSize:13,color:ui.textSub}}>
          جاري تحميل {awbKey}...
        </div>
      </div>
    );
  }
  const badge = (s) => {
    if (s === "ready")     return { bg:"#FEF3C7", fg:"#92400E", l:"جاهز للشحن" };
    if (s === "shipped")   return { bg:"#DBEAFE", fg:"#1D4ED8", l:"تم الشحن" };
    if (s === "delivered") return { bg:"#DCFCE7", fg:"#15803D", l:"تم التسليم" };
    if (s === "returned")  return { bg:"#FEE2E2", fg:"#B91C1C", l:"مرتجع للمتجر" };
    if (s === "cancelled") return { bg:"#F3F4F6", fg:"#525252", l:"ملغي" };
    return { bg:"#F3F4F6", fg:"#525252", l: s || "—" };
  };
  const b = badge(ship.status);
  const statusOrder = ["ready", "shipped", "delivered"];
  const stepIdx = ship.status === "cancelled" || ship.status === "returned"
    ? 0
    : (statusOrder.indexOf(ship.status));
  const customerPaid = (Number(ship.customer_paid_shipping) || 0) + (Number(ship.customer_paid_cod) || 0);
  const margin = customerPaid - (Number(ship.courier_cost) || 0);
  const order = ship.order || {};
  const items = Array.isArray(order.items) ? order.items : [];
  const trackingUrl = ship.courier && ship.courier.tracking_url_template && ship.tracking_number
    ? ship.courier.tracking_url_template.replace("{tracking_number}", encodeURIComponent(ship.tracking_number))
    : null;

  const submitNote = async () => {
    if (noteDraft.trim().length < 2) return;
    setNoteBusy(true);
    try { await onAppendNote(noteDraft.trim()); setNoteDraft(""); } finally { setNoteBusy(false); }
  };

  const card = { background:ui.cardBg, border:ui.border, borderRadius:ui.radius, padding:"12px 14px", marginBottom:10 };
  const cardTitle = { fontSize:12,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,marginBottom:8,paddingBottom:6,borderBottom:"0.5px solid #EEE" };

  return (
    <div onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",alignItems:"center",justifyContent:"center",padding:mob?10:24,direction:"rtl",overflowY:"auto"}}>
      <div onClick={e => e.stopPropagation()}
        style={{background:"#F5F5F5",maxWidth:880,width:"100%",maxHeight:"92vh",overflowY:"auto",borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
        {/* Header */}
        <div style={{background:ui.cardBg,padding:"14px 18px",borderBottom:"0.5px solid #EEE",display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:10,position:"sticky",top:0,zIndex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:10,flexWrap:"wrap"}}>
            <h3 style={{fontSize:16,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:0}}>{ship.awb_number}</h3>
            <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:b.bg,color:b.fg,fontFamily:ui.fontBody}}>{b.l}</span>
            <button onClick={() => navigator.clipboard && navigator.clipboard.writeText(ship.awb_number).catch(() => {})}
              title="نسخ رقم البوليصة"
              style={{background:"transparent",border:"none",cursor:"pointer",color:ui.textSub,fontSize:13,padding:0}}>📋</button>
          </div>
          <div style={{display:"flex",gap:6,alignItems:"center"}}>
            <button onClick={printAwb} disabled={pdfBusy} title="تحميل بوليصة PDF (A6) للطباعة"
              style={{padding:"6px 11px",background:pdfBusy?"#9CA3AF":ui.text,color:"#fff",border:"none",borderRadius:5,fontSize:11.5,cursor:pdfBusy?"wait":"pointer",fontFamily:ui.fontBody}}>
              {pdfBusy ? "جاري التحضير..." : "🖨️ طباعة بوليصة"}
            </button>
            {order && order.phone && (
              <a href={`https://wa.me/2${(order.phone || "").replace(/[^\d]/g,"")}`} target="_blank" rel="noreferrer"
                style={{padding:"6px 11px",background:"#25D366",color:"#fff",border:"none",borderRadius:5,fontSize:11.5,textDecoration:"none",fontFamily:ui.fontBody}}>📞 واتساب</a>
            )}
            <button onClick={onClose}
              style={{background:"none",border:"none",fontSize:20,color:ui.textSub,cursor:"pointer",padding:4,lineHeight:1}}>✕</button>
          </div>
        </div>

        {/* Body — two-column layout on desktop */}
        <div style={{padding:14,display:"grid",gridTemplateColumns:mob?"1fr":"2fr 1fr",gap:10,alignItems:"start"}}>
          {/* LEFT column */}
          <div>
            {/* Status timeline */}
            <div style={card}>
              <div style={cardTitle}>مسار الشحنة</div>
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",direction:"rtl",gap:6,flexWrap:"wrap"}}>
                {[
                  { k:"ready",     l:"تم الإنشاء", at: ship.created_at },
                  { k:"shipped",   l:"تم الشحن",   at: ship.shipped_at },
                  { k:"delivered", l:"تم التسليم", at: ship.delivered_at },
                ].map((step, i, arr) => {
                  const done = stepIdx >= i;
                  const current = stepIdx === i && ship.status !== "cancelled" && ship.status !== "returned";
                  const tone = ship.status === "returned" ? "#DC2626" : ship.status === "cancelled" ? "#9CA3AF" : (done ? "#16A34A" : "#E5E7EB");
                  return (
                    <React.Fragment key={step.k}>
                      <div style={{flex:1,minWidth:80,display:"flex",flexDirection:"column",alignItems:"center",gap:3}}>
                        <div style={{width:26,height:26,borderRadius:"50%",background:tone,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:12,fontWeight:600,boxShadow: current ? "0 0 0 4px rgba(22,163,74,.18)" : "none"}}>
                          {done ? "✓" : (i+1)}
                        </div>
                        <div style={{fontSize:11,color: done ? ui.text : ui.textSub,fontFamily:ui.fontBody,textAlign:"center"}}>{step.l}</div>
                        {step.at && <div style={{fontSize:9.5,color:ui.textSub,fontFamily:ui.fontBody,textAlign:"center"}}>{String(step.at).slice(5,16)}</div>}
                      </div>
                      {i < arr.length - 1 && <div style={{flex:1,height:2,background: stepIdx > i ? "#16A34A" : "#E5E7EB",marginTop:13}}/>}
                    </React.Fragment>
                  );
                })}
              </div>
              {ship.status === "returned" && <div style={{marginTop:8,fontSize:11.5,color:"#B91C1C",fontFamily:ui.fontBody,textAlign:"center"}}>الشحنة مرتجعة للمتجر — راجع سبب الفشل مع الشركة</div>}
              {ship.status === "cancelled" && <div style={{marginTop:8,fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,textAlign:"center"}}>تم إلغاء الشحنة</div>}
            </div>

            {/* Customer + address */}
            <div style={card}>
              <div style={cardTitle}>العميل والعنوان</div>
              <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,marginBottom:4,fontWeight:500}}>{order.name || "—"}</div>
              {order.phone && <div style={{fontSize:11.5,color:ui.textSub,fontFamily:"monospace",marginBottom:3}}>📱 {order.phone}</div>}
              <div style={{fontSize:12.5,color:ui.text,fontFamily:ui.fontBody}}>{order.city || "—"} · {order.address || "—"}</div>
              {order.userEmail && <div style={{fontSize:11,color:ui.textSub,fontFamily:"monospace",marginTop:3}}>{order.userEmail}</div>}
            </div>

            {/* Items */}
            <div style={card}>
              <div style={cardTitle}>المنتجات ({items.length})</div>
              {items.length === 0 ? (
                <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>لا توجد منتجات</div>
              ) : (
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {items.map((it, i) => (
                    <div key={i} style={{display:"flex",alignItems:"center",gap:8,padding:"5px 0",borderBottom: i < items.length - 1 ? "0.5px solid #EEE" : "none"}}>
                      <div style={{width:34,height:34,background:"#F3F4F6",borderRadius:4,overflow:"hidden",flexShrink:0}}>
                        {it.img && <img src={it.img} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>}
                      </div>
                      <div style={{flex:1,fontSize:12.5,color:ui.text,fontFamily:ui.fontBody}}>{it.name || "—"}</div>
                      <div style={{fontSize:11.5,color:ui.textSub,fontFamily:"monospace"}}>×{it.qty} · {(Number(it.price)||0).toLocaleString()} ج</div>
                    </div>
                  ))}
                </div>
              )}
              <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:8,paddingTop:6,borderTop:"0.5px dashed #EEE"}}>
                إجمالي الوزن: <b style={{color:ui.text}}>{(Number(ship.weight_kg) || 0).toFixed(2)} كجم</b>
              </div>
            </div>

            {/* Internal notes */}
            <div style={card}>
              <div style={cardTitle}>ملاحظات داخلية</div>
              {ship.internal_notes && (
                <div style={{padding:"8px 11px",background:"#FFFBEB",border:"0.5px solid #FDE68A",borderRadius:5,fontSize:12,color:"#92400E",fontFamily:ui.fontBody,marginBottom:8,whiteSpace:"pre-wrap"}}>{ship.internal_notes}</div>
              )}
              <textarea rows={2} value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
                placeholder="أضف ملاحظة داخلية"
                style={{width:"100%",padding:"7px 10px",border:ui.border,borderRadius:5,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none",direction:"rtl",resize:"vertical",boxSizing:"border-box"}}/>
              <div style={{textAlign:"left",marginTop:6}}>
                <button onClick={submitNote} disabled={noteBusy || noteDraft.trim().length < 2}
                  style={{padding:"5px 13px",background:(noteBusy||noteDraft.trim().length<2)?"#9CA3AF":ui.text,color:"#fff",border:"none",borderRadius:4,fontSize:11.5,cursor:(noteBusy||noteDraft.trim().length<2)?"not-allowed":"pointer",fontFamily:ui.fontBody}}>
                  {noteBusy ? "..." : "إضافة"}
                </button>
              </div>
            </div>
          </div>

          {/* RIGHT sidebar */}
          <div>
            {/* Courier + tracking */}
            <div style={card}>
              <div style={cardTitle}>الشركة والتتبع</div>
              <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,fontWeight:500,marginBottom:4}}>{ship.courier ? ship.courier.name : "غير محدد"}</div>
              {ship.courier && ship.courier.contact_phone && <div style={{fontSize:11.5,color:ui.textSub,fontFamily:"monospace",marginBottom:4}}>📱 {ship.courier.contact_phone}</div>}
              <input value={ship.tracking_number || ""}
                onChange={e => onPatch(ship.id, { tracking_number: e.target.value })}
                placeholder="رقم تتبع الشركة (AWB لدى الشركة)"
                style={{width:"100%",padding:"6px 10px",border:ui.border,borderRadius:5,fontFamily:"monospace",fontSize:12,color:ui.text,outline:"none",direction:"ltr",boxSizing:"border-box",marginTop:6}}/>
              {trackingUrl && (
                <a href={trackingUrl} target="_blank" rel="noreferrer"
                  style={{display:"inline-block",marginTop:6,fontSize:11.5,color:"#1D4ED8",textDecoration:"none",fontFamily:ui.fontBody}}>تتبع لدى الشركة ←</a>
              )}
            </div>

            {/* Cost breakdown */}
            <div style={card}>
              <div style={cardTitle}>تفاصيل الشحن المالية</div>
              <div style={{display:"flex",flexDirection:"column",gap:5,fontFamily:ui.fontBody,fontSize:12,color:ui.text}}>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span>تكلفة الشركة</span>
                  <input type="number" value={ship.courier_cost || 0}
                    onChange={e => onPatch(ship.id, { courier_cost: Number(e.target.value) || 0 })}
                    style={{width:90,padding:"3px 7px",border:ui.border,borderRadius:4,fontFamily:"monospace",fontSize:12,color:ui.text,outline:"none",direction:"ltr",textAlign:"left"}}/>
                </div>
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span>محصل من العميل (شحن)</span>
                  <span style={{fontFamily:"monospace"}}>{(Number(ship.customer_paid_shipping)||0).toLocaleString()} ج</span>
                </div>
                {(Number(ship.customer_paid_cod) || 0) > 0 && (
                  <div style={{display:"flex",justifyContent:"space-between"}}>
                    <span>COD يتم تحصيله</span>
                    <span style={{fontFamily:"monospace"}}>{(Number(ship.customer_paid_cod)||0).toLocaleString()} ج</span>
                  </div>
                )}
                <div style={{display:"flex",justifyContent:"space-between",paddingTop:6,marginTop:4,borderTop:"1px dashed #E5E5E5",fontWeight:600,fontSize:13}}>
                  <span>هامش الشحن</span>
                  <span style={{color: margin >= 0 ? "#15803D" : "#B91C1C",fontFamily:"monospace"}}>{margin >= 0 ? "+" : ""}{margin.toLocaleString()} ج</span>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div style={{...card, position:"sticky", top:8}}>
              <div style={cardTitle}>الإجراءات</div>
              {ship.status === "ready" && (
                <button onClick={() => onPatch(ship.id, { status:"shipped" })}
                  style={{padding:"9px 14px",background:"#1D4ED8",color:"#fff",border:"none",borderRadius:5,fontSize:12.5,cursor:"pointer",fontFamily:ui.fontBody,width:"100%",marginBottom:6}}>
                  📦 تأكيد تسليم للشركة (تم الشحن)
                </button>
              )}
              {ship.status === "shipped" && (
                <>
                  <button onClick={() => onPatch(ship.id, { status:"delivered" })}
                    style={{padding:"9px 14px",background:"#15803D",color:"#fff",border:"none",borderRadius:5,fontSize:12.5,cursor:"pointer",fontFamily:ui.fontBody,width:"100%",marginBottom:6}}>
                    ✓ تأكيد التسليم للعميل
                  </button>
                  <button onClick={() => onPatch(ship.id, { status:"returned" })}
                    style={{padding:"9px 14px",background:"transparent",color:"#B91C1C",border:"1px solid #FCA5A5",borderRadius:5,fontSize:12.5,cursor:"pointer",fontFamily:ui.fontBody,width:"100%",marginBottom:6}}>
                    ↩ مرتجع للمتجر
                  </button>
                </>
              )}
              {ship.status === "delivered" && (
                <div style={{padding:"9px 14px",background:"#F0FDF4",color:"#15803D",border:"0.5px solid #86EFAC",borderRadius:5,fontSize:12,fontFamily:ui.fontBody,textAlign:"center",marginBottom:6}}>
                  ✓ تم التسليم
                  {ship.delivered_at && <div style={{fontSize:10.5,marginTop:2,color:"#166534"}}>{String(ship.delivered_at).slice(0,16)}</div>}
                </div>
              )}
              {(ship.status === "ready" || ship.status === "shipped") && isSuper && (
                <button onClick={() => { if (window.confirm("إلغاء هذه الشحنة؟ هذا الإجراء لا يمكن التراجع عنه.")) onPatch(ship.id, { status:"cancelled" }); }}
                  style={{padding:"7px 14px",background:"transparent",color:ui.textSub,border:ui.border,borderRadius:5,fontSize:11.5,cursor:"pointer",fontFamily:ui.fontBody,width:"100%"}}>
                  إلغاء الشحنة
                </button>
              )}
            </div>

            {/* History */}
            {Array.isArray(ship.history) && ship.history.length > 0 && (
              <div style={card}>
                <div style={cardTitle}>سجل الحالة</div>
                <div style={{display:"flex",flexDirection:"column",gap:6}}>
                  {ship.history.map(h => (
                    <div key={h.id} style={{fontSize:11.5,fontFamily:ui.fontBody,color:ui.text,paddingBottom:5,borderBottom:"0.5px dashed #EEE"}}>
                      <div>{h.from_status ? `${badge(h.from_status).l} → ` : ""}<b>{badge(h.to_status).l}</b></div>
                      <div style={{fontSize:10,color:ui.textSub,marginTop:2}}>
                        {h.actor_name || h.actor_id || "النظام"} · {h.created_at && String(h.created_at).slice(0,16)}
                      </div>
                      {h.notes && <div style={{fontSize:10.5,color:ui.textSub,marginTop:2}}>{h.notes}</div>}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── ReturnDetailsView — module-scope so input focus is preserved on every keystroke ───
// Renders the full return-details page (2-col layout) for a single hydrated
// `ret` object from /api/returns/:returnNumber. The parent owns the data
// (refresh + patch); this component is presentational + dispatches via
// onPatch / onReload / onBack. Phase 1 wires status transitions, condition
// + restock dropdowns, refund method selector, internal notes, and the
// activity timeline. Phase 2 will add: printable slip (window.print), email
// the customer, WhatsApp deep link, store credit, finance/inventory writes.
function ReturnDetailsView({ ret, retKey, ui, mob, isSuper, authUser, onBack, onPatch, onReload }) {
  const [rejectOpen, setRejectOpen]   = useState(false);
  const [rejectNote, setRejectNote]   = useState("");
  const [noteDraft,  setNoteDraft]    = useState("");
  const [noteBusy,   setNoteBusy]     = useState(false);

  if (!ret) {
    return (
      <div style={{padding:"40px",textAlign:"center",color:ui.textSub,fontFamily:ui.fontBody}}>
        <button onClick={onBack} style={{background:"transparent",border:"none",color:"#1D4ED8",cursor:"pointer",fontFamily:ui.fontBody,fontSize:13,marginBottom:14}}>← العودة للمرتجعات</button>
        <div style={{fontSize:14}}>جاري تحميل مرتجع {retKey}...</div>
      </div>
    );
  }

  const badge = (s) => {
    if (s === "approved")  return { bg:"#DBEAFE", fg:"#1D4ED8", l:"موافق" };
    if (s === "rejected")  return { bg:"#FEE2E2", fg:"#B91C1C", l:"مرفوض" };
    if (s === "refunded")  return { bg:"#DCFCE7", fg:"#15803D", l:"تم الاسترداد" };
    if (s === "cancelled") return { bg:"#F3F4F6", fg:"#525252", l:"ملغي" };
    return { bg:"#FEF3C7", fg:"#92400E", l:"في الانتظار" };
  };
  const b = badge(ret.status);
  // Per condition → suggested restock decision (admin can override)
  const suggestRestock = (c) => ({ good:"restock_available", partial_damage:"move_to_damaged", full_damage:"write_off" })[c] || "pending";

  const card = { background:ui.cardBg, border:ui.border, borderRadius:ui.radius, padding:"14px 16px", marginBottom:12 };
  const cardTitle = { fontSize:13, fontWeight:600, color:ui.text, fontFamily:ui.fontBody, marginBottom:10, paddingBottom:8, borderBottom:"0.5px solid #EEE" };

  // Status stepper — 4 ordered steps; current step is the row's status, all
  // earlier steps are 'done', later are 'todo'. Rejected jumps to its own slot.
  const baseSteps = [
    { k:"pending",  l:"طلب الإرجاع", at: ret.requested_at || ret.created_at },
    { k:"approved", l:"موافقة",      at: ret.reviewed_at && (ret.status === "approved" || ret.status === "refunded") ? ret.reviewed_at : null, by: ret.reviewed_by },
    { k:"inspected",l:"قيد الفحص",   at: ret.inspected_at, by: ret.reviewed_by },
    { k:"refunded", l:"تم الاسترداد", at: ret.processed_at, by: ret.processed_by },
  ];
  const isRejected = ret.status === "rejected";
  const stepIdx = isRejected ? 1 : ({ pending:0, approved:1, refunded:3 }[ret.status] ?? 0);

  // Order context — return-window calc (default 14 days; configurable in Phase 2 Settings)
  const RETURN_WINDOW_DAYS = 14;
  let windowInfo = null;
  if (ret.order && ret.order.created_at) {
    const orderTs = new Date(ret.order.created_at.replace(" ","T") + "Z").getTime();
    const sinceDays = Math.floor((Date.now() - orderTs) / 86400000);
    const remainingDays = RETURN_WINDOW_DAYS - sinceDays;
    windowInfo = { sinceDays, remainingDays };
  }

  // Refund breakdown
  const itemsRefund = (ret.items || []).reduce((s, it) => s + (Number(it.refund_amount) || 0), 0);
  const shippingRefund = Number(ret.shipping_refund) || 0;
  const discountRefund = Number(ret.discount_refund) || 0;
  const totalRefund    = Number(ret.amount) || (itemsRefund + (ret.refund_shipping ? shippingRefund : 0) - discountRefund);

  const submitNote = async () => {
    if (noteDraft.trim().length < 2) return;
    setNoteBusy(true);
    try {
      await fetch(`/api/returns/${encodeURIComponent(ret.id)}/notes`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ note: noteDraft.trim(), author: (authUser && authUser.name) || (authUser && authUser.email) || "admin" }),
      });
      setNoteDraft(""); onReload();
    } catch {} finally { setNoteBusy(false); }
  };

  const updateItem = async (itemId, patch) => {
    try {
      await fetch(`/api/return-items/${itemId}`, {
        method:"PATCH", headers:{"Content-Type":"application/json"}, body: JSON.stringify(patch),
      });
      onReload();
    } catch {}
  };

  // Build the right-sidebar action buttons based on current status.
  const ActionButtons = () => {
    if (ret.status === "pending") {
      return (
        <>
          <button onClick={() => onPatch(ret.id, { status:"approved" })}
            style={{padding:"10px 14px",background:"#15803D",color:"#fff",border:"none",borderRadius:6,fontSize:13,cursor:"pointer",fontFamily:ui.fontBody,width:"100%",marginBottom:8}}>
            ✓ موافقة على الإرجاع
          </button>
          <button onClick={() => setRejectOpen(true)}
            style={{padding:"10px 14px",background:"transparent",color:"#B91C1C",border:"1px solid #FCA5A5",borderRadius:6,fontSize:13,cursor:"pointer",fontFamily:ui.fontBody,width:"100%",marginBottom:8}}>
            ✗ رفض الإرجاع
          </button>
          <button disabled title="سيتم تفعيل المراسلة في المرحلة الثانية"
            style={{padding:"10px 14px",background:"transparent",color:ui.textSub,border:ui.border,borderRadius:6,fontSize:13,cursor:"not-allowed",fontFamily:ui.fontBody,width:"100%",opacity:0.7}}>
            📸 طلب صور إضافية
          </button>
        </>
      );
    }
    if (ret.status === "approved") {
      const canRefund = (ret.refund_method || "").length > 0;
      return (
        <>
          <button onClick={() => {
              if (!canRefund) { window.alert("اختر طريقة الاسترداد من بطاقة \"تفاصيل الاسترداد\" أولاً"); return; }
              const ref = window.prompt("رقم العملية أو المرجع البنكي (اختياري):") || "";
              onPatch(ret.id, { status:"refunded", refund_reference: ref || null });
            }}
            style={{padding:"10px 14px",background:"#15803D",color:"#fff",border:"none",borderRadius:6,fontSize:13,cursor:"pointer",fontFamily:ui.fontBody,width:"100%",marginBottom:8}}>
            💰 تنفيذ الاسترداد
          </button>
          {isSuper && (
            <button onClick={() => onPatch(ret.id, { status:"pending", reviewed_at: null, reviewed_by: null })}
              style={{padding:"10px 14px",background:"transparent",color:"#B91C1C",border:"1px solid #FCA5A5",borderRadius:6,fontSize:13,cursor:"pointer",fontFamily:ui.fontBody,width:"100%"}}>
              إلغاء الموافقة
            </button>
          )}
        </>
      );
    }
    if (ret.status === "refunded") {
      return (
        <>
          <div style={{padding:"10px 12px",background:"#F0FDF4",border:"0.5px solid #86EFAC",borderRadius:6,fontSize:12.5,color:"#15803D",fontFamily:ui.fontBody,marginBottom:8}}>
            ✓ تم الاسترداد بنجاح
            {ret.refund_reference && <div style={{fontSize:11,marginTop:4,fontFamily:"monospace",color:"#166534"}}>المرجع: {ret.refund_reference}</div>}
          </div>
          <button disabled title="سيتم تفعيل إرسال الإيصال في المرحلة الثانية"
            style={{padding:"10px 14px",background:"transparent",color:ui.textSub,border:ui.border,borderRadius:6,fontSize:13,cursor:"not-allowed",fontFamily:ui.fontBody,width:"100%",opacity:0.7}}>
            📧 إرسال إيصال الاسترداد
          </button>
        </>
      );
    }
    if (ret.status === "rejected") {
      return (
        <div style={{padding:"10px 12px",background:"#FEF2F2",border:"0.5px solid #FCA5A5",borderRadius:6,fontSize:12.5,color:"#B91C1C",fontFamily:ui.fontBody}}>
          تم رفض هذا المرتجع
          {ret.rejection_reason && <div style={{fontSize:11.5,marginTop:6,color:"#7F1D1D"}}>السبب: {ret.rejection_reason}</div>}
        </div>
      );
    }
    return null;
  };

  return (
    <div>
      {/* Top bar */}
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14,flexWrap:"wrap",gap:10}}>
        <div style={{display:"flex",alignItems:"center",gap:12,flexWrap:"wrap"}}>
          <button onClick={onBack}
            style={{background:"transparent",border:"none",color:"#1D4ED8",cursor:"pointer",fontFamily:ui.fontBody,fontSize:13}}>← العودة للمرتجعات</button>
          <h2 style={{fontSize:18,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:0,display:"flex",alignItems:"center",gap:10}}>
            مرتجع {ret.return_number}
            <span style={{fontSize:11,padding:"3px 10px",borderRadius:20,background:b.bg,color:b.fg,fontFamily:ui.fontBody}}>{b.l}</span>
          </h2>
        </div>
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          <button onClick={() => printReturnSlip(ret)}
            style={{padding:"7px 12px",background:ui.cardBg,color:ui.text,border:ui.border,borderRadius:6,fontSize:12,cursor:"pointer",fontFamily:ui.fontBody}}>
            🖨️ طباعة بوليصة الإرجاع
          </button>
          {ret.customer && ret.customer.phone && (
            <a href={`https://wa.me/2${(ret.customer.phone || "").replace(/[^\d]/g,"")}`} target="_blank" rel="noreferrer"
              style={{padding:"7px 12px",background:"#25D366",color:"#fff",border:"none",borderRadius:6,fontSize:12,textDecoration:"none",fontFamily:ui.fontBody}}>
              📞 واتساب
            </a>
          )}
        </div>
      </div>

      {/* Two-column layout — collapses to one column on mobile */}
      <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"2fr 1fr",gap:12,alignItems:"start"}}>
        {/* ═════════ LEFT COLUMN ═════════ */}
        <div>
          {/* CARD 1 — Status timeline */}
          <div style={card}>
            <div style={cardTitle}>مسار الطلب</div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",direction:"rtl",gap:6,flexWrap:"wrap"}}>
              {(isRejected
                ? [baseSteps[0], { k:"rejected", l:"مرفوض", at: ret.reviewed_at, by: ret.reviewed_by }]
                : baseSteps
              ).map((step, i, arr) => {
                const done = isRejected ? step.k === "rejected" || step.k === "pending" : i <= stepIdx;
                const current = !isRejected && i === stepIdx;
                const bgCircle = isRejected && step.k === "rejected" ? "#DC2626" : done ? "#16A34A" : "#E5E7EB";
                return (
                  <React.Fragment key={step.k}>
                    <div style={{flex:1,minWidth:90,display:"flex",flexDirection:"column",alignItems:"center",gap:4}}>
                      <div style={{width:28,height:28,borderRadius:"50%",background:bgCircle,display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:13,fontWeight:600,boxShadow: current ? "0 0 0 4px rgba(22,163,74,.2)" : "none"}}>
                        {done ? (isRejected && step.k === "rejected" ? "✗" : "✓") : (i+1)}
                      </div>
                      <div style={{fontSize:11.5,color: done ? ui.text : ui.textSub,fontFamily:ui.fontBody,textAlign:"center"}}>{step.l}</div>
                      {step.at && (
                        <div style={{fontSize:10,color:ui.textSub,fontFamily:ui.fontBody,textAlign:"center",lineHeight:1.4}}>
                          {String(step.at).slice(5,16).replace(" ", " · ")}
                          {step.by && <div style={{fontSize:9.5}}>{step.by}</div>}
                        </div>
                      )}
                    </div>
                    {i < arr.length - 1 && <div style={{flex:1,height:2,background: i < stepIdx ? "#16A34A" : "#E5E7EB",alignSelf:"flex-start",marginTop:14}}/>}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* CARD 2 — Original order */}
          <div style={card}>
            <div style={cardTitle}>الطلب الأصلي</div>
            {ret.order ? (
              <div style={{display:"grid",gridTemplateColumns:mob?"1fr":"1fr 1fr",gap:10,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text}}>
                <div>رقم الطلب: <a href={`#admin/orders/${encodeURIComponent(ret.order.id)}`} style={{color:"#1D4ED8",textDecoration:"none",fontFamily:"monospace"}}>#{ret.order.order_number || ret.order.id}</a></div>
                <div>التاريخ: {ret.order.date || (ret.order.created_at && String(ret.order.created_at).slice(0,10)) || "—"}</div>
                <div>إجمالي الطلب: <b>{(Number(ret.order.total)||0).toLocaleString()} ج</b></div>
                <div>الحالة الحالية للطلب: {ret.order.status || "—"}</div>
                {windowInfo && (
                  <div style={{gridColumn:mob?"1":"1 / -1",marginTop:6}}>
                    {windowInfo.remainingDays >= 0 ? (
                      <span style={{color:ui.textSub,fontSize:12}}>
                        تم التسليم منذ {windowInfo.sinceDays} يوم (متبقي {windowInfo.remainingDays} يوم لانتهاء مدة الإرجاع)
                      </span>
                    ) : (
                      <span style={{color:"#B91C1C",fontSize:12,fontWeight:500}}>
                        ⚠ انتهت مدة الإرجاع المسموح بها (بعد {Math.abs(windowInfo.remainingDays)} يوم من المهلة)
                      </span>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>لا يوجد سجل للطلب الأصلي</div>
            )}
          </div>

          {/* CARD 3 — Returned products */}
          <div style={card}>
            <div style={cardTitle}>المنتجات المُرجعة ({(ret.items || []).length || (ret.product ? 1 : 0)})</div>
            {(ret.items || []).length === 0 ? (
              <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                {ret.product
                  ? <>منتج واحد (إدخال قديم): <b>{ret.product}</b> · المبلغ {(Number(ret.amount)||0).toLocaleString()} ج</>
                  : "لا توجد منتجات مرتبطة"}
              </div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {ret.items.map(it => (
                  <div key={it.id} style={{display:"grid",gridTemplateColumns:mob?"1fr":"56px 1fr auto",gap:10,padding:"10px",border:"0.5px solid #EEE",borderRadius:6,alignItems:"center"}}>
                    <div style={{width:56,height:56,background:"#F3F4F6",borderRadius:5,overflow:"hidden",display:"flex",alignItems:"center",justifyContent:"center"}}>
                      {it.product_image ? <img src={it.product_image} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/> : <span style={{fontSize:22}}>📦</span>}
                    </div>
                    <div>
                      <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,fontWeight:500}}>{it.product_name || "—"}</div>
                      {it.sku && <div style={{fontSize:11,color:ui.textSub,fontFamily:"monospace"}}>SKU: {it.sku}</div>}
                      <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:3}}>
                        السعر: {(Number(it.unit_price)||0).toLocaleString()} ج · الكمية المُرجعة: {it.quantity} · القيمة: {(Number(it.refund_amount)||0).toLocaleString()} ج
                      </div>
                    </div>
                    <div style={{display:"flex",flexDirection:"column",gap:5,minWidth:160}}>
                      <select value={it.condition || "pending"}
                        disabled={ret.status === "refunded" || ret.status === "rejected"}
                        onChange={e => { const c = e.target.value; updateItem(it.id, { condition: c, restock_action: suggestRestock(c) }); }}
                        style={{padding:"5px 8px",border:ui.border,borderRadius:5,fontSize:11.5,fontFamily:ui.fontBody,direction:"rtl"}}>
                        <option value="pending">بانتظار الفحص</option>
                        <option value="good">سليم</option>
                        <option value="partial_damage">تالف جزئياً</option>
                        <option value="full_damage">تالف كلياً</option>
                      </select>
                      <select value={it.restock_action || "pending"}
                        disabled={ret.status === "refunded" || ret.status === "rejected"}
                        onChange={e => updateItem(it.id, { restock_action: e.target.value })}
                        style={{padding:"5px 8px",border:ui.border,borderRadius:5,fontSize:11.5,fontFamily:ui.fontBody,direction:"rtl"}}>
                        <option value="pending">قرار المخزون</option>
                        <option value="restock_available">إعادة للمخزون المتاح</option>
                        <option value="move_to_damaged">نقل لمخزون التالف</option>
                        <option value="write_off">إتلاف</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,marginTop:8,fontStyle:"italic"}}>
              ⚙ تطبيق قرار المخزون فعلياً على الكمية المتاحة/التالفة سيتم في المرحلة الثانية مع تكامل المالية.
            </div>
          </div>

          {/* CARD 4 — Customer reason & notes */}
          <div style={card}>
            <div style={cardTitle}>سبب الإرجاع وملاحظات العميل</div>
            <div style={{fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,marginBottom:6}}>
              السبب: <b>{ret.reason_label || ret.reason || "—"}</b>
            </div>
            {ret.customer_notes && (
              <div style={{padding:"8px 11px",background:"#F9FAFB",border:"0.5px solid #EEE",borderRadius:5,fontSize:12.5,color:ui.text,fontFamily:ui.fontBody,marginBottom:8,whiteSpace:"pre-wrap"}}>{ret.customer_notes}</div>
            )}
            {(ret.attachments || []).length > 0 && (
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {ret.attachments.map(a => (
                  <a key={a.id} href={a.file_path} target="_blank" rel="noreferrer"
                    style={{width:60,height:60,background:"#F3F4F6",borderRadius:5,overflow:"hidden",border:"0.5px solid #E5E5E5"}}>
                    <img src={a.file_path} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* CARD 5 — Refund breakdown */}
          <div style={card}>
            <div style={cardTitle}>تفاصيل الاسترداد المالي</div>
            <div style={{display:"flex",flexDirection:"column",gap:7,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text}}>
              <div style={{display:"flex",justifyContent:"space-between"}}>
                <span>قيمة المنتجات المُرجعة</span><span>{itemsRefund.toLocaleString()} ج</span>
              </div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <span style={{display:"flex",alignItems:"center",gap:6}}>
                  تكلفة الشحن
                  <label style={{display:"flex",alignItems:"center",gap:4,fontSize:11,color:ui.textSub,cursor: ret.status === "pending" || ret.status === "approved" ? "pointer" : "default"}}>
                    <input type="checkbox" checked={!!ret.refund_shipping}
                      disabled={ret.status === "refunded" || ret.status === "rejected"}
                      onChange={e => onPatch(ret.id, { refund_shipping: e.target.checked })}/>
                    استرداد
                  </label>
                </span>
                <span>{ret.refund_shipping ? `${shippingRefund.toLocaleString()} ج` : "—"}</span>
              </div>
              {discountRefund > 0 && (
                <div style={{display:"flex",justifyContent:"space-between"}}>
                  <span>الخصم المسترد (كوبون نسبي)</span><span>−{discountRefund.toLocaleString()} ج</span>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",paddingTop:8,borderTop:"1px dashed #E5E5E5",fontWeight:600,fontSize:14}}>
                <span>الإجمالي المسترد</span><span>{(Number(totalRefund) || 0).toLocaleString()} ج</span>
              </div>
            </div>
            <div style={{marginTop:12}}>
              <label style={{display:"block",fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:5}}>طريقة الاسترداد</label>
              <select value={ret.refund_method || ""}
                disabled={ret.status === "refunded" || ret.status === "rejected"}
                onChange={e => onPatch(ret.id, { refund_method: e.target.value })}
                style={{padding:"7px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none",direction:"rtl",minWidth:240}}>
                <option value="">— اختر طريقة —</option>
                <option value="cash">كاش (عند استلام المرتجع)</option>
                <option value="transfer">تحويل بنكي</option>
                <option value="wallet">محفظة إلكترونية</option>
                <option value="store_credit">رصيد للمتجر (+5% مكافأة في المرحلة الثانية)</option>
                <option value="exchange">استبدال بمنتج آخر (بدون استرداد)</option>
              </select>
            </div>
          </div>

          {/* CARD 6 — Activity log */}
          <div style={card}>
            <div style={cardTitle}>سجل النشاط</div>
            {(ret.activity || []).length === 0 ? (
              <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>لا يوجد نشاط مُسجل بعد</div>
            ) : (
              <div style={{display:"flex",flexDirection:"column",gap:8}}>
                {ret.activity.map(a => (
                  <div key={a.id} style={{display:"flex",gap:10,fontSize:12.5,fontFamily:ui.fontBody,color:ui.text,paddingBottom:8,borderBottom:"0.5px dashed #EEE"}}>
                    <div style={{width:24,height:24,borderRadius:"50%",background: a.event_type === "rejected" ? "#FEE2E2" : a.event_type === "approved" || a.event_type === "refunded" ? "#DCFCE7" : "#F3F4F6",display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,flexShrink:0}}>
                      {a.event_type === "submitted" ? "📥" : a.event_type === "approved" ? "✓" : a.event_type === "rejected" ? "✗" : a.event_type === "refunded" ? "💰" : a.event_type === "inspected" ? "🔍" : a.event_type === "note_added" ? "📝" : "•"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div>{a.event_type === "submitted" ? "تم تقديم طلب الإرجاع" : a.event_type === "approved" ? "تمت الموافقة على الإرجاع" : a.event_type === "rejected" ? `تم رفض الإرجاع${a.event_data && a.event_data.reason ? ` — ${a.event_data.reason}` : ""}` : a.event_type === "refunded" ? "تم تنفيذ الاسترداد" : a.event_type === "inspected" ? "تم فحص المنتجات" : a.event_type === "note_added" ? "تمت إضافة ملاحظة داخلية" : a.event_type}</div>
                      <div style={{fontSize:10.5,color:ui.textSub}}>
                        {a.actor_name || a.actor_id || "النظام"} · {a.created_at && String(a.created_at).slice(0,16).replace(" ", " · ")}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD 7 — Internal notes */}
          <div style={card}>
            <div style={cardTitle}>ملاحظات داخلية</div>
            {ret.internal_notes && (
              <div style={{padding:"8px 11px",background:"#FFFBEB",border:"0.5px solid #FDE68A",borderRadius:5,fontSize:12,color:"#92400E",fontFamily:ui.fontBody,marginBottom:8,whiteSpace:"pre-wrap"}}>{ret.internal_notes}</div>
            )}
            <textarea rows={2} value={noteDraft} onChange={e => setNoteDraft(e.target.value)}
              placeholder="أضف ملاحظة داخلية (لن تظهر للعميل)"
              style={{width:"100%",padding:"8px 11px",border:ui.border,borderRadius:6,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none",direction:"rtl",resize:"vertical",boxSizing:"border-box"}}/>
            <div style={{textAlign:"left",marginTop:6}}>
              <button onClick={submitNote} disabled={noteBusy || noteDraft.trim().length < 2}
                style={{padding:"6px 14px",background: (noteBusy || noteDraft.trim().length < 2) ? "#9CA3AF" : ui.text,color:"#fff",border:"none",borderRadius:5,fontSize:12,cursor:(noteBusy || noteDraft.trim().length < 2) ? "not-allowed" : "pointer",fontFamily:ui.fontBody}}>
                {noteBusy ? "..." : "إضافة"}
              </button>
            </div>
          </div>
        </div>

        {/* ═════════ RIGHT SIDEBAR ═════════ */}
        <div>
          {/* CARD A — Customer */}
          <div style={card}>
            <div style={cardTitle}>معلومات العميل</div>
            {ret.customer ? (
              <>
                <div style={{fontSize:14,color:ui.text,fontFamily:ui.fontBody,fontWeight:600,marginBottom:3}}>{ret.customer.name || "—"}</div>
                <div style={{fontSize:11.5,color:ui.textSub,fontFamily:"monospace",marginBottom:3}}>{ret.customer.email}</div>
                {ret.customer.phone && <div style={{fontSize:11.5,color:ui.textSub,fontFamily:"monospace",marginBottom:8}}>📱 {ret.customer.phone}</div>}
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontFamily:ui.fontBody,fontSize:11.5,color:ui.textSub,marginTop:8,paddingTop:8,borderTop:"0.5px dashed #EEE"}}>
                  <div>طلبات سابقة: <b style={{color:ui.text}}>{ret.customer.totalOrders || 0}</b></div>
                  <div>مرتجعات سابقة: <b style={{color: (ret.customer.total_returns || 0) >= 3 ? "#B91C1C" : ui.text}}>{ret.customer.total_returns || 0}</b></div>
                </div>
                {(Number(ret.customer.store_credit_balance) || 0) > 0 && (
                  <div style={{marginTop:8,padding:"6px 10px",background:"#F0FDF4",border:"0.5px solid #86EFAC",borderRadius:5,fontSize:11.5,color:"#15803D",fontFamily:ui.fontBody,display:"flex",justifyContent:"space-between"}}>
                    <span>رصيد متجر</span>
                    <b>{Number(ret.customer.store_credit_balance).toLocaleString()} ج</b>
                  </div>
                )}
                <a href={`#admin/customers/${encodeURIComponent(ret.customer.email)}`}
                  style={{display:"inline-block",marginTop:10,fontSize:11.5,color:"#1D4ED8",textDecoration:"none",fontFamily:ui.fontBody}}>
                  عرض ملف العميل الكامل ←
                </a>
              </>
            ) : (
              <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                {ret.customer_email || ret.customer || "—"}
              </div>
            )}
          </div>

          {/* CARD B — Status-driven action buttons */}
          <div style={{...card,position:"sticky",top:14}}>
            <div style={cardTitle}>إجراءات</div>
            <ActionButtons />
          </div>

          {/* CARD C — Return shipping info */}
          <div style={card}>
            <div style={cardTitle}>معلومات الشحن المرتجع</div>
            <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:8}}>كيف يصلنا المنتج المُرجع؟</div>
            <select value={ret.pickup_method || "customer_ships"}
              disabled={ret.status === "refunded" || ret.status === "rejected"}
              onChange={e => onPatch(ret.id, { pickup_method: e.target.value })}
              style={{width:"100%",padding:"7px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,outline:"none",direction:"rtl",marginBottom:8}}>
              <option value="customer_ships">العميل يُرسل بنفسه</option>
              <option value="home_pickup">استلام من المنزل</option>
            </select>
            {ret.pickup_method === "home_pickup" && (
              <input value={ret.pickup_address || ""}
                onChange={e => onPatch(ret.id, { pickup_address: e.target.value })}
                placeholder="عنوان الاستلام"
                style={{width:"100%",padding:"7px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none",direction:"rtl",boxSizing:"border-box",marginBottom:8}}/>
            )}
            {ret.pickup_method !== "home_pickup" && (
              <input value={ret.return_tracking || ""}
                onChange={e => onPatch(ret.id, { return_tracking: e.target.value })}
                placeholder="رقم تتبع الشحنة المرتجعة"
                style={{width:"100%",padding:"7px 10px",border:ui.border,borderRadius:6,background:ui.cardBg,fontFamily:ui.fontBody,fontSize:12,color:ui.text,outline:"none",direction:"ltr",textAlign:"left",boxSizing:"border-box"}}/>
            )}
          </div>
        </div>
      </div>

      {/* Reject modal */}
      {rejectOpen && (
        <div onClick={() => setRejectOpen(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:700,display:"flex",alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
          <div onClick={e => e.stopPropagation()}
            style={{background:ui.cardBg,maxWidth:440,width:"100%",padding:22,borderRadius:8}}>
            <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"0 0 4px"}}>رفض الإرجاع</h3>
            <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:14}}>{ret.return_number}</div>
            <label style={{display:"block",fontSize:12,color:ui.text,marginBottom:5,fontFamily:ui.fontBody,fontWeight:500}}>
              سبب الرفض (سيظهر للعميل)
            </label>
            <textarea rows={3} autoFocus value={rejectNote} onChange={e => setRejectNote(e.target.value)}
              placeholder="مثال: المنتج تم استخدامه — يتعذّر إرجاعه"
              style={{padding:"8px 12px",border:"1px solid #FCA5A5",borderRadius:6,background:"#FEF2F2",fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",width:"100%",direction:"rtl",resize:"vertical",minHeight:80,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
              <button onClick={() => setRejectOpen(false)}
                style={{padding:"8px 16px",background:"transparent",border:ui.border,borderRadius:6,fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,cursor:"pointer"}}>إلغاء</button>
              <button disabled={rejectNote.trim().length < 3}
                onClick={() => { onPatch(ret.id, { status:"rejected", rejection_reason: rejectNote.trim() }); setRejectOpen(false); setRejectNote(""); }}
                style={{padding:"8px 18px",background: rejectNote.trim().length >= 3 ? "#DC2626" : "#9CA3AF",color:"#fff",border:"none",borderRadius:6,fontSize:12.5,fontFamily:ui.fontBody,cursor: rejectNote.trim().length >= 3 ? "pointer" : "not-allowed"}}>
                إرسال الرفض
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetailPage({
  order, orderId, onBack, onStatusChange, canManage,
  thumbForItem, payLabel, payStyle, badgeStyle, ui, mob, refreshOrders,
}) {
  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [emailBusy, setEmailBusy] = useState(false);
  const [emailFeedback, setEmailFeedback] = useState("");
  const [copyFeedback, setCopyFeedback] = useState("");
  const [, tickClock] = useState(0);
  // Shipment for this order — null = none yet; object = exists. We poll on
  // mount + after a successful "شحن الطلب" POST so the badge updates live.
  const [shipment,  setShipment]  = useState(null);
  const [shipBusy,  setShipBusy]  = useState(false);
  const [shipError, setShipError] = useState("");

  useEffect(() => { injectPrintStyles(); }, []);
  // Re-render every minute so relative "since X" timestamps stay current.
  useEffect(() => {
    const i = setInterval(() => tickClock(n => n + 1), 60000);
    return () => clearInterval(i);
  }, []);
  // Look up an existing shipment for this order. The list endpoint accepts
  // ?order_id=X (added in P1 backend). One order → max one shipment by
  // current design; we take rows[0] if any.
  useEffect(() => {
    if (!orderId) return;
    let cancelled = false;
    fetch(`/api/shipments?order_id=${encodeURIComponent(orderId)}&perPage=1`)
      .then(r => r.ok ? r.json() : { rows:[] })
      .then(d => { if (!cancelled) setShipment((d.rows && d.rows[0]) || null); })
      .catch(() => {});
    return () => { cancelled = true; };
  }, [orderId]);
  const createShipment = async () => {
    setShipBusy(true); setShipError("");
    try {
      const r = await fetch("/api/shipments", {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ order_id: orderId }),
      });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) { setShipError(d.error || `HTTP ${r.status}`); return; }
      setShipment(d.shipment || d);
    } catch (e) { setShipError(e.message || "تعذّر إنشاء الشحنة"); }
    finally { setShipBusy(false); }
  };
  const shipStatusBadge = (s) => ({
    ready:     { bg:"#FEF3C7", fg:"#92400E", l:"جاهز للشحن" },
    shipped:   { bg:"#DBEAFE", fg:"#1D4ED8", l:"تم الشحن" },
    delivered: { bg:"#DCFCE7", fg:"#15803D", l:"تم التسليم" },
    returned:  { bg:"#FEE2E2", fg:"#B91C1C", l:"مرتجع للمتجر" },
    cancelled: { bg:"#F3F4F6", fg:"#525252", l:"ملغي" },
  }[s] || { bg:"#F3F4F6", fg:"#525252", l: s || "—" });

  if (!order) {
    return (
      <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"40px 22px",textAlign:"center"}}>
        <div style={{fontSize:32,marginBottom:10}}>🔍</div>
        <div style={{fontSize:14,color:ui.text,fontFamily:ui.fontBody,fontWeight:500,marginBottom:6}}>الطلب غير موجود</div>
        <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:14}}>الرقم: {orderId}</div>
        <button onClick={onBack}
          style={{padding:"8px 18px",border:ui.border,borderRadius:6,background:ui.cardBg,
            fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,cursor:"pointer"}}>← رجوع للطلبات</button>
      </div>
    );
  }

  const orderNum = order.order_number || order.id;
  const items    = order.items || [];
  const pm       = order.payment_method || "cash";
  const ps       = order.payment_status || "unpaid";

  // Price breakdown — fall back to computed values when older orders didn't
  // store subtotal/shipping/discount (older orders just have `total`).
  const subtotal = order.subtotal != null
    ? Number(order.subtotal)
    : items.reduce((s,i) => s + (Number(i.price)||0) * (Number(i.qty)||0), 0);
  const shipping = order.shipping_cost != null ? Number(order.shipping_cost) : null;
  const discount = order.discount_amount != null ? Number(order.discount_amount) : 0;
  const total    = Number(order.total) || 0;

  // ── Action handlers ────────────────────────────────────────────────────────
  const handlePrint = () => {
    document.body.classList.add("nawra-print-mode");
    const cleanup = () => {
      document.body.classList.remove("nawra-print-mode");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    setTimeout(cleanup, 3000);
    window.print();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(`#${orderNum}`);
      setCopyFeedback("تم النسخ ✓");
      setTimeout(()=>setCopyFeedback(""), 1500);
    } catch {
      setCopyFeedback("فشل النسخ");
      setTimeout(()=>setCopyFeedback(""), 1500);
    }
  };

  const handleEmailInvoice = async () => {
    if (!order.userEmail) {
      setEmailFeedback("لا يوجد إيميل للعميل");
      setTimeout(()=>setEmailFeedback(""), 2500);
      return;
    }
    setEmailBusy(true);
    setEmailFeedback("");
    try {
      const r = await fetch(`/api/orders/${order.id}/email-invoice`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!r.ok) {
        const e = await r.json().catch(()=>({error:`HTTP ${r.status}`}));
        throw new Error(e.error || `HTTP ${r.status}`);
      }
      setEmailFeedback(`تم الإرسال إلى ${order.userEmail} ✓`);
    } catch (e) {
      setEmailFeedback(`فشل الإرسال: ${e.message}`);
    } finally {
      setEmailBusy(false);
      setTimeout(()=>setEmailFeedback(""), 3000);
    }
  };

  const waHref = (() => {
    if (!order.phone) return null;
    const digits = String(order.phone).replace(/\D/g, "");
    if (!digits) return null;
    // assume Egyptian numbers — prepend country code if user typed local
    const norm = digits.startsWith("20") ? digits : `20${digits.replace(/^0+/, "")}`;
    return `https://wa.me/${norm}`;
  })();

  // Whatsapp + Email + Print + PDF + Copy
  const actionBtnStyle = {
    background:"transparent",border:ui.border,padding:"7px 12px",cursor:"pointer",
    fontFamily:ui.fontBody,fontSize:12.5,color:ui.text,borderRadius:6,
    display:"inline-flex",alignItems:"center",gap:6,whiteSpace:"nowrap",textDecoration:"none",
  };

  // ── RTL stepper data ──────────────────────────────────────────────────────
  const STEPS = [
    { key: "جديد",        label: "تم الاستلام" },
    { key: "قيد التجهيز", label: "قيد التجهيز" },
    { key: "تم الشحن",    label: "تم الشحن"    },
    { key: "مكتمل",       label: "تم التسليم"  },
  ];
  const stepIdx = order.status === "ملغي" ? -1 : Math.max(0, STEPS.findIndex(s => s.key === order.status));

  // ── Activity timeline data ─────────────────────────────────────────────────
  const history = Array.isArray(order.status_history) ? order.status_history : [];

  const fmtDate = (iso) => {
    if (!iso) return "—";
    const d = new Date(iso);
    if (isNaN(d)) return iso;
    return d.toLocaleString("ar-EG", { dateStyle: "short", timeStyle: "short" });
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="order-print-card" style={{direction:"rtl",paddingBottom: canManage ? 80 : 12}}>
      {/* Top action bar */}
      <div className="no-print" style={{display:"flex",alignItems:"center",justifyContent:"space-between",
        flexWrap:"wrap",gap:10,marginBottom:14}}>
        <button onClick={onBack}
          style={{background:"transparent",border:"none",cursor:"pointer",fontFamily:ui.fontBody,
            fontSize:13,color:ui.textSub,display:"flex",alignItems:"center",gap:6,padding:"6px 4px"}}>
          ← رجوع للطلبات
        </button>
        <div style={{display:"flex",flexWrap:"wrap",gap:8,alignItems:"center"}}>
          {waHref && (
            <a href={waHref} target="_blank" rel="noreferrer" style={{...actionBtnStyle,background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#15803D"}}>
              📞 واتساب
            </a>
          )}
          {/* Shipping: either "create shipment" button OR a passive pill
              showing the existing AWB + status. Pill is non-interactive —
              admin reviews the AWB number visibly; full shipment management
              lives on the "الشحن" page in the sidebar. */}
          {shipment ? (
            <span title={`AWB ${shipment.awb_number}`}
              style={{...actionBtnStyle, background:shipStatusBadge(shipment.status).bg, border:`1px solid ${shipStatusBadge(shipment.status).fg}33`, color:shipStatusBadge(shipment.status).fg, cursor:"default"}}>
              📦 {shipment.awb_number} · {shipStatusBadge(shipment.status).l}
            </span>
          ) : (
            <button onClick={createShipment} disabled={shipBusy || !canManage}
              title={canManage ? "إنشاء بوليصة شحن" : "تتطلب صلاحية إدارة الطلبات"}
              style={{...actionBtnStyle, background:ui.text, color:"#fff", border:"none",
                opacity: (shipBusy || !canManage) ? 0.55 : 1,
                cursor: (shipBusy || !canManage) ? "not-allowed" : "pointer"}}>
              📦 {shipBusy ? "جارٍ الإنشاء..." : "شحن الطلب"}
            </button>
          )}
          <button onClick={handleEmailInvoice} disabled={emailBusy || !order.userEmail}
            title={order.userEmail ? `إرسال إلى ${order.userEmail}` : "لا يوجد إيميل للعميل"}
            style={{...actionBtnStyle, opacity: (emailBusy || !order.userEmail) ? 0.55 : 1,
              cursor: (emailBusy || !order.userEmail) ? "not-allowed" : "pointer"}}>
            📧 {emailBusy ? "جارٍ الإرسال..." : "إرسال الفاتورة"}
          </button>
          <button onClick={handlePrint} style={actionBtnStyle}>📄 PDF</button>
          <button onClick={handlePrint} style={actionBtnStyle}>🖨 طباعة</button>
          <button onClick={handleCopy} style={actionBtnStyle}>📋 نسخ الرقم</button>
        </div>
      </div>
      {(emailFeedback || copyFeedback) && (
        <div className="no-print" style={{marginBottom:10,padding:"7px 12px",borderRadius:6,
          background:"#F0FDF4",border:"1px solid #BBF7D0",color:"#15803D",fontSize:12,fontFamily:ui.fontBody}}>
          {emailFeedback || copyFeedback}
        </div>
      )}
      {shipError && (
        <div className="no-print" style={{marginBottom:10,padding:"7px 12px",borderRadius:6,
          background:"#FEF2F2",border:"1px solid #FCA5A5",color:"#B91C1C",fontSize:12,fontFamily:ui.fontBody}}>
          ⚠ تعذّر إنشاء الشحنة: {shipError}
        </div>
      )}

      {/* Header card */}
      <div style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"18px 20px",marginBottom:12}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",gap:14,flexWrap:"wrap"}}>
          <div>
            <div style={{fontSize:11,color:ui.textSub,fontFamily:ui.fontBody,letterSpacing:".08em",marginBottom:4}}>رقم الطلب</div>
            <div style={{fontSize:22,color:ui.text,fontFamily:"monospace",fontWeight:700}}>#{orderNum}</div>
            <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginTop:4}}>
              {order.date || (order.created_at ? fmtDate(order.created_at) : "—")}
            </div>
          </div>
          <div style={{textAlign:"left"}}>
            {(() => { const b = badgeStyle(order.status); return (
              <span style={{fontSize:12,padding:"5px 14px",borderRadius:20,background:b.bg,color:b.fg,fontFamily:ui.fontBody,fontWeight:600}}>
                {order.status}
              </span>
            ); })()}
            <div style={{fontSize:18,color:ui.text,fontFamily:ui.fontBody,fontWeight:600,marginTop:8}}>
              {total.toLocaleString()} <span style={{fontSize:12,color:ui.textSub,fontWeight:400}}>ج</span>
            </div>
          </div>
        </div>

        {/* RTL status stepper — right (first) → left (last) for Arabic flow */}
        <div style={{marginTop:18}}>
          {order.status === "ملغي" ? (
            <div style={{padding:"10px 14px",background:"#FEE2E2",color:"#B91C1C",fontFamily:ui.fontBody,fontSize:13,borderRadius:6,borderInlineStart:"3px solid #DC2626"}}>
              ❌ تم إلغاء الطلب{order.cancellation_reason ? ` — ${order.cancellation_reason}` : ""}
            </div>
          ) : (
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",position:"relative",direction:"rtl"}}>
              {STEPS.map((s, i) => {
                const done   = i <= stepIdx;
                const isCur  = i === stepIdx;
                const isLast = i === STEPS.length - 1;
                const nextDone = i + 1 <= stepIdx;
                return (
                  <React.Fragment key={s.key}>
                    <div style={{display:"flex",flexDirection:"column",alignItems:"center",flex:"0 0 auto",position:"relative",zIndex:2}}>
                      <div style={{
                        width:34,height:34,borderRadius:"50%",
                        background: done ? "#22C55E" : isCur ? "#3B82F6" : "#F3F4F6",
                        color: done || isCur ? "#fff" : "#9CA3AF",
                        display:"flex",alignItems:"center",justifyContent:"center",
                        fontSize:14,fontWeight:600,
                        border: isCur ? "3px solid #DBEAFE" : "none",
                        boxShadow: isCur ? "0 0 0 4px rgba(59,130,246,.18)" : "none",
                        animation: isCur ? "nawraPulse 1.8s ease-in-out infinite" : "none",
                        transition:"all .25s",
                      }}>
                        {done ? "✓" : i + 1}
                      </div>
                      <div style={{fontSize:11,fontFamily:ui.fontBody,marginTop:6,color: done || isCur ? ui.text : ui.textSub,fontWeight: isCur ? 600 : 400,whiteSpace:"nowrap"}}>
                        {s.label}
                      </div>
                    </div>
                    {!isLast && (
                      <div style={{flex:1,height:2,background: nextDone ? "#22C55E" : "#E5E7EB",margin:"0 6px",position:"relative",top:-12,transition:"background .3s"}}/>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          )}
        </div>
        {/* Pulse keyframes — inline so they're available without a CSS file */}
        <style>{`@keyframes nawraPulse { 0%,100%{box-shadow:0 0 0 4px rgba(59,130,246,.18);} 50%{box-shadow:0 0 0 8px rgba(59,130,246,.08);} }`}</style>
      </div>

      {/* Two-column main content — collapses to single column on mobile */}
      <div style={{display:"grid",gap:12,gridTemplateColumns: mob ? "1fr" : "1.6fr 1fr"}}>
        {/* LEFT column: items + breakdown + notes + timeline */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          {/* Items */}
          <section style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"16px 18px"}}>
            <h3 style={{fontFamily:ui.fontBody,fontSize:13,fontWeight:600,color:ui.text,margin:"0 0 12px"}}>🛍️ المنتجات ({items.length})</h3>
            <div style={{display:"flex",flexDirection:"column"}}>
              {items.map((it, i) => {
                const thumb = thumbForItem(it);
                const line = (Number(it.price)||0) * (Number(it.qty)||0);
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:12,padding:"10px 0",
                    borderTop: i ? "0.5px solid #EEE" : "none"}}>
                    <div style={{width:46,height:46,flexShrink:0,borderRadius:6,overflow:"hidden",background:"#F3F4F6",
                      display:"flex",alignItems:"center",justifyContent:"center",fontSize:20}}>
                      {thumb
                        ? <img src={thumb} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                        : "🧴"}
                    </div>
                    <div style={{flex:1,minWidth:0}}>
                      <div style={{fontSize:13.5,color:ui.text,fontFamily:ui.fontBody,fontWeight:500,
                        overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{it.name}</div>
                      <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>
                        {Number(it.price)||0} ج × {it.qty}
                      </div>
                    </div>
                    <div style={{fontSize:13.5,color:ui.text,fontFamily:ui.fontBody,fontWeight:600,whiteSpace:"nowrap"}}>
                      {line.toLocaleString()} ج
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Price breakdown */}
            <div style={{marginTop:14,paddingTop:12,borderTop:"1px dashed #E5E5E5"}}>
              <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                <span>المجموع الفرعي</span><span>{subtotal.toLocaleString()} ج</span>
              </div>
              {shipping != null && (
                <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>
                  <span>الشحن</span><span>{shipping > 0 ? `${shipping.toLocaleString()} ج` : "مجاني"}</span>
                </div>
              )}
              {discount > 0 && (
                <div style={{display:"flex",justifyContent:"space-between",padding:"4px 0",fontSize:12.5,color:"#DC2626",fontFamily:ui.fontBody}}>
                  <span>الخصم {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                  <span>− {discount.toLocaleString()} ج</span>
                </div>
              )}
              <div style={{display:"flex",justifyContent:"space-between",padding:"10px 0 2px",
                marginTop:6,borderTop:"1px solid #E5E5E5",fontSize:16,color:ui.text,fontFamily:ui.fontBody,fontWeight:700}}>
                <span>الإجمالي النهائي</span><span>{total.toLocaleString()} ج</span>
              </div>
            </div>
          </section>

          {/* Customer notes — only when present */}
          {order.customer_notes && order.customer_notes.trim() && (
            <section style={{background:"#FFFBEB",border:"1px solid #FDE68A",borderRadius:ui.radius,padding:"14px 16px"}}>
              <h3 style={{fontFamily:ui.fontBody,fontSize:13,fontWeight:600,color:"#92400E",margin:"0 0 6px"}}>📝 ملاحظات العميل</h3>
              <p style={{margin:0,fontSize:13,color:"#7C2D12",fontFamily:ui.fontBody,lineHeight:1.7,whiteSpace:"pre-wrap"}}>
                {order.customer_notes}
              </p>
            </section>
          )}

          {/* Activity timeline */}
          <section style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"16px 18px"}}>
            <h3 style={{fontFamily:ui.fontBody,fontSize:13,fontWeight:600,color:ui.text,margin:"0 0 12px"}}>🕒 سجل النشاط</h3>
            {history.length === 0 ? (
              <p style={{margin:0,fontSize:12,color:ui.textSub,fontFamily:ui.fontBody}}>لا توجد أحداث مسجلة</p>
            ) : (
              <div style={{position:"relative"}}>
                <div style={{position:"absolute",top:6,bottom:6,insetInlineStart:9,width:2,background:"#E5E7EB"}}/>
                {history.slice().reverse().map((h, i) => (
                  <div key={i} style={{position:"relative",paddingInlineStart:28,paddingBottom:14}}>
                    <div style={{position:"absolute",insetInlineStart:3,top:3,width:14,height:14,borderRadius:"50%",
                      background: i === 0 ? "#22C55E" : "#9CA3AF",border:"3px solid #fff",boxShadow:"0 0 0 1px #E5E7EB"}}/>
                    <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,fontWeight:500}}>{h.status}</div>
                    <div style={{fontSize:11.5,color:ui.textSub,fontFamily:ui.fontBody,marginTop:2}}>
                      {h.by_name || "—"} · {fmtDate(h.at)}
                    </div>
                    {h.note && (
                      <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginTop:3,fontStyle:"italic"}}>{h.note}</div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* RIGHT column: customer + address + payment */}
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <section style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
            <h3 style={{fontFamily:ui.fontBody,fontSize:13,fontWeight:600,color:ui.text,margin:"0 0 10px"}}>👤 العميل</h3>
            <div style={{fontSize:13.5,color:ui.text,fontFamily:ui.fontBody,fontWeight:500}}>{order.name || "—"}</div>
            <div style={{fontSize:12.5,color:ui.textSub,fontFamily:"monospace",direction:"ltr",textAlign:"right",marginTop:4}}>{order.phone || "—"}</div>
            {order.userEmail && (
              <div style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginTop:4,wordBreak:"break-all"}}>{order.userEmail}</div>
            )}
          </section>

          <section style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
            <h3 style={{fontFamily:ui.fontBody,fontSize:13,fontWeight:600,color:ui.text,margin:"0 0 10px"}}>📍 عنوان التوصيل</h3>
            <div style={{fontSize:13,color:ui.text,fontFamily:ui.fontBody,lineHeight:1.75}}>
              {order.address || "—"}
              {order.city && <><br/>{order.city}</>}
            </div>
            {order.lat && order.lng && (
              <a href={`https://www.google.com/maps?q=${order.lat},${order.lng}`} target="_blank" rel="noreferrer"
                style={{display:"inline-block",marginTop:8,fontSize:12,color:"#1D4ED8",fontFamily:ui.fontBody,textDecoration:"none"}}>
                🗺 فتح في الخريطة
              </a>
            )}
          </section>

          {/* Payment info — NEW per spec */}
          <section style={{background:ui.cardBg,border:ui.border,borderRadius:ui.radius,padding:"14px 16px"}}>
            <h3 style={{fontFamily:ui.fontBody,fontSize:13,fontWeight:600,color:ui.text,margin:"0 0 10px"}}>💳 معلومات الدفع</h3>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8}}>
              <span style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>طريقة الدفع</span>
              {(() => { const s = payStyle(pm); return (
                <span style={{fontSize:11.5,padding:"3px 10px",borderRadius:20,background:s.bg,color:s.fg,fontFamily:ui.fontBody,fontWeight:600}}>
                  {payLabel(pm)}
                </span>
              ); })()}
            </div>
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:order.payment_reference?8:0}}>
              <span style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>حالة الدفع</span>
              <div style={{display:"flex",alignItems:"center",gap:6}}>
                <span style={{fontSize:11.5,padding:"3px 10px",borderRadius:20,
                  background: ps === "paid" ? "#DCFCE7" : "#FEE2E2",
                  color: ps === "paid" ? "#15803D" : "#B91C1C",
                  fontFamily:ui.fontBody,fontWeight:600}}>
                  {ps === "paid" ? "مدفوع" : "غير مدفوع"}
                </span>
                {canManage && order.status !== "ملغي" && (
                  <button onClick={async ()=>{
                    await onStatusChange(order.id, {
                      payment_status: ps === "paid" ? "unpaid" : "paid",
                    });
                    refreshOrders && refreshOrders();
                  }}
                    title={ps === "paid" ? "تحديد كغير مدفوع" : "تحديد كمدفوع"}
                    style={{background:"transparent",border:ui.border,padding:"3px 8px",borderRadius:5,
                      fontFamily:ui.fontBody,fontSize:11,color:ui.textSub,cursor:"pointer"}}>
                    ↻
                  </button>
                )}
              </div>
            </div>
            {order.payment_reference && (
              <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}>
                <span style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody}}>رقم العملية</span>
                <span style={{fontSize:12,color:ui.text,fontFamily:"monospace"}}>{order.payment_reference}</span>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Sticky bottom action bar — status buttons + cancel */}
      {canManage && (
        <div className="no-print" style={{
          position:"sticky",bottom:0,marginTop:14,zIndex:5,
          background:ui.cardBg,border:ui.border,borderRadius:ui.radius,
          padding:"10px 14px",
          boxShadow:"0 -8px 24px rgba(0,0,0,.06)",
          display:"flex",alignItems:"center",gap:10,flexWrap:"wrap",
        }}>
          <span style={{fontSize:12,color:ui.textSub,fontFamily:ui.fontBody,marginInlineEnd:4}}>تحديث الحالة:</span>
          {ORDER_STATUSES.filter(s => s !== "ملغي").map(s => {
            const isCurrent = order.status === s;
            return (
              <button key={s} disabled={isCurrent} onClick={()=>onStatusChange(order.id, s)}
                style={{
                  padding:"7px 14px",
                  background: isCurrent ? ui.text : "transparent",
                  color:      isCurrent ? "#fff"  : ui.text,
                  border: `1px solid ${isCurrent ? ui.text : "#D1D5DB"}`,
                  borderRadius:6,fontFamily:ui.fontBody,fontSize:12.5,
                  cursor: isCurrent ? "default" : "pointer",
                  fontWeight: isCurrent ? 600 : 400,
                }}>
                {s}
              </button>
            );
          })}
          <div style={{flex:1}}/>
          {order.status !== "ملغي" && (
            <button onClick={()=>{ setCancelReason(""); setCancelOpen(true); }}
              style={{padding:"7px 14px",background:"transparent",border:"1px solid #FCA5A5",
                color:"#B91C1C",borderRadius:6,fontFamily:ui.fontBody,fontSize:12.5,cursor:"pointer",fontWeight:600}}>
              إلغاء الطلب
            </button>
          )}
        </div>
      )}

      {/* Cancel confirmation modal */}
      {cancelOpen && (
        <div onClick={()=>setCancelOpen(false)}
          style={{position:"fixed",inset:0,background:"rgba(0,0,0,.55)",zIndex:800,display:"flex",
            alignItems:"center",justifyContent:"center",padding:16,direction:"rtl"}}>
          <div onClick={e=>e.stopPropagation()}
            style={{background:ui.cardBg,maxWidth:440,width:"100%",padding:22,borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.25)"}}>
            <h3 style={{fontSize:15,fontWeight:600,color:ui.text,fontFamily:ui.fontBody,margin:"0 0 4px"}}>
              تأكيد إلغاء الطلب
            </h3>
            <div style={{fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,marginBottom:14}}>
              #{orderNum} — {order.name}
            </div>
            <label style={{display:"block",fontSize:12,color:ui.text,marginBottom:5,fontFamily:ui.fontBody,fontWeight:500}}>
              سبب الإلغاء (مطلوب)
            </label>
            <textarea rows={3} autoFocus
              value={cancelReason}
              onChange={e=>setCancelReason(e.target.value)}
              placeholder="مثال: العميل ألغى الطلب، نفاد المخزون..."
              style={{padding:"8px 12px",border:`1px solid #FCA5A5`,borderRadius:6,background:"#FEF2F2",
                fontFamily:ui.fontBody,fontSize:13,color:ui.text,outline:"none",width:"100%",
                direction:"rtl",resize:"vertical",minHeight:80,boxSizing:"border-box"}}/>
            <div style={{display:"flex",gap:8,justifyContent:"flex-end",marginTop:12}}>
              <button onClick={()=>setCancelOpen(false)}
                style={{padding:"8px 16px",background:"transparent",border:ui.border,borderRadius:6,
                  fontSize:12.5,color:ui.textSub,fontFamily:ui.fontBody,cursor:"pointer"}}>تراجع</button>
              <button
                disabled={cancelReason.trim().length < 3}
                onClick={async () => {
                  await onStatusChange(order.id, {
                    status: "ملغي",
                    cancellation_reason: cancelReason.trim(),
                    note: cancelReason.trim(),
                  });
                  setCancelOpen(false);
                  refreshOrders && refreshOrders();
                }}
                style={{padding:"8px 18px",
                  background: cancelReason.trim().length >= 3 ? "#DC2626" : "#9CA3AF",
                  color:"#fff",border:"none",borderRadius:6,fontSize:12.5,fontFamily:ui.fontBody,
                  cursor: cancelReason.trim().length >= 3 ? "pointer" : "not-allowed"}}>
                تأكيد الإلغاء
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function OrderDetailModal({ order, onClose, onStatusChange }) {
  const { t, dir } = useLang();
  useEffect(() => { injectPrintStyles(); }, []);
  if (!order) return null;
  const sectionTitle = { fontFamily:C.fa, fontSize:13.5, fontWeight:600, color:C.dk, marginBottom:8, paddingBottom:4, borderBottom:`1px solid rgba(196,149,106,.15)` };
  const row = { fontFamily:C.fb, fontSize:13, color:C.dk, lineHeight:1.85, marginBottom:3 };
  const label = { color:C.mu, marginInlineEnd:6, fontSize:11.5, letterSpacing:".04em" };

  const handlePrint = () => {
    document.body.classList.add("nawra-print-mode");
    const cleanup = () => {
      document.body.classList.remove("nawra-print-mode");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    // Safari fallback if afterprint never fires
    setTimeout(cleanup, 3000);
    window.print();
  };

  return (
    <div onClick={onClose} className="order-print-overlay" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.55)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:16, direction:dir, overflowY:"auto" }}>
      <div onClick={e=>e.stopPropagation()} className="order-print-card" style={{ background:C.wh, maxWidth:680, width:"100%", maxHeight:"92vh", overflow:"auto", padding:"22px 26px", boxShadow:"0 12px 48px rgba(0,0,0,.25)" }}>
        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18, paddingBottom:12, borderBottom:`1px solid rgba(196,149,106,.18)` }}>
          <div>
            <h2 style={{ fontFamily:C.fa, fontSize:19, fontWeight:600, color:C.dk, margin:0 }}>{t("detailTitle")}</h2>
            <div style={{ fontFamily:C.fe, fontSize:11, color:C.mu, letterSpacing:".1em", marginTop:3 }}>#{order.id}</div>
          </div>
          <div className="no-print" style={{display:"flex",alignItems:"center",gap:8}}>
            <button onClick={handlePrint}
              style={{ background:"transparent", border:`1px solid ${C.dk}`, color:C.dk, padding:"6px 14px", cursor:"pointer", fontFamily:C.fb, fontSize:12, borderRadius:4, display:"flex", alignItems:"center", gap:5 }}>
              🖨 طباعة
            </button>
            <button onClick={onClose} style={{ background:"none", border:"none", fontSize:24, color:C.mu, cursor:"pointer", lineHeight:1, padding:4 }}>✕</button>
          </div>
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
          <section className="no-print" style={{ marginTop:18, paddingTop:14, borderTop:`1px solid rgba(196,149,106,.15)` }}>
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
  // Return request state — see ReturnRequestModal below.
  const [myReturns, setMyReturns]   = useState([]);   // returns the user has already submitted
  const [reasons, setReasons]       = useState([]);   // dropdown options from /api/return-reasons
  const [returnsCfg, setReturnsCfg] = useState({ window_days: 14, allow_refund: true, allow_exchange: true, allow_store_credit: true });
  const [returnFor, setReturnFor]   = useState(null); // the order being returned (object, not just id)

  // ─ ALL hooks run unconditionally before any conditional return ─────────────
  // Fetch the user's existing returns so we can show their status next to
  // each order — we use a simple ?q={email} on the new returns endpoint.
  const userEmail = user && user.email;
  const loadMyReturns = useCallback(async () => {
    if (!userEmail) return;
    try {
      const r = await fetch(`/api/returns?q=${encodeURIComponent(userEmail)}&perPage=200`);
      if (r.ok) { const d = await r.json(); setMyReturns(Array.isArray(d.rows) ? d.rows : []); }
    } catch {}
  }, [userEmail]);
  useEffect(() => { loadMyReturns(); }, [loadMyReturns]);
  // One-time fetch for the form: reasons + return-window config from settings.store.
  useEffect(() => {
    fetch("/api/return-reasons").then(r => r.ok ? r.json() : []).then(d => setReasons(Array.isArray(d) ? d : [])).catch(() => {});
    fetch("/api/settings/store").then(r => r.ok ? r.json() : {}).then(d => {
      const r = (d && d.returns) || {};
      setReturnsCfg({
        window_days: Number.isFinite(r.window_days) ? r.window_days : 14,
        allow_refund: r.allow_refund !== false,
        allow_exchange: r.allow_exchange !== false,
        allow_store_credit: r.allow_store_credit !== false,
        non_returnable_ids: Array.isArray(r.non_returnable_ids) ? r.non_returnable_ids : [],
      });
    }).catch(() => {});
  }, []);

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
          // Compute return eligibility: order must be مكتمل + within window
          // + not have a non-cancelled return already attached.
          const orderTs = o.created_at ? new Date(String(o.created_at).replace(" ","T") + "Z").getTime() : null;
          const daysSince = orderTs ? Math.floor((Date.now() - orderTs) / 86400000) : null;
          const inWindow = daysSince != null ? daysSince <= returnsCfg.window_days : true;
          const existingReturn = myReturns.find(r => String(r.order_id) === String(o.id) && r.status !== "cancelled" && r.status !== "rejected");
          const canRequestReturn = o.status === "مكتمل" && inWindow && !existingReturn;
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

              {/* Return request CTA + status — visible on every مكتمل order */}
              <div style={{ borderTop: "1px solid rgba(196,149,106,.1)", paddingTop: 12, marginTop: 12, display:"flex", alignItems:"center", justifyContent:"space-between", gap:8, flexWrap:"wrap" }}>
                {existingReturn ? (
                  <div style={{ fontSize:12.5, color:C.dk, fontFamily:C.fb }}>
                    تم تقديم طلب إرجاع <b style={{fontFamily:"monospace"}}>{existingReturn.return_number}</b> ·
                    <span style={{
                      marginInlineStart:6, padding:"2px 8px", borderRadius:10, fontSize:11,
                      background: existingReturn.status === "refunded" ? "#D1FAE5" : existingReturn.status === "approved" ? "#DBEAFE" : "#FEF3C7",
                      color:      existingReturn.status === "refunded" ? "#065F46" : existingReturn.status === "approved" ? "#1D4ED8" : "#92400E",
                    }}>
                      {existingReturn.status === "pending"  ? "في الانتظار" :
                       existingReturn.status === "approved" ? "موافق عليه" :
                       existingReturn.status === "refunded" ? "تم الاسترداد" :
                       existingReturn.status === "rejected" ? "مرفوض" : existingReturn.status}
                    </span>
                  </div>
                ) : (
                  <div style={{ fontSize:11.5, color:C.mu, fontFamily:C.fb }}>
                    {o.status === "مكتمل"
                      ? (inWindow ? `يمكنك طلب إرجاع خلال ${returnsCfg.window_days - (daysSince||0)} يوم` : "انتهت مدة الإرجاع المسموح بها")
                      : `سيمكن طلب الإرجاع بعد تسليم الطلب`}
                  </div>
                )}
                {canRequestReturn && (
                  <button onClick={() => setReturnFor(o)}
                    style={{ padding:"7px 16px", background:C.dk, color:C.cr, border:"none", borderRadius:5, fontSize:12, fontFamily:C.fb, cursor:"pointer", fontWeight:500 }}>
                    طلب إرجاع 📦
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Return request modal */}
      {returnFor && (
        <ReturnRequestModal
          order={returnFor}
          user={user}
          reasons={reasons}
          cfg={returnsCfg}
          onClose={() => setReturnFor(null)}
          onSubmitted={() => { setReturnFor(null); loadMyReturns(); }}
        />
      )}
    </div>
  );
}

// ─── Customer-side Return Request Modal ──────────────────────────────────────
// Renders a form letting the customer pick line items + quantities, choose a
// reason, optionally add notes + photos, pick a preferred refund method, then
// POST /api/returns. Server allocates RET-XXXX + notifies admins via inbox.
function ReturnRequestModal({ order, user, reasons, cfg, onClose, onSubmitted }) {
  const mob = useMob();
  // Per-line state: how many of each ordered unit the customer wants to return.
  // Initialized to 0 for every line; customer must explicitly raise a quantity
  // so they don't accidentally return everything.
  const orderItems = Array.isArray(order.items) ? order.items : (() => { try { return JSON.parse(order.items || "[]"); } catch { return []; } })();
  const [qtyByIdx, setQtyByIdx] = useState(() => orderItems.map(() => 0));
  const [reasonId, setReasonId] = useState("");
  const [notes, setNotes]       = useState("");
  const [refundMethod, setRefundMethod] = useState(cfg.allow_refund ? "cash" : (cfg.allow_store_credit ? "store_credit" : "exchange"));
  const [busy, setBusy]   = useState(false);
  const [error, setError] = useState("");
  // Block lines whose product_id is in the non_returnable_ids list.
  const blockedIdx = new Set();
  orderItems.forEach((it, i) => { if ((cfg.non_returnable_ids || []).includes(String(it.id))) blockedIdx.add(i); });

  // Refund total = sum of (line.price × qty selected)
  const refundTotal = orderItems.reduce((s, it, i) => s + ((Number(it.price)||0) * (qtyByIdx[i] || 0)), 0);
  const totalQty = qtyByIdx.reduce((s, q) => s + (Number(q) || 0), 0);
  const canSubmit = totalQty > 0 && !!reasonId && !!refundMethod && !busy;

  const submit = async () => {
    setError(""); setBusy(true);
    try {
      const items = orderItems
        .map((it, i) => ({ idx: i, qty: qtyByIdx[i] || 0, it }))
        .filter(x => x.qty > 0)
        .map(x => ({
          order_item_idx: x.idx,
          product_id:   x.it.id || null,
          product_name: x.it.name || null,
          product_image:x.it.img || null,
          unit_price:   Number(x.it.price) || 0,
          quantity:     x.qty,
          refund_amount:(Number(x.it.price) || 0) * x.qty,
        }));
      const body = {
        order_id: order.id,
        customer: user.name || user.email,
        customer_id: user.email,
        customer_email: user.email,
        reason_id: reasonId,
        customer_notes: notes.trim() || null,
        items,
        refund_method: refundMethod,
        actor_id: user.email, actor_name: user.name || user.email,
      };
      const r = await fetch("/api/returns", { method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(body) });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || `HTTP ${r.status}`);
      onSubmitted && onSubmitted();
    } catch (e) {
      setError(e.message || "تعذّر إرسال الطلب، حاول مرة أخرى");
    } finally { setBusy(false); }
  };

  return (
    <div onClick={onClose}
      style={{position:"fixed",inset:0,background:"rgba(0,0,0,.6)",zIndex:900,display:"flex",alignItems:"center",justifyContent:"center",padding:mob?12:24,direction:"rtl"}}>
      <div onClick={e => e.stopPropagation()}
        style={{background:C.wh,maxWidth:680,width:"100%",maxHeight:"92vh",overflowY:"auto",borderRadius:8,boxShadow:"0 12px 48px rgba(0,0,0,.3)"}}>
        <div style={{padding:"18px 22px",borderBottom:"1px solid rgba(196,149,106,.15)",display:"flex",alignItems:"center",justifyContent:"space-between"}}>
          <div>
            <div style={{fontSize:16,color:C.dk,fontFamily:C.fa,fontWeight:600}}>طلب إرجاع</div>
            <div style={{fontSize:11.5,color:C.mu,fontFamily:C.fb,marginTop:2}}>طلب #{order.id} · {order.date}</div>
          </div>
          <button onClick={onClose} style={{background:"none",border:"none",fontSize:22,color:C.mu,cursor:"pointer",padding:4}}>✕</button>
        </div>

        <div style={{padding:"18px 22px"}}>
          {/* 1. Items + quantities */}
          <div style={{marginBottom:14}}>
            <div style={{fontSize:12,color:C.wa,fontFamily:C.fb,marginBottom:8,fontWeight:600}}>اختر المنتجات والكميات</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {orderItems.map((it, i) => {
                const blocked = blockedIdx.has(i);
                return (
                  <div key={i} style={{display:"flex",alignItems:"center",gap:10,padding:"8px 10px",border:"1px solid rgba(196,149,106,.15)",borderRadius:6,opacity:blocked?0.55:1}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:13,color:C.dk,fontFamily:C.fb}}>{it.name}</div>
                      <div style={{fontSize:11,color:C.mu,fontFamily:C.fb,marginTop:2}}>سعر الوحدة: {it.price} ج · الكمية الأصلية: {it.qty}</div>
                      {blocked && <div style={{fontSize:11,color:"#B45309",fontFamily:C.fb,marginTop:3}}>⚠ هذا المنتج غير قابل للإرجاع</div>}
                    </div>
                    <div style={{display:"flex",alignItems:"center",gap:5}}>
                      <button onClick={() => { const v = Math.max(0, (qtyByIdx[i] || 0) - 1); const next = [...qtyByIdx]; next[i] = v; setQtyByIdx(next); }}
                        disabled={blocked || (qtyByIdx[i] || 0) <= 0}
                        style={{width:28,height:28,border:"1px solid rgba(196,149,106,.2)",background:C.cr,borderRadius:5,cursor:"pointer",fontSize:14,color:C.dk}}>−</button>
                      <span style={{minWidth:24,textAlign:"center",fontSize:13,fontFamily:C.fb,color:C.dk}}>{qtyByIdx[i] || 0}</span>
                      <button onClick={() => { const max = Number(it.qty) || 1; const v = Math.min(max, (qtyByIdx[i] || 0) + 1); const next = [...qtyByIdx]; next[i] = v; setQtyByIdx(next); }}
                        disabled={blocked || (qtyByIdx[i] || 0) >= (Number(it.qty) || 1)}
                        style={{width:28,height:28,border:"1px solid rgba(196,149,106,.2)",background:C.cr,borderRadius:5,cursor:"pointer",fontSize:14,color:C.dk}}>+</button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 2. Reason */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:C.wa,fontFamily:C.fb,fontWeight:600,display:"block",marginBottom:5}}>سبب الإرجاع</label>
            <select value={reasonId} onChange={e => setReasonId(e.target.value)}
              style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(196,149,106,.25)",borderRadius:6,background:C.wh,fontSize:13,fontFamily:C.fb,color:C.dk,outline:"none",direction:"rtl"}}>
              <option value="">— اختر السبب —</option>
              {(reasons || []).filter(r => r.active).map(r => <option key={r.id} value={r.id}>{r.name_ar}</option>)}
            </select>
          </div>

          {/* 3. Notes */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:C.wa,fontFamily:C.fb,fontWeight:600,display:"block",marginBottom:5}}>ملاحظات (اختياري)</label>
            <textarea rows={3} value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="اكتب أي تفاصيل إضافية تساعدنا في معالجة طلبك..."
              style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(196,149,106,.25)",borderRadius:6,background:C.wh,fontSize:13,fontFamily:C.fb,color:C.dk,outline:"none",direction:"rtl",resize:"vertical",boxSizing:"border-box"}}/>
          </div>

          {/* 4. Refund method preference */}
          <div style={{marginBottom:14}}>
            <label style={{fontSize:12,color:C.wa,fontFamily:C.fb,fontWeight:600,display:"block",marginBottom:5}}>طريقة الاسترداد المفضلة</label>
            <select value={refundMethod} onChange={e => setRefundMethod(e.target.value)}
              style={{width:"100%",padding:"9px 11px",border:"1px solid rgba(196,149,106,.25)",borderRadius:6,background:C.wh,fontSize:13,fontFamily:C.fb,color:C.dk,outline:"none",direction:"rtl"}}>
              {cfg.allow_refund && <option value="cash">كاش (عند استلام المرتجع)</option>}
              {cfg.allow_refund && <option value="transfer">تحويل بنكي</option>}
              {cfg.allow_refund && <option value="wallet">محفظة إلكترونية</option>}
              {cfg.allow_store_credit && <option value="store_credit">رصيد للمتجر (+مكافأة)</option>}
              {cfg.allow_exchange && <option value="exchange">استبدال بمنتج آخر</option>}
            </select>
          </div>

          {/* Total + footer */}
          <div style={{padding:"12px 14px",background:C.cr2,borderRadius:6,display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <span style={{fontSize:13,color:C.dk,fontFamily:C.fb,fontWeight:600}}>إجمالي المسترد المتوقع</span>
            <span style={{fontSize:18,color:C.dk,fontFamily:C.fa,fontWeight:600}}>{refundTotal.toLocaleString()} <span style={{fontSize:11,color:C.mu,fontFamily:C.fb}}>ج</span></span>
          </div>

          {error && <div style={{padding:"8px 12px",background:"#FEE2E2",color:"#B91C1C",border:"1px solid #FCA5A5",borderRadius:5,fontSize:12,fontFamily:C.fb,marginBottom:10}}>{error}</div>}

          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            <button onClick={onClose} disabled={busy}
              style={{padding:"10px 18px",background:"transparent",border:"1px solid rgba(196,149,106,.25)",borderRadius:6,fontSize:13,color:C.mu,fontFamily:C.fb,cursor:"pointer"}}>إلغاء</button>
            <button onClick={submit} disabled={!canSubmit}
              style={{padding:"10px 22px",background: canSubmit ? C.dk : "#aaa",color:C.cr,border:"none",borderRadius:6,fontSize:13,fontFamily:C.fb,cursor: canSubmit ? "pointer" : "not-allowed",fontWeight:600}}>
              {busy ? "جاري الإرسال..." : "إرسال طلب الإرجاع"}
            </button>
          </div>
        </div>
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
  const isAdmin = route === "#admin" || route.startsWith("#admin/");

  const page = () => {
    if (route === "#login") return <LoginPage go={go} />;
    if (isAdmin) {
      if (!user || !isAdminRole(user.role)) { go("#login"); return null; }
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
