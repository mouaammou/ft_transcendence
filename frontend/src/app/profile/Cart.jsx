const Cart = ({cartColor, imgg, name}) => {
    return (
        <div className="my-cart" 
            style={{
                display: 'flex',
                alignItems: 'center',
                height: '60px',
                width: '212px',
                borderRadius: '5px',
                backgroundColor: `${cartColor}`,
                margin: '4px 0px'
            }}>
            <img src={imgg} alt="avatar"
                style={{
                    width: '44px',
                    height: '44px',
                    borderRadius: '22px',
                    margin: '0 12px'
                }}/>
            <p style={{
                	fontFamily: 'Lato',
                    fontSize: '14px'
                }}>{name}</p>
        </div>
    );
}

export default Cart;