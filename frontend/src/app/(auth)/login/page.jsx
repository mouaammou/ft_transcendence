'use client';

import { useAuth } from '@/components/auth/loginContext';
import { useState } from 'react';
import Link from 'next/link';
import Login42 from '@/components/auth/login42';
import Image from 'next/image';
import '@/styles/auth/login.css';
import { Toaster, toast } from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

export default function LoginPage() {
    const [totp, setTotp] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
    });
    const { errors, AuthenticateTo } = useAuth();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    const [showPassword, setShowPassword] = useState({
        password: false,
    });

    const handleTotpInputChange = (event) => {
        const value = event.target.value.replace(/\D/g, "");
        if (value.length > 6)
            return ;
        setFormData(prev => ({ ...prev, [event.target.name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('formData: in login::  ', formData);
        let resp = await AuthenticateTo('/login', formData);
        if (!totp && resp?.totp) {
            setTotp(true);
        }
        if (totp)
            toast.error('Invalid Credentials');
    };

    return (
        <>
        <Toaster /> 
        <div className="min-h-screen flex justify-center items-center px-4 py-8">
        <div className="layer-blue background-blue absolute inset-0" />
        
        <form 
            onSubmit={handleSubmit}
            className="relative z-10 w-full max-w-[40rem] bg-black/40 backdrop-blur-sm rounded-3xl p-8 md:p-12"
        >
            <header className="mb-10">
            <h1 className="inline-block text-xl font-mono font-semibold text-gray-50 border-b-2 border-blue-500 pb-2 hover:text-blue-600 transition-colors duration-300">
                Start your Ping pong Journey with Us
            </h1>
            <div className="mt-6">
                <Image
                src="/anime-pong.gif"
                alt="Ping Pong Animation"
                width={400}
                height={200}
                className="rounded-lg saturate-0 w-full object-cover"
                />
            </div>
            </header>

            <div className="space-y-4">
            <div className="relative">
                <input
                name="username"
                type="text"
                value={formData.username}
                onChange={handleChange}
                placeholder="Username Or Email"
                className='custom-input w-full'
                required
                disabled={totp}
                />
            </div>

            <div className="relative" >
                <input
                    name="password"
                    type={showPassword.password ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password" 
                    className='custom-input w-full'
                    required
                    disabled={totp}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, password: !prev.password }))}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                >
                    {showPassword.password ? <FaEye /> : <FaEyeSlash />}
                </button>
            </div>

            { totp && <div className="relative">
                <input
                        type="text"
                        className='custom-input w-full'
                        name="totp_code"
                        placeholder="Enter 2fa code"
                        onChange={handleTotpInputChange}
                        value={formData.totp_code || ""}
                        required
                    />
                </div>}

                <button
                    type="submit"
                    className='custom-button'
                >
                    {totp ? 'Verify 2FA Code' : 'Login'}
                </button>
            </div>

            <div className="mt-8 text-center">
            <p className="text-2xl font-light text-gray-300 mb-4">OR continue with</p>
            <button 
                type="button"
                className="px-8 py-3 bg-white hover:bg-gray-100 rounded-full transition-colors duration-300 shadow-lg"
            >
                <Login42 />
            </button>
            </div>

            <footer className="mt-8 text-center space-y-3">
            <Link 
                href="/forget_password"
                className="block text-blue-500 hover:text-blue-400 hover:underline transition-colors"
            >
                Forgot your password?
            </Link>
            <Link 
                href="/signup"
                className="block text-blue-500 hover:text-blue-400 hover:underline transition-colors"
            >
                Don&apos;t have an account? Sign up
            </Link>
            
            {(errors.error || errors.server_error) && (
                <p className="text-red-500 mt-4">
                {errors.error || errors.server_error}
                </p>
            )}
            </footer>
        </form>
        </div>

        </>
    );
}