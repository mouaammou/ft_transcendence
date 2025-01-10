from .auth_views    import  SignUp, Login, Logout, VerifyToken
from .Oauth42       import  OAuth42Login, OAuth42Callback
from .default       import  default
from .profile       import  UserProfile, UpdateProfile, FriendProfile, GetUserById
from .friends       import  FriendshipListView, RejectFriendshipView ,FriendshipRetrieveUpdateDestroyView, AcceptFriendshipView, BlockFriendshipView, RemoveFriend, RemoveBlockedFriend
from .notifications import  ListNotifications, UnreadNotifications, MarkNotificationRead, AcceptFriendRequest, PendingFrienshipRequest
from .allusers      import  AllUser
from .search        import  SearchClass
from .forget_reset_pass      import  ForgotPasswordView, ResetPasswordView
from .gamehistory  import  UserGamesListView
from .progress import get_progress
from .progress_level import ProgressLevelView
from .connect_four_stats import ConnectFourStatsView
from .ping_pong_stats import GameHistoryStatsView