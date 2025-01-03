"use client";
import { postData } from '@/services/apiCalls';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { toast, Toaster } from 'react-hot-toast';
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

		if (formData.newPassword.length < 6) {
			toast.error('Password must be at least 6 characters');
			return;
		}

		if (formData.newPassword !== formData.confirmPassword) {
			toast.error('Passwords do not match');
			return;
		}

		try {
			const res = await postData('/reset-password', {
				new_password: formData.newPassword,
				uidb64: uid,
				token: token
			});
			if (res.status === 200) {
				toast.success('Password changed successfully');
				setTimeout(() => {
					router.push('/login');
				}, 500);
			}
			else {
				toast.error(res?.response?.message || "Failed to change password, Invalid token or link");
			}
		}
		catch (err) {
			toast.error(err.message);
		}
	};

	return (
		<>
			<div className="min-h-screen flex flex-col lg:flex-row max-w-[1200px] m-auto">
				{/* Form Section */}
				<div className="flex-1 flex items-center justify-center p-6 sm:p-12 ">
					<div className="w-full max-w-md space-y-8 ">
						<div className="text-center">
							<h2 className="mt-6 text-3xl font-bold text-gray-100">
								Change your password
							</h2>
							<p className="mt-2 text-sm text-gray-400 font-balsamiq text-gray-200">
								Please enter your new password below
							</p>
						</div>

						<form onSubmit={handleSubmit} className="mt-8 space-y-3 ">
							{/* New Password Input */}
							<div className="relative">
								<label htmlFor="new-password" className="block text-sm font-balsamiq pl-2 font-medium text-gray-200 mb-2">
									New Password
								</label>
								<div className="relative">
									<input
										autoComplete='off'
										name='new-password'
										id="new-password"
										type={showPassword.new ? 'text' : 'password'}
										value={formData.newPassword}
										onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
										className="custom-input w-full"
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
							<div className="relative ">
								<label htmlFor="confirm-password" className="block pl-2 text-sm font-balsamiq font-medium text-gray-200 mb-2">
									Confirm Password
								</label>
								<div className="relative">
									<input
										autoComplete='off'
										name='confirm-password'
										id="confirm-password"
										type={showPassword.confirm ? 'text' : 'password'}
										value={formData.confirmPassword}
										onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
										className="custom-input w-full"
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
								className="w-full mt-2 custom-button"
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