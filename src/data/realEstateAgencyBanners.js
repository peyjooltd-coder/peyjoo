const photo = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1920&h=1080&q=80`

export const RE_AGENCIES = [
  {
    id: 'pacific',
    nameFa: 'املاک پسیفیک',
    nameEn: 'Pacific Realty',
    accent: '#1a4f8b',
    banners: [
      { titleFa: 'خانهٔ رویایی کنار آب', titleEn: 'Waterfront homes', textFa: 'کوآل هاربر · مشاورهٔ رایگان', textEn: 'Coal Harbour · free consult', image: photo('photo-1545324418-cc1a3fa10c9') },
      { titleFa: 'واحدهای آمادهٔ تحویل', titleEn: 'Ready to move in', textFa: 'اجاره و فروش در داون‌تاون', textEn: 'Rent and sale downtown', image: photo('photo-1502672260266-1c1ef10d835f') },
      { titleFa: 'سرمایه‌گذاری روی نوساز', titleEn: 'New-build investing', textFa: 'پروژه‌های در حال ساخت ونکوور', textEn: 'Vancouver projects underway', image: photo('photo-1486406146926-c627a92ad1ab') },
      { titleFa: 'بازدید همین هفته', titleEn: 'Book a viewing', textFa: 'وقت مشاوره با کارشناس پسیفیک', textEn: 'Talk with a Pacific advisor', image: photo('photo-1560448204-e02f11c457d0') },
    ],
  },
  {
    id: 'harbor',
    nameFa: 'املاک هاربر',
    nameEn: 'Harbor Realty',
    accent: '#0f6e6b',
    banners: [
      { titleFa: 'ویلاهای خانوادگی', titleEn: 'Family houses', textFa: 'ریچموند و استیوستون', textEn: 'Richmond and Steveston', image: photo('photo-1564013799919-ab600027ffc6') },
      { titleFa: 'مغازه و دفتر کار', titleEn: 'Shops and offices', textFa: 'موقعیت‌های تجاری آماده', textEn: 'Commercial spaces ready', image: photo('photo-1497366216548-37526070297c') },
      { titleFa: 'خانه‌های حیاط‌دار', titleEn: 'Homes with yards', textFa: 'مناسب خانواده · پارکینگ اختصاصی', textEn: 'Family homes · private parking', image: photo('photo-1570129477492-45c003edd2be') },
      { titleFa: 'قیمت‌گذاری واقعی', titleEn: 'Honest pricing', textFa: 'کارشناس محلی املاک هاربر', textEn: 'Local Harbor Realty advice', image: photo('photo-1600585154340-be6161a56a0c') },
    ],
  },
  {
    id: 'northshore',
    nameFa: 'املاک نورث‌شور',
    nameEn: 'North Shore Realty',
    accent: '#243e73',
    banners: [
      { titleFa: 'ویو کوه و دریا', titleEn: 'Mountain and ocean views', textFa: 'خانه‌های نورث و وست ونکوور', textEn: 'North and West Vancouver', image: photo('photo-1512917774080-9991f1c4c750') },
      { titleFa: 'آپارتمان آرام', titleEn: 'Quiet apartments', textFa: 'نزدیک مدرسه و پارک', textEn: 'Near schools and parks', image: photo('photo-1493809842364-78817add7ffb') },
      { titleFa: 'زمین و مشارکت در ساخت', titleEn: 'Land and new builds', textFa: 'پروژه‌های نورث‌شور', textEn: 'North Shore projects', image: photo('photo-1500382017468-9049fed747ef') },
      { titleFa: 'مشاور اختصاصی شما', titleEn: 'Your own advisor', textFa: 'از بازدید تا قرارداد', textEn: 'From viewing to contract', image: photo('photo-1600596542815-ffad4c1539a9') },
    ],
  },
  {
    id: 'metro',
    nameFa: 'املاک مترو',
    nameEn: 'Metro Realty',
    accent: '#8a3d2f',
    banners: [
      { titleFa: 'کنار اسکای‌ترین', titleEn: 'By the SkyTrain', textFa: 'برنابی، مترون و برنتوود', textEn: 'Burnaby, Metrotown, Brentwood', image: photo('photo-1460317442991-0ec209397118') },
      { titleFa: 'سوئیت دانشجویی', titleEn: 'Student suites', textFa: 'اجارهٔ کوتاه و بلندمدت', textEn: 'Short and long-term rentals', image: photo('photo-1522708323590-d24dbb6b0267') },
      { titleFa: 'خانه برای فروش', titleEn: 'Houses for sale', textFa: 'فایل‌های تازه‌وارد مترو', textEn: 'New Metro listings', image: photo('photo-1600047509807-ba8f99d2cdbc') },
      { titleFa: 'یک تماس، چند گزینه', titleEn: 'One call, more options', textFa: 'مشاورهٔ رایگان املاک مترو', textEn: 'Free Metro Realty consult', image: photo('photo-1600210492486-724fe5c67fb0') },
    ],
  },
]
