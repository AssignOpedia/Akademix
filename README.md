# Akademix

"Find Your Professor. Find Your Path." — a student education, coaching and academic
guidance platform built with React and Vite, with serverless API routes for authentication,
enquiries, and admin tools.

## Stack

- React 18 + Vite
- Redux Toolkit (countries, professors, subjects, universities, search, student journey)
- React Router
- Tailwind CSS
- lucide-react icons
- Vercel serverless functions, MongoDB (Mongoose), and Cloudinary for enquiry uploads

## Run it

```bash
npm install
npm run dev
```

`npm run dev` starts Vite for frontend-only work (usually at http://localhost:5173). To test
enquiry submissions and the API locally, first configure `.env.local` as described below, then
run `npm run dev:api` and open http://localhost:3000. Restart this server after changing
`.env.local`; the API process must load the Cloudinary variables before accepting uploads.

## Enquiry file uploads

Career-guidance enquiry forms accept PDF, DOC, and DOCX files up to 3 MB. The API uploads each
file to Cloudinary and stores its secure URL, Cloudinary public ID, filename, content type, and
size on the enquiry document in MongoDB. The admin enquiries page opens the stored file link;
the same URL is available in MongoDB Compass at `attachment.url` (and `cvUrl`).

Set the following server-side variables in `.env.local` for local development and in the Vercel
project environment for deployment. See `.env.example` for the names and expected formats:

- `MONGODB_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`

Keep these credentials private and do not expose them as `VITE_` variables.

## What's included

- Animated, clickable country ticker (10 countries) in the header
- Student journey stepper (Class 10 → Research)
- The core **Find Your Professor** flow: level → department → subject → country → recommended
  experts → confirmation
- Professor directory with filters, professor profile pages, and a "Select for Guidance" action
  wired into Redux
- Subject & department ecosystem, university directory, country landing pages
- Courses, Workshops, Mentoring, Career Guidance (interactive subject → career-path explorer)
- Global search across professors / subjects / universities / countries
- Responsive layout, mobile nav, footer with the full sitemap

## Scope notes

Many directory and discovery features use mock data. Enquiry submissions, authentication, and
admin operations use the API routes and configured database; demo professor and university
profiles remain clearly fictional.

To keep this a working, reviewable first build, a few of the brief's smaller sections (e.g. a
separate "Beyond Academics" grooming page, per-subject sub-pages beyond the subject grid, and a
few of the listed CTAs) were folded into existing pages rather than built as standalone routes.
The architecture (Redux slices, `src/data/`, routing) is set up so any of these can be extended
without restructuring.
