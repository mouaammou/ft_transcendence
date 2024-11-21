// import UserCard from '../UserCard/UserCard';
// import '@/styles/chat/UserList.css';
// import React, { useContext } from 'react';
// import { ChatContext } from '@/app/chat/chat_context/ChatContext';


// const UserList = ({ users, listType }) => {
//   const { handleUserClick , handleScroll, typingUsers} = useContext(ChatContext);
  
//   return (
//     <div className={`user-list ${listType === 'online' ? 'UserListOnline' : 'UserListAll'}`} 
//         onScroll={handleScroll}  // Directly use the onScroll event here
//     >
//       {users.map(user => (
//         <UserCard key={user.id} 
//           user={user} 
//           listType={listType}
//           typingUsers={typingUsers}
//           onUserSelect={handleUserClick} />
//       ))}
//     </div>
//   );
// };

// export default UserList;




// ************************ use Carousel ************************* //

// import UserCard from '../UserCard/UserCard';
// import '@/styles/chat/UserList.css';
// import React, { useContext } from 'react';
// import { ChatContext } from '@/app/chat/chat_context/ChatContext';
// import {
//   Carousel,
//   CarouselContent,
//   CarouselItem,
//   CarouselNext,
//   CarouselPrevious,
// } from "@/components/ui/carousel";

// const UserList = ({ users, listType }) => {
//   // const { handleUserClick, handleScroll, typingUsers } = useContext(ChatContext);
//   const { handleUserClick, typingUsers } = useContext(ChatContext);

//   // Render user cards with or without Carousel based on listType
//   return (
//     <>
//       {listType === 'online' ? (
//         // Use Carousel for "online" users
//         <Carousel
//           // opts={{
//           //   align: 'start',
//           // }}
//           // className="w-full max-w-sm"

//           opts={{
//             align: "start",
//           }}
//           className="user-carousel mx-auto"
//           // style={{ maxWidth: "16rem" }}

//           // className="user-carousel mx-auto max-w-full px-2 sm:px-4"
//           // className="user-carousel mx-auto max-w-full px-1 sm:px-2"
//           // style={{ maxWidth: "100%" }}
//           style={{ maxWidth: "70%" }}

//         >
//           <CarouselContent
//             // className="carousel-content"
//           >
//             {users.map(user => (
//               <CarouselItem key={user.id}
//                 className="
//                   basis-[50%] max-w-[100px]
//                   sm:basis-[40%] sm:max-w-[120px]
//                   md:basis-[33%] md:max-w-[116px]
//                   tablet:basis-[33%] tablet:max-w-[130px]
//                   larg_screen:basis-[25%] lg:max-w-[100px]
//                   shrink-0 p-1
//                 "
//               >
//                 <UserCard
//                   user={user}
//                   listType={listType}
//                   typingUsers={typingUsers}
//                   onUserSelect={handleUserClick}
//                 />
//               </CarouselItem>
//             ))}
//           </CarouselContent>
//           <CarouselPrevious />
//           <CarouselNext />
//         </Carousel>
//       ) : (
//         // Standard scrollable list for "all" users
//         <div
//           className={`user-list ${listType === 'online' ? 'UserListOnline' : 'UserListAll'}`}
//           // onScroll={handleScroll}
//         >
//           {users.map(user => (
//             <UserCard
//               key={user.id}
//               user={user}
//               listType={listType}
//               typingUsers={typingUsers}
//               onUserSelect={handleUserClick}
//             />
//           ))}
//         </div>
//       )}
//     </>
//   );
// };

// export default UserList;



// **************************  **************************************



import UserCard from '../UserCard/UserCard';
import '@/styles/chat/UserList.css';
import React, { useContext } from 'react';
import { ChatContext } from '@/app/chat/chat_context/ChatContext';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

const UserList = ({ users, listType , currentUser}) => {
  const { handleUserClick, typingUsers } = useContext(ChatContext);

  // console.log('hay users  => ' , users)

  // console.log(' ***** currentUser data ***  => ' , currentUser)
  
  return (
    <>
      {listType === 'online' ? (
        <Carousel
          opts={{ align: "start" }}
          className="user-carousel mx-auto"
          style={{ maxWidth: "70%" }}
        >
          <CarouselContent>
            {users.map(user => (
              <CarouselItem
                key={user.friend.id}
                className="
                  basis-[50%] max-w-[100px]
                  sm:basis-[40%] sm:max-w-[120px]
                  md:basis-[33%] md:max-w-[116px]
                  tablet:basis-[33%] tablet:max-w-[130px]
                  larg_screen:basis-[25%] lg:max-w-[100px]
                  shrink-0 p-1
                "
              >
                <UserCard
                  user={user.friend}
                  lastMessage={user.last_message} // Pass last message details
                  listType={listType}
                  typingUsers={typingUsers}
                  onUserSelect={handleUserClick}
                  currentUser={currentUser}
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div
          className={`user-list ${listType === 'online' ? 'UserListOnline' : 'UserListAll'}`}
        >
          {users.map(user => (
            <UserCard
              key={user.friend.id}
              user={user.friend}
              lastMessage={user.last_message} // Pass last message details
              listType={listType}
              typingUsers={typingUsers}
              onUserSelect={handleUserClick}
            />
          ))}
        </div>
      )}
    </>
  );
};

export default UserList;

