# -*- coding: utf-8 -*-
"""Extend product.template with headless-API friendly fields."""
import json
import logging
import re
import uuid

from odoo import api, fields, models

_logger = logging.getLogger(__name__)


def slugify(value):
    value = re.sub(r'[^a-zA-Z0-9\s-]', '', value or '').strip().lower()
    return re.sub(r'[\s_-]+', '-', value)[:80]


class ProductTemplate(models.Model):
    _inherit = 'product.template'

    api_id = fields.Char(
        string='API ID',
        copy=False,
        index=True,
        help='Public UUID used by the headless storefront to reference this product.',
    )
    api_slug = fields.Char(
        string='API Slug',
        copy=False,
        index=True,
        help='SEO-friendly URL segment auto-generated from the product name.',
    )
    ai_description = fields.Html(
        string='AI Description',
        help='Long-form marketing copy generated for the storefront.',
    )
    embedding_vector = fields.Text(
        string='Embedding (JSON)',
        help='OpenAI/text-embedding-3-small vector serialised as JSON array.',
    )

    @api.model_create_multi
    def create(self, vals_list):
        for vals in vals_list:
            if not vals.get('api_id'):
                vals['api_id'] = uuid.uuid4().hex
            if not vals.get('api_slug') and vals.get('name'):
                vals['api_slug'] = self._unique_slug(slugify(vals['name']))
        return super().create(vals_list)

    def write(self, vals):
        if 'name' in vals and not vals.get('api_slug'):
            for record in self:
                if not record.api_slug:
                    record.api_slug = self._unique_slug(slugify(vals['name']))
        return super().write(vals)

    @api.model
    def _unique_slug(self, base):
        slug = base or uuid.uuid4().hex[:8]
        candidate = slug
        n = 1
        while self.search_count([('api_slug', '=', candidate)]):
            n += 1
            candidate = f'{slug}-{n}'
        return candidate

    def get_embedding_text(self):
        """Concatenated corpus used as input for the embedding model."""
        self.ensure_one()
        parts = [
            self.name or '',
            self.categ_id.name if self.categ_id else '',
            self.description_sale or '',
            self.ai_description or '',
        ]
        return ' \n '.join(p for p in parts if p)

    def set_embedding(self, vector):
        """Persist a numeric vector (list/tuple of floats) as JSON."""
        self.ensure_one()
        if vector is None:
            self.embedding_vector = False
            return
        self.embedding_vector = json.dumps(list(vector))

    def get_embedding(self):
        self.ensure_one()
        if not self.embedding_vector:
            return None
        try:
            return json.loads(self.embedding_vector)
        except (TypeError, ValueError):
            return None
