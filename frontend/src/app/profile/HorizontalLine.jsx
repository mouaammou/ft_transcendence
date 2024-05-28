

const HorizontalLine = ({lWidth, lTop, lLeft}) => {
	return (
		<div >
					<hr style={{
							border: '0.5px solid gray',
							width: `${lWidth}`,
							height: '0px',
							}}/>
				</div>
	 );
}

export default HorizontalLine;