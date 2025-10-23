# Quick Start Guide - Supabase Backend

## 🚀 5-Minute Setup

### Step 1: Run Database Schema (REQUIRED)

1. Open your Supabase project: https://rxsynwjpkkfuhrsrksjd.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Open the file `supabase-schema.sql` from your project
4. Copy ALL the content
5. Paste into Supabase SQL Editor
6. Click **"Run"** button
7. Wait for success message ✅

### Step 2: Create Admin Account

1. Start your dev server: `npm run dev`
2. Visit: http://localhost:3000
3. Click "Sign Up"
4. Create account with:
   - Email: your-email@example.com
   - Password: your-password
   - Name: Your Name
   - Role: Student (will change to admin next)
   - Department: Computer Science

5. Go to Supabase Dashboard → **Table Editor** → **profiles**
6. Find your user row
7. Edit: Change `role` from "student" to **"admin"**
8. Save ✅

### Step 3: Test Features

**Test Faculty (Admin Only):**
1. Go to http://localhost:3000/faculty
2. Click "Add Faculty"
3. Fill in details and submit
4. Verify faculty appears in list
5. Try Edit and Delete

**Test Forum:**
1. Go to http://localhost:3000/forum
2. Click "New Discussion"
3. Create a topic
4. View the topic and add a reply

**Test Project Submission:**
1. Go to homepage
2. Find "Submit Project Idea" section
3. Fill form and submit
4. Check `project_submissions` table in Supabase

## ✅ Verification Checklist

- [ ] Database schema ran successfully
- [ ] Admin user created
- [ ] Can add/edit/delete faculty
- [ ] Can create forum topics
- [ ] Can submit projects
- [ ] Data appears in Supabase tables

## 🔧 Troubleshooting

**"Error connecting to Supabase"**
- Check `.env.local` exists in project root
- Restart dev server: `npm run dev`

**"Permission denied"**
- Verify you're logged in
- For faculty operations, verify you're admin
- Check RLS policies in Supabase

**"Data not showing"**
- Check browser console for errors
- Verify data exists in Supabase tables
- Clear browser cache and refresh

## 📚 Documentation Files

- `SUPABASE_SETUP.md` - Detailed setup guide
- `IMPLEMENTATION_SUMMARY.md` - Technical implementation details
- `supabase-schema.sql` - Database schema

## 🎯 Key URLs

- **Supabase Dashboard:** https://app.supabase.com/project/rxsynwjpkkfuhrsrksjd
- **Local Dev:** http://localhost:3000
- **SQL Editor:** https://app.supabase.com/project/rxsynwjpkkfuhrsrksjd/sql

## 💡 Tips

- Always use admin account for faculty management
- Regular users can only create forum content
- Project submissions are public (no auth required)
- Check Supabase logs for debugging

## 🚨 Important Notes

1. **Run the SQL schema FIRST** - Nothing will work without it!
2. **Create admin user** - Faculty CRUD requires admin role
3. **Don't commit `.env.local`** - Already in .gitignore
4. **Test each feature** - Ensure everything works before deployment

## Need Help?

Check the detailed guides:
1. `SUPABASE_SETUP.md` for complete setup
2. `IMPLEMENTATION_SUMMARY.md` for technical details
3. Supabase docs: https://supabase.com/docs

---

**Ready to go! 🎉**

Run the schema → Create admin → Start testing!
