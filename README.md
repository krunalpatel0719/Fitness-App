# Fitness App

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app). It is an open-source application for tracking fitness data, including nutrition and exercise metrics, and displays progress analytics in real time.

## Features

- **User Authentication:** Uses Firebase Authentication.
- **Data Analytics:** Tracks nutrition and exercise data with aggregated analytics.
- **Progress Dashboard:** Visualizes data via charts with optimized Firestore queries.
- **Integration:** Connects with external APIs including FatSecret for food data and a free exercise database.

## Getting Started

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/TaleOfScripting/fitness-app.git
   cd fitness-app

2. Install depedencies:

    npm install
    # or 
    yarn install
3. Create an .env.local file, an example of the contents is here:

    NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
    NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
    NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
    NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
    NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
    NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
    NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
    FATSECRET_CLIENT_ID=your_fatsecret_client_id
    FATSECRET_CLIENT_SECRET=your_fatsecret_client_secret

4. To start the deployment server run:
    npm run dev
    # or 
    yarn dev

Open http://localhost:3000 with your browser to see your app in action.



Special Thanks
FatSecret: Special thanks to FatSecret for providing access to their API https://www.fatsecret.com/.
Free Exercise Database: Special thanks to yuhonas for this free exercise database https://github.com/yuhonas/free-exercise-db.
