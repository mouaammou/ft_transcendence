import axios from "axios";
import Cookies from "js-cookie";

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

// axiosInstance.interceptors.request.use(
// 	(config) => {
// 		const accessToken = Cookies.get("access_token");
// 		if (!accessToken) {
// 			return Promise.resolve(null);
// 		}
// 		return config;
// 	},
// 	(error) => {
// 		return Promise.reject(error);
// 	}
// );


export default axiosInstance;
