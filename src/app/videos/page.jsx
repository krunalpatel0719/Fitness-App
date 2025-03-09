import VideosPage from '@/components/VideosPage';
import { Navbar } from "@/components/Navbar";
export const metadata = {
  title: 'Videos | Your Site Name',
  description: 'Watch the latest videos from our favorite channels',
};

export default function Videos() {
  return (
  <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-50 to-gray-200 dark:from-zinc-900 dark:to-zinc-800">
      <Navbar />
      <main className="border-0 flex-1 p-6 lg:p-8">
        <div className="container max-w-7xl space-y-8 mx-auto">
          <VideosPage />
        </div>
      </main>
    
   </div>
  );
}