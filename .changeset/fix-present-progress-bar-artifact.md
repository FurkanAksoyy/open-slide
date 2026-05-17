---
'@open-slide/core': patch
---

Fix a vertical-line artifact that occasionally appeared during fullscreen playback after the controls faded out, caused by the progress bar's width transition leaving a compositor ghost.
