import { describe, expect, it } from "vitest";
import { NOTES } from "../content/notes";
import { REFILL_MS } from "../content/requests";
import { declineRequest } from "./commands";
import { rewind } from "./devtools";
import { catchUp } from "./offline";
import { newGame } from "./state";
import { refillBoard } from "./village";

describe("rewind (dev time skip)", () => {
  it("lets timers expire as if the time really passed", () => {
    const s = { ...newGame(1_000_000, 3), notesRevealed: NOTES.length };
    refillBoard(s, s.lastTickAt);
    const r = declineRequest(s, 0);
    if (!r.ok) throw new Error(r.reason);
    const after = catchUp(rewind(r.state, REFILL_MS), r.state.lastTickAt);
    expect(after.state.board[0]!.request).not.toBeNull();
  });
});
