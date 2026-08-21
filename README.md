# Keep Me Safe

Keep Excel (`.xlsx`) spreadsheet data secured inside an image.

Upload a spreadsheet, then save it as an image file: the rows are compressed, encrypted with a
password, and encoded into a black-and-white pixel-grid image. Load that image back later and the
table is restored. Everything runs in the browser — there is no backend.

Live at **https://keep-me-safe.surge.sh**

## Features

- **Upload `.xlsx`** — read a spreadsheet into a table view (SheetJS).
- **Save to image** — encode the table into an image that you can store or share:
  `rows → JSON → LZUTF8 compress → AES encrypt → pixel-grid encode → download as JPEG`.
- **Load image → table** — decode the pixel pattern, decrypt with the same password, decompress, and
  restore the rows.
- **Password protection** — the saved image can only be decoded with the password it was encrypted
  with (AES via crypto-js).
- **Configurable encoding** — the pixel layout is tunable via a *byte pattern* (which cells of each
  3×3 block carry the byte's bits, values 1–9) and an *order pattern* (ordering of 4-byte blocks,
  values 1–4). Defaults are provided; a copy-to-clipboard button exports the current pattern.
- **Client-side only** — no data ever leaves the browser.

## How it works

The app has two tabs:

| Tab | Purpose |
|---|---|
| **Settings** | Set the password and the encoding patterns |
| **Excel** | Upload / reset / save-to-image / load-from-image |

**Save pipeline** (`src/App.js`, `src/bit.mapper.service.js`):

```
xlsx file → rows → JSON → LZUTF8 compress → AES encrypt (password) → pixel-grid image → .jpg download
```

**Load pipeline** (reverse):

```
image → decode pixels → AES decrypt (password) → LZUTF8 decompress → JSON → rows → table
```

Encoding detail: every character is converted to its 8-bit value. Each byte is drawn as a block of
3×3 pixels where a dark pixel represents a `1` bit and a light pixel a `0` bit. The byte pattern
selects which cells hold the 8 bits; the order pattern controls how blocks of 4 bytes are laid out.

> Note: this is a data-obfuscation scheme with password-based AES encryption. It has not been
> independently security-audited; use it accordingly.

## Getting started

Requires [Node.js](https://nodejs.org/) and npm.

```bash
# install dependencies
npm install

# start the dev server (opens http://localhost:9500)
npm start

# production bundle → public/main.js
npm run build
```

## Usage

1. Open the **Excel** tab and click **Upload** to load an `.xlsx` file into the table.
2. In the **Settings** tab, enter a password (required to decrypt later) and adjust the byte/order
   patterns if you want a custom layout.
3. In the **Excel** tab, click **Save** — the encoded image downloads as a `.jpg`.
4. To restore the data, click **Load**, select the image, and enter the same password.

## Tech stack

- **React 17** + React DOM
- **Material UI v5** (MUI) with Emotion
- **SheetJS** (`xlsx`) for spreadsheet parsing
- **crypto-js** for AES encryption
- **LZUTF8** for compression
- **react-virtualized** for the table view
- **webpack** + **Babel** for bundling

## Project status

- Public repository: [github.com/Basiliskin/keep-me-safe](https://github.com/Basiliskin/keep-me-safe)
- Deployed at [keep-me-safe.surge.sh](https://keep-me-safe.surge.sh)
- No automated tests yet — the `test` script in `package.json` is a placeholder.

## License

ISC — as declared in `package.json`. (A `LICENSE` file is not yet included in the repository.)
