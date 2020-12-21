const app = require("./backend/app");
const http = require("http");

// Set up port as either 3000 or the assigned environment variable
const port = process.env.PORT || "3000";
app.set("port", port);

// Create server using our routing middleware and listen
const server = http.createServer(app);
server.listen(port);
