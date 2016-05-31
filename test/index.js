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


describe('Metaphor', () => {

    describe('Engine', () => {

        describe('describe()', () => {

            it('describes a NY Times article', (done) => {

                const engine = new Metaphor.Engine();
                const resource = 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html';
                engine.describe(resource, (description) => {

                    expect(description).to.equal({
                        type: 'website',
                        url: 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html',
                        site_name: 'The New York Times',
                        thumbnail: {
                            url: 'https://static01.nyt.com/images/2016/05/29/world/JP-FASCISM1/JP-FASCISM1-mediumThreeByTwo440.jpg',
                            width: 440,
                            height: 293
                        },
                        embed: {
                            type: 'rich',
                            height: 550,
                            width: 300,
                            url: 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html',
                            html: '<iframe src="https://www.nytimes.com/svc/oembed/html/?url=http%3A%2F%2Fwww.nytimes.com%2F2016%2F05%2F29%2Fworld%2Feurope%2Frise-of-donald-trump-tracks-growing-debate-over-global-fascism.html" scrolling="no" frameborder="0" allowtransparency="true" style="border:none;max-width:500px;min-width:300px;min-height:550px;display:block;width:100%;"></iframe>'
                        },
                        sources: ['oembed']
                    });

                    done();
                });
            });

            it('describes a NY Times article (options)', (done) => {

                const engine = new Metaphor.Engine({ maxHeight: 100, maxWidth: 100, providers: Providers });
                const resource = 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html';
                engine.describe(resource, (description) => {

                    expect(description).to.equal({
                        type: 'website',
                        url: 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html',
                        site_name: 'The New York Times',
                        thumbnail: {
                            url: 'https://static01.nyt.com/images/2016/05/29/world/JP-FASCISM1/JP-FASCISM1-mediumThreeByTwo440.jpg',
                            width: 440,
                            height: 293
                        },
                        embed: {
                            type: 'rich',
                            height: 550,
                            width: 300,
                            url: 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html',
                            html: '<iframe src="https://www.nytimes.com/svc/oembed/html/?url=http%3A%2F%2Fwww.nytimes.com%2F2016%2F05%2F29%2Fworld%2Feurope%2Frise-of-donald-trump-tracks-growing-debate-over-global-fascism.html" scrolling="no" frameborder="0" allowtransparency="true" style="border:none;max-width:500px;min-width:300px;min-height:550px;display:block;width:100%;"></iframe>'
                        },
                        sources: ['oembed']
                    });

                    done();
                });
            });

            it('skips using a providers list', (done) => {

                const engine = new Metaphor.Engine({ providers: false });
                const resource = 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html';
                engine.describe(resource, (description) => {

                    expect(description).to.equal({
                        type: 'website',
                        url: 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html'
                    });

                    done();
                });
            });

            it('describes a NY Times article (whitelisted)', (done) => {

                const engine = new Metaphor.Engine({ whitelist: ['https://www.nytimes.com/*'] });
                const resource = 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html';
                engine.describe(resource, (description) => {

                    expect(description).to.equal({
                        type: 'website',
                        url: 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html',
                        site_name: 'The New York Times',
                        thumbnail: {
                            url: 'https://static01.nyt.com/images/2016/05/29/world/JP-FASCISM1/JP-FASCISM1-mediumThreeByTwo440.jpg',
                            width: 440,
                            height: 293
                        },
                        embed: {
                            type: 'rich',
                            height: 550,
                            width: 300,
                            url: 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html',
                            html: '<iframe src="https://www.nytimes.com/svc/oembed/html/?url=http%3A%2F%2Fwww.nytimes.com%2F2016%2F05%2F29%2Fworld%2Feurope%2Frise-of-donald-trump-tracks-growing-debate-over-global-fascism.html" scrolling="no" frameborder="0" allowtransparency="true" style="border:none;max-width:500px;min-width:300px;min-height:550px;display:block;width:100%;"></iframe>'
                        },
                        sources: ['oembed']
                    });

                    done();
                });
            });

            it('block when non whitelisted', (done) => {

                const engine = new Metaphor.Engine({ whitelist: ['https://example.com/*'] });
                const resource = 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html';
                engine.describe(resource, (description) => {

                    expect(description).to.equal({
                        type: 'website',
                        url: 'http://www.nytimes.com/2016/05/29/world/europe/rise-of-donald-trump-tracks-growing-debate-over-global-fascism.html'
                    });

                    done();
                });
            });
        });
    });

    describe('describe()', () => {

        it('describes a tweet', (done) => {

            Metaphor.describe('https://twitter.com/sideway/status/626158822705401856', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://twitter.com/sideway/status/626158822705401856',
                    type: 'article',
                    title: 'Sideway on Twitter',
                    image: { url: 'https://pbs.twimg.com/profile_images/733727309962838016/t8DzeKUZ_400x400.jpg' },
                    description: '\u201cFirst steps https://t.co/XvSn7XSI2G\u201d',
                    site_name: 'Twitter',
                    embed: {
                        url: 'https://twitter.com/sideway/status/626158822705401856',
                        html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">First steps <a href="https://t.co/XvSn7XSI2G">https://t.co/XvSn7XSI2G</a></p>&mdash; Sideway (@sideway) <a href="https://twitter.com/sideway/status/626158822705401856">July 28, 2015</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>',
                        width: 550,
                        type: 'rich'
                    },
                    sources: ['ogp', 'oembed']
                });

                done();
            });
        });

        it('describes a flickr photo', (done) => {

            Metaphor.describe('https://www.flickr.com/photos/kent-macdonald/19455364653/', { maxWidth: 400, maxHeight: 200 }, (description) => {

                expect(description).to.equal({
                    site_name: 'Flickr - Photo Sharing!',
                    updated_time: description.updated_time,
                    title: '300/365 "The Lonely Gold Rush"',
                    description: '27.07.15  So this is it, day 300. The real count down begins now I guess.  Also found a pickaxe at my house moment before I even shot this. I seem to have strange and worrisome objects at my house. The first one I was looking for was a spear. And I\'m still in need of another deadly prop for this series. A lot has been said with very few words. Don\'t worry I\'m not a murderer. HOnestly I was searching for the spear first as I had a stronger concept, well it has a stronger meaning to it for me, bur alas I couldn\'t find it in time. I have seince then loaceted it after I\'ve shot this. But time was of the essence.   In other news I\'m planning a new photographic series and have been doing some research and sketching. On the downside I don\'t think I\'ll be shooting any of them until this project is over.',
                    type: 'custom',
                    custom_type: 'flickr_photos:photo',
                    url: 'https://www.flickr.com/photos/kent-macdonald/19455364653/',
                    image: {
                        url: 'https://c1.staticflickr.com/1/259/19455364653_201bdfd31b_b.jpg',
                        width: '1024',
                        height: '576'
                    },
                    thumbnail: {
                        url: 'https://farm1.staticflickr.com/259/19455364653_201bdfd31b_q.jpg',
                        width: 150,
                        height: 150
                    },
                    embed: {
                        type: 'photo',
                        height: 180,
                        width: 320,
                        url: 'https://farm1.staticflickr.com/259/19455364653_201bdfd31b_n.jpg',
                        html: '<a data-flickr-embed="true" href="https://www.flickr.com/photos/kent-macdonald/19455364653/" title="300/365 &quot;The Lonely Gold Rush&quot; by achillesheels, on Flickr"><img src="https://farm1.staticflickr.com/259/19455364653_201bdfd31b_n.jpg" width="320" height="180" alt="300/365 &quot;The Lonely Gold Rush&quot;"></a><script async src="https://embedr.flickr.com/assets/client-code.js" charset="utf-8"></script>'
                    },
                    app: {
                        iphone: {
                            name: 'Flickr',
                            id: '328407587',
                            url: 'flickr://flickr.com/photos/kent-macdonald/19455364653/'
                        }
                    },
                    twitter: { site_username: '@flickr' },
                    sources: ['ogp', 'oembed', 'twitter']
                });

                done();
            });
        });

        it('describes an image', (done) => {

            Metaphor.describe('https://www.sideway.com/sideway.png', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://www.sideway.com/sideway.png',
                    type: 'website',
                    embed: {
                        url: 'https://www.sideway.com/sideway.png',
                        type: 'photo',
                        size: 17014
                    },
                    sources: ['resource']
                });

                done();
            });
        });

        it('describes an article', (done) => {

            Metaphor.describe('http://www.wired.com/2016/05/google-doesnt-owe-oracle-cent-using-java-android-jury-finds/', {}, (description) => {

                expect(description).to.equal({
                    type: 'article',
                    title: 'Google Doesn\u2019t Owe Oracle a Cent for Using Java in Android, Jury Finds',
                    image: {
                        url: 'http://www.wired.com/wp-content/uploads/2016/05/android-1200x630-e1464301027666.jpg',
                        width: '1200',
                        height: '630'
                    },
                    description: 'The verdict could have major implications for the future of software developments.',
                    locale: { primary: 'en_US' },
                    url: 'http://www.wired.com/2016/05/google-doesnt-owe-oracle-cent-using-java-android-jury-finds/',
                    site_name: 'WIRED',
                    thumbnail: {
                        url: 'http://www.wired.com/wp-content/uploads/2016/05/android.jpg',
                        width: 600,
                        height: 450
                    },
                    embed: {
                        type: 'rich',
                        height: 338,
                        width: 600,
                        html: '<blockquote class="wp-embedded-content"><a href="http://www.wired.com/2016/05/google-doesnt-owe-oracle-cent-using-java-android-jury-finds/">Google Doesn&#8217;t Owe Oracle a Cent for Using Java in Android, Jury Finds</a></blockquote>\n<script type=\'text/javascript\'>\n<!--//--><![CDATA[//><!--\n\t\t!function(a,b){"use strict";function c(){if(!e){e=!0;var a,c,d,f,g=-1!==navigator.appVersion.indexOf("MSIE 10"),h=!!navigator.userAgent.match(/Trident.*rv:11\\./),i=b.querySelectorAll("iframe.wp-embedded-content");for(c=0;c<i.length;c++)if(d=i[c],!d.getAttribute("data-secret")){if(f=Math.random().toString(36).substr(2,10),d.src+="#?secret="+f,d.setAttribute("data-secret",f),g||h)a=d.cloneNode(!0),a.removeAttribute("security"),d.parentNode.replaceChild(a,d)}else;}}var d=!1,e=!1;if(b.querySelector)if(a.addEventListener)d=!0;if(a.wp=a.wp||{},!a.wp.receiveEmbedMessage)if(a.wp.receiveEmbedMessage=function(c){var d=c.data;if(d.secret||d.message||d.value)if(!/[^a-zA-Z0-9]/.test(d.secret)){var e,f,g,h,i,j=b.querySelectorAll(\'iframe[data-secret="\'+d.secret+\'"]\'),k=b.querySelectorAll(\'blockquote[data-secret="\'+d.secret+\'"]\');for(e=0;e<k.length;e++)k[e].style.display="none";for(e=0;e<j.length;e++)if(f=j[e],c.source===f.contentWindow){if(f.removeAttribute("style"),"height"===d.message){if(g=parseInt(d.value,10),g>1e3)g=1e3;else if(200>~~g)g=200;f.height=g}if("link"===d.message)if(h=b.createElement("a"),i=b.createElement("a"),h.href=f.getAttribute("src"),i.href=d.value,i.host===h.host)if(b.activeElement===f)a.top.location.href=d.value}else;}},d)a.addEventListener("message",a.wp.receiveEmbedMessage,!1),b.addEventListener("DOMContentLoaded",c,!1),a.addEventListener("load",c,!1)}(window,document);\n//--><!]]>\n</script><iframe sandbox="allow-scripts" security="restricted" src="http://www.wired.com/2016/05/google-doesnt-owe-oracle-cent-using-java-android-jury-finds/embed/" width="600" height="338" title="&#8220;Google Doesn&#8217;t Owe Oracle a Cent for Using Java in Android, Jury Finds&#8221; &#8212; WIRED" frameborder="0" marginwidth="0" marginheight="0" scrolling="no" class="wp-embedded-content"></iframe>'
                    },
                    twitter: {
                        site_username: '@wired',
                        creator_username: '@wired'
                    },
                    sources: ['ogp', 'oembed', 'twitter']
                });

                done();
            });
        });

        it('described a YouTube video', (done) => {

            Metaphor.describe('https://www.youtube.com/watch?v=cWDdd5KKhts', {}, (description) => {

                expect(description).to.equal({
                    site_name: 'YouTube',
                    url: 'https://www.youtube.com/watch?v=cWDdd5KKhts',
                    title: 'Cheese Shop Sketch - Monty Python\'s Flying Circus',
                    image: { url: 'https://i.ytimg.com/vi/cWDdd5KKhts/maxresdefault.jpg' },
                    description: 'Subscribe to the Official Monty Python Channel here - http://smarturl.it/SubscribeToPython Cleese plays an erudite customer attempting to purchase some chees...',
                    type: 'video',
                    video: [
                        {
                            url: 'https://www.youtube.com/embed/cWDdd5KKhts',
                            secure_url: 'https://www.youtube.com/embed/cWDdd5KKhts',
                            type: 'text/html',
                            width: '480',
                            height: '360'
                        },
                        {
                            url: 'http://www.youtube.com/v/cWDdd5KKhts?version=3&autohide=1',
                            secure_url: 'https://www.youtube.com/v/cWDdd5KKhts?version=3&autohide=1',
                            type: 'application/x-shockwave-flash',
                            width: '480',
                            height: '360',
                            tag: ['Monty Python', 'Python (Monty) Pictures Limited', 'Comedy', 'flying circus', 'monty pythons flying circus', 'john cleese', 'micael palin', 'eric idle', 'terry jones', 'graham chapman', 'terry gilliam', 'funny', 'comedy', 'animation', '60s animation', 'humor', 'humour', 'sketch show', 'british comedy', 'cheese shop', 'monty python cheese', 'cheese shop sketch', 'cleese cheese', 'cheese']
                        }
                    ],
                    thumbnail: {
                        url: 'https://i.ytimg.com/vi/cWDdd5KKhts/hqdefault.jpg',
                        width: 480,
                        height: 360
                    },
                    embed: {
                        type: 'video',
                        height: 344,
                        width: 459,
                        html: '<iframe width="459" height="344" src="https://www.youtube.com/embed/cWDdd5KKhts?feature=oembed" frameborder="0" allowfullscreen></iframe>'
                    },
                    app: {
                        iphone: {
                            name: 'YouTube',
                            id: '544007664',
                            url: 'vnd.youtube://www.youtube.com/watch?v=cWDdd5KKhts&feature=applinks'
                        },
                        ipad: {
                            name: 'YouTube',
                            id: '544007664',
                            url: 'vnd.youtube://www.youtube.com/watch?v=cWDdd5KKhts&feature=applinks'
                        },
                        googleplay: {
                            name: 'YouTube',
                            id: 'com.google.android.youtube',
                            url: 'https://www.youtube.com/watch?v=cWDdd5KKhts'
                        }
                    },
                    player: {
                        url: 'https://www.youtube.com/embed/cWDdd5KKhts',
                        width: '480',
                        height: '360'
                    },
                    twitter: { site_username: '@youtube' },
                    sources: ['ogp', 'oembed', 'twitter']
                });

                done();
            });
        });

        it('describes a resource with redirection', (done) => {

            Metaphor.describe('https://twitter.com/x/status/626158822705401856', {}, (description) => {

                expect(description).to.equal({
                    title: 'Sideway on Twitter',
                    image: { url: 'https://pbs.twimg.com/profile_images/733727309962838016/t8DzeKUZ_400x400.jpg' },
                    description: '\u201cFirst steps https://t.co/XvSn7XSI2G\u201d',
                    site_name: 'Twitter',
                    url: 'https://twitter.com/sideway/status/626158822705401856',
                    type: 'article',
                    embed: {
                        url: 'https://twitter.com/sideway/status/626158822705401856',
                        html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">First steps <a href="https://t.co/XvSn7XSI2G">https://t.co/XvSn7XSI2G</a></p>&mdash; Sideway (@sideway) <a href="https://twitter.com/sideway/status/626158822705401856">July 28, 2015</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>',
                        width: 550,
                        type: 'rich'
                    },
                    sources: ['ogp', 'oembed']
                });

                done();
            });
        });

        it('handles missing document', (done) => {

            Metaphor.describe('https://twitter.com/sideway/status/1', {}, (description) => {

                expect(description).to.equal({ type: 'website', url: 'https://twitter.com/sideway/status/1' });
                done();
            });
        });

        it('handles invalid domain', (done) => {

            Metaphor.describe('http://no_such_domain/1', {}, (description) => {

                expect(description).to.equal({ type: 'website', url: 'http://no_such_domain/1' });
                done();
            });
        });

        it('handles unknown content type', { parallel: false }, (done) => {

            const orig = Wreck.request;
            Wreck.request = (method, url, options, next) => {

                Wreck.request = orig;
                setImmediate(() => next(null, { statusCode: 200, headers: { 'content-type': 'x/y' } }));
                return { abort: () => { } };
            };

            Metaphor.describe('https://example.com/invalid', {}, (description) => {

                expect(description).to.equal({ type: 'website', url: 'https://example.com/invalid' });
                done();
            });
        });

        it('handles missing content-length', { parallel: false }, (done) => {

            const orig = Wreck.request;
            Wreck.request = (method, url, options, next) => {

                Wreck.request = orig;
                return Wreck.request(method, url, options, (err, res) => {

                    delete res.headers['content-length'];
                    return next(err, res);
                });
            };

            Metaphor.describe('https://www.sideway.com/sideway.png', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://www.sideway.com/sideway.png',
                    type: 'website',
                    embed: {
                        url: 'https://www.sideway.com/sideway.png',
                        type: 'photo'
                    },
                    sources: ['resource']
                });

                done();
            });
        });

        it('handles missing content-type', { parallel: false }, (done) => {

            const orig = Wreck.request;
            Wreck.request = (method, url, options, next) => {

                Wreck.request = orig;
                setImmediate(() => next(null, { statusCode: 200, headers: {} }));
                return { abort: () => { } };
            };

            Metaphor.describe('https://example.com/invalid', {}, (description) => {

                expect(description).to.equal({ type: 'website', url: 'https://example.com/invalid' });
                done();
            });
        });

        it('handles on invalid content-type', { parallel: false }, (done) => {

            const orig = Wreck.request;
            Wreck.request = (method, url, options, next) => {

                Wreck.request = orig;
                setImmediate(() => next(null, { statusCode: 200, headers: { 'content-type': 'x' } }));
                return { abort: () => { } };
            };

            Metaphor.describe('https://example.com/invalid', {}, (description) => {

                expect(description).to.equal({ type: 'website', url: 'https://example.com/invalid' });
                done();
            });
        });

        it('handles on invalid response object', { parallel: false }, (done) => {

            const origRequest = Wreck.request;
            Wreck.request = (method, url, options, next) => {

                Wreck.request = origRequest;
                setImmediate(() => next(null, { statusCode: 200, headers: { 'content-type': 'text/html' } }));
                return { abort: () => { } };
            };

            const origRead = Wreck.read;
            Wreck.read = (res, options, next) => {

                Wreck.read = origRead;
                return next(new Error('Invalid'));
            };

            Metaphor.describe('https://example.com/invalid', {}, (description) => {

                expect(description).to.equal({ type: 'website', url: 'https://example.com/invalid' });
                done();
            });
        });
    });

    describe('parse()', () => {

        it('uses oembed site_name if og is missing', (done) => {

            const html = `<html>
            <head>
                <link rel="alternate" type="application/json+oembed" href="https://publish.twitter.com/oembed?url=https://twitter.com/dalmaer/status/726624422237364226" title="Dion Almaer on Twitter: &quot;Maybe agile doesn&#39;t scale and that&#39;s ok https://t.co/DwrWCnCU38&quot;">
            </head>
            </html>`;

            Metaphor.parse(html, 'https://twitter.com/dalmaer/status/726624422237364226', {}, (description) => {

                expect(description).to.equal({
                    url: 'https://twitter.com/dalmaer/status/726624422237364226',
                    type: 'website',
                    site_name: 'Twitter',
                    embed: {
                        type: 'rich',
                        width: 550,
                        url: 'https://twitter.com/dalmaer/status/726624422237364226',
                        html: '<blockquote class="twitter-tweet"><p lang="en" dir="ltr">Maybe agile doesn&#39;t scale and that&#39;s ok <a href="https://t.co/DwrWCnCU38">https://t.co/DwrWCnCU38</a></p>&mdash; Dion Almaer (@dalmaer) <a href="https://twitter.com/dalmaer/status/726624422237364226">May 1, 2016</a></blockquote>\n<script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>'
                    },
                    sources: ['oembed']
                });

                done();
            });
        });

        it('uses oembed link url if og is missing', { parallel: false }, (done) => {

            const html = `<html>
            <head>
                <link rel="alternate" type="application/json+oembed" href="https://publish.twitter.com/oembed?url=https://twitter.com/dalmaer/status/726624422237364226" title="Dion Almaer on Twitter: &quot;Maybe agile doesn&#39;t scale and that&#39;s ok https://t.co/DwrWCnCU38&quot;">
            </head>
            </html>`;

            const oembed = {
                type: 'link',
                version: '1.0',
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
                    type: 'website',
                    site_name: 'Twitter',
                    sources: ['oembed']
                });

                done();
            });
        });
    });
});
