# 🚀 AI-Powered Resume Analyzer & Builder

An intelligent, full-stack web application that leverages Google's Gemini AI to analyze resumes, match them against job descriptions, and provide actionable feedback. The platform features a freemium model, offering basic analysis for free users and advanced ATS scoring, AI-powered rewrites, and a PDF resume builder for Pro users.

## 🛠️ Tech Stack & Languages

This application is built using modern web technologies. The primary programming language is **TypeScript** (a strictly typed superset of JavaScript).

*   **Language:** [TypeScript](https://www.typescriptlang.org/) / JavaScript
*   **Frontend Framework:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Database & Authentication:** [Firebase](https://firebase.google.com/) (Firestore & Google Auth)
*   **AI Integration:** [Google Gemini API](https://ai.google.dev/) (`gemini-3.1-pro-preview`)
*   **Icons & Animations:** [Lucide React](https://lucide.dev/) & [Motion](https://motion.dev/)
*   **PDF Generation:** `html2pdf.js`

## ✨ Features

### 🆓 Free Tier
*   **Basic Resume Score:** Get an overall score out of 100.
*   **Skill Detection:** Automatically extract and list skills found in the resume.
*   **Keyword Extraction:** Pull out important keywords from the resume content.
*   **Basic Suggestions:** Receive 3-5 high-level suggestions for improvement.
*   **Simple UI Report:** Clean, easy-to-read dashboard for analysis results.

### 💎 Pro Tier
*   **Job Description Matching:** Compare the resume directly against a specific job description.
*   **Match Percentage & Missing Skills:** Calculate exact match percentage and identify critical missing skills.
*   **Advanced AI Rewrites:** Get specific "Original" vs "Improved" text suggestions for different resume sections.
*   **Section-wise Scoring:** Break down scores by Experience, Education, Skills, etc.
*   **ATS Compatibility Check:** Receive a specific ATS score and a list of technical formatting issues to fix.
*   **Smart Job Board Recommendations:** Get tailored recommendations on the best websites to apply for the specific role.
*   **Resume Builder:** Generate, customize, and download clean, ATS-friendly PDF resumes.
*   **Analytics Dashboard:** Track analysis history, average scores, and improvement over time.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   A Google Gemini API Key
*   A Firebase Project (for Auth and Firestore)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/resume-analyzer.git
    cd resume-analyzer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    GEMINI_API_KEY=your_gemini_api_key_here
    ```
    *Note: Ensure your Firebase configuration is properly set up in your project.*

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to `http://localhost:3000`

## 📦 Deployment

This project is configured for easy deployment on platforms like Netlify or Vercel. A `netlify.toml` file is included for seamless Netlify deployment.

1. Connect your GitHub repository to Netlify.
2. Ensure the build command is set to `npm run build` and the publish directory is `dist`.
3. Add your `GEMINI_API_KEY` to the Environment Variables in your hosting provider's dashboard.
4. Add your deployed domain to your Firebase Authentication "Authorized Domains" list.
