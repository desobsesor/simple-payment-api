#!/bin/bash

# Script to run unit tests and generate coverage reports

# Colors for output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${YELLOW}Running unit tests...${NC}"

# Run unit tests with coverage
npx jest --config=tests/unit/jest-config.ts --coverage

# Check if tests were successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Unit tests completed successfully!${NC}"
  echo -e "${YELLOW}Coverage report generated in ./coverage/unit${NC}"
else
  echo -e "\033[0;31mSome tests failed. Please check the errors.\033[0m"
  exit 1
fi