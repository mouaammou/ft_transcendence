import axios from 'axios';
const baseUrl = process.env.NEXT_PUBLIC_URL;

const api = axios.create({
    baseURL: `${baseUrl}/backend/2fa/`,
    timeout: 10000,
    withCredentials: true,
    headers: {
      'Content-Type': 'application/json',
    }
});
  


export const apiValidateTwoFactorAuth = async (code) => {
    let data = null; 
    try {
        const response = await api.post('verify/user/', {totp_code: code});
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

export const apiEnableTwoFactorAuth = async (code) => {
    let data = null;
    try {
        const response = await api.post('enable/', {code: code});
        response.data['status'] = response.status;
        data = response.data;
        return response.data;
    } catch (error) {
        if (error.response) {
            error.response.data['status'] = error.response.status;
            data = error.response.data;
            return error.response.data
        } else {
            data = {status: 400, msg: "No response"};
            return data;
        }
    }
    finally {
    }
};


export const apiDisableTwoFactorAuth = async () => {
    let data = null;
    try {
        const response = await api.delete('disable/');
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

export const apiTwoFactorAuthQrcode = async () => {
    let data = null;
    try {
        const response = await api.get('qrcode/');
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

export const apiTwoFactorAuthIsEnabled = async () => {
    let data = null;
    try {
        const response = await api.get('is-enabled/');
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
