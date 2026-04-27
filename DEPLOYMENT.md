# Deployment Guide - Graham Value Platform

## 🚀 Option 1: Local Development (Recommended First)

### Start Here
```bash
# 1. Get API Keys
# Alpha Vantage: https://www.alphavantage.co/ (get key immediately)
# Finnhub: https://finnhub.io/ (sign up, get key from dashboard)

# 2. Extract files and setup backend
cd graham-platform
cp .env.example .env
nano .env  # Add your API keys

# 3. Install and start
npm install
npm start

# 4. In another terminal, setup frontend
npx create-react-app frontend
cp App.jsx frontend/src/App.jsx
echo "REACT_APP_API_URL=http://localhost:3001/api" > frontend/.env
cd frontend && npm start
```

Visit: `http://localhost:3000`

---

## 🌐 Option 2: Deploy to Heroku (Backend)

### Prerequisites
- Heroku account (free at https://heroku.com)
- Heroku CLI installed

### Steps
```bash
# 1. Login to Heroku
heroku login

# 2. Create new app
heroku create graham-value-api

# 3. Set environment variables
heroku config:set ALPHA_VANTAGE_API_KEY=your_key_here
heroku config:set FINNHUB_API_KEY=your_key_here
heroku config:set NODE_ENV=production
heroku config:set FRONTEND_URL=https://your-frontend-url.vercel.app

# 4. Deploy
git push heroku main

# 5. Check logs
heroku logs --tail
```

Your backend will be at: `https://graham-value-api.herokuapp.com`

---

## 🎨 Option 3: Deploy Frontend to Vercel

### Prerequisites
- Vercel account (free at https://vercel.com)

### Steps
```bash
# 1. Install Vercel CLI
npm install -g vercel

# 2. Deploy
cd frontend
vercel

# 3. Add environment variable when prompted
# REACT_APP_API_URL = https://graham-value-api.herokuapp.com/api

# 4. Visit your deployed frontend
# You'll get a URL like: https://graham-platform.vercel.app
```

---

## 🐳 Option 4: Docker Deployment

### Local Docker
```bash
# Build and run
docker-compose up

# Or separately:
docker build -t graham-api .
docker run -p 3001:3001 -e ALPHA_VANTAGE_API_KEY=your_key -e FINNHUB_API_KEY=your_key graham-api
```

### Deploy to DigitalOcean/AWS/GCP
```bash
# Push to container registry
docker tag graham-api your-registry/graham-api:latest
docker push your-registry/graham-api:latest

# Then deploy using your cloud provider's CLI
```

---

## ☁️ Option 5: AWS Deployment

### Using EC2
```bash
# 1. Launch EC2 instance (Ubuntu 22.04, t2.micro = free tier)
# 2. SSH into instance
ssh -i your-key.pem ubuntu@your-instance-ip

# 3. Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# 4. Clone your project
git clone your-repo
cd graham-platform

# 5. Setup
cp .env.example .env
nano .env  # Add API keys

# 6. Install PM2 for process management
sudo npm install -g pm2

# 7. Start app
pm2 start server.js --name graham-api

# 8. Setup Nginx as reverse proxy
sudo apt-get install -y nginx
# Configure nginx to proxy to localhost:3001
```

---

## 🔐 Security Checklist

Before deploying to production:

- [ ] API keys stored in environment variables (not in code)
- [ ] CORS configured for your frontend domain
- [ ] Rate limiting enabled (use `express-rate-limit`)
- [ ] HTTPS enabled (Heroku/Vercel do this automatically)
- [ ] API key rotation schedule set
- [ ] Error messages don't leak sensitive data
- [ ] Cache headers set appropriately
- [ ] Monitoring/alerting configured

### Example Rate Limiting
```javascript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);
```

---

## 📊 Monitoring

### Heroku
```bash
# View logs
heroku logs --tail

# Check performance
heroku logs --source app

# See metrics
heroku metrics
```

### Vercel
- Dashboard shows deployment status
- Edge network analytics
- Performance metrics

---

## 💰 Cost Estimates (2026)

| Service | Free Tier | Paid Starting |
|---------|-----------|---------------|
| Heroku | 550 free dyno hours/month | $7/month (Eco) |
| Vercel | Unlimited deployments | $20/month (Pro) |
| Alpha Vantage | 500 calls/day | $25/month |
| Finnhub | 60 calls/min | $99/month |
| DigitalOcean | - | $4/month (basic droplet) |

**Recommended starter stack:** Heroku + Vercel + Free APIs = ~$0/month

---

## 🚨 Troubleshooting Deployments

### "API Key Invalid" after deployment
- Verify env vars are set: `heroku config`
- Redeploy: `git push heroku main`

### "CORS errors" 
- Check FRONTEND_URL env var matches deployed frontend
- Restart dyno: `heroku restart`

### "Out of free API quota"
- Alpha Vantage: 500/day (upgrade or add caching)
- Finnhub: 60/min (should be fine)
- Solution: Upgrade to paid or reduce request frequency

### "Database full" (if you add DB)
- Heroku: Upgrade to Standard PostgreSQL
- AWS RDS: Increase allocated storage

---

## 🔄 Continuous Deployment

### GitHub Actions (Automatic Deployment)
```yaml
name: Deploy to Heroku

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{ secrets.HEROKU_API_KEY }}
          heroku_app_name: graham-value-api
```

---

## 📞 Support

- **Heroku Issues:** https://status.heroku.com/
- **Vercel Issues:** https://www.vercelstatus.com/
- **Alpha Vantage Docs:** https://www.alphavantage.co/documentation/
- **Finnhub Docs:** https://finnhub.io/docs/api

---

## ✅ Next Steps

1. **Choose deployment option** (recommend Heroku + Vercel)
2. **Sign up for services** 
3. **Get API keys**
4. **Follow deployment steps**
5. **Test live deployment**
6. **Set up monitoring**
7. **Add domain name** (optional)

**You can have this live in < 30 minutes!** 🎉
