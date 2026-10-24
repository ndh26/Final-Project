import type { Product } from './types'
import data from './data/products.json'

/**
 * The product list, bundled into the site at build time. Edit src/data/products.json
 * (images live in public/images/products/) and rebuild to update the Products page.
 */
export const PRODUCTS: Product[] = data
