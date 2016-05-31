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

// Related to assertions

const getHTML = function (creator, app) {

    creator = creator === undefined ? '' : creator;
    app = app === undefined ? '<meta name="twitter:app:name:unknown" content="NYTimes" />' : app;

    return `<html>
    <head>
        <meta name="twitter:card" value="summary" />
        <meta name="twitter:site" value="@nytimes" />
        <meta property="twitter:url" content="http://www.nytimes.com/2016/05/27/us/politics/house-budget-gay-rights-paul-ryan.html" />
        <meta property="twitter:title" content="G.O.P. Opposition to Gay Rights Provision Derails Spending Bill" />
        <meta property="twitter:description" content="The House energy and water bill failed after conservatives voted against their own legislation rather than acquiesce to a bipartisan amendment." />
        ${creator}
        ${app}
    </head>
    <body>
    </body>
    </html>`;
};
const url = 'https://example.com';
const getDescription = function (twitter) {

    const description = {
        url: url,
        type: 'website',
        description: 'The House energy and water bill failed after conservatives voted against their own legislation rather than acquiesce to a bipartisan amendment.',
        title: 'G.O.P. Opposition to Gay Rights Provision Derails Spending Bill',
        twitter: { site_username: '@nytimes' },
        sources: ['twitter']
    };
    if (twitter) {
        description.twitter = twitter;
    }

    return description;
};

describe('Open Graph', () => {

    describe('describe()', () => {

        it('handles Twitter account id value', (done) => {

            const html = getHTML('<meta name="twitter:creator:id" value="261289053" />');

            Metaphor.parse(html, url, {}, (description) => {

                expect(description).to.equal(getDescription({
                    site_username: '@nytimes',
                    creator_id: '261289053'
                }));

                done();
            });
        });

        it('ignores unknown app', (done) => {

            const html = getHTML();

            Metaphor.parse(html, url, {}, (description) => {

                expect(description).to.equal(getDescription());

                done();
            });
        });

        it('ignores missing app sub key', (done) => {

            const html = getHTML('', '<meta name="twitter:app" content="NYTimes" />');
            Metaphor.parse(html, url, {}, (description) => {

                expect(description).to.equal(getDescription());

                done();
            });
        });
    });
});
