"use client";
import { postData } from '@/services/apiCalls';
import Link from 'next/link';
import { useCallback } from 'react';
import { useState } from 'react';
import { Toaster, toast } from 'react-hot-toast';

const SignUp = () => {

	const [email, setEmail] = useState('');

	const handleSubmit = useCallback(async () => {
		// Send reset link

		if (!email) {
			toast.error('Please enter your email address');
			return;
		}

		try {
			const response = await postData('/forgot-password', { email });
			if (response.status === 200) {
				toast.success('Reset link sent to your email');
			}
			else {
				toast.error('the email address is not registered or invalid');
			}
		}
		catch (error) {
			toast.error('An error occurred');
		}
	}, [email]);

	return (
		<>
			<Toaster />
			<div className="min-h-screen flex items-stretch justify-center flex-wrap max-md:flex-col">
			{/* Form Side */}
			<div className="w-full md:w-1/2 flex items-center justify-center max-sm:p-1 px-3 bg-transparent">
				<div className="w-full max-w-md space-y-6">
				<h1 className="text-2xl md:text-3xl font-bold text-gray-50">
					Forgot your password?
				</h1>
				
				<p className="text-gray-400">
					Enter the email address associated with your account, and we'll send you a link to reset
					your password.
				</p>
				
				<div className="space-y-4">
					<input
						onChange={(e) => setEmail(e.target.value)}
						type="email"
						placeholder="Example@gmail.com"
						className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition bg-transparent"
					/>
					
					<button 
						onClick={handleSubmit}
						className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-200 font-medium">
							Send reset link
					</button>
					
					<button className="w-full bg-gray-100 text-gray-700 py-3 rounded-lg hover:bg-gray-200 transition duration-200 font-medium">
					Go back
					</button>
				</div>
				</div>
			</div>

			{/* Image Side */}
			<div className="w-full md:w-1/2">
				<div className="h-48 md:h-full flex items-center justify-center p-6 max-md:hidden">
				<img
					className="w-full max-w-md object-contain"
					src="/forget-pass.svg"
					alt="Reset password illustration"
				/>
				</div>
			</div>
			</div>
		</>
	);
};

export default SignUp;