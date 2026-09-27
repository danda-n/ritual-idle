import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY, type TermId } from "../../content/glossary";
import { Modal } from "./Modal";

/**
 * A new word the game introduces (keepsake, omen, offering…): underlined, with a small "i", and a
 * click opens a short explanation (`iconOnly` shows just the "i", e.g. next to a place's title), the way an item chip opens its lookup. The dialog is portalled
 * to the page, so it works inside other dialogs too.
 */
export function Term({ id, children, iconOnly = false }: { id: TermId; children?: ReactNode; iconOnly?: boolean }) {
  const [open, setOpen] = useState(false);
  const def = GLOSSARY[id];
  return (
    <>
      <button
        type="button"
        className={`term ${iconOnly ? "term-only" : ""}`}
        aria-label={iconOnly ? `What's ${def.name.replace(/^The /, "the ")}?` : undefined}
        onClick={(e) => {
          // Inside a row or a <summary>, a term only explains: it doesn't start, open or fold anything.
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        title={`What's ${/^[aeiou]/i.test(def.name) ? "an" : "a"} ${def.name.toLowerCase()}?`}
      >
        {!iconOnly && (children ?? def.name.toLowerCase())}
        <svg className="term-i" viewBox="0 0 12 12" aria-hidden="true">
          <circle cx="6" cy="6" r="5.25" fill="none" stroke="currentColor" strokeWidth="1" />
          <path d="M6 5.2v3.6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
          <circle cx="6" cy="3.4" r="0.75" fill="currentColor" />
        </svg>
      </button>
      {open &&
        createPortal(
          <Modal title={def.name} onClose={() => setOpen(false)}>
            <p>{def.text}</p>
            <button className="btn btn-primary" onClick={() => setOpen(false)}>
              Got it
            </button>
          </Modal>,
          document.body,
        )}
    </>
  );
}
