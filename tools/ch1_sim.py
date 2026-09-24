"""Chapter 1 pacing simulation.

Plays Chapter 1 as a focused, efficient player: one action at a time, no followers,
no offline time. Reports how long it takes to reach the Kindling of the Hearth-Circle.
Tune XP_BASE / XP_GROWTH and the recipe numbers here, then re-run.
"""
import math, random

XP_BASE, XP_GROWTH, CAP = 25, 1.18, 20

def xp_to_next(level):
    return math.floor(XP_BASE * XP_GROWTH ** (level - 1))

# action: skill, level, seconds, xp, inputs, outputs
A = {
  # Herbalism
  "pick_nettle":      ("herbalism", 1, 3, 5,  {}, {"nettle": 1}),
  "pick_chamomile":   ("herbalism", 3, 3, 7,  {}, {"chamomile": 1}),
  "pick_yarrow":      ("herbalism", 6, 4, 10, {}, {"yarrow": 1}),
  "pick_mugwort":     ("herbalism", 10, 4, 13, {}, {"mugwort": 1}),
  "pick_stjohns":     ("herbalism", 14, 5, 17, {}, {"stjohns": 1}),
  "cut_juniper":      ("herbalism", 18, 5, 21, {}, {"juniper": 1}),
  # Scavenging
  "sweep_hearth":     ("scavenging", 1, 3, 5,  {}, {"ash": 1}),
  "search_pantry":    ("scavenging", 2, 3, 6,  {}, {"tallow": 1, "salt": 0.5}),
  "search_attic":     ("scavenging", 5, 4, 9,  {}, {"old_page": 0.35, "rags": 0.5, "glass": 0.3}),
  "rob_hives":        ("scavenging", 9, 4, 12, {}, {"beeswax": 1}),
  "sift_midden":      ("scavenging", 13, 5, 16, {}, {"iron_nail": 1, "rags": 0.3}),
  "open_chest":       ("scavenging", 17, 5, 20, {}, {"chalk": 1}),
  # Chandlery
  "tallow_candle":    ("chandlery", 1, 3, 6,  {"tallow": 2, "rags": 0}, {"tallow_candle": 1}),
  "smudge_bundle":    ("chandlery", 4, 4, 9,  {"chamomile": 2, "yarrow": 1}, {"smudge": 1}),
  "beeswax_candle":   ("chandlery", 8, 4, 12, {"beeswax": 2}, {"beeswax_candle": 1}),
  "mugwort_incense":  ("chandlery", 10, 5, 15, {"mugwort": 2, "ash": 1}, {"mugwort_incense": 1}),
  "hearth_candle":    ("chandlery", 14, 5, 19, {"beeswax": 2, "stjohns": 1}, {"hearth_candle": 1}),
  "juniper_incense":  ("chandlery", 18, 6, 23, {"juniper": 2, "ash": 1}, {"juniper_incense": 1}),
  # Sigilcraft
  "salt_line":        ("sigilcraft", 1, 3, 6,  {"salt": 1}, {"salt_line": 1}),
  "ash_sigil":        ("sigilcraft", 4, 4, 9,  {"ash": 2, "nettle": 1}, {"ash_sigil": 1}),
  "iron_ward":        ("sigilcraft", 8, 4, 12, {"iron_nail": 2, "salt": 1}, {"iron_ward": 1}),
  "chalk_segment":    ("sigilcraft", 12, 5, 16, {"chalk": 1, "salt": 1}, {"chalk_segment": 1}),
  "hearth_ward":      ("sigilcraft", 15, 6, 22, {"chalk_segment": 2, "iron_ward": 1, "stjohns": 1}, {"hearth_ward": 1}),
  # Scholarship
  "decipher_page":    ("scholarship", 1, 6, 14, {"old_page": 1, "tallow_candle": 1}, {"deciphered": 1}),
  "copy_litany":      ("scholarship", 8, 6, 20, {"deciphered": 3, "beeswax_candle": 1}, {"litany": 1}),
  # Ritualism (minor rites)
  "bless_threshold":  ("ritualism", 1, 10, 25, {"salt_line": 1, "tallow_candle": 1}, {"consecrated_salt": 1}),
  "smoke_rooms":      ("ritualism", 4, 12, 35, {"smudge": 1, "tallow_candle": 1}, {"blessing": 1}),
}

# Kindling the Hearth-Circle (the Chapter 1 Major Rite). Bread & salt come via village coin.
RITE = {"hearth_candle": 7, "mugwort_incense": 3, "hearth_ward": 1, "litany": 1, "consecrated_salt": 3}
RITE_SKILLS = {"ritualism": 5}   # rite asks for Ritualism 5
RITE_SECONDS = 30 * 60           # performing it (idle-able)

producer = {}
for k, a in A.items():
    for o in a[5]: producer.setdefault(o, k)

def run(seed=0):
    random.seed(seed)
    lvl = {s: 1 for s in {a[0] for a in A.values()}}
    xp = {s: 0 for s in lvl}
    inv = {}
    t = 0.0
    def do(k, n=1):
        nonlocal t
        s, req, sec, gx, ins, outs = A[k]
        for _ in range(n):
            for i, q in ins.items():
                if q: ensure(i, q)
                inv[i] = inv.get(i, 0) - q
            t += sec
            for o, q in outs.items():
                inv[o] = inv.get(o, 0) + (q if q >= 1 else (1 if random.random() < q else 0))
            xp[s] += gx
            while lvl[s] < CAP and xp[s] >= xp_to_next(lvl[s]):
                xp[s] -= xp_to_next(lvl[s]); lvl[s] += 1
    def train(s, target):
        while lvl[s] < target:
            best = max((k for k, a in A.items() if a[0] == s and a[1] <= lvl[s]), key=lambda k: A[k][3] / A[k][2] if not A[k][4] else A[k][3] / A[k][2] * 0.99)
            do(best)
    def ensure(item, q):
        k = producer[item]
        s, req = A[k][0], A[k][1]
        train(s, req)
        while inv.get(item, 0) < q:
            do(k)
    for item, q in RITE.items():
        ensure(item, q)
    for s, L in RITE_SKILLS.items():
        train(s, L)
    return t, lvl

times = []
for seed in range(20):
    t, lvl = run(seed)
    times.append(t)
t, lvl = run(0)
print(f"XP curve: base {XP_BASE}, growth {XP_GROWTH}. To level 10: {sum(xp_to_next(l) for l in range(1,10))} xp, to 20: {sum(xp_to_next(l) for l in range(1,20))} xp")
print(f"Active time to meet Rite requirements: {min(times)/60:.0f}-{max(times)/60:.0f} min (avg {sum(times)/len(times)/60:.0f}), plus {RITE_SECONDS//60} min to perform")
print("Levels at the Rite:", dict(sorted(lvl.items())))
