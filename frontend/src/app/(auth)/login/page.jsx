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
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const [showPassword, setShowPassword] = useState(false);

	const LoginTo = async e => {
		e.preventDefault();
		await AuthenticateTo('/login', formData);
	};

	return (
		// <div className="login-main-container mt-20">
		// 	<form
		// 		onSubmit={LoginTo}
		// 		className="main-login flex flex-col mr-20 max-w-xs sm:max-w-sm md:max-w-md lg:max-w-lg xl:max-w-xl w-4/5"
		// 	>
		// 	<p>Sign in to your account</p>
		// 	<input
		// 		type="text"
		// 		className="form-control"
		// 		name="username"
		// 		placeholder="Enter Your Username"
		// 		onChange={handleChange}
		// 	/>
		// 	<input
		// 		type="password"
		// 		className="form-control"
		// 		name="password"
		// 		placeholder="Enter Your Password"
		// 		onChange={handleChange}
		// 	/>
		// 	<button type="submit" className="">
		// 		Login
		// 	</button>
		// 	<img src="/login-with.svg" alt="login-with" className="sign-wit" />
		// 	<div className="logos">
		// 		<Login42 />
		// 		<img src="/google-icon.png" alt="" className="google-logo" />
		// 	</div>
		// 	<div className="forgot-password">
		// 		<Link className="pforgot" href="/forget_password">
		// 			Forgot your password?
		// 		</Link>
		// 		<div className="">
		// 			<Link rel="stylesheet" href="/signup" className="have-no-account">
		// 			Don't have an account? Sign up
		// 			</Link>
		// 		</div>
		// 	</div>
		// 	<br />
		// 	{<p className="text-danger">{errors.error ? errors.error : errors.server_error}</p>}
		// 	</form>
		// 	<div className="max-w-full hidden sm:block">
		// 	<Image
		// 		width={0}
		// 		height={0}
		// 		className="h-[30rem] w-[30rem]"
		// 		src="/login.svg"
		// 		alt="welcome"
		// 	/>
		// 	</div>
		// </div>
	<div className="flex justify-center items-center max-sm:mx-5">
		<img 
				src="/pong-bg.webp" 
				alt=""
				className='absolute z-0 top-0 left-0 w-full h-full object-cover opacity-50 saturate-0'
		/>
		<div className="layer-blue background-blue absolute z-1 top-0 left-0 w-full h-full" ></div>
		<div className='relative z-10 login-layout bg-black/40 text-center w-full max-w-[40rem] px-20 py-10 rounded-[3rem] mt-20 mb-16 max-sm:p-4'>

			<div className='first-div w-full'>
					{/* <!-- Option 4: With background highlight --> */}
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
							type="text"
							placeholder='username or email'
							className='border border-gray-500 bg-transparent py-5 px-4 mb-3 outline-none w-full rounded-lg'
						/>
					</div>
					<div className="password">
						<input
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
					<div className="bg-white px-4 py-5 rounded-full cursor-pointer">
						<Login42 />
					</div>
			</div>
		</div>
	</div>
	);
}
