import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPendingDoctors();
  }, []);

  const fetchPendingDoctors = async () => {
    try {
      const response = await api.get('/admin/doctors?status=pending');
      setDoctors(response.data.doctors);
    } catch (err) {
      console.error('Failed to fetch doctors:', err);
    }
  };

  const handleReview = async (doctorId, action) => {
    setLoading(true);
    setError('');

    try {
      await api.patch(`/admin/doctors/${doctorId}`, {
        action,
        reviewNotes: `Doctor ${action}d by admin`,
      });
      fetchPendingDoctors();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to review doctor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold">MobiDoc - Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            <h2 className="text-lg font-semibold mb-4">Pending Doctor Reviews</h2>
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                {error}
              </div>
            )}
            {doctors.length === 0 ? (
              <p className="text-gray-500">No pending doctors to review</p>
            ) : (
              <div className="space-y-4">
                {doctors.map((doctor) => (
                  <div
                    key={doctor._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{doctor.name}</p>
                        <p className="text-sm text-gray-600">{doctor.email}</p>
                        <p className="text-sm text-gray-600">Phone: {doctor.phone || 'N/A'}</p>
                        {doctor.specialties && doctor.specialties.length > 0 && (
                          <p className="text-sm text-gray-600">
                            Specialties: {doctor.specialties.join(', ')}
                          </p>
                        )}
                        {doctor.licenseNumber && (
                          <p className="text-sm text-gray-600">
                            License: {doctor.licenseNumber}
                          </p>
                        )}
                        {doctor.kycDocs && doctor.kycDocs.length > 0 && (
                          <div className="mt-2">
                            <p className="text-sm font-medium">KYC Documents:</p>
                            <ul className="text-sm text-gray-600 list-disc list-inside">
                              {doctor.kycDocs.map((doc, idx) => (
                                <li key={idx}>
                                  <a
                                    href={`http://localhost:5000${doc}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-indigo-600 hover:underline"
                                  >
                                    Document {idx + 1}
                                  </a>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleReview(doctor._id, 'approve')}
                          disabled={loading}
                          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => handleReview(doctor._id, 'reject')}
                          disabled={loading}
                          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 disabled:opacity-50"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

