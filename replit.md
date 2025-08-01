# Vel France - Luxury Perfume E-commerce Platform

## Overview
Vel France is a full-stack luxury perfume e-commerce platform designed to offer a sophisticated online boutique experience. It features product browsing, cart management, order processing, and administrative functionalities. The platform aims to provide a modern, advanced design aesthetic with a focus on high-quality product presentation and a seamless user experience.

## User Preferences
Preferred communication style: Simple, everyday language.
Order code format: 6-digit numbers only (no letters).
Design requirements: Very modern and advanced design aesthetic with animations.
Home page focus: Pure design focus without made-up stories, using product reels for categories like "Most Popular", "Most Sold", etc.

## System Architecture

### Frontend
- **Framework**: React 18 with TypeScript, Vite
- **Routing**: Wouter
- **State Management**: TanStack Query
- **UI/UX**: Radix UI primitives, Tailwind CSS, shadcn/ui components with custom theming
- **Animation**: Framer Motion
- **Design Elements**: Gradient backgrounds, advanced shadow effects, hover animations, rounded product cards, quick add-to-cart buttons.
- **Home Page**: Features a banner slideshow, "Most Sold" product carousel, auto-moving brand logos carousel, and "New Arrivals" carousel. Carousels utilize proper navigation, smooth motion animations, and display 4 products per slide.

### Backend
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit's OpenID Connect
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with structured error handling

### Core Features
- **Catalogue System**: Advanced filtering (price, brand, category), real-time search, sorting options, grid/list view, responsive design, active filter management.
- **Authentication System**: Replit OpenID Connect integration, PostgreSQL-backed sessions, role-based access control (admin/user), HTTP-only cookies.
- **Database Schema**: Users, Products, Cart Items, Orders, Newsletter, Contact Messages, Sessions. Includes `categories` array field for multi-category product assignment.
- **Product Management**: Gender-based categorization (women/men/unisex), luxury brand categorization, inventory tracking, decimal precision pricing, image URL storage, rich product descriptions. Supports multi-category management via admin panel.
- **Shopping Cart & Orders**: Persistent cart, complete checkout flow, order tracking, inventory validation during checkout. Includes automated order notification emails via SMTP (Gmail/Outlook) with detailed order information.
- **Admin Panel**: Comprehensive CRUD for products, order management, user management, content management (newsletter, contact messages). Features a bulk pricing management system with options for applying tiered discounts, individual price/discount editing, and real-time price calculations.
- **Currency**: All product displays use Georgian Lari (₾).
- **Product Descriptions**: Cleaned to remove all newline characters for consistent formatting.

## Recent Performance Optimizations (January 2025)

### Render-Blocking Resource Optimization
- **520ms improvement**: Eliminated render-blocking resources by implementing dynamic loading
- **BOG SDK**: Now loads asynchronously only when payment buttons are clicked, with preloading on hover
- **Google Fonts**: Optimized with preconnect, preload, and async loading with fallback
- **Replit dev banner**: Loads asynchronously to prevent blocking
- **Critical CSS**: Added inline CSS to prevent FOUC (Flash of Unstyled Content)

### Image Delivery Optimization  
- **12,858 KiB potential savings**: Implemented comprehensive responsive image system
- **ResponsiveImage component**: Created advanced lazy loading with intersection observer
- **Image formats**: All images converted to WebP format for better compression
- **Responsive sizes**: Images now served at appropriate dimensions (300px for mobile, 400px for desktop vs original 1000px)
- **Progressive loading**: Added blur placeholders and loading states
- **Performance monitoring**: Implemented image load time tracking and caching system

### Technical Implementation
- **Dynamic BOG SDK loading**: Payment system loads only when needed, eliminating 350ms render block
- **Intersection Observer**: Images load 50px before entering viewport for smooth experience
- **Image preloading**: Critical images preloaded with priority loading for above-fold content
- **Memory optimization**: Smart caching system with cleanup utilities
- **Browser support detection**: Automatic format selection (AVIF > WebP > original)

### Cumulative Layout Shift (CLS) Optimization
- **Image dimensions fixed**: All brand logos and header logo now have explicit width/height attributes
- **Font loading optimized**: Implemented font-display: swap and async font loading to prevent font-related CLS
- **Container stability**: Added CSS rules to prevent any element-induced layout shifts
- **Image aspect ratios preserved**: Critical images maintain aspect ratios while loading
- **Total CLS reduction**: Significant reduction from 0.117 baseline through systematic image and font optimization

### Forced Reflow Prevention (January 2025)
- **matchMedia optimization**: Replaced window.innerWidth queries with matchMedia API to prevent geometric property access
- **requestAnimationFrame batching**: Wrapped DOM updates in requestAnimationFrame for smoother transitions
- **GPU acceleration**: Added will-change properties and translate3d transforms for hardware acceleration
- **Intersection Observer optimization**: Added threshold and performance optimizations to lazy loading
- **Animation performance**: Optimized marquee and carousel animations with GPU-accelerated transforms

### LCP (Largest Contentful Paint) Optimization
- **Hero image prioritization**: First hero banner image loads with fetchpriority="high" and loading="eager"
- **HTML preload links**: Critical LCP images preloaded in HTML head with responsive media queries
- **Immediate discovery**: Hero images now discoverable from initial HTML document for faster LCP
- **Lazy loading optimization**: Non-critical slides use loading="lazy" for better resource management

## External Dependencies

### Core
- `@neondatabase/serverless`: PostgreSQL driver
- `drizzle-orm`: ORM
- `@tanstack/react-query`: Server state management
- `@radix-ui/*`: UI primitives
- `framer-motion`: Animation library
- `tailwindcss`: CSS framework

### Authentication & Security
- `openid-client`: OpenID Connect
- `passport`: Authentication middleware
- `express-session`: Session management
- `connect-pg-simple`: PostgreSQL session store