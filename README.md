# Voxta Frontend
Welcome to the Voxta Frontend repository — the client-side of Voxta, a real-time chat application that connects users based on shared interests. This frontend is built with React and deployed on Vercel.

🌐 Live Demo: https://voxta-frontend.nikhilrajpk.in
🔗 Backend API: https://voxta-backend.nikhilrajpk.in

 **Features**
🔐 **User Authentication**: Secure registration and login with JWT tokens.

💬 **Real-Time Chat**: Seamless messaging using WebSockets.

🎯 **Interest Matching**: Connects users based on mutual interests.

📱 **Responsive Design**: Works smoothly on desktop and mobile devices.

🔌 **API Integration**: Fetches users, messages, and interests via RESTful APIs.

🛠️ Tech Stack
Category	Technology
Framework	React
State Management	React Context / Redux (if applicable)
HTTP Client	Axios
Real-time Comm.	Native WebSocket
Styling	CSS / Tailwind CSS (if applicable)
Deployment	Vercel
Version Control	Git + GitHub

📦 Prerequisites
Node.js (v18+)

npm or Yarn

GitHub account

Vercel account (for deployment)

Access to the Voxta Backend API

⚙️ Getting Started
1. Clone the Repository
bash
Copy
Edit
git clone https://github.com/nikhilrajpk/voxta_frontend.git
cd voxta_frontend
2. Install Dependencies
bash
Copy
Edit
npm install
3. Configure Environment Variables
Create a .env file in the root directory:

ini
Copy
Edit
REACT_APP_API_URL=https://voxta-backend.nikhilrajpk.in/api/
REACT_APP_WS_URL=wss://voxta-backend.nikhilrajpk.in/ws/chat/
4. Run Locally
bash
Copy
Edit
npm start
Visit: http://localhost:3000

5. Build for Production
bash
Copy
Edit
npm run build
Build files will be generated in the build/ directory.

📡 Deployment (Vercel)
This project is deployed using Vercel with GitHub integration for automatic CI/CD.

Steps to Deploy
Push to GitHub

bash
Copy
Edit
git add .
git commit -m "Initial commit"
git push origin main
Set Up on Vercel

Log in to Vercel

Click "New Project", and import your voxta_frontend repo.

Configure:

Framework Preset: React

Root Directory: ./

Build Command: npm run build

Output Directory: build

Environment Variables:

ini
Copy
Edit
REACT_APP_API_URL=https://voxta-backend.nikhilrajpk.in/api/
REACT_APP_WS_URL=wss://voxta-backend.nikhilrajpk.in/ws/chat/
Custom Domain

Assign your custom domain:
https://voxta-frontend.nikhilrajpk.in

Automatic Deployments

Every push to main triggers deployment.

Pull requests create preview deployments.

📁 Project Structure
bash
Copy
Edit
voxta_frontend/
├── public/                 # Static assets
├── src/
│   ├── API/                # Axios instance and API calls
│   ├── components/         # Reusable React components
│   ├── pages/              # Page components (e.g., Login, Chat)
│   ├── styles/             # CSS/Tailwind styles
│   ├── App.js              # Main app component
│   └── index.js            # Entry point
├── .env                    # Environment variables
├── package.json            # Project config and dependencies
└── README.md               # Project overview (this file)
🤝 Contributing
Fork this repository.

Create a branch:

bash
Copy
Edit
git checkout -b feature-name
Commit your changes:

bash
Copy
Edit
git commit -m "Add new feature"
Push to GitHub:

bash
Copy
Edit
git push origin feature-name
Open a pull request.

🐞 Issues
Found a bug or want to suggest a feature?
Submit an issue on the GitHub Issues page.

📄 License
This project is licensed under the MIT License.

📬 Contact
Have questions or suggestions?
Feel free to reach out via nikhilrajpk.in
