# -*- coding: utf-8 -*-
import secrets

from odoo import api, fields, models


class SaleOrder(models.Model):
    _inherit = 'sale.order'

    headless_source = fields.Char(
        string='Headless Source',
        help='Storefront origin (e.g. nextjs) that created this order.',
    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('access_token'):
                vals['access_token'] = secrets.token_urlsafe(24)
        return super().create(vals_list)
