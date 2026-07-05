// src/app/admin/users/page.tsx
import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/formatters";
import AdminUserActions from "@/components/admin/AdminUserActions";

interface Props {
  searchParams: Promise<{ q?: string; role?: string; nin?: string }>;
}

export default async function AdminUsersPage({ searchParams }: Props) {
  const params = await searchParams;

  const where: any = {};
  if (params.q) {
    where.OR = [
      { email: { contains: params.q, mode: "insensitive" } },
      { firstName: { contains: params.q, mode: "insensitive" } },
      { lastName: { contains: params.q, mode: "insensitive" } },
    ];
  }
  if (params.role) where.role = params.role;
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
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold sw-text-ink">Users</h1>
          <p className="text-gray-500 text-sm mt-1">{users.length} total users</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4 mb-5 flex flex-wrap gap-3">
        <form method="GET" className="flex gap-3 flex-1 flex-wrap">
          <input name="q" defaultValue={params.q} placeholder="Search by name or email..."
            className="flex-1 min-w-48 px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2" />
          <select name="role" defaultValue={params.role ?? ""}
            className="px-4 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none">
            <option value="">All Roles</option>
            <option value="USER">User</option>
            <option value="AUTHOR">Author</option>
            <option value="ADMIN">Admin</option>
            <option value="SUPERUSER">Superuser</option>
          </select>
          <button type="submit" className="px-4 py-2 rounded-xl font-semibold text-white text-sm sw-btn-primary">
            Filter
          </button>
          {(params.q || params.role || params.nin) && (
            <a href="/admin/users" className="px-4 py-2 rounded-xl text-sm text-gray-600 border border-gray-200">Clear</a>
          )}
        </form>
        {params.nin === "pending" && (
          <span className="px-3 py-2 rounded-xl text-xs font-medium sw-badge-info">
            Showing NIN pending only
          </span>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">User</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Role</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">NIN</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Joined</th>
                <th className="text-left px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0 sw-btn-primary">
                        {user.firstName?.[0] ?? user.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {user.firstName ? `${user.firstName} ${user.lastName ?? ""}`.trim() : "(No name)"}
                        </p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
                      background: user.role === "SUPERUSER" ? "var(--color-purple-tint)" : user.role === "ADMIN" ? "var(--color-info-tint)" : user.role === "AUTHOR" ? "var(--color-warning-tint)" : "var(--color-paper-dim)",
                      color: user.role === "SUPERUSER" ? "var(--color-purple-deep)" : user.role === "ADMIN" ? "var(--color-info)" : user.role === "AUTHOR" ? "var(--color-warning)" : "var(--color-ink-soft)",
                    }}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                      background: user.emailVerified ? "var(--color-teal-tint)" : "var(--color-warning-tint)",
                      color: user.emailVerified ? "var(--color-teal-deep)" : "var(--color-warning)",
                    }}>
                      {user.emailVerified ? "Verified" : "Unverified"}
                    </span>
                    {!user.isActive && (
                      <span className="ml-1 text-xs px-2 py-0.5 rounded-full font-medium sw-badge-danger">
                        Suspended
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    {user.ninSubmitted ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{
                        background: user.ninVerified ? "var(--color-teal-tint)" : "var(--color-warning-tint)",
                        color: user.ninVerified ? "var(--color-teal-deep)" : "var(--color-warning)",
                      }}>
                        {user.ninVerified ? "Verified" : "Pending"}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-400">Not submitted</span>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-xs text-gray-500">{formatDate(user.createdAt)}</span>
                  </td>
                  <td className="px-5 py-4">
                    <AdminUserActions user={{ id: user.id, role: user.role, isActive: user.isActive, ninSubmitted: user.ninSubmitted, ninVerified: user.ninVerified, nin: user.nin }} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {users.length === 0 && (
            <div className="py-16 text-center text-gray-400 text-sm">No users found</div>
          )}
        </div>
      </div>
    </div>
  );
}
