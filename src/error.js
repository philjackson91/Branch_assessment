import React from 'react';

export default function error({ errorMsg = 'Sorry, something went wrong' }) {
  return <div>{errorMsg}</div>;
}
