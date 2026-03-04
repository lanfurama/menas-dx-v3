# Menas DX v3 - Refactored

## Cấu trúc dự án

```
src/
├── constants/          # Constants và config
│   ├── theme.js       # Theme colors, styles
│   ├── icons.js       # Icon paths
│   ├── roles.js       # RBAC roles, tabs config
│   ├── ai.js          # AI models config
│   └── data.js        # Static data constants
├── components/         # Reusable components
│   ├── Icon.jsx
│   ├── Metric.jsx
│   ├── Section.jsx
│   ├── Tier.jsx
│   ├── Dot.jsx
│   ├── Toggle.jsx
│   ├── NoAccess.jsx
│   ├── ExportBtn.jsx
│   ├── PermEditor.jsx
│   └── ChangeBadge.jsx
├── hooks/             # Custom React hooks
│   ├── useAuth.js     # Authentication logic
│   └── usePermissions.js  # Permission checks
├── utils/             # Utility functions
│   ├── format.js      # Number/date formatting
│   └── export.js      # CSV export
├── styles/            # Global styles
│   └── global.css     # CSS-in-JS styles
├── data/              # Data sources
│   └── demo.js        # Demo data (sẽ thay bằng API)
├── pages/             # Page components (TODO)
│   ├── Overview.jsx
│   ├── Customers.jsx
│   └── ...
└── App.jsx            # Main app component
```

## Cách chạy

```bash
npm install
npm run dev
```

## Refactoring đã thực hiện

1. ✅ Tách constants thành modules riêng
2. ✅ Tách components nhỏ thành files riêng
3. ✅ Tạo custom hooks cho auth và permissions
4. ✅ Tách utilities functions
5. ✅ Refactor main App component
6. ⏳ Pages components (cần migrate từ file cũ)

## Cải tiến

- **Modular**: Code được tổ chức theo module, dễ maintain
- **Reusable**: Components và hooks có thể tái sử dụng
- **Type-safe**: Sẵn sàng cho TypeScript migration
- **Scalable**: Dễ thêm features mới

## Next steps

1. Migrate các page components từ `menas-dx-v3.jsx` sang `src/pages/`
2. Tạo API service layer để thay thế demo data
3. Thêm TypeScript types
4. Thêm unit tests
5. Optimize bundle size với code splitting
