import stubTransport from 'nodemailer-stub-transport'


// Clustering for monitor-dogstats @todo replace in ansible-deploy
process.env.MONITOR_PREFIX = 'tests'

export function getConfig() {
  var config = {
    port: 31337,
    database: 3,

    secret: 'secret',
    origin: 'http://localhost:3333',
    appRoot: '.',
    acceptHashedPasswordsOnly: false,

    logLevel: 'warn',
    onboardingUsername: 'welcome',
    recaptcha: {
      enabled: false
    }
  }

  config.host = 'http://localhost:' + config.port

  var defaultStopList = ['anonymous', 'public', 'about', 'signin', 'logout',
                         'signup', 'filter', 'settings', 'account', 'groups',
                         'friends', 'list', 'search', 'summary', 'share','404',
                         'iphone', 'attachments', 'files', 'profilepics', 'requests']

  config.application = {
    DEFAULT_STOP_LIST: defaultStopList,
    USERNAME_STOP_LIST: defaultStopList
  }

  config.media = {
    url: config.host + '/', // must have trailing slash
    storage: {
      type: 'fs',
      rootDir: '/tmp/pepyatka-media/' // must have trailing slash
    }
  }
  config.attachments = {
    url: config.media.url,
    storage: config.media.storage,
    path: 'attachments/', // must have trailing slash
    fileSizeLimit: '10mb'
  }
  config.thumbnails = {
    url: config.media.url,
    storage: config.media.storage,
    path: 'attachments/thumbnails/' // must have trailing slash
  }
  config.profilePictures = {
    url: config.media.url,
    storage: config.media.storage,
    path: 'profilepics/' // must have trailing slash
  }

  config.mailer = {
    transport: stubTransport,
    options: {}
  }

  config.redis = {
    host: 'localhost',
    port: 6379,
    options: {}
  }

  return config
}
