# Admin Dashboard - Dynamic Data Integration

## What Was Updated

The admin analytics dashboard has been transformed from static mock data to **dynamic real-time data** fetched from Supabase.

## Files Created/Modified

### 1. Created: `lib/services/analytics.service.ts`
New service layer for fetching analytics data from Supabase:

**Functions:**
- `getOverview()` - Fetches overall statistics (faculty count, views, contacts, submissions, forum stats)
- `getFacultyAnalytics()` - Gets per-faculty analytics (views, contact clicks, project views)
- `getDepartmentStats()` - Aggregates data by department
- `getContactMessagesCount()` - Gets total and unread contact messages
- `getProjectSubmissionsByStatus()` - Counts project submissions by status

### 2. Modified: `app/admin/analytics/page.tsx`
Updated to use real data instead of mock data:

**Changes:**
- Added imports for `analyticsService` and types
- Added state management for all analytics data
- Implemented `useEffect` to load data on component mount
- Updated all statistics cards with real data
- Added loading states
- Updated faculty performance list with real data
- Updated department charts with real database stats
- Replaced trends tab with forum & engagement stats

## Dashboard Sections Now Show

### Overview Cards (Top Row)
1. **Total Faculty** - Real count from `faculty` table
2. **Total Profile Views** - Sum of all faculty profile views
3. **Contact Messages** - Total messages + unread count
4. **Project Submissions** - Total from `project_submissions` table

### Tabs

#### 1. Overview Tab
- **Department Distribution Chart** (Pie Chart)
  - Shows profile views by department
  - Auto-colored with dynamic color palette
  - Based on real `faculty` analytics data

#### 2. Faculty Performance Tab
- Lists all faculty members sorted by profile views
- Shows for each faculty:
  - Name and department
  - Profile views count
  - Contact clicks count
  - Project views count
  - Last updated date

#### 3. Departments Tab
- **Bar Chart** showing profile views by department
- Uses real aggregated data from faculty table

#### 4. Trends Tab (Now: Forum & Engagement)
- **Forum Topics** - Total discussion count
- **Forum Replies** - Total responses count
- **Engagement Rate** - Replies per topic percentage

## Data Flow

```
Supabase Database
       ↓
analytics.service.ts (Service Layer)
       ↓
Admin Dashboard (React State)
       ↓
UI Components (Cards, Charts)
```

## Key Features

✅ **Real-time Data** - All numbers come from actual database  
✅ **Loading States** - Shows "..." while fetching data  
✅ **Empty States** - Handles no data gracefully  
✅ **Auto-refresh** - Reloads when component mounts  
✅ **Type-safe** - Full TypeScript integration  
✅ **Error Handling** - Catches and logs errors  

## What Each Metric Tracks

| Metric | Source | Calculation |
|--------|--------|-------------|
| Total Faculty | `faculty` table | COUNT(*) |
| Total Views | `faculty.analytics.profile_views` | SUM(profile_views) |
| Contact Messages | `contact_messages` table | COUNT(*), WHERE status='unread' |
| Project Submissions | `project_submissions` table | COUNT(*) |
| Forum Topics | `forum_topics` table | COUNT(*) |
| Forum Replies | `forum_replies` table | COUNT(*) |
| Department Stats | `faculty` grouped by `department` | SUM(analytics.profile_views) GROUP BY department |

## Testing the Dashboard

1. **Access the dashboard:**
   - Log in as admin
   - Go to `/admin/analytics`

2. **Verify data loads:**
   - Check all numbers are not "..."
   - Verify charts populate
   - Confirm faculty list shows

3. **Test different scenarios:**
   - With no faculty → should show 0
   - With no forum topics → should show 0
   - With data → should show real numbers

## Future Enhancements (Optional)

- Add time range filtering (last 7 days, 30 days, etc.)
- Export data to CSV/PDF
- Real-time updates with Supabase subscriptions
- Monthly trends chart (requires storing historical data)
- Comparative analytics (month-over-month growth)
- Faculty ranking by engagement
- Department performance comparison

## Dependencies

- Supabase client (`lib/supabase.ts`)
- Faculty table with `analytics` JSONB field
- Contact messages table
- Project submissions table
- Forum topics and replies tables

## Notes

- Analytics data updates whenever faculty profiles are updated
- All calculations happen server-side in Supabase
- Charts use recharts library (already installed)
- Admin access required (checked via `useAuth`)
