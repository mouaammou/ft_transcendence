'use client';
import { useState } from 'react';
import { useAuth } from '@loginContext/loginContext';
import Login42 from '@components/auth/login42';
import '@/styles/auth/signup.css';
import Image from 'next/image';

function Signup() {
const [formData, setFormData] = useState({
	first_name: '',
	last_name: '',
	username: '',
	email: '',
	password: '',
	confirmPassword: '',
});

const { errors, AuthenticateTo } = useAuth();

const handleChange = e => {
	setFormData({ ...formData, [e.target.name]: e.target.value });
};

const singUp = async e => {
	e.preventDefault();
	await AuthenticateTo('/signup', formData);
};

return (
	<div className="flex justify-center items-center py-10 px-4">
		{/* Background Image and Overlay */}
		<img 
			src="/pong-bg.webp" 
			alt=""
			className="absolute z-0 top-0 left-0 w-full h-full object-cover opacity-50 saturate-0"
		/>
		<div className="layer-blue background-blue absolute z-1 top-0 left-0 w-full h-full"></div>

		{/* Main Form Container */}
		<form onSubmit={singUp} className="relative w-full max-w-7xl mx-auto z-10">
			<div className="backdrop-blur-sm bg-black/40 rounded-2xl shadow-2xl overflow-hidden mt-20">
			<div className="flex flex-col lg:flex-row">
				{/* Left Section - Title and Image */}
				<div className="lg:w-1/2 p-8 lg:p-12">
					<h3 className="inline-block text-2xl font-bold text-white mb-8 pb-2 border-b-2 border-blue-500 hover:text-blue-400 transition-colors">
						Create an account
					</h3>
					<div className="relative aspect-video rounded-xl overflow-hidden shadow-xl w-full h-80 my-10">
						<Image 
							src="/sign-up-pong.gif"
							alt="Pong Game Animation"
							className="object-cover saturate-0"
							layout="fill"
						/>
					</div>
				</div>

				{/* Right Section - Form Fields */}
				<div className="lg:w-1/2 p-8 lg:p-12 bg-black/20">
					<div className="space-y-4">
					{/* Name Fields */}
					<div className="grid grid-cols-2 gap-4">
						<input
							type="text"
							placeholder="First name"
							name="first_name"
							required
							onChange={handleChange}
							className="w-full px-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-400 focus:border-gray-100 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
						/>
						<input
							type="text"
							placeholder="Last name"
							name="last_name"
							required
							onChange={handleChange}
							className="w-full px-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-400 focus:border-gray-100 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
						/>
					</div>

					{/* Other Fields */}
					{/* {['username', 'email', 'password', 'confirmPassword'].map((field) => (
						<input
							key={field}
							type={field.includes('password') ? 'password' : 'text'}
							placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
							name={field}
							required
							onChange={handleChange}
							className="w-full px-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-400 focus:border-gray-100 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
						/>
					))} */}
						<input
							type="text"
							placeholder="Username"
							name="username"
							required
							onChange={handleChange}
							className="w-full px-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-400 focus:border-gray-100 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
						/>
						<input
							type="email"
							placeholder="Email"
							name="email"
							required
							onChange={handleChange}
							className="w-full px-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-400 focus:border-gray-100 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
						/>
						<input
							type="password"
							placeholder="Password"
							name="password"
							required
							onChange={handleChange}
							className="w-full px-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-400 focus:border-gray-100 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
						/>
						<input
							type="password"
							placeholder="Confirm Password"
							name="confirmPassword"
							required
							onChange={handleChange}
							className="w-full px-4 py-3 rounded-lg bg-black/20 border border-gray-600 text-white placeholder-gray-400 focus:border-gray-100 focus:ring-2 focus:ring-gray-100 transition-all outline-none"
						/>
					{/* Sign Up Button */}
					<button 
						type="submit" 
						className="w-full py-4 bg-white hover:bg-gray-700 text-black rounded-lg text-lg font-semibold transition-colors duration-300 shadow-lg hover:shadow-gray-500/25"
					>
						Sign up
					</button>
					</div>

					{/* Divider */}
					<div className="relative my-8">
						<div className="absolute flex items-center">
							<div className="w-full border-t border-gray-600"></div>
						</div>
						<div className="relative flex justify-center">
							<span className="px-4 text-lg text-gray-400">OR continue with</span>
						</div>
					</div>

					{/* OAuth Button */}
					<div className="flex justify-center">
						<button className="px-8 py-3 bg-white hover:bg-gray-100 rounded-full transition-colors duration-300 shadow-lg">
							<Login42 />
						</button>
					</div>
				</div>
			</div>
			</div>

			{/* Error Messages */}
			<div className="mt-4 space-y-2 text-center">
			{/* {Object.entries(errors).map(([key, value]) => (
				value && <p key={key} className="text-red-500">{value}</p>
			))} */}
			{
				<div className="text-red-500">
					{<p>{errors.first_name}</p>}
					{<p>{errors.last_name}</p>}
					{<p>{errors.username}</p>}
					{<p>{errors.email}</p>}
					{<p>{errors.password}</p>}
					{<p>{errors.confirmPassword}</p>}
					{/* display message only if all errors not  */}
					{!errors.first_name &&
					!errors.last_name &&
					!errors.username &&
					!errors.email &&
					!errors.password &&
					!errors.confirmPassword &&
					errors.server_error && <p>{errors.server_error}</p>}
				</div>
			}
			</div>
		</form>
	</div>
);
}

export default Signup;
