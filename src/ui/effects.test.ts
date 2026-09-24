import { describe, expect, it } from "vitest";
import { buffDuration, buffEffects, followerEffects, upgradeEffectFor } from "./effects";

describe("effects are stated plainly, from the data", () => {
  it("Still Night", () => {
    expect(buffEffects("still_night")).toEqual(["+50% speed to one skill you choose", "Chance finds ×2 in that skill"]);
    expect(buffEffects("still_night", "herbalism")).toEqual(["+50% Herbalism speed", "Herbalism chance finds ×2"]);
    expect(buffDuration("still_night")).toBe("15m");
  });
  it("Blessing collapses to all skills", () => {
    expect(buffEffects("blessing")).toEqual(["+10% speed, all skills"]);
  });
  it("upgrades and followers", () => {
    expect(upgradeEffectFor("reading_lamp")).toBe("+15% Scholarship speed");
    expect(upgradeEffectFor("mended_shutters")).toBe("Works 36h while you're away");
    expect(followerEffects("janko")).toEqual(["+30% speed to whatever you do", "+20% more on Chandlery"]);
  });
});
