import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';


 const tournament_data = {
    "id": 16,
    "title": "Personal Behind",
    "created_at": "2024-11-14T20:41:09.601262+01:00",
    "finished": false,
    "updated_at": "2024-11-16T17:58:20.484854+01:00",
    "match1_nickname1": "Adam",
    "match1_nickname2": "Jesse",
    "match2_nickname1": "Scott",
    "match2_nickname2": "Seth",
    "match3_nickname1": "Stacy",
    "match3_nickname2": "Katherine",
    "match4_nickname1": "Robert",
    "match4_nickname2": "Shawn",
    "match2_winner": "Scott",
    "match1_winner": "Adam",
    "match3_winner": "Katherine",
    "match4_winner": "Robert",
    "match5_winner": "Scott",
    "match6_winner": "Robert",
    "match7_winner": null,
    "match_index": 2
}
const MATCHES = {
    1: ['match1_nickname1', 'match1_nickname2', 'match1_winner'],
    2: ['match2_nickname1', 'match2_nickname2', 'match2_winner'],
    3: ['match3_nickname1', 'match3_nickname2', 'match3_winner'],
    4: ['match4_nickname1', 'match4_nickname2', 'match4_winner'],
    5: ['match1_winner', 'match2_winner', 'match5_winner'],
    6: ['match3_winner', 'match4_winner', 'match6_winner'],
    7: ['match5_winner', 'match6_winner', 'match7_winner'],
}

const getNextMatch = (tournament) => {
    const match_index = tournament.match_index;
    if (tournament.finished)
        return tournament.match7_winner;
    const match = MATCHES[match_index];
    const [nickname1, nickname2, _] = match;

    return `${tournament[nickname1]} vs ${tournament[nickname2]}`;
}

const rounds = [
    'Opening Matches',
    'Semifinals',
    'Finals',
    'Champion'
]

const getRound = (match_index) => {
    if (match_index <= 4) {
        return rounds[0];
    } else if (match_index <= 6) {
        return rounds[1];
    } else if (match_index === 7) {
        return rounds[2];
    } else {
        return rounds[3];
    }
}

const Card = ({tournament={}}) => {
    const router = useRouter();
    // const [transition, setTransition] = useState(false);

    if (tournament.length === 0) {
        tournament = tournament_data;
    }
    const handleTournamentDetail = (id) => (
        // setTransition(true),
        // setTimeout(() => {
        //     router.push(`/tournament/${id}/`);
        // }, 500)
        router.push(`/tournament/${id}/`)
    );
    return (
        <div
            onClick={()=>handleTournamentDetail(tournament.id)}
            className="flex flex-col justify-center items-center mx-auto w-full bg-transparent border hover:ring hover:ring-white/50  rounded-t-lg rounded-b-lg shadow-lg cursor-pointer"
        >
            {/* image */}
            <Image src={`/tournament/${tournament.id%17+1}.png`} className="w-full h-auto rounded-t-lg" alt="tourn" width={566} height={202} />
            {/* data */}
            <div className="flex flex-col justify-center items-start gap-y-4 mx-auto w-full p-4 rounded-b-lg bg-gradient-to-t from-black to-black/0">
                <div className='flex items-center text-white/50 gap-x-1'>
                    <svg width="24px" height="24px" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9.81672 11.1334L9.3695 11.357L9.3695 11.357L9.81672 11.1334ZM9.5 10.5L9.94721 10.2764C9.86252 10.107 9.68939 10 9.5 10V10.5ZM5.5 10.5V10C5.31061 10 5.13748 10.107 5.05279 10.2764L5.5 10.5ZM14 5.5V10.0279H15V5.5H14ZM10.2639 10.9098L9.94721 10.2764L9.05279 10.7236L9.3695 11.357L10.2639 10.9098ZM9.5 10H5.5V11H9.5V10ZM5.05279 10.2764L4.73607 10.9098L5.6305 11.357L5.94721 10.7236L5.05279 10.2764ZM1 10.0279V5.5H0V10.0279H1ZM3.5 3H11.5V2H3.5V3ZM2.97214 12C1.88296 12 1 11.117 1 10.0279H0C0 11.6693 1.33067 13 2.97214 13V12ZM12.0279 12C11.2809 12 10.598 11.578 10.2639 10.9098L9.3695 11.357C9.87296 12.364 10.9021 13 12.0279 13V12ZM14 10.0279C14 11.117 13.117 12 12.0279 12V13C13.6693 13 15 11.6693 15 10.0279H14ZM4.73607 10.9098C4.402 11.578 3.71913 12 2.97214 12V13C4.0979 13 5.12704 12.364 5.6305 11.357L4.73607 10.9098ZM15 5.5C15 3.567 13.433 2 11.5 2V3C12.8807 3 14 4.11929 14 5.5H15ZM1 5.5C1 4.11929 2.11929 3 3.5 3V2C1.567 2 0 3.567 0 5.5H1ZM3 7H6V6H3V7ZM4 5V8H5V5H4ZM11 6H12V5H11V6ZM9 8H10V7H9V8Z" fill="currentColor"/>
                    </svg>
                    <span className='uppercase text-blue-50'>{tournament.title}</span>
                </div>

                <div className='flex items-center text-white/50 gap-x-1'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24px" height="24px" viewBox="0 0 24 24" fill="none">
                        <path fillRule="evenodd" clipRule="evenodd" d="M4.63338 2.58608C4.63338 1.8758 5.20918 1.3 5.91946 1.3H18.0806C18.7869 1.3 19.3667 1.86929 19.3667 2.58354V2.59368V2.60384V2.61401V2.62419V2.63439V2.64459V2.65481V2.66504V2.67528V2.68553V2.69579V2.70606V2.71634V2.72664V2.73695V2.74726V2.75759V2.76793V2.77828V2.78864V2.79902V2.8094V2.8198V2.8302V2.84062V2.85105V2.86148V2.87193V2.88239V2.89286V2.90335V2.91384V2.92434V2.93486V2.94538V2.95591V2.96646V2.97702V2.98758V2.99816V3.00875V3.01935V3.02995V3.04057V3.0512V3.06184V3.07249V3.08315V3.09382V3.1045V3.11519V3.12589V3.1366V3.14732V3.15805V3.1688V3.17955V3.19031V3.20108V3.21186V3.22265V3.23345V3.24426V3.25508V3.26591V3.27675V3.2876V3.29846V3.30933V3.32021V3.3311V3.342V3.3529V3.36382V3.37475V3.38568V3.39663V3.40758V3.41855V3.42952V3.4405V3.4515V3.4625V3.47351V3.48453V3.49556V3.50659V3.51764V3.52223H19.7778C21.3917 3.52223 22.7001 4.83055 22.7001 6.44445V7.89665C22.7001 9.02301 22.0527 10.0491 21.0361 10.5341L18.9681 11.5207C18.903 11.5518 18.8354 11.5719 18.7675 11.5818C17.726 13.9966 15.4297 15.7432 12.7001 16.0005V17.9667H14.5927C15.2249 17.9667 15.8402 18.1718 16.346 18.5511L17.5312 19.44C18.9236 20.4843 18.185 22.7 16.4445 22.7H7.55562C5.81513 22.7 5.07654 20.4843 6.46895 19.44L7.65413 18.5511C8.15996 18.1718 8.77519 17.9667 9.40747 17.9667H11.3001V16.0005C8.57046 15.7432 6.27425 13.9966 5.23266 11.5818C5.16475 11.5719 5.09716 11.5518 5.03197 11.5207L2.964 10.5341C1.9474 10.0491 1.30005 9.02301 1.30005 7.89665V6.44445C1.30005 4.83055 2.60837 3.52223 4.22227 3.52223H4.63338V2.58608ZM17.9667 8.66689C17.9667 11.9614 15.2966 14.6321 12.0023 14.6333H12C8.70475 14.6333 6.03338 11.962 6.03338 8.66667V2.7H17.9667V2.70606V2.71634V2.72664V2.73695V2.74726V2.75759V2.76793V2.77828V2.78864V2.79902V2.8094V2.8198V2.8302V2.84062V2.85105V2.86148V2.87193V2.88239V2.89286V2.90335V2.91384V2.92434V2.93486V2.94538V2.95591V2.96646V2.97702V2.98758V2.99816V3.00875V3.01935V3.02995V3.04057V3.0512V3.06184V3.07249V3.08315V3.09382V3.1045V3.11519V3.12589V3.1366V3.14732V3.15805V3.1688V3.17955V3.19031V3.20108V3.21186V3.22265V3.23345V3.24426V3.25508V3.26591V3.27675V3.2876V3.29846V3.30933V3.32021V3.3311V3.342V3.3529V3.36382V3.37475V3.38568V3.39663V3.40758V3.41855V3.42952V3.4405V3.4515V3.4625V3.47351V3.48453V3.49556V3.50659V3.51764V3.5287V3.53976V3.55084V3.56192V3.57302V3.58412V3.59523V3.60635V3.61748V3.62861V3.63976V3.65092V3.66208V3.67325V3.68443V3.69562V3.70682V3.71803V3.72925V3.74047V3.7517V3.76294V3.77419V3.78545V3.79672V3.808V3.81928V3.83057V3.84187V3.85318V3.8645V3.87582V3.88716V3.8985V3.90985V3.92121V3.93257V3.94395V3.95533V3.96672V3.97812V3.98952V4.00094V4.01236V4.02379V4.03523V4.04667V4.05813V4.06959V4.08106V4.09253V4.10402V4.11551V4.12701V4.13852V4.15003V4.16155V4.17308V4.18462V4.19617V4.20772V4.21928V4.23084V4.24242V4.254V4.26559V4.27719V4.28879V4.3004V4.31202V4.32364V4.33527V4.34691V4.35856V4.37021V4.38187V4.39354V4.40522V4.4169V4.42858V4.44028V4.45198V4.46369V4.47541V4.48713V4.49886V4.51059V4.52234V4.53408V4.54584V4.5576V4.56937V4.58115V4.59293V4.60472V4.61651V4.62831V4.64012V4.65193V4.66375V4.67558V4.68741V4.69925V4.7111V4.72295V4.73481V4.74667V4.75854V4.77042V4.7823V4.79419V4.80608V4.81798V4.82989V4.8418V4.85372V4.86564V4.87757V4.88951V4.90145V4.91339V4.92535V4.9373V4.94927V4.96124V4.97321V4.98519V4.99718V5.00917V5.02117V5.03317V5.04518V5.05719V5.06921V5.08124V5.09327V5.1053V5.11734V5.12939V5.14144V5.1535V5.16556V5.17762V5.18969V5.20177V5.21385V5.22594V5.23803V5.25013V5.26223V5.27434V5.28645V5.29856V5.31068V5.32281V5.33494V5.34708V5.35922V5.37136V5.38351V5.39566V5.40782V5.41998V5.43215V5.44432V5.4565V5.46868V5.48087V5.49306V5.50525V5.51745V5.52965V5.54186V5.55407V5.56629V5.57851V5.59073V5.60296V5.61519V5.62743V5.63967V5.65192V5.66416V5.67642V5.68867V5.70093V5.7132V5.72547V5.73774V5.75002V5.7623V5.77458V5.78687V5.79916V5.81145V5.82375V5.83605V5.84836V5.86067V5.87298V5.88529V5.89761V5.90994V5.92226V5.93459V5.94693V5.95926V5.9716V5.98395V5.99629V6.00864V6.021V6.03335V6.04571V6.05807V6.07044V6.08281V6.09518V6.10755V6.11993V6.13231V6.14469V6.15708V6.16947V6.18186V6.19426V6.20665V6.21905V6.23146V6.24386V6.25627V6.26868V6.2811V6.29351V6.30593V6.31835V6.33078V6.3432V6.35563V6.36806V6.3805V6.39293V6.40537V6.41781V6.43025V6.4427V6.45514V6.46759V6.48005V6.4925V6.50495V6.51741V6.52987V6.54233V6.5548V6.56726V6.57973V6.5922V6.60467V6.61715V6.62962V6.6421V6.65458V6.66706V6.67954V6.69203V6.70451V6.717V6.72949V6.74198V6.75447V6.76696V6.77946V6.79195V6.80445V6.81695V6.82945V6.84195V6.85446V6.86696V6.87947V6.89198V6.90448V6.91699V6.9295V6.94202V6.95453V6.96704V6.97956V6.99207V7.00459V7.01711V7.02963V7.04215V7.05467V7.06719V7.07971V7.09224V7.10476V7.11728V7.12981V7.14233V7.15486V7.16739V7.17992V7.19245V7.20497V7.2175V7.23003V7.24256V7.2551V7.26763V7.28016V7.29269V7.30522V7.31775V7.33029V7.34282V7.35535V7.36789V7.38042V7.39295V7.40549V7.41802V7.43056V7.44309V7.45562V7.46816V7.48069V7.49322V7.50576V7.51829V7.53082V7.54336V7.55589V7.56842V7.58095V7.59349V7.60602V7.61855V7.63108V7.64361V7.65614V7.66867V7.6812V7.69372V7.70625V7.71878V7.7313V7.74383V7.75635V7.76888V7.7814V7.79392V7.80645V7.81897V7.83149V7.84401V7.85652V7.86904V7.88156V7.89407V7.90659V7.9191V7.93161V7.94412V7.95663V7.96914V7.98165V7.99416V8.00666V8.01917V8.03167V8.04417V8.05667V8.06917V8.08166V8.09416V8.10665V8.11914V8.13164V8.14412V8.15661V8.1691V8.18158V8.19407V8.20655V8.21903V8.2315V8.24398V8.25645V8.26893V8.28139V8.29386V8.30633V8.31879V8.33126V8.34372V8.35618V8.36863V8.38109V8.39354V8.40599V8.41844V8.43088V8.44333V8.45577V8.4682V8.48064V8.49307V8.50551V8.51794V8.53036V8.54279V8.55521V8.56763V8.58004V8.59246V8.60487V8.61728V8.62969V8.64209V8.65449V8.66689ZM19.2766 9.82234L20.4333 9.27053C20.9628 9.01789 21.3001 8.48339 21.3001 7.89665V6.44445C21.3001 5.60375 20.6185 4.92223 19.7778 4.92223H19.3667V4.92535V4.9373V4.94927V4.96124V4.97321V4.98519V4.99718V5.00917V5.02117V5.03317V5.04518V5.05719V5.06921V5.08124V5.09327V5.1053V5.11734V5.12939V5.14144V5.1535V5.16556V5.17762V5.18969V5.20177V5.21385V5.22594V5.23803V5.25013V5.26223V5.27434V5.28645V5.29856V5.31068V5.32281V5.33494V5.34708V5.35922V5.37136V5.38351V5.39566V5.40782V5.41998V5.43215V5.44432V5.4565V5.46868V5.48087V5.49306V5.50525V5.51745V5.52965V5.54186V5.55407V5.56629V5.57851V5.59073V5.60296V5.61519V5.62743V5.63967V5.65192V5.66416V5.67642V5.68867V5.70093V5.7132V5.72547V5.73774V5.75002V5.7623V5.77458V5.78687V5.79916V5.81145V5.82375V5.83605V5.84836V5.86067V5.87298V5.88529V5.89761V5.90994V5.92226V5.93459V5.94693V5.95926V5.9716V5.98395V5.99629V6.00864V6.021V6.03335V6.04571V6.05807V6.07044V6.08281V6.09518V6.10755V6.11993V6.13231V6.14469V6.15708V6.16947V6.18186V6.19426V6.20665V6.21905V6.23146V6.24386V6.25627V6.26868V6.2811V6.29351V6.30593V6.31835V6.33078V6.3432V6.35563V6.36806V6.3805V6.39293V6.40537V6.41781V6.43025V6.4427V6.45514V6.46759V6.48005V6.4925V6.50495V6.51741V6.52987V6.54233V6.5548V6.56726V6.57973V6.5922V6.60467V6.61715V6.62962V6.6421V6.65458V6.66706V6.67954V6.69203V6.70451V6.717V6.72949V6.74198V6.75447V6.76696V6.77946V6.79195V6.80445V6.81695V6.82945V6.84195V6.85446V6.86696V6.87947V6.89198V6.90448V6.91699V6.9295V6.94202V6.95453V6.96704V6.97956V6.99207V7.00459V7.01711V7.02963V7.04215V7.05467V7.06719V7.07971V7.09224V7.10476V7.11728V7.12981V7.14233V7.15486V7.16739V7.17992V7.19245V7.20497V7.2175V7.23003V7.24256V7.2551V7.26763V7.28016V7.29269V7.30522V7.31775V7.33029V7.34282V7.35535V7.36789V7.38042V7.39295V7.40549V7.41802V7.43056V7.44309V7.45562V7.46816V7.48069V7.49322V7.50576V7.51829V7.53082V7.54336V7.55589V7.56842V7.58095V7.59349V7.60602V7.61855V7.63108V7.64361V7.65614V7.66867V7.6812V7.69372V7.70625V7.71878V7.7313V7.74383V7.75635V7.76888V7.7814V7.79392V7.80645V7.81897V7.83149V7.84401V7.85652V7.86904V7.88156V7.89407V7.90659V7.9191V7.93161V7.94412V7.95663V7.96914V7.98165V7.99416V8.00666V8.01917V8.03167V8.04417V8.05667V8.06917V8.08166V8.09416V8.10665V8.11914V8.13164V8.14412V8.15661V8.1691V8.18158V8.19407V8.20655V8.21903V8.2315V8.24398V8.25645V8.26893V8.28139V8.29386V8.30633V8.31879V8.33126V8.34372V8.35618V8.36863V8.38109V8.39354V8.40599V8.41844V8.43088V8.44333V8.45577V8.4682V8.48064V8.49307V8.50551V8.51794V8.53036V8.54279V8.55521V8.56763V8.58004V8.59246V8.60487V8.61728V8.62969V8.64209V8.65449V8.66689C19.3667 9.06 19.3359 9.44591 19.2766 9.82234ZM4.63338 8.66667C4.63338 9.05985 4.66419 9.44585 4.72351 9.82236L3.56682 9.27053C3.03727 9.01789 2.70005 8.48339 2.70005 7.89665V6.44445C2.70005 5.60375 3.38157 4.92223 4.22227 4.92223H4.63338V8.66667ZM8.49413 19.6711C8.75763 19.4735 9.0781 19.3667 9.40747 19.3667H12.0001H14.5927C14.922 19.3667 15.2425 19.4735 15.506 19.6711L16.6912 20.56C17.0072 20.7971 16.8396 21.3 16.4445 21.3H7.55562C7.16053 21.3 6.99289 20.7971 7.30895 20.56L8.49413 19.6711Z" fill="currentColor"/>
                        <path d="M11.8425 6.20125C11.9226 6.09893 12.0774 6.09893 12.1575 6.20125L12.7183 6.91782C12.7413 6.94724 12.7721 6.96963 12.8072 6.98244L13.662 7.29436C13.7841 7.3389 13.832 7.48617 13.7594 7.59395L13.2512 8.34874C13.2303 8.37973 13.2185 8.41595 13.2172 8.45329L13.1847 9.36265C13.1801 9.49249 13.0548 9.58351 12.9299 9.5478L12.055 9.29771C12.019 9.28744 11.981 9.28744 11.945 9.29771L11.0701 9.5478C10.9452 9.58351 10.8199 9.49249 10.8153 9.36265L10.7828 8.45329C10.7815 8.41595 10.7697 8.37973 10.7488 8.34874L10.2406 7.59395C10.168 7.48617 10.2159 7.3389 10.338 7.29436L11.1928 6.98244C11.2279 6.96963 11.2587 6.94724 11.2817 6.91782L11.8425 6.20125Z" fill="currentColor"/>
                    </svg>
                    <span className='capitalize text-white font-extralight'>{getRound(tournament.match_index)}</span>
                </div>

                <div className='flex items-center text-white/50 gap-x-1'>
                <svg width="24px" height="24px" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g strokeWidth="0"></g><g strokeLinecap="round" strokeLinejoin="round"></g>
                    <g> <path d="M9 2H2v2h5v4H2v2h7V7h5v10H9v-3H2v2h5v4H2v2h7v-3h7v-6h6v-2h-6V5H9V2z" fill="currentColor"></path> </g>
                </svg>
                <span className='capitalize text-white font-extralight'>{ getNextMatch(tournament)}</span>
                </div>
                
            </div>
        </div>
    );
};

export default Card;