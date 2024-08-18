"use client";
import axios from "axios";
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
	baseURL: "/api/", // Replace with your Django backend URL
});

//chck if the response is a 401 then redirect to the login page
axiosInstance.interceptors.response.use(
	(response) => {
		console.log("response status: ", response.status);
		return response;
	},
	(error) => {
		//add redirect_to_login query param to the current url
		console.log("error status", error.response.status);
		if (error.response.status === 401) {
			console.log(
				"hello response 4001"
			);
			window.location.href = '/login';
		}
		return error;
})

export default axiosInstance;
