/** Per-category filter & post field definitions */

export const defaultFilterFields = [
  { id: 'minPrice', label: 'Min price (CAD)', type: 'number', placeholder: 'Min' },
  { id: 'maxPrice', label: 'Max price (CAD)', type: 'number', placeholder: 'Max' },
  { id: 'condition', label: 'Condition', type: 'chips', options: ['Any', 'New', 'Like New', 'Good', 'Fair'] },
]

export const categoryConfig = {
  'real-estate': {
    searchHints: ['rent', 'apartment', 'condo', 'house', 'bedroom', 'studio', 'lease', '2br', '3br', 'roommate', 'اجاره', 'فروش', 'املاک', 'همخانه'],
    filterFields: [
      { id: 'realEstateSubcategory', label: 'Listing type', type: 'select', options: ['Any'] },
      { id: 'rooms', label: 'Rooms', type: 'chips', options: ['Any'] },
      { id: 'areaMin', label: 'Area from', type: 'number', placeholder: 'From' },
      { id: 'areaMax', label: 'Area to', type: 'number', placeholder: 'To' },
      { id: 'buildingAgeMin', label: 'Building age from', type: 'number', placeholder: 'From' },
      { id: 'buildingAgeMax', label: 'Building age to', type: 'number', placeholder: 'To' },
      { id: 'floorMin', label: 'Floor from', type: 'number', placeholder: 'From' },
      { id: 'floorMax', label: 'Floor to', type: 'number', placeholder: 'To' },
      { id: 'buildingDirection', label: 'Direction', type: 'select', options: ['Any'] },
      { id: 'cooling', label: 'Cooling', type: 'select', options: ['Any'] },
      { id: 'heating', label: 'Heating', type: 'select', options: ['Any'] },
      { id: 'flooring', label: 'Flooring', type: 'select', options: ['Any'] },
      { id: 'bathroom', label: 'Bathroom', type: 'select', options: ['Any'] },
      { id: 'advertiserType', label: 'Advertiser', type: 'select', options: ['Any'] },
      { id: 'hasVideo', label: 'Has video', type: 'checkbox' },
      { id: 'hasPropertyPhotos', label: 'Has photos', type: 'checkbox' },
      { id: 'minPrice', label: 'Min rent/price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max rent/price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'realEstateSubcategory', label: 'Listing type', type: 'select', required: true, options: [] },
      { id: 'rooms', label: 'Rooms', type: 'select', options: [] },
      { id: 'area', label: 'Area', type: 'number' },
      { id: 'buildingAge', label: 'Building age', type: 'number' },
      { id: 'floor', label: 'Floor', type: 'number' },
      { id: 'buildingDirection', label: 'Direction', type: 'select', options: [] },
      { id: 'cooling', label: 'Cooling', type: 'select', options: [] },
      { id: 'heating', label: 'Heating', type: 'select', options: [] },
      { id: 'flooring', label: 'Flooring', type: 'select', options: [] },
      { id: 'bathroom', label: 'Bathroom', type: 'select', options: [] },
      { id: 'advertiserType', label: 'Advertiser', type: 'select', options: [] },
    ],
  },
  vehicles: {
    searchHints: [
      'car', 'suv', 'truck', 'motorcycle', 'bike', 'boat', 'parts', 'vehicle',
      'خودرو', 'موتور', 'قایق', 'قطعات', 'وسایل نقلیه',
    ],
    filterFields: [
      { id: 'vehiclesSubcategory', label: 'Vehicle type', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'vehiclesSubcategory', label: 'Vehicle type', type: 'select', required: true, options: [] },
    ],
  },
  pets: {
    searchHints: [
      'pet', 'dog', 'cat', 'bird', 'fish', 'rabbit', 'animal',
      'سگ', 'گربه', 'پرنده', 'ماهی', 'حیوانات',
    ],
    filterFields: [
      { id: 'petsSubcategory', label: 'Animal type', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'petsSubcategory', label: 'Animal type', type: 'select', required: true, options: [] },
    ],
  },
  electronics: {
    searchHints: ['iphone', 'macbook', 'laptop', 'phone', 'camera', 'sony', 'apple', 'gaming'],
    filterFields: [
      { id: 'brand', label: 'Brand', type: 'select', options: ['Any', 'Apple', 'Samsung', 'Sony', 'Dell', 'Other'] },
      { id: 'deviceType', label: 'Device', type: 'chips', options: ['Any', 'Phone', 'Laptop', 'Tablet', 'Camera', 'Other'] },
      { id: 'condition', label: 'Condition', type: 'chips', options: ['Any', 'New', 'Like New', 'Good', 'Fair'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'brand', label: 'Brand', type: 'text', required: true, placeholder: 'Apple' },
      { id: 'model', label: 'Model', type: 'text', placeholder: 'MacBook Pro 16"' },
      { id: 'storage', label: 'Storage / specs', type: 'text', placeholder: '48GB / 1TB' },
      { id: 'warranty', label: 'Warranty', type: 'select', options: ['None', 'Manufacturer', 'AppleCare+', 'Receipt only'] },
    ],
  },
  furniture: {
    searchHints: ['sofa', 'sectional', 'table', 'bed', 'desk', 'chair'],
    filterFields: [
      { id: 'itemType', label: 'Item', type: 'chips', options: ['Any', 'Sofa', 'Table', 'Bed', 'Desk', 'Other'] },
      { id: 'condition', label: 'Condition', type: 'chips', options: ['Any', 'New', 'Like New', 'Good', 'Fair'] },
      { id: 'delivery', label: 'Delivery', type: 'chips', options: ['Any', 'Available', 'Pickup only'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'itemType', label: 'Item type', type: 'select', options: ['Sofa', 'Table', 'Bed', 'Desk', 'Chair', 'Other'] },
      { id: 'material', label: 'Material', type: 'text', placeholder: 'Leather, wood…' },
      { id: 'delivery', label: 'Delivery', type: 'select', options: ['Pickup only', 'Delivery available', 'Negotiable'] },
    ],
  },
  'home-appliances': {
    searchHints: [
      'home', 'kitchen', 'appliance', 'fridge', 'sofa', 'carpet', 'bedding', 'lamp',
      'خانه', 'آشپزخانه', 'لوازم', 'مبل', 'فرش', 'نور',
    ],
    filterFields: [
      { id: 'homeKitchenSubcategory', label: 'Home & kitchen section', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'homeKitchenSubcategory', label: 'Home & kitchen section', type: 'select', required: true, options: [] },
    ],
  },
  services: {
    searchHints: [
      'service', 'cleaning', 'moving', 'plumber', 'lawyer', 'tutor', 'garden',
      'خدمات', 'نظافت', 'حمل', 'آموزشی', 'باغبانی', 'حقوقی',
    ],
    filterFields: [
      { id: 'servicesSubcategory', label: 'Service section', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'servicesSubcategory', label: 'Service section', type: 'select', required: true, options: [] },
    ],
  },
  fashion: {
    searchHints: ['jacket', 'shoes', 'bag', 'designer', 'clothing'],
    filterFields: [
      { id: 'size', label: 'Size', type: 'chips', options: ['Any', 'XS', 'S', 'M', 'L', 'XL'] },
      { id: 'gender', label: 'For', type: 'chips', options: ['Any', 'Women', 'Men', 'Unisex'] },
      { id: 'condition', label: 'Condition', type: 'chips', options: ['Any', 'New', 'Like New', 'Good'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'size', label: 'Size', type: 'text', placeholder: 'M' },
      { id: 'brand', label: 'Brand', type: 'text', placeholder: 'Optional' },
      { id: 'gender', label: 'For', type: 'select', options: ['Women', 'Men', 'Unisex', 'Kids'] },
    ],
  },
  beauty: {
    searchHints: [
      'beauty', 'salon', 'hair', 'nail', 'makeup', 'spa',
      'زیبایی', 'مو', 'ناخن', 'ابرو', 'آرایشی',
    ],
    filterFields: [
      { id: 'beautySubcategory', label: 'Beauty specialty', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'beautySubcategory', label: 'Beauty specialty', type: 'select', required: true, options: [] },
    ],
  },
  health: {
    searchHints: [
      'doctor', 'clinic', 'pharmacy', 'dentist', 'lab', 'health',
      'پزشک', 'داروخانه', 'کلینیک', 'دندان', 'آزمایشگاه', 'سلامت',
    ],
    filterFields: [
      { id: 'healthSubcategory', label: 'Health section', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'healthSubcategory', label: 'Health section', type: 'select', required: true, options: [] },
    ],
  },
  repairs: {
    searchHints: [
      'repair', 'plumber', 'electrician', 'appliance', 'locksmith',
      'تعمیر', 'لوله', 'برق', 'قفل', 'تأسیسات', 'خودرو',
    ],
    filterFields: [
      { id: 'repairsSubcategory', label: 'Repair type', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'repairsSubcategory', label: 'Repair type', type: 'select', required: true, options: [] },
    ],
  },
  education: {
    searchHints: [
      'course', 'tutor', 'class', 'learn', 'education', 'language', 'programming',
      'آموزش', 'تدریس', 'زبان', 'برنامه', 'موسیقی', 'رانندگی',
    ],
    filterFields: [
      { id: 'educationSubcategory', label: 'Education section', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'educationSubcategory', label: 'Education section', type: 'select', required: true, options: [] },
    ],
  },
  'tools-rental': {
    searchHints: [
      'rent', 'tool', 'drill', 'ladder', 'generator', 'compressor',
      'اجاره', 'ابزار', 'نردبان', 'ژنراتور', 'نجاری', 'باغبانی',
    ],
    filterFields: [
      { id: 'toolsRentalSubcategory', label: 'Tool type', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'toolsRentalSubcategory', label: 'Tool type', type: 'select', required: true, options: [] },
    ],
  },
  transport: {
    searchHints: [
      'moving', 'freight', 'courier', 'truck', 'van', 'delivery', 'transport',
      'حمل', 'اسباب', 'باربری', 'پیک', 'کامیون', 'ون', 'مبلمان',
    ],
    filterFields: [
      { id: 'transportSubcategory', label: 'Transport type', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'transportSubcategory', label: 'Transport type', type: 'select', required: true, options: [] },
    ],
  },
  kolbaran: {
    searchHints: [
      'kolbar', 'carry', 'courier', 'load', 'baggage', 'porter',
      'کولبر', 'بار', 'می‌برم', 'دارم', 'حمل بار',
    ],
    filterFields: [
      { id: 'kolbaranSubcategory', label: 'Kolbaran type', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'kolbaranSubcategory', label: 'Kolbaran type', type: 'select', required: true, options: [] },
    ],
  },
  sports: {
    searchHints: [
      'bike', 'gym', 'camping', 'ski', 'fitness', 'fishing', 'diving', 'horse',
      'ورزش', 'کمپینگ', 'ماهیگیری', 'غواصی', 'تجهیزات',
    ],
    filterFields: [
      { id: 'sportsSubcategory', label: 'Sport section', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'sportsSubcategory', label: 'Sport section', type: 'select', required: true, options: [] },
    ],
  },
  business: {
    searchHints: ['office', 'equipment', 'commercial', 'industrial'],
    filterFields: [
      { id: 'equipmentType', label: 'Equipment', type: 'chips', options: ['Any', 'Office', 'Industrial', 'Retail', 'Other'] },
      { id: 'condition', label: 'Condition', type: 'chips', options: ['Any', 'New', 'Like New', 'Good'] },
      { id: 'minPrice', label: 'Min price', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max price', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'equipmentType', label: 'Equipment type', type: 'select', options: ['Office', 'Industrial', 'Retail', 'Restaurant', 'Other'] },
      { id: 'quantity', label: 'Quantity', type: 'number', placeholder: '1' },
    ],
  },
  jobs: {
    searchHints: ['job', 'hiring', 'career', 'استخدام', 'کاریابی', 'شغل', 'رزومه'],
    filterFields: [
      { id: 'jobSubcategory', label: 'Job field', type: 'select', options: ['Any'] },
      { id: 'minPrice', label: 'Min salary', type: 'number', placeholder: 'Min' },
      { id: 'maxPrice', label: 'Max salary', type: 'number', placeholder: 'Max' },
    ],
    postFields: [
      { id: 'jobSubcategory', label: 'Job field', type: 'select', required: true, options: [] },
    ],
  },
}

export function getFilterFieldsForCategory(categoryId) {
  if (!categoryId) {
    return [
      ...defaultFilterFields,
      { id: 'verifiedOnly', label: 'Verified sellers only', type: 'checkbox' },
      { id: 'proOnly', label: 'Pro listings only', type: 'checkbox' },
    ]
  }
  const cfg = categoryConfig[categoryId]
  if (!cfg) return defaultFilterFields
  return [
    ...cfg.filterFields,
    { id: 'verifiedOnly', label: 'Verified sellers only', type: 'checkbox' },
    { id: 'proOnly', label: 'Pro listings only', type: 'checkbox' },
  ]
}

export function getPostFieldsForCategory(categoryId) {
  return categoryConfig[categoryId]?.postFields || []
}

export function getEmptyCategoryFilters(categoryId) {
  const fields = getFilterFieldsForCategory(categoryId)
  const obj = { verifiedOnly: false, proOnly: false }
  fields.forEach((f) => {
    if (f.type === 'checkbox') obj[f.id] = false
    else if (f.id === 'jobSubcategory' || f.id === 'realEstateSubcategory' || f.id === 'homeKitchenSubcategory' || f.id === 'servicesSubcategory' || f.id === 'vehiclesSubcategory' || f.id === 'petsSubcategory' || f.id === 'sportsSubcategory' || f.id === 'beautySubcategory' || f.id === 'healthSubcategory' || f.id === 'repairsSubcategory' || f.id === 'educationSubcategory' || f.id === 'toolsRentalSubcategory' || f.id === 'transportSubcategory' || f.id === 'kolbaranSubcategory') obj[f.id] = '' // empty = show subcategory gate
    else if (f.id === 'rooms' || f.id === 'buildingDirection' || f.id === 'cooling' || f.id === 'heating' || f.id === 'flooring' || f.id === 'bathroom' || f.id === 'hotWater' || f.id === 'advertiserType') obj[f.id] = ''
    else if (f.type === 'chips' || f.type === 'select') obj[f.id] = 'Any'
    else obj[f.id] = ''
  })
  obj.realEstatePropertyType = ''
  return obj
}

export function getEmptyPostAttributes(categoryId) {
  const fields = getPostFieldsForCategory(categoryId)
  const obj = {}
  fields.forEach((f) => {
    if (f.type === 'checkbox') obj[f.id] = false
    else obj[f.id] = ''
  })
  return obj
}
