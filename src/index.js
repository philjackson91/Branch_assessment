import { ApolloProvider, useQuery } from '@apollo/react-hooks';
import ApolloClient, { gql } from 'apollo-boost';
import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';
import { createBrowserRouter, RouterProvider, Link } from 'react-router-dom';
import env from './env';
import ErrorPage from './error';
import LoadingPage from './loader';
import UserEditor from './UserEditor';

import './css/Global.css';
import heading from './css/Heading.module.css';
import table from './css/Table.module.css';

const client = new ApolloClient({
  uri: env.GRAPHQL_ENDPOINT,
  request: (operation) => {
    operation.setContext({
      headers: {
        'x-api-key': env.GRAPHQL_API_KEY,
      },
    });
  },
});

const ALL_USERS_QUERY = gql`
  query {
    allUsers {
      email
      name
      role
    }
  }
`;

const deleteUserMutation = gql`
  mutation ($emails: [ID]!) {
    deleteUsers(emails: $emails)
  }
`;

const App = () => {
  const { loading, error, data, refetch } = useQuery(ALL_USERS_QUERY);

  const [selectedUsers, setSelectedUsers] = useState([]);

  const handleUserSelect = (e, selectedUser) => {
    const { checked } = e.target;
    const users = [...selectedUsers];
    const index = users.findIndex((user) => {
      return user.email === selectedUser.email;
    });
    if (index >= 0) {
      if (!checked) {
        users.splice(index, 1);
      }
    } else {
      if (checked) {
        users.push(selectedUser);
      }
    }
    setSelectedUsers([...users]);
  };
  const deleteHandler = async () => {
    let emails = selectedUsers.map((user) => user.email);
    try {
      await client.mutate({
        mutation: deleteUserMutation,
        variables: {
          emails: emails,
        },
      });
      setSelectedUsers([]);
      refetch();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    refetch();
  }, [refetch]);

  if (loading) {
    return <LoadingPage />;
  }

  if (error) {
    return <p>Error: {JSON.stringify(error)}</p>;
  }

  return (
    <div>
      <div className={heading.header}>
        <p className={heading.headingText}>Users</p>
        <button
          disabled={!selectedUsers.length}
          className={`${heading.button} ${
            !selectedUsers.length ? heading.inactive : heading.active
          }`}
          onClick={deleteHandler}
        >
          Delete
        </button>
      </div>
      <table className={table.table}>
        <thead>
          <tr>
            <th className={table.tableHeader}></th>
            <th className={table.tableHeader}>EMAIL</th>
            <th className={table.tableHeader}>NAME</th>
            <th className={table.tableHeader}>ROLE</th>
          </tr>
        </thead>
        <tbody>
          {data.allUsers.map((user) => (
            <tr key={user.email} className={table.tableRow}>
              <td className={`${table.tableCell} ${table.tableSelect}`}>
                <input type="checkbox" onChange={(e) => handleUserSelect(e, user)} />
              </td>
              <td className={`${table.tableCell} ${table.tableEmail}`}>
                <Link to={`selectedUser/${user.email}`}>{user.email}</Link>
              </td>
              <td className={table.tableCell}>{user.name}</td>
              <td className={table.tableCell}>{user.role}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <ErrorPage />,
  },
  {
    path: '/selectedUser/:email',
    element: <UserEditor client={client} />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.render(
  <React.StrictMode>
    <ApolloProvider client={client}>
      <RouterProvider router={router} />
    </ApolloProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
