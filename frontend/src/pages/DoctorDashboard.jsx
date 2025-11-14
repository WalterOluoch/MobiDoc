import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const DoctorDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchConsultations();
  }, []);

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations/my');
      setConsultations(response.data.consultations);
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
    }
  };

  const handleStatusUpdate = async (consultationId, newStatus) => {
    setLoading(true);
    try {
      await api.patch(`/consultations/${consultationId}/status`, { status: newStatus });
      fetchConsultations();
    } catch (err) {
      console.error('Failed to update status:', err);
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
              <h1 className="text-xl font-bold">MobiDoc - Doctor Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, Dr. {user?.name}</span>
              {user?.kycStatus !== 'approved' && (
                <span className="text-yellow-600 text-sm">
                  KYC Status: {user?.kycStatus}
                </span>
              )}
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
            <h2 className="text-lg font-semibold mb-4">My Consultations</h2>
            {consultations.length === 0 ? (
              <p className="text-gray-500">No consultations assigned yet</p>
            ) : (
              <div className="space-y-4">
                {consultations.map((consultation) => (
                  <div
                    key={consultation._id}
                    className="border border-gray-200 rounded-lg p-4"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <p className="font-medium">
                          Patient: {consultation.patientId?.name || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-600">
                          Specialization: {consultation.specialization}
                        </p>
                        <p className="text-sm text-gray-500">
                          Status: <span className="font-medium">{consultation.status}</span>
                        </p>
                        <p className="text-xs text-gray-400">
                          Created: {new Date(consultation.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        {consultation.status === 'pending' && (
                          <button
                            onClick={() => handleStatusUpdate(consultation._id, 'active')}
                            disabled={loading}
                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 disabled:opacity-50"
                          >
                            Accept
                          </button>
                        )}
                        <button
                          onClick={() => navigate(`/chat/${consultation._id}`)}
                          className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700"
                        >
                          Open Chat
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

export default DoctorDashboard;

