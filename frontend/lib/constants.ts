export const NAVIGATION = [
    { name: 'Home', href: '/' },
    {
        name: 'Men',
        href: '/products?category=men',
        sections: [
            {
                title: 'Topwear',
                items: ['T-Shirts', 'Polos', 'Casual Shirts', 'Formal Shirts', 'Sweatshirts', 'Jackets']
            },
            {
                title: 'Bottomwear',
                items: ['Jeans', 'Trousers', 'Shorts', 'Trackpants', 'Joggers']
            },
            {
                title: 'Accessories',
                items: ['Bags', 'Belts', 'Wallets', 'Socks', 'Caps']
            },
            {
                title: 'Collections',
                items: ['New Arrivals', 'Best Sellers', 'Trending', 'Basics']
            }
        ]
    },
    {
        name: 'Women',
        href: '/products?category=women',
        sections: [
            {
                title: 'Western Wear',
                items: ['Dresses', 'Tops', 'T-Shirts', 'Jeans', 'Skirts', 'Jackets']
            },
            {
                title: 'Ethnic & Fusion',
                items: ['Kurtas', 'Sarees', 'Ethnic Sets', 'Leggings', 'Dupattas']
            },
            {
                title: 'Footwear',
                items: ['Flats', 'Heels', 'Sneakers', 'Boots']
            },
            {
                title: 'Beauty',
                items: ['Makeup', 'Skincare', 'Fragrances']
            }
        ]
    },
    {
        name: 'Kitchen & Home',
        href: '/products?category=kitchen-and-home',
        sections: [
            {
                title: 'Kitchen',
                items: ['Cookware', 'Dinnerware', 'Tools & Utensils', 'Storage']
            },
            {
                title: 'Home Decor',
                items: ['Vases', 'Candles', 'Wall Art', 'Mirrors']
            },
            {
                title: 'Bed & Bath',
                items: ['Bed Sheets', 'Comforters', 'Towels', 'Bath Mats']
            },
            {
                title: 'Furnishing',
                items: ['Cushions', 'Curtains', 'Rugs']
            }
        ]
    },
    { name: 'Sale', href: '/products?category=sale' }
];
