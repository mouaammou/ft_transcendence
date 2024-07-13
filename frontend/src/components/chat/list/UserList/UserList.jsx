import UserCard from '../UserCard/UserCard'


const UserList = ({users}) =>{
    return(
        <div>
            {
                users.map((user, index) => (
                    <UserCard key={index} user={user} />
                ))
            }
        </div>
    );
};

export default UserList;