# Contact Form - Supabase Integration

## ✅ What Was Done

Your "Get in Touch" contact form has been updated to store submissions in Supabase.

---

## 📋 Setup Steps

### Step 1: Create Database Table

Run this SQL in your Supabase SQL Editor:

```sql
-- Create contact_messages table
CREATE TABLE IF NOT EXISTS public.contact_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    inquiry_type TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'unread' CHECK (status IN ('unread', 'read', 'replied', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;

-- Allow anyone to submit contact forms
CREATE POLICY "allow_public_insert_contact"
    ON public.contact_messages
    FOR INSERT
    TO public
    WITH CHECK (true);

-- Only admins can view messages
CREATE POLICY "allow_admin_select_contact"
    ON public.contact_messages
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Only admins can update status
CREATE POLICY "allow_admin_update_contact"
    ON public.contact_messages
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- Grant permissions
GRANT INSERT ON public.contact_messages TO anon;
GRANT INSERT ON public.contact_messages TO authenticated;
GRANT SELECT, UPDATE ON public.contact_messages TO authenticated;

-- Auto-update timestamp
CREATE TRIGGER update_contact_messages_updated_at 
    BEFORE UPDATE ON public.contact_messages
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Create indexes
CREATE INDEX idx_contact_messages_email ON public.contact_messages(email);
CREATE INDEX idx_contact_messages_status ON public.contact_messages(status);
CREATE INDEX idx_contact_messages_created_at ON public.contact_messages(created_at DESC);
```

### Step 2: Files Updated

✅ **Created:**
- `lib/services/contact.service.ts` - Contact message service

✅ **Updated:**
- `components/contact-form.tsx` - Now saves to Supabase

---

## 🎯 How It Works

### Data Flow

```
User fills form
    ↓
Clicks "Send Message"
    ↓
contactService.submit()
    ↓
Saves to Supabase contact_messages table
    ↓
Success message shown
```

### Data Stored

Each submission includes:
- **name** - User's name
- **email** - User's email
- **inquiry_type** - Type of inquiry (general, project, mentorship, etc.)
- **message** - The actual message
- **status** - Default: 'unread' (can be: unread, read, replied, archived)
- **created_at** - Timestamp
- **updated_at** - Auto-updated timestamp

---

## 📊 Viewing Contact Messages

### For Admins

1. Go to Supabase Dashboard → **Table Editor**
2. Select `contact_messages` table
3. You'll see all submissions

### Via API (Future Enhancement)

Create an admin dashboard to:
- View all messages
- Mark as read/replied
- Filter by status
- Search by email/name

---

## 🔐 Security

- **RLS Enabled:** Only admins can view messages
- **Public Insert:** Anyone can submit (no auth required)
- **Status Updates:** Only admins can update message status
- **Data Privacy:** User messages are only visible to admins

---

## 🧪 Testing

1. Go to your website
2. Scroll to "Get in Touch" section
3. Fill out the form
4. Click "Send Message"
5. Check browser console for:
   - 🚀 Starting contact form submission...
   - 📋 Form data: {...}
   - 📥 Supabase response: {...}
   - ✅ Contact message sent successfully!
6. Verify in Supabase Table Editor

---

## 📧 Email Notifications (Optional)

To get email notifications when someone submits:

1. Enable Supabase Database Webhooks
2. Configure webhook to send to your email service
3. Or use Supabase Edge Functions to send emails

---

## 🎨 Admin Dashboard (Future)

You can create an admin page to manage messages:

```typescript
// Example: app/admin/messages/page.tsx
import { contactService } from '@/lib/services/contact.service'

async function MessagesPage() {
  const { data: messages } = await contactService.getAll()
  
  return (
    <div>
      {messages?.map(msg => (
        <div key={msg.id}>
          <h3>{msg.name}</h3>
          <p>{msg.message}</p>
          <span>Status: {msg.status}</span>
        </div>
      ))}
    </div>
  )
}
```

---

## ✅ Success Indicators

After running the SQL, you should see:

- ✅ `contact_messages` table in Table Editor
- ✅ Form submits without hanging
- ✅ Success message appears
- ✅ Data appears in Supabase table
- ✅ Console shows ✅ success emoji

---

## 🐛 Troubleshooting

**Issue: Form still hanging**
- Solution: Run the SQL to create the table

**Issue: "Permission denied"**
- Solution: Check RLS policies are created

**Issue: "Table doesn't exist"**
- Solution: Verify you ran the SQL in correct Supabase project

---

## 📝 Next Steps

1. Run the SQL to create `contact_messages` table
2. Test the contact form
3. Verify data in Supabase
4. (Optional) Create admin dashboard to manage messages
5. (Optional) Set up email notifications

---

**Your contact form is now connected to Supabase!** 🎉
