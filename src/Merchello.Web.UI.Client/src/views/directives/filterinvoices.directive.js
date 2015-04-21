    /**
     * @ngdoc directive
     * @name filter-by-date-range
     * @function
     *
     * @description
     * Directive to wrap all Merchello Mark up.
     */
    angular.module('merchello.directives').directive('filterInvoices', function() {
        return {
            restrict: 'E',
            replace: true,
            scope: {
                filterStartDate: '=',
                filterEndDate: '=',
                filterText: '=',
                filterButtonText: '@filterButtonText',
                filterCallback: '&'
            },
            templateUrl: '/App_Plugins/Merchello/Backoffice/Merchello/directives/filterinvoices.tpl.html',
            controller: function($scope, $element, $q, assetsService, angularHelper, notificationsService, settingsResource, settingDisplayBuilder) {

                $scope.settings = {};

                // exposed methods
                $scope.changeDateFilters = changeDateFilters;

                function init() {
                    var promises = loadAssets();
                    promises.push(loadSettings());

                    $q.all(promises).then(function() {
                        $scope.filterStartDate = moment($scope.filterStartDate).format($scope.settings.dateFormat.toUpperCase());
                        $scope.filterEndDate = moment($scope.filterEndDate).format($scope.settings.dateFormat.toUpperCase());
                    });
                }

                /**
                 * @ngdoc method
                 * @name loadAssets
                 * @function
                 *
                 * @description - Loads needed and js stylesheets for the view.
                 */
                function loadAssets() {
                    var promises = [];
                    var cssPromise = assetsService.loadCss('lib/datetimepicker/bootstrap-datetimepicker.min.css');
                    var jsPromise = assetsService.load(['lib/moment/moment-with-locales.js', 'lib/datetimepicker/bootstrap-datetimepicker.min.js']);

                    promises.push(cssPromise);
                    promises.push(jsPromise);

                    //The Datepicker js and css files are available and all components are ready to use.
                    $q.all(promises).then(function() {
                        setupDatePicker("#filterStartDate");
                        $element.find("#filterStartDate").datetimepicker().on("changeDate", applyDateStart);

                        setupDatePicker("#filterEndDate");
                        $element.find("#filterEndDate").datetimepicker().on("changeDate", applyDateEnd);
                    });

                    return promises;
                }

                function loadSettings() {
                    var promise = settingsResource.getAllSettings();
                    return promise.then(function(allSettings) {
                        console.info(allSettings);
                        $scope.settings = settingDisplayBuilder.transform(allSettings);
                    }, function(reason) {
                        notificationsService.error('Failed to load settings', reason.message);
                    });
                }

                /**
                 * @ngdoc method
                 * @name setupDatePicker
                 * @function
                 *
                 * @description
                 * Sets up the datepickers
                 */
                function setupDatePicker(pickerId) {

                    // Open the datepicker and add a changeDate eventlistener
                    $element.find(pickerId).datetimepicker({
                        format: $scope.settings.dateFormat
                    });

                    //Ensure to remove the event handler when this instance is destroyted
                    $scope.$on('$destroy', function () {
                        $element.find(pickerId).datetimepicker("destroy");
                    });
                }

                /*-------------------------------------------------------------------
                 * Event Handler Methods
                 *-------------------------------------------------------------------*/

                /**
                 * @ngdoc method
                 * @name changeDateFilters
                 * @function
                 *
                 * @param {string} start - String representation of start date.
                 * @param {string} end - String representation of end date.
                 * @description - Change the date filters, then triggera new API call to load the reports.
                 */
                function changeDateFilters(start, end) {
                    $scope.filterStartDate = start;
                    $scope.filterEndDate = end;
                    $scope.currentPage = 0;
                    $scope.filterCallback();
                }

                /*-------------------------------------------------------------------
                 * Helper Methods
                 * ------------------------------------------------------------------*/

                //handles the date changing via the api
                function applyDateStart(e) {
                    angularHelper.safeApply($scope, function () {
                        // when a date is changed, update the model
                        if (e.localDate) {
                            $scope.filterStartDate = moment(e.localDate).format($scope.settings.dateFormat.toUpperCase());
                        }
                    });
                }

                //handles the date changing via the api
                function applyDateEnd(e) {
                    angularHelper.safeApply($scope, function () {
                        // when a date is changed, update the model
                        if (e.localDate) {
                            $scope.filterEndDate = moment(e.localDate).format($scope.settings.dateFormat.toUpperCase());
                        }
                    });
                }

                // Initialize the controller
                init();
            },
            compile: function (element, attrs) {
                if (!attrs.filterButtonText) {
                    attrs.filterButtonText = 'Filter';
                }
            }
        };
    });
