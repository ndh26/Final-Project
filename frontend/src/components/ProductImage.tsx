import type { Product } from '../types'
import PricklyPear from './PricklyPear'

/** The product photo, or the prickly pear illustration until a photo is added. */
export default function ProductImage({ product }: { product: Product }) {
  return (
    <div className="product-image">
      {product.image ? (
        <img src={product.image} alt={product.name} loading="lazy" />
      ) : (
        <div className="product-placeholder">
          <PricklyPear />
          <span>Photo coming soon</span>
        </div>
      )}
    </div>
  )
}
