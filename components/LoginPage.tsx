import React, { useState } from 'react';
import { LinkIcon } from './Icons';

interface LoginPageProps {
  onLogin: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.includes('@') && password.length > 0) {
      setError('');
      onLogin();
    } else {
      setError('Please enter a valid email and password');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <div className="flex flex-col md:flex-row h-screen">
        {/* Left side - Form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <div className="flex items-center justify-center text-primary-600 dark:text-primary-400 mb-4">
                  <LinkIcon className="w-10 h-10" />
                  <h1 className="ml-3 text-3xl font-bold text-gray-900 dark:text-white">Lost Link</h1>
              </div>
              <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
                Sign in to your account
              </h2>
            </div>
            <form className="mt-8 space-y-6" onSubmit={handleLogin}>
              <div className="space-y-4 rounded-md shadow-sm">
                <div>
                  <label htmlFor="email-address" className="sr-only">Email address</label>
                  <input
                    id="email-address"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="password-input" className="sr-only">Password</label>
                  <input
                    id="password-input"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    required
                    className="relative block w-full px-3 py-2 text-gray-900 placeholder-gray-500 border border-gray-300 rounded-md appearance-none focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-gray-400"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
              </div>

              {error && <p className="text-sm text-center text-red-500">{error}</p>}

              <div>
                <button
                  type="submit"
                  className="relative flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md bg-primary-600 group hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Sign in
                </button>
              </div>
            </form>
             <p className="mt-4 text-center text-xs text-gray-500 dark:text-gray-400">
                Hint: Enter any valid email and password to log in.
            </p>
          </div>
        </div>

        {/* Right side - Visual */}
        <div className="hidden md:flex w-1/2 bg-gradient-to-br from-primary-500 to-primary-700 items-center justify-center p-12 text-white">
           <div className="text-center">
             <h2 className="text-4xl font-extrabold">Connecting What's Lost with What's Found</h2>
             <p className="mt-4 text-lg opacity-80">
                Our system intelligently analyzes and manages items to ensure a seamless recovery process.
             </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;