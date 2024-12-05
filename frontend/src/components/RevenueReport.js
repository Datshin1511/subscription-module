import React from 'react';
import { useQuery } from 'react-query';
import { fetchSubscriptions } from '../utilities/api';

function RevenueReport() {
  const { data: subscriptions, isLoading } = useQuery('subscriptions', fetchSubscriptions);

  if (isLoading) return <p className='fst-italic'>Loading...</p>;

  const totalRevenue = subscriptions.reduce((sum, sub) => {
    return sum + sub.product.AnnualSubscriptionCost * sub.NumberOfUsers;
  }, 0);

  return (
    <div>
      <h2>Total Revenue: ${totalRevenue.toFixed(2)}</h2>
    </div>
  );
}

export default RevenueReport;
