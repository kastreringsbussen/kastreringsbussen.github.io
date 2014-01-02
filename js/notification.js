'use strict';

angular.module('notifications', []).
    factory('$notification', ['$timeout',function($timeout){

        console.log('notification service online');
        var notifications = JSON.parse(localStorage.getItem('$notifications')) || [],
            queue = [];

        var settings = {
            info: { duration: 4000 },
            warning: { duration: 20000 },
            details: true
        };

        return {

            /* ============ QUERYING RELATED METHODS ============*/

            getAll: function(){
                // Returns all notifications that are currently stored
                return notifications;
            },

            getQueue: function(){
                return queue;
            },

            /* ============== NOTIFICATION METHODS ==============*/

            info: function(title){
                return this.makeNotification('info', false, 'info', title, '\u2714');
            },

            warning: function(title, content, userData){
                return this.makeNotification('warning', false, 'exclamation', title, '\u2620');
            },

            makeNotification: function(type, image, icon, title, entity){
                var notification = {
                    'type': type,
                    'image': image,
                    'icon': icon,
                    'title': title,
                    'entity': entity,
                    'timestamp': +new Date()
                };
                notifications.push(notification);

                queue.push(notification);
                $timeout(function removeFromQueueTimeout(){
                    queue.splice(queue.indexOf(notification), 1);
                }, settings[type].duration);

                this.save();
                return notification;
            },

            /* ============ PERSISTENCE METHODS ============ */

            save: function(){
                // Save all the notifications into localStorage
                // console.log(JSON);
                if(settings.localStorage){
                    localStorage.setItem('$notifications', JSON.stringify(notifications));
                }
                // console.log(localStorage.getItem('$notifications'));
            }

        };
    }]).
    directive('notifications', ['$notification', '$compile', function($notification, $compile){
        /**
         *
         * It should also parse the arguments passed to it that specify
         * its position on the screen like "bottom right" and apply those
         * positions as a class to the container element
         *
         * Finally, the directive should have its own controller for
         * handling all of the notifications from the notification service
         */
        var html =
            '<div class="dr-notification-wrapper" ng-repeat="noti in queue">' +
                '<div class="dr-notification-close-btn" ng-click="removeNotification(noti)">&#10006;' +
                '<i class="icon-remove"></i>' +
                '</div>' +
                '<div class="dr-notification">' +
                '<div class="dr-notification-image dr-notification-type-{{noti.type}}" ng-switch on="noti.image">' +
                '<i class="icon-{{noti.icon}}" ng-switch-when="false"></i>{{noti.entity}}' +
                '</div>' +
                '<div class="dr-notification-content">' +
                '<h3 class="dr-notification-title">{{noti.title}}</h3>' +
                '</div>' +
                '</div>' +
                '</div>';


        function link(scope, element, attrs){
            var position = attrs.notifications;
            position = position.split(' ');
            element.addClass('dr-notification-container');
            for(var i = 0; i < position.length ; i++){
                element.addClass(position[i]);
            }
        }


        return {
            restrict: 'A',
            scope: {},
            template: html,
            link: link,
            controller: ['$scope', function NotificationsCtrl( $scope ){
                $scope.queue = $notification.getQueue();

                $scope.removeNotification = function(noti){
                    $scope.queue.splice($scope.queue.indexOf(noti), 1);
                };
            }
            ]

        };
    }]);