# Vel France - Luxury Perfume E-commerce Platform

## Overview

This is a full-stack luxury perfume e-commerce platform built with React/TypeScript frontend and Express.js backend. The application features a sophisticated French perfume boutique theme with product browsing, cart management, order processing, and admin functionality. The system integrates Replit's authentication system and uses PostgreSQL with Drizzle ORM for data persistence.

## User Preferences

Preferred communication style: Simple, everyday language.
Order code format: 6-digit numbers only (no letters).
Design requirements: Very modern and advanced design aesthetic with animations.
Home page focus: Pure design focus without made-up stories, using product reels for categories like "Most Popular", "Most Sold", etc.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: Radix UI primitives with Tailwind CSS for styling
- **Component Library**: shadcn/ui components with custom theming
- **Animation**: Framer Motion for sophisticated animations

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Replit's OpenID Connect authentication system
- **Session Management**: Express sessions with PostgreSQL store
- **API Design**: RESTful API with structured error handling

### Key Components

#### Catalogue System
- **Advanced Filtering**: Price range slider, brand selection, category filters
- **Search Functionality**: Real-time product search across names, brands, and descriptions
- **Sorting Options**: Multiple sort criteria (name, price, brand)
- **View Modes**: Grid and list view options for products
- **Responsive Design**: Mobile-friendly filters with side drawer on small screens
- **Filter Management**: Active filter display with individual removal options

#### Authentication System
- **Provider**: Replit OpenID Connect integration
- **Session Storage**: PostgreSQL-backed sessions with connect-pg-simple
- **Authorization**: Role-based access control (admin/user roles)
- **Security**: HTTP-only cookies with secure flags

#### Database Schema
- **Users**: Profile information with admin flags
- **Products**: Luxury perfume catalog with categories (women/men/unisex) and brand information
- **Cart Items**: User shopping cart persistence
- **Orders**: Complete order history with line items
- **Newsletter**: Email subscription management
- **Contact Messages**: Customer inquiry system
- **Sessions**: Authentication session storage

#### Product Management
- **Categories**: Gender-based product categorization (women/men/unisex)
- **Brands**: Luxury brand categorization and filtering
- **Inventory**: Stock tracking and availability
- **Pricing**: Decimal precision for accurate pricing
- **Media**: Image URL storage for product photos
- **Descriptions**: Rich product information including fragrance notes

#### Shopping Cart & Orders
- **Persistent Cart**: User cart items stored in database
- **Order Processing**: Complete checkout flow with address collection
- **Order Tracking**: Status management and history
- **Inventory Integration**: Stock validation during checkout

#### Admin Panel
- **Product CRUD**: Full product management capabilities
- **Order Management**: View and update order statuses
- **User Management**: Access to user information
- **Content Management**: Newsletter and contact message handling

## Data Flow

### User Authentication Flow
1. User clicks login → Redirects to Replit OAuth
2. Replit validates credentials → Returns user profile
3. System creates/updates user record → Establishes session
4. Frontend receives user data → Updates UI state

### Shopping Flow
1. Browse products → Fetch from database via API
2. Add to cart → Store in user's cart table
3. Checkout process → Collect shipping/billing info
4. Place order → Create order and order items records
5. Clear cart → Remove items from cart table

### Admin Management Flow
1. Admin authentication → Verify admin role
2. CRUD operations → Direct database manipulation
3. Real-time updates → Query invalidation and refetch
4. Status changes → Update order/product status

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Type-safe database ORM
- **@tanstack/react-query**: Server state management
- **@radix-ui/***: Accessible UI primitives
- **framer-motion**: Animation library
- **tailwindcss**: Utility-first CSS framework

### Authentication & Security
- **openid-client**: OpenID Connect authentication
- **passport**: Authentication middleware
- **express-session**: Session management
- **connect-pg-simple**: PostgreSQL session store

### Development Tools
- **vite**: Frontend build tool with HMR
- **tsx**: TypeScript execution for development
- **esbuild**: Production backend bundling
- **drizzle-kit**: Database migration tool

## Deployment Strategy

### Development Environment
- **Frontend**: Vite dev server with HMR and error overlay
- **Backend**: tsx for TypeScript execution with file watching
- **Database**: PostgreSQL with Drizzle migrations
- **Environment**: Replit-specific plugins for cartographer and error handling

### Production Build Process
1. **Frontend Build**: Vite builds optimized React bundle to `dist/public`
2. **Backend Build**: esbuild bundles server code to `dist/index.js`
3. **Database Setup**: Drizzle migrations ensure schema consistency
4. **Asset Serving**: Express serves static files from build directory

### Environment Configuration
- **DATABASE_URL**: PostgreSQL connection string
- **SESSION_SECRET**: Session encryption key
- **REPL_ID**: Replit environment identifier
- **ISSUER_URL**: OpenID Connect provider URL
- **NODE_ENV**: Environment flag for development/production

### Scaling Considerations
- **Database**: Uses connection pooling with @neondatabase/serverless
- **Sessions**: PostgreSQL-backed for horizontal scaling
- **Static Assets**: Served through Express with proper caching headers
- **API Rate Limiting**: Ready for implementation with Express middleware

The application follows a monorepo structure with shared types and schemas, enabling type safety across the full stack while maintaining clear separation between frontend, backend, and shared concerns.

## Recent Changes

### Multi-Category System Implementation (January 29, 2025)
- **Database Schema Enhancement**: Added `categories` array field to support products appearing in multiple categories
  - Maintained backward compatibility with existing `category` field for primary category designation
  - 91 out of 219 products now have multi-category support for enhanced discoverability
- **Frontend Category Filtering**: Updated catalogue page to support multi-category filtering
  - Products can now appear in multiple filter results based on their categories array
  - Category filter displays all unique categories from both primary and categories array fields
  - Examples: Ganymede appears in Men's, Niche, Unisex, and Women's filters
- **Admin Panel Multi-Category Management**: Enhanced admin interface for category management
  - Checkbox-based category selection allowing multiple categories per product
  - Visual indication of primary category and additional category count
  - Form submission includes categories array for complete category management
- **Comprehensive Category Updates**: Successfully categorized products based on fragrance characteristics
  - Unisex luxury fragrances: Sauvage, Phantom, Bleu de Chanel, Allure Homme Sport
  - Multi-gender Tom Ford collection: Lost Cherry, Bitter Peach, Vanilla Sex, Rose Prick  
  - Niche unisex fragrances: Beach Walk, When the Rain Stops, Under The Lemon Trees
  - Women's fragrances: Good Girl, Si collection, Miss Dior, J'adore
- **Technical Implementation**: Direct SQL approach for reliable category updates
  - Pattern-based matching for product identification using ILIKE queries
  - Batch updates for efficiency while maintaining data integrity
  - Category arrays properly formatted for PostgreSQL array type compatibility

### Currency & Content Cleanup (January 29, 2025)
- **Complete Currency Conversion**: All 219 products now display Georgian Lari (₾) instead of dollar signs ($)
  - Fixed CarouselProductCard components on home page
  - Fixed LuxuryProductCard components on catalogue page
  - Updated all price displays across shopping cart, checkout, orders, and profile pages
- **Product Description Cleanup**: Comprehensive removal of all newline characters from product descriptions
  - Eliminated 211 products with "\n" characters using PostgreSQL REPLACE operations
  - Removed CHR(10), CHR(13), and Unicode line separators from all 219 products
  - Applied regex cleaning to handle various types of line breaks and whitespace
  - Cleaned up multiple spaces and trimmed descriptions for consistent formatting
- **Admin Panel Category Updates**: Synchronized admin panel categories with database and catalogue
  - Database stores Georgian categories: კაცის (Men's), ქალის (Women's), უნისექსი (Unisex), ნიშური (Niche)
  - Admin interface uses English labels: Men's, Women's, Unisex, Niche for user-friendly management
  - Added bilingual category badge color function to handle both Georgian and English category names
  - Color coding: Women's (pink), Men's (blue), Unisex (purple), Niche (green)
  - Changed grid layout to accommodate 4 categories instead of 3
- **Price Update Results**: Successfully updated 214 out of 219 products with new pricing from Excel file
  - Only 5 products remain with original prices (no matching entries found in price list)
  - All updated products now display accurate Georgian Lari pricing

### Home Page Redesign (January 28, 2025)
- **Banner Slideshow Updated**: Replaced with 6 new luxury perfume campaign images in user-specified order
- **Content Architecture**: Streamlined to exactly 3 sections as requested by user:
  1. Most Sold carousel with arrow navigation
  2. Auto-moving brand logos carousel 
  3. New Arrivals carousel with arrow navigation
- **Carousel Implementation**: 
  - Proper carousel navigation with left/right arrow controls
  - Smooth motion animations using Framer Motion
  - 4 products displayed per slide with navigation between pages
  - Products sized at 320px width with 80px height for images matching catalogue specifications
- **Brand Showcase**: 
  - Continuously moving brand logos (CHANEL, DIOR, ARMANI, CREED, GUCCI, VERSACE, YSL, PRADA)
  - 25-second infinite scroll animation with seamless loop
  - Navy background with white brand cards for luxury aesthetic
- **Modern Design Elements**: 
  - Gradient backgrounds and advanced shadow effects
  - Hover animations with image scaling and card lifting effects
  - Advanced transition animations with staggered delays
  - Rounded product cards with sophisticated styling
  - Quick add-to-cart buttons on product images
- **User Experience**: Clean, focused design without scroll effects, using proper carousel controls
- **Performance Optimized**: Uses product slices to display different ranges of products per section