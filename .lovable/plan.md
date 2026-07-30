## What the audit found

I hashed every folder in `public/page-icons` (123 folders):

- **26 folders are byte-identical placeholder copies** (all 32 files duplicated from another pack): all 10 `dragon-*` covers, all 10 `gothic-siren-*` covers, the generic `dragons` and `gothic-sirens` folders, plus `dove-white-roses`, `dove-raven-roses`, `rose-cross-stars`, `woven-heart-cross`. These are the "not matching the cover" packs.
- **10 folders are unique but off-theme/wrong style** (generated before the cover-art-as-style-bible pass): Texas Horned Lizard, Starlit Cactus, Pecan Tree Moon, Golden Wheat Moon, Bluebonnet Moon, Monarch Moon, Longhorn Star, Mockingbird Moon, Patriotic White Rose, Live Oak Lights.
- **`midnight-moth-bloom` has only 14 of 32 icons.**
- **`feather-emerald`, `feather-crimson`, `feather-amethyst`, `feather-phoenix` have only 20 of 32**; `feather-gold` has 32 but off-style. `feather-sapphire` is complete.
- **Talkin' Smack / Thinkin' Smack**: full count, but background inconsistency — regenerating both packs is cheaper than hunting individual files.

## The fix

One background run of `scripts/icons/regen_all.py` using each cover's own artwork as the attached style bible (the method that produced the packs you approved), on the cheap Lite image model.

| Group | Folders | Icons |
|---|---|---|
| Dragons + Sirens placeholders | 22 | 704 |
| Dove/Cross placeholders | 4 | 128 |
| Texas & Moon series off-theme | 10 | 320 |
| Talkin' / Thinkin' Smack | 2 | 64 |
| Feathers (all 6, regenerated per cover art) | 6 | 192 |
| Midnight Moth in Bloom (missing only) | 1 | 18 |
| **Total** | **45** | **~1,426** |

Estimated cost ≈ **200–215 credits** at the Lite model's observed rate (~0.14 credits/image, based on the last run: 415 icons for 59 credits).

## How it runs

1. Add a `--targets` file mode to `scripts/icons/regen_all.py` so the queue is exactly the 45 folders above, and force-overwrite (not skip-if-exists) for the 44 full-rebuild folders while `midnight-moth-bloom` only fills gaps.
2. Each icon prompt attaches that cover's own art and forbids text, numbers, letters, and calendar grids (existing `NEGATIVE` block), plus an explicit "solid painted background, no transparent or blank corners" clause to fix the Talkin'/Thinkin' background issue.
3. Run in the background with 6 workers, writing 512px JPEGs straight into `public/page-icons/<coverId>/`, checkpointed so a credit interruption resumes cleanly.
4. After the run: regenerate `src/data/iconPacks.ts`, run `scripts/icons/validate_manifest.py` to prove zero cross-cover duplicates remain, and report a per-folder count.

## Notes

- The strict resolver in `src/lib/coverIcons.ts` stays as-is — no cover will borrow another's art at any point during the run.
- No app/UI code changes; this is asset regeneration plus the manifest rebuild.
- If credits run out mid-run I'll report exactly which folders completed and resume on your go-ahead.
