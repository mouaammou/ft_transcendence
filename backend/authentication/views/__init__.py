from .auth_views    import  SignUp, Login, Logout, VerifyToken
from .Oauth42       import  OAuth42Login, OAuth42Callback
from .default       import  default
from .profile       import  UserProfile, UpdateProfile, FriendProfile, GetUserById
from .friends       import  FriendshipListView, FriendshipRetrieveUpdateDestroyView, AcceptFriendshipView, BlockFriendshipView
from .notifications import  ListNotifications, UnreadNotifications, MarkNotificationRead
from .allusers      import  AllUser
from .search        import  SearchClass