const axios = require('axios');

const DOMAIN = 'dev-ef0ammhocd6s7vrr.us.auth0.com';
const AUDIENCE = 'https://dev-ef0ammhocd6s7vrr.us.auth0.com/api/v2/';
const CLIENT_ID = 'dZIl6t9iPT8jAE25nv0NFHFTJ5odXkzW';
const CLIENT_SECRET = 'gO60v99fobcbwjw5MCa_-YODD4Tl55x-DqBIeA2d1rkzW_OC-2VY4t_gHA91IAJ7';
const AUTH0_URL = `https://${DOMAIN}`;

const loginPasswordGrant = async (email, password) => {
  const authResponse = await axios.post(AUTH0_URL + '/oauth/token', {
    grant_type: 'password',
    username: email,
    password: password,
    audience: AUDIENCE,
    scope: 'offline_access',
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  if (authResponse.status !== 200) {
    return null;
  }

  return authResponse.data;
};

const refreshTokenGrant = async (refreshToken) => {
  const authResponse = await axios.post(AUTH0_URL + '/oauth/token', {
    grant_type: 'refresh_token',
    refresh_token: refreshToken,
    client_id: CLIENT_ID,
    client_secret: CLIENT_SECRET,
  });

  if (authResponse.status !== 200) {
    return null;
  }
  console.log('token refreshed:\n' + authResponse.data.access_token);

  return {
    access_token: authResponse.data.access_token,
    refresh_token: authResponse.data.refresh_token,
  };
}

const getJwks = async () => {
  const authResponse = await axios.get(AUTH0_URL + '/.well-known/jwks.json');
  if (authResponse.status !== 200) {
    return null;
  }

  return authResponse.data.keys[0];
};

const getManagementToken = async () => {
  try {
    const authResponse = await axios.post(AUTH0_URL + '/oauth/token', {
      grant_type: 'client_credentials',
      audience: AUDIENCE,
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
    });

    if (authResponse.status !== 200) {
      return null;
    }

    return authResponse.data.access_token;
  } catch (error) {
    console.log(error);
    return null;
  }
};

const createUser = async (email, password) => {
  try {
    const managementToken = await getManagementToken();
    const authResponse = await axios.post(
      AUTH0_URL + '/api/v2/users',
      {
        email,
        password,
        connection: 'Username-Password-Authentication',
      },
      {
        headers: {
          Authorization: `Bearer ${managementToken}`,
        },
      }
    );

    console.log(authResponse);
    if (authResponse.status !== 200) {
      return null;
    }
  } catch (error) {
    console.log(error);
    return null;
  }
};

module.exports = { loginPasswordGrant, createUser, refreshTokenGrant, getJwks, refreshTokenGrant };