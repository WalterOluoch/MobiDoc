import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { Activity, HeartPulse, Stethoscope, Thermometer, User } from 'lucide-react';

const PatientDashboard = () => {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [specialization, setSpecialization] = useState('');
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const tabRefs = useRef({});

  useEffect(() => {
    if (['home', 'consultation', 'history'].includes(activeTab)) {
      fetchConsultations();
    }
  }, [activeTab]);

  const fetchConsultations = async () => {
    try {
      const response = await api.get('/consultations/my');
      setConsultations(response.data.consultations);
    } catch (err) {
      console.error('Failed to fetch consultations:', err);
    }
  };

  const handleCreateConsultation = async (e) => {
    e.preventDefault();
    if (!specialization) {
      setError('Please select a specialization');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await api.post('/consultations', { specialization });
      setSpecialization('');
      fetchConsultations();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to create consultation');
    } finally {
      setLoading(false);
    }
  };

  const Card = ({ title, children, bgImage, minHeight }) => (
    <div
      className={`relative rounded-lg shadow-lg mb-6 overflow-hidden transform transition-transform hover:scale-105`}
      style={
        bgImage
          ? {
              backgroundImage: `url(${bgImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              minHeight: minHeight || '250px',
            }
          : { minHeight: minHeight || 'auto' }
      }
    >
      {bgImage ? (
        <div
          className="absolute inset-0 bg-black bg-opacity-40 p-6 flex flex-col justify-start text-center text-white"
          style={{ minHeight: minHeight || '250px' }}
        >
          {title && <h2 className="text-2xl md:text-3xl font-bold mb-4 font-serif">{title}</h2>}
          {children}
        </div>
      ) : (
        <div className="bg-white bg-opacity-80 p-6">{children}</div>
      )}
    </div>
  );

  const tabData = {
    about: {
      title: 'About MobiDoc',
      bgImage: '/about.jpg',
      minHeight: '550px',
      content: (
        <p className="text-white font-serif leading-relaxed text-base md:text-lg">
          Welcome to MobiDoc, the ultimate telemedicine platform designed to revolutionize the way patients access healthcare. 
          In a fast-paced world where convenience and reliability are paramount, MobiDoc brings certified doctors directly to your fingertips, 
          empowering you to take control of your health without leaving the comfort of your home. From seamless appointment scheduling 
          and real-time virtual consultations to secure messaging and comprehensive medical record management, our platform ensures 
          every interaction is private, professional, and efficient. We combine cutting-edge technology with compassionate care, 
          enabling personalized health solutions that fit your lifestyle. Whether you are managing chronic conditions, seeking expert advice, 
          or simply monitoring your wellness, MobiDoc offers a trusted, accessible, and intelligent healthcare experience. 
          Our mission is simple: to bridge the gap between patients and healthcare providers, making quality medical care 
          universally available, instantly accessible, and effortlessly manageable. Discover the future of healthcare today 
          with MobiDoc, where your health is our top priority, and excellence meets convenience in every consultation.
        </p>
      ),
    },
    consultation: {
      title: 'Request Consultation',
      bgImage: '/consultation.jpg',
      content: (
        <>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 text-black">
              {error}
            </div>
          )}
          <form onSubmit={handleCreateConsultation} className="space-y-4 text-white">
            <div>
              <label className="block text-sm font-medium">Specialization</label>
              <select
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm text-black"
                required
              >
                <option value="">Select specialization</option>
                <option value="Cardiology">Cardiology</option>
                <option value="General Medicine">General Medicine</option>
                <option value="Pediatrics">Pediatrics</option>
                <option value="Dermatology">Dermatology</option>
                <option value="Orthopedics">Orthopedics</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded font-semibold disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Request Consultation'}
            </button>
          </form>
        </>
      ),
    },
    history: {
      title: 'Consultation History',
      bgImage: '/history.jpg',
      content: (
        <>
          {consultations.length === 0 ? (
            <p className="text-white">No consultations yet.</p>
          ) : (
            <ul className="space-y-2 text-white">
              {consultations.map((c) => (
                <li key={c._id} className="border border-white/50 p-2 rounded">
                  <p>Doctor: {c.doctorId?.name || 'Doctor'}</p>
                  <p>Specialization: {c.specialization}</p>
                  <p>Status: {c.status}</p>
                </li>
              ))}
            </ul>
          )}
        </>
      ),
    },
    profile: {
      title: 'Profile',
      bgImage: '/profile.jpg',
      content: (
        <>
          <p className="text-white">Name: {user?.name}</p>
          <p className="text-white">Email: {user?.email}</p>
          <p className="text-white">Role: {user?.role}</p>
        </>
      ),
    },
  };

  const renderContent = () => {
    if (activeTab === 'home') {
      return (
        <div className="space-y-6 overflow-y-auto max-h-screen pr-2">
          {Object.values(tabData).map((tab, idx) => (
            <Card key={idx} title={tab.title} bgImage={tab.bgImage} minHeight={tab.minHeight}>
              {tab.content}
            </Card>
          ))}
        </div>
      );
    }
    const currentCard = tabData[activeTab];
    return (
      <Card title={currentCard.title} bgImage={currentCard.bgImage} minHeight={currentCard.minHeight}>
        {currentCard.content}
      </Card>
    );
  };

  const sidebarItems = [
    { label: 'Home', icon: <Activity className="inline mr-2" />, tab: 'home' },
    { label: 'About', icon: <Stethoscope className="inline mr-2" />, tab: 'about' },
    { label: 'Consultation', icon: <HeartPulse className="inline mr-2" />, tab: 'consultation' },
    { label: 'History', icon: <Thermometer className="inline mr-2" />, tab: 'history' },
    { label: 'Profile', icon: <User className="inline mr-2" />, tab: 'profile' },
  ];

  return (
    <div
      className="min-h-screen flex font-sans"
      style={{
        backgroundImage: "url('/dashboard-bg.jpg')",
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Sidebar */}
      <aside className="w-64 bg-blue-200 shadow-md flex flex-col">
        <div className="p-6 text-center border-b bg-blue-300">
          <h2 className="text-3xl font-bold mb-1 font-serif">MobiDoc</h2>
          <p className="text-gray-700">{user?.name}</p>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.tab}
              onClick={() => setActiveTab(item.tab)}
              className={`w-full text-left px-4 py-2 rounded hover:bg-blue-300 transition-colors text-lg font-medium ${
                activeTab === item.tab ? 'bg-blue-400 font-bold' : ''
              }`}
            >
              {item.icon} {item.label}
            </button>
          ))}
        </nav>
        <div className="p-4 border-t">
          <button
            onClick={logout}
            className="w-full bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 font-semibold"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 overflow-y-auto">{renderContent()}</main>
    </div>
  );
};

export default PatientDashboard;
