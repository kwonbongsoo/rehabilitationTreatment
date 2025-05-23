# E-commerce Application

This is a simple e-commerce application built using React and Next.js. The application allows users to browse products, view product details, and manage their shopping experience.

## Features

- **Responsive Design**: The application is designed to be responsive and works well on various devices.
- **Dynamic Routing**: Utilizes Next.js dynamic routing to display product details based on the product ID.
- **Global State Management**: Wraps all pages with a global state management solution for better state handling.
- **API Integration**: Fetches product data from a backend service using utility functions.

## Project Structure

```
ecommerce-app
├── src
│   ├── components          # Contains reusable components
│   │   └── Header.tsx      # Navigation bar component
│   ├── pages               # Contains application pages
│   │   ├── _app.tsx        # Custom App component for global styles
│   │   ├── index.tsx       # Home page displaying featured products
│   │   └── product
│   │       └── [id].tsx    # Product detail page
│   ├── styles              # Contains global styles
│   │   └── globals.css      # Global CSS styles
│   ├── utils               # Utility functions
│   │   └── api.ts          # API call functions
│   └── types               # TypeScript interfaces
│       └── index.ts        # Type definitions
├── public                  # Public assets
│   └── favicon.ico         # Favicon for the application
├── package.json            # NPM configuration file
├── tsconfig.json           # TypeScript configuration file
└── README.md               # Project documentation
```

## Getting Started

1. Clone the repository:
   ```
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```
   cd ecommerce-app
   ```

3. Install dependencies:
   ```
   npm install
   ```

4. Run the application:
   ```
   npm run dev
   ```

5. Open your browser and go to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License

This project is licensed under the MIT License.