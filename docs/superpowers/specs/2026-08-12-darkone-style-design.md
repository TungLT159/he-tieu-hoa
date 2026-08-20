# Darkone Style Migration Design Spec

> **Goal:** Áp dụng toàn bộ visual identity của Darkone React Dashboard Template vào dự án Tauri + React hiện tại, giữ nguyên kiến trúc Tailwind v4 + shadcn/ui và layout 3D viewer.

> **Scope:** Token migration + component enhancement (Approach B). Không thêm dependency mới. ~13 file thay đổi.

---

## Quyết định thiết kế

| Vấn đề | Quyết định |
|---|---|
| Phạm vi | Toàn bộ giao diện (màu sắc, typography sizing, radius, shadow, components) |
| Font chữ | Giữ Inter/system font stack hiện tại |
| Palette màu | Giữ nguyên palette gốc Darkone (primary tím `#7e67fe`) |
| Layout | Giữ nguyên layout 3D viewer hiện tại, không thêm dashboard |

---

## 1. Color System

### 1.1 Primary & Semantic Colors

| Token | Light Mode Hex |
|---|---|
| `--primary` | `#7e67fe` |
| `--primary-foreground` | `#ffffff` |
| `--secondary` | `#424e5a` |
| `--destructive` | `#ed321f` |
| `--warning` | `#f0934e` |
| `--success` | `#21d760` |
| `--info` | `#1ab0f8` |

### 1.2 Gray Scale

| Token | Hex |
|---|---|
| `gray-100` | `#f8f9fa` |
| `gray-200` | `#eef2f7` |
| `gray-300` | `#d8dfe7` |
| `gray-400` | `#b0b0bb` |
| `gray-500` | `#8486a7` |
| `gray-600` | `#687d92` |
| `gray-700` | `#424e5a` |
| `gray-800` | `#36404a` |
| `gray-900` | `#21252e` |

### 1.3 Light Mode Surfaces & Text

| Token | Value |
|---|---|
| `--background` | `#f8f7fa` |
| `--foreground` | `#5d7186` |
| `--surface-card` | `#ffffff` |
| `--surface-sidebar` | `#ffffff` |
| `--surface-panel` | `#ffffff` |
| `--surface-input` | `#ffffff` |
| `--text-primary` | `#5d7186` |
| `--text-secondary` | `#8391a2` |
| `--text-muted` | `#b0b0bb` |
| `--text-heading` | `#424e5a` |
| `--border-default` | `#eaedf1` |
| `--border-input` | `#d8dfe7` |
| `--border-focus` | `#b0b0bb` |

### 1.4 Dark Mode Surfaces & Text

| Token | Value |
|---|---|
| `--background` | `#191e23` |
| `--foreground` | `#aab8c5` |
| `--surface-card` | `#1d2329` |
| `--surface-sidebar` | `#1d2329` |
| `--surface-panel` | `#242b33` |
| `--surface-input` | `#242b33` |
| `--text-primary` | `#aab8c5` |
| `--text-secondary` | `#8391a2` |
| `--text-muted` | `#687d92` |
| `--text-heading` | `#dee2e6` |
| `--border-default` | `#272f37` |
| `--border-input` | `#3a4551` |
| `--border-focus` | `#4a5663` |

---

## 2. Typography

Giữ font Inter/system stack. Chỉ thay đổi sizing:

| Token | Value |
|---|---|
| `--font-size-base` | `0.875rem` (14px) |
| `--font-size-lg` | `1rem` (16px) |
| `--font-size-sm` | `0.75rem` (12px) |
| Heading weight | `600` |

---

## 3. Border Radius

| Token | Value |
|---|---|
| `--radius-sm` | `0.25rem` (4px) |
| `--radius-md` | `0.35rem` (5.6px) |
| `--radius-lg` | `0.5rem` (8px) |
| `--radius-xl` | `1rem` (16px) |

---

## 4. Shadows

| Token | Value |
|---|---|
| `--shadow-sm` | `0 0.125rem 0.25rem rgba(0,0,0,0.075)` |
| `--shadow-md` | `0px 3px 4px 0px rgba(0,0,0,0.03)` |
| `--shadow-lg` | `0 5px 10px rgba(30,32,37,0.12)` |

---

## 5. Spacing

| Token | Value |
|---|---|
| Spacer base | `1.5rem` (24px) |

---

## 6. Component Changes

### 6.1 Button — Thêm variant `soft`
- `btn-soft`: nền 10% opacity của màu primary/text + chữ cùng màu
- Hover: chuyển thành solid màu đó + text trắng
- Áp dụng cho tất cả theme colors (primary, secondary, success, danger, warning, info)

### 6.2 Badge — Thêm variant `soft` và `outline`
- `badge-soft`: nền 18% opacity + chữ cùng màu
- `badge-outline`: transparent bg + border màu + chữ cùng màu

### 6.3 Card — Double border
- `border-double border-[3px]` thay vì border đơn
- Shadow nhẹ `--shadow-md`

### 6.4 Input/Select — Bỏ focus shadow
- Border focus chỉ đổi màu, không có box-shadow ring
- Input border: `--border-input`, focus: `--border-focus`

### 6.5 Dialog/Sheet — Radius & shadow Darkone
- Radius `--radius-lg`
- Shadow `--shadow-lg`

### 6.6 Dropdown Menu — Animation + shadow
- Shadow `--shadow-lg`
- Animation slide-down (DropDownSlide keyframes, 0.3s)

### 6.7 Progress — Thêm kích thước
- `xs` (1px), `sm` (5px), `md` (8px), `lg` (12px)

### 6.8 Avatar — Thêm kích thước
- `xs` (24px), `sm` (36px), `md` (48px), `lg` (72px), `xl` (96px), `xxl` (120px)

### 6.9 Tabs — Active pill style
- Active tab: primary bg + white text + `--shadow-sm`

---

## 7. File Plan

| File | Action |
|---|---|
| `src/index.css` | MODIFY: Thay toàn bộ CSS tokens, `@theme` block, base layer |
| `components.json` | MODIFY: Cập nhật cssVariables mapping |
| `src/components/ui/button.tsx` | MODIFY: Thêm variant `soft` |
| `src/components/ui/badge.tsx` | MODIFY: Thêm variant `soft`, `outline` |
| `src/components/ui/card.tsx` | MODIFY: Double-border style |
| `src/components/ui/input.tsx` | MODIFY: Bỏ focus shadow, border Darkone |
| `src/components/ui/select.tsx` | MODIFY: Border Darkone |
| `src/components/ui/dialog.tsx` | MODIFY: Radius/shadow Darkone |
| `src/components/ui/dropdown-menu.tsx` | MODIFY: Shadow + animation slide-down |
| `src/components/ui/sheet.tsx` | MODIFY: Radius/shadow Darkone |
| `src/components/ui/progress.tsx` | MODIFY: Thêm size variants |
| `src/components/ui/avatar.tsx` | MODIFY: Thêm size variants |
| `src/components/ui/tabs.tsx` | MODIFY: Active pill style |

**Tổng cộng:** 13 file. 0 dependency mới. 0 file mới.

---

## 8. Không thay đổi

- Không thay font chữ (giữ Inter/system stack)
- Không thêm Bootstrap hoặc SCSS (giữ Tailwind v4)
- Không thay layout 3D viewer
- Không thay cấu trúc context/provider/pattern components
- Không thêm dependency mới (ApexCharts, SimpleBar, React Select, ...)
- Không thay đổi i18n hoặc settings system
**
## 9. Verification

Sau khi hoàn thành, chạy:
```
pnpm lint
npx tsc --noEmit
pnpm test
pnpm build
```

Kiểm tra trực quan: light mode, dark mode, responsive tất cả các component bị ảnh hưởng.
