import axios from 'axios';


const api = axios.create({
    baseURL: 'http://localhost:8000/game/',
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    },
    validateStatus: function (status) {
        return status < 500;
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
        console.log("--response--");
        console.log(data);
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
        console.log("--response--");
        console.log(data);
    }
};