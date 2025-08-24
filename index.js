// MedMap Application Entry Point
console.log('MedMap application starting...');

// Basic HTTP server
const http = require('http');
const port = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type': 'text/html'});
  res.end(`
    <!DOCTYPE html>
    <html>
    <head>
        <title>MedMap Application</title>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
    </head>
    <body>
        <h1>MedMap Application</h1>
        <p>Server is running successfully!</p>
        <p>Time: ${new Date().toISOString()}</p>
    </body>
    </html>
  `);
});

server.listen(port, () => {
  console.log(`MedMap server running at http://localhost:${port}/`);
});
