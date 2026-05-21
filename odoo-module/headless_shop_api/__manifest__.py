{
    'name': 'Headless Shop REST API',
    'version': '17.0.1.0.0',
    'category': 'Website',
    'summary': 'REST API for headless storefront with AI integration helpers',
    'description': """
Headless Shop REST API
======================
Exposes products, categories, cart, checkout, and order endpoints
as REST API for headless storefronts (Next.js / Nuxt / mobile apps).

Includes embeddings sync for AI semantic search, AI-friendly product
descriptions, and a simple bearer-token auth scheme for server-to-server
calls from the frontend.
    """,
    'author': 'Headless Shop AI',
    'website': 'https://example.com',
    'license': 'LGPL-3',
    'depends': [
        'base',
        'web',
        'product',
        'stock',
        'sale_management',
        'account',
        'website_sale',
    ],
    'data': [
        'security/api_security.xml',
        'security/ir.model.access.csv',
        'views/res_config_settings_views.xml',
        'data/demo_products.xml',
    ],
    'installable': True,
    'application': True,
    'auto_install': False,
}
