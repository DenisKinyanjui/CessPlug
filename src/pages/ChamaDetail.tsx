import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { setSelectedChama, setEligibility, setChamaLoading } from '../store/slices/chamaSlice';
import chamaApi from '../services/chamaApi';
import { ArrowLeft, AlertCircle, CheckCircle, XCircle, Users, BarChart3 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const ChamaDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selectedChama, eligibility, loading } = useSelector((state: RootState) => state.chama);
  const { user: currentUser, logout } = useAuth();
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      navigate('/chamas');
      return;
    }

    const fetchDetails = async () => {
      try {
        dispatch(setChamaLoading(true));
        setLocalError(null);

        // Fetch group details
        const groupData = await chamaApi.getChamaById(id);
        dispatch(setSelectedChama(groupData));

        // Fetch eligibility
        const eligibilityData = await chamaApi.checkChamaEligibility(id);
        dispatch(setEligibility(eligibilityData));
      } catch (err: any) {
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          logout();
          navigate('/auth/login');
          return;
        }
        setLocalError(err.message || 'Failed to load chama group details');
      } finally {
        dispatch(setChamaLoading(false));
      }
    };

    fetchDetails();
  }, [id, dispatch, navigate, logout]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (localError || !selectedChama) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate('/chamas')}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6"
        >
          <ArrowLeft size={20} />
          Back to My Chamas
        </button>
        {localError && (
          <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-lg p-4">
            <AlertCircle className="text-red-600" />
            <p className="text-red-700">{localError}</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back Button */}
      <button
        onClick={() => navigate('/chamas')}
        className="flex items-center gap-2 text-blue-600 hover:text-blue-800 mb-6 font-medium"
      >
        <ArrowLeft size={20} />
        Back to My Chamas
      </button>

      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 mb-6 text-white">
        <h1 className="text-3xl font-bold mb-2">{selectedChama.name}</h1>
        <p className="text-blue-100">{selectedChama.description || 'Group-based rotating purchase system'}</p>
      </div>

      {/* Eligibility Alert */}
      {eligibility && (
        <div
          className={`mb-6 rounded-lg p-4 flex items-start gap-3 ${
            eligibility.eligible
              ? 'bg-green-50 border border-green-200'
              : 'bg-yellow-50 border border-yellow-200'
          }`}
        >
          {eligibility.eligible ? (
            <>
              <CheckCircle className="text-green-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-green-800">You are eligible to redeem!</h3>
                <p className="text-green-700 text-sm">
                  You can redeem up to KSH {eligibility.maxRedemptionAmount} from chama credit.
                </p>
              </div>
            </>
          ) : (
            <>
              <AlertCircle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-800">Not eligible for redemption</h3>
                <p className="text-yellow-700 text-sm">{eligibility.reason}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Group Stats */}
      {selectedChama.status === 'active' && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Current Week</div>
            <div className="text-2xl font-bold text-gray-900">{selectedChama.currentWeek}/10</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Current Turn Position</div>
            <div className="text-2xl font-bold text-gray-900">{selectedChama.currentTurnPosition}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Weekly Contribution</div>
            <div className="text-2xl font-bold text-gray-900">KSH {selectedChama.weeklyContribution}</div>
          </div>
          <div className="bg-white rounded-lg p-4 border border-gray-200">
            <div className="text-sm text-gray-600">Total Members</div>
            <div className="text-2xl font-bold text-gray-900">{selectedChama.members?.length || 0}</div>
          </div>
        </div>
      )}

      {/* Members Section */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={24} />
            Group Members
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-100 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Position</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Member Name</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Status</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">Turn Indicator</th>
              </tr>
            </thead>
            <tbody>
              {selectedChama.members?.map((member: any) => (
                <tr
                  key={member.userId}
                  className={
                    selectedChama.currentTurnPosition === member.position
                      ? 'bg-green-50 border-b border-gray-200'
                      : 'border-b border-gray-200'
                  }
                >
                  <td className="px-6 py-4 text-sm font-bold text-gray-900">{member.position}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {member.userId?.name || member.userName || 'User'}
                    {currentUser && typeof member.userId === 'object' && member.userId?._id === currentUser._id && ' (You)'}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <span className="inline-block px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {selectedChama.currentTurnPosition === member.position ? (
                      <div className="flex items-center gap-2">
                        <CheckCircle className="text-green-600" size={18} />
                        <span className="text-sm font-semibold text-green-600">Your Turn</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Waiting</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Action Buttons */}
      {selectedChama.status === 'active' && eligibility?.eligible && (
        <div className="flex gap-4">
          <button
            onClick={() => navigate('/products')}
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            Browse Products to Redeem
          </button>
        </div>
      )}

      {selectedChama.status !== 'active' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-800">
            This chama group is not currently active. Check back later when the group is activated.
          </p>
        </div>
      )}
    </div>
  );
};

export default ChamaDetail;
