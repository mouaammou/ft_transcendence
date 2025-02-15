	'use client';
	import { useCallback, useState, useEffect } from 'react';
	import { useAuth } from '@/components/auth/loginContext';
	import { postData } from '@/services/apiCalls';
	import { Toaster, toast } from 'react-hot-toast';
	import { FiUser, FiLock, FiCamera } from 'react-icons/fi';

const EditProfile = () => {
	const { profileData: data, setProfileData } = useAuth();
	const [isLoading, setIsLoading] = useState({
		avatar: false,
		info: false,
		password: false,
		initial: true
	});

	const [formData, setFormData] = useState({
		username: '',
		email: '',
		first_name: '',
		last_name: '',
		current_password: '',
		new_password: '',
		confirm_password: ''
	});

	const [errors, setErrors] = useState({});

	// Cleanup effect
	useEffect(() => {
		// Clear any existing toast messages when component mounts
		toast.dismiss();
		
		// Cleanup function
		return () => {
		toast.dismiss();
		};
	}, []);

	// Initialize form data when profile data is available
	useEffect(() => {
		if (data && Object.keys(data).length > 0) {
		setFormData(prev => ({
			...prev,
			username: data.username || '',
			email: data.email || '',
			first_name: data.first_name || '',
			last_name: data.last_name || ''
		}));
		setIsLoading(prev => ({ ...prev, initial: false }));
		}
	}, [data]);

	const handleChange = useCallback((e) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
		setErrors(prev => ({ ...prev, [name]: '' }));
	}, []);

	const handleAvatarChange = useCallback(async (e) => {
		const file = e.target.files[0];
		if (!file) return;
		
		// Check file size
		if (file.size > 5 * 1024 * 1024) {
			toast.error('File size must be less than 5MB');
			return;
		}
		
		setIsLoading(prev => ({ ...prev, avatar: true }));
		
		try {
			// Create FormData
			const formData = new FormData();
			formData.append('avatar', file);
		
			// Use postData with specific headers for FormData
			const res = await postData('profile/update', formData, {
			'Content-Type': 'multipart/form-data',
			});
		
			if (res?.status === 200 && res.data?.avatar) {
			setProfileData(prev => ({
				...prev,
				avatar: res.data.avatar
			}));
			toast.success('Avatar updated successfully');
			} else {
			throw new Error('Failed to update avatar');
			}
		} catch (err) {
			const errorMessage = err.response?.data?.errors?.avatar?.[0] || 
								err.response?.data?.message || 
								'Failed to update avatar';
			// 
			toast.error(errorMessage);
		} finally {
			setIsLoading(prev => ({ ...prev, avatar: false }));
			// Reset the input
			e.target.value = '';
		}
	}, [setProfileData]);

	const handleInfoSubmit = useCallback(async (e) => {
		e.preventDefault();
		setIsLoading(prev => ({ ...prev, info: true }));

		if (formData.username.length < 4) {
			toast.error('Username must be at least 4 characters');
			setIsLoading(prev => ({ ...prev, info: false }));
			return ;
		}

		if (formData.first_name.length < 4) {
			toast.error('First name must be at least 4 characters');
			setIsLoading(prev => ({ ...prev, info: false }));
			return ;
		}

		if (formData.last_name.length < 4) {
			toast.error('Last name must be at least 4 characters');
			setIsLoading(prev => ({ ...prev, info: false }));
			return ;
		}

		try {
			const res = await postData('profile/update',
			{
				username: formData.username,
				email: formData.email,
				first_name: formData.first_name,
				last_name: formData.last_name
			});

			if (res.status === 200) {
				setProfileData(res.data);
				toast.success('Profile information updated successfully');
			}
			else {
				throw new Error('Failed to update profile information');
			}
		} catch (err) {
			setErrors(err.response?.data?.errors || {});
			toast.error('Failed to update profile information');
		} finally {
			setIsLoading(prev => ({ ...prev, info: false }));
		}
	}, [formData, setProfileData]);

	const handlePasswordSubmit = useCallback(async (e) => {
		e.preventDefault();

		if (!formData.new_password || !formData.confirm_password) {
			toast.error('All fields are required');
			return;
		}

		if (formData.new_password.length <= 6) {
			toast.error('Password must be longer than 6 characters');
			return;
		}

		if (formData.new_password !== formData.confirm_password) {
			toast.error('Passwords do not match');
			return;
		}

		setIsLoading(prev => ({ ...prev, password: true }));

		try {
			const res = await postData('profile/update',
			{
				password: formData.new_password
			});
			if (res.status === 200){
				toast.success('Password updated successfully');
				setFormData(prev => ({
					...prev,
					current_password: '',
					new_password: '',
					confirm_password: ''
				}));
			}
			else {
				toast.error('Failed to update password');
			}
			} catch (err) {
				setErrors(err.response?.data?.errors || {});
				toast.error('Failed to update password');
		} finally {
			setIsLoading(prev => ({ ...prev, password: false }));
		}
	}, [formData]);

	if (isLoading.initial) {
		return (
			<div className="flex justify-center items-center min-h-screen">
			<p>Loading profile data...</p>
			</div>
		);
	}

	return (
		<>
			<div className="max-w-6xl mx-auto px-4 py-8">
			<div className="grid grid-cols-1 gap-8">
				{/* Avatar Section */}
				<section className="bg-white/10 rounded-2xl shadow-lg p-6 transform hover:scale-[1.02] transition-transform duration-300">
					<div className="flex flex-col items-center space-y-6">
						<div className="relative group">
							<div className="w-40 h-40 rounded-full overflow-hidden border-4 border-blue-100 shadow-lg">
								<img
								src={data.avatar || '/def_prof.jpeg'}
								alt="Profile"
								className="w-full h-full object-cover"
								/>
							</div>
							<label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 group-hover:opacity-100 rounded-full cursor-pointer transition-opacity duration-300">
								<FiCamera className="w-8 h-8" />
								<input
									autoComplete='off'
									type="file"
									accept="image/*"
									className="hidden"
									id='avatar-fdvchsbck'
									name="avatar" // Changed to match backend field name
									onChange={handleAvatarChange}
									disabled={isLoading.avatar}
								/>
							</label>
						</div>
						{isLoading.avatar && (
						<div className="text-blue-600">Updating avatar...</div>
						)}
					</div>
				</section>

				{/* Profile Information Section */}
				<section className="bg-white/10 rounded-2xl shadow-lg p-6">
					<div className="flex items-center space-x-3 mb-6">
						<FiUser className="w-6 h-6 text-blue-600" />
						<h2 className="text-2xl font-semibold">Profile Information</h2>
					</div>
					<form onSubmit={handleInfoSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
						<InputField
							label="First Name"
							name="first_name"
							value={formData.first_name}
							onChange={handleChange}
							error={errors.first_name}
						/>
						<InputField
							label="Last Name"
							name="last_name"
							value={formData.last_name}
							onChange={handleChange}
							error={errors.last_name}
						/>
						<InputField
						label="Email"
							name="email"
							type="email"
							value={formData.email}
							onChange={handleChange}
							error={errors.email}
						/>
						<InputField
							label="Username"
							name="username"
							value={formData.username}
							onChange={handleChange}
							error={errors.username}
						/>
						<div className="md:col-span-2 flex justify-end">
						<button
							type="submit"
							disabled={isLoading.info}
							// className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
							// 		disabled:bg-gray-400 disabled:cursor-not-allowed
							// 		transition duration-200 ease-in-out"
							className='custom-button w-fit'
						>
							{isLoading.info ? 'Updating...' : 'Update Information'}
						</button>
						</div>
					</form>
				</section>

				{/* Password Section */}
				<section className="bg-white/10 rounded-2xl shadow-lg p-6">
				<div className="flex items-center space-x-3 mb-6">
					<FiLock className="w-6 h-6 text-blue-600" />
					<h2 className="text-2xl font-semibold">Change Password</h2>
				</div>
				<form onSubmit={handlePasswordSubmit} className="space-y-6">
					<InputField
						label="New Password"
						name="new_password"
						type="password"
						value={formData.new_password}
						onChange={handleChange}
						error={errors.new_password}
					/>
					<InputField
						label="Confirm New Password"
						name="confirm_password"
						type="password"
						value={formData.confirm_password}
						onChange={handleChange}
						error={errors.confirm_password}
					/>
					<div className="flex justify-end">
					<button
						type="submit"
						disabled={isLoading.password}
						// className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 
						// 		disabled:bg-gray-400 disabled:cursor-not-allowed
						// 		transition duration-200 ease-in-out"
						className='custom-button w-fit'
					>
						{isLoading.password ? 'Updating...' : 'Update Password'}
					</button>
					</div>
				</form>
				</section>
			</div>
			</div>
		</>
	);
	};

	const InputField = ({ label, name, type = 'text', value, onChange, error }) => (
		<div className="space-y-2">
			<label className="block text-sm font-medium text-white">
			{label}
			</label>
			<input
				type={type}
				id={name}
				name={name}
				value={value} // Remove the password condition since we handle empty values in the parent
				onChange={onChange}
				className={`w-full ${error ? 'custom-input-error' : 'custom-input'}`}
				autoComplete='off'
			/>
			{error && (
			<p className="text-red-500 text-sm">{error}</p>
			)}
		</div>
		);

	export default EditProfile;