angular.module('Neutering', ['xc.indexedDB', 'notifications'])

    .config(function ($indexedDBProvider) {
        $indexedDBProvider
            .connection('Neutering')
            .upgradeDatabase(1, function(event, db, tx) {
                var objStore = db.createObjectStore("Journal", {
                    keyPath: "id"
                });
                objStore.createIndex("id", "id", { unique: true });
            }).upgradeDatabase(2, function(event, db, tx) {
                localStorage.setItem('NeuteringLatestBackup', Date.now());
            });
    })

    .directive('autoComplete', function($timeout) {
        return function(scope, iElement, iAttrs) {
            iElement.autocomplete({
                source: function (request, responseCallback) {
                    var keys = [];
                    var promise = scope.ids(request.term);
                    promise.then(function(data){
                        keys = data;
                        responseCallback(keys);
                    },function() {
                        responseCallback(keys);
                    });
                },
                select: function() {
                    $timeout(function() {
                        iElement.trigger('input');
                    }, 0);
                }
            });
        };
    })

    .controller('Controller', function Controller($scope, $indexedDB, $notification) {

        var JOURNAL = 'Journal', SETTINGS = 'Settings';

        $scope.id;
        $scope.journal;
        $scope.persisted;

        $scope.upsert = function() {
            $indexedDB.objectStore(JOURNAL).upsert(
                {"id": $scope.id, "journal": $scope.journal}).then(function(e) {
                    $scope.persisted = true;
                    $notification.info("Informationen har lagrats!");
                    min = (Date.now() - localStorage.getItem('NeuteringLatestBackup')) / 1000 / 60;
                    $notification.warning(Math.floor(min / 60) + " timmar, " + Math.floor(min % 60) + " minuters osparat arbete!");
                });
        }

        $scope.delete = function() {
            if (window.confirm("Vill du ta bort denna journal (" + $scope.id +
                ")? Tryck OK för att bekräfta eller Cancel för att avbryta. Borttagen journal kan inte återskapas, annat än från säkerhetskopia.")) {
                $indexedDB.objectStore(JOURNAL).delete($scope.id).then(function(e) {
                    $scope.persisted = false;
                    $scope.journal = undefined;
                });
            }
        }

        $scope.ids = function(pattern) {
            return $indexedDB.objectStore(JOURNAL).getAllFromIndex('id', pattern);
        }

        $scope.idChanged = function() {
            $indexedDB.objectStore(JOURNAL).find('id', $scope.id).then(function(data) {
                if (data) {
                    $scope.persisted = true;
                    $scope.journal = data.journal;
                } else {
                    $scope.persisted = false;
                    $scope.journal = undefined;
                }
            });
        }
    })
;

