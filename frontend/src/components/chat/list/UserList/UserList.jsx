import UserCard from '../UserCard/UserCard';
import '@/styles/chat/UserList.css';
import React, { useContext } from 'react';
import { ChatContext } from '@/app/chat/chat_context/ChatContext';

// import { useRouter } from 'next/router';

const UserList = ({ users, listType }) => {
  const { handleUserClick } = useContext(ChatContext);

  // const router = useRouter();

  // const handleClick = (user) => {
  //   handleUserClick(user);
  //   // router.push(`/chat/${user.id}`); // Route to /chat/[id]
  // };
  
  return (
    <div className={`user-list ${listType === 'online' ? 'UserListOnline' : 'UserListAll'}`}>
      {users.map(user => (
        <UserCard key={user.id} user={user} listType={listType} onUserSelect={handleUserClick} />
        // <UserCard key={user.id} user={user} listType={listType} onUserSelect={handleClick} />
      ))}
    </div>
  );
};

export default UserList;


// import UserCard from '../UserCard/UserCard';
// import '@/styles/chat/UserList.css';
// import React, { useContext } from 'react';
// import { ChatContext } from '@/app/chat/chat_context/ChatContext';
// // import { useRouter } from 'next/router';
// import Router from 'next/router';

// const UserList = ({ users, listType }) => {
//   const { handleUserClick } = useContext(ChatContext);
//   // const router = useRouter(); // Make sure this is placed at the top level of your component

//   const handleClick = (user) => {
//     handleUserClick(user);
//     // router.push(`/chat/${user.id}`); // Route to /chat/[id]
//     Router.push(`/chat/${user.id}`);
//   };

//   return (
//     <div className={`user-list ${listType === 'online' ? 'UserListOnline' : 'UserListAll'}`}>
//       {users.map(user => (
//         <UserCard key={user.id} user={user} listType={listType} onUserSelect={handleClick} />
//       ))}
//     </div>
//   );
// };

// export default UserList;


// import Link from 'next/link';
// import UserCard from '../UserCard/UserCard';
// import '@/styles/chat/UserList.css';
// import { useContext } from 'react';
// import { ChatContext } from '@/app/chat/chat_context/ChatContext';

// const UserList = ({ users, listType }) => {
//   const { handleUserClick } = useContext(ChatContext);

//   return (
//     <div className={`user-list ${listType === 'online' ? 'UserListOnline' : 'UserListAll'}`}>
//       {users.map(user => (
//         <Link key={user.id} href={`/chat/${user.id}`} passHref>
//           <UserCard user={user} listType={listType} onUserSelect={handleUserClick} />
//         </Link>
//       ))}
//     </div>
//   );
// };

// export default UserList;


