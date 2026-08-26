import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import logo from '../assets/logo1.png';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    try {
      setLoading(true);
       await login(data.email, data.password);
       toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (

    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">

  {/* Header */}
  <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
    <div className="mx-auto ">
     <img src={logo} alt="Logo" />
    </div>

    <h2 className="text-3xl font-bold tracking-tight text-gray-900">
     BSA Report Portal
    </h2>

    <p className="mt-2 text-sm text-gray-500">
      Sign in to access your reports
    </p>
  </div>

  {/* Login Card */}
  <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    <div className="rounded-xl bg-white px-6 py-8 shadow-sm ring-1 ring-gray-200 sm:px-8">

      <form
        className="space-y-5"
        onSubmit={handleSubmit(onSubmit)}
      >

        {/* Email */}
        <div>
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700"
          >
            Email address
          </label>

          <input
            id="email"
            type="email"
            placeholder="Enter your email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value:
                  /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: "Invalid email address",
              },
            })}
            className={`mt-2 block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900
              placeholder-gray-400 shadow-sm
              focus:outline-none focus:ring-2
              ${
                errors.email
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-[#412985] focus:ring-purple-100"
              }`}
          />

          {errors.email && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>

          <input
            id="password"
            type="password"
            placeholder="Enter your password"
            {...register("password", {
              required: "Password is required",
              minLength: {
                value: 6,
                message: "Password must be at least 6 characters",
              },
            })}
            className={`mt-2 block w-full rounded-lg border px-3 py-2.5 text-sm text-gray-900
              placeholder-gray-400 shadow-sm
              focus:outline-none focus:ring-2
              ${
                errors.password
                  ? "border-red-400 focus:border-red-500 focus:ring-red-100"
                  : "border-gray-300 focus:border-[#412985] focus:ring-purple-100"
              }`}
          />

          {errors.password && (
            <p className="mt-1.5 text-xs text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-[#412985] px-4 py-2.5 text-sm font-semibold
            text-white shadow-sm transition
            hover:bg-[#35206f]
            focus:outline-none focus:ring-2 focus:ring-[#412985] focus:ring-offset-2
            disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      {/* Footer inside card */}
      <div className="mt-6 border-t border-gray-100 pt-5 text-center">
        <p className="text-xs text-gray-400">
          Secure access to the Report Portal
        </p>
      </div>

    </div>
  </div>
</div>
    // <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    //   <div className="sm:mx-auto sm:w-full sm:max-w-md">
    //     <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
    //       Report Portal
    //     </h2>
    //     <p className="mt-2 text-center text-sm text-gray-600">
    //       Sign in to access your reports
    //     </p>
    //   </div>

    //   <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
    //     <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
    //       <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
    //         <div>
    //           <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    //             Email address
    //           </label>
    //           <div className="mt-1">
    //             <input
    //               id="email"
    //               type="email"
    //               {...register('email', { 
    //                 required: 'Email is required',
    //                 pattern: {
    //                   value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
    //                   message: 'Invalid email address'
    //                 }
    //               })}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //             />
    //             {errors.email && (
    //               <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
    //             )}
    //           </div>
    //         </div>

    //         <div>
    //           <label htmlFor="password" className="block text-sm font-medium text-gray-700">
    //             Password
    //           </label>
    //           <div className="mt-1">
    //             <input
    //               id="password"
    //               type="password"
    //               {...register('password', { 
    //                 required: 'Password is required',
    //                 minLength: {
    //                   value: 6,
    //                   message: 'Password must be at least 6 characters'
    //                 }
    //               })}
    //               className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
    //             />
    //             {errors.password && (
    //               <p className="mt-2 text-sm text-red-600">{errors.password.message}</p>
    //             )}
    //           </div>
    //         </div>

    //         <div>
    //           <button
    //             type="submit"
    //             disabled={loading}
    //             className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#412985] hover:bg-[#472f92] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
    //           >
    //             {loading ? 'Signing in...' : 'Sign in'}
    //           </button>
    //         </div>
    //       </form>

    //       <div className="mt-6">
    //         <div className="relative">
    //           <div className="absolute inset-0 flex items-center">
    //             <div className="w-full border-t border-gray-300" />
    //           </div>
             
    //         </div>
    //       </div>
    //     </div>
    //   </div>
    // </div>
  );
};

export default Login;