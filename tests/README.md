# Unit Testing Guide - Simple Payment API

## Introduction

This document provides a guide for running and developing unit tests for the Simple Payment API project.

## Test Structure

The unit tests follow the same structure as the hexagonal architecture of the project:

```
tests/
├── docs/                  # Test documentation
│   └── test-plan.md       # Detailed unit test plan
├── unit/                  # Unit tests
│   ├── app/               # Tests for main application modules
│   ├── contexts/          # Tests for domain contexts
│   │   ├── products/      # Tests for products context
│   │   ├── transactions/  # Tests for transactions context
│   │   ├── users/         # Tests for users context
│   │   └── shared/        # Tests for shared components
│   ├── jest-config.ts     # Jest configuration for unit tests
│   └── run-tests.sh       # Script to run unit tests
└── e2e/                   # End-to-end tests
```

## How to Run Tests

```
bash tests/unit/run-tests.sh
```

### Prerequisites

- Node.js (version 14 or higher)
- npm (version 6 or higher)

### Run All Unit Tests

```bash
# On Windows (PowerShell)
npx jest --config=tests/unit/jest-config.ts

# On Linux/Mac
chmod +x tests/unit/run-tests.sh
./tests/unit/run-tests.sh
```

### Run Tests with Coverage

```bash
npx jest --config=tests/unit/jest-config.ts --coverage
```

### Run Specific Tests

```bash
# Run tests for a specific file
npx jest --config=tests/unit/jest-config.ts tests/unit/contexts/transactions/application/services/transaction.service.spec.ts

# Run tests that match a pattern
npx jest --config=tests/unit/jest-config.ts -t "should process payment successfully"
```

## Best Practices for Writing Tests

### 1. Test Structure

Follow the AAA pattern (Arrange-Act-Assert):

```typescript
describe('MyService', () => {
  it('should do something specific', () => {
    // Arrange
    const data = {...};
    
    // Act
    const result = service.method(data);
    
    // Assert
    expect(result).toEqual(expectedValue);
  });
});
```

### 2. Mocking Dependencies

Use Jest to create mocks for dependencies:

```typescript
// Repository mock
const repositoryMock = {
  findOne: jest.fn(),
  save: jest.fn(),
};

// Configure mock behavior
repositoryMock.findOne.mockResolvedValue({ id: 1, name: 'Test' });
```

### 3. Testing Success and Error Cases

Ensure to test both success and error cases:

```typescript
// Success case
it('should process payment correctly', async () => {
  // ...
});

// Error case
it('should handle errors when payment is rejected', async () => {
  // ...
  await expect(service.processPayment(data)).rejects.toThrow('Payment rejected');
});
```

### 4. Code Coverage

Aim to achieve adequate coverage in:

- Statements: 80%
- Branches: 70%
- Functions: 80%
- Lines: 80%

## Priority Components for Testing

It is recommended to prioritize tests in the following order:

1. **Application Services**: Contain the main business logic
   - TransactionService
   - ProductService
   - UserService
   - WompiService

2. **Repositories**: Implement persistence
   - TransactionRepository
   - ProductRepository
   - UserRepository

3. **Controllers**: Handle HTTP requests
   - TransactionController
   - ProductController
   - AuthController

4. **Domain Entities**: Represent the main domain objects

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)
- [Detailed test plan](./docs/test-plan.md)