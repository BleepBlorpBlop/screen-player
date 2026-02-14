# SCREENPLAY PLAYER PLATFORM - COMPLETE DEPLOYMENT GUIDE

## What You're Getting

A complete, production-ready web application that allows you to:
- **Admin Side**: Upload multiple screenplays, associate Spotify songs with scenes, manage everything
- **Public Side**: Beautiful playlist-style interface for users to read and experience your screenplays
- **Multi-Project**: Host unlimited screenplays on one platform

---

## ARCHITECTURE

```
screenplay-player/
├── backend/          # Node.js API server
│   ├── server.js     # Main server file
│   ├── schema.sql    # Database schema
│   ├── package.json  # Dependencies
│   └── .env          # Configuration (you create this)
│
└── frontend/         # React application
    ├── src/          # Source code
    ├── public/       # Static assets  
    └── package.json  # Dependencies
```

---

## HOSTING RECOMMENDATION: Railway.app

**Why Railway:**
- $5/month for everything (backend + database)
- Automatic deployments from GitHub
- Built-in PostgreSQL
- Zero configuration needed
- Free SSL certificates

**Alternative:** Render.com (similar pricing/features)

---

## STEP-BY-STEP DEPLOYMENT

### STEP 1: Set Up Database (5 minutes)

1. Sign up at https://railway.app
2. Create new project → "Provision PostgreSQL"
3. Click on PostgreSQL → "Connect" → Copy the "Postgres Connection URL"
4. Save this URL (you'll need it in Step 3)

### STEP 2: Prepare Your Code (10 minutes)

1. Create a GitHub account if you don't have one
2. Create a new repository called `screenplay-player`
3. Upload ALL the files I gave you to this repository:
   - backend/ folder
   - frontend/ folder
   - deployment-guide.md (this file)

### STEP 3: Configure Backend (5 minutes)

1. In Railway, click "New" → "GitHub Repo"
2. Connect your `screenplay-player` repository
3. Railway will detect it's a Node.js app
4. Add environment variables (Settings → Variables):
   ```
   DATABASE_URL=<paste your PostgreSQL URL from Step 1>
   JWT_SECRET=<generate random string - use https://randomkeygen.com/>
   NODE_ENV=production
   FRONTEND_URL=<your Railway frontend URL - you'll get this in Step 4>
   ```
5. Set Root Directory to `/backend`
6. Deploy!

### STEP 4: Initialize Database (2 minutes)

1. In Railway, click on your backend service
2. Go to "Data" tab
3. Run the contents of `backend/schema.sql`
4. This creates your database tables and default admin user

### STEP 5: Deploy Frontend (5 minutes)

1. In Railway, click "New" → "GitHub Repo" again
2. Select the SAME `screenplay-player` repository
3. Railway will ask what to deploy - choose a new service
4. Set Root Directory to `/frontend`
5. Add environment variable:
   ```
   REACT_APP_API_URL=<your backend URL from Step 3>
   ```
6. Deploy!

### STEP 6: Connect Your Domain (Optional, 10 minutes)

1. Buy domain at Namecheap/Google Domains (~$12/year)
2. In Railway frontend service → Settings → Domains
3. Add your custom domain
4. Update your domain's DNS records (Railway will show you what to add)
5. Wait 5-30 minutes for DNS propagation

---

## FIRST LOGIN

1. Go to your deployed frontend URL
2. Click "Admin Login"
3. Login with:
   - Email: `admin@screenplay.local`
   - Password: `changeme123`
4. **IMMEDIATELY** go to Settings → Change Password
5. Update to a secure password

---

## CREATING YOUR FIRST PROJECT

### Get Spotify API Credentials

1. Go to https://developer.spotify.com/dashboard
2. Create an app
3. Copy Client ID and Client Secret
4. In Redirect URIs, add: `http://localhost` (doesn't matter, we're using client credentials flow)

### In Admin Dashboard

1. Click "New Project"
2. Fill in:
   - **Title**: "Last Chance on the Stairway"
   - **Slug**: "last-chance" (this becomes yoursite.com/last-chance)
   - **Description**: Brief description
   - **Spotify Client ID**: From above
   - **Spotify Client Secret**: From above
3. Click Create

### Add Scenes

1. Click on your new project
2. Click "Add Scene"
3. Fill in:
   - **Scene Number**: 1, 2, 3... (in order)
   - **Scene Heading**: e.g., "INT. GARAGE - MORNING"
   - **Scene Text**: Copy-paste from your screenplay
   - **Search for Song**: Type "Jump Van Halen"
   - Select the correct song from search results
4. Click Save
5. Repeat for all scenes

### Publish

1. When all scenes are added, toggle "Published" to ON
2. Your screenplay is now live at: `yoursite.com/last-chance`

---

## PUBLIC EXPERIENCE

Users visit `yoursite.com/last-chance` and see:

```
╔════════════════════════════════════════╗
║  LAST CHANCE ON THE STAIRWAY          ║
║  [Description you wrote]               ║
╠════════════════════════════════════════╣
║  🎵 PLAYLIST                           ║
║                                        ║
║  ┌────────┐  Jump                     ║
║  │ Album  │  Van Halen                ║
║  │  Art   │                           ║
║  └────────┘  INT. GARAGE - MORNING    ║
║              Kyle sits in the          ║
║              Porsche... [scene text]   ║
║              ► Open in Spotify         ║
║  ────────────────────────────────────  ║
║  ┌────────┐  Age of Consent           ║
║  │ Album  │  New Order                ║
║  │  Art   │                           ║
║  └────────┘  EXT. SUBURB - MORNING    ║
║              Kyle rides his bike...    ║
║              ► Open in Spotify         ║
║  ────────────────────────────────────  ║
║  [... all your scenes ...]            ║
║                                        ║
║  📤 Share This Experience              ║
╚════════════════════════════════════════╝
```

---

## COST BREAKDOWN

**Monthly Costs:**
- Railway hosting: $5/month
- Domain (optional): $1/month (if you buy annually)
- **Total: $5-6/month**

**One-Time Costs:**
- Domain registration: ~$12/year
- Spotify Developer account: FREE
- GitHub account: FREE
- Development time: Done (I built it for you)

---

## SCALING TO MULTIPLE SCREENPLAYS

To add a second screenplay:

1. Admin Dashboard → New Project
2. Title: "Your Other Screenplay"
3. Slug: "other-screenplay"
4. Add scenes
5. Publish
6. Now live at: `yoursite.com/other-screenplay`

Each screenplay is completely independent with its own:
- Spotify credentials
- Scenes
- Publish status
- Share link

---

## SECURITY FEATURES

✅ **Password hashing** with bcrypt
✅ **JWT authentication** for admin
✅ **API keys hidden** on server, never exposed to users
✅ **SQL injection protection** with parameterized queries
✅ **CORS protection**
✅ **HTTPS** (automatic with Railway)

---

## TROUBLESHOOTING

**"Can't connect to database"**
- Check DATABASE_URL in environment variables
- Make sure PostgreSQL service is running in Railway

**"Invalid credentials" on login**
- Make sure you ran schema.sql to create admin user
- Default password is `changeme123`

**"Spotify search not working"**
- Verify Client ID and Client Secret are correct
- Check they're saved in the project settings

**"Frontend shows blank page"**
- Check browser console for errors (F12)
- Verify REACT_APP_API_URL is set correctly
- Make sure backend is deployed and running

---

## SUPPORT

If you get stuck:
1. Check Railway logs (click on service → "Deployments" → "View logs")
2. Check browser console (F12 → Console tab)
3. Verify all environment variables are set

---

## WHAT'S NEXT?

1. Deploy the application
2. Change the default password
3. Create your first project
4. Add all your scenes
5. Publish it
6. Share the link!

Your screenplay will be live and shareable at a custom URL, with a beautiful interface that combines the script with the music that makes it come alive.

---

**This is a complete, production-ready application. Everything is built. You just need to deploy it.**
