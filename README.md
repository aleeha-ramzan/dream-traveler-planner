# 🌍 Dream Traveler Planner

Final Semester Project — Full-stack travel bucket-list app using **Node.js, Express, MongoDB (Mongoose), and MongoDB Compass** for GUI database viewing.

---

## 📁 Project Structure
```
dream-traveler-planner/
├── models/
│   └── Destination.js       # Mongoose schema
├── routes/
│   └── destinations.js      # CRUD API routes
├── public/
│   ├── index.html            # Frontend UI
│   ├── style.css             # Dark themed styling
│   └── script.js             # Frontend logic (fetch calls)
├── server.js                 # Express app entry point
├── package.json
└── .env                      # MongoDB connection string
```

---

## ✅ STEP 1 — Install Requirements

1. **Node.js** (v18+): https://nodejs.org
2. **MongoDB Community Server**: https://www.mongodb.com/try/download/community
3. **MongoDB Compass** (GUI tool): https://www.mongodb.com/try/download/compass
   - Compass usually comes bundled with the MongoDB installer — just tick the checkbox during install.

---

## ✅ STEP 2 — Start MongoDB Service

- **Windows**: MongoDB installs as a service automatically. Confirm via Services app ("MongoDB Server" should be Running). If not, open Command Prompt as admin:
  ```
  net start MongoDB
  ```
- **Mac (brew)**:
  ```
  brew tail -f /usr/local/var/log/mongodb/mongo.log
  brew services start mongodb-community
  ```
- **Linux**:
  ```
  sudo systemctl start mongod
  ```

---

## ✅ STEP 3 — Connect via MongoDB Compass (for your GUI demo)

1. Open **MongoDB Compass**.
2. In the connection box, paste:
   ```
   mongodb://127.0.0.1:27017
   ```
3. Click **Connect**.
4. You won't see `dreamTravelerPlanner` database yet — it will appear **automatically** once you add your first destination from the app (Step 5). This is a great thing to show your evaluator: "database aur collection app run karne par khud create ho jati hai."

---

## ✅ STEP 4 — Install Project Dependencies

Open terminal inside the `dream-traveler-planner` folder and run:

```bash
npm install
```

This installs express, mongoose, dotenv, and cors.

---

## ✅ STEP 5 — Run the Project

```bash
npm start
```

You should see:
```
✅ Connected to MongoDB: mongodb://127.0.0.1:27017/dreamTravelerPlanner
🚀 Dream Traveler Planner running at http://localhost:5000
```

Open your browser at **http://localhost:5000** — you'll land on the **Login page**.

---

## 🔐 STEP 5.5 — Authentication (Admin + User)

This project now has full login/register with secure, hashed passwords (bcrypt) and JWT-based sessions.

**Option A — Use the seed script (fastest, recommended for demo):**
```bash
node seed.js
```
This creates two ready-to-use accounts and 6 sample destinations:

| Role  | Email            | Password   |
|-------|------------------|------------|
| Admin | admin@dream.com  | Admin@123  |
| User  | user@dream.com   | User@123   |

**Option B — Register your own account:**
- Go to the Login page → click **Register** tab → fill Name/Email/Password
- Public registration always creates a normal **"user"** account (not admin) — this is intentional for security. Admin accounts can only be created through the seed script or directly in the database.

**How it works:**
- Each user only sees and manages **their own** dream destinations.
- Logging in as **Admin** shows an extra **"Admin Panel"** link in the navbar → shows every registered user + every destination in the system (with owner name/email).
- Passwords are never stored in plain text — they're hashed with bcrypt before saving to MongoDB. You can verify this yourself in Compass: open the `users` collection and see the `password` field is a long scrambled hash, not the real password.

---

## 🔔 STEP 5.6 — Upcoming Trip Notifications

Every time you log in and load the planner, the app checks your destinations for any with a **target date within the next 30 days** (and status not "Visited") and shows popup toast notifications in the top-right corner, e.g.:
> 🔔 Upcoming trip: Kyoto, Japan is planned in 12 days!



## ✅ STEP 6 — Use the App

1. Click **"+ Add Dream Destination"**
2. Fill in name, country, description, image URL, budget, priority, status, target date
3. Click **Save Destination**
4. It instantly appears as a card, and the stats bar updates (Total, Planned, Booked, Visited, Total Budget)
5. Use **Edit** ✏️ / **Delete** 🗑️ buttons on any card
6. Use the filter dropdown/search box at the top to filter by status or country

---

## ✅ STEP 7 — Show it in MongoDB Compass (for viva/demo)

1. Go back to Compass → refresh the databases list (left sidebar)
2. Open `dreamTravelerPlanner` → `destinations` collection
3. You'll see your data stored as JSON documents — this proves the app is really connected to MongoDB.
4. You can even edit/delete a document directly inside Compass and refresh your browser page to show it updates live — great demo point for your evaluator.

---

## 🧠 Quick Viva Prep (Roman Urdu)

- **Kya use hua hai?** MongoDB (NoSQL database), Mongoose (ODM jo schema define karta hai), Express.js (backend + REST API), JWT (JSON Web Token — login session ke liye), bcrypt (password ko hash/encrypt karne ke liye), aur plain HTML/CSS/JS frontend.
- **Password kaise secure hai?** Jab user register karta hai, uska password seedha save nahi hota — bcrypt library us par ek "hashing" algorithm chalati hai jo password ko ek irreversible scrambled string me convert kar deti hai. Login ke waqt, entered password ko dobara hash karke database wale hash se compare kiya jata hai — asal password kabhi kahin store nahi hota.
- **JWT kya karta hai?** Jab user login karta hai, server ek "token" generate karta hai (JWT) jisme user ki id aur role encoded hota hai. Ye token browser me localStorage me save hota hai aur har request ke sath "Authorization" header me bheja jata hai, taake server pehchan sake ye request kaun bhej raha hai — bina baar baar password bheje.
- **Admin aur User me farak?** Har user ka apna role hota hai database me ("user" ya "admin"). Middleware (auth.js) check karta hai role kya hai — agar route admin-only hai (jaise sab users dekhna) to sirf admin role wala access kar sakta hai, warna 403 error milta hai.
- **REST API kya hota hai?** Ek standard tareeqa hai client (browser) aur server ke beech data bhejne/lene ka, HTTP methods use karke: GET (data lena), POST (naya data add karna), PUT (update karna), DELETE (delete karna).
- **CRUD ka matlab?** Create, Read, Update, Delete — yehi four basic operations har database-driven app me hote hain.
- **Notifications kaise kaam karti hain?** Backend me ek route hai `/api/destinations/upcoming` jo un destinations ko dhoondta hai jinki target date agle 30 din ke andar hai aur status "Visited" nahi hai. Frontend page load hote hi ye route call karta hai aur har result ke liye ek popup (toast) dikhata hai.

---

## 🎯 Optional Extra Features (if you have time before submission)

- Add user login (JWT authentication) so multiple users can have their own dream lists
- Add sorting (by budget, by priority)
- Add a map view showing pins for each destination (using Leaflet.js)
- Export destination list as PDF

Good luck with your submission, Chichi! 🚀
