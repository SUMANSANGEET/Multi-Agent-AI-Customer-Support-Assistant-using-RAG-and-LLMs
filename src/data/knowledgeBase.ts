import { KBDocument } from '../types';

export const INITIAL_KB_DOCUMENTS: KBDocument[] = [
  {
    id: 'kb-faq',
    title: 'FAQ & General Company Information',
    category: 'FAQ',
    filename: 'FAQ.pdf',
    lastUpdated: '2026-07-15',
    chunkCount: 5,
    content: `
# TechMart Electronics & Solutions - Frequently Asked Questions (FAQ)

## 1. About TechMart
TechMart is a global provider of premium electronics, smart wearables, audio hardware, and software subscriptions (TechMart Cloud & Premium AI Assistant). Our headquarters are located at 100 Innovation Way, Silicon Valley, CA, and our global support team operates 24/7/365.

## 2. Customer Support Operating Hours & Contact Info
- Live Web AI Chat Assistant: Available 24/7/365.
- Toll-Free Phone Support: +1 (800) 555-TECH (Monday - Friday, 6:00 AM - 9:00 PM EST).
- Email Support: support@techmartelectronics.com (24-hour SLA response time).
- Supervisor Escalations: escalations@techmartelectronics.com.

## 3. Account Management & Subscriptions
- TechMart offers two account tiers: Standard (Free) and Premium ($14.99/month).
- Premium Membership unlocks 4K streaming sync, unlimited cloud backup, priority hardware repair, and instant AI resolution.
- Account credentials can be managed under User Settings -> Security & Profile.
- Passwords must be at least 8 characters with a number and special symbol. If locked out, click "Forgot Password" on the login portal to receive a 6-digit verification pin via SMS or registered email.
`
  },
  {
    id: 'kb-refund',
    title: 'Refund & Return Policy',
    category: 'Billing',
    filename: 'RefundPolicy.pdf',
    lastUpdated: '2026-06-20',
    chunkCount: 4,
    content: `
# TechMart Official Refund & Return Policy

## 1. 30-Day Money-Back Guarantee
All hardware purchases made directly through TechMart.com or authorized flagship retail stores qualify for a full 30-day money-back guarantee from the date of physical delivery.

## 2. Conditions for Hardware Returns
- Items must be returned in their original packaging with all original accessories, cables, manuals, and proof of purchase (Order Invoice ID).
- Returns with missing accessories or physical cosmetic damage caused by user neglect are subject to a 15% restocking fee.
- Prepaid shipping labels are provided free for defective products or incorrect order fulfillments. Customer-initiated buyer-remorse returns incur a $5.99 return shipping deduction.

## 3. Subscription & Digital Software Refunds
- Monthly Premium Subscriptions ($14.99/mo) can be canceled at any time in the billing tab.
- Unused subscription days qualify for a pro-rated refund if requested within 7 days of the automated billing charge.
- Software license keys or downloadable media bundles are non-refundable once activated.

## 4. Refund Processing SLA
Once returned items arrive at our central warehouse, inspect & refund processing takes 2 to 3 business days. Original payment methods (Credit Card, PayPal, Apple Pay) will reflect credits within 3 to 5 banking days depending on the card issuer.
`
  },
  {
    id: 'kb-shipping',
    title: 'Shipping & Delivery Policy',
    category: 'Policy',
    filename: 'ShippingPolicy.pdf',
    lastUpdated: '2026-05-10',
    chunkCount: 4,
    content: `
# TechMart Shipping & Delivery Policy

## 1. Domestic Delivery Options (US & Canada)
- Standard Shipping (3-5 business days): FREE on orders over $49.00 ($4.99 flat rate otherwise).
- Express Priority Shipping (1-2 business days): $12.99. Order before 2:00 PM EST for same-day dispatch.
- Overnight Delivery: $24.99. Guaranteed delivery by 10:30 AM next business day.

## 2. Order Tracking & Carriers
All shipments are fulfilled via FedEx, UPS, or USPS Priority Mail. Order tracking numbers are emailed within 2 hours of warehouse dispatch and can be tracked under "My Orders" in the TechMart App.

## 3. Missing, Stolen, or Damaged Packages
If a tracking status indicates "Delivered" but the parcel is missing, customers must report within 72 hours. TechMart ships via Insured Parcel Protection; missing packages are re-shipped at zero cost or fully refunded after carrier trace verification (1-2 business days).
`
  },
  {
    id: 'kb-warranty',
    title: 'Hardware Limited Warranty Policy',
    category: 'Technical',
    filename: 'Warranty.pdf',
    lastUpdated: '2026-08-01',
    chunkCount: 4,
    content: `
# TechMart Hardware Warranty Terms

## 1. Standard 1-Year Limited Warranty
Every new TechMart hardware device (ApexBook Laptops, SoundBuds Ultra Headphones, SmartWatch Elite, SmartHub Max) carries a complimentary 1-Year Limited Manufacturer Warranty covering defects in materials and factory workmanship.

## 2. Extended TechCare+ Coverage
Customers can add TechCare+ Protection within 30 days of hardware purchase:
- TechCare+ 2-Year ($49.00) or 3-Year ($89.00).
- Covers accidental liquid spills, drops, screen cracks, battery degradation below 80% capacity, and power surge failures with $0 deductible.

## 3. Warranty Claim Steps
1. Perform remote hardware diagnostics with our Technical Support Agent or app diagnostic tool.
2. If hardware failure is confirmed, a Prepaid RMA Return Label is issued.
3. Advance Replacement Option: Premium and TechCare+ members can opt for instant advance shipment of a replacement device prior to returning the defective unit.
`
  },
  {
    id: 'kb-products',
    title: 'Product Catalog & Subscription Tier Pricing',
    category: 'Product',
    filename: 'Pricing.pdf',
    lastUpdated: '2026-08-05',
    chunkCount: 5,
    content: `
# TechMart Official Product Line & Subscription Pricing

## 1. Flagship Hardware Lineup
- **ApexBook Pro 15 Laptop**: $1,299.00. Intel Core i9 / 32GB RAM / 1TB NVMe SSD. Ultra-slim aluminum chassis, 120Hz OLED display.
- **SoundBuds Ultra ANC Wireless Earbuds**: $179.00. Active Noise Cancellation 45dB, 36-hour total battery life with wireless charging case, IPX7 waterproof.
- **SmartWatch Elite Gen 5**: $249.00. ECG heart monitor, built-in GPS, cellular LTE option, sapphire crystal glass, 5-day battery life.
- **TechMart SmartHub Max Display**: $199.00. 10.1-inch smart home dashboard with built-in Matter/Zigbee hub and voice assistant.

## 2. Software & Cloud Subscriptions
- **TechMart Standard (Free)**: Basic app control, single-device sync, standard customer support.
- **TechMart Premium ($14.99/month or $149.00/year)**: Priority 24/7 live support, 1TB Cloud Backup, 4K multi-screen sync, AI Assistant features unlocked, and free shipping on all store purchases.
- **TechCare+ Care Plan**: $49.00 (2 Years) or $89.00 (3 Years) full accidental damage insurance.
`
  },
  {
    id: 'kb-usermanual',
    title: 'Device Troubleshooting & User Manual',
    category: 'Technical',
    filename: 'UserManual.pdf',
    lastUpdated: '2026-07-28',
    chunkCount: 6,
    content: `
# TechMart Hardware User Manual & Diagnostic Guide

## 1. SoundBuds Ultra ANC Bluetooth Pairing & Reset
- **Pairing Issue**: Turn Bluetooth off and on. Open the case lid with earbuds inside, press and hold the rear pairing button for 5 seconds until the LED flashes pulsing white.
- **Factory Hard Reset (Error Code E-102)**: If one earbud has no audio or drops connection, place both earbuds in the charging case. Hold the rear button for 15 seconds until the LED flashes Red three times. Unpair "SoundBuds Ultra" from your phone and re-connect.

## 2. ApexBook Pro 15 - Power & Thermal Troubleshooting
- **Laptop Won't Turn On (Error Code E-401)**: Perform a hard power reset by disconnecting the USB-C power adapter and holding the Power Button for 20 seconds. Reconnect power and press Power once.
- **Overheating / Fan Noise**: Ensure air vents are unobstructed. Open TechMart Control Center -> Power Mode -> Select "Balanced" or "Silent". Download BIOS update v2.4 from support portal.

## 3. TechMart App Account Lockout & Sync Errors (Error Code E-305)
- If the TechMart app displays "Subscription Locked" or "Sync Failed (Code E-305)" after renewing Premium:
  1. Go to TechMart App -> Profile -> Tap "Sync License".
  2. If problem persists, log out of the TechMart mobile app and sign back in to refresh JWT auth token.
`
  },
  {
    id: 'kb-installation',
    title: 'Installation & Driver Setup Guide',
    category: 'Technical',
    filename: 'InstallationGuide.pdf',
    lastUpdated: '2026-06-12',
    chunkCount: 4,
    content: `
# TechMart Installation & Setup Manual

## 1. ApexBook Pro Driver Package Setup
- Windows 11 / macOS drivers can be downloaded from https://support.techmart.com/drivers.
- Run TechMartInstaller.exe as Administrator. Reboot system after installation to finalize GPU and Wi-Fi 6E driver bindings.

## 2. SmartHub Max Smart Home Hub Setup
- Connect SmartHub Max to power. Download the TechMart Smart Home App on iOS or Android.
- Tap "+ Add Device" -> Select "SmartHub Max". Scan the QR code printed on the rear panel. Ensure your phone is connected to a 2.4GHz Wi-Fi network during initial setup.
`
  },
  {
    id: 'kb-complaint',
    title: 'Complaint Escalation & Customer Service SLA',
    category: 'Complaint',
    filename: 'ComplaintsAndEscalation.pdf',
    lastUpdated: '2026-08-02',
    chunkCount: 4,
    content: `
# TechMart Customer Service Escalation & Resolution Guarantee

## 1. Commitment to Customer Satisfaction
TechMart values every customer relationship. If an issue is not resolved to your complete satisfaction by our automated agents, our Tier-2 Senior Resolution Specialists and Supervisor Desk will step in immediately.

## 2. Complaint Classification & Response SLA
- **High Frustration / Repeated Failure (Priority 1)**: Immediate escalation ticket generated. Senior Supervisor callback within 2 business hours.
- **Unresolved Billing Dispute (Priority 2)**: Refund freeze hold applied and referred to Billing Lead within 4 business hours.
- **Product Defect Complaint (Priority 3)**: Instant RMA replacement label sent with optional $20 TechMart Store Credit gesture of goodwill.

## 3. CFPB & Consumer Protection Policy
We strictly abide by consumer protection guidelines. All customer complaints are logged with timestamped interaction histories to ensure transparency, fairness, and strict SLA compliance.
`
  }
];
