import axiosInstance from './axiosInstance';
import axios from 'axios';

// for get request
export const getData = async (endPoint) => {
    try {
        // Clean endpoint
        const cleanEndPoint = endPoint.startsWith('/') ? endPoint.slice(1) : endPoint;
        
        // Add specific config for OAuth endpoints
        const config = cleanEndPoint.includes('auth/callback') ? {
            // Increase timeout for OAuth requests
            timeout: 10000,
            // Add additional headers if needed
            headers: {
                'Cache-Control': 'no-cache, no-store, must-revalidate',
                'Pragma': 'no-cache',
                'Expires': '0'
            }
        } : {};

        const response = await axiosInstance.get(cleanEndPoint, config);
        return response;
    } catch (error) {
        // Log the full error for debugging
        console.log('getData Error:', {
            endpoint: endPoint,
            error: {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            }
        });

        // Throw a more specific error
        if (error.response?.data?.Error) {
            throw new Error(error.response.data.Error);
        } else if (error.code === 'ECONNABORTED') {
            throw new Error('Request timed out. Please try again.');
        } else if (!error.response) {
            throw new Error('Network error. Please check your connection.');
        }

        throw error;
    }
};

// for post request
export const postData = async (endPoint, data, headers = {}) => {
	try {
	  // If data is FormData, make sure we don't have a default Content-Type
	  const config = {
		headers: {
		  ...headers
		},
		withCredentials: true,
	  };
  
	  // If it's FormData, let axios set the correct Content-Type
	  if (data instanceof FormData) {
		delete config.headers['Content-Type'];
	  }
  
	  const response = await axiosInstance.post(endPoint, data, config);
	  return response;
	} catch (error) {
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


export const fetchTournaments = async (page = 1, filter='all') => {
	try {
		const response = await axiosInstance.get('game/local-tournaments/filter/'+filter, {
			params: { page },
		});
		return response.data;
	} catch (error) {

		return {
			results: [],
			count: 0,
			next: null,
			previous: null,
		};
	}
};


export const createTournament = async (raw_data) => {
	let data = null; 
    try {
        const response = await axiosInstance.post('game/local-tournaments/', raw_data);
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


    }
};

export const fetchTournamentDetail = async (id) => {
	try {
		const response = await axiosInstance.get(`game/local-tournaments/${id}/`);
		return response.data;
	} catch (error) {

		return {};
	}
};

export const fetchTournamentUpdate = async (id, data_obj) => {
	try {
		const response = await axiosInstance.put(`game/local-tournaments/${id}/`, data_obj);
		response.data['status'] = response.status;
		return response.data;
	} catch (error) {

		return {msg: error.response.data.non_field_errors[0], status: error.response.status};
	}
};

export const fetchTournamentDelete = async (id) => {
	try {
		const response = await axiosInstance.delete(`game/local-tournaments/${id}/`);

		response.data ={status: response.status};
		return response.data;
	} catch (error) {

		return { status: 400};
	}
};

export const fetchTournamentMatchPlayers = async (id) => {
	try {
		const response = await axiosInstance.get(`game/local-tournaments/next-match-players/${id}/`);
		return response.data;
	} catch (error) {

		return {'error': 'Error fetching tournaments'};
	}
};

export const fetchStartPlayTournament = async (id) => {
	try {
		const response = await axiosInstance.post(`game/local-tournaments/next-match-players/${id}/`);
		return response.data;
	} catch (error) {

		return {'error': 'Error fetching tournaments'};
	}
};

export const searchTournaments  = async (search) => {
	try {
		const response = await axiosInstance.get(`game/local-tournaments/search/`, { params: { search } });
		return response.data;
	} catch (error) {

		return {
			results: [],
			count: 0,
			next: null,
			previous: null,
		};
	}
}