# Product Facts

> Single source of truth for all downstream marketing skills. No promotional material may claim more
> than this document supports.

## Verified facts

Every fact traced to a repository file, the README, or the user. The `source:` field is restricted to
`<repo-relative path>` | `README` | `user`.

- The application is named "Keep Me Safe" — source: package.json, src/App.js
- Its stated purpose is to keep an Excel (.xlsx) file secured inside an image — source: src/App.js (header text: "Keep me safe - keep xlsx file secured in image!")
- Built with React 17 and React DOM — source: package.json, index.js
- Uses the Material UI (MUI) v5 component library with Emotion styling — source: package.json
- Written in JavaScript and bundled with webpack and Babel — source: package.json, webpack.config.js
- Runs as a single-page application in the browser (webpack `target: "web"`) — source: webpack.config.js, index.js
- Reads and parses `.xlsx` spreadsheet files using SheetJS (`xlsx`) — source: src/App.js, package.json
- Displays spreadsheet rows in a virtualized table — source: src/App.js, package.json (react-virtualized)
- Compresses data with LZUTF8 before encoding — source: src/App.js (ZipService), package.json
- Encrypts data with AES using a user-supplied password (crypto-js) — source: src/App.js (CryptoService), package.json
- Encodes the encrypted bytes into a black-and-white pixel-grid image and decodes such images back to text — source: src/bit.mapper.service.js, src/App.js
- The pixel-grid encoding layout is configurable: a 3×3 pattern per byte (values 1–9) and an order pattern for 4-byte blocks (values 1–4) — source: src/App.js, src/bit.mapper.service.js
- The encoded image is downloaded as a JPEG — source: src/bit.mapper.service.js
- The app has two main screens: a Settings tab (password and encoding patterns) and an Excel tab (upload/save/load) — source: src/App.js
- The byte/order pattern string can be copied to the clipboard — source: src/App.js, package.json (react-copy-to-clipboard)

## Repository evidence

Concrete file paths in this repository that back the Verified facts.

- `package.json`
- `index.js`
- `webpack.config.js`
- `public/index.html`
- `public/main.js`
- `src/App.js`
- `src/bit.mapper.service.js`
- `src/test.js` (dev scratch script, not a test suite)
- `README.md`

## User-provided facts

Only the four non-derivable categories: production URL, primary goal, open-source status, features
not visible in the repository.

- Production URL: https://keep-me-safe.surge.sh
- Primary goal: real personal tool — the author uses it to keep spreadsheet data secured inside images
- Open-source status: yes, public repository — `package.json` declares `license: "ISC"`, git remote is
  `https://github.com/Basiliskin/keep-me-safe.git`; no `LICENSE` file present in the repo
- Features not visible in the repository: none recorded

## Unknown

Gaps recorded as open. Never invent an answer here.

- Number of active users
- Performance benchmarks (encoding/decoding time, practical image size limits)
- Browser support actually verified against
- Maximum spreadsheet / data size the tool handles reliably
- Automated test coverage — the `test` script in `package.json` is a placeholder and no `*.test.*` /
  `*.spec.*` files exist
- Production hosting details beyond the URL (deploy process, hosting provider behavior)
- Cryptographic guarantees and limitations of the AES + LZUTF8 pipeline (key derivation, salt/IV
  handling) — not established by the repository
- Deployed version vs. latest committed code — whether the current build matches the repo

## Forbidden assumptions

Never claim the following without explicit evidence. Un-evidenced occurrences are parked here, not in
Verified facts.

- fastest — no source claims this
- most secure — no source claims this
- better than competitors — no source claims this
- privacy-preserving — no source claims this
