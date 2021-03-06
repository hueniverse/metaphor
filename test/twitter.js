'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Metaphor = require('..');
const Wreck = require('wreck');
const Twitter = require('../lib/twitter');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Twitter', () => {

    describe('describe()', () => {

        it('handles Twitter account id value', (done) => {

            const html = `<html>
            <head>
                <meta name="twitter:card" value="summary" />
                <meta name="twitter:site" value="@nytimes" />
                <meta property="twitter:url" content="http://www.nytimes.com/2016/05/27/us/politics/house-budget-gay-rights-paul-ryan.html" />
                <meta property="twitter:title" content="G.O.P. Opposition to Gay Rights Provision Derails Spending Bill" />
                <meta property="twitter:description" content="The House energy and water bill failed after conservatives voted against their own legislation rather than acquiesce to a bipartisan amendment." />
                <meta name="twitter:creator:id" value="261289053" />
                <meta name="twitter:app:name:unknown" content="NYTimes" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'https://example.com', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://example.com',
                    type: 'website',
                    description: 'The House energy and water bill failed after conservatives voted against their own legislation rather than acquiesce to a bipartisan amendment.',
                    title: 'G.O.P. Opposition to Gay Rights Provision Derails Spending Bill',
                    twitter: {
                        site_username: '@nytimes',
                        creator_id: '261289053'
                    },
                    sources: ['twitter']
                });

                done();
            });
        });

        it('handles missing image url', (done) => {

            const html = `<html>
            <head>
                <meta name="twitter:card" value="summary" />
                <meta name="twitter:site" value="@nytimes" />
                <meta property="twitter:url" content="http://www.nytimes.com/2016/05/27/us/politics/house-budget-gay-rights-paul-ryan.html" />
                <meta property="twitter:image:alt" content="something else" />
                <meta property="twitter:image:height" content="ignore" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'https://example.com', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://example.com',
                    type: 'website',
                    twitter: {
                        site_username: '@nytimes'
                    },
                    sources: ['twitter']
                });

                done();
            });
        });

        it('ignores unknown app', (done) => {

            const html = `<html>
            <head>
                <meta name="twitter:card" value="summary" />
                <meta name="twitter:site" value="@nytimes" />
                <meta property="twitter:url" content="http://www.nytimes.com/2016/05/27/us/politics/house-budget-gay-rights-paul-ryan.html" />
                <meta property="twitter:title" content="G.O.P. Opposition to Gay Rights Provision Derails Spending Bill" />
                <meta property="twitter:description" content="The House energy and water bill failed after conservatives voted against their own legislation rather than acquiesce to a bipartisan amendment." />
                <meta name="twitter:app:name:unknown" content="NYTimes" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'https://example.com', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://example.com',
                    type: 'website',
                    description: 'The House energy and water bill failed after conservatives voted against their own legislation rather than acquiesce to a bipartisan amendment.',
                    title: 'G.O.P. Opposition to Gay Rights Provision Derails Spending Bill',
                    twitter: { site_username: '@nytimes' },
                    sources: ['twitter']
                });

                done();
            });
        });

        it('ignores missing app sub key', (done) => {

            const html = `<html>
            <head>
                <meta name="twitter:card" value="summary" />
                <meta name="twitter:site" value="@nytimes" />
                <meta property="twitter:url" content="http://www.nytimes.com/2016/05/27/us/politics/house-budget-gay-rights-paul-ryan.html" />
                <meta property="twitter:title" content="G.O.P. Opposition to Gay Rights Provision Derails Spending Bill" />
                <meta property="twitter:description" content="The House energy and water bill failed after conservatives voted against their own legislation rather than acquiesce to a bipartisan amendment." />
                <meta name="twitter:app" content="NYTimes" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'https://example.com', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://example.com',
                    type: 'website',
                    description: 'The House energy and water bill failed after conservatives voted against their own legislation rather than acquiesce to a bipartisan amendment.',
                    title: 'G.O.P. Opposition to Gay Rights Provision Derails Spending Bill',
                    twitter: { site_username: '@nytimes' },
                    sources: ['twitter']
                });

                done();
            });
        });
    });

    describe('tweet()', () => {

        it('describes a tweet with image', (done) => {

            const engine = new Metaphor.Engine({ tweet: true });
            engine.describe('https://twitter.com/ardnahoe/status/892833709438754816', (description) => {

                expect(description).to.equal({
                    type: 'article',
                    url: 'https://twitter.com/ardnahoe/status/892833709438754816',
                    title: 'Ardnahoe Distillery on Twitter',
                    image: {
                        url: 'https://pbs.twimg.com/media/DGP7fj7XUAE5aZE.jpg:large',
                        size: 273453
                    },
                    description: '\u201cA misty but peaceful evening at Loch Ardnahoe tonight. #Islay\u201d',
                    site_name: 'Twitter',
                    sources: ['ogp', 'resource', 'oembed'],
                    icon: {
                        any: 'https://abs.twimg.com/favicons/favicon.ico',
                        smallest: 'https://abs.twimg.com/favicons/favicon.ico'
                    },
                    avatar: 'https://pbs.twimg.com/profile_images/836605178744832001/iNcUgrE-_400x400.jpg',
                    embed: {
                        type: 'rich',
                        width: 550,
                        url: 'https://twitter.com/ardnahoe/status/892833709438754816',
                        html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">A misty but peaceful evening at Loch Ardnahoe tonight. <a href="https://twitter.com/hashtag/Islay?src=hash">#Islay</a> <a href="https://t.co/HXc38uYxa0">pic.twitter.com/HXc38uYxa0</a></p>&mdash; Ardnahoe Distillery (@ardnahoe) <a href="https://twitter.com/ardnahoe/status/892833709438754816">August 2, 2017</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
                    },
                    preview: '<!DOCTYPE html><html><head><title>Ardnahoe Distillery on Twitter</title></head><body><div class=\'metaphor-embed\'><div class=\'metaphor-embed-header\'><img class="metaphor-embed-header-icon" src="https://abs.twimg.com/favicons/favicon.ico"/><div class="metaphor-embed-header-site">Twitter</div><a class="metaphor-embed-header-link" href="https://twitter.com/ardnahoe/status/892833709438754816" target="_blank"><div class="metaphor-embed-header-title">Ardnahoe Distillery on Twitter</div></a></div><div class=\'metaphor-embed-body has-description has-image\'><div class="metaphor-embed-body-description">\u201cA misty but peaceful evening at Loch Ardnahoe tonight. #Islay\u201d</div><div class="metaphor-embed-body-image-wrapper"><img class="metaphor-embed-body-image" src="https://pbs.twimg.com/media/DGP7fj7XUAE5aZE.jpg:large"/></div></div></div></body></html>',
                    tweet: {
                        name: 'Ardnahoe Distillery',
                        username: 'ardnahoe',
                        content: 'A misty but peaceful evening at Loch Ardnahoe tonight. #Islay pic.twitter.com/HXc38uYxa0',
                        date: 'August 2, 2017',
                        links: {},
                        avatar: 'https://pbs.twimg.com/profile_images/836605178744832001/iNcUgrE-_400x400.jpg',
                        image: 'https://pbs.twimg.com/media/DGP7fj7XUAE5aZE.jpg:large'
                    }
                });

                done();
            });
        });

        it('describes a tweet with new lines', (done) => {

            const engine = new Metaphor.Engine({ tweet: true });
            engine.describe('https://twitter.com/LagavulinWhisky/status/769958225571557376', (description) => {

                expect(description).to.equal({
                    type: 'article',
                    url: 'https://twitter.com/LagavulinWhisky/status/769958225571557376',
                    title: 'Lagavulin on Twitter',
                    image: {
                        url: 'https://pbs.twimg.com/profile_images/855018870419189760/MWCzc21G_400x400.jpg',
                        size: description.image.size
                    },
                    description: '\u201cThe Islay Jazz festival will take place from the 9th - 11th September this year!\n\nTickets: https://t.co/XmgYyXnWrg #Lagavulin200 #LagaJazz\u201d',
                    site_name: 'Twitter',
                    sources: ['ogp', 'resource', 'oembed'],
                    icon: {
                        any: 'https://abs.twimg.com/favicons/favicon.ico',
                        smallest: 'https://abs.twimg.com/favicons/favicon.ico'
                    },
                    avatar: 'https://pbs.twimg.com/profile_images/855018870419189760/MWCzc21G_400x400.jpg',
                    embed: {
                        type: 'rich',
                        width: 550,
                        url: 'https://twitter.com/LagavulinWhisky/status/769958225571557376',
                        html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">The Islay Jazz festival will take place from the 9th - 11th September this year!<br><br>Tickets: <a href="https://t.co/XmgYyXnWrg">https://t.co/XmgYyXnWrg</a> <a href="https://twitter.com/hashtag/Lagavulin200?src=hash">#Lagavulin200</a> <a href="https://twitter.com/hashtag/LagaJazz?src=hash">#LagaJazz</a></p>&mdash; Lagavulin (@LagavulinWhisky) <a href="https://twitter.com/LagavulinWhisky/status/769958225571557376">August 28, 2016</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
                    },
                    preview: '<!DOCTYPE html><html><head><title>Lagavulin on Twitter</title></head><body><div class=\'metaphor-embed\'><div class=\'metaphor-embed-header\'><img class="metaphor-embed-header-icon" src="https://abs.twimg.com/favicons/favicon.ico"/><div class="metaphor-embed-header-site">Twitter</div><a class="metaphor-embed-header-link" href="https://twitter.com/LagavulinWhisky/status/769958225571557376" target="_blank"><div class="metaphor-embed-header-title">Lagavulin on Twitter</div></a></div><div class=\'metaphor-embed-body has-description has-image\'><div class="metaphor-embed-body-description">\u201cThe Islay Jazz festival will take place from the 9th - 11th September this year!Tickets: https://t.co/XmgYyXnWrg #Lagavulin200 #LagaJazz\u201d</div><div class="metaphor-embed-body-image-wrapper"><img class="metaphor-embed-body-image" src="https://pbs.twimg.com/profile_images/855018870419189760/MWCzc21G_400x400.jpg"/></div></div></div></body></html>',
                    tweet: {
                        name: 'Lagavulin',
                        username: 'LagavulinWhisky',
                        content: 'The Islay Jazz festival will take place from the 9th - 11th September this year!\n\nTickets: http://www.islayjazzfestival.co.uk/programme.html #Lagavulin200 #LagaJazz',
                        date: 'August 28, 2016',
                        links: { 'http://www.islayjazzfestival.co.uk/programme.html': 'https://t.co/XmgYyXnWrg' },
                        avatar: 'https://pbs.twimg.com/profile_images/855018870419189760/MWCzc21G_400x400.jpg'
                    }
                });

                done();
            });
        });

        it('ignores documents without embed', (done) => {

            Twitter.tweet({ url: 'https://twitter.com/sideway/status/626158822705401856' }, (result) => {

                expect(result).to.not.exist();
                done();
            });
        });

        it('ignores documents with invalid embed html', (done) => {

            Twitter.tweet({ url: 'https://twitter.com/sideway/status/626158822705401856', embed: { html: 'something' } }, (result) => {

                expect(result).to.not.exist();
                done();
            });
        });

        it('parses message without links', (done) => {

            const description = {
                url: 'https://twitter.com/sideway/status/626158822705401856',
                embed: {
                    html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">First &amp; steps</p>&mdash; Sideway (@sideway) <a href="https://twitter.com/sideway/status/626158822705401856">July 28, 2015</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
                }
            };

            Twitter.tweet(description, (result) => {

                expect(result).to.equal({
                    name: 'Sideway',
                    username: 'sideway',
                    content: 'First & steps',
                    date: 'July 28, 2015',
                    links: {}
                });

                done();
            });
        });

        it('uses image for avatar', (done) => {

            const description = {
                url: 'https://twitter.com/sideway/status/626158822705401856',
                embed: {
                    html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">First &amp; steps</p>&mdash; Sideway (@sideway) <a href="https://twitter.com/sideway/status/626158822705401856">July 28, 2015</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
                },
                image: {
                    url: 'https://example.com/image'
                }
            };

            Twitter.tweet(description, (result) => {

                expect(result).to.equal({
                    name: 'Sideway',
                    username: 'sideway',
                    avatar: 'https://example.com/image',
                    content: 'First & steps',
                    date: 'July 28, 2015',
                    links: {}
                });

                done();
            });
        });

        it('skips image for avatar', (done) => {

            const description = {
                url: 'https://twitter.com/sideway/status/626158822705401856',
                embed: {
                    html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">First &amp; steps</p>&mdash; Sideway (@sideway) <a href="https://twitter.com/sideway/status/626158822705401856">July 28, 2015</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
                },
                image: {}
            };

            Twitter.tweet(description, (result) => {

                expect(result).to.equal({
                    name: 'Sideway',
                    username: 'sideway',
                    avatar: 'https://example.com/image',
                    content: 'First & steps',
                    date: 'July 28, 2015',
                    links: {}
                });

                done();
            });
        });

        it('parses message with multiple links', (done) => {

            const description = {
                url: 'https://twitter.com/sideway/status/626158822705401856',
                embed: {
                    html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">First &amp; steps <a href="https://t.co/XvSn7XSI2G">https://t.co/XvSn7XSI2G</a> <a href="https://example.com">https://example.com</a> <a href="https://t.co/">https://t.co/</a></p>&mdash; Sideway (@sideway) <a href="https://twitter.com/sideway/status/626158822705401856">July 28, 2015</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
                }
            };

            Twitter.tweet(description, (result) => {

                expect(result).to.equal({
                    name: 'Sideway',
                    username: 'sideway',
                    content: 'First & steps https://sideway.com https://example.com https://t.co/',
                    date: 'July 28, 2015',
                    links: {
                        'https://sideway.com': 'https://t.co/XvSn7XSI2G'
                    }
                });

                done();
            });
        });
    });

    describe('long()', () => {

        it('handles request error', { parallel: false }, (done) => {

            const description = {
                url: 'https://twitter.com/sideway/status/626158822705401856',
                embed: {
                    html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">First &amp; steps <a href="https://t.co/XvSn7XSI2G">https://t.co/XvSn7XSI2G</a></p>&mdash; Sideway (@sideway) <a href="https://twitter.com/sideway/status/626158822705401856">July 28, 2015</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
                }
            };

            const orig = Wreck.request;
            Wreck.request = (method, url, options, next) => next(new Error());

            Twitter.tweet(description, (result) => {

                Wreck.request = orig;

                expect(result).to.equal({
                    name: 'Sideway',
                    username: 'sideway',
                    content: 'First & steps https://t.co/XvSn7XSI2G',
                    date: 'July 28, 2015',
                    links: {}
                });

                done();
            });
        });
    });
});
