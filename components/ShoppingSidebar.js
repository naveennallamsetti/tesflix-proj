import Image from 'next/image';
import styles from './ShoppingSidebar.module.css';

export default function ShoppingSidebar({ isOpen, onClose }) {
  const products = [
    {
      id: 1,
      name: 'Tesflix Premium T-Shirt',
      price: '$24.99',
      image: '/shop/tesflix_tshirt.png'
    },
    {
      id: 2,
      name: 'Tesflix Ceramic Mug',
      price: '$14.99',
      image: '/shop/tesflix_mug.png'
    }
  ];

  return (
    <>
      <div 
        className={`${styles.overlay} ${isOpen ? styles.overlayOpen : ''}`} 
        onClick={onClose}
      />
      <div className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        <div className={styles.header}>
          <h2>Tesflix Shop</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </div>
        <div className={styles.content}>
          {products.map((product) => (
            <div key={product.id} className={styles.product}>
              <div className={styles.productImageWrapper}>
                <Image 
                  src={product.image} 
                  alt={product.name} 
                  width={100} 
                  height={100} 
                  className={styles.productImage}
                />
              </div>
              <div className={styles.productInfo}>
                <div>
                  <h3 className={styles.productName}>{product.name}</h3>
                  <p className={styles.productPrice}>{product.price}</p>
                </div>
                <button className={styles.addButton}>Add to Cart</button>
              </div>
            </div>
          ))}
        </div>
        <div className={styles.footer}>
          <button className={styles.checkoutButton}>Checkout</button>
        </div>
      </div>
    </>
  );
}
