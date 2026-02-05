# Event Check-In Pro - Frontend

Modern, beautiful event management and check-in system built with React.

## 🚀 Features

✅ User Authentication (Login/Signup)
✅ Event Creation & Management
✅ Guest List Management
✅ QR Code Generation for Each Guest
✅ Real-time Check-In Interface
✅ Send Invitations (Email/SMS/WhatsApp)
✅ Beautiful, Responsive UI
✅ Real-time Statistics Dashboard

## 🛠️ Tech Stack

- **React 18** - Modern UI framework
- **React Router** - Navigation
- **Axios** - API calls
- **QRCode.react** - QR code generation
- **CSS3** - Custom styling with gradients

## 📦 Installation

1. Install dependencies:
```bash
npm install
```

2. Configure environment variables:
```bash
# Create .env file
REACT_APP_API_URL=https://eventcheckin-backend-production.up.railway.app
```

3. Run locally:
```bash
npm start
```

The app will open at `http://localhost:3000`

## 🚀 Deploy to Vercel (Recommended)

### Method 1: Using Vercel Dashboard (Easiest)

1. **Push code to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/eventcheckin-frontend.git
   git push -u origin main
   ```

2. **Deploy on Vercel:**
   - Go to [https://vercel.com](https://vercel.com)
   - Click "Add New Project"
   - Import your GitHub repository
   - Vercel will auto-detect it's a React app
   - Add environment variable:
     - Key: `REACT_APP_API_URL`
     - Value: `https://eventcheckin-backend-production.up.railway.app`
   - Click "Deploy"

3. **Your app is live!** 🎉
   - Vercel will give you a URL like `https://eventcheckin-frontend.vercel.app`

### Method 2: Using Vercel CLI

1. **Install Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel:**
   ```bash
   vercel login
   ```

3. **Deploy:**
   ```bash
   vercel
   ```

4. **Add environment variable:**
   ```bash
   vercel env add REACT_APP_API_URL
   # Enter: https://eventcheckin-backend-production.up.railway.app
   ```

5. **Deploy to production:**
   ```bash
   vercel --prod
   ```

## 🎨 Features Overview

### 1. Authentication
- Secure login/signup system
- Role-based access (Event Host / Venue Owner)
- Session management

### 2. Dashboard
- View all your events
- Quick stats (Expected guests, Checked in)
- Create new events with one click

### 3. Event Management
- Add guests manually
- Import guest lists
- Assign categories (General, VIP, Press, Staff)
- Plus ones support

### 4. Invitations
- Send bulk invitations via:
  - Email (with QR code)
  - SMS
  - WhatsApp
- Beautiful email templates
- Resend to individual guests

### 5. Check-In Mode
- Real-time search
- Quick check-in with one click
- Visual confirmation
- Progress tracking
- Works offline (cached guest list)

### 6. QR Codes
- Unique QR code for each guest
- Embedded in email invitations
- Can be scanned for instant check-in

## 📱 Screenshots

### Dashboard
![Dashboard](https://via.placeholder.com/800x400/667eea/ffffff?text=Dashboard)

### Guest List
![Guest List](https://via.placeholder.com/800x400/764ba2/ffffff?text=Guest+List)

### Check-In Mode
![Check-In](https://via.placeholder.com/800x400/667eea/ffffff?text=Check-In+Mode)

## 🔐 API Integration

The frontend connects to your backend API at:
```
https://eventcheckin-backend-production.up.railway.app
```

### API Endpoints Used:
- `POST /api/auth/login` - User login
- `POST /api/auth/signup` - User registration
- `POST /api/events` - Create event
- `GET /api/events/host/:hostId` - Get events by host
- `POST /api/guests` - Add guest
- `GET /api/guests/event/:eventId` - Get event guests
- `POST /api/guests/:guestId/checkin` - Check in guest
- `POST /api/invitations/send` - Send bulk invitations

## 🎯 Usage

### For Event Hosts:
1. Sign up as "Event Host"
2. Create an event
3. Add guests
4. Send invitations
5. Use check-in mode during event

### For Venue Owners:
1. Sign up as "Venue Owner"
2. View events at your venue
3. Manage check-ins
4. Track attendance

## 🐛 Troubleshooting

**Issue: Can't connect to backend**
- Check if backend URL in `.env` is correct
- Verify backend is running at Railway

**Issue: Invitations not sending**
- Backend needs valid API keys for SendGrid/MSG91/Interakt
- Check backend logs

**Issue: QR codes not generating**
- Make sure `qrcode.react` is installed
- Check browser console for errors

## 📄 License

MIT License - feel free to use for your projects!

## 🤝 Support

For issues or questions:
- Check the backend logs on Railway
- Review API responses in browser console
- Verify environment variables

## 🎉 Enjoy!

Your Event Check-In Pro frontend is ready to use!
