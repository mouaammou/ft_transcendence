import UserCard from '../UserCard/UserCard'
import '@/Styles/chat/UserList.css'

const UserList = ({users, listType, onUserSelect}) =>{

        // const style = {
        //   display: 'flex',
        //   flexDirection: listType === 'online' ? 'row' : 'column',
        //   gap: '10px',
        // };
        {/* <div style={style}> */}
    return(
        <div className={`user-list ${listType === 'online' ? 'UserListOnline' : 'UserListAll'}`}
        >
            {
                users.map((user) => (
                    <UserCard key={user.id} user={user} listType={listType} onUserSelect={onUserSelect}/>
                ))
            }
        </div>
    );
};

export default UserList;