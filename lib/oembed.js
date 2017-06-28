'use strict';

// Load modules

const Querystring = require('querystring');
const Url = require('url');
const Joi = require('joi');
const Router = require('./router');
const Utils = require('./utils');
const Services = require('./services');


// Declare internals

const internals = {};


internals.oembedSchema = Joi.object({
    type: Joi.valid('photo', 'video', 'link', 'rich').required(),
    title: Joi.string(),
    site_name: Joi.string(),

    html: Joi.string().when('type', { is: ['rich', 'video'], then: Joi.required() }),
    url: Joi.string().uri({ scheme: ['http', 'https'] }).when('type', { is: 'photo', then: Joi.required() }),
    width: Joi.number().min(1).when('type', { is: Joi.not('link'), then: Joi.required() }),
    height: Joi.number().min(1).allow(null).when('type', { is: Joi.not('link'), then: Joi.required() }),

    thumbnail_url: Joi.string().uri({ scheme: ['http', 'https'] }),
    thumbnail_width: Joi.number().min(1),
    thumbnail_height: Joi.number().min(1),

    version: Joi.string().valid('1.0').required(),
    author_name: Joi.string(),
    author_url: Joi.string(),
    provider_url: Joi.string(),
    cache_age: Joi.number()
})
    .rename('provider_name', 'site_name')
    .unknown();


exports.describe = function (resource, url, options, next) {

    /*
        https://publish.twitter.com/oembed?url=https://twitter.com/sideway/status/626158822705401856

        {
            "author_name": "Sideway",
            "author_url": "https://twitter.com/sideway",
            "cache_age": "3153600000",
            "height": null,
            "html": "<blockquote class=\"twitter-tweet\"><p lang=\"en\" dir=\"ltr\">First steps <a href=\"https://t.co/XvSn7XSI2G\">https://t.co/XvSn7XSI2G</a></p>&mdash; Sideway (@sideway) <a href=\"https://twitter.com/sideway/status/626158822705401856\">July 28, 2015</a></blockquote>\n<script async src=\"//platform.twitter.com/widgets.js\" charset=\"utf-8\"></script>",
            "provider_name": "Twitter",
            "provider_url": "https://twitter.com",
            "type": "rich",
            "url": "https://twitter.com/sideway/status/626158822705401856",
            "version": "1.0",
            "width": 550
        }
     */

    if (url) {
        const uri = Url.parse(url, true);
        delete uri.href;
        delete uri.path;
        delete uri.search;
        uri.query.format = 'json';
        if (options.maxHeight) {
            uri.query.maxheight = options.maxHeight;
        }

        if (options.maxWidth) {
            uri.query.maxwidth = options.maxWidth;
        }

        url = Url.format(uri);
    }
    else if (options.router) {
        url = options.router.match(resource, options);
    }

    if (!url) {
        return next({});
    }

    Services.instance.get('wreck').get(url, { redirects: 1 }, (err, res, payload) => {

        if (err ||
            res.statusCode !== 200) {

            return next({});
        }

        const raw = Utils.parse(payload);
        if (!raw) {
            return next({});
        }

        internals.oembedSchema.validate(raw, (err, oembed) => {

            if (err) {
                return next({});
            }

            const thumbnail = (!oembed.thumbnail_url ? null : {
                url: oembed.thumbnail_url,
                width: oembed.thumbnail_width,
                height: oembed.thumbnail_height
            });

            const description = {
                site_name: oembed.site_name,
                thumbnail
            };

            if (oembed.type === 'link') {
                description.url = oembed.url;
            }
            else {
                description.embed = Utils.copy(oembed, null, ['type', 'height', 'width', 'url', 'html']);
            }

            return next(description);
        });
    });
};


exports.providers = function (providers) {

    return new internals.Router(providers);
};


internals.Router = class extends Router {
    constructor(providers) {

        super();

        providers.forEach((provider) => {

            /*
                {
                    "provider_name": "Alpha App Net",
                    "provider_url": "https:\/\/alpha.app.net\/browse\/posts\/",
                    "endpoints": [
                        {
                            "schemes": [
                                "https:\/\/alpha.app.net\/*\/post\/*",
                                "https:\/\/photos.app.net\/*\/*"
                            ],
                            "url": "https:\/\/alpha-api.app.net\/oembed",
                            "formats": [
                                "json"
                            ]
                        }
                    ]
                }
            */

            provider.endpoints.forEach((endpoint) => {

                const url = endpoint.url.replace('{format}', 'json');

                if (!endpoint.schemes) {
                    return this.add(provider.provider_url, url);
                }

                endpoint.schemes.forEach((scheme) => this.add(scheme, url));
            });
        });
    }

    match(url, options) {

        options = options || {};

        const service = this.lookup(url);
        if (!service) {
            return null;
        }

        const query = { url, format: 'json' };
        if (options.maxHeight) {
            query.maxheight = options.maxHeight;
        }

        if (options.maxWidth) {
            query.maxwidth = options.maxWidth;
        }

        return `${service}?${Querystring.stringify(query)}`;
    }
};
