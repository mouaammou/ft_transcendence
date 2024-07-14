// import React from 'react';
import Image from "next/image";

// we can do a style in div
// {`user-card ${user.active ? 'active' : 'inactive'}`}
const UserCard = ({user, listType}) => {
    const borderColor = user.active ? 'green' : 'red';
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
            {/* <img src="{user.img}" alt="" /> */}
            {/* <Image src={user.img} alt={user.name} width={50} height={50} style={{ borderRadius: '25px'}} /> */}
            <Image 
                src={user.img} 
                alt={user.name} 
                width={40}
                height={40} 
                style={{
                    borderRadius: '25px', 
                    border: `2px solid ${borderColor}`
                }}
            />
            {listType === 'all' && (
                <>
                    <p>{user.name}</p>
                    <p>Active: {user.active ? 'Yes' : 'No'}</p>
                </>
            )}
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