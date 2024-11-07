import axiosInstance from './axiosInstance';

// for get request
export const getData = async endPoint => {
	try {
		const response = await axiosInstance.get(endPoint, {
			withCredentials: true,
		});
		return response;
	} catch (error) {
		return error;
}
};

// for post request
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

// for put request
export const putData = async (endPoint, data, headers) => {
	try {
		const response = await axiosInstance.put(endPoint, data, headers, {
			withCredentials: true,
		});
		return response;
	} catch (error) {
		return error;
	}
};

// for delete request
export const deleteData = async endPoint => {
	try {
		const response = await axiosInstance.delete(endPoint, {
			withCredentials: true,
		});
		return response;
	} catch (error) {
		return error;
	}
};
