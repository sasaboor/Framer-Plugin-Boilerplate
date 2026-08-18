# Theme Quick Start - Change Your Plugin's Colors in 30 Seconds!

## 🎨 The Magic File

**Location:** `src/config/theme.ts`

This ONE file controls ALL colors in your entire plugin!

## ⚡ Quick Change Guide

### Change Your Brand Color (Most Important!)

Open `src/config/theme.ts` and find this section:

```typescript
colors: {
  primary: {
    DEFAULT: '#0099FF',      // ← CHANGE THIS!
    hover: '#0088EE',         // ← And this (slightly darker)
    light: 'rgba(0, 153, 255, 0.1)',
    lighter: 'rgba(0, 153, 255, 0.05)',
  },
  // ...
}
```

### Popular Color Examples

Just copy and paste one of these presets:

#### 🔵 Blue (Default)
```typescript
primary: {
  DEFAULT: '#0099FF',
  hover: '#0088EE',
  light: 'rgba(0, 153, 255, 0.1)',
  lighter: 'rgba(0, 153, 255, 0.05)',
}
```

#### 🟣 Purple
```typescript
primary: {
  DEFAULT: '#8B5CF6',
  hover: '#7C3AED',
  light: 'rgba(139, 92, 246, 0.1)',
  lighter: 'rgba(139, 92, 246, 0.05)',
}
```

#### 🟢 Green
```typescript
primary: {
  DEFAULT: '#10B981',
  hover: '#059669',
  light: 'rgba(16, 185, 129, 0.1)',
  lighter: 'rgba(16, 185, 129, 0.05)',
}
```

#### 🔴 Red
```typescript
primary: {
  DEFAULT: '#EF4444',
  hover: '#DC2626',
  light: 'rgba(239, 68, 68, 0.1)',
  lighter: 'rgba(239, 68, 68, 0.05)',
}
```

#### 🟠 Orange
```typescript
primary: {
  DEFAULT: '#F97316',
  hover: '#EA580C',
  light: 'rgba(249, 115, 22, 0.1)',
  lighter: 'rgba(249, 115, 22, 0.05)',
}
```

#### 🟡 Yellow/Gold
```typescript
primary: {
  DEFAULT: '#F59E0B',
  hover: '#D97706',
  light: 'rgba(245, 158, 11, 0.1)',
  lighter: 'rgba(245, 158, 11, 0.05)',
}
```

#### 🩷 Pink
```typescript
primary: {
  DEFAULT: '#EC4899',
  hover: '#DB2777',
  light: 'rgba(236, 72, 153, 0.1)',
  lighter: 'rgba(236, 72, 153, 0.05)',
}
```

#### ⚫ Dark/Charcoal
```typescript
primary: {
  DEFAULT: '#1F2937',
  hover: '#111827',
  light: 'rgba(31, 41, 55, 0.1)',
  lighter: 'rgba(31, 41, 55, 0.05)',
}
```

## 🔧 How to Use Custom Colors

### Option 1: Use a Color Picker
1. Use any online color picker (like https://htmlcolorcodes.com/)
2. Pick your brand color
3. Get the HEX code (e.g., `#AB12CD`)
4. Paste it in `DEFAULT`
5. Make `hover` slightly darker (reduce the numbers by 10-20)

### Option 2: Use Your Brand Colors
If you already have brand colors:
```typescript
primary: {
  DEFAULT: '#YOUR_BRAND_COLOR',     // Your main brand color
  hover: '#SLIGHTLY_DARKER',         // ~10-15% darker
  light: 'rgba(R, G, B, 0.1)',      // Same color at 10% opacity
  lighter: 'rgba(R, G, B, 0.05)',   // Same color at 5% opacity
}
```

**Tip:** To convert HEX to RGBA:
- `#0099FF` → `rgba(0, 153, 255, 0.1)`
- Use https://rgbacolorpicker.com/hex-to-rgba

## 📍 Where This Color Appears

After changing `primary.DEFAULT`, you'll see it in:
- ✅ ALL primary buttons ("Buy Pro", "Validate License", etc.)
- ✅ Links and clickable text
- ✅ Active/selected states
- ✅ Progress indicators
- ✅ Badges and highlights
- ✅ Focus rings
- ✅ Loading spinners

**IT'S LITERALLY EVERYWHERE!** 🎉

## 🎯 Advanced: Other Colors

### Success, Warning, Error
You can also customize these (but usually you don't need to):

```typescript
// Green for success messages
success: {
  DEFAULT: '#10B981',
  dark: '#059669',
  light: 'rgba(16, 185, 129, 0.1)',
},

// Amber for warnings
warning: {
  DEFAULT: '#F59E0B',
  dark: '#D97706',
  light: 'rgba(245, 158, 11, 0.1)',
},

// Red for errors
error: {
  DEFAULT: '#EF4444',
  dark: '#DC2626',
  light: 'rgba(239, 68, 68, 0.1)',
},
```

## 🧪 Testing Your Changes

1. Save `src/config/theme.ts`
2. Run `npm run dev`
3. Look at any button in the plugin
4. It should be your new color!

### Quick Test Checklist
- [ ] Open LoginScreen - check "Get Pro" button
- [ ] Open PaywallModal - check "Buy Pro" button
- [ ] Open AccountScreen - check primary buttons
- [ ] Hover over buttons - check hover color works
- [ ] Click a link - check link color

## 💡 Pro Tips

### Tip 1: Match Your Website
Use the same brand color as your website for consistency!

### Tip 2: Check Contrast
Make sure your color has good contrast with white text.
- ✅ Good: `#0099FF` on white text (readable)
- ❌ Bad: `#FFFF00` on white text (unreadable)

Test at: https://webaim.org/resources/contrastchecker/

### Tip 3: Don't Go Too Light
If your brand color is very light (like pastel yellow), buttons won't stand out.
Consider using a darker shade for `DEFAULT`.

### Tip 4: Hover Should Be Darker
The `hover` color should be 10-20% darker than `DEFAULT` so users can see the hover effect.

## 📱 Other Theme Customizations

### Border Radius (Rounded Corners)
```typescript
borderRadius: {
  DEFAULT: '0.5rem',  // ← Change to 0.25rem (less round) or 1rem (more round)
}
```

### Spacing
```typescript
spacing: {
  md: '1rem',  // ← Default spacing between elements
}
```

### Typography
```typescript
typography: {
  fontSize: {
    base: '1rem',  // ← Base font size (16px)
  }
}
```

## 🚀 Complete Example

Here's a complete purple theme setup:

```typescript
// src/config/theme.ts
export const THEME = {
  colors: {
    primary: {
      DEFAULT: '#8B5CF6',                    // Purple
      hover: '#7C3AED',                      // Darker purple
      light: 'rgba(139, 92, 246, 0.1)',     // Light purple background
      lighter: 'rgba(139, 92, 246, 0.05)',  // Very light purple
    },
    // ... rest stays the same
  },
  borderRadius: {
    DEFAULT: '0.75rem',  // More rounded than default
  },
  // ... rest stays the same
}
```

Save, refresh, and BAM! 💜 Purple theme!

## ❓ Troubleshooting

### Colors Not Changing?
1. Make sure you saved `src/config/theme.ts`
2. Restart dev server: `npm run dev`
3. Hard refresh browser (Cmd+Shift+R or Ctrl+Shift+R)

### Button Still Blue?
1. Check you changed the `DEFAULT` value, not just `hover`
2. Make sure the color starts with `#`
3. Check for typos in the HEX code

### Hover Not Working?
1. Make sure `hover` is darker than `DEFAULT`
2. Try reducing the numbers in the HEX code by 10-20

## 🎨 Color Inspiration

Need inspiration? Check these sites:
- https://tailwindcss.com/docs/customizing-colors
- https://coolors.co/ (color palette generator)
- https://flatuicolors.com/ (pre-made palettes)
- https://brandcolors.net/ (famous brand colors)

## 📝 Summary

1. **Open:** `src/config/theme.ts`
2. **Find:** `colors.primary.DEFAULT`
3. **Change:** To your brand color
4. **Save:** File
5. **Done!** ✅

Your entire plugin now uses your brand color!

---

**Questions?** See [CUSTOMIZATION_GUIDE.md](./CUSTOMIZATION_GUIDE.md) for more details!
