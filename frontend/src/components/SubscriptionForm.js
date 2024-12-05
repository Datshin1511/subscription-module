import React, { useState, useEffect } from 'react';
import { useMutation, useQuery } from 'react-query';
import { fetchCustomers, fetchProducts, fetchCustomerSubscription, addSubscription, updateSubscription, fetchSubscriptions } from '../utilities/api';

import '../styles/subscription_form.css'

function SubscriptionForm() {

  // DECLARATIONS
  const [formData, setFormData] = useState({
    customerId: '',
    productName: '',
    startDate: '',
    endDate: '',
    users: 1
  });

  const [prevEndDate, setPrevEndDate] = useState('');

  const { data: customers } = useQuery('customer', fetchCustomers);
  const { data: products } = useQuery('product', fetchProducts);
  const { data: subscriptions } = useQuery('subscription', fetchSubscriptions)

  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [isEditable, setIsEditable] = useState(false) // false: Can be edited, true: Can be submitted
  const [revenue, setRevenue] = useState(0)

  useEffect(() => {
    if (formData.customerId && formData.productName) {
      const newRevenue = subscriptionCostCalculator(formData.customerId, formData.productName)
      setRevenue(newRevenue)
    }
  }, [formData])

  // TOGGLERS
  const toggleEditMode = () => {    
    if(isEditable){
      if(new Date(formData.endDate) >= new Date() && new Date(formData.endDate) >= new Date(formData.startDate)) {
        console.error("(toggleEditMode): End date: ", formData.endDate)
        updateUserMutation.mutate(formData)
      }
      else{
        alert("Subscription ending date should always fall after today's date.")
        // Revert back to old date in the records and prevent toggling edit mode.
        setFormData((prev) => ({...prev, endDate: prevEndDate}))
        return;
      }
    }
    else {
      setPrevEndDate(formData.endDate)
    }
    setIsEditable((prev) => !prev)
  }

  // CALCULATIONS
  const subscriptionCostCalculator = (customerId, productName) => {

    const annualPrice = products.find(product => product.ProductName === productName).AnnualSubscriptionCost;
    const subscription = subscriptions.find(sub => ((sub.ProductName === productName) && (sub.CustomerID === customerId)));

    if(!subscription || !annualPrice) return 0.0;

    const startDate = new Date(subscription.SubscriptionStartDate);
    const endDate = (new Date(subscription.SubscriptionEndDate) <= new Date()) ? (new Date(subscription.SubscriptionEndDate)) : (new Date())
    const users = subscription.NumberOfUsers;
    let revenue = 0.0

    if(startDate < new Date()){
      // Calculate revenue based on subscription period (pro-rated if needed)
      const durationInYears = (endDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
      revenue = annualPrice * users * durationInYears;
    }

    return revenue.toFixed(2);
  }

  // API MUTATIONS
  const mutation = useMutation((params) => fetchCustomerSubscription(params.customerId, params.productName), {
    onSuccess: (data) => {
      setUserSubscriptions(data)
      if(data.length > 0){

        formData.customerId = data[0].CustomerID
        formData.productName = data[0].ProductName
        formData.startDate = data[0].SubscriptionStartDate
        formData.endDate = data[0].SubscriptionEndDate
        formData.users = data[0].NumberOfUsers

        alert("The customer is already subscribed to this service/product!")
      } 
      else{
        alert("No entries found for the selected combination.")
      }
    },
    onError: (error) => {
      console.error("Error: ", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
    }
  });

  const newUserMutation = useMutation((formData) => addSubscription(formData), {
    onSuccess: (data) => {
      alert("New subscription added successfully!")

      mutation.mutate({ customerId: formData.customerId, productName: formData.productName });
      setFormData({
        customerId: data.CustomerID,
        productName: data.ProductName,
        startDate: data.SubscriptionStartDate,
        endDate: data.SubscriptionEndDate,
        users: data.NumberOfUsers,
      });

    },
    onError: (error) => {
      alert("User subscription failed. Try again!")
      console.error("Error: ", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
    }
  });

  const updateUserMutation = useMutation((data) => updateSubscription(data.customerId, data.productName, data.endDate), {
    onSuccess: (data) => {
      alert("User subscription updated successfully!")
    },
    onError: (error) => {
      alert("User update failed!")
      console.error("Error: ", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
    }
  })

  const terminateSubscriptionMutation = useMutation(({customerId, productName, endDate}) => updateSubscription(customerId, productName, endDate), {
    onSuccess: (data, variables) => {
      alert("User subscription terminated successfully!")

      setFormData((prev) => ({...prev, endDate: variables.endDate}))

      setUserSubscriptions((prevSubscriptions) =>
        prevSubscriptions.map((sub) =>
          sub.ProductName === variables.productName
            ? { ...sub, SubscriptionEndDate: variables.endDate }
            : sub
        )
      );
    },
    onError: (error) => {
      alert("User termination process failed!")
      console.error("Error: ", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      })
    }
  })

  // HANDLERS
  const newSubscription = (e) => {
    e.preventDefault()
    console.log("Form data: ", formData)
    if((new Date(formData.endDate) > new Date(formData.startDate)) && (new Date() <= new Date(formData.startDate)) && (formData.users > 0)){
      newUserMutation.mutate(formData)
    }
    else{
      if(new Date() > new Date(formData.startDate))
        alert("Start date cannot be in the past!")
      if(new Date(formData.startDate) >= new Date(formData.endDate)){
        alert("End date should be strictly greater than start date!")
      }
      if(formData.users < 1){
        alert("Minimum user count for subscription is 1")
      }
    }
  }

  const checkSubscription = (e) => {
    e.preventDefault();
    console.log("(Check subscription): Today's date: ", new Date().toISOString())
    if(new Date(formData.endDate) > new Date(formData.startDate)){
      mutation.mutate({customerId: formData.customerId, productName: formData.productName})
    }
    else{
      alert("End date should be strictly greater than start date!")
    }
  }
  
  const terminateSubscription = () => {
    const todayDate = new Date().toISOString().split('T')[0]
    if(new Date(formData.endDate) >= new Date(todayDate)) {
      console.error("(Terminate Subscription): Today's date: ", todayDate)
      terminateSubscriptionMutation.mutate({customerId: formData.customerId, productName: formData.productName, endDate: todayDate})
    }
    else{
      alert("Subscription is already over!")
    }
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    console.log(formData)
  };

  return (
    <div className='row align-items-stretch sub-form'>
      <div className='bg-warning col-lg-4 col-md-12 d-flex'>
          <form className="container p-4 border rounded shadow-lg" onSubmit={checkSubscription}>
            <h3 className="mb-4 text-center fw-bold text-primary">Subscribe for Your Favorite Products and Services!</h3>
            <div className="mb-3">
                <label htmlFor="customerId" className="form-label text-secondary fw-semibold">Customer</label>
                <select id="customerId" name="customerId" className="form-select shadow-sm" onChange={handleChange} value={formData.customerId} required>
                  <option value="">Select Customer</option>
                  {customers?.map((customer) => (
                  <option key={customer.CustomerID} value={customer.CustomerID}>
                      {customer.Name}
                  </option>
                  ))}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="productName" className="form-label text-secondary fw-semibold">Product</label>
                <select id="productName" name="productName" className="form-select shadow-sm" onChange={handleChange} value={formData.productName} required>
                  <option value="">Select Product</option>
                  {products?.map((product) => (
                  <option key={product.ProductName} value={product.ProductName}>
                      {product.ProductName}
                  </option>
                  ))}
                </select>
            </div>
            <div className="mb-3">
                <label htmlFor="startDate" className="form-label text-secondary fw-semibold">Start Date</label>
                <input
                  type="date"
                  id="startDate"
                  name="startDate"
                  onChange={handleChange}
                  value={formData.startDate}
                  className="form-control shadow-sm"
                  required
                  />
            </div>
            <div className="mb-3">
                <label htmlFor="endDate" className="form-label text-secondary fw-semibold">End Date</label>
                <input
                  type="date"
                  id="endDate"
                  name="endDate"
                  onChange={handleChange}
                  value={formData.endDate}
                  className="form-control shadow-sm"
                  required
                  />
            </div>
            <div className="mb-3">
                <label htmlFor="users" className="form-label text-secondary fw-semibold">Number of Users</label>
                <input
                  type="number"
                  id="users"
                  name="users"
                  onChange={handleChange}
                  value={formData.users}
                  className="form-control shadow-sm"
                  placeholder="Number of Users"
                  min="1" step="1"
                  required
                  />
            </div>
            <button type="submit" className="btn btn-success w-100 shadow-sm fw-bold">Check / Register</button>
          </form>
      </div>
      <div className="col-lg col-md-12 p-4 d-flex bg-gradient flex-column shadow-lg rounded">
          <div id="user-info-div" className="row p-3 bg-light rounded shadow-sm">
            <h3 className="text-center text-primary fw-bold mb-3">Subscriber & Subscription Information</h3>
            <div id="user-info-panel" className="border-top my-3"></div>
            {userSubscriptions.length > 0 ? (
            <ul className="list-group p-2">
                <li className="list-group-item"><b>Subscription ID:</b> {userSubscriptions[0].SubscriptionID}</li>
                <li className="list-group-item"><b>Customer ID:</b> {formData.customerId}</li>
                <li className="list-group-item"><b>Product:</b> {formData.productName}</li>
                <li className="list-group-item"><b>Start date:</b> {new Date(formData.startDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</li>
                <li className="list-group-item d-flex justify-content-between align-items-center">
                  {isEditable ? (
                  <>
                  <span className="d-flex align-items-center m-0">
                  <label htmlFor="endDate" className="form-label m-0 me-2"><b>End Date:</b></label>
                  <input type="date" id="endDate" name="endDate" onChange={handleChange} defaultValue={formData.endDate} className="form-control form-control-sm shadow-sm" required />
                  </span>
                  <button type="button" onClick={toggleEditMode} className="btn btn-link text-decoration-none p-0 m-0 fw-bold text-success">
                  <i className="bi bi-floppy"></i> Save
                  </button>
                  </>
                  ) : (
                  <>
                  <span className="m-0"><b>End date:</b> {new Date(formData.endDate).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
                  <button type="button" onClick={toggleEditMode} className="btn btn-link text-decoration-none p-0 m-0 fw-bold text-primary">
                  <i className="bi bi-pencil-square"></i> Edit
                  </button>
                  </>
                  )}
                </li>
                <li className="list-group-item"><b>Number of Users:</b> {formData.users}</li>
                <li className="list-group-item"><b>Description:</b> {products.find(product => product.ProductName === formData.productName).Description}</li>
                <li className="list-group-item"><b>Annual subscription cost:</b> ${products.find(product => product.ProductName === formData.productName).AnnualSubscriptionCost}</li>
                <li className="list-group-item h2">
                  <h6>Total revenue (Till date):</h6>
                  ${revenue}
                </li>
            </ul>
            ) : (
            <div className="alert alert-info p-3">
                <p className="text-start m-0">
                  No subscriptions found for the selected customer and product. Do you want to register a
                  <a href="/" onClick={newSubscription} className="text-success text-decoration-none fw-bold"> new entry?</a>
                </p>
            </div>
            )}
          </div>
          {userSubscriptions.length > 0 ? (
          <div className="row mt-4">
            <div className="d-flex justify-content-center">
                <button type="button" onClick={terminateSubscription} className="btn btn-danger shadow-sm fw-bold">
                Terminate Subscription
                </button>
            </div>
          </div>
          ) : null}
      </div>
    </div>
  )
}

export default SubscriptionForm;
