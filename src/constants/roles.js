import { T } from './theme.js';
import { ic } from './icons.js';

export const ROLES = {
  admin: {
    label: "Admin",
    color: T.danger,
    tabs: ["overview", "customers", "segment", "sales", "marketing", "zalo", "predictions", "ai_chat", "report", "datamap", "activity_log", "settings", "user_mgmt"],
    canExport: true,
    canEditPermissions: true,
    canManageUsers: true,
    canConfigDB: true,
    canConfigZalo: true,
    canConfigAI: true,
  },
  manager: {
    label: "Manager",
    color: T.warning,
    tabs: ["overview", "customers", "segment", "sales", "marketing", "zalo", "predictions", "ai_chat", "report"],
    canExport: false,
    canEditPermissions: false,
    canManageUsers: false,
    canConfigDB: false,
    canConfigZalo: false,
    canConfigAI: false,
  },
  viewer: {
    label: "Viewer",
    color: T.info,
    tabs: ["overview", "sales"],
    canExport: false,
    canEditPermissions: false,
    canManageUsers: false,
    canConfigDB: false,
    canConfigZalo: false,
    canConfigAI: false,
  },
};

export const DEFAULT_USERS = [
  { id: "u1", name: "Admin", email: "admin@menas.vn", role: "admin", status: "active", avatar: "A", permissions: { tabs: ["overview", "customers", "segment", "sales", "marketing", "zalo", "predictions", "ai_chat", "report", "datamap", "activity_log", "settings", "user_mgmt"], canExport: true } },
  { id: "u2", name: "Nguyễn Marketing", email: "marketing@menas.vn", role: "manager", status: "active", avatar: "N", permissions: { tabs: ["overview", "customers", "segment", "marketing", "zalo", "ai_chat", "report"], canExport: false } },
  { id: "u3", name: "Trần Sales", email: "sales@menas.vn", role: "manager", status: "active", avatar: "T", permissions: { tabs: ["overview", "customers", "sales", "ai_chat", "report"], canExport: true } },
  { id: "u4", name: "Lê Viewer", email: "viewer@menas.vn", role: "viewer", status: "active", avatar: "L", permissions: { tabs: ["overview", "sales"], canExport: false } },
];

export const ALL_TABS = [
  { id: "overview", label: "Tổng quan", icon: ic.home },
  { id: "customers", label: "KH 360°", icon: ic.users },
  { id: "segment", label: "Lọc & Chiến dịch", icon: ic.filter },
  { id: "sales", label: "Sales", icon: ic.cart },
  { id: "marketing", label: "Marketing", icon: ic.target },
  { id: "zalo", label: "Zalo ZNS", icon: ic.msg },
  { id: "predictions", label: "AI Predict", icon: ic.zap },
  { id: "ai_chat", label: "AI Chat", icon: ic.brain },
  { id: "report", label: "AI Report", icon: ic.fileText },
  { id: "datamap", label: "Data Map", icon: ic.layers },
  { id: "activity_log", label: "Activity Log", icon: ic.clipboard },
  { id: "settings", label: "Cài đặt", icon: ic.settings },
  { id: "user_mgmt", label: "Phân quyền", icon: ic.shield },
];
