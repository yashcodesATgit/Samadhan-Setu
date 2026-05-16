// ============================================================
// mockData.js
// This file contains fake/demo data for the app.
// Since there is no backend, we use this as our starting data.
// All user-created issues are stored in the browser's localStorage.
// ============================================================

// Demo civic issues pre-loaded with real Indian city coordinates
export const DEMO_ISSUES = [
  {
    id: "demo-1",
    user_id: "citizen-demo",
    title: "Large Pothole on MG Road",
    description: "There is a very deep pothole on MG Road near the metro station. It has caused two accidents already and vehicles are swerving dangerously to avoid it.",
    location: "MG Road, Bengaluru, Karnataka",
    status: "pending",
    lat: 12.9716,
    lng: 77.5946,
    images: [
      "https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&q=80&w=400"
    ],
    audios: [],
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: "demo-2",
    user_id: "citizen-demo",
    title: "Broken Street Light",
    description: "The street light at Connaught Place has been broken for 3 days, making it completely dark and unsafe at night. People are afraid to walk there.",
    location: "Connaught Place, New Delhi",
    status: "in_progress",
    lat: 28.6304,
    lng: 77.2177,
    images: [
      "https://images.unsplash.com/photo-1494522855154-9297ac14b55f?auto=format&fit=crop&q=80&w=400"
    ],
    audios: [],
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: "demo-3",
    user_id: "citizen-demo",
    title: "Garbage Pile Near School",
    description: "A huge garbage pile has formed near the primary school in Andheri East. The smell is unbearable and it is a health hazard for the children.",
    location: "Andheri East, Mumbai, Maharashtra",
    status: "pending",
    lat: 19.1136,
    lng: 72.8697,
    images: [
      "https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?auto=format&fit=crop&q=80&w=400"
    ],
    audios: [],
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: "demo-4",
    user_id: "citizen-demo",
    title: "Water Pipeline Leakage",
    description: "A major water pipeline is leaking on Park Street for over a week. Gallons of clean drinking water is being wasted every hour. Road is also getting damaged.",
    location: "Park Street, Kolkata, West Bengal",
    status: "resolved",
    lat: 22.5513,
    lng: 88.3563,
    images: [
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&q=80&w=400"
    ],
    audios: [],
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days ago
  },
  {
    id: "demo-5",
    user_id: "citizen-demo",
    title: "Damaged Footpath",
    description: "The footpath near Banjara Hills is completely broken with exposed rods. It is very dangerous, especially for elderly people and children.",
    location: "Banjara Hills, Hyderabad, Telangana",
    status: "in_progress",
    lat: 17.4126,
    lng: 78.4480,
    images: [
      "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=400"
    ],
    audios: [],
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  },
  {
    id: "demo-6",
    user_id: "citizen-demo",
    title: "Overflowing Drain",
    description: "The drain near Jawahar Nagar is overflowing and causing flooding on the road. It becomes impassable during rain and mosquitoes are breeding there.",
    location: "Jawahar Nagar, Jaipur, Rajasthan",
    status: "pending",
    lat: 26.9124,
    lng: 75.7873,
    images: [
      "https://images.unsplash.com/photo-1545987796-200677ee1011?auto=format&fit=crop&q=80&w=400"
    ],
    audios: [],
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
  },
];

// Demo user accounts (no real passwords needed — just for demo)
// Role is determined by the email address
export const DEMO_ACCOUNTS = [
  { email: "citizen@demo.com", password: "123456", name: "Rahul Sharma", role: "citizen" },
  { email: "admin@demo.com",   password: "123456", name: "Priya Singh",  role: "admin" },
];
