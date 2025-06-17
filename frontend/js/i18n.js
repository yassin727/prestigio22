// i18n.js - Internationalization system for Prestigio Motors
class I18n {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'en';
        this.translations = {
            en: {
                // Navigation
                nav: {
                    home: 'Home',
                    luxuryCars: 'Luxury Cars',
                    regularCars: 'Regular Cars', 
                    about: 'About',
                    contact: 'Contact',
                    login: 'Sign In',
                    register: 'Sign Up',
                    exoticVehicles: 'Exotic Vehicles',
                    normalVehicles: 'Normal Vehicles',
                    contactUs: 'Contact Us',
                    concierge: 'Concierge'
                },
                
                // Home page
                home: {
                    pageTitle: 'Prestigio Luxury Cars - Home',
                    title: 'PRESTIGIO',
                    description: 'Where luxury meets performance. Experience the finest collection of exotic and premium vehicles, crafted for those who demand excellence.',
                    whyChoose: 'Why Choose Prestigio',
                    premiumCollection: 'Premium Collection',
                    premiumText: 'Curated selection of the world\'s most prestigious automotive brands, from Ferrari to Lamborghini, ensuring only the finest vehicles.',
                    instantAccess: 'Instant Access',
                    instantText: 'Streamlined process from browsing to ownership. Our digital-first approach puts your dream car just clicks away.',
                    guaranteedQuality: 'Guaranteed Quality',
                    qualityText: 'Every vehicle undergoes rigorous inspection and comes with comprehensive warranty coverage for your peace of mind.'
                },
                
                // Luxury Cars page
                luxury: {
                    title: 'Luxury Car Brands',
                    brandLogos: 'Luxury Car Brands',
                    closeBtn: 'Close'
                },
                
                // Regular Cars page
                regular: {
                    title: 'Premium <span class="gold-accent">Automotive</span> Collection',
                    subtitle: 'Explore the world\'s most prestigious car brands',
                    brandLogos: 'Premium Car Brands',
                    closeBtn: 'Close',
                    models: 'Models'
                },
                
                // Car details
                car: {
                    hp: 'HP',
                    engine: 'Engine',
                    hybrid: 'Hybrid',
                    electric: 'Electric',
                    price: 'Price'
                },
                
                // Footer
                footer: {
                    aboutTitle: 'About Prestigio Motors',
                    aboutText: 'Since 1985, Prestigio Motors has been the premier destination for the world\'s finest automobiles, providing exceptional service and unmatched expertise.',
                    quickLinks: 'Quick Links',
                    newArrivals: 'New Arrivals',
                    exoticInventory: 'Exotic Inventory',
                    normalInventory: 'Normal Inventory',
                    specialEditions: 'Special Editions',
                    contactTitle: 'Contact Us',
                    phone: 'Phone',
                    email: 'Email',
                    rights: '© 2025 Prestigio Collection. All rights reserved.'
                },
                
                // Concierge page
                concierge: {
                    pageTitle: 'Luxury Motors - Personal Concierge',
                    profileTitle: 'Senior Personal Concierge',
                    profileDescription: 'With over 15 years of experience serving our most discerning clients, Moamen is dedicated to providing exceptional service and personalized attention to every detail.',
                    currentAvailability: 'Current Availability',
                    availableNow: 'Available Now',
                    vehicleConfiguration: 'Your Vehicle Configuration',
                    vehicle: 'Vehicle',
                    color: 'Color',
                    finish: 'Finish',
                    wheels: 'Wheels',
                    interior: 'Interior',
                    performance: 'Performance',
                    additionalFeatures: 'Additional Features',
                    totalConfigurationPrice: 'Total Configuration Price',
                    scheduleAppointment: 'Schedule an Appointment',
                    fullName: 'Full Name',
                    enterFullName: 'Enter your full name',
                    emailAddress: 'Email Address',
                    enterEmail: 'Enter your email',
                    phoneNumber: 'Phone Number',
                    enterPhone: 'Enter your phone number',
                    serviceType: 'Service Type',
                    selectService: 'Select a service',
                    testDrive: 'Vehicle Test Drive',
                    privateViewing: 'Private Showroom Viewing',
                    deliveryCoordination: 'Vehicle Delivery Coordination',
                    maintenanceService: 'Maintenance Service',
                    customRequest: 'Custom Request',
                    preferredDate: 'Preferred Date',
                    preferredTime: 'Preferred Time',
                    selectTime: 'Select a time',
                    morning: '9:00 AM - 12:00 PM',
                    afternoon: '1:00 PM - 4:00 PM',
                    evening: '5:00 PM - 8:00 PM',
                    specialRequests: 'Special Requests',
                    specialRequestsPlaceholder: 'Please share any special requests or questions',
                    scheduleAppointmentBtn: 'Schedule Appointment',
                    prestigioConcierge: 'Prestigio Concierge',
                    howCanIHelp: 'How can I help you today?',
                    conciergeGreeting: 'Hello! I\'m your Prestigio Concierge. I can help you with information about our vehicles, services, appointments, and more. What would you like to know?',
                    messagePlaceholder: 'Message Prestigio Concierge...',
                    suggestedQuestions: {
                        vehicles: 'What luxury vehicles do you have available?',
                        testDrive: 'Can I schedule a test drive?',
                        hours: 'What are your business hours?',
                        financing: 'Tell me about your financing options'
                    },
                    disclaimer: 'Prestigio Concierge may produce inaccurate information. Verify important details.',
                    justNow: 'Just now'
                },
                
                // Registration page
                registration: {
                    pageTitle: 'Register - Prestigio',
                    createAccount: 'Create Account',
                    joinCommunity: 'Join Prestigio\'s exclusive community',
                    fullName: 'Full Name',
                    phoneNumber: 'Phone Number',
                    address: 'Address',
                    age: 'Age',
                    gender: 'Gender',
                    selectGender: 'Select Gender',
                    male: 'Male',
                    female: 'Female',
                    other: 'Other',
                    preferNotToSay: 'Prefer not to say',
                    nationality: 'Nationality',
                    selectNationality: 'Select Nationality',
                    email: 'Email',
                    termsAgreement: 'I agree to the Terms of Service and Privacy Policy',
                    termsOfService: 'Terms of Service',
                    privacyPolicy: 'Privacy Policy',
                    createAccountBtn: 'Create Account',
                    alreadyHaveAccount: 'Already have an account?',
                    login: 'Login',
                    registrationSuccessful: 'Registration successful! Check your email for login credentials.',
                    errorMessage: 'Error message here',
                    // Nationalities
                    nationalities: {
                        afghan: 'Afghan',
                        albanian: 'Albanian',
                        algerian: 'Algerian',
                        american: 'American',
                        argentinian: 'Argentinian',
                        australian: 'Australian',
                        austrian: 'Austrian',
                        bangladeshi: 'Bangladeshi',
                        belgian: 'Belgian',
                        brazilian: 'Brazilian',
                        british: 'British',
                        canadian: 'Canadian',
                        chinese: 'Chinese',
                        egyptian: 'Egyptian',
                        french: 'French',
                        german: 'German',
                        indian: 'Indian',
                        indonesian: 'Indonesian',
                        iranian: 'Iranian',
                        iraqi: 'Iraqi',
                        italian: 'Italian',
                        japanese: 'Japanese',
                        jordanian: 'Jordanian',
                        kuwaiti: 'Kuwaiti',
                        lebanese: 'Lebanese',
                        libyan: 'Libyan',
                        malaysian: 'Malaysian',
                        mexican: 'Mexican',
                        moroccan: 'Moroccan',
                        dutch: 'Dutch',
                        pakistani: 'Pakistani',
                        palestinian: 'Palestinian',
                        philippine: 'Philippine',
                        russian: 'Russian',
                        saudi: 'Saudi',
                        singaporean: 'Singaporean',
                        somali: 'Somali',
                        southAfrican: 'South African',
                        spanish: 'Spanish',
                        sudanese: 'Sudanese',
                        swedish: 'Swedish',
                        swiss: 'Swiss',
                        syrian: 'Syrian',
                        tunisian: 'Tunisian',
                        turkish: 'Turkish',
                        emirati: 'Emirati'
                    }
                },
                
                // Contact page
                contact: {
                    pageTitle: 'Contact Us - PRESTIGIO',
                    contactUs: 'Contact Us',
                    weAreHereToHelp: 'We\'re Here to Help',
                    tagline: 'Your feedback and inquiries are important to us.',
                    getInTouch: 'Customer Service',
                    formDescription: 'Fill out the form below, and we\'ll get back to you shortly.',
                    sendMessage: 'Submit Service Request',
                    address: 'Address',
                    addressText: 'Sixth District\nAl Obour City\nEgypt',
                    phone: 'Phone',
                    phoneText: '+2 01098613073',
                    email: 'Email',
                    emailText: 'prestegioautomobiles@gmail.com',
                    hours: 'Business Hours',
                    hoursText: 'Mon - Fri: 9:00 AM - 8:00 PM\nSat: 10:00 AM - 6:00 PM\nSun: 12:00 PM - 5:00 PM',
                    services: 'Our Services',
                    servicesText: 'Luxury & Regular Cars\nCustomization & Financing\nMaintenance & Insurance',
                    service: 'Select Service',
                    selectService: 'Choose a service...',
                    luxuryCars: 'Luxury Cars',
                    regularCars: 'Regular Cars',
                    carCustomization: 'Car Customization',
                    financing: 'Financing',
                    maintenance: 'Maintenance & Service',
                    insurance: 'Insurance',
                    tradeIn: 'Trade-In',
                    general: 'General Inquiry',
                    problem: 'Describe Your Request',
                    sendButton: 'Submit Request',
                    fullName: 'Full Name',
                    enterFullName: 'Enter your full name',
                    emailAddress: 'Email Address',
                    enterEmail: 'Enter your email',
                    phoneNumber: 'Phone Number',
                    enterPhone: 'Enter your phone number',
                    subject: 'Subject',
                    enterSubject: 'Enter the subject',
                    message: 'Message',
                    enterMessage: 'Enter your message',
                    needImmediateAssistance: 'Need immediate assistance?',
                    thankYouMessage: 'Thank you for your message! We will contact you shortly.'
                },
                
                // Login page
                login: {
                    pageTitle: 'Login - Prestigio Luxury Cars',
                    backToHome: '← Back to Home',
                    prestigio: 'PRESTIGIO',
                    welcomeBack: 'Welcome back to luxury',
                    username: 'Username',
                    password: 'Password',
                    enterUsername: 'Enter your username',
                    enterPassword: 'Enter your password',
                    signIn: 'Sign In',
                    forgotPassword: 'Forgot Password?',
                    passwordResetSoon: 'Password reset functionality coming soon!',
                    dontHaveAccount: 'Don\'t have an account?',
                    createAccount: 'Create Account'
                },
                
                // Car Customizer page
                customizer: {
                    pageTitle: 'Customize Your Vehicle - Prestigio',
                    carModel: 'Car Model',
                    customization: 'Customization',
                    interior: 'Interior',
                    exterior: 'Exterior',
                    performance: 'Performance',
                    technology: 'Technology',
                    color: 'Color',
                    finish: 'Finish',
                    wheels: 'Wheels',
                    interiorColor: 'Interior Color',
                    selectColor: 'Select Color',
                    metallic: 'Metallic',
                    matte: 'Matte',
                    glossy: 'Glossy',
                    satin: 'Satin',
                    standard: 'Standard',
                    sport: 'Sport',
                    premium: 'Premium',
                    racing: 'Racing',
                    leatherBlack: 'Leather Black',
                    leatherBrown: 'Leather Brown',
                    leatherWhite: 'Leather White',
                    alcantara: 'Alcantara',
                    carbonFiber: 'Carbon Fiber',
                    basePrice: 'Base Price',
                    customizations: 'Customizations',
                    total: 'Total',
                    resetConfiguration: 'Reset Configuration',
                    saveConfiguration: 'Save Configuration',
                    proceedToPurchase: 'Proceed to Purchase',
                    autoRotate: 'Auto Rotate',
                    fullscreen: 'Fullscreen',
                    resetView: 'Reset View',
                    frontView: 'Front View',
                    sideView: 'Side View',
                    rearView: 'Rear View'
                },
                
                // Car Selection page
                carSelection: {
                    pageTitle: 'Select Your Vehicle - Prestigio',
                    selectVehicle: 'Select Your Vehicle',
                    luxuryCollection: 'Luxury Collection',
                    premiumCollection: 'Premium Collection',
                    buyNow: 'Buy Now',
                    rentNow: 'Rent Now',
                    buyLuxury: '💎 Buy Luxury Cars',
                    rentLuxury: '💎 Rent Luxury Cars',
                    buyRegular: '🚗 Buy Regular Cars',
                    rentRegular: '🚗 Rent Regular Cars',
                    exploreCollection: 'Explore our exceptional collection',
                    viewAllModels: 'View All Models'
                },
                
                // Common
                common: {
                    loading: 'Loading...',
                    error: 'Error occurred',
                    search: 'Search',
                    filter: 'Filter',
                    sort: 'Sort',
                    view: 'View Details',
                    close: 'Close',
                    back: 'Back',
                    next: 'Next',
                    previous: 'Previous',
                    save: 'Save',
                    cancel: 'Cancel',
                    confirm: 'Confirm',
                    delete: 'Delete',
                    edit: 'Edit',
                    add: 'Add',
                    remove: 'Remove',
                    select: 'Select',
                    browse: 'Browse',
                    upload: 'Upload',
                    download: 'Download'
                }
            },
            
            ar: {
                // Navigation
                nav: {
                    home: 'الرئيسية',
                    luxuryCars: 'السيارات الفاخرة',
                    regularCars: 'السيارات العادية',
                    about: 'حولنا',
                    contact: 'اتصل بنا',
                    login: 'تسجيل الدخول',
                    register: 'إنشاء حساب',
                    exoticVehicles: 'المركبات الاستثنائية',
                    normalVehicles: 'المركبات العادية',
                    contactUs: 'اتصل بنا',
                    concierge: 'خدمة العملاء'
                },
                
                // Home page
                home: {
                    pageTitle: 'بريستيجيو للسيارات الفاخرة - الرئيسية',
                    title: 'بريستيجيو',
                    description: 'حيث تلتقي الفخامة بالأداء. اكتشف أرقى مجموعة من السيارات الاستثنائية والمتميزة، مصممة لأولئك الذين يطالبون بالتميز.',
                    whyChoose: 'لماذا تختار بريستيجيو',
                    premiumCollection: 'مجموعة متميزة',
                    premiumText: 'مجموعة مختارة من أشهر العلامات التجارية للسيارات في العالم، من فيراري إلى لامبورغيني، لضمان أفضل المركبات فقط.',
                    instantAccess: 'وصول فوري',
                    instantText: 'عملية مبسطة من التصفح إلى الملكية. نهجنا الرقمي الأول يضع سيارة أحلامك على بعد نقرات قليلة.',
                    guaranteedQuality: 'جودة مضمونة',
                    qualityText: 'كل مركبة تخضع لفحص صارم وتأتي مع ضمان شامل لراحة بالك.'
                },
                
                // Luxury Cars page
                luxury: {
                    title: 'علامات السيارات الفاخرة',
                    brandLogos: 'علامات السيارات الفاخرة',
                    closeBtn: 'إغلاق'
                },
                
                // Regular Cars page
                regular: {
                    title: 'مجموعة <span class="gold-accent">السيارات</span> المتميزة',
                    subtitle: 'استكشف أشهر العلامات التجارية للسيارات في العالم',
                    brandLogos: 'علامات السيارات المتميزة',
                    closeBtn: 'إغلاق',
                    models: 'الموديلات'
                },
                
                // Car details
                car: {
                    hp: 'حصان',
                    engine: 'المحرك',
                    hybrid: 'هجين',
                    electric: 'كهربائي',
                    price: 'السعر'
                },
                
                // Footer
                footer: {
                    aboutTitle: 'حول بريستيجيو موتورز',
                    aboutText: 'منذ عام 1985، كانت بريستيجيو موتورز الوجهة الأولى لأفضل السيارات في العالم، وتقدم خدمة استثنائية وخبرة لا مثيل لها.',
                    quickLinks: 'روابط سريعة',
                    newArrivals: 'وصل حديثاً',
                    exoticInventory: 'المخزون الاستثنائي',
                    normalInventory: 'المخزون العادي',
                    specialEditions: 'إصدارات خاصة',
                    contactTitle: 'اتصل بنا',
                    phone: 'الهاتف',
                    email: 'البريد الإلكتروني',
                    rights: '© 2025 مجموعة بريستيجيو. جميع الحقوق محفوظة.'
                },
                
                // Concierge page
                concierge: {
                    pageTitle: 'موتورز الفاخرة - خدمة العملاء الشخصية',
                    profileTitle: 'كبير مسؤولي خدمة العملاء',
                    profileDescription: 'مع أكثر من 15 عامًا من الخبرة في خدمة عملائنا الأكثر تميزًا، مؤمن مكرس لتقديم خدمة استثنائية واهتمام شخصي بكل التفاصيل.',
                    currentAvailability: 'التوفر الحالي',
                    availableNow: 'متاح الآن',
                    vehicleConfiguration: 'تكوين مركبتك',
                    vehicle: 'المركبة',
                    color: 'اللون',
                    finish: 'اللمسة النهائية',
                    wheels: 'العجلات',
                    interior: 'التصميم الداخلي',
                    performance: 'الأداء',
                    additionalFeatures: 'الميزات الإضافية',
                    totalConfigurationPrice: 'إجمالي سعر التكوين',
                    scheduleAppointment: 'حجز موعد',
                    fullName: 'الاسم الكامل',
                    enterFullName: 'أدخل اسمك الكامل',
                    emailAddress: 'عنوان البريد الإلكتروني',
                    enterEmail: 'أدخل بريدك الإلكتروني',
                    phoneNumber: 'رقم الهاتف',
                    enterPhone: 'أدخل رقم هاتفك',
                    serviceType: 'نوع الخدمة',
                    selectService: 'اختر خدمة',
                    testDrive: 'تجربة قيادة المركبة',
                    privateViewing: 'عرض خاص في المعرض',
                    deliveryCoordination: 'تنسيق تسليم المركبة',
                    maintenanceService: 'خدمة الصيانة',
                    customRequest: 'طلب مخصص',
                    preferredDate: 'التاريخ المفضل',
                    preferredTime: 'الوقت المفضل',
                    selectTime: 'اختر وقت',
                    morning: '9:00 صباحًا - 12:00 ظهرًا',
                    afternoon: '1:00 ظهرًا - 4:00 مساءً',
                    evening: '5:00 مساءً - 8:00 مساءً',
                    specialRequests: 'طلبات خاصة',
                    specialRequestsPlaceholder: 'يرجى مشاركة أي طلبات خاصة أو أسئلة',
                    scheduleAppointmentBtn: 'حجز موعد',
                    prestigioConcierge: 'خدمة عملاء بريستيجيو',
                    howCanIHelp: 'كيف يمكنني مساعدتك اليوم؟',
                    conciergeGreeting: 'مرحبًا! أنا خدمة عملاء بريستيجيو. يمكنني مساعدتك بمعلومات حول مركباتنا وخدماتنا والمواعيد وأكثر. ماذا تريد أن تعرف؟',
                    messagePlaceholder: 'رسالة إلى خدمة عملاء بريستيجيو...',
                    suggestedQuestions: {
                        vehicles: 'ما هي المركبات الفاخرة المتوفرة لديكم؟',
                        testDrive: 'هل يمكنني حجز تجربة قيادة؟',
                        hours: 'ما هي ساعات العمل؟',
                        financing: 'أخبرني عن خيارات التمويل'
                    },
                    disclaimer: 'قد تنتج خدمة عملاء بريستيجيو معلومات غير دقيقة. تحقق من التفاصيل المهمة.',
                    justNow: 'الآن'
                },
                
                // Registration page
                registration: {
                    pageTitle: 'التسجيل - بريستيجيو',
                    createAccount: 'إنشاء حساب',
                    joinCommunity: 'انضم إلى مجتمع بريستيجيو الحصري',
                    fullName: 'الاسم الكامل',
                    phoneNumber: 'رقم الهاتف',
                    address: 'العنوان',
                    age: 'العمر',
                    gender: 'الجنس',
                    selectGender: 'اختر الجنس',
                    male: 'ذكر',
                    female: 'أنثى',
                    other: 'آخر',
                    preferNotToSay: 'أفضل عدم الإفصاح',
                    nationality: 'الجنسية',
                    selectNationality: 'اختر الجنسية',
                    email: 'البريد الإلكتروني',
                    termsAgreement: 'أوافق على شروط الخدمة وسياسة الخصوصية',
                    termsOfService: 'شروط الخدمة',
                    privacyPolicy: 'سياسة الخصوصية',
                    createAccountBtn: 'إنشاء حساب',
                    alreadyHaveAccount: 'هل لديك حساب بالفعل؟',
                    login: 'تسجيل الدخول',
                    registrationSuccessful: 'تم التسجيل بنجاح! تحقق من بريدك الإلكتروني للحصول على بيانات تسجيل الدخول.',
                    errorMessage: 'رسالة خطأ هنا',
                    // Nationalities in Arabic
                    nationalities: {
                        afghan: 'أفغاني',
                        albanian: 'ألباني',
                        algerian: 'جزائري',
                        american: 'أمريكي',
                        argentinian: 'أرجنتيني',
                        australian: 'أسترالي',
                        austrian: 'نمساوي',
                        bangladeshi: 'بنغلاديشي',
                        belgian: 'بلجيكي',
                        brazilian: 'برازيلي',
                        british: 'بريطاني',
                        canadian: 'كندي',
                        chinese: 'صيني',
                        egyptian: 'مصري',
                        french: 'فرنسي',
                        german: 'ألماني',
                        indian: 'هندي',
                        indonesian: 'إندونيسي',
                        iranian: 'إيراني',
                        iraqi: 'عراقي',
                        italian: 'إيطالي',
                        japanese: 'ياباني',
                        jordanian: 'أردني',
                        kuwaiti: 'كويتي',
                        lebanese: 'لبناني',
                        libyan: 'ليبي',
                        malaysian: 'ماليزي',
                        mexican: 'مكسيكي',
                        moroccan: 'مغربي',
                        dutch: 'هولندي',
                        pakistani: 'باكستاني',
                        palestinian: 'فلسطيني',
                        philippine: 'فلبيني',
                        russian: 'روسي',
                        saudi: 'سعودي',
                        singaporean: 'سنغافوري',
                        somali: 'صومالي',
                        southAfrican: 'جنوب أفريقي',
                        spanish: 'إسباني',
                        sudanese: 'سوداني',
                        swedish: 'سويدي',
                        swiss: 'سويسري',
                        syrian: 'سوري',
                        tunisian: 'تونسي',
                        turkish: 'تركي',
                        emirati: 'إماراتي'
                    }
                },
                
                // Contact page
                contact: {
                    pageTitle: 'اتصل بنا - بريستيجيو',
                    contactUs: 'اتصل بنا',
                    weAreHereToHelp: 'نحن هنا لمساعدتك',
                    tagline: 'ملاحظاتك واستفساراتك مهمة بالنسبة لنا.',
                    getInTouch: 'خدمة العملاء',
                    formDescription: 'املأ النموذج أدناه، وسنعاود الاتصال بك قريباً.',
                    sendMessage: 'تقديم طلب خدمة',
                    address: 'العنوان',
                    addressText: 'الحي السادس\nمدينة العبور\nمصر',
                    phone: 'الهاتف',
                    phoneText: '+2 01098613073',
                    email: 'البريد الإلكتروني',
                    emailText: 'prestegioautomobiles@gmail.com',
                    hours: 'ساعات العمل',
                    hoursText: 'الإثنين - الجمعة: 9:00 صباحاً - 8:00 مساءً\nالسبت: 10:00 صباحاً - 6:00 مساءً\nالأحد: 12:00 ظهراً - 5:00 مساءً',
                    services: 'خدماتنا',
                    servicesText: 'السيارات الفاخرة والعادية\nالتخصيص والتمويل\nالصيانة والتأمين',
                    service: 'اختر الخدمة',
                    selectService: 'اختر خدمة...',
                    luxuryCars: 'السيارات الفاخرة',
                    regularCars: 'السيارات العادية',
                    carCustomization: 'تخصيص السيارات',
                    financing: 'التمويل',
                    maintenance: 'الصيانة والخدمة',
                    insurance: 'التأمين',
                    tradeIn: 'المقايضة',
                    general: 'استفسار عام',
                    problem: 'اشرح طلبك',
                    sendButton: 'تقديم الطلب',
                    fullName: 'الاسم الكامل',
                    enterFullName: 'أدخل اسمك الكامل',
                    emailAddress: 'عنوان البريد الإلكتروني',
                    enterEmail: 'أدخل بريدك الإلكتروني',
                    phoneNumber: 'رقم الهاتف',
                    enterPhone: 'أدخل رقم هاتفك',
                    subject: 'الموضوع',
                    enterSubject: 'أدخل الموضوع',
                    message: 'الرسالة',
                    enterMessage: 'أدخل رسالتك',
                    needImmediateAssistance: 'تحتاج مساعدة فورية؟',
                    thankYouMessage: 'شكراً لك على رسالتك! سنتواصل معك قريباً.'
                },
                
                // Login page
                login: {
                    pageTitle: 'تسجيل الدخول - سيارات بريستيجيو الفاخرة',
                    backToHome: '← العودة للرئيسية',
                    prestigio: 'بريستيجيو',
                    welcomeBack: 'مرحباً بعودتك إلى الفخامة',
                    username: 'اسم المستخدم',
                    password: 'كلمة المرور',
                    enterUsername: 'أدخل اسم المستخدم',
                    enterPassword: 'أدخل كلمة المرور',
                    signIn: 'تسجيل الدخول',
                    forgotPassword: 'نسيت كلمة المرور؟',
                    passwordResetSoon: 'وظيفة إعادة تعيين كلمة المرور قريباً!',
                    dontHaveAccount: 'ليس لديك حساب؟',
                    createAccount: 'إنشاء حساب'
                },
                
                // Car Customizer page
                customizer: {
                    pageTitle: 'خصص مركبتك - بريستيجيو',
                    carModel: 'موديل السيارة',
                    customization: 'التخصيص',
                    interior: 'التصميم الداخلي',
                    exterior: 'التصميم الخارجي',
                    performance: 'الأداء',
                    technology: 'التكنولوجيا',
                    color: 'اللون',
                    finish: 'اللمسة النهائية',
                    wheels: 'العجلات',
                    interiorColor: 'لون التصميم الداخلي',
                    selectColor: 'اختر اللون',
                    metallic: 'معدني',
                    matte: 'مطفي',
                    glossy: 'لامع',
                    satin: 'ساتان',
                    standard: 'قياسي',
                    sport: 'رياضي',
                    premium: 'متميز',
                    racing: 'سباق',
                    leatherBlack: 'جلد أسود',
                    leatherBrown: 'جلد بني',
                    leatherWhite: 'جلد أبيض',
                    alcantara: 'الكانتارا',
                    carbonFiber: 'ألياف الكربون',
                    basePrice: 'السعر الأساسي',
                    customizations: 'التخصيصات',
                    total: 'الإجمالي',
                    resetConfiguration: 'إعادة تعيين التكوين',
                    saveConfiguration: 'حفظ التكوين',
                    proceedToPurchase: 'المتابعة للشراء',
                    autoRotate: 'دوران تلقائي',
                    fullscreen: 'شاشة كاملة',
                    resetView: 'إعادة تعيين العرض',
                    frontView: 'المنظر الأمامي',
                    sideView: 'المنظر الجانبي',
                    rearView: 'المنظر الخلفي'
                },
                
                // Car Selection page
                carSelection: {
                    pageTitle: 'اختر مركبتك - بريستيجيو',
                    selectVehicle: 'اختر مركبتك',
                    luxuryCollection: 'مجموعة الفخامة',
                    premiumCollection: 'المجموعة المتميزة',
                    buyNow: 'اشتري الآن',
                    rentNow: 'استأجر الآن',
                    buyLuxury: '💎 شراء السيارات الفاخرة',
                    rentLuxury: '💎 استئجار السيارات الفاخرة',
                    buyRegular: '🚗 شراء السيارات العادية',
                    rentRegular: '🚗 استئجار السيارات العادية',
                    exploreCollection: 'اكتشف مجموعتنا الاستثنائية',
                    viewAllModels: 'عرض جميع الموديلات'
                },
                
                // Common
                common: {
                    loading: 'جاري التحميل...',
                    error: 'حدث خطأ',
                    search: 'بحث',
                    filter: 'تصفية',
                    sort: 'ترتيب',
                    view: 'عرض التفاصيل',
                    close: 'إغلاق',
                    back: 'رجوع',
                    next: 'التالي',
                    previous: 'السابق',
                    save: 'حفظ',
                    cancel: 'إلغاء',
                    confirm: 'تأكيد',
                    delete: 'حذف',
                    edit: 'تعديل',
                    add: 'إضافة',
                    remove: 'إزالة',
                    select: 'اختيار',
                    browse: 'تصفح',
                    upload: 'رفع',
                    download: 'تحميل'
                }
            }
        };
        
        this.init();
    }
    
    init() {
        this.createLanguageSelector();
        this.updateDirection();
        this.translatePage();
    }
    
    createLanguageSelector() {
        // Remove existing selector if any
        const existingSelector = document.getElementById('languageSelector');
        if (existingSelector) {
            existingSelector.remove();
        }
        
        // Find navigation links container
        const navLinks = document.querySelector('.nav-links');
        if (!navLinks) return;
        
        // Create language selector
        const languageSelector = document.createElement('div');
        languageSelector.id = 'languageSelector';
        languageSelector.className = 'language-selector';
        
        const selectedLanguage = document.createElement('div');
        selectedLanguage.className = 'language-selected';
        selectedLanguage.innerHTML = this.currentLanguage === 'ar' ? '🇸🇦 العربية' : '🇺🇸 English';
        selectedLanguage.onclick = () => {
            dropdown.style.display = dropdown.style.display === 'block' ? 'none' : 'block';
        };
        
        const dropdown = document.createElement('div');
        dropdown.className = 'language-dropdown';
        dropdown.style.display = 'none';
        
        const languages = [
            { code: 'en', name: '🇺🇸 English' },
            { code: 'ar', name: '🇸🇦 العربية' }
        ];
        
        languages.forEach(lang => {
            if (lang.code !== this.currentLanguage) {
                const option = document.createElement('div');
                option.className = 'language-option';
                option.innerHTML = lang.name;
                option.onclick = () => this.changeLanguage(lang.code);
                dropdown.appendChild(option);
            }
        });
        
        languageSelector.appendChild(selectedLanguage);
        languageSelector.appendChild(dropdown);
        
        // Add to navigation as list item
        const li = document.createElement('li');
        li.appendChild(languageSelector);
        navLinks.appendChild(li);
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!languageSelector.contains(e.target)) {
                dropdown.style.display = 'none';
            }
        });
    }
    
    changeLanguage(langCode) {
        this.currentLanguage = langCode;
        localStorage.setItem('language', langCode);
        this.updateDirection();
        this.translatePage();
        
        // Update language selector display
        const selectedLanguage = document.querySelector('.language-selected');
        if (selectedLanguage) {
            selectedLanguage.innerHTML = langCode === 'ar' ? '🇸🇦 العربية' : '🇺🇸 English';
        }
        
        // Refresh language selector
        this.createLanguageSelector();
    }
    
    updateDirection() {
        const isRTL = this.currentLanguage === 'ar';
        document.documentElement.setAttribute('dir', isRTL ? 'rtl' : 'ltr');
        document.documentElement.setAttribute('lang', this.currentLanguage);
        
        // Update body class for styling
        document.body.classList.toggle('rtl', isRTL);
        document.body.classList.toggle('arabic', isRTL);
    }
    
    translatePage() {
        // Translate regular elements
        const elements = document.querySelectorAll('[data-i18n]');
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.t(key);
            if (translation) {
                if (element.tagName === 'INPUT' && element.type !== 'button' && element.type !== 'submit') {
                    element.placeholder = translation;
                } else if (element.tagName === 'TITLE') {
                    document.title = translation;
                } else {
                    // Check if translation contains HTML or line breaks
                    if (translation.includes('<') && translation.includes('>')) {
                        element.innerHTML = translation;
                    } else if (translation.includes('\n')) {
                        // Convert line breaks to HTML
                        element.innerHTML = translation.replace(/\n/g, '<br>');
                    } else {
                        element.textContent = translation;
                    }
                }
            }
        });
        
        // Translate placeholder attributes
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.t(key);
            if (translation) {
                element.placeholder = translation;
            }
        });
    }
    
    t(key) {
        const keys = key.split('.');
        let translation = this.translations[this.currentLanguage];
        
        for (const k of keys) {
            if (translation && translation[k]) {
                translation = translation[k];
            } else {
                // Fallback to English if translation not found
                translation = this.translations.en;
                for (const fallbackKey of keys) {
                    if (translation && translation[fallbackKey]) {
                        translation = translation[fallbackKey];
                    } else {
                        return key; // Return key if no translation found
                    }
                }
                break;
            }
        }
        
        return translation;
    }
}

// Initialize i18n system when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.i18n = new I18n();
});

// Make t function globally available
window.t = (key) => {
    return window.i18n ? window.i18n.t(key) : key;
};