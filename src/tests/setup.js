// Test setup file
beforeEach(() => {
  // Reset any global state before each test
  jest.clearAllMocks()
})

afterAll(async () => {
  // Clean up after all tests
  await new Promise(resolve => setTimeout(resolve, 500))
})
AC