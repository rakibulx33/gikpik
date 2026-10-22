#!/usr/bin/env python3
"""Build the Bangla page (bn/index.html) from the English page (index.html).

The English page is the source of truth. This script copies it, swaps every
visible English string for its Bangla translation, fixes relative paths for the
/bn/ folder, and switches language metadata. Run it after any change to
index.html:

    python3 tools/build_bn.py

It stops with an error if an English string in the table below no longer exists
in index.html (so a changed sentence is never silently left untranslated), and
prints any English text that is still visible on the Bangla page so it can be
reviewed. Strings that are meant to stay in English (project names, tech
names, links, the tagline) are listed in KEEP.

JavaScript strings (solutions explorer, form messages, team data) are
translated in js/main.js and js/team.js; they switch on <html lang="bn">.
"""
import html
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "index.html"
OUT = ROOT / "bn" / "index.html"
SITE = "https://rakibulx33.github.io/gikpik/"

# ---------------------------------------------------------------------------
# Visible text: English -> Bangla
# ---------------------------------------------------------------------------
TEXT = {
    # head + header
    "Gikpik | Real problems. Properly solved.": "Gikpik | আসল সমস্যা। সঠিক সমাধান।",
    "Skip to content": "মূল বিষয়ে যান",
    "Services": "সেবা",
    "Solutions": "সমাধান",
    "Work": "কাজ",
    "Team": "টিম",
    "How we work": "কাজের ধরন",
    "Start a project": "প্রজেক্ট শুরু করুন",
    "Menu": "মেনু",

    # hero
    "Open for new projects": "নতুন প্রজেক্ট নিচ্ছি",
    "Real problems.": "আসল সমস্যা।",
    "Properly solved.": "সঠিক সমাধান।",
    "Gikpik designs and builds websites, mobile apps and automation that take work off your plate. Tell us the problem. We will tell you what is possible, then build it.":
        "Gikpik ওয়েবসাইট, মোবাইল অ্যাপ আর অটোমেশন ডিজাইন করে তৈরি করে, যা আপনার কাজের বোঝা কমায়। সমস্যাটা আমাদের বলুন। কী করা সম্ভব তা জানাব, তারপর তৈরি করে দেব।",
    "Discuss your project": "আপনার প্রজেক্ট নিয়ে কথা বলুন",
    "See what we have built": "আমাদের কাজ দেখুন",
    "Every project starts with a free feasibility call: straight answers on what is possible, what is conditional and what is not worth building.":
        "প্রতিটি প্রজেক্ট শুরু হয় একটি ফ্রি ফিজিবিলিটি কল দিয়ে: কী সম্ভব, কী শর্তসাপেক্ষ, আর কী বানানোর মানে হয় না, সব সোজাসুজি জানিয়ে দিই।",
    "Websites": "ওয়েবসাইট",
    "Mobile apps": "মোবাইল অ্যাপ",
    "Automation": "অটোমেশন",
    "Order synced to sheet. Alert sent.": "অর্ডার শিটে উঠেছে। অ্যালার্ট গেছে।",
    "Scroll to climb": "নিচে স্ক্রল করুন",

    # numbers + bands
    "projects built": "প্রজেক্ট তৈরি করেছি",
    "services under one roof": "ধরনের সেবা, এক ছাদের নিচে",
    "quality gates before launch": "ধাপে মান যাচাই, লঞ্চের আগে",
    "ways to start a project": "ভাবে প্রজেক্ট শুরু করা যায়",
    "Web apps": "ওয়েব অ্যাপ",
    "AI workflows": "এআই ওয়ার্কফ্লো",
    "E-commerce": "ই-কমার্স",
    "Dashboards": "ড্যাশবোর্ড",
    "Integrations": "ইন্টিগ্রেশন",

    # services
    "Websites, apps and automation. One team.": "ওয়েবসাইট, অ্যাপ আর অটোমেশন। এক টিমেই।",
    "Most clients come to us with a problem, not a spec. We turn it into software that works, and we stay to keep it working.":
        "বেশিরভাগ ক্লায়েন্ট আমাদের কাছে আসেন একটা সমস্যা নিয়ে, তৈরি স্পেসিফিকেশন নিয়ে নয়। আমরা সেটাকে কাজের সফটওয়্যারে রূপ দিই, আর সেটা যেন চলতে থাকে সেজন্য পাশে থাকি।",
    "Websites and web apps": "ওয়েবসাইট ও ওয়েব অ্যাপ",
    "Business sites, landing pages, dashboards, admin panels, booking systems and customer portals. Responsive, fast and built so someone can maintain them.":
        "বিজনেস সাইট, ল্যান্ডিং পেজ, ড্যাশবোর্ড, অ্যাডমিন প্যানেল, বুকিং সিস্টেম আর কাস্টমার পোর্টাল। রেসপন্সিভ, দ্রুত, আর এমনভাবে তৈরি যাতে পরেও সহজে রক্ষণাবেক্ষণ করা যায়।",
    "You get": "আপনি পাবেন",
    "your business online, with the daily work digital.": "অনলাইনে আপনার ব্যবসা, আর প্রতিদিনের কাজ ডিজিটাল।",
    "Business apps for Android, and iOS-compatible builds when a project needs them: customer portals, staff apps and field data collection.":
        "অ্যান্ড্রয়েডের জন্য বিজনেস অ্যাপ, আর প্রজেক্টে দরকার হলে iOS-উপযোগী বিল্ড: কাস্টমার পোর্টাল, স্টাফ অ্যাপ আর মাঠপর্যায়ের ডেটা সংগ্রহ।",
    "your service in your customers' and staff's pockets.": "আপনার সেবা আপনার কাস্টমার আর স্টাফদের হাতের মুঠোয়।",
    "Automation and AI workflows": "অটোমেশন ও এআই ওয়ার্কফ্লো",
    "Form to spreadsheet to notification. CRM follow-ups, document processing, approvals, API integrations and AI-assisted customer support.":
        "ফর্ম থেকে স্প্রেডশিট, সেখান থেকে নোটিফিকেশন। সিআরএম ফলো-আপ, ডকুমেন্ট প্রসেসিং, অনুমোদন, এপিআই ইন্টিগ্রেশন আর এআই-সহায়ক কাস্টমার সাপোর্ট।",
    "fewer repeated steps and less time lost to admin.": "একই কাজ বারবার করতে হয় কম, প্রশাসনিক কাজে সময় নষ্ট হয় কম।",
    "E-commerce systems": "ই-কমার্স সিস্টেম",
    "Online stores, product and order management, inventory sync, invoices, shipping and payment integration that follows each provider's rules.":
        "অনলাইন স্টোর, প্রোডাক্ট ও অর্ডার ম্যানেজমেন্ট, ইনভেন্টরি সিঙ্ক, ইনভয়েস, শিপিং, আর প্রতিটি প্রোভাইডারের নিয়ম মেনে পেমেন্ট ইন্টিগ্রেশন।",
    "a store that keeps running day to day.": "এমন একটি স্টোর, যা প্রতিদিন ঠিকঠাক চলে।",
    "Custom software": "কাস্টম সফটওয়্যার",
    "Office management, inventory, billing, reporting, POS-connected tools and internal APIs.":
        "অফিস ম্যানেজমেন্ট, ইনভেন্টরি, বিলিং, রিপোর্টিং, POS-যুক্ত টুল আর ইন্টারনাল এপিআই।",
    "tools shaped around how your office actually works.": "আপনার অফিস আসলে যেভাবে চলে, সেভাবেই বানানো টুল।",
    "Maintenance and support": "রক্ষণাবেক্ষণ ও সাপোর্ট",
    "Monitoring on": "মনিটরিং চালু",
    "Bug fixes, hosting and deployment, backups, performance checks, feature updates and documentation.":
        "বাগ ফিক্স, হোস্টিং ও ডিপ্লয়মেন্ট, ব্যাকআপ, পারফরম্যান্স চেক, ফিচার আপডেট আর ডকুমেন্টেশন।",
    "a system that stays fast, safe and up to date.": "এমন সিস্টেম, যা থাকে দ্রুত, নিরাপদ আর হালনাগাদ।",
    "Three ways to start": "শুরু করার তিনটি উপায়",
    "Business Starter": "বিজনেস স্টার্টার",
    "A website, a contact form and a basic dashboard.": "একটি ওয়েবসাইট, একটি কন্টাক্ট ফর্ম আর একটি বেসিক ড্যাশবোর্ড।",
    "Ask about this": "এ নিয়ে জানতে চাই",
    "Process Automation": "প্রসেস অটোমেশন",
    "One time-consuming task turned into a reliable workflow.": "সময়খেকো একটি কাজকে নির্ভরযোগ্য ওয়ার্কফ্লোতে রূপান্তর।",
    "MVP Build": "এমভিপি বিল্ড",
    "We test your idea, then build a first usable version with limited features.":
        "আগে আপনার আইডিয়া যাচাই করি, তারপর সীমিত ফিচারসহ ব্যবহারযোগ্য প্রথম ভার্সন তৈরি করি।",

    # solutions
    "Tell us the problem. We will build the fix.": "সমস্যাটা বলুন। সমাধান আমরা বানাব।",
    "Pick the one that sounds like you. These are examples of what we would build, not finished client case studies.":
        "যেটা আপনার সাথে মেলে, সেটা বেছে নিন। এগুলো আমরা কী বানাতে পারি তার উদাহরণ, কোনো ক্লায়েন্টের সম্পূর্ণ কেস স্টাডি নয়।",
    "Clinic or diagnostic centre": "ক্লিনিক বা ডায়াগনস্টিক সেন্টার",
    "Local shop": "স্থানীয় দোকান",
    "Online seller": "অনলাইন সেলার",
    "Service agency": "সার্ভিস এজেন্সি",
    "Startup": "স্টার্টআপ",
    "Today": "এখন যা হয়",
    "What we would build": "আমরা যা বানাব",

    # work
    "Selected work": "নির্বাচিত কাজ",
    "Seventeen projects, from client systems to hackathon builds. Private repositories are described without code, and we are happy to walk through them on a call.":
        "ক্লায়েন্ট সিস্টেম থেকে হ্যাকাথন বিল্ড পর্যন্ত সতেরোটি প্রজেক্ট। প্রাইভেট রিপোজিটরির বর্ণনা কোড ছাড়া দেওয়া হয়েছে; কলে বিস্তারিত দেখাতে আমরা আগ্রহী।",
    "Hover or tap a project to open it": "খুলতে প্রজেক্টের ওপর মাউস রাখুন বা ট্যাপ করুন",
    "E-commerce platform": "ই-কমার্স প্ল্যাটফর্ম",
    "A full online store for electronics and IoT parts in Bangladesh, with customer accounts, local payments and delivery, and a staff admin panel.":
        "বাংলাদেশে ইলেকট্রনিক্স ও আইওটি পার্টসের পূর্ণাঙ্গ অনলাইন স্টোর, যেখানে আছে কাস্টমার অ্যাকাউন্ট, লোকাল পেমেন্ট ও ডেলিভারি, আর স্টাফদের জন্য অ্যাডমিন প্যানেল।",
    "Private repository": "প্রাইভেট রিপোজিটরি",
    "Algorithmic trading system": "অ্যালগরিদমিক ট্রেডিং সিস্টেম",
    "An algorithmic trading system for automated strategy research and validation. It runs demo-first, with real money only behind an explicit gate.":
        "স্বয়ংক্রিয় স্ট্র্যাটেজি গবেষণা ও যাচাইয়ের জন্য একটি অ্যালগরিদমিক ট্রেডিং সিস্টেম। এটি আগে ডেমোতে চলে, আর আসল টাকায় চলে কেবল একটি সুস্পষ্ট অনুমোদন ধাপ পেরিয়ে।",
    "Source on GitHub": "GitHub-এ সোর্স",
    "Multi-tenant SaaS": "মাল্টি-টেন্যান্ট SaaS",
    "A multi-tenant storefront platform where each shop gets an AI assistant that helps customers find products by voice and chat.":
        "মাল্টি-টেন্যান্ট স্টোরফ্রন্ট প্ল্যাটফর্ম, যেখানে প্রতিটি দোকান পায় একটি এআই অ্যাসিস্ট্যান্ট, যা ভয়েস ও চ্যাটে কাস্টমারদের প্রোডাক্ট খুঁজে দেয়।",
    "AI social inbox": "এআই সোশ্যাল ইনবক্স",
    "An AI-assisted inbox that brings a business's social messaging channels into one place and helps answer customers faster.":
        "এআই-সহায়ক একটি ইনবক্স, যা ব্যবসার সব সোশ্যাল মেসেজিং চ্যানেল এক জায়গায় আনে এবং কাস্টমারদের দ্রুত উত্তর দিতে সাহায্য করে।",
    "Mobile app and backend platform": "মোবাইল অ্যাপ ও ব্যাকএন্ড প্ল্যাটফর্ম",
    "A social engagement platform with a native Android app, a backend API and an admin panel.":
        "নেটিভ অ্যান্ড্রয়েড অ্যাপ, ব্যাকএন্ড এপিআই আর অ্যাডমিন প্যানেলসহ একটি সোশ্যাল এনগেজমেন্ট প্ল্যাটফর্ম।",
    "Solo build for AI DevFest 2026": "AI DevFest 2026-এর জন্য একক বিল্ড",
    "Takes a tender's requirements and a set of PDFs and produces one checked, correctly ordered PDF package, with a cover page and a footer on every page. It runs in the browser, in English and Bangla, and no file is ever uploaded.":
        "টেন্ডারের শর্তাবলি আর একগুচ্ছ পিডিএফ নিয়ে তৈরি করে একটি যাচাই করা, সঠিক ক্রমে সাজানো পিডিএফ প্যাকেজ, কভার পেজ আর প্রতিটি পৃষ্ঠায় ফুটারসহ। এটি ব্রাউজারেই চলে, ইংরেজি ও বাংলায়, কোনো ফাইল কোথাও আপলোড হয় না।",
    "Live demo": "লাইভ ডেমো",
    "Also built": "আরও যা বানিয়েছি",
    "All": "সব",
    "Web and SaaS": "ওয়েব ও SaaS",
    "AI and automation": "এআই ও অটোমেশন",
    "Mobile and desktop": "মোবাইল ও ডেস্কটপ",
    "Tools and experiments": "টুল ও এক্সপেরিমেন্ট",
    "Hackathon build. Evacuation route simulator that finds the lowest-cost route to an open exit and recalculates as corridors or exits are blocked. English and Bangla, keyboard accessible.":
        "হ্যাকাথন বিল্ড। জরুরি বের হওয়ার পথের সিমুলেটর, যা খোলা এক্সিটে যাওয়ার সবচেয়ে কম খরচের পথ খুঁজে দেয় এবং করিডর বা এক্সিট বন্ধ হলে নতুন করে হিসাব করে। ইংরেজি ও বাংলায়, কিবোর্ড দিয়ে ব্যবহারযোগ্য।",
    "Source": "সোর্স",
    "Bengali admin system for members with family trees, donations, expenses, a bank ledger and printable Bengali reports. Role-based access with CSRF protection and rate limiting.":
        "সদস্যদের জন্য বাংলা অ্যাডমিন সিস্টেম, যেখানে আছে পারিবারিক বংশতালিকা, দান, খরচ, ব্যাংক লেজার আর প্রিন্টযোগ্য বাংলা রিপোর্ট। রোলভিত্তিক অ্যাক্সেস, CSRF সুরক্ষা ও রেট লিমিটিংসহ।",
    "University job platform with student, recruiter and admin portals, AI job matching and academic eligibility scoring.":
        "বিশ্ববিদ্যালয়ের জব প্ল্যাটফর্ম, যেখানে আছে শিক্ষার্থী, রিক্রুটার ও অ্যাডমিন পোর্টাল, এআই জব ম্যাচিং আর একাডেমিক যোগ্যতা স্কোরিং।",
    "Listing-alert bot that watches Upbit, Binance, Bithumb and Coinbase for new listings, streams live status over WebSocket and sends Telegram alerts.":
        "লিস্টিং-অ্যালার্ট বট, যা Upbit, Binance, Bithumb ও Coinbase-এ নতুন লিস্টিংয়ের ওপর নজর রাখে, WebSocket-এ লাইভ স্ট্যাটাস দেখায় এবং Telegram-এ অ্যালার্ট পাঠায়।",
    "Mess management system for meals, attendance, inventory and shared finances in hostels and shared living spaces.":
        "হোস্টেল ও মেসের জন্য মিল, উপস্থিতি, ইনভেন্টরি আর যৌথ খরচের হিসাব রাখার মেস ম্যানেজমেন্ট সিস্টেম।",
    "Queue management with a JavaFX admin desktop app and a mobile web view. Customers join by QR code and see their live position.":
        "সারি ব্যবস্থাপনা সিস্টেম, যাতে আছে JavaFX অ্যাডমিন ডেস্কটপ অ্যাপ আর মোবাইল ওয়েব ভিউ। কাস্টমার QR কোড স্ক্যান করে সারিতে যুক্ত হন এবং লাইভ অবস্থান দেখতে পান।",
    "Team compiler project: a programming language with Bangla keywords, transpiled to C. Built for the compiler design course.":
        "টিম কম্পাইলার প্রজেক্ট: বাংলা কিওয়ার্ডের একটি প্রোগ্রামিং ভাষা, যা C-তে ট্রান্সপাইল হয়। কম্পাইলার ডিজাইন কোর্সের জন্য তৈরি।",
    "Windows desktop app: a floating, always-on-top meter showing live upload and download speed, with a customizable look.":
        "উইন্ডোজ ডেস্কটপ অ্যাপ: সবসময় ওপরে ভেসে থাকা একটি মিটার, যা লাইভ আপলোড ও ডাউনলোড স্পিড দেখায়; চেহারা নিজের মতো সাজানো যায়।",
    "Drag-and-drop, block-based cheatsheet builder with templates and PDF export.":
        "টেমপ্লেট ও পিডিএফ এক্সপোর্টসহ ড্র্যাগ-অ্যান্ড-ড্রপ, ব্লকভিত্তিক চিটশিট বিল্ডার।",
    "Android automation app for processing orders in the background.": "ব্যাকগ্রাউন্ডে অর্ডার প্রসেস করার অ্যান্ড্রয়েড অটোমেশন অ্যাপ।",
    "Clan and player stats tracker for Clash of Clans, served through a caching proxy for the official API.":
        "Clash of Clans-এর ক্ল্যান ও প্লেয়ার পরিসংখ্যান ট্র্যাকার, যা অফিশিয়াল এপিআইয়ের জন্য একটি ক্যাশিং প্রক্সির মাধ্যমে চলে।",
    "Nothing in this group yet.": "এই গ্রুপে এখনো কিছু নেই।",

    # team
    "Equal partners. One standard.": "সমান অংশীদার। একই মান।",
    "Everyone builds, everyone talks to clients, and every release is checked by a colleague before it ships. The goal is the same on every project: software that makes your business run better.":
        "সবাই নিজের হাতে কাজ করে, সবাই ক্লায়েন্টের সাথে কথা বলে, আর প্রতিটি রিলিজ প্রকাশের আগে একজন সহকর্মী যাচাই করে। প্রতিটি প্রজেক্টে লক্ষ্য একটাই: এমন সফটওয়্যার, যা আপনার ব্যবসাকে আরও ভালোভাবে চালায়।",
    "How we work with you": "আপনার সাথে যেভাবে কাজ করি",
    "One point of contact": "যোগাযোগের জন্য একজন নির্দিষ্ট ব্যক্তি",
    "Every project has a named contact from the first call to launch day, and they are in the room when you review.":
        "প্রথম কল থেকে লঞ্চের দিন পর্যন্ত প্রতিটি প্রজেক্টে থাকেন একজন নির্দিষ্ট যোগাযোগকারী, আর আপনি যখন রিভিউ করেন, তিনি সেখানে উপস্থিত থাকেন।",
    "Direct line to the builders": "নির্মাতাদের সাথে সরাসরি কথা",
    "Ask a question and the person who wrote the code answers it, in plain language.":
        "প্রশ্ন করুন, উত্তর দেবেন যিনি কোডটা লিখেছেন, সহজ ভাষায়।",
    "Scope in writing, first": "আগে লিখিত স্কোপ",
    "What is in, what is out, who pays for third-party services and what done means, agreed before we build.":
        "কী থাকবে, কী থাকবে না, থার্ড-পার্টি সেবার খরচ কে দেবে, আর কাজ শেষ বলতে কী বোঝায়, বানানো শুরুর আগেই সব ঠিক করে নিই।",
    "Reviewed before release": "রিলিজের আগে রিভিউ",
    "Every requirement, login, payment flow and release is checked by a person, not just a tool.":
        "প্রতিটি রিকোয়ারমেন্ট, লগইন, পেমেন্ট ফ্লো আর রিলিজ যাচাই করেন একজন মানুষ, শুধু কোনো টুল নয়।",
    "What we cover": "যেসব কাজ করি",
    "Engineering": "ইঞ্জিনিয়ারিং",
    "Backend systems, APIs, web and mobile apps, built to run reliably in production.":
        "ব্যাকএন্ড সিস্টেম, এপিআই, ওয়েব ও মোবাইল অ্যাপ, যা প্রোডাকশনে নির্ভরযোগ্যভাবে চলার জন্য তৈরি।",
    "Design and UX": "ডিজাইন ও UX",
    "Interfaces that make sense on the first visit, on a phone and on a desktop.":
        "এমন ইন্টারফেস, যা প্রথমবার দেখেই বোঝা যায়, ফোনে এবং ডেস্কটপে।",
    "Automation and AI": "অটোমেশন ও এআই",
    "Workflows, integrations and AI features that remove manual steps.":
        "ওয়ার্কফ্লো, ইন্টিগ্রেশন আর এআই ফিচার, যা হাতে করা ধাপগুলো সরিয়ে দেয়।",
    "QA and delivery": "QA ও ডেলিভারি",
    "Testing, deployment, handover and the support that follows launch.": "টেস্টিং, ডিপ্লয়মেন্ট, হস্তান্তর আর লঞ্চের পরের সাপোর্ট।",

    # process
    "From idea to live system": "আইডিয়া থেকে লাইভ সিস্টেম",
    "We do not promise the impossible. We check feasibility first, then propose the right solution. Scope is agreed in writing before we build: what is in, what is out, who pays for third-party services, how many revisions you get and what done means. Payment follows milestones.":
        "আমরা অসম্ভবের প্রতিশ্রুতি দিই না। আগে যাচাই করি কাজটা সম্ভব কি না, তারপর সঠিক সমাধান প্রস্তাব করি। বানানো শুরুর আগে স্কোপ লিখিতভাবে ঠিক হয়: কী থাকবে, কী থাকবে না, থার্ড-পার্টি সেবার খরচ কে দেবে, কতবার রিভিশন পাবেন, আর কাজ শেষ বলতে কী বোঝায়। পেমেন্ট হয় মাইলস্টোন ধরে।",
    "Every feasibility check ends in one of three answers": "প্রতিটি ফিজিবিলিটি চেকের উত্তর হয় এই তিনটির একটি",
    "Possible": "সম্ভব",
    "Conditional": "শর্তসাপেক্ষ",
    "Not viable": "বাস্তবসম্মত নয়",
    "Discovery": "প্রয়োজন বোঝা",
    "We learn the problem, the people who use it, the data, the budget, the deadline and any examples you have.":
        "আমরা জানি সমস্যাটা কী, কারা এটি ব্যবহার করবেন, ডেটা, বাজেট, ডেডলাইন আর আপনার কাছে থাকা যেকোনো উদাহরণ।",
    "a requirement summary.": "রিকোয়ারমেন্টের একটি সারসংক্ষেপ।",
    "Feasibility": "সম্ভাব্যতা যাচাই",
    "We check integrations, APIs, platform rules, security and technical risk.":
        "ইন্টিগ্রেশন, এপিআই, প্ল্যাটফর্মের নিয়ম, নিরাপত্তা আর কারিগরি ঝুঁকি যাচাই করি।",
    "a clear verdict: possible, conditional or not viable.": "স্পষ্ট সিদ্ধান্ত: সম্ভব, শর্তসাপেক্ষ, নাকি বাস্তবসম্মত নয়।",
    "Scope and quote": "স্কোপ ও কোটেশন",
    "Features, timeline, milestones and price, written down before work starts.": "ফিচার, সময়সীমা, মাইলস্টোন আর মূল্য, কাজ শুরুর আগেই লিখিতভাবে।",
    "a proposal and an agreement.": "একটি প্রস্তাবনা ও চুক্তি।",
    "Prototype": "প্রোটোটাইপ",
    "A small demo of the most important part of the system.": "সিস্টেমের সবচেয়ে গুরুত্বপূর্ণ অংশের একটি ছোট ডেমো।",
    "a demo and a review meeting.": "একটি ডেমো ও রিভিউ মিটিং।",
    "Build and test": "তৈরি ও টেস্ট",
    "Development, quality checks, regression tests, access control and bug fixing.":
        "ডেভেলপমেন্ট, মান যাচাই, রিগ্রেশন টেস্ট, অ্যাক্সেস কন্ট্রোল আর বাগ ফিক্সিং।",
    "a tested deliverable.": "টেস্ট করা ডেলিভারেবল।",
    "Deploy and support": "ডিপ্লয় ও সাপোর্ট",
    "Hosting and setup, training, handover and the support period we agreed.": "হোস্টিং ও সেটআপ, ট্রেনিং, হস্তান্তর আর সম্মত মেয়াদ পর্যন্ত সাপোর্ট।",
    "a live system and its documentation.": "চালু সিস্টেম ও তার ডকুমেন্টেশন।",
    "AI-assisted, human-accountable": "এআই-এর সহায়তা, মানুষের দায়বদ্ধতা",
    "We use AI tools to move faster on drafts, boilerplate and prototypes. A person reviews every requirement, data model, login, payment flow and release. Five gates stand between an idea and your customers.":
        "ড্রাফট, বয়লারপ্লেট আর প্রোটোটাইপে দ্রুত এগোতে আমরা এআই টুল ব্যবহার করি। তবে প্রতিটি রিকোয়ারমেন্ট, ডেটা মডেল, লগইন, পেমেন্ট ফ্লো আর রিলিজ রিভিউ করেন একজন মানুষ। একটি আইডিয়া আর আপনার কাস্টমারদের মাঝে আছে পাঁচ ধাপের যাচাই।",
    "Scope": "স্কোপ",
    "Acceptance criteria, integration limits, estimate and risks in writing.": "গ্রহণযোগ্যতার মানদণ্ড, ইন্টিগ্রেশনের সীমা, আনুমানিক হিসাব আর ঝুঁকি, লিখিতভাবে।",
    "Build": "বিল্ড",
    "Version control, code review, managed dependencies and secrets.": "ভার্সন কন্ট্রোল, কোড রিভিউ, সুনিয়ন্ত্রিত ডিপেন্ডেন্সি ও সিক্রেটস।",
    "Happy path and error path, user roles, input validation, backup and restore.": "স্বাভাবিক ও ত্রুটির পথ, ইউজার রোল, ইনপুট ভ্যালিডেশন, ব্যাকআপ ও রিস্টোর।",
    "Release": "রিলিজ",
    "Staging approval, production checklist, monitoring and a rollback plan.": "স্টেজিং অনুমোদন, প্রোডাকশন চেকলিস্ট, মনিটরিং আর রোলব্যাক পরিকল্পনা।",
    "Handover": "হস্তান্তর",
    "Admin access, deploy notes, invoice, support period and ownership.": "অ্যাডমিন অ্যাক্সেস, ডিপ্লয় নোট, ইনভয়েস, সাপোর্টের মেয়াদ আর মালিকানা।",

    # contact
    "Which task takes the most time in your day?": "আপনার দিনের কোন কাজে সবচেয়ে বেশি সময় যায়?",
    "Tell us. We will check whether software or automation can make it easier, and reply with questions and an honest read on feasibility. The first call is free.":
        "আমাদের জানান। সফটওয়্যার বা অটোমেশন দিয়ে সেটা সহজ করা যায় কি না দেখব, তারপর কিছু প্রশ্ন আর সম্ভাব্যতা নিয়ে সৎ মতামতসহ উত্তর দেব। প্রথম কলটি ফ্রি।",
    "Email": "ইমেইল",
    "Telegram": "টেলিগ্রাম",
    "LinkedIn": "লিংকডইন",
    "GitHub": "গিটহাব",
    "We work remotely from Dhaka, Bangladesh.": "আমরা ঢাকা, বাংলাদেশ থেকে রিমোটলি কাজ করি।",
    "Project brief": "প্রজেক্ট ব্রিফ",
    "Your name": "আপনার নাম",
    "Your business": "আপনার ব্যবসা",
    "Where would you like to start?": "কোথা থেকে শুরু করতে চান?",
    "Not sure yet": "এখনো নিশ্চিত নই",
    "Business Starter (website, contact form, basic dashboard)": "বিজনেস স্টার্টার (ওয়েবসাইট, কন্টাক্ট ফর্ম, বেসিক ড্যাশবোর্ড)",
    "Process Automation (one time-consuming task)": "প্রসেস অটোমেশন (একটি সময়খেকো কাজ)",
    "MVP Build (test an idea, build a first version)": "এমভিপি বিল্ড (আইডিয়া যাচাই, প্রথম ভার্সন তৈরি)",
    "E-commerce system": "ই-কমার্স সিস্টেম",
    "Custom software or mobile app": "কাস্টম সফটওয়্যার বা মোবাইল অ্যাপ",
    "What takes the most time, or what do you want to build?": "কোন কাজে সবচেয়ে বেশি সময় যায়, বা আপনি কী বানাতে চান?",
    "Timeline or budget, if you have one": "সময়সীমা বা বাজেট, যদি থাকে",
    "Send brief by email": "ইমেইলে ব্রিফ পাঠান",
    "Copy brief": "ব্রিফ কপি করুন",
    "This opens your email app with the brief filled in. Nothing is stored on this site.":
        "এটি ব্রিফসহ আপনার ইমেইল অ্যাপ খুলে দেবে। এই সাইটে কিছুই সংরক্ষিত হয় না।",
    "Gikpik. Built in Dhaka.": "Gikpik. ঢাকায় তৈরি।",
}

# attribute values (aria-label, placeholder, data-label)
ATTR = {
    "Gikpik, back to top": "Gikpik, শুরুতে ফিরে যান",
    "Primary": "প্রধান মেনু",
    "Gikpik in numbers": "সংখ্যায় Gikpik",
    "Services": "সেবা",
    "Solutions": "সমাধান",
    "Work": "কাজ",
    "Team": "টিম",
    "How we work": "কাজের ধরন",
    "Contact": "যোগাযোগ",
    "Business type": "ব্যবসার ধরন",
    "Filter projects": "প্রজেক্ট ফিল্টার করুন",
    "Possible feasibility verdicts": "সম্ভাব্যতা যাচাইয়ের সম্ভাব্য ফলাফল",
    "For example: diagnostic centre in Dhaka": "যেমন: ঢাকার একটি ডায়াগনস্টিক সেন্টার",
}

META = {
    "description": "Gikpik বাংলাদেশ ও দেশের বাইরের ব্যবসার জন্য ওয়েবসাইট, মোবাইল অ্যাপ আর অটোমেশন তৈরি করে, যাতে আপনার কাজের চাপ কমে। সমস্যাটা বলুন, আমরা জানাব কী করা সম্ভব।",
    "og:title": "Gikpik | আসল সমস্যা। সঠিক সমাধান।",
    "og:description": "পেশাদারদের হাতে তৈরি ওয়েবসাইট, মোবাইল অ্যাপ আর অটোমেশন, যারা ফলাফলের দায়িত্ব নেন। Geek thinking. Peak solutions.",
    "og:image:alt": "Gikpik-এর লোগো: গাঢ় নীল অরোরা পটভূমিতে ঊর্ধ্বমুখী তীরসহ সবুজ হীরা",
}

# text that stays in English on the Bangla page
KEEP = {
    "GiKPiK", ".tech", "Geek thinking. Peak solutions.", "AI", "UI", "QA", "English",
    "BuildIoT BD", "TradingSpark", "ShopTalk", "Replixon", "InstaMiner", "Tender Package Builder",
    "Smart Escape", "Mosque Admin Panel", "DIU Job Hub", "Upbit Watch", "MealNChill", "WaitWise",
    "BongoScript", "Winternet Meter", "Cheatsheet Generator", "NS Order Forward", "ClanWar Coach",
    "rakibulx33@gmail.com", "t.me/rakibulx33", "linkedin.com/in/rakibulx33", "github.com/rakibulx33",
}
# tech chips and stack lists stay as written
TECH = {
    "Laravel", "Node.js", "Next.js", "React", "Python", "FastAPI", "Kotlin", "Supabase", "PostgreSQL", "Docker",
    "Tailwind CSS", "NautilusTrader", "TypeScript", "Vite", "pdf-lib", "GitHub Actions",
    "JavaScript, SVG", "Express, PostgreSQL, Knex, EJS", "Next.js 15, TypeScript, MySQL, Groq",
    "Python, FastAPI, WebSocket, SQLite", "Next.js 15, TypeScript, MongoDB", "Java, JavaFX, MySQL",
    "Flex, Bison, C, Node.js", "C#, .NET", "React, dnd-kit, jsPDF", "Kotlin, Android", "React, Express, Recharts",
}

BN_DIGITS = str.maketrans("0123456789", "০১২৩৪৫৬৭৮৯")


def fail(msg):
    sys.exit(f"build_bn: {msg}")


def main():
    s = SRC.read_text(encoding="utf-8")

    def sub_once(pattern, repl, count_expected=1, flags=0):
        nonlocal s
        s, n = re.subn(pattern, repl, s, flags=flags)
        if n < count_expected:
            fail(f"pattern not found: {pattern[:70]}")

    # language + head
    sub_once(r'<html lang="en">', '<html lang="bn">')
    sub_once(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{SITE}bn/">')
    sub_once(r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{SITE}bn/">')
    sub_once(r'<meta property="og:locale" content="en_US">', '<meta property="og:locale" content="bn_BD">')
    sub_once(r'<meta property="og:locale:alternate" content="bn_BD">', '<meta property="og:locale:alternate" content="en_US">')
    for key, val in META.items():
        attr = "name" if key == "description" else "property"
        sub_once(rf'(<meta {attr}="{re.escape(key)}" content=")[^"]*(">)', lambda m: m.group(1) + html.escape(val, quote=True) + m.group(2))
    sub_once(r'"description":"[^"]*"', '"description":"পেশাদারদের হাতে ওয়েবসাইট, মোবাইল অ্যাপ ও বিজনেস অটোমেশন তৈরি।","inLanguage":"bn"')

    # the language switch points back to English
    sub_once(r'<a class="lang-switch" href="bn/" hreflang="bn" lang="bn">বাংলা</a>',
             '<a class="lang-switch" href="../" hreflang="en" lang="en">English</a>')

    # relative paths now live one folder deeper
    s = re.sub(r'((?:href|src)=")(?=(?:assets|css|js)/)', r'\1../', s)

    # visible text nodes
    for en, bn in TEXT.items():
        pat = r">(\s*)" + re.escape(html.escape(en, quote=False)) + r"(\s*)<"
        s, n = re.subn(pat, lambda m, bn=bn: ">" + m.group(1) + html.escape(bn, quote=False) + m.group(2) + "<", s)
        if n == 0:
            # some sentences carry an apostrophe that html.escape leaves alone; try the raw form
            pat = r">(\s*)" + re.escape(en) + r"(\s*)<"
            s, n = re.subn(pat, lambda m, bn=bn: ">" + m.group(1) + bn + m.group(2) + "<", s)
        if n == 0:
            fail(f"text not found in index.html (update TEXT): {en[:70]}")

    # attributes
    for en, bn in ATTR.items():
        pat = r'((?:aria-label|placeholder|data-label)=")' + re.escape(en) + '"'
        s, n = re.subn(pat, lambda m, bn=bn: m.group(1) + bn + '"', s)
        if n == 0:
            fail(f"attribute not found in index.html (update ATTR): {en}")

    # Bengali digits in counters and panel numbers
    s = re.sub(r'(<span data-count="\d+">)(\d+)(</span>)', lambda m: m.group(1) + m.group(2).translate(BN_DIGITS) + m.group(3), s)
    s = re.sub(r'(<span class="(?:xp-num|route-n)">)(\d+)(</span>)', lambda m: m.group(1) + m.group(2).translate(BN_DIGITS) + m.group(3), s)
    s = re.sub(r'(<p class="xp-count" aria-hidden="true">)([\d /]+)(</p>)', lambda m: m.group(1) + m.group(2).translate(BN_DIGITS) + m.group(3), s)

    OUT.parent.mkdir(exist_ok=True)
    OUT.write_text(s, encoding="utf-8")

    # report English text that is still visible
    leftovers = []
    body = s.split("<body>", 1)[1]
    body = re.sub(r"<script.*?</script>", "", body, flags=re.S)
    body = re.sub(r"<style.*?</style>", "", body, flags=re.S)
    body = re.sub(r"<svg.*?</svg>", "", body, flags=re.S)
    for t in re.findall(r">([^<>]+)<", body):
        t = html.unescape(t).strip()
        if not t or not re.search(r"[A-Za-z]", t) or t in KEEP or t in TECH:
            continue
        if re.search(r"[ঀ-৿]", t):  # mixed Bangla text with an English word inside
            continue
        leftovers.append(t)
    print(f"wrote {OUT.relative_to(ROOT)}")
    if leftovers:
        print("English text still on the Bangla page (check these):")
        for t in sorted(set(leftovers)):
            print("  -", t)


if __name__ == "__main__":
    main()
