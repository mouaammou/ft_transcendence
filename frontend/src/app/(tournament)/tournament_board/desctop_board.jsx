import MobileBoard from './mobile_board';

const data = [
  {
    id: 'circleView1rt',
    cx: 52.5,
    cy: 31.5,
    r: 30.5,
    imageUrl: 'imageUrl1',
    userName: 'userName1',
  },
  {
    id: 'circleView2a',
    cx: 52.5,
    cy: 128.5,
    r: 30.5,
    imageUrl: 'imageUrl2',
    userName: 'userName2',
  },
  {
    id: 'circleView3t',
    cx: 52.5,
    cy: 228.5,
    r: 30.5,
    imageUrl: 'imageUrl3',
    userName: 'userName3',
  },
  {
    id: 'circleView4q',
    cx: 52.5,
    cy: 325.5,
    r: 30.5,
    imageUrl: 'imageUrl4',
    userName: 'userName4',
  },
  {
    id: 'circleView5e',
    cx: 52.5,
    cy: 418.5,
    r: 30.5,
    imageUrl: 'imageUrl5',
    userName: 'userName5',
  },
  {
    id: 'circleView6y',
    cx: 52.5,
    cy: 515.5,
    r: 30.5,
    imageUrl: 'imageUrl6',
    userName: 'userName6',
  },
  {
    id: 'circleView7b',
    cx: 52.5,
    cy: 612.5,
    r: 30.5,
    imageUrl: 'imageUrl7',
    userName: 'userName7',
  },
  {
    id: 'circleView8i',
    cx: 52.5,
    cy: 709.5,
    r: 30.5,
    imageUrl: 'imageUrl8',
    userName: 'userName8',
  },
  { id: 'circleView98', cx: 415, cy: 74, r: 34, imageUrl: 'imageUrl9', userName: 'userName9' },
];

export default function Board({ imageUrls }) {
  const mobileImg = '/mobile_board.svg';
  const newboard = '/board.svg';

  return (
    <div>
      <MobileBoard imageUrls={imageUrls} />
      <svg
        className="hidden lg:flex "
        width="1010"
        height="741"
        viewBox="0 0 1310 741"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {data.map(({ id, cx, cy, r }) => (
            <clipPath key={id} id={id}>
              <circle cx={cx} cy={cy} r={r} />
            </clipPath>
          ))}
        </defs>
        {data.map(({ id, cx, cy, r, imageUrl, userName }) => (
          <React.Fragment key={id}>
            <rect
              x={cx - r - 10}
              y={cy - r - 10}
              width={r * 2 + 20}
              height={r * 2 + 20}
              rx={r / 2}
              stroke="#FFFEFE"
              fill="#00539D"
              fillOpacity="0.37"
            />
            <circle cx={cx} cy={cy} r={r} fill="#00539D" fillOpacity="0.37" />
            <image
              x={cx - r}
              y={cy - r}
              width={r * 2}
              height={r * 2}
              href={imageUrl}
              clipPath={`url(#${id})`}
            />
            <text x={cx + r + 10} y={cy} fill="white" alignmentBaseline="middle">
              {userName}
            </text>
          </React.Fragment>
        ))}
      </svg>
    </div>
  );
}
