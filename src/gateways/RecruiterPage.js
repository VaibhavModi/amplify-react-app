import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

export default function RecruiterPage() {
  const [isOpen, setIsOpen] = useState(false);
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

  return (
    <>
      <div className="recruiter-page">
        <div className="desktop-frame" aria-label="Resume paper preview">
          <div
            className="desk-doc-wrap"
            role="button"
            tabIndex={0}
            aria-label="Resume paper"
            onClick={() => setIsOpen(true)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                setIsOpen(true);
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

            <span className="desk-hover-cta" aria-hidden="true">
              <span>Click to view Resume</span>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M3 7H10.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
                <path d="M8.5 5L10.5 7L8.5 9" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="mob-tap-hint" aria-hidden="true">Tap to view</span>
            <span className="coffee-ring" aria-hidden="true" />
          </div>
        </div>
      </div>

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
