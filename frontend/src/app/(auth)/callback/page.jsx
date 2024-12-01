'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getData } from '@/services/apiCalls';
import { useAuth } from '@/components/auth/loginContext';

const AuthCallback = () => {
	const router = useRouter();
	// const [totp, setTotp] = useState(false);
	const searchParams = useSearchParams();
	const code = searchParams.get('code');
	const [totpValue, setTotpValue] = useState('');
	const { setIsAuth } = useAuth();

	const fetchTokens = async () => {
		let query = `code=${code}`;
		await getData(`auth/callback/42?${query}`)
		.then(response => {
			if (response.status == 200 || response.status == 201) {
				console.log('response: ', response);
				if (response.data?.totp) {
					console.log("totp:  *** ", response.data.totp);
					router.push('/2fa');
					// setTotp(true);
				}
				else {
					setIsAuth(true);
					router.push('/profile');
				}
			}
			// else {
			// 	router.push('/login');
			// }
		})
		.catch(error => {
			router.push('/500');
		});
	};
	
	useEffect(() => {
		fetchTokens();
	}, []);

	// const handleInputChange = (event) => {
    //     const value = event.target.value.replace(/\D/g, "");
    //     setTotpValue(value);
    // };

	// if (totp) {
	// 	return (
	// 		<div>
	// 			<p>Enter your 2FA code</p>
	// 			<input className='text-white bg-transparent border outline-none p-4' placeholder='Enter 6 digits code' type="text" value={totpValue} onChange={handleInputChange} />
	// 			<button className='bg-white text-black border p-4' onClick={fetchTokens}>Verify 2fa</button>
	// 		</div>
	// 	);
	// }

	return <div>Loading...callback 42</div>;
};

export default AuthCallback;
