# SCREENPLAY PLAYER PLATFORM
## Complete Full-Stack Web Application

---

## 🎬 WHAT YOU GOT

A complete, production-ready web application that lets you:

**ADMIN SIDE (You):**
- Login securely with email/password
- Create unlimited screenplay projects
- Upload scenes for each screenplay
- Search Spotify and attach songs to scenes
- Publish/unpublish projects
- Each project gets its own shareable URL

**PUBLIC SIDE (Users):**
- Beautiful playlist-style interface
- Album artwork + Song info + Scene text
- Click "Open in Spotify" to listen
- Share the whole experience
- Mobile responsive design

---

## 📁 WHAT'S IN THE PACKAGE

```
screenplay-player/
├── backend/                    # Node.js API Server
│   ├── server.js              # Main server (all API routes)
│   ├── schema.sql             # Database setup
│   ├── package.json           # Backend dependencies
│   └── .env.example           # Configuration template
│
├── frontend/                   # React Application
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Login.js       # Admin login
│   │   │   ├── Dashboard.js   # Project management
│   │   │   ├── ProjectEditor.js  # Scene editor
│   │   │   └── PublicPlayer.js   # User-facing player
│   │   ├── App.js             # Main React app
│   │   └── index.js           # Entry point
│   ├── public/
│   │   └── index.html
│   └── package.json           # Frontend dependencies
│
└── DEPLOYMENT_GUIDE.md        # Detailed deployment instructions
```

---

## ⚡ QUICK START (30 Minutes to Live)

### Prerequisites
- GitHub account (free)
- Railway.app account (free, $5/month after)
- Spotify Developer account (free)

### Step 1: Database (5 min)
1. Sign up at https://railway.app
2. New Project → "Provision PostgreSQL"
3. Copy the connection URL

### Step 2: Upload to GitHub (5 min)
1. Create new repo called `screenplay-player`
2. Upload all files from this folder
3. Commit and push

### Step 3: Deploy Backend (10 min)
1. Railway → New → GitHub Repo
2. Select `screenplay-player`
3. Set root directory: `/backend`
4. Add environment variables:
   - `DATABASE_URL`: Your PostgreSQL URL
   - `JWT_SECRET`: Random string (use https://randomkeygen.com)
   - `NODE_ENV`: production
5. Deploy!
6. Go to PostgreSQL service → Data tab
7. Run the SQL from `backend/schema.sql`

### Step 4: Deploy Frontend (5 min)
1. Railway → New → Same GitHub repo
2. Set root directory: `/frontend`
3. Add environment variable:
   - `REACT_APP_API_URL`: Your backend URL from Step 3
4. Deploy!

### Step 5: First Login (5 min)
1. Visit your frontend URL
2. Login: `admin@screenplay.local` / `changeme123`
3. IMMEDIATELY change password!

---

## 🎵 CREATING YOUR FIRST PROJECT

### Get Spotify Credentials
1. https://developer.spotify.com/dashboard
2. Create App
3. Copy Client ID and Client Secret

### In Admin Dashboard
1. Click "New Project"
2. Fill in:
   - Title: "Last Chance on the Stairway"
   - Slug: "last-chance"
   - Description: "An 80s teen romance..."
   - Spotify Client ID: [from above]
   - Spotify Client Secret: [from above]
3. Save

### Add Scenes
1. Click on your project
2. "Add Scene"
3. Enter:
   - Scene Number: 1
   - Scene Heading: "INT. GARAGE - MORNING"
   - Scene Text: [paste from screenplay]
   - Search song: "Jump Van Halen"
   - Click search result to attach
4. Save
5. Repeat for all scenes

### Publish
1. Toggle "Published" to ON
2. Your screenplay is now live!
3. Share: `yoursite.com/last-chance`

---

## 💰 COST

- **Hosting**: $5/month (Railway)
- **Domain**: $1/month (optional)
- **Total**: $5-6/month

**Everything else is FREE:**
- Spotify API: Free
- GitHub: Free
- Unlimited screenplays
- Unlimited scenes
- Unlimited traffic

---

## 🔒 SECURITY FEATURES

✅ Password hashing (bcrypt)
✅ JWT authentication
✅ API keys hidden on server
✅ SQL injection protection
✅ HTTPS (automatic)
✅ CORS protection

---

## 📱 USER EXPERIENCE

When someone visits `yoursite.com/last-chance`:

```
┌────────────────────────────────────────┐
│ LAST CHANCE ON THE STAIRWAY           │
│ An 80s teen romance...                │
│ [Share Button]                         │
├────────────────────────────────────────┤
│ 🎵 SCREENPLAY PLAYLIST                 │
│                                        │
│ ┌────────┐  Jump - Van Halen          │
│ │ Album  │  INT. GARAGE - MORNING     │
│ │  Art   │  Kyle sits in Porsche...   │
│ └────────┘  ► Open in Spotify          │
│ ──────────────────────────────────────│
│ ┌────────┐  Age of Consent             │
│ │ Album  │  EXT. SUBURB - MORNING     │
│ │  Art   │  Kyle rides bike...        │
│ └────────┘  ► Open in Spotify          │
│ ──────────────────────────────────────│
│ [All scenes...]                        │
│                                        │
│ 📤 Share This Experience               │
└────────────────────────────────────────┘
```

- Beautiful gradient background
- Responsive (works on phone/tablet)
- Album artwork for every scene
- One-click Spotify links
- Easy sharing

---

## 🚀 SCALING TO MULTIPLE SCREENPLAYS

Each screenplay is a separate project:
- `yoursite.com/last-chance`
- `yoursite.com/other-screenplay`
- `yoursite.com/third-script`

Just create new projects in the admin dashboard!

---

## 🛠 TECH STACK

**Backend:**
- Node.js + Express
- PostgreSQL database
- JWT authentication
- bcrypt password hashing
- Spotify API proxy

**Frontend:**
- React 18
- React Router
- Axios
- Modern CSS

**Hosting:**
- Railway (recommended)
- Or Render/Heroku/DigitalOcean

---

## 📖 FILES EXPLAINED

**Backend:**
- `server.js`: All API routes (auth, projects, scenes, Spotify)
- `schema.sql`: Database tables and structure
- `.env.example`: Template for environment variables

**Frontend:**
- `Login.js`: Admin login page
- `Dashboard.js`: Project management
- `ProjectEditor.js`: Add/edit scenes with Spotify search
- `PublicPlayer.js`: Beautiful public-facing player

---

## 🐛 TROUBLESHOOTING

**Can't login?**
- Make sure you ran `schema.sql` in PostgreSQL
- Default password: `changeme123`

**Spotify search not working?**
- Verify Client ID/Secret are correct
- Make sure they're saved in project settings

**Blank page?**
- Check browser console (F12)
- Verify `REACT_APP_API_URL` is set
- Make sure backend is running

**Database errors?**
- Check `DATABASE_URL` in Railway
- Ensure PostgreSQL service is running

---

## 📚 DETAILED INSTRUCTIONS

See `DEPLOYMENT_GUIDE.md` for:
- Step-by-step deployment
- Environment variable details
- Database setup
- Troubleshooting
- Advanced configuration

---

## ✅ CHECKLIST

Before going live:

- [ ] Backend deployed on Railway
- [ ] Database created and schema loaded
- [ ] Frontend deployed on Railway  
- [ ] Environment variables set
- [ ] Default password changed
- [ ] First project created
- [ ] Scenes added with songs
- [ ] Project published
- [ ] Tested public URL
- [ ] Shared with friends!

---

## 🎉 YOU'RE DONE!

Your screenplay platform is live. You can now:
1. Share your screenplay with the world
2. Add more screenplays as separate projects
3. Each gets its own beautiful URL
4. Users experience the script with music
5. Everything is secure and scalable

**This is a complete, production-ready application.**

No more code to write. Just deploy and use!

---

**Questions? Check DEPLOYMENT_GUIDE.md for detailed help.**
