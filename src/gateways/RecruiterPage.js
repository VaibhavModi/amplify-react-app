import { createPortal } from 'react-dom';
import { useEffect, useMemo, useRef, useState } from 'react';

const focusAreas = [
  {
    id: 'frontend',
    label: 'Frontend dev',
    title: 'Frontend polish',
    body: 'I care about the last 10%: responsive layouts, motion, state flow, and interfaces that feel considered instead of assembled.',
  },
  {
    id: 'mobile',
    label: 'Mobile dev',
    title: 'Mobile instincts',
    body: 'I think in constraints: thumb reach, loading feel, scroll rhythm, and what survives when attention is fragmented.',
  },
  {
    id: 'fullstack',
    label: 'Full-stack',
    title: 'Full-stack range',
    body: 'I can move from product shape to API edges to deployment details without losing the through-line of the experience.',
  },
  {
    id: 'ships',
    label: 'Someone who ships',
    title: 'Bias to shipping',
    body: 'I like momentum. I prototype, tighten, and get things in front of people instead of letting them sit as good intentions.',
  },
  {
    id: 'independent',
    label: 'Independent builder',
    title: 'Solo execution',
    body: 'I have designed, built, and iterated projects end-to-end on my own, including product direction, implementation, and refinement.',
  },
  {
    id: 'team',
    label: 'Team player',
    title: 'Team fit',
    body: 'I enjoy being the person who reduces ambiguity, raises quality, and makes the rest of the team faster and calmer.',
  },
];

export default function RecruiterPage() {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedAreas, setSelectedAreas] = useState([]);
  const [zoneTwoSeen, setZoneTwoSeen] = useState(false);
  const [resumeFloating, setResumeFloating] = useState(false);
  const zoneTwoRef = useRef(null);
  const resumeZoneRef = useRef(null);
  const fileId = '1Np1j9jwn4O_rdu1i0X74qZV4i9pBFN_w';
  const resumeHref = `https://drive.google.com/file/d/${fileId}/view`;
  const embedSrc = `https://drive.google.com/file/d/${fileId}/preview`;
  const downloadHref = `https://drive.google.com/uc?export=download&id=${fileId}`;
  const modalRoot = typeof document !== 'undefined' ? document.querySelector('.site-shell') : null;

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    const zoneTwoNode = zoneTwoRef.current;
    const resumeZoneNode = resumeZoneRef.current;

    if (!zoneTwoNode || !resumeZoneNode || typeof IntersectionObserver === 'undefined') {
      return undefined;
    }

    const zoneTwoObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setZoneTwoSeen(true);
        }
      },
      { threshold: 0.35 }
    );

    const resumeObserver = new IntersectionObserver(
      ([entry]) => {
        setResumeFloating(!entry.isIntersecting && entry.boundingClientRect.top < 0);
      },
      { threshold: 0.2 }
    );

    zoneTwoObserver.observe(zoneTwoNode);
    resumeObserver.observe(resumeZoneNode);

    return () => {
      zoneTwoObserver.disconnect();
      resumeObserver.disconnect();
    };
  }, []);

  const selectedProofs = useMemo(
    () => focusAreas.filter((area) => selectedAreas.includes(area.id)),
    [selectedAreas]
  );

  const toggleArea = (areaId) => {
    setSelectedAreas((current) => (
      current.includes(areaId)
        ? current.filter((id) => id !== areaId)
        : [...current, areaId]
    ));
  };

  const resumeCard = (
    <ResumeCard
      downloadHref={downloadHref}
      onOpen={() => setIsOpen(true)}
    />
  );

  return (
    <>
      <div className="recruiter-page recruiter-story">
        <section className="story-zone story-zone--hook">
          <div className="story-hook-layout">
            <div className="story-hero-copy">
              <div className="story-meta-row" aria-label="Location and work preferences">
                <span className="story-meta-pill">Dallas, TX</span>
              </div>
              <p className="story-kicker">recent experience</p>
              <h1 className="story-headline">
                On AWS - ATX Refactor, I worked on modernizing millions of lines of code and improving performance at scale.
              </h1>
              <p className="story-line story-line--support">
                That meant transformation engines, caching, long-running transactions, and systems built for concurrent users.
              </p>
            </div>

            <div className="story-hook-signals" aria-label="Experience highlights">
              <article className="story-hook-signal">
                <p className="story-hook-value">10M+</p>
                <p className="story-hook-label">lines modernized</p>
              </article>
              <article className="story-hook-signal">
                <p className="story-hook-value">hours -> minutes</p>
                <p className="story-hook-label">transformation time reduced</p>
              </article>
              <article className="story-hook-signal">
                <p className="story-hook-value">AWS</p>
                <p className="story-hook-label">current lead role</p>
              </article>
              <article className="story-hook-signal">
                <p className="story-hook-value">60%</p>
                <p className="story-hook-label">faster code conversion</p>
              </article>
              <article className="story-hook-signal">
                <p className="story-hook-value">70%</p>
                <p className="story-hook-label">faster record processing</p>
              </article>
              <article className="story-hook-signal">
                <p className="story-hook-value">75%</p>
                <p className="story-hook-label">lower API latency</p>
              </article>
            </div>
          </div>
        </section>

        <section className="story-zone story-zone--conversation" ref={zoneTwoRef}>
          <div className="story-conversation-layout">
            <div className="story-conversation-copy">
              <h2 className="story-question">What are you looking for?</h2>
              <p className="story-helper">
                Pick what matters most, and I&apos;ll show the strongest examples behind it.
              </p>
              <p className="story-helper story-helper--count">
                There&apos;s more depth behind each one. Select any that apply — {selectedAreas.length} selected.
              </p>
            </div>

            <div className="story-conversation-stack">
              <div className="story-pill-grid" role="group" aria-label="What are you looking for">
                {focusAreas.map((area) => (
                  <button
                    key={area.id}
                    className={`story-pill${selectedAreas.includes(area.id) ? ' story-pill--active' : ''}`}
                    onClick={() => toggleArea(area.id)}
                    type="button"
                    aria-pressed={selectedAreas.includes(area.id)}
                  >
                    {area.label}
                  </button>
                ))}
              </div>

              <div className={`proof-grid${selectedProofs.length ? ' proof-grid--visible' : ''}`}>
                {selectedProofs.map((proof) => (
                  <article key={proof.id} className="proof-card">
                    <p className="proof-card__title">{proof.title}</p>
                    <p className="proof-card__body">{proof.body}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section
          className={`story-zone story-zone--resume${zoneTwoSeen ? ' story-zone--resume-visible' : ''}`}
          ref={resumeZoneRef}
        >
          <div className="story-resume-layout">
            <div className="story-resume-copyblock">
              <p className="story-kicker">formal version</p>
              <p className="story-resume-copy">Like what you see?</p>
              <p className="story-resume-subcopy">
                Here&apos;s the resume if you want the concise, credentialed version.
              </p>
            </div>
            <div className="story-resume-card">{resumeCard}</div>
          </div>
        </section>
      </div>

      {resumeFloating && (
        <div className="resume-float-dock" aria-label="Floating resume shortcut">
          <div className="resume-float-dock__inner">
            {resumeCard}
          </div>
        </div>
      )}

      {isOpen && modalRoot && createPortal(
        <div className="resume-modal" role="dialog" aria-modal="true" aria-label="Resume preview">
          <button
            className="resume-modal__backdrop"
            type="button"
            aria-label="Close resume preview"
            onClick={() => setIsOpen(false)}
          />

          <div className="resume-modal__sheet">
            <div className="resume-modal__topbar">
              <a className="resume-modal__link" href={downloadHref} target="_blank" rel="noreferrer">
                Download Resume
              </a>
              <a className="resume-modal__link" href={resumeHref} target="_blank" rel="noreferrer">
                Open in new tab
              </a>
              <button
                className="resume-modal__close"
                type="button"
                aria-label="Close resume preview"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>

            <div className="resume-modal__viewer">
              <iframe
                src={embedSrc}
                title="Vaibhav Modi resume"
                width="100%"
                height="100%"
                frameBorder="0"
                scrolling="no"
              />
            </div>
          </div>
        </div>,
        modalRoot
      )}
    </>
  );
}

function ResumeCard({ downloadHref, onOpen }) {
  return (
    <div
      className="resume-card-wrap"
      role="button"
      tabIndex={0}
      aria-label="Resume paper"
      onClick={onOpen}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          onOpen();
        }
      }}
    >
      <article className="doc desk-doc">
        <span className="clip" aria-hidden="true" />
        <a
          className="dl-arrow dl-arrow-button"
          href={downloadHref}
          target="_blank"
          rel="noreferrer"
          aria-label="Download resume"
          onClick={(event) => {
            event.stopPropagation();
          }}
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M6 1.5V7.2" stroke="#6b6257" strokeWidth="1.1" strokeLinecap="round" />
            <path d="M3.8 5.5L6 7.7L8.2 5.5" stroke="#6b6257" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M2.5 9.5H9.5" stroke="#6b6257" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
        </a>

        <header>
          <p className="doc-name">Vaibhav Modi</p>
          <p className="doc-role">Lead Software Engineer</p>
          <p className="doc-sections">Experience / Projects / Skills / Contact</p>
        </header>

        <div className="doc-lines" aria-hidden="true">
          <span className="doc-line" style={{ width: '76%' }} />
          <span className="doc-line" style={{ width: '88%' }} />
          <span className="doc-line" style={{ width: '68%' }} />
          <span className="doc-line doc-sep" style={{ width: '100%' }} />
          <span className="doc-line" style={{ width: '92%' }} />
          <span className="doc-line" style={{ width: '64%' }} />
          <span className="doc-line" style={{ width: '84%' }} />
          <span className="doc-line doc-sep" style={{ width: '100%' }} />
          <span className="doc-line" style={{ width: '72%' }} />
          <span className="doc-line" style={{ width: '90%' }} />
          <span className="doc-line" style={{ width: '58%' }} />
          <span className="doc-line" style={{ width: '81%' }} />
        </div>

        <footer className="doc-footer">
          <span className="doc-contact">hello@vaibhavmodi.com</span>
          <span className="doc-pdf">PDF</span>
        </footer>
      </article>

      <span className="resume-card__cta" aria-hidden="true">
        <span>click to open resume</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 7H10.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
          <path d="M8.5 5L10.5 7L8.5 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      <span className="coffee-ring" aria-hidden="true" />
    </div>
  );
}
