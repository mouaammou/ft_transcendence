// import React from 'react';
import React, { useState } from 'react';
import Image from "next/image";
import '@/Styles/chat/UserCard.css'

const UserCard = ({user, listType}) => {
    const borderColor = user.active ? 'green' : 'red';
    const imageSize = listType === 'online' ? '65' : '45';
    return (
        <div className= {`usercard ${listType === 'online' ? 'UserCardOnline' : 'UserCardAll'}`}>
            <Image 
                src={user.img}
                alt={user.name} 
                width={imageSize}
                height={imageSize}
                style={{
                    borderRadius: '50%',
                    border: `2px solid ${borderColor}`
                }}
            />
            {listType === 'all' && (
                <>
                    <p>{user.name}</p>
                    {/* <p>Active: {user.active ? 'Yes' : 'No'}</p> */}
                </>
            )}
        </div>
    );
}

export default UserCard;

//------------------------------------

// import Image from 'next/image'; // Assuming you're using next/image

// const UserCardList = ({ users, listType }) => {
//     const [clickedCardIndex, setClickedCardIndex] = useState(null);

//     return (
//         <div className="usercard-list">
//             {users?.map((user, index) => {
//                 const borderColor = user.active ? 'green' : 'red';
//                 const imageSize = listType === 'online' ? 65 : 45;
//                 const isActive = clickedCardIndex === index;

//                 return (
//                     <div
//                         key={index}
//                         className={`usercard ${isActive ? 'clicked' : ''} ${listType === 'online' ? 'UserCardOnline' : 'UserCardAll'}`}
//                         onClick={() => setClickedCardIndex(index)}
//                         style={{
//                             border: isActive ? `1px solid #333` : '1px solid transparent',
//                             borderRadius: isActive ? '5px' : '10px',
//                         }}
//                     >
//                         <Image 
//                             src={user.img} 
//                             alt={user.name} 
//                             width={imageSize}
//                             height={imageSize}
//                             style={{
//                                 borderRadius: '50%', 
//                                 border: `2px solid ${borderColor}`,
//                             }}
//                         />
//                         {listType === 'all' && <p>{user.name}</p>}
//                     </div>
//                 );
//             })}
//         </div>
//     );
// };

// export default UserCardList;

//---------------------------------------

// import React, { useState } from 'react';
// import Image from 'next/image'; // Assuming you're using next/image



// export default UserCardList;


// ----------------------------------------

// import React, { useState } from 'react';
// import Image from 'next/image';

// const UserCardList = ({ users = [], listType }) => {
//     const [clickedIndex, setClickedIndex] = useState(null);

//     return (
//         <div className="usercard-list">
//             {users?.length === 0 ? (
//                 <p>No users available</p>
//             ) : (
//                 users.map((user, index) => {
//                     const borderColor = user.active ? 'green' : 'red';
//                     const imageSize = listType === 'online' ? 65 : 45;
//                     const isClicked = clickedIndex === index;

//                     return (
//                         <div
//                             key={index}
//                             className={`usercard ${isClicked ? 'clicked' : ''}`}
//                             onClick={() => setClickedIndex(index)}
//                             style={{
//                                 border: isClicked ? `1px solid #333` : '1px solid transparent',
//                                 borderRadius: isClicked ? '5px' : '10px',
//                             }}
//                         >
//                             <Image 
//                                 src={user.img} 
//                                 alt={user.name} 
//                                 width={imageSize}
//                                 height={imageSize}
//                                 style={{
//                                     borderRadius: '50%', 
//                                     border: `2px solid ${borderColor}`
//                                 }}
//                             />
//                             {listType === 'all' && <p>{user.name}</p>}
//                         </div>
//                     );
//                 })
//             )}
//         </div>
//     );
// };

// export default UserCardList;
