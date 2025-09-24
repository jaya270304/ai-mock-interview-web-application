# AI-Powered Mock Interview Platform

A modern web application that helps users prepare for job interviews through AI-powered mock interviews. The platform provides a realistic interview experience with customizable question sets and detailed feedback.

## 🚀 Features

- **User Authentication**: Secure sign-up and login using Clerk authentication
- **Interview Creation**: Customize interviews based on job roles and skill levels
- **Mock Interview Simulation**: Realistic interview experience with AI-powered questions
- **Interactive Interface**: Clean and intuitive UI built with React and TypeScript
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Performance Analytics**: Track your progress and identify areas for improvement
- **Feedback System**: Get detailed feedback on your interview performance

## 🛠️ Tech Stack

- **Frontend**: React 19 with TypeScript
- **UI Components**: Radix UI with custom styling
- **Styling**: Tailwind CSS
- **Authentication**: Clerk
- **Database**: Firebase Firestore
- **AI Integration**: Google Generative AI
- **State Management**: React Context API
- **Routing**: React Router
- **Build Tool**: Vite

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- pnpm (recommended) or npm
- Firebase project with Firestore database
- Clerk authentication setup
- Google Generative AI API key

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/ai-mock-interview-web-application.git
   cd ai-mock-interview-web-application
   ```

2. Install dependencies:
   ```bash
   pnpm install
   # or
   npm install
   ```

3. Create a `.env.local` file in the root directory and add your environment variables:
   ```env
   VITE_FIREBASE_API_KEY=your_firebase_api_key
   VITE_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
   VITE_FIREBASE_PROJECT_ID=your_firebase_project_id
   VITE_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
   VITE_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
   VITE_FIREBASE_APP_ID=your_firebase_app_id
   VITE_FIREBASE_MEASUREMENT_ID=your_firebase_measurement_id
   VITE_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   VITE_GOOGLE_AI_API_KEY=your_google_ai_api_key
   ```

4. Start the development server:
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

## 🏗️ Project Structure

```
src/
├── assets/           # Static assets
├── components/       # Reusable UI components
├── config/           # Configuration files
├── handlers/         # API and event handlers
├── layouts/          # Page layouts
├── lib/              # Utility functions
├── provider/         # Context providers
├── routes/           # Page components
├── types/            # TypeScript type definitions
└── App.tsx           # Main application component
```

## 🧪 Testing

To run the test suite:

```bash
pnpm test
# or
npm test
```

## 🏗️ Building for Production

To create a production build:

```bash
pnpm build
# or
npm run build
```

## 🤝 Contributing

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [Firebase](https://firebase.google.com/)
- [Clerk](https://clerk.com/)
- [Google Generative AI](https://ai.google/)

## 📬 Contact

For any questions or feedback, please reach out to [your-email@example.com](mailto:your-email@example.com)
