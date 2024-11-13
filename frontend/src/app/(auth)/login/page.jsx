	'use client';

	import { useAuth } from '@/components/auth/loginContext';
	import { useState } from 'react';
	import Link from 'next/link';
	import Login42 from '@/components/auth/login42';
	import Image from 'next/image';
	import '@/styles/auth/login.css';

	export default function LoginPage() {
	const [formData, setFormData] = useState({
		username: '',
		password: '',
	});
	const [showPassword, setShowPassword] = useState(false);
	const { errors, AuthenticateTo } = useAuth();

	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		await AuthenticateTo('/login', formData);
	};

	return (
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
				placeholder="Username or Email"
				className="w-full px-4 py-5 bg-transparent border border-gray-500 rounded-lg outline-none focus:border-blue-500 transition-colors"
				required
				/>
			</div>

			<div className="relative">
				<input
				name="password"
				type={showPassword ? 'text' : 'password'}
				value={formData.password}
				onChange={handleChange}
				placeholder="Password"
				className="w-full px-4 py-5 bg-transparent border border-gray-500 rounded-lg outline-none focus:border-blue-500 transition-colors"
				required
				/>
				<button
				type="button"
				onClick={() => setShowPassword(!showPassword)}
				className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
				>
				{showPassword ? '👁️' : '👁️‍🗨️'}
				</button>
			</div>

			<button
				type="submit"
				className="w-full py-4 text-2xl text-black bg-white rounded-full hover:bg-gray-100 transition-colors duration-300 font-medium"
			>
				Login
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
	);
	}