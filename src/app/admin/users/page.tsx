// src/app/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/formatters";
import AdminUserActions from "@/components/admin/AdminUserActions";
import { Prisma } from "@prisma/client";

interface Props {
  searchParams: Promise<{ q?: string; role?: string; nin?: string }>;
}

const roleBadge: Record<string, string> = {
  SUPERUSER: "badge-purple",
  ADMIN: "badge-info",
  AUTHOR: "badge-warning",
  USER: "badge-slate",
};

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;

  const where: Prisma.UserWhereInput = {};
  if (params.q) {
    where.OR = [
      { email: { contains: params.q, mode: "insensitive" } },
      { firstName: { contains: params.q, mode: "insensitive" } },
      { lastName: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.role) where.role = params.role as Prisma.EnumRoleFilter["equals"];
  if (params.nin === "pending") {
    where.ninSubmitted = true;
    where.ninVerified = false;
  }

  const users = await prisma.user.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { reviews: true, savedBrokers: true } } },
  });

  return (
    <div>
      <h1 className="admin-page-title">Users</h1>
      <p className="admin-page-sub">{users.length} total users</p>

      <div className="admin-filter-bar">
        <form method="GET" className="admin-filter-form">
          <input name="q" defaultValue={params.q} placeholder="Search by name or email..." className="admin-filter-input" />
          <select name="role" defaultValue={params.role ?? ""} className="admin-filter-select">
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="AUTHOR">Author</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERUSER">Superuser</option>
          </select>
          <button type="submit" className="admin-filter-submit">Filter</button>
          {(params.q || params.role || params.nin) && (
            <a href="/admin/users" className="admin-filter-clear">Clear</a>
          )}
        </form>
        {params.nin === "pending" && (
          <span className="badge badge-info">Showing NIN pending only</span>
        )}
      </div>

      <div className="admin-card">
        <table className="admin-table">
          <thead className="admin-table-head">
            <tr>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>NIN</th>
              <th>Joined</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="admin-table-row">
                <td>
                  <div className="admin-user-cell">
                    <div className="admin-user-avatar">{user.firstName?.[0] ?? user.email[0].toUpperCase()}</div>
                    <div>
                      <p className="admin-user-name">
                        {user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "(No name)"}
                      </p>
                      <p className="admin-user-email">{user.email}</p>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${roleBadge[user.role] ?? "badge-slate"}`}>{user.role}</span>
                </td>
                <td>
                  <span className={`badge ${user.emailVerified ? "badge-teal" : "badge-warning"}`}>
                    {user.emailVerified ? "Verified" : "Unverified"}
                  </span>
                  {!user.isActive && <span className="badge badge-danger">Suspended</span>}
                </td>
                <td>
                  {user.ninSubmitted ? (
                    <span className={`badge ${user.ninVerified ? "badge-teal" : "badge-warning"}`}>
                      {user.ninVerified ? "Verified" : "Pending"}
                    </span>
                  ) : (
                    <span className="admin-user-email">Not submitted</span>
                  )}
                </td>
                <td className="admin-user-email">{formatDate(user.createdAt)}</td>
                <td>
                  <AdminUserActions user={{ id: user.id, role: user.role, isActive: user.isActive, ninSubmitted: user.ninSubmitted, ninVerified: user.ninVerified, nin: user.nin }} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {users.length === 0 && <div className="admin-empty">No users found</div>}
      </div>
    </div>
  );
}
