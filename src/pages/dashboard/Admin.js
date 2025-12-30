import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();

  // Authentication check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/admin/login');
    }
  }, [navigate]);

  // Set background
  useEffect(() => {
    document.body.style.background = '#f8f9fa';
    return () => {
      document.body.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
    };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('adminLoggedIn');
    navigate('/admin/login');
  }, [navigate]);

  // Global states
  const [activeTab, setActiveTab] = useState('dashboard');
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Dashboard Stats
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);

  // Users
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [paginationUsers, setPaginationUsers] = useState({ page: 1, limit: 20, total: 0, pages: 1 });
  const [currentPageUsers, setCurrentPageUsers] = useState(1);
  const [searchTermUsers, setSearchTermUsers] = useState('');
  const [roleFilterUsers, setRoleFilterUsers] = useState('all');

  // Settings
  const [settings, setSettings] = useState(null);
  const [loadingSettings, setLoadingSettings] = useState(true);
  const [updatingSettings, setUpdatingSettings] = useState(false);
  const [settingsForm, setSettingsForm] = useState({
    qr_generation_start_time: '',
    qr_generation_end_time: '',
    qr_validity_hours: '',
    machine_enabled: true
  });

  // QR Logs
  const [qrLogs, setQrLogs] = useState([]);
  const [loadingQrLogs, setLoadingQrLogs] = useState(true);
  const [paginationQr, setPaginationQr] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [currentPageQr, setCurrentPageQr] = useState(1);
  const [dateFilterQr, setDateFilterQr] = useState('');
  const [statusFilterQr, setStatusFilterQr] = useState('all');

  // Validation History
  const [validationHistory, setValidationHistory] = useState([]);
  const [loadingValidation, setLoadingValidation] = useState(true);
  const [dateFilterValidation, setDateFilterValidation] = useState('');

  // Audit Logs
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingAudit, setLoadingAudit] = useState(true);
  const [paginationAudit, setPaginationAudit] = useState({ page: 1, limit: 50, total: 0, pages: 1 });
  const [currentPageAudit, setCurrentPageAudit] = useState(1);
  const [actionFilterAudit, setActionFilterAudit] = useState('all');
  const [dateFilterAudit, setDateFilterAudit] = useState('');

  // Modals
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isCreateOperatorModalOpen, setIsCreateOperatorModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedUserToDelete, setSelectedUserToDelete] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);

  // QR Validation Test
  const [qrToValidate, setQrToValidate] = useState('');
  const [validatingQr, setValidatingQr] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  // Create Operator Form
  const [operatorForm, setOperatorForm] = useState({ username: '', password: '', role: 'operator' });

  // Base API URL
  const API_BASE = 'http://192.168.1.26:5001';

  // Fetch Stats
  const fetchStats = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingStats(true);
      const response = await fetch(`${API_BASE}/api/admin/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const { data } = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Stats fetch error:', error);
    } finally {
      setLoadingStats(false);
    }
  }, [token]);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingUsers(true);
      let url = `${API_BASE}/api/admin/users?page=${currentPageUsers}&limit=20`;
      if (searchTermUsers) url += `&search=${encodeURIComponent(searchTermUsers)}`;
      if (roleFilterUsers !== 'all') url += `&role=${roleFilterUsers}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const { data } = await response.json();
        setUsers(data.users.map(u => ({ ...u, createdAt: new Date(u.created_at).toLocaleString() })));
        setPaginationUsers(data.pagination);
      }
    } catch (error) {
      console.error('Users fetch error:', error);
    } finally {
      setLoadingUsers(false);
    }
  }, [token, currentPageUsers, searchTermUsers, roleFilterUsers]);

  // Fetch Settings
  const fetchSettings = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingSettings(true);
      const response = await fetch(`${API_BASE}/api/admin/settings`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const { data } = await response.json();
        setSettings(data);
        setSettingsForm({
          qr_generation_start_time: data.qr_generation_start_time,
          qr_generation_end_time: data.qr_generation_end_time,
          qr_validity_hours: data.qr_validity_hours,
          machine_enabled: data.machine_enabled === 'true'
        });
      }
    } catch (error) {
      console.error('Settings fetch error:', error);
    } finally {
      setLoadingSettings(false);
    }
  }, [token]);

  // Update Settings
  const updateSettings = async (formData) => {
    if (!token) return;
    try {
      setUpdatingSettings(true);
      const response = await fetch(`${API_BASE}/api/admin/settings`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const { data } = await response.json();
        setSettings({ ...settings, ...formData });
        alert('Settings updated successfully!');
        setIsSettingsModalOpen(false);
      }
    } catch (error) {
      console.error('Update settings error:', error);
      alert('Failed to update settings.');
    } finally {
      setUpdatingSettings(false);
    }
  };

  // Fetch QR Logs
  const fetchQrLogs = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingQrLogs(true);
      let url = `${API_BASE}/api/admin/qr-logs?page=${currentPageQr}&limit=50`;
      if (dateFilterQr) url += `&date=${dateFilterQr}`;
      if (statusFilterQr !== 'all') url += `&status=${statusFilterQr}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const { data } = await response.json();
        setQrLogs(data.logs.map(log => ({ ...log, generatedAt: new Date(log.generated_at).toLocaleString(), expiresAt: log.expires_at ? new Date(log.expires_at).toLocaleString() : null, usedAt: log.used_at ? new Date(log.used_at).toLocaleString() : null })));
        setPaginationQr(data.pagination);
      }
    } catch (error) {
      console.error('QR logs fetch error:', error);
    } finally {
      setLoadingQrLogs(false);
    }
  }, [token, currentPageQr, dateFilterQr, statusFilterQr]);

  // Fetch Validation History
  const fetchValidationHistory = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingValidation(true);
      let url = `${API_BASE}/api/validation/history?limit=50`;
      if (dateFilterValidation) url += `&date=${dateFilterValidation}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const { data } = await response.json();
        setValidationHistory(data.records.map(r => ({ ...r, generatedAt: new Date(r.generated_at).toLocaleString(), usedAt: new Date(r.used_at).toLocaleString() })));
      }
    } catch (error) {
      console.error('Validation history fetch error:', error);
    } finally {
      setLoadingValidation(false);
    }
  }, [token, dateFilterValidation]);

  // Validate QR
  const validateQr = async () => {
    if (!token || !qrToValidate) return;
    try {
      setValidatingQr(true);
      const response = await fetch(`${API_BASE}/api/validation/scan`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ qr_code: qrToValidate })
      });
      const result = await response.json();
      setValidationResult(result);
      if (result.success) {
        alert('QR validated successfully!');
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error('QR validation error:', error);
      alert('Validation failed.');
    } finally {
      setValidatingQr(false);
    }
  };

  // Fetch Audit Logs
  const fetchAuditLogs = useCallback(async () => {
    if (!token) return;
    try {
      setLoadingAudit(true);
      let url = `${API_BASE}/api/admin/audit-logs?page=${currentPageAudit}&limit=50`;
      if (actionFilterAudit !== 'all') url += `&action=${actionFilterAudit}`;
      if (dateFilterAudit) url += `&date=${dateFilterAudit}`;
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        const { data } = await response.json();
        setAuditLogs(data.logs.map(log => ({ ...log, createdAt: new Date(log.created_at).toLocaleString() })));
        setPaginationAudit(data.pagination);
      }
    } catch (error) {
      console.error('Audit logs fetch error:', error);
    } finally {
      setLoadingAudit(false);
    }
  }, [token, currentPageAudit, actionFilterAudit, dateFilterAudit]);

  // Delete User
  const deleteUser = async (id) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/api/admin/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      if (response.ok) {
        alert('User deleted successfully!');
        setIsDeleteModalOpen(false);
        fetchUsers(); // Refresh users
      }
    } catch (error) {
      console.error('Delete user error:', error);
      alert('Failed to delete user.');
    }
  };

  // Create Operator
  const createOperator = async (formData) => {
    if (!token) return;
    try {
      const response = await fetch(`${API_BASE}/api/auth/create-operator`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (response.ok) {
        const { data } = await response.json();
        alert('Operator created successfully!');
        setIsCreateOperatorModalOpen(false);
        setOperatorForm({ username: '', password: '', role: 'operator' });
      }
    } catch (error) {
      console.error('Create operator error:', error);
      alert('Failed to create operator.');
    }
  };

  // Effects for fetching data based on tab
  useEffect(() => {
    fetchStats();
    if (activeTab === 'users') fetchUsers();
    if (activeTab === 'settings') fetchSettings();
    if (activeTab === 'qr-logs') fetchQrLogs();
    if (activeTab === 'validation') fetchValidationHistory();
    if (activeTab === 'audit') fetchAuditLogs();
  }, [activeTab, fetchStats, fetchUsers, fetchSettings, fetchQrLogs, fetchValidationHistory, fetchAuditLogs]);

  // Pagination handlers
  const handlePageChangeUsers = (page) => setCurrentPageUsers(page);
  const handlePageChangeQr = (page) => setCurrentPageQr(page);
  const handlePageChangeAudit = (page) => setCurrentPageAudit(page);

  // Reset pages on filter changes
  useEffect(() => { setCurrentPageUsers(1); }, [searchTermUsers, roleFilterUsers]);
  useEffect(() => { setCurrentPageQr(1); }, [dateFilterQr, statusFilterQr]);
  useEffect(() => { setCurrentPageAudit(1); }, [actionFilterAudit, dateFilterAudit]);

  // Render stat value
  const renderStatValue = (key, fallback = 0) => loadingStats ? '...' : (stats?.[key] ?? fallback);

  if (!token) return <div>Loading...</div>;

  return (
    <div className="admin-dashboard">
      <style>{`
        .admin-dashboard { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 1400px; margin: 0 auto; padding: 20px; }
        .dashboard-header { display: flex; justify-content: space-between; align-items: center; background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 30px; }
        .header-left h1 { margin: 0; color: #333; font-size: 28px; }
        .header-left p { margin: 5px 0 0 0; color: #666; font-size: 16px; }
        .tabs { display: flex; gap: 0; background: white; border-radius: 12px 12px 0 0; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 0; }
        .tab-btn { flex: 1; padding: 16px; border: none; background: none; cursor: pointer; font-weight: 500; transition: all 0.2s; border-bottom: 3px solid transparent; }
        .tab-btn.active { background: #f8f9fa; border-bottom-color: #007bff; color: #007bff; }
        .tab-btn:hover { background: #e9ecef; }
        .tab-content { background: white; border-radius: 0 0 12px 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); padding: 20px; }
        .header-actions { display: flex; gap: 10px; }
        .btn { padding: 10px 16px; border: none; border-radius: 6px; cursor: pointer; font-weight: 500; transition: all 0.2s; }
        .btn-primary { background: #007bff; color: white; }
        .btn-primary:hover { background: #0056b3; }
        .btn-outline { background: #f8f9fa; color: #495057; border: 1px solid #dee2e6; }
        .btn-outline:hover { background: #e9ecef; }
        .btn-danger { background: #dc3545; color: white; }
        .btn-danger:hover { background: #c82333; }
        .btn-success { background: #28a745; color: white; }
        .btn-success:hover { background: #218838; }
        .stats-container { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .stat-card { background: white; padding: 24px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); text-align: center; }
        .stat-icon { font-size: 32px; margin-bottom: 10px; }
        .stat-value { font-size: 32px; font-weight: bold; color: #495057; margin: 0 0 8px 0; }
        .stat-title { color: #6c757d; font-size: 14px; margin: 0 0 4px 0; }
        .stat-desc { color: #adb5bd; font-size: 12px; }
        .search-section { background: white; padding: 20px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin-bottom: 20px; display: flex; gap: 15px; align-items: center; flex-wrap: wrap; }
        .search-wrapper { position: relative; flex: 1; min-width: 250px; }
        .search-input { width: 100%; padding: 12px 40px 12px 16px; border: 1px solid #dee2e6; border-radius: 6px; font-size: 14px; }
        .clear-search-btn { position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; font-size: 16px; cursor: pointer; color: #6c757d; }
        .filter-select { padding: 12px; border: 1px solid #dee2e6; border-radius: 6px; background: white; font-size: 14px; }
        .table-container { background: white; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; margin-bottom: 20px; }
        .table-header { padding: 20px; border-bottom: 1px solid #dee2e6; background: #f8f9fa; display: flex; justify-content: space-between; align-items: center; }
        .table-header h2 { margin: 0; color: #333; }
        .user-table, .qr-table, .audit-table { width: 100%; border-collapse: collapse; }
        .user-table th, .user-table td, .qr-table th, .qr-table td, .audit-table th, .audit-table td { padding: 16px; text-align: left; border-bottom: 1px solid #dee2e6; }
        .user-table th, .qr-table th, .audit-table th { background: #f8f9fa; font-weight: 600; color: #495057; }
        .user-cell { display: flex; align-items: center; gap: 12px; }
        .user-avatar-small { width: 32px; height: 32px; border-radius: 50%; background: #e9ecef; display: flex; align-items: center; justify-content: center; font-size: 14px; }
        .type-badge, .status-badge { padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 500; }
        .type-badge.staff { background: #d1ecf1; color: #0c5460; }
        .type-badge.guest { background: #d4edda; color: #155724; }
        .status-badge.used { background: #ffc107; color: #856404; }
        .status-badge.active { background: #d4edda; color: #155724; }
        .status-badge.expired { background: #f8d7da; color: #721c24; }
        .inactive-row { opacity: 0.6; background: #f8f9fa; }
        .btn-icon { background: none; border: none; cursor: pointer; padding: 4px; border-radius: 4px; transition: background 0.2s; margin-right: 5px; }
        .btn-icon:hover { background: #e9ecef; }
        .pagination-container { display: flex; justify-content: center; align-items: center; gap: 10px; padding: 20px; background: #f8f9fa; }
        .pagination-btn, .pagination-number { padding: 8px 12px; border: 1px solid #dee2e6; background: white; border-radius: 6px; cursor: pointer; transition: all 0.2s; }
        .pagination-btn:disabled, .pagination-number:disabled { opacity: 0.5; cursor: not-allowed; }
        .pagination-number.active { background: #007bff; color: white; border-color: #007bff; }
        .pagination-info { font-size: 14px; color: #6c757d; }
        .no-data { text-align: center; padding: 40px; color: #6c757d; }
        .form-group { margin-bottom: 16px; }
        .form-group label { display: block; margin-bottom: 5px; font-weight: 500; color: #495057; }
        .form-group input, .form-group select { width: 100%; padding: 12px; border: 1px solid #dee2e6; border-radius: 6px; font-size: 14px; }
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000; }
        .modal-content { background: white; max-width: 500px; width: 90%; max-height: 90vh; overflow-y: auto; border-radius: 12px; position: relative; padding: 20px; }
        .modal-close { position: absolute; top: 16px; right: 16px; background: none; border: none; font-size: 24px; cursor: pointer; color: #6c757d; }
        .modal-header { display: flex; align-items: center; gap: 16px; padding: 24px 0; border-bottom: 1px solid #dee2e6; }
        .modal-avatar { width: 64px; height: 64px; border-radius: 50%; background: #e9ecef; display: flex; align-items: center; justify-content: center; font-size: 24px; }
        .modal-title { margin: 0; color: #333; }
        .modal-badges { display: flex; gap: 8px; margin-top: 8px; }
        .modal-body { padding: 24px 0; }
        .detail-grid { display: grid; gap: 16px; }
        .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #f1f3f4; }
        .detail-row:last-child { border-bottom: none; }
        .detail-label { font-weight: 600; color: #495057; min-width: 120px; }
        .detail-value { color: #6c757d; text-align: right; }
        .modal-actions { padding: 0 0 24px; text-align: right; gap: 10px; display: flex; justify-content: flex-end; }
        .loading-container { display: flex; flex-direction: column; align-items: center; justify-content: center; height: 300px; }
        .spinner { width: 40px; height: 40px; border: 4px solid #f3f3f3; border-top: 4px solid #3498db; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 16px; }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .qr-validation-section { padding: 20px; background: #f8f9fa; border-radius: 8px; margin-bottom: 20px; }
        .qr-validation-input { padding: 12px; border: 1px solid #dee2e6; border-radius: 6px; margin-right: 10px; }
        .validation-result { margin-top: 10px; padding: 10px; border-radius: 6px; background: #d4edda; color: #155724; }
        .validation-error { background: #f8d7da; color: #721c24; }
        @media (max-width: 768px) { .dashboard-header { flex-direction: column; gap: 16px; text-align: center; } .search-section { flex-direction: column; align-items: stretch; } .stats-container { grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); } .user-table, .qr-table, .audit-table { font-size: 14px; } .user-table th, .user-table td, .qr-table th, .qr-table td, .audit-table th, .audit-table td { padding: 12px 8px; } .tabs { flex-direction: column; } }
      `}</style>

      {/* Header */}
      <header className="dashboard-header">
        <div className="header-left">
          <h1 className="dashboard-title">🏥 Hospital Charity Dashboard</h1>
          <p className="dashboard-subtitle">Food Distribution Management System</p>
          {stats && <p className="dashboard-date">📅 Updated: {stats.date}</p>}
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => setIsSettingsModalOpen(true)}>⚙️ Settings</button>
          <button className="btn btn-outline" onClick={() => setIsCreateOperatorModalOpen(true)}>👤 Create Operator</button>
          <button className="btn btn-outline" onClick={() => alert('Export coming soon!')}>📊 Export</button>
          <button className="btn btn-danger" onClick={handleLogout}>🚪 Logout</button>
        </div>
      </header>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab-btn ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>📊 Dashboard</button>
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>👥 Users</button>
        <button className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>⚙️ Settings</button>
        <button className={`tab-btn ${activeTab === 'qr-logs' ? 'active' : ''}`} onClick={() => setActiveTab('qr-logs')}>🆔 QR Logs</button>
        <button className={`tab-btn ${activeTab === 'validation' ? 'active' : ''}`} onClick={() => setActiveTab('validation')}>✅ Validation</button>
        <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>🔍 Audit Logs</button>
      </div>

      {/* Tab Content */}
      <div className="tab-content">
        {activeTab === 'dashboard' && (
          <>
            {loadingStats ? (
              <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading stats...</p>
              </div>
            ) : (
              <section className="stats-container">
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <h3 className="stat-value">{renderStatValue('total_users')}</h3>
                  <p className="stat-title">Total Users</p>
                  <small className="stat-desc">All registered users</small>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">📅</div>
                  <h3 className="stat-value">{renderStatValue('today_registrations')}</h3>
                  <p className="stat-title">Today Registrations</p>
                  <small className="stat-desc">New sign-ups today</small>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">🆔</div>
                  <h3 className="stat-value">{renderStatValue('today_qr_generated')}</h3>
                  <p className="stat-title">Today QR Generated</p>
                  <small className="stat-desc">QRs created today</small>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">✅</div>
                  <h3 className="stat-value">{renderStatValue('active_qrs')}</h3>
                  <p className="stat-title">Active QRs</p>
                  <small className="stat-desc">Ready for use</small>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">☑️</div>
                  <h3 className="stat-value">{renderStatValue('today_qr_used')}</h3>
                  <p className="stat-title">Used Qr</p>
                  <small className="stat-desc">Redeemed QRs</small>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">❌</div>
                  <h3 className="stat-value">{renderStatValue('expired_qrs_today')}</h3>
                  <p className="stat-title">Expired QRs Today</p>
                  <small className="stat-desc">Expired coupons</small>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👨‍⚕️</div>
                  <h3 className="stat-value">{renderStatValue('staff_count')}</h3>
                  <p className="stat-title">Staff Count</p>
                  <small className="stat-desc">Hospital staff users</small>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👤</div>
                  <h3 className="stat-value">{renderStatValue('guest_count')}</h3>
                  <p className="stat-title">Guest Count</p>
                  <small className="stat-desc">External guests</small>
                </div>
              </section>
            )}
          </>
        )}

        {activeTab === 'users' && (
          <>
            <section className="search-section">
              <div className="search-wrapper">
                <input
                  type="text"
                  className="search-input"
                  placeholder="🔍 Search by name or mobile..."
                  value={searchTermUsers}
                  onChange={(e) => setSearchTermUsers(e.target.value)}
                />
                {searchTermUsers && <button className="clear-search-btn" onClick={() => setSearchTermUsers('')}>✕</button>}
              </div>
              <select className="filter-select" value={roleFilterUsers} onChange={(e) => setRoleFilterUsers(e.target.value)}>
                <option value="all">All Roles</option>
                <option value="staff">Staff</option>
                <option value="guest">Guest</option>
              </select>
              <button className="btn btn-primary" onClick={fetchUsers}>Refresh</button>
            </section>
            <section className="table-container">
              <div className="table-header">
                <h2>👥 Users List ({paginationUsers.total} total)</h2>
              </div>
              {loadingUsers ? (
                <div className="loading-container"><div className="spinner"></div><p>Loading users...</p></div>
              ) : (
                <>
                  <table className="user-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Name</th>
                        <th>Role</th>
                        <th>Mobile</th>
                        <th>Created At</th>
                        <th>Active</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length > 0 ? users.map(user => (
                        <tr key={user.id}>
                          <td>{user.id}</td>
                          <td>{user.full_name}</td>
                          <td><span className={`type-badge ${user.role}`}>{user.role}</span></td>
                          <td>{user.mobile_number}</td>
                          <td>{user.createdAt}</td>
                          <td>{user.is_active ? 'Yes' : 'No'}</td>
                          <td>
                            <button className="btn-icon" onClick={() => { setSelectedUser(user); setIsUserModalOpen(true); }}>ℹ️</button>
                            <button className="btn-icon" onClick={() => { setSelectedUserToDelete(user); setIsDeleteModalOpen(true); }}>🗑️</button>
                          </td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="no-data">No users found.</td></tr>
                      )}
                    </tbody>
                  </table>
                  {paginationUsers.pages > 1 && (
                    <div className="pagination-container">
                      <button className="pagination-btn" onClick={() => handlePageChangeUsers(currentPageUsers - 1)} disabled={currentPageUsers === 1}>&lt; Prev</button>
                      <span className="pagination-info">Page {currentPageUsers} of {paginationUsers.pages}</span>
                      {[...Array(5)].map((_, i) => {
                        const page = Math.max(1, Math.min(paginationUsers.pages, currentPageUsers - 2 + i));
                        return <button key={page} className={`pagination-number ${currentPageUsers === page ? 'active' : ''}`} onClick={() => handlePageChangeUsers(page)}>{page}</button>;
                      })}
                      <button className="pagination-btn" onClick={() => handlePageChangeUsers(currentPageUsers + 1)} disabled={currentPageUsers === paginationUsers.pages}>Next &gt;</button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        {activeTab === 'settings' && (
          <>
            {loadingSettings ? (
              <div className="loading-container"><div className="spinner"></div><p>Loading settings...</p></div>
            ) : (
              <div className="table-container">
                <div className="table-header">
                  <h2>⚙️ System Settings</h2>
                  <button className="btn btn-success" onClick={() => setIsSettingsModalOpen(true)}>Edit Settings</button>
                </div>
                <div className="modal-body" style={{ padding: '24px' }}>
                  <div className="detail-grid">
                    <div className="detail-row">
                      <span className="detail-label">QR Start Time:</span>
                      <span className="detail-value">{settings?.qr_generation_start_time}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">QR End Time:</span>
                      <span className="detail-value">{settings?.qr_generation_end_time}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">QR Validity (hrs):</span>
                      <span className="detail-value">{settings?.qr_validity_hours}</span>
                    </div>
                    <div className="detail-row">
                      <span className="detail-label">Machine Enabled:</span>
                      <span className="detail-value">{settings?.machine_enabled === 'true' ? 'Yes' : 'No'}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'qr-logs' && (
          <>
            <section className="search-section">
              <input type="date" className="filter-select" value={dateFilterQr} onChange={(e) => setDateFilterQr(e.target.value)} />
              <select className="filter-select" value={statusFilterQr} onChange={(e) => setStatusFilterQr(e.target.value)}>
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="used">Used</option>
                <option value="expired">Expired</option>
              </select>
              <button className="btn btn-primary" onClick={fetchQrLogs}>Refresh</button>
            </section>
            <section className="table-container">
              <div className="table-header">
                <h2>🆔 QR Generation Logs ({paginationQr.total} total)</h2>
              </div>
              {loadingQrLogs ? (
                <div className="loading-container"><div className="spinner"></div><p>Loading QR logs...</p></div>
              ) : (
                <>
                  <table className="qr-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>QR Code</th>
                        <th>Status</th>
                        <th>User</th>
                        <th>Generated At</th>
                        <th>Expires At</th>
                        <th>Used At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {qrLogs.length > 0 ? qrLogs.map(log => (
                        <tr key={log.id}>
                          <td>{log.id}</td>
                          <td>{log.qr_code}</td>
                          <td><span className={`status-badge ${log.status}`}>{log.status}</span></td>
                          <td>{log.full_name} ({log.mobile_number})</td>
                          <td>{log.generatedAt}</td>
                          <td>{log.expiresAt}</td>
                          <td>{log.usedAt || 'N/A'}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="no-data">No QR logs found.</td></tr>
                      )}
                    </tbody>
                  </table>
                  {paginationQr.pages > 1 && (
                    <div className="pagination-container">
                      <button className="pagination-btn" onClick={() => handlePageChangeQr(currentPageQr - 1)} disabled={currentPageQr === 1}>&lt; Prev</button>
                      <span className="pagination-info">Page {currentPageQr} of {paginationQr.pages}</span>
                      {[...Array(5)].map((_, i) => {
                        const page = Math.max(1, Math.min(paginationQr.pages, currentPageQr - 2 + i));
                        return <button key={page} className={`pagination-number ${currentPageQr === page ? 'active' : ''}`} onClick={() => handlePageChangeQr(page)}>{page}</button>;
                      })}
                      <button className="pagination-btn" onClick={() => handlePageChangeQr(currentPageQr + 1)} disabled={currentPageQr === paginationQr.pages}>Next &gt;</button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}

        {activeTab === 'validation' && (
          <>
            <section className="search-section">
              <input type="date" className="filter-select" value={dateFilterValidation} onChange={(e) => setDateFilterValidation(e.target.value)} />
              <button className="btn btn-primary" onClick={fetchValidationHistory}>Refresh History</button>
            </section>
            <section className="table-container">
              <div className="table-header">
                <h2>✅ Validation History ({validationHistory.length} records)</h2>
              </div>
              {loadingValidation ? (
                <div className="loading-container"><div className="spinner"></div><p>Loading history...</p></div>
              ) : (
                <table className="qr-table">
                  <thead>
                    <tr>
                      <th>QR Code</th>
                      <th>User</th>
                      <th>Status</th>
                      <th>Generated At</th>
                      <th>Used At</th>
                      <th>Scanned By</th>
                    </tr>
                  </thead>
                  <tbody>
                    {validationHistory.length > 0 ? validationHistory.map(record => (
                      <tr key={record.qr_code}>
                        <td>{record.qr_code}</td>
                        <td>{record.full_name} ({record.mobile_number})</td>
                        <td><span className="status-badge used">Used</span></td>
                        <td>{record.generatedAt}</td>
                        <td>{record.usedAt}</td>
                        <td>{record.scanned_by}</td>
                      </tr>
                    )) : (
                      <tr><td colSpan="6" className="no-data">No validation history.</td></tr>
                    )}
                  </tbody>
                </table>
              )}
            </section>
            <div className="qr-validation-section">
              <h3>🧪 Test QR Validation</h3>
              <input
                type="text"
                className="qr-validation-input"
                placeholder="Enter QR code to validate..."
                value={qrToValidate}
                onChange={(e) => setQrToValidate(e.target.value)}
              />
              <button className="btn btn-primary" onClick={validateQr} disabled={validatingQr || !qrToValidate}>
                {validatingQr ? 'Validating...' : 'Validate QR'}
              </button>
              {validationResult && (
                <div className={`validation-result ${!validationResult.success ? 'validation-error' : ''}`}>
                  {validationResult.success ? '✅ Valid!' : `❌ ${validationResult.message}`}
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'audit' && (
          <>
            <section className="search-section">
              <select className="filter-select" value={actionFilterAudit} onChange={(e) => setActionFilterAudit(e.target.value)}>
                <option value="all">All Actions</option>
                <option value="REGISTER_USER">Register User</option>
                <option value="GENERATE_QR">Generate QR</option>
                <option value="UPDATE_SETTINGS">Update Settings</option>
              </select>
              <input type="date" className="filter-select" value={dateFilterAudit} onChange={(e) => setDateFilterAudit(e.target.value)} />
              <button className="btn btn-primary" onClick={fetchAuditLogs}>Refresh</button>
            </section>
            <section className="table-container">
              <div className="table-header">
                <h2>🔍 Audit Logs ({paginationAudit.total} total)</h2>
              </div>
              {loadingAudit ? (
                <div className="loading-container"><div className="spinner"></div><p>Loading audit logs...</p></div>
              ) : (
                <>
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Action</th>
                        <th>Entity</th>
                        <th>Performed By</th>
                        <th>Details</th>
                        <th>IP</th>
                        <th>Created At</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length > 0 ? auditLogs.map(log => (
                        <tr key={log.id}>
                          <td>{log.id}</td>
                          <td>{log.action}</td>
                          <td>{log.entity_type} #{log.entity_id}</td>
                          <td>{log.performed_by_username}</td>
                          <td>{JSON.parse(log.details || '{}').mobile_number || 'N/A'}</td>
                          <td>{log.ip_address}</td>
                          <td>{log.createdAt}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="7" className="no-data">No audit logs.</td></tr>
                      )}
                    </tbody>
                  </table>
                  {paginationAudit.pages > 1 && (
                    <div className="pagination-container">
                      <button className="pagination-btn" onClick={() => handlePageChangeAudit(currentPageAudit - 1)} disabled={currentPageAudit === 1}>&lt; Prev</button>
                      <span className="pagination-info">Page {currentPageAudit} of {paginationAudit.pages}</span>
                      {[...Array(5)].map((_, i) => {
                        const page = Math.max(1, Math.min(paginationAudit.pages, currentPageAudit - 2 + i));
                        return <button key={page} className={`pagination-number ${currentPageAudit === page ? 'active' : ''}`} onClick={() => handlePageChangeAudit(page)}>{page}</button>;
                      })}
                      <button className="pagination-btn" onClick={() => handlePageChangeAudit(currentPageAudit + 1)} disabled={currentPageAudit === paginationAudit.pages}>Next &gt;</button>
                    </div>
                  )}
                </>
              )}
            </section>
          </>
        )}
      </div>

      {/* Settings Modal */}
      {isSettingsModalOpen && (
        <div className="modal-overlay" onClick={() => setIsSettingsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsSettingsModalOpen(false)}>&times;</button>
            <div className="modal-header">
              <h2 className="modal-title">⚙️ Update System Settings</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); updateSettings(settingsForm); }}>
                <div className="form-group">
                  <label>QR Generation Start Time (HH:MM:SS)</label>
                  <input type="time" value={settingsForm.qr_generation_start_time} onChange={(e) => setSettingsForm({ ...settingsForm, qr_generation_start_time: e.target.value + ':00' })} required />
                </div>
                <div className="form-group">
                  <label>QR Generation End Time (HH:MM:SS)</label>
                  <input type="time" value={settingsForm.qr_generation_end_time} onChange={(e) => setSettingsForm({ ...settingsForm, qr_generation_end_time: e.target.value + ':00' })} required />
                </div>
                <div className="form-group">
                  <label>QR Validity (hours)</label>
                  <input type="number" value={settingsForm.qr_validity_hours} onChange={(e) => setSettingsForm({ ...settingsForm, qr_validity_hours: e.target.value })} required min="1" />
                </div>
                <div className="form-group">
                  <label>Machine Enabled</label>
                  <select value={settingsForm.machine_enabled} onChange={(e) => setSettingsForm({ ...settingsForm, machine_enabled: e.target.value === 'true' })}>
                    <option value={true}>Yes</option>
                    <option value={false}>No</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setIsSettingsModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={updatingSettings}>
                    {updatingSettings ? 'Updating...' : 'Update'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Create Operator Modal */}
      {isCreateOperatorModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOperatorModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsCreateOperatorModalOpen(false)}>&times;</button>
            <div className="modal-header">
              <h2 className="modal-title">👤 Create New Operator</h2>
            </div>
            <div className="modal-body">
              <form onSubmit={(e) => { e.preventDefault(); createOperator(operatorForm); }}>
                <div className="form-group">
                  <label>Username</label>
                  <input type="text" value={operatorForm.username} onChange={(e) => setOperatorForm({ ...operatorForm, username: e.target.value })} required />
                </div>
                <div className="form-group">
                  <label>Password</label>
                  <input type="password" value={operatorForm.password} onChange={(e) => setOperatorForm({ ...operatorForm, password: e.target.value })} required minLength="6" />
                </div>
                <div className="form-group">
                  <label>Role</label>
                  <select value={operatorForm.role} onChange={(e) => setOperatorForm({ ...operatorForm, role: e.target.value })} disabled>
                    <option value="operator">Operator</option>
                  </select>
                </div>
                <div className="modal-actions">
                  <button type="button" className="btn btn-outline" onClick={() => setIsCreateOperatorModalOpen(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete User Modal */}
      {isDeleteModalOpen && selectedUserToDelete && (
        <div className="modal-overlay" onClick={() => setIsDeleteModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsDeleteModalOpen(false)}>&times;</button>
            <div className="modal-header">
              <h2 className="modal-title">🗑️ Delete User</h2>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to delete <strong>{selectedUserToDelete.full_name}</strong>? This will remove all related data including face images and QR codes.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-outline" onClick={() => setIsDeleteModalOpen(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={() => deleteUser(selectedUserToDelete.id)}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* User Details Modal */}
      {isUserModalOpen && selectedUser && (
        <div className="modal-overlay" onClick={() => setIsUserModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setIsUserModalOpen(false)}>&times;</button>
            <div className="modal-header">
              <div className="modal-avatar">👤</div>
              <div>
                <h2 className="modal-title">{selectedUser.full_name}</h2>
                <div className="modal-badges">
                  <span className={`type-badge ${selectedUser.role}`}>{selectedUser.role}</span>
                  <span className={`status-badge ${selectedUser.is_active ? 'valid' : 'invalid'}`}>{selectedUser.is_active ? 'Active' : 'Inactive'}</span>
                </div>
              </div>
            </div>
            <div className="modal-body">
              <div className="detail-grid">
                <div className="detail-row">
                  <span className="detail-label">ID:</span>
                  <span className="detail-value">{selectedUser.id}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Mobile:</span>
                  <span className="detail-value">{selectedUser.mobile_number}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Email:</span>
                  <span className="detail-value">{selectedUser.email || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Department:</span>
                  <span className="detail-value">{selectedUser.department || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Guest Type:</span>
                  <span className="detail-value">{selectedUser.guest_type || 'N/A'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Active:</span>
                  <span className="detail-value">{selectedUser.is_active ? 'Yes' : 'No'}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Created:</span>
                  <span className="detail-value">{selectedUser.createdAt}</span>
                </div>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => setIsUserModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Admin;