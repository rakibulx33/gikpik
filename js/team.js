/* Team roster. One object per person; the Team section renders them
   automatically. Fields: name, role, blurb (optional), photo (optional),
   links (optional: { linkedin, github, ... }), and bn (optional: the same
   fields in Bangla, used on the /bn/ page). Card order is shuffled per visit. */
window.GIKPIK_TEAM = [
  {
    name: "Rakibul", role: "Full-stack development", blurb: "Backend systems and automation, with a strong hand in UI.",
    tags: ["Backend", "Automation", "Full-stack", "UI"], photo: "assets/team/member-4.jpg",
    bn: { name: "রাকিবুল", role: "ফুল-স্ট্যাক ডেভেলপমেন্ট", blurb: "ব্যাকএন্ড সিস্টেম আর অটোমেশনে দক্ষ, UI-তেও পারদর্শী।", tags: ["ব্যাকএন্ড", "অটোমেশন", "ফুল-স্ট্যাক", "UI"] }
  },
  {
    name: "Johurul Islam", role: "Manager", blurb: "Keeps every project on scope, on time and on track.",
    tags: ["Planning", "Delivery", "Clients"], photo: "assets/team/member-3.jpg",
    bn: { name: "জহুরুল ইসলাম", role: "ম্যানেজার", blurb: "প্রতিটি প্রজেক্ট স্কোপ, সময় আর লক্ষ্যের মধ্যে রাখেন।", tags: ["পরিকল্পনা", "ডেলিভারি", "ক্লায়েন্ট"] }
  },
  {
    name: "Faimul", role: "App and software development", blurb: "Builds the mobile apps and software products.",
    tags: ["Mobile apps", "Software"], photo: "assets/team/member-1.jpg",
    bn: { name: "ফাইমুল", role: "অ্যাপ ও সফটওয়্যার ডেভেলপমেন্ট", blurb: "মোবাইল অ্যাপ আর সফটওয়্যার প্রোডাক্ট তৈরি করেন।", tags: ["মোবাইল অ্যাপ", "সফটওয়্যার"] }
  },
  {
    name: "SM Toha", role: "Web and UI development", blurb: "Designs and builds the websites and interfaces people use.",
    tags: ["Websites", "UI"], photo: "assets/team/member-2.jpg",
    bn: { name: "এস এম তোহা", role: "ওয়েব ও UI ডেভেলপমেন্ট", blurb: "মানুষ যেসব ওয়েবসাইট আর ইন্টারফেস ব্যবহার করে, সেগুলো ডিজাইন করে তৈরি করেন।", tags: ["ওয়েবসাইট", "UI"] }
  }
];
