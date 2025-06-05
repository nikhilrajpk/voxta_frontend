# 💬 Voxta Frontend

Welcome to the **Voxta Frontend** repository — the client-side of **Voxta**, a real-time chat application that connects users based on shared interests. Built using **React**, styled for responsiveness, and deployed on **Vercel**.

- 🌐 **Live Demo**: [voxta-frontend.nikhilrajpk.in](https://voxta-frontend.nikhilrajpk.in)  
- 🔗 **Backend API**: [voxta-backend.nikhilrajpk.in](https://voxta-backend.nikhilrajpk.in)

---

## 🚀 Features

- 🔐 **JWT Authentication** – Secure login & registration
- 💬 **Real-Time Chat** – Powered by WebSockets
- 🎯 **Interest-Based Matching** – Connect users based on common interests
- 📱 **Responsive UI** – Optimized for mobile and desktop
- 🔌 **REST API Integration** – Fetch messages, users, and interests via Axios

---

## 🧰 Tech Stack

| Category             | Tech                        |
|----------------------|-----------------------------|
| Frontend Framework   | React                       |
| State Management     | React Context / Redux       |
| HTTP Client          | Axios                       |
| Real-Time Comm.      | WebSocket API               |
| Styling              | CSS / Tailwind CSS *(if used)* |
| Deployment           | Vercel                      |
| Version Control      | Git + GitHub                |

---

## 📦 Prerequisites

- Node.js `v18+`
- npm or Yarn
- GitHub Account
- Vercel Account
- Access to [Voxta Backend](https://voxta-backend.nikhilrajpk.in)

---

## ⚙️ Getting Started

```bash
# Clone the repository
git clone https://github.com/nikhilrajpk/voxta_frontend.git
cd voxta_frontend

# Install dependencies
npm install
🔑 Set Environment Variables
Create a .env file in the root directory and add:

env
Copy
Edit
REACT_APP_API_URL=https://voxta-backend.nikhilrajpk.in/api/
REACT_APP_WS_URL=wss://voxta-backend.nikhilrajpk.in/ws/chat/
▶️ Run Locally
bash
Copy
Edit
npm start
Visit: http://localhost:3000

📦 Build for Production
bash
Copy
Edit
npm run build
Build files will be generated in the build/ directory.

🚀 Deployment on Vercel
This project is deployed using Vercel with GitHub integration for automatic CI/CD.

🔧 Setup Steps
Push code to GitHub:

bash
Copy
Edit
git add .
git commit -m "Initial commit"
git push origin main
Log in to Vercel

Click "New Project" → Import your voxta_frontend repo

Configure build settings:

Option	Value
Framework Preset	React
Root Directory	./
Build Command	npm run build
Output Directory	build

Add Environment Variables:

env
Copy
Edit
REACT_APP_API_URL=https://voxta-backend.nikhilrajpk.in/api/
REACT_APP_WS_URL=wss://voxta-backend.nikhilrajpk.in/ws/chat/
Assign your custom domain:
https://voxta-frontend.nikhilrajpk.in

✅ Automatic Deployments
Every push to main triggers a new deployment.

Pull requests create preview deployments.

📁 Project Structure
bash
Copy
Edit
voxta_frontend/
├── public/               # Static assets
├── src/
│   ├── API/              # Axios instance and API methods
│   ├── components/       # Reusable React components
│   ├── pages/            # Page views (Login, Chat, etc.)
│   ├── styles/           # CSS / Tailwind styles
│   ├── App.js            # Main app component
│   └── index.js          # Entry point
├── .env                  # Environment config
├── package.json          # Project dependencies
└── README.md             # Project overview
🤝 Contributing
Fork this repository

Create a feature branch:

bash
Copy
Edit
git checkout -b feature-name
Commit your changes:

bash
Copy
Edit
git commit -m "Add new feature"
Push and open a pull request:

bash
Copy
Edit
git push origin feature-name
🐞 Issues
Found a bug or want to suggest a feature?
Open an issue at GitHub Issues

📄 License
Licensed under the MIT License

📬 Contact
Have questions, suggestions, or want to collaborate?
Reach out at: nikhilrajpk.in

