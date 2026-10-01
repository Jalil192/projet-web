function AdminBadge({ isAdmin }) {
  if (!isAdmin) return null;
  return <span className="admin-badge">Admin</span>;
}

export default AdminBadge;
