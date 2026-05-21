# -*- coding: utf-8 -*-
from odoo import fields, models


class ResConfigSettings(models.TransientModel):
    _inherit = 'res.config.settings'

    headless_api_key = fields.Char(
        string='Headless API Key',
        config_parameter='headless_shop_api.api_key',
        help='Bearer token required by the storefront for server-side calls.',
    )
    headless_cors_origins = fields.Char(
        string='Allowed CORS Origins',
        config_parameter='headless_shop_api.cors_origins',
        default='*',
        help='Comma-separated list of origins. Use * for any origin (dev only).',
    )
    headless_openai_api_key = fields.Char(
        string='OpenAI API Key',
        config_parameter='headless_shop_api.openai_api_key',
        help='Used for product embeddings generation.',
    )
    headless_anthropic_api_key = fields.Char(
        string='Anthropic API Key',
        config_parameter='headless_shop_api.anthropic_api_key',
        help='Used by the storefront for product Q&A. Stored here for ops convenience.',
    )
    headless_enable_semantic_search = fields.Boolean(
        string='Enable Semantic Search',
        config_parameter='headless_shop_api.enable_semantic_search',
        default=True,
    )
    headless_embedding_model = fields.Selection(
        [
            ('text-embedding-3-small', 'OpenAI text-embedding-3-small'),
            ('text-embedding-3-large', 'OpenAI text-embedding-3-large'),
        ],
        string='Embedding Model',
        config_parameter='headless_shop_api.embedding_model',
        default='text-embedding-3-small',
    )
