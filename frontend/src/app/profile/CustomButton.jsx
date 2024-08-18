const CustomButton = ({myLabel, count, color}) => {
	return (
		<div style={{
				display: 'flex',
				flexDirection: 'column',
				alignItems: 'center',
				gap: '10px',
					}}>
			<p style={{
					fontFamily: 'var(--principaleFont)',
					fontSize: '16px',
					fontWeight:'500',
					textAlign: 'center',
				}}>{myLabel}</p>

			<button style={{
				height: '63px',
				width: '86px',
				borderRadius: '30px',
				fontSize: '26px',
				color: 'white',
				backgroundColor: `${color}`,
				border: 'none',
				paddingLeft: '28px',
				paddingRight: '28px',

		}}> {count} </button>
		</div>
	 );
}

export default CustomButton;