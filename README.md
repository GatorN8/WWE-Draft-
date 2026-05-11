# WWE Fantasy Live Expected Shows Update

No-login Supabase app.

## New in this update
- Weekly setup lets you pick which roster members you expect to appear.
- Expected picks have a role and confidence.
- Expected picks lock 4 hours before showtime ET.
- Finalizing a show gives extra planning bonus and TKO stock based on your expected talent.
- News & Rumors page has a live source check.
- More roster members added to seed.sql.
- Source links expanded.

## Important
The app can check live source pages, but it should not blindly auto-score from websites. The best fantasy flow is:
1. App checks sources.
2. Commissioner reviews Raw/SmackDown/PLE results.
3. Commissioner confirms appearances, promos, matches, wins, titles, and reaction bonuses.
4. Scores finalize.

## Setup
Run the updated `supabase/schema.sql`, then run updated `supabase/seed.sql`.