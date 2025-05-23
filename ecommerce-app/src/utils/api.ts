import axios from 'axios';

const API_BASE_URL = 'https://api.example.com'; // Replace with your actual API base URL

export const fetchProducts = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error('Error fetching products: ' + error.message);
        }
    }
};

export const fetchProductById = async (id: string) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/products/${id}`);
        return response.data;
    } catch (error) {
        if (error instanceof Error) {
            throw new Error('Error fetching product: ' + error.message);
        }
    }
};