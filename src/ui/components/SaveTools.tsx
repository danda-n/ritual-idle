import { useState } from "react";
import { exportSave, importSave } from "../../engine/save";
import type { GameState } from "../../engine/state";

export function SaveTools({ state, onLoad, onReset }: { state: GameState; onLoad: (s: GameState) => void; onReset: () => void }) {
  const [text, setText] = useState("");
  const [message, setMessage] = useState("");

  const doExport = async () => {
    const code = exportSave(state);
    setText(code);
    try {
      await navigator.clipboard.writeText(code);
      setMessage("Save copied to clipboard.");
    } catch {
      setMessage("Save code is in the box. Copy it from there.");
    }
  };
  const doImport = () => {
    try {
      onLoad(importSave(text));
      setMessage("Save loaded.");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "That isn't a valid save.");
    }
  };

  return (
    <details className="save-tools">
      <summary>Save</summary>
      <div className="save-tools-body">
        <label className="sr-only" htmlFor="save-code">
          Save code
        </label>
        <textarea id="save-code" className="field" value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste a save code here to import." rows={3} />
        <div className="row">
          <button className="btn btn-ghost" onClick={doExport}>
            Export
          </button>
          <button className="btn btn-ghost" onClick={doImport} disabled={!text.trim()}>
            Import
          </button>
          <button className="btn btn-danger" onClick={() => confirm("Start over? This erases your progress.") && onReset()}>
            Reset
          </button>
          <span className="muted" role="status">
            {message}
          </span>
        </div>
      </div>
    </details>
  );
}
