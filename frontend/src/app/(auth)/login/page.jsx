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

	const { errors, AuthenticateTo } = useAuth();
	const handleChange = e => {
		e.preventDefault();
		console.log(e.target.value);
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const [showPassword, setShowPassword] = useState(false);

	const LoginTo = async e => {
		e.preventDefault();
		console.log("LoginTo -> formData", formData);
		await AuthenticateTo('/login', formData);
	};

	return (
		<>
			<div className="flex justify-center items-center max-sm:mx-5">
				<img 
					src="/pong-bg.webp" 
					alt=""
					className='absolute z-0 top-0 left-0 w-full h-full object-cover opacity-50 saturate-0'
				/>
				<div className="layer-blue background-blue absolute z-1 top-0 left-0 w-full h-full"></div>
				<form onSubmit={LoginTo}
					className='relative z-10 login-layout bg-black/40 text-center w-full max-w-[40rem] px-20 py-10 rounded-[3rem] mt-20 mb-16 max-sm:p-4'>

					<div className='first-div w-full'>
							<h3 className="mt-8 mb-10 text-xl font-semibold font-mono text-gray-50 border-b-2 border-blue-500 pb-2 inline-block hover:text-blue-600 transition-colors duration-300">
								Start your Ping pong Journey with Us
							</h3>
							<div className='mb-4'>
								<img 
									src="/anime-pong.gif" alt=""
									className="rounded-lg saturate-0"
								/>
							</div>
					</div>

					<div className="second-div w-full">
							<div className="username">
								<input
									name='username'
									onChange={handleChange}
									type="text"
									placeholder='username or email'
									className='border border-gray-500 bg-transparent py-5 px-4 mb-3 outline-none w-full rounded-lg'
								/>
							</div>
							<div className="password">
								<input
									name='password'
									onChange={handleChange}
									type="password"
									placeholder='password'
									className='border border-gray-500 bg-transparent py-5 px-4 mb-3 outline-none w-full rounded-lg'
								/>
							</div>
							<button className='bg-white text-black px-7 py-4 text-2xl capitalize rounded-full w-full mt-5'>
								login
							</button>
					</div>

					<div className="third-div flex justify-center items-center flex-col">
							<p className='my-7 text-2xl font-light'>OR continue with</p>
							<button className="px-8 py-3 bg-white hover:bg-gray-100 rounded-full transition-colors duration-300 shadow-lg">
								<Login42 />
							</button>
					</div>

					<div className="forgot-password mt-5">
							<Link className="pforgot text-blue-500 hover:underline" href="/forget_password">
								Forgot your password?
							</Link>
							<div className="mt-2">
								<Link rel="stylesheet" href="/signup" className="have-no-account text-blue-500 hover:underline">
									Don't have an account? Sign up
								</Link>
							</div>
					</div>

					<div>
						{<p className="text-danger">{errors.error ? errors.error : errors.server_error}</p>}
					</div>
				</form>
			</div>
		</>
	);
}
