"use client";

import { useState} from 'react';
import { apiValidateTwoFactorAuth } from '@/services/twoFactorAuthApi';
import { useRouter } from 'next/navigation';
import { Toaster, toast } from 'react-hot-toast';


const TwoFactorAuthPage = () => {
    const router = useRouter();
    const [code, setCode] = useState("");

    const handleInputChange = (event) => {
        const value = event.target.value.replace(/\D/g, "");
        setCode(value);
    };

    const handleValidate = async () => {
        const response = await apiValidateTwoFactorAuth(code);
        if (response.status === 200) {
            router.push('/profile');
        }
        else if (response.status === 401) {
            router.push('/profile');
        } else {
            toast.error('Invalid code');
        }
    }

    return (
        <>
        <Toaster />
        <div className="relative flex flex-col items-center justify-center w-full h-full capitalize">
            <div className="flex flex-col w-fit h-fit gap-y-4">
                <h1 className="mx-auto text-white uppercase tracking-wider text-2xl">Two-factor authentication</h1>
                <input
                    placeholder="6 digits code"
                    className="custom-input w-full"
                    // className="placeholder:text-white/50 text-white bg-transparent border-none outline-none w-full"
                    required
                    type="text"
                    value={code}
                    onChange={handleInputChange}
                    maxLength={6}
                />
                <button
                    onClick={handleValidate}
                    className="custom-button w-full"
                >
                    verify
                </button>
            </div>
        </div>
        </>
    );
}

export default TwoFactorAuthPage;