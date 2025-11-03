import { useEffect, useState } from "react";
import axios from "axios";

function App() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredRow, setHoveredRow] = useState(null);
  const [checkedInToday, setCheckedInToday] = useState(false);
  const [checkInLoading, setCheckInLoading] = useState(false);
  const [checkInMessage, setCheckInMessage] = useState("");

  const BACKEND_URL = "https://backend-4ave.onrender.com";

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const username = urlParams.get('username');
    
    if (username) {
      setCurrentUser(username);
      axios.get(`${BACKEND_URL}/api/points/${username}`)
        .then(() => {
          loadLeaderboard();
        })
        .catch(console.error);
    } else {
      loadLeaderboard();
    }

    // Check if user already checked in today
    const lastCheckIn = localStorage.getItem('lastCheckIn');
    if (lastCheckIn === new Date().toDateString()) {
      setCheckedInToday(true);
    }
  }, []);

  const loadLeaderboard = () => {
    setIsLoading(true);
    axios.get(`${BACKEND_URL}/api/leaderboard`)
      .then(res => {
        console.log("Leaderboard data:", res.data);
        setLeaderboard(res.data);
        setTimeout(() => setIsLoading(false), 600);
      })
      .catch(console.error);
  };

  const handleDailyCheckIn = async () => {
    if (!currentUser || checkedInToday || checkInLoading) return;

    setCheckInLoading(true);
    setCheckInMessage("");
    
    try {
      const response = await axios.post(`${BACKEND_URL}/api/checkin/${currentUser}`);
      
      if (response.data.success) {
        const updatedLeaderboard = leaderboard.map(user => {
          if (user.username === currentUser) {
            return {
              ...user,
              points: response.data.newPoints,
              dailyCheckIns: (user.dailyCheckIns || 0) + 1
            };
          }
          return user;
        });

        const sortedLeaderboard = updatedLeaderboard.sort((a, b) => (b.points || 0) - (a.points || 0));
        setLeaderboard(sortedLeaderboard);
        
        setCheckedInToday(true);
        localStorage.setItem('lastCheckIn', new Date().toDateString());
        
        setCheckInMessage("Points received for today! +1 point added!");
        setTimeout(() => setCheckInMessage(""), 3000);
      }
    } catch (error) {
      console.error('Check-in failed:', error);
      setCheckInMessage("Check-in failed. Please try again.");
      setTimeout(() => setCheckInMessage(""), 3000);
    } finally {
      setCheckInLoading(false);
    }
  };

  const getRankBadge = (index) => {
    switch(index) {
      case 0: 
        return (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 1a1 1 0 011 1v1a1 1 0 11-2 0V2a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
          </svg>
        );
      case 1: 
        return (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      case 2: 
        return (
          <svg className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
          </svg>
        );
      default: return null;
    }
  };

  const getRankColor = (index) => {
    switch(index) {
      case 0: return "from-yellow-400 to-yellow-500 text-yellow-900";
      case 1: return "from-gray-300 to-gray-400 text-gray-700";
      case 2: return "from-amber-600 to-amber-700 text-amber-100";
      default: return "from-white/10 to-white/5 text-gray-300";
    }
  };

  const getDisplayName = (user) => {
    return user.username || user.id || "Unknown User";
  };

  return (
    <div className="min-h-screen w-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white relative overflow-x-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{animationDelay: '2000ms'}}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse" style={{animationDelay: '4000ms'}}></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col px-2 sm:px-4">
        {/* Header */}
        <div className="flex-1 container mx-auto px-2 sm:px-4 py-4 sm:py-8 flex flex-col">
          <div className="text-center mb-4 sm:mb-8 animate-fade-in">
            <div className="inline-block mb-2 sm:mb-4">
              <div className="w-20 h-20 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-2 sm:mb-4 shadow-2xl"><img src="/public/logo.png" alt="" /></div>
            </div>
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-300 to-pink-300 mb-2 sm:mb-4">
              Developers Leaderboard
            </h1>
            <p className="text-sm sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed px-2">
              Compete with developers worldwide. Showcase your contributions and climb the ranks.
            </p>
          </div>

          {/* User Welcome & Auth Section */}
          <div className="w-full max-w-2xl mx-auto mb-4 sm:mb-8 animate-slide-down">
            {currentUser && (
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 sm:p-6 mb-4 sm:mb-6 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm sm:text-lg">🎉</span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm sm:text-base">Welcome back!</h3>
                      <p className="text-gray-300 text-xs sm:text-sm">@{currentUser}</p>
                    </div>
                  </div>
                  <div className="w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping"></div>
                </div>
              </div>
            )}

            {checkInMessage && (
              <div className={`mb-4 p-3 rounded-lg text-center ${
                checkInMessage.includes("successful") 
                  ? "bg-green-600/20 border border-green-500 text-green-300" 
                  : "bg-red-600/20 border border-red-500 text-red-300"
              }`}>
                {checkInMessage}
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              <a
                href={`${BACKEND_URL}/auth/github`}
                className="group relative overflow-hidden bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2 sm:space-x-3 w-full sm:flex-1 max-w-md text-sm sm:text-base"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
                </svg>
                <span>
                  {currentUser ? "Refresh Stats" : "Login with GitHub"}
                </span>
              </a>

              {currentUser && (
                <button
                  onClick={handleDailyCheckIn}
                  disabled={checkedInToday || checkInLoading}
                  className={`group relative overflow-hidden font-semibold py-3 sm:py-4 px-6 sm:px-8 rounded-2xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center justify-center space-x-2 sm:space-x-3 w-full sm:flex-1 max-w-md text-sm sm:text-base ${
                    checkedInToday 
                      ? 'bg-green-600 cursor-not-allowed' 
                      : checkInLoading
                      ? 'bg-gradient-to-r from-yellow-600 to-orange-600 cursor-wait'
                      : 'bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700'
                  }`}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                  {checkInLoading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </div>
                  ) : (
                    <span>
                      {checkedInToday ? 'Points Received Today' : 'Daily Check-in (+1)'}
                    </span>
                  )}
                </button>
              )}
            </div>
          </div>

          {/* Leaderboard Table */}
          <div className="flex-1 w-full max-w-7xl mx-auto animate-fade-in-up">
            <div className="bg-white/5 backdrop-blur-lg rounded-2xl sm:rounded-3xl border border-white/10 shadow-2xl overflow-hidden h-full">
              {/* Table Header - Hidden on mobile, shown on sm and up */}
              <div className="hidden sm:block bg-gradient-to-r from-purple-600/20 to-indigo-600/20 border-b border-white/10 p-4 sm:p-6">
                <div className="grid grid-cols-12 gap-3 sm:gap-4 text-xs sm:text-sm font-semibold text-gray-300 uppercase tracking-wider">
                  <div className="col-span-2 sm:col-span-1 text-center">Rank</div>
                  <div className="col-span-6 sm:col-span-5">Developer</div>
                  <div className="col-span-2 text-center">Repos</div>
                  <div className="col-span-2 text-center">Commits</div>
                  <div className="col-span-2 text-center">Points</div>
                </div>
              </div>

              {isLoading && (
                <div className="p-6 sm:p-8 text-center">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                  </div>
                  <p className="text-gray-400 mt-2 text-sm sm:text-base">Loading leaderboard...</p>
                </div>
              )}

              <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                {leaderboard.map((user, index) => (
                  <div
                    key={user.username || user.id}
                    className={`group transition-all duration-300 hover:bg-white/10 ${
                      user.username === currentUser ? 'bg-gradient-to-r from-purple-500/10 to-pink-500/10' : ''
                    } ${hoveredRow === index ? 'bg-white/10' : ''}`}
                    onMouseEnter={() => setHoveredRow(index)}
                    onMouseLeave={() => setHoveredRow(null)}
                  >
                    {/* Mobile Layout */}
                    <div className="sm:hidden p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-3">
                          <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-xs bg-gradient-to-r ${getRankColor(index)} shadow-lg`}>
                            {index + 1}
                          </div>
                          <div className="flex items-center space-x-2">
                            {index < 3 && (
                              <div className="w-6 h-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-xs shadow-lg">
                                {getRankBadge(index)}
                              </div>
                            )}
                            <div>
                              <h3 className="font-semibold text-white text-sm flex items-center gap-2">
                                {getDisplayName(user)}
                                {user.username === currentUser && (
                                  <span className="px-1.5 py-0.5 bg-gradient-to-r from-green-500 to-blue-500 text-xs font-bold rounded-full">
                                    You
                                  </span>
                                )}
                              </h3>
                              <p className="text-gray-400 text-xs">
                                {index === 0 ? "🏆 Top Contributor" : 
                                 index === 1 ? "⭐ Rising Star" : 
                                 index === 2 ? "🔥 Active" : 
                                 "Developer"}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-lg font-bold text-white">{user.repoCount || 0}</div>
                          <div className="text-xs text-gray-400">Repos</div>
                        </div>
                        <div className="bg-white/5 rounded-lg p-2">
                          <div className="text-lg font-bold text-white">{user.commitCount || 0}</div>
                          <div className="text-xs text-gray-400">Commits</div>
                        </div>
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-lg p-2 border border-purple-500/30">
                          <div className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200">
                            {user.points || 0}
                          </div>
                          <div className="text-xs text-gray-300">Points</div>
                        </div>
                      </div>
                    </div>

                    {/* Desktop Layout */}
                    <div className="hidden sm:grid grid-cols-12 gap-3 sm:gap-4 p-4 sm:p-6 items-center">
                      {/* Rank */}
                      <div className="col-span-2 sm:col-span-1 text-center">
                        <div className={`inline-flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full font-bold text-xs sm:text-sm bg-gradient-to-r ${getRankColor(index)} shadow-lg`}>
                          {index + 1}
                        </div>
                      </div>

                      {/* Developer Info */}
                      <div className="col-span-6 sm:col-span-5 flex items-center space-x-3 sm:space-x-4">
                        <div className="flex items-center space-x-2 sm:space-x-3">
                          {index < 3 && (
                            <div className="w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full flex items-center justify-center text-xs sm:text-sm shadow-lg">
                              {getRankBadge(index)}
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-white truncate text-sm sm:text-lg">
                                {getDisplayName(user)}
                              </h3>
                              {user.username === currentUser && (
                                <span className="px-2 py-1 bg-gradient-to-r from-green-500 to-blue-500 text-xs font-bold rounded-full shadow-lg">
                                  You
                                </span>
                              )}
                            </div>
                            <p className="text-gray-400 text-xs sm:text-sm truncate">
                              {index === 0 ? "🏆 Top Contributor" : 
                               index === 1 ? "⭐ Rising Star" : 
                               index === 2 ? "🔥 Active Developer" : 
                               "GitHub Developer"}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Repositories */}
                      <div className="col-span-2 text-center">
                        <div className="bg-white/5 rounded-xl py-2 sm:py-3 px-3 sm:px-4 transition-all duration-300 group-hover:bg-white/10">
                          <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                            {user.repoCount || 0}
                          </div>
                          <div className="text-xs text-gray-400">Repos</div>
                        </div>
                      </div>

                      {/* Commits */}
                      <div className="col-span-2 text-center">
                        <div className="bg-white/5 rounded-xl py-2 sm:py-3 px-3 sm:px-4 transition-all duration-300 group-hover:bg-white/10">
                          <div className="text-lg sm:text-2xl font-bold text-white mb-1">
                            {user.commitCount || 0}
                          </div>
                          <div className="text-xs text-gray-400">Commits</div>
                        </div>
                      </div>

                      {/* Points */}
                      <div className="col-span-2 text-center">
                        <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl py-2 sm:py-3 px-3 sm:px-4 border border-purple-500/30 transition-all duration-300 group-hover:from-purple-500/30 group-hover:to-pink-500/30">
                          <div className="text-lg sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-pink-200 mb-1">
                            {user.points || 0}
                          </div>
                          <div className="text-xs text-gray-300">Points</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {!isLoading && leaderboard.length === 0 && (
                <div className="text-center py-8 sm:py-12">
                  <div className="w-16 h-16 sm:w-24 sm:h-24 bg-white/10 rounded-3xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl sm:text-4xl">🏆</span>
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-white mb-2">No contributors yet</h3>
                  <p className="text-gray-400 max-w-md mx-auto text-sm sm:text-base px-4">
                    Be the first to join the leaderboard! Connect your GitHub account to start competing.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="text-center mt-6 sm:mt-8 pb-4 animate-fade-in">
            <p className="text-gray-400 text-xs sm:text-sm">
              Built with ❤️ for the Developers community
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;