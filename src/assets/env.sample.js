(function (window) {
  window['env'] = window['env'] || {};

  // Environment variables
  window['env']['BASE_API'] = '${BASE_API}';
  window['env']['AUTH0_DOMAIN'] = '${AUTH0_DOMAIN}';
  window['env']['AUTH0_CLIENT_ID'] = '${AUTH0_CLIENT_ID}';
  window['env']['AUTH0_AUDIENCE_DOMAIN'] = '${AUTH0_AUDIENCE_DOMAIN}';
  window['env']['AUTH0_CONNECTION'] = '${AUTH0_CONNECTION}';
  window['env']['SENTRY_DNS'] = '${SENTRY_DNS}';
  window['env']['NOTIFICATION_API_CLIENT_ID'] = '${NOTIFICATION_API_CLIENT_ID}';
})(this);
