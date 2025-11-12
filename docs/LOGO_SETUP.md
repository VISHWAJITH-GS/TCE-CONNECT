# TCE Logo Setup Instructions

## Adding the TCE Logo

To complete the logo integration, please follow these steps:

### 1. Save the Logo Image

Save the TCE logo image (the one you provided) to:
```
frontend/public/tce-logo.png
```

**Important:** The image file must be named exactly `tce-logo.png` and placed in the `frontend/public/` directory.

### 2. Image Specifications

- **Format:** PNG (with transparent background preferred)
- **Recommended Size:** 512x512 pixels or larger
- **File Name:** `tce-logo.png` (case-sensitive)

### 3. Where the Logo Appears

Once added, the TCE logo will automatically appear in:

✅ **Navbar** (top-left corner)
- Desktop: 40x40px
- Hover effect with scale animation

✅ **Sidebar** (left panel on desktop)
- Size: 32x32px
- Appears above navigation links

✅ **Footer** (bottom of all pages)
- Size: 48x48px
- Next to "TCE Connect" branding

✅ **Browser Tab** (favicon)
- Appears in browser tabs and bookmarks

### 4. Fallback Behavior

If the logo image is not found, the component will gracefully hide the image element and display text-only branding.

### 5. Testing

After adding the logo:
1. Refresh your browser (Ctrl+F5 or Cmd+Shift+R)
2. Check all pages: Home, Events, Community
3. Verify the favicon appears in the browser tab

---

**Current Status:** Logo placeholders are ready. Just add `tce-logo.png` to the `frontend/public/` folder!
