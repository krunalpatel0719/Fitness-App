# Fitness App

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It is an open-source application for tracking fitness data, including nutrition and exercise metrics, and displays progress analytics in real time.

## Live Demo
[Fitness App Live Link](https://fitness-app-eight-nu.vercel.app/)

## Features

✅ **User Authentication:** Uses Firebase Authentication.  
✅ **Data Analytics:** Tracks nutrition and exercise data with aggregated analytics.  
✅ **Progress Dashboard:** Visualizes data via charts with optimized Firestore queries.  
✅ **Integration:** Connects with external APIs including FatSecret for food data and a free exercise database.  

## Getting Started

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/TaleOfScripting/fitness-app.git
   cd fitness-app
   ```

2. **Install dependencies:**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Create an `.env.local` file:**

   An example of the contents is shown below:

   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   FATSECRET_CLIENT_ID=your_fatsecret_client_id
   FATSECRET_CLIENT_SECRET=your_fatsecret_client_secret
   ```

4. **Start the development server:**

   ```bash
   npm run dev
   # or
   yarn dev
   ```

5. **Open the app in your browser:**

   Navigate to [http://localhost:3000](http://localhost:3000) to see the app in action.

## Special Thanks

🎯 **FatSecret:** Special thanks to FatSecret for providing access to their API. [Visit FatSecret](https://www.fatsecret.com/)  
🎯 **Free Exercise Database:** Special thanks to yuhonas for this free exercise database. [Visit Repository](https://github.com/yuhonas/free-exercise-db)  

## Screenshots
(Include visual examples here for better clarity)

