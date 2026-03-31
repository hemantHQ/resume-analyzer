# 🚀 AI-Powered Resume Analyzer & Builder

An intelligent, modern web application that leverages Google's Gemini AI to analyze resumes, match them against job descriptions, and provide actionable feedback. The platform is completely free and open-source, offering advanced ATS scoring, AI-powered rewrites, and a PDF resume builder for all users.

## 🛠️ Tech Stack & Languages

This application is built using modern web technologies. The primary programming language is **TypeScript** (a strictly typed superset of JavaScript).

*   **Language:** [TypeScript](https://www.typescriptlang.org/) / JavaScript
*   **Frontend Framework:** [React 19](https://react.dev/)
*   **Build Tool:** [Vite](https://vitejs.dev/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **AI Integration:** [Google Gemini API](https://ai.google.dev/) (`gemini-3.1-pro-preview`)
*   **Icons & Animations:** [Lucide React](https://lucide.dev/) & [Motion](https://motion.dev/)
*   **PDF Generation:** `html2pdf.js`

## ✨ Features

*   **Completely Free:** No paywalls, no login required. All features are available to everyone.
*   **Comprehensive Resume Analysis:** Get an overall score out of 100, along with section-wise breakdowns.
*   **Industry Match Percentage:** See how well your resume aligns with standard industry expectations.
*   **Skill Detection & Gap Analysis:** Automatically extract skills and discover critical missing skills expected in your field.
*   **Advanced AI Rewrites:** Get specific "Original" vs "Improved" text suggestions for different resume sections.
*   **ATS Compatibility Check:** Receive a specific ATS score and a list of technical formatting issues to fix.
*   **Smart Job Board Recommendations:** Get tailored recommendations on the best websites to apply for based on your profile.
*   **Resume Builder:** Generate, customize, and download clean, ATS-friendly PDF resumes in multiple templates (Modern, Simple, Professional).
*   **Modern UI/UX:** A sleek, responsive design with smooth animations and a dark mode that respects your system preferences.

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18 or higher)
*   npm or yarn
*   A Google Gemini API Key

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hemantHQ/Resume-Analyzer.git
    cd Resume-Analyzer
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory and add your Gemini API key:
    ```env
    VITE_GEMINI_API_KEY=your_gemini_api_key_here
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

5.  **Open your browser:**
    Navigate to `http://localhost:3000`
