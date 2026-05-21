# -*- coding: utf-8 -*-
"""Public REST endpoints for the headless storefront.

All responses follow the standard envelope:
    success:  { "success": true,  "data": {...}, "meta": {...} }
    error:    { "success": false, "error": {"code": "...", "message": "..."} }
"""
import logging
import math
import secrets

from odoo import http
from odoo.http import request

from .auth import api_route, success, error

_logger = logging.getLogger(__name__)


def _serialize_product(product, full=False):
    """Return a JSON-safe dict for a product.template record."""
    base = {
        'id': product.api_id or product.id,
        'odoo_id': product.id,
        'name': product.name,
        'slug': product.api_slug or '',
        'price': product.list_price,
        'currency': product.currency_id.name if product.currency_id else 'USD',
        'image_url': f'/web/image/product.template/{product.id}/image_512',
        'in_stock': product.qty_available > 0 if product.type == 'product' else True,
        'qty_available': product.qty_available if product.type == 'product' else 999,
        'category': {
            'id': product.categ_id.id,
            'name': product.categ_id.name,
        } if product.categ_id else None,
    }
    if full:
        attrs = []
        for line in product.attribute_line_ids:
            attrs.append({
                'name': line.attribute_id.name,
                'values': [v.name for v in line.value_ids],
            })
        base.update({
            'description': product.description_sale or '',
            'ai_description': product.ai_description or '',
            'attributes': attrs,
            'images': [
                f'/web/image/product.template/{product.id}/image_1024',
            ],
        })
    return base


def _serialize_category(categ):
    return {
        'id': categ.id,
        'name': categ.name,
        'parent_id': categ.parent_id.id if categ.parent_id else None,
        'product_count': categ.product_count if hasattr(categ, 'product_count') else 0,
    }


def _serialize_cart(order):
    lines = []
    for line in order.order_line:
        lines.append({
            'id': line.id,
            'product_id': line.product_id.product_tmpl_id.api_id or line.product_id.product_tmpl_id.id,
            'product_name': line.product_id.name,
            'image_url': f'/web/image/product.product/{line.product_id.id}/image_256',
            'qty': line.product_uom_qty,
            'unit_price': line.price_unit,
            'subtotal': line.price_subtotal,
        })
    return {
        'token': order.access_token,
        'items': lines,
        'item_count': sum(int(line['qty']) for line in lines),
        'subtotal': order.amount_untaxed,
        'tax': order.amount_tax,
        'total': order.amount_total,
        'currency': order.currency_id.name,
    }


class HeadlessShopAPI(http.Controller):

    # ---------------------------------------------------------------
    # PRODUCTS
    # ---------------------------------------------------------------
    @api_route('/api/v1/products', methods=('GET',))
    def list_products(self, _payload=None, _origin=None, **kwargs):
        params = request.httprequest.args
        domain = [('sale_ok', '=', True), ('active', '=', True)]

        if params.get('category'):
            try:
                domain.append(('categ_id', '=', int(params['category'])))
            except ValueError:
                return error('BAD_REQUEST', 'category must be an integer', status=400, cors_origin=_origin)

        if params.get('search'):
            domain.append('|')
            domain.append(('name', 'ilike', params['search']))
            domain.append(('description_sale', 'ilike', params['search']))

        if params.get('min_price'):
            domain.append(('list_price', '>=', float(params['min_price'])))
        if params.get('max_price'):
            domain.append(('list_price', '<=', float(params['max_price'])))

        try:
            page = max(1, int(params.get('page', 1)))
            limit = min(100, max(1, int(params.get('limit', 20))))
        except ValueError:
            return error('BAD_REQUEST', 'page/limit must be integers', status=400, cors_origin=_origin)

        offset = (page - 1) * limit
        Product = request.env['product.template'].sudo()
        total = Product.search_count(domain)
        records = Product.search(domain, offset=offset, limit=limit, order='create_date desc')

        return success(
            data=[_serialize_product(p) for p in records],
            meta={
                'page': page,
                'limit': limit,
                'total': total,
                'total_pages': math.ceil(total / limit) if limit else 1,
            },
            cors_origin=_origin,
        )

    @api_route('/api/v1/products/<string:product_id>', methods=('GET',))
    def get_product(self, product_id, _payload=None, _origin=None, **kwargs):
        product = self._find_product(product_id)
        if not product:
            return error('PRODUCT_NOT_FOUND', f'No product with id {product_id}', status=404, cors_origin=_origin)
        return success(data=_serialize_product(product, full=True), cors_origin=_origin)

    @api_route('/api/v1/products/<string:product_id>/related', methods=('GET',))
    def related_products(self, product_id, _payload=None, _origin=None, **kwargs):
        product = self._find_product(product_id)
        if not product:
            return error('PRODUCT_NOT_FOUND', f'No product with id {product_id}', status=404, cors_origin=_origin)
        related = request.env['product.template'].sudo().search([
            ('categ_id', '=', product.categ_id.id),
            ('id', '!=', product.id),
            ('sale_ok', '=', True),
        ], limit=6)
        return success(data=[_serialize_product(p) for p in related], cors_origin=_origin)

    # ---------------------------------------------------------------
    # CATEGORIES + SEARCH
    # ---------------------------------------------------------------
    @api_route('/api/v1/categories', methods=('GET',))
    def list_categories(self, _payload=None, _origin=None, **kwargs):
        cats = request.env['product.category'].sudo().search([])
        return success(data=[_serialize_category(c) for c in cats], cors_origin=_origin)

    @api_route('/api/v1/search', methods=('GET',))
    def text_search(self, _payload=None, _origin=None, **kwargs):
        q = request.httprequest.args.get('q', '').strip()
        if not q:
            return success(data=[], cors_origin=_origin)
        Product = request.env['product.template'].sudo()
        records = Product.search([
            '&', ('sale_ok', '=', True),
            '|', ('name', 'ilike', q), ('description_sale', 'ilike', q),
        ], limit=30)
        return success(data=[_serialize_product(p) for p in records], cors_origin=_origin)

    @api_route('/api/v1/search/embeddings', methods=('GET',))
    def export_embeddings(self, _payload=None, _origin=None, **kwargs):
        """Export product corpus for client-side semantic search.

        The Next.js layer embeds the query and computes cosine similarity
        in the API route — keeps Odoo lean and avoids storing live API keys here.
        """
        Product = request.env['product.template'].sudo()
        products = Product.search([('sale_ok', '=', True), ('active', '=', True)], limit=500)
        corpus = []
        for p in products:
            corpus.append({
                'id': p.api_id or str(p.id),
                'name': p.name,
                'slug': p.api_slug or '',
                'price': p.list_price,
                'category': p.categ_id.name if p.categ_id else '',
                'text': ' '.join(filter(None, [
                    p.name,
                    p.categ_id.name if p.categ_id else '',
                    p.description_sale or '',
                    p.ai_description or '',
                ])),
                'embedding': p.embedding_vector or '',
            })
        return success(data=corpus, meta={'count': len(corpus)}, cors_origin=_origin)

    # ---------------------------------------------------------------
    # CART
    # ---------------------------------------------------------------
    @api_route('/api/v1/cart', methods=('POST',))
    def create_cart(self, _payload=None, _origin=None, **kwargs):
        Order = request.env['sale.order'].sudo()
        partner = request.env.ref('base.public_partner', raise_if_not_found=False)
        if not partner:
            partner = request.env['res.partner'].sudo().search([], limit=1)
        order = Order.create({
            'partner_id': partner.id,
            'state': 'draft',
            'access_token': secrets.token_urlsafe(24),
        })
        return success(data=_serialize_cart(order), cors_origin=_origin)

    @api_route('/api/v1/cart/<string:token>', methods=('GET',))
    def get_cart(self, token, _payload=None, _origin=None, **kwargs):
        order = self._find_cart(token)
        if not order:
            return error('CART_NOT_FOUND', 'Invalid cart token', status=404, cors_origin=_origin)
        return success(data=_serialize_cart(order), cors_origin=_origin)

    @api_route('/api/v1/cart/<string:token>/items', methods=('POST',))
    def add_cart_item(self, token, _payload=None, _origin=None, **kwargs):
        order = self._find_cart(token)
        if not order:
            return error('CART_NOT_FOUND', 'Invalid cart token', status=404, cors_origin=_origin)
        product_id = _payload.get('product_id')
        qty = float(_payload.get('qty', 1))
        if not product_id:
            return error('BAD_REQUEST', 'product_id is required', status=400, cors_origin=_origin)
        tmpl = self._find_product(str(product_id))
        if not tmpl:
            return error('PRODUCT_NOT_FOUND', 'Product not found', status=404, cors_origin=_origin)
        variant = tmpl.product_variant_id
        existing = order.order_line.filtered(lambda l: l.product_id.id == variant.id)
        if existing:
            existing.product_uom_qty += qty
        else:
            request.env['sale.order.line'].sudo().create({
                'order_id': order.id,
                'product_id': variant.id,
                'product_uom_qty': qty,
            })
        return success(data=_serialize_cart(order), cors_origin=_origin)

    @api_route('/api/v1/cart/<string:token>/items/<int:line_id>', methods=('PATCH',))
    def update_cart_item(self, token, line_id, _payload=None, _origin=None, **kwargs):
        order = self._find_cart(token)
        if not order:
            return error('CART_NOT_FOUND', 'Invalid cart token', status=404, cors_origin=_origin)
        line = order.order_line.filtered(lambda l: l.id == line_id)
        if not line:
            return error('LINE_NOT_FOUND', 'Cart line not found', status=404, cors_origin=_origin)
        qty = float(_payload.get('qty', 0))
        if qty <= 0:
            line.unlink()
        else:
            line.product_uom_qty = qty
        return success(data=_serialize_cart(order), cors_origin=_origin)

    @api_route('/api/v1/cart/<string:token>/items/<int:line_id>', methods=('DELETE',))
    def remove_cart_item(self, token, line_id, _payload=None, _origin=None, **kwargs):
        order = self._find_cart(token)
        if not order:
            return error('CART_NOT_FOUND', 'Invalid cart token', status=404, cors_origin=_origin)
        line = order.order_line.filtered(lambda l: l.id == line_id)
        if line:
            line.unlink()
        return success(data=_serialize_cart(order), cors_origin=_origin)

    # ---------------------------------------------------------------
    # CHECKOUT + ORDERS
    # ---------------------------------------------------------------
    @api_route('/api/v1/checkout/<string:token>', methods=('POST',))
    def checkout(self, token, _payload=None, _origin=None, **kwargs):
        order = self._find_cart(token)
        if not order:
            return error('CART_NOT_FOUND', 'Invalid cart token', status=404, cors_origin=_origin)
        if not order.order_line:
            return error('CART_EMPTY', 'Cart is empty', status=400, cors_origin=_origin)

        email = (_payload.get('email') or '').strip().lower()
        if '@' not in email:
            return error('BAD_REQUEST', 'Valid email is required', status=400, cors_origin=_origin)

        shipping = _payload.get('shipping', {}) or {}
        required = ['name', 'street', 'city', 'zip', 'country_code', 'phone']
        missing = [f for f in required if not shipping.get(f)]
        if missing:
            return error('BAD_REQUEST', f'Missing shipping fields: {", ".join(missing)}', status=400, cors_origin=_origin)

        # Find or create a customer record.
        Partner = request.env['res.partner'].sudo()
        Country = request.env['res.country'].sudo()
        country = Country.search([('code', '=', shipping['country_code'].upper())], limit=1)
        partner = Partner.search([('email', '=', email)], limit=1)
        partner_vals = {
            'name': shipping['name'],
            'email': email,
            'street': shipping['street'],
            'city': shipping['city'],
            'zip': shipping['zip'],
            'phone': shipping['phone'],
        }
        if country:
            partner_vals['country_id'] = country.id
        if not partner:
            partner = Partner.create(partner_vals)
        else:
            partner.write(partner_vals)

        order.write({'partner_id': partner.id, 'partner_invoice_id': partner.id, 'partner_shipping_id': partner.id})

        # Confirm the order. In a real deployment this would integrate with a
        # payment provider; for the portfolio demo we mark it confirmed directly.
        order.action_confirm()

        return success(data={
            'order_id': order.id,
            'order_token': order.access_token,
            'order_name': order.name,
            'total': order.amount_total,
            'payment_url': f'/orders/{order.access_token}',
        }, cors_origin=_origin)

    @api_route('/api/v1/orders/<string:order_token>', methods=('GET',))
    def track_order(self, order_token, _payload=None, _origin=None, **kwargs):
        order = request.env['sale.order'].sudo().search([('access_token', '=', order_token)], limit=1)
        if not order:
            return error('ORDER_NOT_FOUND', 'Order not found', status=404, cors_origin=_origin)
        email = request.httprequest.args.get('email', '').strip().lower()
        if email and order.partner_id.email and order.partner_id.email.lower() != email:
            return error('UNAUTHORIZED', 'Email does not match order', status=403, cors_origin=_origin)
        return success(data={
            'id': order.id,
            'order_name': order.name,
            'state': order.state,
            'date_order': order.date_order,
            'total': order.amount_total,
            'currency': order.currency_id.name,
            'items': [{
                'product_name': line.product_id.name,
                'qty': line.product_uom_qty,
                'subtotal': line.price_subtotal,
            } for line in order.order_line],
            'shipping': {
                'name': order.partner_id.name,
                'street': order.partner_id.street,
                'city': order.partner_id.city,
                'zip': order.partner_id.zip,
                'country': order.partner_id.country_id.name if order.partner_id.country_id else '',
            },
            'timeline': self._order_timeline(order),
        }, cors_origin=_origin)

    # ---------------------------------------------------------------
    # Helpers
    # ---------------------------------------------------------------
    def _find_product(self, identifier):
        Product = request.env['product.template'].sudo()
        # Try slug, api_id, then numeric id.
        product = Product.search([('api_slug', '=', identifier)], limit=1)
        if not product:
            product = Product.search([('api_id', '=', identifier)], limit=1)
        if not product:
            try:
                product = Product.browse(int(identifier))
                if not product.exists():
                    return None
            except (ValueError, TypeError):
                return None
        return product

    def _find_cart(self, token):
        order = request.env['sale.order'].sudo().search([
            ('access_token', '=', token),
            ('state', '=', 'draft'),
        ], limit=1)
        return order or None

    def _order_timeline(self, order):
        states = ['draft', 'sent', 'sale', 'done']
        labels = {
            'draft': 'Placed',
            'sent': 'Confirmed',
            'sale': 'Processing',
            'done': 'Delivered',
            'cancel': 'Cancelled',
        }
        current_idx = states.index(order.state) if order.state in states else 0
        return [
            {'state': s, 'label': labels[s], 'done': i <= current_idx}
            for i, s in enumerate(states)
        ]
