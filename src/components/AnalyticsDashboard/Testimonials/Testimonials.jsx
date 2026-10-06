import { useEffect, useRef, useState } from 'react';
import { Star } from 'lucide-react';

/* ============================================================
   SAMPLE INTERNATIONAL TESTIMONIALS
   Replace these with verified student feedback before publishing.
   ============================================================ */

const TESTIMONIALS = [
  {
    name: 'Emma W.',
    role: 'Undergraduate, Computer Science',
    tag: 'Computer Science',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/68.jpg',
    text: 'My professor explained algorithms in a way my lectures never did. I finally understand what I am studying.',
  },
  {
    name: 'Daniel R.',
    role: "Master's applicant",
    tag: 'Mentoring',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/75.jpg',
    text: 'My mentor helped me compare universities and plan my application timeline. I stopped feeling lost.',
  },
  {
    name: 'Sofia M.',
    role: 'A-Level student',
    tag: 'Exam Preparation',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/women/44.jpg',
    text: 'Weekly one-to-one sessions kept me on track. My mock grades improved and so did my confidence.',
  },
  {
    name: 'Oliver H.',
    role: 'PhD researcher',
    tag: 'Research Support',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/32.jpg',
    text: 'Feedback on my research direction saved me weeks. Clear, honest, and respectful of my own work.',
  },
  {
    name: 'Clara S.',
    role: 'IB student',
    tag: 'Assignment Guidance',
    rating: 4,
    image: 'https://randomuser.me/api/portraits/women/21.jpg',
    text: 'I learned how to plan and structure my own essays instead of being handed answers. That is what I needed.',
  },
  {
    name: 'Lucas T.',
    role: 'Final-year student',
    tag: 'Career Guidance',
    rating: 5,
    image: 'https://randomuser.me/api/portraits/men/46.jpg',
    text: 'Career guidance connected my subject to paths I had not even considered. I now have a real plan.',
  },
];

const REVIEW_STORAGE_KEY = 'akademix-student-reviews';

function readSavedReviews() {
  try {
    const saved = JSON.parse(localStorage.getItem(REVIEW_STORAGE_KEY) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}


function useInView(threshold = 0.4) {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;

    if (!el) return;

    const io = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { threshold }
    );

    io.observe(el);

    return () => io.disconnect();
  }, [threshold]);

  return [ref, inView];
}

/* ============================================================
   COUNT UP ANIMATION
   ============================================================ */

function CountUp({
  to,
  active,
  decimals = 1,
  duration = 1700,
}) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) {
      setValue(0);
      return;
    }

    if (
      window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      ).matches
    ) {
      setValue(to);
      return;
    }

    let raf;

    const startTime = performance.now();

    const tick = (now) => {
      const progress = Math.min(
        (now - startTime) / duration,
        1
      );

      const eased =
        1 - Math.pow(1 - progress, 3);

      setValue(to * eased);

      if (progress < 1) {
        raf = requestAnimationFrame(tick);
      }
    };

    raf = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(raf);
  }, [active, to, duration]);

  return <>{value.toFixed(decimals)}</>;
}

/* ============================================================
   STAR RATING
   ============================================================ */

function Stars({ count, className = '' }) {
  return (
    <div
      className={`flex gap-0.5 ${className}`}
      aria-label={`${count} out of 5 stars`}
    >
      {[0, 1, 2, 3, 4].map((index) => (
        <Star
          key={index}
          className={`w-4 h-4 ${
            index < count
              ? 'fill-amber-500 text-amber-500'
              : 'text-stone-300'
          }`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

/* ============================================================
   REVIEW CARD
   ============================================================ */

function ReviewCard({ testimonial }) {
  return (
    <figure className="ts-card">

      {/* Rating */}
      <Stars count={testimonial.rating} />

      {/* Testimonial */}
      <blockquote className="mt-4 mb-5 text-[15px] leading-relaxed text-slate-800 font-medium">
        “{testimonial.text}”
      </blockquote>

      {/* Student information */}
      <figcaption className="flex items-center gap-3">

        {/* Profile Picture */}
        {testimonial.image ? (
          <img
            src={testimonial.image}
            alt={`${testimonial.name} profile`}
            className="ts-avatar object-cover"
            loading="lazy"
            width="44"
            height="44"
          />
        ) : (
          <span
            className="ts-avatar flex items-center justify-center bg-amber-100 text-sm font-bold text-amber-900"
            role="img"
            aria-label={`${testimonial.name} initials`}
          >
            {testimonial.name.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
          </span>
        )}

        {/* Name + Role */}
        <span className="min-w-0">
          <span className="block text-sm font-bold text-slate-900 truncate">
            {testimonial.name}
          </span>

          <span className="block text-xs text-slate-600 truncate">
            {testimonial.role}
          </span>
        </span>

        {/* Category */}
        <span className="ml-auto shrink-0 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-[11px] font-bold text-amber-800">
          {testimonial.tag}
        </span>

      </figcaption>
    </figure>
  );
}

/* ============================================================
   INFINITE TESTIMONIAL ROW
   ============================================================ */

function Row({ items, reverse = false }) {
  /*
    The list is duplicated so the marquee can loop seamlessly.
    The duplicate copy is hidden from screen readers.
  */

  return (
    <div className="ts-row">

      <div
        className={`ts-track ${
          reverse ? 'rev' : ''
        }`}
      >

        {items.map((testimonial, index) => (
          <ReviewCard
            key={`a-${index}`}
            testimonial={testimonial}
          />
        ))}

        {/* Duplicate for seamless animation */}
        <div
          className="contents"
          aria-hidden="true"
        >
          {items.map((testimonial, index) => (
            <ReviewCard
              key={`b-${index}`}
              testimonial={testimonial}
            />
          ))}
        </div>

      </div>
    </div>
  );
}

/* ============================================================
   MAIN TESTIMONIAL COMPONENT
   ============================================================ */

export default function Testimonials() {

  const [topRef, topInView] = useInView(0.4);
  const [submittedReviews, setSubmittedReviews] = useState(readSavedReviews);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewMessage, setReviewMessage] = useState('');

  const displayedTestimonials = [
    ...submittedReviews,
    ...TESTIMONIALS.slice(submittedReviews.length),
  ];

  function handleReviewSubmit(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const review = {
      name: String(form.get('name') || '').trim(),
      role: String(form.get('role') || '').trim(),
      tag: String(form.get('tag') || '').trim(),
      rating: Number(form.get('rating')),
      text: String(form.get('text') || '').trim(),
      image: '',
    };

    const updated = [...submittedReviews, review].slice(-TESTIMONIALS.length);
    setSubmittedReviews(updated);
    try {
      localStorage.setItem(REVIEW_STORAGE_KEY, JSON.stringify(updated));
      setReviewMessage('Thanks! Your review now appears in place of a sample review on this device.');
    } catch {
      setReviewMessage('Your review was added for this session, but could not be saved on this device.');
    }
    event.currentTarget.reset();
    setShowReviewForm(false);
  }

  /* Calculate average rating automatically */
  const average =
    displayedTestimonials.reduce(
      (sum, testimonial) =>
        sum + testimonial.rating,
      0
    ) / displayedTestimonials.length;

  const rounded = Math.round(average);

  const rowA = displayedTestimonials;

  const rowB = [
    ...displayedTestimonials,
  ].reverse();

  return (
    <section
      className="
        relative
        z-10
        py-24
        border-t
        border-stone-300/60
        bg-white/40
        backdrop-blur-xl
        overflow-hidden
      "
    >

      {/* =====================================================
          CUSTOM TESTIMONIAL STYLES
          ===================================================== */}

      <style>{`

        /* ---------------------------------------------
           Marquee container
        --------------------------------------------- */

        .ts-row {
          overflow: hidden;

          -webkit-mask:
            linear-gradient(
              90deg,
              transparent,
              #000 8%,
              #000 92%,
              transparent
            );

          mask:
            linear-gradient(
              90deg,
              transparent,
              #000 8%,
              #000 92%,
              transparent
            );
        }


        /* ---------------------------------------------
           Space between rows
        --------------------------------------------- */

        .ts-row + .ts-row {
          margin-top: 20px;
        }


        /* ---------------------------------------------
           Moving track
        --------------------------------------------- */

        .ts-track {
          display: flex;
          width: max-content;
          padding: 12px 0;

          animation:
            tsMarquee
            55s
            linear
            infinite;
        }


        /* ---------------------------------------------
           Reverse row
        --------------------------------------------- */

        .ts-track.rev {
          animation-direction: reverse;
          animation-duration: 65s;
        }


        /* ---------------------------------------------
           Pause when hovering
        --------------------------------------------- */

        .ts-row:hover .ts-track {
          animation-play-state: paused;
        }


        /* ---------------------------------------------
           Marquee animation
        --------------------------------------------- */

        @keyframes tsMarquee {
          to {
            transform: translateX(-50%);
          }
        }


        /* ---------------------------------------------
           Testimonial card
        --------------------------------------------- */

        .ts-card {
          width: 340px;
          flex: none;

          margin: 0 20px 0 0;

          padding: 1.5rem;

          border-radius: 1.5rem;

          border:
            1px solid
            rgba(253, 230, 138, 0.7);

          background:
            linear-gradient(
              135deg,
              rgba(255, 255, 255, 0.95),
              rgba(255, 251, 235, 0.85) 50%,
              rgba(255, 241, 242, 0.75)
            );

          box-shadow:
            0 16px 36px
            rgba(168, 162, 158, 0.22);

          transition:
            transform 0.3s ease,
            box-shadow 0.3s ease,
            border-color 0.3s ease;
        }


        /* ---------------------------------------------
           Card hover
        --------------------------------------------- */

        .ts-card:hover {
          transform:
            translateY(-8px)
            scale(1.03);

          border-color:
            rgba(251, 191, 36, 0.8);

          box-shadow:
            0 22px 48px
            rgba(217, 119, 6, 0.2);
        }


        /* ---------------------------------------------
           Student profile picture
        --------------------------------------------- */

        .ts-avatar {
          width: 44px;
          height: 44px;

          border-radius: 50%;

          flex: none;

          display: block;

          object-fit: cover;

          border:
            2px solid
            rgba(251, 191, 36, 0.35);

          box-shadow:
            0 4px 12px
            rgba(15, 23, 42, 0.15);

          background:
            linear-gradient(
              135deg,
              #f59e0b,
              #be123c
            );

          transition:
            transform 0.3s ease,
            border-color 0.3s ease;
        }


        /* ---------------------------------------------
           Profile picture hover
        --------------------------------------------- */

        .ts-card:hover .ts-avatar {
          transform: scale(1.08);

          border-color:
            rgba(251, 191, 36, 0.9);
        }


        /* ---------------------------------------------
           Rating star animation
        --------------------------------------------- */

        .ts-star {
          display: inline-flex;
          opacity: 0;
        }


        .ts-top.in .ts-star {
          animation:
            tsPop
            0.6s
            calc(var(--k) * 0.14s)
            both;
        }


        @keyframes tsPop {

          0% {
            opacity: 0;
            transform:
              scale(0)
              rotate(-90deg);
          }

          70% {
            transform:
              scale(1.4);
          }

          100% {
            opacity: 1;
            transform: none;
          }

        }


        /* ---------------------------------------------
           Mobile
        --------------------------------------------- */

        @media (max-width: 820px) {

          .ts-card {
            width: 280px;
          }

        }


        /* ---------------------------------------------
           Reduced motion accessibility
        --------------------------------------------- */

        @media (prefers-reduced-motion: reduce) {

          .ts-track {
            animation: none !important;
          }

          .ts-row {
            overflow-x: auto;

            -webkit-mask: none;
            mask: none;
          }

          .ts-top .ts-star {
            opacity: 1;
            animation: none !important;
          }

        }

      `}</style>


      {/* =====================================================
          CONTENT CONTAINER
          ===================================================== */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* ===================================================
            SECTION TITLE
            =================================================== */}

        <div className="max-w-3xl mb-10">

          <span
            className="
              text-3xl
              sm:text-4xl
              uppercase
              tracking-wide
              text-orange-500
              font-extrabold
              mb-4
              block
            "
          >
            Student Stories
          </span>

          <p className="text-slate-600 text-black text-base sm:text-lg max-w-2xl">
            Real learning journeys, academic guidance,
            mentoring and experiences from students.
          </p>

        </div>


        {/* ===================================================
            RATING SUMMARY
            =================================================== */}

        <div
          ref={topRef}
          className={`
            ts-top
            ${topInView ? 'in' : ''}
            flex
            flex-wrap
            items-center
            gap-5
            mb-10
          `}
        >

          {/* Animated rating */}
          <div
            className="
              font-serif
              text-6xl
              sm:text-7xl
              leading-none
              text-slate-900
            "
          >
            <CountUp
              to={average}
              active={topInView}
            />
          </div>


          {/* Stars + review count */}
          <div>

            <div
              className="flex gap-1"
              aria-label={`Average rating ${average.toFixed(
                1
              )} out of 5`}
            >

              {[0, 1, 2, 3, 4].map(
                (index) => (
                  <span
                    key={index}
                    className="ts-star"
                    style={{
                      '--k': index,
                    }}
                  >
                    <Star
                      className={`
                        w-7
                        h-7
                        ${
                          index < rounded
                            ? 'fill-amber-500 text-amber-500'
                            : 'text-stone-300'
                        }
                      `}
                      aria-hidden="true"
                    />
                  </span>
                )
              )}

            </div>

            <p className="mt-1 text-sm font-semibold text-slate-700">
              Average from {displayedTestimonials.length} student reviews
            </p>

          </div>

        </div>

        <div className="mb-10">
          {!showReviewForm ? (
            <button
              type="button"
              onClick={() => { setShowReviewForm(true); setReviewMessage(''); }}
              className="rounded-full bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
            >
              Share your review
            </button>
          ) : (
            <form onSubmit={handleReviewSubmit} className="grid max-w-2xl gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm sm:grid-cols-2">
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Name
                <input name="name" required maxLength="60" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Role or study level
                <input name="role" required maxLength="80" placeholder="e.g. Undergraduate student" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Topic
                <input name="tag" required maxLength="40" placeholder="e.g. Mentoring" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" />
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700">
                Rating
                <select name="rating" required defaultValue="5" className="rounded-lg border border-stone-300 px-3 py-2 font-normal">
                  {[5, 4, 3, 2, 1].map((rating) => <option key={rating} value={rating}>{rating} {rating === 1 ? 'star' : 'stars'}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-sm font-semibold text-slate-700 sm:col-span-2">
                Your review
                <textarea name="text" required minLength="10" maxLength="500" rows="4" className="rounded-lg border border-stone-300 px-3 py-2 font-normal" />
              </label>
              <p className="text-xs text-slate-500 sm:col-span-2">Reviews are saved only in this browser and replace sample reviews here. They are not sent to Akademix.</p>
              <div className="flex gap-3 sm:col-span-2">
                <button type="submit" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700">Add review</button>
                <button type="button" onClick={() => setShowReviewForm(false)} className="rounded-full border border-stone-300 px-5 py-2.5 text-sm font-semibold text-slate-700">Cancel</button>
              </div>
            </form>
          )}
          {reviewMessage && <p role="status" className="mt-3 text-sm text-slate-600">{reviewMessage}</p>}
        </div>

      </div>


      {/* =====================================================
          TESTIMONIAL MARQUEE ROWS
          ===================================================== */}

      <Row items={rowA} />

      <Row
        items={rowB}
        reverse
      />

    </section>
  );
}
