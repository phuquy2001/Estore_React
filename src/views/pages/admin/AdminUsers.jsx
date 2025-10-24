import { useState, useEffect } from 'react'
import { usersAPI } from '../../../services/apiService'
import { showSuccessToast, showErrorToast } from '../../../services/notificationService'

function AdminUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const response = await usersAPI.getAll()
      setUsers(response.data || [])
    } catch (error) {
      console.error('Failed to load users:', error)
      showErrorToast('Không thể tải danh sách người dùng')
    } finally {
      setLoading(false)
    }
  }

  const handleUpdateRole = async (userId, newRole) => {
    try {
      const user = users.find(u => u.id === userId)
      await usersAPI.update(userId, { ...user, role: newRole })
      showSuccessToast('Cập nhật vai trò thành công')
      loadUsers()
    } catch (error) {
      showErrorToast('Cập nhật vai trò thất bại')
    }
  }

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      const user = users.find(u => u.id === userId)
      await usersAPI.update(userId, { 
        ...user, 
        isActive: !currentStatus 
      })
      showSuccessToast('Cập nhật trạng thái thành công')
      loadUsers()
    } catch (error) {
      showErrorToast('Cập nhật trạng thái thất bại')
    }
  }

  // Filter and sort users
  const filteredUsers = users
    .filter(user => {
      const matchesSearch = 
        user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesRole
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.createdAt) - new Date(a.createdAt)
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt)
        case 'name':
          return a.name?.localeCompare(b.name) || 0
        case 'email':
          return a.email?.localeCompare(b.email) || 0
        default:
          return 0
      }
    })

  // Statistics
  const stats = {
    total: users.length,
    customers: users.filter(u => u.role === 'customer').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.isActive !== false).length,
    inactive: users.filter(u => u.isActive === false).length
  }

  const getRoleBadge = (role) => {
    const badges = {
      admin: { label: 'Admin', color: 'bg-red-100 text-red-800' },
      customer: { label: 'Khách hàng', color: 'bg-blue-100 text-blue-800' }
    }
    const badge = badges[role] || badges.customer
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badge.color}`}>
        {badge.label}
      </span>
    )
  }

  const getStatusBadge = (isActive) => {
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
        isActive !== false ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive !== false ? 'Hoạt động' : 'Không hoạt động'}
      </span>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-slate-600">Đang tải...</p>
      </div>
    )
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold">Quản lý người dùng</h2>
          <p className="text-slate-600 mt-1">Tổng: {users.length} người dùng</p>
        </div>
        <button
          onClick={loadUsers}
          className="btn btn-outline"
        >
          🔄 Làm mới
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Tổng người dùng</div>
          <div className="text-2xl font-bold text-slate-900">{stats.total}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Khách hàng</div>
          <div className="text-2xl font-bold text-blue-600">{stats.customers}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Admin</div>
          <div className="text-2xl font-bold text-red-600">{stats.admins}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Hoạt động</div>
          <div className="text-2xl font-bold text-green-600">{stats.active}</div>
        </div>
        <div className="card p-4">
          <div className="text-sm text-slate-600 mb-1">Không hoạt động</div>
          <div className="text-2xl font-bold text-gray-600">{stats.inactive}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="card p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tên, email..."
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Vai trò
            </label>
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="input"
            >
              <option value="all">Tất cả</option>
              <option value="customer">Khách hàng</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Sắp xếp
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
            >
              <option value="newest">Mới nhất</option>
              <option value="oldest">Cũ nhất</option>
              <option value="name">Tên A-Z</option>
              <option value="email">Email A-Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      {filteredUsers.length === 0 ? (
        <div className="card p-12 text-center">
          <div className="text-4xl mb-4">👥</div>
          <p className="text-slate-600">
            {searchTerm || roleFilter !== 'all'
              ? 'Không tìm thấy người dùng nào'
              : 'Chưa có người dùng nào'}
          </p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Người dùng
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Email
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Vai trò
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Trạng thái
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Ngày tạo
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-700">
                    Hành động
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-slate-200 rounded-full flex items-center justify-center">
                          <span className="text-sm font-semibold text-slate-600">
                            {user.name?.charAt(0)?.toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <div className="font-medium text-sm">{user.name || 'N/A'}</div>
                          <div className="text-xs text-slate-500">ID: {user.id?.slice(0, 8)}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">{user.email}</div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="mb-2">
                        {getRoleBadge(user.role)}
                      </div>
                      <select
                        value={user.role}
                        onChange={(e) => {
                          if (window.confirm('Bạn có chắc muốn thay đổi vai trò người dùng?')) {
                            handleUpdateRole(user.id, e.target.value)
                          }
                        }}
                        className="text-xs border rounded px-2 py-1 w-full"
                      >
                        <option value="customer">Khách hàng</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-4">
                      <div className="mb-2">
                        {getStatusBadge(user.isActive)}
                      </div>
                      <button
                        onClick={() => handleToggleStatus(user.id, user.isActive)}
                        className={`text-xs px-2 py-1 rounded ${
                          user.isActive !== false 
                            ? 'bg-red-100 text-red-800 hover:bg-red-200' 
                            : 'bg-green-100 text-green-800 hover:bg-green-200'
                        }`}
                      >
                        {user.isActive !== false ? 'Vô hiệu hóa' : 'Kích hoạt'}
                      </button>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm">
                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString('vi-VN') : 'N/A'}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            // View user details - could open a modal
                            alert(`Chi tiết người dùng: ${user.name}`)
                          }}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          Xem
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Summary */}
      {filteredUsers.length > 0 && (
        <div className="mt-4 text-sm text-slate-600 text-right">
          Hiển thị {filteredUsers.length} / {users.length} người dùng
        </div>
      )}
    </div>
  )
}

export default AdminUsers
