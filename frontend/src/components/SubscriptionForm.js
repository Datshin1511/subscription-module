import React, { useState } from 'react';
import { useMutation, useQuery } from 'react-query';
import { fetchCustomers, fetchProducts, fetchCustomerSubscription, addSubscription, updateSubscription } from '../utilities/api';

function SubscriptionForm() {

  // DECLARATIONS
  const [formData, setFormData] = useState({
    customerId: '',
    productName: '',
    startDate: '',
    endDate: '',
    users: 0
  });

  const [prevEndDate, setPrevEndDate] = useState('');
  const { data: customers } = useQuery('customer', fetchCustomers);
  const { data: products } = useQuery('product', fetchProducts);

  const [userSubscriptions, setUserSubscriptions] = useState([]);
  const [isEditable, setIsEditable] = useState(false) // false: Can be edited, true: Can be submitted

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
    if((new Date(formData.endDate) > new Date(formData.startDate)) && (new Date() <= new Date(formData.startDate))){
      newUserMutation.mutate(formData)
    }
    else{
      if(new Date() > new Date(formData.startDate))
        alert("Start date cannot be in the past!")
      if(new Date(formData.startDate) >= new Date(formData.endDate)){
        alert("End date should be strictly greater than start date!")
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
    <div className='row align-items-stretch'>
      <div className='col-lg-4 col-md-12 m-2 d-flex rounded'>
        <form className="container p-4 border rounded bg-light" onSubmit={checkSubscription}>
          <h3 className="mb-4 text-center">Subscribe for your favourite products and services now!</h3>

          <div className="mb-3">
            <label htmlFor="customerId" className="form-label">Customer</label>
            <select id="customerId" name="customerId" className="form-select" onChange={handleChange} value={formData.customerId} required>
              <option value="">Select Customer</option>
              {customers?.map((customer) => (
                <option key={customer.CustomerID} value={customer.CustomerID}>
                  {customer.Name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="productName" className="form-label">Product</label>
            <select id="productName" name="productName" className="form-select" onChange={handleChange} value={formData.productName} required>
              <option value="">Select Product</option>
              {products?.map((product) => (
                <option key={product.ProductName} value={product.ProductName}>
                  {product.ProductName}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-3">
            <label htmlFor="startDate" className="form-label">Start Date</label>
            <input
              type="date"
              id="startDate"
              name="startDate"
              onChange={handleChange}
              value={formData.startDate}
              className="form-control" 
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="endDate" className="form-label">End Date</label>
            <input
              type="date"
              id="endDate"
              name="endDate"
              onChange={handleChange}
              value={formData.endDate}
              className="form-control"
              required
            />
          </div>

          <div className="mb-3">
            <label htmlFor="users" className="form-label">Number of Users</label>
            <input
              type="number"
              id="users"
              name="users"
              onChange={handleChange}
              value={formData.users}
              className="form-control"
              placeholder="Number of Users"
              required
            />
          </div>

          <button type="submit" className="btn btn-primary w-100">Check for Subscriptions</button>
        </form>
      </div>

      <div className='col-lg col-md-12 bg-black m-2 p-4 d-flex flex-column rounded'>
        <div id='user-info-div' className='row p-2 mb-3'>
          <h3 className='text-center text-white'>Subscriber & Subscription Information</h3>
          <div id='user-info-panel' className='border-top my-2'></div>
          {userSubscriptions.length > 0 ? (
            <ul className='list-group p-1'>
              <li className='list-group-item'><b>Subscription ID:</b> {userSubscriptions[0].SubscriptionID}</li>
              <li className='list-group-item'><b>Customer ID:</b> {formData.customerId}</li>
              <li className='list-group-item'><b>Product:</b> {formData.productName}</li>
              <li className='list-group-item'><b>Start date:</b> {new Date(formData.startDate).toLocaleDateString('en-GB', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric'
                })}</li>
              <li className='list-group-item d-flex justify-content-between'>
                { 
                  isEditable ? (
                    <>
                      <span className='d-flex m-0'>
                        <label htmlFor="endDate" className="form-label"><b>End Date:</b></label>
                        <input
                          type="date"
                          id="endDate"
                          name="endDate"
                          onChange={handleChange}
                          defaultValue={formData.endDate}
                          className="form-control"
                          required
                        />
                      </span>
                      <button type='button' onClick={toggleEditMode} className='btn btn-link text-decoration-none p-0 m-0'><i className="bi bi-floppy"> Save</i></button>
                    </>
                  ) : (
                    <>
                      <span className='m-0'>
                        <b>End date:</b> {new Date(formData.endDate).toLocaleDateString('en-GB', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                      </span>
                      <button type='button' onClick={toggleEditMode} className='btn btn-link text-decoration-none p-0 m-0'><i className="bi bi-pencil-square"> Edit</i></button>
                    </>
                  )
                }
              </li>
              <li className='list-group-item'><b>Number of Users:</b> {formData.users}</li>
              <li className='list-group-item'><b>Description:</b> {products.find(product => product.ProductName === formData.productName).Description}</li>
              <li className='list-group-item'><b>Annual subscription cost:</b> ${products.find(product => product.ProductName === formData.productName).AnnualSubscriptionCost}</li>
            </ul>
          ) : (
            <div className='m-1'>
              <p className='text-info text-start p-0 m-0'>
                No subscriptions found for the selected customer and product. Do you want to register a 
                  <button onClick={newSubscription} className='btn btn-link text-success text-decoration-none p-0'>new entry?</button>
                </p>
            </div>
          )}
        </div>
        {userSubscriptions.length > 0 ? (
          <div className='row'>

            <div className='mb-3 d-flex justify-content-center'>
              <button type='button' onClick={terminateSubscription} className='btn btn-danger'>
                Terminate subscription
              </button>
            </div>

            {/* For RevenueReports Module */}
          </div>
          ) : (
            <></>
          )}
        </div>
    </div>
  )
}

export default SubscriptionForm;
