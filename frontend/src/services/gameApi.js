import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_BACKEND_API_URL;

const api = axios.create({
    baseURL: `${baseUrl}/backend/game/`,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
});



export const apiPlayRegularGame = async () => {
    let data = null; 
    try {
        const response = await api.get('play-regular');
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

export const apiPlayTournamentGame = async (tournaments_id=-1) => {
    let data = null; 
    try {
        const response = await api.get(`play-tournament/${tournaments_id}`);
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