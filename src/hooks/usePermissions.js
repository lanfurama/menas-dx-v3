import { useMemo } from 'react';

export const usePermissions = (currentUser, ALL_TABS) => {
  const userPerms = useMemo(() => currentUser?.permissions || { tabs: [], canExport: false }, [currentUser]);
  const canView = (tabId) => (userPerms.tabs || []).indexOf(tabId) >= 0;
  const canExport = userPerms.canExport;
  const isAdmin = currentUser?.role === "admin";
  const visibleTabs = useMemo(() => ALL_TABS.filter(t => userPerms.tabs?.includes(t.id)), [userPerms, ALL_TABS]);

  return {
    userPerms,
    canView,
    canExport,
    isAdmin,
    visibleTabs,
  };
};
