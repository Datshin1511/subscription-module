import React from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { fetchSubscriptions, endSubscription } from '../utilities/api';

function SubscriptionTable() {
  const queryClient = useQueryClient();
  const { data: subscriptions, isLoading } = useQuery('subscriptions', fetchSubscriptions);

  const mutation = useMutation(endSubscription, {
    onSuccess: () => {
      queryClient.invalidateQueries('subscriptions');
      alert('Subscription ended');
    }
  });

  if (isLoading) return <p>Loading...</p>;

  return (
    <div>
      <h2>Subscriptions</h2>
      <table>
        <thead>
          <tr>
            <th>Customer</th>
            <th>Product</th>
            <th>Start Date</th>
            <th>End Date</th>
            <th>No. of Users</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {subscriptions.map((sub) => (
            <tr key={sub.id}>
              <td>{sub.customer.name}</td>
              <td>{sub.product.product_name}</td>
              <td>{sub.start_date}</td>
              <td>{sub.end_date}</td>
              <td>{sub.users_subscribed}</td>
              <td>
                <button onClick={() => mutation.mutate(sub.id)}>End Subscription</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default SubscriptionTable;
