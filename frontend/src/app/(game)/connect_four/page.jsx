"use client";
import { useEffect, useRef } from "react";
import MyGrid from "./MyGrid";
import Hoome from "./animation";


const ConnectFour = () => {

    const imgRef = useRef(null);

    useEffect(() => {
        const updateImage = () => {
            if (window.innerWidth >= 1560) {
                imgRef.current.src = 'BigGrid.svg'
            } else {
                imgRef.current.src = 'Subtract.svg'
            }
        }

        // window.addEventListener('resize', updateImage);
        // updateImage();

        return () => {
            // window.removeEventListener('resize', updateImage);
        }
    }, [])


    return (
<div className="flex flex-col gap-10">
    <div className="flex flex-row flex-wrap justify-center items-center gap-8 ">
        <div className="w-fit order-1 ">
            <div className="flex flex-col gap-5 bg-red-800 p-3 rounded-md">
                <img src="avatar3.jpeg" className="rounded-full h-12 w-12 lg:h-[90px] lg:w-[90px] md:w-16 md:h-16" alt="" />
                <p className="text-center font-cabine">USER_1</p>
            </div>
        </div>
        <div className="w-full md:w-auto order-3 lg:order-2 my-8">
            <MyGrid />
        </div>
        <div className="w-fit order-2 lg:order-3 ">
            <div className="flex flex-col gap-5 bg-yellow-600 p-3 rounded-md">
                <img src="avatar4.jpeg" className="rounded-full h-12 w-12 lg:h-[90px] lg:w-[90px] md:w-16 md:h-16" alt="" />
                <p className="text-center font-cabine">USER_2</p>
            </div>
        </div>
    </div>
    {/* <div className="flex bg-red-800 m-auto">Player's Turn</div> */}
</div>
    );
}

export default ConnectFour;