---
'@open-slide/core': patch
---

Split the comments Vite plugin into focused modules: marker helpers (`comments.ts`), source-edit operations (`edit-ops.ts`), asset revert (`revert-asset.ts`), and a unified `api-plugin.ts` that registers the `/__comments` and `/__edit` dev-server endpoints in one place.
