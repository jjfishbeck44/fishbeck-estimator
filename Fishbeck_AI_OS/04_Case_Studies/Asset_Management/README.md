# Case Study Asset Management

How site photos and project media are organized for case studies, marketing, and
documentation. Integrates **Cloudinary** (cloud delivery/transform for web + marketing)
and **Immich** (self-hosted master archive of original photos).

> Assumes functional staging environments already exist for both services.

## Roles
- **Immich** — the master, self-hosted library. Source of truth for original,
  full-resolution site photos, organized by project. Nothing gets deleted here.
- **Cloudinary** — the delivery/transform layer for web, social, and case studies.
  Stores web-optimized derivatives; never the only copy of an original.

## Folder / naming convention
Organize by project and phase so before/after pairs stay matched:
```
{project_ref}/{phase}/{room-or-area}_{sequence}.{ext}
e.g.  FI-000123/before/kitchen_01.jpg
      FI-000123/after/kitchen_01.jpg
```
- `phase`: `before` | `during` | `after` | `detail`
- Keep the same `room-or-area_sequence` across phases so before/after align.

## Workflow
**Phase 1 — Capture & archive (Immich)**
- Upload originals from the field to Immich under the project's `project_ref`.
- Tag with project ref, address, service type, and phase.

**Phase 2 — Publish derivatives (Cloudinary)**
- Upload selected, client-approved photos to Cloudinary under the same `project_ref`
  folder/tags.
- Use Cloudinary transforms for web sizes, watermarking, and format (WebP/AVIF).

**Phase 3 — Use in content**
- Reference Cloudinary URLs in case studies (`04_Case_Studies/`), the website
  (`01_Website/`), and social (`03_Content/`).

## Rules
- Get client consent before publishing identifiable property photos.
- Strip location EXIF from published images for privacy.
- Originals stay in Immich; Cloudinary holds web copies only.
- Keep `project_ref` consistent across Immich, Cloudinary, and the case study file.

## Metadata to record per project
project_ref, address (private), service type, capture date, consent (y/n),
Immich album link, Cloudinary folder/tags.
