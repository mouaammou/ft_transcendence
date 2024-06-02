import axiosInstance from "./axiosInstance";

export const getData = async (endPoint) => {
	try {
		const response = await axiosInstance.get(endPoint);
		return response;
	} catch (error) {
		return error;
	}
};

export const postData = async (endPoint, data) => {
	try {
		const response = await axiosInstance.post(endPoint, data, {
			withCredentials: true,
		});
		console.log("postData ==> ", response)
		return response;
	} catch (error) {
		// error.response && console.log("error error data ==> ", error.response.status)
		return error;
	}
};

export const verifyToken = async (endPoint) => {
	try {
		const response = await axiosInstance.post(endPoint, {
			withCredentials: true,
		});
		return response;
	} catch (error) {
		return error;
	}
}
