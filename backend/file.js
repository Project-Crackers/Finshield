// checkToken.js
const jwt = require('jsonwebtoken');

// Replace this with a real token you copied from your app
const token = 
'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODIzOGZlN2M2ODZhZGVlYTEyZTBiMzEiLCJpYXQiOjE3NDczODUyMDQsImV4cCI6MTc0OTk3NzIwNH0.BdRvpMf_sSn0d951gn7VOyvtFIYLOTLK7cS00Kd0uaQ'

;

// Same secret used when signing the token
const secretKey = "MY_NAME_IS_GOPINATH";

try {
  const decoded = jwt.verify(token, secretKey);
  console.log("✅ Token is valid!");
  console.log("Decoded Payload:", decoded);
} catch (err) {
  if (err.name === 'TokenExpiredError') {
    console.log("❌ Token has expired");
  } else {
    console.log("❌ Invalid token:", err.message);
  }
}
