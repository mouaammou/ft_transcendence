'use client';

import { useState } from 'react';
import { useAuth } from '@loginContext/loginContext';
import Login42 from '@components/auth/login42';
import Image from 'next/image';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

import '@/styles/auth/signup.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState({
    password: false,
    confirmPassword: false,
  });

  const { errors, AuthenticateTo } = useAuth();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await AuthenticateTo('/signup', formData);
  };

  const inputFields = [
    { name: 'first_name', type: 'text', placeholder: 'First name' },
    { name: 'last_name', type: 'text', placeholder: 'Last name' },
    { name: 'username', type: 'text', placeholder: 'Username' },
    { name: 'email', type: 'email', placeholder: 'Email' },
    { name: 'password', type: 'password', placeholder: 'Password' },
    { name: 'confirmPassword', type: 'password', placeholder: 'Confirm Password' },
  ];

  const renderInput = ({ name, type, placeholder }) => {
    const isPasswordField = type === 'password';
    const actualType = isPasswordField && showPassword[name] ? 'text' : type;

    return (
      <div key={name} className="relative">
        <input
          type={actualType}
          name={name}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          required
          // className="w-full px-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white 
          //            placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 
          //            transition-all outline-none"
          className='custom-input w-full'
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => ({ ...prev, [name]: !prev[name] }))}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword[name] ? <FaEye /> :  <FaEyeSlash />}
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen flex justify-center items-center py-10 px-4">
      <div className="layer-blue background-blue absolute inset-0" />

      <form onSubmit={handleSubmit} className="relative w-full max-w-7xl mx-auto z-10">
        <div className="backdrop-blur-sm bg-black/40 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex flex-col lg:flex-row">
            {/* Left Section */}
            <div className="lg:w-1/2 p-8 lg:p-12">
              <h1 className="inline-block text-2xl font-bold text-white mb-8 pb-2 border-b-2 
                            border-blue-500 hover:text-blue-400 transition-colors">
                Create an account
              </h1>
              <div className="relative aspect-video rounded-xl overflow-hidden shadow-xl w-full h-80 my-10">
                <Image
                  src="/sign-up-pong.gif"
                  alt="Pong Game Animation"
                  fill
                  className="object-cover saturate-0"
                  priority
                />
              </div>
            </div>

            {/* Right Section */}
            <div className="lg:w-1/2 p-8 lg:p-12 bg-black/20">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  {renderInput(inputFields[0])}
                  {renderInput(inputFields[1])}
                </div>
                {inputFields.slice(2).map(field => renderInput(field))}

                <button
                  type="submit"
                  className='custom-button'
                >
                  Sign up
                </button>
              </div>

              <div className="relative my-8">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-600" />
                </div>
                <div className="relative flex justify-center text-lg text-gray-400">
                  <span className="px-4 bg-black/20">OR continue with</span>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  type="button"
                  className="px-8 py-3 bg-white hover:bg-gray-100 rounded-full transition-colors duration-300 shadow-lg"
                >
                  <Login42 />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Error Messages */}
        <div className="mt-4 text-center">
          <div className="text-red-500 space-y-1">
            {Object.entries(errors).map(([key, value]) => (
              value && key !== 'server_error' && (
                <p key={key} className="text-sm">{value}</p>
              )
            ))}
            {!Object.keys(errors).some(key => key !== 'server_error' && errors[key]) && 
              errors.server_error && (
                <p className="text-sm">{errors.server_error}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}