import { useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { GLOSSARY, type TermId } from "../../content/glossary";
import { Modal } from "./Modal";

/**
 * A new word the game introduces (keepsake, omen, offering…): underlined, with a small "i", and a
 * click opens a short explanation, the way an item chip opens its lookup. The dialog is portalled
 * to the page, so it works inside other dialogs too.
 */
export function Term({ id, children }: { id: TermId; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const def = GLOSSARY[id];
  return (
    <>
      <button
        type="button"
        className="term"
        onClick={(e) => {
          e.stopPropagation();
          setOpen(true);
        }}
        title={`What's ${/^[aeiou]/i.test(def.name) ? "an" : "a"} ${def.name.toLowerCase()}?`}
      >
        {children ?? def.name.toLowerCase()}
        <span className="term-i" aria-hidden="true">
          i
        </span>
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
