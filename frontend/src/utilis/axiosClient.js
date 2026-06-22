import axios from "axios";

const axiosClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000',//ye backend ka base url hai 
    withCredentials: true,    //iska matlab hum browser ko bta rha cookie attach kar dena request me backend me bhejne ke liye
    headers: {
        "Content-Type": "application/json"  //ye hum backend ko bta rha ki hum json format me data bhej rha 
    }
})
export default axiosClient