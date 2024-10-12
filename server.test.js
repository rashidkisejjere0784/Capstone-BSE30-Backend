const request = require('supertest');
const { app, closeDatabase } = require('./index'); // Import app, server, and closeDatabase

describe('Server running test', () => {
  let testServer; // Define server variable for the test suite

  beforeAll(async () => {
    // Start the server here
    testServer = app.listen(3000); // Start the server on the same port as in your server code
  });

  afterAll(async () => {
    if (testServer) {
      await new Promise((resolve) => {
        testServer.close(resolve);
      }); // Close the server after all tests
    }
    await closeDatabase(); // Close the mongoose connection
  });

  it('should respond with 200 OK on the /health route', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toEqual(200);
    expect(res.text).toBe('Server is healthy!');
  });
});
