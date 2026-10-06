# TenderPack

> **Documents checked. Ordered. Ready.**

TenderPack is a frontend-only enterprise web application built for the **AI DevFest 2026 Tender Document Package Builder** problem. It empowers procurement teams and bidders to validate, match, check expiry dates, detect duplicate documents, and compile an official, correctly ordered tender submission PDF package completely locally in the browser with zero server dependencies.

---

## Participant Information

- **Your name:** [PLACEHOLDER: USER WILL EDIT]
- **Registration number:** [PLACEHOLDER: USER WILL EDIT]
- **Live website:** [PLACEHOLDER: USER WILL ADD AFTER VERCEL]

---

## How to Run

Clone the repository and run the local development server:

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in Google Chrome.

---

## How to Build

Create the production-ready static build:

```bash
npm run build
```

The compiled static assets are located in the `dist/` directory, optimized for zero-configuration static deployment on Vercel.

---

## Main Features

- **requirements.json Loading**: Parse and validate tender metadata and document requirements dynamically from any local JSON configuration file, strictly sorting requirements by `order`.
- **PDF Upload**: Drag-and-drop and file-picker upload area with client-side file filtering (PDF only, maximum 30 files, maximum 50 MB total).
- **Page Count**: Fast, accurate in-browser page counting powered by local `pdfjs-dist` without remote server processing.
- **Manual Matching**: Intuitive 1:1 matching interface ensuring one requirement corresponds to at most one PDF, and one PDF to at most one requirement.
- **Expiry Validation**: Real-time evaluation of document expiry dates against the tender submission deadline ($\text{expiry} \ge \text{deadline} \implies \text{VALID}$, $\text{expiry} < \text{deadline} \implies \text{EXPIRED}$).
- **Duplicate Detection**: Exact byte hashing using Web Crypto API (`SHA-256`) to detect identical files regardless of file names, preventing duplicate copies from satisfying multiple distinct requirements.
- **Blocking Statuses**: Exact 5-status engine (`Missing`, `Expiry date needed`, `Expired`, `Not provided`, `OK`) with immediate recalculation and automatic blocking of package generation when issues exist.
- **Bilingual UI**: Seamless instant language toggle between English and বাংলা (Bengali), including translated workflow headings, badges, error messages, and localized requirement titles (`title_en` / `title_bn`).
- **PDF Package Generation**: Completely client-side PDF package generation using `pdf-lib`.
- **English Cover**: Formats an official procurement cover page on Page 1 displaying tender details, submission deadline, generation date, and strictly ordered list of included documents.
- **Ordered Document Merge**: Preserves all original pages and orientations in strict `requirement.order` sequence while omitting optional unattached documents.
- **Page X of Y Footer**: Two-pass exact footer stamping on every page (`<tender_id> | Page X of Y`), with automatic aspect-ratio scaling to reserve a dedicated bottom margin and guarantee that no original document content is ever obscured.

---

## Bonus Features

None

---

## Known Problems

- **Encrypted/Password-Protected PDFs**: If a user uploads a password-protected PDF file, `pdf-lib` cannot merge its contents without prior decryption.
- **Tab Memory Limits**: Total cumulative document size is restricted to 50 MB (maximum 30 files) to operate comfortably within browser tab heap memory limitations.

---

## AI Tools Used

- **Google Antigravity**

---

## Most Useful Prompt

The most useful prompt during implementation was the exact business logic and footer safety specification prompt:

> *"Every requirement MUST have exactly one status: Missing (mandatory=true, no file), Expiry date needed (has_expiry=true, file matched, no date), Expired (expiry < deadline), Not provided (mandatory=false, no file), OK (file matched, expiry valid). Duplicate detection must use crypto.subtle.digest('SHA-256', fileBytes) to prevent duplicate copies from matching different requirements. For imported pages, do not simply draw the footer over the bottom: create a new page with the same dimensions, reserve a small footer area at the bottom, draw the original PDF page into the available content area while preserving aspect ratio, then draw the footer inside the reserved area."*

---

## Screenshots

Screenshots showcasing document statuses, duplicate detection warnings, and package readiness are located in the `screenshots/` directory:

- `screenshots/tenderpack-document-statuses.png`: Displays document statuses, duplicate warning badges, non-PDF rejection banner, and blocking issue explanations.
- `screenshots/tenderpack-ready-matching.png`: Displays all requirements successfully matched, valid expiry dates, 10/10 readiness status, and active package generation action.

---

## License

This project is licensed under the [MIT License](LICENSE).
