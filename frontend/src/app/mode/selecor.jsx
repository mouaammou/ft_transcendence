import React from "react";

const Selector = ({ title, description, Svgvar }) => {
    return (
        //   React.createElement("div", [], React.createElement("h1", [], "Hello World!"))
        <div className="group flex flex-row flex-1 bg-whitetrspnt w-5/6 p-5 pr-0 max-w-[715px]  rounded-[30px] shadow-xl  mb-10 hover:bg-bluetrspnt cursor-pointer transition ease-in-out delay-150 duration-150">
            <div className="w-5/6">
                <div className="text-[35px] font-balsamiq">{title}</div>
                <div className="text-[20px] font-open font-thin">{description}</div>
            </div>
            <div className="flex-1">
                <svg
                    width="70%" height="70%"
                    viewBox="0 0 40 40"
                    >


                    <path
                        d="M.887 14.467C-2.845 5.875 5.875-2.845 
                                14.467.887l1.42.617a10.323 10.323 0 0 0 
                                8.225 0l1.42-.617c8.593-3.732 17.313 4.988 
                                13.581 13.58l-.617 1.42a10.323 10.323 0 0 0 
                                0 8.225l.617 1.42c3.732 8.593-4.989 17.313-13.58 
                                13.581l-1.42-.617a10.323 10.323 0 0 0-8.225 
                                0l-1.42.617C5.874 42.845-2.846 34.125.886 
                                25.533l.617-1.42a10.323 10.323 0 0 0 0-8.225l-.617-1.42Z"
                        className="fill-customfill group-hover:fill-hrcolor transition ease-in-out delay-150 duration-150" // this is the color of the icon background
                    >
                    </path>
                {Svgvar && <Svgvar/>}
                </svg>

            </div>
        </div>
    );
}

export default Selector;