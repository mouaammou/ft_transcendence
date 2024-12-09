
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
  // Sort users by last_message timestamp in descending order
  const sortedUsers = [...users].sort((a, b) => {
    const timeA = new Date(a.last_message.timestamp).getTime();
    const timeB = new Date(b.last_message.timestamp).getTime();
    return timeB - timeA; // Descending order: newest first
  });
  
  return (
    <>
      {listType === 'online' ? (
        <Carousel
          opts={{ align: "start" }}
          className="user-carousel mx-auto"
          style={{ maxWidth: "70%" }}
        >
          <CarouselContent>
            {sortedUsers.map(user => (
                user && user.friend && (
                  <CarouselItem
                    key={user.friend.id}
                    className="
                      basis-[50%] max-w-[100px]
                      sm:basis-[40%] sm:max-w-[120px]
                      md:basis-[33%] md:max-w-[116px]
                      tablet:basis-[37%] tablet:max-w-[130px]
                      shrink-0 p-1
                      "
                      // tablet:basis-[33%] tablet:max-w-[130px]
                      // larg_screen:basis-[25%] lg:max-w-[100px]
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
                ) 
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      ) : (
        <div
          className={`user-list ${listType === 'online' ? 'UserListOnline' : 'UserListAll'}`}
        >
          {sortedUsers.map((user, index) => (
            <UserCard
              key={index}
              user={user.friend}
              lastMessage={user.last_message}
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