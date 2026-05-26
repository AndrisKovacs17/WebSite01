# Biztor static structure

This directory is the source-side routing layer for the static build.

- `routes.json` maps legacy HTML source files to clean public URLs.
- `npm run build:static` writes a generated deployable site into `dist/`.
- The generated `dist/.htaccess` serves clean URLs and redirects old `/sites/*.html` paths.

The current HTML files still live in the repository root and `sites/` while the
project is migrated gradually. Treat `dist/` as build output, not as hand-edited
source.
