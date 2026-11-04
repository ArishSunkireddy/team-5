// Presentation adapted from the Figma Make export; see docs/iambic-pentameter-skills-check.md.
export function CornerFlourish() {
  return (
    <svg className="corner-flourish" viewBox="0 0 84 84" aria-hidden="true">
      <path d="M7 77C17 54 33 33 77 7M9 57c15-1 25 5 30 17M28 36c13 0 21 5 27 15M50 20c8 2 13 7 15 15" />
    </svg>
  );
}

export function QuillMark() {
  return (
    <svg className="quill-mark" viewBox="0 0 42 42" aria-hidden="true">
      <path d="M34.5 4.8c-9 2-17.2 8.9-20.1 18.4l-2.8 9.1 7.4-5.8c7.7-6 13.5-13.1 15.5-21.7Z" />
      <path d="M7.5 37c5.8-9.1 12.6-17.1 21-24M15.4 25.2l-7.2.5M20.7 18.5l-.5-7.1" />
    </svg>
  );
}

export function TrailHeader({ onReturn }: { onReturn?: () => void }) {
  return (
    <header className="trail-header">
      {onReturn ? <button className="story-link" onClick={onReturn}>
        <span aria-hidden="true">‹</span> Return to Introduction
      </button> : <span />}
      <div className="trail-title">
        <QuillMark />
        <div>
          <span>THE POET&apos;S TRAIL</span>
          <small>Literary Expedition · Side Quest</small>
        </div>
      </div>
      <div className="chapter-marker">
        <span>CHAPTER IV</span>
        <small>THE VERSE ROAD</small>
      </div>
    </header>
  );
}

export function Progress({ active }: { active: number }) {
  return (
    <div className="progress" aria-label={`Step ${active} of 3`}>
      {['LEARN', 'BUILD', 'REFLECT'].map((label, index) => (
        <div className={`progress-step ${index + 1 <= active ? 'active' : ''}`} key={label}>
          <span>{index + 1}</span>
          <small>{label}</small>
        </div>
      ))}
    </div>
  );
}
