import axios from "axios";

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
	baseURL: "/api/", // Replace with your Django backend URL
	headers: {
		"Content-Type": "application/json",
	},
});


// axiosInstance.interceptors.response.use(

export default axiosInstance;
