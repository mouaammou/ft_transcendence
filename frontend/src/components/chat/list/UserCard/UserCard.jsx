// import React from 'react';
import Image from "next/image";

const UserCard = ({user}) => {
    return (
        <div 
            // style={{ 
            // width: '50px', 
            // height: '50px', 
            // borderRadius: '25px', 
            // backgroundColor: 'black', 
            // display: 'flex', 
            // alignItems: 'center', 
            // justifyContent: 'center' 
            // }}
        >
            {/* <p>{user.img}</p> */}
            <Image src={user.img} alt={user.name} width={50} height={50} style={{ borderRadius: '25px'}} />
            <p>{user.name}</p>
            <p>{user.email}</p>
            <p>Active: {user.active ? 'Yes' : 'No'}</p>
        </div>
    );
}

export default UserCard;

// import React from 'react';

// const UserCard = ({user}) => {
//   return (
    // <div className={`user-card ${user.active ? 'active' : 'inactive'}`}>
    //   <h3>{user.name}</h3>
    //   <p>{user.email}</p>
    //   <p>Status: {user.active ? 'Active' : 'Inactive'}</p>
    // </div>
//   );
// };

// export default UserCard;