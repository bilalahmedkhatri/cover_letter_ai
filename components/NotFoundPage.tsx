import React from 'react';

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20">
      <h1 className="text-6xl font-extrabold text-cyan-400">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-text-primary tracking-tight sm:text-4xl">Page Not Found</h2>
      <p className="mt-6 text-base leading-7 text-text-secondary">
        Sorry, we couldn't find the page you're looking for.
      </p>
      <div className="mt-10 flex items-center justify-center gap-x-6">
        <a
          href="/"
          className="rounded-md bg-indigo-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
        >
          Go back home
        </a>
      </div>
    </div>
  );
};

export default NotFoundPage;
