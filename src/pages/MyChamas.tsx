import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setMyChamas, setChamaLoading, setChamaError } from '../store/slices/chamaSlice';
import chamaApi from '../services/chamaApi';
import { Gift, AlertCircle, Clock, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const MyChamas = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { myChamas, loading, error } = useSelector((state: RootState) => state.chama);
  const { user, logout } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      navigate('/auth/login');
      return;
    }

    const fetchChamas = async () => {
      try {
        dispatch(setChamaLoading(true));
        setLocalError(null);
        const data = await chamaApi.getMyChamas();
        dispatch(setMyChamas(data));
      } catch (err: any) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout();
          navigate('/auth/login');
          return;
        }

        const errorMessage = err.response?.data?.message || err.message || 'Failed to load chama groups';
        setLocalError(errorMessage);
        dispatch(setChamaError(errorMessage));
      } finally {
        dispatch(setChamaLoading(false));
      }
    };

    fetchChamas();
  }, [user, dispatch, navigate, logout]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (localError) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
          <AlertCircle className="text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Error</h3>
            <p className="text-red-700">{localError}</p>
          </div>
        </div>
      </div>
    );
  }

  if (myChamas.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <Gift className="mx-auto h-16 w-16 text-gray-300 mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">No Chama Groups</h2>
          <p className="text-gray-600 mb-6">You haven't been added to any chama groups yet.</p>
          <p className="text-sm text-gray-500">Contact an administrator to join a group.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Chama Groups</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {myChamas.map((chama) => (
          <div
            key={chama._id}
            onClick={() => navigate(`/chama/${chama._id}`)}
            className="cursor-pointer bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-4">
              <h3 className="text-xl font-bold text-white">{chama.name}</h3>
            </div>

            {/* Body */}
            <div className="p-6 space-y-4">
              {/* Status Badge */}
              <div>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                    chama.status === 'active'
                      ? 'bg-green-100 text-green-800'
                      : chama.status === 'completed'
                      ? 'bg-gray-100 text-gray-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {chama.status.charAt(0).toUpperCase() + chama.status.slice(1)}
                </span>
              </div>

              {/* Details */}
              <div className="space-y-2 text-sm">
                {/* Weekly Contribution */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Weekly Contribution:</span>
                  <span className="font-semibold">KSH {chama.weeklyContribution}</span>
                </div>

                {/* Current Week */}
                {chama.status === 'active' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600 flex items-center gap-1">
                      <Clock size={14} /> Week:
                    </span>
                    <span className="font-semibold">{chama.currentWeek}/10</span>
                  </div>
                )}

                {/* Your Position */}
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 flex items-center gap-1">
                    <Users size={14} /> Your Position:
                  </span>
                  <span className="font-semibold">{chama.userPosition || 'N/A'}</span>
                </div>

                {/* Current Turn */}
                {chama.status === 'active' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Current Turn:</span>
                    <span
                      className={`font-semibold ${
                        chama.currentTurnPosition === chama.userPosition
                          ? 'text-green-600'
                          : 'text-gray-600'
                      }`}
                    >
                      {chama.currentTurnPosition === chama.userPosition
                        ? 'Your Turn!'
                        : `Position ${chama.currentTurnPosition}`}
                    </span>
                  </div>
                )}

                {/* Member Count */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Members:</span>
                  <span className="font-semibold">{chama.members?.length || 0}</span>
                </div>
              </div>

              {/* Action Button */}
              {chama.status === 'active' && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/chama/${chama._id}`);
                  }}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 rounded-lg transition-colors"
                >
                  View Details
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyChamas;
