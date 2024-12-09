from .auth_views    import  SignUp, Login, Logout, VerifyToken
from .Oauth42       import  OAuth42Login, OAuth42Callback
from .default       import  default
from .profile       import  UserProfile, UpdateProfile, FriendProfile, GetUserById
from .friends       import  FriendshipListView, RejectFriendshipView ,FriendshipRetrieveUpdateDestroyView, AcceptFriendshipView, BlockFriendshipView, RemoveFriend, RemoveBlockedFriend, GetFriendshipView
from .notifications import  ListNotifications, UnreadNotifications, MarkNotificationRead, AcceptFriendRequest, PendingFrienshipRequest
from .allusers      import  AllUser
from .search        import  SearchClass
from .forget_reset_pass      import  ForgotPasswordView, ResetPasswordView
