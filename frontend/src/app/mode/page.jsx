{/* <svg _ngcontent-ypr-c17="" width="100%" height="100%0" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" class="clover ng-star-inserted">
    <path _ngcontent-ypr-c17="" d="M.887 14.467C-2.845 5.875 5.875-2.845 14.467.887l1.42.617a10.323 10.323 0 0 0 8.225 0l1.42-.617c8.593-3.732 17.313 4.988 13.581 13.58l-.617 1.42a10.323 10.323 0 0 0 0 8.225l.617 1.42c3.732 8.593-4.989 17.313-13.58 13.581l-1.42-.617a10.323 10.323 0 0 0-8.225 0l-1.42.617C5.874 42.845-2.846 34.125.886 25.533l.617-1.42a10.323 10.323 0 0 0 0-8.225l-.617-1.42Z" fill="#D3E3FD">
    </path>
</svg> */}

import Selector from "@app/mode/selecor"
import {RandomSvg, VsfriendSvg, VsbotSvg, ExitSvg} from "@components/modeSvgs/ModeSvgs.jsx"
const Mode = () => {

    return (
        <div className="container flex lg:flex-row justify-center items-center">
            <div className="flex flex-col">
                <Selector title='RANDOM GAME' description='Have fun playing exciting online with friends!'  Svgvar={RandomSvg} ></Selector>
                <Selector title='PLAY VS FRIEND' description='Online ping pong game with a friend!' Svgvar={VsfriendSvg} ></Selector>
            </div>
            <div className="flex flex-col">
                <Selector title='PLAY VS BOT' description='Challenge a bot in an exciting ping pong game' Svgvar={VsbotSvg} ></Selector>
                <Selector title='GO BACK' description={<br></br>} Svgvar={ExitSvg} ></Selector>
            </div>
        </div>
    );
};

export default Mode;