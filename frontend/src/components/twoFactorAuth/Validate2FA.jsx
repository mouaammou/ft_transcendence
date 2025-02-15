import { useState } from 'react';
import { apiValidateTwoFactorAuth } from '@/services/twoFactorAuthApi';

const TwoFactorAuthPage = () => {
    const [code, setCode] = useState("");

    const handleInputChange = (event) => {
        const value = event.target.value.replace(/\D/g, "");
        setCode(value);
    };

    const handleValidate = async () => {
        const response = await apiValidateTwoFactorAuth(code);

    }

    return (
        <div className="relative flex flex-col items-center justify-center w-screen h-screen capitalize">
            <div className="flex flex-col w-fit h-fit gap-y-4">
                <h1 className="mx-auto text-white uppercase tracking-wider text-2xl">Two-factor authentication</h1>
                <div className="group relative h-fit p-[1px] w-full">
                    <div className="absolute top-0 left-0 border-white border-t border-l w-1/3 h-1/2 pointer-events-none group-focus-within:border-green-400"></div>
                    <div className="absolute top-0 right-0 border-white border-t border-r w-2 h-1/2 pointer-events-none group-focus-within:border-green-400"></div>
                    <div className="absolute bottom-0 left-0 border-white border-b border-l w-2 h-1/2 pointer-events-none group-focus-within:border-green-400"></div>
                    <div className="absolute bottom-0 right-0 border-white border-b border-r w-1/3 h-1/2 pointer-events-none group-focus-within:border-green-400"></div>
                    <div className="relative flex items-center justify-center gap-4 text-white bg-white/30 group-focus-within:text-green-400 font-bold w-full h-full px-4 py-2">
                        <svg className="pointer-events-none" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M15 2H9v2H7v4H4v14h16V8h-3V4h-2V2zm0 2v4H9V4h6zm-6 6h9v10H6V10h3zm4 3h-2v4h2v-4z"/>
                        </svg>
                        <input
                            autoComplete='off'
                            name="code"
                            id='code-hfvund'
                            placeholder="6 digits code"
                            className="placeholder:text-white/50 text-white bg-transparent border-none outline-none w-full"
                            required
                            type="text"
                            value={code}
                            onChange={handleInputChange}
                            maxLength={6}
                        />
                    </div>
                </div>
                <div onClick={handleValidate} className="group relative h-fit p-[1px] cursor-pointer w-full">
                    <div className="absolute top-0 left-0 border-white border-t border-l w-2 h-2 pointer-events-none "></div>
                    <div className="absolute top-0 right-0 border-white border-t border-r w-2 h-2 pointer-events-none "></div>
                    <div className="absolute bottom-0 left-0 border-white border-b border-l w-2 h-2 pointer-events-none "></div>
                    <div className="absolute bottom-0 right-0 border-white border-b border-r w-2 h-2 pointer-events-none "></div>
                    <div className="relative flex items-center justify-center  text-white bg-white/30  font-bold  hover:text-black  hover:bg-white w-full h-full px-4 py-2 BlenderPro-Thin text-xl">validate</div>
                </div>
            </div>
        </div>
    );
}

export default TwoFactorAuthPage;