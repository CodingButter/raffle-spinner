import { NextResponse } from 'next/server';

export async function GET() {
  const directusUrl = process.env.NEXT_PUBLIC_DIRECTUS_URL || 'http://localhost:8055';

  try {
    // Fetch products from Directus with category and tier relationships (no auth needed for public data)
    const productsResponse = await fetch(
      `${directusUrl}/items/products?sort=price&fields=*,category.*,tier.*`,
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text();
      console.error('Failed to fetch products:', productsResponse.status, errorText);
      return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
    }

    const { data: products } = await productsResponse.json();

    // Transform products to match dashboard format with category and tier
    const transformedProducts = products.map((product: any) => ({
      key: product.key,
      name: product.name,
      price: product.price,
      currency: product.currency || 'GBP',
      features: product.features?.map((f: any) => f.feature) || [],
      stripe_price_id: product.stripe_price_id,
      popular: product.tier?.popular || false,
      description: product.description,
      category: product.category
        ? {
            key: product.category.key,
            name: product.category.name,
            icon: product.category.icon,
            color: product.category.color,
          }
        : null,
      tier: product.tier
        ? {
            key: product.tier.key,
            name: product.tier.name,
            popular: product.tier.popular,
          }
        : null,
    }));

    return NextResponse.json({ products: transformedProducts });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
