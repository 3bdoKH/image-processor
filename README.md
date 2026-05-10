# 🖼️ Image Processing Studio

A web-based image processing application built with **Next.js 16**, **React 19**, and **Sharp**. It lets you upload an image, pick from a library of 20+ processing operations across five categories, tune parameters, and instantly preview the result — all without installing any desktop software.

---

## ✨ Features

| Category | Operations |
|---|---|
| **Filters** | Grayscale, Gaussian Blur, Sharpen, Brightness, Contrast, Invert, Sepia, Median Filter |
| **Edge Detection** | Sobel, Prewitt, Laplacian, Canny (with low/high threshold control) |
| **Morphology** | Erosion, Dilation, Padding / Extend |
| **Segmentation** | Binary Threshold, Otsu Threshold, K-Means Color Segmentation |
| **Compression** | JPEG Quality Compression, Color Quantization |

Every operation that supports tuning exposes **range sliders** or **select controls** directly in the UI.

---

## 🏗️ Architecture

```
image_processing/
├── app/
│   ├── page.tsx              # Main UI — upload, operation panel, result viewer
│   ├── layout.tsx            # Root layout with global font/styles
│   ├── globals.css           # Design system & component styles
│   └── api/
│       └── process/
│           └── route.ts      # POST /api/process — receives FormData, returns base64 PNG
│
├── components/
│   ├── ImageUploader.tsx     # Drag-and-drop / click-to-upload image input
│   ├── OperationPanel.tsx    # Category tabs, operation list, parameter sliders, Apply button
│   └── ResultViewer.tsx      # Displays the processed image or loading state
│
└── lib/
    ├── types.ts              # Operation & OperationParam type definitions + OPERATIONS registry
    └── imageProcessing/
        ├── index.ts          # Router — dispatches to the correct module by operation id
        ├── filters.ts        # Sharp-based filter implementations
        ├── edges.ts          # Custom convolution kernels (Sobel, Prewitt, Laplacian, Canny)
        ├── morphology.ts     # Erosion, dilation, padding via raw pixel manipulation
        ├── segmentation.ts   # Threshold, Otsu, K-Means on raw pixel buffers
        └── compression.ts    # JPEG quality & color quantization via Sharp
```

### Data Flow

```
Browser                          Server (Next.js API Route)
───────                          ──────────────────────────
Upload image (File)
  │
  ▼
Read as DataURL → display
  │
User picks operation + params
  │
  ▼
POST /api/process
  FormData { image, operation, params }
                                   │
                                   ▼
                            processImage(buffer, op, params)
                                   │
                          ┌────────┴────────┐
                          │  Route by op id  │
                          └───────┬──────────┘
                    filters / edges / morphology /
                    segmentation / compression
                                   │
                                   ▼
                            Sharp → PNG buffer
                                   │
                                   ▼
                        { result: "data:image/png;base64,…" }
  │
  ▼
Display result image
```

---

## 🔬 Processing Modules

### Filters (`lib/imageProcessing/filters.ts`)
Thin wrappers around the [Sharp](https://sharp.pixelplumbing.com/) API:
- **Grayscale** — `sharp.grayscale()`
- **Gaussian Blur** — `sharp.blur(sigma)`
- **Sharpen** — `sharp.sharpen({ sigma })`
- **Brightness** — `sharp.modulate({ brightness })`
- **Contrast** — linear transform `f(x) = factor·x + offset`
- **Invert** — `sharp.negate()`
- **Sepia** — grayscale + warm tint `{ r:112, g:66, b:20 }`
- **Median Filter** — `sharp.median(size)`

### Edge Detection (`lib/imageProcessing/edges.ts`)
Implemented from scratch using a generic **convolution engine** that operates on raw grayscale pixel buffers:
- **Sobel** — 3×3 horizontal + vertical kernels, gradient magnitude
- **Prewitt** — similar to Sobel with uniform weights
- **Laplacian** — second-derivative kernel `[[0,-1,0],[-1,4,-1],[0,-1,0]]`
- **Canny** — multi-step: Gaussian blur → Sobel gradients → double-threshold hysteresis

### Morphology (`lib/imageProcessing/morphology.ts`)
Raw pixel buffer operations:
- **Erosion** — local minimum over a square kernel
- **Dilation** — local maximum over a square kernel
- **Padding** — extends the image canvas with a solid border

### Segmentation (`lib/imageProcessing/segmentation.ts`)
- **Binary Threshold** — pixels above threshold → white, below → black
- **Otsu Threshold** — automatically finds optimal threshold from the histogram
- **K-Means** — clusters pixels into *k* color groups and replaces each pixel with its cluster centroid

### Compression (`lib/imageProcessing/compression.ts`)
- **JPEG Quality** — re-encodes with Sharp at a given quality percentage (1–100)
- **Color Quantization** — reduces the palette to a maximum number of colors

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** (or yarn / pnpm / bun)

### Installation

```bash
git clone <repo-url>
cd image_processing
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. The page hot-reloads as you edit source files.

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

---

## 🛠️ Tech Stack

| Technology | Version | Role |
|---|---|---|
| [Next.js](https://nextjs.org/) | 16.2.4 | Full-stack React framework, App Router, API Routes |
| [React](https://react.dev/) | 19 | UI library |
| [Sharp](https://sharp.pixelplumbing.com/) | ^0.34 | High-performance server-side image processing |
| [Tailwind CSS](https://tailwindcss.com/) | ^4 | Utility CSS (via PostCSS) |
| [Lucide React](https://lucide.dev/) | ^1.8 | Icon set |
| TypeScript | ^5 | Static typing |

---

## 📡 API Reference

### `POST /api/process`

Processes an image with a given operation and returns a base64-encoded PNG.

**Request** — `multipart/form-data`

| Field | Type | Description |
|---|---|---|
| `image` | `File` | The input image (any format Sharp supports) |
| `operation` | `string` | Operation ID (see table below) |
| `params` | `string` | JSON-encoded object of numeric parameters |

**Response** — `application/json`

```json
{ "result": "data:image/png;base64,..." }
```

On error:

```json
{ "error": "Human-readable error message" }
```

**Operation IDs**

| ID | Category | Parameters |
|---|---|---|
| `grayscale` | filters | — |
| `blur` | filters | `sigma` (1–20) |
| `sharpen` | filters | `sigma` (1–10) |
| `brightness` | filters | `value` (-100–100) |
| `contrast` | filters | `value` (-100–100) |
| `invert` | filters | — |
| `sepia` | filters | — |
| `median` | filters | `size` (1–5) |
| `sobel` | edges | — |
| `prewitt` | edges | — |
| `laplacian` | edges | — |
| `canny` | edges | `low` (10–100), `high` (50–200) |
| `padding` | morphology | `size` (5–100 px) |
| `erosion` | morphology | `size` (1–10 kernel) |
| `dilation` | morphology | `size` (1–10 kernel) |
| `threshold` | segmentation | `value` (0–255) |
| `otsu` | segmentation | — |
| `kmeans` | segmentation | `k` (2–8 clusters) |
| `compress_quality` | compression | `quality` (1–100 %) |
| `quantize` | compression | `colors` (2–64) |

---

## 📁 Adding a New Operation

1. **Register it** in `lib/types.ts` inside the `OPERATIONS` array with a unique `id`, a `label`, the correct `category`, and any `params`.
2. **Implement it** in the appropriate module under `lib/imageProcessing/` (or create a new module).
3. **Wire it up** in `lib/imageProcessing/index.ts` — add the id to the correct ops array and ensure it routes to your module.

That's it. The UI automatically renders the new operation and its parameter controls.
