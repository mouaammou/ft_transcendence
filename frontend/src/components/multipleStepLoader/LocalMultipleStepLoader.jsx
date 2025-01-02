"use client";;
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

const CheckIcon = ({
    className
}) => {
    return (
        (<svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className={cn("w-6 h-6 ", className)}>
            <path d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>)
    );
};

const CheckFilled = ({
    className
}) => {
    return (
        (<svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className={cn("w-6 h-6 ", className)}>
            <path
                fillRule="evenodd"
                d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
                clipRule="evenodd" />
        </svg>)
    );
};

const LoaderCore = ({
    loadingStates,
    value = 0
}) => {
    return (
        (<div className="flex relative justify-start max-w-xl mx-auto flex-col mt-40">
            {loadingStates.map((loadingState, index) => {
                const distance = Math.abs(index - value);
                const opacity = Math.max(1 - distance * 0.2, 0); // Minimum opacity is 0, keep it 0.2 if you're sane.

                return (
                    (<motion.div
                        key={index}
                        className={cn("text-left flex gap-2 mb-4")}
                        initial={{ opacity: 0, y: -(value * 40) }}
                        animate={{ opacity: opacity, y: -(value * 40) }}
                        transition={{ duration: 0.5 }}>
                        <div>
                            {index > value && (
                                <CheckIcon className="text-white" />
                            )}
                            {index <= value && (
                                <CheckFilled
                                    className={cn("text-white", value === index &&
                                        "text-lime-500 opacity-100")} />
                            )}
                        </div>
                        <span
                            className={cn(
                                "text-white",
                                value === index && "text-lime-500 opacity-100"
                            )}>
                            {loadingState.text}
                        </span>
                    </motion.div>)
                );
            })}
        </div>)
    );
};

export const MultiStepLoader = ({
    loadingStates,
    loading,
    duration = 2000,
    loop = true
}) => {
    const [currentState, setCurrentState] = useState(0);

    useEffect(() => {
        if (!loading) {
            setCurrentState(0);
            return;
        }
        const timeout = setTimeout(() => {
            setCurrentState((prevState) =>
                loop
                    ? prevState === loadingStates.length - 1
                        ? 0
                        : prevState + 1
                    : Math.min(prevState + 1, loadingStates.length - 1));
        }, duration);

        return () => clearTimeout(timeout);
    }, [currentState, loading, loop, loadingStates?.length, duration]);
    return (
        (<AnimatePresence mode="wait">
            {loading && (
                <motion.div
                    initial={{
                        opacity: 0,
                    }}
                    animate={{
                        opacity: 1,
                    }}
                    exit={{
                        opacity: 0,
                    }}
                    className="w-full h-full fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-2xl">
                    <div className="h-96  relative">
                        <LoaderCore value={currentState} loadingStates={loadingStates} />
                    </div>

                    <div
                        className="bg-gradient-to-t inset-x-0 z-20 bottom-0 bg-black h-full absolute [mask-image:radial-gradient(900px_at_center,transparent_30%,white)]" />
                </motion.div>
            )}
        </AnimatePresence>)
    );
};


export const LoadingComponent = () => {

    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const loadingStates = [
        { text: "Press the 'Play' button below the game canvas to start the game." },
        { text: "The left player moves their paddle using 'W' (up) and 'S' (down)." },
        { text: "The right player moves their paddle using ArrowUp '⬆️' (up) and ArrowDown '⬇️' (down)." },
        { text: "Press the 'P' key to pause or resume the game at any time." },
        { text: "Score points by making your opponent miss the ball." },
        { text: "Stay focused and keep your eyes on the ball!" },
        { text: "Enjoy the game and may the best player win!" },
    ];
    

    return (
        <div className="z-[100]">
            <div onClick={() => setLoading(true)}>
                <MultiStepLoader
                    loadingStates={loadingStates}
                    loading={loading}
                    duration={3000}
                />
                <button
                    className="absolute top-36 md:bottom-16 right-10 md:right-20  bg-white hover:bg-white/90 font-bold text-black rounded-full text-lg transition duration-200 h-10 w-10 font-balsamiq flex items-center justify-center"
                >
                    ?
                </button>
            </div>
            {loading && (
                <button
                    className="cursor-pointer absolute  top-36 md:bottom-16 right-10 md:right-20 text-white font-bold z-[120] h-10 w-10 text-lg bg-black rounded-full border-2 border-white font-balsamiq flex items-center justify-center"
                    onClick={() => setLoading(false)}>
                    X
                </button>
            )}
        </div>

    );

};

