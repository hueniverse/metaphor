'use strict';

// Load modules

const Url = require('url');
const Content = require('content');
const Hoek = require('hoek');
const Items = require('items');
const Joi = require('joi');
const Wreck = require('wreck');
const Oembed = require('./oembed');
const Ogp = require('./ogp');
const Providers = require('../providers.json');
const Router = require('./router');
const Tags = require('./tags');
const Twitter = require('./twitter');
const Utils = require('./utils');


// Declare internals

const internals = {};


exports.oembed = { providers: Oembed.providers };


internals.schema = Joi.object({
    maxWidth: Joi.number().integer().min(1),
    maxHeight: Joi.number().integer().min(1),
    maxSize: Joi.number().integer().min(1).allow(false).default(false),
    providers: Joi.array().allow(true, false).default(true),
    whitelist: Joi.array().items(Joi.string()).min(1),
    preview: Joi.func().allow(true, false).default(true),
    css: Joi.string().allow(false),
    script: Joi.string().allow(false),
    redirect: Joi.string(),
    summary: Joi.boolean().default(false),
    tweet: Joi.boolean().default(false)
});


exports.Engine = class {
    constructor(options) {

        this.settings = Joi.attempt(options || {}, internals.schema);
        if (this.settings.providers === true) {
            this.settings.providers = Providers;
        }

        if (this.settings.providers) {
            this.settings.router = Oembed.providers(this.settings.providers);
        }

        if (this.settings.whitelist) {
            this._whitelist = new Router();
            this.settings.whitelist.forEach((url) => this._whitelist.add(url, true));
        }

        if (this.settings.preview === true) {
            this.settings.preview = internals.preview;
        }
    }

    describe(url, callback) {

        if (!this._whitelist ||
            this._whitelist.lookup(url)) {

            return this._describe(url, callback);
        }

        return this._preview({ type: 'website', url }, Hoek.nextTick(callback));
    }

    _describe(url, callback) {

        let req = null;
        const jar = {};

        const setup = {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.2661.102 Safari/537.36'
            },
            redirects: 5,
            redirect303: true,
            redirected: (statusCode, location, redirectionReq) => {

                req = redirectionReq;
            },
            beforeRedirect: (method, code, location, resHeaders, redirectOptions, next) => {

                const formatCookies = () => {

                    let header = '';
                    Object.keys(jar).forEach((name) => {

                        header +=  `${header ? '; ' : ''}${name}=${jar[name]}`;
                    });

                    redirectOptions.headers = redirectOptions.headers || {};
                    redirectOptions.headers.cookie = header;
                    return next();
                };

                const cookies = resHeaders['set-cookie'];
                if (!cookies) {
                    return formatCookies();
                }

                cookies.forEach((cookie) => {

                    const parts = cookie.split(';', 1)[0].split('=', 2);
                    jar[parts[0]] = parts[1];
                    return formatCookies();
                });
            }
        };

        req = Wreck.request('GET', url, setup, (err, res) => {

            if (err ||
                res.statusCode !== 200 ||
                !res.headers['content-type']) {

                req.abort();

                if (this.settings.router) {
                    Oembed.describe(url, null, this.settings, (oembed) => {

                        const description = { type: 'website', url };
                        internals.fill(description, oembed, ['site_name', 'thumbnail', 'embed'], 'oembed');
                        return this._preview(description, callback);
                    });

                    return;
                }

                return this._preview({ type: 'website', url }, callback);
            }

            const type = Content.type(res.headers['content-type']);
            if (type.isBoom) {
                return this._preview({ type: 'website', url }, callback);
            }

            if (type.mime === 'text/html') {
                Wreck.read(res, {}, (err, payload) => {

                    if (err) {
                        return this._preview({ type: 'website', url }, callback);
                    }

                    return exports.parse(payload.toString(), url, this.settings, (description) => this._preview(description, callback));
                });

                return;
            }

            req.abort();

            if (type.mime.match(/^image\/\w+$/)) {
                const description = {
                    type: 'website',
                    url,
                    site_name: 'Image',
                    embed: {
                        type: 'photo',
                        url
                    },
                    sources: ['resource']
                };

                const contentLength = res.headers['content-length'];
                if (contentLength) {
                    description.embed.size = parseInt(contentLength, 10);
                }

                return this._preview(description, callback);
            }

            return this._preview({ type: 'website', url }, callback);
        });
    }

    _preview(description, callback) {

        if (!description.site_name) {
            const uri = Url.parse(description.url);
            const parts = uri.hostname.split('.');
            description.site_name = (parts.length >= 2 && parts[parts.length - 1] === 'com' ? parts[parts.length - 2].replace(/^\w/, ($0) => $0.toUpperCase()) : uri.hostname);
        }

        if (!this.settings.preview &&
            !this.settings.summary &&
            !this.settings.tweet) {

            return callback(description);
        }

        internals.sizes(description, () => {

            description.summary = internals.summary(description, this.settings);

            const preview = (next) => {

                if (!this.settings.preview) {
                    return next();
                }

                this.settings.preview(description, this.settings, (result) => {

                    if (result) {
                        description.preview = result;
                    }

                    return next();
                });
            };

            const tweet = (next) => {

                if (!this.settings.tweet) {
                    return next();
                }

                Twitter.tweet(description, (result) => {

                    if (result) {
                        description.tweet = result;
                    }

                    return next();
                });
            };

            Items.parallel.execute([preview, tweet], (errIgnore, result) => {

                if (!this.settings.summary) {
                    delete description.summary;
                }

                return callback(description);
            });
        });
    }
};


exports.parse = function (document, url, options, next) {

    Tags.parse(document, url, (tags, oembedLink) => {

        // Parse tags

        const description = Ogp.describe(tags.og);          // Use Open Graph as base
        const twitter = Twitter.describe(tags.twitter);

        // Obtain and parse OEmbed description

        Oembed.describe(url, oembedLink, options, (oembed) => {

            // Combine descriptions

            description.url = tags.canonical || description.url || oembed.url || url;

            internals.fill(description, oembed, ['site_name'], 'oembed');
            internals.fill(description, twitter, ['description', 'title', 'image'], 'twitter');
            internals.fill(description, tags.meta, ['description', 'author', 'icon', 'avatar'], 'resource');

            Utils.copy(oembed, description, ['thumbnail', 'embed'], 'oembed');
            Utils.copy(twitter, description, ['app', 'player', 'twitter'], 'twitter');

            if (description.sources.length) {
                description.sources = Hoek.unique(description.sources);
            }
            else {
                delete description.sources;
            }

            return next(description);
        });
    });
};


internals.fill = function (description, from, fields, source) {

    let used = false;
    fields.forEach((field) => {

        if (!description[field] &&
            from[field]) {

            description[field] = from[field];
            used = true;
        }
    });

    if (used) {
        description.sources = description.sources || [];
        description.sources.push(source);
    }
};


internals.summary = function (description, options) {

    const summary = {
        url: (options.redirect ? `${options.redirect}${encodeURIComponent(description.url)}` : description.url),
        title: description.title || description.url,
        description: description.description,
        icon: description.icon ? description.icon.smallest : undefined
    };

    if (description.site_name !== 'Image') {
        summary.site = description.site_name;
    }

    const image = internals.image(description, options);
    if (image) {
        summary.image = image;
    }

    return summary;
};


internals.preview = function (description, options, callback) {

    const summary = description.summary;
    const html = `
        <!DOCTYPE html>
        <html>
            <head>
                ${description.title ? '<title>' + description.title + '</title>' : ''}
                ${options.css ? '<link rel="stylesheet" href="' + options.css + '">' : ''}
                ${options.script ? '<script type="text/javascript" charset="utf-8" src="' + options.script + '"></script>' : ''}
            </head>
            <body>
                <div class='metaphor-embed${description.site_name === 'Image' ? ' metaphor-embed-image-embed' : ''}'>
                    <div class='metaphor-embed-header'>
                        ${summary.icon ? '<img class="metaphor-embed-header-icon" src="' + summary.icon + '"/>' : '<div class="metaphor-embed-header-icon-missing"></div>'}
                        ${summary.site ? '<div class="metaphor-embed-header-site">' + summary.site + '</div>' : ''}
                        <a class="metaphor-embed-header-link" href="${summary.url}" target="_blank">
                            <div class="metaphor-embed-header-title">${summary.title}</div>
                        </a>
                    </div>
                    <div class='metaphor-embed-body ${!!summary.description ? 'has-description' : 'no-description'} ${!!summary.image ? 'has-image' : 'no-image'}'>
                        <div class="metaphor-embed-body-description">
                            ${summary.description || ''}
                        </div>
                        ${summary.image ? '<div class="metaphor-embed-body-image-wrapper"><img class="metaphor-embed-body-image" src="' + summary.image + '"/></div>' : '<div class="metaphor-embed-body-image-missing"></div>'}
                    </div>
                </div>
            </body>
        </html>`;

    return callback(html.replace(/\n\s+/g, ''));
};


internals.image = function (description, options) {

    const images = internals.images(description);
    if (!images.length) {
        return '';
    }

    if (!options.maxSize) {
        return images[0].url;
    }

    for (let i = 0; i < images.length; ++i) {
        const image = images[i];
        if (image.size &&
            image.size <= options.maxSize) {

            return image.url;
        }
    }

    return '';
};


internals.images = function (description) {

    let images = [];

    if (description.thumbnail) {
        images.push(description.thumbnail);
    }

    if (description.embed &&
        description.embed.type === 'photo') {

        images.push(description.embed);
    }

    if (description.image) {
        images = images.concat(description.image);
    }

    return images;
};


internals.sizes = function (description, callback) {

    const each = (image, next) => {

        if (image.size) {
            return next();
        }

        Wreck.request('HEAD', image.url, {}, (err, res) => {

            if (err) {
                return next();
            }

            const contentLength = res.headers['content-length'];
            if (contentLength) {
                image.size = parseInt(contentLength, 10);
            }

            Wreck.read(res, null, next);        // Flush out any payload
        });
    };

    const images = internals.images(description);
    Items.parallel(images, each, callback);
};
