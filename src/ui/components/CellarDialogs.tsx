import type { ReactNode } from "react";
import { GIFTS } from "../../content/combat";
import { READINESS } from "../../engine/combat";
import { CellarIcon } from "../art/cellarIcons";
import { SigilIcon, MoonIcon } from "../art/icons";
import { FOE_ART, READY } from "../cellar";
import { Modal, modalHeadingId } from "./Modal";

// The cellar's two big moments (docs/COMBAT.md §10; the handoff's intro and calmed dialogs).
// Everything here explains a mechanic, so it's written in plain sentences.

const INTRO = "Going down";

/** The introduction: shown when the cellar opens, and again from "How it works" and the Guide. */
export function CellarIntro({ onClose }: { onClose: () => void }) {
  const sec = (icon: ReactNode, title: string, text: ReactNode, extra?: ReactNode) => (
    <section className="intro-sec">
      <span className="n" aria-hidden="true">
        {icon}
      </span>
      <h3>{title}</h3>
      <div>
        <p>{text}</p>
        {extra}
      </div>
    </section>
  );
  const tags = (
    <div className="inline-tags">
      {[...READINESS].reverse().map((t) => (
        <span key={t} className="ready" data-r={READY[t].key}>
          <span className="pips" aria-hidden="true">
            {[0, 1, 2, 3].map((i) => (
              <i key={i} className={i < READY[t].pips ? "on" : ""} />
            ))}
          </span>
          {t}
        </span>
      ))}
    </div>
  );
  return (
    <Modal title={INTRO} onClose={onClose} headless className="vellum">
      <div className="intro-head">
        <div className="intro-faces" aria-hidden="true">
          {(["skrzat", "kikimora", "zmora", "domovoi"] as const).map((id) => (
            <span key={id} className="portrait" style={{ ["--s" as string]: "56px" }}>
              <img src={FOE_ART[id].icon} alt="" />
            </span>
          ))}
        </div>
        <span className="label">The cellar is open</span>
        <h2 id={modalHeadingId(INTRO)}>{INTRO}</h2>
        <p className="lore">"They moved in after I stopped looking after the house. Take a candle, and bring some salt."</p>
      </div>
      <div className="intro-grid">
        {sec(<CellarIcon glyph="cellar" size={20} />, "The cellar", "Spirits have moved into the cellar under the kitchen. You fight them with a new skill called Warding.")}
        {sec(<CellarIcon glyph="speed" size={20} />, "How a fight works", "Pick a foe and press Begin. The fight runs on its own, one foe after another, until you press Stop. Between foes you catch your breath.")}
        {sec(<CellarIcon glyph="anvil" size={20} />, "Gear", "You wear five pieces of gear: an amulet, something in your hand, a lantern, a garment and a belt. Gear is never used up. You make it with the Crafting skill, and you choose one of two rolled bonuses for each piece.")}
        {sec(<SigilIcon size={20} />, "Weakness", "Every foe is afraid of one thing, like salt or iron. Wear gear with that thing on it and the fight gets much easier. You learn a foe's weakness after you beat it 10 times.")}
        {sec(<CellarIcon glyph="health" size={20} />, "Readiness", "Before you begin, the game tells you how likely you are to win, from Safe to Hopeless. Safe means you will almost never lose.", tags)}
        {sec(<CellarIcon glyph="button" size={20} />, "Losing", "If a foe beats you, you lose the remedies you used on it and what it would have dropped. You never lose gear. Your Health comes back while you do other work.")}
        {sec(<MoonIcon size={20} />, "While you're away", "If a fight is Safe, it keeps going while you're away. Any other fight stops when you leave.")}
        {sec(
          <span className="portrait" style={{ ["--s" as string]: "40px" }}>
            <img src={FOE_ART.domovoi.icon} alt="" />
          </span>,
          "The Domovoi",
          "The house spirit is angry. Calm him down to open the way to the crypt. He will also make all your skills 5% faster, and your Health will come back twice as fast.",
        )}
      </div>
      <div className="intro-foot">
        <button className="btn btn-primary" onClick={onClose}>
          Go down to the cellar
        </button>
      </div>
    </Modal>
  );
}

const CALMED = "The Domovoi is calmed";

/** The Domovoi calmed: his gift (gold is allowed: it's a keepsake) and the way down. */
export function DomovoiCalmed({ onClose }: { onClose: () => void }) {
  return (
    <Modal title={CALMED} onClose={onClose} headless className="calm">
      <span className="art calm-art">
        <img src={FOE_ART.domovoi.art} alt="The Domovoi by the stove" />
      </span>
      <h2 id={modalHeadingId(CALMED)}>{CALMED}</h2>
      <p className="lore">He settles by the stove. Under his feet, a flagstone sits loose.</p>
      <div className="gift-box">
        <span className="label">✦ His gift · a keepsake</span>
        <span>+{Math.round(GIFTS.domovoi.speedAll * 100)}% speed in all skills · Health comes back twice as fast</span>
      </div>
      <p className="t-2">The way down to the crypt is open. Chapter II comes in a later build.</p>
      <div className="actions">
        <button className="btn btn-ghost" onClick={onClose}>
          Back to the cellar
        </button>
      </div>
    </Modal>
  );
}
