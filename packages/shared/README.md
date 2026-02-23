# Shared Types & Constants

Shared package untuk tipe data dan konstanta yang digunakan di frontend dan backend.

## Struktur

```
packages/shared/
├── src/
│   ├── types/
│   │   ├── user.types.ts
│   │   ├── anggota.types.ts
│   │   ├── pnbp.types.ts
│   │   └── ...
│   ├── constants/
│   │   ├── roles.ts
│   │   ├── status.ts
│   │   └── ...
│   ├── validators/
│   │   └── schemas.ts
│   └── index.ts
├── package.json
└── tsconfig.json
```

## Usage

```typescript
import { UserRole, AnggotaStatus } from '@kth-btm/shared';
```
