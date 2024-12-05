import React from 'react';
import { QueryClient, QueryClientProvider } from 'react-query';
import SubscriptionForm from '../components/SubscriptionForm';

import '../styles/app.css'

const queryClient = new QueryClient();

function App() {
  return (
    <div className="App container-fluid">
      <QueryClientProvider client={queryClient}>
        <SubscriptionForm />
      </QueryClientProvider>
    </div>
  );
}

export default App;
