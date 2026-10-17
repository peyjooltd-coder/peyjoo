/** داده‌های اولیه فارسی — ۳۰ آگهی و کاربران واقع‌نما برای ونکوور */

export const DEMO_PASSWORD = '12345'
export const OTP_CODE = '12345'

export const mainUser = {
  email: 'ali.rezaei@divarvancouver.ca',
  phone: '6045550100',
  name: 'علی رضایی',
  avatar: 'https://i.pravatar.cc/150?u=ali-rezaei-van',
  city: 'ونکوور',
  verified: 1,
  pro_tier: null,
}

export const sellers = [
  { email: 'sara.ahmadi@divar.local', name: 'سارا احمدی', avatar: 'https://i.pravatar.cc/150?u=sara-ahmadi', city: 'ونکوور', verified: 1 },
  { email: 'reza.karimi@divar.local', name: 'رضا کریمی', avatar: 'https://i.pravatar.cc/150?u=reza-karimi', city: 'برنابی', verified: 1 },
  { email: 'mina.hosseini@divar.local', name: 'مینا حسینی', avatar: 'https://i.pravatar.cc/150?u=mina-hosseini', city: 'ریچموند', verified: 0 },
  { email: 'amir.nouri@divar.local', name: 'امیر نوری', avatar: 'https://i.pravatar.cc/150?u=amir-nouri', city: 'سوری', verified: 1 },
  { email: 'leila.moradi@divar.local', name: 'لیلا مرادی', avatar: 'https://i.pravatar.cc/150?u=leila-moradi', city: 'ونکوور', verified: 1 },
  { email: 'hosein.rezaei@divar.local', name: 'حسین رضایی', avatar: 'https://i.pravatar.cc/150?u=hosein-rezaei', city: 'نورث ونکوور', verified: 0 },
  { email: 'pacific.realty@divar.local', name: 'املاک پسیفیک', avatar: 'https://i.pravatar.cc/150?u=pacific-realty', city: 'ونکوور', verified: 1, pro_tier: 'Business' },
  { email: 'ev.motors@divar.local', name: 'خودرو برقی ونکوور', avatar: 'https://i.pravatar.cc/150?u=ev-motors', city: 'برنابی', verified: 1, pro_tier: 'Pro' },
  { email: 'neda.sharifi@divar.local', name: 'ندا شریفی', avatar: 'https://i.pravatar.cc/150?u=neda-sharifi', city: 'کوکیتلام', verified: 1 },
]

const imgs = {
  apt: '/listings/apt.jpg',
  apt2: '/listings/apt2.jpg',
  car: '/listings/car.jpg',
  tesla: '/listings/tesla.jpg',
  phone: '/listings/phone.jpg',
  sofa: '/listings/sofa.jpg',
  bike: '/listings/bike.jpg',
  fridge: '/listings/fridge.jpg',
  mac: '/listings/mac.jpg',
  desk: '/listings/desk.jpg',
  watch: '/listings/watch.jpg',
  guitar: '/listings/guitar.jpg',
  plant: '/listings/plant.jpg',
  camera: '/listings/camera.jpg',
  tools: '/listings/tools.jpg',
  kitchen: '/listings/kitchen.jpg',
  office: '/listings/office.jpg',
  dog: '/listings/dog.jpg',
  coat: '/listings/coat.jpg',
  moving: '/listings/moving.jpg',
}

const times = ['۱۰ دقیقه پیش', '۳۵ دقیقه پیش', '۲ ساعت پیش', '۵ ساعت پیش', 'دیروز', '۲ روز پیش', '۳ روز پیش', '۱ هفته پیش']

/** فقط آگهی‌های املاک — پوشش همه زیردسته‌های L1/L2 */
export const listings = [
  // اجاره مسکونی
  {
    seller: 6, category: 'real-estate',
    title: 'آپارتمان یک‌خوابه لوکس — کوآل هاربر',
    price: 2200, priceLabel: '$2,200', city: 'ونکوور', neighborhood: 'کوآل هاربر',
    image: imgs.apt,
    description: 'واحد گوشه با ویو دریا، پارکینگ و انبار. مناسب زوج یا سینگل حرفه‌ای.\n\n✔️ عکس‌های واقعی واحد\n✔️ پارکینگ و انباری\n✔️ بالکن نورگیر\n✔️ گرمایش پکیج',
    condition: 'نو', isPro: 1, views: 842, saves: 41, time: times[2], badges: ['ویژه'],
    lat: 49.2897, lng: -123.1165,
    attributes: {
      realEstateSubcategory: 'rent-residential', realEstatePropertyType: 'apartment',
      rooms: '1', area: 62, buildingAge: 4, buildingYear: 1400, floor: 18, totalFloors: 32,
      elevator: true, parking: true, storage: true, balcony: true,
      monthlyRent: 2200, deposit: 4400, convertible: true, photosAuthentic: true,
      heating: 'package', cooling: 'split', flooring: 'laminate', bathroom: 'western', advertiserType: 'agency',
    },
  },
  {
    seller: 5, category: 'real-estate',
    title: 'سوئیت یک‌خوابه برای اجاره — مترون',
    price: 1850, priceLabel: '$1,850', city: 'برنابی', neighborhood: 'مترون',
    image: imgs.apt2,
    description: 'نزدیک ایستگاه SkyTrain، آشپزخانه مجزا، حیوان خانگی کوچک OK.',
    condition: 'نو', views: 734, saves: 52, time: times[3],
    lat: 49.2257, lng: -123.0036,
    attributes: {
      realEstateSubcategory: 'rent-residential', realEstatePropertyType: 'apartment',
      rooms: '1', area: 48, buildingAge: 8, floor: 3, totalFloors: 6,
      elevator: true, parking: false, storage: false, balcony: true,
      monthlyRent: 1850, deposit: 3700, convertible: true, photosAuthentic: true,
      heating: 'radiator', bathroom: 'western', advertiserType: 'owner',
    },
  },
  {
    seller: 6, category: 'real-estate',
    title: 'خانه ویلایی ۳ خوابه اجاره‌ای — نورث ونکوور',
    price: 4200, priceLabel: '$4,200', city: 'نورث ونکوور', neighborhood: 'لونزdale',
    image: imgs.apt,
    description: 'حیاط خلوت، پارکینگ دو ماشین، نزدیک مدرسه.\n\n✔️ حیاط\n✔️ پارکینگ\n✔️ انباری',
    condition: 'خوب', isPro: 1, views: 512, saves: 33, time: times[1],
    lat: 49.3200, lng: -123.0724,
    attributes: {
      realEstateSubcategory: 'rent-residential', realEstatePropertyType: 'house-villa',
      rooms: '3', area: 165, buildingAge: 15, floor: 1, totalFloors: 2,
      elevator: false, parking: true, storage: true, balcony: true,
      monthlyRent: 4200, deposit: 8400, convertible: true, photosAuthentic: true,
      heating: 'package', flooring: 'hardwood', bathroom: 'western', advertiserType: 'agency',
    },
  },
  {
    seller: 4, category: 'real-estate',
    title: 'اتاق مستر در خانه اشتراکی — UBC',
    price: 950, priceLabel: '$950', city: 'ونکوور', neighborhood: 'یوبی‌سی',
    image: imgs.apt2,
    description: 'دانشجو یا کارآموز، اینترنت و گرمایش شامل.',
    condition: 'نو', views: 445, saves: 22, time: times[3],
    lat: 49.2606, lng: -123.2460,
    attributes: {
      realEstateSubcategory: 'rent-residential', realEstatePropertyType: 'house-villa',
      rooms: '0', area: 18, buildingAge: 12, floor: 1, totalFloors: 2,
      elevator: false, parking: false, storage: false, balcony: false,
      monthlyRent: 950, deposit: 950, convertible: false, photosAuthentic: true,
      heating: 'heater', advertiserType: 'owner',
    },
  },

  // فروش مسکونی
  {
    seller: 6, category: 'real-estate',
    title: 'آپارتمان ۲ خوابه فروشی — یال‌تاون',
    price: 789000, priceLabel: '$789,000', city: 'ونکوور', neighborhood: 'یال‌تاون',
    image: imgs.apt,
    description: 'طبقه ۱۲، ویو شهر، پارکینگ و انبار. مناسب سرمایه‌گذاری یا سکونت.',
    condition: 'نو', isPro: 1, views: 1204, saves: 88, time: times[0], badges: ['ویژه'],
    lat: 49.2756, lng: -123.1219,
    attributes: {
      realEstateSubcategory: 'sale-residential', realEstatePropertyType: 'apartment',
      rooms: '2', area: 78, buildingAge: 6, buildingYear: 1398, floor: 12, totalFloors: 28,
      elevator: true, parking: true, storage: true, balcony: true,
      photosAuthentic: true, heating: 'package', cooling: 'split', flooring: 'laminate',
      bathroom: 'western', advertiserType: 'agency',
    },
  },
  {
    seller: 0, category: 'real-estate',
    title: 'خانه و ویلا ۴ خوابه — ریچموند',
    price: 1450000, priceLabel: '$1,450,000', city: 'ریچموند', neighborhood: 'استینز',
    image: imgs.apt2,
    description: 'زمین بزرگ، گاراژ دو ماشین، بازسازی ۲۰۲۳.',
    condition: 'در حد نو', views: 956, saves: 61, time: times[2],
    lat: 49.1666, lng: -123.1336,
    attributes: {
      realEstateSubcategory: 'sale-residential', realEstatePropertyType: 'house-villa',
      rooms: '4', area: 240, buildingAge: 20, floor: 1, totalFloors: 2,
      elevator: false, parking: true, storage: true, balcony: true,
      photosAuthentic: true, heating: 'package', flooring: 'hardwood',
      bathroom: 'western', advertiserType: 'owner',
    },
  },
  {
    seller: 6, category: 'real-estate',
    title: 'زمین و ملک کلنگی — سوری',
    price: 980000, priceLabel: '$980,000', city: 'سوری', neighborhood: 'گیلفورد',
    image: imgs.office,
    description: 'مناسب مشارکت در ساخت یا نوسازی. دسترسی عالی به بزرگراه.',
    condition: 'کلنگی', isPro: 1, views: 401, saves: 19, time: times[4],
    lat: 49.1867, lng: -122.8490,
    attributes: {
      realEstateSubcategory: 'sale-residential', realEstatePropertyType: 'land',
      rooms: '0', area: 520, buildingAge: 45, floor: 0, totalFloors: 1,
      elevator: false, parking: false, storage: false, balcony: false,
      photosAuthentic: true, advertiserType: 'agency',
    },
  },

  // فروش اداری و تجاری
  {
    seller: 6, category: 'real-estate',
    title: 'دفتر کار ۸۵ متری فروشی — داون‌تاون',
    price: 425000, priceLabel: '$425,000', city: 'ونکوور', neighborhood: 'داون‌تاون',
    image: imgs.office,
    description: 'نزدیک Pacific Centre، آسانسور و پارکینگ مهمان.',
    condition: 'خوب', isPro: 1, views: 287, saves: 14, time: times[1],
    lat: 49.2827, lng: -123.1207,
    attributes: {
      realEstateSubcategory: 'sale-commercial', realEstatePropertyType: 'office',
      rooms: '0', area: 85, buildingAge: 12, floor: 8, totalFloors: 20,
      elevator: true, parking: true, storage: false, balcony: false,
      photosAuthentic: true, advertiserType: 'agency',
    },
  },
  {
    seller: 2, category: 'real-estate',
    title: 'مغازه و غرفه فروشی — کامرشیل',
    price: 310000, priceLabel: '$310,000', city: 'ونکوور', neighborhood: 'کامرشیل',
    image: imgs.office,
    description: 'نبش خیابان، ویترین عالی، مناسب کافه یا خرده‌فروشی.',
    condition: 'خوب', views: 534, saves: 27, time: times[5],
    lat: 49.2625, lng: -123.0695,
    attributes: {
      realEstateSubcategory: 'sale-commercial', realEstatePropertyType: 'shop',
      rooms: '0', area: 55, buildingAge: 18, floor: 0, totalFloors: 1,
      elevator: false, parking: false, storage: true, balcony: false,
      photosAuthentic: true, advertiserType: 'owner',
    },
  },
  {
    seller: 6, category: 'real-estate',
    title: 'سوله صنعتی فروشی — برنابی',
    price: 2100000, priceLabel: '$2,100,000', city: 'برنابی', neighborhood: 'بیگ بند',
    image: imgs.office,
    description: 'سقف بلند، رمپ کامیون، برق صنعتی سه‌فاز.',
    condition: 'خوب', isPro: 1, views: 176, saves: 9, time: times[6],
    lat: 49.2488, lng: -122.9805,
    attributes: {
      realEstateSubcategory: 'sale-commercial', realEstatePropertyType: 'industrial',
      rooms: '0', area: 1200, buildingAge: 25, floor: 0, totalFloors: 1,
      elevator: false, parking: true, storage: true, balcony: false,
      photosAuthentic: true, advertiserType: 'agency',
    },
  },

  // اجاره اداری و تجاری
  {
    seller: 6, category: 'real-estate',
    title: 'دفتر کار اجاره‌ای — برودوی',
    price: 2800, priceLabel: '$2,800', city: 'ونکوور', neighborhood: 'برودوی',
    image: imgs.office,
    description: 'اتاق جلسه مشترک، اینترنت فیبر، مناسب استارتاپ.',
    condition: 'نو', isPro: 1, views: 312, saves: 18, time: times[2],
    lat: 49.2633, lng: -123.1385,
    attributes: {
      realEstateSubcategory: 'rent-commercial', realEstatePropertyType: 'office',
      rooms: '0', area: 42, buildingAge: 5, floor: 4, totalFloors: 10,
      elevator: true, parking: false, storage: false, balcony: false,
      monthlyRent: 2800, deposit: 5600, convertible: false, photosAuthentic: true,
      advertiserType: 'agency',
    },
  },
  {
    seller: 6, category: 'real-estate',
    title: 'پارکینگ اجاره‌ای داون‌تاون — ماهانه',
    price: 220, priceLabel: '$220', city: 'ونکوور', neighborhood: 'داون‌تاون',
    image: imgs.office,
    description: 'دسترسی ۲۴ ساعته، نزدیک Pacific Centre.',
    condition: 'نو', isPro: 1, views: 203, saves: 14, time: times[3],
    lat: 49.2827, lng: -123.1207,
    attributes: {
      realEstateSubcategory: 'rent-commercial', realEstatePropertyType: 'shop',
      rooms: '0', area: 12, buildingAge: 10, floor: 0, totalFloors: 1,
      elevator: true, parking: true, storage: false,
      monthlyRent: 220, deposit: 220, convertible: false, photosAuthentic: true,
      advertiserType: 'agency',
    },
  },
  {
    seller: 1, category: 'real-estate',
    title: 'مغازه اجاره‌ای — ریچموند سنتر',
    price: 3500, priceLabel: '$3,500', city: 'ریچموند', neighborhood: 'سیتی سنتر',
    image: imgs.office,
    description: 'ویترین خیابانی، مناسب فست‌فود یا بوتیک.',
    condition: 'خوب', views: 267, saves: 12, time: times[4],
    lat: 49.1666, lng: -123.1360,
    attributes: {
      realEstateSubcategory: 'rent-commercial', realEstatePropertyType: 'shop',
      rooms: '0', area: 68, buildingAge: 14, floor: 0, totalFloors: 1,
      elevator: false, parking: true, storage: true, balcony: false,
      monthlyRent: 3500, deposit: 7000, convertible: true, photosAuthentic: true,
      advertiserType: 'owner',
    },
  },

  // پروژه‌های ساخت‌وساز
  {
    seller: 6, category: 'real-estate',
    title: 'مشارکت در ساخت — زمین نورث ونکوور',
    price: 0, priceLabel: 'توافقی', city: 'نورث ونکوور', neighborhood: 'سایپرس',
    image: imgs.apt,
    description: 'مالک زمین به‌دنبال سازنده معتبر برای پروژه ۴ واحدی.',
    condition: 'نو', isPro: 1, views: 189, saves: 21, time: times[5], badges: ['ویژه'],
    lat: 49.3350, lng: -123.1000,
    attributes: {
      realEstateSubcategory: 'construction-projects', realEstatePropertyType: 'partnership',
      rooms: '0', area: 650, buildingAge: 0, floor: 0, totalFloors: 3,
      elevator: false, parking: true, storage: false, balcony: false,
      photosAuthentic: true, advertiserType: 'agency',
    },
  },
  {
    seller: 6, category: 'real-estate',
    title: 'پیش‌فروش آپارتمان — برنابی هایتس',
    price: 650000, priceLabel: '$650,000', city: 'برنابی', neighborhood: 'برنابی هایتس',
    image: imgs.apt2,
    description: 'تحویل ۱۴۰۶، پلن ۱ خواب + دن، پارکینگ و انبار.',
    condition: 'نو', isPro: 1, views: 678, saves: 45, time: times[0],
    lat: 49.2540, lng: -122.9680,
    attributes: {
      realEstateSubcategory: 'construction-projects', realEstatePropertyType: 'presale',
      rooms: '1', area: 58, buildingAge: 0, floor: 9, totalFloors: 22,
      elevator: true, parking: true, storage: true, balcony: true,
      photosAuthentic: true, advertiserType: 'agency',
    },
  },

  // اجاره کوتاه‌مدت
  {
    seller: 0, category: 'real-estate',
    title: 'آپارتمان و سوئیت شبانه — کیتسیلانو',
    price: 180, priceLabel: '$180/شب', city: 'ونکوور', neighborhood: 'کیتسیلانو',
    image: imgs.apt,
    description: 'مبله کامل، نزدیک ساحل، حداقل ۳ شب.',
    condition: 'نو', views: 891, saves: 54, time: times[1],
    lat: 49.2680, lng: -123.1650,
    attributes: {
      realEstateSubcategory: 'short-term-rent', realEstatePropertyType: 'apartment-suite',
      rooms: '1', area: 45, buildingAge: 7, floor: 3, totalFloors: 5,
      elevator: true, parking: false, storage: false, balcony: true,
      monthlyRent: 180, deposit: 360, convertible: false, photosAuthentic: true,
      heating: 'package', bathroom: 'western', advertiserType: 'owner',
    },
  },
  {
    seller: 3, category: 'real-estate',
    title: 'ویلا و باغ آخر هفته — ویندسی',
    price: 350, priceLabel: '$350/شب', city: 'نورث ونکوور', neighborhood: 'ویندسی',
    image: imgs.apt2,
    description: 'ویلا با جکوزی و ویو کوه. مناسب خانواده.',
    condition: 'خوب', views: 423, saves: 31, time: times[2],
    lat: 49.3500, lng: -123.0800,
    attributes: {
      realEstateSubcategory: 'short-term-rent', realEstatePropertyType: 'villa-garden',
      rooms: '3', area: 180, buildingAge: 10, floor: 1, totalFloors: 2,
      elevator: false, parking: true, storage: true, balcony: true,
      monthlyRent: 350, deposit: 700, convertible: false, photosAuthentic: true,
      heating: 'package', bathroom: 'western', advertiserType: 'owner',
    },
  },
  {
    seller: 6, category: 'real-estate',
    title: 'دفتر کار و فضای آموزشی روزانه — داون‌تاون',
    price: 120, priceLabel: '$120/روز', city: 'ونکوور', neighborhood: 'داون‌تاون',
    image: imgs.office,
    description: 'اتاق آموزش ۲۰ نفره، پروژکتور و وایت‌برد.',
    condition: 'نو', isPro: 1, views: 156, saves: 8, time: times[7],
    lat: 49.2840, lng: -123.1120,
    attributes: {
      realEstateSubcategory: 'short-term-rent', realEstatePropertyType: 'office-space',
      rooms: '0', area: 70, buildingAge: 8, floor: 5, totalFloors: 12,
      elevator: true, parking: false, storage: false, balcony: false,
      monthlyRent: 120, deposit: 240, convertible: false, photosAuthentic: true,
      advertiserType: 'agency',
    },
  },
]

export function buildChatThreads(listingIdMap) {
  const L = (oldIdx) => listingIdMap[oldIdx + 1] || Object.values(listingIdMap)[0]
  return [
    {
      id: 'c1',
      listingId: L(0),
      listingTitle: 'آپارتمان یک‌خوابه لوکس — کوآل هاربر',
      listingImage: imgs.apt,
      listingCategory: 'real-estate',
      otherName: 'املاک پسیفیک',
      otherAvatar: 'https://i.pravatar.cc/150?u=pacific-realty',
      unread: 2,
      updated: '۱۰:۳۰',
      messages: [
        { id: 'm1', from: 'them', text: 'سلام، هنوز برای بازدید وقت دارید؟', time: 'دیروز ۱۶:۲۰' },
        { id: 'm2', from: 'me', text: 'بله، پنج‌شنبه عصر مناسب است؟', time: 'دیروز ۱۷:۰۱' },
        { id: 'm3', from: 'them', text: 'عالیه — ساعت ۶:۳۰ لابی برج.', time: '۱۰:۳۰' },
      ],
    },
    {
      id: 'c2',
      listingId: L(4),
      listingTitle: 'آپارتمان ۲ خوابه فروشی — یال‌تاون',
      listingImage: imgs.apt,
      listingCategory: 'real-estate',
      otherName: 'املاک پسیفیک',
      otherAvatar: 'https://i.pravatar.cc/150?u=pacific-realty',
      unread: 1,
      updated: 'دیروز',
      messages: [
        { id: 'm1', from: 'them', text: 'سلام، بازدید شنبه ممکن است؟', time: 'دیروز' },
        { id: 'm2', from: 'me', text: 'بله، ساعت ۱۱ صبح.', time: 'دیروز' },
      ],
    },
    {
      id: 'c3',
      listingId: L(2),
      listingTitle: 'خانه ویلایی ۳ خوابه اجاره‌ای — نورث ونکوور',
      listingImage: imgs.apt,
      listingCategory: 'real-estate',
      otherName: 'لیلا مرادی',
      otherAvatar: 'https://i.pravatar.cc/150?u=leila-moradi',
      unread: 0,
      updated: '۲ روز پیش',
      messages: [
        { id: 'm1', from: 'me', text: 'آیا حیوان خانگی مجاز است؟', time: '۲ روز پیش' },
        { id: 'm2', from: 'them', text: 'سگ کوچک با ودیعه اضافه OK است.', time: '۲ روز پیش' },
      ],
    },
  ]
}

export const wantSignals = [
  { id: 'w1', title: 'آپارتمان ۲ خوابه برای اجاره', category: 'real-estate', budget: '$2,500', region: 'ونکوور', radius: '۱۰ کیلومتر', urgency: 'فوری', seekers: 3, matches: 2, posted: '۱ روز پیش', avatar: 'https://i.pravatar.cc/80?u=w1', verified: 1 },
  { id: 'w2', title: 'خانه ویلایی برای خرید', category: 'real-estate', budget: '$1,200,000', region: 'برنابی', radius: '۱۵ کیلومتر', urgency: 'عادی', seekers: 2, matches: 1, posted: '۳ روز پیش', avatar: 'https://i.pravatar.cc/80?u=w2', verified: 1 },
]

export const demandPulse = [
  { area: 'ونکوور', category: 'املاک', intensity: 88, seekers: 124, trend: '+۱۲٪', hot: 1 },
  { area: 'برنابی', category: 'املاک', intensity: 72, seekers: 89, trend: '+۵٪', hot: 1 },
  { area: 'ریچموند', category: 'املاک', intensity: 65, seekers: 56, trend: 'پایدار', hot: 0 },
]
