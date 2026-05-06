// ====== CATALOG.JS – Mohan Mehandi Art ======
// Now backed by MongoDB via api.js (falls back to localStorage if offline)

const DEFAULT_DESIGNS = [
  // ===== BRIDAL =====
  { id:1,  serial:'B001', name:'Royal Bridal Full Set',       category:'Bridal',     price:8000,  imageUrl:'https://i.pinimg.com/736x/4a/3e/0f/4a3e0f3a8b2c1e5d9f7a6b3c2e0d4f8a.jpg', image:'https://i.pinimg.com/736x/4a/3e/0f/4a3e0f3a8b2c1e5d9f7a6b3c2e0d4f8a.jpg', desc:'Intricate full hand & feet bridal design with dulha name' },
  { id:2,  serial:'B002', name:'Dulhan Bridal Design',        category:'Bridal',     price:6000,  imageUrl:'https://i.pinimg.com/736x/b2/1a/3f/b21a3fc4e5d6a7b8c9e0f1a2b3c4d5e6.jpg', image:'https://i.pinimg.com/736x/b2/1a/3f/b21a3fc4e5d6a7b8c9e0f1a2b3c4d5e6.jpg', desc:'Traditional bridal with floral & peacock motifs' },
  { id:3,  serial:'B003', name:'Heavy Bridal Mehndi',         category:'Bridal',     price:9000,  imageUrl:'https://i.pinimg.com/736x/3c/4d/5e/3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.jpg', image:'https://i.pinimg.com/736x/3c/4d/5e/3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f.jpg', desc:'Heavy coverage from fingertips to elbow' },
  { id:4,  serial:'B004', name:'Rajputana Bridal',            category:'Bridal',     price:7500,  imageUrl:'https://i.pinimg.com/736x/6f/7a/8b/6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.jpg', image:'https://i.pinimg.com/736x/6f/7a/8b/6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c.jpg', desc:'Rajasthani style bridal with morni & champa' },
  { id:5,  serial:'B005', name:'Bridal with Portrait',        category:'Bridal',     price:10000, imageUrl:'https://i.pinimg.com/736x/9c/0d/1e/9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f.jpg', image:'https://i.pinimg.com/736x/9c/0d/1e/9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f.jpg', desc:'Special bridal with bride & groom face portrait' },
  // ===== ARABIC =====
  { id:6,  serial:'A001', name:'Classic Arabic Full Hand',    category:'Arabic',     price:1200,  imageUrl:'https://i.pinimg.com/736x/2e/3f/4a/2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b.jpg', image:'https://i.pinimg.com/736x/2e/3f/4a/2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b.jpg', desc:'Bold floral Arabic from wrist to elbow' },
  { id:7,  serial:'A002', name:'Arabic Rose Pattern',         category:'Arabic',     price:1000,  imageUrl:'https://i.pinimg.com/736x/5b/6c/7d/5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e.jpg', image:'https://i.pinimg.com/736x/5b/6c/7d/5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e.jpg', desc:'Beautiful rose-centric Arabic mehndi' },
  { id:8,  serial:'A003', name:'Modern Arabic Floral',        category:'Arabic',     price:1400,  imageUrl:'https://i.pinimg.com/736x/8e/9f/0a/8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b.jpg', image:'https://i.pinimg.com/736x/8e/9f/0a/8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b.jpg', desc:'Contemporary Arabic with vines and florals' },
  { id:9,  serial:'A004', name:'Arabic Mandala Fusion',       category:'Arabic',     price:1600,  imageUrl:'https://i.pinimg.com/736x/1f/2a/3b/1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c.jpg', image:'https://i.pinimg.com/736x/1f/2a/3b/1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c.jpg', desc:'Mandala center with Arabic vine border' },
  { id:10, serial:'A005', name:'Arabic Vine & Petals',        category:'Arabic',     price:900,   imageUrl:'https://i.pinimg.com/736x/4a/5b/6c/4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d.jpg', image:'https://i.pinimg.com/736x/4a/5b/6c/4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d.jpg', desc:'Delicate vine pattern with petals' },
  { id:11, serial:'A006', name:'Gulf Arabic Style',           category:'Arabic',     price:1800,  imageUrl:'https://i.pinimg.com/736x/7d/8e/9f/7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a.jpg', image:'https://i.pinimg.com/736x/7d/8e/9f/7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a.jpg', desc:'Bold Gulf-style Arabic with thick florals' },
  // ===== SIMPLE =====
  { id:12, serial:'S001', name:'Simple Single Hand',          category:'Simple',     price:300,   imageUrl:'https://i.pinimg.com/736x/0a/1b/2c/0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d.jpg', image:'https://i.pinimg.com/736x/0a/1b/2c/0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d.jpg', desc:'Easy floral design for everyday wear' },
  { id:13, serial:'S002', name:'Simple Back Hand',            category:'Simple',     price:400,   imageUrl:'https://i.pinimg.com/736x/3d/4e/5f/3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a.jpg', image:'https://i.pinimg.com/736x/3d/4e/5f/3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a.jpg', desc:'Minimal back hand design with leaf motif' },
  { id:14, serial:'S003', name:'Simple Finger Design',        category:'Simple',     price:250,   imageUrl:'https://i.pinimg.com/736x/6a/7b/8c/6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d.jpg', image:'https://i.pinimg.com/736x/6a/7b/8c/6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d.jpg', desc:'Beautiful finger mehndi only' },
  { id:15, serial:'S004', name:'Simple Wrist Band',           category:'Simple',     price:200,   imageUrl:'https://i.pinimg.com/736x/9d/0e/1f/9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a.jpg', image:'https://i.pinimg.com/736x/9d/0e/1f/9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a.jpg', desc:'Bracelet-style wrist band mehndi' },
  { id:16, serial:'S005', name:'Simple Both Hands',           category:'Simple',     price:600,   imageUrl:'https://i.pinimg.com/736x/2a/3b/4c/2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d.jpg', image:'https://i.pinimg.com/736x/2a/3b/4c/2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d.jpg', desc:'Simple design on both hands together' },
  // ===== FESTIVAL =====
  { id:17, serial:'F001', name:'Karva Chauth Special',        category:'Festival',   price:700,   imageUrl:'https://i.pinimg.com/736x/5e/6f/7a/5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg', image:'https://i.pinimg.com/736x/5e/6f/7a/5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b.jpg', desc:'Traditional Karva Chauth full hand design' },
  { id:18, serial:'F002', name:'Diwali Sparkle Mehndi',       category:'Festival',   price:600,   imageUrl:'https://i.pinimg.com/736x/8b/9c/0d/8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e.jpg', image:'https://i.pinimg.com/736x/8b/9c/0d/8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e.jpg', desc:'Festive Diwali design with diyas & flowers' },
  { id:19, serial:'F003', name:'Teej Celebration',            category:'Festival',   price:650,   imageUrl:'https://i.pinimg.com/736x/1e/2f/3a/1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b.jpg', image:'https://i.pinimg.com/736x/1e/2f/3a/1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b.jpg', desc:'Special Teej design with traditional motifs' },
  { id:20, serial:'F004', name:'Navratri Mehndi',             category:'Festival',   price:550,   imageUrl:'https://i.pinimg.com/736x/4b/5c/6d/4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e.jpg', image:'https://i.pinimg.com/736x/4b/5c/6d/4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e.jpg', desc:'Navratri-themed design with dandiya motifs' },
  { id:21, serial:'F005', name:'Eid Special Mehndi',          category:'Festival',   price:750,   imageUrl:'https://i.pinimg.com/736x/7e/8f/9a/7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b.jpg', image:'https://i.pinimg.com/736x/7e/8f/9a/7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b.jpg', desc:'Eid celebration full hand Arabic mehndi' },
  { id:22, serial:'F006', name:'Haldi Function Mehndi',       category:'Festival',   price:500,   imageUrl:'https://i.pinimg.com/736x/0b/1c/2d/0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e.jpg', image:'https://i.pinimg.com/736x/0b/1c/2d/0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e.jpg', desc:'Light mehndi for haldi day function' },
  // ===== PARTY =====
  { id:23, serial:'P001', name:'Party Glam Design',           category:'Party',      price:900,   imageUrl:'https://i.pinimg.com/736x/3f/4a/5b/3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c.jpg', image:'https://i.pinimg.com/736x/3f/4a/5b/3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c.jpg', desc:'Glamorous party look with modern touches' },
  { id:24, serial:'P002', name:'Cocktail Party Mehndi',       category:'Party',      price:1100,  imageUrl:'https://i.pinimg.com/736x/6c/7d/8e/6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f.jpg', image:'https://i.pinimg.com/736x/6c/7d/8e/6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f.jpg', desc:'Sleek modern design for cocktail parties' },
  { id:25, serial:'P003', name:'Sangeet Night Design',        category:'Party',      price:1500,  imageUrl:'https://i.pinimg.com/736x/9f/0a/1b/9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c.jpg', image:'https://i.pinimg.com/736x/9f/0a/1b/9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c.jpg', desc:'Sangeet special with musical notes & flowers' },
  { id:26, serial:'P004', name:'Ladies Kitty Party',          category:'Party',      price:800,   imageUrl:'https://i.pinimg.com/736x/2c/3d/4e/2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f.jpg', image:'https://i.pinimg.com/736x/2c/3d/4e/2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f.jpg', desc:'Fun & trendy design for kitty parties' },
  { id:27, serial:'P005', name:'Ring Ceremony Mehndi',        category:'Party',      price:1200,  imageUrl:'https://i.pinimg.com/736x/5f/6a/7b/5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c.jpg', image:'https://i.pinimg.com/736x/5f/6a/7b/5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c.jpg', desc:'Ring ceremony special with rings & hearts' },
  // ===== RAJASTHANI =====
  { id:28, serial:'R001', name:'Rajasthani Full Hand',        category:'Rajasthani', price:2500,  imageUrl:'https://i.pinimg.com/736x/8c/9d/0e/8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f.jpg', image:'https://i.pinimg.com/736x/8c/9d/0e/8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f.jpg', desc:'Dense traditional Rajasthani with camel & fort' },
  { id:29, serial:'R002', name:'Marwari Bridal Style',        category:'Rajasthani', price:3500,  imageUrl:'https://i.pinimg.com/736x/1f/2a/3b/1f2a3bedsf4c5d6e7f8a9b0c1d2e3f4a.jpg', image:'https://i.pinimg.com/736x/1f/2a/3b/1f2a3bedsf4c5d6e7f8a9b0c1d2e3f4a.jpg', desc:'Marwari bridal with thick traditional patterns' },
  { id:30, serial:'R003', name:'Rajasthani Mandana',          category:'Rajasthani', price:2000,  imageUrl:'https://i.pinimg.com/736x/4e/5f/6a/4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b.jpg', image:'https://i.pinimg.com/736x/4e/5f/6a/4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b.jpg', desc:'Geometric Mandana-inspired design' },
  // ===== INDO-ARABIC =====
  { id:31, serial:'I001', name:'Indo Arabic Fusion',          category:'Indo-Arabic',price:2000,  imageUrl:'https://i.pinimg.com/736x/7b/8c/9d/7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e.jpg', image:'https://i.pinimg.com/736x/7b/8c/9d/7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e.jpg', desc:'Perfect blend of Indian and Arabic styles' },
  { id:32, serial:'I002', name:'Indo Arabic Bridal',          category:'Indo-Arabic',price:4000,  imageUrl:'https://i.pinimg.com/736x/0e/1f/2a/0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b.jpg', image:'https://i.pinimg.com/736x/0e/1f/2a/0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b.jpg', desc:'Indo-Arabic mix ideal for bridal' },
  { id:33, serial:'I003', name:'Mughal Fusion Design',        category:'Indo-Arabic',price:2200,  imageUrl:'https://i.pinimg.com/736x/3b/4c/5d/3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e.jpg', image:'https://i.pinimg.com/736x/3b/4c/5d/3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e.jpg', desc:'Mughal-era motifs fused with Arabic vine' },
  // ===== FEET =====
  { id:34, serial:'FT01', name:'Bridal Feet Full',            category:'Feet',       price:2500,  imageUrl:'https://i.pinimg.com/736x/6e/7f/8a/6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b.jpg', image:'https://i.pinimg.com/736x/6e/7f/8a/6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b.jpg', desc:'Full bridal feet design with anklets motif' },
  { id:35, serial:'FT02', name:'Simple Feet Design',          category:'Feet',       price:600,   imageUrl:'https://i.pinimg.com/736x/9a/0b/1c/9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d.jpg', image:'https://i.pinimg.com/736x/9a/0b/1c/9a0b1c2d3e4f5a6b7c8d9e0f1a2b3c4d.jpg', desc:'Easy simple feet mehndi for functions' },
  { id:36, serial:'FT03', name:'Arabic Feet Pattern',         category:'Feet',       price:1200,  imageUrl:'https://i.pinimg.com/736x/2d/3e/4f/2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a.jpg', image:'https://i.pinimg.com/736x/2d/3e/4f/2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a.jpg', desc:'Arabic-style flowing design on both feet' },
  // ===== FINGER =====
  { id:37, serial:'FN01', name:'Finger Ring Mehndi',          category:'Finger',     price:300,   imageUrl:'https://i.pinimg.com/736x/5a/6b/7c/5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d.jpg', image:'https://i.pinimg.com/736x/5a/6b/7c/5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d.jpg', desc:'Ring-style finger mehndi design' },
  { id:38, serial:'FN02', name:'All Finger Design',           category:'Finger',     price:450,   imageUrl:'https://i.pinimg.com/736x/8e/9f/0a/8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b.jpg', image:'https://i.pinimg.com/736x/8e/9f/0a/8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b.jpg', desc:'Beautiful design covering all fingers' },
  { id:39, serial:'FN03', name:'Nail Art Mehndi',             category:'Finger',     price:350,   imageUrl:'https://i.pinimg.com/736x/1b/2c/3d/1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e.jpg', image:'https://i.pinimg.com/736x/1b/2c/3d/1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e.jpg', desc:'Nail-tip styled unique finger mehndi' },
  // ===== GLITTER =====
  { id:40, serial:'G001', name:'Glitter Mehndi Design',       category:'Glitter',    price:1500,  imageUrl:'https://i.pinimg.com/736x/4f/5a/6b/4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c.jpg', image:'https://i.pinimg.com/736x/4f/5a/6b/4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c.jpg', desc:'Gold/silver glitter mixed with henna' },
  { id:41, serial:'G002', name:'Glitter Bridal Mehndi',       category:'Glitter',    price:3000,  imageUrl:'https://i.pinimg.com/736x/7c/8d/9e/7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f.jpg', image:'https://i.pinimg.com/736x/7c/8d/9e/7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f.jpg', desc:'Bridal mehndi with glitter overlay' },
];

// ======= IMAGE COMPRESSION =======
function compressImage(source, maxWidth = 800, quality = 0.72) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      let w = img.naturalWidth, h = img.naturalHeight;
      if (w > maxWidth) { h = Math.round(h * maxWidth / w); w = maxWidth; }
      const canvas = document.createElement('canvas');
      canvas.width = w; canvas.height = h;
      canvas.getContext('2d').drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = source;
  });
}

// ─── Convert dataURL to File object (for API upload) ─────────────
function dataURLtoFile(dataurl, filename) {
  const arr  = dataurl.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8 = new Uint8Array(n);
  while (n--) u8[n] = bstr.charCodeAt(n);
  return new File([u8], filename, { type: mime });
}

// ======= ALL CATEGORIES =======
const ALL_CATEGORIES = [
  'Bridal','Arabic','Simple','Festival','Party',
  'Rajasthani','Indo-Arabic','Feet','Finger','Glitter'
];
