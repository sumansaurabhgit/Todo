# Daylist

A small MERN todo app: React + Vite, Express, and MongoDB with Mongoose. The Express API is also exposed as a Vercel serverless function.

## Run locally

1. Install Node.js 18 or newer and run a MongoDB server, locally or through MongoDB Atlas. MongoDB Compass is a client; it does not itself run the database server.
2. From this folder, install dependencies:

   ```sh
   npm install
   ```

3. Create a `.env` file in this folder, next to `package.json`, and add your MongoDB connection string. For a local MongoDB server:

   ```env
   MONGODB_URI=mongodb://127.0.0.1:27017/daylist
   ```

   For MongoDB Atlas, use the connection string from Atlas instead:

   ```env
   MONGODB_URI=mongodb+srv://<user>:<password>@<cluster>/<database>
   ```

4. Start the app:

   ```sh
   npm run dev
   ```

   Open the Vite URL shown in the terminal (usually `http://localhost:5173`). The API runs on port 5000.

## Deploy to Vercel

1. Push this folder to a GitHub repository and import it in Vercel. The default Vite build settings (`npm run build`, output directory `dist`) are detected automatically.
2. In the Vercel project settings, add `MONGODB_URI` as an environment variable for the deployment environments you use. Use the MongoDB Atlas connection string, and allow Vercel to connect in the Atlas Network Access settings (for a quick test, Atlas supports allowing access from anywhere).
3. Deploy or redeploy after adding the variable.

The API is available at `/api/tasks`. Keep the MongoDB connection string in environment variables; do not put it in frontend code or commit it.
