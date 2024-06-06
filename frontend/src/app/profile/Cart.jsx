import Image from "next/image";

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
            <Image src={imgg} alt="avatar"
                width={44}
                height={44}
                style={{
                    borderRadius: '22px',
                    margin: '0 12px'
                }}></Image>
            <p style={{
                	fontFamily: 'Lato',
                    fontSize: '14px'
                }}>{name}</p>
        </div>
    );
}

export default Cart;