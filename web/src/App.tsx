import { ApolloProvider } from '@apollo/client';
import React from 'react';
import { client } from './client';
import Todo from './components/Todo/Todo';

const App: React.FC = () => (
  <ApolloProvider client={client}>
    <Todo />
  </ApolloProvider>
);

export default App;
