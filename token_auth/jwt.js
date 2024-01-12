const jwt = require('jsonwebtoken');
const jwkToPem = require("jwk-to-pem");
const auth0 = require('./auth0');

const secretKey = 'secret';
const expirationTimeMinutes = 30;

const generateJwt = (sub) => {
  const expirationTime = Math.floor(Date.now() / 1000) + (60 * expirationTimeMinutes);

  const payload = {
    sub: sub,
    exp: expirationTime
  };

  const token = jwt.sign(payload, secretKey);
  return token;
};

const validateJwt = async (token) => {
  const jwks = await auth0.getJwks();
  const validationResult = jwt.verify(token, jwkToPem(jwks));
  console.log('jwt validated:');
  console.log(validationResult);  
  return {
    principal: {
      username: validationResult.sub,
    },
    expires: new Date(Number(validationResult.exp) * 1000),
  };
};

module.exports = { generateJwt, validateJwt }