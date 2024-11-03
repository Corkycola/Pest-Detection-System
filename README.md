Pest Detection System
This project is a web application designed for real-time pest detection, helping farmers monitor pest presence through a mobile-integrated and web-based platform using YOLO-based object detection.

Getting Started
Prerequisites
Node.js and npm must be installed on your system.
A Google service file (downloaded from Firebase or your Google Cloud Console) must be added to the project.
Setup
Clone the repository to your local machine:

bash
Copy code
git clone https://github.com/your-repo/pest-detection-system.git
cd pest-detection-system
Add Google Service File: Place your Google service file (e.g., google-services.json or serviceAccountKey.json) in the project root.

Install Dependencies:

Navigate to both the backend and frontend folders and install dependencies:
bash
Copy code
# In the backend folder
cd backend
npm install

# In the frontend folder
cd ../frontend
npm install
Running the Application
Start the Backend Server:

In the backend folder, run the server:
bash
Copy code
node server.js
Start the Frontend:

In the frontend folder, start the React app:
bash
Copy code
npm start
Accessing the Application
Once both the backend and frontend servers are running, you can access the app by visiting http://localhost:3000 in your browser.