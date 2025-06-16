const i18n = require('i18next');
const Backend = require('i18next-fs-backend');
const middleware = require('i18next-http-middleware');

i18n
    .use(Backend)
    .use(middleware.LanguageDetector)
    .init({
        backend: {
            loadPath: './locales/{{lng}}/{{ns}}.json',
        },
        fallbackLng: 'en',
        preload: ['en', 'es', 'fr'],
        ns: ['common', 'auth', 'cars'],
        defaultNS: 'common',
        detection: {
            order: ['header', 'cookie'],
            caches: ['cookie']
        }
    });

module.exports = i18n; 