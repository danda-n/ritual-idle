import { describe, expect, it } from "vitest";
import { buffDuration, buffEffects, builtText, followerEffects, talentText, upgradeEffectFor } from "./effects";
import { TALENT_LEVELS, TALENTS } from "../content/talents";
import { SKILL_IDS } from "../content/skills";

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
    expect(upgradeEffectFor("notice_board")).toBe("+1 contract on the village board");
    expect(upgradeEffectFor("herb_stall")).toBe("The shop sells nettle, chamomile, mugwort");
    expect(followerEffects("janko")).toEqual(["+30% speed on your current action", "+20% Chandlery speed"]);
  });
  it("a built project's toast: the effect, and for the omen shelf what's stored and what a blessing gives", () => {
    expect(builtText("reading_lamp", { still_night: 1 })).toBe("+15% Scholarship speed");
    expect(builtText("omen_shelf", { still_night: 1 })).toBe("Holds 2 omens · 1 Still Night stored · bless a skill: ×2 speed, 2m");
    expect(builtText("omen_shelf", {})).toBe("Holds 2 omens");
  });
});

describe("talent text is generated from the effects", () => {
  const t = (skill: keyof typeof TALENTS, level: 3 | 6 | 9 | 12, side: "a" | "b") => talentText(TALENTS[skill][level][side], skill);

  it("bulk (always 2, but slower) and double (a chance of twice) never read alike", () => {
    expect(t("chandlery", 6, "a")).toBe("Tallow candle and Beeswax candle: makes 2 per action instead of 1, XP ×2 · each takes 80% longer, so +11% per hour");
    expect(t("chandlery", 9, "a")).toBe("10% of Chandlery actions give double output and XP");
    expect(t("chandlery", 12, "a")).toBe("Hearth candle: makes 2 per action instead of 1, XP ×2, no extra time");
  });

  it("finds give the multiplier; thrift states the real inputs; buff length the real time", () => {
    // Finds say only the multiplier; the recipe rows show the chances.
    expect(t("scavenging", 12, "b")).toBe("Salt ×2 as likely");
    expect(t("scavenging", 3, "b")).toBe("Scavenging chance finds ×1.5");
    expect(t("sigilcraft", 3, "b")).toBe("Ash sigil: 1 ash (was 2)");
    expect(t("ritualism", 6, "a")).toBe("Blessing lasts ×2 (15m → 30m)");
    expect(t("scavenging", 6, "a")).toContain("chance finds still roll once");
  });

  it("every talent's words (a snapshot, so wording changes show up in review)", () => {
    const all = SKILL_IDS.flatMap((s) => TALENT_LEVELS.flatMap((l) => (["a", "b"] as const).map((side) => `${s} ${l}${side} ${TALENTS[s][l][side].name}: ${t(s, l, side)}`)));
    expect(all).toMatchSnapshot();
  });
});
