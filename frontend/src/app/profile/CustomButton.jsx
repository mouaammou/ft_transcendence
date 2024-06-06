const CustomButton = ({myLabel, count, color}) => {
	return (
		<div style={{
				display: 'flex',
				flexDirection: 'column',
				justifyContent: 'center',
				alignItems: 'center'
					}}>
			<p style={{
					fontFamily: 'var(--principaleFont)',
					fontSize: '16px',
					fontWeight:'500',
					marginBottom: '10px'
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