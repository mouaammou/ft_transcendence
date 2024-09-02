from .auth_views    import  SignUp, Login, Logout, VerifyToken
from .Oauth42       import  OAuth42Login, OAuth42Callback
from .default       import  default
from .profile       import  UserProfile, UpdateProfile
from .friends       import  FriendshipListCreateView, FriendshipRetrieveUpdateDestroyView, AcceptFriendshipView, BlockFriendshipView