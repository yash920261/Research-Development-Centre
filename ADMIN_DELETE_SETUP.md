# Admin Forum Delete - Quick Setup Guide

## ✅ What Was Implemented

Admins can now delete any forum discussion with these features:
- **Delete button** on forum list (trash icon)
- **Delete button** on topic detail page
- **Confirmation dialog** to prevent accidents
- **Cascade deletion** removes all replies and likes
- **Auto-refresh** after deletion
- **Database-level security** with RLS policies

---

## 🚀 Setup Steps (Required)

### Step 1: Run the SQL Script

1. Open your **Supabase Dashboard**: https://tvbgytfvkayvghomzuzb.supabase.co
2. Click **SQL Editor** in the left sidebar
3. Click **"New query"**
4. Open the file: `setup-forum-delete-permissions.sql`
5. Copy **ALL** the content
6. Paste into Supabase SQL Editor
7. Click **"Run"** (or press Ctrl+Enter)
8. Wait for success message with ✅ checkmarks

### Step 2: Test the Feature

1. **Log in as admin** on your website
2. Go to **Forum** page (`/forum`)
3. You should see a **trash icon** (🗑️) next to each discussion
4. Click it and confirm deletion
5. The discussion should be deleted immediately

---

## 📋 Where to Find the Delete Button

### Location 1: Forum List (`/forum`)
- Trash icon appears to the right of each topic
- Only visible if logged in as admin

### Location 2: Topic Detail Page (`/forum/topic/[id]`)
- "Delete Discussion" button at the top right
- Only visible if logged in as admin

---

## 🔐 Security

### Who Can Delete?
- **Admin only** ✅
- Students cannot see the delete button
- Database blocks non-admin deletion attempts

### What Gets Deleted?
When you delete a topic:
1. ✅ The topic itself
2. ✅ All replies to that topic
3. ✅ All likes on the topic and replies
4. ✅ No orphaned data remains

---

## 🧪 Testing Checklist

After running the SQL script, verify:

**As Admin:**
- [ ] Delete button visible on forum list
- [ ] Delete button visible on topic detail page
- [ ] Clicking delete opens confirmation dialog
- [ ] Confirming deletion removes the topic
- [ ] Success toast notification appears
- [ ] Page refreshes / redirects properly

**As Student:**
- [ ] Delete button NOT visible anywhere
- [ ] Cannot delete via browser console

---

## ❌ Troubleshooting

### Problem: Delete button not showing

**Solution:**
1. Make sure you're logged in as admin
2. Check your role in Supabase:
   ```sql
   SELECT email, role FROM profiles WHERE email = 'your-email@example.com';
   ```
3. If role is not 'admin', update it:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE email = 'your-email@example.com';
   ```

### Problem: "Failed to delete discussion" error

**Solution:**
1. Make sure you ran the SQL script: `setup-forum-delete-permissions.sql`
2. Check Supabase logs for detailed error
3. Verify DELETE policy exists:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'forum_topics' AND cmd = 'DELETE';
   ```

---

## 📁 Files Modified

1. **`lib/services/forum.service.ts`** - Added `deleteTopic()` method
2. **`components/forum-topic-list.tsx`** - Added delete button and dialog
3. **`app/forum/topic/[id]/page.tsx`** - Added delete button and dialog
4. **`app/forum/page.tsx`** - Added refresh callback

---

## 📖 Full Documentation

For detailed documentation, see: [`FORUM_DELETE_FEATURE.md`](./FORUM_DELETE_FEATURE.md)

---

## ✨ Summary

Your admin users can now delete forum discussions with full cascade deletion and proper security. Just run the SQL script and you're ready to go! 🎉
