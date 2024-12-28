import axiosInstance from './axiosInstance';
import axios from 'axios';

// for get request
export const getData = async (endPoint) => {
	try {
		// Ensure endPoint doesn't start with a slash
		const cleanEndPoint = endPoint.startsWith('/') ? endPoint.slice(1) : endPoint;
		const response = await axiosInstance.get(cleanEndPoint);
		return response;
	} catch (error) {
		throw error;
	}
};

// for post request
export const postData = async (endPoint, data, headers = {}) => {
	try {
		const response = await axiosInstance.post(endPoint, data, {
		headers,
		withCredentials: true,
		});
		return response;
	} catch (error) {
		throw error;
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