import axiosInstance from './axiosInstance';
import axios from 'axios';

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


//# by samjaaabo


const api = axios.create({
baseURL: 'http://localhost:8000/game/local-tournaments/',  // Base URL for your Django API
timeout: 10000,
withCredentials: true,  // Include cookies (credentials)
headers: {
  'Content-Type': 'application/json',
},
});

export const fetchTournaments = async (page = 1, filter='all') => {
	try {
		const response = await api.get('filter/'+filter, {
			params: { page },
		});
		return response.data;  // Returns the response data (count, next, previous, results)
	} catch (error) {
		// console.error('Error fetching tournaments:', error);
		return {
			results: [],
			count: 0,
			next: null,
			previous: null,
		};
	}
};

// export const createTournament = async (data) => {
// 	try {
// 		const response = await api.post('/', data);
// 		return response;
// 	} catch (error) {
// 		return { status: 422 };
// 	}
// };
export const createTournament = async (raw_data) => {
	let data = null; 
    try {
        const response = await api.post('/', raw_data);
        response.data['status'] = response.status;
        data = response.data;
        return response.data;
    } catch (error) {
        if (error.response) {
            error.response.data['status'] = error.response.status;
            data = error.response.data;
            return error.response.data
        } else {
            data = {status: 500, msg: "No response from server"};
            return data;
        }
    }
    finally {
        console.log("--response--");
        console.log(data);
    }
};

export const fetchTournamentDetail = async (id) => {
	try {
		const response = await api.get(`/${id}/`);
		return response.data;
	} catch (error) {
		console.log('Error fetching tournaments:', error);
		return {};
	}
};

export const fetchTournamentUpdate = async (id, data_obj) => {
	try {
		const response = await api.put(`/${id}/`, data_obj);
		response.data['status'] = response.status;
		return response.data;
	} catch (error) {
		console.log('Error fetching tournament update:', error);
		return {msg: error.response.data.non_field_errors[0], status: error.response.status};
	}
};

export const fetchTournamentDelete = async (id) => {
	try {
		const response = await api.delete(`/${id}/`);
		console.log(response);
		response.data ={status: response.status};
		return response.data;
	} catch (error) {
		console.log('Error fetching tournament delete:', error);
		return { status: 400};
	}
};

export const fetchTournamentMatchPlayers = async (id) => {
	try {
		// throw new Error('Error fetching tournaments');
		const response = await api.get(`/next-match-players/${id}/`);
		return response.data;
	} catch (error) {
		// console.log('Error fetching tournaments:', error);
		return {'error': 'Error fetching tournaments'};
	}
};

export const fetchStartPlayTournament = async (id) => {
	try {
		// throw new Error('Error fetching tournaments');
		const response = await api.post(`/next-match-players/${id}/`);
		return response.data;
	} catch (error) {
		console.log('Error fetching tournaments:', error);
		return {'error': 'Error fetching tournaments'};
	}
};

export const searchTournaments  = async (search) => {
	try {
		// throw new Error('Error fetching tournaments');
		const response = await api.get(`search/`, { params: { search } });
		return response.data;
	} catch (error) {
		console.log('Error fetching tournaments:', error);
		return {
			results: [],
			count: 0,
			next: null,
			previous: null,
		};
	}
}

  
