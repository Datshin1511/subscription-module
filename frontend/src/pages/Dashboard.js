import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import SubscriptionForm from '../components/SubscriptionForm';

const queryClient = new QueryClient();

function Dashboard() {
  return (
    <QueryClientProvider client={queryClient}>
      <div className="container container-md-6 container-sm">
        <SubscriptionForm />
      </div>
    </QueryClientProvider>
  );
}

export default Dashboard;
