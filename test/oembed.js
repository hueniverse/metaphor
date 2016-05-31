'use strict';

// Load modules

const Code = require('code');
const Lab = require('lab');
const Metaphor = require('..');
const Wreck = require('wreck');
const Providers = require('../providers.json');


// Declare internals

const internals = {};


// Test shortcuts

const lab = exports.lab = Lab.script();
const describe = lab.describe;
const it = lab.it;
const expect = Code.expect;


describe('OEmbed', () => {

    describe('describe()', () => {

        it('ignores invalid oembed response (request error)', { parallel: false }, (done) => {

            const html = `<html>
            <head>
                <link rel="alternate" type="application/json+oembed" href="https://publish.twitter.com/oembed?url=https://twitter.com/dalmaer/status/726624422237364226" title="Dion Almaer on Twitter: &quot;Maybe agile doesn&#39;t scale and that&#39;s ok https://t.co/DwrWCnCU38&quot;">
            </head>
            </html>`;

            const orig = Wreck.get;
            Wreck.get = (url, options, next) => {

                Wreck.get = orig;
                next(null, { statusCode: 400 }, '');
            };

            Metaphor.parse(html, 'https://twitter.com/dalmaer/status/726624422237364226', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://twitter.com/dalmaer/status/726624422237364226',
                    type: 'website'
                });

                done();
            });
        });

        it('ignores invalid oembed response (network error)', { parallel: false }, (done) => {

            const html = `<html>
            <head>
                <link rel="alternate" type="application/json+oembed" href="https://publish.twitter.com/oembed?url=https://twitter.com/dalmaer/status/726624422237364226" title="Dion Almaer on Twitter: &quot;Maybe agile doesn&#39;t scale and that&#39;s ok https://t.co/DwrWCnCU38&quot;">
            </head>
            </html>`;

            const orig = Wreck.get;
            Wreck.get = (url, options, next) => {

                Wreck.get = orig;
                next(new Error('Cannot reach host'));
            };

            Metaphor.parse(html, 'https://twitter.com/dalmaer/status/726624422237364226', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://twitter.com/dalmaer/status/726624422237364226',
                    type: 'website'
                });

                done();
            });
        });

        it('ignores invalid oembed response (wrong version)', { parallel: false }, (done) => {

            const html = `<html>
            <head>
                <link rel="alternate" type="application/json+oembed" href="https://publish.twitter.com/oembed?url=https://twitter.com/dalmaer/status/726624422237364226" title="Dion Almaer on Twitter: &quot;Maybe agile doesn&#39;t scale and that&#39;s ok https://t.co/DwrWCnCU38&quot;">
            </head>
            </html>`;

            const oembed = {
                type: 'link',
                version: '2.0',
                url: 'https://twitter.com/dalmaer/status/726624422237364226',
                provider_name: 'Twitter'
            };

            const orig = Wreck.get;
            Wreck.get = (url, options, next) => {

                Wreck.get = orig;
                next(null, { statusCode: 200 }, JSON.stringify(oembed));
            };

            Metaphor.parse(html, 'https://twitter.com/dalmaer/status/726624422237364226', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://twitter.com/dalmaer/status/726624422237364226',
                    type: 'website'
                });

                done();
            });
        });

        it('ignores invalid oembed response (invalid payload)', { parallel: false }, (done) => {

            const html = `<html>
            <head>
                <link rel="alternate" type="application/json+oembed" href="https://publish.twitter.com/oembed?url=https://twitter.com/dalmaer/status/726624422237364226" title="Dion Almaer on Twitter: &quot;Maybe agile doesn&#39;t scale and that&#39;s ok https://t.co/DwrWCnCU38&quot;">
            </head>
            </html>`;

            const orig = Wreck.get;
            Wreck.get = (url, options, next) => {

                Wreck.get = orig;
                next(null, { statusCode: 200 }, '{');
            };

            Metaphor.parse(html, 'https://twitter.com/dalmaer/status/726624422237364226', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://twitter.com/dalmaer/status/726624422237364226',
                    type: 'website'
                });

                done();
            });
        });
    });

    describe('match()', () => {

        it('returns a full service endpoint', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const resource = 'http://nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html';
            const url = router.match(resource);
            expect(url).to.equal(`https://www.nytimes.com/svc/oembed/json/?url=${encodeURIComponent(resource)}&format=json`);
            done();
        });

        it('returns a full service endpoint (options)', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const resource = 'http://nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html';
            const url = router.match(resource, { maxWidth: 250, maxHeight: 120 });
            expect(url).to.equal(`https://www.nytimes.com/svc/oembed/json/?url=${encodeURIComponent(resource)}&format=json&maxheight=120&maxwidth=250`);
            done();
        });

        it('returns a null on mismatching url', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const resource = 'http://example.com';
            const url = router.match(resource, { maxWidth: 250, maxHeight: 120 });
            expect(url).to.be.null();
            done();
        });
    });

    describe('lookup()', () => {

        it('parses oembed.com providers json file', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const url = router.lookup('http://nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html');
            expect(url).to.equal('https://www.nytimes.com/svc/oembed/json/');
            done();
        });

        it('matches resource (www)', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const url = router.lookup('http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html');
            expect(url).to.equal('https://www.nytimes.com/svc/oembed/json/');
            done();
        });

        it('matches resource (wildcard)', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const url = router.lookup('http://hammer-family.smugmug.com/Scotch/Bruichladdich/i-LLqFWHM');
            expect(url).to.equal('http://api.smugmug.com/services/oembed/');
            done();
        });

        it('matches resource (path)', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const url = router.lookup('https://photos.app.net/z/y');
            expect(url).to.equal('https://alpha-api.app.net/oembed');
            done();
        });

        it('fails to find a match (path)', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const url = router.lookup('https://alpha.app.net/z/y');
            expect(url).to.be.null();
            done();
        });

        it('fails to find a match (short)', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const url = router.lookup('http://streamonecloud.net/embed/x');
            expect(url).to.be.null();
            done();
        });

        it('fails to find a match (long)', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const url = router.lookup('http://x.content.streamonecloud.net/embed/x');
            expect(url).to.be.null();
            done();
        });

        it('fails to find a match (longer)', (done) => {

            const router = Metaphor.oembed.providers(Providers);
            const url = router.lookup('http://y.x.content.streamonecloud.net/embed/x');
            expect(url).to.be.null();
            done();
        });

        it('ignores invalid endpoint scheme', (done) => {

            const router = Metaphor.oembed.providers([
                {
                    provider_name: 'Test provider',
                    provider_url: 'https:\/\/example.com\/',
                    endpoints: [
                        {
                            schemes: ['ftp:\/\/example.com\/*\/post\/*'],
                            url: 'https:\/\/example.com\/oembed'
                        }
                    ]
                }
            ]);

            expect(router._domains.subs).to.be.empty();
            done();
        });
    });
});
