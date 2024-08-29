"use client"
import { useEffect } from "react";
import { usePageVisibility } from "./usePageVisibility"


const AboutUs = () => {
	const isVisible = usePageVisibility();

	useEffect(() => {
	  if (!isVisible) {
		console.log('User switched to another tab');
		// Perform actions when user switches away from the tab
	  } else {
		console.log('User is back on this tab');
		// Perform actions when user returns to the tab
	  }
	}, [isVisible]);

	return (
		<div>
			we are a team of developers
		</div>
	 );
}

export default AboutUs;