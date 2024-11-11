"use client";
import { useEffect, useRef } from "react";
import MyGrid from "./MyGrid";


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

        return () =>  {
            // window.removeEventListener('resize', updateImage);
    }
    }, [])


    return (
        <div className="flex flex-col gap-10">
            <div className="flex justify-center items-center flex-wrap gap-[15%]">
                <div className="order-1 ml-auto w-fit ">player1</div>
                <div className="order-2 mx-[58px] my-8 ">
                    <MyGrid/>
                </div>
                <div className="order-1 w-fit mr-auto md:order-3">player2</div>
            </div>
            {/* <div className="flex bg-red-800 m-auto">Player's Turn</div> */}
        </div>
    );
}

export default ConnectFour;