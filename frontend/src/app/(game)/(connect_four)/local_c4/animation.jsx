"use client";
import {motion, AnimatePresence, animate} from "framer-motion";
import {useState} from "react";
export const fadeUpVariant = {
  initial: {opacity: 0, y: 1000},
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1,
    },
  },
  exit: {
    y:-400
  }
};


export const exitAnimation = {
  hidden: {opacity: 0, x: -100},

  animate: {
    opacity:1, x:800,
    transition: {
        duration: 1,
    }
  },

  exit: {opacity: 0, x: 2000, 
    transition : {
        duration: 1,
    },
  },
  
};
export default function Hoome() {
  const [isVisible, setIsVisible] = useState(false);
  return (
    <AnimatePresence>
     
     
      <motion.button
        key="toggle-button"
        variants={fadeUpVariant}
        animate="animate"
        initial="initial"
        exit="exit"
        onClick={() => setIsVisible(!isVisible)}
      >
        Toggle Component
      </motion.button>

      {isVisible && (
        <>
         <motion.div
         key="welcome"
         variants={fadeUpVariant}
         initial="initial"
         animate="animate"
         exit="exit"
       >
         <h1>Welcome to the Home Page</h1>
       </motion.div>
        <motion.div
          key="box"
          initial="hidden"
          animate="animate"
          exit="exit"
          variants={exitAnimation}
        >
          <h1>Hello, Framer Motion!</h1>
        </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}