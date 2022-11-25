import React, { useEffect, useState } from 'react';
import { gql } from 'apollo-boost';
import { useParams, useNavigate } from 'react-router-dom';
import Loader from './loader';
import { useQuery } from '@apollo/react-hooks';

import './css/Global.css';
import heading from './css/Heading.module.css';
import form from './css/Form.module.css';

export const getPageQuery = gql`
  query ($email: ID!) {
    user(email: $email) {
      email
      name
      role
    }
  }
`;
const udpateUserMutation = gql`
  mutation ($email: ID!, $newAttributes: UserAttributesInput!) {
    updateUser(email: $email, newAttributes: $newAttributes) {
      email
      name
      role
    }
  }
`;

export default function UserEditor({ client }) {
  const [userData, setUserData] = useState(null);

  const navigate = useNavigate();
  let { email: userEmail } = useParams();
  const { loading, error, data } = useQuery(getPageQuery, {
    variables: { email: userEmail },
  });

  const userDataInputHandler = (e) => {
    let { name, value } = e.target;
    setUserData({ ...userData, [name]: value });
  };
  const submitHandler = async (e) => {
    e.preventDefault();
    try {
      await client.mutate({
        mutation: udpateUserMutation,
        variables: {
          email: userData.email,
          newAttributes: { name: userData.name, role: userData.role },
        },
      });
      navigate('/');
    } catch (error) {}
  };

  useEffect(() => {
    if (data && !userData) {
      setUserData(data.user);
    }
    return () => setUserData(null);
  }, [loading, error, data]);

  if (loading) {
    return <Loader />;
  }

  if (userData) {
    return (
      <div>
        <div className={heading.header}>
          <p className={heading.headingText}>{userData.email}</p>
          <button form="edit-user" type="submit">
            Save
          </button>
        </div>
        <form id="edit-user" onSubmit={submitHandler} className={form.form}>
          <label className={form.name}>
            Name
            <input
              type="text"
              name="name"
              value={userData.name}
              onChange={userDataInputHandler}
              required
            />
          </label>
          <fieldset id="role" className={form.role}>
            <label className={form.roleLabel}>Role</label>
            {['Admin', 'Developer', 'App Manager', 'Marketing', 'Sales'].map((option) => {
              let optionAltered = option.split(' ');
              optionAltered = optionAltered.join('_').toUpperCase();
              return (
                <div key={optionAltered} className={form.roleChoice}>
                  <label>
                    <input
                      type="radio"
                      value={optionAltered}
                      name="role"
                      checked={userData.role === optionAltered}
                      onChange={userDataInputHandler}
                      required
                    />
                    {option}
                  </label>
                  <br />
                </div>
              );
            })}
          </fieldset>
        </form>
      </div>
    );
  }

  return <p>...no user found</p>;
}
