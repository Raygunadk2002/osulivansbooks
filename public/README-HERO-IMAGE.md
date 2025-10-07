# Hero Image Setup Instructions

## To add your actual coastal house image:

1. **Save your house image** as `hero-house.jpg` in the `public/` folder
2. **Recommended image specs:**
   - Resolution: 1920x1080 or higher
   - Format: JPG or PNG
   - File size: Under 2MB for fast loading
   - Content: Your coastal house with water, hillside, and coastal setting

3. **Update the landing page** to use the image:
   - Open `src/components/auth/landing-page.tsx`
   - Find the hero background section (around line 60)
   - Replace the CSS gradient background with:
   ```jsx
   <div 
     className="w-full h-full bg-cover bg-center bg-no-repeat"
     style={{
       backgroundImage: `url('/hero-house.jpg')`
     }}
   />
   ```

## Current Status:
- The page now uses a beautiful CSS gradient that represents the coastal house scene
- All text and styling is optimized for the hero background
- The design will automatically work with your actual house image

## Features:
- ✅ Full-screen hero background
- ✅ Glassmorphism effects
- ✅ White text with proper contrast
- ✅ Backdrop blur effects
- ✅ Responsive design
- ✅ Modern coastal aesthetic
