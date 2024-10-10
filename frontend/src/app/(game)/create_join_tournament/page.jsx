export default function CreateJoinTournamentPage() {
    return (
        <div className="bg-whitetrspnt m-auto w-[90%] lg:w-[80%] lg:max-w-[1170px] lg:p-24 p-6 rounded-3xl flex flex-col items-center lg:flex-row lg:justify-center lg:gap-[6%] lg:mt-[200px]">
            <div className="flex flex-col items-center lg:items-start">
                <p className="text-[26px] font-ibm font-semibold m-auto w-fit my-2 lg:text-[40px]  lg:m-0 lg:mb-11">Create tournament</p>
                <p className="hidden text-[16px] font-balsamiq my-1 lg:text-[25px] lg:block  lg:ml-10">give it a name:</p>
                <input
                    type="text"
                    placeholder="my_tournament123..."
                    className="rounded-lg w-[200px] px-3 text-black h-[40px] placeholder:text-black placeholder:font-sans placeholder:text-[14]
                        placeholder:font-extralight focus:outline-none focus:text-black lg:ml-10 lg:w-[255px] lg:h-[52px]"
                />
                    <ul className="list-disc list-inside my-6 lg:ml-10 lg:w-[399px]">
                        <li className="text-[14px] font-sans font-light py-1 lg:text-[16px]">the tournament name must contain alphanumeric characters.</li>
                        <li className="text-[14px] font-sans font-light  py-1 lg:text-[16px]">the tournament name must be unique, and not already exist in the database.</li>
                    </ul>
                <button className="  border-[1px]  text-[16px] w-[114px] h-[32px]
                 border-white rounded-xl bg-[#30C7EC] my-6 font-bold lg:text-[22px] lg:w[137px] lg:h-[41] lg:self-end">CREATE</button>

                <div className="lg:hidden">
                    <div className="w-[84px] h-[1px] mt-4 bg-white mb-[2px]"></div>
                    <div className="w-[84px] h-[1px] mb-4 bg-white"></div>
                </div>
            </div>
            <div className="hidden xl:block xl:my-auto xl:w-[0.5px] xl:h-[250px]  xl:bg-white"></div>
            <div className="flex flex-col items-center lg:justify-between">
                <p className="text-[26px] font-ibm font-semibold m-auto w-fit my-2 lg:text-[40px] lg:min-w-[338px]  lg:mb-11">Join tournament</p>
                <p className="text-[16px] font-balsamiq my-1 lg:text-[25px] ">pending tournaments:</p>
                <button className="text-[14px] font-mono bg-[#D6D6D6] text-black font-bold
                    rounded-md m-2 w-[180px] h-[30px] text-center lg:text-[16px] lg:w-[210px] lg:h-[40px]"   >1337_ping_pong</button>
                <button className="text-[14px] font-mono bg-[#D6D6D6] text-black font-bold
                    rounded-md m-2 w-[180px] h-[30px] text-center lg:text-[16px] lg:w-[210px] lg:h-[40px]"   >Ultimate_pong2024</button>
                <button className="text-[14px] font-mono bg-[#D6D6D6] text-black font-bold
                    rounded-md m-2 w-[180px] h-[30px] text-center lg:text-[16px] lg:w-[210px] lg:h-[40px]"   >Pong_sumet01</button>
                <button className="text-[14px] font-mono bg-[#D6D6D6] text-black font-bold
                    rounded-md m-2 w-[180px] h-[30px] text-center lg:text-[16px] lg:w-[210px] lg:h-[40px]"   >Ultimate_pong2024</button>
                <button className="  border-[1px]  text-[16px] w-[114px] h-[32px]
                 border-white rounded-xl bg-[#30C7EC] my-6 font-bold lg:text-[22px] lg:w[137px] lg:h-[41] lg:self-end ">JOIN</button>
            </div>


            
        </div>
    );
}