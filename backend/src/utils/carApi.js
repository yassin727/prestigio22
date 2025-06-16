const axios = require('axios');

const NHTSA_API_BASE = 'https://vpic.nhtsa.dot.gov/api';

class CarApiService {
    static async getCarDetails(vin) {
        try {
            const response = await axios.get(`${NHTSA_API_BASE}/vehicles/decodevin/${vin}?format=json`);
            return response.data.Results;
        } catch (error) {
            console.error('Error fetching car details:', error);
            throw new Error('Failed to fetch car details from NHTSA API');
        }
    }

    static async getMakes() {
        try {
            const response = await axios.get(`${NHTSA_API_BASE}/vehicles/getallmakes?format=json`);
            return response.data.Results;
        } catch (error) {
            console.error('Error fetching makes:', error);
            throw new Error('Failed to fetch car makes from NHTSA API');
        }
    }

    static async getModels(make) {
        try {
            const response = await axios.get(`${NHTSA_API_BASE}/vehicles/getmodelsformake/${make}?format=json`);
            return response.data.Results;
        } catch (error) {
            console.error('Error fetching models:', error);
            throw new Error('Failed to fetch car models from NHTSA API');
        }
    }
}

module.exports = CarApiService; 