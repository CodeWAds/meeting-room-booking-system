// ✅ src/app/admin/layout.tsx
import React from 'react';
import styles from '../../styles/Admin.module.css';
import AdminHeaderNav from '../../components/Admin';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={styles.adminLayout}>
      <AdminHeaderNav />
      <main className={styles.content}>{children}</main>
    </div>
  );
}
