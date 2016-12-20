'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Metaphor = require('..');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('Metaphor', () => {

    describe('parse()', () => {

        it('ignores tags in scripts and body', (done) => {

            const html = `<html prefix="og: http://ogp.me/ns#">
            <head>
                <title>The Rock (1996)</title>
                <meta property="og:title" content="The Rock" />
                <meta property="og:type" content="video.movie" />
                <script><meta property="og:image" content="ignore2" /></script>
                <meta property="og:url" content="http://www.imdb.com/title/tt0117500/" />
                <meta property="og:image" content="http://ia.media-imdb.com/images/rock.jpg" />
            </head>
            <body>
                <meta property="og:image" content="ignore2" />
            </body>
            </html>`;

            Metaphor.parse(html, 'http://www.imdb.com/title/tt0117500/', {}, (description) => {

                expect(description).to.equal({
                    title: 'The Rock',
                    type: 'video.movie',
                    url: 'http://www.imdb.com/title/tt0117500/',
                    image: { url: 'http://ia.media-imdb.com/images/rock.jpg' },
                    sources: ['ogp']
                });

                done();
            });
        });

        it('handles name/value attributes', (done) => {

            const html = `<html prefix="og: http://ogp.me/ns#">
            <head>
                <title>The Rock (1996)</title>
                <meta name="og:title" value="The Rock" />
                <meta name="og:type" value="video.movie" />
                <meta name="og:url" value="http://www.imdb.com/title/tt0117500/" />
                <meta name="og:image" value="http://ia.media-imdb.com/images/rock.jpg" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'http://www.imdb.com/title/tt0117500/', {}, (description) => {

                expect(description).to.equal({
                    title: 'The Rock',
                    type: 'video.movie',
                    url: 'http://www.imdb.com/title/tt0117500/',
                    image: { url: 'http://ia.media-imdb.com/images/rock.jpg' },
                    sources: ['ogp']
                });

                done();
            });
        });

        it('handles missing icon link href attributes', (done) => {

            const html = `<html prefix="og: http://ogp.me/ns#">
            <head>
                <title>The Rock (1996) </title>
                <link rel="icon" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'http://www.imdb.com/title/tt0117500/', {}, (description) => {

                expect(description).to.equal({
                    type: 'website',
                    url: 'http://www.imdb.com/title/tt0117500/'
                });

                done();
            });
        });

        it('sets default icon link sizes attribute', (done) => {

            const html = `<html prefix="og: http://ogp.me/ns#">
            <head>
                <title>The Rock (1996) </title>
                <link rel="icon" href="http://example.com" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'http://www.imdb.com/title/tt0117500/', {}, (description) => {

                expect(description).to.equal({
                    type: 'website',
                    url: 'http://www.imdb.com/title/tt0117500/',
                    icon: { any: 'http://example.com/', smallest: 'http://example.com/' },
                    sources: ['resource']
                });

                done();
            });
        });

        it('sets any icon link sizes attribute', (done) => {

            const html = `<html prefix="og: http://ogp.me/ns#">
            <head>
                <title>The Rock (1996) </title>
                <link rel="icon" href="http://example.com" sizes="any" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'http://www.imdb.com/title/tt0117500/', {}, (description) => {

                expect(description).to.equal({
                    type: 'website',
                    url: 'http://www.imdb.com/title/tt0117500/',
                    icon: { any: 'http://example.com/', smallest: 'http://example.com/' },
                    sources: ['resource']
                });

                done();
            });
        });

        it('ignores second icon link with same size', (done) => {

            const html = `<html prefix="og: http://ogp.me/ns#">
            <head>
                <title>The Rock (1996) </title>
                <link rel="icon" href="http://example.com" sizes="any" />
                <link rel="icon" href="http://example.com2" sizes="any" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'http://www.imdb.com/title/tt0117500/', {}, (description) => {

                expect(description).to.equal({
                    type: 'website',
                    url: 'http://www.imdb.com/title/tt0117500/',
                    icon: { any: 'http://example.com/', smallest: 'http://example.com/' },
                    sources: ['resource']
                });

                done();
            });
        });

        it('ignores uses canonical url over others', (done) => {

            const html = `<html prefix="og: http://ogp.me/ns#">
            <head>
                <title>The Rock (1996) </title>
                <link rel="canonical" href="http://www.imdb.com/title/tt0117500/canonical" />
                <meta property="og:url" content="http://www.imdb.com/title/tt0117500/" />
            </head>
            <body>
            </body>
            </html>`;

            Metaphor.parse(html, 'http://www.imdb.com/title/tt0117500/', {}, (description) => {

                expect(description).to.equal({
                    type: 'website',
                    url: 'http://www.imdb.com/title/tt0117500/canonical',
                    sources: ['resource']
                });

                done();
            });
        });
    });
});
