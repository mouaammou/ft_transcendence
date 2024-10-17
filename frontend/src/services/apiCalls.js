import axiosInstance from './axiosInstance';

export const getData = async endPoint => {
try {
	const response = await axiosInstance.get(endPoint, {
		withCredentials: true,
	});
	return response;
} catch (error) {
	throw error;
}
};

export const postData = async (endPoint, data, headers) => {
try {
	const response = await axiosInstance.post(endPoint, data, headers, {
		withCredentials: true,
	});
	// console.log("postData ==> ", response)
	if (response.status == 401) console.log('401 form axios');
	return response;
} catch (error) {
	console.log(error);
	return error;
}
};
