angular.module('weeklySchedulerI18N', ['tmh.dynamicLocale']);

angular.module('weeklySchedulerI18N')
  .provider('weeklySchedulerLocaleService', ['tmhDynamicLocaleProvider', function (tmhDynamicLocaleProvider) {

    var defaultConfig: any /* TODO type */ = {
      doys: { 'de-de': 4, 'en-gb': 4, 'en-us': 6, 'fr-fr': 4 },
      lang: {
        'de-de': { },
        'en-gb': { },
        'en-us': {
          meridiem: (hours) => {
            if (hours > 11) {
              return 'P';
            } else {
              return 'A';
            }
          }
        },
        'fr-fr': { }
      }
    };

    this.configure = function (config) {

      if (config && angular.isObject(config)) {
        angular.merge(defaultConfig, config);

        if (defaultConfig.localeLocationPattern) {
          tmhDynamicLocaleProvider.localeLocationPattern(defaultConfig.localeLocationPattern);
        }
      }
    };

    this.$get = ['$rootScope', '$locale', 'tmhDynamicLocale', function ($rootScope, $locale, tmhDynamicLocale) {

      var momentLocaleCache = {};

      function getLang() {
        var key = $locale.id;
        if (!momentLocaleCache[key]) {
          momentLocaleCache[key] = getMomentLocale(key);
          moment.locale(momentLocaleCache[key].id, momentLocaleCache[key].locale);
        } else {
          moment.locale(momentLocaleCache[key].id);
        }
        return defaultConfig.lang[key];
      }

      // We just need few moment local information
      function getMomentLocale(key) {
        let locale: any = {
          id: key,
          locale: {
            week: {
              // Angular monday = 0 whereas Moment monday = 1
              dow: ($locale.DATETIME_FORMATS.FIRSTDAYOFWEEK + 1) % 7,
              doy: defaultConfig.doys[key]
            }
          }
        };

        let meridiem = defaultConfig.lang[key].meridiem;

        if (angular.isFunction(meridiem)) {
          locale.locale.meridiem = meridiem;
        }

        return locale;
      }

      $rootScope.$on('$localeChangeSuccess', function () {
        $rootScope.$broadcast(WeeklySchedulerEvents.LOCALE_CHANGED, getLang());
      });

      return {
        $locale: $locale,
        getLang: getLang,
        set: function (key) {
          return tmhDynamicLocale.set(key);
        }
      };
    }];
  }]);
