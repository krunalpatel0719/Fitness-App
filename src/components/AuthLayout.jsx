export function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col items-center bg-gray-100 dark:bg-zinc-900 px-4 relative">
      <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-center mt-16 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
        Welcome to Krunal's Fitness App
      </h1>
      <div className="mt-4 lg:mt-6">
        {children}
      </div>
      <div className="absolute bottom-2 right-4 p-2 dark:text-white">
        {/* <!-- Begin fatsecret Platform API HTML Attribution Snippet --> */}
        <a href="https://www.fatsecret.com">Powered by fatsecret</a>
        {/* <!-- End fatsecret Platform API HTML Attribution Snippet --> */}
      </div>
    </div>
  );
}
