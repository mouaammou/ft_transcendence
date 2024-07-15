import UserCard from '../UserCard/UserCard'
import '@/Styles/chat/UserList.css'

const UserList = ({users, listType}) =>{

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
                users.map((user, index) => (
                    <UserCard key={index} user={user} listType={listType} />
                ))
            }
        </div>
    );
};

export default UserList;