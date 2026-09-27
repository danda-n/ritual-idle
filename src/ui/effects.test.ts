import { describe, expect, it } from "vitest";
import { buffDuration, buffEffects, builtText, followerEffects, upgradeEffectFor } from "./effects";

describe("effects are stated plainly, from the data", () => {
  it("Still Night", () => {
    expect(buffEffects("still_night")).toEqual(["×2 speed on one skill you choose", "Chance finds ×2 in that skill"]);
    expect(buffEffects("still_night", "herbalism")).toEqual(["×2 Herbalism speed", "Herbalism chance finds ×2"]);
    expect(buffDuration("still_night")).toBe("2m");
  });
  it("Blessing collapses to all skills", () => {
    expect(buffEffects("blessing")).toEqual(["+10% speed, all skills"]);
  });
  it("upgrades and followers", () => {
    expect(upgradeEffectFor("reading_lamp")).toBe("+15% Scholarship speed");
    expect(upgradeEffectFor("mended_shutters")).toBe("Offline cap 36h");
    expect(followerEffects("janko")).toEqual(["+30% speed on your current action", "+20% Chandlery speed"]);
  });
  it("a built project's toast: the effect, and for the omen shelf what's stored and what a blessing gives", () => {
    expect(builtText("reading_lamp", { still_night: 1 })).toBe("+15% Scholarship speed");
    expect(builtText("omen_shelf", { still_night: 1 })).toBe("Holds 2 omens · 1 Still Night stored · bless a skill: ×2 speed, 2m");
    expect(builtText("omen_shelf", {})).toBe("Holds 2 omens");
  });
});
