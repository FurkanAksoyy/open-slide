---
'@open-slide/core': patch
---

Fix a vertical-line artifact that could appear during fullscreen playback: drive the laser pointer with `transform` instead of `left`/`top` so a moving box-shadow no longer leaves a compositor ghost, and animate the progress bar fill with `scaleX` so its opacity fade-out shares a layer with the parent.
