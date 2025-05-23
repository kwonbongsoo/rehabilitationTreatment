# Koa Authentication Server

This project is a simple authentication server built using the Koa framework and TypeScript. It provides basic authentication functionalities such as user registration and login.

## Project Structure

```
koa-auth-server
├── src
│   ├── app.ts                # Entry point of the application
│   ├── controllers           # Contains controllers for handling requests
│   │   └── authController.ts # Authentication controller
│   ├── middleware            # Middleware functions
│   │   └── authMiddleware.ts  # Authentication middleware
│   ├── routes                # Route definitions
│   │   └── authRoutes.ts     # Authentication routes
│   ├── services              # Business logic and services
│   │   └── authService.ts     # Authentication service
│   └── types                 # Type definitions
│       └── index.ts          # User and request interfaces
├── package.json              # NPM package configuration
├── tsconfig.json             # TypeScript configuration
└── README.md                 # Project documentation
```

## Installation

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd koa-auth-server
   ```

3. Install the dependencies:
   ```
   npm install
   ```

## Usage

To start the server, run the following command:

```
npm start
```

The server will be running on `http://localhost:3000`.

## API Endpoints

- `POST /auth/register`: Register a new user.
- `POST /auth/login`: Log in an existing user.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any improvements or features.

## License

This project is licensed under the MIT License.