export interface Clinic {
  id: string;
  name: string;
  lat: number;
  lng: number;
  address: string;
  phone: string;
  medicines: Medicine[];
}

export interface Medicine {
  id: string;
  name: string;
  category: string;
  quantity: number;
  isMaternal: boolean;
}

export interface PatientRequest {
  id: string;
  patientName: string;
  medicine: string;
  clinicId: string;
  clinicName: string;
  status: "pending" | "approved" | "completed" | "rejected";
  date: string;
}

export interface HealthTip {
  id: string;
  title: string;
  description: string;
  category: "maternal" | "preventive" | "nutrition";
  icon: string;
}

export const clinics: Clinic[] = [
  {
    id: "c1",
    name: "Greenfield Rural Health Center",
    lat: 28.6139,
    lng: 77.209,
    address: "Village Greenfield, District Meerut",
    phone: "+91 98765 43210",
    medicines: [
      { id: "m1", name: "Oxytocin", category: "Maternal", quantity: 45, isMaternal: true },
      { id: "m2", name: "Misoprostol", category: "Maternal", quantity: 0, isMaternal: true },
      { id: "m3", name: "Paracetamol", category: "General", quantity: 200, isMaternal: false },
      { id: "m4", name: "Iron Folic Acid", category: "Nutrition", quantity: 150, isMaternal: true },
    ],
  },
  {
    id: "c2",
    name: "Sunrise Community Clinic",
    lat: 28.7041,
    lng: 77.1025,
    address: "Block A, Sunrise Colony",
    phone: "+91 98765 43211",
    medicines: [
      { id: "m5", name: "Oxytocin", category: "Maternal", quantity: 0, isMaternal: true },
      { id: "m6", name: "Amoxicillin", category: "Antibiotic", quantity: 80, isMaternal: false },
      { id: "m7", name: "Magnesium Sulfate", category: "Maternal", quantity: 30, isMaternal: true },
      { id: "m8", name: "ORS Packets", category: "General", quantity: 500, isMaternal: false },
    ],
  },
  {
    id: "c3",
    name: "River Valley Health Post",
    lat: 28.5355,
    lng: 77.391,
    address: "Near River Bridge, Noida",
    phone: "+91 98765 43212",
    medicines: [
      { id: "m9", name: "Calcium Tablets", category: "Nutrition", quantity: 120, isMaternal: true },
      { id: "m10", name: "Misoprostol", category: "Maternal", quantity: 25, isMaternal: true },
      { id: "m11", name: "Metformin", category: "General", quantity: 60, isMaternal: false },
      { id: "m12", name: "Folic Acid", category: "Nutrition", quantity: 0, isMaternal: true },
    ],
  },
  {
    id: "c4",
    name: "Hope Maternal Care Center",
    lat: 28.4595,
    lng: 77.0266,
    address: "Sector 12, Gurgaon",
    phone: "+91 98765 43213",
    medicines: [
      { id: "m13", name: "Oxytocin", category: "Maternal", quantity: 60, isMaternal: true },
      { id: "m14", name: "Misoprostol", category: "Maternal", quantity: 40, isMaternal: true },
      { id: "m15", name: "Iron Folic Acid", category: "Nutrition", quantity: 0, isMaternal: true },
      { id: "m16", name: "Vitamin B12", category: "Nutrition", quantity: 90, isMaternal: false },
    ],
  },
];

export const patientRequests: PatientRequest[] = [
  { id: "r1", patientName: "Priya Sharma", medicine: "Oxytocin", clinicId: "c1", clinicName: "Greenfield Rural Health Center", status: "pending", date: "2026-03-09" },
  { id: "r2", patientName: "Priya Sharma", medicine: "Iron Folic Acid", clinicId: "c3", clinicName: "River Valley Health Post", status: "approved", date: "2026-03-07" },
  { id: "r3", patientName: "Priya Sharma", medicine: "Paracetamol", clinicId: "c1", clinicName: "Greenfield Rural Health Center", status: "completed", date: "2026-03-01" },
  { id: "r4", patientName: "Anita Devi", medicine: "Misoprostol", clinicId: "c2", clinicName: "Sunrise Community Clinic", status: "pending", date: "2026-03-10" },
];

export const healthTips: HealthTip[] = [
  { id: "t1", title: "Antenatal Check-ups", description: "Regular check-ups during pregnancy help detect complications early. Visit your nearest clinic at least 4 times during pregnancy.", category: "maternal", icon: "Heart" },
  { id: "t2", title: "Iron & Folic Acid", description: "Take iron and folic acid supplements daily during pregnancy to prevent anemia and neural tube defects.", category: "nutrition", icon: "Pill" },
  { id: "t3", title: "Safe Drinking Water", description: "Always drink clean, boiled or filtered water to prevent waterborne diseases, especially during monsoon season.", category: "preventive", icon: "Droplets" },
  { id: "t4", title: "Breastfeeding Benefits", description: "Exclusive breastfeeding for the first 6 months provides all essential nutrients and protects against infections.", category: "maternal", icon: "Baby" },
  { id: "t5", title: "Vaccination Schedule", description: "Ensure timely vaccination for children. Follow the national immunization schedule for protection against diseases.", category: "preventive", icon: "Shield" },
  { id: "t6", title: "Balanced Nutrition", description: "Include proteins, green vegetables, fruits, and whole grains in your daily diet for optimal health.", category: "nutrition", icon: "Apple" },
];
