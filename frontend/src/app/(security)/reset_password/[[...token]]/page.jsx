"use client";
import { postData } from '@/services/apiCalls';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import {toast, Toaster} from 'react-hot-toast';
import { FaEye, FaEyeSlash } from 'react-icons/fa';  // Font Awesome icons

export default function ResetPassword() {
	const [formData, setFormData] = useState({
		newPassword: '',
		confirmPassword: ''
	});
	const [showPassword, setShowPassword] = useState({
		new: false,
		confirm: false
	});
	const [loading, setLoading] = useState(false);
	const router = useRouter();
	const searchParams = useSearchParams();
	const token = searchParams.get('token');
	const uid = searchParams.get('uid');

	const handleSubmit = async (e) => {
		e.preventDefault();

		if (!formData.newPassword || !formData.confirmPassword) {
			toast.error('Please fill in all fields');
			return;
		}

		if (!token || !uid) {
			toast.error('Invalid reset link');
			return;
		}

		if (formData.newPassword !== formData.confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}
		console.log("here is the token", token);
		try {
			const res = await postData('/reset-password', {
				new_password: formData.newPassword,
				uidb64: uid,
				token: token
			});
			if (res.status === 200)
				{
					toast.success('Password changed successfully');
					setTimeout(() => {
						router.push('/login');
					}, 500);
				}
			else
			{
				console.log("Failed to change password ", res?.response?.data);
				toast.error(res?.response?.message);

			}
		}
		catch (err) {
			toast.error(err.message);
		}
	};

	return (
		<>
		<Toaster />
		<div className="min-h-screen flex flex-col lg:flex-row">
		{/* Form Section */}
		<div className="flex-1 flex items-center justify-center p-6 sm:p-12">
			<div className="w-full max-w-md space-y-8">
			<div className="text-center">
				<h2 className="mt-6 text-3xl font-bold text-gray-100">
				Change your password
				</h2>
				<p className="mt-2 text-sm text-gray-200">
				Please enter your new password below
				</p>
			</div>

			<form onSubmit={handleSubmit} className="mt-8 space-y-6">
				{/* New Password Input */}
				<div className="relative">
				<label htmlFor="new-password" className="block text-sm font-medium text-gray-200 mb-2">
					New Password
				</label>
				<div className="relative">
					<input
					id="new-password"
					type={showPassword.new ? 'text' : 'password'}
					value={formData.newPassword}
					onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
					className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
					placeholder="Enter new password"
					/>
					<button
					type="button"
					onClick={() => setShowPassword({ ...showPassword, new: !showPassword.new })}
					className="absolute inset-y-0 right-0 flex items-center pr-3"
					>
					{showPassword.new ? (
						<FaEyeSlash className="h-5 w-5 text-gray-400" />
					) : (
						<FaEye className="h-5 w-5 text-gray-400" />
					)}
					</button>
				</div>
				</div>

				{/* Confirm Password Input */}
				<div className="relative">
				<label htmlFor="confirm-password" className="block text-sm font-medium text-gray-200 mb-2">
					Confirm Password
				</label>
				<div className="relative">
					<input
					id="confirm-password"
					type={showPassword.confirm ? 'text' : 'password'}
					value={formData.confirmPassword}
					onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
					className="appearance-none relative block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-sm"
					placeholder="Confirm new password"
					/>
					<button
					type="button"
					onClick={() => setShowPassword({ ...showPassword, confirm: !showPassword.confirm })}
					className="absolute inset-y-0 right-0 flex items-center pr-3"
					>
					{showPassword.confirm ? (
						<FaEyeSlash className="h-5 w-5 text-gray-400" />
					) : (
						<FaEye className="h-5 w-5 text-gray-400" />
					)}
					</button>
				</div>
				</div>

				<button
					type="submit"
					className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
				>
					Change password
				</button>
			</form>
			</div>
		</div>

		{/* Image Section */}
		<div className="hidden lg:flex lg:w-1/2 items-center justify-center p-12">
			<div className="max-w-md">
				<img className="sign-with" src="/Reset-password.svg" alt="welcome" />
			</div>
		</div>
		</div>
		</>
	);
	}