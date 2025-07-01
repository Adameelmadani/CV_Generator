# CV Generator - LaTeX Preview Setup

## Overview
This branch includes LaTeX-based PDF preview functionality that replaces the previous TCPDF solution. The preview in the dashboard now matches exactly what users will download.

## Quick Setup Verification

1. **Run Setup Verification**
   - Navigate to: `http://localhost/Projets/CV_Generator/Cv_generator/setup_verification.php`
   - This will check all requirements and show what needs to be fixed

2. **Run Debug Tools** (if issues persist)
   - Navigate to: `http://localhost/Projets/CV_Generator/Cv_generator/debug_preview.php`
   - This provides detailed diagnostics for preview generation

## Required Components

### 1. Files (should be included in this branch)
- ✅ `preview_cv.php` - LaTeX preview endpoint
- ✅ `download_cv.php` - Enhanced with photo fix and LaTeX generation
- ✅ `user_home.js` - Updated to use LaTeX preview
- ✅ `user_home.html` - Enhanced dashboard with large modal
- ✅ `user_home.css` - Full-width responsive design
- ✅ `templates/modern.cls` - LaTeX template
- ✅ `setup_verification.php` - Setup checker
- ✅ `debug_preview.php` - Debug tool

### 2. LaTeX Installation (Required)
You need pdflatex installed and accessible from command line:

**Windows (Recommended: MiKTeX)**
1. Download: https://miktex.org/download
2. Install MiKTeX
3. Add to PATH: `C:\Users\[username]\AppData\Local\Programs\MiKTeX\miktex\bin\x64\`
4. Restart XAMPP/Apache

**Alternative: TeX Live**
1. Download: https://www.tug.org/texlive/
2. Install TeX Live
3. Add to PATH: `C:\texlive\2023\bin\win32\`
4. Restart XAMPP/Apache

**Verify Installation:**
```bash
pdflatex --version
```

### 3. Directory Permissions
Ensure these directories are writable:
- `uploads/` (for user photos)
- System temp directory (for LaTeX compilation)

## Changes Made in This Branch

### UI/UX Improvements
- 🎨 Full-width layout (removed container margins)
- 📱 Responsive design for all screen sizes
- 🔍 Large preview modal (95% screen size)
- 🗂️ Compact CV cards without format indicators
- ⚡ Reduced spacing for better space utilization

### Backend Improvements
- 🔧 Fixed photo display in downloaded CVs
- 📄 LaTeX-based preview matching final output
- 🏷️ CV names use firstname + lastname only
- 🔗 Unified PDF generation logic for preview and download

### Technical Changes
- `preview_cv.php`: New LaTeX preview endpoint
- `download_cv.php`: Enhanced photo handling and LaTeX generation
- `user_home.js`: Updated preview logic with better error handling
- CSS: Full-width, responsive, compact design

## Troubleshooting

### If Preview Shows "Error" or Doesn't Work:

1. **Check Setup**: Run `setup_verification.php`
2. **Check LaTeX**: Ensure `pdflatex --version` works in command line
3. **Check Files**: Ensure all files from this branch are present
4. **Check Permissions**: Ensure web server can write to temp directory
5. **Check Browser Console**: Look for JavaScript errors
6. **Check Server Logs**: Look for PHP errors

### Common Issues:

**"pdflatex not found"**
- Install LaTeX (MiKTeX or TeX Live)
- Add to PATH environment variable
- Restart web server

**"Permission denied"**
- Check temp directory permissions
- Check uploads directory permissions

**"File not found"**
- Ensure all files from branch are synced
- Check file paths in includes

**Still using TCPDF preview**
- Clear browser cache
- Check if `user_home.js` was updated
- Verify JavaScript console for errors

## Testing

1. Login to the dashboard
2. Click on any CV card to preview
3. Should see "Génération de l'aperçu LaTeX..." loading message
4. Preview should match downloadable PDF exactly
5. Large modal window should display the PDF clearly

## Support Files

- `setup_verification.php` - Complete setup checker
- `debug_preview.php` - Detailed debug information  
- Both files provide specific guidance on fixing issues

---

*Last updated: July 2025*
