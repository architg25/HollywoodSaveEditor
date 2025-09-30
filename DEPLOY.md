# Deployment Guide

## Quick Deployment to Vercel

### Prerequisites
- GitHub account
- Vercel account (free)

### Steps

1. **Fork this repository**
   - Go to this GitHub repository
   - Click "Fork" button
   - Create fork in your account

2. **Deploy to Vercel**
   - Visit [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "New Project"
   - Import your forked repository
   - Click "Deploy"

3. **Done!**
   - Your app will be live at: `your-project-name.vercel.app`
   - Automatic deployments on every push to main branch

### Configuration

The included `vercel.json` handles:
- ✅ Static file serving from `/web` folder as output directory
- ✅ Proper MIME types for JS/CSS files
- ✅ No-build deployment (pure static files)
- ✅ Custom build and install commands

### Custom Domain (Optional)

1. In Vercel dashboard, go to your project
2. Settings → Domains
3. Add your custom domain
4. Follow DNS configuration instructions

## Alternative Deployments

### Netlify
1. Drag & drop the `web` folder to [Netlify Drop](https://app.netlify.com/drop)
2. Or connect your GitHub repo for automatic deployments

### GitHub Pages
1. Go to repository Settings
2. Pages → Source → Deploy from branch
3. Select `main` branch and `/web` folder
4. Your app will be at: `username.github.io/repository-name`

### Self-Hosted
1. Upload contents of `web` folder to your web server
2. Configure your server to serve static files
3. Ensure proper MIME types for `.js` and `.css` files

## Environment Variables

This app requires no environment variables or server-side configuration. It's a pure client-side application that works with static file hosting.

## Build Process

No build process required! This is a vanilla JavaScript application that runs directly in the browser.

## Troubleshooting

### Common Issues

**JavaScript files not loading**
- Ensure your server serves `.js` files with `application/javascript` MIME type
- Check browser console for CORS errors

**CSS not loading**
- Ensure your server serves `.css` files with `text/css` MIME type

**File picker not working**
- This is normal on some browsers/platforms
- Drag & drop should work as fallback

### Vercel-Specific

**Build fails**
- Vercel auto-detects as static site
- No build command needed
- Check `vercel.json` is in root directory

**404 errors**
- Ensure `vercel.json` routing is correct
- Web files should be in `/web` folder

## Support

For deployment issues:
- Check Vercel documentation
- Review browser console errors
- Ensure all files are properly committed to Git