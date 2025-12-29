const w = window as any;
export const environment = {
  BASE_API: w['env']['BASE_API'],
  AUTH0_DOMAIN: w['env']['AUTH0_DOMAIN'],
  AUTH0_CLIENT_ID: w['env']['AUTH0_CLIENT_ID'],
  AUTH0_AUDIENCE_DOMAIN: w['env']['AUTH0_AUDIENCE_DOMAIN'],
  AUTH0_CONNECTION: w['env']['AUTH0_CONNECTION'],
  SENTRY_DNS: w['env']['SENTRY_DNS'],
  NOTIFICATION_API_CLIENT_ID: w['env']['NOTIFICATION_API_CLIENT_ID'],
};
