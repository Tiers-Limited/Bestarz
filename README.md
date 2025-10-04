# Best★rz Frontend

A modern, responsive React application for the Best★rz event booking platform, built with Vite, Tailwind CSS, and Ant Design.

## 🎨 Features

- **Modern UI**: Dark theme with glassmorphism effects
- **Responsive Design**: Mobile-first approach with adaptive layouts
- **Real-time Calendar**: Provider booking management with conflict prevention
- **Payment Integration**: Secure Stripe checkout process
- **Live Chat**: Real-time messaging between providers and clients
- **Admin Dashboard**: Comprehensive platform management
- **Subscription Management**: Flexible pricing plans

## 🛠️ Tech Stack

- **Framework**: React 18 with Vite
- **Styling**: Tailwind CSS with custom components
- **UI Library**: Ant Design components
- **Icons**: Lucide React
- **State Management**: React Context API
- **Routing**: React Router
- **HTTP Client**: Axios
- **Date Handling**: Day.js
- **Build Tool**: Vite

## 📦 Installation

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
   ```

## 🚀 Running the Application

### Development Mode
```bash
npm run dev
```

### Production Build
```bash
npm run build
```

### Preview Production Build
```bash
npm run preview
```

## 📁 Project Structure

```
src/
├── components/      # Reusable UI components
├── pages/          # Page components (auth, dashboard, etc.)
├── context/        # React context providers
├── hooks/          # Custom React hooks
├── services/       # API service functions
├── utils/          # Utility functions
├── assets/         # Static assets (images, icons)
└── main.jsx        # Application entry point
```

## 🎯 Key Components

### Core Components
- **ProviderLayout**: Main layout for service providers
- **ClientLayout**: Main layout for clients
- **AdminLayout**: Administrative dashboard layout
- **BookingDetailsModal**: Event booking information display
- **ChatWindow**: Real-time messaging interface

### Pages
- **LandingPage**: Marketing homepage
- **Provider Dashboard**: Booking management and analytics
- **Client Dashboard**: Booking history and payments
- **Admin Dashboard**: Platform oversight and user management

## 🔐 Authentication Flow

1. **Registration/Login** → JWT token stored in localStorage
2. **Role-based Access** → Provider, Client, or Admin routes
3. **Protected Routes** → Automatic redirects for unauthorized access
4. **Token Refresh** → Automatic token renewal

## 📅 Booking System

### Provider View
- **Calendar Interface**: Visual booking management
- **Conflict Prevention**: Automatic double-booking detection
- **Status Management**: Confirm, cancel, or complete bookings
- **Real-time Updates**: Live booking status changes

### Client View
- **Service Discovery**: Browse available providers
- **Booking Creation**: Step-by-step booking process
- **Payment Processing**: Secure Stripe integration
- **Status Tracking**: Real-time booking updates

## 💳 Payment Integration

- **Stripe Checkout**: Secure payment processing
- **80/20 Split**: Automatic revenue distribution
- **Webhook Handling**: Real-time payment status updates
- **Receipt Generation**: Automated payment confirmations

## � Real-time Features

- **Live Chat**: WebSocket-based messaging
- **Booking Notifications**: Instant status updates
- **Email Integration**: Automated notifications
- **Push Notifications**: Browser-based alerts

## 🎨 Design System

### Color Palette
- **Primary**: Dark backgrounds with neon accents
- **Secondary**: Glassmorphism effects
- **Accent**: Blue (#3B82F6) and green (#10B981) highlights

### Typography
- **Primary Font**: System fonts with fallbacks
- **Headings**: Bold, white text on dark backgrounds
- **Body**: Gray text for optimal readability

### Components
- **Cards**: Glassmorphism with subtle borders
- **Buttons**: Gradient backgrounds with hover effects
- **Modals**: Dark overlays with centered content
- **Forms**: Clean inputs with validation feedback

## 📱 Responsive Design

- **Mobile First**: Optimized for mobile devices
- **Tablet Support**: Adaptive layouts for tablets
- **Desktop Enhancement**: Full feature utilization on larger screens
- **Touch Friendly**: Appropriate touch targets and gestures

## 🔧 Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint for code quality

## 🌐 Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 📊 Performance

- **Vite Build**: Fast development and optimized production builds
- **Code Splitting**: Automatic route-based code splitting
- **Lazy Loading**: Component lazy loading for better performance
- **Image Optimization**: Automatic image compression and WebP support

## � Security

- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Token-based request validation
- **Secure Headers**: Appropriate security headers
- **Environment Variables**: Sensitive data protection

## 🤝 Contributing

1. Follow the existing code style
2. Use meaningful commit messages
3. Test your changes thoroughly
4. Update documentation as needed
5. Create pull requests for review

## 📄 License

This project is proprietary software for Best★rz platform.</content>
<parameter name="filePath">c:\Users\rajpu\OneDrive\Desktop\Tiers Limited\Backend\Bestarz\README.md