# 🌐 Prestigio Motors - Domain & Hosting Setup Guide

## Domain Name Recommendations

### Primary Options:
- `prestigiomotors.com` ⭐ **RECOMMENDED**
- `prestigio-motors.com`
- `prestigioautomobiles.com`
- `prestigioluxurycars.com`

### Alternative Options:
- `prestigio.cars` (Premium TLD)
- `prestigio-collection.com`
- `prestigio-automotive.com`

## Step 1: Domain Registration

### Best Registrars:

#### 1. **Namecheap** (Recommended)
- **Cost**: $10-15/year
- **Pros**: Free privacy protection, excellent support
- **Website**: https://namecheap.com
- **Steps**:
  1. Search for domain
  2. Add WhoisGuard (free)
  3. Complete purchase
  4. Verify email

#### 2. **Cloudflare Registrar**
- **Cost**: At-cost (~$8-10/year)
- **Pros**: Best DNS management, security features
- **Website**: https://cloudflare.com/registrar
- **Requirements**: Must transfer existing domain or wait for availability

#### 3. **Google Domains** (Now Squarespace)
- **Cost**: $12-15/year
- **Pros**: Easy Google integration
- **Website**: https://domains.google.com

## Step 2: Hosting Platform Selection

### Option A: **Vercel** (Recommended for this project)
**Perfect for your Next.js/React setup**

**Pros:**
- Free tier with custom domain
- Automatic HTTPS
- Global CDN
- Easy GitHub integration
- Optimized for frontend frameworks

**Setup Process:**
1. Sign up at https://vercel.com
2. Connect your GitHub repository
3. Deploy with one click
4. Add custom domain in dashboard

**Cost**: Free (Pro: $20/month if needed)

### Option B: **Netlify**
**Great alternative for static sites**

**Pros:**
- Free tier with custom domain
- Form handling
- Continuous deployment
- Built-in CDN

**Setup Process:**
1. Sign up at https://netlify.com
2. Drag & drop your build folder OR connect Git
3. Configure custom domain
4. Enable HTTPS

**Cost**: Free (Pro: $19/month)

### Option C: **Traditional VPS Hosting**
**For full control (Advanced)**

#### **DigitalOcean Droplet**
- **Cost**: $5-10/month
- **Pros**: Full control, scalable
- **Setup**: Requires server management

#### **AWS EC2**
- **Cost**: $5-20/month (variable)
- **Pros**: Enterprise-grade, highly scalable
- **Setup**: Complex but powerful

#### **Hostinger VPS**
- **Cost**: $4-8/month
- **Pros**: Managed VPS, user-friendly
- **Setup**: Easier than pure VPS

## Step 3: Deploy Your Website

### For Vercel Deployment:

#### Method 1: GitHub Integration (Recommended)
```bash
# 1. Push your code to GitHub
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/yourusername/prestigio-motors.git
git push -u origin main

# 2. Go to vercel.com
# 3. Click "New Project"
# 4. Import from GitHub
# 5. Select your repository
# 6. Configure build settings:
#    - Framework Preset: Other
#    - Build Command: npm run build (if you have one)
#    - Output Directory: frontend (or your build folder)
```

#### Method 2: Vercel CLI
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd your-project-folder
vercel

# Follow prompts:
# - Link to existing project? No
# - Project name: prestigio-motors
# - Directory: ./frontend
# - Override settings? No
```

### For Netlify Deployment:

#### Method 1: Drag & Drop
1. Build your project locally
2. Go to https://netlify.com
3. Drag your `frontend` folder to the deploy area
4. Get your temporary URL

#### Method 2: Git Integration
1. Push to GitHub
2. Connect repository in Netlify
3. Set build settings:
   - Build command: `npm run build`
   - Publish directory: `frontend` or `build`

## Step 4: Connect Domain to Hosting

### Vercel Domain Setup:
1. Go to your Vercel dashboard
2. Select your project
3. Go to "Settings" → "Domains"
4. Add your custom domain
5. Configure DNS records (see below)

### DNS Configuration:

#### For Vercel:
Add these DNS records in your domain registrar:

```dns
Type: A
Name: @
Value: 76.76.19.61

Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

#### For Netlify:
```dns
Type: A
Name: @
Value: 75.2.60.5

Type: CNAME
Name: www
Value: your-site-name.netlify.app
```

#### For Custom VPS:
```dns
Type: A
Name: @
Value: YOUR_SERVER_IP

Type: A
Name: www
Value: YOUR_SERVER_IP
```

## Step 5: SSL Certificate Setup

### Automatic SSL (Vercel/Netlify):
- SSL certificates are automatically provisioned
- HTTPS will be enabled within minutes
- No action required

### Manual SSL (VPS):
```bash
# Install Certbot (Let's Encrypt)
sudo apt install certbot python3-certbot-nginx

# Generate certificate
sudo certbot --nginx -d prestigiomotors.com -d www.prestigiomotors.com

# Auto-renewal (add to crontab)
0 12 * * * /usr/bin/certbot renew --quiet
```

## Step 6: Configure Email (Optional)

### Google Workspace (Professional)
- **Cost**: $6/user/month
- **Features**: Gmail with custom domain
- **Setup**: Add MX records provided by Google

### Cloudflare Email Routing (Free)
- **Cost**: Free
- **Features**: Forward emails to existing address
- **Setup**: Add MX and TXT records

### Custom Email DNS Records:
```dns
Type: MX
Name: @
Value: mx1.your-email-provider.com
Priority: 10

Type: TXT
Name: @
Value: "v=spf1 include:_spf.google.com ~all"
```

## Step 7: Performance Optimization

### CDN Setup (Cloudflare - Free):
1. Sign up at https://cloudflare.com
2. Add your domain
3. Change nameservers to Cloudflare's
4. Enable caching and optimization features

### Cloudflare Nameservers Example:
```
NS: ava.ns.cloudflare.com
NS: doug.ns.cloudflare.com
```

## Step 8: Monitoring & Analytics

### Google Analytics:
```html
<!-- Add to your HTML head -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Google Search Console:
1. Go to https://search.google.com/search-console
2. Add your domain
3. Verify ownership via DNS TXT record
4. Submit sitemap

## Quick Setup Checklist

- [ ] Register domain name
- [ ] Choose hosting platform
- [ ] Deploy website
- [ ] Configure DNS records
- [ ] Verify SSL certificate
- [ ] Set up email (optional)
- [ ] Configure CDN (Cloudflare)
- [ ] Add analytics tracking
- [ ] Submit to search engines
- [ ] Test all functionality

## Estimated Timeline & Costs

### Timeline:
- Domain registration: 5 minutes
- DNS propagation: 24-48 hours
- SSL certificate: 15 minutes (auto)
- Full setup: 1-2 days

### Annual Costs:
- **Domain**: $10-15/year
- **Hosting**: Free (Vercel/Netlify) or $60+/year (VPS)
- **Email**: Free (forwarding) or $72/year (Google Workspace)
- **CDN**: Free (Cloudflare)
- **Total**: $10-100+/year depending on choices

## Troubleshooting

### Common Issues:

#### DNS Not Propagating:
```bash
# Check DNS propagation
nslookup prestigiomotors.com
dig prestigiomotors.com

# Online tools:
# https://dnschecker.org
# https://whatsmydns.net
```

#### SSL Issues:
- Wait 24 hours for DNS propagation
- Clear browser cache
- Check certificate status in hosting dashboard

#### Email Not Working:
- Verify MX records are correct
- Check SPF/DKIM records
- Test with online MX lookup tools

## Recommended Setup for Prestigio Motors:

1. **Domain**: Register `prestigiomotors.com` via Namecheap
2. **Hosting**: Deploy on Vercel (free tier)
3. **CDN**: Add Cloudflare (free tier)
4. **Email**: Use Cloudflare Email Routing to forward to your current email
5. **Analytics**: Add Google Analytics and Search Console

This setup will cost only $10-15/year and provide enterprise-level performance! 