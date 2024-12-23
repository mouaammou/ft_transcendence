'use client';
import axios from 'axios';
import { useRouter } from 'next/navigation';

// function axiosInstance() {
// 	return axios.create({
// 		baseURL: "http://localhost:8000/",
// 		headers: {
// 			"Content-Type": "application/json",
// 		},
// 	});
// }

// export default axiosInstance;

// api/axiosInstance.js

// import axios from 'axios';

const axiosInstance = axios.create({
  baseURL: '/api/', // Replace with your Django backend URL
});

//chck if the response is a 401 then redirect to the login page
axiosInstance.interceptors.response.use(
  response => {
    return response;
  },
  error => {
    //add redirect_to_login query param to the current url
    console.log('error status', error.response.status);
    if (error.response.status === 401) {
      console.log('hello response 4001');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return error;
  }
);

export default axiosInstance;

// import { useRouter } from 'next/navigation';

// const MyComponent = () => {
//     const router = useRouter();

//     axiosInstance.interceptors.response.use(
//         (response) => {
//             console.log("response status: ", response.status);
//             return response;
//         },
//         (error) => {
//             console.log("error status", error.response.status);
//             if (error.response.status === 401) {
//                 console.log("hello response 4001");
//                 router.push('/login'); // Use router for navigation
//             }
//             return Promise.reject(error); // Ensure to return a rejected promise for error handling
//         }
//     );

// };
// export default MyComponent;


// WebSocket HANDSHAKING /ws/global/ [127.0.0.1:58390]
// Middleware Error:  'channel_name'
// *** Middleware User:  AnonymousUser ***

// Connection Denied: Authentication Required !

// HTTP POST /login 200 [0.33, 127.0.0.1:58393]

//  RECEIVED

// data Received :: {'online': 'online', 'user': '3'}


//  broadcasting online when login: 3


//  -- USERNAME : 3 -- 

// HTTP POST /verifyTokens 200 [0.03, 127.0.0.1:58396]
// HTTP POST /profile/data 200 [0.03, 127.0.0.1:58403]
// HTTP GET /notifications/unread 200 [0.04, 127.0.0.1:58401]
// HTTP GET /media/avatars/3.png 200 [0.02, 127.0.0.1:58342]

//  -- USERNAME : 3 -- 

// HTTP POST /verifyTokens 200 [0.03, 127.0.0.1:58396]
// HTTP GET /gamehistory/6?page=1 200 [0.06, 127.0.0.1:58409]
// HTTP GET /media/avatars/1.jpg 200 [0.03, 127.0.0.1:58411]
// HTTP GET /media/avatars/7.jpeg 200 [0.03, 127.0.0.1:58342]
// HTTP GET /media/avatars/2.jpg 200 [0.03, 127.0.0.1:58413]
// WebSocket DISCONNECT /ws/global/ [127.0.0.1:58390]
// in the disconnect methode
// WebSocket HANDSHAKING /ws/global/ [127.0.0.1:58415]
// *** Middleware User:  3 ***
// WebSocket CONNECT /ws/global/ [127.0.0.1:58415]
// in the connect methode --> 6
// in the run_event_loop methode
// in the _reconnect method
// No game object found for player id 6
// add_callback method

//  -- USERNAME : 3 -- 

// HTTP POST /verifyTokens 200 [0.01, 127.0.0.1:58421]
// HTTP GET /gamehistory/6?page=1 200 [0.03, 127.0.0.1:58425]

//  -- USERNAME : 3 -- 

// HTTP POST /verifyTokens 200 [0.01, 127.0.0.1:58435]

//  -- USERNAME : yang -- 

// HTTP POST /verifyTokens 200 [0.01, 127.0.0.1:58441]
// Player 4 sent data: {'type': 'PLAY_RANDOM'}
// Player 4 added to the waiting queue