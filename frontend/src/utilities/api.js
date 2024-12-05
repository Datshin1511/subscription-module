import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api'

export const fetchCustomers = async () => {
    const response = await axios.get(`${API_BASE_URL}/customer/`)
    return response.data
}

export const fetchProducts = async () => {
    const response = await axios.get(`${API_BASE_URL}/product/`)
    return response.data
}

export const fetchSubscriptions = async () => {
    const response = await axios.get(`${API_BASE_URL}/subscription/`)
    return response.data
}

export const fetchCustomerSubscription = async (customerId, productName) => {
    const response = await axios.get(`${API_BASE_URL}/subscription/`, {
        params: {customerId, productName},
    })
    return response.data
}

export const addSubscription = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/subscription/`, {
        CustomerID: data.customerId,
        ProductName: data.productName,
        SubscriptionStartDate: data.startDate,
        SubscriptionEndDate: data.endDate,
        NumberOfUsers: data.users
    })
    return response.data
}

export const updateSubscription = async (customerId, productName, endDate) => {
    try{
        const response = await axios.patch(`${API_BASE_URL}/subscription/`, {
            customerId: customerId,
            productName: productName,
            endDate: endDate
        })
        return response.data
    }
    catch(error){
        console.error("Error updating subscription: ", error.response || error.message)
    }
}