

// ****************   the origine   ********************* //

// // import React from 'react';
// import React, { useState } from 'react';
// import Image from 'next/image';
// import '@/styles/chat/UserCard.css';

// const UserCard = ({ user, listType, onUserSelect , typingUsers}) => {
//   const borderColor = user.active ? 'green' : 'red';
//   const imageSize = listType === 'online' ? '65' : '45';

//   return (
//     <div
//       className={`usercard ${listType === 'online' ? 'UserCardOnline' : 'UserCardAll'}`}
//       onClick={() => onUserSelect(user)}
//     >
//       <img
//           src={user.avatar}
//           alt={user.username}
//           width={imageSize}
//           height={imageSize}
//           className="img-usercard"
//           style={{
//             borderRadius: '50%',
//             border: '2px solid #fff',
//           }}
//         />
//       <div
//         className="status"
//         style={{ backgroundColor: `${borderColor}`, borderRadius: '50%' }}
//       ></div>
//       {listType === 'all' && (
//         <>
// 			<p>{user.username}</p>
// 			{/* Display typing indicator if the user is typing */}
// 			{typingUsers.includes(user.username) && (
// 				<p className="typing_indicator_card">Typing...</p>
// 			)}
// 			{ /* display last message */}
// 			{ /* display the time of the message */}
//         </>
//       )}
//     </div>
//   );
// };

// export default UserCard;



//**************************    method 1    ***************************** //




import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import '@/styles/chat/UserCard.css';

const UserCard = ({ user, listType, onUserSelect, typingUsers }) => {
  const borderColor = user.active ? 'green' : 'red';
  const imageSize = listType === 'online' ? '65' : '45';

  return listType === 'online' ? (
    // Render using Card and CardContent for "online" listType
    <Card className="usercard-card" onClick={() => onUserSelect(user)}>
      <CardContent 
      // className="flex items-center p-4 space-x-4"
      className="flex aspect-square items-center justify-center"
      >
        <img
          src={user.avatar}
          alt={user.username}
          width={imageSize}
          height={imageSize}
          // className="img-usercard"
          className="w-full h-full object-cover "
          style={{
            // borderRadius: '50%',
            // border: '2px solid #fff',
          }}
        />

        {/* <div
          className="status"
          style={{ backgroundColor: `${borderColor}`, borderRadius: '50%' }}
        >
        </div> */}

      </CardContent>
    </Card>
  ) : (
    // Render default structure for "all" listType
    <div
      className={`usercard ${listType === 'online' ? 'UserCardOnline' : 'UserCardAll'}`}
      onClick={() => onUserSelect(user)}
    >
      <img
        src={user.avatar}
        alt={user.username}
        width={imageSize}
        height={imageSize}
        className="img-usercard"
        style={{
          borderRadius: '50%',
          border: '2px solid #fff',
        }}
      />
      <div
        className="status"
        style={{ backgroundColor: `${borderColor}`, borderRadius: '50%' }}
      ></div>
      {listType === 'all' && (
        <>
          <p>{user.username}</p>
          {typingUsers.includes(user.username) && (
            <p className="typing_indicator_card">Typing...</p>
          )}
        </>
      )}
    </div>
  );
};

export default UserCard;





//***************************   method 2   **************************** //


// import React from 'react';
// import { Card, CardContent } from "@/components/ui/card";
// import '@/styles/chat/UserCard.css';

// const UserCard = ({ user, listType, onUserSelect, typingUsers }) => {
//   const borderColor = user.active ? 'green' : 'red';
//   const imageSize = listType === 'online' ? '65' : '45';

//   return listType === 'online' ? (
//     // Render Card layout for "online" listType
//     <Card className="usercard-card" onClick={() => onUserSelect(user)}>
//       <CardContent className="flex items-center p-4 space-x-4">
//         <img
//           src={user.avatar}
//           alt={user.username}
//           width={imageSize}
//           height={imageSize}
//           className="img-usercard"
//           style={{
//             borderRadius: '50%',
//             border: '2px solid #fff',
//           }}
//         />
//         <div
//           className="status"
//           style={{ backgroundColor: `${borderColor}`, borderRadius: '50%' }}
//         ></div>
//         <p className="font-semibold">{user.username}</p>
//       </CardContent>
//     </Card>
//   ) : (
//     // Render default layout for "all" listType
//     <div
//       className={`usercard ${listType === 'online' ? 'UserCardOnline' : 'UserCardAll'}`}
//       onClick={() => onUserSelect(user)}
//     >
//       <img
//         src={user.avatar}
//         alt={user.username}
//         width={imageSize}
//         height={imageSize}
//         className="img-usercard"
//         style={{
//           borderRadius: '50%',
//           border: '2px solid #fff',
//         }}
//       />
//       <div
//         className="status"
//         style={{ backgroundColor: `${borderColor}`, borderRadius: '50%' }}
//       ></div>
//       <p>{user.username}</p>
//       {/* Display typing indicator if the user is typing */}
//       {typingUsers.includes(user.username) && (
//         <p className="typing_indicator_card">Typing...</p>
//       )}
//     </div>
//   );
// };

// export default UserCard;
