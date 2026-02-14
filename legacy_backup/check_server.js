const http = require('http');

console.log("diagnostics: Attempting to connect to http://localhost:3000/api/products...");

const req = http.get('http://localhost:3000/api/products?category=All%20Products', (res) => {
    console.log(`diagnostics: STATUS: ${res.statusCode}`);
    let data = '';
    res.on('data', (chunk) => { data += chunk; });
    res.on('end', () => {
        console.log(`diagnostics: BODY LENGTH: ${data.length}`);
        if (res.statusCode === 200) {
            console.log("diagnostics: SUCCESS - Server is reachable!");
        } else {
            console.log("diagnostics: FAILED - Server returned error.");
        }
    });
});

req.on('error', (e) => {
    console.error(`diagnostics: ERROR: ${e.message}`);
    console.log("diagnostics: SUGGESTION: The server is likely NOT running.");
});
