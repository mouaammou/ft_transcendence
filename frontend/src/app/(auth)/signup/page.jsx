'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@loginContext/loginContext';
import Login42 from '@components/auth/login42';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { errors, AuthenticateTo, setErrors } = useAuth();

  // Clear errors when component mounts or unmounts
  useEffect(() => {
    setErrors({});
    return () => setErrors({});
  }, [setErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    
    // Basic validation for empty fields
    const requiredFields = ['first_name', 'last_name', 'username', 'email', 'password', 'confirmPassword'];
    for (const field of requiredFields) {
      if (!formData[field].trim()) {
        toast.error(`${field.replace(/([A-Z])/g, ' $1').toLowerCase()} is required`);
        return false;
      }
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      toast.error('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
  
    try {
      setIsSubmitting(true);
  
      // Validate form before submission
      if (!validateForm()) {
        return;
      }
  
      const response = await AuthenticateTo('/signup', formData);
      
      if (response?.status === 201 || response?.status === 200) {
        toast.success('Account created successfully!');
      } else if (response?.error || response?.server_error) {
        toast.error(response.error || response.server_error);
      } else {
        // Handle all possible validation errors
        const errorData = response?.response?.data;
        if (errorData) {
          const errorFields = [
            'username', 'email', 'password', 'first_name', 
            'last_name', 'server_error', 'non_field_errors'
          ];
  
          let hasShownError = false;
  
          // Show errors for each field
          errorFields.forEach(field => {
            if (errorData[field]) {
              // Handle array or string error messages
              const errorMessage = Array.isArray(errorData[field]) 
                ? errorData[field][0] 
                : errorData[field];
              
              toast.error(`${field.replace('_', ' ')}: ${errorMessage}`);
              hasShownError = true;
            }
          });
  
          // If no specific errors were shown but we have error data
          if (!hasShownError && typeof errorData === 'string') {
            toast.error(errorData);
          }
        }
      }
    } catch (error) {
      // Handle specific error messages from the server
      if (errors) {
        const errorFields = [
          'username', 'email', 'password', 'first_name', 
          'last_name', 'server_error', 'non_field_errors'
        ];
  
        let hasShownError = false;
  
        errorFields.forEach(field => {
          if (errors[field]) {
            const errorMessage = Array.isArray(errors[field]) 
              ? errors[field][0] 
              : errors[field];
            
            toast.error(`${field.replace('_', ' ')}: ${errorMessage}`);
            hasShownError = true;
          }
        });
  
        // If no specific errors were shown
        if (!hasShownError) {
          toast.error('An error occurred during signup');
        }
      } else {
        toast.error('An error occurred during signup');
      }
    } finally {
      setIsSubmitting(false);
    }
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
          autoComplete='on'
          type={actualType}
          id={name}
          name={name}
          placeholder={placeholder}
          value={formData[name]}
          onChange={handleChange}
          required
          className='custom-input w-full'
          disabled={isSubmitting}
        />
        {isPasswordField && (
          <button
            type="button"
            onClick={() => setShowPassword(prev => ({ ...prev, [name]: !prev[name] }))}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
          >
            {showPassword[name] ? <FaEye /> : <FaEyeSlash />}
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
                <img
                  src="/sign-up-pong.gif"
                  alt="Pong Game Animation"
                  className="object-cover saturate-0"
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
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating Account...' : 'Sign up'}
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
                      className="p-2 bg-white hover:bg-gray-100 rounded-full transition-colors duration-300 shadow-lg"
                  >
                      <Login42 />
                </button>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}